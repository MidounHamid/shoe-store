"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit } from "lucide-react"
import { useRouter } from "next/navigation"

export type User = {
  id: number
  email: string
  first_name: string | null
  last_name: string | null
  phone: string | null
  role: string
  email_verified: boolean
  created_at: string
  updated_at: string
}

interface UserDetailsProps {
  user: User
}

export default function UserDetails({ user }: UserDetailsProps) {
  const router = useRouter()

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>User Information</CardTitle>
              <CardDescription>User account details</CardDescription>
            </div>
            <Button onClick={() => router.push(`/users/edit/${user.id}`)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">ID</label>
              <p className="text-lg">{user.id}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Email</label>
              <p className="text-lg">{user.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">First Name</label>
              <p className="text-lg">{user.first_name || "-"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Last Name</label>
              <p className="text-lg">{user.last_name || "-"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Phone</label>
              <p className="text-lg">{user.phone || "-"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Role</label>
              <div className="mt-1">
                <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                  {user.role}
                </Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Email Verified</label>
              <div className="mt-1">
                <Badge variant={user.email_verified ? "default" : "destructive"}>
                  {user.email_verified ? "Verified" : "Not Verified"}
                </Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Created At</label>
              <p className="text-lg">{new Date(user.created_at).toLocaleString()}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Updated At</label>
              <p className="text-lg">{new Date(user.updated_at).toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

