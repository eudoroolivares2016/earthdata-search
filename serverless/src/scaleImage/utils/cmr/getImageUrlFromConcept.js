import { fetchCmrCollectionGranules } from './fetchCmrCollectionGranules'
import { fetchCmrConcept } from './fetchCmrConcept'
import { getBrowseImageUrlFromConcept } from './getBrowseImageUrlFromConcept'
/**
 * Call appropriate method given concept type to extract image url from metadata
 * @param {String} conceptId CMR concept id
 * @param {String} conceptType CMR concept type
 * @param {String} cascadeConcepts Whether or not to check granules if collection metadata contains no browse image urls
 * @param {String} echoToken Valid CMR Access Token
 * @returns {String} Url to an image or null
 */
export const getImageUrlFromConcept = async (
  conceptId,
  conceptType,
  cascadeConcepts,
  echoToken
) => {
  console.log('🚀 ~ file: getImageUrlFromConcept.js:18 ~ conceptId:', conceptId)
  // Retrieve the metadata for the provided concept id and type
  const conceptMetadata = await fetchCmrConcept(conceptId, echoToken)
  // Console.log('🚀 ~ file: getImageUrlFromConcept.js:21 ~ conceptMetadata:', conceptMetadata)

  if (conceptType === 'granules') {
    // No need to use `await` because we're returning the statement
    return getBrowseImageUrlFromConcept(conceptMetadata)
  }

  // TODO are we still going to support things called datasets?
  // Support previously used names for collections
  if (['collections', 'datasets'].includes(conceptType)) {
    console.log('🚀 ~ file: getImageUrlFromConcept.js:31 ~ conceptMetadata:', conceptMetadata)
    let collectionBrowseImage = await getBrowseImageUrlFromConcept(conceptMetadata)

    // If no browse image was found in the collection metadata and the user wants to fallback to granule metadata
    if (collectionBrowseImage == null && cascadeConcepts === 'true') {
      console.log('🚀 ~ file: getImageUrlFromConcept.js:36 ~ cascadeConcepts:', cascadeConcepts)
      const collectionGranuleMetadata = await fetchCmrCollectionGranules(conceptId, echoToken)
      console.log('🚀 ~ file: getImageUrlFromConcept.js:38 ~ collectionGranuleMetadata:', collectionGranuleMetadata)
      // TODO this is where we may need to select to fulfill all the browse-scaler functionality
      // TODO: Break from this loop as soon as an image url is found
      collectionGranuleMetadata.forEach((granuleMetadata) => {
        const granuleBrowseImageUrl = getBrowseImageUrlFromConcept(granuleMetadata)

        // If a browse image url was found on the granule, set it to the collection browse image
        if (granuleBrowseImageUrl) {
          collectionBrowseImage = granuleBrowseImageUrl
        }
      })
    }

    return collectionBrowseImage
  }

  // Concept was not collection or granule
  console.log(`Unable to find browse imagery for concept: ${conceptId}`)

  return null
}
