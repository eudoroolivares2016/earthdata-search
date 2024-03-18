import React, {
  forwardRef,
  useEffect,
  useState
} from 'react'
import PropTypes from 'prop-types'
import axios from 'axios'

import { OverlayTrigger, Tooltip } from 'react-bootstrap'
import {
  FaClock,
  FaCloud,
  FaCogs,
  FaCubes,
  FaFileAlt,
  FaGlobe,
  FaInfoCircle,
  FaLock,
  FaMap,
  FaMinus,
  FaPlus,
  FaSlidersH,
  FaTags
} from 'react-icons/fa'

import { collectionMetadataPropType } from '../../util/propTypes/collectionMetadata'
import { commafy } from '../../util/commafy'
import { getApplicationConfig } from '../../../../../sharedUtils/config'
import { pluralize } from '../../util/pluralize'

import Button from '../Button/Button'
import EDSCIcon from '../EDSCIcon/EDSCIcon'
import MetaIcon from '../MetaIcon/MetaIcon'
import Spinner from '../Spinner/Spinner'
import PortalFeatureContainer from '../../containers/PortalFeatureContainer/PortalFeatureContainer'

import './CollectionResultsItem.scss'

import unavailableImg from '../../../assets/images/image-unavailable.svg'

/**
 * Renders CollectionResultsItem.
 * @param {Object} props - The props passed into the component.
 * @param {Object} props.collection - The collection metadata.
 * @param {Function} props.onAddProjectCollection - Callback to add a collection to a project.
 * @param {Function} props.onRemoveCollectionFromProject - Callback to remove a collection to a project.
 * @param {Function} props.onViewCollectionGranules - Callback to show collection granules route.
 * @param {Function} props.onViewCollectionDetails - Callback to show collection details route.
 */
export const CollectionResultsItem = forwardRef(({
  collectionMetadata,
  onAddProjectCollection,
  onRemoveCollectionFromProject,
  onViewCollectionDetails,
  onViewCollectionGranules
}, ref) => {
  const {
    collectionId,
    consortiums = [],
    cloudHosted,
    datasetId,
    displayOrganization,
    granuleCount,
    hasFormats,
    hasCombine,
    hasMapImagery,
    hasSpatialSubsetting,
    hasTemporalSubsetting,
    hasTransforms,
    hasVariables,
    isCollectionInProject,
    isCSDA,
    isNrt,
    isOpenSearch,
    nrt = {},
    shortName,
    summary,
    temporalRange,
    thumbnail,
    isDefaultImage,
    versionId
  } = collectionMetadata

  const [loadingThumbnail, setLoadingThumbnail] = useState(true)
  const { thumbnailSize } = getApplicationConfig()
  const [base64Image, setBase64Image] = useState('')

  const {
    height: thumbnailHeight,
    width: thumbnailWidth
  } = thumbnailSize

  const consortiumMeta = {
    GEOSS: 'Global Earth Observation System of Systems',
    CWIC: 'CEOS WGISS Integrated Catalog',
    FEDEO: 'Federated EO Gateway',
    CEOS: 'Committee on Earth Observation Satellites'
  }

  const { description: nrtDescription, label: nrtLabel } = nrt

  const onThumbnailLoaded = () => {
    setLoadingThumbnail(false)
  }

  // Fetch the base64 string from the Lambda function
  // Explicity call the GET request for the lambda
  // TODO there are some collections which it seems have inaccessible collections
  useEffect(() => {
    let isMounted = true
    if (!isDefaultImage) {
      axios.get(thumbnail)
        .then((response) => {
          // Set the base64 string received from Lambda
          console.log('in the response obj')
          if (isMounted) {
            setBase64Image(response.data.base64Image)
            onThumbnailLoaded()
          }
        })
        .catch(() => {
          setBase64Image(unavailableImg)
          onThumbnailLoaded()
        })
    } else {
      // Passed in thumbnail was the default set `base64` image to that
      // If the thumbnail was null set it to the unavailable image
      setBase64Image(thumbnail)
      onThumbnailLoaded()
    }

    // Cleanup function to cancel fetching when component unmounts
    // TODO I want to try a better way of doing this; just the cleanup function without isMounted was not working
    return () => {
      isMounted = false // Set the flag to false when component unmounts
    }
  }, [])

  const getConsortiumTooltipText = (consortium) => {
    let tooltip = ''
    if (consortiumMeta[consortium]) tooltip = consortiumMeta[consortium]

    return tooltip
  }

  const filteredConsortiums = consortiums.filter((consortium) => consortium !== 'EOSDIS')

  const addToProjectButton = (
    <Button
      className="collection-results-item__action collection-results-item__action--add"
      onClick={
        (event) => {
          onAddProjectCollection(collectionId)
          event.stopPropagation()
        }
      }
      variant="light"
      bootstrapVariant="light"
      bootstrapSize="sm"
      icon={FaPlus}
      label="Add collection to the current project"
      title="Add collection to the current project"
    />
  )

  const removeFromProjectButton = (
    <Button
      className="collection-results-item__action collection-results-item__action--remove"
      onClick={
        (event) => {
          onRemoveCollectionFromProject(collectionId)
          event.stopPropagation()
        }
      }
      variant="light"
      bootstrapVariant="light"
      bootstrapSize="sm"
      icon={FaMinus}
      label="Remove collection from the current project"
      title="Remove collection from the current project"
    />
  )

  const component = (
    <div
      className="collection-results-item"
      data-testid="collection-results-item"
      key={collectionId}
      ref={ref}
    >
      <div
        role="button"
        tabIndex="0"
        className="collection-results-item__link"
        onKeyPress={
          (event) => {
            if (event.key === 'Enter') {
              onViewCollectionGranules(collectionId)
            }

            event.stopPropagation()
          }
        }
        onClick={
          (event) => {
            onViewCollectionGranules(collectionId)
            event.stopPropagation()
          }
        }
        data-testid={`collection-result-item_${collectionId}`}
      >
        <div className="collection-results-item__body">
          <div className="collection-results-item__body-primary">
            <div className="collection-results-item__info">
              <h3 className="collection-results-item__title">
                {datasetId}
              </h3>
              <div className="collection-results-item__meta">
                {
                  isOpenSearch && (
                    <span className="collection-results-item__meta-item">Int&apos;l / Interagency</span>
                  )
                }
                {
                  !isOpenSearch && (
                    <span className="collection-results-item__meta-item">{`${commafy(granuleCount)} ${pluralize('Granule', granuleCount)}`}</span>
                  )
                }
                {
                  temporalRange && (
                    <span className="collection-results-item__meta-item">{temporalRange}</span>
                  )
                }
                {
                  hasMapImagery && (
                    <MetaIcon
                      id="feature-icon-list-view__map-imagery"
                      icon={FaMap}
                      iconProps={{ size: '0.975rem' }}
                      label="Map Imagery"
                      tooltipClassName="collection-results-item__tooltip"
                      tooltipContent="Supports advanced map visualizations using the GIBS tile service"
                    />
                  )
                }
                {
                  (
                    hasSpatialSubsetting
                    || hasVariables
                    || hasTransforms
                    || hasFormats
                    || hasTemporalSubsetting
                    || hasCombine
                  ) && (
                    <MetaIcon
                      className="collection-results-item__meta-icon collection-results-item__meta-icon--customizable"
                      id="feature-icon-list-view__customize"
                      icon={FaCogs}
                      label="Customize"
                      tooltipClassName="collection-results-item__tooltip text-align-left"
                      metadata={
                        (
                          <>
                            {
                              hasSpatialSubsetting && (
                                <EDSCIcon
                                  className="collection-results-item__icon svg fa-globe-svg"
                                  title="A white globe icon"
                                  icon={FaGlobe}
                                  size="0.675rem"
                                />
                              )
                            }
                            {
                              hasTemporalSubsetting && (
                                <EDSCIcon
                                  className="collection-results-item__icon svg fa-clock-svg"
                                  title="A white clock icon"
                                  icon={FaClock}
                                  size="0.675rem"
                                />
                              )
                            }
                            {
                              hasVariables && (
                                <EDSCIcon
                                  className="collection-results-item__icon svg fa-tags-svg"
                                  title="A white tags icon"
                                  icon={FaTags}
                                  size="0.675rem"
                                />
                              )
                            }
                            {
                              hasTransforms && (
                                <EDSCIcon
                                  className="collection-results-item__icon svg fa-sliders-svg"
                                  title="A white horizontal sliders icon"
                                  icon={FaSlidersH}
                                  size="0.675rem"
                                />
                              )
                            }
                            {
                              hasFormats && (
                                <EDSCIcon
                                  className="collection-results-item__icon svg fa-file-svg"
                                  title="A white file icon"
                                  icon={FaFileAlt}
                                  size="0.675rem"
                                />
                              )
                            }
                            {
                              hasCombine && (
                                <EDSCIcon
                                  className="collection-results-item__icon svg fa-file-svg"
                                  title="A white cubes icon"
                                  icon={FaCubes}
                                  size="0.675rem"
                                />
                              )
                            }
                          </>
                        )
                      }
                      tooltipContent={
                        (
                          <>
                            <div>
                              Supports customization:
                            </div>
                            <ul className="collection-results-item__tooltip-feature-list">
                              {
                                hasSpatialSubsetting && (
                                  <li>
                                    <EDSCIcon
                                      className="collection-results-item__tooltip-feature-icon"
                                      title="A white globe icon"
                                      size="0.725rem"
                                      icon={FaGlobe}
                                    />
                                    Spatial subset
                                  </li>
                                )
                              }
                              {
                                hasTemporalSubsetting && (
                                  <li>
                                    <EDSCIcon
                                      className="collection-results-item__tooltip-feature-icon"
                                      title="A white clock icon"
                                      size="0.725rem"
                                      icon={FaClock}
                                    />
                                    Temporal subset
                                  </li>
                                )
                              }
                              {
                                hasVariables && (
                                  <li>
                                    <EDSCIcon
                                      className="collection-results-item__tooltip-feature-icon"
                                      title="A white tags icon"
                                      size="0.725rem"
                                      icon={FaTags}
                                    />
                                    Variable subset
                                  </li>
                                )
                              }
                              {
                                hasTransforms && (
                                  <li>
                                    <EDSCIcon
                                      className="collection-results-item__tooltip-feature-icon"
                                      title="A white horizontal sliders icon"
                                      size="0.725rem"
                                      icon={FaSlidersH}
                                    />
                                    Transform
                                  </li>
                                )
                              }
                              {
                                hasFormats && (
                                  <li>
                                    <EDSCIcon
                                      className="collection-results-item__tooltip-feature-icon"
                                      title="A white file icon"
                                      size="0.725rem"
                                      icon={FaFileAlt}
                                    />
                                    Reformat
                                  </li>
                                )
                              }
                              {
                                hasCombine && (
                                  <li>
                                    <EDSCIcon
                                      className="collection-results-item__tooltip-feature-icon"
                                      title="A white boxes icon"
                                      size="0.725rem"
                                      icon={FaCubes}
                                    />
                                    Combine
                                  </li>
                                )
                              }
                            </ul>
                          </>
                        )
                      }
                    />
                  )
                }
                {
                  cloudHosted && (
                    <MetaIcon
                      id="feature-icon-list-view__earthdata-cloud"
                      icon={FaCloud}
                      iconProps={{ size: '1rem' }}
                      label="Earthdata Cloud"
                      metadata="Earthdata Cloud"
                      tooltipClassName="collection-results-item__tooltip"
                      tooltipContent="Dataset is available in the Earthdata Cloud"
                    />
                  )
                }
                {
                  isNrt && (
                    <MetaIcon
                      id="feature-icon-list-view__near-real-time"
                      icon={FaClock}
                      iconProps={{ size: '0.825rem' }}
                      label="Near Real Time"
                      metadata={nrtLabel}
                      tooltipClassName="collection-results-item__tooltip"
                      tooltipContent={nrtDescription}
                    />
                  )
                }
              </div>
              <p className="collection-results-item__desc">
                {summary}
              </p>
            </div>
            {
              thumbnail && (
                <div className={`collection-results-item__thumb ${loadingThumbnail ? 'collection-results-item__thumb--is-loading' : 'collection-results-item__thumb--is-loaded'}`}>
                  {
                    loadingThumbnail && (
                      <Spinner
                        type="dots"
                        className="collection-results-item__thumb-spinner"
                        color="white"
                        size="tiny"
                      />
                    )
                  }
                  <img
                    className={`collection-results-item__thumb-image ${loadingThumbnail ? 'collection-results-item__thumb-image--is-loading' : 'collection-results-item__thumb-image--is-loaded'}`}
                    src={base64Image}
                    alt={`Thumbnail for ${datasetId}`}
                    height={thumbnailHeight}
                    width={thumbnailWidth}
                  />
                </div>
              )
            }
          </div>
          <div className="collection-results-item__attribution">
            {
              ((filteredConsortiums && filteredConsortiums.length > 0) || isCSDA) && (
                <ul className="collection-results-item__attribution-list">
                  {
                    isCSDA && (
                      <OverlayTrigger
                        className="collection-results-item__tooltip-container"
                        placement="top"
                        overlay={
                          (
                            <Tooltip
                              id="tooltip__csda-badge"
                              className="collection-results-item__tooltip collection-results-item__tooltip--csda"
                            >
                              Commercial Smallsat Data Acquisition Program
                              <span className="tooltip__secondary-text">
                                (Additional authentication required)
                              </span>
                            </Tooltip>
                          )
                        }
                      >
                        <li className="collection-results-item__attribution-list-item">
                          <span className="collection-results-item__list-text collection-results-item__list-text--tooltip">
                            <EDSCIcon
                              className="collection-results-item__icon collection-results-item__icon--csda d-inline-block mr-1"
                              icon={FaLock}
                              size="0.55rem"
                            />
                            CSDA
                          </span>
                        </li>
                      </OverlayTrigger>
                    )
                  }
                  {
                    filteredConsortiums.map((consortium) => {
                      let consortiumDisplay = consortium
                      const consortiumTooltip = getConsortiumTooltipText(consortium)

                      if (consortiumTooltip) {
                        consortiumDisplay = (
                          <OverlayTrigger
                            className="collection-results-item__tooltip-container"
                            placement="top"
                            overlay={
                              (
                                <Tooltip
                                  className={`collection-results-item__tooltip collection-results-item__tooltip--${consortium}`}
                                >
                                  {consortiumTooltip}
                                </Tooltip>
                              )
                            }
                          >
                            <span className="collection-results-item__list-text collection-results-item__list-text--tooltip">{consortiumDisplay}</span>
                          </OverlayTrigger>
                        )
                      }

                      return (
                        <li
                          key={`${collectionId}__consortium--${consortium}`}
                          className="collection-results-item__attribution-list-item"
                        >
                          {consortiumDisplay}
                        </li>
                      )
                    })
                  }
                </ul>
              )
            }
            <div className="collection-results-item__attribution-secondary">
              {
                (
                  shortName
                  && versionId
                  && displayOrganization
                ) && (
                  <div className="collection-results-item__attribution-wrap">
                    <div className="collection-results-item__attribution-string">
                      {`${shortName} v${versionId} - ${displayOrganization}`}
                    </div>
                  </div>
                )
              }
              <div className="collection-results-item__actions">
                <Button
                  className="collection-results-item__action collection-results-item__action--collection-details"
                  onClick={
                    (event) => {
                      onViewCollectionDetails(collectionId)
                      event.stopPropagation()
                    }
                  }
                  label="View collection details"
                  title="View collection details"
                  bootstrapSize="sm"
                  bootstrapVariant="light"
                  icon={FaInfoCircle}
                />
                <PortalFeatureContainer authentication>
                  <>
                    {isCollectionInProject && removeFromProjectButton}
                    {!isCollectionInProject && addToProjectButton}
                  </>
                </PortalFeatureContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return component
})

CollectionResultsItem.displayName = 'CollectionResultsItem'

CollectionResultsItem.propTypes = {
  collectionMetadata: collectionMetadataPropType.isRequired,
  onAddProjectCollection: PropTypes.func.isRequired,
  onRemoveCollectionFromProject: PropTypes.func.isRequired,
  onViewCollectionDetails: PropTypes.func.isRequired,
  onViewCollectionGranules: PropTypes.func.isRequired
}

export default CollectionResultsItem
