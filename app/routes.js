var dbconfig = require('../config/database');
var mysql = require('mysql');
var connection = mysql.createConnection(dbconfig.connection);
connection.query('USE ' + dbconfig.database);
var loginController = require('../controller/loginController');
var userController = require('../controller/userController');
var adminController = require('../controller/adminController');
var tess = require('../app/tess');

module.exports = function(app, passport) {

    app.get('/', function(req, res) {
        res.render('login.ejs', { message: req.flash('loginMessage') });
    });
    app.post('/auth', passport.authenticate('local-login', { failureRedirect: '/', }),
        function(req, res) {
            console.log(req.user.id);
            if (req.user.status == "user") {
                res.redirect('/user');
            } else { res.redirect('/admin'); }
        });

    app.get('/admin', function(req, res) {
        res.render('admin.ejs', { message: 'Ece' });
    });

    app.get('/addbook', function(req, res) {
        res.render('addBook.ejs');
    });

    app.get('/user', function(req, res) {
        console.log("22");
        res.render('user.ejs', { message: '' });
    });

    app.get('/search', function(req, res) {
        res.render('searchBook.ejs');
    });

    app.get('/newbook', function(req, res) {
        console.log(req.user.username);
        res.render('newBook.ejs');
    });

    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    })

    app.get('/skiptime', function(req, res) {
        res.render('skipTime.ejs');
    });

    app.get('/givebook', function(req, res) {
        res.render('giveBook.ejs')
    })
    app.get('/mybooks', userController.list);

    app.get('/listusers', adminController.listUsers);

    app.post('/upload', tess.upload);

    app.get('/showdata', (req, res) => {});

    app.post('/search', userController.search);

    app.post('/addBook', adminController.addBook);

    app.post('/newbook', userController.newBook);

    app.post('/skiptime', userController.skipTime);




    /*
    app.get('/home', function(request, response) {
        if (request.session.loggedin) {
            response.send('Welcome back, ' + request.session.username + '!');
        } else {
            response.send('Please login to view this page!');
        }
        response.end();
    });*/
}