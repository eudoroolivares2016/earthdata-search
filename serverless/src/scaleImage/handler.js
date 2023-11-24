// Import AWS from 'aws-sdk'
import { getApplicationConfig } from '../../../sharedUtils/config'

import { buildResponse } from './utils/buildResponse'
import { downloadImageFromSource } from './utils/downloadImageFromSource'
import { withTimeout } from './utils/withTimeout'

import { cacheImage } from './utils/cache/cacheImage'
import { generateCacheKey } from './utils/cache/generateCacheKey'
import { getImageFromCache } from './utils/cache/getImageFromCache'
// Import { getSystemToken } from '../util/urs/getSystemToken'

import { getImageUrlFromConcept } from './utils/cmr/getImageUrlFromConcept'

import {
  buildAndResizeUnavailableImageBuffer
} from './utils/sharp/buildAndResizeUnavailableImageBuffer'

import { resizeImage } from './utils/sharp/resizeImage'

// // AWS Parameter Store adapter
// let parameterStore
let systemToken
// Retrieve a connection to the database
// eslint-disable-next-line prefer-const

// Initialize the token used to retrieve CMR data
/**
 * Resizes an image and returns it as a string buffer
 * @param {Object} event AWS Lambda Event
 * @param {Object} context AWS Lambda Context
 */
const scaleImage = async (event, context) => {
  // TODO fix this stub in place for the token
  // systemToken = await getSystemToken()
  console.log('🚀 ~ file: handler.js:34 ~ scaleImage ~ systemToken:', systemToken)

  // https://stackoverflow.com/questions/49347210/why-aws-lambda-keeps-timing-out-when-using-knex-js
  // eslint-disable-next-line no-param-reassign
  context.callbackWaitsForEmptyEventLoop = false

  // Only instantiate the adapter if we haven't already done so
  // if (parameterStore == null) {
  //   parameterStore = new AWS.SSM({
  //     region: 'us-east-1'
  //   })
  // }

  // // If in a live environment and the system token has not been retrieved yet
  // if (process.env.IS_OFFLINE !== 'true' && systemToken == null) {
  //   const parameterStoreResponse = await parameterStore.getParameter({
  //     Name: process.env.cmrSystemTokenParam,
  //     WithDecryption: true
  //   }).promise()

  //   const { Parameter: parameter } = parameterStoreResponse;

  //   ({ Value: systemToken } = parameter)
  // }

  // Pull the path and query parameters from the http event
  const {
    pathParameters,
    queryStringParameters
  } = event

  const {
    concept_id: conceptId,
    concept_type: conceptType
  } = pathParameters

  // Default the queryStringParameters because when none are provided the key is missing
  // todo default the height and the weight
  const {
    cascade_concepts: cascadeConcepts = 'true',
    h: height = getApplicationConfig().thumbnailSize.height,
    w: width = getApplicationConfig().thumbnailSize.width,
    return_default: returnDefault = 'true'
  } = queryStringParameters || {}

  // Initialize the thumbnail to an empty array buffer to support `return_default` being set to false
  let thumbnail = Buffer.from('')

  try {
    const cacheKey = generateCacheKey(conceptId, conceptType, {
      height,
      width
    })

    const imageFromCache = await getImageFromCache(cacheKey)

    if (imageFromCache) {
      // If the image is in the cache, return it
      return buildResponse(imageFromCache)
    }

    // Check for the original size image in the cache
    const originalCacheKey = generateCacheKey(conceptId, conceptType)
    const originalImageFromCache = await getImageFromCache(originalCacheKey)

    let imageBuffer

    // If the original image is cached, don't download it from the imageUrl
    if (originalImageFromCache) {
      imageBuffer = originalImageFromCache
    } else {
      // Attempt to retrieve the url of a browse image for the provided concept and type
      const imageUrl = await getImageUrlFromConcept(
        conceptId,
        conceptType,
        cascadeConcepts,
        systemToken
      )
      console.log('🚀 ~ file: handler.js:112 ~ scaleImage ~ imageUrl:', imageUrl)

      if (!imageUrl) {
        console.log('💩 No image URL bad bad bad')
        // If there is no image url found and returnDefault is false, return a 404
        let statusCode = 404

        if (returnDefault === 'true') {
          // If there is no image url found and returnDefault is true, return a 200 with the unavailable image
          thumbnail = await buildAndResizeUnavailableImageBuffer(height, width)
          statusCode = 200
        }

        return buildResponse(thumbnail, statusCode)
      }

      imageBuffer = await withTimeout(
        downloadImageFromSource(imageUrl),
        process.env.externalTimeoutDelta
      )

      console.log(`Successfully downloaded ${imageUrl}`)

      // Cache the original image, if the requested image was resized
      if (originalCacheKey !== cacheKey) {
        cacheImage(originalCacheKey, imageBuffer)
      }
    }

    // Resize will check to see if a height or width was provided and if not avoid calling resize
    thumbnail = await resizeImage(imageBuffer, height, width)

    // Cache the image
    cacheImage(cacheKey, thumbnail)
  } catch (e) {
    console.log(e.toString())

    if (returnDefault === 'true') {
      thumbnail = await buildAndResizeUnavailableImageBuffer(height, width)
    }

    return buildResponse(thumbnail, 500)
  }

  // Return the resized image
  return buildResponse(thumbnail)
}

export default scaleImage
