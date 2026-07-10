import { Box, Button, InputLabel, Skeleton, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import CustomDropDown from 'src/app/components/common/customDropDown';
import ModalComponent from 'src/app/components/common/modal';
import useFormHook from 'src/hooks/useFormHook';
import { addSupervisor } from 'src/services/runsheet.services';
import { getSupervisors } from 'src/services/user.services';
import transformArrayForOptions from 'src/utils/array/transformArrayForOptions';
import { toastSettings } from 'src/utils/constants';

import { useStyles } from '../runsheetStyle';

const AddSupervisorModal = ({ open, onClose, fetchSupervisors }) => {
  const classes = useStyles();
  const { t } = useTranslation();

  const {
    formData,
    setFormData,
    errorMessages,
    setErrorMessages,
    handleInputChange,
    disabled,
    setDisabled,
    updateFormHandler,
  } = useFormHook({
    defaultFormData: {
      selectedSupervisor: null,
      dropdownData: [],
      loadingDropdown: true,
    },
  });

  const fetchSupervisorOptions = async () => {
    try {
      const response = await getSupervisors();

      updateFormHandler('dropdownData', transformArrayForOptions(response, 'name', 'id'));
      updateFormHandler('loadingDropdown', false);
    } catch (error) {
      updateFormHandler('loadingDropdown', false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessages({});

    const payload = {
      supervisor_id: formData?.selectedSupervisor?.id,
    };

    if (payload.supervisor_id) {
      try {
        setDisabled(true);
        const response = await addSupervisor(payload);

        if (response?.statusCode === 200) {
          toast.success(response?.message, {
            position: 'top-right',
            autoClose: toastSettings.AUTO_CLOSE,
          });
        }

        fetchSupervisors();
        handleCloseModal();
      } catch (error) {
        toast.error(error?.message, {
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
      } finally {
        setDisabled(false);
      }
    } else {
      setErrorMessages({
        selectedSupervisor: t('obx.settings.preferences.runsheetSettings.errorMessage'),
      });
    }
  };

  const handleCloseModal = () => {
    setErrorMessages({});
    onClose();
    setFormData((prevState) => ({
      ...prevState,
      selectedSupervisor: null,
    }));
  };

  useEffect(() => {
    fetchSupervisorOptions();
  }, []);

  const addOfficerBody = (
    <Box className={classes.editModal}>
      <Box className={classes.editModalHeader}>
        <Typography variant="h3" className={classes.editModalTitle}>
          {t('obx.settings.preferences.runsheetSettings.addSupervisor')}
        </Typography>
      </Box>

      <Typography variant="body2" className={classes.editModalText}>
        {t('obx.settings.preferences.runsheetSettings.addSupervisorText')}
      </Typography>

      <Box className={classes.addOfficerDropdown}>
        <InputLabel>{t('obx.settings.preferences.runsheetSettings.addSupervisorLabel')}</InputLabel>
        {formData.loadingDropdown ? (
          <Skeleton className={classes.dropDownSkeleton} />
        ) : (
          <CustomDropDown
            name="selectedSupervisor"
            placeHolder={t('obx.settings.preferences.runsheetSettings.dropdownPlaceholder')}
            selectedValues={formData?.selectedSupervisor || {}}
            handleChange={handleInputChange}
            bordered
            searchable
            options={formData.dropdownData}
            className={classes.addOfficerDropdownField}
            isError={!!errorMessages.selectedSupervisor}
          />
        )}
        {errorMessages.selectedSupervisor && (
          <Box className={classes.invalidFeedback}>{errorMessages.selectedSupervisor}</Box>
        )}
      </Box>

      <Box className={classes.editModalActions}>
        <Button variant="secondaryGrey" onClick={handleCloseModal} disabled={disabled}>
          {t('obx.visitorsLoadsOfficer.cancel')}
        </Button>
        <Button onClick={handleSubmit} variant="primary" disabled={disabled}>
          {t('obx.settings.preferences.runsheetSettings.save')}
        </Button>
      </Box>
    </Box>
  );

  return <ModalComponent open={open} handleClose={onClose} body={addOfficerBody} />;
};

AddSupervisorModal.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  fetchSupervisors: PropTypes.func,
};

export default AddSupervisorModal;
