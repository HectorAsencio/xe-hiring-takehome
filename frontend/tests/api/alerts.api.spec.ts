import { expect, test } from '@playwright/test'
import { AlertsApi } from './clients/alerts.api'
import type { AlertResponse } from './clients/alerts.api'

function assertAlert(value: unknown): asserts value is AlertResponse {
  if (
    typeof value !== 'object' ||
    value === null ||
    !('id' in value) ||
    typeof value.id !== 'string' ||
    !('pair' in value) ||
    typeof value.pair !== 'string' ||
    !('threshold' in value) ||
    typeof value.threshold !== 'number' ||
    !('direction' in value) ||
    (value.direction !== 'above' && value.direction !== 'below') ||
    !('triggered' in value) ||
    typeof value.triggered !== 'boolean'
  ) {
    throw new Error('API returned an alert with an unexpected format.')
  }
}

test.describe('GET /api/alerts', () => {
  test('returns a list of alerts', async ({ request }) => {
    const alertsApi = new AlertsApi(request)
    const response = await alertsApi.getAlerts()

    expect(response.status()).toBe(200)
    expect(response.headers()['content-type']).toContain('application/json')

    const payload: unknown = await response.json()
    expect(Array.isArray(payload)).toBe(true)

    if (!Array.isArray(payload)) {
      throw new Error('GET /api/alerts did not return a list.')
    }

    for (const alert of payload) {
      assertAlert(alert)
    }
  })
})

test.describe('POST /api/alerts', () => {
  const triggeredCases = [
    { direction: 'above', threshold: 1.3649, expected: true },
    { direction: 'above', threshold: 1.365, expected: false },
    { direction: 'above', threshold: 1.3651, expected: false },
    { direction: 'below', threshold: 1.3651, expected: true },
    { direction: 'below', threshold: 1.365, expected: false },
    { direction: 'below', threshold: 1.3649, expected: false },
  ] as const

  for (const { direction, threshold, expected } of triggeredCases) {
    test(`sets triggered=${expected} for direction "${direction}" at threshold ${threshold}`, async ({ request }) => {
      const alertsApi = new AlertsApi(request)
      const response = await alertsApi.createAlert({
        pair: 'USD/CAD',
        threshold,
        direction,
      })

      expect(response.status()).toBe(201)

      const payload: unknown = await response.json()
      assertAlert(payload)

      try {
        expect(payload.triggered).toBe(expected)
      } finally {
        const cleanupResponse = await alertsApi.deleteAlert(payload.id)
        expect(cleanupResponse.status()).toBe(204)
      }
    })
  }

  test('rejects an unsupported pair', async ({ request }) => {
    const response = await request.post('/api/alerts', {
      data: {
        pair: 'AUD/USD',
        threshold: 1,
        direction: 'above',
      },
    })

    expect(response.status()).toBe(400)
  })

  test('rejects an unsupported direction', async ({ request }) => {
    const response = await request.post('/api/alerts', {
      data: {
        pair: 'USD/CAD',
        threshold: 1.3,
        direction: 'equal',
      },
    })

    expect(response.status()).toBe(400)
  })
})

test.describe('DELETE /api/alerts', () => {
  test('deletes a created alert', async ({ request }) => {
    const alertsApi = new AlertsApi(request)
    const createResponse = await alertsApi.createAlert({
      pair: 'EUR/USD',
      threshold: 1.1,
      direction: 'below',
    })

    expect(createResponse.status()).toBe(201)

    const payload: unknown = await createResponse.json()
    assertAlert(payload)

    const deleteResponse = await alertsApi.deleteAlert(payload.id)
    expect(deleteResponse.status()).toBe(204)

    const listResponse = await alertsApi.getAlerts()
    expect(listResponse.status()).toBe(200)

    const remainingAlerts: unknown = await listResponse.json()
    expect(Array.isArray(remainingAlerts)).toBe(true)

    if (!Array.isArray(remainingAlerts)) {
      throw new Error('GET /api/alerts did not return a list.')
    }

    expect(remainingAlerts.some((alert) => alert.id === payload.id)).toBe(false)
  })

  test('returns 404 for a non-existing id', async ({ request }) => {
    const alertsApi = new AlertsApi(request)
    const response = await alertsApi.deleteAlert(
      '00000000-0000-0000-0000-000000000000',
    )

    expect(response.status()).toBe(404)
  })
})

test.describe('Unsupported HTTP for /api/alerts', () => {
  test('PUT returns 405', async ({ request }) => {
    const response = await request.put('/api/alerts', {
      data: {
        pair: 'USD/CAD',
        threshold: 1.3,
        direction: 'above',
      },
    })

    expect(response.status()).toBe(405)
  })

  test('PATCH returns 405', async ({ request }) => {
    const response = await request.patch('/api/alerts', {
      data: {
        threshold: 1.3,
      },
    })

    expect(response.status()).toBe(405)
  })
})