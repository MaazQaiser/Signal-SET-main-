import { Avatar, Box, Typography } from '@mui/material';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import LogsSkeleton from 'src/app/components/common/skeletonLoader/logsSkeleton';
import NoRecordFound from 'src/app/components/common/table/noRecordFound';
import { dayjsWithStandardOffset } from 'src/app/obx/pages/schedules/helper';
import { fetchShiftLogsById } from 'src/services/duty.services';
import { LogsAction, SCHEDULE_DUTIES } from 'src/utils/constants/schedules';

import { useStyles } from './logs.styles';

dayjs.extend(relativeTime);

const Logs = ({ logId, shiftDate, shiftType }) => {
  const classes = useStyles();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const getShiftLogsDetail = async () => {
    try {
      setLoading(true);
      const response = await fetchShiftLogsById({ logId, shiftDate });
      if (response?.statusCode === 200) {
        setLoading(false);
        return setLogs(response?.data?.logs || []);
      }
      setLoading(false);
      setLogs([]);
    } catch (error) {
      setLoading(false);
      setLogs([]);
    }
  };

  useEffect(() => {
    getShiftLogsDetail(logId);
  }, []);

  if (loading) {
    return (
      <Box className={classes.dutyDetailLogs}>
        <LogsSkeleton noOfRows={8} />
      </Box>
    );
  }

  return (
    <Box className={classes.dutyDetailLogs}>
      {logs?.length > 0 ? (
        <>
          {logs?.map((log) => (
            <LogItem key={log?.id} log={log} shiftType={shiftType} />
          ))}
        </>
      ) : (
        <Box className={classes.dutyDetailLogsCentered}>
          <NoRecordFound type="listing" data={logs} />
        </Box>
      )}
    </Box>
  );
};

Logs.propTypes = {
  logId: PropTypes.string,
  shiftDate: PropTypes.string,
  shiftType: PropTypes.string,
};

export default Logs;

const LogItem = ({ log, shiftType }) => {
  const classes = useStyles();
  const { t } = useTranslation();

  const officerName = log?.officer?.name || t('obx.schedules.dutyDetail.logs.defaultOfficerName');
  const reportTypesLogsMsgs = {
    equipmentInspection: t(
      'obx.schedules.dutyDetail.logs.actions.reportTypes.equipmentInspection',
      { name: officerName },
    ),
    vehicleInspection: t('obx.schedules.dutyDetail.logs.actions.reportTypes.vehicleInspection', {
      name: officerName,
    }),
    tourReports: t('obx.schedules.dutyDetail.logs.actions.reportTypes.tourReports', {
      name: officerName,
    }),
    shiftDayEndReport: t('obx.schedules.dutyDetail.logs.actions.reportTypes.shiftDayEndReport', {
      name: officerName,
    }),
    incidentReport: t('obx.schedules.dutyDetail.logs.actions.reportTypes.incidentReport', {
      name: officerName,
    }),
    checkpoints: t('obx.schedules.dutyDetail.logs.actions.reportTypes.checkpoints', {
      name: officerName,
    }),
    dispatch: t('obx.schedules.dutyDetail.logs.actions.reportTypes.dispatch', {
      name: officerName,
    }),
  };
  const logMessage = {
    [LogsAction.BREAK_STARTED]: t('obx.schedules.dutyDetail.logs.actions.breakStarted', {
      name: officerName,
    }),
    [LogsAction.BREAK_ENDED]: t('obx.schedules.dutyDetail.logs.actions.breakEnded', {
      name: officerName,
    }),
    [LogsAction.SHIFT_STARTED]: t(
      shiftType === SCHEDULE_DUTIES.PATROL
        ? 'obx.schedules.dutyDetail.logs.actions.clockedIn'
        : 'obx.schedules.dutyDetail.logs.actions.shiftStarted',
      {
        name: officerName,
      },
    ),
    [LogsAction.SHIFT_ENDED]: t(
      shiftType === SCHEDULE_DUTIES.PATROL
        ? 'obx.schedules.dutyDetail.logs.actions.clockedOut'
        : 'obx.schedules.dutyDetail.logs.actions.shiftEnded',
      {
        name: officerName,
      },
    ),
    [LogsAction.REPORT_SUBMITTED]: reportTypesLogsMsgs?.[log?.reportType],
    [LogsAction.INCIDENT_REPORT_SUBMITTED]: t(
      'obx.schedules.dutyDetail.logs.actions.incidentReportSubmitted',
      { name: officerName },
    ),
    [LogsAction.TOUR_COMPLETED]: t('obx.schedules.dutyDetail.logs.actions.tourCompleted', {
      name: officerName,
    }),
    [LogsAction.CHECKPOINT_CHECKED]: t('obx.schedules.dutyDetail.logs.actions.checkpointChecked', {
      name: officerName,
    }),
    [LogsAction.NOT_STARTED]: t('obx.schedules.dutyDetail.logs.actions.notStarted', {
      name: officerName,
    }),
    [LogsAction.SHIFT_AUTO_ENDED]: t('obx.schedules.dutyDetail.logs.actions.shiftAutoEnded', {
      name: officerName,
    }),

    [LogsAction.NAVIGATION_STARTED]: t('obx.schedules.dutyDetail.logs.actions.navigationStarted', {
      name: officerName,
    }),
    [LogsAction.NAVIGATION_ENDED]: t('obx.schedules.dutyDetail.logs.actions.navigationEnded', {
      name: officerName,
    }),
    [LogsAction.END_LOC_VISITED]: t('obx.schedules.dutyDetail.logs.actions.endLocationVisited', {
      name: officerName,
    }),
    [LogsAction.NAVIGATION_CANCELLED]: t(
      'obx.schedules.dutyDetail.logs.actions.navigationCancelled',
      {
        name: officerName,
      },
    ),
    [LogsAction.INITIAL_NAVIGATION]: t('obx.schedules.dutyDetail.logs.actions.initialNavigation', {
      name: officerName,
    }),
    [LogsAction.VISIT_ENDED]: t('obx.schedules.dutyDetail.logs.actions.visitEnded', {
      name: officerName,
    }),
    [LogsAction.VISITED_SITE]: t('obx.schedules.dutyDetail.logs.actions.visitedSite', {
      name: officerName,
    }),
    [LogsAction.IS_PAYROLL_APPROVED]: t('obx.schedules.dutyDetail.logs.actions.payrollApproved', {
      name: officerName,
    }),
    [LogsAction.AD_HOC_PAYROLL]: t('obx.schedules.dutyDetail.logs.actions.adhocPayrollAdded', {
      name: officerName,
    }),
  };

  return (
    <Box className={classes.log}>
      <Avatar className={classes.logAvatar} src={log?.officer?.imageUrl} />
      <Box className={classes.logContent}>
        <Box className={classes.logHeader}>
          <Typography variant="subtitle2" className={classes.logTitle}>
            {logMessage?.[log?.action]}
          </Typography>
        </Box>
        <Typography variant="body3" className={classes.logTime}>
          {dayjsWithStandardOffset(log?.time).format('MM/DD/YYYY hh:mm A')}
        </Typography>
      </Box>
    </Box>
  );
};

LogItem.propTypes = {
  log: PropTypes.object,
  shiftType: PropTypes.string,
};
