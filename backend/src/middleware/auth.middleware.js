const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        // Check whether Authorization header exists
        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: "Authorization token is required.",
                data: null,
            });
        }

        // Expected format: Bearer <token>
        const parts = authHeader.split(" ");

        if (parts.length !== 2 || parts[0] !== "Bearer") {
            return res.status(401).json({
                success: false,
                message: "Invalid authorization format.",
                data: null,
            });
        }

        const token = parts[1];

        // Verify JWT
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // Make authenticated user available to controllers/routes
        req.user = decoded;

        next();
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                success: false,
                message: "Token has expired. Please login again.",
                data: null,
            });
        }

        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({
                success: false,
                message: "Invalid authentication token.",
                data: null,
            });
        }

        return res.status(401).json({
            success: false,
            message: "Authentication failed.",
            data: null,
        });
    }
};

module.exports = authMiddleware;