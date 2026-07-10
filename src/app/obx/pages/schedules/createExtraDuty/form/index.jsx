import { Box, Button, InputLabel, Skeleton, Typography } from '@mui/material';
import CustomDropDown from 'commonComponents/customDropDown';
import RichTextEditor, { convertDataToHtml } from 'commonComponents/richText';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { EditorState } from 'draft-js';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { createExtraDuty, fetchDefaultHourlyRateOfFranchise } from 'services/duty.services';
import { getAllTypeOfSites, getSitesContracts } from 'services/sites.services';
import DutyInformation from 'src/app/components/common/dutyInformation';
import {
  getCurrentTimeWithDisabledDlsInIso,
  getDaysWrtTimezoneAsPerStandardTime,
  getFranchiseIdWithRoleAndSource,
  getTimezone,
} from 'src/app/obx/pages/schedules/helper';
import {
  HO_SITES_CREATE_EXTRA_DUTY,
  OBX_SCHEDULES,
  OBX_SITES,
  OBX_SITES_DETAIL,
  OBX_USER,
  OBX_USER_DETAIL,
} from 'src/app/router/constant/ROUTE';
import {
  generateRandomNumbers,
  isObjectEmpty,
  removeKey,
  scrollToInValidField,
} from 'src/helper/utilityFunctions';
import useBackNavigation from 'src/hooks/useBackNavigation';
import transformArrayForOptions from 'src/utils/array/transformArrayForOptions';
import {
  franchiseIdUrlQueryParam,
  rolesEnum,
  timeZoneKeyUrlQueryParam,
  toastSettings,
} from 'src/utils/constants';
import formValidatorJoi from 'src/utils/formValidator/formValidator.requiredCheck';

import { useStyles } from '../createExtraDuty.styles';

dayjs.extend(utc);
dayjs.extend(timezone);

const dutyFormData = {
  site: {},
  contract: {},
  dutyType: 'extra',
  loadManagement: false,
  visitManagement: false,
  instructions: EditorState.createEmpty(),

  dutyDays: [],
};
// const formConst = {
//   CONTENT: 'content',
//   START_DATE: 'startDate',
//   END_DATE: 'endDate',
//   DAYS: 'weekDays',
// };
const CreateExtraDuty = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState(dutyFormData);
  const [errorMessages, setErrorMessages] = useState({});
  const [loading, setLoading] = useState(false);
  const [sites, setSites] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [dutyValueRanges, setDutyValueRanges] = useState(undefined);
  const { navigateBack } = useBackNavigation();
  // const history = useHistory();
  const location = useLocation();
  const classes = useStyles();
  const isSitesModule = location.pathname?.includes(OBX_SITES);
  const isUsersModule = location.pathname?.includes(OBX_USER);
  const searchParams = new URLSearchParams(location.search);
  const siteId = searchParams.get('siteId');
  const userId = searchParams.get('userId');

  // get franchise id from the url
  const franchiseIdWithRoleAndSource = getFranchiseIdWithRoleAndSource();

  const franchiseTimeZoneFromUrl = getTimezone();

  let fallbackUrl = OBX_SCHEDULES;

  if (
    franchiseIdWithRoleAndSource?.role === rolesEnum.homeOfficer &&
    franchiseIdWithRoleAndSource?.[franchiseIdUrlQueryParam]
  ) {
    const createExtraJob = HO_SITES_CREATE_EXTRA_DUTY;
    const queryParams = new URLSearchParams({
      siteId: `${siteId}`,
      [franchiseIdUrlQueryParam]: franchiseIdWithRoleAndSource?.[franchiseIdUrlQueryParam],
      [timeZoneKeyUrlQueryParam]: franchiseTimeZoneFromUrl,
    }).toString();
    fallbackUrl = `${createExtraJob}?${queryParams}`;
  } else if (isSitesModule) {
    fallbackUrl = `${OBX_SITES_DETAIL}/${siteId}`;
  } else if (isUsersModule) {
    fallbackUrl = `${OBX_USER_DETAIL}/${userId}`;
  }
  /**
   * Generate Key for Joi
   * @param {*} key
   * @param {*} formDataKey
   * @param {*} index
   * @returns
   */
  const getErrorKey = (key, formDataKey, index) => {
    return `${formDataKey},${index},${key}`;
  };
  /**
   * Show error messages on state
   * @param {*} key
   * @param {*} formDataKey
   * @param {*} index
   * @returns
   */
  const getSitesList = async () => {
    try {
      const response = await getAllTypeOfSites();
      setSites(response?.data?.sites || []);
    } catch (error) {
      setSites([]);
      toast.error(error?.message, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };
  const getContracts = async (id) => {
    try {
      const response = await getSitesContracts(id);
      setContracts(response?.data?.contracts || []);
    } catch (error) {
      setContracts([]);
      toast.error(error?.message, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  const getDefaultHourlyRate = async () => {
    try {
      const response = await fetchDefaultHourlyRateOfFranchise();
      let rate = {};
      if (response?.statusCode === 200) {
        rate = {
          rateValue: response?.data?.preference?.rateValue,
          maxRate: response?.data?.preference?.maxRate,
          minRate: response?.data?.preference?.minRate,
        };
      }
      setDutyValueRanges(rate);
    } catch (error) {
      setDutyValueRanges(undefined);
      toast.error(error?.message, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };
  const updateFormHandler = useCallback(
    (name, value) => {
      setFormData((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    },
    [setFormData],
  );

  const handleEditorChange = (event) => {
    const {
      target: { value },
    } = event;

    handleInputChange('instructions', value);
  };

  const _sendISODays = (startTime, daysArr) => {
    const startTimeISODate = dayjs.utc(startTime).date();
    const startTimeLocalDate = dayjs(startTime).date();
    if (startTimeLocalDate > startTimeISODate) {
      return daysArr?.map((shiftDay) => {
        if (shiftDay - 1 === -1) {
          return 6;
        }
        return shiftDay - 1;
      });
    }
    if (startTimeLocalDate < startTimeISODate) {
      return daysArr?.map((shiftDay) => {
        if (shiftDay + 1 === 7) {
          return 0;
        }
        return shiftDay + 1;
      });
    }
    return daysArr;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let validationPayload = {
      site: formData?.site?.id || null,
      contract: formData?.contract?.id || null,
      instructions: convertDataToHtml(formData?.instructions),
      extraDuties: formData?.extraDuties,
    };

    let finalPayload = JSON.parse(JSON.stringify(validationPayload));
    const errors = await formValidatorJoi(finalPayload, t);

    if (errors && Object.keys(errors).length && Object.keys(errorMessages).length < 1) {
      setErrorMessages(errors);
      scrollToInValidField();
      return;
    }

    let errorCount = 0;

    // Initialize an array to keep track of duties with errors
    const dutiesWithErrors = Array(formData?.extraDuties?.length).fill(false);

    for (let i = 0; i < formData?.extraDuties?.length - 1; i++) {
      const errorObjectOne = getErrorKey('extraDutyItem', 'extraDuties', i);
      const dutyOne = formData.extraDuties[i];

      for (let j = i + 1; j < formData?.extraDuties?.length; j++) {
        const errorObjectTwo = getErrorKey('extraDutyItem', 'extraDuties', j);
        const dutyTwo = formData.extraDuties[j];

        if (
          dutyOne.endsAt &&
          dutyTwo.endsAt &&
          dutyOne.startsAt &&
          dutyTwo.startsAt &&
          dutyOne.dateRange[0] &&
          dutyOne.dateRange[1] &&
          dutyTwo.dateRange[0] &&
          dutyTwo.dateRange[1] &&
          dutyOne.endsAt.format('HH:mm') === dutyTwo.endsAt.format('HH:mm') &&
          dutyOne.startsAt.format('HH:mm') === dutyTwo.startsAt.format('HH:mm') &&
          dutyOne.dateRange[0].format('YYYY-MM-DD') === dutyTwo.dateRange[0].format('YYYY-MM-DD') &&
          dutyOne.dateRange[1].format('YYYY-MM-DD') === dutyTwo.dateRange[1].format('YYYY-MM-DD')
        ) {
          setErrorMessages((prev) => ({
            ...prev,
            [errorObjectOne]: t('obx.schedules.dutyDuplicate', {
              copyIndex: j + 1,
            }),
            [errorObjectTwo]: t('obx.schedules.dutyDuplicate', {
              copyIndex: i + 1,
            }),
          }));
          dutiesWithErrors[i] = true; // Mark dutyOne as having an error
          dutiesWithErrors[j] = true; // Mark dutyTwo as having an error
          errorCount++;
        }
      }
    }

    // Remove keys if no errors found for any duties
    for (let i = 0; i < formData?.extraDuties?.length; i++) {
      if (!dutiesWithErrors[i]) {
        const errorObject = getErrorKey('extraDutyItem', 'extraDuties', i);
        setErrorMessages((prev) => removeKey([errorObject], prev));
      }
    }

    if (errorCount > 0) {
      return;
    }

    /**
     * start time end time officer type
     */
    let apiPayload = formData?.extraDuties?.map((extraDutyData) => {
      const convertedToUtcStart = extraDutyData?.startsAt;
      const convertedToUtcEnd = extraDutyData?.endsAt;

      let startsAt = extraDutyData?.dateRange?.[0]
        .set('hour', convertedToUtcStart?.hour())
        .set('minute', convertedToUtcStart?.minute());

      let endsAt = extraDutyData?.dateRange?.[1]
        .set('hour', convertedToUtcEnd?.hour())
        .set('minute', convertedToUtcEnd?.minute());
      const startsAtWithStandardOffset = getCurrentTimeWithDisabledDlsInIso(startsAt);

      return {
        contractId: validationPayload?.contract,
        siteId: validationPayload?.site,
        dutyType: formData?.dutyType,
        startsAt: startsAtWithStandardOffset,
        endsAt: getCurrentTimeWithDisabledDlsInIso(endsAt),
        officerCount: extraDutyData?.officerCount,
        designation: extraDutyData?.officerType?.name,
        hourlyRate: extraDutyData?.hourlyRate,
        loadManagement: extraDutyData?.loadManagement || false,
        visitManagement: extraDutyData?.visitManagement || false,
        dutyDays: getDaysWrtTimezoneAsPerStandardTime(
          startsAtWithStandardOffset,
          extraDutyData?.dutyDays,
          true,
        ),
        instructions: convertDataToHtml(formData?.instructions),
        contractName: formData?.contract?.title,
        contractStatus: formData?.contract?.status,
      };
    });
    try {
      setLoading(true);
      const res = await createExtraDuty(apiPayload);
      toast.success(res?.message, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
      handleGoBack();
      setLoading(false);
    } catch (e) {
      setLoading(false);
      toast.error(e?.message, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      extraDuties: [
        {
          randomName: generateRandomNumbers(),
          startsAt: null,
          endsAt: null,
          officerCount: null,
          officerType: {},
          hourlyRate: null,
          dutyDays: [],
          dateRange: [],
        },
      ],
    }));
    getDefaultHourlyRate();
    getSitesList();
  }, []);
  const handleGoBack = () => {
    navigateBack({ fallbackUrl: fallbackUrl });
  };

  const resetContractOnSiteChange = () => {
    // Set selected value of contract to {}, if site changes
    updateFormHandler('contract', {});
  };
  const resetContractOnSiteChanges = () => {
    // Set contracts to [] if site changes
    setContracts([]);
  };

  const handleInputChange = useCallback(
    (name, value) => {
      if (name === 'site') {
        resetContractOnSiteChange();
        resetContractOnSiteChanges();
        getContracts(value?.id);
      }
      if (value) {
        setErrorMessages((prev) => removeKey([name], prev));
      }
      updateFormHandler(name, value);
    },
    [updateFormHandler],
  );
  // set default site, if siteId exists in query params
  useEffect(() => {
    const siteId = searchParams.get('siteId');
    if (!siteId || !sites || sites.length === 0) return;
    const matchedSite = sites.find((site) => site?.id == siteId);
    setFormData((prevState) => ({
      ...prevState,
      site: { ...matchedSite, label: matchedSite?.name, value: matchedSite?.id },
    }));
    getContracts(siteId);
  }, [sites]);
  const _enableAPI = !loading;

  return (
    <Box className={classes.createExtraDuty}>
      <Box
        component="form"
        onSubmit={handleSubmit}
        noValidate
        autoComplete="off"
        className={classes.createExtraDutyContent}
      >
        <Box className={classes.createExtraDutyHeader}>
          <Typography variant="h4" className={classes.createExtraDutyTitle}>
            {t('obx.obxExtraDuty.labels.createExtraDuty')}
          </Typography>
          <Typography variant="body3" className={classes.createExtraDutyText}>
            {t('obx.obxExtraDuty.labels.addExtraDutyInfo')}
          </Typography>
        </Box>
        <Box className={classes.createExtraDutyDropdowns}>
          <Box className={classes.createExtraDutyDropdownBox}>
            <InputLabel>{t('form.input.textField.site.label')}</InputLabel>
            {sites?.length ? (
              <>
                <CustomDropDown
                  name="site"
                  placeHolder={t('obx.form.input.dropDown.selectSite.label')}
                  selectedValues={formData.site}
                  handleChange={(e) => handleInputChange(e.target.name, e.target.value)}
                  options={transformArrayForOptions(sites, 'name', 'id')}
                  bordered
                  className={classes.createExtraDutyDropdown}
                  isError={!!errorMessages?.site}
                  searchable={true}
                />
              </>
            ) : (
              <>
                <Skeleton className={classes.skeletonDropdown} />
              </>
            )}

            {!!errorMessages?.site && (
              <Box className={classes.invalidFeedback}>{errorMessages?.site}</Box>
            )}
          </Box>
          {/** Contracts */}
          <Box className={classes.createExtraDutyDropdownBox}>
            <InputLabel>{t('obx.commonText.selectContract')}</InputLabel>
            <CustomDropDown
              name="contract"
              placeHolder={t('obx.commonText.selectContract')}
              selectedValues={formData.contract}
              handleChange={(e) => handleInputChange(e.target.name, e.target.value)}
              options={transformArrayForOptions(contracts, 'title', 'id')}
              bordered
              className={classes.createExtraDutyDropdown}
              isError={!!errorMessages?.contract}
              searchable={true}
            />
            {!!errorMessages?.contract && (
              <Box className={classes.invalidFeedback}>{errorMessages?.contract}</Box>
            )}
          </Box>
        </Box>
        {formData?.extraDuties && (
          <DutyInformation
            formData={formData}
            errorMessages={errorMessages}
            updateFormHandler={updateFormHandler}
            formDataKey={'extraDuties'}
            setErrorMessages={setErrorMessages}
            dutyValueRanges={dutyValueRanges}
            similarItemErrorKey="extraDutyItem"
          />
        )}
        {/*Daily instructions*/}
        <Box className={classes.createExtraDutyEditor}>
          <RichTextEditor
            handleChange={handleEditorChange}
            name={'instructions'}
            placeholder={t('obx.obxExtraDuty.placeholders.descriptions')}
            value={formData?.instructions}
            customClassEditor={classes.createDutyEditor}
          />
          {!!errorMessages?.instructions && (
            <Box className={classes.invalidFeedback}>{errorMessages?.instructions}</Box>
          )}
        </Box>
      </Box>
      <Box className={classes.createExtraDutyFooter}>
        <Button variant="secondaryGrey" onClick={handleGoBack}>
          {t('buttons.cancel')}
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={loading || !isObjectEmpty(errorMessages)}
          variant="primary"
        >
          {t('obx.obxExtraDuty.labels.createExtraDuty')}
        </Button>
      </Box>
    </Box>
  );
};
export default CreateExtraDuty;
