const db = require("../core/db");
const util = require("util");
const _ = require('lodash');

// Adds person
// vscode-fold=1
exports.addPerson = function (req, res, reqBody, cb) {
    try {
        if (!reqBody) throw new Error("Input not valid");
        let data = reqBody;
        if (data) {
            let sqlInst = " declare @id int, @error nvarchar(100) "
            sqlInst += "if exists(select top 1 1 from users where email = '" + data.email + "') "
            sqlInst += "begin "
            sqlInst += "set @error = 'Email " + data.email + " já cadastrado.' "
            sqlInst += "end "
            sqlInst += "else "
            sqlInst += "insert into users (portalid, username, firstname, lastname, displayname, email, firstchoice, hashed_password, createdbyuserid, createdondate ";

            // if (data.telephone !== '') sqlInst += ", telephone";
            // if (data.cell) sqlInst += ", cell";
            // if (data.docid !== '') sqlInst += ", docid";
            // if (data.postalCode !== '') sqlInst += ", postalcode";
            // if (data.country) sqlInst += ", country";
            // if (data.region !== '') sqlInst += ", region";
            // if (data.city !== '') sqlInst += ", city";

            sqlInst += util.format(" ) values (%d, '%s', '%s', '%s', '%s', '%s', '%s', '%s', -1, getdate() ",
                data.portalId, data.email, data.firstName, data.lastName, (data.firstName + ' ' + data.lastName).trim(), data.email, data.firstChoice, data.password);

            // if (data.telephone !== '') sqlInst += ", '" + data.telephone + "'";
            // if (data.cell) sqlInst += ", '" + data.cell + "'";
            // if (data.docid !== '') sqlInst += ", '" + data.docid + "'";
            // if (data.postalCode !== '') sqlInst += ", '" + data.postalCode + "'";
            // if (data.country) sqlInst += ", '" + data.country + "'";
            // if (data.region !== '') sqlInst += ", '" + data.region + "'";
            // if (data.city !== '') sqlInst += ", '" + data.city + "'";

            sqlInst += " ) set @id = scope_identity() ";
            sqlInst += " select @id as userid, @error as error ";

            db.querySql(sqlInst, function (data, err) {
                if (err) {
                    console.log(err.message);
                    // res.status(500).json({
                    //     "error": err.message
                    // });
                    cb({
                        "error": err.message
                    });
                } else {
                    // res.send('{ "Result":' + data.recordset[0].userid + ' }');
                    // res.send(JSON.stringify(data.recordset[0]).replace(/"([\w]+)":/g, function ($0, $1) {
                    //     return ('"' + $1.toLowerCase() + '":')
                    // }));

                    // if (data.recordset[0].error == null) {
                    //     res.json({
                    //         "UserId": data.recordset[0].userid
                    //     });
                    // } else {
                    //     res.json({
                    //         "error": data.recordset[0].error
                    //     });
                    // }

                    if (data.recordset[0].error == null) {
                        cb({
                            "UserId": data.recordset[0].userid
                        });
                    } else {
                        cb({
                            "error": data.recordset[0].error
                        });
                    }
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

// Updates user
// vscode-fold=2
exports.updateUser = function (req, res, reqBody) {
    try {
        if (!reqBody) throw new Error("Input not valid");
        let data = reqBody;
        if (data) {
            let sqlInst = " declare @originalEmail nvarchar(10), @newEmail nvarchar(100), @error nvarchar(100) ";
            sqlInst += "set @originalEmail = (select email from users where userid = " + data.userId + ") ";
            sqlInst += "set @newEmail = '" + data.email + "' ";
            sqlInst += "if (@originalEmail <> @newEmail) ";
            sqlInst += "if exists(select top 1 1 from users where email = '" + data.email + "') ";
            sqlInst += " begin ";
            sqlInst += "set @error = 'Email " + data.email + " já cadastrado.' ";
            sqlInst += "end ";
            sqlInst += "else ";
            sqlInst += "update users set portalid = " + data.portalId + ", firstname = '" + data.firstName + "', lastname = '" + data.lastName + "', lastmodifiedbyuserid = " + data.lastModifiedByUserId + ", lastmodifiedondate = getdate()";
            sqlInst += ", displayname = '" + (data.displayName || data.firstName + " " + data.lastName) + "', countryid = 29";

            if (data.postalCode !== '') sqlInst += ", postalcode = " + data.postalCode;
            if (data.street) sqlInst += ", street = " + data.street;

            if (data.telephone !== '') {
                sqlInst += ", telephone = '" + data.telephone + "'"
            } else {
                sqlInst += ", telephone = " + null
            };
            if (data.cell) {
                sqlInst += ", cell = '" + data.cell + "'"
            } else {
                sqlInst += ", cell = " + null
            };
            if (data.docid !== '') {
                sqlInst += ", docid = '" + data.docId + "'"
            } else {
                sqlInst += ", docid = " + null
            };
            if (data.streetNumber !== '') {
                sqlInst += ", streetNumber = " + data.streetNumber
            } else {
                sqlInst += ", streetNumber = " + null
            };
            if (data.district !== '') {
                sqlInst += ", district = " + data.district
            } else {
                sqlInst += ", district = " + null
            };
            if (data.region !== '') {
                if (typeof data.region === 'number') {
                    sqlInst += ", regionid = " + data.region;
                } else {
                    sqlInst += ", regionid = (select [entryid] from lists where [text]] = " + data.region + ")";
                }
            }
            if (data.city !== '') {
                if (typeof data.city === 'number') {
                    sqlInst += ", cityid = " + data.city;
                } else {
                    sqlInst += ", cityid = (select [entryid] from lists where [text]] = " + data.city + ")";
                }
            }

            sqlInst += " where userid = " + data.userId;
            sqlInst += " select @error as error ";

            db.querySql(sqlInst, function (data, err) {
                if (err) {
                    console.log(err.message);
                    res.status(500).json({
                        "error": err.message
                    });
                } else {
                    if (data.recordset[0].error == null) {
                        res.json({
                            "success": data.recordset[0].userid
                        });
                    } else {
                        res.json({
                            "error": data.recordset[0].error
                        });
                    }
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

// Updates person
// vscode-fold=3
exports.updatePerson = function (req, res, reqBody) {
    try {
        if (!reqBody) throw new Error("Input not valid");
        let data = reqBody;
        if (data) {
            let sqlInst = "update users set portalid = " + data.portalId + ", firstname = '" + data.firstName + "', lastname = '" + data.lastName + "'";
            sqlInst += ", lastmodifiedbyuserid = " + data.lastModifiedByUserId + ", lastmodifiedondate = getdate()";
            sqlInst += ", displayname = '" + (data.displayName || data.firstName + " " + data.lastName) + "', countryid = 29";

            if (data.postalCode !== '') sqlInst += ", postalcode = " + data.postalCode;
            if (data.street) sqlInst += ", street = '" + data.street + "'";

            if (data.telephone !== '') {
                sqlInst += ", telephone = '" + data.telephone + "'"
            } else {
                sqlInst += ", telephone = " + null
            };
            if (data.cell) {
                sqlInst += ", cell = '" + data.cell + "'"
            } else {
                sqlInst += ", cell = " + null
            };
            if (data.docid !== '') {
                sqlInst += ", docid = '" + data.docId + "'"
            } else {
                sqlInst += ", docid = " + null
            };
            if (data.streetNumber !== '') {
                sqlInst += ", streetNumber = '" + data.streetNumber + "'"
            } else {
                sqlInst += ", streetNumber = " + null
            };
            if (data.district !== '') {
                sqlInst += ", district = '" + data.district + "'"
            } else {
                sqlInst += ", district = " + null
            };

            if (data.region !== '') {
                let regionId = parseInt(data.region);
                if (isNaN(regionId)) {
                    sqlInst += ", regionid = (select [entryid] from lists where [text] = '" + data.region + "')";
                } else {
                    sqlInst += ", regionid = " + regionId;
                }
            }

            if (data.city !== '') {
                let cityId = parseInt(data.city)
                if (isNaN(cityId)) {
                    sqlInst += ", cityid = (select [entryid] from lists where [text] = '" + data.city + "')";
                } else {
                    sqlInst += ", cityid = " + cityId;
                }
            }

            sqlInst += " where userid = " + data.userId;

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

// Updates person password
// vscode-fold=4
exports.resetPassword = function (req, res, reqBody, cb) {
    try {
        if (!reqBody) throw new Error("Input not valid");
        let data = reqBody;
        if (data) {
            let sqlInst = `update users set hashed_password = '${data.password}', lastmodifiedbyuserid = ${data.userId}, lastmodifiedondate = getdate() where userid = ${data.userId}; `;

            db.querySql(sqlInst, function (data, err) {
                if (err) {
                    console.log(err.message);
                    cb({
                        "error": err.message
                    });
                } else {
                    cb({
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

// Gets list of regions, cities, etc
// vscode-fold=5
exports.getLists = function (req, res, listname, parentId, term, sortCol, sortOrder) {
    try {
        let sqlInst = "";
        if (parentId) {
            sqlInst += "select * from lists where listname = '" + listname + "' and parentid = '" + parentId + "'";
        } else {
            sqlInst += "select * from lists where listname = '" + listname + "'";
        }

        if (term) {
            sqlInst += " and [text] like '" + term + "%' ";
        }

        sqlInst += " order by [" + sortCol + "] " + sortOrder;

        db.querySql(sqlInst,
            function (data, err) {
                if (err) {
                    console.log(err.message);
                    res.status(500).json({
                        "error": err.message
                    });
                } else {
                    res.json({
                        "list": data.recordset
                    });
                }
            });
    } catch (ex) {
        res.send(ex);
    }
};

// Gets person addresss
// vscode-fold=6
exports.getAddress = function (req, res, postalCode) {
    try {
        if (!postalCode) throw new Error("Input not valid");

        let sqlInst = "declare @userid nvarchar(20) ";
        sqlInst += "set @userid = (select top 1 userid from users where postalcode = '" + postalCode + "') ";
        sqlInst += "if (@userid <> '') ";
        sqlInst += "begin ";
        sqlInst += "select	'country' = (select [text] from lists where entryid = (select top 1 countryid from users where userid = @userid)) ";
        sqlInst += ",'countryid' = (select [entryid] from lists where entryid = (select top 1 countryid from users where userid = @userid))";
        sqlInst += ",'countryval' = (select [value] from lists where entryid = (select top 1 countryid from users where userid = @userid))";
        sqlInst += ",'region' = (select [text] from lists where entryid = (select top 1 regionid from users where userid = @userid)) ";
        sqlInst += ",'regionid' = (select [entryid] from lists where entryid = (select top 1 regionid from users where userid = @userid)) ";
        sqlInst += ",'regionval' = (select [value] from lists where entryid = (select top 1 regionid from users where userid = @userid)) ";
        sqlInst += ",'city' = (select [text] from lists where entryid = (select top 1 cityid from users where userid = @userid)) ";
        sqlInst += ",'cityid' = (select [entryid] from lists where entryid = (select top 1 cityid from users where userid = @userid)) ";
        sqlInst += ",'cityval' = (select [value] from lists where entryid = (select top 1 cityid from users where userid = @userid)) ";
        sqlInst += ",'district' = (select top 1 district from users where userid = @userid) ";
        sqlInst += ",'street' = (select top 1 street from users where userid = @userid) ";
        sqlInst += "end ";
        sqlInst += "else select 'CEP não existe no banco de dados' as error";

        db.querySql(sqlInst,
            function (data, err) {
                if (err) {
                    console.log(err.message);
                    res.status(500).json({
                        "error": err.message
                    });
                } else {
                    if (data.recordset[0].error == null) {
                        res.json({
                            "address": data.recordset
                        });
                    } else {
                        res.json({
                            "error": data.recordset[0].error
                        });
                    }
                }
            });
    } catch (ex) {
        res.send(ex);
    }
};

// Saves person rating
// vscode-fold=7
exports.saveReputation = function (req, res, reqBody) {
    try {
        if (!reqBody) throw new Error("Input not valid");
        let data = reqBody;
        if (data) {
            let sqlInst = "declare @id int; "
            sqlInst += "insert into w1buy_user_reputation (portalid, fromuserid, touserid, comment, vote, createdondate)";
            sqlInst += util.format(" values (%d, %d, %d, '%s', %d, getdate()); set @id = scope_identity(); ",
                data.portalId, data.fromUserId, data.toUserId, data.comment || '', data.vote);

            sqlInst += "select @id as UserReputationId; ";

            sqlInst += "select avg(ur.vote) as Rating ";
            sqlInst += "from w1buy_user_reputation ur ";
            sqlInst += util.format("where ur.touserid = %d; ", data.toUserId);

            db.querySql(sqlInst, function (records, err) {
                if (err) {
                    console.log(err.message);
                    res.status(500).json({
                        error: err.message
                    });
                } else {
                    if (records.recordsets[1]) {
                        if (records.recordsets[1].length) {
                            records.recordsets[0][0].Ratings = records.recordsets[1][0];
                        }
                    }

                    res.json(records.recordset[0])
                }
            }, true);
        } else {
            // throw new Error("Input not valid");
            return res.status(500).json(`Input not valid (status: 500)`);
        }
    } catch (ex) {
        res.send(ex);
    };
};

// Gets list of users
// vscode-fold=8
exports.getPeople = function (req, res, portalId, cb) {
    try {
        let sqlInst = "select p.Approved, p.CityId, p.CountryId, p.CreatedOnDate, p.DisplayName, p.DocId, p.Email, p.FirstChoice ";
        sqlInst += ", p.FirstName, p.IsDeleted, p.IsSuperUser, p.LastIPAddress, p.LastModifiedByUserID, p.LastModifiedOnDate, p.LastName";
        sqlInst += ", p.LastPasswordChangeDate, p.PortalId, p.PostalCode, p.RegionId, p.UserID, p.Username";
        sqlInst += ", isnull(street, '') as Street ";
        sqlInst += ", isnull(district, '') as District ";
        sqlInst += ", isnull(streetnumber, '') as StreetNumber ";
        sqlInst += ", isnull(telephone, '') as Telephone ";
        sqlInst += ", isnull(cell, '') as Cell ";
        sqlInst += ", Region = (select [value] from lists where entryid = (select regionid from users where userid = p.userid))";
        sqlInst += ", City = (select [text] from lists where entryid = (select cityid from users where userid = p.userid))";
        sqlInst += "from users p ";
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

// Gets people statistics
// vscode-fold=9
exports.getPeopleDate = function (req, res, year, cb) {
    try {
        let sqlInst = `set language brazilian; select convert(char(3), datename(month, createdondate), 0) as months, count(*) as quantity from users where year(createdondate) = ${year} group by convert(char(3), datename(month, createdondate), 0);`;

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

// Gets people locales statistics
// vscode-fold=10
exports.getPeopleLocales = function (req, res, year, cb) {
    try {
        let sqlInst = `select l.value as region, count(*) as quantity from users p join lists l on isnull(l.entryid, 1111) = p.regionid where year(p.createdondate) = ${year} group by p.regionid, l.value;`;

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

// Gets seller report plans
// vscode-fold=11
exports.getSellerReportPlans = function (req, res, userId, cb) {
    try {
        let sqlInst = 'select p.* ';
        sqlInst += ', (select count(*) from w1Buy_seller_locales where sellerreportplanid = p.[sellerreportplanid]) as SellerLocalesCount ';
        sqlInst += ', (select count(*) from w1Buy_seller_keywords where sellerreportplanid = p.[sellerreportplanid]) as SellerKeywordsCount ';
        sqlInst += `from w1buy_seller_report_plans p where p.[userid] = ${userId};`;

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

// Gets seller report plan
// vscode-fold=12
exports.getSellerReportPlan = function (req, res, planId, cb) {
    try {
        let sqlInst = `select * from w1buy_seller_report_plans where sellerreportplanid = ${planId}; `;

        sqlInst += `select * from w1Buy_seller_locales where sellerreportplanid = ${planId}; `;

        sqlInst += `select * from w1Buy_seller_keywords where sellerreportplanid = ${planId};`;

        db.querySql(sqlInst, function (data, err) {
            if (err) {
                console.log(err.message);
                cb({
                    'error': err.message
                });
            } else {
                if (data.recordsets[0].length) {
                    if (data.recordsets[1].length) {
                        data.recordsets[0][0].Locales = data.recordsets[1];
                    }

                    if (data.recordsets[2].length) {
                        data.recordsets[0][0].Keywords = data.recordsets[2];
                    }
                }

                cb(data.recordsets[0]);
            }
        }, true);
    } catch (ex) {
        cb({
            'error': ex.message
        });
    };
};

// Gets seller report plan locales
// vscode-fold=13
exports.getSellerReportPlanLocales = function (req, res, planId, cb) {
    try {
        let sqlInst = `select * from w1Buy_seller_locales where sellerreportplanid = ${planId};`;

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

// Gets seller report plan keywords
// vscode-fold=14
exports.getSellerReportPlanKeywords = function (req, res, planId, cb) {
    try {
        let sqlInst = `select * from w1Buy_seller_keywords where sellerreportplanid = ${planId};`;

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

// Add seller report plan
// vscode-fold=15
exports.addSellerReportPlan = function (req, res, reqBody) {
    try {
        if (!reqBody) throw new Error("Input not valid");
        let data = reqBody;
        if (data) {
            let sqlInst = "declare @id int; "
            sqlInst += "insert into w1buy_seller_report_plans (userid, createdondate)";
            sqlInst += util.format(" values (%d, getdate()); set @id = scope_identity(); ",
                data.UserId);

            _.forEach(data.SellerKeywords, function (word) {
                sqlInst += util.format("insert into w1Buy_seller_keywords (sellerreportplanid, keywordname, createdondate) values (@id, '%s', getdate()); ", word.KeywordName);
            });

            _.forEach(data.SellerLocales, function (locale) {
                sqlInst += util.format("insert into w1Buy_seller_locales (localeid, city, region, sellerreportplanid, createdondate) " +
                    "values (%d, '%s', '%s', @id, getdate()); ",
                    locale.LocaleId, locale.City, locale.Region);
            });

            sqlInst += "select @id as SellerReportPlanId;";

            db.querySql(sqlInst, function (records, err) {
                if (err) {
                    console.log(err.message);
                    res.status(500).json({
                        error: err.message
                    });
                } else {
                    res.json(records.recordset[0])
                }
            }, true);
        } else {
            // throw new Error("Input not valid");
            return res.status(500).json(`Input not valid (status: 500)`);
        }
    } catch (ex) {
        res.send(ex);
    };
};

// Update seller report plan
// vscode-fold=16
exports.updateSellerReportPlan = function (req, res, reqBody) {
    try {
        if (!reqBody) throw new Error("Input not valid");
        let data = reqBody;
        if (data) {
            let sqlInst = `delete from w1Buy_seller_keywords where sellerreportplanid = ${data.SellerReportPlanId}; `;

            _.forEach(data.SellerKeywords, function (word) {
                sqlInst += util.format("insert into w1Buy_seller_keywords (sellerreportplanid, keywordname, createdondate) values (%d, '%s', getdate()); ", data.SellerReportPlanId, word.KeywordName);
            });

            sqlInst += `delete from w1Buy_seller_locales where sellerreportplanid = ${data.SellerReportPlanId}; `;

            _.forEach(data.SellerLocales, function (locale) {
                sqlInst += util.format("insert into w1Buy_seller_locales (localeid, city, region, sellerreportplanid, createdondate) " +
                    "values (%d, '%s', '%s', %d, getdate()); ",
                    locale.LocaleId, locale.City, locale.Region, data.SellerReportPlanId);
            });

            db.querySql(sqlInst, function (records, err) {
                if (err) {
                    console.log(err.message);
                    res.status(500).json({
                        error: err.message
                    });
                } else {
                    res.json({
                        'result': 'success'
                    })
                }
            }, true);
        } else {
            // throw new Error("Input not valid");
            return res.status(500).json(`Input not valid (status: 500)`);
        }
    } catch (ex) {
        res.send(ex);
    };
};

// Remove seller report plan
// vscode-fold=17
exports.removeSellerReportPlan = function (req, res, planId) {
    try {
        if (planId) {
            let sqlInst = `delete from w1buy_seller_report_plans where sellerreportplanid = ${planId}; `;

            db.querySql(sqlInst, function (records, err) {
                if (err) {
                    console.log(err.message);
                    res.status(500).json({
                        error: err.message
                    });
                } else {
                    res.json({
                        'result': 'success'
                    })
                }
            }, true);
        } else {
            // throw new Error("Input not valid");
            return res.status(500).json(`Input not valid (status: 500)`);
        }
    } catch (ex) {
        res.send(ex);
    };
};