import { Box, Chip } from '@mui/material';
import { makeStyles } from '@mui/styles';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { isObjectEmpty } from 'src/helper/utilityFunctions';
import { setFranchiseId, setFranchiseTimeZone } from 'src/redux/store/slices/auth';
import { getActiveFranchises } from 'src/services/franchise.services';
import transformArrayForOptions from 'src/utils/array/transformArrayForOptions';
import { toastSettings } from 'src/utils/constants';

import CustomDropDown from '../customDropDown';
export const useStyles = makeStyles((_theme) => ({
  chipWrapper: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '12px',
  },
}));
const ActiveFranchiseList = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const classes = useStyles();

  const franchiseId = useSelector((state) => state.auth.franchiseId);

  // const franchiseTimeZone = useSelector((state) => state.user.info.franchiseTimezone);

  const [selectedActiveFranchise, setSelectedActiveFranchise] = useState({});
  const [activeFranchises, setActiveFranchises] = useState([]);
  const getActiveFranchiseData = async () => {
    try {
      const activeFranchises = await getActiveFranchises();
      if (activeFranchises?.statusCode === 200) {
        const data = activeFranchises?.data?.activeFranchises?.find(
          (franchise) => franchise?.id == franchiseId,
        );
        setSelectedActiveFranchise(data);
        setActiveFranchises(activeFranchises?.data?.activeFranchises);
      }
    } catch (e) {
      toast.error(e?.message, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
      setActiveFranchises([]);
    }
  };
  useEffect(() => {
    getActiveFranchiseData();
  }, []);

  const updateFranchiseAPI = async (id) => {
    try {
      const selectedValue = activeFranchises?.find((franchise) => franchise?.id == id);
      setSelectedActiveFranchise(selectedValue);
      dispatch(setFranchiseId(selectedValue?.id));
      dispatch(setFranchiseTimeZone(selectedValue?.franchiseTimezone));
      /**
       * added wait time of 1sec to store the changes in redux
       * instant reload wasn't leaving much room for redux to store and reflect changes
       * */
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      toast.success(t('commonText.updateSuccess'), {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    } catch (e) {
      toast.error(e?.message, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  const handleUpdate = (e) => {
    const { value } = e.target;
    if (!isObjectEmpty(value)) {
      updateFranchiseAPI(value?.id);
    }
  };

  const selectedFranchise = !isObjectEmpty(selectedActiveFranchise)
    ? transformArrayForOptions([selectedActiveFranchise], 'name', 'id')?.[0]
    : {};
  const selectableActiveFranchises = activeFranchises?.length
    ? transformArrayForOptions(activeFranchises, 'name', 'id')
    : [];
  return (
    <Box className={classes.chipWrapper}>
      {/* <Chip label={`${franchiseTimeZone}`} size="small" color="primary" /> */}
      <Chip label={`ID: ${franchiseId}`} size="small" color="primary" />
      <CustomDropDown
        label={t('obx.form.input.dropDown.selectFranchise.label')}
        name="activeFranchise"
        selectedValues={selectedFranchise}
        options={selectableActiveFranchises}
        bordered
        checkmark
        multiSelect={false}
        handleChange={handleUpdate}
        className={classes.franchiseCustomDropDown}
        margin="set"
      />
    </Box>
  );
};

export default React.memo(ActiveFranchiseList);
