// Load environment variables for testing
require('dotenv').config({ path: '.env.local' });

// Set mock values for testing if not provided in environment
process.env.TEST_DEPARTMENT_ID = process.env.TEST_DEPARTMENT_ID || '550e8400-e29b-41d4-a716-446655440000';
process.env.TEST_SKILL_ID = process.env.TEST_SKILL_ID || '550e8400-e29b-41d4-a716-446655440000';

// Set bypass auth for testing
process.env.BYPASS_AUTH = 'true'; 