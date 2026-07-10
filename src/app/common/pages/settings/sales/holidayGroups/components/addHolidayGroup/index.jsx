import { Box, Button, Chip, Skeleton, TextField, Typography } from '@mui/material';
import { ReactComponent as DeleteIcon } from 'assets/svg/x-primary.svg';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CustomDropDown from 'src/app/components/common/customDropDown';
import ModalComponent from 'src/app/components/common/modal';
import RequiredAsterik from 'src/app/components/common/requiredAsterik';
import {
  createHolidayGroup,
  getGoogleHolidays,
  getHolidayGroupById,
  updateHolidayGroup,
} from 'src/services/holidays.service';
import transformArrayForOptions from 'src/utils/array/transformArrayForOptions';
import { toastSettings } from 'src/utils/constants';
import { toaster } from 'src/utils/toast';

import { useStyles } from './addHolidayGroup';
const params = {
  selectedHolidays: [],
  name: '',
};

const HolidayGroup = ({ open, onClose, fetchHolidayGroups, selectedHoliday }) => {
  const classes = useStyles();
  const [holidays, setHolidays] = useState([]);
  const [isLoadingHolidays, setIsLoadingHolidays] = useState(false);
  const [isLoadingHolidayGroup, setIsLoadingHolidayGroup] = useState(false);
  const [queryParams, setQueryParams] = useState(params);
  const [isSaving, setIsSaving] = useState(false);
  const [viewAll, setViewAll] = useState(false);

  const { t } = useTranslation();

  const fetchHolidays = async () => {
    setIsLoadingHolidays(true);
    try {
      const response = await getGoogleHolidays();
      if (response && response?.statusCode === 200) {
        setHolidays(transformArrayForOptions(response?.data, 'name', 'id' || []));
        setIsLoadingHolidays(false);
      }
    } catch (error) {
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setQueryParams((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const fetchHolidayGroup = async () => {
    setIsLoadingHolidayGroup(true);
    try {
      const response = await getHolidayGroupById(selectedHoliday?.id);
      if (response && response.statusCode === 200) {
        setQueryParams((prev) => ({
          ...prev,
          selectedHolidays: response?.data?.holidayGroup?.holidays?.map((holiday) => ({
            startDate: holiday?.start,
            endDate: holiday?.end,
            name: holiday?.name,
            id: holiday?.id,
            label: holiday?.name,
            value: String(holiday?.id),
          })),
          name: response?.data?.holidayGroup?.name,
        }));
      }
    } catch (error) {
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    } finally {
      setIsLoadingHolidayGroup(false);
    }
  };

  useEffect(() => {
    fetchHolidays();
    if (selectedHoliday?.id) fetchHolidayGroup();
  }, []);

  const isDisabled = () => {
    // Returning disabled true if the user has not selected any holiday, or group name, or saved is clicked
    return !queryParams?.selectedHolidays?.length || !queryParams?.name || isSaving;
  };

  const removeHolidaySelection = (holiday) => {
    setQueryParams((prev) => ({
      ...prev,
      selectedHolidays: prev.selectedHolidays.filter((h) => h.value !== holiday.value),
    }));
  };

  const handleSubmit = async () => {
    setIsSaving(true);
    if (isDisabled()) return;
    try {
      const payload = {
        name: queryParams?.name,
        holidayNames: queryParams?.selectedHolidays.map((holiday) => holiday?.name),
        holidayIds: queryParams?.selectedHolidays.map((holiday) => holiday?.id),
      };
      let response;
      if (selectedHoliday?.id) response = await updateHolidayGroup(selectedHoliday?.id, payload);
      else response = await createHolidayGroup(payload);

      if (response && response.statusCode === 200) {
        toaster.success({
          text: response?.message,
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
        onClose();
        fetchHolidayGroups();
      }
    } catch (error) {
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const addHolidayGroupBody = (
    <Box className={classes.mainWrapper}>
      <Box className={classes.editModalHeader}>
        <Typography variant="h3" className={classes.editModalTitle}>
          {`${
            !selectedHoliday?.id
              ? `${t('obx.settings.preferences.holidayGroups.add')} ${t('obx.settings.preferences.holidayGroups.groupName')}`
              : `${t('obx.settings.preferences.holidayGroups.edit')} ${t('obx.settings.preferences.holidayGroups.groupName')}`
          }`}
        </Typography>
      </Box>
      <Box className={classes.grayWrapper}>
        <Box className={classes.selectWrapper}>
          <Typography variant="h4" className={classes.label}>
            {t('obx.settings.preferences.holidayGroups.groupName')}
            {<RequiredAsterik />}
          </Typography>
          <TextField
            value={queryParams?.name || ''}
            onChange={(e) => handleChange(e)}
            name={'name'}
            placeholder={t('obx.settings.preferences.holidayGroups.addGroupName')}
            className={classes.SelectGroup}
          />
        </Box>
      </Box>
      <Box className={classes.grayWrapper}>
        <Box className={classes.selectWrapper}>
          <Typography variant="h4" className={classes.label}>
            {t('obx.settings.preferences.holidayGroups.selectHolidays')}
            {<RequiredAsterik />}
          </Typography>
          {isLoadingHolidays ? (
            <Skeleton className={classes.dropDownSkeleton} />
          ) : (
            <CustomDropDown
              label={`${t('Select')}`}
              options={holidays}
              selectedValues={queryParams?.selectedHolidays || []}
              handleChange={(e) => handleChange(e)}
              name={'selectedHolidays'}
              multiSelect
              checkmark
              searchable
              isError={false}
              disabled={false}
              bordered={true}
              maxWidth="616px"
              className={classes.SelectGroup}
            />
          )}
        </Box>
        <Box className={classes.chipsWrapper}>
          {isLoadingHolidayGroup ? (
            <Box display="flex" gap={1}>
              <Skeleton variant="rounded" width={100} height={24} />
              <Skeleton variant="rounded" width={80} height={24} />
              <Skeleton variant="rounded" width={120} height={24} />
            </Box>
          ) : (
            <>
              {queryParams?.selectedHolidays?.length
                ? [
                    ...(viewAll
                      ? queryParams.selectedHolidays
                      : queryParams.selectedHolidays.slice(0, 3)),
                  ]?.map((holiday) => {
                    return (
                      <Chip
                        key={holiday?.value}
                        label={holiday?.name}
                        size="small"
                        color="primary"
                        onDelete={() => removeHolidaySelection(holiday)}
                        deleteIcon={<DeleteIcon />}
                      />
                    );
                  })
                : null}
              {queryParams?.selectedHolidays?.length > 3 && !viewAll ? (
                <Chip
                  label={`View All (${queryParams?.selectedHolidays?.length})`}
                  size="small"
                  color="primary"
                  variant="filled-primary"
                  className={classes.blueChip}
                  onClick={() => setViewAll(true)}
                />
              ) : null}
              {viewAll ? (
                <Chip
                  label="View less"
                  size="small"
                  color="primary"
                  variant="filled-primary"
                  className={classes.blueChip}
                  onClick={() => setViewAll(false)}
                />
              ) : null}
            </>
          )}
        </Box>
      </Box>

      <Box className={classes.footerWrapper}>
        <Button variant="secondaryGrey" disableRipple onClick={onClose}>
          {t('obx.settings.preferences.holidayGroups.cancel')}
        </Button>
        <Button variant="primary" disableRipple onClick={handleSubmit} disabled={isDisabled()}>
          {selectedHoliday?.id
            ? t('obx.settings.preferences.holidayGroups.updateGroup')
            : t('obx.settings.preferences.holidayGroups.createGroup')}
        </Button>
      </Box>
    </Box>
  );

  return <ModalComponent open={open} body={addHolidayGroupBody} />;
};
export default HolidayGroup;

HolidayGroup.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  fetchHolidayGroups: PropTypes.func,
  selectedHoliday: PropTypes.object,
};
