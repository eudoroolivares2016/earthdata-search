/**
 * @typedef {Object} ImageDimension
 * @property {Integer} height The height of the image
 * @property {Integer} width - THe width
 */

/**
  * Generates a key to be used for a particular records cache key
  * @param {String} conceptId CMR concept id
  * @param {String} conceptType CMR concept type
  * @param {ImageDimension} dimensions The dimensions of the image to generate the key for
  * @returns {String} Key to be used to store an item in cache.
  */
export const generateCacheKey = (conceptId, conceptType, dimensions = {}) => {
  const {
    height = 'h',
    width = 'w'
  } = dimensions

  const providedKeys = [
    conceptId,
    conceptType,
    height,
    width
  ].filter(Boolean)

  return providedKeys.join('-')
}
