import sharp from 'sharp'

/**
 * No image available? This will pull the svg file and return it as a Buffer
 * @return {Buffer<Image>} This is what you show the user when an image cannot be found or resized
 */
export const buildUnavailableImageBuffer = async () => {
  const notFound = await sharp('static/src/assets/images/image-unavailable.svg')
    .toFormat('png')
    .toBuffer()
  console.log('🚀 ~ file: buildUnavailableImageBuffer.js:10 ~ buildUnavailableImageBuffer ~ notFound:', notFound)

  return notFound
}
