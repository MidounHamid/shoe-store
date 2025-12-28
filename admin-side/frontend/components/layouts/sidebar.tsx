"use client";

import { useState, useEffect } from "react";
import { ChevronDown, X, ShoppingBag, CreditCard } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { MENU } from "@/config/menu.config";
import { useAuth } from "@/contexts/auth-context";
import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoSection from "@/components/logo";
import { getAuthToken } from "@/lib/auth";

interface SidebarProps {
    sidebarOpen: boolean;
    mobileMenuOpen: boolean;
    setMobileMenuOpen: (open: boolean) => void;
}

export function Sidebar({
    sidebarOpen,
    mobileMenuOpen,
    setMobileMenuOpen,
}: SidebarProps) {
    const pathname = usePathname();
    const firstSegment = pathname.split("/")[1];
    const initialExpanded = MENU.reduce((acc, item) => {
        if (item.items?.some((sub) => pathname.startsWith(sub.url))) {
            acc[item.title] = true;
        }
        return acc;
    }, {} as Record<string, boolean>);
    const [expandedItems, setExpandedItems] =
        useState<Record<string, boolean>>(initialExpanded);

    // State for dynamic counts
    const [counts, setCounts] = useState<Record<string, number>>({});
    const [isLoadingCounts, setIsLoadingCounts] = useState<boolean>(true);

    const { user } = useAuth();

    useEffect(() => {
        async function fetchCounts() {
            try {
                setIsLoadingCounts(true);
                const token = getAuthToken();
                if (!token) throw new Error("No authentication token found");

                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/counts`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            Accept: "application/json",
                        },
                    }
                );

                if (!response.ok)
                    throw new Error(`HTTP error! status: ${response.status}`);

                const result = await response.json();
                setCounts(result);
            } catch (error) {
                console.error("Error fetching counts:", error);
            } finally {
                setIsLoadingCounts(false);
            }
        }

        fetchCounts();
        // Refresh counts every 30 seconds
        const interval = setInterval(fetchCounts, 30000);
        return () => clearInterval(interval);
    }, []);

    if (!user) return null;

    const toggleExpanded = (title: string) => {
        setExpandedItems((prev) => ({
            ...prev,
            [title]: !prev[title],
        }));
    };

    const MenuContent = () => (
        <>
            <div className="px-3 py-2">
                <div className="relative">
                    {/* <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /> */}
                    {/* <Input type="search" placeholder="Search..." className="w-full rounded-2xl bg-muted pl-9 pr-4 py-2" /> */}
                </div>
            </div>

            <ScrollArea className="flex-1 px-3 py-2">
                <div className="space-y-1">
                    {MENU?.map((item) => {
                        // If user has no role or permissions, show all items (for admin/development)
                        const hasNoPermissions = !user.role || !user.role.permissions || user.role.permissions.length === 0;
                        const isAdmin = user.role?.name?.toLowerCase() === 'admin';
                        
                        // If no permissions system exists or user is admin, show all items
                        if (hasNoPermissions || isAdmin) {
                            // Show the item
                        } else {
                            // Check permissions
                            const matchedPermission = user.role?.permissions?.find(
                                (permission) => permission.service === item.service
                            );
                            
                            if (matchedPermission?.read !== true) return null;
                        }

                        return (
                            <div key={item.title} className="mb-1">
                                {item.url ? (
                                    <Link
                                        href={item.url}
                                        className={cn(
                                            "flex w-full items-center justify-between rounded-2xl px-3 py-2 text-sm font-medium",
                                            item.pathname === firstSegment
                                                ? "bg-primary/10 text-primary"
                                                : "hover:bg-muted"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            {item.icon}
                                            <span>{item.title}</span>
                                        </div>
                                    </Link>
                                ) : (
                                    <button
                                        className={cn(
                                            "flex w-full items-center justify-between rounded-2xl px-3 py-2 text-sm font-medium",
                                            item.pathname === firstSegment
                                                ? "bg-primary/10 text-primary"
                                                : "hover:bg-muted"
                                        )}
                                        onClick={() => item.items && toggleExpanded(item.title)}
                                    >
                                        <div className="flex items-center gap-3">
                                            {item.icon}
                                            <span>{item.title}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {/* Dynamic badge based on service */}
                                            {!isLoadingCounts && item.service && counts[item.service] !== undefined && counts[item.service] > 0 && (
                                                <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                                                    {counts[item.service] > 99 ? '99+' : counts[item.service]}
                                                </span>
                                            )}
                                            {item.items && (
                                                <ChevronDown
                                                    className={cn(
                                                        "ml-2 h-4 w-4 transition-transform",
                                                        expandedItems[item.title] ? "rotate-180" : ""
                                                    )}
                                                />
                                            )}
                                        </div>
                                    </button>
                                )}

                                {item.items && expandedItems[item.title] && (
                                    <div className="mt-1 ml-6 space-y-1 border-l pl-3">
                                        {item.items.map((subItem) => {
                                            // If user has no permissions or is admin, show all sub-items
                                            const hasNoPermissions = !user.role || !user.role.permissions || user.role.permissions.length === 0;
                                            const isAdmin = user.role?.name?.toLowerCase() === 'admin';
                                            
                                            if (hasNoPermissions || isAdmin) {
                                                // Show the sub-item
                                            } else {
                                                // Check permissions for sub-items
                                                const matchedPermission = user.role?.permissions?.find(
                                                    (permission) => permission.service === item.service
                                                );
                                                type CrudMethod = "read" | "create" | "update" | "delete";
                                                if (
                                                    !matchedPermission ||
                                                    !matchedPermission[subItem.method as CrudMethod]
                                                )
                                                    return null;
                                            }

                                            return (
                                                <Link
                                                    key={subItem.title}
                                                    href={subItem.url}
                                                    className={`flex items-center justify-between rounded-2xl px-3 py-2 text-sm hover:bg-muted ${subItem.url === pathname &&
                                                        "bg-primary/5 text-primary"
                                                        }`}
                                                >
                                                    {subItem.title}
                                                </Link>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </ScrollArea>

            <div className="border-t p-3">
                <div className="space-y-1">
                    {/* Pending Orders Counter */}
                    {!isLoadingCounts && counts.pending_orders > 0 && (
                        <Link
                            href="/orders/list?status=pending"
                            className={cn(
                                "flex w-full items-center justify-between rounded-2xl px-3 py-2 text-sm font-medium hover:bg-muted transition-colors",
                                pathname === "/orders/list"
                                    ? "bg-primary/10 text-primary"
                                    : ""
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <ShoppingBag className="h-5 w-5 text-muted-foreground" />
                                <span>Pending Orders</span>
                            </div>
                            <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full min-w-[24px] text-center">
                                {counts.pending_orders > 99 ? '99+' : counts.pending_orders}
                            </span>
                        </Link>
                    )}

                    {/* Pending Payments Counter */}
                    {!isLoadingCounts && counts.pending_payments > 0 && (
                        <Link
                            href="/payments/list?status=pending"
                            className={cn(
                                "flex w-full items-center justify-between rounded-2xl px-3 py-2 text-sm font-medium hover:bg-muted transition-colors",
                                pathname === "/payments/list"
                                    ? "bg-primary/10 text-primary"
                                    : ""
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <CreditCard className="h-5 w-5 text-muted-foreground" />
                                <span>Pending Payments</span>
                            </div>
                            <span className="bg-orange-600 text-white text-xs font-bold px-2 py-1 rounded-full min-w-[24px] text-center">
                                {counts.pending_payments > 99 ? '99+' : counts.pending_payments}
                            </span>
                        </Link>
                    )}

                    {/* User Profile Section */}
                    <button className="flex w-full items-center justify-between rounded-2xl px-3 py-2 text-sm font-medium hover:bg-muted">
                        <div className="flex items-center gap-3">
                            <Avatar className="h-6 w-6">
                                <AvatarImage alt="User" />
                                <AvatarFallback>{user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
                            </Avatar>
                            <span>{user?.name || user?.email || 'User'}</span>
                        </div>
                    </button>
                </div>
            </div>
        </>
    );

    return (
        <>
            {/* Mobile menu overlay */}
            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 md:hidden"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar - Mobile */}
            <div
                className={cn(
                    "fixed inset-y-0 left-0 z-50 w-64 transform bg-background transition-transform duration-300 ease-in-out md:hidden",
                    mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
                )}
                style={{ overflowY: "auto" }}
            >
                <div className="flex h-full flex-col border-r">
                    <div className="flex items-center justify-between p-4">
                        <LogoSection className="p-4 youness" />
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            <X className="h-5 w-5" />
                        </Button>
                    </div>
                    <div className="flex h-full flex-col" style={{ overflowY: "auto" }}>
                        <MenuContent />
                    </div>
                </div>
            </div>

            {/* Sidebar - Desktop */}
            <div
                className={cn(
                    "fixed inset-y-0 left-0 z-30 hidden w-64 transform border-r bg-background transition-transform duration-300 ease-in-out md:block",
                    sidebarOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="flex h-full flex-col" style={{ overflowY: "auto" }}>
                    <LogoSection />
                    <MenuContent />
                </div>
            </div>
        </>
    );
}