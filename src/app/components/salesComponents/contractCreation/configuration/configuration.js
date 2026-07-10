import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  configStep: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1',
    overflow: 'auto',
    marginBottom: '24px',
    paddingTop: '24px',
  },

  agreementBox: {
    margin: '32px 0px',
  },

  stepperHeadding: {
    '&.MuiTypography-root ': {
      color: theme.palette.textPrimary,
      marginBottom: '24px',
    },
  },

  signHeadding: {
    '&.MuiTypography-root ': {
      color: theme.palette.textPrimary,
      fontWeight: '600',
      marginBottom: '8px',
    },
  },

  agreText: {
    '&.MuiTypography-root ': {
      maxWidth: '1055px',
      color: theme.palette.textPlaceholder,

      marginTop: '8px',
    },
  },

  emailTerms: {
    '&.MuiTypography-root ': {
      marginLeft: '4px',
      color: theme.palette.textPrimary,
    },
  },

  nameTitle: {
    '&.MuiTypography-root ': {
      marginRight: '4px',
      color: theme.palette.textPrimary,
    },
  },

  inlineFiledOne: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
  },

  titleField: {
    marginRight: '20px',
  },

  signField: {
    maxWidth: '310px',
    minWidth: '310px !important',
    width: '100%',
  },

  inlineFiledTwo: {
    marginTop: '20px',
    display: 'flex',
    alignItems: 'flex-end',
    width: '100%',
  },

  signBox: {
    marginBottom: '24px',
  },

  signWrapper: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1 1',
    overflow: 'auto',
  },

  inlineRows: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  btnColor: {
    '&.MuiButtonBase-root': {
      padding: '0px',
      color: theme.palette.textBrand,
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
  signBoxWrapper: {
    display: 'flex',
    gap: '20px',
    flexWrap: 'wrap',
  },

  signCard: {
    width: '200px',
    minHeight: '235px',
    textAlign: 'center',
    borderRadius: '8px',
    border: '1px solid',
    borderColor: theme.palette.borderSubtle2,
    padding: '10px 14px',
    position: 'relative',
  },

  binIconExtend: {
    '&.MuiButtonBase-root': {
      padding: '0px',
      position: 'absolute',
      top: '10px',
      right: '13px',
      minWidth: 'auto',
      height: 'auto',
    },
  },

  signeeName: {
    '&.MuiTypography-root ': {
      color: theme.palette.textPrimary,
      fontWeight: '500',
      marginTop: '20px',
      fontSize: '18px',
    },
  },

  signeeDesignation: {
    '&.MuiTypography-root ': {
      color: theme.palette.textPrimary,
      marginTop: '8px',
    },
  },

  signeeCount: {
    '&.MuiTypography-root ': {
      color: theme.palette.textPrimary,

      fontWeight: '700',
    },
  },

  addCard: {
    display: 'flex',
    flexDirection: 'column',
    textAlign: 'center',
    alignItems: 'center',

    justifyContent: 'center',
    '& .MuiButtonBase-root': {
      height: 'auto',
      padding: '0',
    },
  },

  questionBankActionsMenu: {
    display: 'flex',
    flexDirection: 'column',
  },

  questionBankActionsRegular: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 14px',
    cursor: 'pointer',

    '&:hover': {
      backgroundColor: theme.palette.surfaceGreySubtle,
    },
  },

  questionBankActionsIconRegular: {
    '&.MuiSvgIcon-root': {
      width: '16px',
      height: '16px',
      '& path': {
        stroke: theme.palette.textPlaceholder,
      },
    },
  },

  questionBankActionsDelete: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 14px',
    cursor: 'pointer',

    '&:hover': {
      backgroundColor: theme.palette.surfaceAlertStrong,

      '& .MuiTypography-root': {
        color: theme.palette.textOnColor,
      },

      '& svg': {
        '& path': {
          stroke: theme.palette.textOnColor,
        },
      },
    },

    '& svg': {
      width: '16px',
      height: '16px',
      '& path': {
        stroke: '#DF372B',
      },
    },
  },

  questionBankActionsTextDelete: {
    '&.MuiTypography-root': {
      color: '#DF372B',
    },
  },

  questionBankActions: {
    '& .MuiPaper-root': {
      width: '162px',
      backgroundColor: theme.palette.surfaceWhite,
      padding: '0px 0',
      border: `1px solid ${theme.palette.borderSubtle1}`,
      borderRadius: '8px',
      boxShadow: `0px 4px 6px -2px rgba(16, 24, 40, 0.05), 0px 12px 16px -4px rgba(16, 24, 40, 0.10)`,
    },
  },
  questionBankActionsTextRegular: {
    '&.MuiTypography-root': {
      color: theme.palette.textPlaceholder,
    },
  },
  popoverBtn: {
    marginBottom: '25px',
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'space-between',
    '& button.MuiButtonBase-root': {
      padding: '4px',
      height: '24px',
      width: '24px',
    },
    '& button.MuiButtonBase-root.MuiIconButton-root': {
      '& path': {
        stroke: theme.palette.textPlaceholder,
      },
    },
  },

  addSigneeard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  addInformation: {
    paddingTop: '21px',
    marginTop: '31px',
    borderTop: `1px solid ${theme.palette.borderSubtle1}`,
    '& h3.MuiTypography-root': {
      margin: '0',
    },
  },
  inlineFields: {
    display: 'flex',
    marginTop: '16px',
    gap: '16px',
  },
  signeeFields: {
    flex: '1 1',
  },
}));
