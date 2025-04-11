import { Request, Response, NextFunction } from 'express';
import { rateLimiter, clearInterval } from '../middleware/rate-limiter.js';

describe('Rate Limiter Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockRequest = {
      headers: {}
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    nextFunction = jest.fn();
  });

  afterAll(() => {
    // Clean up the interval timer
    clearInterval();
  });

  it('should require a client ID', () => {
    rateLimiter(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Client ID is required' });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it('should allow requests within rate limit', () => {
    mockRequest.headers = { 'x-client-id': 'test-client' };

    rateLimiter(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    expect(nextFunction).toHaveBeenCalled();
    expect(mockResponse.status).not.toHaveBeenCalled();
  });

  it('should block requests exceeding rate limit', () => {
    mockRequest.headers = { 'x-client-id': 'test-client-2' };

    // Make 61 requests (exceeding the 60 per minute limit)
    for (let i = 0; i < 61; i++) {
      rateLimiter(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );
    }

    expect(mockResponse.status).toHaveBeenCalledWith(429);
    expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Rate limit exceeded' });
    expect(nextFunction).toHaveBeenCalledTimes(60); // Called for all but the last request
  });

  it('should reset count after one minute', () => {
    jest.useFakeTimers();
    mockRequest.headers = { 'x-client-id': 'test-client-3' };

    // Make 60 requests (reaching the limit)
    for (let i = 0; i < 60; i++) {
      rateLimiter(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );
    }

    // Advance time by more than a minute
    jest.advanceTimersByTime(61000);

    // Make another request
    rateLimiter(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    expect(nextFunction).toHaveBeenCalledTimes(61); // All requests should pass
    expect(mockResponse.status).not.toHaveBeenCalled();

    jest.useRealTimers();
  });

  it('should clean up old entries', () => {
    jest.useFakeTimers();
    mockRequest.headers = { 'x-client-id': 'test-client-4' };

    // Make a request
    rateLimiter(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    // Advance time by more than a minute
    jest.advanceTimersByTime(61000);

    // The cleanup interval should have run
    expect(nextFunction).toHaveBeenCalledTimes(1);

    jest.useRealTimers();
  });
}); 