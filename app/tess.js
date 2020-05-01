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
        Tesseract.maximumRecognitionTime = 2.0;
        Tesseract.recognize(image)
            .progress(function(p) {
                console.log('progress', p);
            })
            .then(function(result) {
                var str = result.text;

                console.log(str);

                //var pos = str.search("ISBN");
                //var res = str.slice(pos + 5, pos + 22);
                var res = str.split('\n')[0];
                if (res.includes("ISBN")) {
                    res = res.replace("ISBN", "");
                }
                console.log("Res:" + res);

                if (req.user.status == "user") {
                    userCont.giveBook(res, req.user.id, req.user.totalbook);
                } else if (req.user.status == "admin") {
                    console.log('Book id:' + req.body.bookname);
                    adminCont.addBook(req.body.bookname, res);
                }

            });

    });

}