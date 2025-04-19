import axios from 'axios';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3001';
const AUTH_TOKEN = process.env.AUTH_TOKEN || 'test_token';
const TEST_PROJECT_ID = process.env.TEST_PROJECT_ID || 'project-1';

describe('Revenue and Scenarios API Tests', () => {
  const api = axios.create({
    baseURL: BASE_URL,
    headers: {
      'Authorization': `Bearer ${AUTH_TOKEN}`,
      'Content-Type': 'application/json'
    }
  });

  describe('Revenue API Endpoints', () => {
    it('GET /api/revenue/current - should return current revenue metrics', async () => {
      const response = await api.get('/api/revenue/current');
      expect(response.status).toBe(200);
      expect(response.data).toEqual(
        expect.objectContaining({
          monthly_revenue: expect.any(Number),
          annual_revenue: expect.any(Number),
          projected_revenue: expect.any(Number),
          profit_margin: expect.any(Number),
          growth_rate: expect.any(Number)
        })
      );
    });

    it('GET /api/revenue/model - should return revenue model parameters', async () => {
      const response = await api.get('/api/revenue/model');
      expect(response.status).toBe(200);
      expect(response.data).toEqual(
        expect.objectContaining({
          employee_count: expect.any(Number),
          avg_salary: expect.any(Number),
          revenue_per_employee: expect.any(Number)
        })
      );
    });

    it('POST /api/revenue/trends - should return revenue trends', async () => {
      const requestBody = {
        months: 12
      };
      const response = await api.post('/api/revenue/trends', requestBody);
      expect(response.status).toBe(200);
      expect(response.data).toEqual(
        expect.objectContaining({
          trends: expect.arrayContaining([
            expect.objectContaining({
              amount: expect.any(Number),
              date: expect.any(String),
              growthRate: expect.any(Number)
            })
          ])
        })
      );
    });

    it('GET /api/revenue/projects - should return list of projects', async () => {
      const response = await api.get('/api/revenue/projects');
      expect(response.status).toBe(200);
      expect(response.data).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(String),
            name: expect.any(String),
            status: expect.any(String),
            revenue: expect.any(Number)
          })
        ])
      );
    });

    it('GET /api/revenue/projects/:id - should return project details', async () => {
      const response = await api.get(`/api/revenue/projects/${TEST_PROJECT_ID}`);
      expect(response.status).toBe(200);
      expect(response.data).toEqual(
        expect.objectContaining({
          id: TEST_PROJECT_ID,
          name: expect.any(String),
          status: expect.any(String),
          revenue: expect.any(Number)
        })
      );
    });

    it('GET /api/revenue/departments - should return department revenues', async () => {
      const response = await api.get('/api/revenue/departments');
      expect(response.status).toBe(200);
      expect(response.data).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            department_id: expect.any(String),
            current_value: expect.any(Number),
            previous_value: expect.any(Number)
          })
        ])
      );
    });

    it('GET /api/revenue/comparison - should return revenue comparison data', async () => {
      const response = await api.get('/api/revenue/comparison?timeFrame=Monthly&metric=Revenue');
      expect(response.status).toBe(200);
      expect(response.data).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            period_date: expect.any(String),
            current_value: expect.any(Number),
            previous_value: expect.any(Number)
          })
        ])
      );
    });

    it('GET /api/revenue/historical - should return historical revenue data', async () => {
      const response = await api.get('/api/revenue/historical');
      expect(response.status).toBe(200);
      expect(response.data).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            date: expect.any(String),
            revenue: expect.any(Number)
          })
        ])
      );
    });

    it('POST /api/revenue/forecast - should return revenue forecast', async () => {
      const requestBody = {
        months: 12,
        parameters: {
          growth_rate: 5,
          seasonality: true,
          market_conditions: 'stable'
        }
      };

      const response = await api.post('/api/revenue/forecast', requestBody);
      expect(response.status).toBe(200);
      expect(response.data).toEqual(
        expect.objectContaining({
          forecasts: expect.arrayContaining([
            expect.objectContaining({
              date: expect.any(String),
              amount: expect.any(Number),
              confidence: expect.any(Number)
            })
          ])
        })
      );
    });
  });

  describe('Scenarios API Endpoints', () => {
    it('GET /api/scenarios/company/predefined - should return predefined company scenarios', async () => {
      const response = await api.get('/api/scenarios/company/predefined');
      expect(response.status).toBe(200);
      expect(response.data).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(String),
            name: expect.any(String),
            impact_amount: expect.any(Number)
          })
        ])
      );
    });

    it('POST /api/scenarios/company/custom - should calculate custom company scenario impact', async () => {
      const requestBody = {
        revenue_change: -10,
        cost_change: 5,
        timeframe: 'quarterly'
      };

      const response = await api.post('/api/scenarios/company/custom', requestBody);
      expect(response.status).toBe(200);
      expect(response.data).toEqual(
        expect.objectContaining({
          impact: expect.any(Number)
        })
      );
    });

    it('GET /api/scenarios/project/:id/predefined - should return predefined project scenarios', async () => {
      const response = await api.get(`/api/scenarios/project/${TEST_PROJECT_ID}/predefined`);
      expect(response.status).toBe(200);
      expect(response.data).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(String),
            name: expect.any(String),
            impact_amount: expect.any(Number)
          })
        ])
      );
    });

    it('POST /api/scenarios/project/:id/custom - should calculate custom project scenario impact', async () => {
      const requestBody = {
        delay_months: 2,
        resource_change: 10,
        scope_change: 'increase'
      };

      const response = await api.post(`/api/scenarios/project/${TEST_PROJECT_ID}/custom`, requestBody);
      expect(response.status).toBe(200);
      expect(response.data).toEqual(
        expect.objectContaining({
          impact: expect.any(Number)
        })
      );
    });

    it('POST /api/scenarios/parse - should parse scenario text and return parameters', async () => {
      const requestBody = {
        text: 'Calculate impact if revenue drops by 15% and costs increase by 8% over the next quarter'
      };

      const response = await api.post('/api/scenarios/parse', requestBody);
      expect(response.status).toBe(200);
      expect(response.data).toEqual(
        expect.objectContaining({
          parameters: expect.any(Object),
          impact: expect.any(Number)
        })
      );
    });
  });
});
