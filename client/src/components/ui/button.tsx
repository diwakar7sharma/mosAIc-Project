import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-full font-semibold text-center ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 font-inter",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-green-400 to-green-600 text-white hover:from-green-500 hover:to-green-700 shadow-lg hover:shadow-xl",
        destructive:
          "bg-gradient-to-r from-red-400 to-red-600 text-white hover:from-red-500 hover:to-red-700 shadow-lg hover:shadow-xl",
        outline:
          "border border-green-500 bg-transparent bg-gradient-to-r from-green-400/10 to-green-600/10 text-green-600 hover:bg-gradient-to-r hover:from-green-400 hover:to-green-600 hover:text-white shadow-lg hover:shadow-xl",
        secondary:
          "bg-gradient-to-r from-gray-400 to-gray-600 text-white hover:from-gray-500 hover:to-gray-700 shadow-lg hover:shadow-xl",
        ghost: "hover:bg-gradient-to-r hover:from-green-100 hover:to-green-200 hover:text-green-700",
        link: "text-green-600 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-6 py-2 text-sm",
        sm: "h-8 px-4 text-xs",
        lg: "h-12 px-8 text-base",
        icon: "h-10 w-10",
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
