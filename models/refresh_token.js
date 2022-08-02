const mongoose = require('mongoose');

const refreshSchema = new mongoose.Schema({
    user: {
        type: Schema.Types.ObjectId, 
        ref: 'User',
        required: true
    },
    token: {
        type: String,
        required: true
    },
    expires: {
        type: Date,
        required: true
    },
    created: {
        type: Date,
        default: Date.now
    },
})

module.exports = mongoose.model("Token", userSchema);
