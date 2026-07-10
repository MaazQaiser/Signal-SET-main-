import { Skeleton, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import sitePlaceHolderImage from 'assets/svg/Site-Placeholder.svg';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import CustomDropDown from 'src/app/components/common/customDropDown';

import { SHIFT_TIME_OPTIONS } from '../../../dispatch.constant';
import All from '../all';
import Jobs from '../jobs';
import { useStyles } from './AssignDispactchTabs';

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

const AssignDispactchTabs = ({
  jobs,
  selectedJob,
  officers,
  selectedOfficers,
  minutes,
  selectedTab,
  loading,
  showSupervisorList,
  handleOfficerChange,
  handleShiftChange,
  handleJobChange,
  handleTabChange,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();

  const officersOptions = officers.map((officer) => ({
    label: officer.name,
    value: officer.id,
    image: officer.image || sitePlaceHolderImage,
  }));

  return (
    <Box sx={{ width: '100%' }} className={classNames(classes.tabWrapper, 'innerScrollBar')}>
      <Box className={classes.tabBarWrap}>
        <Box className={classes.tabsLabesl}>
          <Typography>Jobs:</Typography>
          <Box className={classes.payrollTabButtonTops}>
            <Tabs
              value={selectedTab}
              onChange={(_, value) => handleTabChange(value)}
              aria-label="basic tabs example"
            >
              <Tab label="All" {...a11yProps(0)} />
              <Tab label="Dedicated" {...a11yProps(1)} />
              <Tab label="Patrol" {...a11yProps(2)} />
            </Tabs>
          </Box>
        </Box>
        <Box className={classes.dropdownWrapper}>
          <CustomDropDown
            label="Show active shifts within"
            name="minutes"
            options={SHIFT_TIME_OPTIONS}
            selectedValues={minutes || SHIFT_TIME_OPTIONS?.[0]?.value}
            handleChange={handleShiftChange}
          />
          <CustomDropDown
            label="All Officers"
            name="officerIds"
            searchable={true}
            options={officersOptions}
            selectedValues={selectedOfficers || []}
            multiSelect={true}
            clearAll={true}
            checkmark={true}
            handleChange={handleOfficerChange}
          />
        </Box>
      </Box>

      {loading ? (
        <Box>
          <Box className={classes.skeletonWrapper}>
            <Skeleton variant="rounded" width={150} height={18} />
            <Skeleton variant="rounded" width={'100%'} height={74} />
            <Skeleton variant="rounded" width={'100%'} height={74} />
          </Box>
          <Box className={classes.skeletonWrapper}>
            <Skeleton variant="rounded" width={150} height={18} />
            <Skeleton variant="rounded" width={'100%'} height={74} />
            <Skeleton variant="rounded" width={'100%'} height={74} />
            <Skeleton variant="rounded" width={'100%'} height={74} />
          </Box>
        </Box>
      ) : (
        <>
          <CustomTabPanel className={classes.tabContent} value={selectedTab} index={0}>
            <All
              jobs={jobs}
              selectedJob={selectedJob}
              showSupervisorList={showSupervisorList}
              handleJobChange={handleJobChange}
            />
          </CustomTabPanel>
          <CustomTabPanel className={classes.tabContent} value={selectedTab} index={1}>
            <Jobs
              jobs={jobs?.dedicatedJobs}
              label={t('obx.dispatch.dedicatedJobs')}
              selectedJob={selectedJob}
              handleJobChange={handleJobChange}
              type="dedicated"
            />
          </CustomTabPanel>
          <CustomTabPanel className={classes.tabContent} value={selectedTab} index={2}>
            <Jobs
              jobs={jobs?.patrolJobs}
              label={t('obx.dispatch.patrolJobs')}
              selectedJob={selectedJob}
              handleJobChange={handleJobChange}
              type="patrol"
            />
          </CustomTabPanel>
        </>
      )}
    </Box>
  );
};

AssignDispactchTabs.propTypes = {
  jobs: PropTypes.object,
  selectedJob: PropTypes.object,
  officers: PropTypes.array,
  selectedOfficers: PropTypes.array,
  minutes: PropTypes.object,
  selectedTab: PropTypes.string,
  loading: PropTypes.bool,
  showSupervisorList: PropTypes.bool,
  handleOfficerChange: PropTypes.func,
  handleShiftChange: PropTypes.func,
  handleJobChange: PropTypes.func,
  handleTabChange: PropTypes.func,
};

export default AssignDispactchTabs;
