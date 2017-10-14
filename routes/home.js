const express = require('express');
const ensureAuthenticated = require('../process/js/ensureAuthenticated');
const router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('home', {
        title: 'W1Buy :: Home',
        layout: false,
        user: req.user,
        css: [
            '/stylesheets/home.css',
            '/stylesheets/login.css'
        ],
        script: [
            '/lib/jquery-touchswipe/jquery.touchSwipe.min.js',
            '/javascripts/utilities.js',
            '/javascripts/login.js',
            '/javascripts/home.js'
        ]
    });
});

/* GET plans page. */
router.get('/planos-vendedor', ensureAuthenticated, function (req, res, next) {
    res.render('planSeller', {
        title: 'W1Buy :: Planos Vendedor',
        user: req.user,
        script: [
            '/javascripts/utilities.js',
            '/javascripts/account.js',
            '/javascripts/plans.js'
        ]
    });
});

/* GET plans page. */
router.get('/plano-vendedor', ensureAuthenticated, function (req, res, next) {
    res.render('planSellerSingle', {
        title: 'W1Buy :: Plano Vendedor',
        user: req.user,
        script: [
            '/javascripts/utilities.js',
            '/javascripts/account.js',
            '/javascripts/plans.js'
        ]
    });
});

/* GET plans page. */
router.get('/planos-comprador', ensureAuthenticated, function (req, res, next) {
    res.render('planBuyer', {
        title: 'W1Buy :: Planos Comprador',
        user: req.user,
        script: [
            '/javascripts/utilities.js',
            '/javascripts/account.js',
            '/javascripts/plans.js'
        ]
    });
});

/* GET plans page. */
router.get('/plano-comprador', ensureAuthenticated, function (req, res, next) {
    res.render('planBuyerSingle', {
        title: 'W1Buy :: Plano Comprador',
        user: req.user,
        script: [
            '/javascripts/utilities.js',
            '/javascripts/account.js',
            '/javascripts/plans.js'
        ]
    });
});

/* GET plans page. */
router.get('/planos-brasil', ensureAuthenticated, function (req, res, next) {
    res.render('plansBrazil', {
        title: 'W1Buy :: Planos Brasil',
        user: req.user,
        script: [
            '/javascripts/utilities.js',
            '/javascripts/account.js',
            '/javascripts/plans.js'
        ]
    });
});

/* GET pagSeguro callback page. */
router.get('/retorno', function (req, res, next) {
    console.log(`params: ${req.params.transaction_id}, body: ${req.body.transaction_id}, query: ${req.query.transaction_id}`);
    res.render('plans', {
        title: 'W1Buy :: Planos via PagSeguro',
        user: req.user,
        script: [
            '/javascripts/utilities.js',
            '/javascripts/account.js',
            '/javascripts/plans.js'
        ]
    });
});

/* GET terms page. */
router.get('/termos', function (req, res, next) {
    res.render('terms', {
        title: 'W1Buy :: Termos de Uso',
        layout: 'neutral',
        user: req.user
    });
});

/* GET privacy page. */
router.get('/privacidade', function (req, res, next) {
    res.render('privacy', {
        title: 'W1Buy :: Política de Privacidade',
        layout: 'neutral',
        user: req.user
    });
});

module.exports = router;