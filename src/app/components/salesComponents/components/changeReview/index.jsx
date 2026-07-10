import { Avatar, Box, Stack, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { ReactComponent as ArrowNextIcon } from 'src/assets/svg/arrowNext.svg';
import { formatDate } from 'src/helper/utilityFunctions.js';
import { getDisplayConfiguration } from 'src/redux/store/slices/regionalCountryConfiguration/index.js';

import DrawerHeader from '../drawerHeader/index.jsx';
import { useStyles } from './changeReview.js';

const PROPERTY_FIELD_KEYS = [
  'locationName',
  'source',
  'franchiseName',
  'level',
  'assignedToName',
  'assignedToSupervisorName',
  'referredByPropertyName',
  'referredByContactName',
  'stage',
  'numberOfUnits',
  'occupancyRate',
  'averageRent',
  'annualRevenue',
  'squareFootageOfBuilding',
  'parkingSpaces',
  'tenancy',
  'amenities',
  'numberOfBuildings',
  'buildingClass',
];

const COMPANY_FIELD_KEYS = [
  'name',
  'companyDomain',
  'industry',
  'numberOfEmployees',
  'revenue',
  'address',
  'subVertical',
  'naicsCodes',
  'numberOfLocations',
  'foundedYear',
  'strategicPartnershipStatus',
];

const CONTACT_FIELD_KEYS = ['firstname', 'lastname', 'jobtitle', 'email', 'phone', 'cellNumber'];

const fieldKey = (parent, value) =>
  `sales.changeReview.${parent.charAt(0).toLowerCase()}${parent.slice(1)}${value.charAt(0).toUpperCase()}${value.slice(1)}`;

const getPropertyFields = (t) =>
  PROPERTY_FIELD_KEYS.map((value) => ({
    label: t(fieldKey('Property', value)),
    value,
  }));

const getCompanyFields = (t) =>
  COMPANY_FIELD_KEYS.map((value) => ({
    label: t(fieldKey('Company', value)),
    value,
  }));

const getContactFields = (t) =>
  CONTACT_FIELD_KEYS.map((value) => ({
    label: t(fieldKey('Contact', value)),
    value,
  }));

const getFieldsMap = (t) => ({
  property: getPropertyFields(t),
  company: getCompanyFields(t),
  contact: getContactFields(t),
});

const getDetailsTitle = (type, t) => t(`sales.changeReview.${type}Details`);

const ChangeReviewDrawer = ({ anchor, onCloseDrawer, width, data, type }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { dateFormat } = useSelector(getDisplayConfiguration);
  const NA = t('commonText.nA');
  const fieldsMap = useMemo(() => getFieldsMap(t), [t]);

  const changeRequests = useMemo(() => data?.changeRequests || [], [data]);
  const getDisplayText = (val) => {
    if (val == null || val === '') return NA;
    if (typeof val === 'object') return val?.label ?? NA; // stage/type now come as {label,value}
    return String(val);
  };

  const changeRequestsHistory = useMemo(() => {
    return changeRequests.map((request) => {
      const changesProposed = request?.changesProposed || {};
      return {
        createdAt: request.createdAt,
        changedByName: request.changedByName,
        changedByUserImage: request.changedByUserImage,
        newFields: (fieldsMap[type] || [])
          .filter((field) => changesProposed[field.value])
          .map((field) => {
            return {
              ...field,
              old: changesProposed[field.value].old,
              new: changesProposed[field.value].new,
            };
          }),
      };
    });
  }, [data, type, fieldsMap]);

  return (
    <>
      <Box
        className={classes.sideBarBox}
        sx={{ width: anchor === 'top' || anchor === 'bottom' ? 'auto' : width }}
        role="presentation"
        component="form"
      >
        <Stack className={classes.boxinner} justifyContent="space-between">
          <Box className={classes.sideheader}>
            <DrawerHeader
              title={t('sales.changeReview.title')}
              subtext={t('sales.changeReview.description', { type })}
              handleCloseDrawer={onCloseDrawer}
              anchor={anchor}
            />
            <Box className={classes.wrapper}>
              {changeRequestsHistory.map(
                ({ newFields, createdAt, changedByName, changedByUserImage }, index) => {
                  return (
                    <Box key={index} className={classes.box}>
                      <Box className={classes.ServicesBox}>
                        <Box className={classes.serviceBoxTitle}>
                          <Typography variant="subtitle2" className={classes.servicesubTitle}>
                            {getDetailsTitle(type, t)}
                          </Typography>
                          <Box className={classes.editByWrapper}>
                            <Typography className={classes.editByLabel}>
                              {t('sales.locations.editedBy')}
                            </Typography>
                            <Avatar
                              className={classes.editByAvatar}
                              alt={changedByName}
                              src={changedByUserImage}
                            />
                            <Typography className={classes.userLabel}>
                              {changedByName || NA}
                            </Typography>
                            <Typography className={classes.editByLabel}>
                              {t('sales.changeReview.at')}
                            </Typography>
                            <Typography className={classes.userLabel}>
                              {formatDate(createdAt, `${dateFormat} HH:mm:ss`)}
                            </Typography>
                          </Box>
                        </Box>
                        {newFields.map((field, index) => {
                          return (
                            <Box className={classes.serviceListItem} key={index}>
                              <>
                                <Typography variant="subtitle2" className={classes.serviceName}>
                                  {field.label}
                                </Typography>
                                <Box className={classes.valueBox}>
                                  {field.old && (
                                    <>
                                      <Typography
                                        variant="body2"
                                        className={classes.minValue}
                                        sx={{ textDecoration: 'line-through' }}
                                      >
                                        {getDisplayText(field.old)}
                                      </Typography>
                                      <ArrowNextIcon />
                                    </>
                                  )}
                                  <Typography variant="body2" className={classes.maxValue}>
                                    {getDisplayText(field.new)}
                                  </Typography>
                                </Box>
                              </>
                            </Box>
                          );
                        })}
                      </Box>
                    </Box>
                  );
                },
              )}
            </Box>
          </Box>
        </Stack>
      </Box>
    </>
  );
};

ChangeReviewDrawer.propTypes = {
  type: PropTypes.string,
  anchor: PropTypes.string,
  onCloseDrawer: PropTypes.func,
  width: PropTypes.number,
  data: PropTypes.object,
  refetch: PropTypes.func,
  isApproveableAndRejectable: PropTypes.bool,
};

export default ChangeReviewDrawer;
