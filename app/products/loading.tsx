"use client"

import { useEffect, useState } from "react"

export default function ProductsLoading() {
  const [dots, setDots] = useState(1)

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev >= 3 ? 1 : prev + 1))
    }, 400)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse top-1/3 left-1/4" />
        <div className="absolute w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse bottom-1/3 right-1/4 animation-delay-1000" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-6">
        {/* Shoe loading animation */}
        <div className="relative">
          <div className="w-20 h-20 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-10 h-10 text-primary" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.8 7.4c.2.2.2.5 0 .7l-2 2c-.2.2-.5.2-.7 0-.2-.2-.2-.5 0-.7l1.6-1.6-1.6-1.6c-.2-.2-.2-.5 0-.7.2-.2.5-.2.7 0l2 2zM3.2 7.4c-.2.2-.2.5 0 .7l2 2c.2.2.5.2.7 0 .2-.2.2-.5 0-.7L4.3 7.8l1.6-1.6c.2-.2.2-.5 0-.7-.2-.2-.5-.2-.7 0l-2 2z" />
            </svg>
          </div>
        </div>

        {/* Loading text with animated gradient */}
        <div className="text-center">
          <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Loading Products{".".repeat(dots)}
          </h3>
          <p className="text-sm text-muted-foreground">Fetching the latest sneakers</p>
        </div>
      </div>

      <style jsx>{`
        .animation-delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </div>
  )
}
