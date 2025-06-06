          'use client';

import { useParams } from 'next/navigation';

export default function CandidateDetailsPage() {
  const params = useParams();
  const { id } = params;

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Candidate Details</h1>
      <p>Candidate ID: {id}</p>
      <p>This page is under construction.</p>
    </div>
  );
}