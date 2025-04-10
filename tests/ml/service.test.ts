import { MLService } from '../../src/ml/service';
import * as tf from '@tensorflow/tfjs-node';
import { createClient } from '@supabase/supabase-js';

// Mock Supabase
const mockSupabaseFrom = jest.fn();
const mockSupabaseSelect = jest.fn();
const mockSupabaseEq = jest.fn();
const mockSupabaseOrder = jest.fn();
const mockSupabaseLimit = jest.fn();
const mockSupabaseSingle = jest.fn();
const mockSupabaseInsert = jest.fn();

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: mockSupabaseFrom
  }))
}));

// Mock TensorFlow.js
jest.mock('@tensorflow/tfjs-node', () => ({
  loadLayersModel: jest.fn(() => ({
    predict: jest.fn(() => ({
      data: jest.fn(() => Promise.resolve(new Float32Array([0.5]))),
      dispose: jest.fn()
    })),
    dispose: jest.fn()
  })),
  tensor2d: jest.fn(() => ({
    dispose: jest.fn()
  })),
  sequential: jest.fn(() => ({
    add: jest.fn(),
    compile: jest.fn(),
    fit: jest.fn(() => Promise.resolve()),
    toJSON: jest.fn(() => ({})),
    dispose: jest.fn()
  })),
  layers: {
    dense: jest.fn(() => ({}))
  },
  train: {
    adam: jest.fn(() => ({}))
  },
  io: {
    fromMemory: jest.fn((topology) => topology)
  }
}));

describe('MLService', () => {
  let mlService: MLService;
  
  const mockConfig = {
    modelRegistry: './test_models',
    featureStore: './test_features',
    togetherApiKey: 'test-key'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset the mock chain
    mockSupabaseFrom.mockReturnValue({
      select: mockSupabaseSelect.mockReturnValue({
        eq: mockSupabaseEq.mockReturnValue({
          order: mockSupabaseOrder.mockReturnValue({
            limit: mockSupabaseLimit.mockReturnValue({
              single: mockSupabaseSingle.mockResolvedValue({
                data: {
                  model_topology: {
                    modelTopology: {
                      class_name: 'Sequential',
                      config: {
                        layers: [
                          {
                            class_name: 'Dense',
                            config: {
                              units: 1,
                              activation: 'linear',
                              use_bias: true
                            }
                          }
                        ]
                      }
                    }
                  }
                },
                error: null
              })
            })
          })
        })
      }),
      insert: mockSupabaseInsert.mockResolvedValue({ data: {}, error: null })
    });
    
    mlService = new MLService(mockConfig);
  });

  describe('predict', () => {
    it('should make predictions with valid input', async () => {
      const features = { feature1: 1, feature2: 2 };
      const context = {
        projectId: 'test-project',
        userId: 'test-user'
      };

      const result = await mlService.predict(features, context);
      
      expect(result).toBe(0.5);
      expect(createClient).toHaveBeenCalled();
      expect(tf.loadLayersModel).toHaveBeenCalled();
      expect(tf.tensor2d).toHaveBeenCalledWith([[1, 2]]);
    });

    it('should throw error when no model is found', async () => {
      // Mock Supabase to return null model
      mockSupabaseSingle.mockResolvedValueOnce({
        data: null,
        error: new Error('No model found')
      });

      const features = { feature1: 1 };
      const context = {
        projectId: 'test-project',
        userId: 'test-user'
      };

      await expect(mlService.predict(features, context))
        .rejects
        .toThrow('No model found for project');
    });
  });

  describe('trainModel', () => {
    it('should train model with valid input', async () => {
      const features = [{ feature1: 1, feature2: 2 }];
      const labels = [1];
      const projectId = 'test-project';

      await mlService.trainModel(projectId, features, labels);

      expect(tf.sequential).toHaveBeenCalled();
      expect(tf.tensor2d).toHaveBeenCalledTimes(2); // Once for features, once for labels
      expect(tf.train.adam).toHaveBeenCalledWith(0.001);
      expect(mockSupabaseFrom).toHaveBeenCalledWith('ml_models');
      expect(mockSupabaseInsert).toHaveBeenCalled();
    });

    it('should handle empty feature set', async () => {
      const features: Record<string, number>[] = [];
      const labels: number[] = [];
      const projectId = 'test-project';

      await expect(mlService.trainModel(projectId, features, labels))
        .rejects
        .toThrow('Cannot train model with empty dataset');
    });
  });
}); 