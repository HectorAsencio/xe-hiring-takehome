import type { APIRequestContext } from '@playwright/test'

export type AlertPair = 'USD/CAD' | 'GBP/USD' | 'EUR/USD'
export type AlertDirection = 'above' | 'below'

export type CreateAlertRequest = {
  pair: AlertPair
  threshold: number
  direction: AlertDirection
}

export type AlertResponse = CreateAlertRequest & {
  id: string
  triggered: boolean
}

export class AlertsApi {
  constructor(private readonly request: APIRequestContext) {}

  getAlerts() {
    return this.request.get('/api/alerts')
  }

  createAlert(alert: CreateAlertRequest) {
    return this.request.post('/api/alerts', { data: alert })
  }

  deleteAlert(id: string) {
    return this.request.delete(`/api/alerts/${encodeURIComponent(id)}`)
  }
}