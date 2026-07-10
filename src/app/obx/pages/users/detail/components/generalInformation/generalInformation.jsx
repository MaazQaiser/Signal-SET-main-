import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { ReactComponent as EditIcon } from 'assets/icons/editPencilIcon.svg';
import PropTypes from 'prop-types';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import InfoCardSkeleton from 'src/app/components/common/skeletonLoader/infoCardSkeleton';
import * as routes from 'src/app/router/constant/ROUTE';
import { rolesEnum } from 'src/utils/constants';
import { capitalizeFirstLetter } from 'src/utils/string/common';

import { useStyles } from './generalInfoStyles';
const GeneralInformation = ({ data, loading, id }) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const NA = t('commonText.nA');
  const userRole = useSelector((state) => state.auth.userRole);
  const usersInformation = (
    <>
      <CardContent className={classes.cardContainer} sx={{ padding: '0px !important' }}>
        <Box className={classes.cardFlexContent}>
          <Typography variant="subtitle1" className={classes.cardHeading}>
            {t('obx.users.userInformation.title')}
          </Typography>
          <Link to={`${routes.OBX_USERS_FORM_INFORMATION}/${id}`}>
            <EditIcon className={classes.editIcon} />
          </Link>
        </Box>
        {loading ? (
          <Box className={classes.skeletonWrapperCard}>
            <InfoCardSkeleton noOfRows={4} />
          </Box>
        ) : (
          <Box className={classes.informationCard}>
            <Box className={classes.mainContent}>
              <Box className={classes.contentDetail}>
                <Typography variant="body3" className={classes.columnHeading}>
                  {t('obx.users.userInformation.firstName')}
                </Typography>
                <Typography variant="subtitle2" className={classes.columnDetail}>
                  {capitalizeFirstLetter(data?.firstName) || NA}
                </Typography>
              </Box>
              <Box className={classes.contentDetail}>
                <Typography variant="body3" className={classes.columnHeading}>
                  {t('obx.users.userInformation.lastName')}
                </Typography>
                <Typography variant="subtitle2" className={classes.columnDetail}>
                  {capitalizeFirstLetter(data?.lastName) || NA}
                </Typography>
              </Box>
              <Box className={classes.contentDetail}>
                <Typography variant="body3" className={classes.columnHeading}>
                  {t('obx.users.userInformation.email')}
                </Typography>
                <Typography variant="subtitle2" className={classes.columnDetail}>
                  {data?.email || NA}
                </Typography>
              </Box>
            </Box>
            <Box className={classes.mainContent}>
              {/* will use in future */}
              {/* <Box className={classes.contentDetail}>
                <Typography variant="body3" className={classes.columnHeading}>
                  {t('obx.users.userInformation.gender')}
                </Typography>
                <Typography variant="subtitle2" className={classes.columnDetail}>
                  {data?.gender || NA}
                </Typography>
              </Box> */}
              <Box className={classes.contentDetail}>
                <Typography variant="body3" className={classes.columnHeading}>
                  {t('obx.users.userInformation.number')}
                </Typography>
                <Typography variant="subtitle2" className={classes.columnDetail}>
                  {data?.phoneNumber || NA}
                </Typography>
              </Box>
            </Box>
          </Box>
        )}
      </CardContent>
    </>
  );

  const jobDetails = (
    <CardContent className={classes.cardContainer} sx={{ padding: '0px !important' }}>
      <Box className={classes.cardFlexContent}>
        <Box>
          <Typography variant="subtitle1" className={classes.cardHeading}>
            {t('obx.users.userInformation.jobDetails')}
          </Typography>
        </Box>
      </Box>
      {loading ? (
        <Box className={classes.skeletonWrapperCard}>
          <InfoCardSkeleton noOfRows={4} />
        </Box>
      ) : (
        <Box className={classes.informationCard}>
          <Box className={classes.mainContent}>
            <Box className={classes.contentDetail}>
              <Typography variant="body3" className={classes.columnHeading}>
                {t('obx.users.userInformation.designation')}
              </Typography>
              <Typography variant="subtitle2" className={classes.columnDetail}>
                {data?.designation || NA}
              </Typography>
            </Box>
            <Box className={classes.contentDetail}>
              <Typography variant="body3" className={classes.columnHeading}>
                {t('obx.users.userInformation.role')}
              </Typography>
              <Typography variant="subtitle2" className={classes.columnDetail}>
                {data?.role || NA}
              </Typography>
            </Box>
            <Box className={classes.contentDetail}>
              <Typography variant="body3" className={classes.columnHeading}>
                {t('obx.users.userInformation.skill')}
              </Typography>
              <Typography variant="subtitle2" className={classes.columnDetail}>
                {data?.skill || NA}
              </Typography>
            </Box>
          </Box>
          <Box className={classes.mainContent}>
            <Box className={classes.contentDetail}>
              <Typography variant="body3" className={classes.columnHeading}>
                {t('obx.users.userInformation.site')}
              </Typography>
              <Typography variant="subtitle2" className={classes.columnDetail}>
                {data?.site || NA}
              </Typography>
            </Box>

            {rolesEnum.supervisor !== userRole?.slug && (
              <Box className={classes.contentDetail}>
                <Typography variant="body3" className={classes.columnHeading}>
                  {t('obx.users.userInformation.baseRate')}
                </Typography>
                <Typography variant="subtitle2" className={classes.columnDetail}>
                  {data?.perHourRate || NA}
                </Typography>
              </Box>
            )}
            {rolesEnum.supervisor !== userRole?.slug && (
              <Box className={classes.contentDetail}>
                <Typography variant="body3" className={classes.columnHeading}>
                  {t('obx.users.userInformation.type')}
                </Typography>
                <Typography variant="subtitle2" className={classes.columnDetail}>
                  {data?.employeeType || NA}
                </Typography>
              </Box>
            )}

            {data?.zones?.map((a, index) => {
              const zoneCount = index + 1;
              return (
                <Box key={index} className={classes.contentDetail}>
                  <Typography variant="body3" className={classes.columnHeading}>
                    {t('obx.users.userInformation.zone')} {zoneCount}
                  </Typography>
                  <Typography variant="subtitle2" className={classes.columnDetail}>
                    {a?.name || NA}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </Box>
      )}
    </CardContent>
  );
  return (
    <>
      <Box className={classes.mainBoxSection}>
        <Box className={classes.internalBoxWrapper}>
          <Card className={classes.cardContentLeft}>{usersInformation}</Card>
        </Box>

        <Box className={classes.internalBoxWrapper}>
          <Card className={classes.cardContentRight}>{jobDetails}</Card>
        </Box>
      </Box>
    </>
  );
};

GeneralInformation.propTypes = {
  data: PropTypes.object,
  loading: PropTypes.bool,
  id: PropTypes.string,
};

export default GeneralInformation;
