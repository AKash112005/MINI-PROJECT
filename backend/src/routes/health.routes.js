const express = require("express");

const router = express.Router();

router.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "CloudWatchX Backend is running successfully 🚀",
        version: "1.0.0",
        timestamp: new Date().toISOString()
    });
});

module.exports = router;