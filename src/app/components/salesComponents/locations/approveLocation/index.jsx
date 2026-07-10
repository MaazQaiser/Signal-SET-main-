import { Box, Button, Stack, Typography } from '@mui/material';
import LoaderComponent from 'commonComponents/loader';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { ACL_PROPERTY_REVIEW_UPDATE } from 'src/app/router/constant/SALESMODULE.jsx';
import { updateLocation } from 'src/services/location.service.js';
import userHasPermission from 'src/utils/auth/userHasPermission.jsx';
import { toastSettings } from 'src/utils/constants/index.js';

import DrawerFooter from '../../components/drawerFooter/index.jsx';
import DrawerHeader from '../../components/drawerHeader/index.jsx';
import { useStyles } from './approveLocation.js';

const ApproveLocationDrawer = ({
  anchor,
  approveLocationCloseDrawer,
  width,
  locationData,
  refetchLocations,
  isApproveableAndRejectable,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const [isUpdatingLocation, setIsUpdatingLocation] = useState(false);
  const NA = t('commonText.nA');
  const getDisplayText = (val) => {
    if (val == null || val === '') return '';
    if (typeof val === 'object') return val?.label ?? '';
    return String(val);
  };

  const handleLocationUpdate = async (isApproveFlow) => {
    try {
      setIsUpdatingLocation(true);
      const payload = {
        status: isApproveFlow ? 'approved' : 'rejected',
      };

      const apiResponse = await updateLocation(locationData?.id, payload);

      if (apiResponse.statusCode === 200) {
        toast.success(apiResponse.message, {
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
        /**
         * close the side drawer after successful response
         */
        refetchLocations();
        approveLocationCloseDrawer(anchor);
      }
    } catch (error) {
      /**
       * show error
       */
      toast.error(error?.message, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    } finally {
      setIsUpdatingLocation(false);
    }
  };

  const handleApproveLocation = async (e) => {
    e.preventDefault();
    handleLocationUpdate(true);
  };

  const handleRejectLocation = async (e) => {
    e.preventDefault();
    handleLocationUpdate(false);
  };

  const isAllowed = userHasPermission(ACL_PROPERTY_REVIEW_UPDATE);

  return (
    <>
      {isUpdatingLocation && <LoaderComponent label={t('sales.loading')} />}
      <Box
        className={classes.sideBarBox}
        sx={{ width: anchor === 'top' || anchor === 'bottom' ? 'auto' : width }}
        role="presentation"
        component="form"
      >
        <Stack className={classes.boxinner} justifyContent="space-between">
          <Box className={classes.sideheader}>
            {isApproveableAndRejectable ? (
              <DrawerHeader
                title={t('sales.locations.approveLocation')}
                subtext={t('sales.locations.approveText')}
                handleCloseDrawer={approveLocationCloseDrawer}
                anchor={anchor}
              />
            ) : (
              <DrawerHeader
                title={t('sales.locations.rejectLocation')}
                subtext={t('sales.locations.rejectText')}
                handleCloseDrawer={approveLocationCloseDrawer}
                anchor={anchor}
              />
            )}
            <Box className={classes.approveTextBox}>
              <Typography variant="h5">{t('sales.locations.companyAccount')}</Typography>
              <Box className={classes.companyFlex}>
                <Box className={classes.cLabel}>{t('sales.locations.name')}</Box>
                <Box className={classes.compDetName}>{locationData?.companyName || NA}</Box>
              </Box>
              <Box className={classes.companyFlex}>
                <Box className={classes.cLabel}>{t('sales.locations.propertyName')}</Box>
                <Box className={classes.compDetName}>{locationData?.locationName || NA}</Box>
              </Box>
              <Box className={classes.companyFlex}>
                <Box className={classes.cLabel}>{t('sales.locations.locationSource')}</Box>
                <Box className={classes.compDetName}>
                  {getDisplayText(locationData?.type) || NA}
                </Box>
              </Box>
              <Box className={classes.companyFlex}>
                <Box className={classes.cLabel}>{t('sales.locations.associatedFranchise')}</Box>
                <Box className={classes.compDetName}>{locationData?.franchiseName || NA}</Box>
              </Box>
            </Box>

            <Box className={classes.approveTextBox}>
              <Typography variant="h5">{t('sales.locations.assignedUserName')}</Typography>
              <Box className={classes.companyFlex}>
                <Box className={classes.cLabel}>{t('sales.locations.name')}</Box>
                <Box className={classes.compDetName}>{locationData?.assignedUserName || NA}</Box>
              </Box>
            </Box>
            <Box className={classes.approveTextBox}>
              <Typography variant="h5">{t('sales.locations.contactDetails')}</Typography>
              <Box className={classes.companyFlex}>
                <Box className={classes.cLabel}>{t('sales.locations.name')}</Box>
                <Box className={classes.compDetName}>{locationData?.contact?.fullName || NA}</Box>
              </Box>
            </Box>
            <Box className={classes.approveTextBox}>
              <Typography variant="h5">{t('sales.locations.address')}</Typography>
              <Box className={classes.companyFlex}>
                <Box className={classes.cLabel}>{t('sales.locations.streetAddress')}</Box>
                <Box className={classes.compDetName}>{locationData?.address || NA}</Box>
              </Box>
              <Box className={classes.companyFlex}>
                <Box className={classes.cLabel}>{t('sales.locations.city')}</Box>
                <Box className={classes.compDetName}>{locationData?.city || NA}</Box>
              </Box>
              <Box className={classes.companyFlex}>
                <Box className={classes.cLabel}>{t('sales.locations.state')}</Box>
                <Box className={classes.compDetName}>{locationData?.state || NA}</Box>
              </Box>
              <Box className={classes.companyFlex}>
                <Box className={classes.cLabel}>{t('sales.locations.postalCode')}</Box>
                <Box className={classes.compDetName}>{locationData?.postalCode || NA}</Box>
              </Box>
            </Box>
          </Box>
          {isApproveableAndRejectable && isAllowed ? (
            <DrawerFooter
              bulkApply={t('sales.locations.approve')}
              bulkCancel={t('sales.locations.reject')}
              anchor={anchor}
              disabled={isUpdatingLocation}
              onSubmit={handleApproveLocation}
              isDoubleActionButton={true}
              disabled2={isUpdatingLocation}
              onSubmit2={handleRejectLocation}
              type="submit"
            />
          ) : (
            <Box className={classes.sideFooter}>
              <Button variant="primary" onClick={() => approveLocationCloseDrawer(anchor)}>
                {t('sales.locations.close')}
              </Button>
            </Box>
          )}
        </Stack>
      </Box>
    </>
  );
};

ApproveLocationDrawer.propTypes = {
  anchor: PropTypes.string,
  approveLocationCloseDrawer: PropTypes.func,
  width: PropTypes.number,
  locationData: PropTypes.object, // Adjust the type accordingly based on the expected data structure
  refetchLocations: PropTypes.func,
  isApproveableAndRejectable: PropTypes.bool,
};

export default ApproveLocationDrawer;
