// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

import React from 'react';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';

// Mock Redux Store
export const createMockStore = (initialState = {}) => {
  const defaultState = {
    auth: {
      accessToken: 'mock-token',
      notificationsCount: 0,
      toggleNotifications: false,
      userRole: null,
      accessList: [],
      user: {
        name: 'Test User',
        designation: 'Test Designation',
        imagePath: '',
      },
      currentLanguage: {},
      dashboardActive: '',
      franchiseId: '',
      saasToken: null,
      tenantId: '',
      tenantInfo: {},
      ...initialState.auth,
    },
    user: {
      info: null,
      currentLanguage: null,
      countries: [],
      ...initialState.user,
    },
    contractServices: {},
    tenantConfigs: {},
    ...initialState,
  };

  return configureStore({
    reducer: {
      auth: (state = defaultState.auth) => state,
      user: (state = defaultState.user) => state,
      contractServices: (state = defaultState.contractServices) => state,
      tenantConfigs: (state = defaultState.tenantConfigs) => state,
    },
    preloadedState: defaultState,
  });
};

// Mock Router
export const createMockHistory = (initialPath = '/') => {
  return createMemoryHistory({ initialEntries: [initialPath] });
};

// Mock Router Wrapper Component
export const MockRouter = ({ children, initialPath = '/' }) => {
  const history = createMockHistory(initialPath);
  return <Router history={history}>{children}</Router>;
};

// Mock Services
export const mockNotificationsService = {
  getNotificationsCount: jest.fn(() =>
    Promise.resolve({
      statusCode: 200,
      data: { unreadCount: 5 },
    }),
  ),
  getUsersNotificationUrl: jest.fn(() =>
    Promise.resolve({
      statusCode: 200,
      data: { url: 'ws://mock-websocket-url' },
    }),
  ),
  getNotifications: jest.fn(() =>
    Promise.resolve({
      statusCode: 200,
      data: { notifications: [], pagination: { totalCount: 0 } },
    }),
  ),
  markNotificationsRead: jest.fn(() => Promise.resolve({ statusCode: 200 })),
};

export const mockSettingsService = {
  fetchConfigList: jest.fn(() =>
    Promise.resolve({
      countries: [
        { id: 1, name: 'United States', code: 'US' },
        { id: 2, name: 'Canada', code: 'CA' },
      ],
    }),
  ),
};

// Mock Components
export const MockBreadCrumb = () => <div data-testid="breadcrumb">BreadCrumb</div>;
export const MockNotificationsDropdown = ({ notificationsCount, setNotificationsCount }) => (
  <div data-testid="notifications-dropdown">Notifications: {notificationsCount}</div>
);
export const MockAccountDropdown = () => <div data-testid="account-dropdown">Account</div>;

// Test Wrapper with all providers
export const TestWrapper = ({ children, store, initialPath = '/' }) => {
  const mockStore = store || createMockStore();
  const history = createMockHistory(initialPath);

  return (
    <Provider store={mockStore}>
      <Router history={history}>{children}</Router>
    </Provider>
  );
};
