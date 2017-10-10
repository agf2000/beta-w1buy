const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const db = require("../core/db");

module.exports = function (passport) {
    // Local Strategy
    passport.use(new LocalStrategy({
        passReqToCallback: true
    }, function (req, username, password, done) {
        db.querySql("select * from users where email = '" + username + "'", (data, err) => {
            if (err) {
                console.log(err);
                return done(null, false, {
                    message: err.message
                });
            }

            let user = data.recordset[0];
            if (!user) {
                return done(null, false, {
                    message: 'Usuário ou senha incorreto.'
                });
            }

            // Match Password
            bcrypt.compare(password, user.Hashed_Password, function (err, isMatch) {
                if (err) throw err;
                if (isMatch) {
                    if (!user.Approved) db.querySql("update users set approved = 1 where email = '" + username + "'", (data, err) => {
                        if (err) throw err;
                    });
                    return done(null, user);
                } else {
                    return done(null, false, {
                        message: 'Usuário ou senha incorreto.'
                    });
                }
            });
        });
    }));

    passport.serializeUser(function (user, done) {
        done(null, user.UserID);
    });

    passport.deserializeUser(function (id, done) {
        let sqlInst = "select Country = cast('country' as nvarchar(100)), Region = cast('region' as nvarchar(100)), City = cast('city' as nvarchar(100)) ";
        sqlInst += `, NewMessages = cast(0 as int), * into #temp from users where userid = ${id} `;
        sqlInst += ` update #temp set Country = (select [text] from lists where entryid = (select countryid from users where userid = ${id}))`;
        sqlInst += `, Region = (select [value] from lists where entryid = (select regionid from users where userid = ${id}))`;
        sqlInst += `, City = (select [text] from lists where entryid = (select cityid from users where userid = ${id}))`;
        sqlInst += `, NewMessages = isnull((select count(*) from notifications where cast([context] as int) = ${id}), 0); `;
        sqlInst += "select * from #temp; ";

        sqlInst += `select * from w1buy_user_account where userid = ${id}; `;

        sqlInst += `select count(u.district) + count(u.firstname) + count(u.lastname) + count(u.docid) + count(u.cell) + count(u.cityid) + count(u.streetnumber) + 
                    count(u.postalcode) + count(u.regionid) + count(u.street) + count(u.streetnumber) + count(u.telephone) as progress from users u where userid = ${id}; `;

        sqlInst += `select r.rolename from roles r join userroles ur on r.roleid = ur.roleid where ur.userid = ${id}; `;

        sqlInst += "drop table #temp; ";

        db.querySql(sqlInst, (user, err) => {
            if (user.recordsets[1]) {
                user.recordset[0].AccountsInfo = user.recordsets[1];
            }
            if (user.recordsets[2]) {
                user.recordset[0].Progress = Math.round((user.recordsets[2][0].progress * 100) / 12).toFixed(0);
            }
            if (user.recordsets[3]) {
                user.recordset[0].Roles = user.recordsets[3];
            }
            done(err, user.recordset[0]);
        }, true);
    });
};