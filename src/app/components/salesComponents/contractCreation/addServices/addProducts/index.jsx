import AddIcon from '@mui/icons-material/Add';
import { Box, Button, IconButton, InputAdornment, TextField, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import CustomDropDown from 'src/app/components/common/customDropDown/index.jsx';
import FieldError from 'src/app/components/common/fieldError/index.jsx';
import { DeleteIcon } from 'src/assets/svg/index.jsx';
import { getDisplayConfiguration } from 'src/redux/store/slices/regionalCountryConfiguration';

import { FormKeys } from '../helper.js';
import { useStyles } from './styles.js';

const _productOptions = [
  { label: '20×20×12', value: '20×20×12' },
  { label: '24×24×2', value: '24×24×2' },
  { label: '30×30×15', value: '30×30×15' },
  { label: '18×18×10', value: '18×18×10' },
];

const AddProducts = ({ products = [], onChange, visitIndex, getProductError, productsOptions }) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const { symbol } = useSelector(getDisplayConfiguration);

  const handleAddProduct = () => {
    const newProduct = {
      [FormKeys.PRODUCT_NAME]: null,
      [FormKeys.PRODUCT_RATE]: '',
      [FormKeys.PRODUCT_QUANTITY]: 1,
    };
    onChange({
      name: FormKeys.PRODUCTS,
      value: [...products, newProduct],
      visitIndex,
    });
  };

  const handleDeleteProduct = (productIndex) => {
    const updatedProducts = products.filter((_, index) => index !== productIndex);
    onChange({
      name: FormKeys.PRODUCTS,
      value: updatedProducts,
      visitIndex,
    });
  };

  const handleProductChange = (productIndex, field, value) => {
    const updatedProducts = products.map((product, index) => {
      if (index === productIndex) {
        // If changing product name, clean the object to only include necessary fields
        if (field === FormKeys.PRODUCT_NAME && value) {
          return {
            ...product,
            productId: value?.id,
            [field]: {
              id: value.id,
              name: value.name,
              label: value.label || value.name,
              value: value.value || value.name,
            },
          };
        }
        return { ...product, [field]: value };
      }
      return product;
    });
    onChange({
      name: FormKeys.PRODUCTS,
      value: updatedProducts,
      productId: updatedProducts?.[productIndex]?.[FormKeys.PRODUCT_NAME]?.productId,
      visitIndex,
    });
  };

  const calculateProductTotal = (product) => {
    const rate = parseFloat(product[FormKeys.PRODUCT_RATE]) || 0;
    const quantity = parseInt(product[FormKeys.PRODUCT_QUANTITY]) || 0;
    return rate * quantity;
  };

  const calculateGrandTotal = () => {
    return products.reduce((total, product) => total + calculateProductTotal(product), 0);
  };

  const getRequiredError = (productIndex, field) => {
    const error = getProductError?.(productIndex, field);
    return error ? t('sales.contract.requiredField') : '';
  };

  const handleRateChange =
    (productIndex) =>
    ({ target: { value } }) => {
      if (value === '') {
        handleProductChange(productIndex, FormKeys.PRODUCT_RATE, '');
        return;
      }

      // Allow at most 2 digits after the decimal point (e.g. 55.88 ok, 55.888 not)
      if (!/^\d*\.?\d{0,2}$/.test(value)) return;

      const next = parseFloat(value);
      if (Number.isNaN(next) || next > 999 || next < 0) return;

      handleProductChange(productIndex, FormKeys.PRODUCT_RATE, next);
    };

  const handleQuantityChange =
    (productIndex) =>
    ({ target: { value } }) => {
      const next = value;
      if (Number(next) > 999) return;

      handleProductChange(productIndex, FormKeys.PRODUCT_QUANTITY, next);
    };

  const formatCurrency = (value) =>
    value === '' || value == null ? '' : `${symbol}${Number(value).toFixed(2)}`;

  return (
    <Box className={classes.container}>
      <Typography className={classes.heading} variant="h5">
        {t('sales.contract.addProducts')}
      </Typography>

      {products.length > 0 && (
        <Box className={classes.productCardsWrapper}>
          {products.map((product, productIndex) => (
            <Box key={productIndex} className={classes.productCard}>
              <Box className={classes.productCardHeader}>
                <Typography className={classes.productLabel} component="span">
                  {t('sales.contract.productNumber', {
                    number: String(productIndex + 1).padStart(2, '0'),
                  })}
                </Typography>
                <IconButton
                  className={classes.deleteBtn}
                  onClick={() => handleDeleteProduct(productIndex)}
                  size="small"
                  aria-label={t('sales.contract.deleteProduct')}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>

              <Box className={classes.productDropdownWrap}>
                <CustomDropDown
                  name={FormKeys.PRODUCT_NAME}
                  id={`${FormKeys.PRODUCT_NAME}-${productIndex}`}
                  placeHolder={t('sales.contract.selectPlaceholder')}
                  options={productsOptions}
                  selectedValues={product[FormKeys.PRODUCT_NAME] || {}}
                  handleChange={(event) =>
                    handleProductChange(productIndex, FormKeys.PRODUCT_NAME, event.target.value)
                  }
                  bordered
                  fullOptionLabels
                  helperText={getRequiredError(productIndex, FormKeys.PRODUCT_NAME)}
                  isError={!!getProductError?.(productIndex, FormKeys.PRODUCT_NAME)}
                />
                <FieldError
                  name={FormKeys.PRODUCT_NAME}
                  error={getRequiredError?.(productIndex, FormKeys.PRODUCT_NAME)}
                />
              </Box>

              <Box className={classes.detailsRow}>
                <Box className={classes.detailsLabelsRow}>
                  <Typography className={classes.detailLabel} variant="body2">
                    {t('sales.contract.rate')}
                  </Typography>
                  <Typography className={classes.detailLabel} variant="body2">
                    {t('sales.contract.qty')}
                  </Typography>
                  <Typography
                    className={`${classes.detailLabel} ${classes.subTotalLabel}`}
                    variant="body2"
                  >
                    {t('sales.contract.subTotal')}
                  </Typography>
                </Box>
                <Box className={classes.detailsInputsRow}>
                  <Box className={classes.detailInputCell}>
                    <TextField
                      name={FormKeys.PRODUCT_RATE}
                      id={`${FormKeys.PRODUCT_RATE}-${productIndex}`}
                      fullWidth
                      size="small"
                      value={product[FormKeys.PRODUCT_RATE]}
                      onChange={handleRateChange(productIndex)}
                      type="number"
                      placeholder={`${symbol}0.00`}
                      InputProps={{
                        inputProps: { min: 0, max: 999, step: 'any' },
                        startAdornment: <InputAdornment position="start">{symbol}</InputAdornment>,
                      }}
                      onWheel={(e) => e.target.blur()}
                      error={!!getProductError?.(productIndex, FormKeys.PRODUCT_RATE)}
                      helperText={getRequiredError(productIndex, FormKeys.PRODUCT_RATE)}
                    />
                  </Box>
                  <Box className={classes.detailInputCell}>
                    <TextField
                      name={FormKeys.PRODUCT_QUANTITY}
                      id={`${FormKeys.PRODUCT_QUANTITY}-${productIndex}`}
                      fullWidth
                      size="small"
                      value={product[FormKeys.PRODUCT_QUANTITY]}
                      onChange={handleQuantityChange(productIndex)}
                      type="number"
                      InputProps={{
                        inputProps: { max: 999, min: 1 },
                        placeholder: '1',
                      }}
                      onWheel={(e) => e.target.blur()}
                      error={!!getProductError?.(productIndex, FormKeys.PRODUCT_QUANTITY)}
                      helperText={getRequiredError(productIndex, FormKeys.PRODUCT_QUANTITY)}
                    />
                  </Box>
                  <Box className={classes.subTotalValueCell}>
                    <Typography variant="body2" className={classes.subTotalValue}>
                      {formatCurrency(calculateProductTotal(product))}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          ))}

          {products.length > 0 && (
            <Box className={classes.totalRow}>
              <Typography className={classes.totalLabel} variant="body2">
                {t('sales.contract.totalLabel')}
              </Typography>
              <Typography className={classes.totalAmount} variant="body2">
                {formatCurrency(calculateGrandTotal())}
              </Typography>
            </Box>
          )}
        </Box>
      )}

      <Button
        disableRipple
        variant="outlined"
        className={classes.addProductBtn}
        onClick={handleAddProduct}
        startIcon={<AddIcon />}
      >
        {t('sales.contract.addProduct')}
      </Button>
    </Box>
  );
};

AddProducts.propTypes = {
  products: PropTypes.array,
  onChange: PropTypes.func.isRequired,
  visitIndex: PropTypes.number.isRequired,
  getProductError: PropTypes.func,
  productsOptions: PropTypes.array,
};

export default AddProducts;
