import { Stack } from '@mui/material';
import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import * as React from 'react';
import { useEffect } from 'react';
import { useState } from 'react';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import LoaderComponent from 'src/app/components/common/loader';
import { getDealOwnerOptions } from 'src/services/deal.service';
import { bulkAssignMentLocation } from 'src/services/location.service';
import transformArrayForOptions from 'src/utils/array/transformArrayForOptions';
import { toastSettings } from 'src/utils/constants';

import BulkAssignment from '../../locations/bulkAssignments';
import DrawerFooter from '../drawerFooter';
import DrawerHeader from '../drawerHeader';
import { useStyles } from './sideDrawer';

const defaultState = {
  assignee: null,
  associatedSupervisor: null,
};
const BulkDrawer = ({
  anchor,
  bulkCloseDrawer,
  width,
  selectedItems,
  setSelectedItems,
  filtersData,
  setSelectAll,
  setBulkOperationPerformed,
}) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const [formData, setFormData] = useState(defaultState);
  const [interns, setInterns] = useState([]);
  const [salesPersons, setSalesPersons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isInternChecked, setIsInternChecked] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  /**
   * use to format assign to object for create Location API
   * @param {*} assignTo
   * @returns
   */
  const updateAssignTo = () => {
    if (isInternChecked) {
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
    try {
      setLoading(true);

      const payload = {
        locationIds: selectedItems,
        ...updateAssignTo(),
      };

      // if (payload) {
      //   console.log({ payload });
      //   return;
      // }

      const bulkResp = await bulkAssignMentLocation(payload);
      if (bulkResp.statusCode === 200) {
        setBulkOperationPerformed();
        toast.success(bulkResp.message, {
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
        /**
         * close the side drawer after successful response
         * and empty the selected items array
         */
        setSelectedItems([]);
        setSelectAll(false);
        bulkCloseDrawer(anchor);
      }
    } catch (error) {
      /**
       * show error
       */
      toast.error(error?.message, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    } finally {
      setLoading(false);
    }
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

  const inputChangedHandler = (event) => {
    const { name, value } = event.target;

    if (name === 'assignee' && value?.type === 'Home Officer') {
      setIsInternChecked(false);
    }
    updateFormHandler(name, value);
  };

  /**
   * Fetch sales person listing
   * for dropdown options
   * @param {*} page
   * @param {*} query
   */
  const fetchSalesPersonsList = async () => {
    try {
      const response = await getDealOwnerOptions();
      if (response.statusCode === 200) {
        const dealOwners = transformArrayForOptions(response?.data?.owners, 'name', 'id', 'type');
        setSalesPersons(dealOwners || []);
        setInterns(dealOwners || []);
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

  /**
   * Fetch sales Interns listing
   * for dropdown options
   * @param {*} page
   * @param {*} query
   */
  const _fetchIntersList = async () => {
    try {
      const response = await getDealOwnerOptions();
      if (response.statusCode === 200)
        setInterns(transformArrayForOptions(response?.data?.owners, 'name', 'id', 'type') || []);
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
    fetchSalesPersonsList();
    // fetchIntersList();
  }, []);

  /**
   * condition to enable/disable the Assign to button
   */
  useEffect(() => {
    if (isInternChecked) {
      setIsButtonDisabled(!formData.assignee || !formData.associatedSupervisor);
    } else {
      setIsButtonDisabled(!formData.assignee);
    }
  }, [isInternChecked, formData.assignee, formData.associatedSupervisor]);

  return (
    <>
      {loading && <LoaderComponent size={50} color={'primary'} label={t('sales.loading')} />}
      <Box
        className={classes.siderBarBox}
        sx={{ width: anchor === 'top' || anchor === 'bottom' ? 'auto' : width }}
        role="presentation"
        component="form"
        onSubmit={handleFormSubmit}
      >
        <Stack className={classes.boxInner} justifyContent="space-between">
          <Box className={classes.sideHeader}>
            <DrawerHeader
              title={t('sales.locations.locationAssignment')}
              subtext={t('sales.locations.bulkText')}
              handleCloseDrawer={bulkCloseDrawer}
              anchor={anchor}
            />
            <BulkAssignment
              formData={formData}
              salesPersons={salesPersons}
              interns={interns}
              inputChangedHandler={inputChangedHandler}
              selectedItems={selectedItems}
              filtersData={filtersData}
              isInternChecked={isInternChecked}
              setIsInternChecked={setIsInternChecked}
            />
          </Box>
          <DrawerFooter
            bulkApply={t('sales.locations.assign')}
            bulkCancel={t('sales.locations.cancel')}
            handleCloseDrawer={bulkCloseDrawer}
            anchor={anchor}
            onSubmit={handleFormSubmit}
            type="submit"
            disabled={isButtonDisabled}
          />
        </Stack>
      </Box>
    </>
  );
};

BulkDrawer.propTypes = {
  anchor: PropTypes.string,
  bulkCloseDrawer: PropTypes.func,
  width: PropTypes.number,
  selectedItems: PropTypes.array,
  setSelectedItems: PropTypes.func,
  filtersData: PropTypes.object, // Adjust the type accordingly based on the expected data structure
  setSelectAll: PropTypes.func,
  setBulkOperationPerformed: PropTypes.func,
};

export default BulkDrawer;
