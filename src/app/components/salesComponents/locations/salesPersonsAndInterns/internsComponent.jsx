import { Box, InputLabel } from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import CustomDropDown from 'src/app/components/common/customDropDown';
import { useTenantLabel } from 'src/hooks/useTenantLabel';

import { useStyles } from './salesPersonsAndInterns';

const SupervisorsComponent = ({ formData, inputChangedHandler, supervisors }) => {
  const { t } = useTranslation();
  const classes = useStyles();

  const { getLabel } = useTenantLabel();

  return (
    <Box>
      <Box>
        <InputLabel>
          {t('sales.locations.associatedSupervisor', {
            supervisor: getLabel('roles', 'supervisor'),
          })}
        </InputLabel>
        <CustomDropDown
          name="associatedSupervisor"
          id="associatedSupervisor"
          label={getLabel('roles', 'supervisor')}
          options={supervisors || []}
          selectedValues={formData?.associatedSupervisor || {}}
          handleChange={inputChangedHandler}
          placeHolder={t('sales.locations.selectAssociatedSupervisor', {
            supervisor: getLabel('roles', 'supervisor'),
          })}
          searchable
          bordered
          className={classes.dropHigh}
          // showEmailInLine={true}
        />
      </Box>
    </Box>
  );
};

SupervisorsComponent.propTypes = {
  formData: PropTypes.object, // Adjust the type accordingly based on the expected data structure
  inputChangedHandler: PropTypes.func,
  supervisors: PropTypes.array, // Adjust the type accordingly based on the expected data structure
};

export default React.memo(SupervisorsComponent);
