const userModel = require("../models/userModel");

exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await userModel.getAllUsers();
    res.status(200).json(users);
  } catch (err) {
    next(err); // Pass error to the error handler
  }
};
