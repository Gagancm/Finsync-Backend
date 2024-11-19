const express = require("express");
const userRoutes = require("./routes/userRoutes");
const { globalErrorHandler } = require("./utils/errorHandler");
const subscriptionRoutes = require("./routes/subscriptionRoutes");

const app = express();

// Middleware
app.use(express.json());

// Routes
app.use("/api/users", userRoutes);
app.use("/api/subscriptions", subscriptionRoutes);

// Error Handling
app.use(globalErrorHandler);

module.exports = app;
