const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    broncoID: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    role: {
        type: String, 
        required: true
    },
    remainingPrinthours: {
        type: Number,
        default: 30
    }
});

module.exports = mongoose.model("User", userSchema);