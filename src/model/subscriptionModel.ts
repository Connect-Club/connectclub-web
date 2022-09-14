export type Subscription = {
  id: string
  name: string
  description: string
  isActive: boolean
  price: number
  currency: string
  createdAt: number
  authorId: number
}

export type SubscriptionSummary = {
  totalSalesCount: number
  totalSalesAmount: number
  activeSubscriptions: number
}

export type SubscriptionChart = {
  dateStart: number
  dateEnd: number
  values: Array<{
    x: number
    y: number
  }>
}
