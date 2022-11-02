const mongoose = require("mongoose");

const equipmentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    cardID: {
        type: String,
        required: true,
        unique: true
    },
    type: {
        type: String,
        required: true,
    },
    identifier: {
        type: String,
        required: true,
    },
    inUse: {
        type: Boolean,
        default: false
    },
    location: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now
    },
});

module.exports = mongoose.model("Equipment", equipmentSchema);