import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/nextauth';
import dbConnect from '@/lib/db/connect';
import Job from '@/models/Job';
import Application from '@/models/Application';
import Candidate from '@/models/Candidate';
import User from '@/models/User';

export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated and has admin role
    if (!session || !session.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Connect to database
    await dbConnect();

    // Get query parameters
    const url = new URL(req.url);
    const dateRange = url.searchParams.get('dateRange') || '30days';
    const startDate = getStartDateFromRange(dateRange);

    // Fetch dashboard metrics
    const [
      totalJobs,
      jobsByStatus,
      totalApplications,
      applicationsByStage,
      applicationsOverTime,
      hiringStats,
      candidatesCount,
      subadminsCount
    ] = await Promise.all([
      // Total jobs
      Job.countDocuments(),
      
      // Jobs by status
      Job.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]),
      
      // Total applications
      Application.countDocuments(),
      
      // Applications by stage
      Application.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]),
      
      // Applications over time
      getApplicationsOverTime(startDate, dateRange),
      
      // Hiring stats
      Application.aggregate([
        {
          $match: {
            status: 'hired',
            createdAt: { $gte: startDate }
          }
        },
        {
          $count: 'hired'
        }
      ]),
      
      // Total candidates
      Candidate.countDocuments(),
      
      // Total subadmins
      User.countDocuments({ role: 'subadmin' })
    ]);

    // Calculate active jobs
    const activeJobs = jobsByStatus.find(item => item._id === 'active')?.count || 0;
    
    // Calculate candidates in pipeline (not rejected or hired)
    const candidatesInPipeline = applicationsByStage.reduce((sum, item) => {
      if (!['rejected', 'hired'].includes(item._id)) {
        return sum + item.count;
      }
      return sum;
    }, 0);
    
    // Calculate hiring rate
    const hired = hiringStats[0]?.hired || 0;
    const hiringRate = totalApplications > 0 
      ? parseFloat(((hired / totalApplications) * 100).toFixed(1)) 
      : 0;

    // Format job status distribution for the chart
    const jobStatusData = jobsByStatus.map(item => ({
      status: item._id,
      count: item.count,
      percentage: totalJobs > 0 ? Math.round((item.count / totalJobs) * 100) : 0
    }));

    // Format application stages for the funnel
    const applicationStages = ['applied', 'screened', 'interview_scheduled', 'interviewed', 'offered', 'hired'];
    const applicationFunnelData = applicationStages.map(stage => {
      const stageData = applicationsByStage.find(item => item._id === stage);
      return {
        stage,
        count: stageData?.count || 0,
        percentage: totalApplications > 0 
          ? Math.round(((stageData?.count || 0) / totalApplications) * 100) 
          : 0
      };
    });

    return NextResponse.json({
      metrics: {
        totalJobs,
        activeJobs,
        totalApplications,
        candidatesInPipeline,
        hiringRate,
        totalCandidates: candidatesCount,
        totalSubadmins: subadminsCount
      },
      charts: {
        jobStatusDistribution: jobStatusData,
        applicationFunnel: applicationFunnelData,
        applicationsOverTime: applicationsOverTime
      }
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" }, 
      { status: 500 }
    );
  }
}

// Helper function to get start date based on date range
function getStartDateFromRange(dateRange: string): Date {
  const now = new Date();
  switch (dateRange) {
    case '7days':
      return new Date(now.setDate(now.getDate() - 7));
    case '30days':
      return new Date(now.setDate(now.getDate() - 30));
    case '60days':
      return new Date(now.setDate(now.getDate() - 60));
    case '90days':
      return new Date(now.setDate(now.getDate() - 90));
    case 'thisyear':
      return new Date(now.getFullYear(), 0, 1);
    default:
      return new Date(now.setDate(now.getDate() - 30));
  }
}

// Helper function to get applications over time
async function getApplicationsOverTime(startDate: Date, dateRange: string) {
  let groupByFormat;
  let dateFormat;
  
  // Determine group by format based on date range
  switch (dateRange) {
    case '7days':
      groupByFormat = {
        day: { $dayOfMonth: '$createdAt' },
        month: { $month: '$createdAt' },
        year: { $year: '$createdAt' }
      };
      dateFormat = '%d/%m';
      break;
    case '30days':
    case '60days':
      groupByFormat = {
        week: { $week: '$createdAt' },
        year: { $year: '$createdAt' }
      };
      dateFormat = 'W%W';
      break;
    case '90days':
    case 'thisyear':
      groupByFormat = {
        month: { $month: '$createdAt' },
        year: { $year: '$createdAt' }
      };
      dateFormat = '%b';
      break;
    default:
      groupByFormat = {
        week: { $week: '$createdAt' },
        year: { $year: '$createdAt' }
      };
      dateFormat = 'W%W';
  }

  const result = await Application.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: groupByFormat,
        count: { $sum: 1 }
      }
    },
    {
      $sort: {
        '_id.year': 1,
        '_id.month': 1,
        '_id.week': 1,
        '_id.day': 1
      }
    },
    {
      $project: {
        _id: 0,
        date: dateFormat,
        value: '$count'
      }
    }
  ]);

  return result;
}
