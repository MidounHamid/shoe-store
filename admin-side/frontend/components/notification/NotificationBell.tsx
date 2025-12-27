"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getAuthToken } from "@/lib/auth";
import { Button } from "../ui/button";

interface Notification {
  id: number;
  title: string;
  content: string;
}



export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    fetchNotifications();

    // Close dropdown when clicking outside
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      if (!token) throw new Error("Token d'authentification manquant");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/notifications-unread`,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(`Erreur HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      setNotifications(data.data || []);
      setUnreadCount(data.count || 0);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      const token = getAuthToken();
      if (!token) throw new Error("Token d'authentification manquant");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/notifications/${id}/mark-as-read`,
        {
          method: "POST",
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(`Erreur HTTP ${response.status}: ${errorText}`);
      }

      setNotifications((prev) => prev.filter((n) => n.id !== id));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = getAuthToken();
      if (!token) throw new Error("Token d'authentification manquant");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/notifications/mark-all-as-read`,
        {
          method: "POST",
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(`Erreur HTTP ${response.status}: ${errorText}`);
      }

      setNotifications([]);
      setUnreadCount(0);
    } catch (err) {
      console.error("Error marking all notifications as read:", err);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost" size="icon" className="rounded-2xl"
        onClick={() => setOpen((prev) => !prev)}
        // className="relative focus:outline-none"
        disabled={loading}
      >
        <Bell className="size-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </Button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 mt-2 w-80 bg-background border rounded-md shadow-lg z-50"
          >
            <div className="p-4 font-semibold border-b flex justify-between items-center">
              <span>Notifications</span>
              {notifications.length > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-blue-500 hover:underline"
                >
                  Mark all as read
                </button>
              )}
            </div>
            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-sm text-muted-foreground">Loading...</div>
              ) : notifications.length === 0 ? (
                <div className="p-4 text-sm text-muted-foreground">No new notifications</div>
              ) : (
                notifications.map((notification) => (
                  <div key={notification.id} className="p-4 border-b hover:bg-gray-50 hover:dark:bg-gray-900">
                    <h4 className="font-semibold">{notification.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{notification.content}</p>
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="mt-2 text-blue-500 hover:underline text-sm flex items-center"
                    >
                      <Check className="w-4 h-4 mr-1" /> Mark as read
                    </button>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}