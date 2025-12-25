"use client"

import { useEffect, useState } from "react"

export default function Loading() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 100
        return prev + 10
      })
    }, 200)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="fixed inset-0 bg-background flex items-center justify-center z-50">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse top-1/4 left-1/4" />
        <div className="absolute w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse bottom-1/4 right-1/4 animation-delay-2000" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-8">
        {/* Animated shoe icon */}
        <div className="relative">
          <svg
            className="w-24 h-24 text-primary animate-bounce"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M14 5l7 7m-7-7l-2.5 2.5M14 5V2m0 3v3M3 21h18M3 10h18M3 7l7-4m11 15V10m0 8v-8m-11 8V10"
            />
          </svg>
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-ping" />
        </div>

        {/* Brand text with gradient */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-2">
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient">
              SneakHub
            </span>
          </h2>
          <p className="text-muted-foreground text-sm">Loading your perfect shoes...</p>
        </div>

        {/* Progress bar */}
        <div className="w-64 h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Animated dots */}
        <div className="flex gap-2">
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce animation-delay-200" />
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce animation-delay-400" />
        </div>
      </div>

      <style jsx>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient {
          background-size: 200% auto;
          animation: gradient 3s linear infinite;
        }
        .animation-delay-200 {
          animation-delay: 0.2s;
        }
        .animation-delay-400 {
          animation-delay: 0.4s;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  )
}
