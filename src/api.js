require('dotenv').config();
const express = require('express');
const serverless = require('serverless-http');
const app = express();
const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;
const router = express.Router();
const multer = require('multer');
const fs = require('fs');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads')
    },
    filename: function (req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now())
    }
})  
const upload = multer({ storage: storage })


router.get('/', (req,res) => {
    res.sendFile(__dirname + "/index.html");
});

router.post('/uploadfile', upload.single('myFile'), (req, res, next) => {
    var request = require('request');
    var api_url = 'https://openapi.naver.com/v1/vision/celebrity'; // 유명인 인식
    var _formData = {
      image:'image',
      image: fs.createReadStream(req.file.path)
    };
  
    var _req = request.post({url:api_url, formData:_formData,
      headers: {'X-Naver-Client-Id':client_id, 'X-Naver-Client-Secret': client_secret}}).on('response', function(response) {
        fs.unlinkSync(req.file.path) //사진 삭제
    });
    _req.pipe(res); // 브라우저로 출력
})

app.use('/.netlify/functions/api',router);

module.exports.handler = serverless(app);