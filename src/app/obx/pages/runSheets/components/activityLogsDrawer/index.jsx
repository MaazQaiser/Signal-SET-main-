import { Avatar, Button, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import LogsSkeleton from 'src/app/components/common/skeletonLoader/logsSkeleton';
import NoRecordFound from 'src/app/components/common/table/noRecordFound';
import { Clossicon } from 'src/assets/svg';
import { formatDate } from 'src/helper/utilityFunctions';
import { getActivityLogsByPatrolId } from 'src/services/runsheet.services';
import { toastSettings } from 'src/utils/constants';

import { dayjsWithStandardOffset } from '../../../schedules/helper';
import { useStyles } from './ActivityLogsDrawer';

const PatrolActions = {
  CREATED: 'Runsheet Created',
  HIT_ADDED: 'added a hit',
  HIT_DELETED: 'deleted a hit',
  SEQUENCE_CHANGED: 'changed the sequence',
  START_END_LOCATION_UPDATED: 'Starting & ending point updated',
};

function translatePatrolAction(action) {
  const actionMap = {
    [PatrolActions.CREATED]: 'created',
    [PatrolActions.HIT_ADDED]: 'hitAdded',
    [PatrolActions.HIT_DELETED]: 'hitDeleted',
    [PatrolActions.SEQUENCE_CHANGED]: 'sequenceChanged',
    [PatrolActions.START_END_LOCATION_UPDATED]: 'startEndLocationUpdated',
  };

  return actionMap[action];
}

const ActivityLogDrawer = ({ setShowDrawer, patrolTemplateId }) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const closeDrawer = () => {
    setShowDrawer(false);
  };

  const [activityLogsLoading, setActivityLogsLoading] = useState(true);
  const [data, setData] = useState([]);

  const fetchActivityLogs = async () => {
    try {
      const response = await getActivityLogsByPatrolId(patrolTemplateId);
      if (response.statusCode === 200) {
        setData(response?.data || []);
      }
      setActivityLogsLoading(false);
    } catch (error) {
      toast.error(error?.message, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
      setActivityLogsLoading(false);
    }
  };

  useEffect(() => {
    if (patrolTemplateId) {
      fetchActivityLogs();
    }
  }, [patrolTemplateId]);

  return (
    <Box className={classes.activityDrawer}>
      <Box className={classes.drawerHeader}>
        <Typography variant="h2">{t('obx.runsheet.activityLogs')}</Typography>
        <Button
          className={classes.cancelIcon}
          disableRipple
          variant="onlyText"
          onClick={() => {
            closeDrawer();
          }}
        >
          <Clossicon />
        </Button>
      </Box>

      <Box className={classes?.drawerInner}>
        {activityLogsLoading ? (
          <LogsSkeleton noOfRows={8} />
        ) : data?.length > 0 ? (
          data.map((item, index) => (
            <Box key={index} className={classes.activityBox}>
              <Box>
                <Avatar className={classes.eventAvatar} src={item.image} />
              </Box>
              <Box>
                <Typography variant="body2">
                  {item.username}{' '}
                  <Box
                    component={'span'}
                    sx={{
                      textTransform: [
                        PatrolActions.CREATED,
                        PatrolActions.START_END_LOCATION_UPDATED,
                      ].includes(item.action)
                        ? 'none'
                        : 'lowercase',
                    }}
                  >
                    {t(`obx.runsheet.actions.${translatePatrolAction(item.action)}`)}
                  </Box>
                </Typography>
                <Typography variant="body3">{item.siteName}</Typography>
                <Typography variant="body3">
                  {formatDate(dayjsWithStandardOffset(item.time), 'MM/DD/YYYY, hh:mm A')}
                </Typography>
              </Box>
            </Box>
          ))
        ) : (
          <Box className={classes.dutyDetailLogsCentered}>
            <NoRecordFound type="listing" data={[]} />
          </Box>
        )}
      </Box>
    </Box>
  );
};

ActivityLogDrawer.propTypes = {
  setShowDrawer: PropTypes.func,
  patrolTemplateId: PropTypes.number,
};

export default ActivityLogDrawer;
