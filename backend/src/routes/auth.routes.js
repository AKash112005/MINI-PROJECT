const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
router.post("/login", authController.login);
router.get("/test", (req, res) => {
    res.json({
        success: true,
        message: "Authentication Route Working"
    });
});

module.exports = router;