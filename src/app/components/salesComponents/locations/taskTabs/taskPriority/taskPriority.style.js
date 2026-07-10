import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  priorityWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  priorityDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    '&.high': {
      backgroundColor: theme.palette.error.main,
    },
    '&.medium': {
      backgroundColor: theme.palette.warning.main,
    },
    '&.low': {
      backgroundColor: '#146DFF',
    },
  },
}));
