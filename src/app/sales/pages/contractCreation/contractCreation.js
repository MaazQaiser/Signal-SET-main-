import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  stepperWrapper: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1',
    overflow: 'auto',
    padding: '24px 32px 0 32px',
    [theme.breakpoints.down('lg')]: {
      paddingLeft: '24px',
      paddingRight: '24px',
    },
    '&  .MuiStepConnector-root, & span.MuiStepLabel-iconContainer': {
      display: 'none !important',
    },
    '& .MuiStepper-root.MuiStepper-horizontal': {
      justifyContent: 'space-between',
      alignItems: 'stretch',

      '& .MuiStep-root': {
        // flex: '0 0 16.6%',
        flex: '100%',
        [theme.breakpoints.down('lg')]: {
          flex: 'auto',
        },
        padding: '0',
        '&:not(first-child)': {
          '& span.MuiStepLabel-label': {
            paddingLeft: '32px',
          },
        },
        clipPath: 'polygon(96% 0%, 100% 50%, 96% 100%, 0% 100%, 4% 50%, 0% 0%)',
        backgroundColor: theme.palette.surfaceGreySubtle,
        '&:first-child': {
          clipPath: 'polygon(96% 0%, 100% 50%, 96% 100%, 0% 100%, 0% 50%, 0% 0%)',
          borderTopLeftRadius: '5px',
          borderBottomLeftRadius: '5px',
          '& span.MuiStepLabel-label': {
            padding: '8px 16px',
          },
        },
        '&:last-child': {
          clipPath: 'polygon(100% 0%, 100% 50%, 100% 100%, 0% 100%, 4% 50%, 0% 0%)',
          borderTopRightRadius: '5px',
          borderBottomRightRadius: '5px',
        },
        '&:hover': {
          backgroundColor: theme.palette.surfaceBrandSubtle,
        },
        '& svg': {
          '& path': {
            fill: theme.palette.textSuccess,
          },
        },
      },
      '& .Mui-completed': {
        backgroundColor: theme.palette.surfaceSuccessSubtle,
        '& svg': {
          '& path': {
            fill: `${theme.palette.textSuccess} !important`,
          },
        },
        '& h6.MuiTypography-root': {
          color: theme.palette.textPrimary,
        },
      },

      '& span.MuiStepLabel-label': {
        padding: '8px 24px',
        [theme.breakpoints.down('lg')]: {
          padding: '8px 19px',
        },
        color: theme.palette.textDisabled,
        cursor: 'pointer',
        fontSize: '14px',
        display: 'flex',
        alignItems: 'center',
      },
      '& h6.MuiTypography-root': {
        color: theme.palette.textDisabled,
      },
      '& span.MuiTypography-root': {
        color: theme.palette.textDisabled,
      },
    },
  },
  reduceStepperWrapper: {
    '& .MuiStep-root': {
      flex: '0 0 25% !important',
      [theme.breakpoints.down('lg')]: {
        flex: 'auto',
      },
      clipPath:
        'polygon(95% 0%, 100% 50%, 95% 100%, 75% 100%, 70% 100%, 50% 100%, 45% 100%, 25% 100%, 20% 100%, 0% 100%, 5% 50%, 0% 0%) !important',
      '&:first-child': {
        clipPath:
          'polygon(95% 0%, 100% 50%, 95% 100%, 75% 100%, 70% 100%, 50% 100%, 45% 100%, 25% 100%, 20% 100%, 0% 100%, 0% 50%, 0% 0%) !important',
        borderTopLeftRadius: '5px',
        borderBottomLeftRadius: '5px',
        '& span.MuiStepLabel-label': {
          padding: '8px 16px',
        },
      },
      '&:last-child': {
        clipPath:
          'polygon(100% 0%, 100% 50%, 100% 100%, 75% 100%, 70% 100%, 50% 100%, 45% 100%, 25% 100%, 20% 100%, 0% 100%, 5% 50%, 0% 0%) !important',
        borderTopRightRadius: '5px',
        borderBottomRightRadius: '5px',
      },
    },
  },
  activeStepWrapper: {
    backgroundColor: `${theme.palette.surfaceBrand} !important`,
    '& h6.MuiTypography-root': {
      color: `${theme.palette.textOnColor} !important`,
    },
    '& span.MuiTypography-root': {
      color: `${theme.palette.textOnColor} !important`,

      position: 'relative',
    },
    '& svg': {
      '& path': {
        fill: `${theme.palette.textOnColor} !important`,
      },
    },
  },

  stepperIcon: {
    marginLeft: '5px',
  },

  stepContentWrapper: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1',
    overflow: 'auto',
  },

  stepTabContent: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1',
    overflow: 'auto',
  },

  stepFooter: {
    borderTop: `1px solid ${theme.palette.borderSubtle1}`,
    padding: '8px 0px',
    justifyContent: 'flex-end',
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
  },

  stepFooterButton: {
    display: 'flex',
    gap: '12px',
  },

  overlineText: {
    '&.MuiTypography-root': {
      color: theme.palette.textBrand,
      fontWeight: '500',
    },
  },

  stepperText: {
    [theme.breakpoints.down('mlgg')]: {
      display: 'none',
    },

    '& .MuiTypography-root': {
      color: theme.palette.textDisabled,
      fontWeight: '400',
      [theme.breakpoints.down('mlg')]: {
        fontSize: '11px',
      },
    },
  },

  steperName: {
    display: 'flex',
    alignItems: 'center',
  },
  billingCycleWrapper: {
    display: 'flex',
    alignItems: 'center',
    paddingTop: '24px',
  },
  billingCycleText: {
    '&.MuiTypography-root': {
      color: theme.palette.textDisabled,
      fontSize: '14px',
      fontWeight: '400',
      lineHeight: '20px',
    },
  },
}));
