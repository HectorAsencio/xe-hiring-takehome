import type { APIRequestContext } from '@playwright/test'

export class RatesApi {
  constructor(private readonly request: APIRequestContext) {}

  getRates() {
    return this.request.get('/api/rates')
  }

  postRates() {
    return this.request.post('/api/rates')
  }
}