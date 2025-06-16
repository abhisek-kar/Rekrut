export interface EmailTemplate {
  subject: string;
  html: string;
  text?: string;
}

export interface EmailTemplateVariables {
  [key: string]: any;
}

// Replace template variables in email content
function replaceVariables(
  content: string,
  variables: EmailTemplateVariables
): string {
  return content.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return variables[key] || match;
  });
}

// Base email wrapper
function wrapEmailContent(content: string, title: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
      <div style="max-width: 600px; margin: 0 auto; background-color: white; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 30px 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">Rekrut ATS</h1>
          <p style="color: #e0e7ff; margin: 5px 0 0 0; font-size: 14px;">Your AI-Powered Recruitment Platform</p>
        </div>
        
        <!-- Content -->
        <div style="padding: 40px 30px;">
          ${content}
        </div>
        
        <!-- Footer -->
        <div style="background-color: #f8fafc; padding: 20px 30px; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="color: #64748b; font-size: 12px; margin: 0;">
            © ${new Date().getFullYear()} Rekrut ATS. All rights reserved.
          </p>
          <p style="color: #64748b; font-size: 12px; margin: 5px 0 0 0;">
            This email was sent to you as part of your Rekrut ATS account activity.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Button component for emails
function createButton(
  text: string,
  url: string,
  color: string = "#4f46e5"
): string {
  return `
    <div style="text-align: center; margin: 30px 0;">
      <a href="${url}" style="
        display: inline-block;
        background-color: ${color};
        color: white;
        padding: 14px 28px;
        text-decoration: none;
        border-radius: 6px;
        font-weight: bold;
        font-size: 16px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      ">${text}</a>
    </div>
  `;
}

// =============================================================================
// JOB-RELATED EMAIL TEMPLATES
// =============================================================================

export function generateJobAssignmentEmail(variables: {
  recipientName: string;
  jobTitle: string;
  companyName: string;
  assignedBy: string;
  jobUrl: string;
  appUrl: string;
}): EmailTemplate {
  const content = `
    <h2 style="color: #1e293b; margin: 0 0 20px 0;">New Job Assignment</h2>
    
    <p style="color: #334155; font-size: 16px; line-height: 1.6;">
      Hello <strong>${variables.recipientName}</strong>,
    </p>
    
    <p style="color: #334155; font-size: 16px; line-height: 1.6;">
      You have been assigned to manage a new job posting:
    </p>
    
    <div style="background-color: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4f46e5;">
      <h3 style="color: #1e293b; margin: 0 0 10px 0; font-size: 18px;">${
        variables.jobTitle
      }</h3>
      <p style="color: #64748b; margin: 0; font-size: 14px;">
        <strong>Company:</strong> ${variables.companyName}<br>
        <strong>Assigned by:</strong> ${variables.assignedBy}
      </p>
    </div>
    
    <p style="color: #334155; font-size: 16px; line-height: 1.6;">
      You can now start managing applications for this position and handle the entire recruitment process.
    </p>
    
    ${createButton("View Job Details", variables.jobUrl)}
    
    <p style="color: #64748b; font-size: 14px; line-height: 1.6;">
      You can also access this job from your dashboard at any time by logging into your Rekrut ATS account.
    </p>
  `;

  return {
    subject: `New Job Assignment: ${variables.jobTitle}`,
    html: wrapEmailContent(content, "New Job Assignment"),
    text: `Hello ${variables.recipientName},\n\nYou have been assigned to manage a new job posting: ${variables.jobTitle} at ${variables.companyName}.\n\nView job details: ${variables.jobUrl}\n\nBest regards,\nThe Rekrut Team`,
  };
}

export function generateJobApplicationReceivedEmail(variables: {
  recipientName: string;
  candidateName: string;
  jobTitle: string;
  applicationUrl: string;
  candidateEmail: string;
  applicationDate: string;
}): EmailTemplate {
  const content = `
    <h2 style="color: #1e293b; margin: 0 0 20px 0;">New Job Application Received</h2>
    
    <p style="color: #334155; font-size: 16px; line-height: 1.6;">
      Hello <strong>${variables.recipientName}</strong>,
    </p>
    
    <p style="color: #334155; font-size: 16px; line-height: 1.6;">
      You have received a new application for one of your job postings:
    </p>
    
    <div style="background-color: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
      <h3 style="color: #1e293b; margin: 0 0 15px 0; font-size: 18px;">${
        variables.jobTitle
      }</h3>
      <div style="color: #64748b; font-size: 14px; line-height: 1.6;">
        <p style="margin: 0 0 8px 0;"><strong>Candidate:</strong> ${
          variables.candidateName
        }</p>
        <p style="margin: 0 0 8px 0;"><strong>Email:</strong> ${
          variables.candidateEmail
        }</p>
        <p style="margin: 0;"><strong>Applied on:</strong> ${
          variables.applicationDate
        }</p>
      </div>
    </div>
    
    <p style="color: #334155; font-size: 16px; line-height: 1.6;">
      Review the candidate's profile, resume, and application details to move forward with the recruitment process.
    </p>
    
    ${createButton("Review Application", variables.applicationUrl, "#10b981")}
    
    <p style="color: #64748b; font-size: 14px; line-height: 1.6;">
      Don't forget to update the application status once you've reviewed the candidate's information.
    </p>
  `;

  return {
    subject: `New Application: ${variables.candidateName} applied for ${variables.jobTitle}`,
    html: wrapEmailContent(content, "New Job Application"),
    text: `Hello ${variables.recipientName},\n\nYou have received a new application from ${variables.candidateName} for ${variables.jobTitle}.\n\nEmail: ${variables.candidateEmail}\nApplied on: ${variables.applicationDate}\n\nReview application: ${variables.applicationUrl}\n\nBest regards,\nThe Rekrut Team`,
  };
}

export function generateJobStatusChangeEmail(variables: {
  recipientName: string;
  jobTitle: string;
  oldStatus: string;
  newStatus: string;
  reason?: string;
  jobUrl: string;
  changedBy: string;
}): EmailTemplate {
  const statusColors: Record<string, string> = {
    active: "#10b981",
    closed: "#ef4444",
    paused: "#f59e0b",
    archived: "#6b7280",
  };

  const statusColor = statusColors[variables.newStatus] || "#4f46e5";

  const content = `
    <h2 style="color: #1e293b; margin: 0 0 20px 0;">Job Status Updated</h2>
    
    <p style="color: #334155; font-size: 16px; line-height: 1.6;">
      Hello <strong>${variables.recipientName}</strong>,
    </p>
    
    <p style="color: #334155; font-size: 16px; line-height: 1.6;">
      The status of one of your job postings has been updated:
    </p>
    
    <div style="background-color: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${statusColor};">
      <h3 style="color: #1e293b; margin: 0 0 15px 0; font-size: 18px;">${
        variables.jobTitle
      }</h3>
      <div style="color: #64748b; font-size: 14px; line-height: 1.6;">
        <p style="margin: 0 0 8px 0;">
          <strong>Status changed from:</strong> 
          <span style="text-transform: capitalize;">${
            variables.oldStatus
          }</span>
        </p>
        <p style="margin: 0 0 8px 0;">
          <strong>Status changed to:</strong> 
          <span style="color: ${statusColor}; font-weight: bold; text-transform: capitalize;">${
    variables.newStatus
  }</span>
        </p>
        <p style="margin: 0 0 8px 0;"><strong>Changed by:</strong> ${
          variables.changedBy
        }</p>
        ${
          variables.reason
            ? `<p style="margin: 0;"><strong>Reason:</strong> ${variables.reason}</p>`
            : ""
        }
      </div>
    </div>
    
    ${createButton("View Job Details", variables.jobUrl)}
  `;

  return {
    subject: `Job Status Updated: ${variables.jobTitle} is now ${variables.newStatus}`,
    html: wrapEmailContent(content, "Job Status Updated"),
    text: `Hello ${variables.recipientName},\n\nThe status of "${
      variables.jobTitle
    }" has been changed from "${variables.oldStatus}" to "${
      variables.newStatus
    }" by ${variables.changedBy}.\n\n${
      variables.reason ? `Reason: ${variables.reason}\n\n` : ""
    }View job: ${variables.jobUrl}\n\nBest regards,\nThe Rekrut Team`,
  };
}

// =============================================================================
// APPLICATION-RELATED EMAIL TEMPLATES
// =============================================================================

export function generateApplicationConfirmationEmail(variables: {
  candidateName: string;
  jobTitle: string;
  companyName: string;
  applicationDate: string;
  trackingToken?: string;
  statusUrl?: string;
}): EmailTemplate {
  const content = `
    <h2 style="color: #1e293b; margin: 0 0 20px 0;">Application Confirmation</h2>
    
    <p style="color: #334155; font-size: 16px; line-height: 1.6;">
      Dear <strong>${variables.candidateName}</strong>,
    </p>
    
    <p style="color: #334155; font-size: 16px; line-height: 1.6;">
      Thank you for your interest in joining our team! We have successfully received your application.
    </p>
    
    <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #0ea5e9;">
      <h3 style="color: #1e293b; margin: 0 0 15px 0; font-size: 18px;">${
        variables.jobTitle
      }</h3>
      <div style="color: #64748b; font-size: 14px; line-height: 1.6;">
        <p style="margin: 0 0 8px 0;"><strong>Company:</strong> ${
          variables.companyName
        }</p>
        <p style="margin: 0 0 8px 0;"><strong>Applied on:</strong> ${
          variables.applicationDate
        }</p>
        ${
          variables.trackingToken
            ? `<p style="margin: 0;"><strong>Application ID:</strong> ${variables.trackingToken}</p>`
            : ""
        }
      </div>
    </div>
    
    <div style="background-color: #fefce8; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #eab308;">
      <h4 style="color: #a16207; margin: 0 0 10px 0; font-size: 16px;">What happens next?</h4>
      <ul style="color: #a16207; font-size: 14px; line-height: 1.6; margin: 0; padding-left: 20px;">
        <li>Our recruitment team will review your application</li>
        <li>We'll contact you within 5-7 business days if your profile matches our requirements</li>
        <li>If selected, we'll schedule an initial interview</li>
      </ul>
    </div>
    
    ${
      variables.statusUrl
        ? createButton(
            "Track Application Status",
            variables.statusUrl,
            "#0ea5e9"
          )
        : ""
    }
    
    <p style="color: #64748b; font-size: 14px; line-height: 1.6;">
      We appreciate your interest in our company and look forward to potentially working together.
    </p>
  `;

  return {
    subject: `Application Confirmed: ${variables.jobTitle} at ${variables.companyName}`,
    html: wrapEmailContent(content, "Application Confirmation"),
    text: `Dear ${variables.candidateName},\n\nThank you for applying for ${
      variables.jobTitle
    } at ${
      variables.companyName
    }.\n\nWe have successfully received your application on ${
      variables.applicationDate
    }.\n\nOur recruitment team will review your application and contact you within 5-7 business days if your profile matches our requirements.\n\n${
      variables.trackingToken
        ? `Application ID: ${variables.trackingToken}\n`
        : ""
    }${
      variables.statusUrl
        ? `Track your application: ${variables.statusUrl}\n`
        : ""
    }\nBest regards,\nThe ${variables.companyName} Team`,
  };
}

export function generateApplicationStatusChangeEmail(variables: {
  candidateName: string;
  jobTitle: string;
  companyName: string;
  oldStatus: string;
  newStatus: string;
  message?: string;
  nextSteps?: string;
  interviewDetails?: {
    date: string;
    time: string;
    location?: string;
    interviewers?: string[];
  };
}): EmailTemplate {
  const statusMessages: Record<
    string,
    { title: string; color: string; icon: string }
  > = {
    screened: {
      title: "Application Under Review",
      color: "#0ea5e9",
      icon: "👀",
    },
    interview_scheduled: {
      title: "Interview Scheduled",
      color: "#10b981",
      icon: "📅",
    },
    interviewed: { title: "Interview Completed", color: "#8b5cf6", icon: "✅" },
    offered: { title: "Job Offer Extended", color: "#10b981", icon: "🎉" },
    hired: { title: "Welcome to the Team!", color: "#10b981", icon: "🎊" },
    rejected: { title: "Application Update", color: "#ef4444", icon: "📋" },
  };

  const statusInfo = statusMessages[variables.newStatus] || {
    title: "Application Status Updated",
    color: "#4f46e5",
    icon: "📄",
  };

  const content = `
    <h2 style="color: #1e293b; margin: 0 0 20px 0;">
      ${statusInfo.icon} ${statusInfo.title}
    </h2>
    
    <p style="color: #334155; font-size: 16px; line-height: 1.6;">
      Dear <strong>${variables.candidateName}</strong>,
    </p>
    
    <p style="color: #334155; font-size: 16px; line-height: 1.6;">
      We have an update regarding your application for <strong>${
        variables.jobTitle
      }</strong> at ${variables.companyName}.
    </p>
    
    <div style="background-color: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${
      statusInfo.color
    };">
      <h3 style="color: #1e293b; margin: 0 0 15px 0; font-size: 18px;">${
        variables.jobTitle
      }</h3>
      <div style="color: #64748b; font-size: 14px; line-height: 1.6;">
        <p style="margin: 0 0 8px 0;">
          <strong>Status:</strong> 
          <span style="color: ${
            statusInfo.color
          }; font-weight: bold; text-transform: capitalize;">
            ${variables.newStatus.replace("_", " ")}
          </span>
        </p>
      </div>
    </div>
    
    ${
      variables.message
        ? `
      <div style="background-color: #fafafa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0;">
          ${variables.message}
        </p>
      </div>
    `
        : ""
    }
    
    ${
      variables.interviewDetails
        ? `
      <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
        <h4 style="color: #166534; margin: 0 0 15px 0; font-size: 16px;">Interview Details</h4>
        <div style="color: #166534; font-size: 14px; line-height: 1.6;">
          <p style="margin: 0 0 8px 0;"><strong>Date:</strong> ${
            variables.interviewDetails.date
          }</p>
          <p style="margin: 0 0 8px 0;"><strong>Time:</strong> ${
            variables.interviewDetails.time
          }</p>
          ${
            variables.interviewDetails.location
              ? `<p style="margin: 0 0 8px 0;"><strong>Location:</strong> ${variables.interviewDetails.location}</p>`
              : ""
          }
          ${
            variables.interviewDetails.interviewers &&
            variables.interviewDetails.interviewers.length > 0
              ? `<p style="margin: 0;"><strong>Interviewers:</strong> ${variables.interviewDetails.interviewers.join(
                  ", "
                )}</p>`
              : ""
          }
        </div>
      </div>
    `
        : ""
    }
    
    ${
      variables.nextSteps
        ? `
      <div style="background-color: #fefce8; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #eab308;">
        <h4 style="color: #a16207; margin: 0 0 10px 0; font-size: 16px;">Next Steps</h4>
        <p style="color: #a16207; font-size: 14px; line-height: 1.6; margin: 0;">
          ${variables.nextSteps}
        </p>
      </div>
    `
        : ""
    }
    
    <p style="color: #64748b; font-size: 14px; line-height: 1.6;">
      ${
        variables.newStatus === "rejected"
          ? "We appreciate your interest in our company and encourage you to apply for future opportunities that match your skills."
          : "Thank you for your continued interest. We look forward to the next steps in our recruitment process."
      }
    </p>
  `;

  return {
    subject: `${statusInfo.title}: ${variables.jobTitle} at ${variables.companyName}`,
    html: wrapEmailContent(content, statusInfo.title),
    text: `Dear ${
      variables.candidateName
    },\n\nWe have an update regarding your application for ${
      variables.jobTitle
    } at ${variables.companyName}.\n\nStatus: ${variables.newStatus.replace(
      "_",
      " "
    )}\n\n${variables.message ? `${variables.message}\n\n` : ""}${
      variables.nextSteps ? `Next Steps: ${variables.nextSteps}\n\n` : ""
    }Best regards,\nThe ${variables.companyName} Team`,
  };
}

// =============================================================================
// SYSTEM EMAIL TEMPLATES
// =============================================================================

export function generateAccountCreatedEmail(variables: {
  recipientName: string;
  email: string;
  role: string;
  setupUrl: string;
  createdBy: string;
}): EmailTemplate {
  const content = `
    <h2 style="color: #1e293b; margin: 0 0 20px 0;">Welcome to Rekrut ATS!</h2>
    
    <p style="color: #334155; font-size: 16px; line-height: 1.6;">
      Hello <strong>${variables.recipientName}</strong>,
    </p>
    
    <p style="color: #334155; font-size: 16px; line-height: 1.6;">
      An account has been created for you on Rekrut ATS by ${
        variables.createdBy
      }.
    </p>
    
    <div style="background-color: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4f46e5;">
      <h3 style="color: #1e293b; margin: 0 0 15px 0; font-size: 18px;">Account Details</h3>
      <div style="color: #64748b; font-size: 14px; line-height: 1.6;">
        <p style="margin: 0 0 8px 0;"><strong>Email:</strong> ${
          variables.email
        }</p>
        <p style="margin: 0;"><strong>Role:</strong> ${
          variables.role.charAt(0).toUpperCase() + variables.role.slice(1)
        }</p>
      </div>
    </div>
    
    <p style="color: #334155; font-size: 16px; line-height: 1.6;">
      To complete your account setup and create your password, click the button below:
    </p>
    
    ${createButton("Set Up Account", variables.setupUrl)}
    
    <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444;">
      <h4 style="color: #dc2626; margin: 0 0 10px 0; font-size: 16px;">⚠️ Important Security Note</h4>
      <p style="color: #dc2626; font-size: 14px; line-height: 1.6; margin: 0;">
        This setup link will expire in 24 hours for security reasons. Please complete your account setup as soon as possible.
      </p>
    </div>
    
    <p style="color: #64748b; font-size: 14px; line-height: 1.6;">
      If you have any questions or need assistance, please contact your administrator.
    </p>
  `;

  return {
    subject: "Welcome to Rekrut ATS - Complete Your Account Setup",
    html: wrapEmailContent(content, "Welcome to Rekrut ATS"),
    text: `Hello ${variables.recipientName},\n\nAn account has been created for you on Rekrut ATS by ${variables.createdBy}.\n\nEmail: ${variables.email}\nRole: ${variables.role}\n\nTo complete your account setup, visit: ${variables.setupUrl}\n\nThis link will expire in 24 hours.\n\nBest regards,\nThe Rekrut Team`,
  };
}

export function generateBulkOperationCompleteEmail(variables: {
  recipientName: string;
  operationType: string;
  affectedCount: number;
  entityType: string;
  details?: string;
}): EmailTemplate {
  const content = `
    <h2 style="color: #1e293b; margin: 0 0 20px 0;">Bulk Operation Completed</h2>
    
    <p style="color: #334155; font-size: 16px; line-height: 1.6;">
      Hello <strong>${variables.recipientName}</strong>,
    </p>
    
    <p style="color: #334155; font-size: 16px; line-height: 1.6;">
      Your bulk operation has been completed successfully.
    </p>
    
    <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
      <h3 style="color: #166534; margin: 0 0 15px 0; font-size: 18px;">Operation Summary</h3>
      <div style="color: #166534; font-size: 14px; line-height: 1.6;">
        <p style="margin: 0 0 8px 0;"><strong>Operation:</strong> ${
          variables.operationType
        }</p>
        <p style="margin: 0 0 8px 0;"><strong>Items affected:</strong> ${
          variables.affectedCount
        } ${variables.entityType}(s)</p>
        <p style="margin: 0;"><strong>Completed at:</strong> ${new Date().toLocaleString()}</p>
      </div>
    </div>
    
    ${
      variables.details
        ? `
      <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h4 style="color: #374151; margin: 0 0 10px 0; font-size: 16px;">Additional Details</h4>
        <p style="color: #374151; font-size: 14px; line-height: 1.6; margin: 0;">
          ${variables.details}
        </p>
      </div>
    `
        : ""
    }
    
    <p style="color: #64748b; font-size: 14px; line-height: 1.6;">
      You can view the updated items in your dashboard.
    </p>
  `;

  return {
    subject: `Bulk Operation Completed: ${variables.operationType} on ${variables.affectedCount} ${variables.entityType}(s)`,
    html: wrapEmailContent(content, "Bulk Operation Completed"),
    text: `Hello ${
      variables.recipientName
    },\n\nYour bulk operation has been completed successfully.\n\nOperation: ${
      variables.operationType
    }\nItems affected: ${variables.affectedCount} ${
      variables.entityType
    }(s)\nCompleted at: ${new Date().toLocaleString()}\n\n${
      variables.details ? `Details: ${variables.details}\n\n` : ""
    }Best regards,\nThe Rekrut Team`,
  };
}

// =============================================================================
// INTERVIEW NOTIFICATION EMAIL
// =============================================================================

export interface InterviewNotificationVariables {
  interviewerEmail: string;
  candidateName: string;
  jobTitle: string;
  interviewDateTime: string;
  interviewType: string;
  duration: number;
  location?: string;
  videoLink?: string;
  timezone: string;
  notes?: string;
  companyName?: string;
}

function generateInterviewNotificationEmail(
  variables: InterviewNotificationVariables
): EmailTemplate {
  const content = `
    <h2 style="color: #1e293b; margin: 0 0 20px 0; font-size: 24px;">Interview Scheduled</h2>
    
    <p style="color: #475569; font-size: 16px; line-height: 1.6;">
      Hello,
    </p>
    
    <p style="color: #475569; font-size: 16px; line-height: 1.6;">
      You have been scheduled as an interviewer for the following interview:
    </p>
    
    <div style="background-color: #f1f5f9; padding: 25px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #3b82f6;">
      <h3 style="color: #1e40af; margin: 0 0 20px 0; font-size: 20px;">Interview Details</h3>
      <div style="color: #1e40af; font-size: 14px; line-height: 1.8;">
        <p style="margin: 0 0 10px 0;"><strong>Candidate:</strong> ${
          variables.candidateName
        }</p>
        <p style="margin: 0 0 10px 0;"><strong>Position:</strong> ${
          variables.jobTitle
        }</p>
        <p style="margin: 0 0 10px 0;"><strong>Date & Time:</strong> ${
          variables.interviewDateTime
        }</p>
        <p style="margin: 0 0 10px 0;"><strong>Timezone:</strong> ${
          variables.timezone
        }</p>
        <p style="margin: 0 0 10px 0;"><strong>Duration:</strong> ${
          variables.duration
        } minutes</p>
        <p style="margin: 0 0 10px 0;"><strong>Type:</strong> ${
          variables.interviewType
        }</p>
        
        ${
          variables.location
            ? `
          <p style="margin: 0 0 10px 0;"><strong>Location:</strong> ${variables.location}</p>
        `
            : ""
        }
        
        ${
          variables.videoLink
            ? `
          <p style="margin: 0 0 10px 0;"><strong>Video Link:</strong> <a href="${variables.videoLink}" style="color: #3b82f6; text-decoration: none;">${variables.videoLink}</a></p>
        `
            : ""
        }
      </div>
    </div>
    
    ${
      variables.notes
        ? `
      <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
        <h4 style="color: #92400e; margin: 0 0 10px 0; font-size: 16px;">Additional Notes</h4>
        <p style="color: #92400e; font-size: 14px; line-height: 1.6; margin: 0;">
          ${variables.notes}
        </p>
      </div>
    `
        : ""
    }
    
    <div style="background-color: #ecfdf5; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #10b981;">
      <h4 style="color: #065f46; margin: 0 0 15px 0; font-size: 16px;">Next Steps</h4>
      <ul style="color: #065f46; font-size: 14px; line-height: 1.6; margin: 0; padding-left: 20px;">
        <li>Review the candidate's application in the ATS system</li>
        <li>Prepare interview questions relevant to the role</li>
        <li>Join the interview at the scheduled time</li>
        <li>Submit your feedback after the interview</li>
      </ul>
    </div>
    
    <p style="color: #64748b; font-size: 14px; line-height: 1.6;">
      Please mark your calendar and prepare for this interview. If you have any questions or need to reschedule, please contact the hiring team immediately.
    </p>
    
    <p style="color: #64748b; font-size: 14px; line-height: 1.6;">
      Best regards,<br>
      The Hiring Team${
        variables.companyName ? ` at ${variables.companyName}` : ""
      }
    </p>
  `;

  return {
    subject: `Interview Scheduled: ${variables.candidateName} for ${variables.jobTitle}`,
    html: wrapEmailContent(content, "Interview Scheduled"),
    text: `Hello,\n\nYou have been scheduled as an interviewer for the following interview:\n\nCandidate: ${
      variables.candidateName
    }\nPosition: ${variables.jobTitle}\nDate & Time: ${
      variables.interviewDateTime
    }\nTimezone: ${variables.timezone}\nDuration: ${
      variables.duration
    } minutes\nType: ${variables.interviewType}\n${
      variables.location ? `Location: ${variables.location}\n` : ""
    }${variables.videoLink ? `Video Link: ${variables.videoLink}\n` : ""}${
      variables.notes ? `\nNotes: ${variables.notes}\n` : ""
    }\n\nPlease mark your calendar and prepare for this interview.\n\nBest regards,\nThe Hiring Team${
      variables.companyName ? ` at ${variables.companyName}` : ""
    }`,
  };
}

// =============================================================================
// TEMPLATE GENERATION FUNCTIONS
// =============================================================================

export function getEmailTemplate(
  type: string,
  variables: EmailTemplateVariables
): EmailTemplate | null {
  switch (type) {
    case "job_assignment":
      return generateJobAssignmentEmail(variables as any);
    case "job_application_received":
      return generateJobApplicationReceivedEmail(variables as any);
    case "job_status_change":
      return generateJobStatusChangeEmail(variables as any);
    case "application_confirmation":
      return generateApplicationConfirmationEmail(variables as any);
    case "application_status_change":
      return generateApplicationStatusChangeEmail(variables as any);
    case "account_created":
      return generateAccountCreatedEmail(variables as any);
    case "bulk_operation_complete":
      return generateBulkOperationCompleteEmail(variables as any);
    case "interview_notification":
      return generateInterviewNotificationEmail(variables as any);
    default:
      return null;
  }
}
