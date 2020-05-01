var dbconfig = require('../config/database');
var mysql = require('mysql');
var connection = mysql.createConnection(dbconfig.connection);
connection.query('USE ' + dbconfig.database);
var date = dateNow();
var flag = 1;

module.exports.skipTime = function(req, res) {
    var day = parseInt(req.body.time);
    console.log(typeof date.tdd);
    date.tdd = date.tdd + day;

    if (date.tdd > 31) {
        date.tmm = parseInt(date.tmm) + 1;
        date.tdd = date.tdd - 31;
    }

    if (date.tmm > 12)
        date.tyy = parseInt(date.tyyyy) + 1;


    var newDate = date.tdd + '/' + date.tmm + '/' + date.tyyyy;
    date = { today: newDate, tdd: date.tdd, tmm: date.tmm, tyyyy: date.tyyyy };
    console.log("Date:" + newDate);
    res.render('admin', { message: 'Tarih Değiştirildi...' });

}
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

            if (err) throw err;

            if (result.length == 0) {
                flag = 0;
                res.render('user', { message: 'Aranan kitap veritabanında bulunmamaktadır.' });
                res.end()

            } else if (result.length > 0) {

                if (result[0].status == 1) {
                    flag = 0;
                    console.log("status:" + typeof result[0].status);
                    res.render('user', { message: 'Kitap şu anda boşta değildir.' });
                    res.end();
                }
                book_id = result[0].id;
                console.log("id:" + result[0].id);
                console.log("status:" + result[0].status);
            }


        });

        connection.query('SELECT * from users WHERE username = ?', [username], function(err, result) {
            console.log("Total Book:" + result[0].totalbook);
            if (err) throw err;
            if (result.length == 0) {
                flag = 0;
                res.render('user', { message: 'Hata!' });
                res.end();
            } else if (result.length > 0) {
                if (result[0].totalbook >= 3) {
                    flag = 0;
                    res.render('user', { message: 'Kullanıcı maksimum 3 kitap alabilir.' });
                    res.end();
                }
            }
        });
        connection.query('SELECT * from books_info WHERE username = ?', [user_id], function(err, result) {
            console.log("Length:" + result.length);
            if (err) throw err;

            if (result.length >= 0) {
                var value;
                for (var i = 0; i < result.length; i++) {
                    console.log("Value:" + value);
                    value = checkDate(result[i].date);
                    if (value == 0) {
                        flag = 0;
                        res.render('user', {
                            message: 'Teslim tarihi geçmiş kitap bulunmaktadır. Lütfen kitabı teslim ettikten ' +
                                'sonra tekrar deneyin!'
                        });
                        break;
                    }
                }

                if (flag == 1 && book_id != null) {

                    var sql = "UPDATE books SET status = ? WHERE id = ?;" +
                        "UPDATE users SET totalbook = ? WHERE id = ?;" +
                        "INSERT INTO books_info (username,bookname,date) VALUES (?, ? ,?)";

                    connection.query(sql, [1, book_id, req.user.totalbook + 1, user_id, user_id, book_id, date.today],
                        function(err, result) {
                            if (err) throw err;
                            if (result.length == 0) {
                                res.render('user', { message: 'Hata!' });
                                res.end();
                            }
                            res.render('user', { message: 'Kitap Alındı!' });

                        });
                }
            }
        });
    }

}

module.exports.givebook = function(req, res) {
    this.req = req;
    this.res = res;
    this.giveBook = function(isbn, user_id, totalBook) {

        if (isbn) {
            connection.query('SELECT * FROM books WHERE isbnnumber = ?', [isbn], function(err, results) {
                if (err) throw err;
                if (results.length == 0) {
                    console.log('Bu isbn numarasına kayıtlı kitap bulunmamaktadır.');
                    res.render('user', { message: 'Bu isbn numarasına kayıtlı kitap bulunmamaktadır.' });
                    res.end();
                } else if (results.length > 0) {
                    console.log("isbn:" + results[0].isbnnumber);
                    connection.query('SELECT * FROM books_info WHERE bookname = ? AND username = ?', [results[0].id, user_id], function(err, result) {
                        console.log("Book id:" + results[0].id + " user id:" + user_id);
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

function checkDate(newDate) {
    var rdd = parseInt(newDate.substring(0, 2)); // r:record
    var rmm = parseInt(newDate.substring(3, 5));
    var ryyyy = parseInt(newDate.substring(6, 10));


    console.log('Now Date:' + (date.tdd) + " " + (rdd));


    /*var resultDay = (rdd) - parseInt(date.tdd);
    var resultMonth = (rmm) - parseInt(date.tmm);
    var resultYear = (ryyyy) - parseInt(date.tyyyy);
    console.log("Res:" + result);*/

    if (ryyyy == parseInt(date.tyyyy)) {
        var result1 = totalDay(rdd, rmm, ryyyy);
        var result2 = totalDay(date.tdd, date.tmm, date.tyyyy);
        var result = result2 - result1;
        console.log("Res:" + result);
        if (result > 7)
            return 0;
    }

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

    return { today: today, tdd: tdd, tmm: tmm, tyyyy: tyyyy };
}

function totalDay(day, month, year) {
    var sum = 0;
    var daysNumber = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    for (var i = 0; i < month - 1; i++) {
        sum += daysNumber[i];
    }
    return day + sum;
}