import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  // Same outer modal layout as requestSignatureModal
  addendumModal: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '550px',
    backgroundColor: theme.palette.surfaceWhite,
    boxShadow: '0px 8px 8px -4px rgba(16, 24, 40, 0.04), 0px 20px 24px -4px rgba(16, 24, 40, 0.1)',
    borderRadius: '12px',
    padding: '24px',
  },
  headerSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
  },

  title: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
      margin: '16px 0 6px 0',
    },
  },
  signeeList: {
    display: 'flex',
    flexDirection: 'column',
  },
  contactContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    padding: '14px 0',
  },
  signeeName: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
      fontSize: '14px',
      fontWeight: 400,
      lineHeight: '20px',
    },
  },
  signeeNameSigned: {
    '&.MuiTypography-root': {
      color: theme.palette.textPlaceholder,
      fontSize: '14px',
      fontWeight: 400,
      lineHeight: '20px',
    },
  },
  signedChip: {
    '&.MuiChip-root': {
      backgroundColor: '#EFF8EF',
      color: '#2E964B',
      border: '1px solid #2E964B',
      fontSize: '12px',
      fontWeight: 500,
      height: '24px',
      borderRadius: '16px',
    },
  },
  addSignLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    color: '#146DFF',
    fontSize: '14px',
    fontWeight: 400,
    lineHeight: '20px',
    cursor: 'pointer',
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'underline',
    },
    '& svg': {
      fontSize: '18px',
    },
  },
  addendumModalActions: {
    marginTop: '24px',
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    columnGap: '12px',
  },
  closeButton: {
    '&.MuiButton-root': {
      minWidth: '80px',
    },
  },
}));
