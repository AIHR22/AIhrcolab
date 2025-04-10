# Revenue Forecast Module

A comprehensive revenue forecasting solution that uses Prophet, LSTM, and Llama 4 AI to provide accurate predictions and insights.

## Architecture

This application uses a combination of:
- **Next.js frontend**: Provides the user interface and interacts with both the Supabase database and Flask backend
- **Flask ML backend**: Handles all machine learning operations using Prophet, LSTM, and Llama 4
- **Supabase**: Stores historical revenue data and ML predictions

## Setup Instructions

### Prerequisites
- Node.js 16+ and npm
- Python 3.8+ and pip
- A Supabase account and project
- A Together AI API key

### Step 1: Install Next.js dependencies
```bash
npm install
```

### Step 2: Install Flask backend dependencies
```bash
cd flask_backend
pip install -r requirements.txt
cd ..
```

### Step 3: Configure environment variables

1. In the root directory, update `.env.local` with your Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-service-key
TOGETHER_API_KEY=your-together-api-key
FLASK_API_URL=http://localhost:5000
```

2. In the flask_backend directory, update `.env` with the same credentials:
```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-service-key
TOGETHER_API_KEY=your-together-api-key
FLASK_ENV=development
PORT=5000
```

### Step 4: Start the development servers
```bash
./start-dev.sh
```

This will start both the Flask backend and Next.js frontend.

## API Endpoints

### Next.js API Routes
- `/api/revenue` - Get and create revenue data in Supabase
- `/api/ml` - Proxy requests to the Flask ML backend

### Flask ML Endpoints
- `/api/ml/predict` - Generate revenue forecasts using Prophet, LSTM, and Llama 4
- `/api/ml/train` - Train custom ML models with provided data

## ML Models

### Prophet
Used for time series forecasting with built-in handling of:
- Yearly, weekly, and daily seasonality
- Holidays and events
- Trend changepoints

### LSTM (Long Short-Term Memory)
A type of recurrent neural network capable of learning order dependence in sequence prediction problems.

### Llama 4
Provides qualitative analysis of the revenue data, including:
- Key revenue trends and patterns
- Potential growth factors
- Future revenue forecasts with reasoning
- Confidence levels and risk factors

## Features

- Project-based revenue forecasting
- Machine learning models (LSTM) for accurate predictions
- Workforce metrics integration
- Confidence intervals for predictions
- Historical trend analysis
- Seasonality detection
- Model versioning and registry
- Performance metrics tracking
- Supabase integration for data storage

## Usage

### Basic Forecasting

```typescript
import { RevenueForecaster } from './src/ml/RevenueForecaster';

// Historical data
const historicalData = [
  { date: '2023-01-01', amount: 100000 },
  // ... more data points
];

// Optional workforce metrics
const workforceMetrics = {
  headcount: 100,
  avg_salary: 75000,
  attrition_rate: 15,
  productivity_metrics: {
    revenue_per_employee: 200000,
    efficiency_score: 85
  }
};

// Create forecaster instance
const forecaster = new RevenueForecaster(
  historicalData,
  workforceMetrics,
  'project-123' // optional project ID
);

// Generate forecast
const forecast = await forecaster.generateForecast(
  '2024-01-01',  // start date
  '2024-12-31'   // end date
);
```

### Model Training

```typescript
// Train a new model
await forecaster.trainNewModel(trainingData);

// Get model performance metrics
const performance = await forecaster.getModelPerformance();
```

## Testing

Run the test suite:
```bash
npm test
```

## API Documentation

### RevenueForecaster Class

Main class for generating revenue forecasts.

#### Methods:

- `generateForecast(startDate: string, endDate: string): Promise<ForecastResult[]>`
  - Generates revenue forecasts for the specified date range
  - Returns an array of forecast results with confidence intervals

- `calculateHistoricalTrend(): Promise<number>`
  - Analyzes historical data to determine the trend
  - Returns a trend factor

### Feature Engineering

The module includes sophisticated feature engineering:

- Time-based features (day of week, month, quarter, etc.)
- Moving averages (7, 14, 30, 90 days)
- Growth rate calculations
- Seasonality detection
- Workforce impact analysis

## Database Schema

The module uses several tables in Supabase:

- `actual_revenue`: Historical revenue data
- `revenue_forecasts`: Generated forecasts
- `revenue_metrics`: Revenue-related metrics
- `workforce_metrics`: Workforce data
- `model_registry`: ML model storage
- `metrics_tracking`: Performance metrics

See `sql/setup.sql` for complete schema details.

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

MIT 