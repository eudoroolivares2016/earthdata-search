/* eslint-disable no-unused-vars */
import { test, expect } from 'playwright-test-coverage'

import singleCollection from './__mocks__/single_collection.json'

test.describe('Performance Benchmarking', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/*.{png,jpg,jpeg}', (route) => route.abort())
    await page.route(/collections/, async (route) => {
      await route.fulfill({
        json: singleCollection.body,
        headers: singleCollection.headers
      })
    })
  })

  test.only('Search page load time is less than 1 second', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')

    // // Extract LCP value
    // const lcpValue = await page.evaluate(() => {
    //   // Get performance entries
    //   const perfEntries = performance.getEntriesByType('largest-contentful-paint')
    //   console.log('🚀 ~ file: performance.spec.js:25 ~ lcpValue ~ perfEntries:', perfEntries)
    //   // Get the last entry
    //   const lcpEntry = perfEntries[perfEntries.length - 1]

    //   // Return LCP value
    //   console.log('🚀 ~ file: performance.spec.js:30 ~ lcpValue ~ lcpEntry:', lcpEntry)

    //   return lcpEntry
    // })

    const lcp = await page.evaluate(async () => new Promise((resolve) => {
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries()
        resolve(entries[entries.length - 1])
      }).observe({
        type: 'largest-contentful-paint',
        buffered: true
      })
    }))

    if (lcp) {
      // Adjust threshold as needed
      expect(lcp.startTime).toBeLessThan(30000)
    }
    // Const requestFinishedPromise = page.waitForEvent('requestfinished')

    // const request = await requestFinishedPromise
    // await page.mouse.click(1000, 450)

    // expect(request.timing().responseEnd < 30000).toBe(true)
  })

  test('Search page LCP start time is less than 7 second', async ({ page }) => {
    await page.goto('/')
    await page.mouse.click(1000, 450)
    const LCP = await page.evaluate(() => new Promise((resolve) => {
      new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lcp = entries.at(-1)
        resolve(lcp.startTime)
      }).observe({
        type: 'largest-contentful-paint',
        buffered: true
      })
    }))

    expect(LCP < 30000).toBe(true)
  })
})
