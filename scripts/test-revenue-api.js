const axios = require('axios');
const assert = require('assert');

const BASE_URL = 'http://localhost:3000/api';
const PROJECT_ID = 'test-project-id'; // Replace with actual project ID
const AUTH_TOKEN = 'your-auth-token'; // Replace with actual JWT token

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Authorization': `Bearer ${AUTH_TOKEN}`,
    'Content-Type': 'application/json'
  }
});

async function testRevenueEndpoints() {
  try {
    // GET /api/revenue/current
    const currentRes = await axiosInstance.get('/revenue/current');
    assert.strictEqual(currentRes.status, 200);
    assert(currentRes.data.amount && typeof currentRes.data.amount === 'number');

    // GET /api/revenue/trends
    const trendsRes = await axiosInstance.get('/revenue/trends');
    assert.strictEqual(trendsRes.status, 200);
    assert(Array.isArray(trendsRes.data.trends));

    // GET /api/revenue/model
    const modelRes = await axiosInstance.get('/revenue/model');
    assert.strictEqual(modelRes.status, 200);
    assert(modelRes.data.employeeCount && modelRes.data.avgSalary);

    // GET /api/revenue/projects
    const projectsRes = await axiosInstance.get('/revenue/projects');
    assert.strictEqual(projectsRes.status, 200);
    assert(Array.isArray(projectsRes.data.projects));

    // GET /api/revenue/projects/:id
    const projectRes = await axiosInstance.get(`/revenue/projects/${PROJECT_ID}`);
    assert.strictEqual(projectRes.status, 200);
    assert(projectRes.data.id === PROJECT_ID);

    // GET /api/revenue/departments
    const deptsRes = await axiosInstance.get('/revenue/departments');
    assert.strictEqual(deptsRes.status, 200);
    assert(Array.isArray(deptsRes.data.departments));

    // GET /api/revenue/comparison
    const comparisonRes = await axiosInstance.get('/revenue/comparison?timeFrame=monthly&metric=revenue');
    assert.strictEqual(comparisonRes.status, 200);
    assert(typeof comparisonRes.data === 'object');

    // GET /api/revenue/historical
    const historicalRes = await axiosInstance.get('/revenue/historical');
    assert.strictEqual(historicalRes.status, 200);
    assert(Array.isArray(historicalRes.data.revenue));

    // GET /api/revenue/forecast
    const forecastRes = await axiosInstance.get('/revenue/forecast');
    assert.strictEqual(forecastRes.status, 200);
    assert(Array.isArray(forecastRes.data.forecasts));

    // GET /api/scenarios/company/predefined
    const predefinedRes = await axiosInstance.get('/scenarios/company/predefined');
    assert.strictEqual(predefinedRes.status, 200);
    assert(Array.isArray(predefinedRes.data.scenarios));

    // POST /api/scenarios/company/custom
    const customScenarioRes = await axiosInstance.post('/scenarios/company/custom', {
      scenario_ids: ['scenario-1'],
      parameters: {
        start_date: '2025-01-01',
        end_date: '2025-12-31',
        impact_factor: 1.2
      }
    });
    assert.strictEqual(customScenarioRes.status, 200);
    assert(Array.isArray(customScenarioRes.data.impact));

    // GET /api/scenarios/project/:id/predefined
    const projectScenariosRes = await axiosInstance.get(`/scenarios/project/${PROJECT_ID}/predefined`);
    assert.strictEqual(projectScenariosRes.status, 200);
    assert(Array.isArray(projectScenariosRes.data.scenarios));

    // POST /api/scenarios/project/:id/custom
    const projectCustomRes = await axiosInstance.post(`/scenarios/project/${PROJECT_ID}/custom`, {
      scenario_ids: ['scenario-1'],
      parameters: {
        start_date: '2025-01-01',
        end_date: '2025-12-31',
        impact_factor: 1.2
      }
    });
    assert.strictEqual(projectCustomRes.status, 200);
    assert(Array.isArray(projectCustomRes.data.impact));

    console.log('All tests passed! ✅');
  } catch (error) {
    console.error('Test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Status code:', error.response.status);
    }
    process.exit(1);
  }
}

testRevenueEndpoints();
