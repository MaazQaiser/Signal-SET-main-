import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  btnLocation: {
    '&.MuiButton-root': {
      marginLeft: '12px',
      marginRight: '12px',
    },
  },

  fieldWrapper: {
    width: '100%',
  },
  modalBottomArea: {
    padding: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '12px',
    '& button.MuiButtonBase-root': {
      maxWidth: '112px',
      width: '100%',
    },
  },
  sidetitle: {
    color: '#000',
    fontSize: '16px ',
    fontStyle: 'normal',
    fontWeight: '700',
    lineHeight: '24px',
  },
  marginTopBottom: {
    marginBottom: '10px',
    marginTop: '30px',
  },
  sideBarBox: {
    padding: '24px 32px',
    height: '100vh',
  },
  boxinner: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  sideheader: {
    display: 'flex',
    flexDirection: 'column',
  },

  marginBotm: {
    marginBottom: '30px',
  },
  companyFlex: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cLabel: {
    flex: '0 0 30%',
    border: '0',
    padding: '8px 0px',
    color: '#6a6a70',
    fontSize: '14px',
    fontStyle: 'normal',
    fontWeight: '400',
    lineHeight: '20px',
    textTransform: 'capitalize',
    paddingBottom: '0',
  },
  compDetName: {
    flex: '0 0 70%',
    border: '0',
    padding: '8px 0px',
    color: '#262527',
    fontSize: '14px',
    fontStyle: 'normal',
    fontWeight: '400',
    lineHeight: '20px',
    textTransform: 'capitalize',
    paddingBottom: '0',
    wordBreak: 'break-word',
  },
  approveTextBox: {
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    marginTop: '32px',
    paddingBottom: '10px',
  },
  sideFooter: {
    borderTop: `1px solid ${theme.palette.borderSubtle1}`,
    paddingTop: '24px',
    textAlign: 'right',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    '& .MuiButton-root': {
      padding: '8px 24px',
    },
  },

  wrapper: {
    maxHeight: 'calc(100vh - 180px)',
    overflow: 'auto',
  },

  box: {
    padding: '0 16px 16px 16px',
    margin: '24px 0',
    background: '#FAFAFA',
    borderRadius: '8px',
  },

  ServicesBox: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    flexDirection: 'column',
    paddingTop: '16px',
  },

  serviceBox: {
    width: '100%',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    flexDirection: 'column',
    paddingBottom: '16px',
    borderBottom: '1px solid #E6E6E7',
  },
  serviceBoxTitle: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },

  servicesubTitle: {
    '&.MuiTypography-root': {
      color: '#262527',
      fontWeight: '700 !important',
    },
  },

  serviceName: {
    width: '184px',
    whiteSpace: 'nowrap',
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
  maxValue: {
    '&.MuiTypography-root': {
      textTransform: 'capitalize',
      color: '#3C3C3D',
      borderRadius: '2px',
      background: '  #E5F6FF',
      padding: '2px 12px',
    },
  },
  editByWrapper: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: '4px',
  },
  editByLabel: {
    color: '#86868B !important',
    fontSize: '10px !important',
  },
  userLabel: {
    color: '#5B5B5F !important',
    fontSize: '10px !important',
  },
  editByAvatar: {
    height: '16px !important',
    width: '16px !important',
  },
}));
