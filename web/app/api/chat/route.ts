/**
 * DEPRECATED: /api/chat has been moved to /api/v1/ai/chat
 * 
 * This endpoint is kept for backward compatibility and will redirect
 * all requests to the new location.
 * 
 * Please update your client code to use /api/v1/ai/chat instead.
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  console.warn('[DEPRECATED] /api/chat called - redirecting to /api/v1/ai/chat');
  
  // Get the request body
  const body = await request.json();
  
  // Get the base URL
  const url = new URL(request.url);
  const baseUrl = `${url.protocol}//${url.host}`;
  
  // Forward the request to the new endpoint
  const response = await fetch(`${baseUrl}/api/v1/ai/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': request.headers.get('Authorization') || '',
    },
    body: JSON.stringify(body),
  });

  // Return the response with the same headers and body
  return new Response(response.body, {
    status: response.status,
    headers: response.headers,
  });
}
