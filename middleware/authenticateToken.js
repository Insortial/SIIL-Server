const axios = require("axios");
require('dotenv').config();
const jwt = require("jsonwebtoken");
var qs = require('qs');
let access_token;
console.log(access_token)

const retrieveAccessToken = async () => {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

    var urlencoded = new URLSearchParams();
    urlencoded.append("username", process.env.BADGR_EMAIL);
    urlencoded.append("password", process.env.BADGR_PASSWORD);

    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: urlencoded,
        redirect: 'follow'
    };

    fetch("https://api.badgr.io/o/token", requestOptions)
        .then(response => response.json())
        .then(result => {
            console.log(result)
            access_token = result.access_token
            return result.access_token
        })
        .catch(error => console.log('error', error));
}

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]
    if(token == null) return res.sendStatus(401)

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(401)
        console.log("Verified")
        
        req.user = user;
        req.token = access_token
        next()
    })
}

exports.retrieveToken = retrieveAccessToken;
exports.authenticate = authenticateToken;