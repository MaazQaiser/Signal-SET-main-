import { Box, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { ReactComponent as QuestionEmpty } from 'assets/svg/question.svg';
import { useTranslation } from 'react-i18next';
const useStyles = makeStyles((_theme) => ({
  notesBox: {
    '&.MuiBox-root': {
      textAlign: 'center',
      padding: '40px !important',
    },
  },
  notesError: {
    '&.MuiTypography-root': {
      fontSize: '22px',
      fontWeight: '700',
      margin: '30px 0px 16px 0px',
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

const NoCompanyFound = () => {
  const { t } = useTranslation();
  const classes = useStyles(); // Move the 'classes' assignment inside the component
  return (
    <Box className={classes.notesBox}>
      <QuestionEmpty />
      <Typography className={classes.notesError}>{t('sales.locations.selectACompany')}</Typography>
      <Typography className={classes.notesMessage}>{t('sales.locations.viewQuestions')}</Typography>
    </Box>
  );
};

export default NoCompanyFound;
