"use client";

import { Calendar } from "@/components/ui/calendar";
import { useEffect, useMemo, useRef, useState } from "react";
import { isSameDay, eachDayOfInterval, getDay } from "date-fns";
import { DayButton, getDefaultClassNames, Matcher } from "react-day-picker";
import { fr } from "date-fns/locale";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

type Period = {
    start: Date;
    end: Date;
    color: string;
};

interface HighlightedCalendarProps {
    periods: Period[];
    activeIndex: number | null;
    setActiveIndex: (activeIndex: number | null) => void
}

const baseCornerClass = `
    relative z-[999] w-10 h-10 text-white 
    before:content-[''] before:absolute before:inset-0 
    before:z-[-2]
    after:content-[''] after:absolute after:inset-0 
    after:rounded-[6px] after:z-[-1]
    before:[background-color:var(--before-bg)] after:[background-color:var(--after-bg)]
    after:flex after:items-center after:justify-center after:text-sm after:font-semibold after:text-white
`;
const baseMiddleClass = `
    dark:text-white z-[999] text-black after:[background-color:var(--bg)]
    after:content-[''] after:absolute after:inset-0

`;

const getFrenchWeekday = (date: Date) => {
    const day = getDay(date);
    return day === 0 ? 6 : day - 1;
};

export function HighlightedCalendar({
    periods,
    activeIndex,
    setActiveIndex
}: HighlightedCalendarProps) {
    const [visibleMonth, setVisibleMonth] = useState<Date | undefined>();



    //TODO: change this to something more react 
    useEffect(() => {
        const listeners: { el: Element; type: string; fn: EventListener }[] = [];

        periods.forEach((_, i) => {
            const elements = document.querySelectorAll(`.period-${i}`);

            const handleMouseEnter = () => {
                elements.forEach(e => e.classList.add("brightness-95", "saturate-150"));
            };
            const handleMouseLeave = () => {
                elements.forEach(e => e.classList.remove("brightness-95", "saturate-150"));
            };
            const handleClick = () => {
                console.log("clicked");
                if (activeIndex === i) {
                    setActiveIndex(null);
                } else {
                    setActiveIndex(i);
                }

            };

            elements.forEach(el => {
                el.addEventListener("mouseenter", handleMouseEnter);
                el.addEventListener("mouseleave", handleMouseLeave);
                el.addEventListener("click", handleClick);
                listeners.push({ el, type: "mouseenter", fn: handleMouseEnter });
                listeners.push({ el, type: "mouseleave", fn: handleMouseLeave });
                listeners.push({ el, type: "click", fn: handleClick });
            });
        });

        // Cleanup on unmount or on update
        return () => {
            listeners.forEach(({ el, type, fn }) => {
                el.removeEventListener(type, fn);
            });
        };
    }, [periods, setActiveIndex, activeIndex, visibleMonth]);


    useEffect(() => {
        if (activeIndex !== null && periods[activeIndex]) {
            setVisibleMonth(periods[activeIndex].start);
        }
    }, [activeIndex, periods]);

    type CSSVarStyle = React.CSSProperties & {
        [key: `--${string}`]: string;
    }









    // Create modifiers and corresponding styles
    const { modifiers, modifierClassNames, modifiersStyles } = useMemo(() => {
        const modifiers: Record<string, Matcher> = {};
        const modifierClassNames: Record<string, string> = {};
        const modifiersStyles: Record<string, CSSVarStyle> = {};

        periods.forEach((period, i) => {
            const isActive = i === activeIndex;
            const overrideColor = "#dc2626";

            const key = `period${i}`;
            const allDays = eachDayOfInterval({
                start: period.start,
                end: period.end,
            });

            // Identify start, end, and middle days
            const middleDays = allDays.filter(
                (date) => !isSameDay(date, period.start) && !isSameDay(date, period.end)
            );

            const middleStartWeek = middleDays.filter(
                (date) => getFrenchWeekday(date) === 0
            );
            const middleEndWeek = middleDays.filter(
                (date) => getFrenchWeekday(date) === 6
            );
            const middleNormal = middleDays.filter(
                (date) => getFrenchWeekday(date) !== 0 && getFrenchWeekday(date) !== 6
            );

            // Add start and end as one matcher
            modifiers[`${key}-range`] = [period.start, period.end];
            modifierClassNames[
                `${key}-range`
            ] = `${baseCornerClass} period-${i}`;
            modifiersStyles[`${key}-range`] = {
                "--after-bg": isActive ? overrideColor : period.color,
                "--before-bg": isActive ? overrideColor + "80" : period.color + "80",
            };
            // Match start only for left-rounding
            modifiers[`${key}-start`] = period.start;
            modifierClassNames[`${key}-start`] = `
                before:rounded-l-[6px] period-${i}
            `;

            // Match end only for right-rounding
            modifiers[`${key}-end`] = period.end;
            modifierClassNames[`${key}-end`] = `
                before:rounded-r-[6px] period-${i}
            `;

            // MIDDLE - normal
            if (middleNormal.length > 0) {
                modifiers[`${key}-middle`] = middleNormal;
                modifierClassNames[`${key}-middle`] = `${baseMiddleClass} period-${i}`;
                modifiersStyles[`${key}-middle`] = {
                    "--bg": isActive ? overrideColor + "80" : period.color + "80",
                };
            }

            // MIDDLE - start of week
            if (middleStartWeek.length > 0) {
                modifiers[`${key}-middle-start`] = middleStartWeek;
                modifierClassNames[
                    `${key}-middle-start`
                ] = `after:rounded-l-md ${baseMiddleClass} period-${i}`;
                modifiersStyles[`${key}-middle-start`] = {
                    "--bg": isActive ? overrideColor + "80" : period.color + "80",
                };
            }

            // MIDDLE - end of week
            if (middleEndWeek.length > 0) {
                modifiers[`${key}-middle-end`] = middleEndWeek;
                modifierClassNames[
                    `${key}-middle-end`
                ] = `after:rounded-r-md ${baseMiddleClass} period-${i}`;
                modifiersStyles[`${key}-middle-end`] = {
                    "--bg": isActive ? overrideColor + "80" : period.color + "80",
                };
            }
        });

        return { modifiers, modifierClassNames, modifiersStyles };
    }, [periods, activeIndex]);

    return (
        <Calendar
            locale={fr}
            mode="single"
            month={visibleMonth}
            onMonthChange={setVisibleMonth}
            modifiers={modifiers}
            modifiersClassNames={modifierClassNames}
            modifiersStyles={modifiersStyles}
            components={{
                DayButton: CalendarDayButton,
            }}

        />
    );
}

function CalendarDayButton({
    className,
    day,
    modifiers,
    ...props
}: React.ComponentProps<typeof DayButton>) {
    const defaultClassNames = getDefaultClassNames()

    const ref = useRef<HTMLButtonElement>(null)
    useEffect(() => {
        if (modifiers.focused) ref.current?.focus()
    }, [modifiers.focused])

    return (
        <Button
            ref={ref}
            variant="ghost"
            size="icon"
            data-day={day.date.toLocaleDateString()}
            data-selected-single={
                modifiers.selected &&
                !modifiers.range_start &&
                !modifiers.range_end &&
                !modifiers.range_middle
            }
            data-range-start={modifiers.range_start}
            data-range-end={modifiers.range_end}
            data-range-middle={modifiers.range_middle}
            className={cn(
                "data-[range-middle=true]:bg-accent data-[range-middle=true]:text-accent-foreground data-[range-start=true]:bg-primary data-[range-start=true]:text-primary-foreground data-[range-end=true]:bg-primary data-[range-end=true]:text-primary-foreground group-data-[focused=true]/day:border-ring flex aspect-square size-auto w-full min-w-(--cell-size) flex-col gap-1 leading-none font-normal group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 data-[range-end=true]:rounded-md data-[range-end=true]:rounded-r-md data-[range-middle=true]:rounded-none data-[range-start=true]:rounded-md data-[range-start=true]:rounded-l-md [&>span]:text-xs [&>span]:opacity-70",
                defaultClassNames.day,
                className,
                //button hover styling make things look weird so copied the class and add these
                "hover:bg-transparent hover:text-inherit"
            )}
            {...props}
        />
    )
}

export { Calendar, CalendarDayButton }
