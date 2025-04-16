# Product Requirements Document (PRD)

## Project Title: Rekrut – Applicant Tracking System

**By Codekart**  
**Date:** April 15, 2025

---

## 1. Overview

Rekrut is a modern Applicant Tracking System (ATS) tailored for recruitment agencies. It enables efficient job posting, candidate tracking, referral performance monitoring, and AI-powered resume screening. It supports two primary roles: **Admin** and **SubAdmin**.

---

## 2. Goals & Objectives

- Streamline and centralize the recruitment process
- Enable referral tracking with unique links
- Use AI to match resumes with job descriptions
- Provide intuitive dashboards for performance insights
- Utilize a scalable cloud-based pipeline with AWS
- Build the frontend using **Next.js** for performance and SSR

---

## 3. User Roles & Permissions

### Admin

- Create/manage SubAdmins
- Post and assign jobs
- View global dashboards and metrics

### SubAdmin

- Create and manage job posts
- Share job posts with referral links
- Screen and manage candidate applications
- View personal dashboards and match scores

---

## 4. Functional Requirements

### 4.1 Job Posting & Management

- Job creation/edit/archive
- Assignment to SubAdmins (by Admin)
- Fields: title, description, location, skills, salary, expiry

### 4.2 Candidate Application Flow

- Public job board
- Resume upload via form (PDF/DOC)
- Resume processing via AWS-native pipeline:
  - AWS Lambda → Text extraction
  - Amazon Textract → Document parsing
  - Amazon Comprehend → NLP processing
  - Embeddings generation (OpenAI or SageMaker)
  - Vector storage (Pinecone or AWS alternative)

### 4.3 Resume Matching

- Compare resume and job vectors
- Display match score to SubAdmin

### 4.4 Candidate Screening (Manual Review with Smart Filtering)

- SubAdmin clicks "Get Top Candidates"
  - Input number (e.g., Top 50, 100)
  - System filters and displays top-matching applicants
  - View includes match score, skills, and experience highlights
- SubAdmin manually reviews resumes, adds notes/tags
- Option to move selected candidates to "Screened"
- "Reject All Remaining" button to bulk reject and optionally trigger emails

### 4.5 Referral Tracking

- Unique referral link for each SubAdmin
- Auto-tag candidates by source
- Performance attribution

### 4.6 Candidate Management

- Statuses: Applied → Screened → Interview Scheduled → Interviewed → Offered → Hired/Rejected
- Add internal comments and notes

### 4.7 Dashboards

- **Admin Dashboard**: Global KPIs, job metrics, SubAdmin performance
- **SubAdmin Dashboard**: Assigned jobs, candidate scores, referral stats

### 4.8 Notifications

- Email or in-app alerts for:
  - New applications
  - Match updates
  - Status changes

### 4.9 Resume Management

- Resume history across jobs
- Bulk upload
- Deduplication logic
- Filtering by skill/experience/status

### 4.10 Visibility & Expiry

- Job visibility settings (public/private)
- Auto-expiry handling

### 4.11 Role-Based Access Control (RBAC)

- Secure access by role (Admin/SubAdmin)
- Scalable for future roles (Recruiter, Manager, etc.)

### 4.12 Compliance

- GDPR-ready with consent, download, and delete options
- Secure, encrypted storage for resumes and data

---

## 5. Non-Functional Requirements

- High availability and scalability (AWS-native stack)
- Resume storage on AWS S3
- Modular backend services (Node.js + microservices optional)
- Frontend built with **Next.js**
- Responsive UI for desktop/mobile use

---

## 6. Future Enhancements

- Auto-post jobs to LinkedIn and other boards
- Resume scraping from external sources
- AI-generated job descriptions
- Rediscovery of past candidates using stored vectors
- Automated communications (emails, reminders)

---

## 7. Dependencies

- AWS S3 (Resume storage)
- AWS Lambda, Textract, Comprehend (Resume pipeline)
- OpenAI or AWS SageMaker (Embeddings)
- Pinecone (or alternative) for vector search
- Redis / BullMQ for queuing and task scheduling

---

## 8. Timeline & Milestones

_To be defined per sprint planning or roadmap_

---

## 9. Key Metrics (KPIs)

- Time-to-hire
- Resume match accuracy
- Referral conversion rate
- Resume processing speed
- SubAdmin performance insights

---

## 10. Risks & Mitigation

- **Resume pipeline limits**: fallback mechanisms or queuing
- **OpenAI costs/limits**: budget tracking, alternate models
- **Data duplication**: enforce matching checks
- **Security & compliance**: audit logs, encryption, access policies

---

## 11. User Stories

### Admin

- "As an Admin, I want to assign job posts to SubAdmins to delegate hiring."
- "As an Admin, I want to track SubAdmin performance and candidate progress."

### SubAdmin

- "As a SubAdmin, I want to create jobs and share referral links to find candidates."
- "As a SubAdmin, I want to view match scores and manage applicants efficiently."

### Candidate

- "As a candidate, I want to view active jobs and apply easily by uploading my resume."

---

## 12. Wireframes & Diagrams

- Public Job Board
- Admin Dashboard
- SubAdmin Dashboard
- Job Posting Form
- Candidate Screening Interface
- Resume Upload Flow
- AWS Resume Processing Pipeline

_(Wireframe designs and diagrams to be added in UI/UX phase)_

---

## 13. Appendix

- Sample job post format
- Resume JSON structure post-processing
- Match score calculation overview

---

**End of Document**
