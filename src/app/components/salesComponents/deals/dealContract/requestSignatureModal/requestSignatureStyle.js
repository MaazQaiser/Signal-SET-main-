import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  addendumModal: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: ' 550px',
    backgroundColor: theme.palette.surfaceWhite,
    boxShadow: '0px 8px 8px -4px rgba(16, 24, 40, 0.04), 0px 20px 24px -4px rgba(16, 24, 40, 0.1)',
    borderRadius: '12px',
    padding: '24px',
  },

  addendumModalContent: {
    marginTop: '20px',
  },

  rejectModalTitle: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },

  rejectModalDescription: {
    '&.MuiTypography-root': {
      color: theme.palette.textPlaceholder,
      marginTop: '4px',
    },
  },

  addendumModalActions: {
    marginTop: '24px',
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    columnGap: '12px',
  },

  rejectModalField: {
    marginTop: '20px',
  },

  addendumModalField: {
    width: '100%',

    '& .MuiInputBase-root': {
      '& .MuiInputBase-input': {
        fontSize: '16px',
        fontWeight: '400',
        lineHeight: '24px',
        height: '100px !important',

        '&::placeholder': {
          fontSize: '16px',
          fontWeight: '400',
          lineHeight: '24px',
        },
      },
    },
  },
  signeeInfo: {
    // display: 'flex',
    // alignItems: 'center',
    // gap: '8px',
  },
  contactContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    width: '100%',
    padding: '14px 0',
  },
  signeeInfoWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    width: '100%',
  },
  imageBox: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: '#CFEFFF',
  },
  userImage: {
    width: '100%',
    height: '100%',
  },
  emailText: {
    '&.MuiTypography-root': {
      color: '#86868B',
      fontSize: '14px',
      fontWeight: '400',
      lineHeight: '20px',
    },
  },
  dataColmLabelContact: {
    '&.MuiTypography-root': {
      color: '#262527',
      fontSize: '14px',
      fontWeight: '400',
      lineHeight: '20px',
    },
  },
  selectAllText: {
    '&.MuiTypography-root': {
      color: '#262527',
      fontSize: '14px',
      fontWeight: '400',
      lineHeight: '20px',
    },
  },
  selectAllWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '4px',
  },
  selectSigneesText: {
    '&.MuiTypography-root': {
      margin: '12px 0',
    },
  },
  checkBoxCustom: {
    '&.Mui-disabled': {
      opacity: 0.4,
    },
  },
}));
