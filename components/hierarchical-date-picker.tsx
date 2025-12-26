"use client";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format, getDaysInMonth, isValid } from "date-fns";
import { CalendarIcon, ChevronLeft } from "lucide-react";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { useLanguage } from "./language-provider";

type DatePickerView = "year" | "month" | "day";

interface HierarchicalDatePickerProps {
  id?: string;
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  placeholder?: string;
  minYear?: number;
  maxYear?: number;
}

export function HierarchicalDatePicker({
  id,
  date,
  setDate,
  placeholder,
  minYear = 1950,
  maxYear = new Date().getFullYear(),
}: HierarchicalDatePickerProps) {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<DatePickerView>("year");
  const [selectedYear, setSelectedYear] = useState<number | null>(
    date ? date.getFullYear() : null
  );
  const [selectedMonth, setSelectedMonth] = useState<number | null>(
    date ? date.getMonth() : null
  );
  const [selectedDay, setSelectedDay] = useState<number | null>(
    date ? date.getDate() : null
  );
  const [focusedItem, setFocusedItem] = useState<number | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Reset view when popover opens
  useEffect(() => {
    if (isOpen) {
      if (date) {
        setSelectedYear(date.getFullYear());
        setSelectedMonth(date.getMonth());
        setSelectedDay(date.getDate());
        setView("year");
      } else {
        setSelectedYear(null);
        setSelectedMonth(null);
        setSelectedDay(null);
        setView("year");
      }
    }
  }, [isOpen, date]);

  // Focus management
  useEffect(() => {
    if (isOpen && contentRef.current) {
      const focusableElement = contentRef.current.querySelector(
        '[tabindex="0"]'
      ) as HTMLElement;
      if (focusableElement) {
        focusableElement.focus();
      }
    }
  }, [isOpen, view]);

  // Generate years array
  const years = Array.from(
    { length: maxYear - minYear + 1 },
    (_, i) => maxYear - i
  );

  // Generate months array
  const months = Array.from({ length: 12 }, (_, i) => i);

  // Generate days array for the selected month and year
  const getDaysArray = () => {
    if (selectedYear === null || selectedMonth === null) return [];

    const daysInMonth = getDaysInMonth(new Date(selectedYear, selectedMonth));
    return Array.from({ length: daysInMonth }, (_, i) => i + 1);
  };

  // Get the day of week (0-6) for the first day of the selected month
  const getFirstDayOfMonth = () => {
    if (selectedYear === null || selectedMonth === null) return 0;
    return new Date(selectedYear, selectedMonth, 1).getDay();
  };

  // Handle year selection
  const handleYearSelect = (year: number) => {
    setSelectedYear(year);
    setView("month");
    setFocusedItem(null);
  };

  // Handle month selection
  const handleMonthSelect = (month: number) => {
    setSelectedMonth(month);
    setView("day");
    setFocusedItem(null);
  };

  // Handle day selection
  const handleDaySelect = (day: number) => {
    setSelectedDay(day);

    if (selectedYear !== null && selectedMonth !== null) {
      const newDate = new Date(selectedYear, selectedMonth, day);
      if (isValid(newDate)) {
        setDate(newDate);
        setIsOpen(false);
      }
    }
  };

  // Handle back button click
  const handleBack = () => {
    if (view === "month") {
      setView("year");
    } else if (view === "day") {
      setView("month");
    }
    setFocusedItem(null);
  };

  // Handle keyboard navigation
  const handleKeyDown = (
    e: KeyboardEvent<HTMLDivElement>,
    items: number[],
    currentIndex: number
  ) => {
    let newIndex = currentIndex;

    switch (e.key) {
      case "ArrowRight":
        newIndex = Math.min(currentIndex + 1, items.length - 1);
        e.preventDefault();
        break;
      case "ArrowLeft":
        newIndex = Math.max(currentIndex - 1, 0);
        e.preventDefault();
        break;
      case "ArrowDown":
        // For year and month views, move down by 3 (grid layout)
        // For day view, move down by 7 (calendar layout)
        const rowSize = view === "day" ? 7 : 3;
        newIndex = Math.min(currentIndex + rowSize, items.length - 1);
        e.preventDefault();
        break;
      case "ArrowUp":
        const upRowSize = view === "day" ? 7 : 3;
        newIndex = Math.max(currentIndex - upRowSize, 0);
        e.preventDefault();
        break;
      case "Enter":
      case " ":
        if (view === "year") {
          handleYearSelect(items[currentIndex]);
        } else if (view === "month") {
          handleMonthSelect(items[currentIndex]);
        } else {
          handleDaySelect(items[currentIndex]);
        }
        e.preventDefault();
        break;
      case "Escape":
        setIsOpen(false);
        e.preventDefault();
        break;
      case "Home":
        setFocusedItem(0);
        e.preventDefault();
        break;
      case "End":
        setFocusedItem(items.length - 1);
        e.preventDefault();
        break;
    }

    if (newIndex !== currentIndex) {
      setFocusedItem(newIndex);
    }
  };

  // Render year selection view
  const renderYearView = () => {
    return (
      <div
        className="grid grid-cols-3 gap-2 p-2 max-h-[240px] overflow-y-auto"
        role="listbox"
        aria-label={t("selectYear")}
      >
        {years.map((year, index) => (
          <Button
            key={year}
            variant={
              selectedYear === year
                ? "default"
                : year === new Date().getFullYear()
                ? "outline"
                : "ghost"
            }
            className={cn(
              "h-9 w-full",
              selectedYear === year && "bg-primary text-primary-foreground",
              focusedItem === index && "ring-2 ring-primary ring-offset-2"
            )}
            onClick={() => handleYearSelect(year)}
            tabIndex={focusedItem === index ? 0 : -1}
            role="option"
            aria-selected={selectedYear === year}
            onKeyDown={(e: any) => handleKeyDown(e, years, index)}
            ref={focusedItem === index ? (el) => el?.focus() : undefined}
          >
            {year}
          </Button>
        ))}
      </div>
    );
  };

  // Render month selection view
  const renderMonthView = () => {
    return (
      <div
        className="grid grid-cols-3 gap-2 p-2"
        role="listbox"
        aria-label={t("selectMonth")}
      >
        {months.map((month, index) => (
          <Button
            key={month}
            variant={
              selectedMonth === month
                ? "default"
                : month === new Date().getMonth() &&
                  selectedYear === new Date().getFullYear()
                ? "outline"
                : "ghost"
            }
            className={cn(
              "h-9 w-full",
              selectedMonth === month && "bg-primary text-primary-foreground",
              focusedItem === index && "ring-2 ring-primary ring-offset-2"
            )}
            onClick={() => handleMonthSelect(month)}
            tabIndex={focusedItem === index ? 0 : -1}
            role="option"
            aria-selected={selectedMonth === month}
            onKeyDown={(e: any) => handleKeyDown(e, months, index)}
            ref={focusedItem === index ? (el) => el?.focus() : undefined}
          >
            {format(new Date(2000, month, 1), "MMM")}
          </Button>
        ))}
      </div>
    );
  };

  // Render day selection view (calendar)
  const renderDayView = () => {
    const days = getDaysArray();
    const firstDayOfMonth = getFirstDayOfMonth();
    const dayNames = Array.from({ length: 7 }, (_, i) =>
      format(new Date(2000, 0, i + 1), "EEEEE")
    );

    // Create empty slots for days before the first day of the month
    const emptySlots = Array.from({ length: firstDayOfMonth }, (_, i) => null);
    const allSlots = [...emptySlots, ...days];

    return (
      <div className="p-2">
        <div className="grid grid-cols-7 gap-1 mb-2" role="row">
          {dayNames.map((day, i) => (
            <div
              key={i}
              className="text-center text-xs font-medium text-muted-foreground h-8 flex items-center justify-center"
              role="columnheader"
              aria-label={format(new Date(2000, 0, i + 1), "EEEE")}
            >
              {day}
            </div>
          ))}
        </div>
        <div
          className="grid grid-cols-7 gap-1"
          role="grid"
          aria-label={t("selectDay")}
        >
          {allSlots.map((day, index) => {
            if (day === null) {
              return (
                <div
                  key={`empty-${index}`}
                  className="h-8"
                  role="gridcell"
                  aria-hidden="true"
                />
              );
            }

            const isSelected = day === selectedDay;
            const isCurrentDay =
              selectedYear === new Date().getFullYear() &&
              selectedMonth === new Date().getMonth() &&
              day === new Date().getDate();

            // Adjust index to only count actual days (not empty slots)
            const dayIndex = index - emptySlots.length;

            return (
              <Button
                key={`day-${day}`}
                variant={
                  isSelected ? "default" : isCurrentDay ? "outline" : "ghost"
                }
                className={cn(
                  "h-8 w-8 p-0 font-normal",
                  isSelected && "bg-primary text-primary-foreground",
                  isCurrentDay &&
                    !isSelected &&
                    "border border-primary text-primary",
                  focusedItem === dayIndex &&
                    "ring-2 ring-primary ring-offset-2"
                )}
                onClick={() => handleDaySelect(day)}
                tabIndex={focusedItem === dayIndex ? 0 : -1}
                role="gridcell"
                aria-selected={isSelected}
                onKeyDown={(e: any) => handleKeyDown(e, days, dayIndex)}
                ref={focusedItem === dayIndex ? (el) => el?.focus() : undefined}
              >
                <time dateTime={`${selectedYear}-${selectedMonth! + 1}-${day}`}>
                  {day}
                </time>
              </Button>
            );
          })}
        </div>
      </div>
    );
  };

  // Render header with title and back button
  const renderHeader = () => {
    let title = "";
    let showBack = false;

    if (view === "year") {
      title = t("selectYear");
      showBack = false;
    } else if (view === "month") {
      title = selectedYear ? `${selectedYear}` : "";
      showBack = true;
    } else if (view === "day") {
      title =
        selectedYear && selectedMonth !== null
          ? format(new Date(selectedYear, selectedMonth), "MMMM yyyy")
          : "";
      showBack = true;
    }

    return (
      <div className="flex items-center justify-between p-2 border-b">
        {showBack ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            aria-label={t("back")}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        ) : (
          <div className="w-8" />
        )}
        <div className="font-medium text-center flex-1">{title}</div>
        <div className="w-8" />
      </div>
    );
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
          aria-label={date ? format(date, "PPP") : t("selectDate")}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "dd/MM/yyyy") : placeholder || t("selectDate")}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0"
        align="start"
        ref={contentRef}
        onKeyDown={(e) => {
          // Handle tab key to keep focus within the popover
          if (e.key === "Tab") {
            const focusableElements = contentRef.current?.querySelectorAll(
              'button:not([disabled]), [tabindex="0"]'
            ) as NodeListOf<HTMLElement>;

            if (focusableElements) {
              const firstElement = focusableElements[0];
              const lastElement =
                focusableElements[focusableElements.length - 1];

              if (e.shiftKey && document.activeElement === firstElement) {
                lastElement.focus();
                e.preventDefault();
              } else if (
                !e.shiftKey &&
                document.activeElement === lastElement
              ) {
                firstElement.focus();
                e.preventDefault();
              }
            }
          }
        }}
      >
        <div className="flex flex-col">
          {renderHeader()}
          <div className="min-h-[240px] overflow-y-auto">
            {view === "year" && renderYearView()}
            {view === "month" && renderMonthView()}
            {view === "day" && renderDayView()}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
