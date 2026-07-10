import { Button, InputLabel } from '@mui/material';
import Box from '@mui/material/Box';
import classNames from 'classnames';
import ResponsiveDatePickers from 'commonComponents/datePicker';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import CustomDropDown from 'src/app/components/common/customDropDown';
import { Clossicon } from 'src/assets/svg';
import { formatDate } from 'src/helper/utilityFunctions';
import useCountryCityStateHook from 'src/hooks/useCountryCItyStateHook';
import { getIndustryTypes } from 'src/services/company.service';
import { getDealOwnerOptions } from 'src/services/deal.service';
import transformArrayForOptions from 'src/utils/array/transformArrayForOptions';
import { toastSettings } from 'src/utils/constants';

import DrawerFooter from '../../components/drawerFooter';
import DrawerHeader from '../../components/drawerHeader';
import { useStyles } from './listingMoreFilter.js';

const queryKeys = {
  stateIds: 'stateIds',
  cityIds: 'cityIds',
  industryType: 'industryType',
  associatedCompanyIds: 'associatedCompanyIds',
  postalCode: 'postalCode',
  hsId: 'hsId',
  dealOwnerIds: 'dealOwnerIds',
  industryIds: 'industryIds',
  // parentCompanyIds: 'parentCompanyIds',
  companyIds: 'companyIds',
};

const ListingMoreFiltersDrawer = ({
  anchor,
  filterCloseDrawer,
  width,
  formData_,
  setFormData_,
  // errorMessages,
  // setErrorMessages,
  // inputChangedHandler,
  applyFilters,
  emptyState,
  handleClearFilters,
  companies,
  companiesPagination,
  fetchMoreOptions,
  loadingCompaniesDropdown,
}) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const [formData, setFormData] = useState({ ...formData_ });
  const [_dealOwners, setDealOwners] = useState([]);
  const [options, setOptions] = useState({
    industries: [],
  });

  const handleMultipleSelectedValues = async (event, field) => {
    /**
     * get the ids from selected values
     */
    let selectedValues = event.target.value?.map((value) => value.id);

    if (field === queryKeys.stateIds) {
      // Call updateCities when stateIds are updated
      fetchCities(selectedValues);
    }

    if (field === queryKeys.companyIds) {
      selectedValues = event.target.value;
    }

    setFormData((prevState) => ({
      ...prevState,
      [field]: selectedValues,
    }));
  };

  /**
   * hook to for address
   */
  const { CityHookComponent, StateHookComponent, CountrySelectHookComponent } =
    useCountryCityStateHook({
      formData,
      setFormData,
      errorMessages: {},
      setErrorMessages: () => {},
      multiStates: true,
      multiCities: true,
      stateProps: {
        placeHolder: t('sales.users.selectStates'),
        bordered: true,
        className: classes.dropdownWrap,
        placeHolderClassName: classes.placeHolderColor,
      },
      cityProps: {
        placeHolder: t('sales.users.selectCities'),
        bordered: true,
        className: classes.dropdownWrap,
        placeHolderClassName: classes.placeHolderColor,
      },
    });

  /**
   * Fetch franchise listing
   * @param {*} page
   * @param {*} query
   */
  const fetchDealOwners = async () => {
    try {
      const response = await getDealOwnerOptions();
      if (response?.statusCode === 200) setDealOwners(response?.data?.owners);
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
   * fetch industry verticals
   */
  const fetchIndustryVerticalOptions = async () => {
    try {
      const response = await getIndustryTypes();
      if (response?.statusCode === 200) {
        const verticals = response?.data?.industryVerticals || {};
        const tempIndustryVerticals = Object.keys(verticals)
          .map((key) => ({
            name: verticals[key],
            id: key,
          }))
          // Sort the industry verticals based on label to show industries in alphabetic order
          .sort((a, b) => (a.label > b.label ? 1 : b.label > a.label ? -1 : 0));

        setOptions((prevOptions) => ({
          ...prevOptions,
          industries: tempIndustryVerticals,
        }));
      }
    } catch (error) {
      //error handelr
      toast.error(error?.message, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  /**
   * handle date change
   */
  const handleDateChange = (value) => {
    if (value) {
      const isValidDate = !isNaN(value['$d']);
      if (isValidDate)
        setFormData((prevState) => ({
          ...prevState,
          createdDate: formatDate(value),
        }));
      else
        setFormData((prevState) => ({
          ...prevState,
          createdDate: null,
        }));
    }
  };

  useEffect(() => {
    fetchDealOwners();
    fetchIndustryVerticalOptions();
  }, []);

  // const filterItemsByProperty = (formData, propertyName, items) => {
  //   const propertyValues =
  //     (propertyName && formData?.[propertyName]?.map((value) => parseInt(value, 10))) || [];
  //   return items.filter((item) => propertyValues.includes(item.id));
  // };

  // const memoizedSelectedParentCompany = useMemo(() => {
  //   return filterItemsByProperty(formData, 'parentCompanyIds', companies);
  // }, [JSON.stringify(formData), companies]);

  const memoizedSelectedAssociatedCompany = useMemo(() => {
    return transformArrayForOptions(formData[queryKeys.companyIds], 'name', 'id') || [];
  }, [JSON.stringify(formData), companies]);

  const memoizedSelectedIndustryVerticals = useMemo(() => {
    return options?.industries.filter((industrie) => formData?.industryIds.includes(industrie.id));
  }, [JSON.stringify(formData), options?.industries]);

  return (
    <Box
      className={classes?.siderBarBox}
      sx={{ width: anchor === 'top' || anchor === 'bottom' ? 'auto' : width }}
      role="presentation"
    >
      <Box className={classes?.sideHeader}>
        <DrawerHeader
          title={t('sales.locations.allFilters')}
          handleCloseDrawer={filterCloseDrawer}
          anchor={anchor}
        />

        <Button
          disableRipple
          className={classes?.moreFilter} // Disable the button if both formData and formData match the emptyState
          disabled={
            JSON.stringify({ ...formData_, status: emptyState.status }) ===
              JSON.stringify(emptyState) &&
            JSON.stringify({ ...formData, status: emptyState.status }) ===
              JSON.stringify(emptyState)
          }
          onClick={(_e) => {
            handleClearFilters();
            setFormData(emptyState);
          }}
          variant="tertiaryGrey"
          endIcon={<Clossicon className={classes.filterIcon} />}
        >
          {`${t('commonText.clearAll')}`}
        </Button>
      </Box>

      <Box className={classNames(classes?.moreFilterForm, 'innerScrollBar')}>
        <Box className={`${classes?.fieldWrapper}  ${classes?.dropdownCommonSection}`}>
          <InputLabel htmlFor="propertyName">{t('sales.contacts.country')}</InputLabel>
          <CountrySelectHookComponent />
        </Box>
        <Box className={`${classes?.fieldWrapper}  ${classes?.dropdownCommonSection}`}>
          <InputLabel htmlFor="propertyName">{t('sales.contacts.states')}</InputLabel>
          <StateHookComponent />
        </Box>
        <Box className={`${classes?.fieldWrapper}  ${classes?.dropdownCommonSection}`}>
          <InputLabel htmlFor="propertyName">{t('sales.contacts.cities')}</InputLabel>
          <CityHookComponent bordered={true} />
        </Box>
        <Box className={`${classes?.fieldWrapper}  ${classes?.dropdownCommonSection}`}>
          <InputLabel>{t('sales.locations.companyAssociated')}</InputLabel>
          <CustomDropDown
            label={t('sales.locations.companyAssociated')}
            name="companyIds"
            id="companyIds"
            placeHolder={`${t('sales.locations.select')} ${t('sales.locations.companyAssociated')}`}
            placeHolderClassName={classes.placeHolderColor}
            options={transformArrayForOptions(companies, 'name', 'id') || []}
            selectedValues={
              transformArrayForOptions(memoizedSelectedAssociatedCompany, 'name', 'id') || []
            }
            handleChange={(event) => handleMultipleSelectedValues(event, queryKeys.companyIds)}
            searchPlaceholder={t('sales.locations.search')}
            className={classes.dropdownWrap}
            multiSelect
            checkmark
            searchable
            bordered
            withTiles
            pagination={companiesPagination}
            fetchMoreOptions={fetchMoreOptions}
            isLoading={loadingCompaniesDropdown}
          />
        </Box>
        {/* <Box className={`${classes?.fieldWrapper}  ${classes?.dropdownCommonSection}`}>
          <InputLabel>{t('sales.locations.parentCompany')}</InputLabel>
          <CustomDropDown
            label={t('sales.locations.parentCompany')}
            name="parentCompanyIds"
            id="parentCompanyIds"
            placeHolder={`${t('sales.locations.select')} ${t('sales.locations.parentCompany')}`}
            placeHolderClassName={classes.placeHolderColor}
            options={transformArrayForOptions(companies, 'name', 'id') || []}
            selectedValues={
              transformArrayForOptions(memoizedSelectedParentCompany, 'name', 'id') || []
            }
            handleChange={(event) =>
              handleMultipleSelectedValues(event, queryKeys.parentCompanyIds)
            }
            searchPlaceholder={t('sales.locations.search')}
            className={classes.dropdownWrap}
            multiSelect
            checkmark
            searchable
            bordered
            withTiles
          />
        </Box> */}
        <Box className={`${classes?.fieldWrapper}  ${classes?.dropdownCommonSection}`}>
          <InputLabel>{t('sales.users.industryVerticals')}</InputLabel>
          <CustomDropDown
            label={t('sales.users.industryVerticals')}
            name="industryIds"
            id="industryIds"
            placeHolder={`${t('sales.locations.select')} ${t('sales.users.industryVerticals')}`}
            placeHolderClassName={classes.placeHolderColor}
            options={transformArrayForOptions(options?.industries, 'name', 'id') || []}
            selectedValues={
              transformArrayForOptions(memoizedSelectedIndustryVerticals, 'name', 'id') || []
            }
            handleChange={(event) => handleMultipleSelectedValues(event, queryKeys.industryIds)}
            searchPlaceholder={t('sales.locations.search')}
            className={classes?.dropdownWrap}
            multiSelect
            checkmark
            searchable
            bordered
            withTiles
          />
        </Box>
        <Box className={classes.fieldWrapper}>
          <InputLabel htmlFor="propertyName">{t('sales.contacts.dateCreated')}</InputLabel>
          <ResponsiveDatePickers
            value={formData?.createdDate ? dayjs(formData?.createdDate) : null}
            placeholder={`${t('sales.locations.select')} ${t('sales.contacts.dateCreated')}`}
            onChange={(value) => handleDateChange(value)}
          />
        </Box>
      </Box>

      <Box className={classes.footerWrap}>
        <DrawerFooter
          bulkApply={t('sales.locations.applyFilters')}
          bulkCancel={t('sales.locations.cancel')}
          handleCloseDrawer={filterCloseDrawer}
          setFormData={setFormData_}
          applyFilters={applyFilters}
          drawerQuery={formData}
          disabled={
            JSON.stringify({ ...formData_ }) === JSON.stringify(emptyState) &&
            JSON.stringify({ ...formData }) === JSON.stringify(emptyState)
          }
          anchor={anchor}
          type="submit"
        />
      </Box>
    </Box>
  );
};

ListingMoreFiltersDrawer.propTypes = {
  anchor: PropTypes.string,
  filterCloseDrawer: PropTypes.func,
  width: PropTypes.number,
  formData_: PropTypes.object, // Adjust the type accordingly based on the expected data structure
  setFormData_: PropTypes.func,
  applyFilters: PropTypes.func,
  emptyState: PropTypes.bool,
  handleClearFilters: PropTypes.func,
  companies: PropTypes.array, // Adjust the type accordingly based on the expected data structure
  companiesPagination: PropTypes.Object,
  fetchMoreOptions: PropTypes.func,
  loadingCompaniesDropdown: PropTypes.func,
};

export default ListingMoreFiltersDrawer;
