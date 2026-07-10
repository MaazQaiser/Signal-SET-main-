import { Close as CloseIcon } from '@mui/icons-material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import { Box, Chip, Drawer, IconButton, InputLabel, TextField, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import CustomDropDown from 'src/app/components/common/customDropDown';
import RequiredAsterik from 'src/app/components/common/requiredAsterik';
import InfoCardSkeleton from 'src/app/components/common/skeletonLoader/infoCardSkeleton';
import { ActiveStepsKeys, getPayload } from 'src/app/sales/pages/contractCreation/helper';
import { updateServiceCardData } from 'src/redux/store/slices/contractServices';
import { getDisplayConfiguration } from 'src/redux/store/slices/regionalCountryConfiguration';
import { checkFeasibleService } from 'src/services/deal.service';
import { capitalizeFirstLetter } from 'src/utils/string/common';

import { FormKeys, serviceTypes } from '../../helper';
import FinancialSummaryTable from './financialSummaryTable';
import NetProfitWidget from './netProfitWidget';
import { useStyles } from './styles';

const getBillingCycleOptions = (t) => [
  { label: t('sales.contract.hourly'), value: 'hourly' },
  { label: t('sales.contract.daily'), value: 'daily' },
  { label: t('sales.contract.weekly'), value: 'weekly' },
  { label: t('sales.contract.biWeekly'), value: 'biWeekly' },
  { label: t('sales.contract.monthly'), value: 'monthly' },
  { label: t('sales.contract.biAnnual'), value: 'biAnnual' },
  { label: t('sales.contract.annual'), value: 'annual' },
];

const SuggestRateDrawer = ({ open, onClose, serviceIndex, baseRates, clickedOn }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { symbol } = useSelector(getDisplayConfiguration);

  const { id: dealId } = useParams();

  const services = useSelector((state) => state.contractServices?.['services']);

  const [currentServiceIndex, setCurrentServiceIndex] = useState(0);

  const [currentSelectedService, setCurrentSelectedService] = useState({});

  const [hourlyRate, setHourlyRate] = useState({});

  const [pricingDetails, setPricingDetails] = useState({});

  const [currentFinancialMatrix, setCurrentFinancialMatrix] = useState([]);

  const [currentVehicleMatrix, setCurrentVehicleMatrix] = useState([]);

  const [selectedValue, setSelectedValue] = useState({});

  const [isPricingLoading, setIsPricingLoading] = useState(false);

  const effectiveIndex = serviceIndex !== undefined ? serviceIndex : currentServiceIndex;

  /**
   * common function to update services
   */
  const updateServicesHandler = useCallback(
    (name, value, index) => {
      dispatch(updateServiceCardData({ name, value, index, baseRates }));
    },
    [updateServiceCardData, dispatch, baseRates],
  );

  const handleInputChange = (name, value) => {
    /**
     * It will only store floating values upto 2 decimel places
     */
    if (
      (name === FormKeys.HOURLY_RATE ||
        name === FormKeys.VEHICLE_RATE ||
        name === FormKeys.PRICE_PER_HIT ||
        name === FormKeys.TIME_ON_PROPERTY) &&
      !value.match(/^(\d*\.{0,1}\d{0,2}$)/)
    ) {
      return;
    }

    setHourlyRate((prev) => ({
      ...prev,
      [name]: value === '' ? '' : Number(value),
    }));
  };

  const handleInputBlur = (name, value) => {
    updateServicesHandler(name, value, effectiveIndex);
  };

  const handlePrevClick = () => {
    // your prev logic
    setCurrentServiceIndex((prev) => Math.max(prev - 1, 0)); // ✅ prevent going below 0
  };

  const handleNextClick = () => {
    // your next logic
    setCurrentServiceIndex(
      (prev) => (services && prev < services.length - 1 ? prev + 1 : prev), // ✅ prevent overflow
    );
  };

  const handleDropdownChange = (event) => {
    const { name, value } = event.target;
    setSelectedValue({ [name]: value });

    const currentDetails = pricingDetails[currentSelectedService.name] || {};

    if (name === 'billableVehicleCycle') {
      // use vehicle matrix from pricingDetails
      setCurrentVehicleMatrix(currentDetails.vehicleMatrix?.[value?.value] || []);
    } else {
      // use financial matrix from pricingDetails
      setCurrentFinancialMatrix(currentDetails.financialMatrix?.[value?.value] || []);
    }
  };

  /**
   * 🔹 Fetch pricing details for ALL services once
   */
  const getPricingDetails = async (servicesList) => {
    setIsPricingLoading(true);
    try {
      const payload = await getPayload({ services: servicesList }, ActiveStepsKeys.SERVICES, {});
      const response = await checkFeasibleService(dealId, payload?.services);

      if (response?.statusCode === 200) {
        const details = {};

        response?.data?.forEach((serviceResult, index) => {
          const service = servicesList[index]; // match request service with response
          if (!service) return;

          // Save the entire response chunk for that service
          details[service.name] = {
            financialMatrix: serviceResult?.financialMatrix,
            graphData: serviceResult?.graphData,
            ...(serviceResult?.key === 'dedicated'
              ? { vehicleMatrix: serviceResult.vehicleMatrix }
              : {}),
            ...(serviceResult?.key === 'dedicated'
              ? { vehicleGraphData: serviceResult.vehicleGraphData }
              : {}),
          };
        });

        setPricingDetails(details);
      }
    } catch (error) {
      // console.error(error);
    } finally {
      setIsPricingLoading(false);
    }
  };

  /**
   * 🔹 Decide fetch strategy when services change
   */
  useEffect(() => {
    if (services && services.length > 0) {
      if (serviceIndex !== undefined) {
        // original per-service API call
        const currentService = services[serviceIndex];
        if (currentService) getPricingDetails([currentService]);
      } else {
        // new batched call
        getPricingDetails(services);
      }
    }
  }, [services, serviceIndex]);

  /**
   * 🔹 Update current service & rate details on index change
   */
  useEffect(() => {
    if (
      services &&
      services.length > 0 &&
      effectiveIndex >= 0 &&
      effectiveIndex < services.length
    ) {
      const currentService = services[effectiveIndex];
      setCurrentSelectedService(currentService);

      // Set hourly / vehicle rates
      const hourlyRateValue =
        currentService?.type === serviceTypes.DEDICATED
          ? Number(currentService?.[FormKeys.HOURLY_RATE])
          : Number(currentService?.[FormKeys.PRICE_PER_HIT]);

      const vehicleRateValue =
        currentService?.type === serviceTypes.DEDICATED &&
        currentService?.[FormKeys.INCLUDE_VEHICLE]
          ? Number(currentService?.[FormKeys.VEHICLE_RATE])
          : null;

      setHourlyRate({
        [currentService?.type === serviceTypes.DEDICATED
          ? FormKeys.HOURLY_RATE
          : FormKeys.PRICE_PER_HIT]: hourlyRateValue || null,
        [FormKeys.VEHICLE_RATE]: vehicleRateValue || null,
        [FormKeys.TIME_ON_PROPERTY]: currentService[FormKeys.TIME_ON_PROPERTY] || null,
      });

      // ✅ Load matrices from cached details
      const details = pricingDetails[currentService.name];
      if (details) {
        setCurrentFinancialMatrix(details.financialMatrix?.biWeekly);
        setCurrentVehicleMatrix(details.vehicleMatrix?.biWeekly);
      } else {
        setCurrentFinancialMatrix(pricingDetails[services[0].name]?.financialMatrix?.biWeekly);
        setCurrentVehicleMatrix(pricingDetails[services[0].name]?.vehicleMatrix?.biWeekly);
      }
    }
  }, [services, effectiveIndex, pricingDetails]);

  const netProfitGraphData = pricingDetails[currentSelectedService.name]?.graphData?.netProfit;
  const laborEfficiencyGraphData =
    pricingDetails[currentSelectedService.name]?.graphData?.laborEfficiency;
  const vehicleNetProfitGraphData =
    pricingDetails[currentSelectedService.name]?.vehicleGraphData?.netProfit;

  const showPricingSkeleton = isPricingLoading && !pricingDetails?.[currentSelectedService?.name];

  return (
    <Drawer anchor="right" open={open} onClose={onClose} className={classes.drawer}>
      <Box className={classes.drawerContainer}>
        <Box className={classes.header}>
          <Typography className={classes.title} variant="h3">
            {t('sales.contract.suggestedRate')}
          </Typography>
          <IconButton onClick={onClose} className={classes.closeButton} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Service Card Design */}
        <Box className={classes.serviceCard}>
          <Box className={classes.serviceCardHeader}>
            {(serviceIndex === undefined || serviceIndex === null || serviceIndex < 0) &&
              services?.length > 1 && (
                <Box className={classes.navigationButtons}>
                  <IconButton
                    className={classes.navButton}
                    onClick={handlePrevClick}
                    disabled={currentServiceIndex === 0}
                  >
                    <ChevronLeft />
                  </IconButton>
                  <IconButton
                    className={classes.navButton}
                    onClick={handleNextClick}
                    disabled={currentServiceIndex === services?.length - 1}
                  >
                    <ChevronRight />
                  </IconButton>
                </Box>
              )}
            <Typography className={classes.serviceName}>{currentSelectedService?.name}</Typography>
            <Chip
              label={currentSelectedService?.type}
              color={
                currentSelectedService?.type === serviceTypes.DEDICATED ? 'success' : 'primary'
              }
            />
          </Box>
          <Box className={classes.divider} />
        </Box>

        {(!clickedOn || clickedOn === 'hourlyRate') && (
          <>
            {/* repeatable content */}
            <Box
              className={classes.section}
              sx={{
                display: 'flex',
                gap: 2,
                alignItems: 'flex-start',
              }}
            >
              <Box className={classes.inputContainer} sx={{ flex: 1 }}>
                <InputLabel htmlFor={FormKeys.HOURLY_RATE}>
                  {currentSelectedService?.type === serviceTypes.DEDICATED
                    ? t('sales.contract.hourlyRateInDollars', { symbol })
                    : t('sales.contract.pricePerVisit', { symbol })}
                  <RequiredAsterik />
                </InputLabel>
                <TextField
                  className={classes.inputField}
                  variant="outlined"
                  size="small"
                  fullWidth
                  name={
                    currentSelectedService?.type === serviceTypes.DEDICATED
                      ? FormKeys.HOURLY_RATE
                      : FormKeys.PRICE_PER_HIT
                  }
                  value={
                    hourlyRate?.[
                      currentSelectedService?.type === serviceTypes.DEDICATED
                        ? FormKeys.HOURLY_RATE
                        : FormKeys.PRICE_PER_HIT
                    ]
                  }
                  onChange={(e) =>
                    handleInputChange(
                      currentSelectedService?.type === serviceTypes.DEDICATED
                        ? FormKeys.HOURLY_RATE
                        : FormKeys.PRICE_PER_HIT,
                      e.target.value,
                    )
                  }
                  onWheel={(e) => e.target.blur()} // disables scroll on input
                  onBlur={(e) =>
                    handleInputBlur(
                      currentSelectedService?.type === serviceTypes.DEDICATED
                        ? FormKeys.HOURLY_RATE
                        : FormKeys.PRICE_PER_HIT,
                      e.target.value,
                    )
                  }
                  type="number"
                  placeholder={t('sales.contract.enterHourlyRate')}
                  InputProps={{
                    inputProps: {
                      min: 0,
                    },
                  }}
                />
              </Box>

              {currentSelectedService?.type === serviceTypes.PATROL && (
                <Box className={classes.inputContainer} sx={{ flex: 1 }}>
                  <InputLabel htmlFor={FormKeys.TIME_ON_PROPERTY}>
                    {t('sales.contract.timeOnProperty')}
                  </InputLabel>

                  <TextField
                    className={classes.inputField}
                    variant="outlined"
                    size="small"
                    fullWidth
                    name={FormKeys.TIME_ON_PROPERTY}
                    value={hourlyRate?.[FormKeys.TIME_ON_PROPERTY]}
                    onChange={(e) => handleInputChange(FormKeys.TIME_ON_PROPERTY, e.target.value)}
                    onBlur={(e) => handleInputBlur(FormKeys.TIME_ON_PROPERTY, e.target.value)}
                    onWheel={(e) => e.target.blur()}
                    type="number"
                    placeholder="Enter time in minutes"
                    InputProps={{ inputProps: { min: 1 } }}
                  />
                  <Typography
                    variant="caption"
                    sx={{ color: 'rgba(0, 0, 0, 0.6)', fontSize: '0.75rem', marginTop: '4px' }}
                  >
                    {hourlyRate?.[FormKeys.PRICE_PER_HIT] && hourlyRate?.[FormKeys.TIME_ON_PROPERTY]
                      ? `${t('sales.contract.dollarPerMin')} $${(
                          hourlyRate[FormKeys.PRICE_PER_HIT] / hourlyRate[FormKeys.TIME_ON_PROPERTY]
                        ).toFixed(2)}`
                      : ' '}
                  </Typography>
                </Box>
              )}
            </Box>

            <Box>
              <Typography variant="h3" className={classes.sectionTitle}>
                {t('sales.contract.typeServices', {
                  type: capitalizeFirstLetter(currentSelectedService?.type || ''),
                })}
              </Typography>
              <Box className={classes.netProfitContainer}>
                {showPricingSkeleton ? (
                  <InfoCardSkeleton noOfRows={2} />
                ) : (
                  netProfitGraphData && (
                    <>
                      <NetProfitWidget
                        title={netProfitGraphData?.label}
                        value={netProfitGraphData?.currentPercentage}
                        requirement={netProfitGraphData?.requiredPercentage}
                        color={netProfitGraphData?.colors}
                      />
                      <NetProfitWidget
                        title={laborEfficiencyGraphData?.label}
                        value={laborEfficiencyGraphData?.currentPercentage}
                        requirement={laborEfficiencyGraphData?.requiredPercentage}
                        color={laborEfficiencyGraphData?.colors}
                        sign="≤"
                      />
                    </>
                  )
                )}
              </Box>
            </Box>
            <Box className={classes.financialMatricsContainer}>
              <Typography variant="h3">{t('sales.contract.financialMetrics')}</Typography>
              <Box className={classes.financialMatricsItem}>
                <Typography variant="h3" className={classes.sectTitle}>
                  {t('sales.contract.billableCycle')}
                </Typography>
                <CustomDropDown
                  label={t('sales.contract.biWeekly')}
                  options={getBillingCycleOptions(t) || []}
                  selectedValues={selectedValue?.['billableCycle'] || {}}
                  handleChange={handleDropdownChange}
                  name="billableCycle"
                  bordered
                />
              </Box>
            </Box>
            <Box className={classes.tableWrapper}>
              {showPricingSkeleton ? (
                <InfoCardSkeleton noOfRows={6} />
              ) : (
                <FinancialSummaryTable data={currentFinancialMatrix || []} />
              )}
            </Box>
          </>
        )}
        {/* end of repeatable content */}

        {(!clickedOn || clickedOn === 'vehicleRate') && (
          <>
            {currentSelectedService?.type === serviceTypes.DEDICATED &&
              currentSelectedService?.[FormKeys.INCLUDE_VEHICLE] && (
                <>
                  {/* repeatable content */}
                  <Box className={classes.section}>
                    <Box className={classes.inputContainer}>
                      <InputLabel htmlFor={FormKeys.VEHICLE_RATE}>
                        {t('sales.contract.vehicleyRateInDollars', { symbol })}
                        <RequiredAsterik />
                      </InputLabel>
                      <TextField
                        className={classes.inputField}
                        variant="outlined"
                        size="small"
                        fullWidth
                        name={FormKeys.VEHICLE_RATE}
                        value={hourlyRate?.[FormKeys.VEHICLE_RATE]}
                        onChange={(e) => handleInputChange(FormKeys.VEHICLE_RATE, e.target.value)}
                        onWheel={(e) => e.target.blur()} // disables scroll on input
                        onBlur={(e) => handleInputBlur(FormKeys.VEHICLE_RATE, e.target.value)}
                        type="number"
                        placeholder={t('sales.contract.enterHourlyRate')}
                        InputProps={{
                          inputProps: {
                            min: 0,
                          },
                        }}
                      />
                    </Box>
                  </Box>
                  <Box>
                    <Typography variant="h3" className={classes.sectionTitle}>
                      {t('sales.contract.typeVehicleServices', {
                        type: capitalizeFirstLetter(currentSelectedService?.type || ''),
                      })}
                    </Typography>
                    <Box className={classes.netProfitContainer}>
                      {showPricingSkeleton ? (
                        <InfoCardSkeleton noOfRows={1} />
                      ) : (
                        vehicleNetProfitGraphData && (
                          <NetProfitWidget
                            title={vehicleNetProfitGraphData?.label}
                            value={vehicleNetProfitGraphData?.currentPercentage}
                            requirement={vehicleNetProfitGraphData?.requiredPercentage}
                            color={vehicleNetProfitGraphData?.colors}
                          />
                        )
                      )}
                    </Box>
                  </Box>
                  <Box className={classes.financialMatricsContainer}>
                    <Typography variant="h3">{t('sales.contract.financialMetrics')}</Typography>
                    <Box className={classes.financialMatricsItem}>
                      <Typography variant="h3" className={classes.sectTitle}>
                        {t('sales.contract.billableCycle')}
                      </Typography>
                      <CustomDropDown
                        label={t('sales.contract.biWeekly')}
                        options={getBillingCycleOptions(t) || []}
                        selectedValues={selectedValue?.['billableVehicleCycle'] || {}}
                        handleChange={handleDropdownChange}
                        name="billableVehicleCycle"
                        bordered
                      />
                    </Box>
                  </Box>
                  <Box className={classes.tableWrapper}>
                    {showPricingSkeleton ? (
                      <InfoCardSkeleton noOfRows={6} />
                    ) : (
                      <FinancialSummaryTable data={currentVehicleMatrix || []} />
                    )}
                    {/* <FinancialSummaryTable data={vehicleMatrix} /> */}
                  </Box>
                  {/* end of repeatable content */}
                </>
              )}
          </>
        )}
      </Box>
    </Drawer>
  );
};

SuggestRateDrawer.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  services: PropTypes.array,
  serviceIndex: PropTypes.number,
  baseRates: PropTypes.object,
  clickedOn: PropTypes.string,
};

export default SuggestRateDrawer;
