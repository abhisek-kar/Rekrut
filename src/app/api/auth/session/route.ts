import { NextRequest, NextResponse } from "next/server";
import User from "@/models/User";
import dbConnect from "@/lib/db/connect";
import jwt from "jsonwebtoken";

export async function GET(request: NextRequest) {
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

    // Make sure JWT_SECRET is set
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error("JWT_SECRET is not set in environment variables");
      return NextResponse.json(
        { message: "Server configuration error" },
        { status: 500 }
      );
    }

    // Verify token
    const decodedToken = jwt.verify(token, jwtSecret) as { 
      id: string; 
      email: string; 
      role: string;
      exp: number;
    };

    // Connect to database
    await dbConnect();

    // Get user data from database
    const user = await User.findById(decodedToken.id).select(
      "-password -resetPasswordToken -resetPasswordExpires -setupToken -setupTokenExpires"
    );

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    // Check if user is active
    if (user.status !== "active") {
      return NextResponse.json(
        { message: "User account is inactive" },
        { status: 403 }
      );
    }

    // For backward compatibility with client-side token usage,
    // we'll generate a new token if the existing one is close to expiry
    let refreshedToken = null;
    const now = Math.floor(Date.now() / 1000);
    const timeUntilExpiry = decodedToken.exp - now;
    
    // If token expires in less than 1 day (86400 seconds), refresh it
    if (timeUntilExpiry < 86400) {
      refreshedToken = jwt.sign(
        {
          id: user._id,
          email: user.email,
          role: user.role,
        },
        jwtSecret,
        {
          expiresIn: "7d", // New token valid for 7 days
        }
      );
      
      // Update the cookie with the new token
      const response = NextResponse.json({
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          profilePhoto: user.profilePhoto,
        },
        permissions: user.permissions || [],
        token: refreshedToken, // Include refreshed token in response for client
      });
      
      // Set the refreshed token as a cookie
      response.cookies.set({
        name: "auth_token",
        value: refreshedToken,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
        path: "/",
      });
      
      return response;
    }

    // Return user information
    return NextResponse.json({
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        profilePhoto: user.profilePhoto,
      },
      permissions: user.permissions || [],
    });
  } catch (error) {
    console.error("Session verification error:", error);
    return NextResponse.json(
      { message: "Invalid or expired token" },
      { status: 401 }
    );
  }
}
