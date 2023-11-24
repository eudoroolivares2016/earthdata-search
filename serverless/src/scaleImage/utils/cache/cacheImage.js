import { getCacheConnection } from './getCacheConnection'

/**
 * Puts the given image in cache
 * @param {String} key This is what you use to get the image later
 * @param {Buffer<Image>} image This is what you want the key to get
 */
export const cacheImage = async (key, image) => {
  const { cacheKeyExpireSeconds } = process.env

  // Ignore empty cache attempts
  if (image) {
    const cacheConnection = await getCacheConnection()
    /**
     * Caching methods
     * EX      -- Set the specified expire time, in seconds.
     * PX      -- Set the specified expire time, in milliseconds.
     * NX      -- Only set the key if it does not already exist.
     * XX      -- Only set the key if it already exist.
     * KEEPTTL -- Retain the time to live associated with the key.
     */
    try {
      await cacheConnection.set(key, image, 'EX', cacheKeyExpireSeconds)

      console.log(`Successfully cached ${key}`)
    } catch (e) {
      console.log(`Failed to cache ${key}: ${e.toString()}`)

      throw e
    }
  } else {
    // Log the attempt to cache empty values for debugging
    console.log(`Valued provided for ${key} is empty, skipping cache.`)
  }
}
