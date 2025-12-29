"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export type Order = {
  id: number
  order_number: string
  user_id: number
  total_amount: number
  status: string
  payment_status: string
  created_at: string
  updated_at: string
}

interface OrderDetailsProps {
  order: Order
}

export default function OrderDetails({ order }: OrderDetailsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Information</CardTitle>
        <CardDescription>Order details and status</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Order Number</label>
            <p className="text-lg">{order.order_number}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">User ID</label>
            <p className="text-lg">{order.user_id}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Total Amount</label>
            <p className="text-lg">${parseFloat(order.total_amount.toString()).toFixed(2)}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Status</label>
            <div className="mt-1">
              <Badge variant={order.status === "completed" ? "default" : "secondary"}>
                {order.status}
              </Badge>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Payment Status</label>
            <div className="mt-1">
              <Badge variant={order.payment_status === "paid" ? "default" : "destructive"}>
                {order.payment_status}
              </Badge>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Created At</label>
            <p className="text-lg">{new Date(order.created_at).toLocaleString()}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

