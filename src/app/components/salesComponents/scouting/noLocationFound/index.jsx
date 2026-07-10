import { Box, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { ReactComponent as NolocationsfoundIcon } from 'assets/svg/NolocationsfoundIcon.svg';
import { useTranslation } from 'react-i18next';
const useStyles = makeStyles((theme) => ({
  notesBox: {
    '&.MuiBox-root': {
      textAlign: 'center',
      padding: '0px 20px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
    },
  },
  notesError: {
    '&.MuiTypography-root': {
      margin: '32px 0px 16px 0px',
    },
  },
  notesMessage: {
    '&.MuiTypography-root': {
      color: `${theme.palette.textSecondary2}`,
    },
  },
}));

const NoLocationFound = () => {
  const { t } = useTranslation();
  const classes = useStyles(); // Move the 'classes' assignment inside the component
  return (
    <Box className={classes.notesBox}>
      <NolocationsfoundIcon />
      <Typography variant="h2" className={classes.notesError}>
        {t('sales.scouting.noFound')}
      </Typography>
      <Typography variant="body2" className={classes.notesMessage}>
        {t('sales.scouting.nofoundText')}
      </Typography>
    </Box>
  );
};

export default NoLocationFound;
