import { Request, Response } from 'express';
import request from 'supertest';
import express from 'express';
import { createClient } from '@supabase/supabase-js';
import { MLService } from '../../../src/ml/service';

// Mock dependencies before importing the router
const mockSupabaseFrom = jest.fn();
const mockSupabaseSelect = jest.fn();
const mockSupabaseEq = jest.fn();
const mockSupabaseSingle = jest.fn();
const mockSupabaseInsert = jest.fn();

// Mock dependencies
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: mockSupabaseFrom
  }))
}));

// Mock MLService
jest.mock('../../../src/ml/service', () => ({
  MLService: jest.fn().mockImplementation(() => ({
    predict: jest.fn().mockResolvedValue(0.75)
  }))
}));

// Mock authentication middleware
jest.mock('../../../src/api/middleware/auth', () => ({
  authenticateRequest: (req: Request, res: Response, next: () => void) => {
    req.user = {
      id: 'test-user-id',
      email: 'test@example.com',
      role: 'user'
    };
    next();
  }
}));

// Mock Config
jest.mock('../../../src/config', () => ({
  Config: {
    ML_CONFIG: {
      modelRegistry: './test_models',
      featureStore: './test_features',
      togetherApiKey: 'test-key'
    }
  }
}));

// Import the router after all mocks are set up
import mlRouter from '../../../src/api/routes/ml';

describe('ML Routes', () => {
  let app: express.Application;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup project members check
    mockSupabaseFrom.mockImplementation((table) => {
      if (table === 'project_members') {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockImplementation((field: string) => {
              if (field === 'project_id') {
                return {
                  eq: jest.fn().mockImplementation((field: string) => {
                    if (field === 'user_id') {
                      return {
                        single: mockSupabaseSingle.mockResolvedValue({
                          data: { role: 'user' },
                          error: null
                        })
                      };
                    }
                    return {}; // Fallback
                  })
                };
              }
              return {}; // Fallback
            })
          })
        };
      } else if (table === 'ml_metrics') {
        return {
          insert: mockSupabaseInsert.mockResolvedValue({ data: {}, error: null })
        };
      }
      return {
        select: () => ({
          eq: () => ({
            order: () => ({
              limit: () => ({
                single: () => ({
                  data: { model_topology: {} },
                  error: null
                })
              })
            })
          })
        })
      };
    });
    
    app = express();
    app.use(express.json());
    app.use('/api/ml', mlRouter);
  });

  describe('POST /predict', () => {
    const validBody = {
      projectId: '123e4567-e89b-12d3-a456-426614174000',
      features: { feature1: 1, feature2: 2 }
    };

    it('should validate request body', async () => {
      const response = await request(app)
        .post('/api/ml/predict')
        .send({});
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should check project access', async () => {
      // Mock no project access
      mockSupabaseSingle.mockResolvedValueOnce({
        data: null,
        error: new Error('No access')
      });

      const response = await request(app)
        .post('/api/ml/predict')
        .send(validBody);
      
      expect(response.status).toBe(403);
      expect(response.body).toEqual({
        error: 'Not authorized to access this project'
      });
    });

    it('should return prediction for valid request', async () => {
      const mockPrediction = 0.75;
      
      const response = await request(app)
        .post('/api/ml/predict')
        .send(validBody);
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        prediction: mockPrediction
      });
    });

    it('should handle ML service errors', async () => {
      // Override the default mock
      (MLService as jest.Mock).mockImplementationOnce(() => ({
        predict: jest.fn().mockRejectedValue(new Error('ML service error'))
      }));

      const response = await request(app)
        .post('/api/ml/predict')
        .send(validBody);
      
      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        error: 'Prediction failed',
        message: 'ML service error'
      });
    });
  });
}); 