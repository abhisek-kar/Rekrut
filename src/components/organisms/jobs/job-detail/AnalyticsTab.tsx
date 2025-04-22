'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/shadcn-ui/card";
import { Eye, Users, Share2, UserCheck } from 'lucide-react';

interface JobStats {
  views: number;
  applications: number;
  shares: number;
  hires: number;
}

interface AnalyticsTabProps {
  stats: JobStats;
}

export function AnalyticsTab({ stats }: AnalyticsTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Job Analytics</CardTitle>
        <CardDescription>
          Performance metrics for this job posting
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            title="Views" 
            value={stats.views} 
            icon={<Eye className="h-6 w-6 text-blue-600" />} 
            color="blue"
            description="Total job page views" 
          />
          
          <StatCard 
            title="Applications" 
            value={stats.applications} 
            icon={<Users className="h-6 w-6 text-emerald-600" />} 
            color="emerald"
            description="Total candidates applied" 
          />
          
          <StatCard 
            title="Shares" 
            value={stats.shares} 
            icon={<Share2 className="h-6 w-6 text-purple-600" />} 
            color="purple"
            description="Times job was shared" 
          />
          
          <StatCard 
            title="Hires" 
            value={stats.hires} 
            icon={<UserCheck className="h-6 w-6 text-green-600" />} 
            color="green"
            description="Candidates hired" 
          />
        </div>
        
        <div className="flex justify-center mt-8">
          <p className="text-sm text-muted-foreground">
            More detailed analytics are being developed and will be available soon.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: 'blue' | 'emerald' | 'purple' | 'green';
  description: string;
}

function StatCard({ title, value, icon, color, description }: StatCardProps) {
  const colorMap = {
    blue: 'bg-blue-100',
    emerald: 'bg-emerald-100',
    purple: 'bg-purple-100',
    green: 'bg-green-100',
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col items-center">
          <div className={`h-12 w-12 rounded-full ${colorMap[color]} flex items-center justify-center mb-2`}>
            {icon}
          </div>
          <div className="text-2xl font-bold">{value}</div>
          <p className="text-sm font-medium">{title}</p>
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}
