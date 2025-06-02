import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/nextauth';
import dbConnect from '@/lib/db/connect';
import CustomField from '@/models/CustomField';
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
    const entity = url.searchParams.get('entity');

    // Build query
    const query: { entity?: string } = {};
    if (entity) {
      query.entity = entity;
    }

    // Fetch custom fields
    const customFields = await CustomField.find(query).sort({ entity: 1, order: 1 }).lean();

    return NextResponse.json({ fields: customFields });
  } catch (error) {
    console.error("Error fetching custom fields:", error);
    return NextResponse.json(
      { error: "Failed to fetch custom fields" }, 
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
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
    if (!body.name || !body.label || !body.type || !body.entity) {
      return NextResponse.json(
        { error: "Missing required fields" }, 
        { status: 400 }
      );
    }

    // Get max order for this entity to place the new field at the end
    const maxOrderField = await CustomField.findOne({ entity: body.entity })
      .sort({ order: -1 })
      .lean();
    
    const newOrder = maxOrderField ? maxOrderField.order + 1 : 0;

    // Create new custom field
    const newField = new CustomField({
      name: body.name,
      label: body.label,
      type: body.type,
      entity: body.entity,
      options: body.options || [],
      placeholder: body.placeholder,
      helpText: body.helpText,
      validation: body.validation || {},
      defaultValue: body.defaultValue,
      isVisible: body.isVisible !== undefined ? body.isVisible : true,
      visibleTo: body.visibleTo || ['admin', 'subadmin'],
      order: newOrder,
      createdBy: session.user.id
    });

    await newField.save();

    // Log activity
    await Activity.create({
      userId: session.user.id,
      action: 'create',
      entityType: 'custom_field',
      entityId: newField._id,
      details: {
        name: newField.label,
        entity: newField.entity,
        type: newField.type
      },
      ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
      userAgent: req.headers.get('user-agent') || 'unknown'
    });

    return NextResponse.json({
      field: newField,
      message: "Custom field created successfully"
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating custom field:", error);
    return NextResponse.json(
      { error: "Failed to create custom field" }, 
      { status: 500 }
    );
  }
}
