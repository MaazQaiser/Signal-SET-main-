import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { ACL_PROPERTIES_UPDATE } from 'src/app/router/constant/SALESMODULE';
import { getDealOwnerOptions } from 'src/services/deal.service';
import transformArrayForOptions from 'src/utils/array/transformArrayForOptions';
import userHasPermission from 'src/utils/auth/userHasPermission';
import { toastSettings } from 'src/utils/constants';
import { updateSelectedOption } from 'src/utils/dropdownSelectedValue';

import DrawerFooter from '../../components/drawerFooter';
import DrawerHeader from '../../components/drawerHeader';
import SalesPersonsAndInterns from '../salesPersonsAndInterns';
import { locationDropDownNames } from '../sidebarDropdowns/editLocation.constant';
import { useStyles } from './assignedTo';
import { detailPageDropDowns } from './location.constant';

const defaultState = {
  assignee: null,
  associatedSupervisor: null,
};

const AssignedToDrawer = ({ anchor, assignCloseDrawer, data, updateLocation }) => {
  const classes = useStyles();
  const { t } = useTranslation();

  const [formData, setFormData] = useState(defaultState);
  const [assignees, setAssignees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addSupervisorChecked, setAddSupervisorChecked] = useState(
    !!data?.assignTo?.assignedSupervisorId,
  );

  // verify interns conditons
  const isAddSupervisorChecked =
    addSupervisorChecked &&
    formData.associatedSupervisor !== null &&
    formData.associatedSupervisor !== '' &&
    formData.assignee !== null &&
    formData.assignee !== '';

  // verify sales person condition
  const isAssigneeSelected =
    !addSupervisorChecked && formData.assignee !== null && formData.assignee !== '';

  const isEdited = formData.assignee?.value || formData.associatedSupervisor?.value;

  /**
   * use to format assign to object for create Location API
   * @param {*} assignTo
   * @returns
   */
  const updateAssignTo = () => {
    if (addSupervisorChecked) {
      return {
        userId: formData?.assignee?.id,
        supervisorId: formData?.associatedSupervisor?.id,
      };
    }
    return {
      userId: formData?.assignee?.id,
    };
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...updateAssignTo(),
      };

      await updateLocation({ assignTo: payload }, detailPageDropDowns.USER);
      setLoading(false);
    } catch (error) {
      /**
       * show error
       */
      toast.error(error?.message, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
      setLoading(false);
    }
  };

  const inputChangedHandler = (event) => {
    const { name, value } = event.target;

    if (name === 'assignee' && value?.type === 'Home Officer') {
      setAddSupervisorChecked(false);
    }
    updateFormHandler(name, value);
  };

  /**
   * common function to update data to formDat object
   */
  const updateFormHandler = useCallback(
    (name, value) => {
      setFormData((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    },
    [setFormData],
  );

  /**
   * Fetch sales person listing
   * for dropdown options
   * @param {*} page
   * @param {*} query
   */
  const fetchAssigneesList = async () => {
    try {
      const response = await getDealOwnerOptions();
      if (response.statusCode === 200) {
        const dealOwners = transformArrayForOptions(response?.data?.owners, 'name', 'id', 'type');
        setAssignees(dealOwners || []);
      }
    } catch (error) {
      /**
       * show error
       */
      toast.error(error?.message, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  useEffect(() => {
    fetchAssigneesList();
  }, []);

  /**
   * show the assigned user
   */
  useEffect(() => {
    if (data) {
      /**
       * set the value of intent which is already selected
       */
      /**
       * sales perons
       */
      if (data?.assignTo?.assignedUserId && assignees?.length) {
        // Update associatedFranchiseId
        updateSelectedOption(
          locationDropDownNames.ASSIGNEE,
          assignees,
          data?.assignTo?.assignedUserId,
          setFormData,
        );
      }
      if (data?.assignTo?.assignedSupervisorId && assignees?.length) {
        // Update associatedFranchiseId
        updateSelectedOption(
          locationDropDownNames.ASSOCIATED_SUPERVISOR,
          assignees,
          data?.assignTo?.assignedSupervisorId,
          setFormData,
        );
      }
    }
  }, [data, assignees]);

  return (
    <Box
      className={classes.sideBarBox}
      role="presentation"
      component="form"
      onSubmit={handleFormSubmit}
    >
      <Box className={classes.boxInner}>
        <Box className={classes.sideHeader}>
          <DrawerHeader
            title={t('sales.locations.locationAssignments')}
            subtext={t('sales.locations.selectPeopleText')}
            handleCloseDrawer={assignCloseDrawer}
            anchor={anchor}
          />
          <Box className={classes.locationForm}>
            <SalesPersonsAndInterns
              formData={formData}
              salesPersons={assignees}
              interns={assignees}
              isInternChecked={addSupervisorChecked}
              setIsInternChecked={setAddSupervisorChecked}
              inputChangedHandler={inputChangedHandler}
            />
          </Box>
        </Box>
        <DrawerFooter
          bulkApply={t('sales.locations.assigns')}
          bulkCancel={t('sales.locations.cancel')}
          handleCloseDrawer={assignCloseDrawer}
          anchor={anchor}
          type="submit"
          disabled={
            (!isAddSupervisorChecked && !isAssigneeSelected) ||
            !isEdited ||
            loading ||
            !userHasPermission(ACL_PROPERTIES_UPDATE)
          }
        />
      </Box>
    </Box>
  );
};

AssignedToDrawer.propTypes = {
  anchor: PropTypes.string,
  assignCloseDrawer: PropTypes.func,
  width: PropTypes.number,
  data: PropTypes.object, // Adjust the type accordingly based on the expected data structure
  updateLocation: PropTypes.func,
  loading: PropTypes.bool,
};
export default AssignedToDrawer;
