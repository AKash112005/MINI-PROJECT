const Endpoint = require("../models/Endpoint");

// Create Endpoint
const createEndpoint = async (endpointData) => {
    return await Endpoint.create(endpointData);
};

// Get All Endpoints
const getAllEndpoints = async (userId) => {
    return await Endpoint.find({ createdBy: userId });
};

// Get Single Endpoint
const getEndpointById = async (id, userId) => {
    return await Endpoint.findOne({
        _id: id,
        createdBy: userId,
    });
};

// Update Endpoint
const updateEndpoint = async (id, userId, data) => {
    return await Endpoint.findOneAndUpdate(
        {
            _id: id,
            createdBy: userId,
        },
        data,
        {
            new: true,
        }
    );
};

// Delete Endpoint
const deleteEndpoint = async (id, userId) => {
    return await Endpoint.findOneAndDelete({
        _id: id,
        createdBy: userId,
    });
};

module.exports = {
    createEndpoint,
    getAllEndpoints,
    getEndpointById,
    updateEndpoint,
    deleteEndpoint,
};