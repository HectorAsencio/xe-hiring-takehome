import { expect, test } from '@playwright/test'
import { RatesPage } from './pages/rates.page'

test.describe('Rates Page', () => {
    test('loads the rates page and displays mocked rates', async ({ page }) => {
        await page.route('**/api/rates', (route) =>
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify([
                    { pair: 'USD/CAD', rate: 1.365, asOf: '2026-11-07T12:00:00Z' },
                    { pair: 'GBP/USD', rate: 1.271, asOf: '2026-11-07T12:00:00Z' },
                    { pair: 'EUR/USD', rate: 1.083, asOf: '2026-11-07T12:00:00Z' },
                ]),
            }),
        )

        const ratesPage = new RatesPage(page)
        await ratesPage.goto()

        await expect(ratesPage.heading).toBeVisible()
        await expect(ratesPage.refreshButton).toBeVisible()

        await expect(ratesPage.rateFor('USD / CAD')).toHaveText('1.3650')
        await expect(ratesPage.rateFor('GBP / USD')).toHaveText('1.2710')
        await expect(ratesPage.rateFor('EUR / USD')).toHaveText('1.0830')
        await expect(ratesPage.lastUpdated).toBeVisible()
    })

    test('refresh button loads and displays mocked updated rates', async ({ page }) => {
        let requestCount = 0

        await page.route('**/api/rates', (route) => {
            requestCount += 1

            const rates =
                requestCount === 1
                    ? [
                        { pair: 'USD/CAD', rate: 1.365, asOf: '2026-11-07T12:00:00Z' },
                        { pair: 'GBP/USD', rate: 1.271, asOf: '2026-11-07T12:00:00Z' },
                        { pair: 'EUR/USD', rate: 1.083, asOf: '2026-11-07T12:00:00Z' },
                    ]
                    : [
                        { pair: 'USD/CAD', rate: 1.4, asOf: '2026-11-07T12:05:00Z' },
                        { pair: 'GBP/USD', rate: 1.3, asOf: '2026-11-07T12:05:00Z' },
                        { pair: 'EUR/USD', rate: 1.1, asOf: '2026-11-07T12:05:00Z' },
                    ]

            return route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(rates),
            })
        })

        const ratesPage = new RatesPage(page)
        await ratesPage.goto()

        await expect(ratesPage.rateFor('USD / CAD')).toHaveText('1.3650')
        await expect(ratesPage.rateFor('GBP / USD')).toHaveText('1.2710')
        await expect(ratesPage.rateFor('EUR / USD')).toHaveText('1.0830')

        await ratesPage.refresh()

        await expect(ratesPage.rateFor('USD / CAD')).toHaveText('1.4000')
        await expect(ratesPage.rateFor('GBP / USD')).toHaveText('1.3000')
        await expect(ratesPage.rateFor('EUR / USD')).toHaveText('1.1000')
        expect(requestCount).toBe(2)
    })

    test('shows placeholders when refresh returns an error', async ({ page }) => {
        let requestCount = 0

        await page.route('**/api/rates', (route) => {
            requestCount += 1

            if (requestCount === 1) {
                return route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify([
                        { pair: 'USD/CAD', rate: 1.365, asOf: '2026-11-07T12:00:00Z' },
                        { pair: 'GBP/USD', rate: 1.271, asOf: '2026-11-07T12:00:00Z' },
                        { pair: 'EUR/USD', rate: 1.083, asOf: '2026-11-07T12:00:00Z' },
                    ]),
                })
            }

            return route.fulfill({
                status: 503,
                contentType: 'application/json',
                body: JSON.stringify({ error: 'Service unavailable' }),
            })
        })

        const ratesPage = new RatesPage(page)
        await ratesPage.goto()

        await expect(ratesPage.rateFor('USD / CAD')).toHaveText('1.3650')
        await expect(ratesPage.rateFor('GBP / USD')).toHaveText('1.2710')
        await expect(ratesPage.rateFor('EUR / USD')).toHaveText('1.0830')

        const failedRefresh = page.waitForResponse(
            (response) =>
                response.url().endsWith('/api/rates') && response.status() === 503,
        )

        await ratesPage.refresh()

        const response = await failedRefresh
        expect(response.status()).toBe(503)

        await expect(ratesPage.rateFor('USD / CAD')).toHaveText('...')
        await expect(ratesPage.rateFor('GBP / USD')).toHaveText('...')
        await expect(ratesPage.rateFor('EUR / USD')).toHaveText('...')
        expect(requestCount).toBe(2)
    })
})