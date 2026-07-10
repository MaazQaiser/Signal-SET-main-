import { Button, Skeleton, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { Clossicon } from 'src/assets/svg';
import { getDisplayConfiguration } from 'src/redux/store/slices/regionalCountryConfiguration';
import { getHolidayGroupById } from 'src/services/holidays.service';
import { toastSettings } from 'src/utils/constants';
import capitalize from 'src/utils/string/capitalize';
import { toaster } from 'src/utils/toast';

import { useStyles } from './holidaysDetails';

const HolidayDetails = ({ setShowDrawer, selectedHoliday }) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const { dateFormat } = useSelector(getDisplayConfiguration);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  const closeDrawer = () => {
    setShowDrawer(false);
  };
  const fetchHolidayGroup = async () => {
    try {
      const response = await getHolidayGroupById(selectedHoliday?.id);
      if (response && response.statusCode === 200) {
        setData((prev) => ({
          ...prev,
          holidays: response?.data?.holidays?.map((holiday) => ({
            startDate: holiday?.start,
            endDate: holiday?.end,
            name: holiday?.name,
            id: holiday?.id,
            label: holiday?.name,
            value: String(holiday?.id),
          })),
          name: response?.data?.name,
        }));
      }
    } catch (error) {
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedHoliday?.id) {
      setLoading(true);
      fetchHolidayGroup();
    }
  }, []);

  return (
    <Box className={classes.activityDrawer}>
      <Box className={classes.drawerHeader}>
        <Box className={classes.drawerHeaderTop}>
          <Box className={classes.headText}>
            <Typography variant="h3">{capitalize(selectedHoliday?.groupName)}</Typography>
            <Typography variant="body1">
              {t('obx.settings.preferences.holidayGroups.federalHolidaysSubText')}
            </Typography>
          </Box>

          <Box className={classes.inlineFlex}>
            <Button
              className={classes.cancelIcon}
              disableRipple
              variant="onlyText"
              onClick={() => {
                closeDrawer();
              }}
            >
              <Clossicon />
            </Button>
          </Box>
        </Box>

        <Box className={classes.holidayWrapIn}>
          <Typography variant="h4">
            Group Holidays {`(${selectedHoliday?.numberOfHolidays})`}
          </Typography>
          <Box className={classes.loopHoliday}>
            {loading ? (
              <>
                {[1, 2, 3].map((item) => (
                  <Box key={item} className={classes.daysDetailsHol}>
                    <Skeleton
                      variant="text"
                      width="60%"
                      height={28}
                      style={{ marginBottom: '8px' }}
                    />
                    <Skeleton variant="text" width="80%" height={24} />
                  </Box>
                ))}
              </>
            ) : (
              data?.holidays?.map((holiday) => (
                <Box key={holiday.id} className={classes.daysDetailsHol}>
                  <Typography variant="subtitle1">{holiday?.name}</Typography>
                  <Typography variant="body3">
                    {/* Using dayjs object directly because it is not timezone oriented date*/}
                    {dayjs(holiday?.startDate).format(dateFormat)} -{' '}
                    {dayjs(holiday?.endDate)?.format(dateFormat)}
                  </Typography>
                </Box>
              ))
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
HolidayDetails.propTypes = {
  setShowDrawer: PropTypes.func,
  patrolTemplateId: PropTypes.number,
  selectedHoliday: PropTypes.object,
  handleDelete: PropTypes.func,
  goToHolidayGroup: PropTypes.func,
};
export default HolidayDetails;
