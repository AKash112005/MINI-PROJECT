const express = require("express");

const router = express.Router();

const endpointController = require("../controllers/endpoint.controller");
const authMiddleware = require("../middleware/auth.middleware");

// Create Endpoint
router.post("/", authMiddleware, endpointController.createEndpoint);

// Get All Endpoints
router.get("/", authMiddleware, endpointController.getAllEndpoints);
// Get Single Endpoint
router.get("/:id", authMiddleware, endpointController.getEndpointById);

// Update Endpoint
router.put("/:id", authMiddleware, endpointController.updateEndpoint);

// Delete Endpoint
router.delete("/:id", authMiddleware, endpointController.deleteEndpoint);
module.exports = router;