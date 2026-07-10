import 'react-phone-number-input/style.css';

import { makeStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import PhoneInput from 'react-phone-number-input';
import { parsePhoneNumber } from 'react-phone-number-input';
import { canadianAreaCodes } from 'src/utils/constants';

const useStyles = makeStyles((theme) => ({
  errorClass: {
    '& .PhoneInput': {
      borderColor: `${theme.palette.borderAlert} !important`,
      '&:hover': {
        borderColor: `${theme.palette.borderAlert} !important`,
      },
      '&:focus-within': {
        borderColor: `${theme.palette.borderAlert} !important`,
        boxShadow: `0px 0px 0px 4px #fee4e2, 0px 1px 2px 0px rgba(16, 24, 40, 0.05)`,
      },
    },
  },
  invalidFeedback: {
    fontSize: '14px',
    lineHeight: '20px',
    fontWeight: '400',
    margin: 0,
    marginTop: '4px',
    color: theme.palette.textAlert,
    textShadow: '0px 0px 0px #F4EBFF, 0px 1px 2px rgba(16, 24, 40, 0.05)',
  },
  phoneInputContainer: {
    '& .PhoneInput': {
      display: 'flex',
      alignItems: 'center',
      border: `1px solid ${theme.palette.borderSubtle2}`,
      borderRadius: '8px',
      backgroundColor: theme.palette.surfaceWhite,
      overflow: 'hidden',
      minHeight: '44px',
      '&:hover': {
        borderColor: theme.palette.borderStrong1,
      },
      '&:focus-within': {
        borderColor: theme.palette.borderBrand,
        boxShadow: '0px 0px 0px 4px rgba(14, 165, 233, 0.1)',
      },
      '& .PhoneInputCountry': {
        display: 'flex',
        alignItems: 'center',
        padding: ' 10px 10px 10px 14px ',
        border: 'none',
        backgroundColor: 'transparent',
        cursor: 'pointer',
        margin: '0 !important',
        '& .PhoneInputCountryIcon': {
          width: '20px',
          height: '15px',
          backgroundColor: 'transparent !important',
          boxShadow: 'none !important',
          border: '0.5px solid #E6E6E7',
        },
      },
      '& .PhoneInputInput': {
        flex: '1',
        height: '44px',
        padding: '10px 14px 10px 4px',
        border: 'none',
        fontSize: '16px',
        lineHeight: '24px',
        color: theme.palette.textPrimary,
        backgroundColor: 'transparent',
        outline: 'none',
        '&::placeholder': {
          color: theme.palette.textPlaceholderField,
          fontSize: '16px',
          fontWeight: '400',
          lineHeight: '24px',
          opacity: 1,
        },
        '&:disabled': {
          backgroundColor: theme.palette.surfaceGreySubtle,
          color: theme.palette.textDisabled,
          cursor: 'not-allowed',
        },
      },
      '&:has(.PhoneInputInput:disabled)': {
        backgroundColor: theme.palette.surfaceGreySubtle,
        '& .PhoneInputCountry': {
          backgroundColor: theme.palette.surfaceGreySubtle,
          cursor: 'not-allowed',
        },
      },
    },
  },
}));

const US_AND_CA_ENUM = {
  UNITED_STATES: 'US',
  CANADA: 'CA',
  COUNTRY_CALLING_CODE: '1',
  DIALING_PREFIX: '+',
};

const PhoneNumberWithCountry = ({
  placeholder,
  value,
  onChange,
  name,
  disabled,
  error,
  defaultCountry,
  international,
  className,
  isError,
  ...rest
}) => {
  const classes = useStyles();
  const [country, setCountry] = useState(defaultCountry);
  const [_inputKey, setInputKey] = useState(0); // Force re-render when country changes

  useEffect(() => {
    if (value && value.startsWith(US_AND_CA_ENUM.DIALING_PREFIX)) {
      try {
        const phoneNumber = parsePhoneNumber(value);

        if (phoneNumber) {
          let detectedCountry = phoneNumber.country;
          const nationalNumber = phoneNumber.nationalNumber || '';

          if (phoneNumber.countryCallingCode === US_AND_CA_ENUM.COUNTRY_CALLING_CODE) {
            if (nationalNumber.length >= 3) {
              let areaCode = nationalNumber.substring(0, 3);
              areaCode = areaCode.toString();
              if (canadianAreaCodes.includes(areaCode)) detectedCountry = US_AND_CA_ENUM.CANADA;
              else detectedCountry = US_AND_CA_ENUM.UNITED_STATES;
            } else detectedCountry = US_AND_CA_ENUM.UNITED_STATES;
          }

          if (detectedCountry !== country) {
            setCountry(detectedCountry || defaultCountry);
            setInputKey((prev) => prev + 1);
          }
        } else setCountry(defaultCountry);
      } catch (error) {
        setCountry(defaultCountry);
      }
    } else setCountry(defaultCountry);
  }, [value, defaultCountry]);

  return (
    <div>
      <div
        className={`${classes.phoneInputContainer} ${className} ${isError && classes.errorClass}`}
      >
        <PhoneInput
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          name={name}
          defaultCountry={country} // Only use defaultCountry, as country is not supported dynamically
          international={international}
          disabled={disabled}
          {...rest}
        />
      </div>
      {error && <span className={classes.invalidFeedback}>{error}</span>}
    </div>
  );
};

PhoneNumberWithCountry.propTypes = {
  placeholder: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  name: PropTypes.string,
  disabled: PropTypes.bool,
  error: PropTypes.string,
  defaultCountry: PropTypes.string,
  international: PropTypes.bool,
  className: PropTypes.string,
  isError: PropTypes.bool,
};

PhoneNumberWithCountry.defaultProps = {
  placeholder: 'Enter phone number',
  value: '',
  name: 'phone',
  disabled: false,
  error: '',
  defaultCountry: 'US',
  international: false,
  className: '',
  isError: false,
};

export default PhoneNumberWithCountry;
