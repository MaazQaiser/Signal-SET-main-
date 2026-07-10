import { Avatar, Box, Skeleton, Typography } from '@mui/material';
import { ReactComponent as NoDataIcon } from 'assets/images/Nodata.svg';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { dayjsWithStandardOffset } from 'src/app/obx/pages/schedules/helper';
import { formatDate, timeFormat12h } from 'src/helper/utilityFunctions';
import { getActivityLogs } from 'src/services/dispatch.services';
import { toastSettings } from 'src/utils/constants';

import { useStyles } from './DispatchActivityLogs';

const DispatchActivityLogs = ({ dispatchId }) => {
  const classes = useStyles();
  const { t } = useTranslation();

  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchActivityLogs = async () => {
    try {
      setLoading(true);
      const result = await getActivityLogs({ model_name: 'Dispatch', model_id: dispatchId });
      setActivities(result.data || []);
    } catch (error) {
      toast.error(error?.message, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
      setActivities([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    dispatchId && fetchActivityLogs();
  }, [dispatchId]);

  if (loading)
    return (
      <Box className={classes.dispatchSkelton}>
        <Skeleton variant="text" height={'50px'} />
        <Skeleton variant="text" height={'50px'} />
        <Skeleton variant="text" height={'50px'} />
        <Skeleton variant="text" height={'50px'} />
      </Box>
    );

  return (
    <>
      <Typography variant="h3" className={classes.intabHeading}>
        Activity Logs
      </Typography>
      <Box className={classes.activityDrawer}>
        <Box className={classes?.drawerInner}>
          {activities?.map((activity) => (
            <Box className={classes.activityBox} key={activity.id}>
              <Box>
                <Avatar
                  className={classes.eventAvatar}
                  src={activity?.user.image || '/static/images/avatar/1.jpg'}
                />
              </Box>
              <Box>
                <Typography variant="body2">
                  {activity.change_set?.name || t('commonText.nA')}
                </Typography>
                <Typography variant="body3">{`${formatDate(dayjsWithStandardOffset(activity?.timestamp), 'MM/DD/YYYY')}, ${timeFormat12h(activity?.timestamp, true)}`}</Typography>
              </Box>
            </Box>
          ))}
        </Box>

        {!activities?.length && !loading && (
          <Box className={classes.notRecordFounWrapper}>
            <Box className={classes.noRecordFound}>
              <NoDataIcon />
              <Typography variant="h2">{t('commonText.table.noRecordFound')}</Typography>
            </Box>
          </Box>
        )}
      </Box>
    </>
  );
};

DispatchActivityLogs.propTypes = {
  dispatchId: PropTypes.string,
};

export default DispatchActivityLogs;
