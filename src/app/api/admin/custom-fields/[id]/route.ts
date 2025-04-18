import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/nextauth';
import dbConnect from '@/lib/db/connect';
import CustomField from '@/models/CustomField';
import Activity from '@/models/Activity';
import mongoose from 'mongoose';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Validate id
    if (!params.id || !mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: "Invalid custom field ID" }, 
        { status: 400 }
      );
    }

    // Connect to database
    await dbConnect();

    // Fetch custom field
    const customField = await CustomField.findById(params.id).lean();

    if (!customField) {
      return NextResponse.json(
        { error: "Custom field not found" }, 
        { status: 404 }
      );
    }

    return NextResponse.json({ field: customField });
  } catch (error) {
    console.error("Error fetching custom field:", error);
    return NextResponse.json(
      { error: "Failed to fetch custom field" }, 
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Validate id
    if (!params.id || !mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: "Invalid custom field ID" }, 
        { status: 400 }
      );
    }

    // Connect to database
    await dbConnect();

    // Check if field exists
    const existingField = await CustomField.findById(params.id);
    if (!existingField) {
      return NextResponse.json(
        { error: "Custom field not found" }, 
        { status: 404 }
      );
    }

    // Parse request body
    const body = await req.json();

    // Update fields
    const updatedFields: any = {
      label: body.label !== undefined ? body.label : existingField.label,
      type: body.type !== undefined ? body.type : existingField.type,
      options: body.options !== undefined ? body.options : existingField.options,
      placeholder: body.placeholder !== undefined ? body.placeholder : existingField.placeholder,
      helpText: body.helpText !== undefined ? body.helpText : existingField.helpText,
      validation: body.validation !== undefined ? body.validation : existingField.validation,
      defaultValue: body.defaultValue !== undefined ? body.defaultValue : existingField.defaultValue,
      isVisible: body.isVisible !== undefined ? body.isVisible : existingField.isVisible,
      visibleTo: body.visibleTo !== undefined ? body.visibleTo : existingField.visibleTo,
      order: body.order !== undefined ? body.order : existingField.order,
    };

    // Update custom field
    const updatedField = await CustomField.findByIdAndUpdate(
      params.id,
      { $set: updatedFields },
      { new: true }
    );

    // Log activity
    await Activity.create({
      userId: session.user.id,
      action: 'update',
      entityType: 'custom_field',
      entityId: params.id,
      details: {
        name: updatedField.label,
        entity: updatedField.entity,
        changes: Object.keys(updatedFields).join(', ')
      },
      ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
      userAgent: req.headers.get('user-agent') || 'unknown'
    });

    return NextResponse.json({
      field: updatedField,
      message: "Custom field updated successfully"
    });
  } catch (error) {
    console.error("Error updating custom field:", error);
    return NextResponse.json(
      { error: "Failed to update custom field" }, 
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Validate id
    if (!params.id || !mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: "Invalid custom field ID" }, 
        { status: 400 }
      );
    }

    // Connect to database
    await dbConnect();

    // Check if field exists
    const existingField = await CustomField.findById(params.id);
    if (!existingField) {
      return NextResponse.json(
        { error: "Custom field not found" }, 
        { status: 404 }
      );
    }

    // Save field details for activity log
    const fieldDetails = {
      name: existingField.label,
      entity: existingField.entity,
      type: existingField.type
    };

    // Delete custom field
    await CustomField.findByIdAndDelete(params.id);

    // Log activity
    await Activity.create({
      userId: session.user.id,
      action: 'delete',
      entityType: 'custom_field',
      entityId: params.id,
      details: fieldDetails,
      ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
      userAgent: req.headers.get('user-agent') || 'unknown'
    });

    return NextResponse.json({
      success: true,
      message: "Custom field deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting custom field:", error);
    return NextResponse.json(
      { error: "Failed to delete custom field" }, 
      { status: 500 }
    );
  }
}
