import { createTheme, ThemeProvider } from '@mui/material/styles';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

// Mock RenderIfHasPermission so we don't load Redux store (avoids reducer shape errors)
jest.mock('src/hoc/renderIfHasPermission.jsx', () => ({
  __esModule: true,
  default: ({ children }) => <>{children}</>,
}));

import RegionalConfigurationForm from './index';

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
  }),
}));

const renderWithTheme = (component) => {
  const theme = createTheme();
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

// Mock dependencies
jest.mock('src/app/components/common/countrySelect', () => ({
  __esModule: true,
  default: ({ data, updateFormHandler, disabled }) => (
    <select
      data-testid="country-selector"
      value={data || ''}
      onChange={(e) => updateFormHandler(e.target.value)}
      disabled={disabled}
    >
      <option value="">Select Country</option>
      <option value="US">United States</option>
      <option value="CA">Canada</option>
    </select>
  ),
}));

jest.mock('src/app/components/common/customDropDown', () => ({
  __esModule: true,
  default: ({ name, selectedValues, handleChange, options, disabled }) => (
    <select
      data-testid={`dropdown-${name}`}
      value={selectedValues?.value || ''}
      onChange={(e) => handleChange({ target: { name, value: { value: e.target.value } } })}
      disabled={disabled}
    >
      <option value="">Select</option>
      {options?.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  ),
}));

describe('RegionalConfigurationForm', () => {
  const mockOptions = {
    countries: [
      { label: 'United States', value: 'US' },
      { label: 'Canada', value: 'CA' },
    ],
    currencies: [{ label: 'USD', value: '1', symbol: '$' }],
    dateFormats: [{ label: 'MM/DD/YYYY', value: '1' }],
    timeFormats: [{ label: '12h', value: '1' }],
    timePrecisions: [{ label: 'Minutes', value: '1' }],
    distanceUnits: [{ label: 'Miles', value: '1' }],
  };

  const mockConfiguration = {
    id: 1,
    country: { label: 'United States', value: 'US' },
    currency: { label: 'USD', value: '1' },
    dateFormat: { label: 'MM/DD/YYYY', value: '1' },
    timeFormat: { label: '12h', value: '1' },
    timePrecision: { label: 'Minutes', value: '1' },
    distanceUnit: { label: 'Miles', value: '1' },
  };

  it('should render form fields', () => {
    renderWithTheme(
      <RegionalConfigurationForm
        configuration={mockConfiguration}
        options={mockOptions}
        onSaveDraft={jest.fn()}
        onPublish={jest.fn()}
      />,
    );

    expect(screen.getByTestId('country-selector')).toBeInTheDocument();
    expect(screen.getByTestId('dropdown-currency')).toBeInTheDocument();
    expect(screen.getByTestId('dropdown-dateFormat')).toBeInTheDocument();
  });

  it('should populate form with configuration data', () => {
    renderWithTheme(
      <RegionalConfigurationForm
        configuration={mockConfiguration}
        options={mockOptions}
        onSaveDraft={jest.fn()}
        onPublish={jest.fn()}
      />,
    );

    expect(screen.getByTestId('country-selector').value).toBe('US');
    expect(screen.getByTestId('dropdown-currency').value).toBe('1');
  });

  it('should disable fields when disabled prop is true', () => {
    renderWithTheme(
      <RegionalConfigurationForm
        configuration={mockConfiguration}
        options={mockOptions}
        disabled={true}
        onSaveDraft={jest.fn()}
        onPublish={jest.fn()}
      />,
    );

    expect(screen.getByTestId('country-selector')).toBeDisabled();
    expect(screen.getByTestId('dropdown-currency')).toBeDisabled();
  });

  it('should call onSaveDraft when save draft button is clicked', () => {
    const onSaveDraft = jest.fn();
    renderWithTheme(
      <RegionalConfigurationForm
        configuration={mockConfiguration}
        options={mockOptions}
        onSaveDraft={onSaveDraft}
        onPublish={jest.fn()}
      />,
    );

    const saveButton = screen.getByRole('button', {
      name: /sales.settings.regionalConfigurations.saveAsDraft/i,
    });
    fireEvent.click(saveButton);

    expect(onSaveDraft).toHaveBeenCalled();
  });

  it('should call onPublish when publish button is clicked', () => {
    const onPublish = jest.fn();
    renderWithTheme(
      <RegionalConfigurationForm
        configuration={mockConfiguration}
        options={mockOptions}
        onSaveDraft={jest.fn()}
        onPublish={onPublish}
      />,
    );

    const publishButton = screen.getByRole('button', {
      name: /sales.settings.regionalConfigurations.publish/i,
    });
    fireEvent.click(publishButton);

    expect(onPublish).toHaveBeenCalled();
  });

  it('should show cancel button when showCancel is true', () => {
    renderWithTheme(
      <RegionalConfigurationForm
        configuration={mockConfiguration}
        options={mockOptions}
        showCancel={true}
        onCancel={jest.fn()}
        onSaveDraft={jest.fn()}
        onPublish={jest.fn()}
      />,
    );

    const cancelButton = screen.getByRole('button', {
      name: /sales.settings.regionalConfigurations.cancel/i,
    });
    expect(cancelButton).toBeInTheDocument();
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(2); // Cancel + Save + Publish
  });

  it('should show delete button when onDelete is provided and not disabled', () => {
    renderWithTheme(
      <RegionalConfigurationForm
        configuration={mockConfiguration}
        options={mockOptions}
        onDelete={jest.fn()}
        onSaveDraft={jest.fn()}
        onPublish={jest.fn()}
      />,
    );

    const deleteButton = screen.getByRole('button', { name: /commonText.delete/i });
    expect(deleteButton).toBeInTheDocument();
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBe(3); // Delete + Save + Publish
  });
});
