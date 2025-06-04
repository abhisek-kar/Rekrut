"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/shadcn-ui/breadcrumb";
import { SidebarTrigger } from "@/components/shadcn-ui/sidebar";
import { Separator } from "@/components/shadcn-ui/separator";
import { Button } from "@/components/shadcn-ui/button";
import { Card, CardContent } from "@/components/shadcn-ui/card";
import { Input } from "@/components/shadcn-ui/input";
import { Skeleton } from "@/components/shadcn-ui/skeleton";
import { toast } from "sonner";
import { PlusCircle, Search, FileText } from "lucide-react";
import { JobType } from "@/types/job";
import { PageHeader } from "@/components/shared/PageHeader";

// Create JobTemplateCard component
function JobTemplateCard({
  template,
  onUseTemplate,
  onEditTemplate,
}: {
  template: JobType;
  onUseTemplate: (template: JobType) => void;
  onEditTemplate: (template: JobType) => void;
}) {
  return (
    <Card className="h-full flex flex-col">
      <CardContent className="p-5 flex-1 flex flex-col">
        <div className="mb-4 flex justify-between items-start">
          <div className="flex items-center">
            <div className="bg-primary/10 p-2 rounded-full mr-3">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-semibold text-lg line-clamp-1">
              {template.title}
            </h3>
          </div>
        </div>

        <div className="text-sm text-muted-foreground mb-3 line-clamp-1">
          {template.company} • {template.employmentType} •{" "}
          {template.experienceLevel}
        </div>

        <div className="text-sm line-clamp-3 mb-3 flex-1">
          {template.description?.substring(0, 120)}...
        </div>

        <div className="flex flex-wrap gap-1 mb-4">
          {template.skills?.slice(0, 3).map((skill, index) => (
            <span
              key={index}
              className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded"
            >
              {skill}
            </span>
          ))}
          {template.skills && template.skills.length > 3 && (
            <span className="text-xs bg-secondary/50 text-secondary-foreground px-2 py-1 rounded">
              +{template.skills.length - 3} more
            </span>
          )}
        </div>

        <div className="flex gap-2 mt-auto pt-4 border-t">
          <Button
            variant="default"
            className="flex-1"
            onClick={() => onUseTemplate(template)}
          >
            Use Template
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onEditTemplate(template)}
          >
            Edit
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function JobTemplatesPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<JobType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredTemplates, setFilteredTemplates] = useState<JobType[]>([]);

  // Fetch templates when page loads
  useEffect(() => {
    fetchTemplates();
  }, []);

  // Filter templates when search term changes
  useEffect(() => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      setFilteredTemplates(
        templates.filter(
          (template) =>
            template.title.toLowerCase().includes(term) ||
            template.company.toLowerCase().includes(term) ||
            template.description?.toLowerCase().includes(term) ||
            template.skills?.some((skill) => skill.toLowerCase().includes(term))
        )
      );
    } else {
      setFilteredTemplates(templates);
    }
  }, [templates, searchTerm]);

  // Fetch templates from API
  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/jobs/templates");

      if (!response.ok) {
        throw new Error("Failed to fetch templates");
      }

      const data = await response.json();
      setTemplates(data.templates);
      setFilteredTemplates(data.templates);
    } catch (error) {
      console.error("Error fetching templates:", error);
      toast.error("Failed to load job templates");
    } finally {
      setLoading(false);
    }
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Handle using a template to create a new job
  const handleUseTemplate = (template: JobType) => {
    // Store template data in localStorage
    localStorage.setItem("jobTemplate", JSON.stringify(template));

    // Navigate to job creation page with template param
    router.push("/admin/jobs/create?useTemplate=true");
  };

  // Handle editing a template
  const handleEditTemplate = (template: JobType) => {
    router.push(`/admin/jobs/templates/${template._id}/edit`);
  };

  // Handle creating a new template
  const handleCreateTemplate = () => {
    router.push("/admin/jobs/templates/create");
  };

  // Render loading state
  const renderLoading = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array(6)
          .fill(0)
          .map((_, index) => (
            <Card key={index} className="h-64">
              <CardContent className="p-5">
                <div className="flex items-center mb-4">
                  <Skeleton className="h-10 w-10 rounded-full mr-3" />
                  <Skeleton className="h-6 w-1/2" />
                </div>
                <Skeleton className="h-4 w-3/4 mb-3" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3 mb-4" />
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-20" />
                </div>
              </CardContent>
            </Card>
          ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader
        title="Job Templates"
        description="Create and manage reusable job templates"
        actions={
          <Button onClick={handleCreateTemplate} className="gap-1">
            <PlusCircle className="h-4 w-4 mr-2" />
            Create Template
          </Button>
        }
      />

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search templates..."
          className="pl-9"
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>

      {/* Templates Grid */}
      {loading ? (
        renderLoading()
      ) : filteredTemplates.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium">No templates found</h3>
          <p className="text-muted-foreground mt-1 max-w-md mx-auto">
            {searchTerm
              ? "No templates match your search criteria. Try a different search term."
              : "You haven't created any job templates yet. Templates make it faster to post similar jobs."}
          </p>
          <Button onClick={handleCreateTemplate} className="mt-4 gap-1">
            <PlusCircle className="h-4 w-4" />
            Create Your First Template
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <JobTemplateCard
              key={template._id}
              template={template}
              onUseTemplate={handleUseTemplate}
              onEditTemplate={handleEditTemplate}
            />
          ))}
        </div>
      )}
    </div>
  );
}
