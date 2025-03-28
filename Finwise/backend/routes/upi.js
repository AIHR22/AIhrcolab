const express = require("express")
const router = express.Router()
const upiController = require("../controllers/upiController")
const { authenticateToken } = require("../middleware/auth")

// Apply authentication middleware to all routes
router.use(authenticateToken)

// Sync UPI transactions
router.post("/sync", upiController.syncTransactions)

// Get UPI transactions
router.get("/transactions", upiController.getTransactions)

// Link UPI account
router.post("/link", upiController.linkAccount)

// Unlink UPI account
router.delete("/link/:id", upiController.unlinkAccount)

module.exports = router

