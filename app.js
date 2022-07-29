require('dotenv').config();
const express = require('express');
const schedule = require('node-schedule')
const cors = require("cors");
const app = express();
const auth = require("./routes/api/authentication");
const cert = require("./routes/api/certifications");
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('./models/user');
const nodemailer = require("nodemailer");
const { retrieveToken, authenticate } = require("./middleware/authenticateToken")
const timestampToObjectId = require('./utils/timestampToObjectId');
require('dotenv/config');

const job = schedule.scheduleJob('0 18 * * * *', function() {
    let users = require("./sharedData/userInfo")
    console.log(users);
});

retrieveToken()
job.schedule()

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD
    }
});



async function findToday () {
    const signIns = await User.find({ _id: {$gt: timestampToObjectId(Date.now() - 86400000), $lt: timestampToObjectId(Date.now())} })
    if(signIns.length != 0)
    {
        let emailBody = ""
        for(let userCount = 0; userCount < signIns.length; userCount++)
        {
            if(userCount != signIns.length - 1)
            {
                emailBody += `${signIns[userCount].email}, `
            } else
            {
                emailBody += `${signIns[userCount].email}`
            }
        }

        var mailOptions = {
            from: process.env.EMAIL,
            to: "renwell2099@gmail.com",
            subject: "Recently added emails",
            text: emailBody
        };

        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log(error);
            } else {
              console.log('Email sent: ' + info.response);
            }
        });
    }
    console.log(signIns)
}

//findToday()

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

app.use("/auth", auth);
app.use("/cert", cert);

app.listen(3000);