// src/app/api/protected-data/route.ts
import { NextRequest, NextResponse } from 'next/server';

const FASTAPI_BASE_URL = process.env.FASTAPI_BASE_URL;

export async function GET(request: NextRequest) {
  const authToken = request.headers.get('Authorization');

  if (!authToken) {
    return NextResponse.json({ detail: 'Authorization token not provided.' }, { status: 401 });
  }

  try {
    const response = await fetch(`${FASTAPI_BASE_URL}/protected-data`, {
      method: 'GET',
      headers: {
        'Authorization': authToken, // Forward the Firebase ID token
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      // Forward the error status and message from FastAPI
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error('Error proxying request to FastAPI:', error);
    return NextResponse.json({ detail: 'Internal server error while fetching data from backend.' }, { status: 500 });
  }
}