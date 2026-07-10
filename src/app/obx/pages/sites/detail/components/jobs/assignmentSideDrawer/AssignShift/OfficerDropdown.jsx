import { Avatar, Box, Chip, Skeleton, Typography } from '@mui/material';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import CustomDropDown from 'src/app/components/common/customDropDown';
import FieldError from 'src/app/components/common/fieldError';
import { ReactComponent as WarningIcon } from 'src/assets/svg/info-icon-officer.svg';
import { ReactComponent as DangerIcon } from 'src/assets/svg/not-available-icon-officer.svg';
import { officerUnavailabilityReason, rolesEnum } from 'src/utils/constants';

import { useStyles } from '../assignmentSideDrawer.styles';

const OfficerDropdown = ({
  handleChangeValue,
  selectedValue,
  allOfficers,
  name,
  classNew,
  errorMsg,
  disabled = false,
  label,
  placeHolder,
}) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const currentUserRole = useSelector((state) => state?.auth?.userRole?.slug);

  const handleAssignSupervisor = () => {
    const supervisorData = {
      ...(allOfficers?.assignMe || {}),
      value: allOfficers?.assignMe?.id,
      label: allOfficers?.assignMe?.name,
    };
    const e = {
      target: {
        name,
        value: supervisorData,
      },
    };
    handleChangeValue(e);
  };

  const updatedSelectedValue = selectedValue || {};

  const unassignedOfficers = allOfficers?.unassigned || [];
  const assignedOfficers = allOfficers?.assigned || [];
  const allOfficersData = [
    allOfficers?.unassignOfficer || {},
    ...unassignedOfficers,
    ...assignedOfficers,
  ];

  const isAssignMeDisabled = allOfficers?.assignMe?.disabled;
  const isSupervisorSelected = allOfficers?.assignMe?.id === updatedSelectedValue?.id;

  return (
    <Box>
      {typeof allOfficers === 'undefined' ? (
        <Skeleton className={classes.officerDropdownSkeleton} />
      ) : (
        <CustomDropDown
          label={label || t('obx.schedules.assignDedicatedDuty.assignShift.officerPlaceholder')}
          name={name}
          placeHolder={
            placeHolder || t('obx.schedules.assignDedicatedDuty.assignShift.officerPlaceholder')
          }
          selectedValues={{
            ...updatedSelectedValue,
            image: updatedSelectedValue?.imageUrl,
            value: updatedSelectedValue?.id,
          }}
          options={allOfficersData || []}
          additionalOption={
            rolesEnum.supervisor === currentUserRole && allOfficers?.assignMe ? (
              <Box
                onClick={handleAssignSupervisor}
                className={classNames(
                  classes.assignShiftOfficerMe,
                  isAssignMeDisabled && classes.assignShiftOfficerMeDisabled,
                  isSupervisorSelected && classes.assignShiftOfficerMeSelected,
                )}
              >
                <Box className={classes.singleOfficerOptionLeft}>
                  <Avatar
                    className={classes.singleOfficerOptionImage}
                    src={allOfficers?.assignMe?.imageUrl}
                  />
                  <Typography variant="body2" className={classes.assignShiftOfficerMeText}>
                    {t('obx.schedules.assignDedicatedDuty.assignShift.officerAssignMe')}
                  </Typography>
                </Box>
                <SelectChip officerData={allOfficers?.assignMe} />
              </Box>
            ) : null
          }
          searchable
          overrideOption={(data) => {
            return (
              <Box className={classes.singleOfficerOption}>
                <Box className={classes.singleOfficerOptionLeft}>
                  <Avatar className={classes.singleOfficerOptionImage} src={data?.imageUrl} />
                  <Typography variant="body2" className={classes.singleOfficerOptionText}>
                    {data?.name ? data?.name : data?.label}
                  </Typography>
                </Box>
                <SelectChip officerData={data} />
              </Box>
            );
          }}
          handleChange={handleChangeValue}
          bordered
          className={classNames(classes.assignShiftBodyDropDown, classNew)}
          isError={errorMsg}
          disabled={disabled}
        />
      )}
      <FieldError error={errorMsg} />
    </Box>
  );
};

export default OfficerDropdown;

OfficerDropdown.propTypes = {
  handleChangeValue: PropTypes.func,
  selectedValue: PropTypes.object,
  allOfficers: PropTypes.array,
  name: PropTypes.string,
  classNew: PropTypes.string,
  errorMsg: PropTypes.string,
  disabled: PropTypes.bool,
  label: PropTypes.string,
  placeHolder: PropTypes.string,
};

const SelectChip = ({ officerData }) => {
  const { t } = useTranslation();

  return (
    <>
      {officerData?.reason === officerUnavailabilityReason.OFFLINE && (
        <Chip
          color="error"
          label={t('obx.schedules.assignDedicatedDuty.assignShift.officerUnavailable')}
          icon={<DangerIcon />}
        />
      )}
      {officerData?.reason === officerUnavailabilityReason.ASSIGNED && (
        <Chip
          color="warning"
          label={t('obx.schedules.assignDedicatedDuty.assignShift.officerAllocated')}
          icon={<WarningIcon />}
        />
      )}
    </>
  );
};

SelectChip.propTypes = {
  officerData: PropTypes.object,
};
