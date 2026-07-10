import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import * as React from 'react';

// import { useTranslation } from 'react-i18next';
import DipacthDetails from './dipacthDetails';
import DispatchActivityLogs from './dispatchActivityLogs';
import DispatchNotes from './dispatchNotes';
import DispatchReport from './dispatchReport';
import { useStyles } from './DispatchTabs';

function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
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

const DispatchTabs = ({ dispatch, dispatchId, loading }) => {
  const classes = useStyles();
  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: '100%' }} className={classNames(classes.tabWrapper, 'innerScrollBar')}>
      <Box className={classes.payrollTabButtonTops}>
        <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
          <Tab label="Dispatch Details" {...a11yProps(0)} />
          <Tab label="Report" {...a11yProps(1)} />
          <Tab label="Notes" {...a11yProps(2)} />
          <Tab label="Activity Logs" {...a11yProps(3)} />
        </Tabs>
      </Box>
      <CustomTabPanel className={classes.tabContent} value={value} index={0}>
        <DipacthDetails dispatch={dispatch} loading={loading} />
      </CustomTabPanel>
      <CustomTabPanel className={classes.tabContent} value={value} index={1}>
        <DispatchReport dispatchId={dispatchId} />
      </CustomTabPanel>
      <CustomTabPanel className={classes.tabContent} value={value} index={2}>
        <DispatchNotes objectId={dispatchId} />
      </CustomTabPanel>
      <CustomTabPanel className={classes.tabContent} value={value} index={3}>
        <DispatchActivityLogs dispatchId={dispatchId} />
      </CustomTabPanel>
    </Box>
  );
};

DispatchTabs.propTypes = {
  dispatchId: PropTypes.string,
  dispatch: PropTypes.object,
  loading: PropTypes.bool,
};

export default DispatchTabs;
