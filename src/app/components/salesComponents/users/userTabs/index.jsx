import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import CustomTabPanel from 'src/app/components/common/customTabPanel';
import {
  ACL_USER_DEALS_VIEW,
  ACL_USER_HISTORY_VIEW,
  ACL_USER_PROPERTY_VIEW,
  ACL_USER_ROLES_AND_PERMISSIONS_VIEW,
} from 'src/app/router/constant/SALESMODULE';
import UserPermissions from 'src/app/sales/pages/users/detail/components/userPermissions';
import userHasPermission from 'src/utils/auth/userHasPermission';

import DealsTabs from '../dealsTab';
import HistoryTab from '../historyTab';
import LocationTabs from '../locationsTab';
import { useStyles } from './tabs';

const tabConfig = (t, id, userDetail, setUserDetail, refetch, classes) => [
  {
    label: t('sales.users.propertiesTab'),
    toShow: userHasPermission(ACL_USER_PROPERTY_VIEW),
    content: <LocationTabs id={id} userDetail={userDetail} />,
    className: classes.overviewTabsOne, // Apply conditionally if value === 0
  },
  {
    label: t('sales.users.dealsTab'),
    toShow: userHasPermission(ACL_USER_DEALS_VIEW),
    content: <DealsTabs id={id} />,
    className: classNames(classes.overviewTabs, 'innerScrollBar'), // Apply conditionally if value === 1
  },
  {
    label: t('sales.users.historyTab'),
    toShow: userHasPermission(ACL_USER_HISTORY_VIEW),
    content: <HistoryTab id={id} />,
    className: classNames(classes.historyTab, 'innerScrollBar'), // Apply conditionally if value === 2
  },
  {
    label: t('sales.settings.rolesAndPermissions'),
    toShow: userHasPermission(ACL_USER_ROLES_AND_PERMISSIONS_VIEW),
    content: (
      <UserPermissions data={userDetail} id={id} setData={setUserDetail} refetch={refetch} />
    ), // assuming this is your component
    className: 'innerScrollBar', // optional
  },
];

const a11yProps = (index) => {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
};
const UserTabs = ({ id, userDetail, setUserDetail, refetch }) => {
  const [value, setValue] = useState(0); // Initialize 'value' state variable
  const { t } = useTranslation();

  const handleChange = (event, newValue) => {
    setValue(newValue); // Update 'value' when the tab changes
  };

  const classes = useStyles();

  const tabs = tabConfig(t, id, userDetail, setUserDetail, refetch, classes).filter(
    (a) => a.toShow == true,
  );

  return (
    <Box sx={{ width: '100%' }} className={classes.tabArea}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          className={classes.tabsBtnWrapper}
          value={value}
          onChange={handleChange}
          aria-label={t('sales.users.basicTabsExample')}
        >
          {tabs?.map((props, index) => {
            return (
              <Tab
                className={classes.tabBtn}
                disableRipple
                key={props?.label}
                value={index}
                label={props?.label}
                {...a11yProps(index)}
                {...props}
              />
            );
          })}
          {/* <Tab className={classes.tabBtn} disableRipple label="Properties" {...a11yProps(0)} />
          <Tab className={classes.tabBtn} disableRipple label="Deals" {...a11yProps(1)} />
          <Tab className={classes.tabBtn} disableRipple label="History" {...a11yProps(2)} /> */}
        </Tabs>
      </Box>
      {tabs.map((tab, index) => (
        <CustomTabPanel
          key={tab.label}
          value={value}
          index={index}
          className={value === index ? tab.className : ''}
        >
          {tab.content}
        </CustomTabPanel>
      ))}
      {/* <CustomTabPanel value={value} index={0} className={value === 0 && classes.overviewTabsOne}>
        <LocationTabs id={id} userDetail={userDetail} />
      </CustomTabPanel>
      <CustomTabPanel
        value={value}
        index={1}
        className={classNames(value === 1 && classes.overviewTabs, 'innerScrollBar')}
      >
        <DealsTabs id={id} />
      </CustomTabPanel>
      <CustomTabPanel
        value={value}
        index={2}
        className={classNames(value === 2 && classes.historyTab, 'innerScrollBar')}
      >
        <HistoryTab id={id} />
      </CustomTabPanel> */}
    </Box>
  );
};

UserTabs.propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  fetchUserDeals: PropTypes.func,
  fetchUserHistory: PropTypes.func,
  setValue: PropTypes.func,
  value: PropTypes.any, // Adjust the type accordingly based on the expected data structure
  userDetail: PropTypes.object,
  setUserDetail: PropTypes.func,
  refetch: PropTypes.func,
  label: PropTypes.string,
};

export default UserTabs;
