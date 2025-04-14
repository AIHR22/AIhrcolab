# API Testing Tools

This directory contains tools for testing the API endpoints of the HR Suite application.

## Full Application Testing

To test every single endpoint in your entire application at once:

```bash
npm run test:all
```

This powerful testing script will:
1. Automatically detect all API endpoints in your application
2. Extract supported HTTP methods from each route file
3. Test each endpoint with appropriate request data
4. Group results by module for easier analysis
5. Generate a comprehensive test report
6. Automatically start your development server if it's not running

The script performs intelligent testing with the following features:
- Intelligently determines appropriate request bodies for each endpoint
- Handles authentication bypass for testing
- Sequential testing to avoid overwhelming the server
- Detailed logging with success/failure indicators
- Summary report with success rate and failed endpoints
- Full test results saved to a JSON file

## Quick API Testing

The fastest way to test a single API endpoint is using the direct testing script:

```bash
npm run api:test <endpoint> <method>
```

Examples:
```bash
# Test GET endpoints
npm run api:test /departments GET
npm run api:test /skills GET
npm run api:test /test-llama GET

# Test POST endpoints
npm run api:test /workforce/forecasting POST
npm run api:test /workforce/skill-gap POST
npm run api:test /workforce/workload POST
npm run api:test /workforce/project-feasibility POST
```

This script will:
1. Make an HTTP request to the specified endpoint
2. Automatically generate appropriate request body for POST requests
3. Display the response with formatting
4. Exit with code 0 for success or 1 for failure

## Automated Testing

To run automated tests for all API endpoints using Jest:

```bash
npm run test:gen
```

This will:
1. Scan the `app/api` directory for all route files
2. Generate test cases for each endpoint
3. Run all tests against the API

## Custom Test Cases

To run predefined test cases:

```bash
npm run test:api
```

This runs the tests defined in `tests/api.test.ts`.

## Testing a Single Endpoint

To test a specific endpoint with Jest:

```bash
npm run test:endpoint <endpoint> <method>
```

Examples:
```bash
npm run test:endpoint /departments GET
npm run test:endpoint /workforce/forecasting POST
```

## Environment Variables

The testing tools use environment variables from `.env.local`. You can set custom test values:

```
# API base URL (default: http://localhost:3000/api)
API_BASE_URL=http://localhost:3000/api

# Test data
TEST_DEPARTMENT_ID=9af54c45-848c-48f0-9b76-681f58054076
TEST_SKILL_ID=550e8400-e29b-41d4-a716-446655440000

# Authentication bypass for testing
BYPASS_AUTH=true
```

## Troubleshooting

If you encounter issues with Jest, try:

1. Ensuring all dependencies are installed:
   ```bash
   npm install -D jest ts-jest @types/jest node-fetch@2 @types/node-fetch@2 dotenv
   ```

2. Using the direct testing script which doesn't require Jest:
   ```bash
   npm run api:test <endpoint> <method>
   ```

3. Running the app in a separate terminal:
   ```bash
   npm run dev
   ``` 