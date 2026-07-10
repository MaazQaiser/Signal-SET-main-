import { Box, FormControlLabel, Radio, RadioGroup, Typography } from '@mui/material';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getDisplayConfiguration } from 'src/redux/store/slices/regionalCountryConfiguration';
import { fomatNumbersWithCommas, toTwoDecimalPrecision } from 'src/utils/currencyFormater';

import { useStyles } from './billingOccurrenceSelector';

const BillingOccurrenceSelector = ({
  selectedPlan,
  onPlanChange,
  plans,
  disabled,
  hasCustomDiscount,
  hasDiscountError,
}) => {
  const classes = useStyles();

  const { t } = useTranslation();
  const { symbol } = useSelector(getDisplayConfiguration);

  // Extract the discountType if selectedPlan is an object, otherwise use it as-is
  const selectedPlanValue =
    typeof selectedPlan === 'object' && selectedPlan !== null
      ? selectedPlan.discountType
      : selectedPlan;

  const handlePlanChange = (event) => {
    if (!disabled) {
      onPlanChange(event);
    }
  };

  return (
    <Box className={classes.billingOccurrenceContainer}>
      <RadioGroup
        row
        aria-labelledby="billing-occurrence-group-label"
        name="billingOccurrence"
        value={selectedPlanValue}
        onChange={handlePlanChange}
      >
        <Box className={classes.optionsContainer}>
          {plans.map((plan) => {
            const isSelected = selectedPlanValue === plan?.discountType;
            const isDisabled = disabled || plan?.disabled;

            return (
              <Box
                key={plan?.discountType}
                className={classNames(
                  classes.optionCard,
                  isSelected && classes.optionCardSelected,
                  isDisabled && classes.optionCardDisabled,
                )}
                onClick={() => {
                  if (!isDisabled) {
                    handlePlanChange({ target: { value: plan?.discountType } });
                  }
                }}
              >
                <Box className={classes.planDetails}>
                  <Box className={classes.radioControl}>
                    <FormControlLabel
                      value={plan?.discountType}
                      control={<Radio disableRipple checked={isSelected} />}
                      label={plan?.label}
                      disabled={isDisabled}
                    />
                  </Box>
                  {!hasCustomDiscount && Number(plan?.percentage) > 0 && (
                    <Box className={classes.discountBadge}>
                      {t('sales.contract.percentOff', {
                        percent: toTwoDecimalPrecision(plan.percentage).toFixed(2),
                      })}
                    </Box>
                  )}
                </Box>

                <Box className={classes.priceContainer}>
                  {!hasCustomDiscount && plan?.actualAmount && Number(plan?.percentage) > 0 && (
                    <Typography component="span" className={classes.originalPrice}>
                      {symbol}
                      {fomatNumbersWithCommas(plan?.actualAmount)}
                    </Typography>
                  )}
                  {hasCustomDiscount && !hasDiscountError && plan?.actualAmount && (
                    <Typography component="span" className={classes.originalPrice}>
                      {symbol}
                      {fomatNumbersWithCommas(plan?.actualAmount)}
                    </Typography>
                  )}
                  {hasCustomDiscount && hasDiscountError ? (
                    <Typography component="span" className={classes.currentPrice}>
                      {symbol}
                      {fomatNumbersWithCommas(Number(plan?.actualAmount))}
                    </Typography>
                  ) : (
                    <Typography component="span" className={classes.currentPrice}>
                      {symbol}
                      {fomatNumbersWithCommas(Number(plan?.discountedAmount))}
                    </Typography>
                  )}
                </Box>
              </Box>
            );
          })}
        </Box>
      </RadioGroup>
    </Box>
  );
};

BillingOccurrenceSelector.propTypes = {
  selectedPlan: PropTypes.string.isRequired,
  onPlanChange: PropTypes.func.isRequired,
  plans: PropTypes.arrayOf(
    PropTypes.shape({
      discountType: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      discountedAmount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      actualAmount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      discount: PropTypes.string,
      disabled: PropTypes.bool,
    }),
  ).isRequired,
  disabled: PropTypes.bool,
  hasCustomDiscount: PropTypes.bool,
  hasDiscountError: PropTypes.bool,
};

BillingOccurrenceSelector.defaultProps = {
  disabled: false,
  hasCustomDiscount: false,
  hasDiscountError: false,
};

export default BillingOccurrenceSelector;
