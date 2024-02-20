const express = require("express");
const jwt = require("jsonwebtoken");
const qs = require('qs');
const User = require("../../models/user");
const { authenticate } = require("../../middleware/authenticateToken");
const axios = require('axios');
const router = express.Router();
const logUserData = require("../../utils/logUserData")

const updateBadgeState = (badges) => {
    let newBadgeState = []
    badges.map((badge) => {
        newBadgeState.push({
            name: badge.name, 
            entityId: badge.entityId, 
            finished: false
        })
    })
    return newBadgeState;
}

const getBadgeStatus = async (badges, email, token) => {
    let newBadges = badges
    let promises = []
    let myHeaders = new Headers();
    myHeaders.append("Authorization", `Bearer ${token}`);

    var requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow'
    }
    let response = await fetch(`https://api.badgr.io/v2/issuers/5geX2ng3QfabACgKt6W0Hg/assertions?recipient=${email}`, requestOptions).then(response => response.json())
    newBadges.forEach(async (badge) => {
        
    
       
    })

    let responses = await Promise.all(promises)
    .catch(error => console.log(error.message))

    response.result.map((instance) => {
        let userFound = false;
        console.log(instance)
        if(instance.recipient.plaintextIdentity === email) {
            newBadges.forEach((badgeClass) => {
                if(badgeClass.entityId === instance.badgeclass)
                {
                    console.log("WORKING")
                    badgeClass.finished = true
                }
            })
        } 
    })

    console.log(newBadges)

    return newBadges

}

/**
 * @route   GET api/certifications
 * @desc    Get the certifications for the person associated with a given id.
 * @access  Private
 */
router.get('/:bid', authenticate, async (req, res) => {
    console.log("REQUEST TOKEN " + req.token)
    var myHeaders = new Headers();
    myHeaders.append("Authorization", `Bearer ${req.token}`);

    var requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow'
    };

    var cppHeaders = new Headers();
    cppHeaders.append("Content-Type", "application/json");
    cppHeaders.append("Authorization", "Bearer Y3BwaW5ub3ZsYWJAY2FscG9seXBvbW9uYS1XNkw1TjU6ZDZiNGZkOGEtN2NmOS00MjBkLWJlNGYtNDY4NTVhZTA1N2Ni");

    var raw = JSON.stringify({
        "broncoNumber": req.params.bid
    });

    var requestOptionsCPP = {
        method: 'POST',
        headers: cppHeaders,
        body: raw,
        redirect: 'follow'
    };

    Promise.all([ fetch(`https://api.badgr.io/v2/issuers/${process.env.BADGR_ISSUER}/badgeclasses`, requestOptions),
        fetch("https://api-test.cpp.edu:9093/ws/simple/getUserStatus", requestOptionsCPP)])
        .then(results => Promise.all(results.map(r => r.json())))
        .then(async results =>  {
            let badges = results[0]
            let userState = results[1]
            console.log(userState.userStatus)
            let badgeState = updateBadgeState(badges.result);
            const userResponse = await User.find({ email: userState.userStatus[0].email });
            if (userResponse.length != 0) {
                badges = await getBadgeStatus(badgeState, userState.userStatus[0].email, req.token)
                console.log(badges)
                res.json({
                    name: `${userResponse[0].firstName} ${userResponse[0].lastName}`,
                    badges: badges
                })
            } else if (userState.userStatus.length == 1){
                badges = await getBadgeStatus(badgeState, userState.userStatus[0].email, req.token)
                console.log(badges)
                res.json({
                    name: `${userState.userStatus[0].name.split(" ")[0]} ${userState.userStatus[0].name.split(" ")[1]}`,
                    badges: badges
                })
            } else {
                res.status(404).json({
                    message: "User doesn't exist in the database.",
                    success: false
                });
            }
    }).catch(error => {
        console.log(error)
    })

})


module.exports = router;