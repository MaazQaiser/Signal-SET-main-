import { Box, Checkbox, InputLabel } from '@mui/material';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { useTenantLabel } from 'src/hooks/useTenantLabel';

import SupervisorsComponent from './internsComponent';
import AssigneeComponent from './salesPersons';
import { useStyles } from './salesPersonsAndInterns';

const cannotAssignSupervisorToUsers = ['Home Officer'];

const SalesPersonsAndInterns = ({
  formData,
  salesPersons: assignees,
  interns: supervisors,
  isInternChecked,
  setIsInternChecked,
  inputChangedHandler,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();

  const { getLabel } = useTenantLabel();

  return (
    <Box className={classes.conditionBox}>
      <Box className={classes.wrapper}>
        <Box className={classes.assigneeWrapper}>
          <AssigneeComponent
            formData={formData}
            assignees={assignees}
            inputChangedHandler={inputChangedHandler}
          />
        </Box>
        <Box className={classes.assigneeWrapper}>
          {isInternChecked && !cannotAssignSupervisorToUsers.includes(formData?.assignee?.type) && (
            <SupervisorsComponent
              formData={formData}
              inputChangedHandler={inputChangedHandler}
              supervisors={supervisors}
            />
          )}
        </Box>
      </Box>
      <Box className={classes.checkBoxWrapper}>
        <Box className={classes.inineField}>
          <Checkbox
            id="addIntern"
            checked={isInternChecked}
            onChange={() => setIsInternChecked(!isInternChecked)}
            disabled={cannotAssignSupervisorToUsers.includes(formData?.assignee?.type)}
          />
          <InputLabel htmlFor="addIntern">
            {' '}
            {t('sales.locations.associateSupervisor', {
              supervisor: getLabel('roles', 'supervisor'),
            })}
          </InputLabel>
        </Box>
      </Box>
    </Box>
  );
};

SalesPersonsAndInterns.propTypes = {
  formData: PropTypes.object, // Adjust the type accordingly based on the expected data structure
  salesPersons: PropTypes.array, // Adjust the type accordingly based on the expected data structure
  interns: PropTypes.array, // Adjust the type accordingly based on the expected data structure
  isInternChecked: PropTypes.bool,
  setIsInternChecked: PropTypes.func,
  inputChangedHandler: PropTypes.func,
};
export default SalesPersonsAndInterns;
