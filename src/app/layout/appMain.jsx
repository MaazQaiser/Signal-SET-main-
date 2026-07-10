import { Box, Skeleton } from '@mui/material';
import React, { Suspense, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { SALES_DEALS } from 'src/app/router/constant/ROUTE';
import contractAssistantIconSrc from 'src/assets/svg/contractAssistantIcon.svg';

import classes from './appMain.module.scss';
import RouterConfig from './routerConfig';
const Sidebar = React.lazy(() => import('./sideBar'));
const Navbar = React.lazy(() => import('./navBar/navBar'));

export default function AppMain() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isSidebarTransformed, setIsSidebarTransformed] = useState(false);
  const location = useLocation();
  const history = useHistory();
  const isContractCreationScreen = /\/deals\/deal\/[^/]+\/contract\/[^/]+/.test(
    location.pathname || '',
  );

  const sidebarCollapseHandler = () => {
    setIsCollapsed((prevState) => {
      return !prevState;
    });
  };

  const toggleSidebarTransformHandler = () => {
    setIsSidebarTransformed((prevState) => {
      return !prevState;
    });
  };

  let content = (
    <>
      <Box className={classes.dashboardContainer}>
        <Suspense fallback={<Skeleton variant="rect" width={'100vw'} height={'100vh'} />}>
          <Sidebar
            className={classes.sidebarMain}
            toggleSidebar={sidebarCollapseHandler}
            isCollapsed={isCollapsed}
            isSidebarTransformed={isSidebarTransformed}
            transformSidebar={setIsSidebarTransformed.bind(null, false)}
          />
          <div className={classes.dashboardContentContainer} data-simplebar>
            <Navbar
              toggleSidebarTransform={toggleSidebarTransformHandler}
              isTransformed={isSidebarTransformed}
            />
            <RouterConfig />
            {!isContractCreationScreen && (
              <Box
                role="button"
                tabIndex={0}
                aria-label="Open contract assistant"
                onClick={() => history.push(SALES_DEALS)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    history.push(SALES_DEALS);
                  }
                }}
                sx={{
                  position: 'fixed',
                  bottom: '24px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  zIndex: (theme) => theme.zIndex.modal,
                  width: 'calc(100% - 32px)',
                  maxWidth: '528px',
                  minHeight: '48px',
                  borderRadius: '24px',
                  px: 2,
                  py: 1.25,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.25,
                  cursor: 'pointer',
                  background:
                    'radial-gradient(ellipse 85% 65% at 100% 0%, rgba(180, 210, 255, 0.43) 0%, transparent 58%), linear-gradient(165deg, rgba(240, 247, 255, 0.7) 0%, rgba(240, 247, 255, 0.2) 100%)',
                  backdropFilter: 'blur(12px) saturate(180%)',
                  border: '0.5px solid rgba(107, 156, 248, 0.35)',
                  boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06)',
                }}
              >
                <Box
                  component="img"
                  src={contractAssistantIconSrc}
                  alt=""
                  aria-hidden="true"
                  sx={{
                    width: 24,
                    height: 24,
                    flexShrink: 0,
                    display: 'block',
                  }}
                />
                <Box component="span" sx={{ color: 'text.disabled', fontSize: 14 }}>
                  Ask anything
                </Box>
              </Box>
            )}
          </div>
        </Suspense>
      </Box>
    </>
  );

  return content;
}
