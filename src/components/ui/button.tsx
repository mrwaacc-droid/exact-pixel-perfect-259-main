import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[10px] text-[13px] font-semibold cursor-pointer transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-white shadow-sm hover:bg-primary-dark hover:shadow-md",
        destructive:
          "bg-error text-white shadow-sm hover:bg-error/90 focus-visible:ring-error/40",
        outline:
          "border border-border bg-white text-foreground shadow-sm hover:bg-beige-soft hover:border-border-strong",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-beige/60",
        ghost:
          "text-foreground hover:bg-secondary hover:text-secondary-foreground",
        link: "text-primary underline-offset-4 hover:underline rounded-none",
        tertiary: "text-primary hover:text-primary-dark hover:bg-primary-soft",
        premium:
          "bg-gradient-crimson text-white shadow-sm hover:shadow-md hover:brightness-110",
      },
      size: {
        xs: "h-[30px] px-2.5 text-xs rounded-[8px]",
        sm: "h-[34px] px-3 text-[13px]",
        default: "h-[38px] px-4 text-[13px]",
        md: "h-[40px] px-5 text-[13px]",
        lg: "h-[44px] px-6 text-sm rounded-[12px]",
        xl: "h-[48px] px-7 text-sm rounded-[12px]",
        icon: "h-[38px] w-[38px]",
        "icon-sm": "h-[30px] w-[30px] rounded-[8px]",
        "icon-lg": "h-[44px] w-[44px] rounded-[12px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };