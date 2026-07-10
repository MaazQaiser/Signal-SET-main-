import { Box, Tab, Tabs, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

import Officers from '../officers';
import Template from '../template';
import Visitors from '../visitors';
import { useStyles } from './VisitorTabs';
function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;

  const classes = useStyles();

  return (
    <Box
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
      className={value === index && classes.tabPanals}
    >
      {value === index && (
        <Box className={value === index && classes.customTabBox} sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </Box>
  );
}

CustomTabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}
const VisitorTabs = ({ siteId }) => {
  const classes = useStyles();
  const [value, setValue] = useState(0);
  const { t } = useTranslation();
  const CATEGORY_TYPE = 'visitors';
  const location = useLocation();
  const urlParams = new URLSearchParams(location.search);

  const handleChange = (event, newValue) => {
    setValue(newValue);

    const newUrlParams = new URLSearchParams(window.location.search);
    newUrlParams.set('value', newValue.toString());

    const newUrl = `${window.location.pathname}?${newUrlParams.toString()}`;
    window.history.replaceState({}, '', newUrl);
  };

  useEffect(() => {
    if (urlParams.has('value')) setValue(+urlParams.get('value'));
  }, []);

  return (
    <Box className={classes.visitorsTab}>
      <Typography variant="h1" className={classes.visitorsTabTitle}>
        {t('obx.visitors.title')}
      </Typography>
      <Box className={classes.visitorsTabsContent}>
        <Box className={classes.visitorsTabs}>
          <Tabs
            className={classes.tabButtons}
            value={value}
            onChange={handleChange}
            aria-label="basic tabs example"
          >
            <Tab label="Visitors Logs" {...a11yProps(0)} />
            <Tab label="Template" {...a11yProps(1)} />
            <Tab label="Officers" {...a11yProps(2)} />
          </Tabs>
        </Box>
        <CustomTabPanel value={value} index={0}>
          <Visitors siteId={siteId} categoryType={CATEGORY_TYPE} />
        </CustomTabPanel>
        <CustomTabPanel value={value} index={1}>
          <Template siteId={siteId} categoryType={CATEGORY_TYPE} />
        </CustomTabPanel>
        <CustomTabPanel value={value} index={2}>
          <Officers siteId={siteId} officersType={CATEGORY_TYPE} />
        </CustomTabPanel>
      </Box>
    </Box>
  );
};

VisitorTabs.propTypes = {
  siteId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default VisitorTabs;
