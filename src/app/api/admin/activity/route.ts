import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/nextauth';
import dbConnect from '@/lib/db/connect';
import Activity from '@/models/Activity';
import User from '@/models/User';
import { formatDistanceToNow } from 'date-fns';

export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated and has admin role
    if (!session || !session.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Connect to database
    await dbConnect();

    // Get query parameters
    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const page = parseInt(url.searchParams.get('page') || '1');
    const skip = (page - 1) * limit;
    const activityType = url.searchParams.get('type') || undefined;

    // Build filter
    const filter: { entityType?: string } = {};
    if (activityType && activityType !== 'all') {
      filter.entityType = activityType;
    }

    // Fetch activities with pagination
    const [activities, totalCount] = await Promise.all([
      Activity.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'firstName lastName profilePhoto')
        .lean(),
      
      Activity.countDocuments(filter)
    ]);

    // Process and format activities
    const formattedActivities = activities.map(activity => {
      const user = activity.userId as { firstName: string; lastName: string; profilePhoto?: string } | null;
      const userInitials = user ? 
        `${user.firstName[0]}${user.lastName[0]}`.toUpperCase() : 'UN';
      
      // Format the activity message
      let message = '';
      switch (activity.action) {
        case 'create':
          message = `created a new ${activity.entityType}`;
          break;
        case 'update':
          message = `updated a ${activity.entityType}`;
          break;
        case 'delete':
          message = `deleted a ${activity.entityType}`;
          break;
        case 'status_change':
          message = `changed status of a ${activity.entityType} to ${activity.details?.newStatus || 'unknown'}`;
          break;
        case 'login':
          message = 'logged into the system';
          break;
        case 'logout':
          message = 'logged out of the system';
          break;
        default:
          message = `performed action "${activity.action}" on a ${activity.entityType}`;
      }

      // Calculate relative time
      const relativeTime = formatDistanceToNow(new Date(activity.createdAt), { 
        addSuffix: true 
      });

      return {
        id: activity._id.toString(),
        userAvatar: user?.profilePhoto || null,
        userInitials,
        userName: user ? `${user.firstName} ${user.lastName}` : 'Unknown User',
        action: message,
        entityType: activity.entityType,
        entityId: activity.entityId?.toString() || '',
        entityName: activity.details?.name || `${activity.entityType} #${activity.entityId?.toString().slice(-5) || ''}`,
        timestamp: activity.createdAt.toISOString(),
        relativeTime,
        details: activity.details || {}
      };
    });

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return NextResponse.json({
      activities: formattedActivities,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNext,
        hasPrev
      }
    });
  } catch (error) {
    console.error("Error fetching activity feed:", error);
    return NextResponse.json(
      { error: "Failed to fetch activity feed" }, 
      { status: 500 }
    );
  }
}
