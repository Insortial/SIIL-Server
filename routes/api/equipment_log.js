const express = require("express");
require('dotenv').config();
const EquipmentLog = require("../../models/equipment_log");
const router = express.Router();
const { authenticate } = require("../../middleware/authenticateToken");

/**
 * @route   GET api/equipment-log/:location
 * @desc    Returns a list of equipment in use, depending on location
 * @access  Private
 */
router.get("/:location", authenticate, async (req, res) => {
    try {
        const equipmentList = await EquipmentLog.find({ location: req.params.location });
        res.status(300).json({
            success: true,
            list: equipmentList
        })
    } catch(error) {

    }
})

/**
 * @route   DELETE api/equipment-log/{id}
 * @desc    Deletes equipment log, additionally returns the date of the equipment logs
 * @access  Private
 */
 router.delete("/:id", authenticate, async (req, res) => {
    try {
        const log = await EquipmentLog.findOne({ id: req.params.id })
        let checkOut = log.checkOut;
        EquipmentLog.deleteOne({ id: req.params.id }, function(err, obj) {
            if (err) throw err;
            console.log("1 document deleted");
            console.log(obj)
        })

        res.status(300).json({
            success: true,
            checkOut: checkOut
        })
    } catch(error) {

    }
})

/**
 * @route   POST api/equipment-log
 * @desc    Creates an equipment log of what is being checked out.
 * @access  Private
*/
router.post("/", authenticate, async (req, res) => {
    const { email, id, type, location, } = req.body;

    EquipmentLog.create({
        email: email,
        id: id,
        type: type,
        location: location
    })

    res.status(200).json({
        success: true
    });
})

module.exports = router;
