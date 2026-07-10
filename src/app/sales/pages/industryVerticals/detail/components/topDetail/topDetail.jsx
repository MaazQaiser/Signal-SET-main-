import { Box, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import HeaderDetailsSkeleton from 'src/app/components/common/skeletonLoader/headerDetailsSkeleton';
const useStyles = makeStyles((theme) => ({
  topDetail: {
    padding: '16px 32px',
    position: 'sticky',
    backgroundColor: theme.palette.surfaceGreySubtle,
    left: 0,
    zIndex: 9,
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    [theme.breakpoints.down('lg')]: {
      paddingLeft: '24px',
      paddingRight: '24px',
    },
  },
  topDetailTitle: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
      marginBottom: '4px',
    },
  },
  topDetailText: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },
}));

function IndustryTopDetail({ industryName, noOfQuestions, loading }) {
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <>
      {loading ? (
        <HeaderDetailsSkeleton numberOfStatusItem={0} hasImage={false} />
      ) : (
        <Box className={classes.topDetail}>
          <Typography variant="h1" className={classes.topDetailTitle}>
            {industryName}
          </Typography>
          <Typography
            variant="body3"
            className={classes.topDetailText}
          >{`${t('sales.industryVerticals.noOfQuestions')}: ${noOfQuestions}`}</Typography>
        </Box>
      )}
    </>
  );
}

IndustryTopDetail.propTypes = {
  industryName: PropTypes.string,
  noOfQuestions: PropTypes.number,
  loading: PropTypes.bool,
};

export default IndustryTopDetail;
