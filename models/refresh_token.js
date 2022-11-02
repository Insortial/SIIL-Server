const mongoose = require('mongoose');
const User = require('./user');

const refreshSchema = new mongoose.Schema({
    user: {
        type: String, 
        ref: 'User',
        required: true
    },
    token: {
        type: String,
        required: true
    },
    expires: {
        type: String,
        required: true
    },
    created: {
        type: Date,
        default: Date.now
    },
})

module.exports = mongoose.model("Token", refreshSchema);
