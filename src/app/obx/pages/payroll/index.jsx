import { Button } from '@mui/material';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import PropTypes from 'prop-types';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import DateRangePickerWithButtons from 'src/app/components/common/RangeDatepicker';
import { DownloadCloud } from 'src/assets/svg';

import { dayjsWithStandardOffset } from '../schedules/helper';
import LockedPayruns from './lockedPayruns';
import OfficerWorkLogs from './officersWorkLogs';
import Payroll from './payrollListing';
import { useStyles } from './PayrollTabs';
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

const today = dayjsWithStandardOffset().startOf('day');

const previousWeek = dayjsWithStandardOffset().subtract(7, 'day').endOf('day');

const params = {
  selectedDates: [previousWeek, today],
};

const SECTIONS = {
  PAYROLL: 0,
  LOCKED_PAYRUN: 1,
  OFFICERS_WORK_LOGS: 2,
};

const PayrollTabs = () => {
  const classes = useStyles();
  const [value, setValue] = React.useState(0);
  const [queryParams, setQueryParams] = React.useState(params);
  const [errors, _setErrors] = React.useState({});
  const [exportModal, setExportModal] = React.useState(false);
  const { t } = useTranslation();
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleDateRange = (name, dates) => {
    const [startDate, endDate] = dates;
    if (
      startDate.isSame(queryParams.selectedDates[0]) &&
      endDate.isSame(queryParams.selectedDates[1])
    )
      return;
    // const differenceInDays = Math.abs(startDate?.diff(endDate, 'day')) || null;
    // if (differenceInDays > 30) {
    //   setErrors({ ...errors, selectedDates: 'You can select maximum 30 days data' });
    //   return;
    // }
    // delete errors.selectedDates;
    // setErrors({ ...errors });
    updateFormHandler(name, dates);
  };

  const updateFormHandler = (name, value) => {
    setQueryParams((prevState) => {
      return {
        ...prevState,
        [name]: value,
      };
    });
  };

  return (
    <Box sx={{ width: '100%' }} className={classes.tabWrapper}>
      <Box
        className={
          value === SECTIONS.PAYROLL
            ? classes.payrollTabButtonTop
            : classes.lockedPayrollTabButtonTop
        }
      >
        <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
          <Tab label="Payroll" {...a11yProps(0)} />
          <Tab label="Locked Payruns" {...a11yProps(1)} />
          <Tab label="Officers Work Logs" {...a11yProps(2)} />
        </Tabs>
        <Box className={classes.userSection}>
          <Box className={classes.invoicesDateRange}>
            {errors?.selectedDates && <span className={classes.error}>{errors.selectedDates}</span>}
            <DateRangePickerWithButtons
              selectedDates={queryParams?.selectedDates}
              setDates={(dates) => {
                handleDateRange('selectedDates', dates);
              }}
              maxDate={today}
            />
          </Box>
          {value === 0 && (
            <Button
              variant="secondaryGrey"
              startIcon={<DownloadCloud />}
              onClick={() => setExportModal(true)}
            >
              {`${t('obx.payroll.exportPayrun')}`}
            </Button>
          )}
        </Box>
      </Box>
      <CustomTabPanel className={classes.tabContent} value={value} index={0}>
        <Payroll
          selectedDates={queryParams?.selectedDates}
          exportModal={exportModal}
          setExportModal={setExportModal}
        />
      </CustomTabPanel>
      <CustomTabPanel className={classes.tabContent} value={value} index={1}>
        <LockedPayruns selectedDates={queryParams?.selectedDates} />
      </CustomTabPanel>
      <CustomTabPanel className={classes.tabContent} value={value} index={2}>
        <OfficerWorkLogs selectedDates={queryParams?.selectedDates} />
      </CustomTabPanel>
    </Box>
  );
};

export default PayrollTabs;
