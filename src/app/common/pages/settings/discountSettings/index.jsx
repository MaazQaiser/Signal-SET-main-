import { Box, Button, InputAdornment, TextField, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import LoaderComponent from 'src/app/components/common/loader';
import { ACL_SETTINGS_DISCOUNTS_UPDDATE } from 'src/app/router/constant/SALESMODULE';
import RenderIfHasPermission from 'src/hoc/renderIfHasPermission';
import { getDiscountSettings, saveDiscountSettings } from 'src/services/settings.services';
import { toastSettings } from 'src/utils/constants';
import formValidatorJoi from 'src/utils/formValidator/formValidator.requiredCheck';
import { toaster } from 'src/utils/toast';

import { useStyles } from './discountSettings.style';

const _PAYMENT_CYCLES = [
  {
    id: 1,
    discountType: 'yearly',
    label: 'Yearly',
    percentage: '0.0',
  },
  {
    id: 2,
    discountType: 'one_time',
    label: 'One Time',
    percentage: '0.0',
  },
  {
    id: 3,
    discountType: 'quarterly',
    label: 'Quarterly',
    percentage: '0.0',
  },
  {
    id: 4,
    discountType: 'monthly',
    label: 'Monthly',
    percentage: '0.0',
  },
];

const DiscountSettings = () => {
  const classes = useStyles();
  const { t } = useTranslation();

  const [loading, setLoading] = useState(false);
  const [discounts, setDiscounts] = useState([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [errors, setErrors] = useState({});
  const [defaultDiscounts, setDefaultDiscounts] = useState([]);

  const fetchDiscountSettings = async () => {
    try {
      setLoading(true);
      const response = await getDiscountSettings();
      if (response?.statusCode === 200) {
        setDiscounts(response?.data?.billingDiscounts);
        setDefaultDiscounts(response?.data?.billingDiscounts);
      }
    } catch (error) {
      console.error('Error fetching discount settings:', error);
    } finally {
      setLoading(false);
    }
  };

  // Initialize discounts with default values
  useEffect(() => {
    fetchDiscountSettings();
  }, []);

  const handleDiscountChange = (discountType, value) => {
    // Clear error for this field when user starts typing
    if (errors[discountType]) {
      setErrors((prev) => {
        const { [discountType]: _, ...rest } = prev;
        return rest;
      });
    }

    // Restrict to 2 decimal places using regex (same pattern used in paymentTerms)
    if (value !== '' && !value.match(/^(\d*\.{0,1}\d{0,2}$)/)) {
      return; // Don't update if more than 2 decimal places
    }

    // Determine the new percentage value
    let newPercentage;

    if (value === '') {
      newPercentage = '';
    } else {
      const numValue = parseFloat(value);
      // Only update if it's a valid number between 0 and 100
      if (isNaN(numValue) || numValue < 0 || numValue > 100) {
        return; // Invalid input, don't update
      }
      newPercentage = numValue;
    }

    // Single map operation to update the discount
    setDiscounts((prev) =>
      prev.map((discount) =>
        discount.discountType === discountType
          ? { ...discount, percentage: newPercentage }
          : discount,
      ),
    );

    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setErrors({});

      // Validate using Joi - wrap discounts in an object to match schema
      const validationErrors = await formValidatorJoi({ billingDiscounts: discounts }, t);

      if (validationErrors && Object.keys(validationErrors).length > 0) {
        // Map errors from array index format to discountType format
        // e.g., "billingDiscounts[0].percentage" -> "yearly"
        const mappedErrors = {};
        Object.keys(validationErrors).forEach((key) => {
          const match = key.match(/billingDiscounts\[(\d+)\]/);
          if (match) {
            const index = parseInt(match[1]);
            const discountType = discounts[index]?.discountType;
            if (discountType) {
              mappedErrors[discountType] = validationErrors[key];
            }
          }
        });

        setErrors(mappedErrors);
        toaster.error({
          text: 'Please fix the validation errors',
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
        return;
      }

      // TODO: Replace with actual API call
      console.log('Saving discounts:', discounts);

      const response = await saveDiscountSettings({ billingDiscounts: discounts });

      if (response?.statusCode === 200) {
        toaster.success({
          text: 'Discount settings saved successfully',
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
      }

      setHasChanges(false);
    } catch (error) {
      toaster.error({
        text: error?.message || 'Failed to save discount settings',
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Reload initial data
    setDiscounts(defaultDiscounts);
    setHasChanges(false);

    // TODO: When API is integrated, refetch from API instead
    // fetchDiscountSettings();
  };

  return (
    <Box className={classes.container}>
      {loading && <LoaderComponent size={50} color={'primary'} label={'Loading'} />}

      <Box className={classes.header}>
        <Typography variant="h4" className={classes.title}>
          Payment Plan Discounts
        </Typography>
        <Typography variant="body2" className={classes.subtitle}>
          Set how much discount applies for each payment cycle.
        </Typography>
      </Box>

      <Box className={classes.content}>
        <Box className={classes.tableContainer}>
          {/* Table Header */}
          <Box className={classes.tableHeader}>
            <Typography variant="subtitle2" className={classes.headerCell}>
              Payment Cycles
            </Typography>
            <Typography variant="subtitle2" className={classes.headerCell}>
              Discounts (%)
            </Typography>
          </Box>

          {/* Table Rows */}
          <Box className={classes.tableBody}>
            {discounts?.map((discount) => (
              <Box key={discount?.id} className={classes.tableRow}>
                <Typography variant="body2" className={classes.cycleLabel}>
                  {discount?.label}
                </Typography>
                <Box className={classes.inputCell}>
                  <TextField
                    type="number"
                    value={discount?.percentage ?? ''}
                    onChange={(e) => handleDiscountChange(discount?.discountType, e.target.value)}
                    placeholder="0"
                    error={!!errors[discount?.discountType]}
                    helperText={errors[discount?.discountType] || ''}
                    inputProps={{
                      min: 0,
                      max: 100,
                      step: 0.01,
                    }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <Typography variant="body2" className={classes.percentSymbol}>
                            %
                          </Typography>
                        </InputAdornment>
                      ),
                    }}
                    className={classes.discountInput}
                  />
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      {/* Action Buttons */}
      {hasChanges && (
        <Box className={classes.footer}>
          <Button variant="secondaryGrey" onClick={handleCancel} disabled={loading}>
            Cancel
          </Button>
          <RenderIfHasPermission name={ACL_SETTINGS_DISCOUNTS_UPDDATE}>
            <Button variant="primary" onClick={handleSave} disabled={loading}>
              Save Changes
            </Button>
          </RenderIfHasPermission>
        </Box>
      )}
    </Box>
  );
};

export default DiscountSettings;
