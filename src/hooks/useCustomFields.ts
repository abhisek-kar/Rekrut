// Custom Fields hook
// This is a placeholder file for the hook structure

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';

interface CustomField {
  id: string;
  name: string;
  label: string;
  type: string;
  required: boolean;
  options?: Array<{ value: string; label: string }>;
}

export function useCustomFields(entityType: 'job' | 'candidate' | 'application') {
  const [fields, setFields] = useState<CustomField[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCustomFields = async () => {
      try {
        setLoading(true);
        // Use the new API client for custom fields
        const response = await apiClient.get(`/api/custom-fields/entities/${entityType}`);
        
        if (response.success) {
          setFields(response.data.fields);
          setError(null);
        } else {
          throw new Error(response.error?.message || 'Failed to fetch custom fields');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchCustomFields();
  }, [entityType]);

  return { fields, loading, error };
}

export default useCustomFields;
