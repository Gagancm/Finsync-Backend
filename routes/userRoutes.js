const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

// Public routes
router.get("/", userController.getAllUsers);  // Route to get all users
router.post("/", userController.createUser); // Route to create a new user
router.post("/login", userController.loginUser); // Route for login and JWT token generation

// Routes without authentication (no JWT verification required)
router.get("/:userID", userController.getUserById); // Get user by ID
router.put("/:userID", userController.updateUser);  // Update user
router.delete("/:userID", userController.deleteUser); // Delete user

module.exports = router;
