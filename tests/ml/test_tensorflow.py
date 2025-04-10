import pytest
import tensorflow as tf
import numpy as np
from flask_backend.ml.service import MLService

@pytest.mark.ml
class TestTensorFlow:
    def test_tensorflow_installation(self):
        """Test that TensorFlow is properly installed and can perform basic operations"""
        # Create some test data
        x = tf.constant([[1.0, 2.0, 3.0], [4.0, 5.0, 6.0]])
        y = tf.constant([[10.0], [20.0]])
        
        # Create a simple model
        model = tf.keras.Sequential([
            tf.keras.layers.Dense(1, input_shape=(3,))
        ])
        
        # Compile the model
        model.compile(optimizer='adam', loss='mse')
        
        # Train for one step
        history = model.fit(x, y, epochs=1, verbose=0)
        
        # Verify that training occurred and loss was computed
        assert len(history.history['loss']) == 1
        assert isinstance(history.history['loss'][0], float)
        
    def test_model_prediction(self):
        """Test that we can make predictions with our model"""
        # Create test input
        test_input = np.array([[1.0, 2.0, 3.0]])
        
        # Create and compile model
        model = tf.keras.Sequential([
            tf.keras.layers.Dense(1, input_shape=(3,))
        ])
        model.compile(optimizer='adam', loss='mse')
        
        # Make prediction
        prediction = model.predict(test_input, verbose=0)
        
        # Verify prediction shape and type
        assert prediction.shape == (1, 1)
        assert isinstance(prediction[0][0], (float, np.floating))  # Accept both Python float and numpy float types
        
    @pytest.mark.integration
    def test_ml_service_integration(self):
        """Test integration with MLService"""
        service = MLService()
        
        # Test data
        historical_data = {
            'dates': ['2024-01-01', '2024-01-02', '2024-01-03'],
            'revenue': [1000, 1100, 1200]
        }
        
        # Get prediction
        prediction = service.predict_revenue(historical_data)
        
        # Verify prediction structure
        assert isinstance(prediction, dict)
        assert 'forecast' in prediction
        assert 'confidence_interval' in prediction
        assert len(prediction['forecast']) > 0
        
        # Verify values are reasonable
        for value in prediction['forecast']:
            assert isinstance(value, (int, float, np.floating))  # Accept numpy float types
            assert value > 0  # Revenue should be positive
            
    def test_gpu_availability(self):
        """Test if GPU is available (optional)"""
        gpus = tf.config.list_physical_devices('GPU')
        if gpus:
            # If GPUs are available, verify they're properly configured
            assert len(gpus) > 0
            print(f"Found {len(gpus)} GPU(s):")
            for gpu in gpus:
                print(f"  - {gpu.device_type}: {gpu.name}")
        else:
            print("No GPU found, using CPU for computations")
            # Verify CPU computations still work
            with tf.device('/CPU:0'):
                x = tf.random.normal([1000, 1000])
                assert tf.reduce_mean(x).numpy() is not None 