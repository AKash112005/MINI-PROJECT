require("dotenv").config();

const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        // Connect Database
        await connectDB();

        // Start Server
        app.listen(PORT, () => {
            console.log("=================================");
            console.log(" CloudWatchX Backend Started");
            console.log("=================================");
            console.log(` Server running on Port ${PORT}`);
            console.log(` Health Check: http://localhost:${PORT}/api/health`);
        });
    } catch (error) {
        console.error("Server Failed to Start");
        console.error(error.message);
    }
};

startServer();


