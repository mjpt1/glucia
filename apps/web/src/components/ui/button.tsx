import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95',
  {
    variants: {
      variant: {
        default: 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/25',
        destructive: 'bg-red-500 text-white hover:bg-red-600',
        outline: 'border border-white/20 bg-white/5 hover:bg-white/10 text-foreground backdrop-blur-sm',
        ghost: 'hover:bg-white/10 text-foreground',
        link: 'text-blue-400 underline-offset-4 hover:underline',
        success: 'bg-green-600 text-white hover:bg-green-700 shadow-lg shadow-green-600/25',
      },
      size: {
        default: 'h-11 px-5 py-2',
        sm: 'h-9 px-3 text-xs',
        lg: 'h-13 px-8 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, loading, children, ...props }, ref) => (
  <button ref={ref} className={cn(buttonVariants({ variant, size, className }))} disabled={loading || props.disabled} {...props}>
    {loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />}
    {children}
  </button>
));
Button.displayName = 'Button';
export { Button, buttonVariants };
