import { Button } from '@mui/material';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import { ReactComponent as ChevronLeftIcon } from 'assets/svg/chevron-left.svg';
import { ReactComponent as ChevronRightIcon } from 'assets/svg/chevron-right.svg';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useParams } from 'react-router-dom';
import { getSingleSite } from 'services/sites.services';
import Attendance from 'src/app/obx/pages/sites/detail/components/attendance/attendance';
import Checkpoints from 'src/app/obx/pages/sites/detail/components/checkpoints/checkpoints';
import Contracts from 'src/app/obx/pages/sites/detail/components/contracts';
import Duty from 'src/app/obx/pages/sites/detail/components/duty/duty';
import Instructions from 'src/app/obx/pages/sites/detail/components/instructions/instructions';
import Locations from 'src/app/obx/pages/sites/detail/components/locations/locations';
import history from 'src/app/router/utils/history';
import { findParentAndSiblingsPolygon, isObjectEmpty } from 'src/helper/utilityFunctions';
import { getGeoLocation } from 'src/services/franchise.services';
import { actionItemTypeKeys, toastSettings } from 'src/utils/constants';
import { toaster } from 'src/utils/toast';

import SitesSidebarListings from '../../sites/detail/components/siteSidebarListings/index';
import BillingTabs from './components/billingTabs';
import Devices from './components/devices/devices';
import GeneralInformation from './components/generalInformation/generalInformation';
// import Invoice from './components/invoices';
import Jobs from './components/jobs';
// import Loads from './components/loads/index';
import LoadsTabs from './components/loadsTabs';
import Templates from './components/reportTemplates/templates';
import TopDetail from './components/topDetails/topDetail';
// import Visitors from './components/visitors/index';
import VisitorTabs from './components/visitorTabs';
import { useStyles } from './detailStyles';

const CustomTabPanel = (props) => {
  const { children, value, index, ...other } = props;
  const classes = useStyles();
  return (
    <Box
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
      className={value === index && classes.sitesTabPanel}
    >
      {value === index && (
        <Box
          className={
            value !== 1 && value !== 2 ? classes.tabPanelContent : classes.contractsTabPanelContent
          }
        >
          {children}
        </Box>
      )}
    </Box>
  );
};

CustomTabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

const siteDetailTabs = (t) => {
  return [
    {
      // icon: <ErrorIcon sx={{ color: 'red' }} />,
      // iconPosition: 'end',
      label: t('obx.sites.details.tabs.labels.generalInformation'),
      panel: 'general',
    },
    {
      label: t('obx.sites.details.tabs.labels.contracts'),
      panel: 'contract',
    },
    {
      label: t('obx.sites.details.tabs.labels.jobs'),
      panel: 'jobs',
    },
    {
      label: t('obx.sites.details.tabs.labels.duty'),
      panel: 'duty',
    },
    {
      label: t('obx.sites.details.tabs.labels.reportTemplates'),
      panel: 'reports',
    },
    {
      label: t('obx.sites.details.tabs.labels.instructions'),
      panel: 'instructions',
    },
    {
      label: t('obx.sites.details.tabs.labels.locations'),
      panel: 'locations',
    },
    {
      label: t('obx.sites.details.tabs.labels.devices'),
      panel: 'devices',
    },
    {
      label: t('obx.sites.details.tabs.labels.checkpoints'),
      panel: 'checkpoints',
    },
    {
      label: t('obx.sites.details.tabs.labels.attendance'),
      panel: 'attendance',
    },
    {
      label: t('obx.sites.details.tabs.labels.visitors'),
      panel: 'visitors',
    },
    {
      label: t('obx.sites.details.tabs.labels.loads'),
      panel: 'loads',
    },
    {
      label: t('obx.users.details.tabs.labels.billing'),
      panel: 'billing',
    },
  ];
};

const siteDetailTabsComponents = (currentId, siteData, franchiseData, loading, checkAlert) => {
  const classes = useStyles();

  return [
    {
      component: (
        <GeneralInformation
          siteData={siteData}
          keyId={currentId}
          loading={loading}
          franchiseData={franchiseData}
        />
      ),
    },

    {
      component: <Contracts id={currentId} />,
    },
    {
      component: <Jobs id={currentId} siteData={siteData} />,
    },
    {
      component: (
        <Duty
          id={currentId}
          siteData={{
            ...siteData,
            id: currentId,
          }}
          key={currentId}
          className={classNames(classes.dutySite, checkAlert ? classes.dutySiteAlert : '')}
        />
      ),
    },
    {
      component: <Templates id={currentId} key={currentId} />,
    },
    {
      component: <Instructions id={currentId} key={currentId} />,
    },
    {
      component: <Locations id={currentId} key={currentId} />,
    },
    {
      component: <Devices id={currentId} key={currentId} />,
    },
    {
      component: <Checkpoints id={currentId} key={currentId} />,
    },
    {
      // component: <InProgress title={t('inProgress.title')} text={t('inProgress.text')} />,
      component: <Attendance id={currentId} key={currentId} />,
    },
    // {
    //   component: <Visitors id={currentId} key={currentId} />,
    // },
    {
      component: <VisitorTabs siteId={currentId} key={currentId} />,
    },
    {
      component: <LoadsTabs id={currentId} key={currentId} />,
    },
    // {
    //   component: <Invoice id={currentId} key={currentId} />,
    // },
    {
      component: <BillingTabs id={currentId} key={currentId} />,
    },
  ];
};
export default function SiteDetails() {
  const { t } = useTranslation();

  const { id } = useParams();

  const location = useLocation();

  const [siteData, setSiteData] = useState({});
  const classes = useStyles();
  const [currentId, setCurrentId] = useState('');
  const [loading, setLoading] = useState(false);
  const [franchiseData, setFranchiseData] = useState({});

  const tabs = siteDetailTabs(t);

  const [value, setValue] = useState(() => {
    const urlParams = new URLSearchParams(location.search);
    const activeTabLabel = urlParams.get('activeTab');
    const initialTabIndex = tabs.findIndex((tab) => tab.panel === activeTabLabel);
    return initialTabIndex !== -1 ? initialTabIndex : 0;
  });

  const handleChange = (event, newValue) => {
    setValue(newValue);
    const newUrlParams = new URLSearchParams(location.search);
    newUrlParams.set('activeTab', tabs[newValue]?.panel || '');
    newUrlParams.set('value', 0);
    history.push(`${location.pathname}?${newUrlParams.toString()}`);
  };

  useEffect(() => {
    if (currentId) {
      fetchSite(currentId);
      getGeoLocationInfo();
    }
  }, [currentId]);

  useEffect(() => {
    setCurrentId(id);
  }, [id]);

  const getGeoLocationInfo = async () => {
    try {
      const data = await getGeoLocation({ entity: 'site', endpoint: 'view', id: currentId });
      let { franchiseArea } = findParentAndSiblingsPolygon(
        currentId,
        data,
        actionItemTypeKeys.site,
        false,
      );
      franchiseArea.zones = [];
      setFranchiseData(franchiseArea);
    } catch (e) {
      toaster.error({
        text: e.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  const fetchSite = async () => {
    try {
      setLoading(true);
      setSiteData({});
      const response = await getSingleSite(currentId);
      if (response?.statusCode === 200) {
        setSiteData(response?.data?.site || {});
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  const checkAlert =
    !isObjectEmpty(siteData) &&
    !loading &&
    (!siteData?.zone || !siteData?.data?.supervisors?.length);

  const allPanels = siteDetailTabsComponents(
    currentId,
    siteData,
    franchiseData,
    loading,
    checkAlert,
  );

  const tabPanels = useMemo(() => {
    let panels = [];

    for (let i = 0; i < allPanels.length; i++) {
      const panelComponent = allPanels[i];

      const data = (
        <CustomTabPanel value={value} index={i}>
          {panelComponent?.component}
        </CustomTabPanel>
      );

      panels = [...panels, data];
    }
    return panels;
  }, [value, allPanels]);

  return (
    <Box className={classes.siteDetailContainer}>
      <SitesSidebarListings className={classes.sidebarSection} />

      <Box className={classes.franchisesContent}>
        <Box className={classes.mainBox}>
          {!isObjectEmpty(siteData) &&
          !loading &&
          (!siteData?.zone || !siteData?.data?.supervisors?.length) ? (
            <Alert severity="error" className={classes.siteAlert}>
              {!siteData?.zone ? t('obx.sites.siteInformation.zoneRequire') : ''}
              {!siteData?.data?.supervisors?.length
                ? t('obx.sites.siteInformation.supervisorRequire')
                : ''}
            </Alert>
          ) : null}
          <TopDetail
            loading={loading}
            data={siteData}
            className={classes.topDetailComponentWrapper}
          />
          <Box className={classes.mainWrapper}>
            <Box className={classes.functionalDiv}>
              <Tabs
                variant="scrollable"
                scrollButtons="auto"
                value={value}
                onChange={handleChange}
                className={classes.tabContainer}
                ScrollButtonComponent={({ direction, disabled, ...props }) => {
                  if (direction === 'left' && !disabled) {
                    return (
                      <Button variant="secondaryGrey" {...props}>
                        <ChevronLeftIcon />
                      </Button>
                    );
                  } else if (direction === 'right' && !disabled) {
                    return (
                      <Button variant="secondaryGrey" {...props}>
                        <ChevronRightIcon />
                      </Button>
                    );
                  } else {
                    return null;
                  }
                }}
              >
                {tabs?.map((element, _index) => {
                  return <Tab key={element?.label} label={element?.label} {...element} />;
                })}
              </Tabs>

              {/* <Box className={classes.functionalbtn}>
                <Button variant="secondaryGrey">{t('buttons.makeItFunctional')}</Button>
              </Box> */}
            </Box>

            <Box className={classes.tabsContent}>{tabPanels}</Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
