import { NextResponse } from 'next/server'

let requestId = 0;

type RouteHandler = (request: Request) => Promise<Response>;

export function withDataFlowLogging(handler: RouteHandler): RouteHandler {
  return async (request: Request) => {
    const currentRequestId = ++requestId;
    const startTime = Date.now();

    // Log incoming request
    console.log(`\n📥 [${currentRequestId}] Incoming Request:`, {
      timestamp: new Date().toISOString(),
      method: request.method,
      url: request.url,
      headers: Object.fromEntries(request.headers.entries())
    });

    try {
      // Clone request to read body (if any)
      if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
        const body = await request.clone().json();
        console.log(`📦 [${currentRequestId}] Request Body:`, body);
      }

      // Process request through handler
      console.log(`⚙️  [${currentRequestId}] Processing Request...`);
      const response = await handler(request);

      // Log response
      const responseData = response instanceof NextResponse ? await response.clone().json() : response;
      console.log(`📤 [${currentRequestId}] Response:`, {
        timestamp: new Date().toISOString(),
        duration: `${Date.now() - startTime}ms`,
        status: response.status,
        data: responseData
      });

      return response;
    } catch (error: any) {
      // Log error
      console.error(`❌ [${currentRequestId}] Error:`, {
        timestamp: new Date().toISOString(),
        duration: `${Date.now() - startTime}ms`,
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  };
}
