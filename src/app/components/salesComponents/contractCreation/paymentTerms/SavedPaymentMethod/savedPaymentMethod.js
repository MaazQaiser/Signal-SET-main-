import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((_theme) => ({
  visaContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    backgroundColor: '#ffffff',
    transition: 'box-shadow 0.2s ease',
    width: 'calc(25% - 18px)',
    '&:hover': {
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
    },
  },
  content: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flex: 1,
  },
  iconWrapper: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: '#f5f5f5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: '20px !important',
    lineHeight: '20px !important',
  },
  details: {
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    '&.MuiTypography-root': {
      fontSize: '12px',
      color: '#666666',
      fontWeight: 400,
      lineHeight: '16px',
    },
  },
  cardNumber: {
    '&.MuiTypography-root': {
      fontSize: '14px',
      color: '#333333',
      fontWeight: 500,
      letterSpacing: '0.5px',
      lineHeight: '20px',
    },
  },
  updateButton: {
    textTransform: 'none',
    fontSize: '14px',
    fontWeight: 500,
    padding: '6px 12px',
    '&:hover': {
      backgroundColor: 'rgba(211, 47, 47, 0.04)',
    },
  },
}));
