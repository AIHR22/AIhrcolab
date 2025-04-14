# API Testing Tools

This repository includes tools for testing the API endpoints of the HR Suite application. These tools help verify that the API endpoints are functioning correctly and meeting the expected requirements.

## Quick API Testing

You can test a single API endpoint directly using the following command:

```bash
npm run api:test <endpoint> <method>
```

For example:
- To test getting all employees: `npm run api:test /employees GET`
- To test creating a new project: `npm run api:test /projects POST`

This will execute the test and show you the response from the API endpoint.

## Comprehensive Testing

To test all API endpoints at once, use:

```bash
npm run test:all
```

Or to test only the implemented endpoints:

```bash
npm run test:actual
```

This script:
1. Automatically discovers all API endpoints in the repository
2. Generates appropriate test request data for each endpoint
3. Tests each endpoint and reports success/failure
4. Tracks IDs from POST requests and uses them for subsequent ID-based endpoint tests
5. Shows a summary of test results (success rate, failed endpoints)
6. Saves detailed test results to a JSON file for reference

### Key Features Implemented

The API testing framework includes these enhancements:

- UUID validation for ID parameters with proper error handling
- Improved request body generation for different entity types
- Smart ID extraction from responses for relational testing
- Detailed error reporting with specific error messages
- Test results saved with timestamps for tracking improvements
- Colorized console output for better readability

## Environment Variables

The testing tools use environment variables from `.env.local` for configuration:

- `NEXT_PUBLIC_API_BASE_URL`: Base URL for API requests (default: http://localhost:3000)
- `TEST_EMAIL` and `TEST_USER_ID`: Used for authentication bypass in test mode
- `BYPASS_AUTH`: Set to 'true' to bypass authentication checks (default: true)

If no `.env.local` file is found, the tests will use default values.

## Current Implementation Status

The following API endpoints have been implemented and tested:

- **Employees**: Full CRUD operations - GET, POST, PUT, DELETE
- **Projects**: Full CRUD operations - GET, POST, PUT, DELETE
- **Payroll**: Full CRUD operations - GET, POST, PUT, DELETE
- **Revenue**: Full CRUD operations - GET, POST, PUT, DELETE
- **Skills**: Full CRUD operations - GET, POST, PUT, DELETE

Each endpoint supports proper validation, error handling, and schema compliance. 