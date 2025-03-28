// Import necessary modules
const { getStockData, getStockInsights } = require("../utils/stockUtils")

// Get stock insights
exports.getStockInsights = async (req, res) => {
  try {
    const { symbols } = req.body

    if (!symbols || !Array.isArray(symbols) || symbols.length === 0) {
      return res.status(400).json({ message: "Please provide an array of stock symbols" })
    }

    // Fetch stock data for each symbol
    const stocksData = []
    for (const symbol of symbols) {
      try {
        const data = await getStockData(symbol)
        stocksData.push({
          symbol,
          data: data.chart.result[0],
        })
      } catch (error) {
        console.error(`Error fetching data for ${symbol}:`, error)
        // Continue with other symbols even if one fails
      }
    }

    // Generate insights using AI
    const insights = await getStockInsights(stocksData)

    res.json({ insights })
  } catch (error) {
    console.error("Stock insights error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Analyze portfolio
exports.analyzePortfolio = async (req, res) => {
  // Implementation details...
}

// Get market overview
exports.getMarketOverview = async (req, res) => {
  // Implementation details...
}

