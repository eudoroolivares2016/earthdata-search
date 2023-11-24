import CmrRequest from './cmrRequest'
import { getEarthdataConfig, getEnvironmentConfig } from '../../../../../sharedUtils/config'

import { collectionRequestPermittedCmrKeys } from '../../../../../sharedConstants/permittedCmrKeys'
import {
  collectionRequestNonIndexedCmrKeys
} from '../../../../../sharedConstants/nonIndexedCmrKeys'

import { hasTag } from '../../../../../sharedUtils/tags'
import { isCSDACollection } from '../isCSDACollection'
import { getOpenSearchOsddLink } from '../../../../../sharedUtils/getOpenSearchOsddLink'
// Import ScaleImageRequest from './scaleImageRequest'
import unavailableImg from '../../../assets/images/image-unavailable.svg'

/**
 * Base Request object for collection specific requests
 */
export default class CollectionRequest extends CmrRequest {
  constructor(authToken, earthdataEnvironment) {
    if (authToken && authToken !== '') {
      super(getEnvironmentConfig().apiHost, earthdataEnvironment)

      this.authenticated = true
      this.authToken = authToken
      this.searchPath = 'collections'
    } else {
      super(getEarthdataConfig(earthdataEnvironment).cmrHost, earthdataEnvironment)

      // We do not define an extension here. It will be added in the search method.
      this.searchPath = 'search/collections.json'
    }
  }

  permittedCmrKeys() {
    return collectionRequestPermittedCmrKeys
  }

  nonIndexedKeys() {
    return collectionRequestNonIndexedCmrKeys
  }

  search(params) {
    if (params.twoDCoordinateSystem && params.twoDCoordinateSystem.coordinates) {
      // eslint-disable-next-line no-param-reassign
      delete params.twoDCoordinateSystem.coordinates
    }

    return this.post(this.searchPath, params)
  }

  /**
   * Transform the response before completing the Promise.
   * @param {Object} data - Response object from the object.
   * @return {Object} The object provided
   */
  transformResponse(data) {
    super.transformResponse(data)

    // If the response status code is not 200, return unaltered data
    // If the status code is 200, it doesn't exist in the response
    const { errors = [] } = data
    if (errors.length > 0) return data

    if (!data || Object.keys(data).length === 0) return data

    let entry

    if (data.items) {
      entry = data.items
    } else {
      const { feed = {} } = data;

      ({ entry = [] } = feed)
    }

    // Iterate over the collections
    entry.map((collection) => {
      const transformedCollection = collection

      if (collection && (collection.tags || collection.links)) {
        transformedCollection.isOpenSearch = !!getOpenSearchOsddLink(collection)

        transformedCollection.has_map_imagery = hasTag(collection, 'gibs')
      }

      if (collection && collection.collection_data_type) {
        transformedCollection.is_nrt = [
          'NEAR_REAL_TIME',
          'LOW_LATENCY',
          'EXPEDITED'
        ].includes(collection.collection_data_type)
      }

      if (collection && collection.organizations) {
        transformedCollection.isCSDA = isCSDACollection(collection.organizations)
      }

      // Const h = getApplicationConfig().thumbnailSize.height
      // const w = getApplicationConfig().thumbnailSize.width
      // Todo hit localLambda function
      // todo why would there not be an id on the collection?
      if (collection.id) {
        // Const scaleImageRequest = new ScaleImageRequest()
        // const scaledImage = await scaleImageRequest.getScaledImage('collections', collection.id)
        // console.log('🚀 ~ file: collectionRequest.js:108 ~ CollectionRequest ~ entry.map ~ scaledImage:', scaledImage)
        // transformedCollection.thumbnail = scaledImage
        // TODO remove debugging conditional
        // if (collection.browse_flag) {
        //   console.log('Getting in there')
        //   // Const browseScalerResult = `${getEarthdataConfig(this.earthdataEnvironment).apiHost}/browse-scaler/browse_images/datasets/${collection.id}?h=${h}&w=${w}`
        //   console.log('🚀 ~ file: collectionRequest.js:113 ~ CollectionRequest ~ entry.map ~ getEarthdataConfig(this.earthdataEnvironment).apiHost:', getEnvironmentConfig().apiHost)
        //   const scaledImageResult = `${getEnvironmentConfig().apiHost}/scale/collections/${collection.id}`

        //   transformedCollection.thumbnail = scaledImageResult
        // } else {
        //   transformedCollection.thumbnail = unavailableImg
        // }

        transformedCollection.thumbnail = collection.browse_flag
          ? `${getEnvironmentConfig().apiHost}/scale/collections/${collection.id}`
          : unavailableImg
      }

      return transformedCollection
    })

    return data
  }
}
