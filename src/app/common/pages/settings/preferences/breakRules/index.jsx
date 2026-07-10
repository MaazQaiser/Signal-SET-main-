import { Box, Button, Typography } from '@mui/material';
import LoaderComponent from 'commonComponents/loader';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { fetchSettingsPreferences, updateSettings } from 'services/settings.services';
import SettingPreferencesRow from 'src/app/common/pages/settings/preferences/components/settingPreferencesRow';
import { getErrorKey, removeKey } from 'src/helper/utilityFunctions';
import useFormHook from 'src/hooks/useFormHook';
import { toastSettings } from 'src/utils/constants';
import formValidatorJoi from 'src/utils/formValidator/formValidator.requiredCheck';

import { useStyles } from '../settingsStyle';

const BreakRules = () => {
  const { t } = useTranslation();

  const classes = useStyles();

  const { formData, setFormData, updateFormHandler, errorMessages, setErrorMessages } = useFormHook(
    {
      defaultFormData: {
        breakRules: [],
      },
    },
  );

  const [loading, setLoading] = useState(false);

  const mapPayloadForRunSheet = () => {
    let preferences = [];

    formData?.breakRules?.map((a) => {
      preferences = [
        ...preferences,
        {
          id: a.id,
          timeValue: a.timeValue,
        },
      ];
    });

    return preferences;
  };

  const updateRunSheet = async () => {
    try {
      const validatePayload = {
        breakRules: formData?.breakRules,
      };
      const errors = await formValidatorJoi(validatePayload, t);

      if (errors && Object.keys(errors).length) {
        setErrorMessages(errors);
        return;
      }
      setLoading(true);

      const payLoad = {
        preferences: mapPayloadForRunSheet(),
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

  const handleValueChange = (event, index, key) => {
    const { name, value } = event.target;

    const formDataRunSheet = formData?.[name];

    formDataRunSheet[index] = {
      ...formDataRunSheet[index],
      [key]: value,
    };
    const errorKey = getErrorKey(key, name, index);
    setErrorMessages((prev) => removeKey([errorKey], prev));

    updateFormHandler(name, formDataRunSheet);
  };

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetchSettingsPreferences();
      if (response.statusCode === 200) {
        const data = response?.data?.preferences;

        setFormData({
          breakRules: data?.breakRules,
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

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <Box className={classes.sitesListingCommonContainer}>
      {loading && <LoaderComponent size={50} color={'primary'} label={'Loading'} />}

      <Box className={classes.mainBoxWrapperAvailbiltity}>
        <Box className={classes.tableWrapper}>
          <Box className={classes.headerTitlle}>
            <Typography variant="h4" className={classes.zoneCustomText} gutterBottom>
              {t('obx.breakRules.headings.main')}
            </Typography>
            <Typography variant="body2" className={classes.zoneDetailText}>
              {t('obx.breakRules.headings.desc')}
            </Typography>
          </Box>
        </Box>
        <Box className={classes.tableWrapperOne}>
          <Box className={classes.timeHeader}>
            <Typography variant="subtitle3" className={classes.tableCalendarHeading}>
              {t('obx.breakRules.tables.listing.columnsHeader.breakType')}
            </Typography>
            <Typography variant="subtitle3" className={classes.tableCalendarHeading}>
              {t('obx.breakRules.tables.listing.columnsHeader.description')}
            </Typography>
            <Typography variant="subtitle3" className={classes.tableCalendarHeading}>
              {t('obx.breakRules.tables.listing.columnsHeader.time')}
            </Typography>
          </Box>
        </Box>

        <Box className={classes.tableWrapperCalendar}>
          {formData?.breakRules?.map((a, index) => {
            return (
              <Box key={index}>
                <SettingPreferencesRow
                  index={index}
                  data={a}
                  onValueChange={handleValueChange}
                  errors={errorMessages}
                  name="breakRules"
                  valKey="timeValue"
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

export default BreakRules;
