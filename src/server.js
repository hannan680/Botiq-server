const mongoose = require("mongoose");
const dotenv = require("dotenv").config();
const { insertDummyCategories } = require("./mocks/aiCategoryMock");

// Load environment variables from config.env

// Import the express app
const app = require("./app");

// Handle uncaught exceptions globally
process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION! 💥 Shutting down...");
  console.error(err.name, err.message);
  process.exit(1); // Exit immediately on uncaught exceptions
});

// Ensure essential environment variables are present
if (!process.env.MONGODB_URI || !process.env.MONGODB_PASS) {
  throw new Error(
    "Missing critical environment variables (MONGODB_URI or MONGODB_PASS)"
  );
}
// insertDummyCategories();
// Replace password placeholder in the MongoDB URI
const DB = process.env.MONGODB_URI.replace(
  "<password>",
  process.env.MONGODB_PASS
);

// Set Mongoose strict mode for queries
mongoose.set("strictQuery", "false");

// Connect to the MongoDB database
mongoose
  .connect(DB)
  .then(() => console.log("DB connection successful!"))
  .catch((err) => {
    console.error("DB connection error:", err.message);
    process.exit(1); // Exit the process if the DB connection fails
  });

// Define the port
const port = process.env.PORT || 3000;

// Start the server
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION! 💥 Shutting down...");
  console.error(err.stack, err.name, err.message);
  server.close(() => {
    process.exit(1); // Exit after server has closed
  });
});

// Graceful shutdown on SIGTERM (e.g., from Docker or cloud platforms)
process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down gracefully...");
  server.close(() => {
    console.log("Process terminated.");
  });
});
