import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
import { getFeatureFlags } from '@/lib/env';
import { auth } from '@/auth';

export async function POST(request: NextRequest) {
  try {
    // Get session to verify authentication
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Only admins can test email
    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only admins can test email configuration' },
        { status: 403 }
      );
    }

    const { emailEnabled } = getFeatureFlags();

    if (!emailEnabled) {
      return NextResponse.json(
        { 
          error: 'Email is not configured', 
          message: 'Please check your email environment variables: EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASSWORD' 
        },
        { status: 400 }
      );
    }

    const { to } = await request.json();
    
    if (!to) {
      return NextResponse.json(
        { error: 'Email address is required' },
        { status: 400 }
      );
    }

    // Send test email
    await sendEmail({
      to: to,
      subject: 'Rekrut ATS - Email Configuration Test',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 30px 20px; text-align: center; color: white; margin-bottom: 30px;">
            <h1 style="margin: 0; font-size: 28px;">🎉 Email Test Successful!</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Your Rekrut ATS email configuration is working correctly</p>
          </div>
          
          <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981; margin-bottom: 20px;">
            <h3 style="color: #166534; margin: 0 0 10px 0;">✅ Configuration Status</h3>
            <ul style="color: #166534; margin: 0; padding-left: 20px;">
              <li>Email server connection: Working</li>
              <li>SMTP authentication: Successful</li>
              <li>Email delivery: Confirmed</li>
            </ul>
          </div>
          
          <p style="color: #374151; line-height: 1.6;">
            This test email confirms that your Rekrut ATS email notification system is properly configured and ready to send:
          </p>
          
          <ul style="color: #374151; line-height: 1.6;">
            <li>Job assignment notifications</li>
            <li>Application confirmation emails</li>
            <li>Status update notifications</li>
            <li>Account creation emails</li>
            <li>Password reset emails</li>
          </ul>
          
          <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; border-left: 4px solid #ef4444; margin: 20px 0;">
            <h4 style="color: #dc2626; margin: 0 0 10px 0;">🔐 Security Reminder</h4>
            <p style="color: #dc2626; margin: 0; font-size: 14px;">
              This test email was sent by an admin user. If you did not request this test, please contact your system administrator.
            </p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <p style="color: #64748b; font-size: 12px;">
              Sent from Rekrut ATS • ${new Date().toLocaleString()}
            </p>
          </div>
        </div>
      `,
      text: `
        🎉 Email Test Successful!
        
        Your Rekrut ATS email configuration is working correctly.
        
        Configuration Status:
        ✅ Email server connection: Working
        ✅ SMTP authentication: Successful  
        ✅ Email delivery: Confirmed
        
        This confirms that your email notification system is ready to send:
        - Job assignment notifications
        - Application confirmation emails
        - Status update notifications
        - Account creation emails
        - Password reset emails
        
        Sent from Rekrut ATS • ${new Date().toLocaleString()}
      `
    });

    return NextResponse.json({
      success: true,
      message: `Test email sent successfully to ${to}`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Email test error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to send test email',
        message: error instanceof Error ? error.message : 'Unknown error',
        details: 'Please check your email configuration in environment variables'
      },
      { status: 500 }
    );
  }
}
