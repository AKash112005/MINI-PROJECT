const express = require("express");

const router = express.Router();

const endpointController = require("../controllers/endpoint.controller");
const authMiddleware = require("../middleware/auth.middleware");

// Create Endpoint
router.post("/", authMiddleware, endpointController.createEndpoint);

// Get All Endpoints
router.get("/", authMiddleware, endpointController.getAllEndpoints);

module.exports = router;