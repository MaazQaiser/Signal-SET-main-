import { makeStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { getFranchisesOptions } from 'src/services/location.service';
import transformArrayForOptions from 'src/utils/array/transformArrayForOptions';

import CustomDropDown from '../customDropDown';

const ALL_TYPE = { value: 'all', label: 'All Franchises', name: 'all', id: 'all' };
const useStyles = makeStyles(() => ({
  franchiseListDropDown: {
    flex: '1',
  },
}));
const FranchiseListDropDown = ({
  formKey = 'franchises',
  selectedValues = [],
  dependentValue = [],
  refetch = false,
  showAll = true,
  updataFormHandler = () => {},
  setRefetch = () => {},
  multiSelect = true,
  checkmark = true,
  bordered = true,
  searchable = true,
  disabled = false,
  withTiles = true,
}) => {
  const [franchises, setFranchises] = useState([]);
  const forceClose = true;
  const { t } = useTranslation();
  const classes = useStyles();

  // const userId = useSelector((state) => state.user.info?.id);
  //
  // const userRole = useSelector((state) => state.auth.userRole);

  const getData = async () => {
    try {
      let payload = {};
      /** Handle states filter */
      if (dependentValue?.length > 0) {
        let selectedStates = dependentValue?.map((state) => state?.id);
        payload = { ...payload, states: selectedStates };
      } else {
        let { states: _deletedStates, ...rest } = payload;
        payload = rest;
      }

      let response = await getFranchisesOptions(payload?.states ? payload : null);

      if (response?.statusCode === 200) {
        response = response?.data?.franchises || [];

        // response =
        //   userRole?.slug === rolesEnum?.franchiseOwner
        //     ? response?.filter((f) => {
        //         // filter functional franchises only
        //         const isFunctional = f?.status !== franchiseStatusEnum.nonFunctional;
        //
        //         const matchesFranchiseId = userId ? f?.ownerId === userId : false;
        //
        //         return isFunctional && matchesFranchiseId;
        //       })
        //     : response?.filter((f) => {
        //         // Filter out non-functional franchises
        //         // Return true only if both conditions are met
        //         return f?.status !== franchiseStatusEnum.nonFunctional;
        //       });

        response = transformArrayForOptions(response, 'name', 'name');
        setFranchises(response);
        return;
      }
      setFranchises([]);
    } catch (e) {
      setFranchises([]);
      toast.error(e?.message, {
        position: 'top-right',
        autoClose: 2000,
      });
    }
  };

  useEffect(() => {
    if (refetch) {
      getData();
      setRefetch(false);
    }
  }, [refetch]);
  const allFranchises = showAll ? [ALL_TYPE, ...franchises] : franchises;
  return (
    <CustomDropDown
      disabled={disabled || !franchises?.length}
      label={t('sideNavBar.linkText.franchises')}
      name="franchises"
      enableForceClose={forceClose}
      options={allFranchises || []}
      selectedValues={selectedValues || []}
      handleChange={(e) => {
        updataFormHandler(e, formKey);
      }}
      multiSelect={multiSelect}
      className={classes.franchiseListDropDown}
      checkmark={checkmark}
      bordered={bordered}
      searchable={searchable}
      withTiles={withTiles}
      placeHolder={`${t('sideNavBar.linkText.franchises')}`}
    />
  );
};
FranchiseListDropDown.propTypes = {
  formKey: PropTypes.string,
  selectedValues: PropTypes.array,
  dependentValue: PropTypes.array,
  refetch: PropTypes.bool,
  showAll: PropTypes.bool,
  updataFormHandler: PropTypes.func,
  setRefetch: PropTypes.func,
  multiSelect: PropTypes.bool,
  checkmark: PropTypes.bool,
  bordered: PropTypes.bool,
  searchable: PropTypes.bool,
  disabled: PropTypes.bool,
  withTiles: PropTypes.bool,
};
export default FranchiseListDropDown;
