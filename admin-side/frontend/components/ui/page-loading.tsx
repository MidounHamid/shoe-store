"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { Loading } from "./loading"

export function PageLoading() {
  const [isLoading, setIsLoading] = useState(false)
  const [isOnline, setIsOnline] = useState(true)
  const pathname = usePathname()
  // const searchParams = useSearchParams()

  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      setIsLoading(false)
    }

    const handleOffline = () => {
      setIsOnline(false)
      setIsLoading(true)
    }

    // Check initial online status
    setIsOnline(navigator.onLine)

    // Add event listeners
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Handle page loading
  useEffect(() => {
    const handleStart = () => {
      setIsLoading(true)
    }

    const handleComplete = () => {
      setIsLoading(false)
    }

    // Add event listeners for route changes
    window.addEventListener("beforeunload", handleStart)
    window.addEventListener("load", handleComplete)

    return () => {
      window.removeEventListener("beforeunload", handleStart)
      window.removeEventListener("load", handleComplete)
    }
  }, [])

  // Show loading state when pathname or search params change
  useEffect(() => {
    if (isOnline) {
      setIsLoading(true)
      const timeout = setTimeout(() => {
        setIsLoading(false)
      }, 500) // Minimum loading time of 500ms

      return () => clearTimeout(timeout)
    }
  }, [pathname, isOnline])

  if (!isLoading) return null

  return (
    <Loading 
      fullScreen 
      text={isOnline ? "Loading components..." : "No internet connection..."} 
    />
  )
} 