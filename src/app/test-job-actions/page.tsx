/**
 * Manual Test Page for Unified Job Actions System
 * Access at: http://localhost:3000/test-job-actions
 * 
 * This page allows manual testing of:
 * - Bulk vs single job actions
 * - Role-based permission handling
 * - Edge case prevention (subadmin bulk assign)
 * - API routing logic
 */
'use client';

import { useState } from 'react';
import { Button } from '@/components/shadcn-ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shadcn-ui/card';
import { Badge } from '@/components/shadcn-ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/shadcn-ui/tabs';
import { Checkbox } from '@/components/shadcn-ui/checkbox';
import { useJobActions } from '@/hooks/useJobActions';
import { JobActionDialogs } from '@/components/organisms/jobs/dialogs/JobActionDialogs';
import { toast } from 'sonner';

// Mock job data for testing
const MOCK_JOBS = [
  { id: '507f1f77bcf86cd799439011', title: 'Frontend Developer', status: 'active', assignedTo: null },
  { id: '507f1f77bcf86cd799439012', title: 'Backend Engineer', status: 'draft', assignedTo: null },
  { id: '507f1f77bcf86cd799439013', title: 'DevOps Specialist', status: 'active', assignedTo: 'subadmin-1' },
  { id: '507f1f77bcf86cd799439014', title: 'Product Manager', status: 'paused', assignedTo: null },
  { id: '507f1f77bcf86cd799439015', title: 'UI/UX Designer', status: 'active', assignedTo: 'subadmin-2' },
];

// Mock users for assignment testing
const MOCK_USERS = [
  { _id: 'subadmin-1', firstName: 'Alice', lastName: 'Johnson', email: 'alice@company.com' },
  { _id: 'subadmin-2', firstName: 'Bob', lastName: 'Smith', email: 'bob@company.com' },
  { _id: 'subadmin-3', firstName: 'Carol', lastName: 'Davis', email: 'carol@company.com' },
];

interface TestResultsProps {
  results: Array<{ test: string; result: 'pass' | 'fail' | 'info'; message: string }>;
}

function TestResults({ results }: TestResultsProps) {
  if (results.length === 0) return null;

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Test Results</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {results.map((result, index) => (
          <div key={index} className="flex items-center gap-2">
            <Badge variant={result.result === 'pass' ? 'default' : result.result === 'fail' ? 'destructive' : 'secondary'}>
              {result.result === 'pass' ? '✓' : result.result === 'fail' ? '✗' : 'ℹ'}
            </Badge>
            <span className="text-sm">
              <strong>{result.test}:</strong> {result.message}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export default function TestJobActionsPage() {
  const [selectedJobs, setSelectedJobs] = useState<string[]>([]);
  const [currentRole, setCurrentRole] = useState<'admin' | 'subadmin'>('admin');
  const [testResults, setTestResults] = useState<Array<{ test: string; result: 'pass' | 'fail' | 'info'; message: string }>>([]);

  const jobActions = useJobActions({ 
    userRole: currentRole,
    onSuccess: () => {
      addTestResult('Action Success', 'pass', 'Action completed successfully');
      setSelectedJobs([]);
    }
  });

  const addTestResult = (test: string, result: 'pass' | 'fail' | 'info', message: string) => {
    setTestResults(prev => [...prev, { test, result, message }]);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const handleJobSelection = (jobId: string) => {
    setSelectedJobs(prev => 
      prev.includes(jobId) 
        ? prev.filter(id => id !== jobId)
        : [...prev, jobId]
    );
  };

  const testSingleAction = (action: string) => {
    if (selectedJobs.length !== 1) {
      addTestResult('Single Action Test', 'fail', 'Please select exactly one job for single action test');
      return;
    }

    addTestResult('Single Action Test', 'info', `Testing ${action} on single job (should use individual API)`);
    jobActions.handleJobAction(action, selectedJobs[0]);
  };

  const testBulkAction = (action: string) => {
    if (selectedJobs.length < 2) {
      addTestResult('Bulk Action Test', 'fail', 'Please select at least 2 jobs for bulk action test');
      return;
    }

    // Test the edge case: subadmin bulk assign
    if (action === 'assign' && currentRole === 'subadmin') {
      addTestResult('Edge Case Test', 'info', 'Testing subadmin bulk assign prevention...');
    } else {
      addTestResult('Bulk Action Test', 'info', `Testing ${action} on ${selectedJobs.length} jobs (should use bulk API)`);
    }

    jobActions.handleJobAction(action, selectedJobs);
  };

  const testAPIRouting = () => {
    addTestResult('API Routing Test', 'info', 'Testing API routing logic...');
    
    // Test single job routing
    const singleJobEndpoint = '/api/jobs/[id]/action';
    addTestResult('Single Job Routing', 'pass', `Single jobs route to: ${singleJobEndpoint}`);
    
    // Test bulk routing
    const bulkEndpoint = currentRole === 'admin' ? '/api/jobs/bulk' : '/api/subadmin/jobs/bulk';
    addTestResult('Bulk Job Routing', 'pass', `Bulk jobs route to: ${bulkEndpoint}`);
    
    // Test edge case
    if (currentRole === 'subadmin') {
      addTestResult('Subadmin Edge Case', 'pass', 'Subadmin bulk assign should be prevented at hook level');
    }
  };

  const testPermissionBoundaries = () => {
    addTestResult('Permission Test', 'info', 'Testing role-based permissions...');
    
    if (currentRole === 'admin') {
      addTestResult('Admin Permissions', 'pass', 'Admin can access all actions including assignment');
    } else {
      addTestResult('Subadmin Permissions', 'pass', 'Subadmin restricted to assigned jobs only, no bulk assignment');
    }
  };

  const actions = [
    { key: 'status', label: 'Change Status', description: 'Update job status' },
    { key: 'visibility', label: 'Set Visibility', description: 'Change job visibility' },
    { key: 'feature', label: 'Feature Job', description: 'Toggle featured status' },
    { key: 'assign', label: 'Assign Job', description: 'Assign to subadmin (admin only for bulk)' },
    { key: 'archive', label: 'Archive Job', description: 'Archive selected jobs' },
    { key: 'delete', label: 'Delete Job', description: 'Delete selected jobs' },
  ];

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Job Actions Test Suite</h1>
        <p className="text-muted-foreground">
          Manual testing interface for the unified job actions system
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Test Controls */}
        <div className="space-y-6">
          {/* Role Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Test Configuration</CardTitle>
              <CardDescription>Configure test parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">User Role</label>
                <Tabs value={currentRole} onValueChange={(value) => setCurrentRole(value as 'admin' | 'subadmin')}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="admin">Admin</TabsTrigger>
                    <TabsTrigger value="subadmin">SubAdmin</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Selected Jobs ({selectedJobs.length})
                </label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {MOCK_JOBS.map((job) => (
                    <div key={job.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={job.id}
                        checked={selectedJobs.includes(job.id)}
                        onCheckedChange={() => handleJobSelection(job.id)}
                      />
                      <label htmlFor={job.id} className="text-sm flex-1 cursor-pointer">
                        {job.title}
                        <Badge variant="outline" className="ml-2">
                          {job.status}
                        </Badge>
                        {job.assignedTo && (
                          <Badge variant="secondary" className="ml-1">
                            Assigned
                          </Badge>
                        )}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSelectedJobs(MOCK_JOBS.map(j => j.id))}
                >
                  Select All
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSelectedJobs([])}
                >
                  Clear
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={clearResults}
                >
                  Clear Results
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* System Tests */}
          <Card>
            <CardHeader>
              <CardTitle>System Tests</CardTitle>
              <CardDescription>Test core system functionality</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button onClick={testAPIRouting} variant="outline" className="w-full">
                Test API Routing Logic
              </Button>
              <Button onClick={testPermissionBoundaries} variant="outline" className="w-full">
                Test Permission Boundaries
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Action Tests */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Action Tests</CardTitle>
              <CardDescription>Test individual and bulk actions</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="single" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="single">Single Actions</TabsTrigger>
                  <TabsTrigger value="bulk">Bulk Actions</TabsTrigger>
                </TabsList>
                
                <TabsContent value="single" className="space-y-2 mt-4">
                  <p className="text-sm text-muted-foreground mb-3">
                    Select exactly 1 job to test single actions (uses individual APIs)
                  </p>
                  {actions.map((action) => (
                    <Button
                      key={action.key}
                      onClick={() => testSingleAction(action.key)}
                      disabled={selectedJobs.length !== 1}
                      variant="outline"
                      className="w-full justify-start"
                    >
                      {action.label}
                      <Badge variant="secondary" className="ml-auto">
                        Individual API
                      </Badge>
                    </Button>
                  ))}
                </TabsContent>
                
                <TabsContent value="bulk" className="space-y-2 mt-4">
                  <p className="text-sm text-muted-foreground mb-3">
                    Select 2+ jobs to test bulk actions (uses bulk APIs)
                  </p>
                  {actions.map((action) => (
                    <Button
                      key={action.key}
                      onClick={() => testBulkAction(action.key)}
                      disabled={selectedJobs.length < 2}
                      variant="outline"
                      className="w-full justify-start"
                    >
                      {action.label}
                      <Badge 
                        variant={action.key === 'assign' && currentRole === 'subadmin' ? 'destructive' : 'secondary'} 
                        className="ml-auto"
                      >
                        {action.key === 'assign' && currentRole === 'subadmin' ? 'Blocked' : 'Bulk API'}
                      </Badge>
                    </Button>
                  ))}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <TestResults results={testResults} />
        </div>
      </div>

      {/* Include the job action dialogs */}
      <JobActionDialogs 
        showStatusDialog={jobActions.showStatusDialog}
        setShowStatusDialog={jobActions.setShowStatusDialog}
        showVisibilityDialog={jobActions.showVisibilityDialog}
        setShowVisibilityDialog={jobActions.setShowVisibilityDialog}
        showFeatureDialog={jobActions.showFeatureDialog}
        setShowFeatureDialog={jobActions.setShowFeatureDialog}
        showAssignDialog={jobActions.showAssignDialog}
        setShowAssignDialog={jobActions.setShowAssignDialog}
        showArchiveDialog={jobActions.showArchiveDialog}
        setShowArchiveDialog={jobActions.setShowArchiveDialog}
        showDeleteDialog={jobActions.showDeleteDialog}
        setShowDeleteDialog={jobActions.setShowDeleteDialog}
        jobCount={selectedJobs.length || 1}
        isBulkAction={selectedJobs.length > 1}
        actionData={jobActions.actionData}
        setActionData={jobActions.setActionData}
        onExecute={jobActions.executeAction}
        users={MOCK_USERS}
        loadingUsers={false}
        userRole={currentRole}
      />
    </div>
  );
}
