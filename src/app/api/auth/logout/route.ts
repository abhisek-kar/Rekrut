import { NextRequest, NextResponse } from "next/server";

// This route is maintained for backward compatibility
// NextAuth handles logout via its signOut function
export async function POST(request: NextRequest) {
  return NextResponse.json(
    { 
      message: "This endpoint is deprecated. Please use NextAuth signOut function.", 
      success: true
    },
    { status: 200 }
  );
}
