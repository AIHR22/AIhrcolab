const { categorizeExpense } = require("../utils/ai")
const Expense = require("../models/Expense")

// Add a new expense
exports.addExpense = async (req, res) => {
  try {
    const { amount, description, category, date, paymentMethod, location, tags, isRecurring, recurringFrequency } =
      req.body

    // Use AI to categorize if category not provided
    let expenseCategory = category
    if (!expenseCategory) {
      expenseCategory = await categorizeExpense(description)
    }

    const expense = new Expense({
      user: req.user.id,
      amount,
      description,
      category: expenseCategory,
      date: date || Date.now(),
      paymentMethod,
      location,
      tags,
      isRecurring,
      recurringFrequency,
    })

    await expense.save()

    res.status(201).json(expense)
  } catch (error) {
    console.error("Add expense error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

