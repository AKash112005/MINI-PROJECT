const mongoose = require("mongoose");

const alertSchema = new mongoose.Schema(
    {
        serverName: {
            type: String,
            required: true,
            trim: true,
        },

        metric: {
            type: String,
            required: true,
            enum: ["CPU", "Memory", "Disk", "Network"],
        },

        value: {
            type: Number,
            required: true,
        },

        severity: {
            type: String,
            required: true,
            enum: ["Warning", "Critical"],
        },

        message: {
            type: String,
            required: true,
            trim: true,
        },

        status: {
            type: String,
            enum: ["Active", "Resolved"],
            default: "Active",
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Alert", alertSchema);