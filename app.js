const express = require("express");
const userRoutes = require("./routes/userRoutes"); // User routes
const { globalErrorHandler } = require("./utils/errorHandler"); // Global error handler
const cors = require("cors"); // CORS for handling cross-origin requests

const app = express();

// Middleware
app.use(cors()); // Enable CORS for all routes (you can configure it further if needed)
app.use(express.json()); // Parse JSON request bodies

// Routes
app.use("/api/users", userRoutes); // Mount user routes

// Error Handling
app.use(globalErrorHandler); // Handle errors globally

module.exports = app;
