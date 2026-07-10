import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  wrapper: {
    backgroundColor: '#ffffff',
    display: 'flex',
    flexDirection: 'column',
    height: 'calc(100vh - 160px)',
    overflow: 'hidden',
  },
  formRowTotal: {
    background: '#F5F5F6',
    padding: '12px 24px',
    // borderBottom: '1px solid #e0e0e0',
    justifyContent: 'space-between',
    display: 'flex',
    alignItems: 'center',
  },
  noDataWrapper: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    minHeight: '400px',
  },
  headerWrapper: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: '20px',
    borderBottom: '1px solid #e0e0e0',
    backgroundColor: '#ffffff',
    flexShrink: 0,
    zIndex: 2,
  },
  header: {
    backgroundColor: '#ffffff',
    flexShrink: 0,
    zIndex: 2,
  },
  title: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary1,
      marginBottom: '6px',
    },
  },
  companyWrapper: {
    padding: '16px 0 !important',
  },
  companyDropDown: {
    maxWidth: '354px',
    minWidth: '290px',
    '& >.MuiBox-root': {
      height: '40px',
    },
  },
  subtitle: {
    '&.MuiTypography-root': {
      color: '#6A6A70',
    },
  },
  sectionTitle: {
    '&.MuiTypography-root': {
      color: '#262527',
      padding: '16px 0',
      width: '100%',
      display: 'flex',
      justifyContent: 'start',
      alignItems: 'center',
      borderBottom: '1px solid #e0e0e0',
    },
  },
  tooltip: {
    maxWidth: 700,
    fontSize: 14,
    whiteSpace: 'normal',
    lineHeight: 1.5,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    overflowY: 'auto',
    overflowX: 'hidden',
    scrollbarWidth: 'none', // Hide scrollbar for Firefox
    msOverflowStyle: 'none', // Hide scrollbar for IE/Edge
    '&::-webkit-scrollbar': {
      display: 'none', // Hide scrollbar for Chrome/Safari
    },
    '&:hover': {
      '&::-webkit-scrollbar': {
        display: 'block', // Show scrollbar on hover for Chrome/Safari
        width: '8px',
      },
      '&::-webkit-scrollbar-track': {
        background: '#f1f1f1',
        borderRadius: '4px',
      },
      '&::-webkit-scrollbar-thumb': {
        background: '#c1c1c1',
        borderRadius: '4px',
        '&:hover': {
          background: '#a8a8a8',
        },
      },
    },
  },

  formRow: {
    display: 'flex',
    alignItems: 'center',
    padding: '6px 24px',
    borderBottom: '1px solid #f0f0f0',
    justifyContent: 'space-between',
    position: 'relative',
  },
  label: {
    flex: '0 0 300px',
    fontSize: '14px',
    color: '#5B5B5F',
    fontWeight: '500',
  },
  inputlabel: {
    '&.MuiTypography-root': {
      color: '#444446',
      fontWeight: '500',
    },
  },
  inputField: {
    '&.MuiInputBase-root': {
      position: 'relative',
    },
    '&.MuiInputBase-input': {
      paddingRight: '0px',
    },
    flex: '1',
    maxWidth: '200px',
    width: '100%',

    '& .MuiOutlinedInput-root': {
      '&:hover fieldset': {
        borderColor: '#146DFF',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#146DFF',
      },
    },
  },
  unitLabel: {
    '&.MuiTypography-root': {
      marginLeft: '8px',
      fontSize: '14px',
      color: '#86868B',
      position: 'absolute',
      right: '14px',
    },
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    paddingTop: '16px',
    borderTop: '1px solid #e0e0e0',
    backgroundColor: '#ffffff',
    flexShrink: 0,
    zIndex: 2,
    gap: '12px',
  },
  cancelButton: {
    marginRight: '8px',
  },
  saveButton: {
    // minWidth: '120px',
  },
  totalLabel: {
    flex: '0 0 300px',
    fontSize: '14px',
    color: '#5B5B5F',
    fontWeight: '500',
  },
  totalValue: {
    fontSize: '14px',
    color: '#262527',
    fontWeight: '500',
  },
  parenthesesText: {
    color: '#6A6A70',
    fontWeight: '300',
  },
  notesBox: {
    '&.MuiBox-root': {
      textAlign: 'center',
      padding: '24px !important',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '4px',
    },
  },
  notesIcon: {
    marginBottom: '20px',
  },
  notesError: {
    '&.MuiTypography-root': {
      fontSize: '22px',
      fontWeight: '700',
    },
  },
  notesMessage: {
    '&.MuiTypography-root': {
      fontSize: '14px',
      fontWeight: '400',
      color: '#5B5B5F',
    },
  },
}));
