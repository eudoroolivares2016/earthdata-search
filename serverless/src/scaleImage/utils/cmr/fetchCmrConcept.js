import { getApplicationConfig, getEarthdataConfig } from '../../../../../sharedUtils/config'
// import { doSearchRequest } from '../../../util/cmr/doSearchRequest'
// import { buildParams } from '../../../util/cmr/buildParams'
// import { getJwtToken } from '../../../util/getJwtToken'
import { determineEarthdataEnvironment } from '../../../util/determineEarthdataEnvironment'
// import { collectionRequestPermittedCmrKeys } from '../../../sharedConstants/permittedCmrKeys'
// import { collectionRequestNonIndexedCmrKeys } from '../../../sharedConstants/nonIndexedCmrKeys'

/**
 * Retrieve the CMR metadata for the provided concept id
 * @param {String} conceptId A collection or granule concept-id
 * @param {String} echoToken The collection or granule search URL
 * @returns {JSON} The collection metadata associated with the provided concept id
 */
// todo rename this echoToken to cmrToken or something
export const fetchCmrConcept = async (conceptId, echoToken) => {
  console.log('🚀 ~ file: fetchCmrConcept.js:8 ~ fetchCmrConcept ~ echoToken:', echoToken)
  const headers = {}

  // Const { defaultResponseHeaders } = getApplicationConfig()

  // const earthdataEnvironment = determineEarthdataEnvironment(headers)

  if (echoToken) {
    headers['Echo-Token'] = echoToken
  }

  const earthdataEnvironment = determineEarthdataEnvironment(headers)

  const collectionUrl = `${getEarthdataConfig(earthdataEnvironment).cmrHost}/search/concepts/${conceptId}.json`

  console.log('🚀 ~ file: fetchCmrConcept.js:32 ~ fetchCmrConcept ~ collectionUrl:', collectionUrl)
  // Console.log('🚀 ~ file: fetchCmrConcept.js:17 ~ fetchCmrConcept ~ collectionUrl:', collectionUrl)
  // const results = await doSearchRequest({
  //   jwtToken: getJwtToken(echoToken),
  //   path: '/search/collections.json',
  //   params: buildParams({
  //     body,
  //     // Certain CMR keys will cause errors if indexes are provided
  //     nonIndexedKeys: collectionRequestNonIndexedCmrKeys,
  //     // Whitelist keys allowed in the collecitons request
  //     permittedCmrKeys: collectionRequestPermittedCmrKeys
  //   }),
  //   providedHeaders,
  //   requestId,
  //   earthdataEnvironment
  // })

  const response = await fetch(collectionUrl, {
    method: 'GET',
    headers
  })
    .then((res) => res.json())
    .then((json) => {
      const {
        errors
      } = json

      if (errors) {
        // On failure throw an exception
        const [firstError] = errors

        throw new Error(firstError)
      }

      return json
    })
    .catch((error) => {
      console.log(`Error fetching concept ${conceptId} - ${error.toString()}`)

      return {
        errors: [
          error.toString()
        ]
      }
    })

  return response
}
