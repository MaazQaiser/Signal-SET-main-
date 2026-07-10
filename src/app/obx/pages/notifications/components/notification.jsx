import { Box, Typography } from '@mui/material';
import { ReactComponent as ChevronRightIcon } from 'assets/svg/chevron-right.svg';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import { getDisplayConfiguration } from 'src/redux/store/slices/regionalCountryConfiguration';

import { dayjsWithStandardOffset } from '../../schedules/helper';
import { useStyles } from '../notifications.styles';

const Notification = ({ notification, reference }) => {
  const classes = useStyles();
  const { timePrecision } = useSelector(getDisplayConfiguration);
  const history = useHistory();

  const handleRedirect = () => {
    if (notification?.data?.redirectUrl) {
      history.push(`/${notification?.data?.redirectUrl}`);
    }
  };

  return (
    <Box className={classes.notificationsMenuItemWrapper}>
      <Box
        ref={reference}
        role="button"
        onClick={handleRedirect}
        className={classes.notificationsMenuItem}
      >
        <img src={notification?.iconUrl} className={classes.notificationsMenuItemIcon} />

        <Box className={classes.notificationsMenuItemDetail}>
          <Typography variant="subtitle1" className={classes.notificationsMenuItemTitle}>
            {notification?.title}
          </Typography>
          <Box className={classes.dateWrapper}>
            <Typography variant="body3" className={classes.notificationsMenuItemDate}>
              {dayjsWithStandardOffset(notification?.createdAt).format('MMM DD ')}
              {dayjs(notification?.createdAt).format(timePrecision)}
            </Typography>
            <Box className={classes.notificationsMenuItemAction}>
              <ChevronRightIcon />
            </Box>
          </Box>
        </Box>
      </Box>
      <Typography variant="body3" className={classes.notificationsMenuItemText}>
        {notification?.body}
      </Typography>
    </Box>
  );
};

Notification.propTypes = {
  notification: PropTypes.object,
  loading: PropTypes.bool,
  notificationTypeColors: PropTypes.object,
  reference: PropTypes.any,
};

export default Notification;
