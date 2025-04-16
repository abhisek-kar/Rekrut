# Rekrut ATS - Applicant Tracking System

Rekrut is a modern Applicant Tracking System (ATS) designed for recruitment agencies to streamline their hiring processes. The system enables efficient job posting, candidate tracking, and AI-powered resume screening.

## Features

- User role management (Admin/SubAdmin)
- Job posting and management
- Candidate application processing
- Document management
- Custom fields for jobs and applications
- Notification system
- Analytics and reporting

## Technology Stack

- **Frontend & Backend**: Next.js 14+
- **Styling**: Tailwind CSS with shadcn/ui components
- **Database**: MongoDB with Mongoose
- **Authentication**: NextAuth.js with JWT
- **File Storage**: AWS S3
- **AI Processing**: Future implementation

## Getting Started

### Prerequisites

- Node.js 18+ 
- MongoDB
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-organization/rekrut-ats.git
cd rekrut-ats
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```
Edit the `.env.local` file and update the values with your own configuration.

Important environment variables:
- `MONGODB_URI`: Your MongoDB connection string
- `JWT_SECRET`: A secure random string for JWT token signing
- `ADMIN_EMAIL` and `ADMIN_PASSWORD`: Credentials for the initial admin user

4. Run the development server:
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Admin User Seeding

The application will automatically create an admin user on startup if one doesn't exist. The credentials are taken from your environment variables:

```
ADMIN_EMAIL=admin@rekrut.com
ADMIN_PASSWORD=SecurePassword123
ADMIN_FIRST_NAME=Admin
ADMIN_LAST_NAME=User
```

These values should be changed in your production environment.

## Project Structure

- `/src/app` - Next.js app directory with routes and API handlers
- `/src/components` - UI components following Atomic Design pattern
- `/src/models` - MongoDB schemas
- `/src/lib` - Utility functions and helpers
- `/src/hooks` - Custom React hooks
- `/src/context` - React context providers

## Development Workflow

The project is developed in phases:

1. Core Infrastructure: Authentication, user management, basic dashboard
2. Job Management: Job creation, public job board, custom fields
3. Application Processing: Application submission, candidate management
4. Advanced Features: Notifications, candidate portal, analytics
5. AI Integration: Resume parsing, advanced matching

## License

This project is licensed under the MIT License - see the LICENSE file for details.
