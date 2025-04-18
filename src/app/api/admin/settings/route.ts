import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/nextauth';
import dbConnect from '@/lib/db/connect';
import Setting from '@/models/Setting';
import Activity from '@/models/Activity';

export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Connect to database
    await dbConnect();

    // Get query parameters
    const url = new URL(req.url);
    const category = url.searchParams.get('category');

    // Build query
    const query: any = {};
    if (category) {
      query.category = category;
    }

    // Fetch settings
    const settings = await Setting.find(query).lean();
    
    // Transform to key-value by category
    const formattedSettings: Record<string, Record<string, any>> = {};
    
    settings.forEach(setting => {
      if (!formattedSettings[setting.category]) {
        formattedSettings[setting.category] = {};
      }
      
      formattedSettings[setting.category] = {
        ...formattedSettings[setting.category],
        ...setting.settings
      };
    });

    return NextResponse.json({ settings: formattedSettings });
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" }, 
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Connect to database
    await dbConnect();

    // Parse request body
    const body = await req.json();
    
    // Validate required fields
    if (!body.category || !body.settings || typeof body.settings !== 'object') {
      return NextResponse.json(
        { error: "Invalid request format" }, 
        { status: 400 }
      );
    }

    // Find existing setting document for this category
    let setting = await Setting.findOne({ category: body.category });
    
    if (setting) {
      // Update existing settings
      setting.settings = {
        ...setting.settings,
        ...body.settings
      };
      setting.updatedBy = session.user.id;
      await setting.save();
    } else {
      // Create new settings document
      setting = new Setting({
        category: body.category,
        settings: body.settings,
        updatedBy: session.user.id
      });
      await setting.save();
    }

    // Log activity
    await Activity.create({
      userId: session.user.id,
      action: 'update',
      entityType: 'settings',
      entityId: setting._id,
      details: {
        category: body.category,
        changedKeys: Object.keys(body.settings).join(', ')
      },
      ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
      userAgent: req.headers.get('user-agent') || 'unknown'
    });

    return NextResponse.json({
      settings: setting.settings,
      message: "Settings updated successfully"
    });
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { error: "Failed to update settings" }, 
      { status: 500 }
    );
  }
}
