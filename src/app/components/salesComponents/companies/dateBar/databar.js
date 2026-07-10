import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  dateBar: {
    borderRadius: '8px',
    background: theme.palette.surfaceGreySubtle,
    marginTop: '24px',
    textAlign: 'center',
  },
  dateStyle: {
    padding: '5px',
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary3,
    },
  },
}));
