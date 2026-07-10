import { Box, Button, Chip, Skeleton, Typography } from '@mui/material';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import { ReactComponent as ChevronDownIcon } from 'assets/svg/chevron-down.svg';
import React, { useEffect, useState } from 'react';
import ReactFlagsSelect from 'react-flags-select';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import LoaderComponent from 'src/app/components/common/loader';
import SweetAlertModal from 'src/app/components/common/sweetAlertModal';
import { ACL_SETTINGS_REGIONAL_CONFIGURATIONS_CREATE } from 'src/app/router/constant/SALESMODULE';
import { ReactComponent as PlusIcon } from 'src/assets/svg/add-icon.svg';
import RenderIfHasPermission from 'src/hoc/renderIfHasPermission';
import { setConfigurations } from 'src/redux/store/slices/regionalCountryConfiguration';
import {
  createRegionalConfiguration,
  deleteRegionalConfiguration,
  getAllRegionalConfigurations,
  getRegionalConfigurationOptions,
  getRegionalConfigurations,
  updateRegionalConfiguration,
} from 'src/services/regionalConfiguration.service';
import { REGIONAL_CONFIGURATION_STATUS, toastSettings } from 'src/utils/constants';
import { toaster } from 'src/utils/toast';

import RegionalConfigurationForm from './form';
import { useStyles } from './styles';

const isPublishedStatus = (status) =>
  String(status || '').toLowerCase() === REGIONAL_CONFIGURATION_STATUS.PUBLISHED;

const EMPTY_CONFIGURATION = {};

const RegionalConfiguration = () => {
  const classes = useStyles();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [expanded, setExpanded] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [countries, setCountries] = useState([]);
  const [regionalConfigurationOptions, setRegionalConfigurationOptions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [publishPayload, setPublishPayload] = useState(null);

  const fetchRegionalConfiguration = async () => {
    try {
      setLoading(true);
      const [configurationsResponse, optionsResponse] = await Promise.all([
        getAllRegionalConfigurations(),
        getRegionalConfigurationOptions(),
      ]);

      const apiOptions = optionsResponse?.data?.countryConfigurationOptions || null;
      setRegionalConfigurationOptions(apiOptions);

      const countryConfigurations =
        configurationsResponse?.data?.countryConfigurations?.sort(
          (a, b) => Number(b.default) - Number(a.default),
        ) || [];
      setCountries(countryConfigurations);
    } catch (error) {
      console.error('Failed to load regional configuration data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegionalConfiguration();
  }, []);

  const handleAddMore = () => setShowAddForm(true);

  const handleCancelNew = () => setShowAddForm(false);

  const transformPayload = (payload) => ({
    id: payload.id,
    country: payload.country,
    currencyId: Number(payload.currency?.value),
    dateFormat: Number(payload.dateFormat?.value),
    timeFormat: Number(payload.timeFormat?.value),
    timePrecision: Number(payload.timePrecision?.value),
    distanceUnit: Number(payload.distanceUnit?.value),
  });

  const handleSaveConfiguration = async (payload, status) => {
    try {
      setSubmitLoading(true);
      const apiPayload = { ...transformPayload(payload), status };
      const isNew = !payload.id;
      const response = isNew
        ? await createRegionalConfiguration(apiPayload)
        : await updateRegionalConfiguration(apiPayload.id, apiPayload);

      if (response?.statusCode === 200) {
        const updatedCountry = response.data?.countryConfiguration;
        if (isNew) {
          setCountries((prev) => [...prev, updatedCountry]);
          setShowAddForm(false);
        } else {
          setCountries((prev) =>
            prev.map((c) => (c.id === updatedCountry.id ? updatedCountry : c)),
          );
        }

        if (publishPayload) {
          setPublishPayload(null);
          fetchPublishedRegionalConfigs();
        }

        const successMessage =
          status === REGIONAL_CONFIGURATION_STATUS.PUBLISHED
            ? t('sales.settings.regionalConfigurations.publishSuccess')
            : t('sales.settings.regionalConfigurations.saveDraftSuccess');

        toaster.success({
          text: successMessage,
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
        getRegionalConfigurationOptions();
      }
    } catch (error) {
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    } finally {
      setSubmitLoading(false);
    }
  };

  const fetchPublishedRegionalConfigs = async () => {
    try {
      const regionalResponse = await getRegionalConfigurations();
      const countryConfigurations = regionalResponse.data?.countryConfigurations || [];
      if (regionalResponse?.statusCode === 200) {
        dispatch(setConfigurations(countryConfigurations));
      }
    } catch (err) {
      console.log(err);
    }
  };

  const confirmPublish = () => {
    handleSaveConfiguration(publishPayload, REGIONAL_CONFIGURATION_STATUS.PUBLISHED);
  };

  const handleDelete = async (id) => {
    try {
      setSubmitLoading(true);
      const response = await deleteRegionalConfiguration(id);
      if (response?.statusCode === 200) {
        setCountries((prev) => prev.filter((c) => c.id !== id));
        setExpanded(false);
        toaster.success({
          text: t('sales.settings.regionalConfigurations.deleteSuccess'),
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
        getRegionalConfigurationOptions();
      }
    } catch (error) {
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <Box className={classes.container}>
      {submitLoading && <LoaderComponent size={50} color={'primary'} label={'Loading'} />}
      <Typography variant="h4" className={classes.title}>
        {t('sales.settings.regionalConfigurations.configuredCountriesList')}
      </Typography>
      <Box className={classes.accordionContainer}>
        {loading ? (
          <Box className={classes.accordionSkeleton} data-testid="skeleton-container">
            <Skeleton variant="rectangular" width="100%" height={40} />
            <Skeleton variant="rectangular" width="100%" height={40} />
            <Skeleton variant="rectangular" width="100%" height={40} />
            <Skeleton variant="rectangular" width="100%" height={40} />
          </Box>
        ) : (
          <>
            {countries.map((country) => (
              <Accordion
                key={country.country?.value}
                expanded={expanded === `panel-${country.country?.value}`}
                onChange={(event, isExpanded) => {
                  setExpanded(isExpanded ? `panel-${country.country?.value}` : false);
                }}
                className={classes.accordion}
              >
                <AccordionSummary
                  expandIcon={<ChevronDownIcon className={classes.chevronIcon} />}
                  className={classes.accordionSummary}
                >
                  <Box className={classes.countryItem}>
                    <Box className={classes.flagContainer}>
                      <ReactFlagsSelect
                        selected={country.country?.value}
                        disabled={true}
                        showSelectedLabel={false}
                        showOptionLabel={false}
                        className={classes.flagOnly}
                      />
                    </Box>
                    <Typography variant="h5" className={classes.countryName}>
                      {country.country?.label}
                    </Typography>
                    <Chip
                      label={country.status}
                      className={classes.statusChip}
                      color={
                        country.status === REGIONAL_CONFIGURATION_STATUS.DRAFT
                          ? 'warning'
                          : 'success'
                      }
                      size="small"
                    />
                  </Box>
                </AccordionSummary>
                <AccordionDetails className={classes.accordionDetails}>
                  {regionalConfigurationOptions && (
                    <RegionalConfigurationForm
                      configuration={country}
                      options={regionalConfigurationOptions}
                      disabled={isPublishedStatus(country.status)}
                      onSaveDraft={(payload) =>
                        handleSaveConfiguration(payload, REGIONAL_CONFIGURATION_STATUS.DRAFT)
                      }
                      onPublish={(payload) => setPublishPayload(payload)}
                      onDelete={handleDelete}
                    />
                  )}
                </AccordionDetails>
              </Accordion>
            ))}
            {showAddForm && regionalConfigurationOptions && (
              <Box className={classes.newAddFormContainer}>
                <RegionalConfigurationForm
                  title={t('sales.settings.regionalConfigurations.addNewCountryConfiguration')}
                  configuration={EMPTY_CONFIGURATION}
                  options={regionalConfigurationOptions}
                  disabled={false}
                  showCancel={true}
                  onCancel={handleCancelNew}
                  onSaveDraft={(payload) =>
                    handleSaveConfiguration(payload, REGIONAL_CONFIGURATION_STATUS.DRAFT)
                  }
                  onPublish={(payload) => setPublishPayload(payload)}
                />
              </Box>
            )}
          </>
        )}
      </Box>
      {!loading && !showAddForm && (
        <RenderIfHasPermission name={ACL_SETTINGS_REGIONAL_CONFIGURATIONS_CREATE}>
          <Button
            variant="secondaryBlue"
            className={classes.addMoreButton}
            startIcon={<PlusIcon />}
            onClick={handleAddMore}
          >
            {t('sales.settings.regionalConfigurations.addMore')}
          </Button>
        </RenderIfHasPermission>
      )}
      <SweetAlertModal
        show={!!publishPayload}
        title={t('sales.settings.regionalConfigurations.publishConfirmationTitle')}
        text={t('sales.settings.regionalConfigurations.publishConfirmationText')}
        type="warning"
        confirmButtonText={t('sales.settings.regionalConfigurations.publish')}
        cancelButtonText={t('sales.settings.regionalConfigurations.cancel')}
        handleConfirmButton={confirmPublish}
        handleCancelButton={() => setPublishPayload(null)}
      />
    </Box>
  );
};

export default RegionalConfiguration;
