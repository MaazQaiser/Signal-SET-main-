import { Box } from '@mui/material';
import React, { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { persistor } from 'redux/store/index';
import { setSelectedCountry } from 'src/redux/store/slices/regionalCountryConfiguration';

import CountrySelector from '../countrySelect';
import { useStyles } from './style';

export const GlobalCountrySelect = () => {
  const dispatch = useDispatch();
  const classes = useStyles();

  const { configurations, selectedCountry } = useSelector(
    (state) => state.regionalCountryConfiguration,
  );

  const countryCodes = useMemo(() => {
    if (!configurations) return [];
    return configurations.map((config) => config?.country?.value).filter(Boolean);
  }, [configurations]);

  const handleSelect = async (countryCode) => {
    const countryConfig = configurations.find((config) => config?.country?.value === countryCode);
    if (countryConfig) {
      dispatch(setSelectedCountry(countryConfig));
      await persistor.flush();
      window.location.reload();
    }
  };

  if (!configurations || configurations.length === 0) {
    return null;
  }

  return (
    <Box className={classes.globalCountrySelect}>
      <CountrySelector
        data={selectedCountry?.country?.value}
        countryCodes={countryCodes}
        updateFormHandler={handleSelect}
        searchable={true}
        className={classes.countrySelector}
      />
    </Box>
  );
};
