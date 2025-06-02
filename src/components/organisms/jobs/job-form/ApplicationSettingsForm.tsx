'use client';

import React, { useEffect, useState } from 'react';
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/shadcn-ui/form';
import { Input } from '@/components/shadcn-ui/input';
import { Button } from '@/components/shadcn-ui/button';
import { Textarea } from '@/components/shadcn-ui/textarea';
import { Badge } from '@/components/shadcn-ui/badge';
import { Switch } from '@/components/shadcn-ui/switch';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/shadcn-ui/accordion";
import {
  Card,
  CardContent,
} from "@/components/shadcn-ui/card";
import { X, Plus, Trash2 } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { JobType } from '@/types/job';

// Define form validation schema
const applicationSettingsSchema = z.object({
  applicationDeadline: z.string().optional(),
  expectedStartDate: z.string().optional(),
  applicationInstructions: z.string().optional(),
  requiredDocuments: z.array(z.string()).optional(),
  screeningQuestions: z.array(z.object({
    question: z.string(),
    required: z.boolean().default(true),
    id: z.string(),
  })).optional(),
});

type ApplicationSettingsFormValues = z.infer<typeof applicationSettingsSchema>;

interface ApplicationSettingsFormProps {
  data: Partial<JobType>;
  onChange: (data: Partial<JobType>) => void;
  onValidityChange: (isValid: boolean) => void;
}

// Common document types
const documentSuggestions = [
  'Resume/CV', 
  'Cover Letter', 
  'Portfolio', 
  'References', 
  'Work Samples', 
  'Certifications',
  'Transcripts',
  'License'
];

export function ApplicationSettingsForm({ data, onChange, onValidityChange }: ApplicationSettingsFormProps) {
  const [newDocument, setNewDocument] = useState('');
  const [newQuestion, setNewQuestion] = useState('');
  
  // Generate initial screening questions with IDs if needed
  const initialScreeningQuestions = (data.screeningQuestions || []).map(q => ({
    ...q,
    id: q.id || Math.random().toString(36).substring(2, 9)
  }));
  
  // Initialize the form with existing data
  const form = useForm<ApplicationSettingsFormValues>({
    resolver: zodResolver(applicationSettingsSchema),
    defaultValues: {
      applicationDeadline: data.applicationDeadline 
        ? new Date(data.applicationDeadline).toISOString().split('T')[0]
        : '',
      expectedStartDate: data.expectedStartDate
        ? new Date(data.expectedStartDate).toISOString().split('T')[0]
        : '',
      applicationInstructions: data.applicationInstructions || '',
      requiredDocuments: data.requiredDocuments || [],
      screeningQuestions: initialScreeningQuestions,
    },
    mode: 'onChange',
  });

  // Update parent component when form values change
  const onSubmit = (values: ApplicationSettingsFormValues) => {
    // Format dates properly if they exist
    const formattedValues = {
      ...values,
      applicationDeadline: values.applicationDeadline ? new Date(values.applicationDeadline) : undefined,
      expectedStartDate: values.expectedStartDate ? new Date(values.expectedStartDate) : undefined
    };
    
    onChange(formattedValues);
  };

  // Update parent on form validity changes
  useEffect(() => {
    const subscription = form.watch(() => {
      // This form is always valid since all fields are optional
      onValidityChange(true);
      
      // Auto-submit the form with current values
      onSubmit(form.getValues());
    });
    
    return () => subscription.unsubscribe();
  }, [form, onValidityChange, onChange, onSubmit]);

  // Add a new required document
  const handleAddDocument = (documentText?: string) => {
    const document = documentText || newDocument.trim();
    if (document && !form.getValues().requiredDocuments?.includes(document)) {
      const updatedDocuments = [...(form.getValues().requiredDocuments || []), document];
      form.setValue('requiredDocuments', updatedDocuments);
      setNewDocument('');
    }
  };

  // Remove a document
  const handleRemoveDocument = (docToRemove: string) => {
    const updatedDocs = form.getValues().requiredDocuments?.filter(
      doc => doc !== docToRemove
    ) || [];
    form.setValue('requiredDocuments', updatedDocs);
  };

  // Add a new screening question
  const handleAddQuestion = () => {
    if (newQuestion.trim()) {
      const currentQuestions = form.getValues().screeningQuestions || [];
      const newQuestionObj = {
        question: newQuestion.trim(),
        required: true,
        id: Math.random().toString(36).substring(2, 9)
      };
      
      form.setValue('screeningQuestions', [...currentQuestions, newQuestionObj]);
      setNewQuestion('');
    }
  };

  // Remove a screening question
  const handleRemoveQuestion = (questionId: string) => {
    const currentQuestions = form.getValues().screeningQuestions || [];
    const updatedQuestions = currentQuestions.filter(q => q.id !== questionId);
    form.setValue('screeningQuestions', updatedQuestions);
  };

  // Toggle question required status
  const handleToggleRequired = (questionId: string) => {
    const currentQuestions = form.getValues().screeningQuestions || [];
    const updatedQuestions = currentQuestions.map(q => 
      q.id === questionId ? { ...q, required: !q.required } : q
    );
    form.setValue('screeningQuestions', updatedQuestions);
  };

  return (
    <Form {...form}>
      <form className="space-y-8">
        {/* Application Deadline */}
        <FormField
          control={form.control}
          name="applicationDeadline"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Application Deadline</FormLabel>
              <FormControl>
                <Input 
                  type="date"
                  {...field}
                  min={new Date().toISOString().split('T')[0]} // Can't select days in the past
                />
              </FormControl>
              <FormDescription>
                The last day candidates can apply for this position (leave blank for no deadline)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Expected Start Date */}
        <FormField
          control={form.control}
          name="expectedStartDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Expected Start Date</FormLabel>
              <FormControl>
                <Input 
                  type="date"
                  {...field}
                  min={new Date().toISOString().split('T')[0]} // Can't select days in the past
                />
              </FormControl>
              <FormDescription>
                When the selected candidate is expected to start (leave blank if flexible)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Application Instructions */}
        <FormField
          control={form.control}
          name="applicationInstructions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Application Instructions</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Provide specific instructions for applicants..." 
                  className="min-h-20"
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                Additional information or requirements for the application process
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Required Documents */}
        <FormField
          control={form.control}
          name="requiredDocuments"
          render={() => (
            <FormItem>
              <FormLabel>Required Documents</FormLabel>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="e.g. Resume, Cover Letter"
                    value={newDocument}
                    onChange={(e) => setNewDocument(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddDocument();
                      }
                    }}
                  />
                  <Button 
                    type="button"
                    onClick={() => handleAddDocument()}
                    size="sm"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>
                
                <div>
                  {!form.getValues().requiredDocuments?.length ? (
                    <div className="text-sm text-muted-foreground mb-2">No required documents specified</div>
                  ) : (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {form.getValues().requiredDocuments?.map((doc, index) => (
                        <Badge 
                          key={index} 
                          variant="secondary"
                          className="py-1.5 px-2 text-sm"
                        >
                          {doc}
                          <button
                            type="button"
                            onClick={() => handleRemoveDocument(doc)}
                            className="ml-1 rounded-full hover:bg-muted p-0.5"
                          >
                            <X className="h-3 w-3" />
                            <span className="sr-only">Remove</span>
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                  
                  <div className="mt-2">
                    <p className="text-sm font-medium mb-2">Common document types:</p>
                    <div className="flex flex-wrap gap-2">
                      {documentSuggestions.map((doc) => (
                        <Badge
                          key={doc}
                          variant="outline"
                          className="cursor-pointer hover:bg-secondary"
                          onClick={() => handleAddDocument(doc)}
                        >
                          + {doc}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <FormDescription>
                Documents that candidates must submit with their application
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Screening Questions */}
        <div className="space-y-4 border p-4 rounded-md">
          <h3 className="font-medium">Screening Questions</h3>
          <FormDescription>
            Add custom questions to screen candidates during the application process
          </FormDescription>
          
          {/* Add Question Input */}
          <div className="flex items-center gap-2">
            <Input
              placeholder="Enter a screening question..."
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddQuestion();
                }
              }}
            />
            <Button 
              type="button"
              onClick={handleAddQuestion}
              size="sm"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>
          
          {/* Question List */}
          {!form.getValues().screeningQuestions?.length ? (
            <div className="text-sm text-muted-foreground">No screening questions added yet</div>
          ) : (
            <Accordion type="multiple" className="w-full">
              {form.getValues().screeningQuestions?.map((q, index) => (
                <AccordionItem key={q.id} value={q.id} className="border rounded-md px-4 mb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <AccordionTrigger className="py-2 hover:no-underline">
                        <span className="font-normal text-left">
                          <span className="font-medium">Q{index + 1}:</span> {q.question}
                        </span>
                      </AccordionTrigger>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveQuestion(q.id);
                      }}
                      className="h-8 w-8"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                      <span className="sr-only">Delete question</span>
                    </Button>
                  </div>
                  <AccordionContent className="pb-4 pt-2">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id={`required-${q.id}`}
                        checked={q.required}
                        onCheckedChange={() => handleToggleRequired(q.id)}
                      />
                      <label
                        htmlFor={`required-${q.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Required question
                      </label>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
          
          {/* Question Examples */}
          <Card className="bg-muted/50">
            <CardContent className="p-4">
              <h4 className="text-sm font-medium mb-2">Example screening questions:</h4>
              <ul className="space-y-2">
                <li className="text-sm flex items-start gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-5 w-5 rounded-full"
                    onClick={() => setNewQuestion("Are you authorized to work in the country where this job is located?")}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                  <span>Are you authorized to work in the country where this job is located?</span>
                </li>
                <li className="text-sm flex items-start gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-5 w-5 rounded-full"
                    onClick={() => setNewQuestion("How many years of experience do you have in this field?")}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                  <span>How many years of experience do you have in this field?</span>
                </li>
                <li className="text-sm flex items-start gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-5 w-5 rounded-full"
                    onClick={() => setNewQuestion("Why are you interested in this position?")}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                  <span>Why are you interested in this position?</span>
                </li>
                <li className="text-sm flex items-start gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-5 w-5 rounded-full"
                    onClick={() => setNewQuestion("What is your expected salary range?")}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                  <span>What is your expected salary range?</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </form>
    </Form>
  );
}
