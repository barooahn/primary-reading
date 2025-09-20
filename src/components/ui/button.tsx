import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-white hover:bg-primary-hover hover:scale-105 hover:shadow-lg shadow-md focus:bg-primary-hover",
        destructive: "bg-error text-white hover:bg-error/90 hover:scale-105 hover:shadow-lg shadow-md focus:bg-error/90",
        outline: "border-2 border-primary bg-background text-primary hover:bg-primary hover:text-white hover:scale-105 focus:bg-primary focus:text-white",
        secondary: "bg-muted text-text-primary hover:bg-muted/80 hover:scale-105 hover:shadow-lg shadow-md focus:bg-muted/80",
        ghost: "text-text-primary hover:bg-primary/10 hover:text-primary hover:scale-102 focus:bg-primary/10 focus:text-primary",
        link: "text-primary underline-offset-4 hover:underline hover:scale-102 focus:underline",
        success: "bg-success text-white hover:bg-success/90 hover:scale-105 hover:shadow-lg shadow-md focus:bg-success/90",
      },
      size: {
        default: "h-12 px-6 py-3",
        sm: "h-10 px-4 py-2 text-xs",
        lg: "h-14 px-8 py-4 text-base",
        icon: "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.memo(React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
))
Button.displayName = "Button"

export { Button, buttonVariants }