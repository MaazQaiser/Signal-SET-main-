import { Box, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { ReactComponent as WarningIcon } from 'assets/svg/warning.svg';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import PopoverButton from 'src/app/components/common/popoverButton';
import { MoreVert } from 'src/assets/svg';
import { cancelPastHitOfRunsheet } from 'src/services/duty.services';
import { toastSettings } from 'src/utils/constants';
import { calendarShiftStatusEnum, DRAWER_TYPE } from 'src/utils/constants/schedules';

const useStyles = makeStyles((_theme) => ({
  modalContainer: {
    '& .MuiBackdrop-root ': {
      '& .MuiBox-root': {
        maxWidth: '500px',
        width: '400px !important',
        margin: '0 auto',
      },
    },
  },
  dropItem: {
    cursor: 'pointer',
    padding: '10px 32px 10px 10px',
    '&:hover': {
      backgroundColor: '#F5F5F6',
    },
  },
}));

import { visitTypes } from 'src/app/components/salesComponents/contractCreation/addServices/helper';

import { getCurrentStandardTimeInIsoWrtTimezone } from '../../../helper';
import NoteModal, { notesCharacterLimit } from '../../Notes/createNotesModal/NoteModal';

const HitHeaderEditButtons = ({
  closeDrawer,
  getAllDuties,
  hitData,
  setIsReassignHit,
  changeOnlyDrawerType,
}) => {
  const { t } = useTranslation();
  const [isCancelHit, setIsCancelHit] = useState(false);
  const [noteValue, setNoteValue] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const classes = useStyles();

  const handleShowCancelHit = () => {
    setIsCancelHit(true);
  };
  const handleCloseCancelHit = () => {
    setIsCancelHit(false);
    setNoteValue('');
    setErrorMessage('');
  };
  const handleChangeNoteValue = (event) => {
    const data = event?.target?.value;
    setNoteValue(data);

    if (data) {
      setErrorMessage('');
    }
  };

  const handleCancelHit = async () => {
    if (!noteValue) {
      return setErrorMessage(t('obx.schedules.dutyDetail.notes.addNotesErrorMsg'));
    }
    if (noteValue?.length > notesCharacterLimit) {
      return setErrorMessage(
        t('obx.schedules.dutyDetail.notes.addNotesTextLimitErrorMsg', {
          limit: notesCharacterLimit,
        }),
      );
    }

    try {
      const payload = {
        hitId: hitData?.hitId,
        note: noteValue,
      };

      const res = await cancelPastHitOfRunsheet({
        logId: hitData?.shiftActivityLogId,
        payload,
      });

      handleCloseCancelHit();
      closeDrawer();
      getAllDuties();

      toast.success(res?.message, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    } catch (error) {
      toast.error(error?.message, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  const handleShowEditTour = () => {
    changeOnlyDrawerType(DRAWER_TYPE.TOUR_ASSIGNMENT)();
  };

  const isPastHit = getCurrentStandardTimeInIsoWrtTimezone() > hitData?.endsAt;
  const allowEditTour =
    !isPastHit &&
    hitData?.scheduleStatus !== calendarShiftStatusEnum.IN_PROGRESS &&
    !!hitData?.tour &&
    hitData?.visitType === visitTypes.RANDOM;
  const allowCancelOrReassignHit = hitData?.scheduleStatus === calendarShiftStatusEnum.MISSED;

  if (!allowEditTour && !allowCancelOrReassignHit) return <></>;

  return (
    <>
      <PopoverButton
        variant="icon"
        Icon={MoreVert}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'start',
        }}
      >
        {allowCancelOrReassignHit && (
          <Box className={classes.dropItem} onClick={handleShowCancelHit}>
            <Typography variant="subtitle2" sx={{ color: '#737378' }}>
              {t('obx.schedules.dutyDetail.hitDetail.editButtons.cancelHit')}
            </Typography>
          </Box>
        )}
        {allowEditTour && (
          <Box className={classes.dropItem} onClick={handleShowEditTour}>
            <Typography variant="subtitle2" sx={{ color: '#737378' }}>
              {t('obx.schedules.dutyDetail.hitDetail.editButtons.editTour')}
            </Typography>
          </Box>
        )}
        {allowCancelOrReassignHit && (
          <Box className={classes.dropItem} onClick={() => setIsReassignHit(true)}>
            <Typography variant="subtitle2" sx={{ color: '#737378' }}>
              {t('obx.schedules.dutyDetail.hitDetail.editButtons.reassignHit')}
            </Typography>
          </Box>
        )}
      </PopoverButton>

      <NoteModal
        {...{
          icon: (
            <>
              <WarningIcon />
            </>
          ),

          title: t('obx.schedules.dutyDetail.cancelHit.title'),
          description: t('obx.schedules.dutyDetail.cancelHit.description'),
          cancelBtnText: t('obx.schedules.dutyDetail.cancelHit.cancel'),
          saveBtnText: t('obx.schedules.dutyDetail.cancelHit.save'),
          open: isCancelHit,
          handleCloseModal: handleCloseCancelHit,
          noteValue,
          handleChangeNoteValue,
          errorMessage,
          handleCancelBtn: handleCloseCancelHit,
          handleSaveBtn: handleCancelHit,
          className: classes.modalContainer,
        }}
      />
    </>
  );
};

export default HitHeaderEditButtons;

HitHeaderEditButtons.propTypes = {
  closeDrawer: PropTypes.func,
  getAllDuties: PropTypes.func,
  setIsReassignHit: PropTypes.func,
  hitData: PropTypes.object,
  changeOnlyDrawerType: PropTypes.func,
};
