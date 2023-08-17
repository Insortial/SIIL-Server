const fetch = require('node-fetch');
const { Headers } = fetch;
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
        newBadges.forEach(async (badge) => {
            let myHeaders = new Headers();
            myHeaders.append("Authorization", `Bearer ${token}`);

            var requestOptions = {
                method: 'GET',
                headers: myHeaders,
                redirect: 'follow'
            };
            promises.push(fetch(`https://api.badgr.io/v2/badgeclasses/${badge.entityId}/assertions`, requestOptions).then(response => response.json()))
        })

        let responses = await Promise.all(promises)
        /* .then((response) => {
            response.map(async (instance) => {
                let userFound = false;
                let testIns = await instance.json()
                testIns.result?.map((badge) => {
                    if(badge.recipient.plaintextIdentity === email) {
                        newBadges.forEach((badgeClass) => {
                            if(badgeClass.entityId === badge.badgeclass)
                            {
                                console.log("WORKING")
                                badgeClass.finished = true
                            }
                        })
                    } 
                })
            })
            console.log(newBadges)
        }) */
        .catch(error => console.log(error.message))

        responses.map((instance) => {
            let userFound = false;
            console.log(instance)
            instance.result?.map((badge) => {
                if(badge.recipient.plaintextIdentity === email) {
                    newBadges.forEach((badgeClass) => {
                        if(badgeClass.entityId === badge.badgeclass)
                        {
                            console.log("WORKING")
                            badgeClass.finished = true
                        }
                    })
                } 
            })
        })

        console.log(newBadges)

        return newBadges

}

/**
 * @route   GET api/certifications
 * @desc    Get the certifications for the person associated with a given id.
 * @access  Private
 */
router.get('/:email', authenticate, async (req, res) => {
    console.log("REQUEST TOKEN " + req.token)
    var myHeaders = new Headers();
    myHeaders.append("Authorization", `Bearer ${req.token}`);

    var requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow'
    };

    fetch(`https://api.badgr.io/v2/issuers/${process.env.BADGR_ISSUER}/badgeclasses`, requestOptions)
        .then(response => response.json())
        .then(async (response) => {
            let badges = updateBadgeState(response.result);
            const user = await User.find({ email: req.params.email });
            console.log(user)
            if (user.length != 0) {
                badges = await getBadgeStatus(badges, req.params.email, req.token)
                console.log(badges)
                res.json({
                    name: `${user[0].firstName} ${user[0].lastName}`,
                    badges: badges
                })
            } else {
                res.status(404).json({
                    message: "User doesn't exist in the database.",
                    success: false
                });
            }
        })
        .catch(error => {
            console.log("FAILED!!!!!")
            console.log(error.message);
        });
})


module.exports = router;