"use client"

import { useState, useEffect } from "react"
import { useLanguage } from "@/components/language-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trash2, RefreshCw } from "lucide-react"
import { formatCurrency, getDurationText } from "@/lib/utils"
import type { Calculation } from "@/lib/types"
import { getCalculations, deleteCalculation, clearCalculations } from "@/lib/storage"
import { useToast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function History() {
  const { t } = useLanguage()
  const { toast } = useToast()
  const [calculations, setCalculations] = useState<Calculation[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadCalculations()
  }, [])

  const loadCalculations = () => {
    setIsLoading(true)
    const savedCalculations = getCalculations()
    setCalculations(savedCalculations)
    setIsLoading(false)
  }

  const handleDelete = (id: string) => {
    deleteCalculation(id)
    setCalculations(calculations.filter((calc) => calc.id !== id))
    toast({
      title: t("calculationDeleted"),
      description: t("calculationDeletedDesc"),
    })
  }

  const handleClearAll = () => {
    clearCalculations()
    setCalculations([])
    toast({
      title: t("allCalculationsCleared"),
      description: t("allCalculationsClearedDesc"),
    })
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (calculations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("noCalculations")}</CardTitle>
          <CardDescription>{t("noCalculationsDesc")}</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="grid gap-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">{t("savedCalculations")}</h2>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm">
              <Trash2 className="h-4 w-4 mr-2" />
              {t("clearAll")}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t("clearAllConfirmTitle")}</AlertDialogTitle>
              <AlertDialogDescription>{t("clearAllConfirmDesc")}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
              <AlertDialogAction onClick={handleClearAll}>{t("confirm")}</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {calculations.map((calc) => {
        const startDate = new Date(calc.startDate)
        const endDate = new Date(calc.endDate)
        const duration = getDurationText(startDate, endDate, t)

        return (
          <Card key={calc.id} className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2"
              onClick={() => handleDelete(calc.id)}
            >
              <Trash2 className="h-4 w-4 text-muted-foreground" />
              <span className="sr-only">{t("delete")}</span>
            </Button>
            <CardHeader>
              <CardTitle className="text-lg">{calc.label}</CardTitle>
              <CardDescription>{new Date(calc.timestamp).toLocaleString()}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">{t("principalAmount")}</div>
                    <div className="text-lg font-bold">₹{formatCurrency(calc.principal.toString())}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">{t("interestRate")}</div>
                    <div className="text-lg font-bold">
                      {calc.interestRate}
                      {calc.isPercentMode ? `% ${t("perYear")}` : ` ₹/${t("hundred")}/${t("month")}`}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">{t("interestAmount")}</div>
                    <div className="text-lg font-bold">₹{calc.interest.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">{t("totalAmount")}</div>
                    <div className="text-lg font-bold">₹{calc.total.toFixed(2)}</div>
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">{t("duration")}</div>
                  <div className="text-base">{duration}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
