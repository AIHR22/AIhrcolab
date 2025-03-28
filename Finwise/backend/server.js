const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const dotenv = require("dotenv")
const morgan = require("morgan")
const helmet = require("helmet")
const compression = require("compression")

// Routes
const authRoutes = require("./routes/auth")
const userRoutes = require("./routes/user")
const expenseRoutes = require("./routes/expense")
const insightRoutes = require("./routes/insight")
const assistantRoutes = require("./routes/assistant")
const dashboardRoutes = require("./routes/dashboard")
const stockRoutes = require("./routes/stock")
const upiRoutes = require("./routes/upi")

// Middleware
const { authenticateToken } = require("./middleware/auth")

// Load environment variables
dotenv.config()

// Initialize Express app
const app = express()

// Middleware
app.use(cors())
app.use(express.json())
app.use(morgan("dev"))
app.use(helmet())
app.use(compression())

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err))

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/user", authenticateToken, userRoutes)
app.use("/api/expenses", authenticateToken, expenseRoutes)
app.use("/api/insights", authenticateToken, insightRoutes)
app.use("/api/assistant", authenticateToken, assistantRoutes)
app.use("/api/dashboard", authenticateToken, dashboardRoutes)
app.use("/api/stocks", authenticateToken, stockRoutes)
app.use("/api/upi", authenticateToken, upiRoutes)

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  })
})

// Start server
const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

