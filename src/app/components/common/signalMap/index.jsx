import { Box, Button, LinearProgress, Skeleton, Typography } from '@mui/material';
import { linearProgressClasses } from '@mui/material/LinearProgress';
import { styled } from '@mui/material/styles';
import {
  GoogleMap,
  InfoWindow,
  Marker,
  Polygon,
  Polyline,
  useJsApiLoader,
} from '@react-google-maps/api';
import * as turf from '@turf/turf';
import { ReactComponent as LocationIcon } from 'assets/icons/pin.svg';
import { ReactComponent as RectangleIcon } from 'assets/icons/rectangle.svg';
import { ReactComponent as RectangleWhiteIcon } from 'assets/icons/rectangleWhite.svg';
import OfficerImage from 'assets/images/Avatar-schedule.png';
import MapImage from 'assets/images/map.png';
import { ReactComponent as GoToNextIcon } from 'assets/svg/arrow-right.svg';
import { ReactComponent as ArrowLeftIcon } from 'assets/svg/chevron-right.svg';
import { ReactComponent as MapRedIcon } from 'assets/svg/map-icon-red.svg';
import { ReactComponent as MapOrangeIcon } from 'assets/svg/map-orange-icon.svg';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
  dayjsWithStandardOffset,
  getHoursDiff24HourFormat,
} from 'src/app/obx/pages/schedules/helper';
import { HO_FRANCHISE_DETAIL, OBX_RUNSHEET, OBX_SITES_DETAIL } from 'src/app/router/constant/ROUTE';
import history from 'src/app/router/utils/history';
import { getLiveTrackingRunSheetData } from 'src/services/scout.service';
import {
  defaultMapZoom,
  DUTY_TYPES,
  polygonlocationTypes,
  rolesEnum,
  runSheetIcons,
  visitedPolyline,
} from 'src/utils/constants';
import { DRAWER_TYPE, TourShiftStatusEnum } from 'src/utils/constants/schedules';

import {
  generateUniqueId,
  isObjectEmpty,
  mapRunSheetData,
  timeFormat12h,
} from '../../../../helper/utilityFunctions';
import ShiftDetail from '../../../obx/pages/schedules/shiftDetail';
import { StatusValues } from '../../obxComponents/ShiftVisitsStatus';
import { useStyles } from './signalMap';

/**
 * library functionalities for Google Maps
 */
const libraries = ['places', 'drawing', 'geometry'];

/**
 * Default center if can't get location of user.
 */
const defaultCenter = { lat: 41.216362, lng: -96.13607 };

/**
 * constant values
 */
export const actionItemTypeKeys = {
  zone: 'zone',
  franchise: 'franchise',
  site: 'site',
  franchiseName: 'franchiseName',
  sitePin: 'https://signalassets.blob.core.windows.net/signal/assets/SitePin.svg',
  franchisePin: 'https://signalassets.blob.core.windows.net/signal/assets/FranchisesPin.svg',
};

/**
 * The options for each polygon (franchise)
 * Initially all polygons must not be either draggable or editable
 * These are turned to true only when they are about to be edited.
 */
const franchisePolygonOptions = {
  fillOpacity: 0.3,
  fillColor: '#FF9332',
  strokeColor: '#FF9332',
  strokeWeight: 0,
  draggable: true,
  editable: true,
};

/**
 * Zone polygon options
 */
const zonePolygonOptions = {
  fillOpacity: 0.3,
  fillColor: '#00BDBA',
  strokeColor: '#00BDBA',
  strokeWeight: 0,
  draggable: true,
  editable: true,
};

/**
 * Site polygon options
 */
const sitePolygonOptions = {
  fillOpacity: 0.5,
  fillColor: '#FB3737',
  strokeColor: '#FB3737',
  strokeWeight: 0,
  draggable: true,
  editable: true,
};

const containerStyle = {
  width: '100%',
  height: 'calc(100dvh - 60px)',
};

dayjs.extend(utc);
dayjs.extend(timezone);

const StatusColors = (theme) => ({
  [TourShiftStatusEnum.NOT_STARTED]: theme.palette.surfaceWarningStrong,
  [TourShiftStatusEnum.IN_PROGRESS]: theme.palette.textBrand,
  [TourShiftStatusEnum.COMPLETED]: theme.palette.surfaceSuccessStrong,
  [TourShiftStatusEnum.BEHIND_SCHEDULE]: theme.palette.surfaceAlertStrong,
  [TourShiftStatusEnum.ON_SCHEDULE]: theme.palette.textBrand,
});

const BorderLinearProgress = styled(LinearProgress)(({ theme, ...rest }) => {
  return {
    height: 10,
    borderRadius: 10,
    [`&.${linearProgressClasses.colorPrimary}`]: {
      backgroundColor: theme.palette.surfaceGreySubtle,
    },
    [`& .${linearProgressClasses.bar}`]: {
      borderRadius: 10,
      backgroundColor: `${StatusColors(theme)[rest?.status]} !important`,
    },
  };
});
/**
 * @description Pillar Component of the project and if you are here to edit this, then RIP in advance. :)
 * @param {Boolean} createOrUpdate toggle for drawing controls
 * @param {Object} mapCenter object that shows the center of the map
 * @param {Array} franchiseData object containing franchises, zones and sites along with the actionItem's parentId.
 * @param {Array} visitors array of visitors
 * @param {Object} officerDetails officer tooltip data object
 * @param {Boolean} officerLoading officer tooltip loading state
 * @param {Function} getOfficerShiftDetails function to get officer tooltip data object
 * @returns
 */
const CommonSignalMap = (props) => {
  const {
    franchiseData = [],
    mapCenter = {},
    setOfficerDetails = () => {},
    showPolyLines = true,
    externalCenter = {},
    visitors = [],
    officerDetails = null,
    getOfficerShiftDetails = () => {},
    officerLoading = true,
    setShowSearch = () => {},
  } = props;

  const userRole = useSelector((state) => state.auth.userRole);
  const animationRef = useRef(true);
  const { t } = useTranslation();
  const mapRef = useRef();
  const polygonRefs = useRef([]);
  const [hoverTimer, setHoverTimer] = useState(null);
  const [showVisitorLabel, setShowVisitorlabel] = useState(null);
  const [visitedRunSheetData, setVisitedRunSheetData] = useState(false);
  const franchiseId = useSelector((state) => state?.auth?.franchiseId);
  const [showDrawer, setShowDrawer] = useState({
    open: '',
    data: {},
    activeIndex: 0,
  });
  /**
   * Most important, used to create/keep/remember track of currently selected polygon
   */
  const activePolygonIndex = useRef();
  const activeVisitorIndex = useRef();
  const showToolTipRef = useRef();
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries,
  });
  const markerRef = useRef({});
  /**
   * all the polygons that are shown on map are these
   */
  const [polygons, setPolygons] = useState([]);
  // const [actionPolygon, setActionPolygon] = useState({});
  const [filters, setFilters] = useState({
    sites: true,
    vehicles: false,
    franchises: false,
    boundry: true,
  });

  const [center, setCenter] = useState(defaultCenter);
  // const [showBoundry, setShowBoundry] = useState(true);
  const [zoom, setZoom] = useState(defaultMapZoom);

  const classes = useStyles();

  const indicatorColorsClass = {
    [TourShiftStatusEnum.NOT_STARTED]: classes.indicatorOrange,
    [TourShiftStatusEnum.IN_PROGRESS]: classes.indicatorBlue,
    [TourShiftStatusEnum.COMPLETED]: classes.indicatorGreen,
    [TourShiftStatusEnum.BEHIND_SCHEDULE]: classes.indicatorRed,
    [TourShiftStatusEnum.ON_SCHEDULE]: classes.indicatorBlue,
  };
  const [map, setMap] = useState(null);
  const [showLabel, setShowLabel] = useState(false);
  const onLoadMap = useCallback((map) => {
    mapRef.current = map;
  }, []);

  const onLoadPolygon = useCallback((polygon, index) => {
    polygonRefs.current[index] = polygon;
  }, []);

  const showSideDrawer = (value) => (data) => {
    setShowDrawer({ open: value, data: value ? data : null });
  };

  /**
   * @description set the current to uniqueId so that the polygon could * identified.
   * @param {*} polygon
   */
  const onClickPolygon = (polygon) => {
    activePolygonIndex.current = polygon?.uniqueId;
    /**
     * show label on click if polygon is of zone
     */
    if (polygon?.zoneArea) {
      setShowLabel(true);
    }
  };

  /**
   * @description Update show label and active item index value ref
   * @param {*} polygon
   * @param {*} boolean
   */
  const updateRunSheetIconsToolTip = (polygon = null, boolean) => {
    activePolygonIndex.current = polygon;
    setShowLabel(boolean);
  };

  const hideLabel = () => {
    setShowLabel(false);
    // updateLabelInfoOnHover(null, false);
    // setActiveMarkerIndex(null);
    activeVisitorIndex.current = null;
    activePolygonIndex.current = null;
    setShowVisitorlabel(false);
    setShowLabel(false);
    if (!visitedRunSheetData) {
      setOfficerDetails(null);
    }
  };

  /**
   * @description set the current to uniqueId so that the polygon could * identified.
   * @param {*} polygon
   */
  const onVisitorClick = (visitor, key) => {
    activeVisitorIndex.current = visitor?.[key];
    setShowVisitorlabel(!showVisitorLabel);
    getOfficerShiftDetails(visitor?.shift_id, visitor);
  };

  const handleMarkerHoverIn = (polygon, status) => {
    updateLabelInfo(polygon, status);
    showToolTipRef.current = true;
    setHoverTimer(null);
  };

  const getRunSheetData = async (runSheet, skipZoom = false) => {
    try {
      const data = (await getLiveTrackingRunSheetData(franchiseId, runSheet?.shiftActivityLogId))
        ?.data;
      console.log(data);
      setVisitedRunSheetData(data);
      const { location } = data[data?.length - 1];

      setShowSearch(true);
      setCenter({ lat: location?.lat, lng: location?.lng });
      if (!skipZoom) {
        smoothZoom(15, { lat: location?.lat, lng: location?.lng }); // call smoothZoom, parameters map, final zoomLevel, and starting zoom level
      }
    } catch (e) {
      setVisitedRunSheetData(null);
      toast.error(e.message, {
        position: 'top-right',
        autoClose: 2000,
      });
    }
  };
  const handleMarkerHoverOut = (polygon, boolean) => {
    const timerId = setTimeout(() => {
      if (!showToolTipRef.current) {
        updateLabelInfo(polygon, boolean);
      }
    }, 1500);
    setHoverTimer(timerId); // Store the timer ID
    showToolTipRef.current = false;
  };

  const handleInfoWindowHover = (polygon, status) => {
    clearTimeout(hoverTimer);
    setHoverTimer(null);
    showToolTipRef.current = true;
    updateLabelInfo(polygon, status);
  };

  const handleToolTipMouseOut = (polygon, status) => {
    updateLabelInfo(polygon, status);
    showToolTipRef.current = false;
    setHoverTimer(null); // Store the timer ID
  };

  /**
   * @description calculate the area of each polygon
   * @param {*} polygon
   * @returns
   */
  const calculateArea = (polygon) => {
    return turf.area(turf.multiPolygon([mapCoordinatesForTurf(polygon)])).toFixed(2);
  };

  /**
   * @description convert array of coordinates lat, long object to array of arrays
   * @param {*} input
   * @returns
   */
  const mapCoordinatesForTurf = (input) => {
    const coordinates = input?.coordinates ? input?.coordinates : [input];
    return coordinates?.map((data) => {
      return data?.map((coordinates) => [coordinates.lat, coordinates.lng]);
    });
  };

  /**
   * @description Calculate center of polygon
   */
  const calculateCenter = (polygon) => {
    const data = [mapCoordinatesForTurf(polygon)];
    const multiPolygon = turf.multiPolygon(data);
    return turf.centerOfMass(multiPolygon).geometry.coordinates;
  };

  /**
   * @description handle updates of polygon data when it is being dragged or edited.
   * @param {*} polygon
   * @param {*} index
   */
  /**
   * @description handle updates of polygon data when it is being dragged or edited.
   * @param {*} polygon
   * @param {*} index
   */
  const onEditPolygon = (polygon, index, skipCalculation = false) => {
    // let error = false;
    const polygonRef = polygonRefs.current[index];
    let coordinates = [];
    if (polygonRef) {
      const allPolygons = [...polygons];
      if (!skipCalculation) {
        coordinates = polygonRef
          .getPath()
          .getArray()
          .map((latLng) => ({ lat: latLng.lat(), lng: latLng.lng() }));
        /**
         * This updates the polygon label location, area and coordinates when it's updated
         */
        allPolygons[index].coordinates = coordinates;
        allPolygons[index].center = calculateCenter(coordinates);
        allPolygons[index].area = calculateArea(coordinates);
      } else {
        coordinates =
          allPolygons?.[index]?.coordinates && allPolygons?.[index]?.coordinates?.length
            ? allPolygons?.[index]?.coordinates
            : [];
        let calculatedCenter = coordinates?.length
          ? calculateCenter(coordinates?.[0]?.[0] ? coordinates?.[0] : coordinates)
          : allPolygons?.[index]?.markerLocation;
        let calculatedArea = coordinates?.length
          ? calculateArea(coordinates?.[0]?.[0] ? coordinates?.[0] : coordinates)
          : null;
        allPolygons[index].center = calculatedCenter;
        allPolygons[index].area = calculatedArea;
      }

      /**
       * update formData
       */
      setPolygons(allPolygons);
    }
  };

  /**
   * @description get key that would represent the marker Location prop of the polygon
   * @param {*} polygon
   * @returns
   */
  const getMarkerKey = (polygon) => {
    for (let key in polygon) {
      const data = polygonlocationTypes.find((item) => item == key);
      if (data) {
        return data;
      }
    }
    return null;
  };

  const goToSite = (id) => {
    history.push(`${OBX_SITES_DETAIL}/${id}`);
  };
  /**
   * @description Update show label and active item index value ref
   * @param {*} polygon
   * @param {*} boolean
   */
  const updateLabelInfo = (polygon = null, boolean) => {
    activePolygonIndex.current = polygon ? polygon?.uniqueId : null;
    setShowLabel(boolean);
    animationRef.current = false;
  };

  /**
   *
   * @param {*} polygon
   * @param {*} centerAreaKey
   * @param {*} labelKey
   * @param {*} i18Key
   * @param {*} optionType
   * @returns
   */
  const setObjectDetails = (
    polygon,
    centerAreaKey,
    labelKey,
    i18Key,
    optionType,
    isActionItem = false,
  ) => {
    let certainOption;
    const editables = { editable: false, draggable: false };
    switch (optionType) {
      case actionItemTypeKeys?.site:
        certainOption = {
          ...sitePolygonOptions,
          ...editables,
        };
        break;
      case actionItemTypeKeys?.zone:
        certainOption = {
          ...zonePolygonOptions,
          ...editables,
        };
        break;
      case actionItemTypeKeys?.franchise:
        certainOption = {
          ...franchisePolygonOptions,
          ...editables,
        };
        break;
      default:
        certainOption = {};
        break;
    }

    const markerLocation = getMarkerKey(polygon);
    return {
      ...polygon,
      label: polygon?.[labelKey] ? polygon?.[labelKey] : i18Key,
      center: centerAreaKey?.length ? calculateCenter(centerAreaKey) : null,
      area: centerAreaKey?.length ? calculateArea(centerAreaKey) : null,
      uniqueId: polygon?.uniqueId ? polygon?.uniqueId : generateUniqueId(),
      options: certainOption,
      markerLocation: markerLocation ? polygon?.[markerLocation] : null,
      [markerLocation]: markerLocation ? polygon?.[markerLocation] : null,
      isActionItem: isActionItem ? true : false,
      polyLineCoordinates: polygon?.coordinates?.length
        ? createPolylineCoordinates(polygon?.coordinates?.[0])
        : [],
    };
  };

  const goToFranchise = (data) => {
    history.push(`${HO_FRANCHISE_DETAIL}/${data?.id}`);
  };

  /**
   * @description calculate the ratio of distance on zoom change
   * @param {*} currentZoom
   * @returns
   */
  const calculateOffset = (currentZoom) => {
    const baseOffset = 8.0;
    const exponentialFactor = 0.95; // Adjust this value based on your preference

    return baseOffset / Math.pow(2, exponentialFactor * (currentZoom - 1));
  };

  function createPolylineCoordinates(coordinates) {
    const closedCoordinates = [...coordinates, coordinates[0]]; // Add the first coordinate to the end
    return closedCoordinates.map((coord) => ({ lat: coord.lat, lng: coord.lng }));
  }

  const smoothZoom = (targetZoom, center = null) => {
    if (center) {
      setCenter(center);
    }
    setZoom((prevZoom) => {
      if (prevZoom === targetZoom) {
        return prevZoom; // Stop recursion when target is reached
      }

      let newZoom = prevZoom < targetZoom ? prevZoom + 1 : prevZoom - 1; // Zoom in or out
      setTimeout(() => smoothZoom(targetZoom, center), 50); // Continue zooming after a delay
      return newZoom;
    });
  };
  /**
   * Get coordinates from API and add escape event listener
   */
  useEffect(() => {
    if (!isObjectEmpty(mapCenter)) {
      setCenter(mapCenter);
    } else {
      setCenter(defaultCenter);
    }

    let polygonArray = [];

    /**
     * draw franchises from the geoLocation API
     */
    if (franchiseData?.franchises?.length) {
      let updatedFranchises = franchiseData?.franchises?.map((franchise) =>
        setObjectDetails(
          franchise,
          franchise?.coordinates?.[0],
          'franchiseName',
          t('commonText.newFranchise'),
          actionItemTypeKeys?.franchise,
        ),
      );
      polygonArray = [...polygonArray, ...updatedFranchises];
    }

    if (franchiseData?.zones?.length > 0) {
      let updatedZones = franchiseData?.zones?.map((zone) => {
        return setObjectDetails(
          zone,
          zone?.coordinates?.[0],
          'name',
          t('commonText.newZone'),
          actionItemTypeKeys?.zone,
        );
      });
      polygonArray = [...polygonArray, ...updatedZones];
    }

    /**
     * If we have sites then draw on map ( We are dealing with zones and sites)
     */
    if (franchiseData?.sites?.length) {
      let updatedSites = franchiseData?.sites?.map((site) => {
        return setObjectDetails(
          site,
          site?.coordinates?.[0],
          'name',
          t('commonText.newSite'),
          actionItemTypeKeys?.site,
        );
      });
      polygonArray = [...polygonArray, ...updatedSites];
    }

    setPolygons(polygonArray);
  }, []);

  useEffect(() => {
    if (!isObjectEmpty(externalCenter)) {
      setCenter(externalCenter?.siteLocation || externalCenter?.franchiseLocation);
      animationRef.current = true;
    }
  }, [externalCenter]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (visitedRunSheetData && officerDetails) {
        getRunSheetData(officerDetails, true); // Assuming runSheet is defined or passed into the effect
      }
    }, 10000); // 10000 milliseconds = 10 seconds

    // Cleanup the interval on component unmount
    return () => clearInterval(intervalId);
  }, [officerDetails, visitedRunSheetData]);

  /**
   * Hide everything if there is no center
   */
  if (!center) {
    return null;
  }
  const finalVisitedRunSheetData = useMemo(() => {
    return (
      visitedRunSheetData &&
      visitedRunSheetData?.length &&
      visitedRunSheetData
        ?.map((data) => ({
          position: {
            lat: data?.location?.lat || data?.lat,
            lng: data?.location?.lng || data?.lng,
          },
          heading: data?.location?.heading || data?.heading,
        }))
        ?.filter((data) => (data?.position?.lat || data?.lat) && (data?.position?.lng || data?.lng))
    );
  }, [visitedRunSheetData]);

  const defaultRunSheetData = useMemo(() => {
    return officerDetails && mapRunSheetData(officerDetails?.runsheetDetails);
  }, [officerDetails]);

  const polylineStrokeOptions = { strokeColor: '#146eff', strokeWeight: 3.5 };
  console.log({
    officerDetails,
    defaultRunSheetData,
    finalVisitedRunSheetData,
    visitedRunSheetData,
  });
  return (
    isLoaded &&
    !isObjectEmpty(center) && (
      <>
        {!visitedRunSheetData && (
          <Box className={classes.rightMapSection}>
            <Button
              startIcon={filters?.sites ? <LocationIcon /> : <LocationIcon />}
              variant="primary"
              className={filters?.sites ? classes.boundaryBtnVehicle : classes.boundaryBtn}
              type="button"
              onClick={() => {
                setFilters((prev) => ({ ...prev, sites: !prev?.sites }));
              }}
            >
              {t('sideNavBar.linkText.sites')}
            </Button>

            <Button
              startIcon={filters?.boundry ? <RectangleWhiteIcon /> : <RectangleIcon />}
              variant="primary"
              className={filters?.boundry ? classes.boundaryBtnVehicle : classes.boundaryBtn}
              type="button"
              onClick={() => {
                setFilters((prev) => ({ ...prev, boundry: !prev?.boundry }));
              }}
            >
              {t('commonText.boundry')}
            </Button>
          </Box>
        )}
        {visitedRunSheetData ? (
          <Box
            className={classes.blueMapSection}
            onClick={() => {
              setVisitedRunSheetData(null);
              smoothZoom(10);
              setShowSearch(false);
            }}
          >
            <Box className={classes.internalBelowMapSections}>
              <Typography variant="subtitle3" className={classes.leadsMapRunSheetText}>
                {t('obx.runsheet.exitRunSheet')}
              </Typography>
            </Box>
          </Box>
        ) : (
          <Box className={classes.belowMapSection}>
            <Box className={classes.internalBelowMapSections}>
              <MapOrangeIcon />
              <Typography variant="subtitle3" className={classes.leadsMapText}>
                {t('sideNavBar.linkText.franchises')}
              </Typography>
            </Box>

            <Box className={classes.internalBelowMapSections}>
              <MapRedIcon />
              <Typography variant="subtitle3" className={classes.leadsMapText}>
                {t('sideNavBar.linkText.sites')}
              </Typography>
            </Box>
          </Box>
        )}
        <div className="map-container" style={{ position: 'relative', width: '100%' }}>
          <GoogleMap
            mapContainerClassName="directions-map"
            onClick={() => hideLabel()}
            options={{
              clickableIcons: false,
              streetViewControl: false,
              mapTypeControl: false,
              // zoomControl: false,
              fullscreenControl: false,
              styles: [
                {
                  featureType: 'poi',
                  elementType: 'labels.icon',
                  stylers: [{ visibility: 'off' }],
                },
                {
                  featureType: 'poi.park',
                  elementType: 'labels.icon',
                  stylers: [{ visibility: 'off' }],
                },
                // {
                //   featureType: 'all',
                //   elementType: 'labels.text',
                //   stylers: [{ visibility: 'off' }],
                // },
              ],
            }}
            zoom={zoom}
            center={center}
            onLoad={(map) => {
              onLoadMap();
              setMap(map);
            }}
            mapContainerStyle={containerStyle}
            onZoomChanged={() => {
              if (map) {
                setZoom(map.getZoom());
              }
            }}
            // onTilesLoaded={}
          >
            {!finalVisitedRunSheetData &&
              polygons?.length &&
              polygons?.map((polygon, index) => {
                const showPolygonLabel =
                  activePolygonIndex?.current === polygon?.uniqueId && showLabel;

                return (
                  <React.Fragment key={index}>
                    {filters?.boundry && (
                      <Polygon
                        key={polygon?.uniqueId || id}
                        onLoad={(event) => onLoadPolygon(event, index)}
                        onMouseDown={() => onClickPolygon(polygon)}
                        onMouseUp={() => onEditPolygon(polygon, index)}
                        onDragEnd={() => onEditPolygon(polygon, index)}
                        options={polygon?.options}
                        paths={polygon?.coordinates}
                        draggable={polygon?.draggable}
                        editable={polygon?.editable}
                      />
                    )}
                    {filters?.boundry && polygon?.polyLineCoordinates?.length && showPolyLines && (
                      <Polyline
                        key={index}
                        path={polygon?.polyLineCoordinates}
                        options={{
                          fillOpacity: 0,
                          strokeWeight: 0,
                          clickable: false,
                          editable: false,
                          zIndex: 1,
                          icons: [
                            {
                              icon: {
                                path: google.maps.SymbolPath.CIRCLE,
                                fillOpacity: 2,
                                fillColor: polygon?.backgroundColor
                                  ? polygon?.backgroundColor
                                  : '#FA9CE9',
                                strokeColor: polygon?.borderColor
                                  ? polygon?.borderColor
                                  : '#FA9CE9',
                                scale: 1,
                              },
                              offset: '0',
                              repeat: '6px',
                            },
                          ],
                        }}
                      />
                    )}
                    {polygon?.markerLocation && filters?.sites && polygon?.siteLocation && (
                      <Marker
                        key={polygon?.id}
                        onMouseOver={() => {
                          handleMarkerHoverIn(polygon, true);
                        }}
                        onMouseOut={() => {
                          handleMarkerHoverOut(polygon, false);
                        }}
                        onClick={() => {
                          onClickPolygon(polygon);
                          onEditPolygon(polygon, index, true);
                        }}
                        animation={
                          (JSON.stringify(polygon?.markerLocation) == JSON.stringify(mapCenter) ||
                            JSON.stringify(polygon?.markerLocation) ==
                              JSON.stringify(externalCenter.siteLocation) ||
                            JSON.stringify(polygon?.markerLocation) ==
                              JSON.stringify(externalCenter.franchiseLocation)) &&
                          externalCenter?.id == polygon?.id &&
                          animationRef.current
                            ? google.maps.Animation.BOUNCE
                            : null
                        }
                        position={polygon?.markerLocation}
                        icon={{
                          scaledSize: new google.maps.Size(26, 37),
                          url: actionItemTypeKeys.sitePin,
                        }}
                      ></Marker>
                    )}
                    {polygon?.markerLocation && polygon?.franchiseLocation && (
                      <Marker
                        onMouseOver={() => {
                          handleMarkerHoverIn(polygon, true);
                        }}
                        onMouseOut={() => {
                          handleMarkerHoverOut(polygon, false);
                        }}
                        onClick={() => {
                          onClickPolygon(polygon);
                          onEditPolygon(polygon, index, true);
                        }}
                        key={polygon?.id}
                        position={polygon?.markerLocation}
                        icon={{
                          scaledSize: new google.maps.Size(26, 37),
                          url: actionItemTypeKeys.franchisePin,
                        }}
                      ></Marker>
                    )}
                    {showPolygonLabel &&
                      (() => {
                        return (
                          <InfoWindow
                            className={classes.overflow}
                            position={
                              polygon?.markerLocation
                                ? {
                                    lat: polygon?.markerLocation.lat + calculateOffset(zoom),
                                    lng: polygon?.markerLocation.lng,
                                  }
                                : {
                                    lat: polygon?.center?.[0] + calculateOffset(zoom),
                                    lng: polygon?.center?.[1],
                                  }
                            }
                            options={{
                              pixelOffset: new window.google.maps.Size(0, -30),
                            }}
                          >
                            <Box
                              className={classes.toolTipWrapper}
                              onMouseOver={() => {
                                handleInfoWindowHover(polygon, true);
                              }}
                              onMouseOut={() => {
                                handleToolTipMouseOut(polygon, false);
                              }}
                            >
                              {polygon?.franchiseLocation && (
                                <Box className={classes.imageWrapper}>
                                  <img
                                    src={polygon?.image ? polygon?.image : MapImage}
                                    alt={polygon?.label}
                                    className={`${polygon?.image ? classes.roomImageTool : classes.roomImageT}`}
                                  />
                                </Box>
                              )}
                              {polygon?.siteLocation && (
                                <Box className={classes.imageWrapper}>
                                  <img
                                    src={
                                      polygon?.images?.length > 0
                                        ? polygon?.images?.[0]?.url
                                        : MapImage
                                    }
                                    alt={polygon?.label}
                                    className={`${
                                      polygon?.images?.length > 0 && polygon?.images?.[0]?.url
                                        ? classes.roomImageTool
                                        : classes.roomImageT
                                    }`}
                                  />
                                </Box>
                              )}
                              <Typography
                                id="modal-modal-title"
                                variant="subtitle2"
                                className={classes.industyName}
                              >
                                {polygon?.id} - {polygon?.label}
                              </Typography>
                              <Typography variant="body3">
                                {polygon?.franchiseAddresses && polygon?.franchiseAddresses[0]}
                                {polygon?.address && polygon?.address}
                              </Typography>
                              {/* <Box className={classes.borderDiv}>
                                <Typography variant="body3">08:00 AM - 09:00 AM</Typography>
                              </Box>
                              <Box className={classes.borderDiv}>
                                <Typography variant="body3">Assigned to:</Typography>
                                <Typography variant="body3">Augustus Waters</Typography>
                              </Box>
                              <Box className={classes.borderDiv}>
                                <Typography variant="body3">Progress:</Typography>
                                <Typography variant="body3">Behind schedule</Typography>
                              </Box> */}
                              {polygon?.area && (
                                <Typography
                                  id="modal-modal-title"
                                  variant="subtitle2"
                                  className={classes.industyDetail}
                                >
                                  {polygon?.area} {t('commonText.squareMeter')}
                                </Typography>
                              )}
                              {polygon?.franchiseLocation && (
                                <Box
                                  onClick={() => goToFranchise(polygon)}
                                  className={classes.viewDetailButton}
                                >
                                  {t('commonText.viewDetails')}
                                </Box>
                              )}
                              {polygon?.siteLocation &&
                                userRole.slug === rolesEnum.franchiseOwner && (
                                  <Box
                                    onClick={() => goToSite(polygon?.id)}
                                    className={classes.viewDetailButton}
                                  >
                                    {t('commonText.viewDetails')}
                                  </Box>
                                )}
                            </Box>
                          </InfoWindow>
                        );
                      })()}
                  </React.Fragment>
                );
              })}

            {!finalVisitedRunSheetData &&
              visitors?.length &&
              visitors.map((visitor, index) => {
                const showVisitorLabelData =
                  activeVisitorIndex?.current == visitor?.officer_id && showVisitorLabel;
                const icon =
                  visitor?.job_type === 'patrol'
                    ? runSheetIcons.runsheetCarIcon
                    : runSheetIcons.runSheetDedicatedOfficer;
                return (
                  <React.Fragment key={index}>
                    <Marker
                      onMouseOver={() => {
                        // handleMarkerHoverIn(polygon, true);
                      }}
                      onMouseOut={() => {
                        // handleMarkerHoverOut(polygon, false);
                      }}
                      onClick={() => {
                        setCenter(visitor?.location);
                        onVisitorClick(visitor, 'officer_id');
                      }}
                      key={visitor?.id}
                      position={visitor?.location}
                      icon={{
                        scaledSize: new google.maps.Size(26, 37),
                        url: icon,
                      }}
                    ></Marker>
                    {showVisitorLabelData &&
                      (() => {
                        return (
                          <InfoWindow
                            onCloseClick={() => {
                              setShowVisitorlabel(false);
                              activeVisitorIndex.current = false;
                            }}
                            className={classes.overflow}
                            position={
                              visitor?.location
                                ? {
                                    lat: visitor?.location.lat + calculateOffset(zoom),
                                    lng: visitor?.location.lng,
                                  }
                                : {
                                    lat: visitor?.location?.[0] + calculateOffset(zoom),
                                    lng: visitor?.location?.[1],
                                  }
                            }
                            options={{
                              pixelOffset: new window.google.maps.Size(0, -30),
                            }}
                          >
                            <Box
                              className={classes.officerTooltipWrapper}
                              onMouseOver={() => {
                                // handleInfoWindowHover(polygon, true);
                              }}
                              onMouseOut={() => {
                                // handleToolTipMouseOut(polygon, false);
                              }}
                            >
                              {officerLoading ? (
                                <Box>
                                  <Box className={classes.officerTooltipHeader}>
                                    <Skeleton variant="text" height={'30px'} />
                                    <Skeleton variant="text" height={'20px'} />
                                  </Box>
                                  <Box className={classes.officerDetailsWrapper}>
                                    <Box className={classes.officerProfile}>
                                      <Skeleton
                                        variant="rectangular"
                                        height={'40px'}
                                        width={'40px'}
                                        className={classes.officerImage}
                                      />
                                    </Box>
                                    <Box className={classes.officerProfileDetails}>
                                      <Box className={classes.officerName}>
                                        <Skeleton variant="text" height={'20px'} width={70} />
                                        <Box display="flex" alignItems="center">
                                          <Skeleton variant="text" height={'20px'} width={70} />
                                        </Box>
                                      </Box>
                                      <Box className={classes.officerProgressWrapper}>
                                        <Skeleton variant="text" height={'15px'} />
                                        <Skeleton variant="text" height={'20px'} />
                                        <Box className={classes.progressStatus}>
                                          <Skeleton variant="text" height={'20px'} width={80} />
                                          <Skeleton variant="text" height={'20px'} width={80} />
                                        </Box>
                                      </Box>
                                    </Box>
                                  </Box>
                                  <Box className={classes.officerFooter}>
                                    <Box className={classes.viewDetail}>
                                      <Skeleton variant="text" height={'20px'} width={60} />
                                    </Box>
                                  </Box>
                                  <Typography
                                    id="modal-modal-title"
                                    variant="subtitle2"
                                    className={classes.industyName}
                                  >
                                    {visitor?.id}
                                  </Typography>
                                  <Typography variant="body3">{visitor.id}</Typography>
                                </Box>
                              ) : (
                                <Box>
                                  <Box className={classes.officerTooltipHeader}>
                                    <Box className={classes.tooltipSpace}>
                                      <Typography
                                        onClick={() => goToSite(officerDetails?.site?.id)}
                                        variant="h4"
                                        className={classes.runSheetName}
                                      >
                                        {officerDetails?.site?.name}

                                        <ArrowLeftIcon className={classes.runSheetNameIcon} />
                                      </Typography>
                                      <Typography
                                        onClick={() => {
                                          history.push(
                                            `${OBX_RUNSHEET}/details/${officerDetails?.runsheetDetails?.patrolTemplateId}`,
                                          );
                                        }}
                                        variant="body1"
                                        className={classes.runSheetName}
                                      >
                                        {officerDetails?.runsheetDetails?.runsheetName}{' '}
                                        <ArrowLeftIcon className={classes.runSheetNameIcon} />
                                      </Typography>
                                      <Box>
                                        {' '}
                                        <Box
                                          onClick={() =>
                                            setShowDrawer({
                                              open: DRAWER_TYPE.DETAIL,
                                              data: officerDetails,
                                              activeIndex: 0,
                                            })
                                          }
                                          className={classes.viewDetail}
                                        >
                                          {' '}
                                          {t('obx.runsheet.viewShiftDetails')} <ArrowLeftIcon />
                                        </Box>
                                      </Box>
                                    </Box>
                                    <Typography
                                      variant="body2"
                                      className={classes.officerIndustyName}
                                    >
                                      {officerDetails?.customShiftType === 'patrol' && (
                                        <>
                                          {officerDetails?.vehicle?.regNo + ' • '}
                                          {t('obx.runsheet.serviceTime')}{' '}
                                          {getHoursDiff24HourFormat(
                                            officerDetails?.runsheetDetails?.startsAt,
                                            officerDetails?.runsheetDetails?.endsAt,
                                          ).toFixed(2) + ' Hours'}
                                        </>
                                      )}

                                      {/*                                           
                                      {t('commonText.estCompeletionTime')}:{' '}
                                      {officerDetails?.endsAt
                                        ? calculateRemainingTime(officerDetails?.endsAt, t)
                                        : t('commonText.nA')} */}
                                    </Typography>
                                  </Box>
                                  {/* profile detail? */}
                                  <Box className={classes.officerDetailsWrapper}>
                                    <Box className={classes.officerProfile}>
                                      <img
                                        src={
                                          officerDetails?.officer?.imageUrl ||
                                          visitor?.image_url ||
                                          OfficerImage
                                        }
                                        className={classes.officerImage}
                                      />
                                    </Box>
                                    <Box className={classes.officerProfileDetails}>
                                      <Box className={classes.officerName}>
                                        <Typography
                                          variant="h4"
                                          className={classes.officersSiteName}
                                        >
                                          {officerDetails?.officer?.name || ''}
                                        </Typography>
                                      </Box>
                                      {/* //progressWrapper */}
                                      <Box className={classes.officerProgressWrapper}>
                                        <Typography
                                          variant="body2"
                                          className={classes.officerIndustyName}
                                        >
                                          {officerDetails?.customShiftType === 'patrol' ? (
                                            <>
                                              🚗 {DUTY_TYPES?.[officerDetails?.shiftType] || ''} •{' '}
                                              {dayjsWithStandardOffset(
                                                officerDetails?.runsheetDetails?.startsAt,
                                              ).format('h:mm A')}{' '}
                                              -{' '}
                                              {dayjsWithStandardOffset(
                                                officerDetails?.runsheetDetails?.endsAt,
                                              ).format('h:mm A')}
                                            </>
                                          ) : (
                                            <>
                                              👮🏻‍ {DUTY_TYPES?.[officerDetails?.shiftType] || ''} •{' '}
                                              {dayjsWithStandardOffset(
                                                officerDetails?.startsAt,
                                              ).format('h:mm A')}{' '}
                                              -{' '}
                                              {dayjsWithStandardOffset(
                                                officerDetails?.endsAt,
                                              ).format('h:mm A')}
                                            </>
                                          )}
                                        </Typography>
                                        <BorderLinearProgress
                                          variant="determinate"
                                          value={
                                            officerDetails?.totalTours || officerDetails?.totalHits
                                              ? ((officerDetails?.completedTours ||
                                                  officerDetails?.visitedHits) /
                                                  (officerDetails?.totalTours ||
                                                    officerDetails?.totalHits)) *
                                                100
                                              : 0
                                          }
                                          status={officerDetails?.customShiftStatusKey}
                                        />
                                        <Box className={classes.progressStatus}>
                                          <Typography
                                            variant="subtitle2"
                                            className={`${classes.progressPrimary} ${
                                              indicatorColorsClass[
                                                officerDetails?.customShiftStatusKey
                                              ]
                                            }`}
                                          >
                                            {
                                              StatusValues(t)?.[
                                                officerDetails?.customShiftStatusKey
                                              ]
                                            }
                                          </Typography>
                                          <Typography
                                            variant="subtitle2"
                                            className={classes.officersSiteName}
                                          >
                                            {officerDetails?.completedTours ||
                                              officerDetails?.visitedHits ||
                                              '0'}{' '}
                                            /
                                            {officerDetails?.totalTours ||
                                              officerDetails?.totalHits}{' '}
                                            {officerDetails?.customShiftType === 'patrol'
                                              ? t('obx.commonText.hits')
                                              : t('obx.commonText.tours')}{' '}
                                            {}
                                          </Typography>
                                        </Box>
                                      </Box>
                                    </Box>
                                  </Box>
                                  <Box className={classes.officerFooter}>
                                    {officerDetails?.customShiftType === 'patrol' && (
                                      //   <Box
                                      //     onClick={() => {
                                      //       history.push(
                                      //         `${OBX_SITES_DETAIL}/${officerDetails?.siteId}`,
                                      //       );
                                      //     }}
                                      //     className={classes.viewDetail}
                                      //   >
                                      //     {t('commonText.viewDetails')}
                                      //     <ArrowLeftIcon />
                                      //   </Box>
                                      // ) : (
                                      <Box>
                                        {' '}
                                        <Box
                                          onClick={() => {
                                            {
                                              getRunSheetData(officerDetails);
                                            }
                                          }}
                                          className={classes.viewDetail}
                                        >
                                          {t('obx.runsheet.viewRunSheet')} <ArrowLeftIcon />
                                        </Box>
                                      </Box>
                                    )}
                                  </Box>
                                  <Typography
                                    id="modal-modal-title"
                                    variant="subtitle2"
                                    className={classes.industyName}
                                  >
                                    {visitor?.id}
                                  </Typography>
                                  <Typography variant="body3">{visitor.id}</Typography>
                                </Box>
                              )}
                            </Box>
                          </InfoWindow>
                        );
                      })()}
                  </React.Fragment>
                );
              })}
            {/** JSX when runSheet is being viewed */}
            {finalVisitedRunSheetData?.length && (
              <React.Fragment>
                <Polyline
                  options={visitedPolyline}
                  path={finalVisitedRunSheetData?.map((data) => data?.position)}
                />
                <Marker
                  position={finalVisitedRunSheetData[finalVisitedRunSheetData.length - 1]?.position}
                  icon={{
                    scaledSize: new google.maps.Size(26, 37),
                    url: runSheetIcons.runsheetCarIcon,
                    rotation:
                      finalVisitedRunSheetData[finalVisitedRunSheetData.length - 1]?.heading,
                  }}
                />
                <React.Fragment>
                  {defaultRunSheetData?.pathData.map((line, index) => {
                    const marker = line?.uniqueId ? line : { ...line?.data, ...line };
                    if (marker?.siteId && !markerRef.current?.[marker?.siteId]) {
                      markerRef.current = { ...markerRef.current, [marker?.siteId]: index };
                    }

                    let polyLineOptions = polylineStrokeOptions;
                    let icon =
                      index === 0
                        ? runSheetIcons?.startEndLocationIconBlack
                        : // : defaultRunSheetData?.pathData[index]?.isVisited
                          (index === line.length - 1 && defaultRunSheetData?.isVisited) ||
                            (index !== line.length - 1 &&
                              defaultRunSheetData?.pathData[index]?.isVisited)
                          ? runSheetIcons.runSheetPatrolGreenIcon
                          : runSheetIcons.runsheetMapBluePointerIconForDirectionsServiceRes;

                    return (
                      <React.Fragment key={line?._id || line?.hitId || index}>
                        <Polyline options={polyLineOptions} path={line?.mapPath || line} />
                        {icon && (
                          <Marker
                            onClick={() => line?.uniqueId && updateRunSheetIconsToolTip(line, true)}
                            position={line?.start_location || line?.position || line?.[0]}
                            icon={icon}
                            label={{
                              text:
                                line?.uniqueId &&
                                !line?.isStartEnd &&
                                index &&
                                markerRef?.current?.[line?.siteId] === index
                                  ? `${index}`
                                  : null,

                              color: 'white',
                            }}
                          />
                        )}

                        {showLabel &&
                          activePolygonIndex.current?.uniqueId === line?.uniqueId &&
                          (() => {
                            const multipleHits = defaultRunSheetData?.pathData?.filter(
                              (data) => data.siteId === line?.siteId && !data?.isStartEnd,
                            );

                            return (
                              <InfoWindow
                                onCloseClick={() => {
                                  setShowLabel(false);
                                  // updateLabelInfoOnHover(null, false);
                                  activePolygonIndex.current = null;
                                }}
                                position={
                                  activePolygonIndex?.current?.position ||
                                  activePolygonIndex?.current?.start_location || {
                                    lat: line?.lat,
                                    lng: line?.lng,
                                  } ||
                                  line?.start_location ||
                                  line?.position
                                }
                                options={{
                                  pixelOffset: new window.google.maps.Size(0, -30),
                                }}
                              >
                                <Box
                                  sx={{ background: 'white' }}
                                  className={classes.mainToolTipBoxs}
                                >
                                  {/* {marker?.siteImage && ( */}
                                  <img
                                    src={marker?.siteImage || runSheetIcons?.sitePlaceholder}
                                    alt="room image"
                                    className={classes.roomImageTool}
                                  />
                                  {/* )} */}
                                  <Box className={classes.nameWrap}>
                                    <Typography
                                      variant="h6"
                                      className={classes.contactInformationName}
                                    >
                                      {marker?.siteName || marker?.name}
                                    </Typography>
                                    {marker?.siteId && (
                                      <Box
                                        className={classes.gotoNextIcon}
                                        onClick={() => {
                                          history.push(`${OBX_SITES_DETAIL}/${marker?.siteId}`);
                                        }}
                                      >
                                        <GoToNextIcon />
                                      </Box>
                                    )}
                                  </Box>
                                  {marker?.siteAddress && (
                                    <Box className={classes.iconWrraper}>
                                      <LocationIcon />
                                      <Typography variant="body3" className={classes.addressName}>
                                        {marker?.siteAddress}
                                      </Typography>
                                    </Box>
                                  )}
                                  <Box className={classes.hitWrapperMain}>
                                    {multipleHits?.length > 1 &&
                                      !index !== 0 &&
                                      multipleHits?.map((data, index) => {
                                        return (
                                          <Box key={index} className={classes.hitWrapper}>
                                            <Typography
                                              variant="subtitle3"
                                              className={classes.addressName}
                                            >
                                              Hit {index + 1}
                                            </Typography>

                                            <Typography
                                              variant="overline"
                                              className={classes.hitTime}
                                            >
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
              </React.Fragment>
            )}
          </GoogleMap>
          {showDrawer?.open && (
            <ShiftDetail
              {...{
                isOpen: showDrawer?.open === DRAWER_TYPE.DETAIL,
                drawerData: {
                  shiftId: showDrawer?.data?.runsheetDetails?.patrolTemplateId
                    ? showDrawer?.data?.runsheetDetails?.patrolTemplateId
                    : showDrawer?.data?.id,
                  shiftType: showDrawer?.data?.customShiftType,
                  shiftDate: showDrawer?.data?.runsheetDetails?.startsAt
                    ? showDrawer?.data?.runsheetDetails?.startsAt
                    : showDrawer?.data?.startsAt,
                  startsAt: showDrawer?.data?.runsheetDetails?.startsAt
                    ? showDrawer?.data?.runsheetDetails?.startsAt
                    : showDrawer?.data?.startsAt,
                  endsAt: showDrawer?.data?.runsheetDetails?.endsAt
                    ? showDrawer?.data?.runsheetDetails?.endsAt
                    : showDrawer?.data?.endsAt,
                  runsheetId: showDrawer?.data?.runsheetDetails?.patrolTemplateId || null,
                  shiftActivityLogId: showDrawer?.data?.shiftActivityLogId || null,
                  rest: showDrawer.data,
                },
                activeIndex: 0,
                closeDrawer: showSideDrawer(''),
                setShowDrawer,
                setAllDuties: () => {},
                getAllDuties: () => {},
              }}
            />
          )}
        </div>
      </>
    )
  );
};

CommonSignalMap.propTypes = {
  /**
   * whether we are creating or updating a polygon
   */
  createOrUpdate: PropTypes.bool.isRequired,
  mapCenter: PropTypes.shape({
    lat: PropTypes.any,
    lng: PropTypes.any,
  }),
  setOfficerDetails: PropTypes.func,
  visitors: PropTypes.array,
  setShowSearch: PropTypes.func,
  franchiseData: PropTypes.array.isRequired,
  showPolyLines: PropTypes.bool,
  externalCenter: PropTypes.object,
  officerDetails: PropTypes.object,
  getOfficerShiftDetails: PropTypes.func,
  officerLoading: PropTypes.bool,
};

export default CommonSignalMap;
