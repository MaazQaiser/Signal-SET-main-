import { Box, Chip, Skeleton, Tooltip, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  dayjsWithStandardOffset,
  getTimeDiff,
  getTimeDiffWithFormat,
} from 'src/app/obx/pages/schedules/helper';
import { formatDate, timeFormat12h } from 'src/helper/utilityFunctions';

// import usePersistentApiData from 'src/hooks/usePresistantApiData';
// import { getDispatchTypes } from 'src/services/dispatch.services';
import { DISPATCH_STATUS_ENUM } from '../../../dispatch.constant';
import { useStyles } from './dipacthDetails';

const showTimeElapsedWarning = (dispatch) => {
  return (
    getTimeDiff(dispatch?.createdAt, new Date(), 'minute') > dispatch?.threshold &&
    dispatch?.status === DISPATCH_STATUS_ENUM.assigned.value
  );
};

const DipacthDetails = ({ dispatch, loading }) => {
  const classes = useStyles();

  const { t } = useTranslation();
  const NA = t('commonText.nA');
  // const { data: DISPATCH_TYPE_ENUM } = usePersistentApiData('dispatch-types', getDispatchTypes);

  const warning = showTimeElapsedWarning(dispatch);

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
    <Box className={classes.dipacthDetails}>
      <Box className={classes.dipatchInfoRow}>
        <Typography variant="h3" className={classes.intabHeading}>
          {`${t('obx.dispatch.generalInformation')}`}
        </Typography>
        <Box className={classes.dipatchRowBox}>
          <Box className={classes.dipatchRowDate}>
            <Typography variant="body3" className={classes.textLabel}>
              {`${t('obx.dispatch.id')}`}
            </Typography>
            <Typography variant="body2" className={classes.textDetail}>
              {dispatch?.uuid || NA}
            </Typography>
          </Box>
          <Box className={classes.dipatchRowDate}>
            <Typography variant="body3" className={classes.textLabel}>
              {`${t('obx.dispatch.createdBy')}`}
            </Typography>
            <Typography variant="body2" className={classes.textDetail}>
              {dispatch?.createdBy}
            </Typography>
          </Box>
          <Box className={classes.dipatchRowDate}>
            <Typography variant="body3" className={classes.textLabel}>
              {`${t('obx.dispatch.createdAt')}`}
            </Typography>
            <Typography variant="body2" className={classes.textDetail}>
              {`${formatDate(dayjsWithStandardOffset(dispatch?.createdAt), 'MM/DD/YYYY')} -
              ${timeFormat12h(dispatch?.createdAt, true)}`}
            </Typography>
          </Box>
          <Box className={classes.dipatchRowDate}>
            <Typography variant="body3" className={classes.textLabel}>
              {`${t('obx.dispatch.timeElapsed')}`}
            </Typography>
            {warning ? (
              <Tooltip title={`${t('obx.dispatch.alertsMRTsTooltip')}`} arrow>
                <Chip
                  label={getTimeDiffWithFormat(dispatch?.createdAt, new Date())}
                  className={classes.pulseAnimation}
                />
              </Tooltip>
            ) : (
              <Chip
                label={getTimeDiffWithFormat(dispatch?.createdAt, new Date())}
                className={classes.textLabelChip}
              />
            )}
          </Box>
        </Box>
      </Box>
      <Box className={classes.space}></Box>
      <Box className={classes.dipatchInfoRow}>
        <Typography variant="h3" className={classes.intabHeading}>
          {`${t('obx.dispatch.callerDetails')}`}
        </Typography>
        <Box className={classes.dipatchRowBox}>
          <Box className={classes.dipatchRowDate}>
            <Typography variant="body3" className={classes.textLabel}>
              {`${t('obx.dispatch.callerPhoneNo')}`}
            </Typography>
            <Typography variant="body2" className={classes.textDetail}>
              {dispatch?.callerDetail?.phoneNo || NA}
            </Typography>
          </Box>
          <Box className={classes.dipatchRowDate}>
            <Typography variant="body3" className={classes.textLabel}>
              {`${t('obx.dispatch.callerName')}`}
            </Typography>
            <Typography variant="body2" className={classes.textDetail}>
              {dispatch?.callerDetail?.callerName || NA}
            </Typography>
          </Box>
          <Box className={classes.dipatchRowDate}>
            <Typography variant="body3" className={classes.textLabel}>
              {`${t('obx.dispatch.buildingNumber')}`}
            </Typography>
            <Typography variant="body2" className={classes.textDetail}>
              {dispatch?.callerDetail?.buildingNumber || NA}
            </Typography>
          </Box>
        </Box>
        <Box className={classes.dipatchRowDateFull}>
          <Typography variant="body3" className={classes.textLabel}>
            {`${t('obx.dispatch.callerAddress')}`}
          </Typography>
          <Typography variant="body2" className={classes.textDetail}>
            {dispatch?.callerDetail?.address || NA}
          </Typography>
        </Box>
      </Box>
      <Box className={classes.space}></Box>
      <Box className={classes.dipatchInfoRow}>
        <Typography variant="h3" className={classes.intabHeading}>
          {`${t('obx.dispatch.dispatchDetails')}`}
        </Typography>
        <Box className={classes.dipatchRowBox}>
          <Box className={classes.dipatchRowDate}>
            <Typography variant="body3" className={classes.textLabel}>
              {`${t('obx.dispatch.callBackRequest')}`}
            </Typography>
            <Typography variant="body2" className={classes.textDetail}>
              {dispatch?.callerDetail?.callbackRequest ? 'Yes' : 'No'}
            </Typography>
          </Box>
          <Box className={classes.dipatchRowDate}>
            <Typography variant="body3" className={classes.textLabel}>
              {`${t('obx.dispatch.dispatchType')}`}
            </Typography>
            <Typography variant="body2" className={classes.textDetail}>
              {dispatch?.dispatchType || NA}
            </Typography>
          </Box>
        </Box>
        <Box className={[classes.dipatchRowDateFull, classes.dipatchRowDate]}>
          <Typography variant="body3" className={classes.textLabel}>
            {`${t('obx.dispatch.callDescription')}`}
          </Typography>
          <Typography variant="body2" className={classes.textDetail}>
            <Box
              dangerouslySetInnerHTML={{
                __html: dispatch?.callerDetail?.description || NA,
              }}
            />
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

DipacthDetails.propTypes = {
  loading: PropTypes.bool,
  dispatch: PropTypes.object,
};

export default DipacthDetails;
