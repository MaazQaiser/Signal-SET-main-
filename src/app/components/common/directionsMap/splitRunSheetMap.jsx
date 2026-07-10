/*global google*/
import { Box, Typography } from '@mui/material';
import { GoogleMap, InfoWindow, Marker, Polyline, useJsApiLoader } from '@react-google-maps/api';
import { ReactComponent as LocationIcon } from 'assets/svg/locationMap.svg';
import { ReactComponent as NoMapIcon } from 'assets/svg/NoMapIcon.svg';
import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { getHoursDiff24HourFormat } from 'src/app/obx/pages/schedules/helper';
import { decode, isObjectEmpty, timeFormat12h } from 'src/helper/utilityFunctions';
import { DELETED_HIT } from 'src/redux/reducers/runSheetReducer';
import {
  directionServiceErrors,
  googleMapStyles,
  runSheetIcons,
  toastSettings,
} from 'src/utils/constants';

import { useStyles } from './directionMapStyles';

const containerStyle = {
  width: '100%',
  height: '100%',
};

const defaultCenter = {
  lat: 40.7128,
  lng: -74.006,
};

const libraries = ['places', 'drawing', 'geometry'];
const SplitDirectionsMap = (props) => {
  const { t } = useTranslation();
  const {
    origin,
    destination,
    applyOnMap,
    center,
    waypoints,
    showPolyineAndMarkersSeparately,
    setCoordinates,
    pathData,
    mapPlaceholder,
    state,
    ...rest
  } = props;
  const classes = useStyles();
  const { hideMap } = rest;
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries,
  });
  const [mapState, setMapState] = useState(1);
  const hardReset = useRef(false);
  const markerRef = useRef({});
  const [mapPolyline, setPolyLine] = useState([]);
  const [finalCenter, setFinalCenter] = useState(defaultCenter);
  const [showLabel, setShowLabel] = useState(false);
  const onLoad = () => {};

  const applyOnMapRef = useRef(false);
  const activeMarkerIndex = useRef();

  /**
   * @description Update show label and active item index value ref
   * @param {*} polygon
   * @param {*} boolean
   */
  const updateLabelInfoOnHover = (polygon = null, boolean) => {
    activeMarkerIndex.current = polygon;
    setShowLabel(boolean);
  };

  const hideLabel = () => {
    setShowLabel(false);
    updateLabelInfoOnHover(null, false);
    activeMarkerIndex.current = null;
  };
  const calculateAndDisplayRoute = () => {
    const directionsService = new google.maps.DirectionsService();
    if (!directionsService) {
      reject(new Error('Directions service not available'));
      return;
    }
    let finalWayPoints = waypoints?.filter((data) => !data?.status || data?.status !== DELETED_HIT);
    directionsService.route(
      {
        origin: new google.maps.LatLng(origin.position.lat, origin.position.lng),
        destination: new google.maps.LatLng(destination.position.lat, destination.position.lng),
        waypoints: finalWayPoints.map((waypoint) => ({
          location: new google.maps.LatLng(waypoint?.position?.lat, waypoint?.position?.lng),
          stopover: true,
        })),
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (response, status) => {
        console.log({ finalWayPoints, waypoints, response, status, origin });
        if (status === google.maps.DirectionsStatus.OK) {
          var legs = response.routes[0].legs;
          let visitSetPolyLines = [];
          let latLngs = [];
          let mapPolyLineArray = [];
          let totalDistance = 0;
          let totalDuration = 0;
          for (let i = 0; i < legs.length; i++) {
            totalDistance += legs[i].distance.value;
            totalDuration += legs[i].duration.value;
          }
          for (let i = 0; i < legs.length; i++) {
            var steps = legs[i].steps;
            mapPolyLineArray[i] = decode(steps);
            latLngs[i] = [];
            for (let j = 0; j < steps?.length; j++) {
              latLngs[i] = [...latLngs[i], steps[j].polyline.points];
            }
            visitSetPolyLines = [
              ...visitSetPolyLines,
              {
                distance: legs[i].distance,
                duration: legs[i].duration,
                ...(i === 0 ? origin : finalWayPoints[i]),
                name: finalWayPoints[i]?.name
                  ? finalWayPoints[i]?.siteName
                  : finalWayPoints[i - 1]?.siteName,
                siteName: finalWayPoints[i]
                  ? finalWayPoints[i]?.siteName || finalWayPoints[i]?.name
                  : finalWayPoints[i - 1]?.siteName || finalWayPoints[i - 1]?.name,
                hitId: finalWayPoints[i] ? finalWayPoints[i]?.hitId : finalWayPoints[i - 1]?.hitId,
                isStartEnd: i === 0 ? true : false,
                end_location: {
                  lat: legs[i]?.end_location?.lat(),
                  lng: legs[i]?.end_location?.lng(),
                },
                start_location: {
                  lat: legs[i]?.start_location?.lat(),
                  lng: legs[i]?.start_location?.lng(),
                },
                mapPath: latLngs[i],
                totalDistance,
                totalDuration,
                isVisited: null,
                status: null,
                isSelected: null,
              },
            ];
          }
          setCoordinates(visitSetPolyLines);
        } else {
          const errorMessage =
            status === directionServiceErrors.invalidRequest
              ? t('obx.runsheet.invalidRouteError')
              : t('obx.runsheet.noRouteFoundError');
          toast.error(errorMessage, {
            position: 'top-right',
            autoClose: toastSettings.AUTO_CLOSE,
          });
        }
      },
    );
  };

  /**
   * Manage state if the apply on map is clicked
   */
  useEffect(() => {
    if (applyOnMap && !applyOnMapRef?.current) {
      calculateAndDisplayRoute();
      applyOnMapRef.current = true;
      setMapState((prev) => prev + 1);
      markerRef.current = {};
      return;
    } else if (!applyOnMap && applyOnMapRef.current) {
      applyOnMapRef.current = false;
      setPolyLine([]);
      setPolyLine(pathData);
      setMapState((prev) => prev + 1);
      markerRef.current = {};
    } else {
      setPolyLine(pathData);
      if (
        !isObjectEmpty(state?.startEndLocation) &&
        JSON.stringify(finalCenter) !== JSON.stringify(state?.startEndLocation)
      ) {
        setFinalCenter(state?.startEndLocation?.position || state?.startEndLocation);
        if (!hardReset.current) {
          setMapState((prev) => prev + 1);
          hardReset.current = true;
        }
      } else {
        setFinalCenter(pathData?.[0]?.start_location);
      }
    }
    markerRef.current = {};
  }, [applyOnMap, pathData]);

  /**
   * if center is changed
   */
  useEffect(() => {
    if (!isObjectEmpty(center) && JSON.stringify(center) !== JSON.stringify(finalCenter)) {
      setFinalCenter(center);
    }
  }, [center]);

  const polylineStrokeOptions = { strokeColor: '#146eff', strokeWeight: 3.5 };
  console.log({
    mapPolyline,
    mapState,
    center,
  });
  return (
    isLoaded && (
      <GoogleMap
        onClick={() => hideLabel()}
        onLoad={onLoad}
        options={{
          clickableIcons: false,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
          styles: googleMapStyles,
          fullscreenControlOptions: false,
        }}
        mapContainerStyle={containerStyle}
        center={finalCenter}
        zoom={10}
      >
        {!isObjectEmpty(state?.startEndLocation) && !applyOnMap && (
          <Marker
            position={state?.startEndLocation?.position}
            icon={runSheetIcons.startEndLocationIconBlack}
          />
        )}
        {/** Split run sheet first step */}

        {showPolyineAndMarkersSeparately && mapPolyline?.length > 0 && (
          <React.Fragment key={mapState}>
            {mapPolyline.map((line, index) => {
              const tempIndex = index;
              const marker = line?.uniqueId ? line : { ...line?.data, ...line };
              if (marker?.siteId && !markerRef.current?.[marker?.siteId]) {
                markerRef.current = { ...markerRef.current, [marker?.siteId]: index };
              }
              // if (line?.siteId && !markerRef.current?.[line?.siteId]) {
              //   markerRef.current = { ...markerRef.current, [line?.siteId]: index };
              // }

              let icon = line?.isStartEnd
                ? runSheetIcons.startEndLocationIconBlack
                : line?.isVisited || line?.isSelected
                  ? runSheetIcons.existingHitBlueIcon
                  : runSheetIcons.hitGreyIcon;

              if (isObjectEmpty(state?.isStartEndLocation) && !index) {
                icon = null;
              }
              // if applied on map is clicked and google's data is being rendered
              if (applyOnMap) {
                if (!index) {
                  icon = runSheetIcons.startEndLocationIconBlack;
                } else {
                  icon = runSheetIcons.runsheetMapBluePointerIconForDirectionsServiceRes;
                }
              }
              let polyLineOptions = polylineStrokeOptions;
              if (
                mapPolyline[tempIndex + 1]?.isVisited ||
                mapPolyline[tempIndex + 1]?.isSelected ||
                (index === mapPolyline.length - 1 &&
                  (mapPolyline[index]?.isVisited || mapPolyline[index]?.isSelected))
              ) {
                polyLineOptions = { ...polylineStrokeOptions };
              } else {
                polyLineOptions = { ...polylineStrokeOptions, strokeColor: '#C0C0C0' };
              }
              if (applyOnMap) {
                polyLineOptions = { ...polylineStrokeOptions };
              }
              return (
                <React.Fragment key={mapState || line?._id || line?.hitId || index}>
                  <Polyline options={polyLineOptions} path={line?.mapPath || line} />
                  {icon && (
                    <Marker
                      onClick={() => line?.uniqueId && updateLabelInfoOnHover(line, true)}
                      position={line?.start_location || line?.position || line?.[0]}
                      icon={icon}
                      label={{
                        text:
                          // !applyOnMap
                          // ? // !line?.isStartEnd && index !== 0 && `${index}`
                          // : line?.uniqueId && !line?.isStartEnd && index
                          //   ? `${index}`
                          !line?.isStartEnd && markerRef?.current?.[line?.siteId]
                            ? `${markerRef?.current?.[line?.siteId]}`
                            : null,

                        color: 'white',
                      }}
                    />
                  )}

                  {showLabel &&
                    activeMarkerIndex.current?.uniqueId === line?.uniqueId &&
                    (() => {
                      const multipleHits = mapPolyline?.filter(
                        (data) => data.siteId === line?.siteId && !data?.isStartEnd,
                      );

                      return (
                        <InfoWindow
                          onCloseClick={() => {
                            setShowLabel(false);
                            updateLabelInfoOnHover(null, false);
                            activeMarkerIndex.current = null;
                          }}
                          position={
                            activeMarkerIndex?.current?.position ||
                            activeMarkerIndex?.current?.start_location ||
                            line?.coordinates?.[0]
                          }
                          options={{
                            pixelOffset: new window.google.maps.Size(0, -30),
                          }}
                        >
                          <Box sx={{ background: 'white' }} className={classes.mainToolTipBoxs}>
                            {line?.siteImage && (
                              <img
                                src={line?.siteImage}
                                alt="room image"
                                className={classes.roomImageTool}
                              />
                            )}
                            <Typography variant="h6" className={classes.contactInformationName}>
                              {line?.siteName || line?.name}
                            </Typography>
                            {line?.siteAddress && (
                              <Box className={classes.iconWrraper}>
                                <LocationIcon />
                                <Typography variant="body3" className={classes.addressName}>
                                  {line?.siteAddress}
                                </Typography>
                              </Box>
                            )}
                            <Box className={classes.hitWrapperMain}>
                              {multipleHits?.length &&
                                multipleHits?.length > 1 &&
                                index !== 0 &&
                                multipleHits?.map((data, index) => {
                                  return (
                                    <Box key={index} className={classes.hitWrapper}>
                                      <Typography
                                        variant="subtitle3"
                                        className={classes.addressName}
                                      >
                                        Hit {index + 1}
                                      </Typography>
                                      <Typography variant="overline" className={classes.hitTime}>
                                        {data?.startsAt &&
                                          data?.endsAt &&
                                          `${timeFormat12h(data?.startsAt, true)} - ${timeFormat12h(data?.endsAt, true)} 
                (${getHoursDiff24HourFormat(data?.startsAt, data?.endsAt).toFixed(2)}h)`}
                                      </Typography>
                                    </Box>
                                  );
                                })}
                            </Box>
                          </Box>
                        </InfoWindow>
                      );
                    })()}
                </React.Fragment>
              );
            })}
          </React.Fragment>
        )}

        {hideMap && (
          <Box className={classes.noMap}>
            <Box className={classes.noMapInner}>
              <NoMapIcon />
              <Typography> {mapPlaceholder || t('obx.runsheet.selectMap')}</Typography>
            </Box>
          </Box>
        )}
      </GoogleMap>
    )
  );
};

SplitDirectionsMap.propTypes = {
  origin: PropTypes.object,
  setCoordinates: PropTypes.func,
  destination: PropTypes.object,
  waypoints: PropTypes.array,
  applyOnMap: PropTypes.bool,
  pathData: PropTypes.array,
  center: PropTypes.object,
  showPolyineAndMarkersSeparately: PropTypes.bool,
  mapPlaceholder: PropTypes.string,
  state: PropTypes.object,
};

SplitDirectionsMap.defaultProps = {
  origin: {},
  setCoordinates: () => {},
  destination: {},
  waypoints: [],
  pathData: [],
  center: {},
  showPolyineAndMarkersSeparately: true,
  mapPlaceholder: '',
  state: {},
};

export default SplitDirectionsMap;
