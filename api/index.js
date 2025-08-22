/**
 * Credit Rating Prediction API Server
 * Express.js backend with MongoDB integration
 */

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");
require("dotenv").config();
import serverless from "serverless-http";


// Import routes
const predictionRoutes = require("./routes/prediction");

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/credit-rating-db";

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("combined"));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use("/api/prediction", predictionRoutes);

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "Credit Rating Prediction API",
    version: "1.0.0",
    status: "running",
    timestamp: new Date().toISOString(),
    endpoints: {
      prediction: "/api/prediction",
      health: "/api/prediction/health",
      test: "/api/prediction/test",
    },
  });
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    service: "credit-rating-api",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Endpoint not found",
    message: `The endpoint ${req.method} ${req.originalUrl} does not exist`,
    availableEndpoints: [
      "GET /",
      "GET /health",
      "POST /api/prediction",
      "GET /api/prediction/test",
      "GET /api/prediction/health",
    ],
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error("❌ Global Error Handler:", error);
  
  res.status(error.status || 500).json({
    error: "Internal Server Error",
    message: error.message,
    timestamp: new Date().toISOString(),
    path: req.path,
  });
});

// MongoDB connection
async function connectToDatabase() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connected to MongoDB successfully");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    process.exit(1);
  }
}

// MongoDB event listeners
mongoose.connection.on("connected", () => {
  console.log("📊 MongoDB connected");
});

mongoose.connection.on("error", (error) => {
  console.error("❌ MongoDB error:", error);
});

mongoose.connection.on("disconnected", () => {
  console.log("📴 MongoDB disconnected");
});

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n🛑 Received SIGINT. Graceful shutdown...");
  try {
    await mongoose.connection.close();
    console.log("✅ MongoDB connection closed");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error during shutdown:", error);
    process.exit(1);
  }
});

// Start server
async function startServer() {
  try {
    // Connect to database first
    await connectToDatabase();
    
    // Start Express server
    const server = app.listen(PORT, () => {
      console.log("🚀 Credit Rating Prediction API Server");
      console.log("=" .repeat(50));
      console.log(`📍 Server running on: http://localhost:${PORT}`);
      console.log(`🗄️  Database: ${MONGODB_URI}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log("=" .repeat(50));
      console.log("\n📋 Available Endpoints:");
      console.log(`   POST http://localhost:${PORT}/api/prediction`);
      console.log(`   GET  http://localhost:${PORT}/api/prediction/test`);
      console.log(`   GET  http://localhost:${PORT}/health`);
      console.log("\n💡 Example request:");
      console.log(`   curl -X POST http://localhost:${PORT}/api/prediction \\`);
      console.log(`        -H "Content-Type: application/json" \\`);
      console.log(`        -d '{"companyName": "Apple"}'`);
      console.log("\n🎯 Ready to process prediction requests!");
    });

    // Handle server errors
    server.on("error", (error) => {
      if (error.code === "EADDRINUSE") {
        console.error(`❌ Port ${PORT} is already in use`);
      } else {
        console.error("❌ Server error:", error);
      }
      process.exit(1);
    });

  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
}

// Start the server
if (require.main === module) {
  startServer();
}

module.exports = serverless(app);