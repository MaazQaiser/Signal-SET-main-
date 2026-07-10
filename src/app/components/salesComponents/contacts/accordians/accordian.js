import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  accordianWrapper: {
    '& .MuiPaper-root.MuiPaper-elevation.MuiPaper-rounded.MuiPaper-elevation': {
      border: 0,
      boxShadow: 'none',
    },
    '& .MuiPaper-root.MuiPaper-elevation .MuiAccordionSummary-root': {
      flexDirection: 'row-reverse',
      padding: '0px 0px 0 0',
      minHeight: 'auto',
      border: 0,
      gap: '8px',
    },
    '& .MuiAccordionSummary-content.Mui-expanded.MuiAccordionSummary-contentGutters': {
      margin: '0',
    },
    '& .MuiPaper-root.MuiPaper-elevation .MuiAccordionSummary-root.Mui-expanded svg': {
      background: theme.palette.surfaceBrand,
      borderColor: theme.palette.borderBrand,
    },
    '& .MuiPaper-root.MuiPaper-elevation .MuiAccordionSummary-root.Mui-expanded path': {
      fill: theme.palette.textOnColor,
    },
    '& .MuiAccordionSummary-expandIconWrapper svg': {
      borderRadius: '30px',
      border: `1px solid ${theme.palette.borderSubtle1}`,
      background: theme.palette.surfaceGreySubtle,
    },
    '& .MuiAccordionSummary-expandIconWrapper path': {
      fill: theme.palette.textPrimary,
    },
    '& .MuiAccordionSummary-content': {
      margin: '0 auto',
    },

    '&  .MuiCollapse-wrapper .MuiAccordionDetails-root': {
      padding: '16px 0',
    },

    '& .MuiCollapse-root.MuiCollapse-vertical.MuiCollapse-entered': {
      borderBottom: `1px solid ${theme.palette.borderSubtle1} !important`,
    },
    '&  .MuiPaper-root.MuiPaper-elevation.MuiPaper-rounded.MuiPaper-elevation1.MuiAccordion-root': {
      marginBottom: '24px',
      position: 'initial',
      '&:last-child': {
        '& .MuiCollapse-root.MuiCollapse-vertical.MuiCollapse-entered': {
          borderBottom: `0px solid ${theme.palette.borderSubtle1} !important`,
        },
      },
    },
  },
  toolTipBox: {
    cursor: 'pointer',
  },
  attachAccordian: {
    '& .MuiAccordionSummary-content': {
      justifyContent: 'space-between',
      width: '100%',
    },
  },
  assignToText: {
    '& .MuiChip-root': {
      display: 'flex',
      flexDirection: 'row-reverse',
      alignItems: 'center',
      '&.MuiChip-colorSuccess': {
        '& svg': {
          '& path': {
            stroke: theme.palette.textSuccess,
          },
        },
      },
      '&.MuiChip-colorPrimary': {
        '& svg': {
          '& path': {
            stroke: theme.palette.textBrand,
          },
        },
      },
      '&.MuiChip-colorWarning': {
        '& svg': {
          '& path': {
            stroke: theme.palette.textWarning,
          },
        },
      },
    },
  },
  plusBtn: {
    fontSize: '30px',
    marginRight: '10px',
  },
  attachSuccess: {
    marginTop: '8px',
    borderRadius: '8px',
    border: `1px solid ${theme.palette.surfaceGreySubtle}`,
    background: theme.palette.surfaceWhite,
    boxShadow: '0px 1px 2px 0px rgba(16, 24, 40, 0.06), 0px 1px 3px 0px rgba(16, 24, 40, 0.10)',
    padding: '10px 14px',
    display: 'flex',
    maxWidth: '337px',
    width: '100%',
    '& svg': {
      flex: '0 0 36px',
    },
  },
  attachName: {
    '&.MuiTypography-root': {
      fontSize: '14px',
      color: theme.palette.textSecondary1,
    },
  },
  attachSize: {
    '&.MuiTypography-root': {
      fontSize: '14px',
      color: theme.palette.textSecondary3,
    },
  },
  attachNameWrap: {
    marginLeft: '10px',
  },
  uploadBtnImg: {
    cursor: 'pointer',
    position: 'relative',
    maxWidth: '337px',
    borderRadius: '4px',
    border: `1px solid ${theme.palette.borderSubtle1}`,
    '& span.MuiButtonBase-root': {
      marginTop: '10px',
      height: '111px',
      padding: '0px',
      justifyContent: 'flex-start',
    },
  },
  fileUpload: {
    position: 'absolute',
    zIndex: '1',
    width: '100%',
    height: '100%',
    opacity: '0',
    cursor: 'pointer',
  },
  InlineFlex: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  redirectBtn: {
    '&.MuiButtonBase-root': {
      padding: '0px',
      justifyContent: 'flex-end',
    },
  },

  companyFlex: {
    gap: '40px',
    display: 'flex',
  },

  companyDetName: {
    flex: '1',
    '&.MuiTypography-root': {
      color: '#86868b',
      fontSize: '14px',
      fontStyle: 'normal',
      fontWeight: 400,
    },
  },

  companyLabel: {
    width: '144px',

    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },

  dealsData: {
    padding: '12px 0',
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,

    '&:last-child': {
      borderBottom: 'none',
      paddingBottom: 0,
    },
  },

  redirectIcon: {
    width: '20px',
  },

  chipWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginTop: '8px',
    flexWrap: 'wrap',
  },
}));
