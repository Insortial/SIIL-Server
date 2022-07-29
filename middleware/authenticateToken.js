const axios = require("axios");
require('dotenv').config();
const jwt = require("jsonwebtoken");
var qs = require('qs');
let access_token;
console.log(access_token)

const retrieveAccessToken = async () => {
    var data = qs.stringify({
        'username': process.env.BADGR_EMAIL,
        'password': process.env.BADGR_PASSWORD
    });
    var config = {
        method: 'post',
        url: 'https://api.badgr.io/o/token',
        headers: { 
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        data : data
    };
      
    access_token = await axios(config)
    .then(function (response) {
      return response.data.access_token;
    })
    .catch(function (error) {
      console.log(error);
    });
}

function authenticateToken(req, res, next) {
    console.log(access_token)
    var config = {
        method: 'get',
        url: 'https://api.badgr.io/v2/badgeclasses',
        headers: { 
          'Authorization': `Bearer ${access_token}`
        }
    };

    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if (token == null) return res.sendStatus(401)

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403)
        console.log("Verified")

        req.user = user;
        axios(config)
        .then(function (response) {
            req.token = access_token;
            next();
        })
        .catch(function (error) {
            console.log(error);
            return res.sendStatus(403)
        });
    })
}

exports.retrieveToken = retrieveAccessToken;
exports.authenticate = authenticateToken;