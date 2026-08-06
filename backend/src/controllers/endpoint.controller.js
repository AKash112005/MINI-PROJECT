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
const getEndpointById = async (req, res) => {
    try {

        const endpoint = await endpointService.getEndpointById(
            req.params.id,
            req.user.id
        );

        if (!endpoint) {
            return res.status(404).json({
                success: false,
                message: "Endpoint not found.",
                data: null,
            });
        }

        res.json({
            success: true,
            message: "Endpoint fetched successfully.",
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

const updateEndpoint = async (req, res) => {
    try {

        const endpoint = await endpointService.updateEndpoint(
            req.params.id,
            req.user.id,
            req.body
        );

        if (!endpoint) {
            return res.status(404).json({
                success: false,
                message: "Endpoint not found.",
                data: null,
            });
        }

        res.json({
            success: true,
            message: "Endpoint updated successfully.",
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

const deleteEndpoint = async (req, res) => {
    try {

        const endpoint = await endpointService.deleteEndpoint(
            req.params.id,
            req.user.id
        );

        if (!endpoint) {
            return res.status(404).json({
                success: false,
                message: "Endpoint not found.",
                data: null,
            });
        }

        res.json({
            success: true,
            message: "Endpoint deleted successfully.",
            data: null,
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
    getEndpointById,
    updateEndpoint,
    deleteEndpoint,
};