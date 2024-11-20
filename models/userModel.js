const connectDB = require("../config/dbConfig");
const sql = require("mssql");
const bcrypt = require('bcryptjs'); // For hashing passwords

// Fetch all users
exports.getAllUsers = async () => {
  const pool = await connectDB();
  const result = await pool.request().query("SELECT * FROM [User]"); 
  return result.recordset;
};

// Create a new user with a hashed password
exports.createUser = async (userData) => {
  const pool = await connectDB();
  
  // Hash the password before saving
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(userData.password, salt); 
  
  const result = await pool
    .request()
    .input("name", userData.name)
    .input("email", userData.email)
    .input("password", hashedPassword) // Store hashed password
    .query("INSERT INTO [User] (name, email, password) OUTPUT INSERTED.* VALUES (@name, @email, @password)");
  return result.recordset[0];
};

// Fetch user by ID
exports.getUserById = async (userID) => {
  const pool = await connectDB();
  const result = await pool
    .request()
    .input("UserID", sql.Int, userID)
    .query("SELECT * FROM [User] WHERE UserID = @UserID");
  return result.recordset[0];
};

// Update user data
exports.updateUser = async (userID, updates) => {
  const pool = await connectDB();

  let query = 'UPDATE [User] SET ';
  const inputs = [];

  if (updates.password) {
    // Hash password if it's being updated
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(updates.password, salt);
    query += 'password = @password, ';
    inputs.push({ name: 'password', value: hashedPassword });
  }

  if (updates.name) {
    query += 'name = @name, ';
    inputs.push({ name: 'name', value: updates.name });
  }

  if (updates.email) {
    query += 'email = @email, ';
    inputs.push({ name: 'email', value: updates.email });
  }

  query = query.slice(0, -2); // Remove trailing comma
  query += ' WHERE UserID = @UserID';

  const result = await pool
    .request()
    .input('UserID', userID)
    .input(inputs) // Add all inputs dynamically
    .query(query);
  return result.recordset[0];
};

// Delete user by ID
exports.deleteUser = async (userID) => {
  const pool = await connectDB();
  const result = await pool
    .request()
    .input("UserID", sql.Int, userID)
    .query("DELETE FROM [User] OUTPUT DELETED.* WHERE UserID = @UserID");
  return result.recordset[0];
};
