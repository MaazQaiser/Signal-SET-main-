import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  companyAssociationWrapper: {
    maxWidth: '594px !important',
  },
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
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: '8px',
    },
    '& .MuiPaper-root.MuiPaper-elevation .MuiAccordionSummary-root.Mui-expanded svg': {
      background: '#007aff',
      borderColor: '#007aff',
    },
    '& .MuiPaper-root.MuiPaper-elevation .MuiAccordionSummary-root.Mui-expanded path': {
      fill: 'white',
    },
    '& .MuiAccordionSummary-expandIconWrapper svg': {
      borderRadius: '30px',
      border: '1px solid #e6e6e7',
      background: '#f5f5f6',
    },
    '& .MuiAccordionSummary-expandIconWrapper path': {
      fill: '#262527',
    },
    '& .MuiAccordionSummary-content': {
      margin: '0 auto',
    },
    '& .MuiAccordionSummary-content p.MuiTypography-root': {
      color: '#262527',
      fontSize: '14px',
      fontStyle: 'normal',
      fontWeight: 700,

      letterSpacing: '0.25px',
    },
    '&  .MuiCollapse-wrapper .MuiAccordionDetails-root': {
      padding: '16px 0',
    },
    '& .MuiTypography-root': {
      color: '#86868b',
      fontSize: '14px',
      fontStyle: 'normal',
      fontWeight: 400,
    },
    '& .MuiCollapse-root.MuiCollapse-vertical.MuiCollapse-hidden': {
      visibility: 'visible',
    },
    '& .MuiCollapse-root.MuiCollapse-vertical.MuiCollapse-entered': {
      borderBottom: '1px solid #f5f5f6',
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
  dataColWrap: {
    display: 'flex',
    gap: '40px',
  },
  dataColmLabel: {
    minWidth: '144px',
    '&.MuiTypography-root': {
      color: '#262527',
    },
  },

  dataColmLabelContact: {
    '&.MuiTypography-root': {
      color: '#262527',
    },
  },

  dataLabel: {
    '&.MuiTypography-root': {
      color: '#262527',
    },
  },

  dataColmDetail: {
    flex: '1',
  },

  contactWrap: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },

  contactDetailsWrapper: {
    flex: 1,
  },

  dataLink: {
    '&.MuiTypography-root': {
      textDecoration: 'none',
    },
  },
  dealsData: {
    marginTop: '20px',
    '&:first-child': {
      marginTop: '0px',
    },
  },
  attchBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    '& .MuiButtonBase-root.MuiButton-root.MuiButton-onlyText.MuiButton-onlyTextPrimary.MuiButton-sizeMedium':
      {
        padding: '0px',
        '& svg': {
          width: '81px',
          height: '20px',
          background: '#007aff00',
          borderColor: '#007aff00',
          '& path': {
            fill: '#007aff',
          },
        },
      },
  },
  attachAccordian: {
    '& .MuiAccordionSummary-content': {
      justifyContent: 'space-between',
      width: '100%',
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
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
    width: '100%',
    marginBottom: '16px',
    '& svg': {
      flex: '0 0 36px',
    },
  },
  attachName: {
    '&.MuiTypography-root': {
      fontSize: '14px',
      color: theme.palette.textSecondary1,
      wordBreak: 'break-word',
    },
  },
  attachSize: {
    fontSize: '14px',
    color: '#86868B',
  },
  attachNameWrap: {
    marginLeft: '10px',
  },
  uploadBtnImg: {
    position: 'relative',
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

  dealsDataFlex: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '8px',
  },
  emailIcon: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
  },
  cardAvatar: {
    width: '80px',
    height: '80px',
  },
  trashIconBox: {
    cursor: 'pointer',
    lineHeight: 1,
  },
  attachSuccessFile: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  userImage: {
    height: '40px',
    width: '40px',
    borderRadius: '50%',
  },

  contactContent: {
    display: 'flex',
    gap: '8px',
  },

  chipWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginTop: '8px',
    flexWrap: 'wrap',
  },
  chipWrapperCompanies: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap',
  },
  redirectIcon: {
    width: '20px',
    marginLeft: 'auto',
  },

  accordionData: {
    marginBottom: '20px',
  },

  actions: {
    '& .MuiPaper-root': {
      width: '170px',
      backgroundColor: theme.palette.surfaceWhite,
      padding: '4px 0',
      border: `1px solid ${theme.palette.borderSubtle1}`,
      borderRadius: '8px',
      boxShadow: `0px 4px 6px -2px rgba(16, 24, 40, 0.05), 0px 12px 16px -4px rgba(16, 24, 40, 0.10)`,
    },
  },
  actionsMenu: {
    display: 'flex',
    flexDirection: 'column',
  },
  actionsRegular: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 14px',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: theme.palette.surfaceGreySubtle,
    },
  },
  actionsTextRegular: {
    '&.MuiTypography-root': {
      color: theme.palette.textPlaceholder,
    },
  },
  redirectWraper: {
    display: 'flex',
    alignItems: 'center',
  },
  referredContactWrap: {
    display: 'flex',
    marginTop: '4px',
    '&:first-child': {
      marginTop: '0',
    },
  },
  referredContactAvatar: {
    display: 'flex',
    gap: '4px',
    '& img': {
      marginLeft: '-4px',
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
  commonStageColor: {
    textAlign: 'center',
    fontSize: '12px',
    fontStyle: 'normal',
    fontWeight: '500',
    lineHeight: '18px',
    borderRadius: '16px',
    display: 'inline-flex',
    justifyContent: 'flex-start',
    width: 'fit-content',
    padding: '4px 12px',
    background: '#fafafa',
  },
  questionsColor: {
    color: '#DC6803',
    background: '#FFFAEB',
  },
  proposalsColor: {
    color: '#146DFF',
    background: '#E5F6FF',
  },
  lostColor: {
    color: theme.palette.surfaceAlertHover,
    background: theme.palette.surfaceAlertSubtle,
  },
  closedcolor: {
    color: '#FFA31C',
    background: '#FDF7EE',
  },
  closedWoncolor: {
    color: '#2E964B',
    background: '#EFF8EF',
  },
  negotiationColor: {
    color: '#9747FF',
    background: '#F4EDFD',
  },
  terminated: {
    backgroundColor: '#FEF0C7',
    color: '#F4780B',
  },
}));
