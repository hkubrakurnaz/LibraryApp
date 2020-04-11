var express = require('express');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var app = express();
var port = process.env.PORT || 3000;

var passport = require('passport');
var flash = require('connect-flash');
app.use(express.static('public'));
require('./config/passport')(passport);

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));


app.use(express.json());
app.use(morgan('dev'));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({
 extended: true
}));

app.use(express.urlencoded({ extended: true }));

app.use(express.json());

app.set('view engine', 'ejs');

app.use(session({
 secret: 'justasecret',
 resave:true,
 saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

require('./app/routes.js')(app, passport);

app.listen(port);
console.log("Port: " + port);