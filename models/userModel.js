const connectDB = require("../config/dbConfig");

exports.getAllUsers = async () => {
  const pool = await connectDB();
  const result = await pool.request().query("SELECT * FROM [User]"); // Example query
  return result.recordset;
};
