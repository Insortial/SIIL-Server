const express = require("express");
require('dotenv').config();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const qs = require('qs');
const User = require("../../models/user");
const axios = require('axios');
const router = express.Router();

router.post("/register", async (req, res) => {
    const { email, password, firstName, lastName, broncoID } = req.body;
    try {
        const salt = await bcrypt.genSalt(10);
        if (!salt) throw Error("Failed to generate salt.");
        const hashedPassword = await bcrypt.hash(password, salt);
        if (!hashedPassword) throw Error("Failed to hash password.");
        const user = await User.create({
            email: email,
            password: hashedPassword,
            firstName: firstName,
            lastName: lastName,
            broncoID: broncoID,
        });

        const payload = {
            id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            broncoID: user.broncoID
        }

        const token = jwt.sign(
            payload, 
            process.env.ACCESS_TOKEN_SECRET, 
            {expiresIn: "1d" }
        );

        res.status(200).json({
            token: token,
            refresh_token: 0,
            success: true
        });
    } catch(error) {
        res.status(400).json({
            message: error.message,
            success: false
        })
    }
});

router.post('/login', (req, res) => {
    //Authenticate user
    const username = req.body.username;
    const password = req.body.password;
    var data = qs.stringify({
        'username': username,
        'password': password 
    })
    var config = {
        method: 'post',
        url: 'https://api.badgr.io/o/token',
        headers: { 
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        data : data
    };

    axios(config)
    .then(function (response) {
        console.log(response.data.access_token);
        const token = response.data.access_token
        res.json({ accessToken: token })
    })
    .catch(function (error) {
        console.log(error);
    });
})

module.exports = router;
