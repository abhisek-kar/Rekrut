import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { Filter, RefreshCw, X } from 'lucide-react';

interface JobFilterProps {
  onFilter: (filters: JobFilters) => void;
  className?: string;
}

export interface JobFilters {
  search?: string;
  location?: string;
  jobTypes?: string[];
  experienceLevels?: string[];
  salaryRange?: [number, number];
  remote?: boolean;
  postedWithin?: string;
}

export function JobFilter({ onFilter, className }: JobFilterProps) {
  const [filters, setFilters] = useState<JobFilters>({
    search: '',
    location: '',
    jobTypes: [],
    experienceLevels: [],
    salaryRange: [0, 200000],
    remote: false,
    postedWithin: '',
  });

  const [isOpen, setIsOpen] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (name: string, value: string, checked: boolean) => {
    setFilters((prev) => {
      const currentValues = prev[name as keyof JobFilters] as string[] || [];
      if (checked) {
        return { ...prev, [name]: [...currentValues, value] };
      } else {
        return { ...prev, [name]: currentValues.filter((v) => v !== value) };
      }
    });
  };

  const handleRemoteChange = (checked: boolean) => {
    setFilters((prev) => ({ ...prev, remote: checked }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSliderChange = (value: number[]) => {
    setFilters((prev) => ({ ...prev, salaryRange: [value[0], value[1]] }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilter(filters);
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      location: '',
      jobTypes: [],
      experienceLevels: [],
      salaryRange: [0, 200000],
      remote: false,
      postedWithin: '',
    });
    onFilter({});
  };

  return (
    <div className={cn('bg-background rounded-lg border shadow-sm', className)}>
      <div className="p-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          <h3 className="font-medium">Filters</h3>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden"
        >
          {isOpen ? <X className="h-4 w-4" /> : <Filter className="h-4 w-4" />}
        </Button>
      </div>

      <form 
        onSubmit={handleSubmit}
        className={cn(
          'border-t p-4 space-y-4',
          isOpen ? 'block' : 'hidden md:block'
        )}
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="search">Keywords</Label>
            <Input
              id="search"
              name="search"
              placeholder="Search jobs..."
              value={filters.search}
              onChange={handleInputChange}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              name="location"
              placeholder="City, state, or country"
              value={filters.location}
              onChange={handleInputChange}
              className="mt-1"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="remote" 
                checked={filters.remote}
                onCheckedChange={handleRemoteChange}
              />
              <Label htmlFor="remote">Remote jobs only</Label>
            </div>
          </div>

          <div>
            <Label>Job Type</Label>
            <div className="mt-1 space-y-2">
              {['Full-time', 'Part-time', 'Contract', 'Internship'].map((type) => (
                <div className="flex items-center space-x-2" key={type}>
                  <Checkbox 
                    id={`jobType-${type}`}
                    checked={filters.jobTypes?.includes(type)}
                    onCheckedChange={(checked) => 
                      handleCheckboxChange('jobTypes', type, checked as boolean)
                    }
                  />
                  <Label htmlFor={`jobType-${type}`}>{type}</Label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label>Experience Level</Label>
            <div className="mt-1 space-y-2">
              {['Entry', 'Mid', 'Senior', 'Executive'].map((level) => (
                <div className="flex items-center space-x-2" key={level}>
                  <Checkbox 
                    id={`expLevel-${level}`}
                    checked={filters.experienceLevels?.includes(level)}
                    onCheckedChange={(checked) => 
                      handleCheckboxChange('experienceLevels', level, checked as boolean)
                    }
                  />
                  <Label htmlFor={`expLevel-${level}`}>{level}</Label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label>Posted Within</Label>
            <Select 
              value={filters.postedWithin} 
              onValueChange={(value) => handleSelectChange('postedWithin', value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Any time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any time</SelectItem>
                <SelectItem value="24h">Last 24 hours</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="14d">Last 14 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <div className="flex justify-between">
              <Label>Salary Range</Label>
              <span className="text-sm text-muted-foreground">
                ${filters.salaryRange[0].toLocaleString()} - ${filters.salaryRange[1].toLocaleString()}
              </span>
            </div>
            <Slider
              defaultValue={[0, 200000]}
              max={200000}
              step={10000}
              value={[filters.salaryRange[0], filters.salaryRange[1]]}
              onValueChange={handleSliderChange}
              className="mt-2"
            />
          </div>
        </div>

        <div className="flex space-x-2 pt-2">
          <Button type="submit" className="flex-1">
            Apply Filters
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            onClick={resetFilters}
            className="flex items-center gap-1"
          >
            <RefreshCw className="h-4 w-4" />
            Reset
          </Button>
        </div>
      </form>
    </div>
  );
}

export default JobFilter;
