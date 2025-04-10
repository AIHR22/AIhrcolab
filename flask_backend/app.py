import os
import json
import numpy as np
import pandas as pd
from prophet import Prophet
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_cors import CORS
from together import Together
from datetime import datetime
import logging
import requests
from middleware.security import require_auth, rate_limit, security_headers, sanitize_input
import traceback

# Custom JSON encoder to handle timestamps
class CustomJSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, pd.Timestamp):
            return obj.isoformat()
        if isinstance(obj, datetime):
            return obj.isoformat()
        if isinstance(obj, np.integer):
            return int(obj)
        if isinstance(obj, np.floating):
            return float(obj)
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        return super().default(obj)

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
app.json_encoder = CustomJSONEncoder  # Use custom JSON encoder
CORS(app, resources={
    r"/api/*": {
        "origins": os.getenv('ALLOWED_ORIGINS', 'http://localhost:3000').split(','),
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# Initialize Together AI client
together_api_key = os.getenv("TOGETHER_API_KEY")
together_client = None
if together_api_key:
    try:
        together_client = Together(api_key=together_api_key)
        logger.info("Together AI client initialized successfully")
    except Exception as e:
        logger.warning(f"Failed to initialize Together AI client: {str(e)}")
else:
    logger.warning("TOGETHER_API_KEY not found in environment variables. Together AI features will be disabled.")

# Supabase configuration
supabase_url = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

# Error handlers
@app.errorhandler(400)
def bad_request(error):
    return jsonify({'error': 'Bad request', 'details': str(error)}), 400

@app.errorhandler(401)
def unauthorized(error):
    return jsonify({'error': 'Unauthorized', 'details': str(error)}), 401

@app.errorhandler(403)
def forbidden(error):
    return jsonify({'error': 'Forbidden', 'details': str(error)}), 403

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Not found', 'details': str(error)}), 404

@app.errorhandler(429)
def too_many_requests(error):
    return jsonify({'error': 'Too many requests', 'details': str(error)}), 429

@app.errorhandler(500)
def internal_server_error(error):
    logger.error(f"Internal server error: {str(error)}")
    logger.error(traceback.format_exc())
    return jsonify({'error': 'Internal server error', 'details': str(error)}), 500

class MLModels:
    @staticmethod
    def build_prophet_model():
        """Build a Prophet model for time series forecasting."""
        return Prophet(
            growth='linear',
            changepoints=None,
            n_changepoints=25,
            yearly_seasonality=True,
            weekly_seasonality=False,
            daily_seasonality=False
        )
    
    @staticmethod
    def prepare_prophet_data(dates, values):
        """Prepare data for Prophet model training."""
        return pd.DataFrame({
            'ds': pd.to_datetime(dates),
            'y': values
        })
    
    @staticmethod
    def simple_forecast(data, periods=12):
        """Generate a simple forecast using exponential smoothing."""
        alpha = 0.3  # Smoothing factor
        result = []
        last_value = data[-1]
        
        for i in range(periods):
            # Exponential smoothing with trend
            trend = data[-1] - data[-2] if len(data) > 1 else 0
            next_value = last_value + trend * 0.5
            result.append(next_value)
            last_value = next_value
            
        return result
    
    @staticmethod
    def get_llama_insights(historical_data):
        """Use Llama 4 to analyze revenue data and provide insights."""
        # Check if Together client is available
        if together_client is None:
            logger.warning("Together AI client not available. Returning default insights.")
            return {
                "trends": ["AI analysis not available"],
                "growth_factors": ["AI analysis not available"],
                "forecast": {
                    "next_quarter": None,
                    "reasoning": "AI analysis not available"
                },
                "confidence": {
                    "score": 0.5,
                    "risk_factors": ["AI analysis not available"]
                }
            }
            
        prompt = f"""Given the following historical revenue data:
{json.dumps(historical_data, indent=2)}

Analyze this data and provide:
1. Key revenue trends and patterns
2. Potential growth factors and market influences
3. Revenue forecast for the next quarter with reasoning
4. Confidence level in the prediction and risk factors

Provide the response in JSON format with the following structure:
{{
  "trends": [],
  "growth_factors": [],
  "forecast": {{
    "next_quarter": number,
    "reasoning": string
  }},
  "confidence": {{
    "score": number,
    "risk_factors": []
  }}
}}"""

        try:
            response = together_client.chat.completions.create(
                model="meta-llama/Llama-4-Maverick-17B-128E-Instruct-FP8",  # Using the correct Llama 4 Scout model
                messages=[
                    {"role": "system", "content": "You are a financial analyst AI that provides insights on revenue data."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=1000,
                temperature=0.7,
                top_p=0.9,
                top_k=50,
                repetition_penalty=1.1
            )
            
            result = response.choices[0].message.content
            # Parse the JSON from the response
            try:
                parsed_json = json.loads(result)
                return parsed_json
            except json.JSONDecodeError:
                # Extract JSON if it's within a code block or mixed with text
                import re
                json_match = re.search(r'```json\n(.*?)```', result, re.DOTALL)
                if json_match:
                    return json.loads(json_match.group(1))
                
                # Try to find anything that looks like JSON
                json_match = re.search(r'({.*})', result, re.DOTALL)
                if json_match:
                    return json.loads(json_match.group(1))
                
                # If nothing works, create a structured response
                logger.warning(f"Failed to parse JSON from Llama response: {result}")
                return {
                    "trends": ["Unable to parse detailed trends"],
                    "growth_factors": ["Unable to parse growth factors"],
                    "forecast": {
                        "next_quarter": None,
                        "reasoning": "Model couldn't generate structured data"
                    },
                    "confidence": {
                        "score": 0.5,
                        "risk_factors": ["Data parsing issues"]
                    }
                }
        except Exception as e:
            logger.error(f"Error getting Llama insights: {str(e)}")
            return {
                "trends": ["Error in AI analysis"],
                "growth_factors": ["Error in AI analysis"],
                "forecast": {
                    "next_quarter": None,
                    "reasoning": f"Error: {str(e)}"
                },
                "confidence": {
                    "score": 0,
                    "risk_factors": ["AI analysis failed"]
                }
            }

class DataService:
    @staticmethod
    def fetch_revenue_data():
        """Fetch revenue data from Supabase."""
        try:
            # Use requests to call the Supabase API
            headers = {
                "apikey": supabase_key,
                "Authorization": f"Bearer {supabase_key}",
                "Content-Type": "application/json"
            }
            
            response = requests.get(
                f"{supabase_url}/rest/v1/revenue_forecasts?select=*&order=month.asc", 
                headers=headers
            )
            
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"Error fetching revenue data: {str(e)}")
            raise e
    
    @staticmethod
    def store_prediction(prediction_data):
        """Store prediction data in Supabase."""
        try:
            headers = {
                "apikey": supabase_key,
                "Authorization": f"Bearer {supabase_key}",
                "Content-Type": "application/json",
                "Prefer": "return=representation"
            }
            
            # Convert prediction data to JSON using custom encoder
            json_data = json.dumps(prediction_data, cls=CustomJSONEncoder)
            
            response = requests.post(
                f"{supabase_url}/rest/v1/ml_predictions", 
                headers=headers,
                data=json_data
            )
            
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"Error storing prediction: {str(e)}")
            raise e

@app.route('/api/ml/predict', methods=['GET'])
@require_auth
@rate_limit
@security_headers
def predict():
    """Generate predictions using Prophet and Llama 4."""
    try:
        # Sanitize and validate input
        if request.args:
            params = sanitize_input(request.args.to_dict())
            # Add any parameter validation here
        
        # 1. Fetch historical revenue data
        try:
            revenue_data = DataService.fetch_revenue_data()
        except Exception as e:
            logger.error(f"Database error: {str(e)}")
            return jsonify({
                'success': False,
                'error': 'Failed to fetch data from database',
                'details': str(e)
            }), 500
        
        if not revenue_data:
            return jsonify({
                'success': False,
                'error': 'No data found in database',
                'details': 'Please add some historical revenue data first'
            }), 400
        
        if len(revenue_data) < 2:
            return jsonify({
                'success': False,
                'error': 'Insufficient data',
                'details': f'Need at least 2 data points, but only found {len(revenue_data)}'
            }), 400
        
        # Extract dates and numerical values
        try:
            # Log the structure of the first item to see what fields are available
            if revenue_data and len(revenue_data) > 0:
                first_item = revenue_data[0]
                logger.info(f"First revenue data item: {first_item}")
                logger.info(f"Available fields: {list(first_item.keys())}")
                
                # Use the correct field names from your data
                year_field = 'year'
                month_field = 'month'
                value_field = 'predicted_amount'
                
                # Extract dates and values using the found field names
                dates = [f"{entry[year_field]}-{entry[month_field]:02d}-01" for entry in revenue_data]
                values = [float(entry[value_field]) for entry in revenue_data]
                
                logger.info(f"Using year field: {year_field}, month field: {month_field}, value field: {value_field}")
                logger.info(f"Sample date: {dates[0] if dates else 'No dates'}")
            else:
                return jsonify({
                    'success': False,
                    'error': 'No data found in database',
                    'details': 'Please add some historical revenue data first'
                }), 400
        except (KeyError, ValueError) as e:
            logger.error(f"Data format error: {str(e)}")
            return jsonify({
                'success': False,
                'error': 'Invalid data format',
                'details': f'Error processing data: {str(e)}'
            }), 400
        
        # 2. Train Prophet model and generate forecast
        try:
            prophet_model = MLModels.build_prophet_model()
            prophet_df = MLModels.prepare_prophet_data(dates, values)
            prophet_model.fit(prophet_df)
            
            future_dates = prophet_model.make_future_dataframe(periods=12, freq='MS')
            prophet_forecast = prophet_model.predict(future_dates)
            prophet_predictions = prophet_forecast[['ds', 'yhat', 'yhat_lower', 'yhat_upper']].tail(12).to_dict('records')
        except Exception as e:
            logger.error(f"Prophet model error: {str(e)}")
            return jsonify({
                'success': False,
                'error': 'Failed to generate predictions',
                'details': str(e)
            }), 500
        
        # 3. Get Llama insights
        try:
            llama_insights = MLModels.get_llama_insights(revenue_data)
        except Exception as e:
            logger.error(f"Llama insights error: {str(e)}")
            llama_insights = {
                "trends": ["AI analysis failed"],
                "growth_factors": ["AI analysis failed"],
                "forecast": {
                    "next_quarter": None,
                    "reasoning": f"Error: {str(e)}"
                },
                "confidence": {
                    "score": 0.0,
                    "risk_factors": ["AI analysis failed"]
                }
            }
        
        # 4. Store predictions
        try:
            prediction_data = {
                'timestamp': datetime.now().isoformat(),
                'prophet_predictions': prophet_predictions,
                'llama_insights': llama_insights
            }
            DataService.store_prediction(prediction_data)
        except Exception as e:
            logger.error(f"Failed to store predictions: {str(e)}")
            # Continue anyway, as this is not critical
        
        return jsonify({
            'success': True,
            'predictions': {
                'prophet': prophet_predictions,
                'llama': llama_insights
            }
        })
        
    except Exception as e:
        logger.error(f"Error in predict endpoint: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({
            'success': False,
            'error': 'An unexpected error occurred',
            'details': str(e)
        }), 500

@app.route('/api/ml/train', methods=['POST'])
@require_auth
@rate_limit
@security_headers
def train():
    """Train models with custom data."""
    try:
        # Sanitize and validate input
        request_data = sanitize_input(request.get_json())
        
        if not request_data:
            return jsonify({
                'success': False,
                'error': 'No data provided'
            }), 400
            
        training_data = request_data.get('training_data')
        model_version = request_data.get('model_version')
        
        if not training_data or not model_version:
            return jsonify({
                'success': False,
                'error': "Required fields: model_version, training_data"
            }), 400
            
        # Validate training data structure
        for entry in training_data:
            if not isinstance(entry, dict) or 'date' not in entry or 'actual' not in entry:
                return jsonify({
                    'success': False,
                    'error': "Invalid training data format"
                }), 400
                
        # Extract dates and values from training data
        dates = [entry['date'] for entry in training_data]
        values = [float(entry['actual']) for entry in training_data]
        
        # Train Prophet model
        prophet_model = MLModels.build_prophet_model()
        prophet_df = MLModels.prepare_prophet_data(dates, values)
        prophet_model.fit(prophet_df)
        
        future_dates = prophet_model.make_future_dataframe(periods=12, freq='MS')
        prophet_forecast = prophet_model.predict(future_dates)
        prophet_predictions = prophet_forecast[['ds', 'yhat', 'yhat_lower', 'yhat_upper']].tail(12).to_dict('records')
        
        # Generate simple forecast
        simple_forecast = MLModels.simple_forecast(values)
        
        # Get Llama 4 insights
        llama_insights = MLModels.get_llama_insights(training_data)
        
        # Format prediction dates
        prediction_dates = []
        last_date = pd.to_datetime(dates[-1])
        for i in range(1, 13):
            next_date = last_date + pd.DateOffset(months=i)
            prediction_dates.append(next_date.strftime('%Y-%m-%d'))
        
        # Combine predictions
        combined_predictions = {
            'date': datetime.now().isoformat(),
            'prophet_forecast': [
                {
                    'date': pred_date,
                    'value': prophet_predictions[i]['yhat'],
                    'lower_bound': prophet_predictions[i]['yhat_lower'],
                    'upper_bound': prophet_predictions[i]['yhat_upper']
                }
                for i, pred_date in enumerate(prediction_dates)
            ],
            'simple_forecast': [
                {
                    'date': pred_date,
                    'value': simple_forecast[i]
                }
                for i, pred_date in enumerate(prediction_dates)
            ],
            'llama_insights': llama_insights,
            'model_version': model_version,
            'confidence_score': float(llama_insights.get('confidence', {}).get('score', 0.9)),
            'metadata': {
                'model_types': ["prophet", "exponential_smoothing", "llama-4"],
                'features_used': ["historical_revenue", "custom_features"],
                'training_date': datetime.now().isoformat()
            }
        }
        
        # Store predictions
        result = DataService.store_prediction(combined_predictions)
        
        return jsonify({
            'success': True,
            'data': result
        })
        
    except Exception as e:
        logger.error(f"Error in train endpoint: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_ENV') == 'development'
    
    # Validate environment variables
    required_vars = ['TOGETHER_API_KEY', 'JWT_SECRET']
    missing_vars = [var for var in required_vars if not os.getenv(var)]
    
    if missing_vars:
        logger.error(f"Missing required environment variables: {', '.join(missing_vars)}")
        exit(1)
    
    app.run(host='0.0.0.0', port=port, debug=debug) 