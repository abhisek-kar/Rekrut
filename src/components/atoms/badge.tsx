import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset',
  {
    variants: {
      variant: {
        default: 'bg-gray-50 text-gray-700 ring-gray-600/20',
        primary: 'bg-primary-50 text-primary-700 ring-primary-600/20',
        secondary: 'bg-secondary-50 text-secondary-700 ring-secondary-600/20',
        success: 'bg-green-50 text-green-700 ring-green-600/20',
        danger: 'bg-red-50 text-red-700 ring-red-600/20',
        warning: 'bg-yellow-50 text-yellow-700 ring-yellow-600/20',
        info: 'bg-blue-50 text-blue-700 ring-blue-600/20',
      },
      size: {
        sm: 'text-xs px-1.5 py-0.5',
        md: 'text-xs px-2 py-1',
        lg: 'text-sm px-2.5 py-1',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props} />
  );
}
