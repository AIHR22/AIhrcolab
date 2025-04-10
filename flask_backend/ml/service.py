import tensorflow as tf
import numpy as np
from typing import Dict, List, Union

class MLService:
    def __init__(self):
        """Initialize the ML service with a simple model for testing"""
        self.model = tf.keras.Sequential([
            tf.keras.layers.Dense(64, activation='relu', input_shape=(1,)),
            tf.keras.layers.Dense(32, activation='relu'),
            tf.keras.layers.Dense(1, activation='relu')  # Use ReLU to ensure non-negative outputs
        ])
        self.model.compile(optimizer='adam', loss='mse')
        
    def predict_revenue(self, historical_data: Dict[str, List]) -> Dict[str, Union[List[float], Dict[str, List[float]]]]:
        """Make revenue predictions based on historical data"""
        # Convert dates to numeric values (days since first date)
        dates = historical_data['dates']
        revenues = historical_data['revenue']
        
        # Create training data
        x = np.arange(len(dates)).reshape(-1, 1)
        y = np.array(revenues)
        
        # Normalize the data to help with training
        x_mean = np.mean(x)
        x_std = np.std(x) + 1e-8  # Add small epsilon to avoid division by zero
        y_mean = np.mean(y)
        y_std = np.std(y) + 1e-8
        
        x_norm = (x - x_mean) / x_std
        y_norm = (y - y_mean) / y_std
        
        # Train the model
        self.model.fit(x_norm, y_norm, epochs=50, verbose=0)
        
        # Make predictions for next 30 days
        future_days = np.arange(len(dates), len(dates) + 30).reshape(-1, 1)
        future_days_norm = (future_days - x_mean) / x_std
        predictions_norm = self.model.predict(future_days_norm, verbose=0)
        
        # Denormalize predictions
        predictions = predictions_norm * y_std + y_mean
        
        # Ensure predictions are non-negative
        predictions = np.maximum(predictions, 0)
        
        # Calculate confidence intervals
        std_dev = np.std(predictions)
        lower_bound = np.maximum(predictions - 1.96 * std_dev, 0)  # Ensure non-negative
        upper_bound = predictions + 1.96 * std_dev
        
        return {
            'forecast': predictions.flatten().tolist(),
            'confidence_interval': {
                'lower': lower_bound.flatten().tolist(),
                'upper': upper_bound.flatten().tolist()
            }
        } 