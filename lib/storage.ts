import type { Calculation } from "./types"

const STORAGE_KEY = "vaddi-calculator-history"
const MAX_ENTRIES = 50

export function saveCalculation(calculation: Calculation): void {
  const calculations = getCalculations()

  // Add new calculation at the beginning
  calculations.unshift(calculation)

  // Limit to MAX_ENTRIES
  if (calculations.length > MAX_ENTRIES) {
    calculations.length = MAX_ENTRIES
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(calculations))
}

export function getCalculations(): Calculation[] {
  const storedData = localStorage.getItem(STORAGE_KEY)
  if (!storedData) return []

  try {
    return JSON.parse(storedData) as Calculation[]
  } catch (error) {
    console.error("Error parsing stored calculations:", error)
    return []
  }
}

export function deleteCalculation(id: string): void {
  const calculations = getCalculations()
  const updatedCalculations = calculations.filter((calc) => calc.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedCalculations))
}

export function clearCalculations(): void {
  localStorage.removeItem(STORAGE_KEY)
}
