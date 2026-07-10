import { Box, Button, Typography } from '@mui/material';
import { ReactComponent as GroupsIcon } from 'assets/svg/GroupsIcon.svg';
import PropTypes from 'prop-types';
import React from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ModalComponent from 'src/app/components/common/modal';
import { updateHolidayGroup } from 'src/services/holidays.service';
import { toastSettings } from 'src/utils/constants';
import { toaster } from 'src/utils/toast';

import { useStyles } from './deleteHolidayGroup';

const DeleteHolidayModal = ({
  openModal,
  handleCloseModal,
  holiday,
  refetchHolidays,
  handleCloseDrawer,
}) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const [buttonDisabled, setButtonDisabled] = useState(false);

  const deleteHolidayGroup = async () => {
    try {
      setButtonDisabled(true);
      const response = await updateHolidayGroup(holiday?.id, {
        status: 'inactive',
      });

      if (response.statusCode === 200) {
        toaster.success({
          text: response?.message,
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
        handleCloseModal();
        setButtonDisabled(false);
        handleCloseDrawer();
        refetchHolidays();
      }
    } catch (error) {
      setButtonDisabled(false);
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  const handleDelete = () => {
    if (holiday?.id) deleteHolidayGroup();
  };

  const deleteModalBody = (
    <Box className={classes.modalWrapper}>
      <GroupsIcon />
      <Box className={classes.modalWrapperIn}>
        <Typography variant="h3" className={classes.headText}>
          {t('obx.settings.preferences.holidayGroups.deactivateGroup')}!
        </Typography>
        <Typography variant="info" className={classes.closetext}>
          {t('obx.settings.preferences.holidayGroups.deactivateGroupSubText')}
        </Typography>
      </Box>

      <Box className={classes.inlineButtons}>
        <Button
          onClick={() => handleCloseModal()}
          disabled={buttonDisabled}
          variant="secondaryGrey"
        >
          {t('obx.settings.preferences.holidayGroups.cancel')}
        </Button>
        <Button variant="destructive" onClick={() => handleDelete()} disabled={buttonDisabled}>
          {t('obx.settings.preferences.holidayGroups.deactivateGroupBtn')}
        </Button>
      </Box>
    </Box>
  );

  return (
    <ModalComponent
      open={openModal}
      // handleClose={handleCloseModal}
      body={deleteModalBody}
    />
  );
};

DeleteHolidayModal.propTypes = {
  openModal: PropTypes.bool,
  handleCloseModal: PropTypes.func,
  holiday: PropTypes.object,
  refetchHolidays: PropTypes.func,
  handleCloseDrawer: PropTypes.func,
};

export default DeleteHolidayModal;
