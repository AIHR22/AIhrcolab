const User = require("../models/User")
const Expense = require("../models/Expense")
const { categorizeExpense } = require("../services/aiService")
const axios = require("axios")

// Mock UPI API for demo purposes
// In a real app, you would integrate with actual UPI providers like PhonePe, Google Pay, etc.
const mockUpiTransactions = [
  {
    id: "1",
    amount: -500,
    description: "Payment to Grocery Store",
    category: "Food",
    date: new Date().toISOString(),
    upiId: "merchant@ybl",
    merchant: "Local Grocery",
  },
  {
    id: "2",
    amount: -1200,
    description: "Electricity Bill Payment",
    category: "Bills",
    date: new Date().toISOString(),
    upiId: "electricity@paytm",
    merchant: "City Power",
  },
  {
    id: "3",
    amount: -800,
    description: "Cab Ride",
    category: "Transport",
    date: new Date().toISOString(),
    upiId: "uber@upi",
    merchant: "Uber",
  },
]

// Sync UPI transactions
exports.syncTransactions = async (req, res) => {
  try {
    const userId = req.user.id

    // In a real app, you would fetch transactions from UPI providers
    // For demo, we'll use mock data

    // Process and save transactions
    const savedTransactions = []

    for (const transaction of mockUpiTransactions) {
      // Check if transaction already exists
      const existingTransaction = await Expense.findOne({
        user: userId,
        description: transaction.description,
        amount: transaction.amount,
        date: transaction.date,
      })

      if (!existingTransaction) {
        // Categorize transaction using AI
        const category = await categorizeExpense(transaction.description)

        // Create new expense record
        const expense = new Expense({
          user: userId,
          amount: transaction.amount,
          description: transaction.description,
          category: category,
          date: transaction.date,
          paymentMethod: "upi",
          location: "",
          tags: ["upi", transaction.merchant],
          isRecurring: false,
        })

        await expense.save()
        savedTransactions.push(expense)
      }
    }

    res.json({
      message: `Synced ${savedTransactions.length} new UPI transactions`,
      transactions: savedTransactions,
    })
  } catch (error) {
    console.error("UPI sync error:", error)
    res.status(500).json({ message: "Failed to sync UPI transactions" })
  }
}

// Get UPI transactions
exports.getTransactions = async (req, res) => {
  try {
    const userId = req.user.id
    const { dateRange } = req.query

    // Build query
    const query = {
      user: userId,
      paymentMethod: "upi",
    }

    // Date filtering
    if (dateRange === "today") {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      query.date = { $gte: today }
    } else if (dateRange === "week") {
      const weekStart = new Date()
      weekStart.setDate(weekStart.getDate() - weekStart.getDay())
      weekStart.setHours(0, 0, 0, 0)
      query.date = { $gte: weekStart }
    } else if (dateRange === "month") {
      const monthStart = new Date()
      monthStart.setDate(1)
      monthStart.setHours(0, 0, 0, 0)
      query.date = { $gte: monthStart }
    }

    const transactions = await Expense.find(query).sort({ date: -1 })

    res.json({
      transactions,
    })
  } catch (error) {
    console.error("Get UPI transactions error:", error)
    res.status(500).json({ message: "Failed to get UPI transactions" })
  }
}

// Link UPI account
exports.linkAccount = async (req, res) => {
  try {
    const userId = req.user.id
    const { upiId, provider } = req.body

    if (!upiId || !provider) {
      return res.status(400).json({ message: "UPI ID and provider are required" })
    }

    // Update user with linked UPI account
    const user = await User.findById(userId)

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Check if UPI account already linked
    const existingAccount = user.connectedAccounts.find(
      (account) => account.type === "upi" && account.accountId === upiId,
    )

    if (existingAccount) {
      return res.status(400).json({ message: "UPI account already linked" })
    }

    // Add UPI account
    user.connectedAccounts.push({
      type: "upi",
      name: provider,
      accountId: upiId,
      balance: 0,
      lastSync: new Date(),
    })

    await user.save()

    res.json({
      message: "UPI account linked successfully",
      account: {
        type: "upi",
        name: provider,
        accountId: upiId,
      },
    })
  } catch (error) {
    console.error("Link UPI account error:", error)
    res.status(500).json({ message: "Failed to link UPI account" })
  }
}

// Unlink UPI account
exports.unlinkAccount = async (req, res) => {
  try {
    const userId = req.user.id
    const accountId = req.params.id

    // Update user to remove linked UPI account
    const user = await User.findById(userId)

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Filter out the account to unlink
    user.connectedAccounts = user.connectedAccounts.filter(
      (account) => !(account.type === "upi" && account.accountId === accountId),
    )

    await user.save()

    res.json({
      message: "UPI account unlinked successfully",
    })
  } catch (error) {
    console.error("Unlink UPI account error:", error)
    res.status(500).json({ message: "Failed to unlink UPI account" })
  }
}

