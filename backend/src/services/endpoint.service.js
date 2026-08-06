const Endpoint = require("../models/Endpoint");

const createEndpoint = async (endpointData) => {

    const endpoint = await Endpoint.create(endpointData);

    return endpoint;

};

const getAllEndpoints = async (userId) => {

    return await Endpoint.find({ createdBy: userId });

};

module.exports = {
    createEndpoint,
    getAllEndpoints,
};