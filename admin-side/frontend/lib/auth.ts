import { jwtDecode } from "jwt-decode"
import Cookies from "js-cookie"

export type User = {
  id: number
  name: string
  email: string
  // email_verified_at: string | null
  // role_id: number | null
  // agence_id: number | null
  created_at: string
  updated_at: string
  role?: {
    id: number
    name: string
    permissions: Array<{
      service: string
      read: boolean
      create: boolean
      update: boolean
      delete: boolean
    }>
  } | null
}
// export type Role = {
//   id:number
//   name: string
//   // created_at: string
//   // updated_at: string
//   permissions: Permission[]
// }
// export type Permission = {
//   // id: number
//   service: string
//   create:boolean
//   update: boolean
//   delete: boolean
//   read: boolean
// }
// export type Data = {
//   user : User,
//   role : Role,
//   permissions : Permission[]
// }

export type AuthResponse = {
  access_token: string
  user: User
  token_type: string
  expires_in: number
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  })

  if (!response.ok) {
    let errorMessage = "Failed to login: Unknown error"
    try {
      const contentType = response.headers.get("content-type")
      if (contentType && contentType.includes("application/json")) {
        const errorData = await response.json()
        errorMessage = errorData.message || errorMessage
      } else {
        // Handle HTML error responses (like 500 errors)
        const text = await response.text()
        errorMessage = `Server error (${response.status}): ${response.statusText}`
      }
    } catch (e) {
      errorMessage = `Server error (${response.status}): ${response.statusText}`
    }
    throw new Error(errorMessage)
  }

  const data = await response.json()
  console.log("API Login Raw Data:", data)
  return data
}

interface JwtPayload {
  exp: number;
}


export function isTokenExpired(token: string): boolean {
  try {
    const decoded : JwtPayload = jwtDecode(token)
    const currentTime = Date.now() / 1000
    return decoded.exp < currentTime
  } catch (error) {
    console.error(error)
    return true
  }
}

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null
  return Cookies.get("auth_token") || null
}

export function setAuthToken(token: string): void {
  if (typeof window === "undefined") return
  // Set cookie with 7 days expiration and secure flag in production
  Cookies.set("auth_token", token, {
    expires: 1 / 24,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict"
  })
  localStorage.setItem("auth_token", token)
}

export function removeAuthToken(): void {
  if (typeof window === "undefined") return
  Cookies.remove("auth_token")
  localStorage.removeItem("user") // Keep user in localStorage for now
}


export function getUser(): User | null {
  if (typeof window === "undefined") return null
  const userStr = localStorage.getItem("user")
  if (!userStr) return null
  return JSON.parse(userStr)
}
// export function getRole(): Role | null{
//   if(typeof window === "undefined") return null
//   const roleStr = localStorage.getItem("role")
//   if(!roleStr) return null;
//   return JSON.parse(roleStr)
// }

// export function getPermissions() : Permission[] | null{
//   if(typeof window === "undefined") return null
//   const permissionsStr = localStorage.getItem("permissions")
//   if(!permissionsStr) return null;
//   return JSON.parse(permissionsStr)
// }

export function setUser(user: User): void {
  if (typeof window === "undefined") return
  localStorage.setItem("user", JSON.stringify(user))
  Cookies.set('role_permissions', JSON.stringify(user.role || null), { expires: 1 /24 })
}


//essential infos used to refresh token
export function setExpireIn(expires_in: number): void {
  if (typeof window === "undefined") return
  Cookies.set("expires_in", expires_in.toString(), {
    expires: 1 / 24,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict"
  })
  localStorage.setItem("expires_in", expires_in.toString())
}

export function getExpireIn(): number | null {
  if (typeof window === "undefined") return null
  const expires_in = Number(localStorage.getItem("expires_in"))
  if (!expires_in) return null
  return expires_in
}

export function removeExpireIn(): void {
  if (typeof window === "undefined") return
  Cookies.remove("expires_in")
  localStorage.removeItem("expires_in")
}

export function setTokenSetTime(): void {
  Cookies.set("token_set_time", Date.now().toString(), {
    expires: 1 / 24,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict"
  })
  localStorage.setItem("token_set_time", Date.now().toString())
}
export function getTokenSetTime(): number | null {
  if (typeof window === "undefined") return null
  const token_set_time = Number(localStorage.getItem("token_set_time"))
  if (!token_set_time) return null
  return token_set_time
}

export function removeTokenSetTime(): void {
  if (typeof window === "undefined") return
  Cookies.remove("token_set_time")
  localStorage.removeItem("token_set_time")
}



export async function refreshToken(): Promise<boolean> {
  const token = getAuthToken()

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      }
    })
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to Refresh: Unknown error")
    }
    const data = await response.json()
    console.log("API Refresh Raw Data:", data)
    setAuthToken(data.access_token)
    setExpireIn(data.expires_in)
    setTokenSetTime()

    return true;
  } catch (error) {
    console.error("Token refresh failed:", error);
    return false;
  }
}