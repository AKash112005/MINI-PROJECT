const mongoose = require("mongoose");

const endpointSchema = new mongoose.Schema(
    {
        serverName: {
            type: String,
            required: true,
            trim: true,
        },

        ipAddress: {
            type: String,
            required: true,
            trim: true,
        },

        operatingSystem: {
            type: String,
            required: true,
            enum: ["Ubuntu", "Amazon Linux", "Windows", "CentOS", "Debian"],
        },

        cloudProvider: {
            type: String,
            required: true,
            enum: ["AWS", "Azure", "GCP", "Local"],
        },

        region: {
            type: String,
            required: true,
        },

        instanceType: {
            type: String,
            required: true,
        },

        status: {
            type: String,
            enum: ["Online", "Offline"],
            default: "Offline",
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Endpoint", endpointSchema);