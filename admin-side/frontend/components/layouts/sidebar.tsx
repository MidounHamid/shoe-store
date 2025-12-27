"use client";

import { useState, useEffect } from "react";
import { ChevronDown, Calendar, X } from "lucide-react";
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
import { toast } from "@/components/ui/use-toast";

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

    // State for reservation counter
    const [reservationCount, setReservationCount] = useState<number>(0);
    const [isLoadingReservations, setIsLoadingReservations] = useState<boolean>(true);

    const { user } = useAuth();
    const reservation_online_permission = user && user.role?.permissions?.find(
                            (permission) => permission.service ==="reservation_online"
                        )?.read;
    useEffect(() => {
        async function fetchReservationCount() {
            try {
                setIsLoadingReservations(true);
                const token = getAuthToken();
                if (!token) throw new Error("No authentication token found");

                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/reservation-by-websites/count`,
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
                setReservationCount(result.count ?? 0);
            } catch (error) {
                console.error("Error fetching reservation count:", error);
                toast({
                    title: "Erreur",
                    description: "Échec du chargement du compteur de réservations.",
                    variant: "destructive",
                });
            } finally {
                setIsLoadingReservations(false);
            }
        }

        if(reservation_online_permission){
            fetchReservationCount();
        }
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
                        const matchedPermission = user.role?.permissions?.find(
                            (permission) => permission.service === item.service
                        );

                        if (matchedPermission?.read != true) return null;

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
                                        {item.items && (
                                            <ChevronDown
                                                className={cn(
                                                    "ml-2 h-4 w-4 transition-transform",
                                                    expandedItems[item.title] ? "rotate-180" : ""
                                                )}
                                            />
                                        )}
                                    </button>
                                )}

                                {item.items && expandedItems[item.title] && (
                                    <div className="mt-1 ml-6 space-y-1 border-l pl-3">
                                        {item.items.map((subItem) => {
                                            const matchedPermission = user.role?.permissions?.find(
                                                (permission) => permission.service === item.service
                                            );
                                            type CrudMethod = "read" | "create" | "update" | "delete";
                                            if (
                                                !matchedPermission ||
                                                !matchedPermission[subItem.method as CrudMethod]
                                            )
                                                return null;

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
                    {/* Online Reservations Counter - Now clickable with Link */}
                    {!!reservation_online_permission && <Link
                        href="/reservationOnlign/reservationOnlignList"
                        className={cn(
                            "flex w-full items-center justify-between rounded-2xl px-3 py-2 text-sm font-medium hover:bg-muted transition-colors",
                            pathname === "/reservationOnlign/reservationOnlignList"
                                ? "bg-primary/10 text-primary"
                                : ""
                        )}
                    >
                        <div className="flex items-center gap-3">
                            <Calendar className="h-5 w-5 text-muted-foreground" />
                            <span>Online Reservations</span>
                        </div>
                        <div className="flex items-center gap-2">
                            {isLoadingReservations ? (
                                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full min-w-[24px] text-center">
                                    {reservationCount}
                                </span>
                            )}
                        </div>
                    </Link>}

                    {/* User Profile Section */}
                    <button className="flex w-full items-center justify-between rounded-2xl px-3 py-2 text-sm font-medium hover:bg-muted">
                        <div className="flex items-center gap-3">
                            <Avatar className="h-6 w-6">
                                <AvatarImage alt="User" />
                                <AvatarFallback>{user?.name[0].toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <span>{user?.name}</span>
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