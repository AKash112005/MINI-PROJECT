const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const authMiddleware = require("../middleware/auth.middleware");
router.post("/login", authController.login);
router.get("/test", (req, res) => {
    res.json({
        success: true,
        message: "Authentication Route Working"
    });
});
router.get("/profile", authMiddleware, (req, res) => {

    res.json({
        success: true,
        message: "Protected Route",
        data: req.user
    });

});

module.exports = router;