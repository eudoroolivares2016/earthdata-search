import sharp from 'sharp'

/**
 * Resize a given image to a given height and width
 * @param {Buffer<Image>} image An image binary contained in a buffer
 * @param {Integer} height How tall do you want the image to be?
 * @param {Integer} width How wide do you want the image to be?
 * @return {Buffer<Image>} This will give you a resized image or null
 */
export const resizeImage = async (image, height, width) => {
  try {
    const w = parseInt(width, 10)
    const h = parseInt(height, 10)

    // Only attempt to resize the image if a height or a width were provided
    if (height || width) {
      return await sharp(image)
        .resize(
          (w || null),
          (h || null),
          { fit: 'inside' }
        )
        .toFormat('png')
        .toBuffer()
    }

    // Otherwise just return the full image
    return await sharp(image)
      .toFormat('png')
      .toBuffer()
  } catch (e) {
    console.log(`Failed to resize image: ${e.toString()}`)

    throw e
  }
}
