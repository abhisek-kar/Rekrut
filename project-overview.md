# Rekrut ATS - High-Level Project Overview

## Project Summary

Rekrut is a SEO friendly modern Applicant Tracking System (ATS) designed for recruitment agencies to streamline their hiring processes. The system enables efficient job posting, candidate tracking, and AI-powered resume screening with a focus on usability and performance.

## Technology Stack

- **Frontend & Backend**: Next.js 14+ (Full-stack JavaScript framework)
- **Styling**: Tailwind CSS with shadcn/ui components
- **Component Structure**: Atomic Design pattern (atoms, molecules, organisms, templates)
- **Database**: MongoDB with Mongoose
- **Authentication**: NextAuth.js with email/password
- **File Storage**: AWS S3
- **AI Processing**: AWS Lambda, Amazon Textract, OpenAI (future implementation)

## Core User Roles

- **Admin**: System administrators who manage the entire platform
- **SubAdmin**: Recruiters who manage assigned jobs and candidates
- **Candidates**: Job seekers who apply for positions

## Key Features

### 1. User Management

- Role-based access control
- Admin and SubAdmin management
- User profiles and settings

### 2. Job Management

- Comprehensive job creation with custom fields
- Job assignment to SubAdmins
- Job status tracking
- Job templates

### 3. Candidate Application

- Hybrid application approach (apply first, optional account creation)
- Multi-step application form
- Resume upload and processing
- Candidate portal for application tracking

### 4. Application Processing

- Application review interface
- AI-powered resume matching (future phase)
- Candidate status workflow
- Interview scheduling

### 5. Analytics & Reporting

- Application source tracking
- Job performance metrics
- Time-to-hire analysis
- Candidate pipeline visualization

### 6. Custom Field System

- Configurable fields for jobs and candidates
- Multiple field types support
- Form builder for custom forms

### 7. Notification System

- In-app notifications
- Email notifications
- Customizable templates

## Development Phases

### Phase 1: Foundation (Weeks 1-2)

- Project setup with Next.js, TypeScript, and Tailwind CSS
- Authentication system implementation
- Database models and connections
- Core layouts and navigation

### Phase 2: Core Features (Weeks 3-5)

- Job management implementation
- Public job board
- Application forms and workflow
- Candidate management

### Phase 3: Advanced Features (Weeks 6-7)

- Custom fields system
- Notification system
- Settings and configuration
- Basic analytics

### Phase 4: Finalization (Weeks 8-9)

- Testing and optimization
- Documentation
- Deployment preparation
- User acceptance testing

## System Architecture

```
┌─────────────────────────────────────┐
│           Next.js Frontend          │
│  (Pages, Components, Client-side)   │
├─────────────────────────────────────┤
│            Next.js API              │
│     (Server-side, API Routes)       │
├─────────────────┬───────────────────┤
│   MongoDB       │     AWS Services  │
│  (Database)     │ (S3, Lambda, etc) │
└─────────────────┴───────────────────┘
```

## Key Workflows

### Job Posting Workflow

1. Admin/SubAdmin creates job posting
2. Job is published to public job board
3. Admin can assign job to specific SubAdmin
4. SubAdmin manages the entire hiring process for assigned jobs

### Candidate Application Workflow

1. Candidate views job on public job board
2. Candidate completes multi-step application form
3. Resume is uploaded and stored
4. Candidate receives application confirmation
5. Optional account creation for application tracking

### Application Processing Workflow

1. Application appears in SubAdmin's dashboard
2. Resume is processed (future: AI matching)
3. SubAdmin reviews and updates application status
4. Candidate is notified of status changes
5. Interview scheduling and further processing
6. Final hiring decision

## Data Model

The system is built around these primary entities:

- Users (Admin/SubAdmin)
- Jobs
- Candidates
- Applications
- Custom Fields
- Documents

Relationships are maintained through MongoDB references, creating a flexible but powerful data structure.

## Future Enhancements

- AI-powered resume matching and ranking
- Advanced analytics and reporting
- Integration with external job boards
- Mobile application
- Automated communication workflows
- Candidate relationship management

## Conclusion

Rekrut ATS provides a comprehensive solution for recruitment agencies to manage their entire hiring pipeline from job posting to candidate hiring. The system's modern architecture, customizable workflows, and future AI capabilities position it as a powerful tool in the competitive recruitment market.
