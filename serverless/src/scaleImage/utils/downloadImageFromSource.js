/**
 * Fetches images from a given url and returns them as a buffer
 * @param {String} imageUrl URl to an image pulled from the metadata of a CMR concept
 * @returns {Buffer<Image>} The image contained in a buffer
 */
export const downloadImageFromSource = async (imageUrl) => {
  console.log(`🚀 Attempting to download ${imageUrl}`)

  return fetch(imageUrl)
    .then(async (response) => {
      if (response.ok) {
        console.log('request was 200✅')
        // TODO go back I don't think we want do both buffer conversions
        const content = await response.arrayBuffer()
        const saveBuffer = Buffer.from(content)

        return saveBuffer
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
