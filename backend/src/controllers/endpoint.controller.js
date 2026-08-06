const endpointService = require("../services/endpoint.service");

const createEndpoint = async (req, res) => {

    try {

        const endpoint = await endpointService.createEndpoint({
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

const getAllEndpoints = async (req, res) => {

    try {

        const endpoints = await endpointService.getAllEndpoints(req.user.id);

        res.status(200).json({
            success: true,
            message: "Endpoints fetched successfully.",
            data: endpoints,
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message,
            data: null,
        });

    }

};

module.exports = {
    createEndpoint,
    getAllEndpoints,
};