import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    overflowY: 'auto',
    position: 'relative',
    paddingRight: '32px',
    gap: '16px',
    width: '800px',
    margin: '0 auto',
    scrollbarWidth: 'thin',
    '&::-webkit-scrollbar': {
      width: '6px',
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: theme.palette.borderSubtle1,
      borderRadius: '10px',
    },
  },
  title: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
      fontWeight: 600,
    },
  },
  accordionContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  accordion: {
    '&.MuiAccordion-root': {
      borderRadius: '8px',
      border: `1px solid ${theme.palette.borderSubtle1}`,
      background: theme.palette.surfaceGreyLight,
      boxShadow: 'none',
      padding: '12px 16px',
      '&:before': {
        display: 'none',
      },
      '&.Mui-expanded': {
        margin: '0',
      },
    },
  },
  accordionSummary: {
    '&.MuiAccordionSummary-root': {
      padding: '0',
      minHeight: 'unset !important',
      '&.Mui-expanded': {
        marginBottom: '16px',
      },
    },
    '& .MuiAccordionSummary-content': {
      margin: 0,
      '&.Mui-expanded': {
        margin: 0,
      },
    },
  },
  countryItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    width: '100%',
  },
  flagContainer: {
    display: 'flex',
    alignItems: 'center',
    width: '30px',
    height: '18px',
    overflow: 'hidden',
  },
  flagImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  flagOnly: {
    padding: '0 !important',
    '& button': {
      padding: '0 !important',
      border: 'none !important',
      background: 'transparent !important',
      height: 'unset !important',
      '&:after': {
        display: 'none !important',
      },
    },
    '& .rfs-selected-flag': {
      padding: '0 !important',
      '& img': {
        width: '24px !important',
        height: '18px !important',
        margin: '0 !important',
      },
    },
  },
  flagButton: {
    padding: '0 !important',
    border: 'none !important',
    background: 'transparent !important',
  },
  countryName: {
    '&.MuiTypography-root': {
      flex: 1,
      color: theme.palette.textPrimary,
    },
  },
  statusChip: {
    fontSize: '12px',
    fontWeight: 500,
    height: '20px',
    marginRight: '8px',
  },
  chevronIcon: {
    width: '16px',
    height: '16px',
    color: theme.palette.textPrimary,
  },
  accordionDetails: {
    padding: '16px 0 0 0',
    borderTop: `1px solid ${theme.palette.borderSubtle1}`,
  },
  accordionDetailsContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  formRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '24px',
  },
  formRowRadio: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '24px',
    '& .MuiFormGroup-root': {
      justifyContent: 'flex-end',
    },
  },
  formLabel: {
    flex: '0 0 200px',
    fontSize: '14px',
    fontWeight: 500,
    color: theme.palette.textSecondary1,
  },
  formInput: {
    flex: 1,
    maxWidth: '320px', // Increased slightly for better fit
    '& .flag-button': {
      background: theme.palette.surfaceWhite,
      height: '36px !important',
    },
  },

  dropdown: {
    width: '100%',
    background: theme.palette.surfaceWhite,
    '& .customDropdownSelectHeader': {
      padding: '10px 14px !important',
    },
  },
  addMoreButton: {
    '&.MuiButton-root': {
      width: '165px',
      height: '36px',
      borderRadius: '8px',
      marginTop: '16px',
      '& svg': {
        width: '20px !important',
        height: '20px !important',
        '& path': {
          stroke: theme.palette.primary.main,
        },
      },
    },
  },
  addFormContainer: {
    borderRadius: '8px',
    padding: '8px 0 0 0',
    background: theme.palette.surfaceGreyLight,
  },
  newAddFormContainer: {
    padding: '24px',
    background: theme.palette.surfaceGreyLight,
  },
  formTitle: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
      fontWeight: 600,
      fontSize: '18px',
      marginBottom: '24px',
      borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
      paddingBottom: '16px',
    },
  },
  addFormContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  radioGroup: {
    '& .MuiFormControlLabel-root': {
      marginRight: '24px',
      marginLeft: '0',
    },
    '& .MuiSvgIcon-root': {
      width: '16px',
      height: '16px',
    },
    '& .MuiRadio-root': {
      padding: '4px',
    },
    '& .MuiFormControlLabel-label': {
      fontSize: '14px',
      '&.MuiTypography-root': {
        fontSize: '14px',
      },
    },
  },
  timeFormatDropdown: {
    marginTop: '12px',
    textTransform: 'none',
  },
  formFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '12px',
    paddingTop: '20px',
    borderTop: `1px solid ${theme.palette.borderSubtle1}`,
    marginTop: '24px',
  },
  formFooterButtons: {
    display: 'flex',
    gap: '12px',
  },
  cancelButton: {
    '&.MuiButton-root': {
      border: `1px solid ${theme.palette.borderStrong1}`,
      '&:hover': {
        backgroundColor: theme.palette.surfaceWhite,
      },
    },
  },
  draftButton: {
    '&.MuiButton-root': {
      backgroundColor: theme.palette.surfaceWhite,
    },
  },
  accordionSkeleton: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
}));
