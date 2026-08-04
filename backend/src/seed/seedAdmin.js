require("dotenv").config();

console.log("Step 1: Environment Loaded");

const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

const connectDB = require("../config/db");
const User = require("../models/User");

console.log("Step 2: Modules Loaded");

const seedAdmin = async () => {
    try {
        console.log("Step 3: Connecting to MongoDB...");
        await connectDB();

        console.log("Step 4: Connected");

        const existingAdmin = await User.findOne({
            email: "admin@cloudwatchx.com",
        });
        console.log(existingAdmin);
        console.log("Step 5: Checked Existing Admin");

        if (existingAdmin) {
            console.log("Admin already exists.");
            process.exit(0);
        }

        const hashedPassword = await bcrypt.hash("Cloud@2026", 10);

        console.log("Step 6: Password Hashed");

        await User.create({
            name: "System Administrator",
            email: "admin@cloudwatchx.com",
            password: hashedPassword,
            role: "admin",
        });

        console.log("Step 7: Admin Created");

    } catch (error) {
        console.error(error);
    } finally {
        await mongoose.connection.close();
        process.exit();
    }
};

seedAdmin();