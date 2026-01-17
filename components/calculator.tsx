"use client";

import dynamic from "next/dynamic";
import type React from "react";

import { useLanguage } from "@/components/language-provider";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { saveCalculation } from "@/lib/storage";
import type { Calculation } from "@/lib/types";
import {
  calculateInterest,
  formatCurrency,
  formatIndianCurrency,
  getDurationText,
} from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

const HierarchicalDatePicker = dynamic(
  () =>
    import("@/components/hierarchical-date-picker").then(
      (m) => m.HierarchicalDatePicker
    ),
  { ssr: false }
);

export default function Calculator() {
  const { t } = useLanguage() as { t: (key: string) => string };
  const { toast } = useToast();
  const [principal, setPrincipal] = useState<string>("");
  const [interestRate, setInterestRate] = useState<string>("1.5");
  const [isPercentMode, setIsPercentMode] = useState<boolean>(false);
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const [duration, setDuration] = useState<string>("");
  const [result, setResult] = useState<{
    principal: number;
    interest: number;
    total: number;
    monthlyRate: number;
  } | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  // Update duration text when dates change
  useEffect(() => {
    if (startDate && endDate) {
      setDuration(getDurationText(startDate, endDate, t));
    }
  }, [startDate, endDate, t]);

  const handlePrincipalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    if (value === "" || Number.parseInt(value) <= 999999999) {
      setPrincipal(value);
    }
  };

  const handleInterestRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9.]/g, "");
    setInterestRate(value);
  };

  const handleCalculate = () => {
    if (!principal || !interestRate || !startDate || !endDate) {
      toast({
        title: t("errorTitle"),
        description: t("fillAllFields"),
        variant: "destructive",
      });
      return;
    }

    if (endDate < startDate) {
      toast({
        title: t("errorTitle"),
        description: t("endDateError"),
        variant: "destructive",
      });
      return;
    }

    const principalAmount = Number.parseFloat(principal);
    const rate = Number.parseFloat(interestRate);

    if (
      isNaN(principalAmount) ||
      isNaN(rate) ||
      principalAmount <= 0 ||
      rate <= 0
    ) {
      toast({
        title: t("errorTitle"),
        description: t("invalidNumbers"),
        variant: "destructive",
      });
      return;
    }

    const { interest, monthlyRate } = calculateInterest(
      principalAmount,
      rate,
      startDate,
      endDate,
      isPercentMode
    );

    const calculationResult = {
      principal: principalAmount,
      interest,
      total: principalAmount + interest,
      monthlyRate,
    };

    setResult(calculationResult);

    // Scroll to result after state update
    setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);

    // Save calculation
    const calculation: Calculation = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      label: new Date().toLocaleString(),
      principal: principalAmount,
      interestRate: rate,
      isPercentMode,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      interest,
      total: principalAmount + interest,
    };

    saveCalculation(calculation);

    toast({
      title: t("calculationSaved"),
      description: t("calculationSavedDesc"),
    });
  };

  const handleReset = () => {
    setPrincipal("");
    setInterestRate("");
    setIsPercentMode(false);
    setStartDate(new Date());
    setEndDate(new Date());
    setResult(null);
  };

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("calculatorTitle")}</CardTitle>
          <CardDescription>{t("calculatorDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="principal">{t("principalAmount")}</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2">
                ₹
              </span>
              <Input
                id="principal"
                type="text"
                value={formatCurrency(principal)}
                onChange={handlePrincipalChange}
                className="pl-8"
                placeholder="0"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="interestRate">
                {isPercentMode
                  ? t("interestRatePercent")
                  : t("interestRateRupees")}
              </Label>
              <div className="flex items-center gap-2">
                <Switch
                  checked={isPercentMode}
                  onCheckedChange={setIsPercentMode}
                  id="interest-mode"
                />
              </div>
            </div>
            <Input
              id="interestRate"
              type="text"
              value={interestRate}
              onChange={handleInterestRateChange}
              placeholder="0"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="startDate">{t("startDate")}</Label>
              <HierarchicalDatePicker
                id="startDate"
                date={startDate}
                setDate={setStartDate}
                placeholder={t("selectDate")}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="endDate">{t("endDate")}</Label>
              <HierarchicalDatePicker
                id="endDate"
                date={endDate}
                setDate={setEndDate}
                placeholder={t("selectDate")}
              />
            </div>
          </div>

          {duration && (
            <div className="text-sm text-muted-foreground">
              {t("duration")}: {duration}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={handleReset}>
            {t("reset")}
          </Button>
          <Button onClick={handleCalculate}>{t("calculate")}</Button>
        </CardFooter>
      </Card>

      {result && (
        <Card ref={resultRef}>
          <CardHeader>
            <CardTitle>{t("results")}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  {t("principalAmount")}
                </div>
                <div className="text-2xl font-bold">
                  ₹{formatCurrency(result.principal.toString())}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  {t("interestAmount")}
                </div>
                <div className="text-2xl font-bold">
                  ₹{formatIndianCurrency(result.interest)}
                </div>
              </div>
            </div>
            <div className="pt-2 border-t">
              <div className="text-sm font-medium text-muted-foreground">
                {t("totalAmount")}
              </div>
              <div className="text-3xl font-bold">
                ₹{formatIndianCurrency(result.total)}
              </div>
            </div>
            {/* <div className="pt-2 border-t">
              <div className="text-sm font-medium text-muted-foreground">
                {t("monthlyInterestRate")}
              </div>
              <div className="text-lg font-semibold">
                {result.monthlyRate.toFixed(2)}% {t("perMonth")}
              </div>
            </div> */}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
