# 🔄 **REKRUT ATS - COMPLETE JOB FLOW DOCUMENTATION**

## **📋 PHASE 1: JOB CREATION & SETUP**

### **1.1 Job Creation Process**

**Admin/SubAdmin initiates job creation:**
```
/admin/jobs/create OR /subadmin/jobs/create
```

**Multi-Step Form Process:**
```
Step 1: Basic Information
├── Job Title (required)
├── Company (required)
├── Department (optional)
├── Location Type (remote/onsite/hybrid)
├── Address Details (if onsite/hybrid)
├── Employment Type (full-time/part-time/contract/internship)
└── Experience Level (entry/mid/senior)

Step 2: Job Details
├── Job Description (rich text editor)
├── Responsibilities (rich text editor)
├── Requirements (rich text editor)
├── Skills (multi-select with custom entries)
└── Education Requirements (multi-select)

Step 3: Compensation & Benefits
├── Salary Range (min/max)
├── Currency (USD default)
├── Salary Visibility (public/private)
├── Benefits (multi-select)
└── Perks (multi-select)

Step 4: Application Settings
├── Application Deadline (date picker)
├── Expected Start Date (date picker)
├── Application Instructions (text area)
├── Required Documents (multi-select)
└── Custom Screening Questions

Step 5: Visibility & Assignment (Admin) / Visibility (SubAdmin)
├── Job Visibility (public/private)
├── Featured Job (yes/no)
├── SEO Settings
└── [Admin Only] Assign to SubAdmin

Step 6: Preview & Publish
├── Complete job preview
├── Save as Draft option
└── Publish option
```

### **1.2 Job Status Management**

**Job Status Workflow:**
```
Draft → Active → Closed → Archived
    ↓       ↓        ↓
  Paused  Paused   Paused
```

**Status Details:**
- **Draft**: Job created but not published
- **Active**: Live on public job board, accepting applications
- **Paused**: Temporarily hidden from public view
- **Closed**: No longer accepting applications
- **Archived**: Permanently removed from active management

### **1.3 Job Assignment (Admin Only)**

```
Admin creates job → Optionally assigns to SubAdmin → SubAdmin manages applications
```

**Assignment API Flow:**
```json
POST /api/jobs/{id}/assign
{
  "subadminId": "user_id",
  "notifySubadmin": true
}
```

## **📋 PHASE 2: JOB PUBLISHING & DISCOVERY**

### **2.1 Public Job Board Display**

**Public Route:** `/jobs`

**Job Discovery Flow:**
```
User visits /jobs
    ↓
Search & Filter Interface
├── Search by: title, company, skills, description
├── Location filter
├── Employment type filter
├── Experience level filter
├── Work type filter (remote/onsite/hybrid)
└── Sort options (latest, title, company)
    ↓
Job Cards Display
├── Featured jobs (highlighted)
├── Job title & company
├── Location & work type
├── Salary (if visible)
├── Skills & experience level
├── Posted date & deadline
└── "View Details" button
    ↓
Pagination & Load More
```

### **2.2 Job Detail Page**

**Public Route:** `/jobs/[id]`

**Job Detail Flow:**
```
User clicks "View Details"
    ↓
Job Detail Page Loads
├── Job Header
│   ├── Title & company
│   ├── Location & type
│   ├── Posted date
│   └── Share functionality
├── Job Description (parsed HTML)
├── Responsibilities (parsed HTML)
├── Requirements (parsed HTML)
├── Required Skills (badges)
├── Education Requirements
├── Benefits & Perks
├── Application Instructions
└── Application Sidebar
    ├── Salary information
    ├── Application deadline
    ├── Required documents
    └── "Apply Now" button
```

## **📋 PHASE 3: APPLICATION PROCESS**

### **3.1 Application Initiation**

**Application Route:** `/apply/[id]`

**Application Flow Start:**
```
User clicks "Apply Now"
    ↓
Application page loads with job context
    ↓
Multi-step application form begins
```

### **3.2 Multi-Step Application Form**

**Step 1: Personal Information**
```
├── First Name (required)
├── Last Name (required)
├── Email (required)
├── Phone Number
├── Date of Birth
├── LinkedIn Profile URL
├── Portfolio/Website URL
└── Profile Photo Upload (optional)
```

**Step 2: Professional Information**
```
├── Current Employment Status
├── Current Job Title
├── Current Company
├── Employment Duration
├── Previous Employment (add multiple)
├── Skills & Proficiency Levels
├── Years of Experience
├── Current/Expected Salary
└── Notice Period
```

**Step 3: Educational Background**
```
├── Highest Education Level
├── Degree/Certification
├── Institution Name
├── Graduation Year
├── Additional Education (add multiple)
└── Relevant Certifications
```

**Step 4: Address & Preferences**
```
├── Current Address (full)
├── Permanent Address (if different)
├── Willing to Relocate (yes/no)
├── Preferred Work Arrangement
├── Availability to Start
└── Accommodation Needs
```

**Step 5: Document Upload**
```
├── Resume/CV Upload (required)
│   ├── Drag & drop interface
│   ├── File format validation
│   ├── Size limit checking
│   └── Upload progress indicator
├── Cover Letter (optional)
├── Portfolio Files (optional)
└── Additional Documents
```

**Step 6: Additional Information**
```
├── How did you find this job?
├── Referral Information (if applicable)
├── Screening Question Answers
├── Additional Comments
└── Terms & Conditions Acceptance
```

**Step 7: Review & Submit**
```
├── Complete application summary
├── Section-by-section review
├── Edit links for each section
├── Data processing consent
├── Terms acceptance
└── Submit Application button
```

### **3.3 Application Submission Process**

**Backend Processing:**
```
POST /api/applications
    ↓
1. Validate form data
2. Check if job exists & is active
3. Create or find existing candidate
    ├── Email-based deduplication
    ├── Update existing candidate info
    └── Create new candidate if needed
4. Check for duplicate applications
5. Process file uploads (placeholder implementation)
6. Create application record
    ├── Link job & candidate
    ├── Set initial status to "applied"
    ├── Store custom field responses
    ├── Generate tracking token
    └── Create status history entry
7. Send confirmation (placeholder)
8. Notify hiring team (placeholder)
```

### **3.4 Application Confirmation**

**Success Route:** `/application-success?token={trackingToken}`

**Confirmation Flow:**
```
Application submitted successfully
    ↓
Redirect to success page
├── Success message
├── Application reference number
├── Next steps information
├── Timeline expectations
├── "Create Account" option
└── "View Other Jobs" link
```

## **📋 PHASE 4: APPLICATION MANAGEMENT**

### **4.1 Application Discovery (Admin/SubAdmin)**

**Admin Route:** `/admin/applications`
**SubAdmin Route:** `/subadmin/applications`

**Application Management Interface:**
```
Applications Dashboard
├── Search & Filter Options
│   ├── Job filter
│   ├── Status filter
│   ├── Date range filter
│   ├── Candidate name search
│   └── Source filter
├── Application List/Grid View
│   ├── Candidate info & photo
│   ├── Applied job
│   ├── Application date
│   ├── Current status
│   ├── Match score (when implemented)
│   └── Quick actions
├── Bulk Actions
│   ├── Status updates
│   ├── Assignment changes
│   ├── Notes addition
│   └── Export options
└── Pagination
```

### **4.2 Application Review Process**

**Application Detail Route:** `/admin/applications/[id]` or `/subadmin/applications/[id]`

**Review Interface:**
```
Application Detail View
├── Candidate Profile Summary
├── Job Information
├── Application Status Pipeline
├── Document Viewer
│   ├── Resume preview
│   ├── Cover letter preview
│   ├── Portfolio documents
│   └── Download options
├── Application Timeline
├── Notes & Comments Section
├── Review & Rating Form
└── Status Action Buttons
```

### **4.3 Application Status Workflow**

**Status Progression:**
```
Applied → Screened → Interview Scheduled → Interviewed → Offered → Hired
   ↓         ↓              ↓                ↓           ↓        ↓
Rejected  Rejected      Rejected        Rejected    Rejected   ✓
```

**Status Change API:**
```json
PUT /api/applications/{id}/status
{
  "status": "screened",
  "reason": "Candidate meets requirements",
  "notifyCandidate": true
}
```

### **4.4 Bulk Application Operations**

**Bulk Actions Interface:**
```
Select multiple applications
    ↓
Choose bulk action:
├── Change Status (with reason)
├── Assign to different recruiter
├── Add bulk notes
├── Schedule interviews
├── Send bulk emails
└── Export selected applications
```

**Bulk API:**
```json
POST /api/applications/bulk-status
{
  "ids": ["app1", "app2", "app3"],
  "status": "screened",
  "reason": "Initial screening completed",
  "notify": true
}
```

## **📋 PHASE 5: CANDIDATE MANAGEMENT**

### **5.1 Candidate Profile Creation**

**Automatic Process:**
```
Application Submission
    ↓
Candidate Creation/Update
├── Email-based deduplication
├── Profile data merge
├── Document association
├── Application history tracking
└── Tags & notes system
```

### **5.2 Candidate Management Interface**

**Route:** `/admin/candidates` or `/subadmin/candidates`

**Candidate Management:**
```
Candidate Database
├── Advanced Search & Filtering
│   ├── Skills-based search
│   ├── Experience level filter
│   ├── Location filter
│   ├── Status filter
│   └── Application history filter
├── Candidate List View
│   ├── Profile summary
│   ├── Latest application
│   ├── Skills overview
│   ├── Status indicators
│   └── Quick actions
├── Candidate Detail View
│   ├── Complete profile
│   ├── Application history
│   ├── Document library
│   ├── Notes & comments
│   ├── Interview history
│   └── Communication log
└── Candidate Actions
    ├── Add to talent pool
    ├── Schedule interview
    ├── Send messages
    ├── Export profile
    └── Blacklist/Archive
```

### **5.3 Candidate Detail Management**

**Candidate Profile Tabs:**
```
1. Personal & Contact Info
   ├── Basic information
   ├── Contact details
   ├── Social profiles
   └── Communication preferences

2. Professional Background
   ├── Current employment
   ├── Work history timeline
   ├── Skills & proficiencies
   └── Experience summary

3. Educational History
   ├── Education timeline
   ├── Degrees & certifications
   ├── Institutions
   └── Academic achievements

4. Documents
   ├── Resume/CV viewer
   ├── Cover letters
   ├── Portfolio items
   ├── Certificates
   └── Additional documents

5. Application History
   ├── All job applications
   ├── Status progression
   ├── Interview feedback
   └── Hiring decisions

6. Notes & Comments
   ├── Internal notes
   ├── Interview feedback
   ├── Recruiter comments
   └── Communication history
```

## **📋 PHASE 6: ANALYTICS & REPORTING**

### **6.1 Job Performance Analytics**

**Job Analytics Interface:**
```
Job Performance Dashboard
├── Application Metrics
│   ├── Total applications
│   ├── Applications over time
│   ├── Conversion rates
│   └── Source attribution
├── Job Status Distribution
├── Time-to-Fill Analysis
├── Quality Metrics
│   ├── Match scores (when implemented)
│   ├── Hire rates
│   ├── Time in each stage
│   └── Rejection reasons
└── Export & Reporting
```

### **6.2 Application Analytics**

**Application Funnel:**
```
Application Funnel Analysis
├── Stage-by-stage metrics
│   ├── Applied: 100 candidates
│   ├── Screened: 65 candidates (65%)
│   ├── Interviewed: 25 candidates (25%)
│   ├── Offered: 8 candidates (8%)
│   └── Hired: 5 candidates (5%)
├── Drop-off Analysis
├── Time in Each Stage
├── Conversion Optimization
└── Benchmark Comparisons
```

## **📋 PHASE 7: ADVANCED FEATURES (Partially Implemented)**

### **7.1 Job Assignment & Team Management**

**Admin Assignment Flow:**
```
Admin creates job
    ↓
Optionally assigns to SubAdmin
    ↓
SubAdmin receives notification
    ↓
SubAdmin manages entire hiring process
    ↓
Admin retains oversight & reporting access
```

### **7.2 Bulk Operations**

**Bulk Job Management:**
```
Select multiple jobs
    ↓
Available actions:
├── Change status (draft/active/closed/archived)
├── Update visibility (public/private)
├── Set featured status
├── Assign to different SubAdmins
├── Export job data
└── Delete/Archive jobs
```

### **7.3 Template System**

**Job Template Flow:**
```
Create job normally
    ↓
Mark as template during creation
    ↓
Template appears in template library
    ↓
Future job creation can use template
    ↓
Pre-populate form with template data
    ↓
Customize and publish
```

## **🔄 COMPLETE WORKFLOW SUMMARY**

```
1. JOB CREATION
   Admin/SubAdmin → Multi-step form → Save as draft/Publish

2. JOB PUBLICATION
   Published job → Public job board → SEO-friendly listing

3. CANDIDATE DISCOVERY
   Candidate searches → Finds job → Views details

4. APPLICATION PROCESS
   Candidate applies → Multi-step form → Document upload → Submit

5. APPLICATION PROCESSING
   Application received → Recruiter review → Status updates

6. CANDIDATE MANAGEMENT
   Profile creation → Interview process → Hiring decision

7. ANALYTICS & OPTIMIZATION
   Performance tracking → Insights generation → Process improvement
```

## **🚀 API ENDPOINTS SUMMARY**

### **Job Management APIs**
```
GET/POST /api/jobs                    - List/Create jobs
GET/PUT/DELETE /api/jobs/{id}         - Job CRUD operations
PUT /api/jobs/{id}/status             - Update job status
PUT /api/jobs/{id}/assign             - Assign job to SubAdmin
POST /api/jobs/bulk                   - Bulk job operations
GET/POST /api/jobs/templates          - Job template management
```

### **Public Access APIs**
```
GET /api/public/jobs                  - Public job listings
GET /api/public/jobs/{id}             - Public job details
```

### **Application Management APIs**
```
GET/POST /api/applications            - List/Create applications
GET/PUT /api/applications/{id}        - Application CRUD
PUT /api/applications/{id}/status     - Update application status
POST /api/applications/bulk-status    - Bulk status changes
```

### **User Management APIs**
```
GET /api/users/subadmins             - SubAdmin list
GET/PUT /api/users/profile           - Profile management
GET/POST /api/users/subadmins        - SubAdmin CRUD
```

### **SubAdmin Specific APIs**
```
GET /api/subadmin/jobs               - SubAdmin's assigned jobs
GET /api/subadmin/applications       - SubAdmin's applications
GET /api/subadmin/dashboard          - SubAdmin dashboard data
```

## **📊 IMPLEMENTATION STATUS**

| Feature Category | Completion | Status |
|------------------|------------|---------|
| **Job Management** | 95% | ✅ Nearly Complete |
| **Application Process** | 85% | ✅ Mostly Complete |
| **Public Job Board** | 90% | ✅ Nearly Complete |
| **User Management** | 90% | ✅ Nearly Complete |
| **API Infrastructure** | 95% | ✅ Nearly Complete |
| **File Management** | 30% | 🔴 Major Gap |
| **AI/Matching** | 10% | 🔴 Major Gap |
| **Email System** | 20% | 🔴 Major Gap |
| **Analytics** | 40% | 🟡 Partial |
| **Notifications** | 30% | 🟡 Partial |

## **🎯 CRITICAL MISSING FEATURES**

### **🔴 High Priority**
1. **AWS S3 File Storage Integration**
   - Resume/document upload functionality
   - Secure file access and management

2. **AI Resume Processing**
   - AWS Lambda + Textract integration
   - Skills extraction and matching
   - Match scoring algorithm

3. **Email Notification System**
   - Application confirmations
   - Status update notifications
   - Recruiter assignments

### **🟡 Medium Priority**
4. **Advanced Analytics Dashboard**
   - Time-to-hire metrics
   - Source attribution
   - Conversion optimization

5. **Real-time Notifications**
   - In-app notification system
   - Push notifications

6. **Interview Management**
   - Calendar integration
   - Interview scheduling UI
   - Video conference integration

## **📋 NEXT DEVELOPMENT PHASES**

### **Phase 1: Critical Infrastructure (2 weeks)**
- Implement AWS S3 file storage
- Set up email notification system
- Complete notification UI components

### **Phase 2: AI Integration (2 weeks)**
- AWS Textract resume parsing
- Match scoring algorithm
- "Get Top Candidates" feature

### **Phase 3: Enhanced Features (2 weeks)**
- Advanced analytics dashboard
- Interview scheduling system
- Candidate portal completion

---

**Overall Assessment:** The Rekrut ATS has a **solid foundation** with approximately **80% completion** of core ATS functionality. The job flow from creation to application management is largely functional, but critical production features like file storage, AI processing, and email notifications need implementation for a complete enterprise solution.