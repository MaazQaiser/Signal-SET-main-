import { Box, Button, Chip, Skeleton, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { ReactComponent as CloseIcon } from 'assets/svg/close.svg';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { theme } from 'src/theme';
import { DRAWER_TYPE, SCHEDULE_DUTIES } from 'src/utils/constants/schedules';

import { getCurrentStandardTimeInIsoWrtTimezone } from '../helper';

const useStyles = makeStyles({
  dutyDetailHeader: {
    padding: '24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '16px',
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
  },

  dutyDetailHeaderLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flex: 1,
  },

  dutyDetailHeaderRight: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '12px',
    minWidth: '100px',
  },

  dutyDetailHeaderTitle: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },

  dutyDetailHeaderChip: {
    padding: '2px 8px',
    borderRadius: '16px',
    background: theme.palette.surfaceSuccessSubtle,
    color: theme.palette.textSuccess,
    textAlign: 'center',
    fontSize: '12px',
    fontWeight: '500',
    lineHeight: '18px',
  },

  dutyDetailHeaderClose: {
    '&.MuiButton-root': {
      padding: '0px',
      minWidth: 'auto',
    },
  },

  titleSkeleton: {
    '&.MuiSkeleton-root': {
      width: '164.5px',
      height: '30px',
    },
  },
});

const Header = ({ shiftData, closeDrawer, setShowDrawer, loading, readonly = false }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const [isOngoingShift, setIsOngoingShift] = useState(false);

  const editHandler = (_e) => {
    if (!isOngoingShift) {
      return toast.error(t('obx.schedules.dutyDetail.errors.timePassedError'));
    }

    // open assign duty side drawer
    setShowDrawer({
      open: DRAWER_TYPE.ASSIGN,
      data: {
        shiftId: shiftData?.shiftId,
        startsAt: shiftData?.startsAt,
        site: shiftData?.site || {},
      },
    });
  };

  useEffect(() => {
    if (!shiftData?.endsAt) return;
    setIsOngoingShift(getCurrentStandardTimeInIsoWrtTimezone() < shiftData?.endsAt);
  }, [shiftData?.endsAt]);

  return (
    <Box className={classes.dutyDetailHeader}>
      <Box className={classes.dutyDetailHeaderLeft}>
        {loading ? (
          <Skeleton animation="wave" className={classes.titleSkeleton} />
        ) : (
          <Typography variant="h2" className={classes.dutyDetailHeaderTitle}>
            {shiftData?.shiftType === SCHEDULE_DUTIES.EXTRA
              ? shiftData?.site?.name || ''
              : (shiftData?.site?.name || '') + ' - ' + (shiftData?.name || '')}
          </Typography>
        )}
        {loading ? (
          <Skeleton animation="wave" className={classes.titleSkeleton} />
        ) : (
          <>
            <Chip
              label={
                shiftData?.shiftType === SCHEDULE_DUTIES.EXTRA
                  ? t('obx.schedules.legends.extra')
                  : t('obx.schedules.legends.dedicated')
              }
              size="small"
              color={shiftData?.shiftType === SCHEDULE_DUTIES.EXTRA ? 'warning' : 'success'}
            />
          </>
        )}
      </Box>
      <Box className={classes.dutyDetailHeaderRight}>
        {!readonly && isOngoingShift && (
          <Button variant="primary" onClick={editHandler}>
            {t('links.edit')}
          </Button>
        )}
        <Button
          variant="onlyText"
          className={classes.dutyDetailHeaderClose}
          onClick={() => closeDrawer()}
          disableRipple
        >
          <CloseIcon />
        </Button>
      </Box>
    </Box>
  );
};

Header.propTypes = {
  shiftData: PropTypes.object,
  closeDrawer: PropTypes.func,
  setShowDrawer: PropTypes.func,
  loading: PropTypes.bool,
  readonly: PropTypes.bool,
};

Header.defaultProps = {
  readonly: false,
};
export default Header;
