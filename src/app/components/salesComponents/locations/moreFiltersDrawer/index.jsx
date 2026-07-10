import { Button, Chip, InputLabel, TextField, Tooltip } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import { ReactComponent as ChevronDown } from 'assets/svg/chevronDown.svg';
import { ReactComponent as GreyInfoIcon } from 'assets/svg/greyInfoIcon.svg';
import classNames from 'classnames';
import DateRangePicker from 'commonComponents/RangeDatepicker';
import PropTypes from 'prop-types';
import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import CustomDropDown from 'src/app/components/common/customDropDown';
import { locationScoreFilterOptions } from 'src/app/sales/pages/locations/listing/locations.constant';
import { Clossicon } from 'src/assets/svg';
import useRegionalStateCityHook from 'src/hooks/useRegionalStateCityHook';
import { getDisplayConfiguration } from 'src/redux/store/slices/regionalCountryConfiguration';
import { getInternsAndSalesPersons, getLocationSources } from 'src/services/location.service';
import { getFranchisesOptions } from 'src/services/location.service';
import transformArrayForOptions from 'src/utils/array/transformArrayForOptions';
import { toastSettings } from 'src/utils/constants';

import DrawerFooter from '../../components/drawerFooter';
import DrawerHeader from '../../components/drawerHeader';
import {
  locationAffiliationOptions,
  locationTypeDropdownOptions,
  sitesDropdownOptions,
  stagesDropdownOptions,
} from '../newLocationsDrawer/location.constant';
import { useStyles } from './moreFiltersDrawer.js';
const queryKeys = {
  stateIds: 'stateIds',
  cityIds: 'cityIds',
  associatedCompanyIds: 'associatedCompanyIds',
  parentCompanyIds: 'parentCompanyIds',
  postalCode: 'postalCode',
  postalCodes: 'postalCodes',
  hsId: 'hsId',
  assignedTo: 'assignedTo',
  lotNumber: 'lotNumber',
  associatedFranchise: 'associatedFranchise',
};

const arrayFiltersEmptyState = {
  associatedCompanyIds: [],
  parentCompanyIds: [],
  assignedTo: [],
};

const MoreFiltersDrawer = ({
  anchor,
  filterCloseDrawer,
  width,
  formData_,
  setFormData_,
  handleClearFilters,
  applyFilters,
  emptyState,
  companies,
  setCompaniesFilters,
  companiesPagination,
  fetchCompanies,
  loadingCompaniesDropDown,
}) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const { dateFormat } = useSelector(getDisplayConfiguration);

  const [formData, setFormData] = useState({ ...formData_ });
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef(null);
  const [franchises, setFranchises] = useState([]);

  const handleClick = () => {
    setIsVisible(!isVisible);
  };

  const handleClickOutside = (event) => {
    if (containerRef.current && !containerRef.current.contains(event.target)) {
      setIsVisible(false);
    }
  };

  useEffect(() => {
    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isVisible]);

  const [interneesAndSalesPersons, setInterneesAndSalesPersons] = useState([]);
  const [locationSources, setLocationSources] = useState([]);
  /**
   * hook to for address
   */
  const { states, cities, fetchCities, loading } = useRegionalStateCityHook();

  const inputChangedHandler = (event) => {
    const { name, value } = event.target;

    if (name === 'states') {
      setFormData((prevState) => ({
        ...prevState,
        [name]: value,
        cities: [],
      }));
      fetchCities(value?.length ? value?.map((val) => val.value) : null);
      return;
    }

    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  //Fetch franchise listing
  const fetchFranchises = async () => {
    try {
      const response = await getFranchisesOptions();
      if (response?.statusCode === 200) {
        const transformedFranchises = transformArrayForOptions(
          response?.data?.franchises || [],
          'name',
          'id',
        );
        setFranchises(transformedFranchises);
      }
    } catch (error) {
      /**
       * show error in the toast
       */
      toast.error(error?.message, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  const checkMinMaxValue = (event) => {
    let { name, value } = event.target;
    if ((name === 'minUnits' || name === 'maxUnits') && Number(value) < 0) {
      value = 0;
    }
    if (
      name === 'minUnits' &&
      value &&
      formData.maxUnits &&
      Number(value) > Number(formData.maxUnits)
    ) {
      toast.info(t('sales.locations.minCannotBeGreaterThanMax'), {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
      value = formData.maxUnits;
    }
    if (
      name === 'maxUnits' &&
      value &&
      formData.minUnits &&
      Number(value) < Number(formData?.minUnits)
    ) {
      toast.info(t('sales.locations.maxCannotBeLessThanMin'), {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
      value = formData?.minUnits;
    }
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const minMaxValue = () => {
    const minMaxPlaceholder = {
      class: '',
      text: t('sales.locations.noOfUnits'),
    };
    if (formData?.minUnits && !formData?.maxUnits) {
      minMaxPlaceholder.class = classes.PlaceHolderClass;
      minMaxPlaceholder.text = `${t('sales.locations.min')}: ${formData?.minUnits}`;
      return minMaxPlaceholder;
    }
    if (formData?.maxUnits && !formData?.minUnits) {
      minMaxPlaceholder.class = classes.PlaceHolderClass;
      minMaxPlaceholder.text = `${t('sales.locations.max')}: ${formData?.maxUnits}`;
      return minMaxPlaceholder;
    }
    if (formData?.minUnits && formData?.maxUnits) {
      minMaxPlaceholder.class = classes.PlaceHolderClass;
      minMaxPlaceholder.text = `${t('sales.locations.min')}: ${formData?.minUnits} & ${t('sales.locations.max')}: ${formData?.maxUnits}`;
      return minMaxPlaceholder;
      // return `${t('sales.locations.min')}: ${formData?.minUnits} & ${t('sales.locations.max')}: ${formData?.maxUnits}`;
    }
    return minMaxPlaceholder;
  };

  const handleChipDelete = (e, index) => {
    e.stopPropagation(); // Prevent onChange from being called

    const data = [...formData[queryKeys.postalCodes]];

    const afterRemove = data.filter((_a, i) => i !== index);

    setFormData((prevState) => ({
      ...prevState,
      [queryKeys.postalCodes]: afterRemove,
    }));
  };

  const handleMultipleSelectedValues = async (event, field) => {
    /**
     * for input and text areas
     */
    if (field === queryKeys.postalCodes) {
      if (event.target.value) {
        setFormData((prevState) => ({
          ...prevState,
          [field]: [...prevState[field], event.target.value],
        }));
      }
      return;
    }

    if (field === queryKeys.hsId || field === queryKeys.lotNumber) {
      setFormData((prevState) => ({
        ...prevState,
        [field]: event.target.value,
      }));
      return;
    }
    /**
     * get the ids from selected values
     */

    let selectedValues = event.target.value?.map((value) => value.value);

    if (field === queryKeys.parentCompanyIds || field === queryKeys.associatedCompanyIds) {
      selectedValues = event.target.value;
    }

    setFormData((prevState) => ({
      ...prevState,
      [field]: selectedValues,
    }));
    const companyFilter = event.target.value?.map((value) => ({
      value: value.value,
      label: value.label,
    }));
    setCompaniesFilters((prevState) => ({
      ...prevState,
      [field]: companyFilter,
    }));
  };

  /**
   * Fetch list of sales perons and interns
   * @param {*} page
   * @param {*} query
   */
  const fetchInternsAndSalesPersons = async (_stateIds) => {
    try {
      const response = await getInternsAndSalesPersons();
      if (response.statusCode === 200) {
        const data = response?.data?.owners;
        const mappedTypeWithNameData = data?.map((assignedUser) => ({
          ...assignedUser,
          fullName: assignedUser?.type ? `${assignedUser?.name} (${assignedUser.type})` : name,
        }));
        setInterneesAndSalesPersons(mappedTypeWithNameData);
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
   * fetch location sources
   */
  const fetchLocationSourcesOptions = async () => {
    try {
      const response = await getLocationSources();
      if (response?.statusCode === 200) {
        const locationSourcesData = response?.data?.locationSources || [];
        const transformedLocationSources = transformArrayForOptions(
          locationSourcesData,
          'title',
          'value',
        );
        setLocationSources(transformedLocationSources || []);
      }
    } catch (error) {
      toast.error(error?.message, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  useEffect(() => {
    /**
     * will be used in next release
     */
    fetchFranchises();
    fetchInternsAndSalesPersons();
    fetchLocationSourcesOptions();
    if (formData?.states?.length) {
      fetchCities(formData.states.map((s) => s.value));
    }
  }, []);

  const filterItemsByProperty = (formData, propertyName, items) => {
    const propertyValues =
      (propertyName && formData?.[propertyName]?.map((value) => parseInt(value, 10))) || [];
    return items.filter((item) => propertyValues.includes(item.id));
  };
  const memoizedSelectedValueCompany = useMemo(() => {
    return transformArrayForOptions(formData[queryKeys.associatedCompanyIds], 'name', 'id') || [];
  }, [JSON.stringify(formData), companies]);

  const memoizedSelectedParentCompany = useMemo(() => {
    return transformArrayForOptions(formData[queryKeys.parentCompanyIds], 'name', 'id') || [];
  }, [JSON.stringify(formData), companies]);

  const memoizedAssignedTo = useMemo(() => {
    return filterItemsByProperty(formData, 'assignedTo', interneesAndSalesPersons);
  }, [JSON.stringify(formData), interneesAndSalesPersons]);

  const memoizedSelectedAffiliation = useMemo(() => {
    return locationAffiliationOptions(t).find(
      (option) =>
        option.label === formData.locationAffiliation.label &&
        option.value === formData.locationAffiliation.value,
    );
  }, [JSON.stringify(formData)]);

  const locationTypeOptions =
    transformArrayForOptions(locationTypeDropdownOptions(t) || [], 'name', 'id') || [];

  const locationScoreOptions =
    transformArrayForOptions(locationScoreFilterOptions(t) || [], 'name', 'id') || [];

  const stagesOptions =
    transformArrayForOptions(stagesDropdownOptions(t) || [], 'name', 'id') || [];

  const sitesOptions = transformArrayForOptions(sitesDropdownOptions(t) || [], 'name', 'id') || [];

  const locationAffiliationOptionsList =
    transformArrayForOptions(locationAffiliationOptions(t) || [], 'label', 'value') || [];

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
          className={classes.moreFilterHeader}
        />

        <Button
          className={classes.moreFilter}
          // Disable the button if both formData and formData_ match the emptyState
          disabled={
            JSON.stringify({ ...formData, status: emptyState.status }) ===
              JSON.stringify(emptyState) &&
            JSON.stringify({ ...formData_, status: emptyState.status }) ===
              JSON.stringify(emptyState)
          }
          onClick={(_e) => {
            handleClearFilters();
            setFormData(emptyState);
            setCompaniesFilters(arrayFiltersEmptyState);
          }}
          variant="tertiaryGrey"
          disableRipple
          endIcon={<Clossicon className={classes.filterIcon} />}
        >
          {`${t('commonText.clearAll')}`}
        </Button>
      </Box>

      <Box className={classNames(classes.moreFilterForm, 'innerScrollBar')}>
        <Box className={`${classes?.fieldWrapper}  ${classes?.dropdownCommonSection}`}>
          <InputLabel>{t('sales.locations.locationType')}</InputLabel>
          <CustomDropDown
            label={t('sales.locations.locationType')}
            name="locationType"
            id="locationType"
            placeHolder={`${t('sales.locations.select')} ${t('sales.locations.locationType')}`}
            placeHolderClassName={classes.placeHolderColor}
            options={locationTypeOptions || []}
            selectedValues={formData?.locationType || {}}
            handleChange={inputChangedHandler}
            searchPlaceholder={t('sales.locations.search')}
            className={classes.dropdownWrap}
            bordered
          />
        </Box>
        <Box className={`${classes?.fieldWrapper}  ${classes?.dropdownCommonSection}`}>
          <InputLabel>{t('sales.locations.score')}</InputLabel>
          <CustomDropDown
            label={t('sales.locations.score')}
            name="score"
            id="score"
            placeHolder={`${t('sales.locations.select')} ${t('sales.locations.score')}`}
            placeHolderClassName={classes.placeHolderColor}
            options={locationScoreOptions || []}
            selectedValues={formData?.score || {}}
            handleChange={inputChangedHandler}
            searchPlaceholder={t('sales.locations.search')}
            className={classes.dropdownWrap}
            bordered
          />
        </Box>
        <Box className={`${classes?.fieldWrapper}  ${classes?.dropdownCommonSection}`}>
          <InputLabel>{t('sales.locations.stages')}</InputLabel>
          <CustomDropDown
            label={t('sales.locations.stage')}
            name="stage"
            id="stage"
            placeHolder={`${t('sales.locations.select')} ${t('sales.locations.stages')}`}
            placeHolderClassName={classes.placeHolderColor}
            options={stagesOptions || []}
            selectedValues={formData?.stage || {}}
            handleChange={inputChangedHandler}
            searchPlaceholder={t('sales.locations.search')}
            className={classes.dropdownWrap}
            bordered
          />
        </Box>
        <Box className={`${classes?.fieldWrapper}  ${classes?.dropdownCommonSection}`}>
          <InputLabel>{t('sales.locations.locationSource')}</InputLabel>
          <CustomDropDown
            label={t('sales.locations.locationSource')}
            name="source"
            id="source"
            placeHolder={`${t('sales.locations.select')} ${t('sales.locations.locationSource')}`}
            placeHolderClassName={classes.placeHolderColor}
            options={locationSources || []}
            selectedValues={formData?.source || {}}
            handleChange={inputChangedHandler}
            searchPlaceholder={t('sales.locations.search')}
            className={classes.dropdownWrap}
            bordered
          />
        </Box>
        <Box className={`${classes?.fieldWrapper}  ${classes?.dropdownCommonSection}`}>
          <InputLabel>{t('sales.locations.sites')}</InputLabel>
          <CustomDropDown
            label={t('sales.locations.sites')}
            name="site"
            id="site"
            placeHolder={`${t('sales.locations.select')} ${t('sales.locations.sites')}`}
            placeHolderClassName={classes.placeHolderColor}
            options={sitesOptions || []}
            selectedValues={formData?.site || {}}
            handleChange={inputChangedHandler}
            searchPlaceholder={t('sales.locations.search')}
            className={classes.dropdownWrap}
            bordered
          />
        </Box>

        <Box className={`${classes?.fieldWrapper}  ${classes?.dropdownCommonSection}`}>
          <InputLabel>{t('sales.locations.locationAffiliation')}</InputLabel>
          <CustomDropDown
            placeHolder={`${t('sales.locations.select')} ${t('sales.locations.locationAffiliation')}`}
            name="locationAffiliation"
            id="locationAffiliation"
            label={t('sales.locations.allLocationAffiliation')}
            placeHolderClassName={classes.placeHolderColor}
            options={locationAffiliationOptionsList || []}
            selectedValues={memoizedSelectedAffiliation || {}}
            handleChange={inputChangedHandler}
            className={classes.dropdownWrap}
            bordered
          />
        </Box>
        <Box className={`${classes?.fieldWrapper}  ${classes?.dropdownCommonSection}`}>
          <InputLabel>{t('sales.companies.states')}</InputLabel>
          <CustomDropDown
            label={t('sales.users.states')}
            name="states"
            id="states"
            placeHolder={t('sales.users.selectStates')}
            placeHolderClassName={classes.placeHolderColor}
            options={states}
            selectedValues={formData.states || []}
            handleChange={inputChangedHandler}
            searchPlaceholder={t('sales.users.searchStates')}
            className={classes.dropdownWrap}
            multiSelect
            checkmark
            searchable
            bordered
            withTiles
            isLoading={loading}
          />
        </Box>
        <Box className={`${classes?.fieldWrapper}  ${classes?.dropdownCommonSection}`}>
          <InputLabel>{t('sales.companies.cities')}</InputLabel>
          <CustomDropDown
            label={t('sales.users.cities')}
            name="cities"
            id="cities"
            placeHolder={t('sales.users.selectCities')}
            placeHolderClassName={classes.placeHolderColor}
            options={cities}
            selectedValues={formData.cities || []}
            handleChange={inputChangedHandler}
            searchPlaceholder={t('sales.users.searchCities')}
            className={classes.dropdownWrap}
            multiSelect
            checkmark
            searchable
            bordered
            withTiles
            isLoading={loading}
            disabled={!formData?.states?.length}
          />
        </Box>
        <Box className={`${classes?.fieldWrapper}  ${classes?.dropdownCommonSection}`}>
          <InputLabel>{t('sales.locations.associatedCompany')}</InputLabel>
          <CustomDropDown
            label={t('sales.locations.companyAssociated')}
            name="companyAssociated"
            id="companyAssociated"
            placeHolder={`${t('sales.locations.select')} ${t('sales.locations.companyAssociated')}`}
            placeHolderClassName={classes.placeHolderColor}
            options={transformArrayForOptions(companies, 'name', 'id') || []}
            selectedValues={memoizedSelectedValueCompany}
            handleChange={(event) =>
              handleMultipleSelectedValues(event, queryKeys.associatedCompanyIds)
            }
            searchPlaceholder={t('sales.locations.search')}
            className={classes.dropdownWrap}
            multiSelect
            checkmark
            searchable
            bordered
            pagination={companiesPagination}
            fetchMoreOptions={fetchCompanies}
            isLoading={loadingCompaniesDropDown}
            withTiles
          />
        </Box>
        <Box className={classes?.fieldWrapper}>
          <InputLabel>{t('sales.locations.zipCode')}</InputLabel>
          {/*<TextField*/}
          {/*  name="postalCode"*/}
          {/*  id="postalCode"*/}
          {/*  fullWidth*/}
          {/*  placeholder={t('sales.locations.addZipCode')}*/}
          {/*  type="text"*/}
          {/*  onChange={(event) => handleMultipleSelectedValues(event, queryKeys.postalCode)}*/}
          {/*  value={formData?.postalCode || ''}*/}
          {/*  className={classes.textFiledFil}*/}
          {/*/>*/}
          <Autocomplete
            multiple
            disableClearable={true}
            id={'postalCodes'}
            options={[]}
            // defaultValue={{}}
            value={formData.postalCodes}
            className={classes.autoCompleteField}
            freeSolo
            onChange={(event) => handleMultipleSelectedValues(event, queryKeys.postalCodes)}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => {
                const { key, ...tagProps } = getTagProps({ index });

                return (
                  <Chip
                    variant="outlined"
                    label={option}
                    key={key}
                    {...tagProps}
                    onDelete={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      handleChipDelete(event, index);
                    }}
                  />
                );
              })
            }
            renderInput={(params) => (
              <TextField
                {...params}
                id={'postalCodes-text'}
                name={'postalCodes'}
                variant="filled"
                label=""
                placeholder={t('sales.locations.addZipCode')}
                type="text"
                className={classes.autoCompleteTextField}
              />
            )}
          />
        </Box>

        <Box className={`${classes?.fieldWrapper}  ${classes?.dropdownCommonSection}`}>
          <InputLabel>{t('sales.locations.parentCompany')}</InputLabel>
          <CustomDropDown
            label={t('sales.locations.parentCompany')}
            name="parentCompany"
            id="parentCompany"
            placeHolder={`${t('sales.locations.select')} ${t('sales.locations.parentCompany')}`}
            placeHolderClassName={classes.placeHolderColor}
            options={transformArrayForOptions(companies, 'name', 'id') || []}
            selectedValues={memoizedSelectedParentCompany}
            handleChange={(event) =>
              handleMultipleSelectedValues(event, queryKeys.parentCompanyIds)
            }
            searchPlaceholder={t('sales.locations.search')}
            className={classes.dropdownWrap}
            multiSelect
            checkmark
            searchable
            bordered
            pagination={companiesPagination}
            fetchMoreOptions={fetchCompanies}
            isLoading={loadingCompaniesDropDown}
            withTiles
          />
        </Box>

        <Box className={classes?.fieldWrapper}>
          <InputLabel>{t('sales.locations.locationId')}</InputLabel>
          <TextField
            className={classes?.textFiledFilter}
            name="id"
            id="id"
            fullWidth
            placeholder={t('sales.locations.addId')}
            onChange={(event) => handleMultipleSelectedValues(event, queryKeys.hsId)}
            value={formData?.hsId || ''}
          />
        </Box>

        <Box className={`${classes?.fieldWrapper}  ${classes?.dropdownCommonSection}`}>
          <InputLabel>{t('sales.locations.associatedFranchise')}</InputLabel>
          <CustomDropDown
            name="associatedFranchise"
            id="associatedFranchise"
            label={t('sales.locations.associatedFranchise')}
            options={franchises || []}
            selectedValues={formData?.associatedFranchise || {}}
            handleChange={inputChangedHandler}
            placeHolder={t('sales.locations.associatedFranchisePlaceholder')}
            className={classes.dropdownWrap}
            bordered
            placeHolderClassName={classes.placeHolderColor}
            searchable
          />
        </Box>

        {/* will be used in next release. Functionality implemented */}
        <Box className={`${classes?.fieldWrapper}  ${classes?.dropdownCommonSection}`}>
          <InputLabel>{t('sales.users.listingAssignedTo')}</InputLabel>
          <CustomDropDown
            label={t('sales.locations.assignedUserName')}
            name="assignedTo"
            id="assignedTo"
            placeHolder={`${t('sales.locations.select')} ${t('sales.locations.assignedUserName')}`}
            placeHolderClassName={classes.placeHolderColor}
            options={
              transformArrayForOptions(interneesAndSalesPersons, 'fullName', 'id', 'email') || []
            }
            selectedValues={transformArrayForOptions(memoizedAssignedTo, 'fullName', 'id') || []}
            handleChange={(event) => handleMultipleSelectedValues(event, queryKeys.assignedTo)}
            searchPlaceholder={t('sales.locations.search')}
            className={classes.dropdownWrap}
            multiSelect
            checkmark
            searchable
            bordered
          />
        </Box>
        <Box className={`${classes?.fieldWrapper}  ${classes?.customBtns}`} ref={containerRef}>
          <InputLabel>
            {t('sales.locations.noOfUnits')}
            <Tooltip title={t('sales.locations.maxValueTooltip')} arrow>
              <GreyInfoIcon />
            </Tooltip>
          </InputLabel>
          <Button
            variant="onlyText"
            className={`${minMaxValue().class ? minMaxValue().class : classes.popButton} `}
            endIcon={<ChevronDown className={isVisible ? classes.iconRotated : ''} />}
            disableRipple
            onClick={handleClick}
          >
            {/*{t('sales.locations.noOfUnits')}*/}
            {minMaxValue().text}
          </Button>
          <Box className={`${classes.InlineRangeField} ${isVisible ? classes.visible : ''}`}>
            <Box className={classes.inBox}>
              <TextField
                type="number"
                fullWidth
                className={classes.customDropdownSearchField}
                placeholder={t('sales.locations.min')}
                name={'minUnits'}
                id={'minUnits'}
                onChange={inputChangedHandler}
                onBlur={checkMinMaxValue}
                value={formData.minUnits || ''}
                min={0}
                max={formData.maxUnits}
                InputProps={{ inputProps: { min: 0, max: formData.maxUnits } }}
              />
              -
              <TextField
                type="number"
                fullWidth
                className={classes.customDropdownSearchField}
                placeholder={t('sales.locations.max')}
                name={'maxUnits'}
                id={'maxUnits'}
                onChange={inputChangedHandler}
                onBlur={checkMinMaxValue}
                value={formData.maxUnits || ''}
                min={formData.minUnits}
                // max={formData.maxUnits}
                InputProps={{ inputProps: { min: formData.minUnits } }}
              />
            </Box>
          </Box>
        </Box>
        <Box className={classes?.fieldWrapper}>
          <InputLabel>{t('sales.locations.lotNumber')}</InputLabel>
          <TextField
            className={classes?.textFiledFilter}
            name="lotNumber"
            id="lotNumber"
            fullWidth
            placeholder={t('sales.locations.lotNumber')}
            onChange={(event) => handleMultipleSelectedValues(event, queryKeys.lotNumber)}
            value={formData?.lotNumber || ''}
          />
        </Box>
        <Box className={classes?.fieldWrapper}>
          <InputLabel>{`${t('sales.locations.createDate')}`}</InputLabel>
          <DateRangePicker
            format={dateFormat}
            placeHolder={`${dateFormat} - ${dateFormat}`}
            selectedDates={formData?.createdDate || [null, null]}
            className={classes.createDatePicker}
            setDates={(dates) => {
              setFormData((prevState) => ({
                ...prevState,
                createdDate: dates,
              }));
            }}
          />
        </Box>
        <Box className={classes?.fieldWrapper}>
          <InputLabel>{`${t('sales.locations.lastModified')}`}</InputLabel>
          <DateRangePicker
            format={dateFormat}
            placeHolder={`${dateFormat} - ${dateFormat}`}
            selectedDates={formData?.hsLastmodifieddate || [null, null]}
            className={classes.lastModifiedDatePicker}
            setDates={(dates) => {
              setFormData((prevState) => ({
                ...prevState,
                hsLastmodifieddate: dates,
              }));
            }}
          />
        </Box>
      </Box>

      <DrawerFooter
        bulkApply={t('sales.locations.applyFilters')}
        bulkCancel={t('sales.locations.cancel')}
        handleCloseDrawer={filterCloseDrawer}
        anchor={anchor}
        type="submit"
        setFormData={setFormData_}
        applyFilters={applyFilters}
        drawerQuery={{
          ...formData,
        }}
        disabled={
          JSON.stringify({ ...formData_ }) === JSON.stringify(emptyState) &&
          JSON.stringify({ ...formData }) === JSON.stringify(emptyState)
        }
        classNameFooter={classes.moreFilterFooter}
      />
    </Box>
  );
};

MoreFiltersDrawer.defaultProps = {
  setCompaniesFilters: () => '',
};

MoreFiltersDrawer.propTypes = {
  anchor: PropTypes.string,
  filterCloseDrawer: PropTypes.func,
  width: PropTypes.number,
  formData_: PropTypes.object, // Adjust the type accordingly based on the expected data structure
  setFormData_: PropTypes.func,
  handleClearFilters: PropTypes.func,
  applyFilters: PropTypes.func,
  emptyState: PropTypes.object,
  companies: PropTypes.array, // Adjust the type accordingly based on the expected data structure
  setCompaniesFilters: PropTypes.func,
  companiesPagination: PropTypes.object,
  fetchCompanies: PropTypes.func,
  loadingCompaniesDropDown: PropTypes.bool,
};

export default MoreFiltersDrawer;
