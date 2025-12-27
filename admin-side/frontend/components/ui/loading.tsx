import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface LoadingProps {
  size?: "sm" | "md" | "lg"
  className?: string
  text?: string
  fullScreen?: boolean
}

export function Loading({ size = "md", className, text, fullScreen = false }: LoadingProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  }

  const containerClasses = cn(
    "flex items-center justify-center",
    fullScreen ? "fixed inset-0 bg-background/80 backdrop-blur-sm z-50" : "",
    className
  )

  return (
    <div className={containerClasses}>
      <div className="flex flex-col items-center gap-2">
        <Loader2 className={cn("animate-spin text-primary", sizeClasses[size])} />
        {text && <p className="text-sm text-muted-foreground">{text}</p>}
      </div>
    </div>
  )
} 