var dbconfig = require('../config/database');
var mysql = require('mysql');
var connection = mysql.createConnection(dbconfig.connection);
connection.query('USE ' + dbconfig.database);

module.exports.list = function(req, res) {
    var user_id = req.user.id;
    console.log("id:" + user_id);
    if (user_id) {
        connection.query('SELECT books.bookname,books.isbnnumber,books_info.date FROM books ' +
            'INNER JOIN books_info ON books.id = books_info.bookname ',
            function(err, result) {
                if (err) throw err;
                if (result.length == 0) {
                    res.render('user', { message: 'Aranan kitap bulunmamaktadır.' });
                    res.end();
                } else {
                    console.log("dfsdf");
                    res.render('myBooks', { users: result });
                }
            });
    }
}
module.exports.search = function(req, res) {
    var search = req.body.search;

    if (search) {
        connection.query('SELECT * FROM books WHERE bookname = ? OR isbnnumber = ?', [search, search], function(err, result) {

            if (err) throw err;
            if (result.length == 0) {
                res.render('user', { message: 'Aranan kitap bulunmamaktadır.' });
                res.end();
            } else {
                res.render('user', {
                    message: 'Kitap:' + result[0].bookname + ' ISBN:' +
                        result[0].isbnnumber + ' Durum:' + result[0].status
                });
                res.end();
            }
        })
    }
}

module.exports.newBook = function(req, res) {
    var bookname = req.body.bookname;
    var username = req.user.username;
    var book_id;
    var user_id = req.user.id;

    if (bookname) {
        console.log("bookname:" + bookname);
        connection.query('SELECT * FROM books WHERE bookname = ?', [bookname], function(err, result) {
            book_id = result[0].id;
            console.log("id:" + result[0].id);
            console.log("status:" + result[0].status);
            if (err) throw err;

            if (result.length == 0) {
                res.render('user', { message: 'Aranan kitap veritabanında bulunmamaktadır.' });
                res.end();
            } else if (result.length > 0) {

                if (result[0].status == 1) {
                    console.log("status:" + typeof result[0].status);
                    res.render('user', { message: 'Kitap şu anda boşta değildir.' });
                    res.end();
                }
            }


        });

        connection.query('SELECT * from users WHERE username = ?', [username], function(err, result) {
            console.log("dgdfg");
            if (err) throw err;
            if (result.length == 0) {
                res.render('user', { message: 'Hata!' });
                res.end();
            } else if (result.length > 0) {
                if (result[0].totalBook > 3) {
                    res.render('user', { message: 'Kullanıcı maksimum 3 kitap alabilir.' });
                    res.end();
                }
            }
        });
        connection.query('SELECT * from books_info WHERE username = ?', [user_id], function(err, result) {
            if (err) throw err;
            if (result.length == 0) {
                app.render('user', { message: 'Hata!' });
                res.end();
            } else if (result.length > 0) {

                var value;
                for (var i = 0; i < result.length; i++) {
                    value = checkDate();
                    if (value == 0) {
                        app.render('user', {
                            message: 'Teslim tarihi geçmiş kitap bulunmaktadır. Lütfen kitabı teslim ettikten' +
                                'sonra tekrar deneyin!'
                        });
                        res.end();
                    }

                }

                var sql = "UPDATE books SET status = ? WHERE id = ?;" +
                    "UPDATE users SET totalbook = ? WHERE id = ?;" +
                    "INSERT INTO books_info (username,bookname,date) VALUES (?, ? ,?)";

                connection.query(sql, [1, book_id, req.user.totalbook - 1, user_id, user_id, book_id, dateNow().today], function(err, result) {
                    if (err) throw err;
                    if (result.length == 0) {
                        res.render('user', { message: 'Hata!' });
                        res.end();
                    } else {
                        res.render('user', { message: 'Kitap Alındı!' });
                        res.end();
                    }

                });
            }
        });
    }

}

module.exports.givebook = function(req, res) {
    this.req = req;
    this.res = res;
    this.giveBook = function(isbnNumber, user_id, totalBook) {
        console.log("isbn:" + isbnNumber);
        var isbn = "9780733426094";
        if (isbn) {
            connection.query('SELECT * FROM books WHERE isbnnumber = ?', [isbn], function(err, results) {
                if (err) throw err;
                if (results.length == 0) {
                    console.log('Bu isbn numarasına kayıtlı kitap bulunmamaktadır.');
                    res.render('user', { message: 'Bu isbn numarasına kayıtlı kitap bulunmamaktadır.' });
                    res.end();
                } else if (results.length > 0) {
                    connection.query('SELECT * FROM books_info WHERE bookname = ? AND username = ?', [results[0].id, user_id], function(err, result) {
                        if (err) throw err;
                        if (result.length == 0) {
                            console.log('Bu kullanıcı böyle bir kitap almamıştır...');
                            res.render('user', { message: 'Bu kullanıcı böyle bir kitap almamıştır...' });
                            res.end();

                        } else {
                            console.log('query1:' + results[0].id);
                            var query1 = "UPDATE books SET status = ?  WHERE id = ?";
                            connection.query(query1, [0, results[0].id], function(error, result, fields) {
                                if (error) {
                                    throw error;
                                }
                            });
                            var query2 = "UPDATE users SET totalbook = ?  WHERE id = ?";

                            connection.query(query2, [totalBook - 1, user_id], function(error, result, fields) {
                                if (error) {
                                    throw error;
                                }
                            });
                            var query3 = "DELETE FROM books_info  WHERE bookname = ?";
                            connection.query(query3, [results[0].id], function(error, result, fields) {
                                if (error) {
                                    throw error;
                                }
                                res.render('user', { message: 'Kitap Teslim Edildi...' });
                            });

                        }
                    });
                }
            });
        }

    }
}

function checkDate(date) {
    var date = new Date();
    var rdd = date.getDate(); // r:record
    var rmm = date.getMonth() + 1;
    var ryyyy = date.getFullYear();

    if (rdd < 10)
        rdd = '0' + rdd;
    if (rmm < 10)
        rmm = '0' + rmm;

    if (date.tyyy > ryyyy || date.tmm > rmm || date.tdd > rdd)
        return 0;
    return 1;
}

function dateNow() {
    var today = new Date();
    var tdd = today.getDate();
    var tmm = today.getMonth() + 1;
    var tyyyy = today.getFullYear();

    if (tdd < 10)
        tdd = '0' + tdd;
    if (tmm < 10)
        tmm = '0' + tmm;

    today = tdd + '/' + tmm + '/' + tyyyy;

    return { today: today, tdd: tdd, tmm: tmm, tyyyy: tyyyy };;
}