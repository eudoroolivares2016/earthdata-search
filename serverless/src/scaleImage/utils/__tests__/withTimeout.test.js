import { withTimeout } from '../withTimeout'

describe('withTimeout', () => {
  describe('successfull promises', () => {
    test('return correctly', async () => {
      // Resolve the promise instantly
      const promise = new Promise((resolve) => {
        setTimeout(() => {
          resolve()
        }, 1)
      })
        .then(() => 'promise-response')

      const response = await withTimeout(promise)

      // Given that the promise has resolved and we awaited
      // the response we should see the actual response
      expect(response).toEqual('promise-response')
    })
  })

  describe('successfull promises', () => {
    test('return correctly', async () => {
      // Resolve the promise instantly
      const promise = new Promise((_, reject) => {
        setTimeout(() => {
          reject()
        }, 1)
      })
        .catch(() => 'promise-failed')

      const response = await withTimeout(promise)

      // Given that the promise has resolved and we awaited
      // the response we should see the actual response
      expect(response).toEqual('promise-failed')
    })
  })

  describe('when the promise times out', () => {
    test('throws an error', async () => {
      const promise = new Promise((resolve) => {
        setTimeout(() => {
          resolve()
        }, 200)
      })
        .then(() => 'promise-response')

      const response = withTimeout(promise, 29900)

      await expect(response).rejects.toThrow()
    })
  })
})
