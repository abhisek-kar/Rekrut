import { NextResponse } from 'next/server';

// This route is maintained for backward compatibility
// NextAuth now handles authentication via /api/auth/[...nextauth]

// This route is maintained for backward compatibility
// NextAuth now handles authentication via /api/auth/[...nextauth]
export async function POST() {
  return NextResponse.json(
    { 
      message: "This endpoint is deprecated. Please use NextAuth authentication." 
    },
    { status: 308 } // Permanent Redirect status
  );
}
