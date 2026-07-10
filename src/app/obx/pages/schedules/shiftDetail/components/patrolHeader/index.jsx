import { Button, Chip, Skeleton, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import { ReactComponent as ArrowRightIcon } from 'assets/svg/ArrowRightBlack.svg';
import { ReactComponent as DotIcon } from 'assets/svg/dot.svg';
import PropTypes from 'prop-types';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Clossicon } from 'src/assets/svg';
import { formatDate, timeFormat12h } from 'src/helper/utilityFunctions';
import { SCHEDULE_DUTIES } from 'src/utils/constants/schedules';
import { capitalizeFirstLetter } from 'src/utils/string/common';

import { dayjsWithStandardOffset } from '../../../helper';
import { useStyles } from './patrolHeader';

const PatrolHeader = ({
  loading,
  closeDrawer,
  shiftData,
  headerTitle,
  subTitleText,
  handleBackBtn,
  editButtons,
  shiftType,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();
  return (
    <Box className={classes.activityDrawer}>
      <Box className={classes.drawerHeaderNew}>
        <Box className={classes.drawerHeaderTop}>
          {loading ? (
            <>
              <Skeleton animation="wave" className={classes.titleSkeleton} />
              <Skeleton animation="wave" className={classes.titleSkeleton} />
            </>
          ) : (
            <Box className={classes.drawerHeaderLeft}>
              {handleBackBtn && (
                <Button
                  variant="onlyText"
                  className={classes.cancelIcon}
                  onClick={handleBackBtn}
                  disableRipple
                >
                  <ArrowRightIcon />
                </Button>
              )}
              <Typography variant="h3" className={classes.drawerHeaderTitle}>
                {capitalizeFirstLetter(headerTitle)}
              </Typography>
            </Box>
          )}
          <Box style={{ display: 'flex' }}>
            {!loading && editButtons}

            <Button
              className={classes.cancelIcon}
              disableRipple
              variant="onlyText"
              onClick={closeDrawer}
            >
              <Clossicon />
            </Button>
          </Box>
        </Box>
        {!loading && (
          <Box className={classes.drawerHeaderBottom}>
            {subTitleText && (
              <>
                <Typography variant="subtitle2" className={classes.drawerHeaderText}>
                  {capitalizeFirstLetter(subTitleText) || ''}
                </Typography>
                <DotIcon className={classes.dot} />
              </>
            )}
            <Typography variant="subtitle2" className={classes.drawerHeaderText}>
              {timeFormat12h(shiftData?.startsAt, true)} - {timeFormat12h(shiftData?.endsAt, true)}
            </Typography>
            <DotIcon className={classes.dot} />
            <Typography variant="subtitle2" className={classes.drawerHeaderText}>
              {formatDate(dayjsWithStandardOffset(shiftData?.startsAt))}
            </Typography>
            <DotIcon className={classes.dot} />
            <Chip
              sx={
                SCHEDULE_DUTIES.DISPATCH === shiftType
                  ? {
                      color: 'purple',
                      backgroundColor: '#fae4ff',
                      '&:hover': {
                        backgroundColor: '#fae4ff',
                        color: 'purple',
                      },
                    }
                  : {
                      color: '#5cb85c',
                      backgroundColor: '#def1de',
                      '&:hover': {
                        backgroundColor: '#def1de',
                        color: '#5cb85c',
                      },
                    }
              }
              label={
                SCHEDULE_DUTIES.DISPATCH === shiftType
                  ? t('obx.schedules.legends.dispatch')
                  : t('obx.schedules.legends.patrol')
              }
            />
            {!!shiftData?.missingHits && (
              <>
                <DotIcon className={classes.dot} />
                <Chip color="error" label={`${shiftData?.missingHits} Missed hits`} />
              </>
            )}
            {/* <>
              <DotIcon className={classes.dot} />
              <Chip color="warning" label={`${1 + ' / ' + 3} Reassigned`} />
            </> */}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default PatrolHeader;

PatrolHeader.propTypes = {
  loading: PropTypes.bool,
  closeDrawer: PropTypes.func,
  handleBackBtn: PropTypes.func,
  shiftData: PropTypes.object,
  headerTitle: PropTypes.string,
  subTitleText: PropTypes.string,
  shiftType: PropTypes.string,
  editButtons: PropTypes.node,
};
