import {
  Checkbox,
  FormControlLabel,
  InputLabel,
  Radio,
  RadioGroup,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import Box from '@mui/material/Box';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import * as React from 'react';
import { useState } from 'react';
import { useEffect } from 'react';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import CustomDropDown from 'src/app/components/common/customDropDown';
import ResponsiveDatePickers from 'src/app/components/common/datePicker';
import RequiredAsterik from 'src/app/components/common/requiredAsterik';
import { AlertBlueIcon } from 'src/assets/svg';
import { ReactComponent as CheckBoxCheckedIcon } from 'src/assets/svg/checkbox-checked.svg';
import { isObjectEmpty, removeKeysFromObject } from 'src/helper/utilityFunctions';
import { useTenantLabel } from 'src/hooks/useTenantLabel';
import { getDisplayConfiguration } from 'src/redux/store/slices/regionalCountryConfiguration';
import { getTimezoneOptions } from 'src/services/settings.services';
import transformArrayForOptions from 'src/utils/array/transformArrayForOptions';
import { contractTypeEnum, proposalTypeEnum } from 'src/utils/constants';
import { joiValidateErrors } from 'src/utils/formValidator/formValidator.requiredCheck';
import {
  adjustRenewalNotification,
  convertMMDDYYYYToDayJsDate,
  formatDayJsDate,
} from 'src/utils/passTime/time';
import capitalize from 'src/utils/string/capitalize';

import DrawerFooter from '../../components/drawerFooter';
import DrawerHeader from '../../components/drawerHeader';
import { useStyles } from './listingMoreFilter.js';

const FormKeys = {
  NAME: 'name',
  TIMEZONE: 'timezone',
  START_DATE: 'startDate',
  EFFECTIVE_DATE: 'effectiveDate',
  END_DATE: 'endDate',
  RENEWAL_DATE: 'renewalDate',
  RENEWAL_REMINDER_DAYS: 'renewalReminderDays',
  SELECTED_DATE_TYPE: 'selectedDateType',
  AUTO_RENEWAL: 'autoRenewal',
  ARE_DATES_TO_BE_DECIDED: 'areDatesToBeDecided',
  DEFAULT: 'default',
  DISPATCH_ONLY: 'dispatch',
  PROPOSAL_TYPE: 'proposalType',
};

const defaultRenewalDays = 10;

const initialFormState = {
  [FormKeys.NAME]: '',
  [FormKeys.TIMEZONE]: null,
  [FormKeys.START_DATE]: '',
  [FormKeys.END_DATE]: '',
  [FormKeys.RENEWAL_DATE]: '',
  [FormKeys.SELECTED_DATE_TYPE]: FormKeys.RENEWAL_DATE,
  [FormKeys.RENEWAL_REMINDER_DAYS]: defaultRenewalDays,
  [FormKeys.AUTO_RENEWAL]: false,
  [FormKeys.PROPOSAL_TYPE]: proposalTypeEnum.default,
};

const getBrowserTimezone = () => {
  const iana = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
  const city = iana.split('/').pop()?.replace(/_/g, ' ') || '';
  const offsetMinutes = new Date().getTimezoneOffset();
  const sign = offsetMinutes <= 0 ? '+' : '-';
  const absMinutes = Math.abs(offsetMinutes);
  const hours = String(Math.floor(absMinutes / 60)).padStart(2, '0');
  const minutes = String(absMinutes % 60).padStart(2, '0');
  return { offset: `UTC${sign}${hours}:${minutes}`, city };
};

const ContractDrawer = ({
  anchor,
  filterCloseDrawer,
  width,
  createOrUpdateProposal,
  contractData,
  disabled = false,
  dealName,
  enableOccurences = false,
}) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const { dateFormat } = useSelector(getDisplayConfiguration);

  const { getLabel } = useTenantLabel();

  const tenantInfo = useSelector((state) => state.auth.tenantInfo);

  const [areDatesToBeDecided, setAreDatesToBeDecided] = useState(
    contractData ? !contractData?.[FormKeys.START_DATE] : false,
  );

  const [timezoneOptions, setTimezoneOptions] = useState([]);

  const [formData, setFormData] = useState(
    contractData
      ? { ...initialFormState, ...contractData }
      : { ...initialFormState, [FormKeys.NAME]: dealName || '' },
  );
  const [errorMessages, setErrorMessages] = useState({});

  /**
   * Fetch timezone options
   */
  const fetchTimezoneOptions = async () => {
    try {
      const response = await getTimezoneOptions();
      if (response.statusCode === 200) {
        const timezones = response?.data?.timezones;
        setTimezoneOptions(timezones);

        if (!contractData && !formData[FormKeys.TIMEZONE] && timezones?.length) {
          const { offset, city } = getBrowserTimezone();
          const offsetMatches = timezones.filter((tz) => tz.name?.includes(offset));
          const cityLower = city.toLowerCase();
          const match =
            (cityLower &&
              offsetMatches.find(
                (tz) =>
                  tz.id?.toLowerCase().includes(cityLower) ||
                  tz.name?.toLowerCase().includes(cityLower),
              )) ||
            offsetMatches[0];
          if (match) {
            setFormData((prev) => ({
              ...prev,
              [FormKeys.TIMEZONE]: { ...match, value: match.id?.toString(), label: match.name },
            }));
          }
        }
      }
    } catch (error) {
      const fallbackTimezones = [
        { id: 1, name: 'UTC-05:00 Eastern Time - New York' },
        { id: 2, name: 'UTC-06:00 Central Time - Chicago' },
        { id: 3, name: 'UTC-06:00 Central Time - Austin' },
        { id: 4, name: 'UTC-07:00 Mountain Time - Denver' },
        { id: 5, name: 'UTC-08:00 Pacific Time - Los Angeles' },
      ];
      setTimezoneOptions(fallbackTimezones);
      if (!contractData && !formData[FormKeys.TIMEZONE]) {
        const { offset, city } = getBrowserTimezone();
        const offsetMatches = fallbackTimezones.filter((tz) => tz.name?.includes(offset));
        const cityLower = city.toLowerCase();
        const match =
          (cityLower &&
            offsetMatches.find(
              (tz) =>
                tz.id?.toString().toLowerCase().includes(cityLower) ||
                tz.name?.toLowerCase().includes(cityLower),
            )) ||
          offsetMatches[0] ||
          fallbackTimezones[0];
        if (match) {
          setFormData((prev) => ({
            ...prev,
            [FormKeys.TIMEZONE]: { ...match, value: match.id?.toString(), label: match.name },
          }));
        }
      }
    }
  };

  useEffect(() => {
    // Let's check if the tenant has any service and then update the form data
    const hasService = tenantInfo?.services?.dedicated || tenantInfo?.services?.patrol;
    setFormData((prev) => ({
      ...prev,
      [FormKeys.PROPOSAL_TYPE]: hasService
        ? contractData?.[FormKeys.PROPOSAL_TYPE]
          ? contractData?.[FormKeys.PROPOSAL_TYPE]
          : proposalTypeEnum.default
        : proposalTypeEnum.default,
    }));
  }, []);

  useEffect(() => {
    fetchTimezoneOptions();
  }, []);

  // Automatically set renewal date to 1 year when enableOccurences is true
  useEffect(() => {
    if (
      enableOccurences &&
      formData[FormKeys.START_DATE] &&
      (formData?.[FormKeys.SELECTED_DATE_TYPE] === 'renewalDate'
        ? !formData?.[FormKeys.RENEWAL_DATE]
        : !formData?.[FormKeys.END_DATE])
    ) {
      const startDate = convertMMDDYYYYToDayJsDate(formData[FormKeys.START_DATE], false);
      const renewalDate = startDate.add(1, 'year');

      setFormData((prev) => ({
        ...prev,
        [formData?.[FormKeys.SELECTED_DATE_TYPE] === 'renewalDate'
          ? FormKeys.RENEWAL_DATE
          : FormKeys.END_DATE]: renewalDate,
      }));

      const renewalDays = adjustRenewalNotification(startDate, renewalDate, defaultRenewalDays);

      setFormData((prev) => ({
        ...prev,
        [FormKeys.RENEWAL_REMINDER_DAYS]: renewalDays,
      }));
    }
  }, [enableOccurences, formData[FormKeys.START_DATE], formData?.[FormKeys.SELECTED_DATE_TYPE]]);

  const autoRenewalChecked = (event) => {
    const { name, checked } = event.target;
    // updateFormHandler(name, checked);

    const maxRenewalDays = adjustRenewalNotification(
      formData?.[FormKeys.START_DATE],
      formData?.[FormKeys.RENEWAL_DATE],
      defaultRenewalDays,
    );

    setFormData((prev) => ({
      ...prev,
      [FormKeys.RENEWAL_REMINDER_DAYS]: maxRenewalDays || 10,
      [name]: checked,
    }));
  };

  const handleChangeTBD = () => {
    setAreDatesToBeDecided((prevVal) => {
      if (prevVal) {
        setFormData({
          ...formData,
          [FormKeys.START_DATE]: '',
          [FormKeys.END_DATE]: '',
          [FormKeys.RENEWAL_DATE]: '',
          [FormKeys.RENEWAL_REMINDER_DAYS]: defaultRenewalDays,
        });
      } else {
        const {
          [FormKeys.START_DATE]: _startDate,
          [FormKeys.END_DATE]: _endDate,
          [FormKeys.RENEWAL_DATE]: _renewalDate,
          [FormKeys.RENEWAL_REMINDER_DAYS]: _renewalReminderDays,
          ...restFormData
        } = formData;
        setFormData(restFormData);
      }
      return !prevVal;
    });
  };
  /**
   * common function to update data to formDat object
   */
  const updateFormHandler = useCallback(
    (name, value) => {
      setFormData((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    },
    [setFormData],
  );

  const removeErrorKey = (name) => {
    const { [name]: _, ...rest } = errorMessages;
    setErrorMessages(rest);
  };

  const inputChangedHandler = (event) => {
    let { name, value } = event.target;
    if (value) {
      removeErrorKey(name);
    }

    /**
     * It will only store number values
     */
    if (value && name === FormKeys.RENEWAL_REMINDER_DAYS && !value.match(/^\d+$/)) {
      return;
    }

    updateFormHandler(name, value);
  };

  const checkMinMaxOfRenewal = (event) => {
    let { name, value } = event.target;
    if (name === FormKeys.RENEWAL_REMINDER_DAYS) {
      const maxRenewalDays = adjustRenewalNotification(
        formData?.[FormKeys.START_DATE],
        formData?.[FormKeys.RENEWAL_DATE],
        formData?.[FormKeys.RENEWAL_REMINDER_DAYS],
      );

      if (Number(value) < 1) {
        value = 1;
      }
      if (Number(value) > maxRenewalDays) {
        value = maxRenewalDays;
      }
    }

    updateFormHandler(name, value);
  };

  const handleDateChange = (customEvent) => {
    const { name, value } = customEvent;
    const isValidDate = !isNaN(value?.['$d']);
    if (isValidDate) {
      removeErrorKey(name);
    }

    // If enableOccurences and start date changes, automatically set renewal date to 1 year
    if (name === FormKeys?.START_DATE && enableOccurences && isValidDate) {
      const renewalDate = value.add(1, 'year');
      updateFormHandler(FormKeys?.RENEWAL_DATE, renewalDate);

      const renewalDays = adjustRenewalNotification(value, renewalDate, defaultRenewalDays);
      updateFormHandler(FormKeys?.RENEWAL_REMINDER_DAYS, renewalDays);
    } else if (name === FormKeys?.START_DATE && formData?.[FormKeys.RENEWAL_DATE]) {
      const renewalDays = adjustRenewalNotification(
        value,
        formData?.[FormKeys.RENEWAL_DATE],
        defaultRenewalDays,
      );
      updateFormHandler(FormKeys?.RENEWAL_REMINDER_DAYS, renewalDays);
    }

    if (name === FormKeys?.RENEWAL_DATE && formData?.[FormKeys.START_DATE]) {
      const renewalDays = adjustRenewalNotification(
        formData?.[FormKeys.START_DATE],
        value,
        defaultRenewalDays,
      );
      updateFormHandler(FormKeys?.RENEWAL_REMINDER_DAYS, renewalDays);
    }
    updateFormHandler(name, isValidDate ? value : null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let validatePayload = {
      ...formData,
      ...(!areDatesToBeDecided
        ? {
            [contractData?.type === contractTypeEnum.addendum
              ? FormKeys.EFFECTIVE_DATE
              : FormKeys.START_DATE]: formatDayJsDate(
              formData[
                contractData?.type === contractTypeEnum.addendum
                  ? FormKeys.EFFECTIVE_DATE
                  : FormKeys.START_DATE
              ],
              'date',
            ),
            // [FormKeys.END_DATE]: formatDayJsDate(formData[FormKeys.END_DATE], 'date'),
            [formData?.[FormKeys.SELECTED_DATE_TYPE] === FormKeys.END_DATE
              ? FormKeys.END_DATE
              : FormKeys.RENEWAL_DATE]: formatDayJsDate(
              formData[
                formData?.[FormKeys.SELECTED_DATE_TYPE] === FormKeys.END_DATE
                  ? FormKeys.END_DATE
                  : FormKeys.RENEWAL_DATE
              ],
              'date',
            ),
          }
        : {}),
    };

    validatePayload = removeKeysFromObject(validatePayload, [
      // Additional check for areDatesToBeDecided
      ...(areDatesToBeDecided
        ? [
            FormKeys.START_DATE,
            FormKeys.END_DATE,
            FormKeys.RENEWAL_DATE,
            FormKeys.AUTO_RENEWAL,
            FormKeys.RENEWAL_REMINDER_DAYS,
            FormKeys.SELECTED_DATE_TYPE,
          ]
        : [
            formData?.[FormKeys.SELECTED_DATE_TYPE] === FormKeys.END_DATE
              ? FormKeys.RENEWAL_DATE
              : FormKeys.END_DATE,
            formData?.[FormKeys.SELECTED_DATE_TYPE] === FormKeys.END_DATE &&
              FormKeys.RENEWAL_REMINDER_DAYS,
            formData?.[FormKeys.SELECTED_DATE_TYPE] === FormKeys.END_DATE && FormKeys.AUTO_RENEWAL,
            contractData?.type === contractTypeEnum.addendum
              ? FormKeys.START_DATE
              : FormKeys.EFFECTIVE_DATE,
          ]),
    ]);

    if (contractData?.type === contractTypeEnum.addendum && !areDatesToBeDecided) {
      let effectiveDate = formData?.[FormKeys.EFFECTIVE_DATE];
      let lastDate = convertMMDDYYYYToDayJsDate(
        formData[
          formData?.[FormKeys.SELECTED_DATE_TYPE] === FormKeys.END_DATE
            ? FormKeys.END_DATE
            : FormKeys.RENEWAL_DATE
        ],
        false,
      );

      if (
        convertMMDDYYYYToDayJsDate(effectiveDate, false) <= dayjs() ||
        convertMMDDYYYYToDayJsDate(effectiveDate, false) >= lastDate
      ) {
        setErrorMessages((prev) => ({
          ...prev,
          [FormKeys.EFFECTIVE_DATE]: `Date must be greater than today and less than ${formData?.[FormKeys.SELECTED_DATE_TYPE]}`,
        }));
        return;
      }
    }

    const errors = await joiValidateErrors({
      data: validatePayload,
      t,
    });

    if (errors) {
      setErrorMessages(errors);
      return;
    }
    createOrUpdateProposal({
      ...validatePayload,
      [FormKeys.START_DATE]: formatDayJsDate(
        formData[
          contractData?.type === contractTypeEnum.addendum
            ? FormKeys.EFFECTIVE_DATE
            : FormKeys.START_DATE
        ],
        'date',
      ),
      [FormKeys.ARE_DATES_TO_BE_DECIDED]: areDatesToBeDecided,
      [FormKeys.TIMEZONE]: formData[FormKeys.TIMEZONE],
      [FormKeys.END_DATE]: formatDayJsDate(
        formData[
          formData?.[FormKeys.SELECTED_DATE_TYPE] === FormKeys.END_DATE
            ? FormKeys.END_DATE
            : FormKeys.RENEWAL_DATE
        ],
        'date',
      ),
    });
  };

  const getError = (key) => {
    return errorMessages[`${key}`];
  };

  const addendumContractMinDate = () => {
    const contractStartDate = contractData?.[FormKeys.START_DATE];
    // Check if the contract is addendum then Compare the start date with the current date to check if it is passed
    if (
      (contractData?.type === contractTypeEnum.addendum &&
        dayjs(contractStartDate).isBefore(dayjs(), 'day')) ||
      dayjs(contractStartDate).isSame(dayjs(), 'day')
    ) {
      // add 3 day to current day
      return dayjs().add(1, 'd');
    }
    return dayjs();
  };

  return (
    <Box
      className={classes?.siderBarBox}
      sx={{ width: anchor === 'top' || anchor === 'bottom' ? 'auto' : width }}
      role="presentation"
    >
      <Box className={classes?.sideHeader}>
        <DrawerHeader
          title={
            contractData && !isObjectEmpty(contractData)
              ? t('sales.deals.updateProposalDrawer')
              : t('sales.deals.createProposalDrawer')
          }
          handleCloseDrawer={filterCloseDrawer}
          anchor={anchor}
          className={classes.moreFilterHeader}
        />
      </Box>
      <Box className={classes?.moreFilterForm}>
        <Box className={classes?.fieldWrapper}>
          <InputLabel>
            {t('sales.deals.serviceType')}
            {contractData?.type === contractTypeEnum.addendum && (
              <Tooltip
                arrow
                slotProps={{
                  popper: {
                    modifiers: [
                      {
                        name: 'offset',
                        options: {
                          offset: [18, -14],
                        },
                      },
                    ],
                    sx: { cursor: 'pointer' },
                  },
                }}
                title={t('sales.contract.cannotChangeProposalType')}
              >
                <Box className={classes.iconHeading}>
                  <AlertBlueIcon />
                </Box>
              </Tooltip>
            )}
          </InputLabel>
          <RadioGroup
            className={classes.radioGroupService}
            name={FormKeys.PROPOSAL_TYPE}
            value={formData?.[FormKeys.PROPOSAL_TYPE] || proposalTypeEnum.default}
            onChange={inputChangedHandler}
          >
            {(tenantInfo?.services?.dedicated || tenantInfo?.services?.patrol) && (
              <FormControlLabel
                value={proposalTypeEnum.default}
                control={<Radio disableRipple />}
                disabled={contractData?.type === contractTypeEnum.addendum}
                label={
                  <Box>
                    <Typography variant="subtitle2" className={classes?.serviceRadioLabel}>
                      {tenantInfo?.services?.dedicated &&
                        t('sales.contract.dedicated', {
                          dedicatedTermCap: capitalize(getLabel('terms', 'dedicated')),
                        })}
                      {tenantInfo?.services?.dedicated && tenantInfo?.services?.patrol && (
                        <span> / </span>
                      )}
                      {tenantInfo?.services?.patrol &&
                        t('sales.contract.patrol', {
                          patrolTermCap: capitalize(getLabel('terms', 'patrol')),
                        })}
                    </Typography>
                    <Typography variant="body2" className={classes?.serviceRadioLabelsub}>
                      {t('commonText.add')}{' '}
                      {tenantInfo?.services?.dedicated &&
                        t('sales.contract.dedicated', {
                          dedicatedTermCap: getLabel('terms', 'dedicated')?.toLowerCase(),
                        })}
                      {tenantInfo?.services?.dedicated && tenantInfo?.services?.patrol && (
                        <span>, </span>
                      )}
                      {tenantInfo?.services?.patrol &&
                        t('sales.contract.patrol', {
                          patrolTermCap: getLabel('terms', 'patrol')?.toLowerCase(),
                        })}
                      {tenantInfo?.services?.patrol && tenantInfo?.services?.dispatch && (
                        <span> & </span>
                      )}
                      {tenantInfo?.services?.dispatch &&
                        t('sales.contract.dispatch', {
                          dispatchTermCap: getLabel('terms', 'dispatch')?.toLowerCase(),
                        })}
                      &nbsp;{t('sales.contract.services')}
                    </Typography>
                  </Box>
                }
              />
            )}
            {tenantInfo?.services?.dispatch && (
              <FormControlLabel
                value={proposalTypeEnum.dispatch}
                control={<Radio disableRipple />}
                disabled={contractData?.type === contractTypeEnum.addendum}
                label={
                  <Box>
                    <Typography variant="subtitle2" className={classes?.serviceRadioLabel}>
                      {t('sales.deals.dispatchOnly', {
                        dispatchTerm: getLabel('terms', 'dispatch'),
                      })}
                    </Typography>
                    <Typography variant="body2" className={classes?.serviceRadioLabelsub}>
                      {t('sales.deals.dispatchOnlyText', {
                        dispatchTerm: getLabel('terms', 'dispatch')?.toLowerCase(),
                      })}
                    </Typography>
                  </Box>
                }
              />
            )}
          </RadioGroup>
        </Box>
        <Box className={classes?.fieldWrapper}>
          <InputLabel>
            {t('sales.deals.proposalName')}
            <RequiredAsterik />
          </InputLabel>
          <TextField
            name={FormKeys.NAME}
            id={FormKeys.NAME}
            type="text"
            className={classes?.textFiledFilter}
            placeholder={t('sales.deals.addProposalName')}
            fullWidth
            value={formData[FormKeys.NAME]}
            onChange={inputChangedHandler}
            error={!!getError(FormKeys.NAME)}
            helperText={getError(FormKeys.NAME)}
            inputProps={{ maxLength: 55 }}
          />
        </Box>
        <Box className={`${classes?.fieldWrapper}  ${classes?.dropdownCommonSection}`}>
          <InputLabel>
            {t('sales.contract.timeZone')}
            <RequiredAsterik />
          </InputLabel>
          <CustomDropDown
            name={FormKeys.TIMEZONE}
            id={FormKeys.TIMEZONE}
            placeHolder={t('sales.deals.selectTimeZone')}
            placeHolderClassName={classes.placeHolderColor}
            // searchPlaceholder={t('sales.contract.selectTimeZone')}
            options={transformArrayForOptions(timezoneOptions, 'name', 'id')}
            selectedValues={formData[FormKeys.TIMEZONE] || {}} // Change here to an array
            handleChange={inputChangedHandler}
            className={classes.dropdownWrap}
            isError={!!getError(FormKeys.TIMEZONE)}
            searchable
            bordered
          />
        </Box>
        <Box>
          <div className={classes.invalidFeedback}>
            {!!getError(FormKeys.TIMEZONE) && t('sales.contract.timezoneRequired')}
          </div>
        </Box>
        {contractData?.type !== contractTypeEnum.addendum && (
          <Box className={classes?.fieldWrapper}>
            <Box className={classes.checkBoxPoint}>
              <Checkbox id="datesTBD" checked={areDatesToBeDecided} onChange={handleChangeTBD} />
              <Typography variant="body2" className={classes?.previewQuestionOptionText}>
                {`${t('sales.deals.decideLater')}`}
              </Typography>
            </Box>
          </Box>
        )}
        {!areDatesToBeDecided && (
          <>
            <Box className={classes?.fieldWrapper}>
              <InputLabel>
                {contractData?.type === contractTypeEnum.addendum
                  ? t('sales.deals.effectiveDate')
                  : t('sales.deals.startDate')}
                <RequiredAsterik />
              </InputLabel>
              <ResponsiveDatePickers
                value={
                  formData[FormKeys.START_DATE]
                    ? convertMMDDYYYYToDayJsDate(formData[FormKeys.START_DATE], false)
                    : null
                }
                onChange={(value) =>
                  handleDateChange({
                    name:
                      contractData?.type === contractTypeEnum.addendum
                        ? FormKeys.EFFECTIVE_DATE
                        : FormKeys.START_DATE,
                    value,
                  })
                }
                minDate={
                  contractData?.type === contractTypeEnum.addendum
                    ? convertMMDDYYYYToDayJsDate(addendumContractMinDate(), false)
                    : convertMMDDYYYYToDayJsDate(dayjs(), false)
                }
                maxDate={
                  contractData?.type === contractTypeEnum.addendum
                    ? convertMMDDYYYYToDayJsDate(
                        contractData?.actualContractDates?.endDate,
                        false,
                      ).subtract(1, 'd')
                    : formData[FormKeys.END_DATE]
                      ? convertMMDDYYYYToDayJsDate(formData[FormKeys.END_DATE], false).subtract(
                          1,
                          'd',
                        )
                      : null
                }
                placeholder={
                  contractData?.type === contractTypeEnum.addendum
                    ? t('sales.deals.selectEffectiveDate')
                    : t('sales.deals.selectstartDate')
                }
                format={dateFormat}
                inputFormat={dateFormat}
                error={
                  !!getError(
                    contractData?.type === contractTypeEnum.addendum
                      ? FormKeys.EFFECTIVE_DATE
                      : FormKeys.START_DATE,
                  )
                }
                helperText={getError(
                  contractData?.type === contractTypeEnum.addendum
                    ? FormKeys.EFFECTIVE_DATE
                    : FormKeys.START_DATE,
                )}
                className={classes.createdDatePicker}
              />
            </Box>
            <RadioGroup
              row
              name={FormKeys.SELECTED_DATE_TYPE}
              value={formData?.[FormKeys.SELECTED_DATE_TYPE] || FormKeys.RENEWAL_DATE}
              onChange={inputChangedHandler}
            >
              <FormControlLabel
                value={FormKeys.END_DATE}
                control={<Radio disableRipple />}
                label={t('sales.deals.endDateLabel')}
              />
              <FormControlLabel
                value={FormKeys.RENEWAL_DATE}
                control={<Radio disableRipple />}
                label={t('sales.deals.renewalDateLabel')}
              />
            </RadioGroup>
            {formData?.[FormKeys.SELECTED_DATE_TYPE] === FormKeys.END_DATE ? (
              // Show End Date
              <>
                <Box className={classes?.fieldWrapper}>
                  <InputLabel>
                    {t('sales.deals.endDate')} <RequiredAsterik />
                  </InputLabel>
                  <ResponsiveDatePickers
                    value={
                      formData[FormKeys.END_DATE]
                        ? convertMMDDYYYYToDayJsDate(formData[FormKeys.END_DATE], false)
                        : null
                    }
                    minDate={
                      enableOccurences && formData[FormKeys.START_DATE]
                        ? convertMMDDYYYYToDayJsDate(formData[FormKeys.START_DATE], false).add(
                            1,
                            'year',
                          )
                        : formData[FormKeys.START_DATE]
                          ? convertMMDDYYYYToDayJsDate(formData[FormKeys.START_DATE], false).add(
                              1,
                              'd',
                            )
                          : null
                    }
                    maxDate={
                      enableOccurences && formData[FormKeys.START_DATE]
                        ? convertMMDDYYYYToDayJsDate(formData[FormKeys.START_DATE], false).add(
                            1,
                            'year',
                          )
                        : null
                    }
                    onChange={(value) => handleDateChange({ name: FormKeys.END_DATE, value })}
                    placeholder={`${t('sales.deals.selectEndDate')}`}
                    format={dateFormat}
                    inputFormat={dateFormat}
                    error={!!getError(FormKeys.END_DATE)}
                    helperText={getError(FormKeys.END_DATE)}
                    className={classes.createdDatePicker}
                  />
                </Box>
              </>
            ) : (
              // Show Renewal Date
              <>
                <Box className={classes?.fieldWrapper}>
                  <InputLabel>
                    {t('sales.deals.renewalDate')} <RequiredAsterik />
                  </InputLabel>
                  <ResponsiveDatePickers
                    value={
                      formData[FormKeys.RENEWAL_DATE]
                        ? convertMMDDYYYYToDayJsDate(formData[FormKeys.RENEWAL_DATE], false)
                        : null
                    }
                    minDate={
                      enableOccurences && formData[FormKeys.START_DATE]
                        ? convertMMDDYYYYToDayJsDate(formData[FormKeys.START_DATE], false).add(
                            1,
                            'year',
                          )
                        : formData[FormKeys.START_DATE]
                          ? convertMMDDYYYYToDayJsDate(formData[FormKeys.START_DATE], false).add(
                              1,
                              'd',
                            )
                          : null
                    }
                    maxDate={
                      enableOccurences && formData[FormKeys.START_DATE]
                        ? convertMMDDYYYYToDayJsDate(formData[FormKeys.START_DATE], false).add(
                            1,
                            'year',
                          )
                        : null
                    }
                    onChange={(value) => handleDateChange({ name: FormKeys.RENEWAL_DATE, value })}
                    placeholder={`${t('sales.deals.selectRenewalDate')}`}
                    format={dateFormat}
                    inputFormat={dateFormat}
                    error={!!getError(FormKeys.RENEWAL_DATE)}
                    helperText={getError(FormKeys.RENEWAL_DATE)}
                    className={classes.createdDatePicker}
                  />
                </Box>
                <Box className={classes?.fieldWrapper}>
                  <Box className={classes.checkBoxPoint}>
                    <Checkbox
                      id="allow-officer"
                      name={FormKeys.AUTO_RENEWAL}
                      onChange={autoRenewalChecked}
                      checked={formData?.[FormKeys.AUTO_RENEWAL] || false}
                      checkedIcon={<CheckBoxCheckedIcon />}
                    />
                    <Typography variant="body2" className={classes?.previewQuestionOptionText}>
                      {t('sales.deals.autoRenewalOfContract')}
                    </Typography>
                  </Box>
                </Box>
                <Box className={classes?.fieldWrapper}>
                  <InputLabel>
                    {t('sales.deals.renewalNotification')}
                    <RequiredAsterik />
                  </InputLabel>
                  <TextField
                    name={FormKeys.RENEWAL_REMINDER_DAYS}
                    id={FormKeys.RENEWAL_REMINDER_DAYS}
                    type="number"
                    onWheel={(e) => e.target.blur()} // disables scroll on input
                    className={classes?.textFiledFilter}
                    placeholder={defaultRenewalDays}
                    fullWidth
                    value={formData[FormKeys.RENEWAL_REMINDER_DAYS]}
                    onChange={inputChangedHandler}
                    onBlur={checkMinMaxOfRenewal}
                    error={!!getError(FormKeys.RENEWAL_REMINDER_DAYS)}
                    helperText={getError(FormKeys.RENEWAL_REMINDER_DAYS)}
                    InputProps={{
                      inputProps: {
                        max: 30,
                        min: 1,
                        step: 1, // Specify step as 1 to disallow decimal points
                      },
                    }}
                  />
                </Box>
              </>
            )}
          </>
        )}
      </Box>

      <DrawerFooter
        bulkApply={
          contractData && !isObjectEmpty(contractData)
            ? t('sales.deals.updateProposalDrawer')
            : t('sales.deals.createProposalDrawer')
        }
        bulkCancel={t('sales.deals.cancel')}
        handleCloseDrawer={filterCloseDrawer}
        onSubmit={handleSubmit}
        anchor={anchor}
        type="submit"
        classNameFooter={classes.moreFilterFooter}
        disabled={disabled}
        disabled2={disabled}
      />
    </Box>
  );
};

ContractDrawer.propTypes = {
  anchor: PropTypes.string,
  filterCloseDrawer: PropTypes.func,
  width: PropTypes.number,
  createOrUpdateProposal: PropTypes.func,
  contractData: PropTypes.object,
  disabled: PropTypes.bool,
  dealName: PropTypes.string,
  enableOccurences: PropTypes.bool,
};

export default ContractDrawer;
