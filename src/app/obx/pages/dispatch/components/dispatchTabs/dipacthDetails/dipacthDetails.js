import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  '@keyframes colorChange': {
    '0%': {
      backgroundColor: '#F5F5F6',
    },
    '50%': {
      backgroundColor: '#FECDCA',
      color: '#B32318',
    },
    '100%': {
      backgroundColor: '#F5F5F6',
    },
  },
  pulseAnimation: {
    '&.MuiChip-root.MuiChip-filled': {
      maxWidth: 'fit-content',
      animation: `$colorChange 2s infinite`,
      backgroundColor: '#F5F5F6',
    },
  },

  intabHeading: {
    '&.MuiTypography-root': {
      marginBottom: '20px',
      color: theme.palette.textPrimary,
    },
  },
  textLabel: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary3,
    },
  },

  textDetail: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },
  dipatchRowBox: {
    display: 'flex',
    alignItems: 'center',
  },
  dipatchRowDate: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1',
    gap: '4px',
  },
  textLabelChip: {
    '&.MuiChip-root.MuiChip-filled': {
      maxWidth: 'fit-content',
    },
  },
  space: {
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    paddingBottom: '24px',
    marginBottom: '24px',
  },

  dipatchRowDateFull: {
    marginTop: '16px',
  },

  dispatchSkelton: {
    '& .MuiSkeleton-root': {
      borderRadius: '5px !important',
    },
  },
}));
