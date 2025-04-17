import { NextRequest, NextResponse } from "next/server";
import User from "@/models/User";
import dbConnect from "@/lib/db/connect";
import jwt from "jsonwebtoken";

export async function POST(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get("authorization");
    
    // Check both authorization header and cookie
    const token = authHeader && authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : request.cookies.get("auth_token")?.value;
    
    if (!token) {
      return NextResponse.json(
        { message: "Authentication required" },
        { status: 401 }
      );
    }

    try {
      // Make sure JWT_SECRET is set
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        console.error("JWT_SECRET is not set in environment variables");
        throw new Error("Server configuration error");
      }
      
      // Verify token
      const decodedToken = jwt.verify(token, jwtSecret) as { 
        id: string; 
        email: string; 
        role: string 
      };

      // Connect to database
      await dbConnect();

      // Update last logout timestamp for user
      await User.findByIdAndUpdate(decodedToken.id, {
        lastLogout: new Date(),
      });
    } catch (error) {
      // Even if token verification fails, we'll still clear the cookie
      console.error("Token verification error during logout:", error);
    }

    // Create response
    const response = NextResponse.json({
      success: true,
      message: "Successfully logged out",
    });

    // Clear the auth_token cookie
    response.cookies.set({
      name: "auth_token",
      value: "",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      expires: new Date(0), // Expire immediately
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { message: "An error occurred during logout" },
      { status: 500 }
    );
  }
}
