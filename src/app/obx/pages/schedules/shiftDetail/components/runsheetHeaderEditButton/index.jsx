import { Box, Typography } from '@mui/material';
import PopoverButton from 'commonComponents/popoverButton';
import PropTypes from 'prop-types';
import queryString from 'query-string';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { OBX_RUNSHEET } from 'src/app/router/constant/ROUTE';
import history from 'src/app/router/utils/history';
import { MoreVert } from 'src/assets/svg';
import { ReactComponent as SplitIcon } from 'src/assets/svg/splitDrawerIcon.svg';
import { calendarShiftStatusEnum } from 'src/utils/constants/schedules';

import {
  dayjsWithStandardOffset,
  dayjsWithTimezone,
  getCurrentStandardTimeInIsoWrtTimezone,
} from '../../../helper';
import { useStyles } from './runsheetHeaderEditButton.styles';

const RunsheetHeaderEditButton = (props) => {
  const classes = useStyles();
  const { t } = useTranslation();

  const handleClickSplitRunsheet = () => {
    const { shiftData } = props;
    const query = queryString.stringify(
      {
        startsAt: shiftData.startsAt,
        endsAt: shiftData?.endedAt ? shiftData?.endedAt : shiftData?.endsAt,
        shiftActivityLogId: shiftData?.shiftActivityLogId,
      },
      {
        arrayFormat: 'index',
        skipEmptyString: true,
        skipNull: true,
      },
    );
    history.push(`${OBX_RUNSHEET}/${props.shiftData?.runsheetId}/splitRunSheet?${query}`);
  };

  const _handleGoToEditPage = () => {
    const { shiftData } = props;
    const query = queryString.stringify(
      { startsAt: shiftData.startsAt, endsAt: shiftData?.endsAt, fromSchedule: true },
      {
        arrayFormat: 'index',
        skipEmptyString: true,
        skipNull: true,
      },
    );
    history.push(`${OBX_RUNSHEET}/details/${props.shiftData?.runsheetId}?${query}`);
  };

  const isTodayWrtStandardTime =
    dayjsWithTimezone().date() ===
    dayjsWithStandardOffset(props?.shiftData?.runsheetDetails?.startsAt).date();
  const isOngoingRunsheet =
    getCurrentStandardTimeInIsoWrtTimezone() >= props?.shiftData?.runsheetDetails?.startsAt &&
    getCurrentStandardTimeInIsoWrtTimezone() < props?.shiftData?.runsheetDetails?.endsAt;

  if (
    !props?.shiftData?.startsAt ||
    props.shiftData?.runsheetDetails?.hits.length < 2 ||
    props?.shiftData?.scheduleStatus === calendarShiftStatusEnum.COMPLETED ||
    (!isTodayWrtStandardTime &&
      !isOngoingRunsheet &&
      props?.shiftData?.scheduleStatus !== calendarShiftStatusEnum.IN_PROGRESS)
  ) {
    return <></>;
  }

  return (
    <PopoverButton
      variant="icon"
      Icon={MoreVert}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'start',
      }}
      className={classes.templateActions}
    >
      <Box className={classes.templateActionsMenu}>
        <Box onClick={handleClickSplitRunsheet} className={classes.templateActionsRegular}>
          <SplitIcon />
          <Typography className={classes.templateActionsTextRegular} variant="subtitle2">
            {t('obx.schedules.dutyDetail.runsheetDetail.editButtons.splitRunsheet')}
          </Typography>
        </Box>
      </Box>

      {/* <Box sx={{ padding: '10px 32px 10px 10px', cursor: 'pointer' }} onClick={handleGoToEditPage}>
        <Typography variant="subtitle2" sx={{ color: '#737378' }}>
          View RunSheet
        </Typography>
      </Box> */}
    </PopoverButton>
  );
};

RunsheetHeaderEditButton.propTypes = {
  shiftData: PropTypes.object,
};
export default RunsheetHeaderEditButton;
