const axios = require("axios")

// Together AI API configuration
const TOGETHER_API_KEY = process.env.TOGETHER_API_KEY || "your_together_api_key"
const TOGETHER_API_URL = "https://api.together.xyz/v1/chat/completions"

// Categorize expense using Together AI
exports.categorizeExpense = async (description) => {
  try {
    const categories = [
      "Food",
      "Transport",
      "Shopping",
      "Bills",
      "Entertainment",
      "Health",
      "Education",
      "Travel",
      "Housing",
      "Other",
    ]

    const prompt = `
      Categorize the following expense into one of these categories: ${categories.join(", ")}
      
      Expense description: "${description}"
      
      Category:
    `

    const response = await axios.post(
      TOGETHER_API_URL,
      {
        model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
        messages: [
          {
            role: "system",
            content: "You are a financial assistant that categorizes expenses. Respond with only the category name.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.3,
        max_tokens: 10,
      },
      {
        headers: {
          Authorization: `Bearer ${TOGETHER_API_KEY}`,
          "Content-Type": "application/json",
        },
      },
    )

    const category = response.data.choices[0].message.content.trim()

    // Default to 'Other' if category not in list
    if (!categories.includes(category)) {
      return "Other"
    }

    return category
  } catch (error) {
    console.error("AI categorization error:", error)
    return "Other" // Default category
  }
}

// Generate financial insights
exports.generateInsights = async (expenses, user) => {
  try {
    // Calculate spending by category
    const categories = {}
    expenses.forEach((expense) => {
      if (!categories[expense.category]) {
        categories[expense.category] = 0
      }
      categories[expense.category] += expense.amount
    })

    // Find highest spending category
    let highestCategory = ""
    let highestAmount = 0

    Object.keys(categories).forEach((category) => {
      if (categories[category] > highestAmount) {
        highestCategory = category
        highestAmount = categories[category]
      }
    })

    // Prepare data for AI analysis
    const financialData = {
      userName: user.name,
      totalExpenses: expenses.reduce((sum, expense) => sum + expense.amount, 0),
      expensesByCategory: categories,
      highestCategory,
      highestAmount,
    }

    // Generate insights using Together AI
    const response = await axios.post(
      TOGETHER_API_URL,
      {
        model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
        messages: [
          {
            role: "system",
            content:
              "You are a financial advisor providing insights based on spending data. Provide 3 actionable insights in JSON format with 'type', 'text', and 'action' fields.",
          },
          {
            role: "user",
            content: `Generate financial insights based on this data: ${JSON.stringify(financialData)}`,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
      },
      {
        headers: {
          Authorization: `Bearer ${TOGETHER_API_KEY}`,
          "Content-Type": "application/json",
        },
      },
    )

    // Parse the response to get insights
    const content = response.data.choices[0].message.content
    let insights = []

    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/\[([\s\S]*?)\]/)
      if (jsonMatch) {
        insights = JSON.parse(jsonMatch[1])
      } else {
        // Fallback to default insights if JSON parsing fails
        insights = [
          {
            type: "spending",
            text: `Your highest spending category is ${highestCategory} at ₹${highestAmount.toLocaleString()}.`,
            action: `Consider setting a budget for ${highestCategory} to reduce expenses.`,
          },
        ]
      }
    } catch (parseError) {
      console.error("Failed to parse AI insights:", parseError)
      // Fallback to default insights
      insights = [
        {
          type: "spending",
          text: `Your highest spending category is ${highestCategory} at ₹${highestAmount.toLocaleString()}.`,
          action: `Consider setting a budget for ${highestCategory} to reduce expenses.`,
        },
      ]
    }

    return insights
  } catch (error) {
    console.error("Generate insights error:", error)
    return []
  }
}

// Generate AI assistant response
exports.generateAssistantResponse = async (message, user, expenses) => {
  try {
    // Create context for the AI
    const context = {
      userName: user.name,
      totalExpenses: expenses.reduce((sum, expense) => sum + expense.amount, 0),
      expensesByCategory: {},
      recentExpenses: expenses.slice(0, 5).map((e) => ({
        amount: e.amount,
        description: e.description,
        category: e.category,
        date: e.date,
      })),
    }

    // Calculate expenses by category
    expenses.forEach((expense) => {
      if (!context.expensesByCategory[expense.category]) {
        context.expensesByCategory[expense.category] = 0
      }
      context.expensesByCategory[expense.category] += expense.amount
    })

    const prompt = `
      You are a financial assistant for ${user.name}. You have access to their financial data.
      
      User's financial summary:
      - Total expenses: ₹${context.totalExpenses.toLocaleString()}
      - Expenses by category: ${JSON.stringify(context.expensesByCategory)}
      - Recent transactions: ${JSON.stringify(context.recentExpenses)}
      
      User's message: "${message}"
      
      Provide a helpful, concise response about their finances. If they ask about specific expenses or categories, use the data provided. If you don't have the information, suggest how they could track it in the future.
    `

    const response = await axios.post(
      TOGETHER_API_URL,
      {
        model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
        messages: [
          {
            role: "system",
            content:
              "You are a helpful financial assistant that provides concise, accurate information about the user's finances.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 300,
      },
      {
        headers: {
          Authorization: `Bearer ${TOGETHER_API_KEY}`,
          "Content-Type": "application/json",
        },
      },
    )

    return response.data.choices[0].message.content.trim()
  } catch (error) {
    console.error("AI assistant error:", error)
    return "I'm sorry, I couldn't process your request at the moment. Please try again later."
  }
}

// New function for stock market insights
exports.getStockInsights = async (stocks) => {
  try {
    const prompt = `
      Analyze the following stocks and provide investment insights:
      ${JSON.stringify(stocks)}
      
      For each stock, provide:
      1. A brief analysis of current performance
      2. Short-term outlook (1-3 months)
      3. Recommendation (Buy, Hold, Sell)
      
      Format your response as JSON.
    `

    const response = await axios.post(
      TOGETHER_API_URL,
      {
        model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
        messages: [
          { role: "system", content: "You are a financial analyst providing stock market insights." },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 800,
      },
      {
        headers: {
          Authorization: `Bearer ${TOGETHER_API_KEY}`,
          "Content-Type": "application/json",
        },
      },
    )

    return response.data.choices[0].message.content
  } catch (error) {
    console.error("Stock insights error:", error)
    return "Unable to generate stock insights at this time."
  }
}

// New function for portfolio analysis
exports.analyzePortfolio = async (portfolio) => {
  try {
    const prompt = `
      Analyze this investment portfolio and provide recommendations:
      ${JSON.stringify(portfolio)}
      
      Include:
      1. Overall risk assessment
      2. Diversification analysis
      3. Specific recommendations for improvement
      4. Suggested asset allocation
      
      Format your response as JSON with sections for each of the above points.
    `

    const response = await axios.post(
      TOGETHER_API_URL,
      {
        model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
        messages: [
          { role: "system", content: "You are a portfolio manager providing investment advice." },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      },
      {
        headers: {
          Authorization: `Bearer ${TOGETHER_API_KEY}`,
          "Content-Type": "application/json",
        },
      },
    )

    return response.data.choices[0].message.content
  } catch (error) {
    console.error("Portfolio analysis error:", error)
    return "Unable to analyze portfolio at this time."
  }
}

