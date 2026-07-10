import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  tourWrapper: {
    padding: '24px 32px',
    display: 'flex',
    flexDirection: 'column',
    flex: '1 1',
    overflow: 'auto',
    '& .MuiAccordion-rounded': {
      border: `1px solid ${theme.palette.borderSubtle1}`,
      marginTop: '16px',
      borderRadius: '8px',
      borderBottomRightRadius: '8px !important',
      borderBottomLeftRadius: '8px !important',
      padding: '0px',
      '&::before': {
        opacity: '0',
      },
      '& .MuiAccordionSummary-root': {
        minHeight: 'auto',
        padding: '0px 24px 0px 0px',
      },
      '& .MuiAccordionSummary-content': {
        margin: '0px',
        padding: '24px',
      },
      '& .MuiAccordionDetails-root': {
        padding: '0  24px 12px 24px',
      },
    },
  },
  summeryWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    '& .MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },
  CheckPointText: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  dotCode: {
    '&.MuiTypography-root': {
      fontSize: '35px',
    },
  },
  footerWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingTop: '12px',
    borderTop: '1px solid #e6e6e7',
    marginTop: '12px',
    gap: '8px',
  },
  backButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',

    width: '100%',
  },
  textContent: {
    display: 'flex',
    alignItems: 'center',

    width: '100%',
  },
  reportFormWrapper: {
    margin: 'unset !important',
    maxWidth: '80% !important',
    '& >.MuiBox-root ': {
      '& >.MuiBox-root ': {
        '& .MuiFormControl-root': {
          width: '392px !important',
        },
      },
    },
  },

  borderWrapper: {
    borderTop: '1px solid #e6e6e7',
    paddingTop: '24px',
  },
  skeletonWrraper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  //   backgroundColor: theme.palette.surfaceGreySubtle,
  //   color: theme.palette.textSecondary1,
  //   border: `1px solid ${theme.palette.borderSubtle1}`,
}));
