const userModel = require("../models/userModel");
const bcrypt = require('bcryptjs'); // For password comparison
const jwt = require('jsonwebtoken'); // For generating JWT tokens

// Get all users
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await userModel.getAllUsers();
    res.status(200).json(users);
  } catch (err) {
    next(err); 
  }
};

// Create new user with hashed password
exports.createUser = async (req, res, next) => {
  try {
    const userData = req.body;
    const newUser = await userModel.createUser(userData);
    res.status(201).json(newUser);
  } catch (err) {
    next(err);
  }
};

// User login: compare hashed passwords and return JWT token
exports.loginUser = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await userModel.getUserByEmail(email); // Assuming getUserByEmail exists in model
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Compare the plain text password with the hashed one
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Generate a JWT token
    const token = jwt.sign(
      { userID: user.UserID, name: user.name },
      'yourSecretKey', 
      { expiresIn: '1h' }
    );

    // Send token as response
    res.status(200).json({ token });
  } catch (err) {
    next(err);
  }
};

// Get user by ID
exports.getUserById = async (req, res, next) => {
  try {
    let userID = parseInt(req.params.userID, 10);
    if (isNaN(userID)) {
      return res.status(400).json({ message: "Invalid userID format" });
    }

    const user = await userModel.getUserById(userID);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
};

// Update user
exports.updateUser = async (req, res, next) => {
  try {
    let userID = parseInt(req.params.userID, 10);
    if (isNaN(userID)) {
      return res.status(400).json({ message: "Invalid userID format" });
    }

    const updates = req.body;
    const updatedUser = await userModel.updateUser(userID, updates);
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(updatedUser);
  } catch (err) {
    next(err);
  }
};

// Delete user
exports.deleteUser = async (req, res, next) => {
  try {
    let userID = parseInt(req.params.userID, 10);
    if (isNaN(userID)) {
      return res.status(400).json({ message: "Invalid userID format" });
    }

    const deleted = await userModel.deleteUser(userID);
    if (!deleted) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    next(err);
  }
};
