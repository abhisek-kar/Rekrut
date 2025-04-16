# Rekrut ATS - UI & API Specifications

## Project Overview

Rekrut is a modern Applicant Tracking System (ATS) designed for recruitment agencies. The system enables efficient job posting, candidate tracking, and AI-powered resume screening. It supports two primary roles: **Admin** and **SubAdmin**.

This document outlines the detailed UI sections and corresponding API requirements for the system.

## Technology Stack

- **Frontend**: Next.js 14.1.4, Tailwind CSS 3.4.1, shadcn/ui
- **Backend**: Next.js API routes, TypeScript 5.4.3
- **Database**: MongoDB with Mongoose 8.0.0
- **Authentication**: NextAuth.js 4.24.5
- **File Storage**: AWS S3
- **AI Processing**: AWS Lambda, Amazon Textract, OpenAI/AWS SageMaker (future implementation)

## Component Structure

Following the Atomic Design pattern:
- **Atoms**: Basic UI elements (buttons, inputs, labels)
- **Molecules**: Simple combinations of atoms (form fields, search bars)
- **Organisms**: Complex UI components (job cards, application forms)
- **Templates**: Page layouts and section arrangements

---

## 1. Authentication

### UI Sections

#### Login Page
- Clean, minimal design with centered login form
- Email and password inputs with validation
- "Remember me" checkbox
- "Forgot password" link
- Error messaging for invalid credentials
- Role selector (Admin/SubAdmin)

#### Forgot Password Page
- Email input with validation
- Clear instructions for password reset process
- Success confirmation message

#### Reset Password Page
- New password and confirm password inputs
- Password strength indicator
- Success confirmation message

#### Account Setup Page (first-time login)
- Welcome message and instructions
- Password setup
- Basic profile information form
- Terms and conditions acceptance

### API Requirements

| Endpoint | Method | Description | Request Body | Response |
|----------|--------|-------------|--------------|----------|
| `/api/auth/login` | POST | User authentication | `{ email, password, role }` | `{ user, token }` |
| `/api/auth/forgot-password` | POST | Request password reset | `{ email }` | `{ success, message }` |
| `/api/auth/reset-password` | POST | Reset password with token | `{ token, password }` | `{ success, message }` |
| `/api/auth/session` | GET | Get current session data | - | `{ user, permissions }` |
| `/api/auth/logout` | POST | Logout user | - | `{ success }` |

---

## 2. User Management (Admin)

### UI Sections

#### SubAdmin List
- Responsive table/grid layout
- Search and filter options
- Sort by name, date created, status
- Quick actions (edit, deactivate)
- Pagination
- "Create New SubAdmin" button

#### SubAdmin Creation Form
- Personal information section
  - Name, email, phone
  - Profile photo upload
- Access settings
  - Role permissions
  - Status (active/inactive)
- Form validation with error messages
- "Cancel" and "Create" buttons

#### SubAdmin Edit Form
- Same layout as creation form
- Pre-populated with existing data
- Additional options:
  - Reset password
  - View activity log
- "Cancel" and "Save" buttons

#### User Profile Settings
- Personal information
- Change password option
- Notification preferences
- Theme preferences (light/dark)
- Session management

### API Requirements

| Endpoint | Method | Description | Request Body | Response |
|----------|--------|-------------|--------------|----------|
| `/api/users/subadmins` | GET | List all SubAdmins | Query params for filtering | `{ users, pagination }` |
| `/api/users/subadmins` | POST | Create new SubAdmin | User details | `{ user, message }` |
| `/api/users/subadmins/{id}` | GET | Get SubAdmin details | - | `{ user }` |
| `/api/users/subadmins/{id}` | PUT | Update SubAdmin details | Updated user details | `{ user, message }` |
| `/api/users/subadmins/{id}` | DELETE | Delete SubAdmin | - | `{ success, message }` |
| `/api/users/profile` | GET | Get current user profile | - | `{ profile }` |
| `/api/users/profile` | PUT | Update current user profile | Updated profile details | `{ profile, message }` |
| `/api/users/password` | PUT | Change password | `{ currentPassword, newPassword }` | `{ success, message }` |

---

## 3. Admin Dashboard

### UI Sections

#### Overview Panel
- Key metrics in card layout:
  - Total jobs (active/closed)
  - Total applications
  - Candidates in pipeline
  - Hiring rate
- Charts/graphs:
  - Applications over time
  - Job status distribution
  - Source distribution

#### Recent Activity Feed
- Timeline of recent system activities
- Filter by activity type
- User avatars and action descriptions
- Timestamps
- Clickable links to related items

#### Job Status Distribution
- Visual representation (pie/donut chart)
- Hover details showing exact numbers
- Color-coded by status

#### Application Conversion Funnel
- Visual funnel chart
- Stages: Applied → Screened → Interviewed → Offered → Hired
- Percentage and absolute numbers
- Date range selector

#### System Settings
- Organized in tabs/sections
- General settings (company info, defaults)
- Email configuration
- Integration settings
- Access controls

#### Custom Field Configuration
- Field type selection
- Entity assignment (Jobs/Candidates)
- Field properties editor
- Preview of field appearance
- Drag-and-drop ordering

### API Requirements

| Endpoint | Method | Description | Request Body | Response |
|----------|--------|-------------|--------------|----------|
| `/api/admin/dashboard` | GET | Dashboard metrics and stats | Query params for date range | `{ metrics, charts }` |
| `/api/admin/activity` | GET | Recent system activity | Query params for filtering | `{ activities, pagination }` |
| `/api/admin/settings` | GET | Get system settings | - | `{ settings }` |
| `/api/admin/settings` | PUT | Update system settings | Updated settings | `{ settings, message }` |
| `/api/admin/custom-fields` | GET | Get all custom field definitions | - | `{ fields }` |
| `/api/admin/custom-fields` | POST | Create new custom field | Field definition | `{ field, message }` |
| `/api/admin/custom-fields/{id}` | PUT | Update custom field | Updated field definition | `{ field, message }` |
| `/api/admin/custom-fields/{id}` | DELETE | Delete custom field | - | `{ success, message }` |

---

## 4. SubAdmin Dashboard

### UI Sections

#### Overview
- Key metrics relevant to SubAdmin:
  - Assigned jobs (active/closed)
  - Applications to review
  - Interviews scheduled
  - Recent hires
- Personalized welcome message

#### Assigned Jobs Summary
- Card-based layout of assigned jobs
- Status indicators
- Application counts
- Quick links to job details
- Sort/filter options

#### Recent Applications
- List of newest applications
- Matching score indicators
- Quick actions (review, shortlist, reject)
- Timestamps
- Pagination

#### Tasks & Reminders
- To-do list format
- Due dates and priorities
- Completion checkboxes
- Integration with scheduled interviews
- Option to add custom reminders

#### Quick Actions
- Button/card layout for common actions:
  - Create new job
  - Review applications
  - Schedule interviews
  - Generate reports

### API Requirements

| Endpoint | Method | Description | Request Body | Response |
|----------|--------|-------------|--------------|----------|
| `/api/subadmin/dashboard` | GET | SubAdmin-specific metrics | - | `{ metrics, assignedJobs }` |
| `/api/subadmin/jobs/summary` | GET | Summary of assigned jobs | Query params for filtering | `{ jobs, counts }` |
| `/api/subadmin/applications/recent` | GET | Recent applications | Query params for pagination | `{ applications, pagination }` |
| `/api/subadmin/tasks` | GET | Get tasks and reminders | Query params for filtering | `{ tasks, pagination }` |
| `/api/subadmin/tasks/{id}` | PUT | Update task status | `{ status, notes }` | `{ task, message }` |

---

## 5. Job Management

### UI Sections

#### Job Listing
- Responsive table/grid layout
- Advanced filters:
  - Status
  - Date range
  - Assigned SubAdmin
  - Location
  - Job type
  - Custom fields
- Sortable columns
- Bulk actions
- Quick status updates
- "Create New Job" button
- Export options

#### Job Creation Form (Multi-step)

**Step 1: Basic Job Information**
- Job title (text input)
- Company/department (select/text)
- Location (text with address autocomplete)
- Remote option toggle
- Employment type (select)
- Experience level (select)

**Step 2: Job Details**
- Job description (rich text editor)
- Responsibilities (rich text editor)
- Requirements (rich text editor)
- Skills (multi-select with custom entries)
- Education requirements (multi-select)

**Step 3: Compensation & Benefits**
- Salary range (min/max inputs)
- Salary visibility options
- Benefits (multi-select with custom entries)
- Perks (multi-select with custom entries)
- Working hours/schedule

**Step 4: Application Settings**
- Application deadline (date picker)
- Expected start date (date picker)
- Application instructions (text area)
- Required documents (multi-select)
- Custom screening questions (add/remove interface)

**Step 5: Visibility & Promotion**
- Job visibility toggle (public/private)
- Featured job option
- Social sharing options
- SEO settings (title, description)

**Step 6: Custom Fields**
- Dynamically generated based on admin configuration
- Various input types based on field definitions
- Conditional display options

**Step 7: Preview & Publish**
- Complete job preview (as seen by candidates)
- "Save as Draft" button
- "Publish" button
- "Back to Edit" option

#### Job Detail View
- Comprehensive layout of all job information
- Statistics panel (views, applications, hires)
- Application management section
- Related documents
- Activity timeline
- Admin/SubAdmin assignment info
- Edit and Status action buttons

#### Job Edit Form
- Same layout as creation form
- Pre-populated with existing data
- Version history access
- "Cancel" and "Save" buttons

#### Job Assignment Interface (Admin only)
- Available SubAdmins list
- Search and filter options
- Assignment history
- Notification options when assigning

### API Requirements

| Endpoint | Method | Description | Request Body | Response |
|----------|--------|-------------|--------------|----------|
| `/api/jobs` | GET | List all jobs with filtering | Query params | `{ jobs, pagination }` |
| `/api/jobs` | POST | Create new job | Job details (all steps) | `{ job, message }` |
| `/api/jobs/{id}` | GET | Get job details | - | `{ job }` |
| `/api/jobs/{id}` | PUT | Update job | Updated job details | `{ job, message }` |
| `/api/jobs/{id}` | DELETE | Delete/archive job | - | `{ success, message }` |
| `/api/jobs/{id}/assign` | PUT | Assign job to SubAdmin | `{ subadminId, notifySubadmin }` | `{ job, message }` |
| `/api/jobs/{id}/status` | PUT | Update job status | `{ status, reason }` | `{ job, message }` |
| `/api/jobs/templates` | GET | Get job templates | Query params | `{ templates, pagination }` |
| `/api/jobs/templates` | POST | Create job template | Template details | `{ template, message }` |
| `/api/jobs/assigned` | GET | Get jobs assigned to current SubAdmin | Query params | `{ jobs, pagination }` |
| `/api/jobs/stats/{id}` | GET | Get statistics for specific job | - | `{ stats }` |

---

## 6. Public Job Board

### UI Sections

#### Job Search Page
- Hero section with search bar
- Advanced filters (dropdown/sidebar):
  - Location
  - Job type
  - Experience level
  - Salary range
  - Date posted
- Job card grid/list view toggle
- Sort options (relevance, date, etc.)
- Pagination
- "No results" state with suggestions
- Optional: related searches

#### Job Detail Page
- Comprehensive job details
- Company information section
- Apply button (prominent)
- Share job options
- Similar jobs section
- Breadcrumb navigation
- Responsive design for mobile

#### Application Form (Multi-step)

**Step 1: Personal Information**
- Full name
- Email address
- Phone number
- Date of birth
- Profile photo upload (optional)
- LinkedIn profile URL (optional)
- Portfolio/website URL (optional)
- Progress indicator
- Next/Back navigation

**Step 2: Professional Information**
- Current employment status (select)
- Current/most recent job title
- Current/most recent company
- Start date and end date (conditional)
- Option to add previous employment
  - Company name
  - Job title
  - Duration
  - Description
- Skills selection (multi-select with rating)
- Years of relevant experience
- Current salary/expectations (optional)
- Notice period

**Step 3: Educational Background**
- Highest education level (select)
- Degree/certification name
- Institution name
- Graduation year
- Option to add additional education entries
- Relevant certifications

**Step 4: Address Information**
- Current address
  - Street address
  - City
  - State/Province
  - Postal code
  - Country
- Permanent address toggle (if different)
- Willingness to relocate (yes/no/conditional)

**Step 5: Document Upload**
- Resume/CV upload (drag-drop + file select)
  - Supported formats notice
  - Size limit indicator
- Cover letter upload (optional)
- Additional documents upload (optional)
- Document preview capability
- Upload progress indicator

**Step 6: Additional Information**
- Availability to start (date picker)
- Preferred working arrangement (select)
- How they found the job (select + text)
- Referral information (conditional)
- Any accommodation needs (text area)
- Additional comments (text area)

**Step 7: Final Review**
- Summary of all entered information
- Section-by-section review
- Edit links for each section
- Data processing consent checkbox
- Terms and conditions acceptance
- "Submit Application" button
- Save as draft option

#### Application Confirmation
- Success message
- Application reference number
- Next steps information
- Timeline expectations
- Option to create account banner
- "View Other Jobs" button

#### Optional Account Creation
- Post-application account creation prompt
- Email/password setup
- Benefits of creating account explained
- Option to skip
- Already have account? Sign in link

### API Requirements

| Endpoint | Method | Description | Request Body | Response |
|----------|--------|-------------|--------------|----------|
| `/api/public/jobs` | GET | List public jobs with filtering | Query params | `{ jobs, pagination }` |
| `/api/public/jobs/{id}` | GET | Get public job details | - | `{ job }` |
| `/api/public/jobs/{id}/apply` | POST | Submit job application | All application form data | `{ application, message, token }` |
| `/api/public/applications/{id}/documents` | POST | Upload application documents | Form data with files | `{ documents, message }` |
| `/api/public/register` | POST | Create candidate account after application | `{ email, password, applicationToken }` | `{ user, message }` |
| `/api/public/applications/status/{token}` | GET | Check application status (no login) | - | `{ status, timeline }` |

---

## 7. Candidate Management

### UI Sections

#### Candidate Listing
- Responsive table/grid view
- Advanced filtering options:
  - Status
  - Source
  - Skills
  - Experience
  - Application date
  - Custom fields
- Sortable columns
- Quick view modal
- Bulk actions
- Export functionality
- "Add Candidate" button
- Saved filters/searches

#### Candidate Detail View
- Profile header with photo and key info
- Tab-based layout:
  
  **Personal & Contact Info Tab**
  - All personal details
  - Contact information
  - Social profiles
  - Communication log
  
  **Professional Background Tab**
  - Work history timeline
  - Current employment
  - Skills visualization
  - Experience summary
  
  **Educational History Tab**
  - Education timeline
  - Degrees and certifications
  - Institutions
  
  **Documents Tab**
  - Resume/CV viewer
  - Cover letter
  - Additional documents
  - Upload new document button
  
  **Applications History Tab**
  - List of all job applications
  - Status indicators
  - Timeline view
  - Related job links
  
  **Notes & Comments Tab**
  - Threaded comments
  - Timestamp and author
  - Add comment form
  - Internal notes section

- Sidebar with:
  - Status updates
  - Quick actions
  - Tags management
  - Rating system

#### Candidate Edit Form
- Similar layout to application form
- Pre-populated with existing data
- Ability to edit all sections
- Document replacement options
- Status change with reason
- Change history log
- Save/Cancel buttons

#### Resume/Document Viewer
- In-page document preview
- Download option
- Print option
- Zoom controls
- Thumbnail navigation for multi-page documents
- Text extraction view (toggle)

#### Candidate Status Management
- Visual status pipeline
- Drag-drop status changes
- Status change modal with reason field
- Notification triggers on status change
- Status history log

### API Requirements

| Endpoint | Method | Description | Request Body | Response |
|----------|--------|-------------|--------------|----------|
| `/api/candidates` | GET | List candidates with filtering | Query params | `{ candidates, pagination }` |
| `/api/candidates` | POST | Create new candidate manually | Candidate details | `{ candidate, message }` |
| `/api/candidates/{id}` | GET | Get candidate details | - | `{ candidate }` |
| `/api/candidates/{id}` | PUT | Update candidate information | Updated details | `{ candidate, message }` |
| `/api/candidates/{id}` | DELETE | Delete candidate | - | `{ success, message }` |
| `/api/candidates/{id}/documents` | GET | Get candidate documents | - | `{ documents }` |
| `/api/candidates/{id}/documents` | POST | Add document to candidate | Form data with file | `{ document, message }` |
| `/api/candidates/{id}/documents/{docId}` | DELETE | Delete candidate document | - | `{ success, message }` |
| `/api/candidates/{id}/applications` | GET | Get candidate's application history | - | `{ applications }` |
| `/api/candidates/{id}/notes` | POST | Add notes to candidate | `{ note, visibility }` | `{ note, message }` |
| `/api/candidates/{id}/notes` | GET | Get candidate notes | - | `{ notes }` |

---

## 8. Application Processing

### UI Sections

#### Application List
- Responsive table layout
- Filtering options:
  - Job
  - Status
  - Date range
  - Matching score
  - Source
- Sorting by matching score, date, status
- Bulk action toolbar
- Quick view option
- Pagination controls
- List/grid view toggle
- Custom column selection

#### Application Detail View
- Application summary header
- Candidate profile section
- Job details section
- Status tracking bar
- Documents viewer
- Matching score visualization
- Timeline of status changes
- Internal notes and comments
- Action buttons (appropriate to current status)

#### Bulk Action Interface
- Selection counter
- Action dropdown:
  - Update status
  - Send email
  - Export
  - Schedule interviews
  - Reject
- Confirmation modal
- Success/error feedback

#### Status Update Workflow
- Intuitive status progression buttons
- Status change form with:
  - Reason field
  - Next steps
  - Notification options
- Confirmation step
- Success feedback

#### AI Matching Results View
- Overall match score (percentage)
- Detailed breakdown by categories:
  - Skills match
  - Experience match
  - Education match
  - Location match
- Visual comparison of required vs. candidate attributes
- Key strengths and potential gaps
- Recommendation engine results

#### Top Candidates View
- Sorted list by match score
- Side-by-side comparison option
- Key differentiators highlighted
- Batch actions for top candidates
- Export options
- Filter controls

#### Application Review Form
- Rating system (stars/numerical)
- Strengths and weaknesses fields
- Interview recommendation
- Feedback categories (technical, cultural, etc.)
- Internal notes
- Decision and reasoning

#### Interview Scheduling Interface
- Calendar view
- Available time slots
- Interview type selection
- Duration setting
- Location/video link
- Add participants
- Email notification preview
- Confirmation and add to calendar options

### API Requirements

| Endpoint | Method | Description | Request Body | Response |
|----------|--------|-------------|--------------|----------|
| `/api/applications` | GET | List applications with filtering | Query params | `{ applications, pagination }` |
| `/api/applications/{id}` | GET | Get application details | - | `{ application }` |
| `/api/applications/{id}/status` | PUT | Update application status | `{ status, reason, notifyCandidate }` | `{ application, message }` |
| `/api/applications/bulk-status` | POST | Update multiple application statuses | `{ ids, status, reason, notify }` | `{ success, count, message }` |
| `/api/applications/{id}/matching` | GET | Get AI matching score and details | - | `{ matching, details }` |
| `/api/applications/{id}/schedule` | POST | Schedule interview | Interview details | `{ interview, message }` |
| `/api/applications/top-matches/{jobId}` | GET | Get top matching candidates for job | Query params for count | `{ candidates, pagination }` |
| `/api/applications/{id}/review` | POST | Save application review | Review details | `{ review, message }` |
| `/api/applications/{id}/hire` | PUT | Mark candidate as hired | Hiring details | `{ application, message }` |
| `/api/applications/{id}/reject` | PUT | Reject candidate with reason | `{ reason, template }` | `{ application, message }` |

---

## 9. AI Resume Processing (Future Implementation)

*Note: This section will be implemented in a later phase.*

### Functionality
- Automatic processing when resume is uploaded during application
- Document parsing and text extraction
- Skills and experience extraction
- Matching against job requirements
- Score generation for application-job fit
- Surfacing top candidates for each job

### API Requirements (For Future Implementation)

| Endpoint | Method | Description | Request Body | Response |
|----------|--------|-------------|--------------|----------|
| `/api/ai/process-resume` | POST | Process resume | `{ resumeId, jobId }` | `{ status, message }` |
| `/api/ai/matching-score` | GET | Get matching score | Query params | `{ score, breakdown }` |
| `/api/ai/top-candidates` | GET | Get top candidates | Query params | `{ candidates }` |

---

## 10. Candidate Portal (Post-Application)

### UI Sections

#### Account Registration
- Simple form after application submission
- Email (pre-filled from application)
- Password creation
- Benefits explanation
- Terms acceptance
- Verification email process

#### Application Status View
- Visual pipeline of application stages
- Current status indicator
- Timeline of status changes
- Expected next steps
- Messages from recruiters
- Interview schedules (if applicable)

#### Profile Management
- Personal information edit form
- Professional information management
- Education details
- Document management
- Communication preferences
- Account settings

#### Document Management
- Current documents list
- Document preview
- Upload new/replacement documents
- Version history
- Delete options

#### Job Recommendations
- Personalized job suggestions
- Similarity indicators
- Quick apply options
- Save job function
- Job alert settings

#### Application History
- List of all applications
- Status indicators
- Date applied
- Link to job description
- Application details view

### API Requirements

| Endpoint | Method | Description | Request Body | Response |
|----------|--------|-------------|--------------|----------|
| `/api/candidate-portal/register` | POST | Register new candidate account | `{ email, password, applicationToken }` | `{ user, message }` |
| `/api/candidate-portal/applications` | GET | View candidate's applications | Query params | `{ applications, pagination }` |
| `/api/candidate-portal/profile` | GET | Get candidate profile | - | `{ profile }` |
| `/api/candidate-portal/profile` | PUT | Update candidate profile | Updated profile | `{ profile, message }` |
| `/api/candidate-portal/documents` | GET | Get candidate documents | - | `{ documents }` |
| `/api/candidate-portal/documents` | POST | Upload new documents | Form data with file | `{ document, message }` |
| `/api/candidate-portal/recommendations` | GET | Get job recommendations | - | `{ jobs }` |

---

## 11. Notification System

### UI Sections

#### In-app Notification Center
- Notification bell icon with counter
- Dropdown list of recent notifications
- Read/unread indicators
- Category-based grouping
- "Mark all as read" button
- "View all notifications" link
- Timestamp for each notification

#### Notification Preferences
- Email notification toggles
- In-app notification toggles
- Categorized preferences:
  - Application status changes
  - New applications
  - Assigned jobs
  - System updates
  - Reminders
- Frequency settings
- Quiet hours configuration

#### Email Notification Templates (Admin)
- Template list view
- Template editor with variables
- Preview functionality
- Test email sending
- Version history
- Default template reset option

### API Requirements

| Endpoint | Method | Description | Request Body | Response |
|----------|--------|-------------|--------------|----------|
| `/api/notifications` | GET | Get user notifications | Query params | `{ notifications, pagination }` |
| `/api/notifications/{id}/read` | PUT | Mark notification as read | - | `{ success, message }` |
| `/api/notifications/read-all` | PUT | Mark all notifications as read | - | `{ success, count }` |
| `/api/notifications/preferences` | GET | Get notification preferences | - | `{ preferences }` |
| `/api/notifications/preferences` | PUT | Update notification preferences | Updated preferences | `{ preferences, message }` |
| `/api/admin/email-templates` | GET | Get email templates | - | `{ templates }` |
| `/api/admin/email-templates/{id}` | PUT | Update email template | Updated template | `{ template, message }` |

---

## 12. Custom Field Management

### UI Sections

#### Field Type Management
- Available field types list:
  - Text input
  - Text area
  - Dropdown
  - Multi-select
  - Checkbox
  - Radio button
  - Date picker
  - File upload
  - Rating
- Add new field type form
- Edit field properties

#### Entity Field Assignment
- Entity selection (Jobs, Candidates)
- Available fields list
- Assigned fields list
- Drag-drop interface for ordering
- Required field toggles
- Visibility settings

#### Form Builder Interface
- Visual form layout
- Section creation and management
- Field placement
- Conditional logic configuration
- Preview mode
- Responsive design testing

#### Field Visibility Settings
- Role-based visibility options
- Public/internal toggle
- Conditional display rules
- Searchable/filterable settings

### API Requirements

| Endpoint | Method | Description | Request Body | Response |
|----------|--------|-------------|--------------|----------|
| `/api/custom-fields/types` | GET | Get available field types | - | `{ types }` |
| `/api/custom-fields/types` | POST | Create new field type | Field type definition | `{ type, message }` |
| `/api/custom-fields/entities/{entity}` | GET | Get fields for entity type | - | `{ fields }` |
| `/api/custom-fields/entities/{entity}` | POST | Assign fields to entity | Field assignment details | `{ field, message }` |
| `/api/custom-fields/entities/{entity}/{fieldId}` | PUT | Update field assignment | Updated assignment | `{ field, message }` |
| `/api/custom-fields/entities/{entity}/{fieldId}` | DELETE | Remove field from entity | - | `{ success, message }` |

---

## 13. Settings & Configuration

### UI Sections

#### General Settings
- Company information
- Default language
- Date and time formats
- Currency settings
- Timezone configuration
- File storage limits
- Default job post settings

#### Email Configuration
- SMTP settings
- Default sender information
- Email signature configuration
- Email verification settings
- Bounce handling
- Email testing tool

#### System Preferences
- Default views and sorting
- Records per page
- Auto-logout timing
- Session duration
- Activity logging level
- Export format preferences

#### User Roles & Permissions
- Role management
- Permission assignment matrix
- Custom role creation
- Access restrictions
- Feature enablement toggles

#### Compliance Settings
- Data retention policies
- GDPR compliance toggles
- Privacy policy management
- Terms of service management
- Cookie consent settings
- Data anonymization options

### API Requirements

| Endpoint | Method | Description | Request Body | Response |
|----------|--------|-------------|--------------|----------|
| `/api/settings/general` | GET | Get general settings | - | `{ settings }` |
| `/api/settings/general` | PUT | Update general settings | Updated settings | `{ settings, message }` |
| `/api/settings/email` | GET | Get email settings | - | `{ settings }` |
| `/api/settings/email` | PUT | Update email settings | Updated settings | `{ settings, message }` |
| `/api/settings/compliance` | GET | Get compliance settings | - | `{ settings }` |
| `/api/settings/compliance` | PUT | Update compliance settings | Updated settings | `{ settings, message }` |
| `/api/settings/roles` | GET | Get role permissions | - | `{ roles }` |
| `/api/settings/roles/{role}` | PUT | Update role permissions | Updated permissions | `{ role, message }` |

---

## 14. Basic Analytics & Reporting

### UI Sections

#### Application Sources Report
- Visual charts (pie, bar)
- Source breakdown
- Timeline comparison
- Conversion rates by source
- Export options
- Date range selector

#### Job Performance Metrics
- Job comparison table
- Views, applications, interviews, hires
- Conversion rate analysis
- Time-to-fill metrics
- Cost-per-hire (if tracked)
- Export functionality

#### Time-to-Hire Analysis
- Stage duration breakdown
- Bottleneck identification
- Comparison across jobs/departments
- Trend analysis over time
- Target vs. actual metrics
- Improvement suggestions

#### Candidate Pipeline View
- Visual funnel or pipeline view
- Stage-by-stage metrics
- Conversion rates between stages
- Drop-off analysis
- Benchmarking against averages
- Filter by job, date range, department

#### Basic Export Functions
- Export format selection (CSV, Excel, PDF)
- Data selection interface
- Scheduled exports option
- Custom report configuration
- Email delivery option
- Preview before export

### API Requirements

| Endpoint | Method | Description | Request Body | Response |
|----------|--------|-------------|--------------|----------|
| `/api/analytics/applications/sources` | GET | Get application source data | Query params | `{ sources, metrics }` |
| `/api/analytics/jobs/performance` | GET | Get job performance metrics | Query params | `{ jobs, metrics }` |
| `/api/analytics/hiring/time` | GET | Get time-to-hire analysis | Query params | `{ times, breakdown }` |
| `/api/analytics/pipeline` | GET | Get candidate pipeline data | Query params | `{ stages, metrics }` |
| `/api/analytics/export` | POST | Generate data export | Export configuration | `{ url, message }` |

---

## Database Schema (MongoDB)

### User Collection
```javascript
{
  _id: ObjectId,
  email: String,
  passwordHash: String,
  role: String, // "admin" or "subadmin"
  firstName: String,
  lastName: String,
  phone: String,
  profilePhoto: String, // URL to S3
  status: String, // "active" or "inactive"
  permissions: [String],
  createdAt: Date,
  updatedAt: Date,
  lastLogin: Date
}
```

### Job Collection
```javascript
{
  _id: ObjectId,
  title: String,
  company: String,
  department: String,
  location: {
    type: String,
    address: String,
    city: String,
    state: String,
    country: String,
    zipCode: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  isRemote: Boolean,
  employmentType: String, // "full-time", "part-time", "contract", etc.
  experienceLevel: String, // "entry", "mid", "senior"
  description: String, // Rich text as HTML
  responsibilities: String, // Rich text as HTML
  requirements: String, // Rich text as HTML
  skills: [String],
  education: [String],
  salary: {
    min: Number,
    max: Number,
    currency: String,
    isVisible: Boolean
  },
  benefits: [String],
  applicationDeadline: Date,
  expectedStartDate: Date,
  applicationInstructions: String,
  requiredDocuments: [String],
  customFields: Object, // Dynamic fields
  visibility: String, // "public", "private"
  status: String, // "draft", "published", "closed", "archived"
  assignedTo: ObjectId, // Reference to User collection
  createdBy: ObjectId, // Reference to User collection
  createdAt: Date,
  updatedAt: Date,
  viewCount: Number,
  applicationCount: Number,
  hireCount: Number
}
```

### Candidate Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId, // Reference to User collection (if registered)
  email: String,
  phone: String,
  firstName: String,
  lastName: String,
  profilePhoto: String, // URL to S3
  dateOfBirth: Date,
  linkedinProfile: String,
  portfolio: String,
  currentPosition: {
    title: String,
    company: String,
    startDate: Date,
    endDate: Date,
    isCurrentlyWorking: Boolean,
    description: String
  },
  employmentHistory: [{
    title: String,
    company: String,
    startDate: Date,
    endDate: Date,
    description: String
  }],
  education: [{
    degree: String,
    institution: String,
    fieldOfStudy: String,
    graduationYear: Number,
    description: String
  }],
  skills: [{
    name: String,
    proficiency: Number // 1-5
  }],
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String
  },
  documents: [{
    type: String, // "resume", "cover_letter", "certificate", etc.
    fileName: String,
    fileUrl: String, // URL to S3
    uploadDate: Date,
    fileSize: Number
  }],
  customFields: Object, // Dynamic fields
  source: String, // Where the candidate came from
  tags: [String],
  notes: [{
    content: String,
    createdBy: ObjectId, // Reference to User collection
    createdAt: Date,
    isPrivate: Boolean
  }],
  status: String, // "active", "inactive", "blacklisted"
  createdAt: Date,
  updatedAt: Date
}
```

### Application Collection
```javascript
{
  _id: ObjectId,
  jobId: ObjectId, // Reference to Job collection
  candidateId: ObjectId, // Reference to Candidate collection
  status: String, // "applied", "screening", "interview", "offer", "hired", "rejected"
  applicationDate: Date,
  resumeId: String, // Reference to document in Candidate collection
  coverLetterId: String, // Reference to document in Candidate collection
  customFieldResponses: Object, // Responses to custom fields
  questionResponses: [{
    question: String,
    answer: String
  }],
  matchingScore: {
    overall: Number, // 0-100
    skillsMatch: Number,
    experienceMatch: Number,
    educationMatch: Number,
    breakdown: Object // Detailed matching data
  },
  statusHistory: [{
    status: String,
    changedBy: ObjectId, // Reference to User collection
    changedAt: Date,
    reason: String
  }],
  interviews: [{
    scheduledFor: Date,
    duration: Number, // in minutes
    type: String, // "phone", "video", "in-person"
    location: String,
    participants: [ObjectId], // Reference to User collection
    notes: String,
    status: String // "scheduled", "completed", "cancelled", "no-show"
  }],
  reviews: [{
    reviewer: ObjectId, // Reference to User collection
    rating: Number, // 1-5
    strengths: String,
    weaknesses: String,
    notes: String,
    createdAt: Date
  }],
  rejectionReason: String,
  source: String, // Direct, referral, etc.
  notes: [{
    content: String,
    createdBy: ObjectId, // Reference to User collection
    createdAt: Date
  }],
  token: String, // For anonymous status checking
  createdAt: Date,
  updatedAt: Date
}
```

### CustomField Collection
```javascript
{
  _id: ObjectId,
  name: String,
  label: String,
  type: String, // "text", "textarea", "select", "multiselect", "checkbox", "radio", "date", "file", "rating"
  entity: String, // "job", "candidate", "application"
  options: [String], // For select, multiselect, checkbox, radio
  placeholder: String,
  helpText: String,
  validation: {
    required: Boolean,
    min: Number,
    max: Number,
    pattern: String // Regex pattern
  },
  defaultValue: Mixed,
  isVisible: Boolean,
  visibleTo: [String], // Roles that can see this field
  order: Number,
  createdBy: ObjectId, // Reference to User collection
  createdAt: Date,
  updatedAt: Date
}
```

### Notification Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId, // Reference to User collection
  type: String, // "application", "status_change", "interview", "assignment", "system"
  title: String,
  message: String,
  read: Boolean,
  link: String, // URL to related resource
  relatedId: ObjectId, // Reference to related resource
  createdAt: Date
}
```

### Settings Collection
```javascript
{
  _id: ObjectId,
  category: String, // "general", "email", "compliance", etc.
  settings: Object, // Key-value pairs
  updatedBy: ObjectId, // Reference to User collection
  updatedAt: Date
}
```

### Activity Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId, // Reference to User collection
  action: String, // "create", "update", "delete", "login", "logout", etc.
  entityType: String, // "job", "candidate", "application", "user", etc.
  entityId: ObjectId, // Reference to the entity
  details: Object, // Additional details about the activity
  ipAddress: String,
  userAgent: String,
  createdAt: Date
}
```

## AWS Integration Components

### S3 Storage
- **Bucket Structure**:
  - `/resumes` - Candidate resumes
  - `/cover-letters` - Candidate cover letters
  - `/additional-documents` - Additional candidate documents
  - `/profile-photos` - User profile photos
  - `/exports` - Exported reports and data

### Lambda Functions (Future Implementation)
- **resumeProcessor** - Extracts text from uploaded resumes
- **documentParser** - Parses structured information from resumes
- **matchingEngine** - Compares resume content with job requirements

## Security Considerations

1. **Authentication**:
   - JWT-based authentication
   - Secure password storage with bcrypt
   - Session management with expiration
   - CSRF protection

2. **Authorization**:
   - Role-based access control
   - Resource-level permissions
   - Data access restrictions

3. **Data Protection**:
   - Input validation and sanitization
   - Protection against XSS and injection attacks
   - Secure handling of uploaded files
   - HTTPS for all communications

4. **GDPR Compliance**:
   - Consent management
   - Data export functionality
   - Right to be forgotten implementation
   - Data minimization principles
   - Audit trails for sensitive operations

## Performance Considerations

1. **Database Optimization**:
   - Proper indexing for frequently queried fields
   - Pagination for large result sets
   - Aggregation pipeline optimization
   - Query caching where appropriate

2. **Frontend Performance**:
   - Server-side rendering for initial load
   - Client-side navigation for subsequent pages
   - Code splitting for reduced bundle size
   - Image optimization and lazy loading
   - Virtualized lists for large datasets

3. **API Optimization**:
   - Response caching
   - Request batching
   - GraphQL consideration for complex data requirements
   - Rate limiting to prevent abuse

## Implementation Phases

### Phase 1: Core Infrastructure (Weeks 1-2)
- Project setup and configuration
- Authentication system
- User management
- Basic dashboard

### Phase 2: Job Management (Weeks 3-4)
- Job creation and management
- Public job board
- Custom fields for jobs

### Phase 3: Application Processing (Weeks 5-6)
- Application submission flow
- Candidate management
- Application review interface
- Basic matching logic

### Phase 4: Advanced Features (Weeks 7-8)
- Notification system
- Candidate portal
- Analytics and reporting
- Settings and configuration

### Phase 5: AI Integration and Refinement (Week 9)
- Resume parsing implementation
- Advanced matching algorithms
- UI/UX refinements
- Performance optimization