// /*global google*/
import { Box, Typography } from '@mui/material';
import { GoogleMap, InfoWindow, Marker, Polyline, useJsApiLoader } from '@react-google-maps/api';
import { ReactComponent as NoMapIcon } from 'assets/svg/NoMapIcon.svg';
import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { googleMapStyles } from 'src/utils/constants';

import { useStyles } from './dispatchMap';

const containerStyle = {
  width: '100%',
  height: '100%',
};

const defaultCenter = {
  lat: 40.7128,
  lng: -74.006,
};

const libraries = ['places', 'drawing', 'geometry'];

const DEFAULT_POLYLINE_OPTION = { strokeColor: '#75C4FF', strokeWeight: 2 };
const SELECTED_POLYLINE_OPTION = { strokeColor: '#146eff', strokeWeight: 4 };

const DispatchDirectionsMap = ({
  polygons,
  markers,
  center,
  selectedUniqueId,
  markerInfoWindow,
  polygonInfoWindow,
  mapPlaceholder,
  containerClassName,
  hideMap,
}) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const map = useRef(null);

  const [markerModal, setMarkerModal] = useState();
  const [polygonModal, setPolygonModal] = useState();

  const handleMapLoad = (mapInstance) => {
    map.current = mapInstance;
  };

  const moveTo = (position) => {
    if (!position?.lat) return;
    map?.current?.panTo(position);
  };

  const hidePopups = () => {
    setMarkerModal();
    setPolygonModal();
  };

  useEffect(() => {
    center && moveTo(center);
  }, [center]);

  const MarkerInforWindow = markerInfoWindow;
  const PolygonInfoWindow = polygonInfoWindow;

  return (
    isLoaded && (
      <GoogleMap
        options={{
          clickableIcons: false,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
          styles: googleMapStyles,
          fullscreenControlOptions: false,
        }}
        mapContainerStyle={containerStyle}
        center={defaultCenter}
        zoom={10}
        onLoad={handleMapLoad}
        mapContainerClassName={containerClassName}
        onClick={() => hidePopups()}
      >
        {markers.map((marker, index) => {
          return (
            <Marker
              key={index}
              position={marker?.position}
              icon={marker?.data?.uniqueId === selectedUniqueId ? marker.selectedIcon : marker.icon}
              onClick={() => setMarkerModal(marker)}
            />
          );
        })}

        {polygons?.length > 0 && (
          <React.Fragment>
            {polygons.map((polygon, index) => {
              return polygon?.lines?.map((line, i) => {
                return (
                  <Polyline
                    key={`ployline-${index}-${i}`}
                    options={
                      polygon?.data?.uniqueId === selectedUniqueId
                        ? SELECTED_POLYLINE_OPTION
                        : DEFAULT_POLYLINE_OPTION
                    }
                    path={line?.mapPath}
                    onClick={() => setPolygonModal(polygon)}
                  />
                );
              });
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

        {markerModal && MarkerInforWindow && (
          <InfoWindow position={markerModal.position}>
            <MarkerInforWindow data={markerModal} />
          </InfoWindow>
        )}
        {polygonModal && PolygonInfoWindow && (
          <InfoWindow position={polygonModal.position}>
            <PolygonInfoWindow data={polygonModal} />
          </InfoWindow>
        )}
      </GoogleMap>
    )
  );
};

DispatchDirectionsMap.propTypes = {
  center: PropTypes.object,
  polygons: PropTypes.array,
  markers: PropTypes.array,
  selectedUniqueId: PropTypes.string,
  hideMap: PropTypes.bool,
  mapPlaceholder: PropTypes.string,
  containerClassName: PropTypes.string,
  polygonInfoWindow: PropTypes.node,
  markerInfoWindow: PropTypes.node,
};

DispatchDirectionsMap.defaultProps = {
  origin: {},
  setCoordinates: () => {},
  destination: {},
  polygons: [],
  markers: [],
  mapPlaceholder: '',
  selectedUniqueId: '',
};

export default DispatchDirectionsMap;
