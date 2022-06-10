require('dotenv').config();
const express = require('express');
const cors = require("cors");
const app = express();
const auth = require("./routes/api/authentication");
const cert = require("./routes/api/certifications");
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
require('dotenv/config');

const posts = [
    {
        username: 'Kyle',
        title: 'Post 1'
    },
    {
        username: 'Mark',
        title: 'Post 2'
    }
]

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