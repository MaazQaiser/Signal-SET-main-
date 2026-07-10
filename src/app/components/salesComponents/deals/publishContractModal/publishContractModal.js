import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  errorMessage: {
    '&.MuiTypography-root': {
      color: theme.palette.textAlert,
      boxShadow: 'none',
      fontSize: '14px',
      lineHeight: '20px',
      fontWeight: '400',
      margin: '0',
      marginTop: '6px',
      textShadow: '0px 0px 0px #f4ebff, 0px 1px 2px rgba(16, 24, 40, 0.05)',
    },
  },
  boxHeader: {
    padding: '16px 16px 0 16px',
    margin: '0px 0px 16px 0px',
    '& .MuiSvgIcon-root': {
      width: '50px',
      height: '50px',
      marginBottom: '8px',
    },
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
    gap: '12px',
    padding: '16px',
    borderTop: '1px solid #d0cfd2',
  },
  footerText: {
    display: 'flex',
    alignItems: 'center',
  },

  alterIcon: {
    width: '16px',
    height: '16px',
    marginRight: '5px',
  },

  sideBySideCol: {
    marginTop: '8px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },

  duelTime: {
    display: 'flex',
    // alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    '& .MuiInputBase-root': {
      minWidth: '100%',
    },
    '& .MuiBox-root': {
      '& .MuiStack-root': {
        '& .MuiFormControl-root': {
          '& .MuiInputBase-root': {
            height: '36px',
            '& .MuiOutlinedInput-notchedOutline': {
              // backgroundColor: theme.palette.surfaceWhite,
            },
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
    maxWidth: '100%',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  attachSuccessInner: {
    display: 'flex',
    '& svg': {
      flex: '0 0 36px',
    },
  },
  deleIcons: {
    '& svg': {
      cursor: 'pointer',
      '& path': {
        stroke: '#db0808',
      },
    },
  },
  attachName: {
    '&.MuiTypography-root': {
      fontSize: '14px',
      color: theme.palette.textSecondary1,
      lineHeight: '20px',
    },
  },
  attachSize: {
    '&.MuiTypography-root': {
      fontSize: '14px',
      color: theme.palette.textSecondary3,
      lineHeight: '20px',
    },
  },
  attachNameWrap: {
    marginLeft: '10px',
  },
  uploadBtnImg: {
    cursor: 'pointer',
    position: 'relative',
    maxWidth: '100%',
    '& span.MuiButtonBase-root': {
      marginTop: '10px',
      height: '126px',
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
  FileUploader: {
    marginTop: '16px',
    marginBottom: '6px',
  },
  converModal: {
    padding: '0 !important',
    maxWidth: '975px !important',
  },
  converInner: {
    height: 'fit-content',
    overflow: 'auto',
    padding: '0 24px 24px 24px',
    '& .MuiTypography-subtitle2': {
      fontWeight: '600',
    },
  },
  modalGrid: {
    display: 'grid',
    gap: '16px',
    gridTemplateColumns: '1fr 1fr',
  },
  addendumServiceChargesWrapper: {
    borderRadius: '12px',
    background: '#FAFAFA',
    padding: '16px',
    height: '421px',
    overflow: 'hidden', // Hide the scrollbar by default

    /* Custom Scrollbar */
    '&::-webkit-scrollbar': {
      width: '2px', // Adjust the width of the scrollbar
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: 'darkgray', // Thumb color
      borderRadius: '10px', // Rounded corners for the thumb
    },
    '&::-webkit-scrollbar-track': {
      backgroundColor: '#f1f1f1', // Track background color
    },

    // Show scrollbar on hover
    '&:hover': {
      overflow: 'auto', // Show scrollbar when hovering over the container
    },
  },
  serviceTagline: {
    paddingBottom: '16px',
    borderBottom: '1px solid #E6E6E7',
    '&.MuiTypography-root': {
      color: theme.palette.textPlaceholder,
    },
  },
  serviceTitle: {
    marginBottom: '16px',
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },
  servicesubTitle: {
    '&.MuiTypography-root': {
      // color: '#3C3C3D',
      borderBottom: '1px solid #E6E6E7',
      fontWeight: '500 !important',
    },
  },
  deviceList: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  deviceListWrapper: {
    display: 'flex',
    alignItems: 'flex-start',
    flexDirection: 'column',
    gap: '10px',
  },
  nfc: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },

  serviceName: {
    width: '84px',
    '&.MuiTypography-root': {
      color: '#3C3C3D',
      fontWeight: '400 !important',
    },
  },
  serviceNamePayment: {
    width: '145px',
    '&.MuiTypography-root': {
      color: '#3C3C3D',
      fontWeight: '400 !important',
    },
  },
  serviceListItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  valueBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  minValue: {
    '&.MuiTypography-root': {
      color: '#3C3C3D',
      borderRadius: '2px',
      background: '  #FFEED4',
      textTransform: 'capitalize',
      padding: '2px 12px',
    },
  },
  removeServices: {
    borderRadius: '2px',
    background: '  #FFEED4',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '2px 12px',
    textDecoration: 'line-through',
  },
  addServices: {
    borderRadius: '2px',
    background: '  #E5F6FF',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '2px 12px',
    textTransform: 'capitalize',
  },
  serviceNameDemand: {
    '&.MuiTypography-root': {
      color: '#575758',
      fontWeight: '400 !important',
      textTransform: 'capitalize',
    },
  },
  removeServiceValue: {
    '&.MuiTypography-root': {
      color: '#3C3C3D',
      textTransform: 'capitalize',
    },
  },
  minValueLine: {
    '&.MuiTypography-root': {
      textDecoration: 'line-through',
    },
  },
  maxValue: {
    '&.MuiTypography-root': {
      textTransform: 'capitalize',
      color: '#3C3C3D',
      borderRadius: '2px',
      background: '  #E5F6FF',
      padding: '2px 12px',
    },
  },
  box: {
    borderBottom: '1px solid #E6E6E7',
    padding: '16px 0',
  },
  ServicesBox: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    flexDirection: 'column',
    // '&:not(:last-child)': { marginBottom: '16px' },
    marginTop: '16px',
  },
  demandBox: {
    display: 'flex',
    alignItems: 'flex-start',
    flexDirection: 'column',
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
  addOfficerCheckbox: {
    display: 'flex',
    alignItems: 'center',
  },

  converModalShorten: {
    padding: '0 !important',
    maxWidth: '500px !important',
  },

  deviceIcons: {
    height: '32px',
    width: '32px',
  },
}));
