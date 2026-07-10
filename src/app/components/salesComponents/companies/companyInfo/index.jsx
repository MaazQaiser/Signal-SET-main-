import { Skeleton, ToggleButton, ToggleButtonGroup } from '@mui/material';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import PropTypes from 'prop-types';
import * as React from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { ACL_COMPANIES_UPDATE } from 'src/app/router/constant/SALESMODULE';
import RenderIfHasPermission from 'src/hoc/renderIfHasPermission';
import { getDisplayConfiguration } from 'src/redux/store/slices/regionalCountryConfiguration';
import { defaultImage } from 'src/utils/constants';
import { formatISOTimestampToDate } from 'src/utils/date';
import capitalize from 'src/utils/string/capitalize';
import { capitalizeFirstLetter } from 'src/utils/string/common';

import CreateNewCompanyModal from '../../locations/createNewCompany';
import { useStyles } from './companyInfo';

const CompanyInfo = ({ info, loading, fetchCompany }) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const { dateFormat } = useSelector(getDisplayConfiguration);
  const NA = t('commonText.nA');
  const [openCompany, setOpenCompany] = useState(false);

  // Helper function to render "NA" if the data is missing
  const renderData = (data) => {
    return formatISOTimestampToDate(data, dateFormat) || NA;
  };

  return (
    <Box className={`${classes.accordianCards} ${classes.companyDetails}`}>
      <Box className={classes.companyDetailsWrapper}>
        <Box className={classes.companyHeaderDetails}>
          <Box className={classes.cardAvatar}>
            <img src={info?.image || defaultImage} className={classes.userImage} />
          </Box>
          <Box className={classes.cardText}>
            {loading ? (
              <Skeleton variant="text" width={120} />
            ) : (
              <Typography variant="h3">{capitalizeFirstLetter(info?.name) || NA}</Typography>
            )}

            <Link className={classes.linkBtn}>
              {t('sales.companies.phone')} {''}
              {loading ? (
                <Skeleton variant="text" width={60} sx={{ display: 'block', marginLeft: '8px' }} />
              ) : (
                <>{info?.phoneNumber || NA}</>
              )}
            </Link>
          </Box>
        </Box>
        <RenderIfHasPermission name={ACL_COMPANIES_UPDATE}>
          <Box className={classes.statesButtonsWrap}>
            {loading ? (
              <Skeleton variant="text" width={60} sx={{ display: 'block', marginLeft: '8px' }} />
            ) : (
              <ToggleButtonGroup variant="outlined" className={classes.statesButtons}>
                <ToggleButton className={`${classes.gropBtn}`} onClick={() => setOpenCompany(true)}>
                  {t('sales.locations.edit')}
                </ToggleButton>
              </ToggleButtonGroup>
            )}
          </Box>
        </RenderIfHasPermission>
      </Box>
      <Stack className={classes.companyTableWrapper}>
        <Box className={classes.companyFlex}>
          <Typography variant="body2" className={classes.companyLabel}>
            {t('sales.companies.industry')}
          </Typography>
          <Typography variant="body2" className={classes.companyDetName}>
            {loading ? (
              <Skeleton variant="text" width={120} />
            ) : (
              <>{capitalizeFirstLetter(info?.industry.label) || NA}</>
            )}
          </Typography>
        </Box>
        <Box className={classes.companyFlex}>
          <Typography variant="body2" className={classes.companyLabel}>
            {t('sales.companies.createDate')}
          </Typography>
          <Typography variant="body2" className={classes.companyDetName}>
            {loading ? (
              <Skeleton variant="text" width={120} />
            ) : (
              <>{renderData(info?.createDate)}</>
            )}
          </Typography>
        </Box>
        <Box className={classes.companyFlex}>
          <Typography variant="body2" className={classes.companyLabel}>
            {t('sales.companies.companyOwner')}
          </Typography>
          <Typography variant="body2" className={classes.companyDetName}>
            {loading ? (
              <Skeleton variant="text" width={120} />
            ) : (
              <> {capitalize(info?.ownerName) || NA}</>
            )}
          </Typography>
        </Box>
      </Stack>
      {openCompany && (
        <CreateNewCompanyModal
          company={info}
          openHandle={openCompany}
          closeHandle={() => setOpenCompany(false)}
          fetchCompanies={fetchCompany}
        />
      )}
    </Box>
  );
};

CompanyInfo.propTypes = {
  info: PropTypes.object,
  loading: PropTypes.bool,
  fetchCompany: PropTypes.func,
};
export default CompanyInfo;
