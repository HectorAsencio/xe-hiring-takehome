import { expect, test } from '@playwright/test'
import { RatesApi } from './clients/rates.api'

type Rate = {
  pair: string
  rate: number
  asOf: string
}

function isRate(value: unknown): value is Rate {
  if (typeof value !== 'object' || value === null) return false

  const item = value as Record<string, unknown>

  return (
    typeof item.pair === 'string' &&
    item.pair.length > 0 &&
    typeof item.rate === 'number' &&
    Number.isFinite(item.rate) &&
    typeof item.asOf === 'string' &&
    Number.isFinite(Date.parse(item.asOf))
  )
}

function assertRates(payload: unknown): asserts payload is Rate[] {
  if (!Array.isArray(payload) || !payload.every(isRate)) {
    throw new Error(
      'GET /api/rates didn\'t return a list with expected format.',
    )
  }
}

test.describe('Rates API', () => {
  test('GET /api/rates returns a valid rates list', async ({ request }) => {
    const ratesApi = new RatesApi(request)
    const response = await ratesApi.getRates()

    expect(response.status()).toBe(200)
    expect(response.headers()['content-type']).toContain('application/json')

    const payload: unknown = await response.json()
    assertRates(payload)

    expect(payload.length).toBeGreaterThan(0)

    for (const { rate } of payload) {
      expect(rate).toBeGreaterThan(0)

      const fractionalPrecision = Math.abs(rate * 10_000 - Math.round(rate * 10_000))
      expect(fractionalPrecision).toBeLessThan(1e-7)
    }
  })

  test('POST /api/rates is not an allowed method', async ({ request }) => {
    const ratesApi = new RatesApi(request)
    const response = await ratesApi.postRates()

    expect(response.status()).toBe(405)
  })
})