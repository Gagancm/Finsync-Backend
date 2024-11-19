const sql = require("mssql");

const dbConfig = {
  user: "Gagan_database", // Replace with your SQL Server username
  password: "1234@4321", // Replace with your SQL Server password
  server: "Gagan", // Replace with your server
  database: "Project", // Replace with your database name
  options: {
    encrypt: false, // Set to true if using Azure SQL
    trustServerCertificate: true, // For local development
  },
};

const connectDB = async () => {
    try {
      const pool = await sql.connect(dbConfig);
      return pool; // Return the connection pool if needed
    } catch (err) {
      throw new Error(`Database connection error: ${err.message}`);
    }
  };
  
  module.exports = connectDB;
