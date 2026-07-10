import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((_theme) => ({
  accordianCards: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    marginBottom: '16px',

    '&:last-child': {
      marginBottom: 0,
    },
  },

  redirectIcon: {
    width: '20px',
    marginLeft: 'auto',
  },

  contactDetailsWrapper: {
    flex: '1',
  },

  userImage: {
    height: '40px',
    width: '40px',
    borderRadius: '50%',
  },

  dataColmLabel: {
    width: '144px',
    '&.MuiTypography-root': {
      color: '#262527 !important',
    },
  },

  dataColmLabelContact: {
    '&.MuiTypography-root': {
      color: '#262527 !important',
    },
  },

  contactContent: {
    display: 'flex',
    gap: '8px',
  },

  dataLink: {
    '&.MuiTypography-root': {
      textDecoration: 'none',
    },
  },

  emailIcon: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
  },
}));
