export interface BreadcrumbItem {
  label: string;
  href: string;
  isCurrentPage?: boolean;
}

export function generateBreadcrumbs(
  pathname: string,
  userRole: "admin" | "subadmin"
): BreadcrumbItem[] {
  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [];

  // Add role-based root
  breadcrumbs.push({
    label: userRole === "admin" ? "Admin" : "SubAdmin",
    href: `/${userRole}`,
  });

  // Build breadcrumbs from path segments
  let currentPath = `/${userRole}`;

  for (let i = 1; i < segments.length; i++) {
    const segment = segments[i];
    currentPath += `/${segment}`;

    breadcrumbs.push({
      label: formatSegment(segment),
      href: currentPath,
      isCurrentPage: i === segments.length - 1,
    });
  }

  return breadcrumbs;
}

function formatSegment(segment: string): string {
  // Handle special cases and format segment names
  const specialCases: Record<string, string> = {
    users: "User Management",
    create: "Create SubAdmin",
    edit: "Edit",
    dashboard: "Dashboard",
    jobs: "Jobs Management",
    applications: "Applications",
    candidates: "Candidates",
    settings: "Settings",
    notifications: "Notifications",
    profile: "Profile",
    templates: "Templates",
    assign: "Assign",
  };

  return (
    specialCases[segment] || segment.charAt(0).toUpperCase() + segment.slice(1)
  );
}

// For dynamic segments like [id], you can pass additional context
export function generateBreadcrumbsWithContext(
  pathname: string,
  userRole: "admin" | "subadmin",
  context?: Record<string, string>
): BreadcrumbItem[] {
  const breadcrumbs = generateBreadcrumbs(pathname, userRole);

  // Replace dynamic segments with actual names if context is provided
  if (context) {
    return breadcrumbs.map((breadcrumb) => {
      // Check if this is a dynamic segment (contains numbers or looks like an ID)
      const segment = breadcrumb.href.split("/").pop() || "";
      if (context[segment]) {
        return {
          ...breadcrumb,
          label: context[segment],
        };
      }
      return breadcrumb;
    });
  }

  return breadcrumbs;
}
