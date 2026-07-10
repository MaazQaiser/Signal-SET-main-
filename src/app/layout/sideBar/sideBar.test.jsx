import { createTheme, ThemeProvider } from '@mui/material/styles';
import { StylesProvider } from '@mui/styles';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { createMockStore, TestWrapper } from 'src/setupTests';

import Sidebar from './index';

// Mock i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
  }),
}));

// Mock permission utility
jest.mock('globalUtils/auth/userHasPermissionSideBar', () => ({
  __esModule: true,
  default: jest.fn(() => true),
}));

// Mock SVG icons
jest.mock('../../../assets/svg/index', () => ({
  DashboardIcon: () => <div data-testid="dashboard-icon">Dashboard</div>,
  FranchiseIcon: () => <div data-testid="franchise-icon">Franchise</div>,
  MapIcon: () => <div data-testid="map-icon">Map</div>,
  Zones: () => <div data-testid="zones-icon">Zones</div>,
  Sites: () => <div data-testid="sites-icon">Sites</div>,
  Schedules: () => <div data-testid="schedules-icon">Schedules</div>,
  Runsheet: () => <div data-testid="runsheet-icon">Runsheet</div>,
  Report: () => <div data-testid="report-icon">Report</div>,
  LucidUsertIcon: () => <div data-testid="user-icon">User</div>,
  AttendanceIcon: () => <div data-testid="attendance-icon">Attendance</div>,
  PayrollIcon: () => <div data-testid="payroll-icon">Payroll</div>,
  Invoices: () => <div data-testid="invoices-icon">Invoices</div>,
  Analytics: () => <div data-testid="analytics-icon">Analytics</div>,
  LeaderBoardIcon: () => <div data-testid="leaderboard-icon">Leaderboard</div>,
  Devices: () => <div data-testid="devices-icon">Devices</div>,
  VehiclesIcon: () => <div data-testid="vehicles-icon">Vehicles</div>,
  SettingIcon: () => <div data-testid="setting-icon">Setting</div>,
  LocationIconSideBar: () => <div data-testid="location-icon">Location</div>,
  DealsIcon: () => <div data-testid="deals-icon">Deals</div>,
  CompanyIcon: () => <div data-testid="company-icon">Company</div>,
  ContactIcon: () => <div data-testid="contact-icon">Contact</div>,
  IndustryVerticalsIcon: () => <div data-testid="industry-verticals-icon">Industry Verticals</div>,
  ScoutingIcon: () => <div data-testid="scouting-icon">Scouting</div>,
  _Runsheet: () => <div data-testid="_runsheet-icon">_Runsheet</div>,
}));

// Mock minimize drawer icon
jest.mock('assetsComponents/images/minimizeSideBar.svg', () => ({
  ReactComponent: () => <div data-testid="minimize-icon">Minimize</div>,
}));

describe('Sidebar Component', () => {
  const mockToggleSidebar = jest.fn();
  const mockStore = createMockStore({
    auth: {
      tenantInfo: {
        name: 'Test Tenant',
        images: {
          logo1: '/test-logo.png',
        },
      },
    },
  });

  const renderComponent = (props = {}) => {
    const defaultProps = {
      toggleSidebar: mockToggleSidebar,
      isCollapsed: false,
      isSidebarTransformed: false,
      className: '',
      ...props,
    };

    const theme = createTheme();
    return render(
      <StylesProvider injectFirst>
        <ThemeProvider theme={theme}>
          <TestWrapper store={mockStore} initialPath="/app/obx/dashboard">
            <Sidebar {...defaultProps} />
          </TestWrapper>
        </ThemeProvider>
      </StylesProvider>,
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render sidebar component', () => {
    renderComponent();
    expect(screen.getByTestId('minimize-icon')).toBeInTheDocument();
  });

  it('should render backdrop overlay when collapsed', () => {
    renderComponent({ isCollapsed: true });
    const backdrop = document.querySelector('[class*="backdropOverlay"]');
    expect(backdrop).toBeInTheDocument();
  });

  it('should not render backdrop overlay when not collapsed', () => {
    renderComponent({ isCollapsed: false });
    const backdrop = document.querySelector('[class*="backdropOverlay"]');
    expect(backdrop).not.toBeInTheDocument();
  });

  it('should call toggleSidebar when backdrop is clicked', () => {
    renderComponent({ isCollapsed: true });
    const backdrop = document.querySelector('[class*="backdropOverlay"]');
    backdrop?.click();
    expect(mockToggleSidebar).toHaveBeenCalledTimes(1);
  });

  it('should call toggleSidebar when minimize button is clicked', () => {
    renderComponent();
    const minimizeButton = screen
      .getByTestId('minimize-icon')
      .closest('div[class*="toggleSidebarButton"]');
    minimizeButton?.click();
    expect(mockToggleSidebar).toHaveBeenCalledTimes(1);
  });

  it('should apply collapsed class when isCollapsed is true', () => {
    renderComponent({ isCollapsed: true });
    const sidebar = document.querySelector('[class*="sidebarOverlay"]');
    expect(sidebar?.className).not.toContain('compressBar');
  });

  it('should apply compressBar class when isCollapsed is false', () => {
    renderComponent({ isCollapsed: false });
    const sidebar = document.querySelector('[class*="sidebarOverlay"]');
    expect(sidebar?.className).toContain('compressBar');
  });
});
