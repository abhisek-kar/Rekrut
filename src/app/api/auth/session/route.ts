import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/nextauth";

// This route is maintained for backward compatibility
// It returns information about the current session
export async function GET(request: NextRequest) {
  try {
    // Get the session from NextAuth
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { message: "Not authenticated" },
        { status: 401 }
      );
    }

    // Return session data
    return NextResponse.json({
      user: session.user,
      expires: session.expires
    });
  } catch (error) {
    console.error("Session error:", error);
    return NextResponse.json(
      { message: "An error occurred while retrieving session" },
      { status: 500 }
    );
  }
}
