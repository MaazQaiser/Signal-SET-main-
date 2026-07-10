import { Avatar, Box, Button, Skeleton, Typography } from '@mui/material';
import { ReactComponent as NoDataIcon } from 'assets/images/Nodata.svg';
// import { ReactComponent as TrackDispatchIcon } from 'assets/svg/TrackDispatchIcon.svg';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
// import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
// import Upload from 'src/assets/images/OuterFrame.png';
import { formatDate } from 'src/helper/utilityFunctions';
import { getDispatchLogs } from 'src/services/dispatch.services';
import { toastSettings } from 'src/utils/constants';

import { dayjsWithStandardOffset } from '../../../schedules/helper';
import { DISPATCH_STATUS_ENUM } from '../../dispatch.constant';
import CloseDispatchModal from '../closeDispatchModal';
import { useStyles } from './DispatchLogs.style';

const DispatchLogs = ({ dispatch, dispatchId, onDispatchClose }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  // const userRole = useSelector((state) => state.auth.userRole);

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const [openModal, setOpenModal] = useState(false);
  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);

  const handleDispatchClose = (dispatch) => {
    onDispatchClose({ ...dispatch, status: 'close' });
    fetchDispatchLogs();
  };

  const fetchDispatchLogs = async () => {
    setLoading(true);
    try {
      const response = await getDispatchLogs(dispatchId);
      if (response && response?.statusCode === 200) {
        setLogs(response?.data?.dispatch?.logs || []);
      }
      setLoading(false);
    } catch (error) {
      toast.error(error?.message, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
      setLoading(false);
    }
  };

  const renderLog = (log) => {
    const Icon = DISPATCH_STATUS_ENUM?.[log?.status]?.icon;
    return (
      <Box key={log.id} className={classes.activityBox}>
        <Box sx={{ zIndex: 99 }}>
          {Icon ? (
            <Icon />
          ) : (
            <Avatar className={classes.eventAvatar} src="/static/images/avatar/1.jpg" />
          )}
        </Box>
        <Box>
          <Typography variant="body2">
            {DISPATCH_STATUS_ENUM?.[log?.status]?.label || log?.status}
          </Typography>
          <Typography variant="body3">
            {formatDate(dayjsWithStandardOffset(log.datetime), 'MM/DD/YYYY, hh:mm a')}
          </Typography>
          {log?.reason && <Typography variant="body3">{log?.reason}</Typography>}
        </Box>
      </Box>
    );
  };

  const renderLogs = () => {
    return loading ? (
      <Box className={classes.tabsSkelton}>
        <Skeleton variant="text" height={'50px'} />
        <Skeleton variant="text" height={'50px'} />
        <Skeleton variant="text" height={'50px'} />
        <Skeleton variant="text" height={'50px'} />
      </Box>
    ) : (
      <Box className={classes?.drawerInner}>
        {!logs?.length && !loading ? (
          <Box className={classes.notRecordFounWrapper}>
            <Box className={classes.noRecordFound}>
              <NoDataIcon />
              <Typography variant="h2">{t('commonText.table.noRecordFound')}</Typography>
            </Box>
          </Box>
        ) : (
          logs.map((log) => renderLog(log))
        )}
      </Box>
    );
  };

  useEffect(() => {
    dispatchId && fetchDispatchLogs();
  }, [dispatchId]);

  return (
    <>
      {/* {userRole?.slug === rolesEnum.franchiseOwner && (
        <Link className={classes.imgBox}>
          <img src={Upload} />
          <Box className={classes.linkBox}>
            <Typography variant="subtitle2" className={classes.linkBoxHeading}>
              {`${t('obx.dispatch.trackDispatch')}`}
            </Typography>
            <TrackDispatchIcon />
          </Box>
        </Link>
      )} */}
      <Typography variant="h4" className={classes.intabHeading}>
        {`${t('obx.dispatch.dispatchLogs')}`}
      </Typography>
      <Box className={classes.activityDrawer}>{renderLogs()}</Box>

      {![DISPATCH_STATUS_ENUM.close.value, DISPATCH_STATUS_ENUM.completed.value].includes(
        dispatch?.status,
      ) && (
        <Button variant="destructiveSecondary" onClick={handleOpenModal}>
          {`${t('obx.dispatch.closeDispatch')}`}
        </Button>
      )}
      <CloseDispatchModal
        openModal={openModal}
        dispatch={dispatch}
        handleCloseModal={handleCloseModal}
        onDispatchClose={handleDispatchClose}
      />
    </>
  );
};

DispatchLogs.propTypes = {
  dispatchId: PropTypes.string,
  onCloseDispatch: PropTypes.func,
  onDispatchClose: PropTypes.func,
  dispatch: PropTypes.object,
};

export default DispatchLogs;
