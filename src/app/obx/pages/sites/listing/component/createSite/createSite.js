import { makeStyles } from '@mui/styles';
export const useStyles = makeStyles((theme) => ({
  chartHeading: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary1,
      marginBottom: '8px',
    },
  },
  siteWrapper: {
    padding: '0 0px 0px 0px',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'auto',
    flex: '1 1',
    '& h3.MuiTypography-root , & h6.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },

  notesCloseBtn: {
    '&.MuiButtonBase-root': {
      padding: '0',
      height: 'auto',
      minWidth: 'auto',

      '& .MuiButton-startIcon': {
        marginRight: 0,
        marginLeft: 0,
      },
    },
  },
  upperWrap: {
    padding: '24px 32px 0px 32px',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'auto',
    flex: '1 1',
  },
  lowerWrap: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    padding: '7px 32px',
    borderTop: `1px solid ${theme.palette.borderSubtle1}`,
  },
  siteDetaisFields: {
    display: 'flex',
    gap: '20px',
    margin: '16px 0px',
    flexWrap: 'wrap',
  },
  fieldWrapper: {
    flex: '1 1 32%',
  },
  onecols: {
    flex: '0 0 25%',
  },
  siteDetais: {
    border: `1px solid ${theme.palette.borderSubtle1}`,
    padding: '16px',
    borderRadius: '8px',
    margin: '16px 0px',
  },
  dropdownWrap: {
    height: '44px !important',
  },
  noMarginBottom: {
    marginBottom: '0px',
  },
  placeHolderColor: {
    color: `${theme.palette.textPlaceholderField} !important`,

    fontSize: '16px !important',
    fontWeight: '400 !important',
  },
  grayBox: {
    margin: '16px 0px 0px 0px',
    border: `1px solid ${theme.palette.borderSubtle1}`,
    background: theme.palette.surfaceGreyLight,
    borderRadius: '8px',
    padding: '16px',
    textAlign: 'center',
    '& p.MuiTypography-root': {
      margin: '4px 0px 16px 0px',
    },
    '& button.MuiButtonBase-root': {
      margin: '0 auto',
    },
  },
  inlineBtnsCols: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  inlinbtns: {
    display: 'flex',
    gap: '12px',
  },

  DaysTopWrap: {
    display: 'flex',
    gap: '24px',
    padding: '16px 0px',
    borderTop: `1px solid ${theme.palette.borderSubtle1}`,
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
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
  inlineCheckBox: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
  },
  addServises: {
    display: 'flex',
    alignItems: 'center',
    padding: '16px 0px',
    marginBottom: '16px',
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    gap: '24px',
  },
  descriptionTextArea: {
    '& .ck.ck-content.ck-editor__editable.ck-rounded-corners.ck-editor__editable_inline': {
      height: '100px',
    },
  },
  placeHolderColors: {
    color: theme.palette.textPlaceholderField,
    fontSize: '16px !important',
    fontWeight: '400 !important',
  },

  timezoneText: {
    '&.MuiTypography-root': {
      display: 'block',
      color: theme.palette.textBrand,
      marginTop: '8px',
    },
  },

  dropdownWraps: {
    height: '44px',
    fontSize: '16px',
    fontWeight: '400',
  },
  datePickerRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
    '& > .MuiBox-root': {
      width: '100%',
    },
  },
  inputWidth: {
    width: '100%',
  },
  crossIconWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  invalidFeedback: {
    color: '#b32318',
    fontSize: '14px',
    fontWeight: '400',
    lineHeight: '20px',
    textAlign: 'left',
    marginTop: '6px',
    textTransform: 'lowercase',
    '&::first-letter': {
      textTransform: 'capitalize',
    },
  },
  marginBottom: {
    paddingBottom: '8px',
  },
  autoCompleteField: {
    minHeight: '44px',
    '& .MuiFormControl-root': {
      '& .MuiInputBase-root': {
        fontSize: 16,
        lineHeight: '24px',
        color: '#262527', // Change the color of input text
        zIndex: 1,
        padding: '10px 14px',
        background: 'transparent',
        gap: '4px',
        borderRadius: '8px',
        border: `1px solid ${theme.palette.borderSubtle2}`,

        '& .MuiChip-root': {
          margin: 0,
        },

        '&:hover': {
          borderColor: theme.palette.borderStrong1, // Border Color when Hovered
          boxShadow: 'none',
        },

        '&::after': {
          display: 'none',
        },
        '&::before': {
          display: 'none',
        },
        '& .MuiInputBase-input': {
          padding: 0,

          '&::placeholder': {
            color: theme.palette.textPlaceholderField, // Placeholder Color
            fontSize: '16px',
            fontWeight: '400',
            lineHeight: '24px',
            opacity: 1,
          },
        },
      },
    },
  },
}));
