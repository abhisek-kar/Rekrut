import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/nextauth";
import dbConnect from "@/lib/db/connect";
import Setting from "@/models/Setting";
import nodemailer from "nodemailer";

export async function POST() {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Connect to database
    await dbConnect();

    // Fetch email settings
    const emailSettings = await Setting.findOne({ category: "email" }).lean();
    if (!emailSettings || !emailSettings.settings) {
      return NextResponse.json(
        { error: "Email settings not configured" },
        { status: 400 }
      );
    }

    const settings = emailSettings.settings;

    // Check required SMTP settings
    if (
      !settings.smtpHost ||
      !settings.smtpPort ||
      !settings.senderEmail ||
      !settings.senderName
    ) {
      return NextResponse.json(
        { error: "SMTP settings are incomplete" },
        { status: 400 }
      );
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: settings.smtpHost,
      port: settings.smtpPort,
      secure: settings.smtpSecure,
      auth: {
        user: settings.smtpUser,
        pass: settings.smtpPassword,
      },
    });

    // Create email content
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Rekrut ATS Test Email</h2>
        <p>This is a test email from your Rekrut Applicant Tracking System.</p>
        <p>If you're receiving this email, your email settings are configured correctly.</p>
        <hr />
        <p>SMTP Server: ${settings.smtpHost}</p>
        <p>Sender: ${settings.senderName} &lt;${settings.senderEmail}&gt;</p>
        <p>Time Sent: ${new Date().toLocaleString()}</p>
        ${
          settings.emailSignature
            ? `<div style="margin-top: 20px; border-top: 1px solid #eee; padding-top: 10px;">${settings.emailSignature}</div>`
            : ""
        }
      </div>
    `;

    // Send test email to the admin's email
    await transporter.sendMail({
      from: `"${settings.senderName}" <${settings.senderEmail}>`,
      to: session.user.email,
      subject: "Rekrut ATS - Test Email",
      html: htmlContent,
    });

    return NextResponse.json({
      success: true,
      message: "Test email sent successfully"
    });
  } catch (error: unknown) {
    console.error("Error sending test email:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      {
        error: "Failed to send test email",
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
