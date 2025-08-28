import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-gradient-primary text-primary-foreground hover:shadow-glass hover:scale-105 active:scale-95",
        secondary: "bg-gradient-secondary text-secondary-foreground hover:shadow-glass hover:scale-105 active:scale-95",
        outline: "border border-primary/20 bg-background/50 text-foreground hover:bg-primary/10 hover:border-primary/40 backdrop-blur-sm",
        ghost: "hover:bg-primary/10 hover:text-primary",
        glass: "glass text-foreground hover:bg-white/20 hover:shadow-float hover:scale-105 active:scale-95",
        hero: "bg-gradient-primary text-primary-foreground shadow-float hover:shadow-float hover:scale-110 active:scale-95 font-semibold animate-glow",
        link: "text-primary underline-offset-4 hover:underline hover:text-primary-light",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:scale-105 active:scale-95",
      },
      size: {
        default: "h-12 px-6 py-3 rounded-lg",
        sm: "h-9 rounded-md px-4 text-xs",
        lg: "h-14 rounded-xl px-8 text-base font-semibold",
        xl: "h-16 rounded-2xl px-10 text-lg font-bold",
        icon: "h-12 w-12 rounded-lg",
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

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
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
)
Button.displayName = "Button"

export { Button, buttonVariants }
