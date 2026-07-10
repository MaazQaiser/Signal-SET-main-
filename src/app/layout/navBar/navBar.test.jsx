import { createTheme, ThemeProvider } from '@mui/material/styles';
import { StylesProvider } from '@mui/styles';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { createMockStore, TestWrapper } from 'src/setupTests';

import Header from './navBar';

// Mock the services
jest.mock('src/services/notifications.service', () => ({
  getNotificationsCount: jest.fn(() =>
    Promise.resolve({ statusCode: 200, data: { unreadCount: 0 } }),
  ),
  getUsersNotificationUrl: jest.fn(() =>
    Promise.resolve({ statusCode: 200, data: { url: 'ws://mock-url' } }),
  ),
}));

jest.mock('src/services/settings.services', () => ({
  fetchConfigList: jest.fn(() => Promise.resolve({ countries: [] })),
}));

// Mock child components
jest.mock('src/app/components/common/breadcrumb', () => ({
  __esModule: true,
  default: () => <div data-testid="breadcrumb">BreadCrumb</div>,
}));

jest.mock('src/app/components/common/notificationsDropdown', () => ({
  __esModule: true,
  default: () => <div data-testid="notifications-dropdown">Notifications</div>,
}));

jest.mock('../../components/common/accountDropdown', () => ({
  __esModule: true,
  default: () => <div data-testid="account-dropdown">Account</div>,
}));

jest.mock('../../components/common/globalCountrySelect', () => ({
  __esModule: true,
  GlobalCountrySelect: () => <div data-testid="global-country-select">Country Select</div>,
}));

// Mock react-toastify
jest.mock('react-toastify', () => ({
  toast: {
    error: jest.fn(),
  },
}));

// Mock WebSocket
global.WebSocket = jest.fn(() => ({
  onopen: null,
  onmessage: null,
  onerror: null,
  onclose: null,
  close: jest.fn(),
}));

describe('NavBar Component', () => {
  const mockStore = createMockStore({
    auth: {
      accessToken: 'mock-token',
      notificationsCount: 0,
    },
    user: {
      countries: [],
    },
  });

  const renderComponent = () => {
    const theme = createTheme();
    return render(
      <StylesProvider injectFirst>
        <ThemeProvider theme={theme}>
          <TestWrapper store={mockStore}>
            <Header />
          </TestWrapper>
        </ThemeProvider>
      </StylesProvider>,
    );
  };

  it('should render navbar with all main components', () => {
    renderComponent();

    expect(screen.getByTestId('breadcrumb')).toBeInTheDocument();
    expect(screen.getByTestId('notifications-dropdown')).toBeInTheDocument();
    expect(screen.getByTestId('account-dropdown')).toBeInTheDocument();
  });
});
