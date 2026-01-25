"use client";

import type React from "react";
import { useEffect, useState, useMemo } from "react";
import { format, parse } from "date-fns";
import { enUS } from "date-fns/locale";
import type { DateRange } from "react-day-picker";
import { 
  CalendarIcon, 
  TrendingDown, 
  TrendingUp, 
  Users, 
  DollarSign, 
  ShoppingCart, 
  Activity 
} from "lucide-react";

import { cn, handleRangeSelection } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Area, AreaChart, XAxis, YAxis, ResponsiveContainer } from "recharts";

// --- Types ---

interface DashboardStats {
  total_revenue: number;
  revenue_growth: number;
  active_users: number;
  users_growth: number;
  orders: number;
  orders_growth: number;
  conversion_rate: number;
  conversion_growth: number;
  monthly_revenue_curve: {
    month: string;
    revenue: number;
  }[];
  recent_activities: {
    description: string;
    log_name: string;
    created_at: string;
    user_name: string;
  }[];
}

interface StatisticsProps {
  stats: DashboardStats;
  period: { start: string; end: string };
  setPeriod: (newPeriod: { start: string; end: string }) => void;
}

// --- Sub-components (Moved outside to prevent re-render errors) ---

const StatCard = ({ title, value, growth, icon: Icon, unit = "", prefix = "" }: any) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">
        {prefix}{value.toLocaleString()} {unit}
      </div>
      <p className="text-xs text-muted-foreground">
        <span
          className={cn(
            "inline-flex items-center gap-1 font-medium",
            growth >= 0 ? "text-emerald-600" : "text-rose-600"
          )}
        >
          {growth >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {growth >= 0 ? "+" : ""}{growth.toFixed(2)}%
        </span>{" "}
        from selected period
      </p>
    </CardContent>
  </Card>
);

interface DatePickerProps {
  date: DateRange | undefined;
setDate: React.Dispatch<React.SetStateAction<DateRange | undefined>>;
  isPopoverOpen: boolean;
  setIsPopoverOpen: (open: boolean) => void;
  selecting: "from" | "to";
  setSelecting: (mode: "from" | "to") => void;
}

const DatePickerWithRange = ({ 
  date, 
  setDate, 
  isPopoverOpen, 
  setIsPopoverOpen, 
  selecting, 
  setSelecting 
}: DatePickerProps) => {
  return (
    <div className="grid gap-2">
      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-[300px] justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Select date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="flex flex-col">
            <div className="flex justify-center gap-2 p-2">
              <Button
                variant={selecting === "from" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelecting("from")}
              >
                Start Date
              </Button>
              <Button
                variant={selecting === "to" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelecting("to")}
              >
                End Date
              </Button>
            </div>
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={date?.from}
              selected={date}
              onSelect={(range) =>
                handleRangeSelection(range, selecting, date, setDate, () =>
                  setIsPopoverOpen(false)
                )
              }
              numberOfMonths={2}
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

// --- Main Component ---

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export default function Statistics({ stats, period, setPeriod }: StatisticsProps) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [selecting, setSelecting] = useState<"from" | "to">("from");
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(period.start),
    to: new Date(period.end),
  });

  useEffect(() => {
    if (date?.from && date?.to) {
      setPeriod({
        start: format(date.from, "yyyy-MM-dd"),
        end: format(date.to, "yyyy-MM-dd"),
      });
    }
  }, [date, setPeriod]);

  const fullChartData = useMemo(() => {
    return stats.monthly_revenue_curve.map((item) => {
      const parsedDate = parse(item.month, "yyyy-MM", new Date());
      return {
        month: format(parsedDate, "MMMM", { locale: enUS }),
        revenue: item.revenue,
      };
    });
  }, [stats.monthly_revenue_curve]);

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="mx-auto space-y-8">
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <DatePickerWithRange 
            date={date}
            setDate={setDate}
            isPopoverOpen={isPopoverOpen}
            setIsPopoverOpen={setIsPopoverOpen}
            selecting={selecting}
            setSelecting={setSelecting}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total Revenue" value={stats.total_revenue} growth={stats.revenue_growth} icon={DollarSign} unit="DH" />
          <StatCard title="Active Users" value={stats.active_users} growth={stats.users_growth} icon={Users} />
          <StatCard title="Total Reservations" value={stats.orders} growth={stats.orders_growth} icon={ShoppingCart} />
          <StatCard title="Conversion Rate" value={stats.conversion_rate} growth={stats.conversion_growth} icon={Activity} unit="%" />
        </div>

        <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
          <Card className="lg:col-span-4">
            <CardHeader>
              <CardTitle>Analytics Overview</CardTitle>
              <CardDescription>
                Total revenue across {fullChartData.length} months
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[350px] w-full">
              <ChartContainer config={chartConfig} className="h-full w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={fullChartData} margin={{ left: 12, right: 12, top: 12 }}>
                    <defs>
                      <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-revenue)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="var(--color-revenue)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="month"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      tickFormatter={(value) => value.slice(0, 3)}
                    />
                    <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                    <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                    <Area
                      dataKey="revenue"
                      type="monotone"
                      stroke="var(--color-revenue)"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#fillRevenue)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest updates from your dashboard</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {stats.recent_activities.map((activity, index) => (
                <div key={index} className="flex flex-col space-y-1 pb-4 border-b last:border-none last:pb-0">
                  <p className="text-sm font-semibold">{activity.log_name}</p>
                  <p className="text-sm text-muted-foreground line-clamp-2">{activity.description}</p>
                  <div className="flex justify-between text-xs text-muted-foreground pt-1">
                    <span className="font-medium text-foreground/70">{activity.user_name}</span>
                    <span>{format(new Date(activity.created_at), "MMM dd, yyyy 'at' HH:mm")}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}