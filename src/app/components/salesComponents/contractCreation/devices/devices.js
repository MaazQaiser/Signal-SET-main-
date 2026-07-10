import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  stepperSubheading: {
    '&.MuiTypography-root': {
      color: theme.palette.textPlaceholder,
    },
  },
  labelStyle: {
    '&.MuiTypography-root': {
      fontWeight: '600',
      color: theme.palette.textSecondary1,
    },
  },
  iconName: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },
  iconSubText: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary3,
      fontWeight: '400',
    },
  },
  stepperHeadding: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },
  pointsLabels: {
    padding: '12px 20px',
    display: 'flex',
    alignItems: 'center',
    '& .MuiTypography-root': {
      flex: '1 1 25%',
      '&:not(:first-child)': {
        textAlign: 'center',
      },
    },
  },

  stepperInner: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflow: 'auto',
    paddingBottom: '24px',
    marginTop: '24px',
    paddingRight: '8px',
  },

  descStep: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflow: 'auto',
  },

  quantityColums: {
    padding: '12px 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTop: `1px solid ${theme.palette.borderSubtle1}`,
    '& > .MuiBox-root': {
      flex: '1 1 25%',
    },
  },

  stepsHeader: {
    paddingTop: '24px',
  },

  devicesName: {
    display: 'flex',
    alignItems: 'center',
    // flex: '0 0 50%',
  },

  unitPriceCol: {
    textAlign: 'center',
  },

  deviceIcon: {
    marginRight: '8px',
  },

  devicesQuanity: {
    textAlign: 'center',
  },

  devicesPrice: {
    textAlign: 'center',
  },

  pointsLabelsFooter: {
    backgroundColor: theme.palette.surfaceGreySubtle,
    borderRadius: '8px',
    padding: '20px',
    marginTop: '16px',
    display: 'flex',
    justifyContent: 'flex-end',
  },

  borderSeprater: {
    borderTop: `1px solid ${theme.palette.borderSubtle1}`,
  },

  totalDevicesCel: {
    textAlign: 'center',
    maxWidth: '60%',
  },

  stepsHeaderInline: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
    marginBottom: '8px',
  },

  iconHeading: {
    display: 'flex',
    alignItems: 'center',
    marginTop: '2px',
    gap: '4px',
    justifyContent: 'center',
    '& .MuiTypography-root': {
      color: theme.palette.textBrand,
      lineHeight: '1',
    },
  },

  footerInneWrapper: {
    flex: '0 0 25%',
    textAlign: 'center',
  },
  inputField: {
    '& .MuiInputBase-root': {
      height: '32px',
      width: '103px',
      minWidth: '103px',
      margin: '0 auto',
      fontSize: '14px',
      '& input': {
        fontSize: '14px',
        lineHeight: '20px',
        textAlign: 'center',
      },
    },
  },
}));
