import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db/connect";
import User from "@/models/User";

export const dynamic = "force-dynamic";

// GET: Search users by email or name
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");
    const name = searchParams.get("name");
    const limit = parseInt(searchParams.get("limit") || "10");

    if (!email && !name) {
      return NextResponse.json(
        { error: "Email or name parameter is required" },
        { status: 400 }
      );
    }

    let query: any = {};

    if (email) {
      query.email = { $regex: email, $options: "i" };
    }

    if (name) {
      query.$or = [
        { firstName: { $regex: name, $options: "i" } },
        { lastName: { $regex: name, $options: "i" } },
      ];
    }

    const users = await User.find(query)
      .select("firstName lastName email profilePhoto")
      .limit(limit)
      .lean();

    return NextResponse.json(users);
  } catch (error) {
    console.error("Error searching users:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
