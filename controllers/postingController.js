const db = require("../core/db");
const util = require("util");
const _ = require('lodash');

// Adds post
// vscode-fold=1
exports.addPosting = function (req, res, reqBody, files, cb) {
    try {
        if (!reqBody) throw new Error("Input not valid");
        let data = reqBody;
        if (data) {
            let sqlInst = "declare @id int; "
            sqlInst += "insert into w1buy_postings (portalId, postingtype, title, condition, postingdescription, userId, createdondate";

            if (data.priorityValue !== '') sqlInst += ", priorityvalue";
            if (data.priorityDelivery) sqlInst += ", prioritydelivery";
            if (data.expiryDate) sqlInst += ", expirydate";
            // if (data.quantity !== '') sqlInst += ", quantity";

            sqlInst += util.format(") values (%d, '%s', '%s', '%s', '%s', %d, getdate()",
                data.portalId, data.postingType, (data.title.charAt(0).toUpperCase() + data.title.substr(1)), data.postingCondition,
                (data.postingDescription.charAt(0).toUpperCase() + data.postingDescription.substr(1)), data.userId);

            if (data.priorityValue) sqlInst += ", '" + data.priorityValue + "'";
            if (data.priorityDelivery) sqlInst += ", '" + data.priorityDelivery + "'";
            if (data.expiryDate) sqlInst += ", '" + data.expiryDate + "'";

            sqlInst += "); set @id = scope_identity(); ";

            let words = data.keywords.split(',');
            _.forEach(words, function (value) {
                sqlInst += util.format("insert into w1buy_PostingKeywords (postingid, keywordname) values (@id, '%s'); ", value);
            });

            let locales = JSON.parse(data.postingLocales);
            _.forEach(locales, function (locale) {
                sqlInst += util.format("insert into w1buy_PostingLocales (localeid, city, region, quantity, postingid, createdondate) " +
                    "values (%d, '%s', '%s', %d, @id, getdate()); ",
                    locale.localeId, locale.city, locale.region, locale.quantity);
            });

            if (files) {
                _.forEach(files, function (file) {
                    sqlInst += util.format("insert into w1buy_PostingFiles " +
                        "(portalid, conversationid, [filename], originalname, size, contenttype, touserid, fromuserid, createdondate) " +
                        "values (%d, @id, '%s', '%s', %d, '%s', %d, %d, getdate()); ",
                        data.portalId, file.filename, file.originalname, file.size, file.mimetype, data.userId, data.userId);
                });
            }

            sqlInst += "select @id as postingid;";

            db.querySql(sqlInst, function (data, err) {
                if (err) {
                    console.log(err.message);
                    // res.status(500).json({
                    //     "error": err.message
                    // });
                    cb({
                        error: err.message
                    });
                } else {
                    // res.json(data.recordset[0].postingid);
                    cb({
                        PostingId: data.recordset[0].postingid
                    });
                }
            });
        } else {
            // throw new Error("Input not valid");
            return res.status(500).json(`Input not valid (status: 500)`);
        }
    } catch (ex) {
        res.send(ex);
    };
};

// Updates post
// vscode-fold=2
exports.updatePosting = function (req, res, reqBody, files) {
    try {
        if (!reqBody) throw new Error("Input not valid");
        let data = reqBody;
        if (data) {
            let sqlInst = "update w1buy_postings set postingtype = '" + data.postingType + "', title = '" + data.title + "', condition = '" + data.condition + "', postingdescription = '" +
                data.postingDescription + "', userId = " + data.userId + ", modifiedondate = getdate()";

            if (data.priorityValue) sqlInst += ", priorityvalue = '" + data.priorityValue + "' ";
            if (data.priorityDelivery) sqlInst += ", prioritydelivery = '" + data.priorityDelivery + "' ";
            if (data.expiryDate) sqlInst += ", expirydate = '" + data.expiryDate + "' ";

            sqlInst += "where postingid = " + data.postingId + "; ";

            sqlInst += util.format("delete from w1buy_postingkeywords where postingid = %d; ", data.postingId);
            let words = data.keywords.split(',');
            _.forEach(words, function (value) {
                sqlInst += util.format("insert into w1buy_postingkeywords (postingid, keywordname) values (%d, '%s'); ", data.postingId, value);
            });

            sqlInst += util.format("delete from w1buy_postinglocales where postingid = %d; ", data.postingId);
            let locales = JSON.parse(data.postingLocales);
            _.forEach(locales, function (locale) {
                sqlInst += util.format("insert into w1buy_postinglocales (localeid, city, region, quantity, postingid, createdondate) " +
                    "values (%d, '%s', '%s', %d, %d, getdate()); ",
                    locale.localeId, locale.city, locale.region, locale.quantity, data.postingId);
            });

            if (files) {
                _.forEach(files, function (file) {
                    sqlInst += util.format("insert into w1buy_postingfiles (portalid, conversationid, [filename], originalname, size, contenttype, imageurl, folder, touserid, fromuserid, createdondate) " +
                        "values (%d, %d, '%s', '%s', %d, '%s', '%s', '%s', %d, %d, getdate()); ",
                        data.portalId, data.postingId, file.filename, file.originalname, file.size, file.mimetype, file.path, file.destination, data.userId, data.userId);
                });
            }

            db.querySql(sqlInst, function (data, err) {
                if (err) {
                    console.log(err.message);
                    res.status(500).json({
                        "error": err.message
                    });
                } else {
                    res.json({
                        "success": "success"
                    });
                }
            });
        } else {
            // throw new Error("Input not valid");
            return res.status(500).json(`Input not valid (status: 500)`);
        }
    } catch (ex) {
        res.send(ex);
    };
};

// Gets keywords
// vscode-fold=3
exports.getKeywords = function (req, res, term) {
    try {
        if (term !== '') {
            let sqlInst = util.format("select distinct pk.KeywordName from w1buy_postingkeywords pk join w1buy_postings p on pk.postingid = p.postingid " +
                "where charindex('%s', pk.keywordname) > 0 order by pk.keywordname", term);

            db.querySql(sqlInst, function (data, err) {
                if (err) {
                    console.log(err.message);
                    res.status(500).json({
                        "error": err.message
                    });
                } else {
                    res.json(data.recordset);
                }
            });
        } else {
            // throw new Error("Input not valid");
            return res.json([{
                "KeywordId": 0,
                "KeywordName": '',
                "PostingId": 0
            }]);
        }
    } catch (ex) {
        res.json(ex.message);
    }
}

// Get post locales
// vscode-fold=4
exports.getPostingsLocales = function (req, res, portalId, term, localeId) {
    try {
        let sqlInst = "";

        if (term !== '') {
            sqlInst += "declare @keywordids nvarchar(max); ";
            sqlInst += "set @keywordids = (select distinct cast(pk.postingid as varchar(10)) + ',' as [text()] from w1buy_postingkeywords pk ";
            sqlInst += "where pk.keywordname like '" + term + "%' for xml path('')); ";

            sqlInst += "select  p.PostingId, l.Region as PosterRegion, l.City as PosterCity from w1buy_postings p";
            sqlInst += "join w1buy_postinglocales l on p.postingid = l.postingid where p.postingid in (";
            sqlInst += "select i.name from dbo.w1buy_splitstring(@keywordids) as i) ";
            sqlInst += "and isnull(p.sellerpaid, 0) <= 0 and ('" + localeId + "' = '' or l.localeid = '" + localeId + "') ";
            sqlInst += "order by l.region, l.city";
        } else {
            sqlInst += "select * from w1buy_postings";
        }
        db.querySql(sqlInst, function (data, err) {
            if (err) {
                console.log(err.message);
                res.status(500).json({
                    "error": err.message
                });
            } else {
                res.json(data.recordset);
            }
        });
    } catch (ex) {
        res.json(ex.message);
    }
};

// Gets postings
// vscode-fold=5
exports.getPostings = function (req, res, portalId, term, localeId, pageIndex, pageSize) {
    try {
        let sqlInst = "";

        if (term !== '') {
            sqlInst += "select p.* ";
            // sqlInst += ", (select isnull(priorityvalueamount, 0) from w1buy_postingmessages where conversationid = p.postingid ) as PriorityValueAmount";
            // sqlInst += ", (select isnull(prioritydeliveryamount, 0) from w1buy_postingmessages where conversationid = p.postingid ) as PriorityDeliveryAmount";
            sqlInst += ", (case isnull(p.condition, '0') when '1' then 'NOVO' when '2' then 'USADO' else 'NOVO ou USADO' end) as PostingCondition";
            sqlInst += ", p.[userid], p.[expirydate], p.[quantity], u.[displayname] as PosterDisplayName";
            sqlInst += ", (select value from lists where entryid = (select regionid from users where userid = p.userid)) as PosterRegion ";
            sqlInst += ", (select value from lists where entryid = (select cityid from users where userid = p.userid)) as PosterCity ";
            sqlInst += ", isnull((select 1 from w1buy_user_account where accounttype = 'buyer' and userid = p.userid and accountlevel in (2, 3)), 0) as Premium";
            sqlInst += ", isnull((select dbo.w1buy_get_accountlevel(accountlevel) from w1buy_user_account where accounttype = 'buyer' and userid = p.userid), '') as AccountLevel";
            sqlInst += ", isnull((select top 1 1 from w1buy_postingmessages pm where pm.postingid = p.postingid ), 0) as Locked";
            sqlInst += `, ('[' + (select( + '{"LocaleId":"' + cast(l.localeid as nvarchar(max)) + '","City":"' + l.city + ' (' + l.region + ')' + '","Quantity":"' + cast(l.quantity as nvarchar(max)) + '"},') as [text()] from w1buy_postinglocales l where l.postingid = p.[postingid] for xml path('')) + ']') as Locales`;
            sqlInst += `, ('[' + (select( + '{"FileName":"' + f.filename + '"},') as [text()] from w1buy_postingfiles f where f.conversationid = p.[postingid] for xml path('')) + ']') as Files `;
            sqlInst += "from w1buy_postings p ";
            sqlInst += "join users u on p.userid = u.userid ";
            sqlInst += "join w1buy_postingLocales pl on p.postingid = pl.postingid "
            sqlInst += "join w1buy_postingKeywords pk on p.postingid = pk.postingid ";
            sqlInst += "where pl.localeid = " + localeId + " ";
            sqlInst += "and (pk.keywordname like '%" + term + "%' and not pk.keywordname like '%[A-Z]" + term + "%' and not pk.keywordname like '%" + term + "[A-Z]%');";
        }
        db.querySql(sqlInst, function (data, err) {
            if (err) {
                console.log(err.message);
                res.status(500).json({
                    "error": err.message
                });
            } else {
                res.json(data.recordset);
            }
        });
    } catch (ex) {
        res.json(ex.message);
    }
};

// Gets all postings
// vscode-fold=6
exports.getPosts = function (req, res, portalId, cb) {
    try {
        let sqlInst = "";

        sqlInst += "select p.* ";
        // sqlInst += ", (select isnull(priorityvalueamount, 0) from w1buy_postingmessages where conversationid = p.postingid ) as PriorityValueAmount";
        // sqlInst += ", (select isnull(prioritydeliveryamount, 0) from w1buy_postingmessages where conversationid = p.postingid ) as PriorityDeliveryAmount";
        sqlInst += ", (case isnull(p.condition, '0') when '1' then 'NOVO' when '2' then 'USADO' else 'NOVO ou USADO' end) as PostingCondition";
        sqlInst += ", p.[userid], p.[expirydate], p.[quantity], u.[displayname] as PosterDisplayName";
        sqlInst += ", (select value from lists where entryid = (select regionid from users where userid = p.userid)) as PosterRegion ";
        sqlInst += ", (select value from lists where entryid = (select cityid from users where userid = p.userid)) as PosterCity ";
        sqlInst += ", isnull((select 1 from w1buy_user_account where accounttype = 'buyer' and userid = p.userid and accountlevel in (2, 3)), 0) as Premium";
        sqlInst += ", isnull((select dbo.w1buy_get_accountlevel(accountlevel) from w1buy_user_account where accounttype = 'buyer' and userid = p.userid), '') as AccountLevel";
        sqlInst += ", isnull((select top 1 1 from w1buy_postingmessages pm where pm.postingid = p.postingid ), 0) as Locked";
        sqlInst += `, ('[' + (select( + '{"LocaleId":"' + cast(l.localeid as nvarchar(max)) + '","City":"' + l.city + ' (' + l.region + ')' + '","Quantity":"' + cast(l.quantity as nvarchar(max)) + '"},') as [text()] from w1buy_postinglocales l where l.postingid = p.[postingid] for xml path('')) + ']') as Locales`;
        sqlInst += `, ('[' + (select( + '{"FileName":"' + f.filename + '"},') as [text()] from w1buy_postingfiles f where f.conversationid = p.[postingid] for xml path('')) + ']') as Files `;
        sqlInst += ", ('/anuncios/' + cast(p.PostingId as varchar(10)) + '/' + cast(p.UserId as varchar(10))) as Link ";
        sqlInst += "from w1buy_postings p ";
        sqlInst += "join users u on p.userid = u.userid ";
        sqlInst += "where p.portalid = " + portalId + ";";

        db.querySql(sqlInst, function (data, err) {
            if (err) {
                console.log(err.message);
                cb({
                    'error': err.message
                });
            } else {
                cb(data.recordsets[0]);
            }
        });
    } catch (ex) {
        cb({
            'error': ex.message
        });
    };
};

// Gets user posts
// vscode-fold=7
exports.getUserPostings = function (req, res, userId) {
    try {
        if (userId) {
            let sqlInst = "select p.* ";
            // sqlInst += ", (select isnull(priorityvalueamount, 0) from w1buy_postingmessages where conversationid = p.postingid ) as PriorityValueAmount";
            // sqlInst += ", (select isnull(prioritydeliveryamount, 0) from w1buy_postingmessages where conversationid = p.postingid ) as PriorityDeliveryAmount";
            sqlInst += ", (case isnull(p.condition, '0') when '1' then 'NOVO' when '2' then 'USADO' else 'NOVO ou USADO' end) as PostingCondition";
            sqlInst += ", isnull((select top 1 1 from w1buy_postingmessages pm where pm.postingid = p.postingid ), 0) as Locked";
            sqlInst += `, ('[' + (select( + '{"LocaleId":"' + cast(l.localeid as nvarchar(max)) + '","City":"' + l.city + ' (' + l.region + ')' + '","Quantity":"' + cast(l.quantity as nvarchar(max)) + '"},') as [text()] from w1buy_postinglocales l where l.postingid = p.[postingid] for xml path('')) + ']') as Locales`;
            sqlInst += `, ('[' + (select( + '{"FileName":"' + f.filename + '"},') as [text()] from w1buy_postingfiles f where f.conversationid = p.[postingid] for xml path('')) + ']') as Files `;
            sqlInst += "from w1buy_postings p ";
            sqlInst += "join users u on p.userid = u.userid ";
            sqlInst += "where p.userid = " + userId;
            db.querySql(sqlInst, function (data, err) {
                if (err) {
                    console.log(err.message);
                    res.status(500).json({
                        "error": err.message
                    });
                } else {
                    res.json(data.recordset);
                }
            });
        } else {
            // throw new Error("Input not valid");
            return res.status(500).json(`Input not valid (status: 500)`);
        }
    } catch (ex) {
        res.json(ex.message);
    }
};

exports.removePosting = function (req, res, postingId) {
    try {
        if (postingId) {
            let sqlInst = `delete from w1buy_postings where postingid = ${postingId};`;

            db.querySql(sqlInst, function (data, err) {
                if (err) {
                    console.log(err.message);
                    res.status(500).json({
                        "error": err.message
                    });
                } else {
                    res.json({
                        "success": "success"
                    });
                }
            });
        } else {
            // throw new Error("Input not valid");
            return res.status(500).json(`Input not valid (status: 500)`);
        }
    } catch (ex) {
        res.json(ex.message);
    }
}

// Gets posts locales count
// vscode-fold=8
exports.getPostingsLocalesCount = function (req, res, portalId, term) {
    try {
        let sqlInst = "";

        if (term !== '') {
            sqlInst += "select pl.localeid, 'city' = pl.city + ' - ' + pl.region ";
            sqlInst += "into #temp ";
            sqlInst += "from w1buy_postinglocales pl ";
            sqlInst += "join w1buy_postings p on p.postingid = pl.postingid ";
            sqlInst += "join w1buy_postingkeywords pk on pl.postingid = pk.postingid ";
            sqlInst += "where isnull(p.complete, 0) = 0 and p.portalid = " + portalId + " and ";
            sqlInst += "(pk.keywordname like '%" + term + "%' and not pk.keywordname like '%[A-Z]" + term + "%' and not pk.keywordname like '%" + term + "[A-Z]%'); ";
            sqlInst += "select *, count(*) as locales from #temp group by localeid, city; ";
            sqlInst += "drop table #temp;";
        }
        db.querySql(sqlInst, function (data, err) {
            if (err) {
                console.log(err.message);
                res.status(500).json({
                    "error": err.message
                });
            } else {
                res.json(data.recordsets[0]);
            }
        });
    } catch (ex) {
        res.json(ex.message);
    }
};

// Gets post
// vscode-fold=9
exports.getPost = function (req, res, postId, userId, cb) {
    try {
        let sqlInst = "";

        if (postId !== '') {
            sqlInst += "select p.PostingId, p.PostingDescription, p.CreatedOnDate, p.ModifiedOnDate, p.Title, p.UserId, p.BuyerPaid, p.SellerPaid, p.PostingType, p.Complete, p.Condition, ";
            sqlInst += "p.ExpiryDate, (case isnull(p.condition, '0') when '1' then 'NOVO' when '2' then 'USADO' else 'NOVO ou USADO' end) as PostingCondition, ";
            sqlInst += "p.PriorityDelivery, p.PriorityPlace, p.PriorityValue, 'PosterDisplayName' = u.displayname, ";
            sqlInst += `'NotificationsCount' = (select count(*) from notifications where conversationid = ${postId}), `;
            sqlInst += "'PosterRegion' = (select value from lists where entryid = (select regionid from users where userid = p.userid)), ";
            sqlInst += "'PosterCity' = (select value from lists where entryid = (select cityid from users where userid = p.userid)), ";
            sqlInst += `'PriorityValueAmount' = (select min(priorityvalueamount) from w1buy_postingmessages where postingid = ${postId}), `;
            sqlInst += `'PriorityDeliveryAmount' = (select min(prioritydeliveryamount) from w1buy_postingmessages where postingid = ${postId}), `;
            sqlInst += "'Rating' = isnull((select avg(vote) from w1buy_user_reputation where touserid = p.userid), 5), ";
            sqlInst += "'Premium' = isnull((select 1 from w1buy_user_account where accounttype = 'buyer' and userid = p.userid and accountlevel in (2, 3)), 0), ";
            sqlInst += `'Owner' = (case when p.userid = ${userId} then 1 else 0 end), `;
            sqlInst += "'Accountlevel' = isnull((select dbo.w1buy_get_accountlevel(accountlevel) from w1buy_user_account where accounttype = 'buyer' and userid = p.userid), '') ";
            sqlInst += "from w1buy_postings p ";
            sqlInst += "left outer join users u on p.userid = u.userid ";
            sqlInst += "left outer join users s on p.sellerpaid = s.userid ";
            sqlInst += `where p.postingid = ${postId}; `;

            sqlInst += `select * from w1buy_postinglocales where postingid = ${postId}; `;
            sqlInst += `select postingfileid, conversationid, filename, size, contenttype from w1buy_postingfiles where conversationid = ${postId}; `;

            sqlInst += "select  m.MsgId, m.Msg, m.[Subject], m.FromUserId, m.ToUserId, m.postingid, m.PriorityDeliveryAmount, m.PriorityValueAmount, u.DisplayName";
            sqlInst += ", 'Region' = (select value from lists where entryid = (select regionid from users where userid = m.fromuserid)) ";
            sqlInst += ", 'City' = (select value from lists where entryid = (select cityid from users where userid = m.fromuserid)), m.CreatedOnDate ";
            // sqlInst += ", 'Rating' = isnull((select avg(vote) from w1buy_user_reputation where touserid = m.fromuserid), 5) ";
            sqlInst += "from w1buy_postingmessages m ";
            sqlInst += "left outer join users u on m.fromuserid = u.userid ";
            sqlInst += `where (${postId} = '' or m.postingid = ${postId}) and m.Show = 1 `;
            sqlInst += "order by m.createdondate desc, m.fromuserid; "

            // sqlInst += "select pmc.MsgId, pmc.CommentText ";
            // sqlInst += "from w1buy_postingmessagecomments pmc ";
            // sqlInst += "left outer join users as u on pmc.createdbyuser = u.userid ";
            // sqlInst += `where pmc.postingid = ${postId} group by pmc.createdondate, pmc.commenttext, pmc.msgid order by pmc.createdondate; `;

            sqlInst += "select pmc.*, u.DisplayName, u.UserId ";
            sqlInst += ", 'Region' = (select value from lists where entryid = (select regionid from users where userid = pmc.fromuserid)) ";
            sqlInst += ", 'City' = (select value from lists where entryid = (select cityid from users where userid = pmc.fromuserid)) ";
            // sqlInst += ", 'Rating' = isnull((select avg(vote) from w1buy_user_reputation where touserid = pmc.createdbyuser), 5) ";
            sqlInst += "from w1buy_postingmessagecomments pmc ";
            sqlInst += "left outer join users as u on pmc.fromuserid = u.userid ";
            sqlInst += "left outer join w1buy_postingmessages as pm on pmc.msgid = pm.msgid ";
            sqlInst += `where pmc.postingid = ${postId} and pm.show = 1 and pmc.Show = 1 order by pmc.createdondate; `;

            sqlInst += `select 1 as WaitingMsg from notifications where senderuserid = ${req.user.UserID} and conversationid = ${postId};`

            // sqlInst += `select * from w1buy_postingkeywords where postingid = ${postId};`;
        }
        db.querySql(sqlInst, function (data, err) {
            if (err) {
                console.log(err.message);
                cb({
                    "error": err.message
                });
            } else {
                // Post locales
                if (data.recordsets[1][0]) {
                    data.recordsets[0][0].Locales = data.recordsets[1];
                }
                // Msgs
                if (data.recordsets[2][0]) {
                    data.recordsets[0][0].Files = data.recordsets[2]
                }
                // Comments from msgs
                if (data.recordsets[3][0]) {
                    data.recordsets[0][0].PostingMsgs = data.recordsets[3]

                    if (data.recordsets[4][0]) {
                        _.forEach(data.recordsets[0][0].PostingMsgs, function (item) {
                            item.MessageComments = data.recordsets[4];
                        });
                    }
                }
                // Amount of msgs waiting from post owner to fromuser
                if (data.recordsets[5][0]) {
                    data.recordsets[0][0].MsgWaiting = data.recordsets[5][0].WaitingMsg;
                }
                // if (data.recordsets[6][0]) {
                //     data.recordsets[0][0].Keywords = data.recordsets[6];
                // }

                // Post
                cb(data.recordsets[0]);
            }
        }, true);
    } catch (ex) {
        res.json(ex.message);
    }
};

// Gets postings dates statistics
// vscode-fold=10
exports.getPostingsDate = function (req, res, year, cb) {
    try {
        let sqlInst = `set language brazilian; select convert(char(3), datename(month, createdondate), 0) as months, count(*) as quantity from w1buy_postings where year(createdondate) = ${year} group by convert(char(3), datename(month, createdondate), 0);`;

        db.querySql(sqlInst, function (data, err) {
            if (err) {
                console.log(err.message);
                cb({
                    'error': err.message
                });
            } else {
                cb(data.recordsets[0]);
            }
        });
    } catch (ex) {
        cb({
            'error': ex.message
        });
    };
};

// Gets postings locales statistics
// vscode-fold=11
exports.getPostingsLocales = function (req, res, year, cb) {
    try {
        let sqlInst = `select l.value as region, count(*) as quantity from w1buy_postings p join users u on p.userid = u.userid join lists l on isnull(u.regionid, 1111) = l.entryid where year(p.createdondate) = ${year} group by regionid, l.value;`;

        db.querySql(sqlInst, function (data, err) {
            if (err) {
                console.log(err.message);
                cb({
                    'error': err.message
                });
            } else {
                cb(data.recordsets[0]);
            }
        });
    } catch (ex) {
        cb({
            'error': ex.message
        });
    };
};