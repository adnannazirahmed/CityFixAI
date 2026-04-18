import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:   'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
        secondary: 'border-transparent bg-gray-100 text-gray-700 hover:bg-gray-200',
        destructive: 'border-transparent bg-red-100 text-red-700',
        outline:   'border-gray-200 text-gray-600 bg-white',
        critical:  'border-red-200 bg-red-50 text-red-700',
        high:      'border-orange-200 bg-orange-50 text-orange-700',
        medium:    'border-amber-200 bg-amber-50 text-amber-700',
        low:       'border-green-200 bg-green-50 text-green-700',
        submitted:    'border-blue-200 bg-blue-50 text-blue-700',
        under_review: 'border-purple-200 bg-purple-50 text-purple-700',
        assigned:     'border-indigo-200 bg-indigo-50 text-indigo-700',
        in_progress:  'border-amber-200 bg-amber-50 text-amber-700',
        resolved:     'border-green-200 bg-green-50 text-green-700',
      },
    },
    defaultVariants: { variant: 'default' },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
