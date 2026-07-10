import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  stepperHeadding: {
    '&.MuiTypography-root': {
      margin: '24px 0 16px',
    },
  },
  paymentModal: {
    '& .MuiPaper-root ': {
      boxShadow:
        '0px 8px 8px -4px rgba(16, 24, 40, 0.04), 0px 20px 24px -4px rgba(16, 24, 40, 0.1)',
      borderRadius: '12px',
    },
  },
  paymentModalTitle: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },
  paymentModalContent: {
    '& .MuiDialogContent-root': {
      padding: '16px  24px !important',
      paddingTop: '16px !important',
    },
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  infoBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '16px',
  },
  infoIcon: {
    fontSize: '16px',
    color: theme.palette.textPrimary,
  },
  infoText: {
    '&.MuiTypography-root': {
      fontSize: '14px',
      fontWeight: '400',
      color: theme.palette.textSecondary,
    },
  },
  title: {
    '&.MuiTypography-root': {
      marginBottom: '0',
    },
  },
  contractDuration: {
    '&.MuiTypography-root': {
      fontSize: '14px',
      fontWeight: '400',
      color: theme.palette.textSecondary,
    },
  },
  stepperHeaddings: {
    '&.MuiTypography-root': {
      marginBottom: ' 16px',
    },
  },
  stripeBillingContainer: {
    padding: '24px',
    backgroundColor: theme.palette.surfaceGreySubtle,
    borderRadius: '8px',
  },
  stripeBillingHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stripeBillingHeading: {
    '&.MuiTypography-root': {
      fontSize: '16px',
      fontWeight: 700,
      lineHeight: '24px',
    },
  },
  stripeContractDuration: {
    '&.MuiTypography-root': {
      fontSize: '12px',
      fontWeight: 500,
      lineHeight: '18px',
      color: theme.palette.textSecondary,
      backgroundColor: theme.palette.surfaceWhite,
      borderRadius: '16px',
      padding: '4px 8px',
    },
  },
  billingTypeTabsGroup: {
    display: 'flex',
    gap: '2px',
    border: `1px solid ${theme.palette.borderSubtle1}`,
    borderRadius: '8px',
    backgroundColor: theme.palette.surfaceWhite,
    marginTop: '14px',
    marginBottom: '14px',
    maxWidth: '360px',
    height: '28px',
  },
  billingTypeTab: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '28px',
    border: '1px solid transparent',
    backgroundColor: 'transparent',
    padding: 0,
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    lineHeight: '20px',
    fontWeight: 500,
    color: theme.palette.textSecondary,
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
      backgroundColor: theme.palette.surfaceWhite,
      borderColor: theme.palette.borderBrand,
    },
  },
  billingTypeTabActive: {
    backgroundColor: theme.palette.surfaceBrand,
    color: theme.palette.textOnColor,
    '&:hover': {
      backgroundColor: theme.palette.surfaceBrand,
    },
  },
  billingFrequencySection: {
    marginBottom: '24px',
  },
  billingInfoSection: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: theme.palette.surfaceBrandSubtle,
    borderRadius: '4px',
    height: '36px',
    marginTop: '12px',
    gap: '10px',
    paddingLeft: '12px',
    paddingRight: '12px',
  },
  billingInfoIcon: {
    display: 'flex',
    alignItems: 'center',
    flexShrink: 0,
    '& svg': {
      width: '16px',
      height: '16px',
    },
  },
  billingInfoText: {
    '&.MuiTypography-root': {
      fontSize: '14px',
      lineHeight: '24px',
      fontWeight: 500,
      color: theme.palette.textPlaceholder,
    },
  },
  billingInfoTextBold: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
      fontWeight: 700,
    },
  },
  stripeCycleRefDateSection: {
    marginTop: '12px',
    display: 'flex',
    gap: '12px',
  },
  stripeCycleRefInputWrapper: {
    flex: 1,
    maxWidth: '315px',
  },
  stripeCycleRefDateLabel: {
    '&.MuiTypography-root': {
      fontSize: '14px',
      fontWeight: 500,
      lineHeight: '20px',
      color: theme.palette.textSecondary3,
      marginBottom: '6px',
    },
  },
  exemptTaxSection: {
    display: 'flex',
    alignItems: 'center',
    alignSelf: 'flex-end',
    gap: '8px',
    height: '44px',
    '& .MuiButtonBase-root': {
      padding: 0,
    },
    '& .MuiButtonBase-root svg': {
      width: '15px',
      height: '15px',
    },
    '& .MuiButtonBase-root:not(.Mui-checked) svg rect': {
      stroke: theme.palette.textSecondary3,
      rx: 0,
      fill: 'transparent',
    },
  },
  exemptTaxLabel: {
    '&.MuiTypography-root': {
      fontSize: '12px',
      fontWeight: 500,
      lineHeight: '100%',
      color: theme.palette.surfaceGreyStrong1,
    },
  },
  taxExemptUploadSection: {
    marginTop: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  taxExemptUploadText: {
    '&.MuiTypography-root': {
      fontSize: '14px',
      fontWeight: 500,
      lineHeight: '20px',
      color: theme.palette.textPrimary,
    },
  },
  taxExemptUploadButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    maxWidth: '170px',
    padding: '8px 12px',
    border: `1px solid ${theme.palette.borderSubtle2}`,
    borderRadius: '8px',
    cursor: 'pointer',
    backgroundColor: theme.palette.surfaceWhite,
    '&:hover': {
      backgroundColor: theme.palette.surfaceWhite,
      borderColor: theme.palette.borderBrand,
    },
  },
  taxExemptUploadButtonText: {
    '&.MuiTypography-root': {
      fontSize: '14px',
      fontWeight: 500,
      lineHeight: '20px',
      color: theme.palette.textPrimary,
      whiteSpace: 'nowrap',
    },
  },
  taxExemptUploadedFile: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    width: '218px',
    boxSizing: 'border-box',
    border: `1px solid ${theme.palette.borderSubtle1}`,
    borderRadius: '8px',
    padding: '10px 14px',
  },
  taxExemptFileName: {
    '&.MuiTypography-root': {
      fontSize: '14px',
      fontWeight: 500,
      lineHeight: '24px',
      color: theme.palette.textPrimary,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
  },
  taxExemptTrashIcon: {
    flexShrink: 0,
    width: '16px !important',
    height: '16px !important',
    minWidth: '16px',
    minHeight: '16px',
    fontSize: '16px !important',
    cursor: 'pointer',
    '&.MuiSvgIcon-root': {
      width: '16px !important',
      height: '16px !important',
      fontSize: '16px !important',
    },
    '& > svg': {
      width: '16px !important',
      height: '16px !important',
      display: 'block',
    },
    '& path': {
      stroke: theme.palette.surfaceAlertStrong,
    },
  },
  fourDropdown: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    columnGap: '16px',
    rowGap: '16px',
  },
  threeDropdown: {
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap',
  },
  twoDropdown: {
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap',
    marginTop: '20px',
  },
  halfDropdown: {
    flex: '0 1 372px',
    width: '100%',
  },
  thirdQiardDropdpwn: {
    flex: '0 1 761px',
    width: '100%',
  },
  inputHightFull: {
    height: '36px',
    width: '145px !important',
    [theme.breakpoints.down('lg')]: {
      width: '100px !important',
    },
    '& .MuiTypography-subtitle2': {
      fontSize: '16px',
      fontWeight: '400',
    },
    '& .MuiInputBase-root': {
      height: '36px',
      minWidth: '145px',
      [theme.breakpoints.down('lg')]: {
        minWidth: '100px !important',
      },
    },
  },
  inputHight: {
    height: '36px',
    width: '145px !important',
    [theme.breakpoints.down('lg')]: {
      width: '100px !important',
    },
    '& .MuiTypography-subtitle2': {
      fontSize: '16px',
      fontWeight: '400',
    },
    '& .MuiInputBase-root': {
      height: '36px',
      minWidth: '145px',
      [theme.breakpoints.down('lg')]: {
        minWidth: '100px !important',
      },
    },
  },
  dropHeader: {
    height: '44px',
    '& .MuiTypography-subtitle2': {
      fontSize: '16px',
      fontWeight: '400',
    },
    '& .MuiInputBase-root': {
      height: '44px',
    },
  },
  radioOption: {
    paddingBottom: '16px',
    '& .MuiSvgIcon-root': {
      width: '16px',
      height: '16px',
      marginLeft: '0px',
    },
    '& .MuiFormControlLabel-root': {
      marginRight: '60px',
    },
    '& .MuiTypography-root': {
      fontSize: '14px',
      color: theme.palette.textPrimary,
    },
    '& .MuiButtonBase-root': {
      paddingBottom: '0px ',
      marginRight: '0px',
      paddingTop: '0px',
    },
  },
  binIcon: {
    '&.MuiButtonBase-root': {
      padding: '10px',
      minWidth: 'unset',
      borderColor: theme.palette.borderSubtle2,
      minHeight: '44px',
    },
  },
  placeHolderSize: {
    '&.MuiTypography-root': {
      fontSize: '16px',
      fontWeight: '400',
    },
  },
  duelTime: {
    '& .MuiBox-root': {
      '& .MuiStack-root': {
        '& .MuiFormControl-root': {
          '& .MuiInputBase-root': {
            height: '44px',
            backgroundColor: theme.palette.surfaceWhite,
          },
        },
      },
    },
  },

  paymentTd: {
    padding: '14px 16px',
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,

    height: '66px',
  },
  inlineLables: {
    display: 'flex',
  },
  paymentStepInner: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflow: 'auto',
    paddingRight: '8px',
    paddingLeft: '8px',
  },
  checkBoxArea: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
    marginTop: '11px',
    '& span.MuiButtonBase-root': {
      padding: '0',
    },
    '&:first-child': {
      marginRight: '66px',
    },
  },
  checkBoxCol: {
    display: 'flex',

    alignItems: 'center',
  },
  paymentTdSecond: {
    padding: '14px 16px',
    // borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    height: '66px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    [theme.breakpoints.down('lg')]: {
      padding: '14px 8px',
    },
    '&:not(:last-child)': {
      borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    },
  },
  previewQuestionOptionText: {
    '& .MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },
  paymentFooter: {
    height: '65px',
    background: theme.palette.surfaceGreySubtle,
    // borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    '& p.MuiTypography-root': {
      fontWeight: '700',
      color: theme.palette.textSecondary2,
    },
  },
  inlineField: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '10px',
  },

  paymentOptionsSecond: {
    flex: 1,
  },

  activeRadioBox: {
    background: theme.palette.surfaceBrand,
  },

  checkBoxPoint: {
    '& .MuiFormGroup-root': {
      '& label.MuiFormControlLabel-root': {
        marginRight: '0',
        marginLeft: '0',
      },
    },
    '& span.MuiButtonBase-root.MuiRadio-root': {
      paddingTop: 0,
      paddingBottom: 0,
      paddingLeft: 0,
      paddingRight: '8px',
    },
    '& svg.MuiSvgIcon-root': {
      width: '16px',
      height: '16px',
    },
    '& span.MuiTypography-root': {
      fontSize: '16px',
      fontWeight: '700',
    },
  },

  paymentStep: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflow: 'auto',
    paddingTop: '24px',
    overflowX: 'hidden',
  },

  paymentOptions: {
    display: 'flex',
    justifyContent: 'space-between',
    borderLeft: `1px solid ${theme.palette.borderSubtle1}`,
  },

  paymentsDropdowns: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },

  boxBorder: {
    border: `1px solid ${theme.palette.borderBrand}`,
    borderBottom: 0,
  },

  paymentColTwo: {
    flex: 1,
    textAlign: 'center',
    border: `1px solid ${theme.palette.borderSubtle1}`,
    borderLeft: 'transparent',
    position: 'relative',
    '&:hover': {
      background: theme.palette.surfaceGreySubtle,
    },
    '&::before': {
      content: '""',
      position: 'absolute',
      left: '0',
      bottom: '0px',
      width: '100%',
      height: '10px',
      background: theme.palette.surfaceGreySubtle,
      zIndex: '-1',
    },
  },
  paymentColOne: {
    border: `1px solid ${theme.palette.borderSubtle1}`,
    borderLeft: 'transparent',
    maxWidth: '345px',
    width: '100%',
    position: 'relative',
    '&::before': {
      content: '""',
      position: 'absolute',
      left: '0',
      bottom: '0px',
      width: '100%',
      height: '10px',
      background: theme.palette.surfaceGreySubtle,
    },
    [theme.breakpoints.down('lg')]: {
      maxWidth: 'max-content',
    },
  },

  paymentColThree: {
    flex: '1 1 25%',
    textAlign: 'center',
    border: `1px solid ${theme.palette.borderSubtle1}`,
    borderLeft: 'transparent',
    position: 'relative',

    '&:hover': {
      background: theme.palette.surfaceGreySubtle,
    },
  },
  flatColor: {
    '& .MuiTypography-root': {
      color: theme.palette.textPlaceholder,
    },
  },
  flatHeader: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '16px',
  },
  activeRadio: {
    border: `1px solid ${theme.palette.borderBrand}`,
    borderLeft: `1px solid ${theme.palette.borderBrand}`,
    borderTopColor: 'transparent',
    '& p.MuiTypography-root': {
      fontWeight: '700',
    },
    '& > .MuiBox-root': {
      background: theme.palette.surfaceBrandSubtle,

      '&:first-child': {
        '& label.MuiFormControlLabel-root': {
          background: theme.palette.surfaceBrand,
        },
        '& span.MuiTypography-root': {
          color: theme.palette.textOnColor,
        },
      },
      '&:last-child': {
        background: theme.palette.surfaceGreySubtle,
      },
    },
    '& .MuiInputBase-root': {
      background: theme.palette.textOnColor,
      borderRadius: '9px',
    },
    '& svg.MuiSvgIcon-root': {
      fill: theme.palette.textOnColor,
    },
    '& label.MuiFormControlLabel-root': {
      background: theme.palette.surfaceBrand,
    },
    '& span.MuiTypography-root': {
      color: `${theme.palette.textOnColor} !important`,
    },
  },

  paymentTdHeader: {
    padding: '14px 16px',
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    height: '66px',
    [theme.breakpoints.down('lg')]: {
      padding: '14px 8px',
    },
  },

  contractsBillingInfo: {
    paddingBottom: '20px',
  },
  contractsBillingInfoUpdate: {
    paddingBottom: '20px',
  },
  checkBoxAreas: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
    '& span.MuiButtonBase-root': {
      padding: '0',
    },
    marginBottom: '16px',
  },
  weekEvent: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },

  PaymentHeaderDivider: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',

    '&:first-child': {
      borderRight: `1px solid ${theme.palette.borderSubtle1}`,
      width: '50%',
    },

    '&:nth-child(2)': {
      width: '50%',
    },
  },

  radioHeader: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '10px',
    '& label.MuiFormControlLabel-root': {
      justifyContent: 'center',
      marginRight: 0,
      marginLeft: 0,
    },
    '& .MuiFormControl-root': {
      textAlign: 'center',
      width: '100% !important',
    },
  },
  checkBoxPointTwo: {
    '& .MuiFormGroup-root': {
      justifyContent: 'center',
      flexWrap: 'nowrap',
      '& label.MuiFormControlLabel-root': {
        flex: '1 1 50%',
        '&:first-child': {
          borderRight: `1px solid ${theme.palette.borderSubtle1}`,
          borderLeft: 'transparent',
        },
      },
    },
  },

  holidayGroupCount: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },

  holidayGroupCountText: {
    '&.MuiTypography-root': {
      fontFamily: 'Inter',
      fontWeight: '500',
      fontSize: '12px',
      lineHeight: '16px',
      letterSpacing: '0%',
      verticalAlign: 'middle',
      color: '#146DFF',
    },
  },

  disabledColumn: {
    background: theme.palette.surfaceGreySubtle,
    cursor: 'default',

    '&:hover': {
      background: theme.palette.surfaceGreySubtle,
    },
  },
  invalidFeedback: {
    fontSize: 14,
    lineHeight: '20px',
    fontWeight: 400,
    margin: 0,
    marginTop: '6px',
    color: theme.palette.textAlert,
    textShadow: '0px 0px 0px #F4EBFF, 0px 1px 2px rgba(16, 24, 40, 0.05)',
    '&::first-letter ': {
      textTransform: 'capitalize',
    },
  },
  widget: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px 0',
  },
  progressContainer: {
    position: 'relative',
    display: 'inline-flex',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      width: '60px',
      height: '60px',
      borderRadius: '50%',
      border: '7px solid #F5F5F6',
      boxSizing: 'border-box',
    },
  },

  progressValue: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    fontSize: '20px',
    fontWeight: '600',
    color: '#262527',
  },
  content: {
    flex: 1,
  },
  progressTitle: {
    fontSize: '18px',
    fontWeight: '500',
    color: '#262527',
    marginBottom: '8px',
  },
  currentValue: {
    color: '#262527',
  },
  requirement: {
    '&.MuiTypography-root': {
      color: '#6A6A70',
      fontSize: '12px',
      fontWeight: '500',
      lineHeight: '15px',
    },
  },
  netProfitContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '16px',
  },
  suggestRateText: {
    '&.MuiTypography-root': {
      color: '#E61A1A',
      fontSize: '14px',
      fontWeight: '400',
      lineHeight: '20px',
    },
  },
  suggestRateBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    cursor: 'pointer',
  },
  addPaymentDetailButton: {
    '&.MuiButton-root': {
      padding: '22px',
      fontSize: '16px',
      fontWeight: '700',
      lineHeight: '24px',
      color: theme.palette.textPrimary,
      borderColor: theme.palette.borderSubtle1,
      minHeight: 'unset !important',
      height: 'unset !important',
    },
  },
  circularWrapper: {
    // display: 'flex',
    alignItems: 'flex-end',
    gap: '16px',
  },
  processingButton: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: '16px',
    '& .MuiButton-root': {
      position: 'absolute',
      bottom: '16px',
      right: '113px',
    },
  },
  paymentModalActions: {
    '&.MuiDialogActions-root': {
      padding: ' 16px 24px',
    },
  },
  formSection: {
    // Styles can be added here if needed for other form sections
  },
}));
