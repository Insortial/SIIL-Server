const mongoose = require("mongoose");

const equipmentLogSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    id: {
        type: String,
        required: true,
        unique: true
    },
    type: {
        type: String,
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    checkOut: {
        type: Date,
        default: Date.now
    },
});

module.exports = mongoose.model("EquipmentLog", equipmentLogSchema);