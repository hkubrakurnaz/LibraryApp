const fs = require('fs');
var Tesseract = require('tesseract.js');
const multer = require('multer');
var userController = require('../controller/userController');
var adminController = require('../controller/adminController');

//https://github.com/abhishek-butola/node-tesseractjs-ocr
module.exports.upload = function(req, res, err) {

    var userCont = new userController.givebook(req, res);
    var adminCont = new adminController.addBook(req, res);
    var Storage = multer.diskStorage({
        destination: (req, file, callback) => {
            callback(null, __dirname + '/images');
        },
        filename: (req, file, callback) => {
            callback(null, file.originalname);
        }
    });

    var upload = multer({
        storage: Storage
    }).single('image');

    console.log(req.file);
    upload(req, res, err => {
        if (err) {
            console.log(err);
            return res.send('Something went wrong');
        }

        var image = fs.readFileSync(
            __dirname + '/images/' + req.file.originalname, {
                encoding: null
            }
        );
        Tesseract.recognize(image)
            .progress(function(p) {
                console.log('progress', p);
            })
            .then(function(result) {
                var str = result.text;

                if (req.user.status == "user") {
                    userCont.giveBook(str, req.user.id, req.user.totalbook);
                } else if (req.user.status == "admin") {
                    console.log('User id:' + req.body.bookname);
                    adminCont.addBook(req.body.bookname, str);
                }

            });

    });

}