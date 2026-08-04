const authService = require("../services/auth.service");

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const result = await authService.login(email, password);

        res.status(200).json({
            success: true,
            message: "Login Successful",
            data: result,
        });
    } catch (error) {
        res.status(401).json({
            success: false,
            message: error.message,
        });
    }
};

module.exports = {
    login,
};