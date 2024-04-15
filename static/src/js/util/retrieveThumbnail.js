import unavailableImg from '../../assets/images/image-unavailable.svg'
/**
 * Returns expecting an image buffer to process converts to a base64 string
 * @async
 * @param {thumbnail} string the endpoint to retrieve the thumbnail from
 * @returns {Promise<string>} The thumbnail image as as a `base64` encoded string
 */
export const retrieveThumbnail = async (thumbnail) => {
  try {
    const response = await fetch(thumbnail, {
      Accept: 'image/png'
    })
    const buffer = await response.arrayBuffer()
    const base64ImageString = Buffer.from(buffer, 'binary').toString('base64')
    const responseImg = `data:image/png;base64, ${base64ImageString}`

    return responseImg
  } catch {
    return unavailableImg
  }
}

export default retrieveThumbnail
