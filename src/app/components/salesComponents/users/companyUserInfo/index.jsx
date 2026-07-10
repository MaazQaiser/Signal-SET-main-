import { Skeleton } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import PropTypes from 'prop-types';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { formatCurrencyWithCommasAndSuffix } from 'src/utils/currencyFormater';
import { capitalizeFirstLetter } from 'src/utils/string/common';

import { useStyles } from './companyInfo';

const UserInfo = ({ info, loading }) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const NA = t('commonText.nA');

  // Helper function to render "NA" if the data is missing

  const getAddress = (userInfo) => {
    let str = '';

    const addComma = (str) => {
      return (str = str.length > 0 ? str + ', ' : str + ' ');
    };
    if (userInfo?.address?.addressLine1) str = str + userInfo?.address?.addressLine1;
    if (userInfo?.address?.addressLine2) str = str + userInfo?.address?.addressLine2;
    if (userInfo?.address?.city) {
      str = addComma(str);
      str = str + userInfo?.address?.city;
    }
    if (userInfo?.address?.state) {
      str = addComma(str);
      str = str + userInfo?.address?.state;
    }
    if (userInfo?.address?.country) {
      str = addComma(str);
      str = str + userInfo?.address?.country;
    }
    if (userInfo?.address?.postalCode) {
      str = addComma(str);
      str = str + userInfo?.address?.postalCode;
    }

    return str || NA;
  };
  return (
    <Box className={`${classes.accordianCards} ${classes.companyDetails}`}>
      <Box className={classes.companyDetailsWrapper}>
        <Box className={classes.companyAvatar}>
          <Box className={classes.cardAvatar}>
            <Avatar
              className={classes.compnayLogo}
              alt={info?.userInfo?.name}
              src={info?.userInfo?.image}
            />
          </Box>
          <Box className={classes.cardText}>
            {loading ? (
              <Skeleton variant="text" width={120} />
            ) : (
              <Typography variant="h3">
                {capitalizeFirstLetter(info?.userInfo?.name) || NA}
              </Typography>
            )}

            <Link className={classes.linkBtn}>
              {/*{t('sales.companies.phone')}*/}
              {loading ? (
                <Skeleton variant="text" width={60} sx={{ display: 'block', marginLeft: '8px' }} />
              ) : (
                <>{info?.userInfo?.role || NA}</>
              )}
            </Link>
          </Box>
        </Box>
        <Box>
          <Typography variant="body2" className={classes.companyInfotext}>
            {t('sales.users.detailsAddress')}: {getAddress(info?.userInfo)}
          </Typography>
        </Box>
      </Box>

      <Stack className={classes.companyTableWrapper}>
        <Box className={classes.companyFlex}>
          <Typography variant="body2" className={classes.companyLabel}>
            {t('sales.users.detailsEmail')}
          </Typography>
          <Typography variant="body2" className={classes.companyDetName}>
            {loading ? <Skeleton variant="text" width={120} /> : <>{info?.userInfo?.email || NA}</>}
          </Typography>
        </Box>
        <Box className={classes.companyFlex}>
          <Typography variant="body2" className={classes.companyLabel}>
            {t('sales.users.detailsPhoneNumber')}
          </Typography>
          <Typography variant="body2" className={classes.companyDetName}>
            {loading ? (
              <Skeleton variant="text" width={120} />
            ) : (
              <>{info?.userInfo?.phoneNumber || NA}</>
            )}
          </Typography>
        </Box>
        {/*<Box className={classes.companyFlex}>*/}
        {/*  <Typography variant="body2" className={classes.companyLabel}>*/}
        {/*    Gender*/}
        {/*  </Typography>*/}
        {/*  <Typography variant="body2" className={classes.companyDetName}>*/}
        {/*    {loading ? (*/}
        {/*      <Skeleton variant="text" width={120} />*/}
        {/*    ) : (*/}
        {/*      <> {info?.userInfo?.gender || NA}</>*/}
        {/*    )}*/}
        {/*  </Typography>*/}
        {/*</Box>*/}
        {/*<Box className={classes.companyFlex}>*/}
        {/*  <Typography variant="body2" className={classes.companyLabel}>*/}
        {/*    Skills*/}
        {/*  </Typography>*/}
        {/*  <Typography variant="body2" className={classes.companyDetName}>*/}
        {/*    {loading ? <Skeleton variant="text" width={120} /> : <> {info?.userInfo?.skill}</>}*/}
        {/*  </Typography>*/}
        {/*</Box>*/}
      </Stack>
      <Stack className={classes.companyTableWrapper}>
        <Box className={classes.companyFlex}>
          <Typography variant="body2" className={classes.companyLabel}>
            {t('sales.users.detailsAssignedLocations')}
          </Typography>
          <Typography variant="body2" className={classes.companyDetName}>
            {loading ? (
              <Skeleton variant="text" width={120} />
            ) : (
              <>{formatCurrencyWithCommasAndSuffix(info?.locations?.assigned) ?? NA}</>
            )}
          </Typography>
        </Box>
        <Box className={classes.companyFlex}>
          <Typography variant="body2" className={classes.companyLabel}>
            {t('sales.users.detailsVisitedLocations')}
          </Typography>
          <Typography variant="body2" className={classes.companyDetName}>
            {loading ? (
              <Skeleton variant="text" width={120} />
            ) : (
              <>{formatCurrencyWithCommasAndSuffix(info?.locations?.visited) ?? NA}</>
            )}
          </Typography>
        </Box>
        <Box className={classes.companyFlex}>
          <Typography variant="body2" className={classes.companyLabel}>
            {t('sales.users.detailsUnvisitedLocations')}
          </Typography>
          <Typography variant="body2" className={classes.companyDetName}>
            {loading ? (
              <Skeleton variant="text" width={120} />
            ) : (
              <>{formatCurrencyWithCommasAndSuffix(info?.locations?.unvisited) ?? NA}</>
            )}
          </Typography>
        </Box>
        <Box className={classes.companyFlex}>
          <Typography variant="body2" className={classes.companyLabel}>
            {t('sales.users.detailsDealsWon')}
          </Typography>
          <Typography variant="body2" className={classes.companyDetName}>
            {loading ? (
              <Skeleton variant="text" width={120} />
            ) : (
              <>{formatCurrencyWithCommasAndSuffix(info?.dealsStats?.won) ?? NA}</>
            )}
          </Typography>
        </Box>
        <Box className={classes.companyFlex}>
          <Typography variant="body2" className={classes.companyLabel}>
            {t('sales.users.detailsDealsLost')}
          </Typography>
          <Typography variant="body2" className={classes.companyDetName}>
            {loading ? (
              <Skeleton variant="text" width={120} />
            ) : (
              <>{formatCurrencyWithCommasAndSuffix(info?.dealsStats?.lost) ?? NA}</>
            )}
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
};

UserInfo.propTypes = {
  info: PropTypes.object,
  loading: PropTypes.bool,
};
export default UserInfo;
