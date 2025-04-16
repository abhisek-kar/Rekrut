import React, { useState } from 'react';
import { z } from 'zod';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PlusCircle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const employmentStatusOptions = [
  'Employed',
  'Self-Employed',
  'Unemployed',
  'Student',
  'Retired',
  'Other'
];

const previousEmploymentSchema = z.object({
  company: z.string().min(1, 'Company name is required'),
  jobTitle: z.string().min(1, 'Job title is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  description: z.string().optional(),
});

const professionalInfoSchema = z.object({
  employmentStatus: z.string().min(1, 'Please select your employment status'),
  currentJobTitle: z.string().optional(),
  currentCompany: z.string().optional(),
  currentStartDate: z.string().optional(),
  currentEndDate: z.string().optional(),
  previousEmployment: z.array(previousEmploymentSchema).optional(),
  skills: z.array(z.object({
    name: z.string().min(1, 'Skill name is required'),
    proficiency: z.string().optional(),
  })),
  yearsOfExperience: z.string().optional(),
  currentSalary: z.string().optional(),
  expectedSalary: z.string().optional(),
  noticePeriod: z.string().optional(),
});

export type ProfessionalInfoValues = z.infer<typeof professionalInfoSchema>;

interface ProfessionalInfoProps {
  defaultValues?: Partial<ProfessionalInfoValues>;
  onSubmit: (values: ProfessionalInfoValues) => void;
  onBack: () => void;
}

export function ProfessionalInfo({ defaultValues, onSubmit, onBack }: ProfessionalInfoProps) {
  const [isCurrentlyEmployed, setIsCurrentlyEmployed] = useState(
    defaultValues?.employmentStatus === 'Employed' || defaultValues?.employmentStatus === 'Self-Employed'
  );

  const form = useForm<ProfessionalInfoValues>({
    resolver: zodResolver(professionalInfoSchema),
    defaultValues: {
      employmentStatus: '',
      currentJobTitle: '',
      currentCompany: '',
      currentStartDate: '',
      currentEndDate: '',
      previousEmployment: [{ company: '', jobTitle: '', startDate: '', endDate: '', description: '' }],
      skills: [{ name: '', proficiency: 'Beginner' }],
      yearsOfExperience: '',
      currentSalary: '',
      expectedSalary: '',
      noticePeriod: '',
      ...defaultValues,
    },
  });

  const { fields: previousEmploymentFields, append: appendPreviousEmployment, remove: removePreviousEmployment } = 
    useFieldArray({
      control: form.control,
      name: "previousEmployment",
    });

  const { fields: skillFields, append: appendSkill, remove: removeSkill } = 
    useFieldArray({
      control: form.control,
      name: "skills",
    });

  const handleEmploymentStatusChange = (value: string) => {
    const isEmployed = value === 'Employed' || value === 'Self-Employed';
    setIsCurrentlyEmployed(isEmployed);
    form.setValue('employmentStatus', value);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="employmentStatus"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Current Employment Status</FormLabel>
              <FormControl>
                <Select
                  value={field.value}
                  onValueChange={handleEmploymentStatusChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your employment status" />
                  </SelectTrigger>
                  <SelectContent>
                    {employmentStatusOptions.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {isCurrentlyEmployed && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="currentJobTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Job Title</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Software Engineer" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="currentCompany"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Company</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Acme Inc." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="currentStartDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input {...field} type="date" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="currentEndDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date (if applicable)</FormLabel>
                    <FormControl>
                      <Input {...field} type="date" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </>
        )}

        <div>
          <div className="flex justify-between items-center mb-2">
            <FormLabel className="text-base">Previous Employment</FormLabel>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => appendPreviousEmployment({
                company: '',
                jobTitle: '',
                startDate: '',
                endDate: '',
                description: '',
              })}
              className="flex items-center gap-1"
            >
              <PlusCircle className="h-4 w-4" />
              Add Position
            </Button>
          </div>
          
          {previousEmploymentFields.map((field, index) => (
            <div key={field.id} className="border rounded-md p-4 mb-4">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium">Position {index + 1}</h4>
                {previousEmploymentFields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removePreviousEmployment(index)}
                    className="h-6 text-destructive hover:text-destructive/90"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                <FormField
                  control={form.control}
                  name={`previousEmployment.${index}.company`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Previous Company" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`previousEmployment.${index}.jobTitle`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Title</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Previous Title" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                <FormField
                  control={form.control}
                  name={`previousEmployment.${index}.startDate`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <FormControl>
                        <Input {...field} type="date" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`previousEmployment.${index}.endDate`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date</FormLabel>
                      <FormControl>
                        <Input {...field} type="date" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name={`previousEmployment.${index}.description`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Briefly describe your responsibilities and achievements"
                        className="resize-none"
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          ))}
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <FormLabel className="text-base">Skills</FormLabel>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => appendSkill({ name: '', proficiency: 'Beginner' })}
              className="flex items-center gap-1"
            >
              <PlusCircle className="h-4 w-4" />
              Add Skill
            </Button>
          </div>
          
          {skillFields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center mb-2">
              <div className="md:col-span-2">
                <FormField
                  control={form.control}
                  name={`skills.${index}.name`}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input {...field} placeholder="Skill name (e.g. JavaScript)" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div>
                <FormField
                  control={form.control}
                  name={`skills.${index}.proficiency`}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Proficiency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Beginner">Beginner</SelectItem>
                            <SelectItem value="Intermediate">Intermediate</SelectItem>
                            <SelectItem value="Advanced">Advanced</SelectItem>
                            <SelectItem value="Expert">Expert</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex justify-end">
                {skillFields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeSkill(index)}
                    className="h-10 text-destructive hover:text-destructive/90"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="yearsOfExperience"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Years of Relevant Experience</FormLabel>
                <FormControl>
                  <Input {...field} type="number" min="0" step="0.5" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="noticePeriod"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notice Period (if employed)</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="e.g. 2 weeks, 30 days" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="currentSalary"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Current Salary (Optional)</FormLabel>
                <FormControl>
                  <Input {...field} type="number" min="0" placeholder="USD per year" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="expectedSalary"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Expected Salary</FormLabel>
                <FormControl>
                  <Input {...field} type="number" min="0" placeholder="USD per year" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-between pt-4">
          <Button type="button" variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button type="submit">
            Next Step
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default ProfessionalInfo;
