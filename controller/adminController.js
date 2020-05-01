var dbconfig = require('../config/database');
var mysql = require('mysql');
var connection = mysql.createConnection(dbconfig.connection);
connection.query('USE ' + dbconfig.database);

module.exports.addBook = function(req, res) {
    this.req = req;
    this.res = res;
    this.addBook = function(bookName, isbn) {
        console.log("Book name:" + bookName);
        console.log("ISBN:" + isbn);

        if (bookName && isbn) {
            connection.query('SELECT * from books WHERE bookname = ?', [bookName], function(err, result) {
                if (err) throw err;
                if (result.length == 0) {
                    var insertQuery = "INSERT INTO books (bookname, isbnnumber,status) values (?, ?, ?)";
                    connection.query(insertQuery, [bookName, isbn, false], function(err, result) {
                        if (err) throw err;
                        console.log("1 record inserted");
                        res.render('admin', { message: 'Kitap Eklendi' });
                        res.end();
                    });
                } else if (result.length > 0) {
                    res.render('admin', { message: 'Bu kitap sistemde kayıtlıdır.' });
                    res.end();
                }
            });

        }
    }
}

module.exports.listUsers = function(req, res) {
    connection.query('SELECT users.username,books.bookname FROM books ' +
        'INNER JOIN books_info ON books.id = books_info.bookname ' +
        'INNER JOIN users ON users.id = books_info.username',
        function(err, result) {
            if (err) throw err;
            if (result.length == 0) {
                res.render('admin', { message: 'Aranan kitap bulunmamaktadır.' });
                res.end();
            } else {
                console.log("dfsdf");
                res.render('listUsers', { users: result });
            }
        });
}