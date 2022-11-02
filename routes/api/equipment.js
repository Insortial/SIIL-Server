const express = require("express");
require('dotenv').config();
const jwt = require("jsonwebtoken");
const qs = require('qs');
const User = require("../../models/user");
const axios = require('axios');
const Equipment = require("../../models/equipment");
const { authenticate } = require("../../middleware/authenticateToken");
const EquipmentLog = require("../../models/equipment_log");
const router = express.Router();

/**
 * @route   GET api/equipment/:location
 * @desc    Returns a list of equipment, changes depending on location included
 * @access  Private
 */
 router.get("/:location", authenticate, async (req, res) => {
    try {
        const equipmentList = await Equipment.find({ location: req.params.location });
        res.status(200).json({
            success: true,
            list: equipmentList
        })
    } catch(error) {

    }
})

/**
 * @route   GET api/equipment/active/:location
 * @desc    Returns a list of equipment in use, changes depending on location included
 * @access  Private
 */
 router.get("/:location/active", authenticate, async (req, res) => {
    try {
        const equipmentList = await Equipment.find({ location: req.params.location, inUse: true });
        res.status(200).json({
            success: true,
            list: equipmentList
        })
    } catch(error) {

    }
})

/**
 * @route   GET api/equipment/inactive/:location
 * @desc    Returns a list of equipment not in use, changes depending on location included
 * @access  Private
 */
 router.get("/:location/inactive", authenticate, async (req, res) => {
    try {
        const equipmentList = await Equipment.find({ location: req.params.location, inUse: false });
        res.status(200).json({
            success: true,
            list: equipmentList
        })
    } catch(error) {
        res.status(400).json({
            error: error
        })
    }
})

/**
 * @route   PATCH api/equipment/{id}
 * @desc    Changes the inUse property of the piece of equipment.
 * @access  Private
 */
 router.patch("/:id", authenticate, async (req, res) => {
    const { inUse } = req.body;
    const data = {inUse: inUse};
    console.log(req.params.id)
    Equipment.updateOne({cardID: req.params.id}, data, (err , collection) => {
        if(err) throw err;
        console.log("Record updated successfully");
        console.log(collection);
    });
    res.status(200).json({
        success: true,
    });
})

/**
 * @route   POST api/equipment/
 * @desc    Create new documentation on a piece of equipment 
 * @access  Private
 */
router.post("/", authenticate, async (req, res) => {
    const { name, cardID, type, location, identifier } = req.body;
    try {
        Equipment.create({
            name: name,
            cardID: cardID,
            type: type,
            identifier: identifier,
            location: location,
        })
    } catch(error) {
        res.status(400).json({
            error: error
        })
    }
    

    res.status(200).json({
        success: true
    });
});

module.exports = router;
