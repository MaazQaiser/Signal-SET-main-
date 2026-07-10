import './global.scss';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

import { ClickAnalyticsPlugin } from '@microsoft/applicationinsights-clickanalytics-js';
import {
  AppInsightsErrorBoundary,
  ReactPlugin,
  withAITracking,
} from '@microsoft/applicationinsights-react-js';
import { ApplicationInsights } from '@microsoft/applicationinsights-web';
import { createBrowserHistory } from 'history';
import React, { Suspense, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { pdfjs } from 'react-pdf';
import { Provider, useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { Router } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { PersistGate } from 'redux-persist/integration/react';
import history from 'src/app/router/utils/history';
import { Auth0ProviderWithNavigate } from 'src/Auth0Provider';
import { DesignTokenProvider } from 'src/theme/DesignTokenProvider';
import { APP_INSIGHT_USER_AGENT } from 'src/utils/constants';

import NoServer from './app/public/pages/noServer';
import getRouteConfigs from './app/router/config/base.route';
import generateRoutesFromConfig from './app/router/utils/generateRoutesFromConfig';
import { isObjectEmpty, mainDomain } from './helper/utilityFunctions';
import store, { persistor } from './redux/store/index';
import { setTenantInfo } from './redux/store/slices/auth';
import { setTenantLanguageData } from './redux/store/slices/tenantConfigs';
import { DEFAULT_TENANT_LABELS, DEFAULT_TENANT_SERVICES } from './utils/auth/demoSession';
import { MULTI_TENANT_AUTH } from './utils/constants/multiTanentAuthInfo';
import isDevBypassAuth from './utils/isDevBypassAuth';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

const browserHistory = createBrowserHistory({ basename: window.location.origin });

let clickPluginInstance = new ClickAnalyticsPlugin();
let clickPluginConfig = {
  autoCapture: true,
};

const reactPlugin = new ReactPlugin();
const appInsightsKey = process.env.REACT_APP_INSIGHTS?.trim();
const hasAppInsights = Boolean(appInsightsKey);

if (hasAppInsights) {
  const appInsights = new ApplicationInsights({
    config: {
      connectionString: `instrumentationKey=${appInsightsKey}`,
      enableAutoRouteTracking: true,
      disableAjaxTracking: false,
      autoTrackPageVisitTime: true,
      enableCorsCorrelation: true,
      enableRequestHeaderTracking: true,
      enableResponseHeaderTracking: true,
      correlationHeaderExcludedDomains: [
        '*.auth0.com',
        '*.googleapis.com',
        '*.blob.core.windows.net',
      ],
      extensions: [reactPlugin, clickPluginInstance],
      [clickPluginInstance.identifier]: clickPluginConfig,
      extensionConfig: {
        [reactPlugin.identifier]: { history: browserHistory },
      },
    },
  });

  appInsights.loadAppInsights();
  appInsights.addTelemetryInitializer((envelope) => {
    envelope.data.baseData.properties.user_agent = APP_INSIGHT_USER_AGENT;
  });
}

const Main = () => {
  const { i18n } = useTranslation();

  const tenant = mainDomain();
  const currentDomain = MULTI_TENANT_AUTH[tenant];

  const currentLanguage = useSelector((state) => state.auth.currentLanguage);
  const userEmail = useSelector((state) => state.user.info?.email);

  const tenantInfo = useSelector((state) => state.auth.tenantInfo);
  const tenantLabels = useSelector((state) => state.tenantConfigs?.tenantLabels);

  const dispatch = useDispatch();

  useEffect(() => {
    if (currentLanguage?.code) {
      i18n.changeLanguage(currentLanguage.code);
    }
  }, [currentLanguage?.code]);

  useEffect(() => {
    if (!isDevBypassAuth()) {
      return;
    }

    const hasServiceTypes = tenantInfo?.services?.dedicated || tenantInfo?.services?.patrol;
    const hasTenantLabels =
      tenantLabels?.terms?.dedicated &&
      tenantLabels?.terms?.patrol &&
      tenantLabels?.roles?.officer &&
      tenantLabels?.terms?.guard;

    if (isObjectEmpty(tenantInfo)) {
      dispatch(
        setTenantInfo({
          loader: currentDomain.loader,
          logo: currentDomain.logo,
          images: { logo1: currentDomain.logo },
          services: DEFAULT_TENANT_SERVICES,
        }),
      );
    } else if (!hasServiceTypes) {
      dispatch(
        setTenantInfo({
          ...tenantInfo,
          services: DEFAULT_TENANT_SERVICES,
        }),
      );
    }

    if (!hasTenantLabels) {
      dispatch(setTenantLanguageData(DEFAULT_TENANT_LABELS));
    }
  }, []);

  useEffect(() => {
    if (window && window?.clarity && userEmail) {
      window.clarity('set', 'userId', userEmail || 'guest');
    }
  }, [userEmail, window]);

  const configs = useMemo(getRouteConfigs, []);
  // Generate and return routes from configs
  return useMemo(() => generateRoutesFromConfig(configs), [configs]);
};

function App() {
  return (
    <DesignTokenProvider>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <Router history={history}>
            <AppInsightsErrorBoundary onError={NoServer} appInsights={reactPlugin}>
              <Suspense fallback={null}>
                <Auth0ProviderWithNavigate>
                  <Main />
                </Auth0ProviderWithNavigate>
              </Suspense>
            </AppInsightsErrorBoundary>
          </Router>
        </PersistGate>
      </Provider>
      <ToastContainer />
    </DesignTokenProvider>
  );
}

export default withAITracking(reactPlugin, App);
