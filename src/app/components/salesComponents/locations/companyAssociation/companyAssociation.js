import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  btnLocation: {
    '&.MuiButton-root': {
      marginLeft: '12px',
      marginRight: '12px',
    },
  },
  sideBySideCol: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: '20px',
    gap: '24px',
  },
  textWrapper: {
    '&.MuiTypography-root': {
      color: '#262527',
      textTransform: 'capitalize',
    },
  },
  ownerNameCol: {
    backgroundColor: '#F5F5F6',
    flexDirection: 'column !important',
    padding: '12px',
    gap: '0 !important',
    borderRadius: '8px',
    width: '100%',
  },
  phoneWrapper: {
    '&.MuiTypography-root': {
      color: '#86868B',
      fontSize: '14px',
      fontStyle: 'normal',
      fontWeight: '400',
      lineHeight: '20px',
    },
  },
  locationsDivider: {
    '&.MuiDivider-root': {
      marginTop: '4px',
    },
  },

  sideBySideColEmail: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    marginBottom: '20px',
    gap: '24px',
  },
  fieldWrapper: {
    width: '100%',
  },
  bordered: {
    border: '1px solid #e6e6e7',
    borderRadius: '8px',
    padding: '3px 0px',
  },
  assignToradio: {
    margin: '24px 0px 20px',
  },
  secondDropdown: {
    marginTop: '24px',
  },
  sidetitle: {
    color: '#000',
    fontSize: '16px ',
    fontStyle: 'normal',
    fontWeight: '700',
    lineHeight: '24px',
    whiteSpace: 'nowrap',
  },
  marginTopBottom: {
    marginBottom: '8px',
    marginTop: '24px',
  },
  contactDetailsWrapper: {
    marginBottom: '8px',
    marginTop: '24px',
  },
  marginTopB: {
    marginBottom: '4px',
    marginTop: '24px',
  },
  siderbarbox: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflow: 'auto',
  },
  boxinner: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflow: 'auto',
  },
  sideheader: {
    display: 'block',
    padding: '24px',

    '& .MuiBox-root': {
      marginBottom: 0,
      paddingRight: 0,
    },
  },
  locationForm: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflow: 'auto',
    padding: '0 24px',
  },
  radioWrapper: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'flex-start',
    gap: '16px',
    '& .MuiSvgIcon-root': {
      width: '16px',
      height: '16px',
      marginLeft: '0px',
    },
    '& .MuiFormControlLabel-root': {
      marginLeft: '0px',
      padding: '0',
    },
    '& .MuiFormControlLabel-label': {
      fontSize: '14px',
      marginBottom: '0px',
    },
    '& .MuiButtonBase-root': {
      padding: '0',
      marginRight: 8,
    },
    '& .MuiFormLabel-root': {
      marginBottom: '0px',
    },
  },
  radioOption: {
    '& .MuiFormGroup-root ': {
      gap: '8px',
    },
    '& .MuiFormControlLabel-root': {
      // marginLeft: '40px',
    },
  },
  marginBotm: {
    marginBottom: '30px',
  },
  fiftyWidth: {
    width: '48%',
  },
  dropHigh: {
    height: '44px',
  },
  placeHolderText: {
    fontSize: '16px !important',
    fontWeight: '400 !important',
    color: theme.palette.textPlaceholderField,
  },
  sideDrawerFooter: {
    paddingLeft: '32px',
    paddingRight: '32px',
    marginTop: 0,
  },
  newLocationDrawerHeader: {
    paddingRight: '8px',
  },
  inlineLables: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  noPadding: {
    '&.MuiButtonBase-root': {
      padding: 0,
      height: 'auto',
      marginBottom: '6px',
    },
  },
  contactList: {
    display: 'flex',
    padding: '16px 0',
    width: '100%',
    flexDirection: 'column',
  },

  contactListItem: {
    display: 'grid',
    padding: '0 16px',
    gridTemplateColumns: '30% 70%',
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    alignItems: 'center',
    justifyContent: 'center',
    height: '62px',

    '& .MuiChip-root': {
      padding: '0',
      fontSize: '12px',
      lineHeight: '20px',
      alignItems: 'flex-start',
      justifyContent: 'flex-start',
      backgroundColor: 'transparent !important',
    },
  },

  makerChip: {
    borderRight: `1px solid ${theme.palette.borderSubtle1}`,
    marginRight: '24px',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
  },

  decisionMakerChip: {
    '&.MuiChip-root': {
      color: '#9747FF',
      backgroundColor: '#F4EDFD',
    },
  },
  subtext: {
    '&.MuiTypography-root': {
      color: '#6A6A70',
      marginTop: '6px',
    },
  },
  radio: {
    display: 'none',
  },
  locationAffiliationChip: {
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '8px',
  },
  radioStyle: {
    '&.MuiChip-root': {
      whiteSpace: 'nowrap',
      backgroundColor: '#fff',
      color: '#000',
      padding: '6px 12px',
      fontWeight: '400',
      borderRadius: '40px',
      background: ' #FFF',
      cursor: 'pointer',
      fontSize: '14px',
      lineHeight: '20px',
      width: 'fit-content',
      margin: '0',
      textTransform: 'capitlize',
      '&:hover': {
        borderColor: '#146DFF',
        backgroundColor: '#fff',
      },
    },
  },

  customDropdownOptionLink: {
    padding: '12px 0 16px 0',
    margin: '0 16px',
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    cursor: 'pointer',
    marginBottom: '8px',
    '& .MuiSvgIcon-root': {
      width: '16px',
      height: '16px',
      '& path': {
        stroke: theme.palette.textBrand,
      },
    },
    '& .MuiTypography-root': {
      fontWeight: '500',
      color: theme.palette.textBrand,
    },
  },

  contactListHeader: {
    display: 'grid',
    padding: '0 16px',
    gridTemplateColumns: '30% 70%',
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    alignItems: 'center',
    justifyContent: 'center',
    height: '40px',
    background: theme.palette.surfaceGreyLight,
  },

  contactListText: {
    height: '40px',
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    '&:first-child': {
      borderRight: `1px solid ${theme.palette.borderSubtle1}`,
      marginRight: '24px',
    },

    '&.MuiTypography-root': {
      color: theme.palette.textSecondary2,
    },
  },

  invalidFeedback: {
    fontSize: '14px',
    lineHeight: '20px',
    fontWeight: '400',
    margin: 0,
    marginTop: '6px',
    color: theme.palette.textAlert,
    textShadow: '0px 0px 0px #F4EBFF, 0px 1px 2px rgba(16, 24, 40, 0.05)',
  },
}));
