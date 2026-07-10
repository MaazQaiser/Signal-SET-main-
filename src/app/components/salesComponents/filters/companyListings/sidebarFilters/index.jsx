import { InputLabel, SwipeableDrawer } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Clossicon } from 'assets/svg';
import { Morefilter } from 'assets/svg';
import classNames from 'classnames';
import DateRangePicker from 'commonComponents/RangeDatepicker';
import PropTypes from 'prop-types';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import CustomDropDown from 'src/app/components/common/customDropDown';
import useRegionalStateCityHook from 'src/hooks/useRegionalStateCityHook';
import { getDisplayConfiguration } from 'src/redux/store/slices/regionalCountryConfiguration';
import transformArrayForOptions from 'src/utils/array/transformArrayForOptions';

import { strategicStatusOptions } from '../../../deals/listingMoreFilter/listingMoreFilter.constant';
import { useStyles } from './sideBarFilter';

const queryKeys = {
  stateIds: 'stateIds',
  cityIds: 'cityIds',
  industryType: 'industryType',
  parentCompanyIds: 'parentCompanyIds',
};

const SwipeableTemporaryDrawer = ({
  query,
  setQuery,
  emptyQuery,
  applyFilters,
  industryTypes,
  industryTypesLoaded,
  setForceClear,
  companies,
  companiesPagination,
  fetchMoreOptions,
  loadingCompaniesDropDown,
}) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const { dateFormat } = useSelector(getDisplayConfiguration);

  const [state, setState] = useState({
    right: false,
  });

  const [formData, setFormData] = useState({ ...query });
  const strategicOptions = transformArrayForOptions(strategicStatusOptions(t), 'name', 'id');

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

  const queryCheck = (x) => x !== null && x !== '' && x.length !== 0;

  const toggleDrawer = (anchor, open) => () => {
    setFormData({ ...query });
    setState({ ...state, [anchor]: open });
  };

  const handleChange = (name, value) => {
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const multipleSelectedParentCompanies = async (event, field) => {
    const selectedValues = event.target.value?.map((value) => value);

    setFormData((prevState) => ({
      ...prevState,
      [field]: selectedValues,
    }));
  };

  useEffect(() => {
    if (formData?.states?.length) {
      fetchCities(formData.states.map((s) => s.value));
    }
  }, []);

  const handleMultipleSelectedValues = async (event, field) => {
    const selectedValues = event.target.value?.map((value) => value.value);

    setFormData((prevState) => ({
      ...prevState,
      [field]: selectedValues,
    }));
  };

  const autocompleteRef = useRef(null); // Create a ref for the Autocomplete component

  const handleCloseDrawer = (anchor) => {
    setState({ ...state, [anchor]: false });
  };

  const queryState = Object.values(query).some(queryCheck);
  const drawerQueryState = Object.values(formData).some(queryCheck);

  const handleClearFilter = () => {
    setForceClear(true);
    setQuery({ ...emptyQuery });
    setFormData(emptyQuery);
    queryState && applyFilters(emptyQuery);
  };

  const filterItemsByProperty = (formData, propertyName, items) => {
    const propertyValues =
      (propertyName && formData?.[propertyName]?.map((value) => parseInt(value, 10))) || [];
    return items.filter((item) => propertyValues.includes(item.id));
  };

  const _memoizedSelectedParentCompany = useMemo(() => {
    return transformArrayForOptions(
      filterItemsByProperty(formData, 'parentCompanyIds', companies),
      'name',
      'id',
    );
  }, [JSON.stringify(formData), companies]);

  const list = (anchor) => (
    <Box
      className={classes.siderBarBox}
      sx={{ width: anchor === 'top' || anchor === 'bottom' ? 'auto' : 399 }}
      role="presentation"
    >
      <Box className={classes.sideHeader}>
        <Stack
          direction="row"
          spacing={2}
          className={classes.sideHeaderTop}
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="h3">{`${t('commonText.allFilters')}`}</Typography>
          <a className={classes.cancelBtn} href="#" onClick={() => handleCloseDrawer(anchor)}>
            <Clossicon className={classes.crossIcons} />
          </a>
        </Stack>

        <Button
          disabled={!(queryState || drawerQueryState)}
          className={classes.moreFilter}
          onClick={handleClearFilter}
          variant="tertiaryGrey"
          disableRipple
          endIcon={<Clossicon className={classes.filterIcon} />}
        >
          {`${t('commonText.clearAll')}`}
        </Button>
      </Box>
      <Box className={classNames(classes.filedArea, 'innerScrollBar')}>
        {/* Pass the ref to the Autocomplete component */}
        <Box ref={autocompleteRef} className={classes.marginBotom}>
          <InputLabel>{`${t('sales.companies.states')}`}</InputLabel>
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
            className={classes.dropHight}
            multiSelect
            checkmark
            searchable
            bordered
            withTiles
            isLoading={loading}
          />
        </Box>
        <Box className={classes.marginBotom}>
          <InputLabel>{`${t('sales.companies.cities')}`}</InputLabel>
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
            className={classes.dropHight}
            multiSelect
            checkmark
            searchable
            bordered
            withTiles
            isLoading={loading}
            disabled={!formData?.states?.length}
          />
        </Box>
        <Box ref={autocompleteRef}>
          <Box className={classes.marginBotom}>
            <InputLabel>{`${t('sales.companies.parentCompany')}`}</InputLabel>
            <CustomDropDown
              name="parentCompany"
              id="parentCompany"
              label={t('sales.companies.parentCompany')}
              options={companies || []}
              selectedValues={formData.parentCompany || []}
              handleChange={(event) => {
                multipleSelectedParentCompanies(event, 'parentCompany');
                handleMultipleSelectedValues(event, queryKeys.parentCompanyIds);
              }}
              multiSelect={true}
              checkmark={true}
              clearAll={true}
              searchable={true}
              withTiles={true}
              placeHolder={`${t('sales.companies.select')} ${t('sales.companies.parentCompany')}`}
              // disabled={!industryTypesLoaded}
              placeHolderClassName="placeHolderColor"
              bordered
              className={classes.dropHight}
              pagination={companiesPagination}
              fetchMoreOptions={fetchMoreOptions}
              onCloseCleanup={fetchMoreOptions}
              isLoading={loadingCompaniesDropDown}
            />
          </Box>
        </Box>
        <Box ref={autocompleteRef}>
          <Box className={classes.marginBotom}>
            <InputLabel>{`${t('sales.companies.industryVerticals')}`}</InputLabel>
            <CustomDropDown
              name="value"
              label={t('sales.companies.industryVerticals')}
              options={industryTypes}
              selectedValues={industryTypes.filter((state) =>
                formData.industryType.includes(state.value),
              )}
              handleChange={(event) => handleMultipleSelectedValues(event, queryKeys.industryType)}
              multiSelect={true}
              checkmark={true}
              clearAll={true}
              searchable={true}
              withTiles={false}
              placeHolder={`${t('sales.locations.select')} ${t('sales.companies.industryVerticals')}`}
              disabled={!industryTypesLoaded}
              placeHolderClassName="placeHolderColor"
              bordered
              className={classes.dropHight}
            />
          </Box>
        </Box>
        <Box ref={autocompleteRef}>
          <Box className={classes.marginBotom}>
            <InputLabel>{t('sales.companies.selectStrategicPartnership')}</InputLabel>
            <CustomDropDown
              label={`${t('sales.companies.strategicPartnership')}`}
              name="strategicPartnershipStatus"
              id="strategicPartnershipStatus"
              placeHolder={t('sales.companies.selectStrategicPartnership')}
              placeHolderClassName={classes.placeHolderColor}
              options={strategicOptions || []}
              selectedValues={formData?.strategicPartnershipStatus || {}}
              handleChange={(event) =>
                handleChange('strategicPartnershipStatus', event.target.value)
              }
              className={classes.dropdownWrap}
              bordered
            />
          </Box>
        </Box>
        <Box className={classes.dateRanges}>
          <Box className={classes.marginBotom}>
            <InputLabel>{`${t('sales.companies.createDate')}`}</InputLabel>
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
          <Box className={classes.marginBotom}>
            <InputLabel>{`${t('sales.companies.lastActivity')}`}</InputLabel>
            <DateRangePicker
              format={dateFormat}
              placeHolder={`${dateFormat} - ${dateFormat}`}
              selectedDates={formData?.lastActivityDate || [null, null]}
              className={classes.lastActivityPicker}
              setDates={(dates) => {
                setFormData((prevState) => ({
                  ...prevState,
                  lastActivityDate: dates,
                }));
              }}
            />
          </Box>
          <Box className={classes.marginBotom}>
            <InputLabel>{`${t('sales.companies.lastModified')}`}</InputLabel>
            <DateRangePicker
              format={dateFormat}
              placeHolder={`${dateFormat} - ${dateFormat}`}
              selectedDates={formData?.lastModifiedDate || [null, null]}
              className={classes.lastModiedPicker}
              setDates={(dates) => {
                setFormData((prevState) => ({
                  ...prevState,
                  lastModifiedDate: dates,
                }));
              }}
            />
          </Box>
        </Box>
      </Box>

      <Box className={classes.sideFooter}>
        <Stack direction="row" justifyContent="end" className={classes.buttonStacks}>
          <Button onClick={() => handleCloseDrawer(anchor)} variant="secondaryGrey">
            {t('sales.locations.cancel')}
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              setQuery(formData);
              setState({ right: false });
              applyFilters(formData);
            }}
            disabled={!(queryState || drawerQueryState)}
          >
            {`${t('commonText.applyFilters')}`}
          </Button>
        </Stack>
      </Box>
    </Box>
  );

  return (
    <>
      {['right'].map((anchor) => (
        <React.Fragment key={anchor}>
          <Button
            disableRipple
            className={`${classes.morefilter} ${classes.spaceBtn}`}
            onClick={toggleDrawer(anchor, true)}
          >
            {t('sales.locations.moreFilters')} <Morefilter className={classes.filterIcon} />
          </Button>

          <SwipeableDrawer
            className={classes.sideDraw}
            anchor={anchor}
            open={state[anchor]}
            onClose={() => handleCloseDrawer(anchor)}
            onOpen={() => toggleDrawer(anchor, false)}
          >
            {list(anchor)}
          </SwipeableDrawer>
        </React.Fragment>
      ))}
    </>
  );
};

SwipeableTemporaryDrawer.propTypes = {
  query: PropTypes.object,
  setQuery: PropTypes.func,
  emptyQuery: PropTypes.object,
  applyFilters: PropTypes.func,
  industryTypes: PropTypes.array, // Adjust the type accordingly based on the expected data structure
  industryTypesLoaded: PropTypes.bool,
  setForceClear: PropTypes.func,
  companies: PropTypes.array, // Adjust the type accordingly based on the expected data structure
  companiesPagination: PropTypes.object,
  fetchMoreOptions: PropTypes.func,
  loadingCompaniesDropDown: PropTypes.bool,
};

export default SwipeableTemporaryDrawer;
