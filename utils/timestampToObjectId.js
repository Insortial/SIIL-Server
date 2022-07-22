var ObjectId = require('mongodb').ObjectId;

function timestampToObjectId(timestamp) {
    let hexSeconds = Math.floor(timestamp/1000).toString(16);
    let constructedObjectId = ObjectId(hexSeconds + "0000000000000000");

    return constructedObjectId
}

module.exports = timestampToObjectId;