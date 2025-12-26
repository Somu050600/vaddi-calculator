import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: string): string {
  if (!value) return "";

  // Remove all non-digits
  const digits = value.replace(/\D/g, "");

  // Format with Indian numbering system (1,00,000 = 1 lakh)
  return formatIndianNumber(digits);
}

export function formatIndianNumber(value: string | number): string {
  const numStr =
    typeof value === "number" ? Math.floor(value).toString() : value;
  if (!numStr) return "0";

  // Split into last 3 digits and rest
  const lastThree = numStr.slice(-3);
  const rest = numStr.slice(0, -3);

  if (rest === "") return lastThree;

  // Add commas every 2 digits to the rest
  const formatted = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ",");
  return `${formatted},${lastThree}`;
}

export function formatIndianCurrency(
  value: number,
  decimals: number = 2
): string {
  const [intPart, decPart] = value.toFixed(decimals).split(".");
  const formattedInt = formatIndianNumber(intPart);
  return decPart ? `${formattedInt}.${decPart}` : formattedInt;
}

export function calculateInterest(
  principal: number,
  rate: number,
  startDate: Date,
  endDate: Date,
  isPercentMode: boolean
): { interest: number; monthlyRate: number } {
  // Calculate duration using simple subtraction with borrowing
  let endDay = endDate.getDate();
  let endMonth = endDate.getMonth() + 1;
  let endYear = endDate.getFullYear();

  const startDay = startDate.getDate();
  const startMonth = startDate.getMonth() + 1;
  const startYear = startDate.getFullYear();

  // Borrow from month if day is negative
  if (endDay < startDay) {
    endDay += 30;
    endMonth -= 1;
  }

  // Borrow from year if month is negative
  if (endMonth < startMonth) {
    endMonth += 12;
    endYear -= 1;
  }

  const days = endDay - startDay;
  const months = endMonth - startMonth;
  const years = endYear - startYear;

  // Total months = (years × 12) + months + (days / 30)
  const totalMonths = years * 12 + months + days / 30;

  // Convert to monthly rate if in percentage per year mode
  const monthlyRate = isPercentMode
    ? rate / 12
    : ((rate * 12) / principal) * 100;

  let interest = 0;

  if (isPercentMode) {
    // If rate is annual percentage: interest = principal × rate × months / (100 × 12)
    interest = (principal * rate * totalMonths) / (100 * 12);
  } else {
    // If rate is rupees per 100 per month
    interest = (principal * rate * totalMonths) / 100;
  }

  return { interest, monthlyRate };
}

export function getDurationText(
  startDate: Date,
  endDate: Date,
  t: (key: string) => string
): string {
  // Return 0 days if end date is before start date
  if (endDate < startDate) {
    return `0 ${t("days")}`;
  }

  let endDay = endDate.getDate();
  let endMonth = endDate.getMonth() + 1;
  let endYear = endDate.getFullYear();

  const startDay = startDate.getDate();
  const startMonth = startDate.getMonth() + 1;
  const startYear = startDate.getFullYear();

  // Borrow from month if day is negative
  if (endDay < startDay) {
    endDay += 30;
    endMonth -= 1;
  }

  // Borrow from year if month is negative
  if (endMonth < startMonth) {
    endMonth += 12;
    endYear -= 1;
  }

  const days = endDay - startDay;
  const months = endMonth - startMonth;
  const years = endYear - startYear;

  const parts = [];

  if (years > 0) {
    parts.push(`${years} ${years === 1 ? t("year") : t("years")}`);
  }

  if (months > 0) {
    parts.push(`${months} ${months === 1 ? t("month") : t("months")}`);
  }

  if (days > 0 || parts.length === 0) {
    parts.push(`${days} ${days === 1 ? t("day") : t("days")}`);
  }

  return parts.join(", ");
}
