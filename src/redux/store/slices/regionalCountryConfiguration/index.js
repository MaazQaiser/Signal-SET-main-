import { createSelector, createSlice } from '@reduxjs/toolkit';

const DEFAULT_DISPLAY_CONFIG = {
  symbol: '$',
  currencyCode: 'USD',
  dateFormat: 'MM/DD/YYYY',
  distanceUnit: 'Miles',
  timeFormat: '12h',
  timePrecision: 'hh:mm',
  timePrecisionLabel: 'Minutes',
  country: 'United States',
  countryCode: 'US',
};

const initialState = {
  configurations: [],
  selectedCountry: null,
};

const regionalCountryConfigurationSlice = createSlice({
  name: 'regionalCountryConfiguration',
  initialState,
  reducers: {
    setConfigurations(state, action) {
      state.configurations = action.payload;
      if (action.payload.length > 0 && !state.selectedCountry) {
        state.selectedCountry = action.payload[0];
      }
    },
    setSelectedCountry(state, action) {
      state.selectedCountry = action.payload;
    },
  },
});

export const { setConfigurations, setSelectedCountry } = regionalCountryConfigurationSlice.actions;

export const getSelectedCountry = (state) => state.regionalCountryConfiguration.selectedCountry;

export const getDisplayConfiguration = createSelector([getSelectedCountry], (config) => ({
  symbol: config?.currency?.symbol ?? DEFAULT_DISPLAY_CONFIG.symbol,
  currencyCode:
    config?.currency?.abbr ?? config?.currency?.label ?? DEFAULT_DISPLAY_CONFIG.currencyCode,
  dateFormat: config?.dateFormat?.label ?? DEFAULT_DISPLAY_CONFIG.dateFormat,
  distanceUnit: config?.distanceUnit?.label ?? DEFAULT_DISPLAY_CONFIG.distanceUnit,
  timeFormat: config?.timeFormat?.label ?? DEFAULT_DISPLAY_CONFIG.timeFormat,
  timePrecision: config?.timePrecision?.format ?? DEFAULT_DISPLAY_CONFIG.timePrecision,
  timePrecisionLabel: config?.timePrecision?.label ?? DEFAULT_DISPLAY_CONFIG.timePrecisionLabel,
  country: config?.country?.label ?? DEFAULT_DISPLAY_CONFIG.country,
  countryCode: config?.country?.value ?? DEFAULT_DISPLAY_CONFIG.countryCode,
}));

export default regionalCountryConfigurationSlice.reducer;
