const express = require('express'),
	hbs = require('express-handlebars'),
	path = require('path'),
	bodyParser = require('body-parser'),
	session = require('express-session'),
	passport = require('passport'),
	helpers = require("./process/js/helpers.js"),
	// schedule = require('./process/js/scheduling'),
	virtualPath = process.env.VIRTUAL_PATH || "";

// Init express app and server
const app = express();
const server = require('http').Server(app);
const port = process.env.PORT || 8080;

// Start socket.io
const io = require('socket.io')(server, {
	path: virtualPath + '/socket.io'
});

// socket.io midleware
app.use(function (req, res, next) {
	res.io = io;
	next();
});

// Body Parser Middleware
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
	extended: true
}));
// parse application/json
app.use(bodyParser.json());

// Set Public Folders
app.use(express.static(path.join(__dirname, 'data')));
app.use(express.static(path.join(__dirname, 'public')));

// Load View Engine
app.set('views', path.join(__dirname, 'views'));
app.engine('hbs', hbs({
	extname: 'hbs',
	defaultLayout: 'main',
	helpers: helpers,
	layoutsDir: path.join(__dirname, '/views/layouts/'),
	partialsDir: path.join(__dirname, '/views/partials/')
}));
app.set('view engine', 'hbs');

// Express Session Middleware
app.use(session({
	secret: 'jabuticaba',
	resave: true,
	saveUninitialized: false
}));

// Passport Config
require('./config/passport')(passport);
// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

app.get('*', function (req, res, next) {
	res.locals.user = req.user || null;
	res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max- stale=0, post - check=0, pre - check=0');
	next();
});

// Routes - start
// Home route
const home = require('./routes/home');
app.use('/', home);

// For testing purpose
// app.get('/', function (req, res) {
// 	res.sendFile(path.join(__dirname + '/index.html'));
// });

// Admin route
let admin = require('./routes/admin');
app.use('/admin', admin);

// Users route
let users = require('./routes/users');
app.use('/contas', users);

// Postings route
let postings = require('./routes/postings');
app.use('/anuncios', postings);

// API route
let api = require('./routes/api');
app.use('/api', api);

// capture socket.io connection
// io.on('connection', function (socket) {
// 	socket.on('request', function (data) {
// 		sendResponse(socket, data);
// 	});
// });

// // Socket.io test
// var sendResponse = function (socket, data) {
// 	setTimeout(function () {
// 		socket.emit('response', data);
// 	}, 1000);
// };

// Loggedin user array
const loggedInUsers = {};
app.locals.loggedInUsers = loggedInUsers;

// socket.io stuff
io.on('connection', function (socket) {
	socket.on('messages', function (data, callback) {
		if (data in loggedInUsers) {
			callback(false);
		} else {
			callback(true);
			socket.userId = data;
			loggedInUsers[socket.userId] = socket;
		}
	});

	socket.on('disconnect', function (data) {
		if (!socket.userId) return
		delete loggedInUsers[socket.userId];
	});
});

// scheduling tasks
// const schedule = require('node-schedule');
// let rule = new schedule.RecurrenceRule();
// rule.second = 10;
// let jj = schedule.scheduleJob(rule, function () {
// 	console.log("execute jj");
// });

// Start server
server.listen(port);

// module.exports = {
// 	app: app,
// 	server: server,
// 	loggedInUsers: loggedInUsers,
// 	schedule: schedule
// };