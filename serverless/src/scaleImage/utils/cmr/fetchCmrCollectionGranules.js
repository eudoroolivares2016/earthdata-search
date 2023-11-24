import fetch from 'node-fetch'

/**
 * Given a concept id, fetch the metadata for granules
 * @param {String} conceptId A collection concept id to return granules for
 * @param {String} cmrEndpoint The collection or granule search URL
 * @returns {JSON} the collection associated with the supplied id
 */
export const fetchCmrCollectionGranules = async (conceptId, echoToken) => {
  const headers = {}
  // TODO we don't use echo-tokens anymore
  if (echoToken) {
    headers['Echo-Token'] = echoToken
  }

  const response = await fetch(`${process.env.cmrRootUrl}/search/granules.json?collection_concept_id=${conceptId}`, {
    method: 'GET',
    headers
  })
    .then((res) => res.json())
    .then((json) => {
      const {
        errors,
        feed
      } = json

      if (errors) {
        // On failure throw an exception
        const [firstError] = errors

        throw new Error(firstError)
      }

      // Return the first page of granules as an array
      const { entry } = feed

      return entry
    })
    .catch((error) => {
      console.log(error.toString())

      return {
        errors: [
          error.toString()
        ]
      }
    })

  return response
}
