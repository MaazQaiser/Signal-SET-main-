import { Box, InputLabel, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom/cjs/react-router-dom.min';
import { toast } from 'react-toastify';
import { UPDATE_RUNSHEET_STATE } from 'src/redux/reducers/runSheetReducer';
import {
  getActiveAndInActivePatrolOfficers,
  getActiveAndInActivePatrolVehicles,
} from 'src/services/duty.services';
import { toastSettings } from 'src/utils/constants';

import OfficerDropdown from '../../../sites/detail/components/jobs/assignmentSideDrawer/AssignShift/OfficerDropdown';
import { useStyles } from './AssignRunsheetTab';
const AssignRunsheetTab = (props) => {
  const { t } = useTranslation();
  const { state, dispatch, isSplitRunsheet } = props;
  const [officers, setOfficers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const handleChangeValue = (e) => {
    dispatch({
      type: UPDATE_RUNSHEET_STATE,
      payload: { key: 'officerId', value: e.target.value },
    });
  };

  const handleVehicleValue = (e) => {
    console.log(e);
    dispatch({
      type: UPDATE_RUNSHEET_STATE,
      payload: { key: 'vehicleId', value: e.target.value },
    });
  };

  const location = useLocation();
  const urlArray = location.pathname.split('/');
  // Extract the unique identifier
  const runSheetId = urlArray[urlArray.length - 2];
  const getOfficersData = async () => {
    try {
      setOfficers(undefined);
      const queryParams = {
        start: state?.tempNewRunsheetDates?.startsAt,
        end: state?.tempNewRunsheetDates?.endsAt,
      };
      if (isSplitRunsheet) queryParams.isReassigned = true;
      const config = {};
      let response;
      response = await getActiveAndInActivePatrolOfficers({
        runsheetId: runSheetId,
        queryParams,
        config,
      });

      const data = response?.data || {};
      const assigned = data?.assigned?.map((val) => ({
        ...val,
        disabled: val?.isAssigned,
      }));

      setOfficers({ ...data, assigned });
    } catch (error) {
      console.log(error);
      setOfficers(null);
      toast.error(error?.message, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };
  const getVehiclesData = async () => {
    try {
      setVehicles(undefined);
      const queryParams = {
        start: state?.tempNewRunsheetDates?.startsAt,
        end: state?.tempNewRunsheetDates?.endsAt,
      };
      if (isSplitRunsheet) queryParams.isReassigned = true;
      const config = {};
      let response;

      response = await getActiveAndInActivePatrolVehicles({
        runsheetId: runSheetId,
        queryParams,
        config,
      });

      const data = response?.data || {};

      const assigned = data?.assigned?.map((val) => ({
        ...val,
        disabled: val?.isAssigned,
      }));

      setVehicles({ ...data, assigned });
    } catch (error) {
      setVehicles(null);
      toast.error(error?.message, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  useEffect(() => {
    Promise.all([getOfficersData(), getVehiclesData()]);
  }, []);

  const classes = useStyles();
  return (
    <Box className={classes.assignWrapper}>
      <Box className={classes.inlineText}>
        <Typography variant="h5">{t('obx.runsheet.assignHeading')}</Typography>
        <Typography variant="caption">{t('obx.runsheet.optional')}</Typography>
      </Box>
      <Box>
        <InputLabel htmlFor="runsheetName">{t('obx.runsheet.selectOfficer')}</InputLabel>
        <OfficerDropdown
          {...{
            handleChangeValue,
            selectedValue: state?.officerId,
            allOfficers: officers,
            name: 'officer',
            label: null,
            placeHolder: null,
            errorMsg: '',
          }}
        />
      </Box>
      <Box>
        <InputLabel htmlFor="runsheetName">{t('obx.runsheet.selectVehicle')}</InputLabel>
        <OfficerDropdown
          {...{
            handleChangeValue: handleVehicleValue,
            selectedValue: state?.vehicleId,
            allOfficers: vehicles,
            name: 'vehicle',
            label: 'Select Vehicle',
            placeHolder: 'Select Vehicle',
            errorMsg: '',
          }}
        />
      </Box>
    </Box>
  );
};

AssignRunsheetTab.propTypes = {
  state: PropTypes.object.isRequired,
  dispatch: PropTypes.func,
  isSplitRunsheet: PropTypes.bool,
  // runSheetDetails: PropTypes.object.isRequired,
};

export default AssignRunsheetTab;
