'use client';

import { useState, useEffect } from 'react';
import { SubAdminCard, SubAdminCardSkeleton } from './SubAdminCard';
import { Pagination } from '@/components/molecules/Pagination';
import { EmptyState } from '@/components/molecules/EmptyState';
import { User, UserX } from 'lucide-react';

interface SubAdmin {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePhoto?: string;
  status: string;
  assignedJobs: number;
  lastActive?: string;
}

interface SubAdminListProps {
  loading: boolean;
  subadmins: SubAdmin[];
  selectedSubAdmin: string | null;
  onSelectSubAdmin: (id: string) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function SubAdminList({
  loading,
  subadmins,
  selectedSubAdmin,
  onSelectSubAdmin,
  currentPage,
  totalPages,
  onPageChange,
}: SubAdminListProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array(6).fill(0).map((_, index) => (
          <SubAdminCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (subadmins.length === 0) {
    return (
      <EmptyState
        icon={UserX}
        title="No recruiters found"
        description="There are no recruiters matching your criteria."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subadmins.map((subadmin) => (
          <SubAdminCard
            key={subadmin._id}
            subadmin={subadmin}
            isSelected={selectedSubAdmin === subadmin._id}
            onSelect={onSelectSubAdmin}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
}
