"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  type AuthResponse,
  // Permission,
  // Role,
  type User,
  getAuthToken,
  getExpireIn,
  getTokenSetTime,
  getUser,
  isTokenExpired,
  login,
  refreshToken,
  removeAuthToken,
  removeExpireIn,
  removeTokenSetTime,
  setAuthToken,
  setExpireIn,
  setTokenSetTime,
  setUser,
} from "@/lib/auth"


const TEST_MODE = process.env.NEXT_PUBLIC_TEST_MODE === "true";


interface AuthContextType {
  user: User | null
  // role: Role | null
  // permissions : Permission[] | null
  token: string | null
  refreshTime: number
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  setRefreshTime: (value: number) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<User | null>(null)
  // const [permissions, setPermissions] = useState<Permission[]
  const [token, setTokenState] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [refreshTime, setRefreshTime] = useState<number>(-1);
  const format = (ms: number) => new Date(ms).toLocaleString()

  const router = useRouter()

  useEffect(() => {
    // Check if token exists and is valid
    const storedToken = getAuthToken()
    const storedUser = getUser()

    if (storedToken && !isTokenExpired(storedToken) && storedUser) {
      setTokenState(storedToken)
      setUserState(storedUser)

      ///////////////////////////////////////////////////
      //getting necessery infos to refresh
      const expires_in_str = getExpireIn()
      const token_set_time_str = getTokenSetTime()
      if (!expires_in_str || !token_set_time_str) {
        setRefreshTime(-1)
        console.log("missing token refresh data")
        return
      }

      const expires_in = Number(expires_in_str) * 1000
      const token_set_time = Number(token_set_time_str)
      const now = Date.now()


      //3600s (60min) * 5/6 = 3000s (50min)
      const next_refresh = TEST_MODE
        ? now + 60 * 1000
        : token_set_time + (expires_in * 5 / 6)
      const max_refresh = token_set_time + expires_in


      // console.log("Token Info:")
      // console.log("Set Time:        ", format(token_set_time))
      // console.log("Refresh At (5/6):", format(next_refresh))
      // console.log("Expire At:       ", format(max_refresh))
      // console.log("Now:             ", format(now))
      // console.log("Time until refresh:", Math.round((next_refresh - now) / 1000), "sec")
      // console.log("Time until expire: ", Math.round((max_refresh - now) / 1000), "sec")

      //check if we should refresh now or wait until we reach 50min when the user open the app
      //NOTE : refreshtime is set to date not the delay cuz it doesn't trigger the second useEffect
      //if the delay is the same this is why I used (date + delay)
      if (now < next_refresh) {
        setRefreshTime(next_refresh)
      } else {
        setRefreshTime(1000 + now)
      }


    } else if (storedToken) {
      removeAuthToken()
      removeExpireIn()
      removeTokenSetTime()
      setRefreshTime(-1)
    }

    setIsLoading(false)
  }, [])

  //triggered everytime refreshTime change to handle refreshing the token
  useEffect(() => {
    //if negative don't trigger refreshing 
    if (refreshTime == -1) return

    // console.log("next refresh : " + format(refreshTime))
    // console.log("current token : " + getAuthToken())

    const now = Date.now()

    const timeout = setTimeout(async () => {
      const success = await refreshToken()
      if (success) {
        console.log("Token refreshed successfully")
        const expires_in = Number(getExpireIn()) * 1000
        const nextDelay = TEST_MODE ? 60 * 1000 : expires_in * 5 / 6
        setRefreshTime(Date.now() + nextDelay)
      } else {
        console.warn("Refresh failed, retrying soon")
        setRefreshTime(1000 + now)
      }
    }, refreshTime - now)

    return () => clearTimeout(timeout)
  }, [refreshTime])

  const loginHandler = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const response: AuthResponse = await login(email, password)

      console.log("Login successful. API Response:", response)

      // Set token,expiration,setTime in cookie and user in localStorage
      setAuthToken(response.access_token)
      setExpireIn(response.expires_in)
      setTokenSetTime()
      setUser(response.user)
      setRefreshTime(TEST_MODE
        ? Number(getTokenSetTime()) + 60 * 1000
        : Number(getTokenSetTime()) + (Number(response.expires_in) * 1000 * 5 / 6))


      // Update state
      setTokenState(response.access_token)
      console.log(response)
      setUserState(response.user)

      console.log("Auth token and user set. Attempting redirection...")
      // Use replace instead of push to prevent back navigation to login
      router.replace("/dashboard")
    } catch (error) {
      console.error("Login failed in AuthContext:", error)
      throw error // Re-throw to handle in the form
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    removeAuthToken()
    removeExpireIn()
    removeTokenSetTime()
    setRefreshTime(-1)
    setUserState(null)
    setTokenState(null)
    router.push("/login")
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        refreshTime,
        isLoading,
        isAuthenticated: !!user && !!token,
        login: loginHandler,
        logout,
        setRefreshTime,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
