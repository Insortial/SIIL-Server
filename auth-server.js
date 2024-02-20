require('dotenv').config();
const express = require('express');
const schedule = require('node-schedule');
const bcrypt = require("bcryptjs");
const cors = require("cors");
const app = express();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('./models/user');
const Token = require('./models/refresh_token');
const nodemailer = require("nodemailer");
const cookieParser = require("cookie-parser");
const timestampToObjectId = require('./utils/timestampToObjectId');
require('dotenv/config');

//Middlewares
app.use(cors({
    credentials: true,
    origin: ['http://localhost:3001', 'http://localhost:3000']
}));
app.use(express.json());
app.use(cookieParser());

mongoose.connect(
    process.env.DB_CONNECTION, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }).then(() => {
    console.log('Connected to DB');
    console.log(mongoose.connection.readyState);
});

app.post("/token", async (req, res) => {
    console.log(req.headers.cookie)
    const cookies = req.cookies
    if (!cookies?.jwt) return res.sendStatus(401);
    const refreshToken = cookies.jwt;
    const token = await Token.findOne({ token: refreshToken});
    if(token == null) return res.sendStatus(403)
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        const accessToken = generateAccessToken({email: user.email});
        res.status(200).json({
            accessToken: accessToken,
            success: true
        });
    })
    
})

app.post("/register", async (req, res) => {
    const { broncoID, password } = req.body;
    try {
        var cppHeaders = new Headers();
        cppHeaders.append("Content-Type", "application/json");
        cppHeaders.append("Authorization", "Bearer " + process.env.CPP_TOKEN);

        var raw = JSON.stringify({
            "broncoNumber": broncoID
        });
    
        var requestOptionsCPP = {
            method: 'POST',
            headers: cppHeaders,
            body: raw,
            redirect: 'follow'
        };

        let response = await fetch("https://api-test.cpp.edu:9093/ws/simple/getUserStatus", requestOptionsCPP)
                                .then(result => {return result.json()})
        
        if(response.userStatus.length == 0) return res.status(500).json({
            message: "Bronco ID not valid",
            success: false
        })
        const salt = await bcrypt.genSalt(10);
        if (!salt) throw Error("Failed to generate salt.");
        const hashedPassword = await bcrypt.hash(password, salt);
        console.log(hashedPassword);
        if (!hashedPassword) throw Error("Failed to hash password.");
        const user = await User.create({
            broncoID: broncoID,
            password: hashedPassword,
            role: "Student"
        });

        const payload = {
            email: user.email
        }

        const accessToken = generateAccessToken(payload);
        const refreshToken =  jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "1d"})
        
        res.status(200).json({
            accessToken: accessToken,
            refreshToken: refreshToken,
            success: true
        });
    } catch(error) {
        res.status(400).json({
            message: error.message,
            success: false
        })
    }
});

app.post('/login', async (req, res) => {
    //Authenticate user
    const email = req.body.username;
    const password = req.body.password;
    const user = await User.findOne({ email: email })
    console.log(user)
    bcrypt.compare(password, user.password, function(err, isValid) {
        if(err) {
            res.status(400).json({
                message: error.message,
                success: false
            })
        }

        if(isValid) {
            const payload = {
                email: user.email
            }
        
            const accessToken = generateAccessToken(payload);
            const refreshToken =  jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "1d"})
            Token.create({
                user: user.broncoID,
                token: refreshToken,
                expires: "1d",
            })
            res.cookie('jwt', refreshToken, {httpOnly: true, maxAge: 24 * 60 * 60 * 1000})
            res.status(200).json({
                accessToken: accessToken,
                success: true
            });
        } else {
            res.status(401).json({
                success: false, 
                message: 'passwords do not match'
            });
        }
    })
    //res.json({ accessToken: token }) Response to user
})

function generateAccessToken(payload) {
    return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m"});
}

app.listen(4000);