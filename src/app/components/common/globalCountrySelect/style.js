import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles(() => ({
  globalCountrySelect: {
    display: 'flex',
    alignItems: 'center',
  },
  countrySelector: {
    '&.MuiFormControl-root': {
      width: '200px !important',
      height: '36px !important',
      margin: '0 !important',
      '& .flag-button': {
        height: '36px !important',
        padding: '0 14px !important',
        minHeight: '36px !important',
        width: '100% !important',
        display: 'flex !important',
        alignItems: 'center !important',
      },
    },
  },
}));
