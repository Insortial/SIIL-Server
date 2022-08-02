let userInfo = require("../sharedData/userInfo")

function logUserSignIn(user) {
    const now = new Date();
    const current = now.getHours() + ':' + now.getMinutes();
    userInfo.signIns.push({email: user.email, name: `${user.firstName} ${user.lastName}`, time: current})
}

function logNewUser(user) {
    userInfo.newUsers.push({email: user.email})
}

module.exports.logUserSignIn = logUserSignIn;
module.exports.logNewUser = logNewUser;