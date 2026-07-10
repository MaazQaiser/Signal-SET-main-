import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  boxHeader: {
    padding: '20px 0',
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    margin: '0 24px',
  },

  titlehead: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  sidetitle: {
    textAlign: 'left',
    color: '#102818',
    marginBottom: '0',
  },

  bulkSubHeading: {
    '&.MuiTypography-root': {
      color: theme.palette.textPlaceholder,
    },
  },

  sidefooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: '20px 0',
    margin: '0 24px',
    borderTop: `1px solid ${theme.palette.borderSubtle1}`,
  },

  footerText: {
    display: 'flex',
    alignItems: 'center',
  },

  footerButtons: {
    display: 'flex',
    gap: '12px',
  },

  //drawer
  siderBarBox: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflow: 'auto',
  },

  sideHeader: {
    display: 'block',
    padding: '24px 32px 32px 24px',

    '& .MuiBox-root': {
      marginBottom: 0,
      paddingRight: 0,
    },
  },

  fiftyWidth: {
    width: '48%',
  },

  locationForm: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'auto',
    flex: 1,
    gap: '20px',
    padding: '20px 24px',
  },

  fieldWrapper: {
    width: '100%',
  },

  sideBySideCol: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: '24px',
  },

  boxInner: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflow: 'auto',
  },

  approveTextBox: {
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    marginTop: '32px',
    paddingBottom: '8px',
    '&:last-child': {
      borderBottom: 0,
      paddingBottom: 0,
    },
  },

  approveTextBoxTitle: {
    '&.MuiTypography-root': {
      marginBottom: '8px',
    },
  },

  additionalFieldBox: {
    margin: '32px 0 0 0',
    paddingBottom: '32px',
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
  },

  companyFlex: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  cLabel: {
    flex: '0 0 40%',
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },

  compDetName: {
    flex: '0 0 60%',
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary3,
    },
  },

  placeHolderColor: {
    color: theme.palette.textPlaceholderField,
    fontSize: '16px !important',
    fontWeight: '400 !important',
  },

  dropdownWrap: {
    fontSize: '16px',
    fontWeight: '400',
  },

  sideDrawerFooter: {
    paddingLeft: '32px',
    paddingRight: '32px',
    marginTop: 0,
  },

  noMarginBottom: {
    marginBottom: 0,
  },

  invalidFeedback: {
    fontSize: 14,
    lineHeight: '20px',
    fontWeight: 400,
    margin: 0,
    marginTop: '6px',
    color: '#B32318',
    textShadow: '0px 0px 0px #F4EBFF, 0px 1px 2px rgba(16, 24, 40, 0.05)',
    '&::first-letter ': {
      textTransform: 'capitalize',
    },
  },
}));
