
const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const cors = require("cors");

const authRoutes = require("./routes/auth");
const fileRoutes = require("./routes/fileRoute");

const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get("/", (req, res) => {
    res.status(200).json({
        message: "File Distribution System Backend is running!"
    });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/files", fileRoutes);

// Global error-handling middleware
// Keep this AFTER all routes.
app.use((err, req, res, next) => {

    console.error("ERROR:", err.message);

    // Handle Multer errors
    if (err.name === "MulterError") {

        if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(413).json({
                message: "File size exceeds the maximum allowed limit of 10 MB"
            });
        }

        return res.status(400).json({
            message: err.message
        });
    }

    // Handle other unexpected errors
    return res.status(500).json({
        message: "Internal server error"
    });
});


// Server configuration
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

// Connect to MongoDB before starting server
const startServer = async () => {
    try {
        if (!MONGO_URI) {
            throw new Error("MONGO_URI is missing in .env file");
        }

        await mongoose.connect(MONGO_URI, {
            dbName: "fileflow"
        });

        console.log("Connected database:", mongoose.connection.name);
console.log("Connected host:", mongoose.connection.host);

        console.log("MongoDB Atlas connected successfully to fileflow!");

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });

    } catch (error) {
        console.error("Server startup failed:", error.message);
        process.exit(1);
    }
};

startServer();
