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
  contactDetailsWrapper: {
    display: 'flex',
    flexDirection: 'column',

    '&.MuiTypography-root': {
      color: '#262527',
    },
  },
  emailIcon: {
    '&.MuiTypography-root': {
      color: '#86868B',
    },
  },
  signeeDetailWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    borderRadius: '8px',
    padding: '12px',
    marginBottom: '16px',
    backgroundColor: '#F5F5F6',
  },
  signeeDetailWrapperitle: {
    '&.MuiTypography-root': {
      marginBottom: '16px',
      color: '#5B5B5F',
    },
  },
  userImage: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    objectFit: 'cover',
  },
}));
