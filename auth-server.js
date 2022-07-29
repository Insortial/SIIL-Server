require('dotenv').config();
const express = require('express');
const schedule = require('node-schedule');
const bcrypt = require("bcryptjs");
const cors = require("cors");
const app = express();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('./models/user');
const nodemailer = require("nodemailer");
const timestampToObjectId = require('./utils/timestampToObjectId');
require('dotenv/config');

//Middlewares
app.use(cors());
app.use(express.json());

mongoose.connect(
    process.env.DB_CONNECTION, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }).then(() => {
    console.log('Connected to DB');
    console.log(mongoose.connection.readyState);
});


app.post("/register", async (req, res) => {
    const { email, password, firstName, lastName, broncoID } = req.body;
    try {
        const salt = await bcrypt.genSalt(10);
        if (!salt) throw Error("Failed to generate salt.");
        const hashedPassword = await bcrypt.hash(password, salt);
        console.log(hashedPassword);
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
            const refreshToken =  jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET)
        
            res.status(200).json({
                accessToken: accessToken,
                refreshToken: refreshToken,
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