const express = require("express")
const router = express.Router()
const stockController = require("../controllers/stockController")
const { authenticateToken } = require("../middleware/auth")

// Apply authentication middleware to all routes
router.use(authenticateToken)

// Get stock insights
router.post("/insights", stockController.getStockInsights)

// Analyze portfolio
router.post("/portfolio/analyze", stockController.analyzePortfolio)

// Get market overview
router.get("/market/overview", stockController.getMarketOverview)

module.exports = router

