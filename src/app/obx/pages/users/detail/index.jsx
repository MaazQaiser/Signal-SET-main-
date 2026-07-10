import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import PropTypes from 'prop-types';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getUsersById } from 'services/user.services';
// import InProgress from 'src/app/components/common/inProgress/inProgress';
import Attendance from 'src/app/obx/pages/users/detail/components/attendance/attendance';
import Availability from 'src/app/obx/pages/users/detail/components/availability/availability';
import GeneralInformation from 'src/app/obx/pages/users/detail/components/generalInformation/generalInformation';
import Schedule from 'src/app/obx/pages/users/detail/components/schedule';
// import ScoreCard from 'src/app/obx/pages/users/detail/components/scoreCard';
import UsersSidebarListings from 'src/app/obx/pages/users/detail/components/usersSidebarListings';
import { toastSettings } from 'src/utils/constants';

import TopDetail from './components/topDetails/topDetail';
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
      {value === index && <Box className={classes.tabPanelContent}>{children}</Box>}
    </Box>
  );
};

CustomTabPanel.propTypes = {
  children: PropTypes.node,
  label: PropTypes.string,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

const detailTabs = (t) => {
  return [
    {
      label: t('obx.users.details.tabs.labels.profile'),
    },
    // {
    //   label: t('obx.users.details.tabs.labels.scoreCard'),
    // },
    {
      label: t('obx.users.details.tabs.labels.attendance'),
    },
    {
      label: t('obx.users.details.tabs.labels.schedule'),
    },
    {
      label: t('obx.users.details.tabs.labels.availability'),
    },
  ];
};

const detailTabsComponents = (currentId, data, loading) => {
  // const { t } = useTranslation();
  const classes = useStyles();
  return [
    {
      component: <GeneralInformation data={data} id={currentId} loading={loading} />,
    },
    // {
    //   component: <ScoreCard data={data} id={currentId} />,
    // },
    {
      // component: <InProgress title={t('inProgress.title')} text={t('inProgress.text')} />,
      component: <Attendance data={data} key={currentId} id={currentId} />,
    },
    {
      component: <Schedule data={data} id={currentId} className={classes.dutySite} />,
    },
    {
      component: <Availability data={data} id={currentId} />,
    },
  ];
};

const UserDetails = () => {
  const { t } = useTranslation();

  const { id } = useParams();

  const [data, setData] = useState({});
  const classes = useStyles();
  const [currentId, setCurrentId] = useState('');
  const [loading, setLoading] = useState(false);
  const [value, setValue] = useState(0);

  const tabs = detailTabs(t);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  useEffect(() => {
    if (currentId) {
      fetchUser(currentId);
    }
  }, [currentId]);

  useEffect(() => {
    if (id) {
      setCurrentId(id);
    }
  }, [id]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const response = await getUsersById(currentId);
      if (response?.statusCode === 200) {
        setData(response?.data?.user || {});
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);

      toast.error(error?.message, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  const allPanels = detailTabsComponents(currentId, data, loading);

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
    <Box className={classes.detailContainer}>
      {/* {loading && <LoaderComponent size={50} color={'primary'} label={'Loading'} />} */}

      <UsersSidebarListings className={classes.sidebarSection} />

      <Box className={classes.franchisesContent}>
        <Box className={classes.mainBox}>
          <TopDetail data={data} className={classes.topDetailComponentWrapper} loading={loading} />
          <Box className={classes.mainWrapper}>
            <Box className={classes.functionalDiv}>
              <Tabs
                value={value}
                onChange={handleChange}
                aria-label="basic tabs example"
                className={classes.tabContainer}
              >
                {tabs?.map((props) => {
                  return <Tab key={props?.label} label={props?.label} {...props} />;
                })}
              </Tabs>
            </Box>

            <Box className={classes.tabsContent}>{tabPanels}</Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

UserDetails.propTypes = {
  label: PropTypes.string,
};
export default UserDetails;
