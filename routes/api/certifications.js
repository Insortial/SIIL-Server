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

const getBadgeStatus = async (badges, user, token) => {
    let newBadges = badges
        let promises = []
        newBadges.forEach((badge) => {
            var config = {
                method: 'get',
                url: `https://api.badgr.io/v2/badgeclasses/${badge.entityId}/assertions`,
                headers: { 
                  'Authorization': `Bearer ${token}`
                }
            };
    
            promises.push(axios(config))
        })

        await Promise.all(promises).then(async (response) => {
            response.forEach((instance) => {
                let userFound = false;
                instance.data.result.forEach((badge) => {
                    if(badge.recipient.plaintextIdentity === user[0].email) {
                        newBadges.forEach((badgeClass) => {
                            if(badgeClass.entityId === badge.badgeclass)
                            {
                                console.log("WORKING")
                                badgeClass.finished = true
                            }
                        })
                    } 
                    //console.log(userFound + " " + badge.badgeclass)
                })
            })
        })

        return newBadges
}

/**
 * @route   GET api/auth/login
 * @desc    Get the certifications for the person associated with a given id.
 * @access  Private
 */
router.get('/:id', authenticate, async (req, res) => {
    console.log(req.token)
    var config = {
        method: 'get',
        url: 'https://api.badgr.io/v2/badgeclasses',
        headers: { 
          'Authorization': `Bearer ${req.token}`
        }
    };

    axios(config)
    .then(async (response) => {
        let badges = updateBadgeState(response.data.result);
        const user = await User.find({ broncoID: req.params.id });
        console.log(user)
        if (user.length != 0) {
            badges = await getBadgeStatus(badges, user, req.token)
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
    .catch(function (error) {
        console.log("FAILED!!!!!")
        console.log(error);
    });
})

module.exports = router;