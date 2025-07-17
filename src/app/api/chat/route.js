import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.message || !body.user_id) {
      return NextResponse.json({ 
        success: false, 
        error: 'Message and user_id are required' 
      }, { status: 400 });
    }

    // Get backend URL from environment variables
    const backendUrl = process.env.NEXT_PUBLIC_OZ_BACKEND_URL || process.env.OZ_BACKEND_URL || 'http://localhost:8001';
    
    // Make request to the backend service
    const response = await fetch(`${backendUrl}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: body.user_id,
        message: body.message
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend error response:', errorText);
      throw new Error(`Backend service error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    // Return the response from the backend
    return NextResponse.json({
      success: true,
      response: data.response
    });

  } catch (error) {
    console.error('Chat API error:', error);
    
    // Return a user-friendly error message
    return NextResponse.json({ 
      success: false, 
      error: 'Sorry, Ozzie is having trouble responding right now. Please try again later.',
      details: error.message
    }, { status: 500 });
  }
} 