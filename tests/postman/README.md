# HR Suite Postman Test Collections

This directory contains Postman collections to test the HR Suite application's API endpoints.

## Collections

1. **HR Suite - Account Management Tests** (`hr_suite_account_tests.json`)
   - Tests for authentication, user profile, and user settings functionality
   - Validates the newly implemented "My Account" features

2. **HR Suite - Revenue Forecasting Tests** (`hr_suite_revenue_forecasting_tests.json`) 
   - Tests for revenue data retrieval, forecasting, and scenario analysis
   - Includes tests for the scenario API endpoints

## How to Use

### Prerequisites

- [Postman](https://www.postman.com/downloads/) installed on your computer
- HR Suite application running (locally or deployed)

### Import the Collections

1. Open Postman
2. Click on "Import" in the top-left corner
3. Drag and drop the JSON files or browse to select them
4. Click "Import"

### Configure Environment Variables

Before running the tests, you need to set up an environment with the following variables:

1. Create a new environment in Postman (click "Environments" > "+" button)
2. Add the following variables:
   - `base_url`: Your HR Suite application URL (e.g., `http://localhost:3000`)
   - `user_email`: A valid user email for testing
   - `user_password`: The corresponding password

### Running the Tests

1. Select the imported collection from the Collections panel
2. Make sure your environment is selected in the environment dropdown (top-right)
3. Click the "Run" button to open the Collection Runner
4. Select which requests to run
5. Click "Run [Collection Name]"

## Test Flow

### Account Management Tests

These tests follow this sequence:
1. Authenticate a user
2. Retrieve user profile information
3. Update profile information
4. Retrieve user settings
5. Update various user settings
6. Sign out

### Revenue Forecasting Tests

These tests follow this sequence:
1. Authenticate a user
2. Retrieve current revenue data
3. Retrieve historical revenue data
4. Generate revenue forecasts
5. Test scenario analysis endpoints
6. Test project-specific revenue endpoints

## Authentication

Both collections handle authentication automatically:
- The login request stores the access token as a collection variable
- Subsequent requests use this token for authorization
- The token is cleared on logout

## Error Handling

Tests include error checking and validation of response structures. If a test fails, Postman will indicate which test failed and why, making it easier to identify and fix issues.

## Customizing Tests

You can modify the test data in the request bodies to test different scenarios:
- Try different user settings combinations
- Test various forecasting parameters
- Test different scenario types and parameters

## Note on Security

These test collections contain credentials and should be kept secure. Never commit actual passwords to version control.
