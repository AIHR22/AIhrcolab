import { Request, Response } from 'express';
import { authenticateRequest } from '../../../src/api/middleware/auth';
import { createClient } from '@supabase/supabase-js';

// Mock Supabase
jest.mock('@supabase/supabase-js', () => {
  const mockGetUser = jest.fn();
  return {
    createClient: jest.fn(() => ({
      auth: {
        getUser: mockGetUser
      }
    }))
  };
});

describe('Authentication Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: jest.Mock;
  let mockGetUser: jest.Mock;

  beforeEach(() => {
    mockReq = {
      headers: {}
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    mockNext = jest.fn();
    
    // Get a reference to the mocked getUser function
    mockGetUser = (createClient('', '') as any).auth.getUser;
    
    // Clear mocks
    jest.clearAllMocks();
  });

  it('should reject requests without authorization header', async () => {
    await authenticateRequest(
      mockReq as Request,
      mockRes as Response,
      mockNext
    );

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'No token provided' });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should reject invalid tokens', async () => {
    mockReq.headers = {
      authorization: 'Bearer invalid-token'
    };

    mockGetUser.mockResolvedValueOnce({
      data: { user: null },
      error: new Error('Invalid token')
    });

    await authenticateRequest(
      mockReq as Request,
      mockRes as Response,
      mockNext
    );

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Invalid token' });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should accept valid tokens and attach user', async () => {
    mockReq.headers = {
      authorization: 'Bearer valid-token'
    };

    mockGetUser.mockResolvedValueOnce({
      data: { 
        user: {
          id: 'test-user-id',
          email: 'test@example.com',
          app_metadata: { role: 'user' }
        }
      },
      error: null
    });

    await authenticateRequest(
      mockReq as Request,
      mockRes as Response,
      mockNext
    );

    expect(mockReq.user).toEqual({
      id: 'test-user-id',
      email: 'test@example.com',
      role: 'user'
    });
    expect(mockNext).toHaveBeenCalled();
  });

  it('should handle Supabase errors gracefully', async () => {
    mockReq.headers = {
      authorization: 'Bearer valid-token'
    };

    mockGetUser.mockRejectedValueOnce(
      new Error('Supabase error')
    );

    await authenticateRequest(
      mockReq as Request,
      mockRes as Response,
      mockNext
    );

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Authentication failed' });
    expect(mockNext).not.toHaveBeenCalled();
  });
}); 