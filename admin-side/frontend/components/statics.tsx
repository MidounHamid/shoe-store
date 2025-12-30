"use client";

import type React from "react";

import { CalendarIcon, TrendingDown } from "lucide-react";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";
import { cn, handleRangeSelection } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useEffect, useState } from "react";
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
import {
  TrendingUp,
  Users,
  DollarSign,
  ShoppingCart,
  Activity,
} from "lucide-react";
import { Area, AreaChart, XAxis, YAxis } from "recharts";
import { fr } from "date-fns/locale";

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

interface StaticsProps {
  stats: DashboardStats;
  period: { start: string; end: string };
  setPeriod: (newPeriod: { start: string; end: string }) => void;
}

const monthMap: { [key: string]: string } = {
  January: "Janvier",
  February: "Février",
  March: "Mars",
  April: "Avril",
  May: "Mai",
  June: "Juin",
  July: "Juillet",
  August: "Août",
  September: "Septembre",
  October: "Octobre",
  November: "Novembre",
  December: "Décembre",
};

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export default function Statics({ stats, period, setPeriod }: StaticsProps) {
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

  // Format chart data - backend returns YYYY-MM format, convert to readable month names
  const fullChartData = stats.monthly_revenue_curve.map((item) => {
    // Parse YYYY-MM format
    const [year, month] = item.month.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    const monthName = format(date, "MMMM", { locale: fr });
    return {
      month: monthName,
      revenue: item.revenue,
    };
  });

  const totalRevenue = stats.total_revenue;
  const totalUsers = stats.active_users;
  const totalOrders = stats.orders;
  const conversionRate = stats.conversion_rate;

  const revenueGrowth = stats.revenue_growth;
  const userGrowth = stats.users_growth;
  const orderGrowth = stats.orders_growth;
  const conversionGrowth = stats.conversion_growth;

  function DatePickerWithRange({
    className,
  }: React.HTMLAttributes<HTMLDivElement>) {
    return (
      <div className={cn("grid gap-2", className)}>
        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              id="date"
              variant={"outline"}
              className={cn(
                "w-[300px] justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date?.from ? (
                date.to ? (
                  <>
                    {format(date.from, "d MMMM yyyy", { locale: fr })} -{" "}
                    {format(date.to, "d MMMM yyyy", { locale: fr })}
                  </>
                ) : (
                  format(date.from, "LLL dd, y")
                )
              ) : (
                <span>Selectionner la date range</span>
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
                  Début
                </Button>
                <Button
                  variant={selecting === "to" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelecting("to")}
                >
                  Fin
                </Button>
              </div>
              <Calendar
                locale={fr}
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
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto space-y-8">
        {/* En-tête */}
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          </div>
          <DatePickerWithRange />
        </div>

        {/* Cartes Statistiques */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Revenu total
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalRevenue.toLocaleString()} DH
              </div>
              <p className="text-xs text-muted-foreground">
                <span
                  className={cn(
                    "flex items-center gap-1",
                    revenueGrowth >= 0 ? "text-green-600" : "text-red-600"
                  )}
                >
                  {revenueGrowth >= 0 ? (
                    <>
                      <TrendingUp className="h-3 w-3" />+
                      {revenueGrowth.toFixed(2)}%
                    </>
                  ) : (
                    <>
                      <TrendingDown className="h-3 w-3" />
                      {revenueGrowth.toFixed(2)}%
                    </>
                  )}
                </span>
                depuis la période sélectionnée
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalUsers.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                <span
                  className={cn(
                    "flex items-center gap-1",
                    userGrowth >= 0 ? "text-green-600" : "text-red-600"
                  )}
                >
                  {userGrowth >= 0 ? (
                    <>
                      <TrendingUp className="h-3 w-3" />+{userGrowth.toFixed(2)}
                      %
                    </>
                  ) : (
                    <>
                      <TrendingDown className="h-3 w-3" />
                      {userGrowth.toFixed(2)}%
                    </>
                  )}
                </span>
                depuis la période sélectionnée
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Reservations
              </CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalOrders.toLocaleString()}</div>

              <p className="text-xs text-muted-foreground">
                <span
                  className={cn(
                    "flex items-center gap-1",
                    orderGrowth >= 0 ? "text-green-600" : "text-red-600"
                  )}
                >
                  {orderGrowth >= 0 ? (
                    <>
                      <TrendingUp className="h-3 w-3" />+
                      {orderGrowth.toFixed(2)}%
                    </>
                  ) : (
                    <>
                      <TrendingDown className="h-3 w-3" />
                      {orderGrowth.toFixed(2)}%
                    </>
                  )}
                </span>
                depuis la période sélectionnée
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Taux de conversion
              </CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{conversionRate}%</div>
              <p className="text-xs text-muted-foreground">
                <span
                  className={cn(
                    "flex items-center gap-1",
                    conversionGrowth >= 0 ? "text-green-600" : "text-red-600"
                  )}
                >
                  {conversionGrowth >= 0 ? (
                    <>
                      <TrendingUp className="h-3 w-3" />+
                      {conversionGrowth.toFixed(2)}%
                    </>
                  ) : (
                    <>
                      <TrendingDown className="h-3 w-3" />
                      {conversionGrowth.toFixed(2)}%
                    </>
                  )}
                </span>
                depuis la période sélectionnée
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Section Graphique */}
        <div className="grid gap-y-4 lg:gap-x-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Aperçu analytique</CardTitle>
              <CardDescription>
                total revenue sur {fullChartData.length} mois
                {date?.from && date?.to && (
                  <span className="text-sm text-muted-foreground">
                    {" "}
                    ({format(date.from, "LLLL yyyy", { locale: fr })} -{" "}
                    {format(date.to, "LLLL yyyy", { locale: fr })})
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <ChartContainer config={chartConfig}>
                <AreaChart
                  accessibilityLayer
                  data={fullChartData}
                  margin={{
                    left: 12,
                    right: 12,
                  }}
                >
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => value.slice(0, 3)}
                  />
                  <YAxis
                    dataKey="revenue"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => `${value}`}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent />}
                  />
                  <defs>
                    <linearGradient
                      id="fillDesktop"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="var(--color-desktop)"
                        stopOpacity={0.8}
                      />
                      <stop
                        offset="95%"
                        stopColor="var(--color-desktop)"
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                    <linearGradient id="fillMobile" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor="var(--color-mobile)"
                        stopOpacity={0.8}
                      />
                      <stop
                        offset="95%"
                        stopColor="var(--color-mobile)"
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                  </defs>
                  {/* <Area
                    dataKey="mobile"
                    type="natural"
                    fill="url(#fillMobile)"
                    fillOpacity={0.4}
                    stroke="var(--color-mobile)"
                    stackId="a"
                  />
                  <Area
                    dataKey="desktop"
                    type="natural"
                    fill="url(#fillDesktop)"
                    fillOpacity={0.4}
                    stroke="var(--color-desktop)"
                    stackId="a"
                  /> */}
                  <Area
                    dataKey="revenue"
                    type="monotone"
                    stroke="var(--color-desktop)"
                    fillOpacity={0.3}
                    fill="url(#fillDesktop)"
                  />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Activité récente</CardTitle>
              <CardDescription>
                Dernières mises à jour de votre tableau de bord
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stats.recent_activities.map((activity, index) => (
                <div
                  key={index}
                  className="space-y-1 py-4 border-b last:border-none"
                >
                  <p className="text-sm font-medium text-black dark:text-white">
                    {activity.log_name}
                  </p>

                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span className="truncate max-w-[60%]">
                      {activity.description}
                    </span>
                    <span className="text-xs">
                      {activity.user_name} ·{" "}
                      {format(
                        new Date(activity.created_at),
                        "d MMM yyyy à HH:mm",
                        { locale: fr }
                      )}
                    </span>
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
