var dbconfig = require('../config/database');
var mysql = require('mysql');
var connection = mysql.createConnection(dbconfig.connection);
connection.query('USE ' + dbconfig.database);

module.exports.login = function(request,response){
    var username = request.body.username;
    var password = request.body.password;
    if (username && password) {
        connection.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], function (error, results, fields) {
            if (results.length > 0) {
                console.log(typeof (results[0].status));
                request.session.loggedin = true;
                request.session.username = username;
                if (results[0].status == "admin") {
                    console.log("ADMIN");
                    response.redirect('/admin');
                }
                else if (results[0].status == 'user')
                    response.redirect('/user');
            } else {
                response.send('Incorrect Username and/or Password!');
            }
            response.end();
        });
    } else {
        response.send('Please enter Username and Password!');
        response.end();
    }
}