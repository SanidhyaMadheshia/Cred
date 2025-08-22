const express = require("express");
const router = express.Router();
const { getCompanyDataByName } = require("../services/fmpService");
const { getPrediction } = require("../services/predictionService");

/**
 * POST /api/prediction
 * Main prediction endpoint
 */
router.post("/", async (req, res) => {
  try {
    const { companyName } = req.body;

    if (!companyName) {
      return res.status(400).json({
        error: "Company name is required",
        message: "Please provide a companyName in the request body",
      });
    }

    console.log(`🔍 Processing prediction request for: ${companyName}`);

    // Step 1: Fetch company financial data
    console.log("📊 Fetching financial data...");
    const companyData = await getCompanyDataByName(companyName);

    // Step 2: Get prediction from Python script
    console.log("🤖 Running prediction model...");
    const predictionResult = await getPrediction(companyData);

    // Step 3: Return the result
    console.log(`✅ Prediction completed for ${companyName}`);
    res.json({
      success: true,
      data: predictionResult,
      message: `Prediction completed successfully for ${companyName}`,
    });

  } catch (error) {
    console.error("❌ Prediction API Error:", error.message);
    
    // Handle specific error types
    if (error.message.includes("Company not found")) {
      return res.status(404).json({
        error: "Company not found",
        message: `Could not find financial data for company: ${req.body.companyName}`,
      });
    }

    if (error.message.includes("Python script failed")) {
      return res.status(500).json({
        error: "Prediction model error",
        message: "Failed to generate prediction. Please check the prediction model.",
      });
    }

    // Generic error response
    res.status(500).json({
      error: "Internal server error",
      message: error.message,
    });
  }
});

/**
 * GET /api/prediction/test
 * Test endpoint to verify the API is working
 */
router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Prediction API is working!",
    timestamp: new Date().toISOString(),
  });
});

/**
 * GET /api/prediction/health
 * Health check endpoint
 */
router.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    service: "prediction-api",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

module.exports = router;
