import { cacheImage } from '../cacheImage'
import { getImageFromCache } from '../getImageFromCache'

describe('getImageFromCache', () => {
  test('returns null when key is not found in the cache', async () => {
    const imageFromCache = await getImageFromCache('test-image-contents')

    expect(imageFromCache).toEqual(null)
  })

  test('returns stored value when key is found in the cache', async () => {
    // Set an entry in the cache to test cache hit
    await cacheImage('empty-200-200', 'test-image-contents')

    const imageFromCache = await getImageFromCache('empty-200-200')

    expect(imageFromCache).toEqual('test-image-contents')
  })
})
