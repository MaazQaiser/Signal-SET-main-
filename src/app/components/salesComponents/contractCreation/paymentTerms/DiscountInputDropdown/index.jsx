import { Box, Menu, MenuItem, TextField } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { ReactComponent as ChevronDown } from 'assets/svg/commonDropdown/chevronDown.svg';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getDisplayConfiguration } from 'src/redux/store/slices/regionalCountryConfiguration';

const useStyles = makeStyles((theme) => ({
  combinedInput: {
    display: 'flex',
    alignItems: 'center',
    border: `1px solid ${theme.palette.borderSubtle2}`,
    borderRadius: '8px',
    backgroundColor: theme.palette.surfaceWhite,
    overflow: 'hidden',
    position: 'relative',
    '&:hover': {
      borderColor: theme.palette.borderStrong1,
    },
    '&:focus-within': {
      borderColor: theme.palette.borderBrand,
    },
  },
  inputField: {
    flex: 1,
    '& .MuiOutlinedInput-root': {
      borderRadius: 0,
      border: 'none',
      boxShadow: 'none',
      minWidth: 'unset',
      '& fieldset': {
        border: 'none',
      },
      '&:hover fieldset': {
        border: 'none',
      },
      '&.Mui-focused': {
        boxShadow: 'none',
        '& fieldset': {
          border: 'none',
        },
      },
    },
    '& .MuiInputBase-input': {
      padding: '10px 14px',
      fontSize: '16px',
      lineHeight: '24px',
      '&::placeholder': {
        color: theme.palette.textPlaceholderField,
        opacity: 1,
      },
      '&:focus': {
        outline: 'none',
      },
    },
  },
  dropdownWrapper: {
    display: 'flex',
    alignItems: 'center',
    width: '123px',
    minWidth: '123px',
    boxSizing: 'border-box',
  },
  separator: {
    width: '1px',
    height: '24px',
    backgroundColor: theme.palette.borderSubtle1,
    flexShrink: 0,
  },
  dropdownSection: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: '10px 8px 10px 8px',
    cursor: 'pointer',
    backgroundColor: theme.palette.surfaceWhite,
    '&:hover': {
      backgroundColor: theme.palette.surfaceWhite,
    },
  },
  dropdownText: {
    fontSize: '16px',
    fontWeight: 400,
    lineHeight: '24px',
    color: theme.palette.textPrimary,
    whiteSpace: 'nowrap',
  },
  chevronIcon: {
    width: '20px',
    height: '20px',
    marginLeft: '4px',
    flexShrink: 0,
  },
  dropdownMenu: {
    marginTop: '6px',
    borderRadius: '8px !important',
    border: `1px solid ${theme.palette.borderSubtle2}`,
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
  },
  menuItem: {
    padding: '10px 14px',
    fontSize: '16px',
    lineHeight: '24px',
    color: theme.palette.textPrimary,
    '&:hover': {
      backgroundColor: `${theme.palette.surfaceGreySubtle} !important`,
    },
    '&.Mui-selected': {
      backgroundColor: `${theme.palette.surfaceBrandSubtle} !important`,
      '&:hover': {
        backgroundColor: `${theme.palette.surfaceGreySubtle} !important`,
      },
    },
  },
  errorBorder: {
    borderColor: '#B32318 !important',
    '&:hover': {
      borderColor: '#B32318 !important',
    },
    '&:focus-within': {
      borderColor: '#B32318 !important',
    },
  },
}));

const DISCOUNT_TYPES = {
  PERCENTAGE: 'percentage',
  AMOUNT: 'amount',
};

function getDefaultDiscountOptions(t, symbol) {
  const DISCOUNT_OPTIONS = [
    {
      value: DISCOUNT_TYPES.PERCENTAGE,
      label: t('sales.contract.percentageLabel'),
      displayLabel: t('sales.contract.percentage'),
    },
    {
      value: DISCOUNT_TYPES.AMOUNT,
      label: t('sales.contract.amountLabel', { symbol: symbol || '$' }),
      displayLabel: t('sales.contract.amount'),
    },
  ];
  return DISCOUNT_OPTIONS;
}

const DiscountInputDropdown = ({
  name,
  id,
  placeholder,
  value,
  dropdownValue = DISCOUNT_TYPES.PERCENTAGE,
  dropdownOptions,
  onChange,
  onDropdownChange,
  className,
  error,
}) => {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = useState(null);
  const containerRef = useRef(null);
  const isDropdownOpen = Boolean(anchorEl);
  const { t } = useTranslation();
  const { symbol } = useSelector(getDisplayConfiguration);

  const options = dropdownOptions?.length ? dropdownOptions : getDefaultDiscountOptions(t, symbol);
  const selectedOption = options.find((opt) => opt.value === dropdownValue) || options[0];
  const displayText = selectedOption?.displayLabel || selectedOption?.label || '';

  const dynamicPlaceholder =
    placeholder || (dropdownValue === DISCOUNT_TYPES.AMOUNT ? 'E.g., 200' : 'E.g., 10');

  const handleKeyDown = (e) => {
    const allowedKeys = [
      'Backspace',
      'Delete',
      'Tab',
      'Escape',
      'Enter',
      'ArrowLeft',
      'ArrowRight',
      'ArrowUp',
      'ArrowDown',
      'Home',
      'End',
    ];
    if (allowedKeys.includes(e.key)) return;
    if ((e.ctrlKey || e.metaKey) && ['a', 'c', 'v', 'x'].includes(e.key.toLowerCase())) return;
    if (e.key === '-' || e.key === '+') {
      e.preventDefault();
      return;
    }
    if (e.key === '.') {
      if (e.target.value.includes('.')) e.preventDefault();
      return;
    }
    if (/^\d$/.test(e.key)) return;
    e.preventDefault();
  };

  const handleInputChange = (e) => {
    const inputValue = e.target.value;
    if (inputValue === '') {
      onChange(e);
      return;
    }
    const regex = /^\d*\.?\d{0,1}$/;
    if (!regex.test(inputValue)) return;
    onChange(e);
  };

  const handleDropdownClick = () => {
    setAnchorEl(containerRef.current);
  };

  const menuWidth = anchorEl ? anchorEl.offsetWidth : 'auto';

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleOptionSelect = (optionValue) => {
    onDropdownChange({
      target: {
        name: `${name}Type`,
        value: optionValue,
      },
    });
    handleMenuClose();
  };

  return (
    <Box
      ref={containerRef}
      className={classNames(classes.combinedInput, error && classes.errorBorder, className)}
    >
      <TextField
        name={name}
        id={id}
        placeholder={dynamicPlaceholder}
        value={value || ''}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        className={classes.inputField}
        fullWidth
        type="text"
      />
      <Box className={classes.dropdownWrapper}>
        <Box className={classes.separator} />
        <Box className={classes.dropdownSection} onClick={handleDropdownClick}>
          <span className={classes.dropdownText}>{displayText}</span>
          <ChevronDown className={classes.chevronIcon} />
        </Box>
      </Box>
      <Menu
        anchorEl={anchorEl}
        open={isDropdownOpen}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        TransitionProps={{ timeout: 0 }}
        PaperProps={{
          className: classes.dropdownMenu,
          style: {
            width: menuWidth,
          },
        }}
      >
        {options.map((option) => (
          <MenuItem
            key={option.value}
            onClick={() => handleOptionSelect(option.value)}
            className={classes.menuItem}
            selected={dropdownValue === option.value}
          >
            {option.label}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
};

DiscountInputDropdown.propTypes = {
  name: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  dropdownValue: PropTypes.string,
  dropdownOptions: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      displayLabel: PropTypes.string,
    }),
  ),
  onChange: PropTypes.func.isRequired,
  onDropdownChange: PropTypes.func.isRequired,
  className: PropTypes.string,
  error: PropTypes.bool,
};

export default DiscountInputDropdown;
