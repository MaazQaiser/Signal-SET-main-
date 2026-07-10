import { Drawer, Skeleton } from '@mui/material';
import { ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import PropTypes from 'prop-types';
import * as React from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import CreateContractDrawer from 'salesPages/contacts/listing/createContractDrawer';
import { ACL_CONTACTS_UPDATE } from 'src/app/router/constant/SALESMODULE';
import RenderIfHasPermission from 'src/hoc/renderIfHasPermission';
import { getDisplayConfiguration } from 'src/redux/store/slices/regionalCountryConfiguration';
import { formatISOTimestampToDate } from 'src/utils/date';
import { capitalizeFirstLetter } from 'src/utils/string/common';

import { useStyles } from './contactInfo';

const ContactInfo = ({ info, loading, refresh }) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const { dateFormat } = useSelector(getDisplayConfiguration);
  const NA = t('commonText.nA');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setIsDrawerOpen(open);
  };
  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
  };

  // Helper function to render "NA" if the data is missing
  const renderData = (data) => {
    return formatISOTimestampToDate(data, dateFormat) || NA;
  };

  return (
    <Box className={`${classes.accordianCards} ${classes.companyDetails}`}>
      <Box className={classes.companyDetailsWrapper}>
        <Box className={classes.cardInternalBox}>
          <Box className={classes.cardAvatar}>
            <Avatar className={classes.compnayLogo} alt={info?.name} src={info?.image} />
          </Box>
          <Box className={classes.cardText}>
            {loading ? (
              <Skeleton variant="text" width={120} />
            ) : (
              <Typography variant="h3">{capitalizeFirstLetter(info?.fullName) || NA}</Typography>
            )}

            <Link className={classes.linkBtn}>
              {t('sales.companies.phone')} {''}
              {loading ? (
                <Skeleton variant="text" width={60} sx={{ display: 'block', marginLeft: '8px' }} />
              ) : (
                <>{info?.phone || NA}</>
              )}
            </Link>
          </Box>
        </Box>
        <Box className={classes.statesButtonsWrap}>
          {loading ? (
            <Skeleton variant="text" width={60} sx={{ display: 'block', marginLeft: '8px' }} />
          ) : (
            <ToggleButtonGroup variant="outlined" className={classes.statesButtons}>
              {/*
               * edit and delete will be used later
               */}
              {/* <ToggleButton
                onClick={toggleDrawerLocation(locationDrawerTypes.RIGHT, true)}
                className={`${classes.firstButton}  ${classes.gropBtn}`}
              >
                {t('sales.locations.edit')}
              </ToggleButton>
              <Drawer
                anchor={locationDrawerTypes.RIGHT}
                open={locationState[locationDrawerTypes.RIGHT]}
                onClose={toggleDrawerLocation(locationDrawerTypes.RIGHT, false)}
              >
                <NewLocationDrawer
                  anchor={locationDrawerTypes.RIGHT}
                  locationCloseDrawer={locationCloseDrawer}
                  width={796}
                  companies={companies}
                  editLocationData={getEditLocationData(data)}
                  onSuccess={fetchLocation}
                />
              </Drawer>
              <ToggleButton
                onClick={handleChangeCofirmationModal}
                className={`${classes.centerBtn}  ${classes.gropBtn}`}
              >
                {t('sales.locations.delete')}
              </ToggleButton>
              <Box className={classes.sweetAlertWrapper}>
                <SweetAlertModal
                  type="warning"
                  title={t('commonText.modal.leadDelete.deleteNote')}
                  text={t('commonText.modal.leadDelete.deleteMessage')}
                  confirmButtonText={t('buttons.yes')}
                  cancelButtonText={t('buttons.no')}
                  show={confirmationModal}
                  handleConfirmButton={onConfirm}
                  handleCancelButton={handleChangeCofirmationModal}
                  icon={<DeleteAlter />}
                />
              </Box> */}
              {/*Contact can be edited irrespective of the Location qualification*/}
              <RenderIfHasPermission name={ACL_CONTACTS_UPDATE}>
                <ToggleButton
                  className={`${classes.centerBtn}  ${classes.gropBtn}`}
                  value=""
                  onClick={toggleDrawer(true)}
                >
                  {t('sales.companies.edit')}
                </ToggleButton>
              </RenderIfHasPermission>
              {/*<ToggleButton*/}
              {/*  //   onClick={handleOpenConvert}*/}
              {/*  className={`${!notQualified ? classes.lastButton : ''}  ${classes.gropBtn}`}*/}
              {/*  value=""*/}
              {/*>*/}
              {/*  Delete*/}
              {/*</ToggleButton>*/}
            </ToggleButtonGroup>
          )}
        </Box>
      </Box>
      <Stack className={classes.companyTableWrapper}>
        <Box className={classes.companyFlex}>
          <Typography variant="body2" className={classes.companyLabel}>
            {t('sales.companies.recordID')}
          </Typography>
          <Typography variant="body2" className={classes.companyDetName}>
            {loading ? <Skeleton variant="text" width={120} /> : <>{info?.hsId || NA}</>}
          </Typography>
        </Box>
        <Box className={classes.companyFlex}>
          <Typography variant="body2" className={classes.companyLabel}>
            {t('sales.companies.lastActivityDate')}
          </Typography>
          <Typography variant="body2" className={classes.companyDetName}>
            {loading ? (
              <Skeleton variant="text" width={120} />
            ) : (
              <>{renderData(info?.lastActivityDate)}</>
            )}
          </Typography>
        </Box>
      </Stack>

      <Drawer anchor="right" open={isDrawerOpen}>
        <CreateContractDrawer
          creationCloseDrawer={handleCloseDrawer}
          width={796}
          contactData={info}
          refresh={refresh}
        />
      </Drawer>
    </Box>
  );
};

ContactInfo.propTypes = {
  info: PropTypes.object,
  loading: PropTypes.bool,
  refresh: PropTypes.func,
};
export default ContactInfo;
