export interface Calculation {
  id: string
  timestamp: string
  label: string
  principal: number
  interestRate: number
  isPercentMode: boolean
  startDate: string
  endDate: string
  interest: number
  total: number
}
