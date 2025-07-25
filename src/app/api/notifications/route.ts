import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import dbConnect from "@/lib/db/connect";
import { authOptions } from "@/lib/auth/nextauth";
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUnreadNotificationCount,
} from "@/lib/email/notifications";

export const dynamic = "force-dynamic";

// GET: Fetch user notifications
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // Get session to verify authentication
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const type = searchParams.get("type") || undefined;
    const unreadOnly = searchParams.get("unreadOnly") === "true";

    // Get notifications
    const result = await getUserNotifications(
      session.user.id,
      page,
      limit,
      type
    );

    // Get unread count
    const unreadCount = await getUnreadNotificationCount(session.user.id);

    return NextResponse.json({
      ...result,
      unreadCount,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

// PUT: Mark notifications as read
export async function PUT(request: NextRequest) {
  try {
    await dbConnect();

    // Get session to verify authentication
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { notificationId, markAll } = body;

    if (markAll) {
      // Mark all notifications as read
      await markAllNotificationsAsRead(session.user.id);

      return NextResponse.json({
        success: true,
        message: "All notifications marked as read",
      });
    } else if (notificationId) {
      // Mark specific notification as read
      await markNotificationAsRead(notificationId, session.user.id);

      return NextResponse.json({
        success: true,
        message: "Notification marked as read",
      });
    } else {
      return NextResponse.json(
        { error: "Either notificationId or markAll must be provided" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error updating notifications:", error);
    return NextResponse.json(
      { error: "Failed to update notifications" },
      { status: 500 }
    );
  }
}
