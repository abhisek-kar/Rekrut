import { NextRequest, NextResponse } from "next/server";

import dbConnect from "@/lib/db/connect";
import { auth } from "@/auth";
import { markNotificationAsRead } from "@/lib/email/notifications";

// PUT: Mark specific notification as read
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    // Get session to verify authentication
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Mark notification as read
    await markNotificationAsRead(params.id, session.user.id);

    return NextResponse.json({
      success: true,
      message: "Notification marked as read",
    });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return NextResponse.json(
      { error: "Failed to mark notification as read" },
      { status: 500 }
    );
  }
}
