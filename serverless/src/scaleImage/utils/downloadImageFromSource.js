import fetch from 'node-fetch'

/**
 * Fetches images from a given url and returns them as a buffer
 * @param {String} imageUrl URl to an image pulled from the metadata of a CMR concept
 * @returns {Buffer<Image>} The image contained in a buffer
 */
export const downloadImageFromSource = async (imageUrl) => {
  console.log(`Attempting to download ${imageUrl}`)

  return fetch(imageUrl)
    .then((response) => {
      if (response.ok) {
        return response.buffer()
      }

      const { status, statusText } = response

      throw new Error(`Failed to download ${imageUrl} [${status}]: ${statusText}`)
    })
    .then(
      (response) => response,
      (error) => {
        console.log(error.toString())
      }
    )
}
