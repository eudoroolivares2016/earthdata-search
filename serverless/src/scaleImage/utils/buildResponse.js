/**
 * Constructs a response body
 * @param {Buffer<Image>} imageBuffer Image buffer to return as the body
 * @param {Integer>} statusCode Status code to return with the response
 * @returns {JSON} Constructed response object with image as a base64 string
 */
export const buildResponse = (imageBuffer, statusCode = 200) => {
  const base64Image = imageBuffer.toString('base64')

  // Todo I think this is 'body': base64.b64encode(image).decode('utf-8'), base 64 encoded somewhere
  return {
    isBase64Encoded: true,
    statusCode,
    headers: {
      'Content-Type': 'image/png',
      'Access-Control-Allow-Origin': '*'
    },
    body: base64Image
  }
}
