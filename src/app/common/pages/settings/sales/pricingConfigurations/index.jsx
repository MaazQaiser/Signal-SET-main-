import { Box, Button, TextField, Tooltip, Typography } from '@mui/material';
import { ReactComponent as BlueAlertIcon } from 'assets/svg/BlueAlertIcon.svg';
import { ReactComponent as FranchiseSelectIcon } from 'assets/svg/franchiseSelect.svg';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import ConfirmationDialog from 'src/app/components/common/confirmationDialog';
import CustomDropDown from 'src/app/components/common/customDropDown';
import { ACL_SETTINGS_PRICING_CONFIGURATIONS_UPDDATE } from 'src/app/router/constant/SALESMODULE';
import { useApiControllers } from 'src/helper/axios';
import { isObjectEmpty } from 'src/helper/utilityFunctions';
import RenderIfHasPermission from 'src/hoc/renderIfHasPermission';
import { getDisplayConfiguration } from 'src/redux/store/slices/regionalCountryConfiguration';
import { getFranchisesOptions } from 'src/services/location.service';
import { getPricingConfig, updatePricingConfig } from 'src/services/pricingConfigurations.service';
import transformArrayForOptions from 'src/utils/array/transformArrayForOptions';
import userHasPermission from 'src/utils/auth/userHasPermission';
import { toastSettings } from 'src/utils/constants';
import joiValidate from 'src/utils/formValidator/formValidator.requiredCheck';

import { useStyles } from './styles';

const DEFAULT_VALUES = {
  basePayRate_armedOfficer: { type: 'float', required: true, value: '0' }, // Default from table
  basePayRate_dedicatedOfficer: { type: 'float', required: true, value: '0' }, // Default from table
  basePayRate_dedicatedAdvancedOfficer: { type: 'float', required: true, value: '0' }, // Default from table
  basePayRate_dedicatedSupervisor: { type: 'float', required: true, value: '0' }, // Default from table
  basePayRate_patrolOfficer: { type: 'float', required: false, value: '0' }, // Default from table

  workTimeParameters_daysPerMonth: { type: 'float', required: true, value: '0' }, // Default from table
  workTimeParameters_hoursPerDay: { type: 'integer', required: true, value: '0' }, // Default from table
  vehicleUseAndAllocation_vehicleUnrelatedHours: { type: 'integer', required: false, value: '0' }, // Default from table
  vehicleUseAndAllocation_dedicatedVehicleUsage: { type: 'float', required: false, value: '0' }, // Default from table (100%)

  patrolPricingParameters_avgPropertiesDriveTime: { type: 'float', required: false, value: '0' }, // Default from table
  patrolPricingParameters_distanceToNearestProperty: {
    type: 'float',
    required: false,
    value: '0',
  }, // Default from table
  patrolPricingParameters_timeSpentOnProperty: { type: 'float', required: false, value: '0' }, // Default from table

  payrollTaxes_socialSecurity: { type: 'float', required: false, value: '0' }, // Already correct default
  payrollTaxes_suta: { type: 'float', required: false, value: '0' }, // Already correct default
  payrollTaxes_futa: { type: 'float', required: false, value: '0' }, // Already correct default
  payrollTaxes_medicare: { type: 'float', required: false, value: '0' }, // Already correct default
  payrollTaxes_other: { type: 'float', required: false, value: '0' }, // No default in table → 0

  overtime_overtime: { type: 'float', required: false, value: '0' }, // No default listed → 0

  overhead_dedicated: { type: 'float', required: false, value: '0' }, // No default listed → 0
  overhead_patrol: { type: 'float', required: false, value: '0' }, // No default listed → 0

  paymentTerms_paymentTermsAdjustment: { type: 'float', required: false, value: '0' }, // Not in table → 0
  paymentTerms_apr: { type: 'float', required: false, value: '0' }, // Not in table → 0
  paymentTerms_thirtyDays: { type: 'float', required: false, value: '0' }, // Not in table → 0
  paymentTerms_sixtyDays: { type: 'float', required: false, value: '0' }, // Not in table → 0
  paymentTerms_ninetyDays: { type: 'float', required: false, value: '0' }, // Not in table → 0
  paymentTerms_oneHundredTwentyDays: { type: 'float', required: false, value: '0' }, // Not in table → 0

  fasCharges_royalty: { type: 'float', required: false, value: '0' }, // No default → 0
  fasCharges_teritory: { type: 'float', required: false, value: '0' }, // Not in table → 0
  fasCharges_glInsurance: { type: 'float', required: false, value: '0' }, // No default → 0
  fasCharges_autoInsurance: { type: 'float', required: false, value: '0' }, // No default → 0
  fasCharges_interest: { type: 'float', required: false, value: '0' }, // Not in table → 0
  fasCharges_convention: { type: 'float', required: false, value: '0' }, // Not in table → 0
  fasCharges_dispatch: { type: 'float', required: false, value: '0' }, // Not in table → 0
  fasCharges_aln: { type: 'float', required: false, value: '0' }, // Not in table → 0
  fasCharges_email: { type: 'float', required: false, value: '0' }, // Not in table → 0
  fasCharges_others: { type: 'float', required: false, value: '0' }, // Not in table → 0

  monthlyVehicleExp_payment: { type: 'float', required: false, value: '0' }, // No default → 0
  monthlyVehicleExp_insurance: { type: 'float', required: false, value: '0' }, // No default → 0
  monthlyVehicleExp_repairsMaintenance: { type: 'float', required: false, value: '0' }, // No default → 0
  monthlyVehicleExp_taxesRegistration: { type: 'float', required: false, value: '0' }, // No default → 0

  vehicleAssumptions_costPerGallon: { type: 'float', required: false, value: '0' }, // No default → 0
  vehicleAssumptions_avgMpg: { type: 'float', required: false, value: '0' }, // No default → 0
  vehicleAssumptions_patrolRoamingSpeed: { type: 'float', required: false, value: '0' }, // No default → 0

  adminExp_advertisingAndMarketing: { type: 'float', required: false, value: '0' }, // Not in table → 0
  adminExp_backgroundCheck: { type: 'float', required: false, value: '0' }, // No default → 0
  adminExp_bankCharges: { type: 'float', required: false, value: '0' }, // Not in table → 0
  adminExp_charitableDonations: { type: 'float', required: false, value: '0' }, // Not in table → 0
  adminExp_drugTests: { type: 'float', required: false, value: '0' }, // No default → 0
  adminExp_duesAndSubscription: { type: 'float', required: false, value: '0' }, // Not in table → 0
  adminExp_educationTraining: { type: 'float', required: false, value: '0' }, // No default → 0
  adminExp_employeeBenefits: { type: 'float', required: false, value: '0' }, // No default → 0
  adminExp_equipmentExpenses: { type: 'float', required: false, value: '0' }, // Not in table → 0
  adminExp_insuranceGeneralLiability: { type: 'float', required: false, value: '0' }, // Not in table → 0
  adminExp_insuranceWorkersComp: { type: 'float', required: false, value: '0' }, // No default → 0
  adminExp_interest: { type: 'float', required: false, value: '0' }, // Not in table → 0
  adminExp_licensesPermits: { type: 'float', required: false, value: '0' }, // No default → 0
  adminExp_mealsEntertainment: { type: 'float', required: false, value: '0' }, // Not in table → 0
  adminExp_officeSuppliesAndSoftwares: { type: 'float', required: false, value: '0' }, // Not in table → 0
  adminExp_professionalFees: { type: 'float', required: false, value: '0' }, // Not in table → 0
  adminExp_rent: { type: 'float', required: false, value: '0' }, // Not in table → 0
  adminExp_supplies: { type: 'float', required: false, value: '0' }, // Not in table → 0
  adminExp_telephoneAndInterest: { type: 'float', required: false, value: '0' }, // Not in table → 0
  adminExp_travel: { type: 'float', required: false, value: '0' }, // Not in table → 0
  adminExp_uniforms: { type: 'float', required: false, value: '0' }, // No default → 0
  adminExp_utilities: { type: 'float', required: false, value: '0' }, // Not in table → 0
  adminExp_others: { type: 'float', required: false, value: '0' }, // Not in table → 0
};

const PricingConfigurations = () => {
  const { t } = useTranslation();
  const classes = useStyles();
  const { symbol } = useSelector(getDisplayConfiguration);

  const { getNewApiController } = useApiControllers();

  const pricingConfiguration = 'sales.pricingConfigurations';
  const formSections = [
    {
      titleKey: 'basePayRateTitle',
      key: 'basePayRate',
      fields: [
        {
          labelKey: 'basePayRateFieldsBasePayRate_armedOfficer',
          field: 'basePayRate_armedOfficer',
          unit: '$',
        },
        {
          labelKey: 'basePayRateFieldsBasePayRate_patrolOfficer',
          field: 'basePayRate_patrolOfficer',
          unit: '$',
        },
      ],
    },
    {
      titleKey: 'dedicatedPayRateTitle',
      tooltipKey: 'dedicatedPayRateTooltip',
      key: 'dedicatedPayRate',
      fields: [
        {
          labelKey: 'dedicatedPayRateFieldsBasePayRate_dedicatedOfficer',
          field: 'basePayRate_dedicatedOfficer',
          unit: '$',
        },
        {
          labelKey: 'dedicatedPayRateFieldsBasePayRate_dedicatedAdvancedOfficer',
          field: 'basePayRate_dedicatedAdvancedOfficer',
          unit: symbol,
        },
        {
          labelKey: 'dedicatedPayRateFieldsBasePayRate_dedicatedSupervisor',
          field: 'basePayRate_dedicatedSupervisor',
          unit: '$',
        },
      ],
    },
    {
      titleKey: 'workTimeParametersTitle',
      key: 'workTimeParameters',
      fields: [
        {
          labelKey: 'workTimeParametersFieldsWorkTimeParameters_daysPerMonth',
          field: 'workTimeParameters_daysPerMonth',
          unit: '',
        },
        {
          labelKey: 'workTimeParametersFieldsWorkTimeParameters_hoursPerDay',
          field: 'workTimeParameters_hoursPerDay',
          unit: 'hrs',
        },
      ],
    },
    {
      titleKey: 'vehicleUseAndAllocationTitle',
      key: 'vehicleUseAndAllocation',
      fields: [
        {
          labelKey: 'vehicleUseAndAllocationFieldsVehicleUseAndAllocation_vehicleUnrelatedHours',
          field: 'vehicleUseAndAllocation_vehicleUnrelatedHours',
          unit: 'hrs',
        },
        {
          labelKey: 'vehicleUseAndAllocationFieldsVehicleUseAndAllocation_dedicatedVehicleUsage',
          field: 'vehicleUseAndAllocation_dedicatedVehicleUsage',
          unit: '%',
        },
      ],
    },
    {
      titleKey: 'patrolPricingParametersTitle',
      key: 'patrolPricingParameters',
      fields: [
        {
          labelKey: 'patrolPricingParametersFieldsPatrolPricingParameters_avgPropertiesDriveTime',
          field: 'patrolPricingParameters_avgPropertiesDriveTime',
          unit: 'min',
        },
        {
          labelKey:
            'patrolPricingParametersFieldsPatrolPricingParameters_distanceToNearestProperty',
          field: 'patrolPricingParameters_distanceToNearestProperty',
          unit: 'miles',
        },
        {
          labelKey: 'patrolPricingParametersFieldsPatrolPricingParameters_timeSpentOnProperty',
          field: 'patrolPricingParameters_timeSpentOnProperty',
          unit: 'min',
        },
      ],
    },
    {
      titleKey: 'payrollTaxesTitle',
      key: 'payrollTaxes',
      total: '',
      fields: [
        {
          labelKey: 'payrollTaxesFieldsPayrollTaxes_socialSecurity',
          field: 'payrollTaxes_socialSecurity',
          unit: '%',
        },
        { labelKey: 'payrollTaxesFieldsPayrollTaxes_suta', field: 'payrollTaxes_suta', unit: '%' },
        { labelKey: 'payrollTaxesFieldsPayrollTaxes_futa', field: 'payrollTaxes_futa', unit: '%' },
        {
          labelKey: 'payrollTaxesFieldsPayrollTaxes_medicare',
          field: 'payrollTaxes_medicare',
          unit: '%',
        },
        {
          labelKey: 'payrollTaxesFieldsPayrollTaxes_other',
          field: 'payrollTaxes_other',
          unit: '%',
        },
      ],
    },
    {
      titleKey: 'overtimeTitle',
      key: 'overtime',
      fields: [
        { labelKey: 'overtimeFieldsOvertime_overtime', field: 'overtime_overtime', unit: '%' },
      ],
    },
    {
      titleKey: 'overheadTitle',
      key: 'overhead',
      fields: [
        { labelKey: 'overheadFieldsOverhead_dedicated', field: 'overhead_dedicated', unit: '%' },
        { labelKey: 'overheadFieldsOverhead_patrol', field: 'overhead_patrol', unit: '%' },
      ],
    },
    {
      titleKey: 'paymentTermsTitle',
      key: 'paymentTerms',
      fields: [
        {
          labelKey: 'paymentTermsFieldsPaymentTerms_paymentTermsAdjustment',
          field: 'paymentTerms_paymentTermsAdjustment',
          unit: '%',
        },
        { labelKey: 'paymentTermsFieldsPaymentTerms_apr', field: 'paymentTerms_apr', unit: '%' },
        {
          labelKey: 'paymentTermsFieldsPaymentTerms_thirtyDays',
          field: 'paymentTerms_thirtyDays',
          unit: '%',
        },
        {
          labelKey: 'paymentTermsFieldsPaymentTerms_sixtyDays',
          field: 'paymentTerms_sixtyDays',
          unit: '%',
        },
        {
          labelKey: 'paymentTermsFieldsPaymentTerms_ninetyDays',
          field: 'paymentTerms_ninetyDays',
          unit: '%',
        },
        {
          labelKey: 'paymentTermsFieldsPaymentTerms_oneHundredTwentyDays',
          field: 'paymentTerms_oneHundredTwentyDays',
          unit: '%',
        },
      ],
    },
    {
      titleKey: 'fasChargesTitle',
      key: 'fasCharges',
      total: '',
      fields: [
        { labelKey: 'fasChargesFieldsFasCharges_royalty', field: 'fasCharges_royalty', unit: '%' },
        {
          labelKey: 'fasChargesFieldsFasCharges_teritory',
          field: 'fasCharges_teritory',
          unit: '%',
        },
        {
          labelKey: 'fasChargesFieldsFasCharges_glInsurance',
          field: 'fasCharges_glInsurance',
          unit: '%',
        },
        {
          labelKey: 'fasChargesFieldsFasCharges_autoInsurance',
          field: 'fasCharges_autoInsurance',
          unit: '%',
        },
        {
          labelKey: 'fasChargesFieldsFasCharges_interest',
          field: 'fasCharges_interest',
          unit: '%',
        },
        {
          labelKey: 'fasChargesFieldsFasCharges_convention',
          field: 'fasCharges_convention',
          unit: '%',
        },
        {
          labelKey: 'fasChargesFieldsFasCharges_dispatch',
          field: 'fasCharges_dispatch',
          unit: '%',
        },
        { labelKey: 'fasChargesFieldsFasCharges_aln', field: 'fasCharges_aln', unit: '%' },
        { labelKey: 'fasChargesFieldsFasCharges_email', field: 'fasCharges_email', unit: '%' },
        { labelKey: 'fasChargesFieldsFasCharges_others', field: 'fasCharges_others', unit: '%' },
      ],
    },
    {
      titleKey: 'monthlyVehicleExpTitle',
      key: 'monthlyVehicleExp',
      total: '',
      fields: [
        {
          labelKey: 'monthlyVehicleExpFieldsMonthlyVehicleExp_payment',
          field: 'monthlyVehicleExp_payment',
          unit: '$',
        },
        {
          labelKey: 'monthlyVehicleExpFieldsMonthlyVehicleExp_insurance',
          field: 'monthlyVehicleExp_insurance',
          unit: '$',
        },
        {
          labelKey: 'monthlyVehicleExpFieldsMonthlyVehicleExp_repairsMaintenance',
          field: 'monthlyVehicleExp_repairsMaintenance',
          unit: symbol,
        },
        {
          labelKey: 'monthlyVehicleExpFieldsMonthlyVehicleExp_taxesRegistration',
          field: 'monthlyVehicleExp_taxesRegistration',
          unit: '$',
        },
      ],
    },
    {
      titleKey: 'vehicleAssumptionsTitle',
      key: 'vehicleAssumptions',
      fields: [
        {
          labelKey: 'vehicleAssumptionsFieldsVehicleAssumptions_costPerGallon',
          field: 'vehicleAssumptions_costPerGallon',
          unit: '$',
        },
        {
          labelKey: 'vehicleAssumptionsFieldsVehicleAssumptions_avgMpg',
          field: 'vehicleAssumptions_avgMpg',
          unit: '',
        },
        {
          labelKey: 'vehicleAssumptionsFieldsVehicleAssumptions_patrolRoamingSpeed',
          field: 'vehicleAssumptions_patrolRoamingSpeed',
          unit: '',
        },
      ],
    },
    {
      titleKey: 'adminExpTitle',
      key: 'adminExp',
      total: '',
      fields: [
        {
          labelKey: 'adminExpFieldsAdminExp_advertisingAndMarketing',
          field: 'adminExp_advertisingAndMarketing',
          unit: '%',
        },
        {
          labelKey: 'adminExpFieldsAdminExp_backgroundCheck',
          field: 'adminExp_backgroundCheck',
          unit: '%',
        },
        {
          labelKey: 'adminExpFieldsAdminExp_bankCharges',
          field: 'adminExp_bankCharges',
          unit: '%',
        },
        {
          labelKey: 'adminExpFieldsAdminExp_charitableDonations',
          field: 'adminExp_charitableDonations',
          unit: '%',
        },
        { labelKey: 'adminExpFieldsAdminExp_drugTests', field: 'adminExp_drugTests', unit: '%' },
        {
          labelKey: 'adminExpFieldsAdminExp_duesAndSubscription',
          field: 'adminExp_duesAndSubscription',
          unit: '%',
        },
        {
          labelKey: 'adminExpFieldsAdminExp_educationTraining',
          field: 'adminExp_educationTraining',
          unit: '%',
        },
        {
          labelKey: 'adminExpFieldsAdminExp_employeeBenefits',
          field: 'adminExp_employeeBenefits',
          unit: '%',
        },
        {
          labelKey: 'adminExpFieldsAdminExp_equipmentExpenses',
          field: 'adminExp_equipmentExpenses',
          unit: '%',
        },
        {
          labelKey: 'adminExpFieldsAdminExp_insuranceGeneralLiability',
          field: 'adminExp_insuranceGeneralLiability',
          unit: '%',
        },
        {
          labelKey: 'adminExpFieldsAdminExp_insuranceWorkersComp',
          field: 'adminExp_insuranceWorkersComp',
          unit: '%',
        },
        { labelKey: 'adminExpFieldsAdminExp_interest', field: 'adminExp_interest', unit: '%' },
        {
          labelKey: 'adminExpFieldsAdminExp_licensesPermits',
          field: 'adminExp_licensesPermits',
          unit: '%',
        },
        {
          labelKey: 'adminExpFieldsAdminExp_mealsEntertainment',
          field: 'adminExp_mealsEntertainment',
          unit: '%',
        },
        {
          labelKey: 'adminExpFieldsAdminExp_officeSuppliesAndSoftwares',
          field: 'adminExp_officeSuppliesAndSoftwares',
          unit: '%',
        },
        {
          labelKey: 'adminExpFieldsAdminExp_professionalFees',
          field: 'adminExp_professionalFees',
          unit: '%',
        },
        { labelKey: 'adminExpFieldsAdminExp_rent', field: 'adminExp_rent', unit: '%' },
        { labelKey: 'adminExpFieldsAdminExp_supplies', field: 'adminExp_supplies', unit: '%' },
        {
          labelKey: 'adminExpFieldsAdminExp_telephoneAndInterest',
          field: 'adminExp_telephoneAndInterest',
          unit: '%',
        },
        { labelKey: 'adminExpFieldsAdminExp_travel', field: 'adminExp_travel', unit: '%' },
        { labelKey: 'adminExpFieldsAdminExp_uniforms', field: 'adminExp_uniforms', unit: '%' },
        { labelKey: 'adminExpFieldsAdminExp_utilities', field: 'adminExp_utilities', unit: '%' },
        { labelKey: 'adminExpFieldsAdminExp_others', field: 'adminExp_others', unit: '%' },
      ],
    },
  ];

  const [formData, setFormData] = useState(DEFAULT_VALUES);

  const [pricingConfigBE, setPricingConfigBE] = useState(DEFAULT_VALUES);

  const [errorMessages, setErrorMessages] = useState({});

  const [showConfirmationModal, setShowConfirmationModal] = useState(false);

  const [cancelConfirmationModal, setCancelConfirmationModal] = useState(false);

  const [loading, setLoading] = useState(false);

  const [isEdited, setIsEditied] = useState(false);

  const [selectedFranchise, setSelectedFranchise] = useState({});

  const [franchises, setFranchises] = useState({});

  const handleInputChange = (field, value) => {
    // Convert value to number (if it's not already) and check for negativity
    if (value < 0) return;

    /**
     * It will only store floating values upto 2 decimel places
     */
    if (!value.match(/^(\d*\.{0,1}\d{0,2}$)/)) {
      return;
    }

    setIsEditied(true);
    setFormData((prev) => ({
      ...prev,
      [field]: { ...prev?.[field], value: value },
    }));
  };

  const addZeroIfValueIsNotGiven = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: { ...prev?.[field], value: Number(value) },
    }));
  };

  // 🔹 helper: turn "paymentTerms_oneHundredTwentyDays" -> "One Hundred Twenty Days"
  const makeHumanReadable = (str) => {
    if (!str) return str;
    return str.includes('_') ? str.split('_')[1] : str;
  };

  const getError = (key) => {
    return makeHumanReadable(errorMessages[`pricingConfigurations,${key},value`]);
  };

  const toggleConfirmationModal = () => {
    setShowConfirmationModal((a) => !a);
  };

  const toggleCancelModal = () => {
    setCancelConfirmationModal((a) => !a);
  };

  const validateAndOpenSubmitToggle = async () => {
    try {
      const errors = await joiValidate({ pricingConfigurations: formData }, t);
      console.log({ errors });
      if (errors && Object.keys(errors).length) {
        setErrorMessages(errors);
        return;
      }

      toggleConfirmationModal();
    } catch (error) {
      //
    }
  };

  const flattenValues = (inputObj) => {
    const result = {};

    for (const key in inputObj) {
      if (Object.prototype.hasOwnProperty.call(inputObj, key)) {
        result[key] = Number(inputObj[key].value);
      }
    }

    return result;
  };

  const updateStructuredValues = (flatValues, originalStructure) => {
    const updatedStructure = { ...originalStructure }; // shallow copy

    for (const key in flatValues) {
      if (Object.prototype.hasOwnProperty.call(updatedStructure, key)) {
        updatedStructure[key] = { ...updatedStructure[key], value: Number(flatValues[key]) };
      }
    }

    return updatedStructure;
  };

  const handleFormSubmit = async () => {
    try {
      setLoading(true);
      const response = await updatePricingConfig({
        franchiseId: selectedFranchise?.id,
        ...flattenValues(formData),
      }); // API Call
      if (response.statusCode === 200) {
        // API is success
        toast.success(response.message, {
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
      }
    } catch (error) {
      //
    } finally {
      setIsEditied(false);
      setLoading(false);
      setShowConfirmationModal(false);
    }
  };

  const getPricingConfigurations = async (selectedFranchise) => {
    const apiController = getNewApiController();

    try {
      setIsEditied(false);
      const response = await getPricingConfig({ franchiseId: selectedFranchise?.id });
      if (response.statusCode === 200) {
        if (!isObjectEmpty(response?.data?.pricingConfigurations)) {
          const pricingConfig = updateStructuredValues(
            response?.data?.pricingConfigurations,
            DEFAULT_VALUES,
          );
          setPricingConfigBE(pricingConfig);
          setFormData(pricingConfig);
        }
      }
    } catch (error) {
      // log error
      if (!apiController.signal.aborted) {
        //
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchFranchises = async () => {
    const apiController = getNewApiController();

    try {
      const response = await getFranchisesOptions({ signal: apiController.signal });
      if (response.statusCode === 200) {
        const franchises = [...(response?.data?.franchises || [])].sort((a, b) => {
          const numA = parseInt(a.name);
          const numB = parseInt(b.name);

          const hasNumA = !isNaN(numA);
          const hasNumB = !isNaN(numB);

          if (hasNumA && hasNumB) return numA - numB;

          if (hasNumA && !hasNumB) return -1;

          if (!hasNumA && hasNumB) return 1;

          return a.name.localeCompare(b.name);
        });

        setFranchises(transformArrayForOptions(franchises, 'name', 'id') || []);
      }
    } catch (error) {
      // log error
      if (!apiController.signal.aborted) {
        //
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData(pricingConfigBE);
    toggleCancelModal();
    setIsEditied(false);
    toast.info(t('sales.pricingConfigurations.pricingResetSuccess'), {
      position: 'top-right',
      autoClose: toastSettings.AUTO_CLOSE,
    });
  };

  useEffect(() => {
    fetchFranchises();
    // getPricingConfigurations();
  }, []);

  const renderInput = (value, field) => (
    <TextField
      className={classes.inputField}
      variant="outlined"
      size="small"
      value={formData[field]?.value}
      onChange={(e) => handleInputChange(field, e.target.value)}
      onBlur={(e) => addZeroIfValueIsNotGiven(field, e.target.value)}
      disabled={!userHasPermission(ACL_SETTINGS_PRICING_CONFIGURATIONS_UPDDATE)}
      type="number"
      InputProps={{
        style: {
          fontSize: '14px',
          fontWeight: '500',
          color: '#262527',
        },
      }}
      error={!!getError(field)}
      helperText={getError(field)}
    />
  );

  const renderLabel = (text) => {
    // Split text by parentheses to style them differently
    const parts = text.split(/(\([^)]+\))/);
    return (
      <Typography variant="subtitle2" className={classes.inputlabel}>
        {parts.map((part, index) => {
          if (part.startsWith('(') && part.endsWith(')')) {
            return (
              <span key={index} className={classes.parenthesesText}>
                {part}
              </span>
            );
          }

          return part;
        })}
      </Typography>
    );
  };
  const renderFormRow = (field) => (
    <Box key={field.field} className={classes.formRow}>
      {renderLabel(t(`${pricingConfiguration}.${field.labelKey}`))}
      {renderInput(formData[field.field], field.field)}
      {field.unit && <Typography className={classes.unitLabel}>{field.unit}</Typography>}
    </Box>
  );

  const renderSection = (section) => (
    <Box key={section.key} className={classes.section}>
      <Box display="flex">
        <Typography variant="h5" className={classes.sectionTitle}>
          {t(`${pricingConfiguration}.${section.titleKey}`)}
          {section.tooltipKey && (
            <Tooltip
              title={t(`${pricingConfiguration}.${section.tooltipKey}`)}
              arrow
              placement="top"
              classes={{ tooltip: classes.tooltip }}
            >
              <BlueAlertIcon style={{ marginLeft: 6 }} />
            </Tooltip>
          )}
        </Typography>
      </Box>

      {section.fields.map(renderFormRow)}

      {/* Total Row - Only for Administration Expenses, Payroll Taxes, and Monthly Expenses per Vehicle */}
      {Object.prototype.hasOwnProperty.call(section, 'total') && (
        <Box className={classes.formRowTotal}>
          <Typography variant="subtitle2" className={classes.totalLabel}>
            {t('sales.pricingConfigurations.total')}
          </Typography>
          <Typography variant="subtitle2" className={classes.totalValue}>
            {section.fields
              .reduce((sum, field) => {
                const value = parseFloat(formData[field.field].value) || 0;
                return sum + value;
              }, 0)
              .toFixed(2)}{' '}
            {section.fields[0]?.unit || ''}
          </Typography>
        </Box>
      )}
    </Box>
  );

  const handleFranchiseSelection = (event) => {
    const { _name, value } = event.target;
    if (value) {
      setSelectedFranchise(value);
      getPricingConfigurations(value);
    }
  };

  return (
    <Box className={classes.wrapper}>
      <Box className={classes.headerWrapper}>
        <Box className={classes.header}>
          <Typography variant="h4" className={classes.title}>
            {t('sales.pricingConfigurations.pageTitle')}
          </Typography>
          <Typography variant="info" className={classes.subtitle}>
            {t('sales.pricingConfigurations.subtitle')}
          </Typography>
        </Box>
        <Box className={classes.companyDropDown}>
          <CustomDropDown
            label={t('sales.pricingConfigurations.selectFranchise')}
            name="franchise"
            options={franchises || []}
            selectedValues={selectedFranchise || {}}
            handleChange={(event) => handleFranchiseSelection(event)}
            bordered
            searchable
            placeHolder={t('sales.pricingConfigurations.selectFranchisePlaceholder')}
          />
        </Box>
      </Box>

      {isObjectEmpty(selectedFranchise) ? (
        <Box className={classes.noDataWrapper}>
          <Box className={classes.notesBox}>
            <FranchiseSelectIcon className={classes.notesIcon} />
            <Typography variant="h2" className={classes.notesError}>
              {t('sales.pricingConfigurations.selectFranchiseToView')}
            </Typography>
            <Typography variant="body2" className={classes.notesMessage}>
              {t('sales.pricingConfigurations.selectFranchiseToViewMessage')}
            </Typography>
          </Box>
        </Box>
      ) : (
        <>
          <Box className={classes.content}>{formSections.map(renderSection)}</Box>

          <RenderIfHasPermission name={ACL_SETTINGS_PRICING_CONFIGURATIONS_UPDDATE}>
            {isEdited && (
              <Box className={classes.footer}>
                <Button
                  variant="Secondary-Gray"
                  color="primary"
                  className={classes.cancelButton}
                  onClick={toggleCancelModal}
                >
                  {t('sales.pricingConfigurations.cancel')}
                </Button>
                <Button
                  variant="primary"
                  color="primary"
                  className={classes.saveButton}
                  onClick={validateAndOpenSubmitToggle}
                >
                  {t('sales.pricingConfigurations.saveChanges')}
                </Button>
              </Box>
            )}
          </RenderIfHasPermission>
        </>
      )}

      {showConfirmationModal && (
        <ConfirmationDialog
          open={!!showConfirmationModal}
          title={t('commonText.modal.areYouSure.title')}
          description={t('commonText.modal.areYouSure.pricingConfigurationDesc')}
          action={t('buttons.yes')}
          // icon={dialog?.action == 'Approve' ? <ApproveIcon /> : <RejectIcon />}
          disabled={loading}
          handleClose={toggleConfirmationModal}
          handleConfirm={handleFormSubmit}
        />
      )}

      {cancelConfirmationModal && (
        <ConfirmationDialog
          open={!!cancelConfirmationModal}
          title={t('commonText.modal.areYouSure.title')}
          description={t('commonText.modal.areYouSure.pricingConfigurationCancelDesc')}
          action={t('buttons.yes')}
          // icon={dialog?.action == 'Approve' ? <ApproveIcon /> : <RejectIcon />}
          disabled={loading}
          handleClose={toggleCancelModal}
          handleConfirm={resetForm}
        />
      )}
    </Box>
  );
};

export default PricingConfigurations;
