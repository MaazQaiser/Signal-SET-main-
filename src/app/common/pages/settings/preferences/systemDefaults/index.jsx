import { Box, Button, Typography } from '@mui/material';
import LoaderComponent from 'commonComponents/loader';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import {
  fetchSettingsPreferences,
  fetchSettingsPreferencesConfig,
  updateSettings,
} from 'services/settings.services';
import SystemDefaultsRow from 'src/app/common/pages/settings/preferences/systemDefaults/component/SystemDefaultsRow';
import { getErrorKey, removeKey } from 'src/helper/utilityFunctions';
import useFormHook from 'src/hooks/useFormHook';
import { toastSettings } from 'src/utils/constants';
import formValidatorJoi from 'src/utils/formValidator/formValidator.requiredCheck';

import { useStyles } from '../settingsStyle';

const enumData = {
  max_shift_duration: {
    label: 'maxShiftDuration',
    value: 'timeValue',
  },
  holiday_peak_factor: {
    label: 'peakRates',
    value: 'value',
  },
};

const SystemDefaults = () => {
  const { t } = useTranslation();

  const classes = useStyles();

  const { formData, setFormData, updateFormHandler, errorMessages, setErrorMessages } = useFormHook(
    {
      defaultFormData: {
        devices: [],
        shifts: [],
        autoClockOut: [],
        officerAvaliability: [],
        supervisorAvaliability: [],
        emailAutomation: [],
      },
    },
  );

  const [loading, setLoading] = useState(false);

  const createPayload = () => {
    let preferences = [];

    formData?.devices?.map((a) => {
      if (a.rateValue)
        preferences = [
          ...preferences,
          {
            id: a.id,
            rateValue: a.rateValue,
          },
        ];
    });

    formData?.autoClockOut?.map((a) => {
      if (a.timeValue)
        preferences = [
          ...preferences,
          {
            id: a.id,
            timeValue: a.timeValue,
          },
        ];
    });
    formData?.supervisorAvaliability?.map((a) => {
      if (a.time)
        preferences = [
          ...preferences,
          {
            id: a.id,
            time: a.time,
          },
        ];
    });

    formData?.officerAvaliability?.map((a) => {
      if (a.time)
        preferences = [
          ...preferences,
          {
            id: a.id,
            time: a.time,
          },
        ];
    });

    formData?.emailAutomation?.map((a) => {
      if (a.time)
        preferences = [
          ...preferences,
          {
            id: a.id,
            time: a.time,
          },
        ];
    });

    formData?.shifts?.map((a) => {
      const optionsVal = enumData[a?.oldSlug]?.value;

      if (a?.value) {
        preferences = [
          ...preferences,
          {
            id: a.id,
            [optionsVal]: a?.value,
          },
        ];
      }
    });

    return preferences;
  };

  const updateRunSheet = async () => {
    try {
      const validatePayload = {
        devices: formData?.devices,
        shifts: formData?.shifts,
        officerAvaliability: formData?.officerAvaliability,
        supervisorAvaliability: formData?.supervisorAvaliability,
        autoClockOut: formData?.autoClockOut,
        emailAutomation: formData?.emailAutomation,
      };

      const errors = await formValidatorJoi(validatePayload, t);

      if (errors && Object.keys(errors).length) {
        setErrorMessages(errors);
        return;
      }

      setLoading(true);

      const payLoad = {
        preferences: createPayload(),
      };

      const response = await updateSettings(payLoad);

      if (response?.statusCode === 200) {
        toast.success(response?.message, {
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
      }

      setLoading(false);
    } catch (error) {
      toast.error(error?.message, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
      setLoading(false);
    }
  };

  const fetchSettingsTabsConfig = async () => {
    try {
      setLoading(true);
      const response = await fetchSettingsPreferencesConfig();
      if (response.statusCode === 200) {
        await fetchSettings(response?.data);
      }
    } catch (e) {
      setLoading(false);
      toast.error(e?.message, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  const fetchSettings = async (configData) => {
    try {
      setLoading(true);
      const response = await fetchSettingsPreferences();
      if (response.statusCode === 200) {
        const data = response?.data?.preferences;

        setFormData({
          devices: data?.devices,
          autoClockOut: data?.autoClockOut,
          emailAutomation: data?.emailAutomation,
          officerAvaliability: data?.officerAvaliability,
          supervisorAvaliability: data?.supervisorAvaliability,
          shifts: data?.shifts?.map((data) => {
            const optionsKey = enumData[data?.slug]?.label;
            const optionsVal = enumData[data?.slug]?.value;
            const options = configData?.[optionsKey]?.map((a) => {
              return {
                value: a.value.toString(),
                label: a.label,
              };
            });
            const selectedOption = options?.find((a) => a.value == data?.[optionsVal]);
            return {
              ...data,
              options: options,
              [optionsKey]: {
                value: selectedOption?.value || '',
                label: selectedOption?.label || '',
              },
              oldSlug: data?.slug,
              slug: optionsKey,
            };
          }),
        });
        setLoading(false);
      }
    } catch (e) {
      setLoading(false);
      toast.error(e?.message, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  const handleValueChange = (event, index, key, addExtraVal) => {
    const { name, value } = event.target;

    const formDataRunSheet = formData?.[name];

    formDataRunSheet[index] = {
      ...formDataRunSheet[index],
      [key]: value,
    };

    if (addExtraVal) {
      formDataRunSheet[index].value = value?.value;
    }

    const errorKey = getErrorKey(key, name, index);
    setErrorMessages((prev) => removeKey([errorKey], prev));

    updateFormHandler(name, formDataRunSheet);
  };

  useEffect(() => {
    fetchSettingsTabsConfig();
  }, []);

  return (
    <Box className={classes.sitesListingCommonContainer}>
      {loading && <LoaderComponent size={50} color={'primary'} label={'Loading'} />}

      <Box className={classes.mainBoxWrapperAvailbiltity}>
        <Box className={classes.tableWrapper}>
          <Box className={classes.headerTitlle}>
            <Typography variant="h4" className={classes.zoneCustomText} gutterBottom>
              {t('obx.systemDefaults.headings.main')}
            </Typography>
            <Typography variant="body2" className={classes.zoneDetailText}>
              {t('obx.systemDefaults.headings.desc')}
            </Typography>
          </Box>
        </Box>

        <Box className={classes.tableTitleWrapper}>
          <Typography variant="h5" className={classes.tableTitle}>
            {t('obx.systemDefaults.headings.jobShift')}
          </Typography>
        </Box>

        <Box className={classes.tableWrapperOne}>
          <Box className={classes.serviceHeader}>
            <Typography variant="subtitle3" className={classes.tableCalendarHeading}>
              {t('obx.systemDefaults.tables.listing.columnsHeader.eventName')}
            </Typography>
            <Typography variant="subtitle3" className={classes.tableCalendarHeading}>
              {t('obx.systemDefaults.tables.listing.columnsHeader.eventDescription')}
            </Typography>
            <Typography variant="subtitle3" className={classes.tableCalendarHeading}>
              {t('obx.systemDefaults.tables.listing.columnsHeader.value')}
            </Typography>
          </Box>
        </Box>
        <div className={classes.devices}>
          {formData?.shifts?.map((a, index) => {
            return (
              <Box key={index}>
                <SystemDefaultsRow
                  index={index}
                  data={a}
                  onValueChange={handleValueChange}
                  errors={errorMessages}
                  name={'shifts'}
                  valKey={a.slug}
                  type={'dropDown'}
                  addExtraVal={true}
                />
              </Box>
            );
          })}
        </div>

        <Box className={classes.tableTitleWrapper}>
          <Typography variant="h5" className={classes.tableTitle}>
            {t('obx.systemDefaults.headings.devices')}
          </Typography>
        </Box>

        <Box className={classes.tableWrapperOne}>
          <Box className={classes.serviceHeader}>
            <Typography variant="subtitle3" className={classes.tableCalendarHeading}>
              {t('obx.systemDefaults.tables.listing.columnsHeader.deviceName')}
            </Typography>
            <Typography variant="subtitle3" className={classes.tableCalendarHeading}>
              {t('obx.systemDefaults.tables.listing.columnsHeader.description')}
            </Typography>
            <Typography variant="subtitle3" className={classes.tableCalendarHeading}>
              {t('obx.systemDefaults.tables.listing.columnsHeader.rate')}
            </Typography>
          </Box>
        </Box>
        <Box className={classes.tableWrapperCalendar}>
          {formData?.devices?.map((a, index) => {
            return (
              <Box key={index}>
                <SystemDefaultsRow
                  index={index}
                  data={a}
                  onValueChange={handleValueChange}
                  errors={errorMessages}
                  name={'devices'}
                  valKey={'rateValue'}
                  descKey={'rateUnit'}
                />
              </Box>
            );
          })}
        </Box>

        <Box className={classes.tableTitleWrapper}>
          <Typography variant="h5" className={classes.tableTitle}>
            {t('obx.systemDefaults.headings.autoClocOut')}
          </Typography>
        </Box>

        <Box className={classes.tableWrapperOne}>
          <Box className={classes.serviceHeader}>
            <Typography variant="subtitle3" className={classes.tableCalendarHeading}>
              {t('obx.systemDefaults.tables.listing.columnsHeader.userType')}
            </Typography>
            <Typography variant="subtitle3" className={classes.tableCalendarHeading}>
              {t('obx.systemDefaults.tables.listing.columnsHeader.description')}
            </Typography>
            <Typography variant="subtitle3" className={classes.tableCalendarHeading}>
              {t('obx.systemDefaults.tables.listing.columnsHeader.timeBracketsInMins')}
            </Typography>
          </Box>
        </Box>
        <Box className={classes.tableWrapperCalendar}>
          {formData?.autoClockOut?.map((a, index) => {
            return (
              <Box key={index}>
                <SystemDefaultsRow
                  index={index}
                  data={a}
                  onValueChange={handleValueChange}
                  errors={errorMessages}
                  name={'autoClockOut'}
                  valKey={'timeValue'}
                  descKey={'description'}
                />
              </Box>
            );
          })}
        </Box>

        <Box className={classes.tableTitleWrapper}>
          <Typography variant="h5" className={classes.tableTitle}>
            {t('obx.systemDefaults.headings.officersAvailability')}
          </Typography>
        </Box>

        <Box className={classes.tableWrapperOne}>
          <Box className={classes.serviceHeader}>
            <Typography variant="subtitle3" className={classes.tableCalendarHeading}>
              {t('obx.systemDefaults.tables.listing.columnsHeader.event')}
            </Typography>
            <Typography variant="subtitle3" className={classes.tableCalendarHeading}>
              {t('obx.systemDefaults.tables.listing.columnsHeader.eventDescription')}
            </Typography>
            <Typography variant="subtitle3" className={classes.tableCalendarHeading}>
              {t('obx.systemDefaults.tables.listing.columnsHeader.time')}
            </Typography>
          </Box>
        </Box>

        <Box className={classes.tableWrapperCalendar}>
          {formData?.officerAvaliability?.map((a, index) => {
            return (
              <Box key={index}>
                <SystemDefaultsRow
                  index={index}
                  data={a}
                  onValueChange={handleValueChange}
                  errors={errorMessages}
                  name={'officerAvaliability'}
                  valKey={'time'}
                  descKey={'description'}
                  type="timer"
                />
              </Box>
            );
          })}
        </Box>

        <Box className={classes.tableTitleWrapper}>
          <Typography variant="h5" className={classes.tableTitle}>
            {t('obx.systemDefaults.headings.supervisorAvailability')}
          </Typography>
        </Box>

        <Box className={classes.tableWrapperOne}>
          <Box className={classes.serviceHeader}>
            <Typography variant="subtitle3" className={classes.tableCalendarHeading}>
              {t('obx.systemDefaults.tables.listing.columnsHeader.event')}
            </Typography>
            <Typography variant="subtitle3" className={classes.tableCalendarHeading}>
              {t('obx.systemDefaults.tables.listing.columnsHeader.eventDescription')}
            </Typography>
            <Typography variant="subtitle3" className={classes.tableCalendarHeading}>
              {t('obx.systemDefaults.tables.listing.columnsHeader.time')}
            </Typography>
          </Box>
        </Box>

        <Box className={classes.tableWrapperCalendar}>
          {formData?.supervisorAvaliability?.map((a, index) => {
            return (
              <Box key={index}>
                <SystemDefaultsRow
                  index={index}
                  data={a}
                  onValueChange={handleValueChange}
                  errors={errorMessages}
                  name={'supervisorAvaliability'}
                  valKey={'time'}
                  descKey={'description'}
                  type="timer"
                />
              </Box>
            );
          })}
        </Box>

        <Box className={classes.tableTitleWrapper}>
          <Typography variant="h5" className={classes.tableTitle}>
            {t('obx.systemDefaults.headings.emailAutomation')}
          </Typography>
        </Box>

        <Box className={classes.tableWrapperOne}>
          <Box className={classes.serviceHeader}>
            <Typography variant="subtitle3" className={classes.tableCalendarHeading}>
              {t('obx.systemDefaults.tables.listing.columnsHeader.event')}
            </Typography>
            <Typography variant="subtitle3" className={classes.tableCalendarHeading}>
              {t('obx.systemDefaults.tables.listing.columnsHeader.eventDescription')}
            </Typography>
            <Typography variant="subtitle3" className={classes.tableCalendarHeading}>
              {t('obx.systemDefaults.tables.listing.columnsHeader.timeAutomation')}
            </Typography>
          </Box>
        </Box>

        <Box className={classes.tableWrapperCalendar}>
          {formData?.emailAutomation?.map((a, index) => {
            return (
              <Box key={index}>
                <SystemDefaultsRow
                  index={index}
                  data={a}
                  onValueChange={handleValueChange}
                  errors={errorMessages}
                  name={'emailAutomation'}
                  valKey={'time'}
                  descKey={'description'}
                  type="timer"
                />
              </Box>
            );
          })}
        </Box>

        <Box className={classes.saveBtnWrapper}>
          <Button disabled={loading} variant="primary" type="button" onClick={updateRunSheet}>
            {t('obx.buttons.save')}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default SystemDefaults;
