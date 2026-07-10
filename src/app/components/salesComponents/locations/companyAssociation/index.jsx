import { InputLabel, Stack, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import classNames from 'classnames';
import LoaderComponent from 'commonComponents/loader';
import PropTypes from 'prop-types';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import CustomDropDown from 'src/app/components/common/customDropDown';
import { useApiControllers } from 'src/helper/axios';
import {
  getCompaniesOption,
  getLocationAffiliationLabels,
  updateLocationCompanyAffiliation,
} from 'src/services/location.service';
import transformArrayForOptions from 'src/utils/array/transformArrayForOptions';
import { toastSettings } from 'src/utils/constants';
import { companiesPaginationEmptyState } from 'src/utils/constants/emptyStates/companiesPagination';

import formValidatorJoi from '../../../../../utils/formValidator/formValidator.requiredCheck';
import DrawerFooter from '../../components/drawerFooter';
import DrawerHeader from '../../components/drawerHeader';
import { useStyles } from './companyAssociation.js';

const CompanyAssociation = ({
  anchor,
  onClose,
  width,
  location,
  company,
  onSuccess,
  refetch = () => {},
}) => {
  const classes = useStyles();
  const { t } = useTranslation();

  const { getNewApiController } = useApiControllers();

  const [formData, setFormData] = useState({ company: {}, locationAffiliation: [] });
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  const [errorMessages, setErrorMessages] = useState({});
  const [companies, setCompanies] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [companiesPagination, setCompaniesPagination] = useState(companiesPaginationEmptyState);
  const [locationAffiliationLabels, setLocationAffiliationLabels] = useState([]);
  const [loading, setLoading] = useState(false);

  const updateFormHandler = (name, value) => {
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const inputChangedHandler = (event) => {
    const { name, value } = event.target;
    updateFormHandler(name, value);
    setErrorMessages({});
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsSubmittingForm(true);
    try {
      const errors = await formValidatorJoi(
        {
          propertyName: formData.company?.value?.toString() || '',
          locationAffiliation: formData.locationAffiliation,
        },
        t,
      );
      if (errors && Object.keys(errors).length) {
        setErrorMessages(errors);
        setIsSubmittingForm(false);
        return;
      }

      const payload = {
        companyId: formData?.company.value,
        locationAffiliation: formData?.locationAffiliation?.map((item) => item.value),
      };

      const apiResponse = await updateLocationCompanyAffiliation(location?.locationId, {
        companyLocationsAttributes: [payload],
      });

      if (apiResponse.statusCode === 200) {
        onSuccess();
        toast.success(apiResponse.message, {
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
        onClose(anchor);
        refetch();
      }
    } catch (error) {
      toast.error(error?.message, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    } finally {
      setIsSubmittingForm(false);
    }
  };

  const handleFetchMore = (status, searchText) => {
    if (status === undefined) return;
    if (status === false) {
      setCurrentPage(1);
      setSearch(() => searchText);
    } else {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  const fetchCompanies = async () => {
    try {
      const apiController = getNewApiController();
      setLoadingCompanies(true);
      const response = await getCompaniesOption(currentPage, search, {
        signal: apiController.signal,
      });
      if (response?.statusCode === 200) {
        currentPage == 1
          ? setCompanies(response?.data?.companies)
          : setCompanies((prev) => [...prev, ...(response?.data?.companies || [])]);
        setCompaniesPagination(response?.pagination);
      }
    } catch (error) {
      if (error?.code === 'ERR_CANCELED') return;
      toast.error(error?.message, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
    setLoadingCompanies(false);
  };

  const fetchLocationLabels = async (companyId) => {
    try {
      setLoading(true);
      const response = await getLocationAffiliationLabels(companyId, {
        locationId: location?.locationId,
      });
      if (response.statusCode === 200) {
        setLocationAffiliationLabels(response?.data?.locationLabels);
        setLoading(false);
      }
    } catch (error) {
      toast.error(error?.message, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
      setLoading(false);
    }
  };

  const filteredCompanies = useMemo(() => {
    return transformArrayForOptions(
      companies?.filter((item) => !location.companies.find((i) => i.id === item.id)),
      'name',
      'id',
    );
  }, [companies]);

  useEffect(() => {
    fetchCompanies();
  }, [currentPage, search]);

  useEffect(() => {
    if (!company?.id) return;
    const payload = {
      company: { label: company.name, value: company?.id },
      locationAffiliation: company?.companyAffiliation?.map((item) => ({
        label: item.name,
        value: item.key,
      })),
    };
    setFormData({ ...payload });
    fetchLocationLabels(company.id);
  }, [company]);

  useEffect(() => {
    formData.company?.value && fetchLocationLabels(formData.company?.value);
  }, [formData.company]);

  const locationAffiliationOptions = useMemo(() => {
    return locationAffiliationLabels.map((label) => ({
      label: label.title,
      value: label.key,
      disabled: label.disabled,
    }));
  }, [locationAffiliationLabels]);

  return (
    <>
      {isSubmittingForm && <LoaderComponent label={t('sales.loading')} />}
      <Box
        className={classes.siderbarbox}
        sx={{ width: anchor === 'top' || anchor === 'bottom' ? 'auto' : width }}
        role="presentation"
        component="form"
        onSubmit={handleFormSubmit}
      >
        <Stack className={classes.boxinner} justifyContent="space-between">
          <Box className={classes.sideheader}>
            <DrawerHeader
              title={
                company?.id ? t('sales.companies.editCompany') : t('sales.companies.addCompany')
              }
              subtext={
                company?.id
                  ? t('sales.companies.editCompanyText')
                  : t('sales.companies.addCompanyText')
              }
              handleCloseDrawer={onClose}
              anchor={anchor}
              className={classes.AddCompanyHeader}
            />
          </Box>
          <Box className={classNames(classes.locationForm, 'innerScrollBar')}>
            <Box className={`${classes.sideBySideCol}`}>
              {company?.id ? (
                <Box className={classes.ownerNameCol}>
                  <Typography
                    variant="body2"
                    className={`${classes.fieldWrapper}  ${classes.textWrapper}`}
                    component="div"
                  >
                    {company?.name}
                  </Typography>
                  <Typography className={classes.phoneWrapper}>
                    {company?.companyOwner ? `${company?.companyOwner}` : ''}
                    {company?.contact ? ` . ${company?.contact} .` : ''}
                    {company?.score ? ` . ${company?.score}` : ''}
                  </Typography>
                </Box>
              ) : (
                <Box
                  className={`${classes.fieldWrapper}  ${classes.dropdownCommonSection}`}
                  component="div"
                >
                  <InputLabel htmlFor="company">{t('sales.locations.company')}</InputLabel>
                  <CustomDropDown
                    name="company"
                    id="company"
                    label={t('sales.locations.company')}
                    disabled={!!company?.id}
                    options={filteredCompanies || []}
                    selectedValues={formData?.company || {}}
                    handleChange={inputChangedHandler}
                    placeHolder={t('sales.locations.searchCompany')}
                    searchable
                    bordered
                    className={classes.dropHigh}
                    placeHolderClassName={classes.placeHolderText}
                    isError={errorMessages?.company}
                    error={errorMessages?.company}
                    pagination={companiesPagination}
                    fetchMoreOptions={handleFetchMore}
                    isLoading={loadingCompanies}
                  />
                  {errorMessages?.propertyName && (
                    <span className="errorMessage">Company is required</span>
                  )}
                </Box>
              )}
            </Box>
            <Box className={`${classes.sideBySideCol}`}>
              <Box className={`${classes?.fieldWrapper}  ${classes?.dropdownCommonSection}`}>
                <InputLabel>{t('sales.locations.locationAffiliation')}</InputLabel>
                <CustomDropDown
                  name="locationAffiliation"
                  id="locationAffiliation"
                  placeHolder={`${t('sales.locations.select')} ${t('sales.locations.locationAffiliation')}`}
                  placeHolderClassName={classes.placeHolderColor}
                  options={locationAffiliationOptions || []}
                  selectedValues={formData?.locationAffiliation || []}
                  handleChange={inputChangedHandler}
                  searchPlaceholder={t('sales.locations.search')}
                  className={classes?.dropHigh}
                  searchable
                  bordered
                  multiSelect
                  withTiles
                  isLoading={loading}
                />
                {errorMessages?.locationAffiliation && (
                  <span className="errorMessage">{'Property Affiliation is required'}</span>
                )}
              </Box>
            </Box>
          </Box>
          <DrawerFooter
            classNameFooter={classes.sideDrawerFooter}
            bulkApply={t('sales.locations.save')}
            bulkCancel={t('sales.locations.cancel')}
            handleCloseDrawer={onClose}
            anchor={anchor}
            type="submit"
            disabled={isSubmittingForm}
          />
        </Stack>
      </Box>
    </>
  );
};

CompanyAssociation.propTypes = {
  locationInformationFromMap: PropTypes.object,
  isLoaded: PropTypes.bool.isRequired,
  anchor: PropTypes.string,
  onClose: PropTypes.func,
  width: PropTypes.number,
  location: PropTypes.object,
  company: PropTypes.object,
  onSuccess: PropTypes.func,
  refetch: PropTypes.func,
  loadingCompaniesDropDown: PropTypes.bool,
};

export default CompanyAssociation;
