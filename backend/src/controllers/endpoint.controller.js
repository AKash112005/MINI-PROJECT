const endpointService = require("../services/endpoint.service");
const prometheusService = require("../services/prometheus.service");


// =====================================================
// Create Endpoint
// =====================================================

const createEndpoint = async (req, res) => {

    try {

        const endpoint =
            await endpointService.createEndpoint({
                ...req.body,
                createdBy: req.user.id,
            });

        res.status(201).json({
            success: true,
            message: "Endpoint created successfully.",
            data: endpoint,
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message,
            data: null,
        });

    }

};


// =====================================================
// Get All Endpoints
// =====================================================

const getAllEndpoints = async (req, res) => {

    try {

        const endpoints =
            await endpointService.getAllEndpoints(
                req.user.id
            );


        // =================================================
        // Check Prometheus availability for every endpoint
        // =================================================

        const endpointsWithStatus =
            await Promise.all(

                endpoints.map(
                    async (endpoint) => {

                        const endpointObject =
                            endpoint.toObject();

                        try {

                            const isAvailable =
                                await prometheusService
                                    .checkServerAvailability(
                                        endpoint.serverName
                                    );

                            return {
                                ...endpointObject,
                                status:
                                    isAvailable
                                        ? "Online"
                                        : "Offline",
                            };

                        } catch (error) {

                            return {
                                ...endpointObject,
                                status: "Offline",
                            };

                        }

                    }
                )

            );


        res.status(200).json({

            success: true,

            message:
                "Endpoints fetched successfully.",

            data:
                endpointsWithStatus,

        });

    } catch (error) {

        res.status(500).json({

            success: false,

            message:
                error.message,

            data: null,

        });

    }

};


// =====================================================
// Get Endpoint By ID
// =====================================================

const getEndpointById = async (req, res) => {

    try {

        const endpoint =
            await endpointService.getEndpointById(
                req.params.id,
                req.user.id
            );


        if (!endpoint) {

            return res.status(404).json({

                success: false,

                message:
                    "Endpoint not found.",

                data: null,

            });

        }


        const endpointObject =
            endpoint.toObject();


        // ================================================
        // Check Prometheus availability
        // ================================================

        const isAvailable =
            await prometheusService
                .checkServerAvailability(
                    endpoint.serverName
                );


        endpointObject.status =
            isAvailable
                ? "Online"
                : "Offline";


        res.status(200).json({

            success: true,

            message:
                "Endpoint fetched successfully.",

            data:
                endpointObject,

        });

    } catch (error) {

        res.status(500).json({

            success: false,

            message:
                error.message,

            data: null,

        });

    }

};


// =====================================================
// Update Endpoint
// =====================================================

const updateEndpoint = async (req, res) => {

    try {

        const endpoint =
            await endpointService.updateEndpoint(
                req.params.id,
                req.user.id,
                req.body
            );


        if (!endpoint) {

            return res.status(404).json({

                success: false,

                message:
                    "Endpoint not found.",

                data: null,

            });

        }


        res.status(200).json({

            success: true,

            message:
                "Endpoint updated successfully.",

            data:
                endpoint,

        });

    } catch (error) {

        res.status(500).json({

            success: false,

            message:
                error.message,

            data: null,

        });

    }

};


// =====================================================
// Delete Endpoint
// =====================================================

const deleteEndpoint = async (req, res) => {

    try {

        const endpoint =
            await endpointService.deleteEndpoint(
                req.params.id,
                req.user.id
            );


        if (!endpoint) {

            return res.status(404).json({

                success: false,

                message:
                    "Endpoint not found.",

                data: null,

            });

        }


        res.status(200).json({

            success: true,

            message:
                "Endpoint deleted successfully.",

            data: null,

        });

    } catch (error) {

        res.status(500).json({

            success: false,

            message:
                error.message,

            data: null,

        });

    }

};


// =====================================================
// Export Controllers
// =====================================================

module.exports = {

    createEndpoint,

    getAllEndpoints,

    getEndpointById,

    updateEndpoint,

    deleteEndpoint,

};