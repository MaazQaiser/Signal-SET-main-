import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((_theme) => ({
  drawer: {
    '& .MuiDrawer-paper': {
      padding: '24px',
      width: '690px',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
    },
  },
  drawerContainer: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    // padding: '16px 24px',
    // borderBottom: '1px solid #e0e0e0',
    backgroundColor: '#fff',
    flexShrink: 0,
  },
  title: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#262527',
  },
  closeButton: {
    color: '#6A6A70',
    '&:hover': {
      backgroundColor: '#f5f5f6',
    },
  },
  serviceCard: {
    backgroundColor: '#ffffff',
    paddingTop: '16px',
    marginBottom: '24px',
    flexShrink: 0,
  },
  serviceCardHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '6px 0',
  },
  navigationButtons: {
    display: 'flex',
    gap: '8px',
  },
  navButton: {
    '&.MuiButtonBase-root': {
      padding: '0',
      color: '#6A6A70',
      width: '24px',
      height: '24px',
      border: '1px solid #e0e0e0',
      borderRadius: '50%',
      '& svg': {
        width: '24px',
        height: '24px',
        color: '#6A6A70',
      },
    },
  },
  serviceName: {
    '&.MuiTypography-root': {
      color: '#262527',
      fontSize: '16px',
      fontWeight: '600',
      lineHeight: 'normal',
      flex: 1,
      marginLeft: '16px',
    },
  },
  statusTag: {
    backgroundColor: '#e8f5e8',
    color: '#2e7d32',
    padding: '4px 12px',
    borderRadius: '16px',
    border: '1px solid #c8e6c9',
  },
  statusText: {
    fontSize: '12px',
    fontWeight: '500',
    color: '#2e7d32',
  },
  divider: {
    height: '1px',
    backgroundColor: '#e0e0e0',
    width: '100%',
  },
  tableWrapper: {
    flex: 1,
    // overflow: 'auto',
    padding: '16px 0',
    backgroundColor: '#fff',
    marginBottom: '24px',
  },
  tableCell: {
    '&.MuiTableCell-root': {
      color: '#262527',
      fontSize: '14px',
      fontWeight: '700',
      lineHeight: '24px',
    },
  },
  content: {
    marginBottom: '24px',
  },

  section: {
    marginBottom: '10px',
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: '500',
    color: '#262527',
    marginBottom: '12px',
  },
  formRow: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '16px',
  },
  label: {
    flex: '0 0 200px',
    fontSize: '14px',
    color: '#5B5B5F',
    fontWeight: '500',
  },
  inputContainer: {
    marginBottom: '16px',
  },
  inputField: {
    '& .MuiOutlinedInput-root': {
      '&:hover fieldset': {
        borderColor: '#146DFF',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#146DFF',
      },
    },
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    paddingTop: '16px',
    borderTop: '1px solid #e0e0e0',
  },
  suggestButton: {
    minWidth: '120px',
  },
  netProfitContainer: {
    display: 'flex',
    justifyContent: 'flex-start',
    // gap: '20px',
    backgroundColor: '#fff',
    flexShrink: 0,
    '& > *': {
      flex: '0 0 50%',
      maxWidth: '50%',
    },
    '& > *:nth-child(2)': {
      borderLeft: '1px solid #e0e0e0',
      paddingLeft: '44px',
    },
  },
  financialMatricsContainer: {
    padding: '16px 0',
    borderBottom: '1px solid #e0e0e0',
    backgroundColor: '#fff',
    flexShrink: 0,
    display: 'flex',
    gap: '16px',
    justifyContent: 'space-between',
  },
  financialMatricsItem: {
    display: 'flex',
    alignItems: 'center',
    // justifyContent: 'space-between',
    gap: '16px',
  },
  sectTitle: {
    '&.MuiTypography-root': {
      color: '#6A6A70',
      fontSize: '14px',
      fontWeight: '400',
      lineHeight: '20px',
    },
  },
}));
