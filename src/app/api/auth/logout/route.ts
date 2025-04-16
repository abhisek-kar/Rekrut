import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import User from "@/models/User";
import dbConnect from "@/lib/db/connect";

export async function POST(request: NextRequest) {
  try {
    // Get authorization header
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ success: true });
    }

    // Extract token
    const token = authHeader.split(" ")[1];

    try {
      // Verify token
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "your-secret-key"
      ) as {
        id: string;
      };

      // Connect to database
      await dbConnect();

      // Log last logout time
      if (decoded && decoded.id) {
        await User.findByIdAndUpdate(decoded.id, {
          lastLogout: new Date(),
        });
      }
    } catch (tokenError) {
      // If token is invalid, that's fine, we still want to let the user logout
      console.error("Token error during logout:", tokenError);
    }

    // In a real application with HTTP-only cookies, you would clear the cookie here

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json({ success: true });
  }
}
