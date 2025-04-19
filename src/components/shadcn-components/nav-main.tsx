"use client";

import { ChevronRight, type LucideIcon } from "lucide-react";
import Link from "next/link";

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroupLabel,
} from "@/components/shadcn-ui/sidebar";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: LucideIcon | (() => JSX.Element);
    isActive?: boolean;
    items?: {
      title: string;
      url: string;
      isActive?: boolean;
    }[];
    category?: string;
  }[];
}) {
  // Group items by category
  const groupedItems = items.reduce((acc, item) => {
    const category = item.category || "Main";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, typeof items>);

  // Get categories in order
  const categories = Object.keys(groupedItems);
  
  return (
    <>
      {categories.map((category) => (
        <div key={category} className="mb-6">
          {category !== "Main" && (
            <SidebarGroupLabel className="mb-2 uppercase tracking-wider text-xs text-gray-500 dark:text-gray-400 font-semibold">
              {category}
            </SidebarGroupLabel>
          )}
          <SidebarMenu>
            {groupedItems[category].map((item) => (
              <SidebarMenuItem key={item.title} className="mb-1">
                <Link href={item.url} className="w-full">
                  <SidebarMenuButton
                    tooltip={item.title}
                    data-active={item.isActive}
                    className="w-full rounded-md data-[active=true]:bg-primary/10 data-[active=true]:text-primary dark:data-[active=true]:bg-primary/20 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    {item.icon && (
                      typeof item.icon === 'function' 
                        ? item.icon()
                        : <item.icon className="h-5 w-5" />
                    )}
                    <span>{item.title}</span>
                    {item.items && (
                      <ChevronRight className="ml-auto h-4 w-4 opacity-70 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    )}
                  </SidebarMenuButton>
                </Link>
                
                {/* Nested items (if any) */}
                {item.items && item.items.length > 0 && (
                  <div className="ml-6 mt-1 border-l border-gray-200 dark:border-gray-700 pl-2">
                    {item.items.map((subItem) => (
                      <Link key={subItem.title} href={subItem.url} className="block py-1 px-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors my-1">
                        <span className={`${subItem.isActive ? 'text-primary font-medium' : 'text-gray-700 dark:text-gray-300'}`}>
                          {subItem.title}
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </div>
      ))}
    </>
  );
}
