'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/shadcn-ui/card";
import { Badge } from "@/components/shadcn-ui/badge";
import { Separator } from "@/components/shadcn-ui/separator";
import { GraduationCap } from "lucide-react";
import { JobType } from '@/types/job';

interface JobDetailsCardProps {
  job: JobType;
}

export function JobDetailsCard({ job }: JobDetailsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Job Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Job Description */}
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Job Description</h3>
          <div className="prose max-w-none">
            {job.description ? (
              <p>{job.description}</p>
            ) : (
              <p className="text-muted-foreground">No job description provided.</p>
            )}
          </div>
        </div>
        
        {/* Responsibilities */}
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Responsibilities</h3>
          <div className="prose max-w-none">
            {job.responsibilities ? (
              <p>{job.responsibilities}</p>
            ) : (
              <p className="text-muted-foreground">No responsibilities provided.</p>
            )}
          </div>
        </div>
        
        {/* Requirements */}
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Requirements</h3>
          <div className="prose max-w-none">
            {job.requirements ? (
              <p>{job.requirements}</p>
            ) : (
              <p className="text-muted-foreground">No requirements provided.</p>
            )}
          </div>
        </div>
        
        {/* Skills */}
        {job.skills && job.skills.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {job.skills.map((skill, index) => (
                <Badge key={index} variant="secondary">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        {/* Education Requirements */}
        {job.educationRequirements && job.educationRequirements.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Education</h3>
            <div className="flex flex-wrap gap-2">
              {job.educationRequirements.map((education, index) => (
                <div key={index} className="flex items-center">
                  <GraduationCap className="h-4 w-4 mr-1 text-muted-foreground" />
                  <span>{education}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Benefits & Perks */}
        {((job.benefits && job.benefits.length > 0) || 
          (job.perks && job.perks.length > 0)) && (
          <div className="space-y-4">
            <Separator />
            <h3 className="text-lg font-medium">Benefits & Perks</h3>
            
            {job.benefits && job.benefits.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-md font-medium">Benefits</h4>
                <div className="flex flex-wrap gap-2">
                  {job.benefits.map((benefit, index) => (
                    <Badge key={index} variant="outline">
                      {benefit}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {job.perks && job.perks.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-md font-medium">Perks</h4>
                <div className="flex flex-wrap gap-2">
                  {job.perks.map((perk, index) => (
                    <Badge key={index} variant="outline">
                      {perk}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
