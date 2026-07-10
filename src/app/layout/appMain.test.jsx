import { createTheme, ThemeProvider } from '@mui/material/styles';
import { StylesProvider } from '@mui/styles';
import { render, screen, waitFor } from '@testing-library/react';
import React, { act } from 'react';
import { TestWrapper } from 'src/setupTests';

import AppMain from './appMain';

// Mock lazy-loaded components
jest.mock('./sideBar', () => ({
  __esModule: true,
  default: ({ toggleSidebar, isCollapsed, isSidebarTransformed, className }) => (
    <div data-testid="sidebar">
      <div data-testid="sidebar-toggle" onClick={toggleSidebar}>
        Toggle Sidebar
      </div>
      <div data-testid="sidebar-collapsed">{isCollapsed ? 'collapsed' : 'expanded'}</div>
      <div data-testid="sidebar-transformed">{isSidebarTransformed ? 'transformed' : 'normal'}</div>
      <div data-testid="sidebar-class">{className}</div>
    </div>
  ),
}));

jest.mock('./navBar/navBar', () => ({
  __esModule: true,
  default: ({ toggleSidebarTransform, isTransformed }) => (
    <div data-testid="navbar">
      <div data-testid="navbar-toggle" onClick={toggleSidebarTransform}>
        Toggle Transform
      </div>
      <div data-testid="navbar-transformed">{isTransformed ? 'transformed' : 'normal'}</div>
    </div>
  ),
}));

// Mock RouterConfig
jest.mock('./routerConfig', () => ({
  __esModule: true,
  default: () => <div data-testid="router-config">Router Config</div>,
}));

// Mock SCSS module
jest.mock('./appMain.module.scss', () => ({
  dashboardContainer: 'dashboard-container',
  sidebarMain: 'sidebar-main',
  dashboardContentContainer: 'dashboard-content-container',
}));

describe('AppMain Component', () => {
  const mockStore = require('src/setupTests').createMockStore();

  const renderComponent = () => {
    const theme = createTheme();
    return render(
      <StylesProvider injectFirst>
        <ThemeProvider theme={theme}>
          <TestWrapper store={mockStore}>
            <AppMain />
          </TestWrapper>
        </ThemeProvider>
      </StylesProvider>,
    );
  };

  it('should render AppMain component', async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    });
    expect(screen.getByTestId('navbar')).toBeInTheDocument();
    expect(screen.getByTestId('router-config')).toBeInTheDocument();
  });

  it('should render Sidebar with initial state', async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.getByTestId('sidebar-collapsed')).toHaveTextContent('expanded');
    });
    expect(screen.getByTestId('sidebar-transformed')).toHaveTextContent('normal');
  });

  it('should toggle sidebar collapsed state when toggle is clicked', async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.getByTestId('sidebar-toggle')).toBeInTheDocument();
    });

    const toggleButton = screen.getByTestId('sidebar-toggle');

    // Initially expanded
    expect(screen.getByTestId('sidebar-collapsed')).toHaveTextContent('expanded');

    // Click to collapse
    act(() => {
      toggleButton.click();
    });
    await waitFor(() => {
      expect(screen.getByTestId('sidebar-collapsed')).toHaveTextContent('collapsed');
    });

    // Click again to expand
    act(() => {
      toggleButton.click();
    });
    await waitFor(() => {
      expect(screen.getByTestId('sidebar-collapsed')).toHaveTextContent('expanded');
    });
  });

  it('should toggle sidebar transform state when navbar toggle is clicked', async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.getByTestId('navbar-toggle')).toBeInTheDocument();
    });

    const navbarToggle = screen.getByTestId('navbar-toggle');

    // Initially normal
    expect(screen.getByTestId('navbar-transformed')).toHaveTextContent('normal');
    expect(screen.getByTestId('sidebar-transformed')).toHaveTextContent('normal');

    // Click to transform
    act(() => {
      navbarToggle.click();
    });
    await waitFor(() => {
      expect(screen.getByTestId('navbar-transformed')).toHaveTextContent('transformed');
    });
    await waitFor(() => {
      expect(screen.getByTestId('sidebar-transformed')).toHaveTextContent('transformed');
    });

    // Click again to normal
    act(() => {
      navbarToggle.click();
    });
    await waitFor(() => {
      expect(screen.getByTestId('navbar-transformed')).toHaveTextContent('normal');
    });
    await waitFor(() => {
      expect(screen.getByTestId('sidebar-transformed')).toHaveTextContent('normal');
    });
  });

  it('should pass correct className to Sidebar', async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.getByTestId('sidebar-class')).toHaveTextContent('sidebar-main');
    });
  });

  it('should render RouterConfig component', async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.getByTestId('router-config')).toBeInTheDocument();
    });
  });
});
