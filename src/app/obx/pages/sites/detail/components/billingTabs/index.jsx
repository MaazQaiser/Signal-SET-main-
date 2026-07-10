import { Box, Tab, Tabs, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import BillingDetails from '../billingDetails';
import MergedInvoices from '../mergedInvoices';
// import MergedInvoices from '../mergedInvoices';
import { useStyles } from './billingTabs';
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
const BillingTabs = ({ id }) => {
  const classes = useStyles();
  const [value, setValue] = useState(0);
  const { t } = useTranslation();

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Box className={classes.visitorsTab}>
      <Typography className={classes.visitorsTabTitle} variant="h1">
        {t('obx.billing.billing')}
      </Typography>
      <Box className={classes.visitorsTabsContent}>
        <Box className={classes.visitorsTabs}>
          <Tabs
            className={classes.tabButtons}
            value={value}
            onChange={handleChange}
            aria-label="basic tabs example"
          >
            <Tab label="Billing Details" {...a11yProps(0)} />
            <Tab label="Merged Invoices" {...a11yProps(1)} />
          </Tabs>
        </Box>
        {/* <CustomTabPanel value={value} index={0}>
          <Visitors siteId={id} categoryType={CATEGORY_TYPE} />
        </CustomTabPanel> */}
        <CustomTabPanel value={value} index={0}>
          <BillingDetails siteId={id} />
        </CustomTabPanel>
        <CustomTabPanel value={value} index={1}>
          <MergedInvoices />
        </CustomTabPanel>
      </Box>
    </Box>
  );
};
BillingTabs.propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};
export default BillingTabs;
