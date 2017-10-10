const express = require('express');
const router = express.Router();
const multer = require("multer");
const uuid = require("uuid");
const bcrypt = require('bcryptjs');
const passport = require('passport');
const util = require("util");
const peopleController = require("../controllers/peopleController.js");
const ensureAuthenticated = require('../process/js/ensureAuthenticated');
const email = require('../config/emailConfig');
const db = require("../core/db");
const async = require('async');
const crypto = require('crypto');
const flash = require('express-flash');

// multer storage settings
// vscode-fold=1
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, 'public/uploads')
	},
	filename: function (req, file, cb) {
		let ext = file.originalname.substr(file.originalname.lastIndexOf('.') + 1);
		cb(null, uuid.v4() + '.' + ext);
	}
});

const upload = multer({
	storage: storage
});

router.use(flash());

// Users account
// vscode-fold=2
router.get('/minhaconta', ensureAuthenticated, function (req, res) {
	res.render('account', {
		title: 'W1Buy :: Minha Conta',
		user: req.user,
		css: [
			'/lib/pnotify/css/pnotify.css',
			'/lib/pnotify/css/pnotify.buttons.css',
			// '/stylesheets/account.css'
		],
		script: [
			'/lib/pnotify/js/pnotify.js',
			'/lib/pnotify/js/pnotify.buttons.js',
			'/lib/pnotify/js/pnotify.callbacks.js',
			'/lib/pnotify/js/pnotify.confirm.js',
			'/lib/pnotify/js/pnotify.mobile.js',
			'/javascripts/utilities.js',
			'/javascripts/account.js'
		]
	});
});

// Profile Form
// vscode-fold=3
router.get('/cadastro', ensureAuthenticated, function (req, res) {
	res.render('profile', {
		title: 'W1Buy :: Meu Cadastro',
		user: req.user,
		css: [
			'/lib/select2/css/select2.min.css',
			'/lib/select2-bootstrap-theme/css/select2-bootstrap.min.css',
			'/lib/pnotify/css/pnotify.css',
			'/lib/pnotify/css/pnotify.buttons.css',
			// '/stylesheets/account.css',
			'/stylesheets/profile.css'
		],
		script: [
			'/lib/select2/js/select2.min.js',
			'/lib/select2/i18n/pt-BR.js',
			'/lib/jquery-mask/js/jquery.mask.min.js',
			'/lib/pnotify/js/pnotify.js',
			'/lib/pnotify/js/pnotify.buttons.js',
			'/lib/pnotify/js/pnotify.callbacks.js',
			'/lib/pnotify/js/pnotify.confirm.js',
			'/lib/pnotify/js/pnotify.mobile.js',
			'/javascripts/utilities.js',
			'/javascripts/account.js',
			'/javascripts/profile.js'
		]
	});
});

// Profile Form
// vscode-fold=4
router.get('/meusanuncios', ensureAuthenticated, function (req, res) {
	res.render('myPostings', {
		title: 'W1Buy :: Meus Anúncios',
		user: req.user,
		css: [
			// '/stylesheets/account.css',
			'/stylesheets/myPostings.css'
		],
		script: [
			'/lib/knockout/knockout-latest.js',
			'/lib/jquery-touchswipe/jquery.touchSwipe.min.js',
			'/javascripts/utilities.js',
			'/javascripts/userPostingsViewModel.js',
			'/javascripts/account.js',
			'/javascripts/myPostings.js'
		]
	});
});

// User's messages
// vscode-fold=5
router.get('/mensagens', ensureAuthenticated, function (req, res) {
	res.render('messages', {
		title: 'W1buy :: Mensagens',
		user: req.user,
		css: [
			'/lib/bootstrap3-dialog/css/bootstrap-dialog.min.css',
			'/lib/bootstrap-fileinput/css/fileinput.min.css',
			'/lib/pnotify/css/pnotify.css',
			'/lib/pnotify/css/pnotify.buttons.css',
			'/lib/rateyo/css/jquery.rateyo.min.css',
			// '/stylesheets/account.css',
			'/stylesheets/messages.css'
		],
		script: [
			'/lib/bootstrap3-dialog/js/bootstrap-dialog.min.js',
			'/lib/bootstrap-fileinput/js/fileinput.min.js',
			'/lib/bootstrap-fileinput/js/locales/pt-br.js',
			'/lib/knockout/knockout-latest.js',
			'/lib/pnotify/js/pnotify.js',
			'/lib/pnotify/js/pnotify.buttons.js',
			'/lib/pnotify/js/pnotify.callbacks.js',
			'/lib/pnotify/js/pnotify.confirm.js',
			'/lib/pnotify/js/pnotify.mobile.js',
			'/lib/rateyo/js/jquery.rateyo.min.js',
			'/javascripts/utilities.js',
			'/javascripts/account.js',
			'/javascripts/messagesViewModel.js',
			'/javascripts/messages.js'
		]
	});
});

// User's seller report
// vscode-fold=6
router.get('/meurelatorio', ensureAuthenticated, function (req, res, next) {
	res.render('sellerReport', {
		title: 'W1buy :: Relatório',
		user: req.user,
		css: [
			'/stylesheets/kendo/2017.1.223/kendo.common.min.css',
			'/stylesheets/kendo/2017.1.223/kendo.flat.min.css',
			'/lib/sweetalert2/css/sweetalert2.min.css',
			'/lib/pnotify/css/pnotify.css',
			'/lib/pnotify/css/pnotify.buttons.css',
			'/lib/select2/css/select2.min.css',
			'/lib/select2-bootstrap-theme/css/select2-bootstrap.min.css',
			'/lib/bootstrap-tagsinput/css/bootstrap-tagsinput.css',
			'/stylesheets/sellerreport.css'
		],
		script: [
			'/javascripts/kendo/2017.1.223/kendo.web.min.js',
			'/javascripts/kendo/2017.1.223/cultures/kendo.culture.pt-BR.min.js',
			'/javascripts/kendo/2017.1.223/messages/kendo.messages.pt-BR.min.js',
			'/lib/select2/js/select2.min.js',
			'/lib/select2/i18n/pt-BR.js',
			'/lib/pnotify/js/pnotify.js',
			'/lib/pnotify/js/pnotify.buttons.js',
			'/lib/pnotify/js/pnotify.callbacks.js',
			'/lib/pnotify/js/pnotify.confirm.js',
			'/lib/pnotify/js/pnotify.mobile.js',
			'/lib/bootstrap-tagsinput/js/bootstrap-tagsinput.min.js',
			'/javascripts/utilities.js',
			'/javascripts/account.js',
			'/javascripts/sellerreport.js'
		]
	});
});

// Login Form
// vscode-fold=7
router.get('/login', function (req, res) {
	res.render('login', {
		title: 'W1Buy :: Login',
		layout: 'neutral',
		css: [
			'/stylesheets/login.css'
		],
		script: [
			'/javascripts/login.js'
		]
	});
});

// Users
// User registration proccess
// vscode-fold=8
router.post('/registeruser', function (req, res, next) {
	bcrypt.genSalt(10, function (err, salt) {
		bcrypt.hash(req.body.password, salt, function (err, hash) {
			if (err) {
				console.log(err);
			}
			req.body.password = hash;

			peopleController.addPerson(req, res, req.body, function (result) {
				if (!result.error) {

					let emailText = `Caro(a) ${req.body.firstName} ${req.body.lastName}, estamos felizes em lhe informar que seu cadastro foi aceito em nosso portal. \n\n
							Por favor leia a informação abaixo com atenção e certifique-se que estaja disponível para futuras referências. \n\n
							Endereço do Portal: ${req.headers.origin} \n
							Seu login: ${req.body.email} \n\n
							Obrigado e Bem Vindo a W1Buy.com`;

					// send the message and get a callback with an error or details of the message that was sent 
					email.send({
						text: emailText,
						from: "Administrador - W1Buy <w1buy@w1buy.com.br>",
						to: '"' + req.body.firstName + ' ' + req.body.lastName + '" <' + req.body.email + '>',
						subject: 'Seu cadastro no portal W1Buy'
						// attachment: [{
						// 	data: emailHtml,
						// 	alternative: true
						// }]
					}, function (emailErr, message) {
						console.log(emailErr || message);
					});

					res.json({
						UserId: result.UserId
					});
				} else {
					res.json({
						"error": result.error
					});
				}
			});
		});
	});
});

// Login process
// vscode-fold=9
router.post('/login', function (req, res, next) {
	passport.authenticate('local', function (error, user, info) {
		if (error) {
			return res.status(500).json(`${error}`);
		}
		if (!user) {
			return res.status(401).json(`${info.message}`);
		}
		req.logIn(user, function (err) {
			if (err) {
				if (err) {
					next();
					return res.status(500).json(err);
				}
			} else {
				if (req.body.remember_me == 'true') {
					let oneHour = 3600000;
					req.session.cookie.expires = new Date(Date.now() + oneHour);
					req.session.cookie.maxAge = oneHour;
				} else {
					req.session.cookie._expires = false;
				}
				res.redirect("/");
			}
		});
		// res.json(user);
		// req.login(user, function (err) {
		// 	if (err) {
		// 		next();
		// 		return res.status(500).json(err);
		// 	}
		// 	return res.json({
		// 		message: 'user authenticated',
		// 	});
		// });
	})(req, res, next);
});

// Send user passoword process
// vscode-fold=10
router.get('/reset/:token', function (req, res) {
	let sqlInst = `select * from users where passwordresettoken = '${req.params.token}' and passwordresetexpiration <= '${(new Date().toISOString().slice(0, 19).replace('T', ' '))}'`;
	db.querySql(sqlInst, (data, err) => {
		if (err) {
			res.render('reset', {
				title: 'W1Buy :: Recriar Senha',
				error: err.message,
				layout: 'neutral'
			});
		}
		let user = data.recordset[0];
		if (!user) {
			res.render('reset', {
				title: 'W1Buy :: Recriar Senha',
				error: "O link para recriação de senha é inválido ou expirou.",
				layout: 'neutral'
			});
		} else {

			res.render('reset', {
				title: 'W1Buy :: Recriar Senha',
				layout: 'neutral'
			});
		}
	});
});

router.post('/reset/:token', function (req, res) {
	async.waterfall([
		function (done) {
			let sqlInst = `select * from users where passwordresettoken = '${req.params.token}' and passwordresetexpiration <= '${(new Date().toISOString().slice(0, 19).replace('T', ' '))}'`;
			db.querySql(sqlInst, (data, err) => {
				if (err) {
					res.render('reset', {
						title: 'W1Buy :: Nova Senha',
						layout: 'neutral',
						error: err.message
					});
				}
				let user = data.recordset[0];
				if (!user) {
					res.render('reset', {
						title: 'W1Buy :: Nova Senha',
						layout: 'neutral',
						error: "O link para recriação de senha é inválido ou expirou."
					});
				} else {
					bcrypt.genSalt(10, function (err, salt) {
						bcrypt.hash(req.body.password, salt, function (err, hash) {
							if (err) {
								console.log(err);
							}
							req.body.password = hash;

							let sqlInst = `update users set passwordresettoken = null, passwordresetexpiration = null, hashed_password = '${req.body.password}' where userid = ${user.UserID};`;

							db.querySql(sqlInst, function (data, err) {
								if (err) {
									res.render('reset', {
										title: 'W1Buy :: Nova Senha',
										layout: 'neutral',
										error: err.message
									});
								}

								req.logIn(user, function (err) {
									done(err, user);
								});
							});
						});
					});
				}
			});
		},
		function (user, done) {
			let emailText = `Caro(a) ${user.FirstName} ${user.LastName}, essa mensagem é de confirmação que sua senha foi alterada com sucesso. \n\n`;

			// send the message and get a callback with an error or details of the message that was sent 
			email.send({
				text: emailText,
				from: "Administrador - W1Buy <w1buy@w1buy.com.br>",
				to: '"' + user.FirstName + ' ' + user.LastName + '" <' + user.email + '>',
				subject: 'Aletração de Senha na W1Buy'
			}, function (emailErr, message) {
				console.log(emailErr || message);
				done(emailErr, 'done');
			});
		}
	], function (err) {
		res.render('login', {
			title: 'W1Buy :: Login',
			layout: 'neutral',
			success: "Sua senha foi alterada com sucesso",
			css: [
				'/stylesheets/login.css'
			],
			script: [
				'/javascripts/login.js'
			]
		});
	});
});

// User Reset passoword proccess
router.post('/resetpassword', function (req, res, next) {
	async.waterfall([
		function (done) {
			crypto.randomBytes(20, function (err, buf) {
				let token = buf.toString('hex');
				done(err, token);
			});
		},
		function (token, done) {
			db.querySql("select * from users where email = '" + req.body.email + "'", (data, err) => {
				if (err) {
					res.json({
						"error": err.message
					});
				}
				let user = data.recordset[0];
				if (!user) {
					res.json({
						"error": "Email não encontrado."
					});
				} else {

					let sqlInst = `update users set passwordresettoken = '${token}', passwordresetexpiration = dateadd(hour, 1,'${new Date().toISOString().slice(0, 19).replace('T', ' ')}') where userid = ${user.UserID};`;

					db.querySql(sqlInst, function (data, err) {
						if (err) {
							res.json({
								"error": err.message
							});
						}

						done(err, token, user);
					});
				}
			});
		},
		function (token, user, done) {
			let emailText = `Caro(a) ${user.FirstName} ${user.LastName}, está recebendo essa mensagem porque requisitou criar uma nova senha em sua conta na W1Buy. \n\n
				Favor usar o link abaixo para completar a ação: \n\n
				http://${req.headers.origin}/contas/reset/${token} \n\n
				Caso não tenha requisitado o reset de sua senha, favor ignorar essa mensagem. \n`;

			// send the message and get a callback with an error or details of the message that was sent 
			email.send({
				text: emailText,
				from: "Administrador - W1Buy <w1buy@w1buy.com.br>",
				to: '"' + user.FirstName + ' ' + user.LastName + '" <' + req.body.email + '>',
				subject: 'Resetar Senha W1Buy'
			}, function (emailErr, message) {
				console.log(emailErr || message);
				done(emailErr, 'done');
			});
		}
	], function (err) {
		if (err) {
			res.json({
				"error": err.message
			});
		}

		res.json({
			"success": "success"
		});
	});
});

// logout
// vscode-fold=11
router.get('/logout', function (req, res) {
	req.logout();
	res.redirect('/');
});

module.exports = router;