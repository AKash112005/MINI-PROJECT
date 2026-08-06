const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");
const monitoringController = require("../controllers/monitoring.controller");

router.get("/cpu", authMiddleware, monitoringController.getCPUUsage);

module.exports = router;