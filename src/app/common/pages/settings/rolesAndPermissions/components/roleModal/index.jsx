import { Alert, Box, Button, Typography } from '@mui/material';
import { ReactComponent as InfoIcon } from 'assets/svg/info_filled.svg';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import CustomDropDown from 'src/app/components/common/customDropDown';
import ModalComponent from 'src/app/components/common/modal';
import CustomInput from 'src/app/components/common/templates/customInput';
import useFormHook from 'src/hooks/useFormHook';
import { createNewRole } from 'src/services/settings.services';
import { organizationLevels, rolesEnum, toastSettings } from 'src/utils/constants';
import { toaster } from 'src/utils/toast';

import formValidatorJoi from '../../../../../../../utils/formValidator/formValidator.requiredCheck';
import { useStyles } from './roleModalStyle';

const initialFormData = {
  roleableType: {},
  name: '',
};
const RoleModalBody = ({ handleCloseModal, _handleSubmit = () => {}, refetch = () => {} }) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const { handleInputChange, formData, errorMessages, setErrorMessages } = useFormHook({
    defaultFormData: initialFormData,
  });
  const authUser = useSelector((data) => data?.auth?.userRole?.slug);
  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    handleCloseModal();
  };
  const handleFormSubmit = async () => {
    try {
      setLoading(true);
      let payload = { name: formData?.name };
      if (authUser === rolesEnum.homeOfficer) {
        payload = { ...payload, roleableType: formData?.roleableType?.value || null };
      }

      const errors = await formValidatorJoi(payload, t);
      if (Object.keys(errors)?.length) {
        console.log({ errors });
        setErrorMessages(errors);
        return;
      }
      const result = await createNewRole(payload);
      if (result?.statusCode === 201) {
        toaster.success({
          text: result.message,
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
        handleClose();
        refetch();
      }
    } catch (e) {
      toaster.error({
        text: e?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className={classes.modalWrapper}>
      <Typography variant="h3" className={classes.headText}>
        {t('sales.rolesPermissions.addNewRole')}
      </Typography>
      <Alert severity="info" className={classes.alert} icon={<InfoIcon />}>
        {t('sales.rolesPermissions.addNewRoleText')}
      </Alert>
      {authUser === rolesEnum.homeOfficer && (
        <Box className={classes.dropdownWrapper}>
          <Typography variant="subtitle2" className={classes.dropdownLabel}>
            {t('sales.rolesPermissions.selectRole')}
          </Typography>
          <CustomDropDown
            label={t('sales.rolesPermissions.selectRole')}
            options={organizationLevels}
            selectedValues={formData?.roleableType}
            handleChange={handleInputChange}
            name="roleableType"
            disabled={loading}
            isError={!!errorMessages?.roleableType}
            bordered
          />
        </Box>
      )}
      <CustomInput
        label={t('sales.rolesPermissions.roleName')}
        onChange={handleInputChange}
        value={formData?.name}
        name="name"
        disabled={loading}
        errorMessage={errorMessages?.name}
      />

      <Box className={classes.inlineButtons}>
        <Button onClick={handleClose} disabled={loading} variant="secondaryGrey">
          {t('sales.rolesPermissions.cancel')}
        </Button>
        <Button variant="primary" onClick={handleFormSubmit} disabled={loading}>
          {t('sales.rolesPermissions.createRole')}
        </Button>
      </Box>
    </Box>
  );
};

RoleModalBody.propTypes = {
  handleCloseModal: PropTypes.func,
  _handleSubmit: PropTypes.func,
  refetch: PropTypes.func,
};

const RoleModal = ({ openModal, handleCloseModal, _handleSubmit, refetch = () => {} }) => {
  return (
    <ModalComponent
      open={openModal}
      // handleClose={handleCloseModal}
      body={
        <RoleModalBody
          handleCloseModal={handleCloseModal}
          _handleSubmit={_handleSubmit}
          refetch={refetch}
        />
      }
    />
  );
};

RoleModal.propTypes = {
  openModal: PropTypes.bool,
  handleCloseModal: PropTypes.func,
  _handleSubmit: PropTypes.func,
  refetch: PropTypes.func,
};

export default RoleModal;
