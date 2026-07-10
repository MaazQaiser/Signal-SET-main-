import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  descStep: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1',
    overflow: 'auto',
  },

  stepperDropdwon: {
    maxWidth: '320px',
    margin: '20px 0',
  },

  descriptionTextArea: {
    '& .ck.ck-content.ck-editor__editable.ck-rounded-corners.ck-editor__editable_inline': {
      height: '100px',
    },
  },

  checkBoxArea: {
    paddingTop: '16px',
    // borderTop: `1px solid ${theme.palette.borderSubtle1}`,
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
    marginBottom: '16px',
  },

  checkBoxAreaTwo: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
    marginBottom: '16px',
  },

  dropHeaders: {
    height: '36px',
    width: '100%',
    borderColor: theme.palette.textOnColor,
    '& h6.MuiTypography-root': {
      color: theme.palette.textBrand,
    },
    '& path': {
      stroke: theme.palette.textBrand,
    },
    '& > div:nth-child(2)': {
      right: '0px !important',
      left: 'unset',
    },
  },

  toolbarToggleDate: {
    gap: '12px',
    '&.MuiToggleButtonGroup-root': {
      border: `0px solid ${theme.palette.borderSubtle1}`,
      background: `${theme.palette.surfaceWhite}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',

      '& .MuiToggleButtonGroup-grouped': {
        padding: '4px 16px',
        height: '40px',
        width: '40px',
        borderRadius: '40px !important',
        border: `1px solid ${theme.palette.borderSubtle1}`,
        borderLeft: `1px solid ${theme.palette.borderSubtle1} !important`,
        marginLeft: '0px !important',
      },
    },
  },

  toggleBtnCircle: {
    '&.MuiButtonBase-root': {
      width: '100%',
      color: `${theme.palette.textPlaceholder}`,
      fontSize: '14px',
      borderRadius: '20px',
      padding: '20px',
      border: `1px solid ${theme.palette.borderSubtle1}`,
      '&:hover': {
        backgroundColor: `${theme.palette.surfaceGreySubtle}`,
      },

      '&:disabled': {
        color: `${theme.palette.surfaceWhite}`,
        backgroundColor: `${theme.palette.surfaceBrandDisabled}`,
        border: `1px solid ${theme.palette.borderSubtle1}`,
      },

      '&.Mui-selected': {
        backgroundColor: `${theme.palette.surfaceBrand}`,
        color: `${theme.palette.textOnColor}`,
        '&:hover': {
          backgroundColor: `${theme.palette.surfaceBrandHover}`,
        },
      },
    },
  },

  toolbarToggle: {
    gap: '4px',
    '&.MuiToggleButtonGroup-root': {
      borderRadius: '8px',
      border: `1px solid ${theme.palette.borderSubtle1}`,
      background: `${theme.palette.surfaceWhite}`,
      height: '32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0 2px',

      '& .MuiToggleButtonGroup-grouped': {
        padding: '4px 16px',
        border: '0 ',
        height: '28px',
        borderRadius: '6px !important',
      },
    },
  },

  toggleBtn: {
    '&.MuiButtonBase-root': {
      width: '100%',
      color: `${theme.palette.textPlaceholder}`,
      border: '1px solid transparent',
      '&:hover': {
        backgroundColor: `${theme.palette.surfaceGreySubtle}`,
      },

      '&:disabled': {
        color: `${theme.palette.surfaceWhite}`,
        backgroundColor: `${theme.palette.surfaceBrandDisabled}`,
        border: `1px solid ${theme.palette.borderSubtle1}`,
      },

      '&.Mui-selected': {
        backgroundColor: `${theme.palette.surfaceBrand}`,
        color: `${theme.palette.textOnColor}`,
        '&:hover': {
          backgroundColor: `${theme.palette.surfaceBrandHover}`,
        },
      },
    },
  },

  serviceBox: {
    backgroundColor: theme.palette.background.paper || theme.palette.common.white,
    border: `1px solid ${theme.palette.borderSubtle1}`,
    borderRadius: '12px',
    boxShadow: '0px 1px 3px rgba(16, 24, 40, 0.1), 0px 1px 2px rgba(16, 24, 40, 0.06)',
    width: '430px',
    minWidth: '380px',
    maxWidth: '100%',
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
    overflowX: 'hidden',
    flexShrink: 0,
  },

  servicesInnerBox: {
    padding: '20px 24px 24px',
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
  },

  serviceHeader: {
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    padding: '16px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
  },

  serviceCardTitleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flex: 1,
    minWidth: 0,
  },

  serviceCardLabel: {
    '&.MuiTypography-root': {
      fontSize: '15px',
      fontWeight: 600,
      color: theme.palette.text.primary,
    },
  },

  serviceTypeButton: {
    '&.MuiButton-root': {
      width: '100%',
      padding: '12px 16px',
      borderRadius: '8px',
      marginBottom: '20px',
      textTransform: 'none',
      fontSize: '15px',
      fontWeight: 600,
      justifyContent: 'flex-start',
      gap: '8px',
    },
  },

  serviceCardFormBlock: {
    marginBottom: '20px',
    '& .MuiOutlinedInput-root': {
      borderRadius: '8px',
    },
  },

  serviceName: {
    '&.MuiTypography-root': {
      fontWeight: '500',
      color: theme.palette.textPrimary,
    },
  },

  boldheading: {
    '&.MuiTypography-root': {
      fontWeight: '700',
      color: theme.palette.textPrimary,
      marginBottom: '16px',
    },
  },

  checkBoxCustom: {
    '&.MuiCheckbox-root': {
      padding: '0',
    },

    '& svg': {
      width: '16px',
      height: '16px',
    },
  },

  servicePrice: {
    '&.MuiTypography-root': {
      fontWeight: '700',
      color: theme.palette.textPrimary,
    },
  },

  inlineColumn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBlock: '16px',
  },

  radioInline: {
    '& .MuiFormControlLabel-root': {
      '&:last-child': {
        marginRight: '0',
      },
    },
  },

  radioCom: {
    borderTop: `1px solid ${theme.palette.borderSubtle1}`,
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    padding: '16px 0px',
    '& .MuiSvgIcon-root': {
      width: '16px',
      height: '16px',
      marginLeft: '0px',
    },
    '& .MuiFormControlLabel-root': {
      marginLeft: '0px',
      padding: '0',
      minWidth: '92px',
    },
    '& .MuiFormControlLabel-label': {
      fontSize: '14px',
      marginBottom: '0px',
    },
    '& .MuiButtonBase-root': {
      padding: '0px 8px 0px 0px',
    },
    '& .MuiFormLabel-root': {
      marginBottom: '0px',
    },
  },

  radioComOne: {
    borderBottom: `0px solid ${theme.palette.borderSubtle1}`,
    paddingBottom: '0',
    marginTop: '0',
  },
  timeWidth: {
    maxWidth: '124px',
    '& input.MuiInputBase-input': {
      fontSize: '14px',
    },
    '& . MuiOutlinedInput-root ': {
      padding: '4px 8px',
    },
    '& button.MuiButtonBase-root': {
      // visibility: 'hidden',
      padding: '0',
    },
    '& fieldset.MuiOutlinedInput-notchedOutline': {
      // borderColor: 'white',
    },
    '& .MuiInputBase-root.Mui-disabled': {
      '& fieldset.MuiOutlinedInput-notchedOutline': {
        // borderColor: 'white',
      },
      '&:hover': {
        '& fieldset.MuiOutlinedInput-notchedOutline': {
          borderColor: theme.palette.borderSubtle2,
        },
      },
    },
    '&:hover': {
      '& button.MuiButtonBase-root': {
        visibility: 'visible',
      },
    },
    '& .MuiFormHelperText-root': {
      // display: 'none',
    },
  },
  duelTime: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '12px',

    '& .MuiInputBase-root': {
      minWidth: '100%',
    },
    '& .MuiBox-root': {
      '& .MuiStack-root': {
        '& .MuiFormControl-root': {
          '& .MuiInputBase-root': {
            height: '36px',
            padding: '4px 8px',
            '& .MuiOutlinedInput-notchedOutline': {
              // backgroundColor: theme.palette.surfaceWhite,
            },
          },
        },
      },
    },
  },
  singleTime: {
    marginBottom: '16px',

    '& .MuiInputBase-root': {
      minWidth: '100%',
    },
    '& .MuiBox-root': {
      '& .MuiStack-root': {
        '& .MuiFormControl-root': {
          '& .MuiInputBase-root': {
            height: '36px',
            '& .MuiOutlinedInput-notchedOutline': {
              // backgroundColor: theme.palette.surfaceWhite,
            },
          },
        },
      },
    },
  },
  marginBottomColumWidth: {
    width: '100%',
  },

  marginBottomColum: {
    width: '49%',
    marginBottom: '16px',
  },

  hourlyRateContainer: {
    marginBottom: '16px',
  },

  inputField: {
    '& .MuiInputBase-root': {
      height: '36px',
      minWidth: '100%',
    },
  },

  footerInline: {
    padding: '16px 0px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTop: `1px solid ${theme.palette.borderSubtle1}`,
    '& .MuiTypography-root': {
      color: theme.palette.textPlaceholder,
    },
  },

  boldText: {
    fontWeight: '700',
    display: 'inline-flex',
  },

  footerlable: {
    flex: '1 1 30%',
  },

  footerValues: {
    textAlign: 'right',
    flex: '1 1 70%',
  },

  delService: {
    width: '100%',
  },

  footerButton: {
    borderTop: `1px solid ${theme.palette.borderSubtle1}`,
    paddingTop: '16px',
  },

  noPadding: {
    '&.MuiButtonBase-root': {
      padding: 0,
      height: 'auto',
    },
  },

  instructionArea: {
    padding: '16px 0px 0 0',
    borderTop: `1px solid ${theme.palette.borderSubtle1}`,
  },

  richTextButton: {
    margin: '16px 20px 10px 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '12px',
    paddingTop: '10px',
    borderTop: `1px solid ${theme.palette.borderSubtle1}`,
  },

  descriptionText: {
    border: `1px solid ${theme.palette.borderSubtle1}`,
    borderRadius: '8px',
  },

  inlineCheckBox: {
    display: 'flex',
    alignItems: 'center',
    paddingTop: '16px',
    justifyContent: 'space-between',
  },

  additionalServices: {
    marginBottom: '16px',
  },

  servicesWrap: {
    display: 'flex',
    paddingBottom: '24px',
    flex: '1 1',
    overflow: 'auto',
    gap: '20px',
  },

  addServices: {
    display: 'flex',
    flexDirection: 'column',
    textAlign: 'center',
    alignItems: 'center',
    height: '100%',
    justifyContent: 'center',
    '& .MuiButtonBase-root': {
      height: 'auto',
      padding: '0',
      marginBottom: '16px',
    },
  },

  serviceBoxtext: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary3,
      marginBottom: '24px',
      marginTop: '8px',
    },
  },

  editIcons: {
    '&.MuiButtonBase-root': {
      padding: '0',
      minWidth: 'unset',
      border: '0',
      minHeight: 'auto',
      height: 'auto',
      '&:hover': {
        border: '0',
        background: 'transparent',
      },
    },
  },

  serviceEditIcon: {
    '&.MuiButtonBase-root': {
      padding: '4px',
      minWidth: 'unset',
      border: '0',
      minHeight: 'auto',
      height: 'auto',
      '&:hover': {
        border: '0',
        background: 'transparent',
      },
    },

    '& svg': {
      width: '16px',
      height: '16px',
    },
  },

  serviceNameField: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },

  contractNameFlex: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    paddingLeft: '4px',
    flexWrap: 'wrap',
  },

  billingCycleWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexShrink: 0,
  },

  billingCycleText: {
    '&.MuiTypography-root': {
      color: theme.palette.textDisabled,
      fontSize: '14px',
      fontWeight: '400',
      lineHeight: '20px',
      whiteSpace: 'nowrap',
    },
  },

  errorMessage: {
    '&.MuiTypography-root': {
      color: theme.palette.textAlert,
      marginTop: '6px',
      display: 'block',
    },
  },

  ServiceHeaders: {
    display: 'flex',
    padding: '0px 0 16px',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    paddingTop: '24px',
  },

  ServiceLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    flexWrap: 'wrap',
    minWidth: 0,
  },

  ServiceRight: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    width: 'auto',
  },

  selectServiceRadio: {
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    paddingBottom: '16px',
    marginBottom: '16px',
    '& .MuiFormControl-root': {
      width: '100%',
    },
    '& .MuiFormGroup-root.MuiFormGroup-row': {
      display: 'flex',
      width: '100%',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: '8px',
    },
    '& .MuiSvgIcon-root': {
      width: '16px',
      height: '16px',
      marginLeft: '0',
    },
    '& span.MuiButtonBase-root.MuiRadio-root': {
      display: 'none',
      padding: '0',
      width: 0,
      height: 0,
      margin: 0,
    },
    '& label.MuiFormControlLabel-root': {
      marginRight: '0',
      marginLeft: '0',
      flex: '1',
      padding: '8px 12px',
      borderRadius: '8px',
      justifyContent: 'center',
    },
    '& .MuiFormControlLabel-label': {
      marginLeft: '0 !important',
    },

    '& span.MuiTypography-root.MuiTypography-body1': {
      whiteSpace: 'nowrap',
      display: 'flex',
      alignItems: 'center',
      fontSize: '14px',
      lineHeight: '20px',
      color: theme.palette.textPrimary,
      '& .MuiListItemIcon-root': {
        minWidth: 'auto',
        margin: '0 5px',
      },
      '& .MuiListItemText-root': {
        margin: '0',
      },
    },
  },

  activeRadio: {
    backgroundColor: '#E5F6FF',
    '& span.MuiTypography-root.MuiTypography-body1': {
      fontWeight: '600',
      color: `${theme.palette.textBrand}`,
    },
    '& .MuiListItemIcon-root': {
      minWidth: 'auto',
      margin: '0px 5px',
    },
  },
  repeatAfterBox: {
    display: 'flex',
    gap: '12px',
    marginBottom: '16px',
    alignItems: 'center',
    '& label': {
      margin: 0,
    },
  },
  ofcRequired: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '12px',
  },
  stepperHeadding: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },
  addServise: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },
  invalidFeedback: {
    fontSize: 14,
    lineHeight: '20px',
    fontWeight: 400,
    margin: 0,
    marginTop: '8px',
    color: theme.palette.textAlert,
    textShadow: '0px 0px 0px #F4EBFF, 0px 1px 2px rgba(16, 24, 40, 0.05)',
    '&::first-letter ': {
      textTransform: 'capitalize',
    },
  },
  invalidFeedbackTime: {
    fontSize: 14,
    lineHeight: '20px',
    fontWeight: 400,
    margin: 0,
    marginTop: '8px',
    marginBottom: '8px',
    color: theme.palette.textAlert,
    textShadow: '0px 0px 0px #F4EBFF, 0px 1px 2px rgba(16, 24, 40, 0.05)',
    '&::first-letter ': {
      textTransform: 'capitalize',
    },
  },
  pricePerVisit: {
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    paddingBottom: '16px',
    marginBottom: '16px',
  },
  totalVisitHeading: {
    '&.MuiTypography-root': {
      fontWeight: '700',
      color: theme.palette.textPrimary,
      marginBottom: '16px',
    },
  },
  visitSet: {
    '&.MuiTypography-root': {
      fontWeight: '700',
      color: theme.palette.textSecondary1,
    },
  },
  repeatBoxHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  visitBox: {
    border: `1px solid ${theme.palette.borderSubtle1}`,
    padding: '16px',
    borderRadius: '8px',
    margin: '16px 0',
  },
  FullFields: {
    width: '100%',
  },
  DaysWrap: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
    maxWidth: '98%',
    '& div': {
      width: '56px',
      height: '28px',
      borderRadius: '40px',
      fontSize: '14px',
      fontWeight: '500',
      lineHeight: '20px',
      '&:hover': {
        border: `1px black ${theme.palette.borderBrand}`,
        color: theme.palette.textOnColor,
        backgroundColor: theme.palette.surfaceBrand,
      },
    },
  },
  repeatBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    '&:not(:first-child)': {
      marginTop: '20px',
      paddingTop: '20px',
      borderTop: `1px solid ${theme.palette.borderSubtle1}`,
    },
  },
  addVisitbtn: {
    '&.MuiButtonBase-root': {
      padding: '0px',
      gap: '8px',
    },
    marginBottom: '16px',
    paddingBottom: '16px',
  },
  totalCount: {
    '&.MuiTypography-root': {
      fontWeight: '700',
      color: theme.palette.textPrimary,
      marginBottom: '10px',
    },
  },
  summeryDays: {
    '&.MuiTypography-root': {
      textTransform: 'capitalize',
      color: theme.palette.textSecondary1,
    },
  },
  daysSummery: {
    margin: '16px 0px',
    background: theme.palette.surfaceBrandSubtle,
    padding: '8px 16px',
    borderRadius: '8px',
  },
  deleteBtn: {
    '& svg': {
      width: '13px',
      cursor: 'pointer',
    },
  },
  radioOption: {
    marginBottom: '16px',
    '& .MuiFormGroup-root': {
      display: 'flex',
      gap: '20px',
    },
    '& span.MuiTypography-root': {
      fontSize: '14px',
    },
    '& .MuiSvgIcon-root': {
      width: '16px',
      height: '16px',
      marginLeft: '0px',
    },
    '& label.MuiFormControlLabel-root': {
      marginRight: '0px',
    },

    '& .MuiButtonBase-root': {
      paddingBottom: '0px ',
      marginRight: '0px',
      paddingTop: '0px',
      paddingRight: '4px',
    },
  },
  activeLabel: {
    '& span.MuiTypography-root': {
      color: theme.palette.textBrand,
      fontWeight: '600',
    },
  },
  dutyDays: {
    textTransform: 'capitalize',
    border: `1px solid ${theme.palette.borderSubtle2} `,
    fontSize: '16px',
    fontWeight: '400',
    lineHeight: '24px',
    color: theme.palette.textSecondary1,
    borderRadius: '50%',
    height: '44px',
    width: '44px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  hourlyRateLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    justifyContent: 'space-between',
  },
  hourlyRateText: {
    display: 'flex',
    alignItems: 'center',
  },
  suggestRateText: {
    '&.MuiTypography-root': {
      color: '#E61A1A',
      fontSize: '12px',
      fontWeight: '400',
      lineHeight: '20px',
      textDecoration: 'underline',
      textDecorationStyle: 'solid',
      textDecorationSkipInk: 'auto',
      textDecorationThickness: '1px',
    },
  },
  suggestRateBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    cursor: 'pointer',
  },
  totalHrsWeekText: {
    '&.MuiTypography-root': {
      color: theme.palette.textBrand,
      fontSize: '14px',
      fontWeight: 500,
      lineHeight: '20px',
      whiteSpace: 'nowrap',
    },
  },
  // marginBottomDropDown: {
  //   marginBottom: '16px',
  // },
  timeDurationBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  officerTypeBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0px',
    marginBottom: '16px',
  },
}));
