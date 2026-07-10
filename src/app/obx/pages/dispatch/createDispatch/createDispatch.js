import { makeStyles } from '@mui/styles';
export const useStyles = makeStyles((theme) => ({
  countryPhnNumber: {
    border: `1px solid ${theme.palette.borderSubtle1}`,
    padding: '0px 14px',
    borderRadius: '8px',
    '& > div': {
      '& div:nth-child(1)': {
        borderRight: `1px solid ${theme.palette.borderSubtle1}`,
        margin: '8px 8px 8px 0px',
        paddingRight: '8px',
      },
    },
    '& input': {
      height: '44px',
      border: 0,
      fontSize: '16px',
      lineHeight: '24px',
      '&::placeholder': {
        color: theme.palette.textPlaceholderField,
      },
      '&:focus , &:focus-visible': {
        border: 0,
        boxShadow: 'none',
        outline: 'none',
      },
    },
  },
  text: {
    marginLeft: '16px',
  },
  CreateDispatchWrapper: {
    maxWidth: '700px',
    width: '100%',
    margin: '24px auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    flex: '1 1',
  },
  dispatchMainWrapper: {
    width: '100%',
    margin: '24px auto',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'auto',
  },
  mainCreateWraper: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'auto',
    flex: '1 1',
  },
  bottomButtons: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    padding: '7px 32px',
    borderTop: `1px solid ${theme.palette.borderSubtle1}`,
  },
  rowGaps: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  rowFieldBlueBox: {
    background: theme.palette.surfaceBrandSubtle,
    padding: '16px',
    borderRadius: '8px',
  },
  rowFieldInline: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    '& .MuiFormLabel-root': {
      marginBottom: '0px',
    },
  },
  dropdownWrap: {
    height: '44px',
  },
  mainHeading: {
    '&.MuiTypography-root': {
      fontWeight: '600',
      color: theme.palette.textPrimary,
    },
  },
  fullWidth: {
    '&.MuiFormControl-root': {
      width: '100%',
    },
  },
  rowFieldTwo: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
  },
  richText: {
    height: '100px',
  },
  callHistory: {
    '&.MuiButtonBase-root': {
      padding: '0px',
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
  errorMessage: {
    '&.MuiTypography-root': {
      color: theme.palette.textAlert,
      boxShadow: 'none',
      fontSize: '14px',
      lineHeight: '20px',
      fontWeight: '400',
      margin: '0',
      marginTop: '110px',
      textShadow: '0px 0px 0px #f4ebff, 0px 1px 2px rgba(16, 24, 40, 0.05)',
    },
  },
  dropDownSkeleton: {
    '&.MuiSkeleton-root': {
      height: '44px',
      transformOrigin: 0,
      transform: 'none',
      borderRadius: '8px !important',
    },
  },
}));
