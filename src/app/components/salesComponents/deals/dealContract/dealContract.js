import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  proposalSave: {
    marginTop: '32px',
    border: `1px solid ${theme.palette.borderSubtle1}`,
    borderRadius: '8px',
    padding: '20px 14px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  proposalGrayBox: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  hubSpotProposalBox: {
    borderRadius: '8px 8px 8px 8px',
    padding: '16px 32px',
    backgroundColor: theme.palette.surfaceGreySubtle,
  },

  hubSpotProposalBoxTitle: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },

  hubSpotProposalUrl: {
    display: 'block',
    marginTop: '16px',
    color: theme.palette.textBrand,
    textDecoration: 'underline',
    fontSize: '14px',
    fontWeight: '400',
    wordBreak: 'break-word',
  },
  textMargin: {
    marginTop: '10px',
  },

  proposalData: {
    display: 'flex',
    alignItems: 'flex-start',
  },
  proposalWhiteBox: {
    padding: '24px 32px',
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '40px',
  },
  proposalIcon: {
    '&.MuiAvatar-root': {
      width: '24px',
      height: '24px',
    },
    marginRight: '7px',
  },

  signPending: {
    width: 'fit-content',
    marginTop: '8px',
    backgroundColor: `${theme.palette.surfaceAlertSubtle}`,
    padding: '0px 8px 0px 6px',
    borderRadius: '16px',
    display: 'inline-flex',
    alignItems: 'center',
    '& .MuiTypography-root': {
      color: `${theme.palette.textAlert}`,
    },
  },
  signDone: {
    width: 'fit-content',
    marginTop: '8px',
    backgroundColor: `${theme.palette.surfaceSuccessSubtle}`,
    padding: '0px 8px 0px 6px',
    borderRadius: '16px',
    display: 'inline-flex',
    alignItems: 'center',
    '& .MuiTypography-root': {
      color: `${theme.palette.textSuccess}`,
    },
  },
  errorOutline: {
    marginRight: '2px',
    '& svg path': {
      stroke: theme.palette.surfaceAlertStrong,
    },
  },
  checkOutline: {
    marginRight: '2px',
    '& svg path': {
      stroke: theme.palette.surfaceSuccessStrong,
    },
  },
  grayText: {
    '&.MuiTypography-root': {
      color: `${theme.palette.textSecondary3}`,
    },
  },
  editPublishBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    '&.MuiButtonBase-root': {
      height: '36px',
      borderRadius: '8px',
    },
  },
  requestSignaturesBtn: {
    '&.MuiButtonBase-root': {
      color: '#146DFF',
      fontSize: '14px',
      fontWeight: '400',
      lineHeight: '20px',
    },
  },
  requestSignaturesButton: {
    '&.MuiButtonBase-root': {
      color: theme.palette.textPlaceholder,
      fontSize: '14px',
      fontWeight: '400',
      lineHeight: '20px',
      backgroundColor: theme.palette.surfaceGreySubtle,
      borderRadius: '8px',
      padding: '8px 16px',
      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.06)',
      '&:hover': {
        backgroundColor: '#DFDFDF',
      },
      '& .MuiButton-endIcon': {
        color: theme.palette.textPlaceholder,
      },
    },
  },
  signatureMenuPaper: {
    borderRadius: '8px',
    boxShadow: '0px 4px 6px -2px rgba(16, 24, 40, 0.05), 0px 12px 16px -4px rgba(16, 24, 40, 0.10)',
    minWidth: 160,
  },
  signatureMenuItem: {
    gap: 8,
    fontSize: 14,
    '& svg': {
      fontSize: 18,
    },
  },
  editIcon: {
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '8px',
    background: ' #F5F5F6 ',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    '& svg': {
      width: '16px',
      height: '16px',
    },
  },
  deleteBtn: {
    '& svg': {
      cursor: 'pointer',
      padding: '8px',
      borderRadius: '8px',
      width: '32px',
      height: '32px',
      display: 'flex',
      background: ' #F5F5F6 ',
      alignItems: 'center',
    },
  },
  proposalText: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  pdfBox: {
    width: '100%',
    borderRadius: '8px',
    padding: '14px',
    border: '1px solid #D0CFD2',
    background: '#F5F5F6',
    // minHeight: '368px',
  },
  pdfContracts: {
    display: 'flex',
    alignItems: 'cenetr',
    gap: '8px',
  },
  IconPdf: {
    padding: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid #E6E6E7',
    lineHeight: 1,
    borderRadius: '8px',
    height: '42px',
    width: '42px',
  },
  innerPdfContract: {
    display: 'flex',
    flexDirection: 'column',
    gap: '13px',
  },
  outerPdfBox: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
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

      '& .MuiSvgIcon-root': {
        '& path': {
          stroke: theme.palette.textOnColor,
        },
      },
    },
  },

  questionBankActionsTextDelete: {
    '&.MuiTypography-root': {
      color: '#DF372B',
    },
  },
  questionBankActionsIconDelete: {
    '&.MuiSvgIcon-root': {
      width: '16px',
      height: '16px',
      '& path': {
        stroke: '#DF372B',
      },
    },
  },
  questionBankActions: {
    padding: '0 !important',
    '& .MuiPaper-root': {
      width: '162px',
      backgroundColor: theme.palette.surfaceWhite,
      padding: '4px 0',
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
  mainPdfSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
  },
  pdfUploadSection: {
    width: '100%',
    borderRadius: '8px',
    border: '1px dashed #D0CFD2',
    minHeight: '138px',
    position: 'relative',
    cursor: 'pointer',
    padding: '16px',
    backgroundColor: '#F9F9F9',
  },
  uploadInnerContent: {
    display: 'flex',
    gap: '10px',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    left: '50%',
    right: '50%',
    position: 'absolute',
    transform: 'translate(-50%, -50%)',
    top: '50%',
    width: '100%',
    textAlign: 'center',
    '& svg': {
      height: '46px',
      width: '46px',
    },
  },
  //  these are the classes will be change according to dropdown options
  dropHeader: {
    height: '23px',
    borderRadius: '16px',
    border: 'none',
    background: '#FFF7ED',
    color: '#C64308',
    padding: '2px 6px 2px 8px',
    width: 'fit-content',
    '& > div ': {
      padding: '0 !important',
      '& > div': {
        '& > h6': {
          fontSize: '12px',
          color: '#C64308 !important',
        },
      },
      '&:nth-child(2) ': {
        display: 'none',
      },
    },
    '& svg path': {
      stroke: '#F4780B',
    },

    '&.terminateDropdown': {
      border: '1px solid #DB0000',
      background: '#FFF0F0',
      padding: '2px 8px 2px 8px',
      '& > div ': {
        padding: '0 !important',
        '& > div': {
          '& > h6': {
            color: '#DB0000 !important',
            fontWeight: '600 !important',
          },
        },
      },
    },
    '&.greenDropdown ': {
      border: '1px solid #2E964B',
      background: '#EFF8EF',
      padding: '2px 8px 2px 8px',
      '& > div ': {
        padding: '0 !important',
        '& > div': {
          '& > h6': {
            color: '#2E964B !important',
          },
        },
      },
      '& svg path': {
        stroke: '#2E964B !important',
      },
    },
  },
  showArrows: {
    '& > div ': {
      '&:nth-child(2) ': {
        display: 'inline-block',
      },
    },
  },
  assignedOperative: {
    height: '23px',
    borderRadius: '16px',
    border: '1px solid #2E964B',
    background: '#EFF8EF',
    padding: '2px 6px 2px 8px',
    '& > div ': {
      padding: '0 !important',
      '& > div': {
        '& > h6': {
          fontSize: '12px',
          color: '#2E964B !important',
        },
      },
    },
    '& svg path': {
      stroke: '#2E964B',
    },
  },
  unAssignedOperative: {
    height: '23px',
    borderRadius: '16px',
    border: '1px solid #DF372B',
    background: '#FECDCA',
    padding: '2px 6px 2px 8px',
    '& > div ': {
      padding: '0 !important',
      '& > div': {
        '& > h6': {
          fontSize: '12px',
          color: '#2E964B !important',
        },
      },
    },
    '& svg path': {
      stroke: '#DF372B',
    },
  },

  // end there
  dropDownSection: {
    display: 'flex',
    gap: '16px',
    alignItems: 'baseline',
  },
  mainOpenSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  signalPdfContent: {
    background: `${theme.palette.surfaceWhite}`,
    display: 'flex',
    flexDirection: 'column',
    textAlign: 'center',
    minHeight: '237px',
    padding: '20px 0px',
  },

  pdfcenter: {
    marginTop: '30px',
    '& .MuiSvgIcon-root': {
      width: '100px',
      height: '60px',
      display: 'block',
      margin: '0 auto',
    },
  },
  pdfBottom: {
    marginTop: '5px',
    padding: '5px',
    borderTop: `1px solid ${theme.palette.borderSubtle1}`,
    '& .MuiTypography-root': {
      fontWeight: '600',
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
  signButtons: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  titleFontSize: {
    fontSize: '16px',
    lineHeight: '24px',
    color: `${theme.palette.textPrimary}`,
    textAlign: 'left',
    paddingLeft: '0px',
  },
  reasonHeading: {
    color: `${theme.palette.textPrimary}`,
  },
  reasonText: {
    '&.MuiTypography-root': {
      color: `${theme.palette.textPlaceholder}`,
    },
  },
  headingColor: {
    display: 'flex',
    '& .MuiTypography-root': {
      color: `${theme.palette.textPrimary}`,
    },
  },
  drop: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
}));
