"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"

export function PageTransitionLoader() {
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    setIsLoading(true)
    setProgress(0)

    // Simulate loading progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval)
          return 90
        }
        return prev + Math.random() * 30
      })
    }, 200)

    // Complete loading after a short delay
    const timeout = setTimeout(() => {
      setProgress(100)
      setTimeout(() => {
        setIsLoading(false)
      }, 400)
    }, 500)

    return () => {
      clearInterval(interval)
      clearTimeout(timeout)
    }
  }, [pathname])

  if (!isLoading) return null

  return (
    <>
      {/* Top Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-[9999] h-1 bg-background/20">
        <div
          className="h-full bg-gradient-to-r from-primary via-accent to-primary transition-all duration-300 ease-out"
          style={{
            width: `${progress}%`,
            boxShadow: "0 0 10px rgba(0, 153, 255, 0.5)",
          }}
        />
      </div>

      {/* Animated Loader Overlay */}
      <div
        className={`fixed inset-0 z-[9998] bg-background/80 backdrop-blur-sm transition-opacity duration-300 ${
          progress === 100 ? "opacity-0" : "opacity-100"
        }`}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Sneaker Loading Animation */}
          <div className="relative">
            {/* Outer Ring */}
            <div className="w-24 h-24 rounded-full border-4 border-primary/20 animate-pulse" />

            {/* Spinning Ring */}
            <div className="absolute inset-0 w-24 h-24 rounded-full border-4 border-transparent border-t-primary border-r-accent animate-spin" />

            {/* Inner Shoe Icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <svg
                className="w-12 h-12 text-primary animate-bounce"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Loading Text */}
        <div className="absolute bottom-1/3 left-1/2 -translate-x-1/2">
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Loading
            </span>
            <span className="flex gap-1">
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
            </span>
          </div>
        </div>
      </div>
    </>
  )
}
