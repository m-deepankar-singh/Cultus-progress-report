import * as React from "react"
import { motion, HTMLMotionProps, useAnimation } from "framer-motion"
import { cn } from "@/lib/utils"

interface CardProps extends HTMLMotionProps<"div"> {
  className?: string;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => {
    const controls = useAnimation()
    
    React.useEffect(() => {
      controls.start({ opacity: 1, y: 0 })
    }, [controls])

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        animate={controls}
        transition={{ duration: 0.3 }}
        whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
        className={cn(
          "rounded-lg border bg-card text-card-foreground shadow-sm transition-all duration-200 hover:shadow-lg",
          className
        )}
        {...props}
      />
    )
  }
)
Card.displayName = "Card"

const CardHeader = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => {
    const controls = useAnimation()
    
    React.useEffect(() => {
      controls.start({ opacity: 1 })
    }, [controls])

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0 }}
        animate={controls}
        transition={{ duration: 0.2, delay: 0.1 }}
        className={cn("flex flex-col space-y-1.5 p-6", className)}
        {...props}
      />
    )
  }
)
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => {
    const controls = useAnimation()
    
    React.useEffect(() => {
      controls.start({ opacity: 1, x: 0 })
    }, [controls])

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, x: -20 }}
        animate={controls}
        transition={{ duration: 0.3, delay: 0.2 }}
        className={cn(
          "text-2xl font-semibold leading-none tracking-tight",
          className
        )}
        {...props}
      />
    )
  }
)
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => {
    const controls = useAnimation()
    
    React.useEffect(() => {
      controls.start({ opacity: 1 })
    }, [controls])

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0 }}
        animate={controls}
        transition={{ duration: 0.3, delay: 0.3 }}
        className={cn("p-6 pt-0", className)}
        {...props}
      />
    )
  }
)
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => {
    const controls = useAnimation()
    
    React.useEffect(() => {
      controls.start({ opacity: 1, y: 0 })
    }, [controls])

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        animate={controls}
        transition={{ duration: 0.3, delay: 0.4 }}
        className={cn("flex items-center p-6 pt-0", className)}
        {...props}
      />
    )
  }
)
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
