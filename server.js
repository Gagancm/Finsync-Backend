const app = require("./app");
const connectDB = require("./config/dbConfig"); // Import your database connection function

const PORT = process.env.PORT || 5000;

// Test Database Connection
const startServer = async () => {
  try {
    // Test DB Connection
    await connectDB();
    console.log("Connected to the database!");

    // Start Express Server
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Failed to connect to the database:", err.message);
    process.exit(1); // Exit the process if the database connection fails
  }
};

// Start the server
startServer();
