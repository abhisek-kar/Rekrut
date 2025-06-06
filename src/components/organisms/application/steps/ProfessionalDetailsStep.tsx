import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/shadcn-ui/card";
import { Button } from "@/components/shadcn-ui/button";
import { Input } from "@/components/shadcn-ui/input";
import { Label } from "@/components/shadcn-ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn-ui/select";
import { Textarea } from "@/components/shadcn-ui/textarea";
import { ApplicationData } from "../MultiStepApplicationForm";
import { ChevronRight, ChevronLeft, Briefcase } from "lucide-react";

interface ProfessionalDetailsStepProps {
  data: ApplicationData;
  updateData: (updates: Partial<ApplicationData>) => void;
}

const ProfessionalDetailsStep: React.FC<ProfessionalDetailsStepProps> = ({
  data,
  updateData,
}) => {
  const handleSkillsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const skillsArray = e.target.value
      .split(",")
      .map((skill) => skill.trim())
      .filter((skill) => skill.length > 0);
    updateData({ skills: skillsArray });
  };

  const isValid = data.currentRole && data.experienceLevel;

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Professional Details
          </CardTitle>
          <CardDescription>
            Tell us about your professional experience and skills.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentRole">
                Current Role <span className="text-destructive">*</span>
              </Label>
              <Input
                id="currentRole"
                value={data.currentRole || ""}
                onChange={(e) => updateData({ currentRole: e.target.value })}
                placeholder="e.g., Senior Software Engineer"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currentCompany">Current Company</Label>
              <Input
                id="currentCompany"
                value={data.currentCompany || ""}
                onChange={(e) => updateData({ currentCompany: e.target.value })}
                placeholder="e.g., Tech Corp Inc."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="experienceLevel">Experience Level *</Label>
                <Select
                  value={data.experienceLevel}
                  onValueChange={(value) =>
                    updateData({ experienceLevel: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select experience level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entry">
                      Entry Level (0-2 years)
                    </SelectItem>
                    <SelectItem value="mid">Mid Level (3-5 years)</SelectItem>
                    <SelectItem value="senior">
                      Senior Level (6-10 years)
                    </SelectItem>
                    <SelectItem value="lead">
                      Lead/Principal (10+ years)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="expectedSalary">
                  Expected Salary (Optional)
                </Label>
                <Input
                  id="expectedSalary"
                  type="number"
                  value={data.expectedSalary || ""}
                  onChange={(e) =>
                    updateData({
                      expectedSalary: parseInt(e.target.value) || undefined,
                    })
                  }
                  placeholder="80000"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="skills">Skills & Technologies *</Label>
              <Textarea
                id="skills"
                value={data.skills.join(", ")}
                onChange={handleSkillsChange}
                placeholder="List your key skills, technologies, and tools (e.g., React, Node.js, Python, AWS, etc.)"
                rows={3}
                required
              />
              <p className="text-xs text-muted-foreground">
                Separate skills with commas for better organization
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="noticePeriod">Notice Period</Label>
              <Select
                value={data.noticePeriod || ""}
                onValueChange={(value) => updateData({ noticePeriod: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select notice period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="immediate">Immediate</SelectItem>
                  <SelectItem value="1-week">1 Week</SelectItem>
                  <SelectItem value="2-weeks">2 Weeks</SelectItem>
                  <SelectItem value="1-month">1 Month</SelectItem>
                  <SelectItem value="2-months">2 Months</SelectItem>
                  <SelectItem value="3-months">3 Months</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="linkedinProfile">LinkedIn Profile</Label>
              <Input
                id="linkedinProfile"
                type="url"
                value={data.linkedinProfile || ""}
                onChange={(e) =>
                  updateData({ linkedinProfile: e.target.value })
                }
                placeholder="https://linkedin.com/in/yourprofile"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="portfolioWebsite">Portfolio/Website</Label>
              <Input
                id="portfolioWebsite"
                type="url"
                value={data.portfolioWebsite || ""}
                onChange={(e) =>
                  updateData({ portfolioWebsite: e.target.value })
                }
                placeholder="https://yourportfolio.com"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfessionalDetailsStep;
