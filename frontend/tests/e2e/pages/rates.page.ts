import type { Locator, Page } from '@playwright/test'

export type CurrencyPair = 'USD / CAD' | 'GBP / USD' | 'EUR / USD'

export class RatesPage {
  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.goto('/')
  }

  get heading(): Locator {
    return this.page.getByRole('heading', { name: 'Xe Rate Board' })
  }

  get refreshButton(): Locator {
    return this.page.getByRole('button', { name: 'Refresh rates' })
  }

  get lastUpdated(): Locator {
    return this.page.locator('.updated')
  }

  rateFor(pair: CurrencyPair): Locator {
    return this.page
      .locator('.card')
      .filter({ hasText: pair })
      .locator('.rate')
  }

  async refresh() {
    await this.refreshButton.click()
  }
}