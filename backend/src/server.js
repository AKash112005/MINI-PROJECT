// require("dotenv").config();

// const app = require("./app");
// const connectDB = require("./config/db");

// const PORT = process.env.PORT || 5000;

// const startServer = async () => {
//     try {
//         // Connect Database
//         await connectDB();

//         // Start Server
//         app.listen(PORT, () => {
//             console.log("=================================");
//             console.log(" CloudWatchX Backend Started");
//             console.log("=================================");
//             console.log(` Server running on Port ${PORT}`);
//             console.log(` Health Check: http://localhost:${PORT}/api/health`);
//         });
//     } catch (error) {
//         console.error("Server Failed to Start");
//         console.error(error.message);
//     }
// };

// startServer();

require("dotenv").config();

console.log("Step 1: Environment Loaded");

const app = require("./app");
console.log("Step 2: App Loaded");

const connectDB = require("./config/db");
console.log("Step 3: DB Module Loaded");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        console.log("Step 4: Connecting to MongoDB...");
        await connectDB();

        console.log("Step 5: Starting Express Server...");

        app.listen(PORT, () => {
            console.log("=================================");
            console.log("CloudWatchX Backend Started");
            console.log("=================================");
            console.log(`Server running on Port ${PORT}`);
        });
    } catch (error) {
        console.error(error);
    }
};

startServer();