import { configureStore } from '@reduxjs/toolkit';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import regionalCountryConfigurationReducer from 'src/redux/store/slices/regionalCountryConfiguration';

import { GlobalCountrySelect } from './index';

// Mock the CountrySelector component
jest.mock('../countrySelect', () => ({
  __esModule: true,
  default: ({ data, countryCodes, updateFormHandler, searchable, className }) => (
    <div data-testid="country-selector" className={className}>
      <select
        data-testid="country-select"
        value={data || ''}
        onChange={(e) => updateFormHandler(e.target.value)}
      >
        <option value="">Select Country</option>
        {countryCodes.map((code) => (
          <option key={code} value={code}>
            {code}
          </option>
        ))}
      </select>
      <span data-testid="searchable">{searchable ? 'searchable' : 'not-searchable'}</span>
    </div>
  ),
}));

// Mock window.location.reload
delete window.location;
window.location = { reload: jest.fn() };

describe('GlobalCountrySelect Component', () => {
  const mockConfigurations = [
    {
      id: 1,
      country: { label: 'United States', value: 'US' },
      currency: { symbol: '$', label: 'USD' },
      dateFormat: { label: 'MM/DD/YYYY' },
      distanceUnit: { label: 'Miles' },
      timeFormat: { label: '12h' },
      timePrecision: { label: 'Minutes' },
    },
    {
      id: 2,
      country: { label: 'Canada', value: 'CA' },
      currency: { symbol: '$', label: 'CAD' },
      dateFormat: { label: 'DD/MM/YYYY' },
      distanceUnit: { label: 'Kilometers' },
      timeFormat: { label: '24h' },
      timePrecision: { label: 'Minutes' },
    },
    {
      id: 3,
      country: { label: 'United Kingdom', value: 'GB' },
      currency: { symbol: '£', label: 'GBP' },
      dateFormat: { label: 'DD/MM/YYYY' },
      distanceUnit: { label: 'Miles' },
      timeFormat: { label: '24h' },
      timePrecision: { label: 'Minutes' },
    },
  ];

  const createMockStore = (initialState) => {
    return configureStore({
      reducer: {
        regionalCountryConfiguration: regionalCountryConfigurationReducer,
      },
      preloadedState: {
        regionalCountryConfiguration: initialState,
      },
    });
  };

  const renderWithStore = (store) => {
    return render(
      <Provider store={store}>
        <GlobalCountrySelect />
      </Provider>,
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the country selector when configurations are available', () => {
      const store = createMockStore({
        configurations: mockConfigurations,
        selectedCountry: mockConfigurations[0],
      });

      renderWithStore(store);

      expect(screen.getByTestId('country-selector')).toBeInTheDocument();
      expect(screen.getByTestId('country-select')).toBeInTheDocument();
    });

    it('should not render when configurations array is empty', () => {
      const store = createMockStore({
        configurations: [],
        selectedCountry: null,
      });

      const { container } = renderWithStore(store);

      expect(container.firstChild).toBeNull();
    });

    it('should not render when configurations is null', () => {
      const store = createMockStore({
        configurations: null,
        selectedCountry: null,
      });

      const { container } = renderWithStore(store);

      expect(container.firstChild).toBeNull();
    });

    it('should display the selected country value', () => {
      const store = createMockStore({
        configurations: mockConfigurations,
        selectedCountry: mockConfigurations[0],
      });

      renderWithStore(store);

      const select = screen.getByTestId('country-select');
      expect(select.value).toBe('US');
    });

    it('should pass searchable prop as true to CountrySelector', () => {
      const store = createMockStore({
        configurations: mockConfigurations,
        selectedCountry: mockConfigurations[0],
      });

      renderWithStore(store);

      expect(screen.getByTestId('searchable')).toHaveTextContent('searchable');
    });
  });

  describe('Country Codes', () => {
    it('should extract and pass correct country codes to CountrySelector', () => {
      const store = createMockStore({
        configurations: mockConfigurations,
        selectedCountry: mockConfigurations[0],
      });

      renderWithStore(store);

      const select = screen.getByTestId('country-select');
      const options = Array.from(select.options)
        .map((opt) => opt.value)
        .filter(Boolean);

      expect(options).toEqual(['US', 'CA', 'GB']);
    });

    it('should filter out configurations with missing country values', () => {
      const configurationsWithNull = [
        ...mockConfigurations,
        {
          id: 4,
          country: { label: 'Invalid', value: null },
          currency: { symbol: '$', label: 'USD' },
        },
      ];

      const store = createMockStore({
        configurations: configurationsWithNull,
        selectedCountry: mockConfigurations[0],
      });

      renderWithStore(store);

      const select = screen.getByTestId('country-select');
      const options = Array.from(select.options)
        .map((opt) => opt.value)
        .filter(Boolean);

      expect(options).toEqual(['US', 'CA', 'GB']);
      expect(options).not.toContain(null);
    });
  });

  describe('Country Selection', () => {
    it('should dispatch setSelectedCountry action when a country is selected', () => {
      const store = createMockStore({
        configurations: mockConfigurations,
        selectedCountry: mockConfigurations[0],
      });

      renderWithStore(store);

      const select = screen.getByTestId('country-select');
      fireEvent.change(select, { target: { value: 'CA' } });

      const state = store.getState();
      expect(state.regionalCountryConfiguration.selectedCountry).toEqual(mockConfigurations[1]);
    });

    it('should reload the page after selecting a country', () => {
      const store = createMockStore({
        configurations: mockConfigurations,
        selectedCountry: mockConfigurations[0],
      });

      renderWithStore(store);

      const select = screen.getByTestId('country-select');
      fireEvent.change(select, { target: { value: 'GB' } });

      expect(window.location.reload).toHaveBeenCalledTimes(1);
    });

    it('should not dispatch action if selected country code is not found in configurations', () => {
      const store = createMockStore({
        configurations: mockConfigurations,
        selectedCountry: mockConfigurations[0],
      });

      const initialState = store.getState();
      renderWithStore(store);

      const select = screen.getByTestId('country-select');
      fireEvent.change(select, { target: { value: 'INVALID' } });

      const newState = store.getState();
      expect(newState.regionalCountryConfiguration.selectedCountry).toEqual(
        initialState.regionalCountryConfiguration.selectedCountry,
      );
      expect(window.location.reload).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle configurations with undefined country objects', () => {
      const configurationsWithUndefined = [
        mockConfigurations[0],
        {
          id: 5,
          country: undefined,
          currency: { symbol: '$', label: 'USD' },
        },
      ];

      const store = createMockStore({
        configurations: configurationsWithUndefined,
        selectedCountry: mockConfigurations[0],
      });

      renderWithStore(store);

      const select = screen.getByTestId('country-select');
      const options = Array.from(select.options)
        .map((opt) => opt.value)
        .filter(Boolean);

      expect(options).toEqual(['US']);
    });

    it('should handle when selectedCountry is null', () => {
      const store = createMockStore({
        configurations: mockConfigurations,
        selectedCountry: null,
      });

      renderWithStore(store);

      const select = screen.getByTestId('country-select');
      expect(select.value).toBe('');
    });

    it('should handle single configuration', () => {
      const store = createMockStore({
        configurations: [mockConfigurations[0]],
        selectedCountry: mockConfigurations[0],
      });

      renderWithStore(store);

      expect(screen.getByTestId('country-selector')).toBeInTheDocument();
      const select = screen.getByTestId('country-select');
      const options = Array.from(select.options)
        .map((opt) => opt.value)
        .filter(Boolean);

      expect(options).toEqual(['US']);
    });
  });

  describe('CSS Classes', () => {
    it('should apply CSS classes to the component', () => {
      const store = createMockStore({
        configurations: mockConfigurations,
        selectedCountry: mockConfigurations[0],
      });

      renderWithStore(store);

      const selector = screen.getByTestId('country-selector');
      // Check that the component has a className attribute (MUI generates hashed class names)
      expect(selector).toHaveAttribute('class');
      expect(selector.className).toBeTruthy();
    });
  });
});
