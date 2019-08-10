require('dotenv').config();
const express = require('express');
const serverless = require('serverless-http');
const app = express();
const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const storage = multer.memoryStorage();
const upload = multer({ storage });

// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//       cb(null, 'uploads')
//     },
//     filename: function (req, file, cb) {
//       cb(null, file.fieldname + '-' + Date.now())
//     }
// })  
// const upload = multer({ storage: storage })
router.get('/', (req,res) => {
    var someHTML = `<form action="/.netlify/functions/api/uploadfile" enctype="multipart/form-data" method="POST"> 
    <input type="file" name="myFile" />
    <input type="submit" value="Upload a file"/>
</form>`
    res.set('Content-Type', 'text/html');
    res.end(someHTML);
});

router.post('/uploadfile', upload.single('image'), (req, res, next) => {
    var request = require('request');
    var api_url = 'https://openapi.naver.com/v1/vision/celebrity'; // 유명인 인식

    var image = req.file
    const params = {
        Image: {
            Bytes: image.buffer
        }
    }
    var _formData = {
        image:'image',
        image: params
    };

    var _req = request.post({url:api_url, formData:_formData,
        headers: {'X-Naver-Client-Id':client_id, 'X-Naver-Client-Secret': client_secret}}).on('response', function(response) {
          //fs.unlinkSync(req.file.path) //사진 삭제
      });

    _req.pipe(res); // 브라우저로 출력
})

app.use('/.netlify/functions/api',router);

module.exports.handler = serverless(app, {
    binary: ['image/png', 'image/jpeg']
})