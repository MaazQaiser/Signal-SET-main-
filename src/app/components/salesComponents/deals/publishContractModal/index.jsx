import {
  Button,
  Checkbox,
  FormControlLabel,
  InputLabel,
  Radio,
  RadioGroup,
  TextField,
} from '@mui/material';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Typography from '@mui/material/Typography';
// import { ReactComponent as DeleteIcon } from 'assets/icons/trashIcon.svg';
import classNames from 'classnames';
import RequiredAsterik from 'commonComponents/requiredAsterik';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import ResponsiveDatePickers from 'src/app/components/common/datePicker';
import LoaderComponent from 'src/app/components/common/loader';
import { SALES_DEAL } from 'src/app/router/constant/ROUTE';
import history from 'src/app/router/utils/history';
import { WarningIcon } from 'src/assets/svg';
import { ReactComponent as CheckBoxRegularIcon } from 'src/assets/svg/checkbox.svg';
import { ReactComponent as CheckBoxCheckedIcon } from 'src/assets/svg/checkbox-checked.svg';
import { removeKeysFromObject } from 'src/helper/utilityFunctions';
import { useTenantLabel } from 'src/hooks/useTenantLabel';
import { getDisplayConfiguration } from 'src/redux/store/slices/regionalCountryConfiguration';
import { publishContract } from 'src/services/deal.service';
import { contractTypeEnum, SelectedDateTpeContract, toastSettings } from 'src/utils/constants';
import { joiValidateErrors } from 'src/utils/formValidator/formValidator.requiredCheck';
import {
  adjustRenewalNotification,
  convertMMDDYYYYToDayJsDate,
  formatDayJsDate,
} from 'src/utils/passTime/time';

import { ContractActions } from '../dealContract';
import ContractAddendumServices from './contractAddendumServices';
import { useStyles } from './publishContractModal';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '100%',
  maxWidth: '500px',
  bgcolor: 'background.paper',
  padding: '24px',
  boxShadow: '0px 8px 8px -4px rgba(16, 24, 40, 0.04), 0px 20px 24px -4px rgba(16, 24, 40, 0.10)',
  borderRadius: '12px',
};

const defaultRenewalDays = 10;

const FormKeys = {
  // NAME: 'name',
  // TIMEZONE: 'timezone',
  START_DATE: 'startDate',
  END_DATE: 'endDate',
  RENEWAL_DATE: 'renewalDate',
  RENEWAL_REMINDER_DAYS: 'renewalReminderDays',
  SELECTED_DATE_TYPE: 'selectedDateType',
  AUTO_RENEWAL: 'autoRenewal',
};

const FileErrors = {
  INVALID: 1,
  NOT_ATTACHED: 2,
};

const initialFormState = {
  // [FormKeys.NAME]: '',
  // [FormKeys.TIMEZONE]: null,
  [FormKeys.START_DATE]: '',
  [FormKeys.END_DATE]: '',
  [FormKeys.RENEWAL_DATE]: '',
  [FormKeys.SELECTED_DATE_TYPE]: FormKeys.RENEWAL_DATE,
  [FormKeys.RENEWAL_REMINDER_DAYS]: defaultRenewalDays,
  [FormKeys.AUTO_RENEWAL]: false,
};

const inititalFileInfoState = { file: null, name: '', size: null, error: null };

const getPublishPayload = ({
  formData,
  fileInfo,
  areDatesFilled,
  isPublishingWithSign,
  // isUploadAfterPublishFlow,
  isReplaceSignedContractFlow,
}) => {
  const payload = new FormData();

  if (isReplaceSignedContractFlow) {
    payload.append('file', fileInfo.file);
    return payload;
  }

  const dates = {
    startDate: formatDayJsDate(formData.startDate, 'date'),
    endDate: formatDayJsDate(
      formData?.[FormKeys.SELECTED_DATE_TYPE] === FormKeys.END_DATE
        ? formData.endDate
        : formData?.[FormKeys.RENEWAL_DATE],
      'date',
    ),
  };
  if (isPublishingWithSign) payload.append('file', fileInfo.file);

  if (!areDatesFilled) {
    payload.append(`startDate`, dates.startDate);
    payload.append(`endDate`, dates.endDate);
  }

  if (!areDatesFilled)
    payload.append(
      FormKeys.SELECTED_DATE_TYPE,
      formData?.[FormKeys.SELECTED_DATE_TYPE] === FormKeys.END_DATE
        ? SelectedDateTpeContract.oneTime
        : SelectedDateTpeContract.onGoing,
    );

  if (!areDatesFilled && formData?.[FormKeys.SELECTED_DATE_TYPE] === FormKeys.RENEWAL_DATE) {
    payload.append(FormKeys.RENEWAL_REMINDER_DAYS, formData?.[FormKeys.RENEWAL_REMINDER_DAYS]);

    payload.append(FormKeys.AUTO_RENEWAL, formData?.[FormKeys.AUTO_RENEWAL]);
  }

  // if (!isUploadAfterPublishFlow)
  // payload.append(
  //   'publishingStatus',
  //   isPublishingWithSign
  //     ? publishStatuses.PUBLISHED_WITH_SIGN
  //     : publishStatuses.PUBLISHED_WITHOUT_SIGN,
  // );
  return payload;
};

const PublishContractModal = ({
  openHandle,
  closeHandle,
  action,
  dealId,
  areDatesFilled,
  setContractData,
  isUploadAfterPublishFlow,
  isEventPlan,
  franchiseId,
  setData,
  contractData,
  enableOccurences = false,
}) => {
  /**
   * get today date and time
   */
  const today = dayjs();

  const classes = useStyles();
  const { t } = useTranslation();
  const { dateFormat } = useSelector(getDisplayConfiguration);
  // const NA = t('commonText.nA');

  const { getLabel } = useTenantLabel();

  const [fileInfo, setFileInfo] = useState(inititalFileInfoState);
  const [formData, setFormData] = useState(initialFormState);
  const [errorMessages, setErrorMessages] = useState({});
  const [isPublishingContract, setIsPublishingContract] = useState(false);

  const isPublishingWithSign = action === ContractActions.PUBLISH_WITH_SIGN;
  const isNoFileOrDateRequired = !isPublishingWithSign && !formData.length;
  const isReplaceSignedContractFlow = action === ContractActions.REPLACE_SIGNED_CONTRACT;
  const isUploadFileFlow = isPublishingWithSign || isReplaceSignedContractFlow;

  const showDates = !isReplaceSignedContractFlow && !isUploadAfterPublishFlow && !areDatesFilled;

  const contractType = contractTypeEnum[contractData?.details?.type] || contractTypeEnum.default;

  const showChanges = contractType === contractTypeEnum.addendum;

  const actualContractDates =
    contractType === contractTypeEnum.addendum ? contractData?.details?.actualContractDates : {};

  const handleModalClose = () => {
    setErrorMessages({});
    setFileInfo(inititalFileInfoState);
    setFormData({});
    closeHandle();
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

  const removeErrorKey = (keyName) => {
    setErrorMessages((prevState) => {
      const { [keyName]: _, ...rest } = prevState;
      return rest;
    });
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
  }, [enableOccurences, formData[FormKeys.START_DATE]]);

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

  const getError = (key) => {
    return errorMessages[key];
  };

  const _handleFileChange = async (event) => {
    const file = event.target.files[0];
    const { name, size } = file;
    const sizeInMB = (size / (1024 * 1024)).toFixed(2);

    /**
     * show error if file size exce
     */
    if (sizeInMB > 15) {
      toast.error(t('sales.commonText.fileSizeLimit15'), {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
      event.target.value = '';
      return;
    }

    if (!file) {
      setIsUploadingError(true);
      return;
    }

    setFileInfo({ file, name, size: sizeInMB, error: null });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    let validatePayload = {
      startDate: formatDayJsDate(formData.startDate, 'date'),
      // endDate: formatDayJsDate(formData.endDate, 'date'),
      // renewalDate: formatDayJsDate(formData.endDate, 'date'),
      [FormKeys.AUTO_RENEWAL]: formData?.[FormKeys.AUTO_RENEWAL] || false,
      [FormKeys.RENEWAL_REMINDER_DAYS]:
        formData?.[FormKeys.RENEWAL_REMINDER_DAYS] || defaultRenewalDays,
      [FormKeys.SELECTED_DATE_TYPE]: formData?.[FormKeys.SELECTED_DATE_TYPE],
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
    };

    if (contractType === contractTypeEnum.addendum && showDates) {
      let effectiveDate = formData?.[FormKeys.START_DATE];
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
          [FormKeys.START_DATE]: `Date must be greater than today and less than ${formData?.[FormKeys.SELECTED_DATE_TYPE]}`,
        }));
        return;
      }
    }

    validatePayload = removeKeysFromObject(validatePayload, [
      formData?.[FormKeys.SELECTED_DATE_TYPE] === FormKeys.END_DATE
        ? FormKeys.RENEWAL_DATE
        : FormKeys.END_DATE,
    ]);

    let errors;

    if (!areDatesFilled)
      errors = await joiValidateErrors({
        data: validatePayload,
        t,
      });

    let isError = false;
    if (errors) {
      setErrorMessages(errors);
      isError = true;
    }

    if (isUploadFileFlow && !fileInfo.file) {
      setFileInfo({ ...fileInfo, error: FileErrors.NOT_ATTACHED });
      isError = true;
    }

    if (isError) return;

    try {
      setIsPublishingContract(true);
      const payload = getPublishPayload({
        formData,
        fileInfo,
        areDatesFilled,
        isPublishingWithSign,
        isUploadAfterPublishFlow,
        isReplaceSignedContractFlow,
      });

      // Check if FormData is empty
      const isFormDataEmpty = [...payload.entries()].length === 0;

      const response = await publishContract(dealId, isFormDataEmpty ? {} : payload);
      if (response.statusCode === 200) {
        setContractData(response?.data?.contract);
        /**
         * update amount in deal detail
         */
        setData((prevData) => ({
          ...prevData,
          amount: response?.data?.contract?.details?.amount,
        }));
        toast.success(response?.message, {
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
      }
      handleModalClose();
    } catch (error) {
      if (error?.errorObj?.contract_duty_days_conflict) {
        history.push(`${SALES_DEAL}/${dealId}/contract/${franchiseId}`);

        toast.error(error?.message, {
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
        return;
      }
      /**
       * if cycle reference date is not between start and enddate of contract
       */
      if (error?.errorObj?.cycle_ref_date_error) {
        history.push({
          pathname: `${SALES_DEAL}/${dealId}/contract/${franchiseId}`,
          state: { cycltRefError: true },
        });
      }
      // use the following url to redirect
      // sales/deals/deal/${dealId}/contract/${contractId}
      /**
       * show error
       */
      toast.error(error?.message, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    } finally {
      setIsPublishingContract(false);
    }
  };

  const getModalTypography = () => {
    if (isReplaceSignedContractFlow)
      return {
        title: t('sales.contract.signModalReplaceSignedContractTitle'),
        text: t('sales.contract.signModalReplaceSignedContractText'),
        confirmButtonText: t('sales.contract.replaceCopy'),
      };
    if (isUploadAfterPublishFlow)
      return {
        title: t('sales.contract.signModalUploadAfterPublishTitle'),
        text: t('sales.contract.signModalUploadAfterPublishText'),
        confirmButtonText: t('sales.contract.uploadContract'),
      };
    if (isNoFileOrDateRequired)
      return {
        title: t('sales.contract.signModal'),
        text: t('sales.contract.signModalNoFileOrDateText', {
          brandName: getLabel('terms', 'brand') || 'Edge 2.0',
        }),
        confirmButtonText: t('sales.contract.publishContract'),
      };
    return {
      title: t('sales.contract.signModalTitle'),
      text: t('sales.contract.signModalText', {
        brandName: getLabel('terms', 'brand') || 'Edge 2.0',
      }),
      confirmButtonText: t('sales.contract.publishContract'),
    };
  };

  const modal = getModalTypography();

  return (
    <>
      {isPublishingContract && (
        <LoaderComponent size={50} color={'primary'} label={t('sales.loading')} />
      )}
      <Modal
        open={openHandle}
        onClose={handleModalClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box
          className={
            showChanges && isPublishingWithSign ? classes.converModal : classes.converModalShorten
          }
          sx={style}
          component="form"
          onSubmit={handleFormSubmit}
        >
          {/* section check tru? */}
          <Box className={classes.boxHeader}>
            <WarningIcon className={classes.warnIcon} />
            <Box className={classes.titlehead}>
              <Typography variant="h4" className={classes.sidetitle}>
                {modal.title}
              </Typography>
            </Box>
            <Typography variant="body2" className={classes.bulkSubHeading}>
              {modal.text}
            </Typography>
          </Box>
          <Box className={classes.converInner}>
            <Box className={showChanges && isPublishingWithSign ? classes.modalGrid : ''}>
              {showChanges && (
                <Box className={classes.serviceSide}>
                  <ContractAddendumServices dealId={dealId} />
                </Box>
              )}
              <Box className={classes.formSide}>
                {showDates && (
                  <Box className={classes.dateWrapper}>
                    <Typography variant="subtitle2">
                      {t('sales.contract.contractDuration')}
                    </Typography>
                    <Box className={classes.sideBySideCol}>
                      <Box>
                        <InputLabel htmlFor="date">{t('sales.contract.addStartDate')}</InputLabel>
                        <ResponsiveDatePickers
                          value={
                            formData[FormKeys.START_DATE]
                              ? convertMMDDYYYYToDayJsDate(formData[FormKeys.START_DATE], false)
                              : null
                          }
                          onChange={(value) =>
                            handleDateChange({ name: FormKeys.START_DATE, value })
                          }
                          minDate={
                            contractType === contractTypeEnum.addendum
                              ? today.add(1, 'd')
                              : isEventPlan && formData[FormKeys.END_DATE]
                                ? convertMMDDYYYYToDayJsDate(
                                    formData[FormKeys.END_DATE],
                                    false,
                                  ).subtract(1, 'd')
                                : today
                          }
                          maxDate={
                            contractType === contractTypeEnum.addendum
                              ? convertMMDDYYYYToDayJsDate(
                                  actualContractDates?.endDate,
                                  false,
                                ).subtract(1, 'd')
                              : formData[FormKeys.END_DATE]
                                ? convertMMDDYYYYToDayJsDate(
                                    formData[FormKeys.END_DATE],
                                    false,
                                  ).subtract(1, 'd')
                                : null
                          }
                          placeholder={t('sales.contract.datePlaceholder')}
                          format={dateFormat}
                          inputFormat={dateFormat}
                          error={!!getError(FormKeys.START_DATE)}
                          helperText={getError(FormKeys.START_DATE)}
                        />
                      </Box>
                      <Box>
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
                      </Box>
                      {formData?.[FormKeys.SELECTED_DATE_TYPE] === FormKeys.END_DATE ? (
                        // Show End Date
                        <>
                          <Box className={classes?.fieldWrapper}>
                            <InputLabel>{t('sales.deals.endDate')}</InputLabel>
                            <ResponsiveDatePickers
                              value={
                                formData[FormKeys.END_DATE]
                                  ? convertMMDDYYYYToDayJsDate(formData[FormKeys.END_DATE], false)
                                  : null
                              }
                              minDate={
                                enableOccurences && formData[FormKeys.START_DATE]
                                  ? convertMMDDYYYYToDayJsDate(formData[FormKeys.START_DATE], false)
                                      .add(1, 'year')
                                      .add(1, 'year')
                                  : formData[FormKeys.START_DATE]
                                    ? convertMMDDYYYYToDayJsDate(
                                        formData[FormKeys.START_DATE],
                                        false,
                                      ).add(1, 'd')
                                    : null
                              }
                              maxDate={
                                enableOccurences && formData[FormKeys.START_DATE]
                                  ? convertMMDDYYYYToDayJsDate(
                                      formData[FormKeys.START_DATE],
                                      false,
                                    ).add(1, 'year')
                                  : null
                              }
                              onChange={(value) =>
                                handleDateChange({ name: FormKeys.END_DATE, value })
                              }
                              disabled={enableOccurences || !formData[FormKeys.START_DATE]}
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
                            <InputLabel>{t('sales.deals.renewalDate')}</InputLabel>
                            <ResponsiveDatePickers
                              value={
                                formData[FormKeys.RENEWAL_DATE]
                                  ? convertMMDDYYYYToDayJsDate(
                                      formData[FormKeys.RENEWAL_DATE],
                                      false,
                                    )
                                  : null
                              }
                              minDate={
                                enableOccurences && formData[FormKeys.START_DATE]
                                  ? convertMMDDYYYYToDayJsDate(
                                      formData[FormKeys.START_DATE],
                                      false,
                                    ).add(1, 'year')
                                  : formData[FormKeys.START_DATE]
                                    ? convertMMDDYYYYToDayJsDate(
                                        formData[FormKeys.START_DATE],
                                        false,
                                      ).add(1, 'd')
                                    : null
                              }
                              maxDate={
                                enableOccurences && formData[FormKeys.START_DATE]
                                  ? convertMMDDYYYYToDayJsDate(
                                      formData[FormKeys.START_DATE],
                                      false,
                                    ).add(1, 'year')
                                  : null
                              }
                              onChange={(value) =>
                                handleDateChange({ name: FormKeys.RENEWAL_DATE, value })
                              }
                              disabled={enableOccurences || !formData[FormKeys.START_DATE]}
                              placeholder={`${t('sales.deals.selectRenewalDate')}`}
                              format={dateFormat}
                              inputFormat={dateFormat}
                              error={!!getError(FormKeys.RENEWAL_DATE)}
                              helperText={getError(FormKeys.RENEWAL_DATE)}
                              className={classes.createdDatePicker}
                            />
                          </Box>
                          <Box className={classes.addOfficerCheckbox}>
                            <Checkbox
                              id="allow-officer"
                              name={FormKeys.AUTO_RENEWAL}
                              onChange={autoRenewalChecked}
                              icon={<CheckBoxRegularIcon />}
                              checkedIcon={<CheckBoxCheckedIcon />}
                              className={classes.checkBoxCustom}
                            />
                            <Typography
                              variant="body2"
                              className={classes?.previewQuestionOptionText}
                            >
                              {t('sales.deals.autoRenewalOfContract')}
                            </Typography>
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
                              className={classes?.textFiledFilter}
                              placeholder={defaultRenewalDays}
                              fullWidth
                              value={formData[FormKeys.RENEWAL_REMINDER_DAYS]}
                              onChange={inputChangedHandler}
                              onBlur={checkMinMaxOfRenewal}
                              error={!!getError(FormKeys.RENEWAL_REMINDER_DAYS)}
                              helperText={getError(FormKeys.RENEWAL_REMINDER_DAYS)}
                              disabled={formData?.[FormKeys.AUTO_RENEWAL]}
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
                      {/*<Box>*/}
                      {/*  <InputLabel htmlFor="date">{t('sales.contract.addEndDate')}</InputLabel>*/}
                      {/*  <ResponsiveDatePickers*/}
                      {/*    value={*/}
                      {/*      formData[FormKeys.END_DATE]*/}
                      {/*        ? convertMMDDYYYYToDayJsDate(formData[FormKeys.END_DATE])*/}
                      {/*        : null*/}
                      {/*    }*/}
                      {/*    minDate={*/}
                      {/*      formData[FormKeys.START_DATE]*/}
                      {/*        ? convertMMDDYYYYToDayJsDate(formData[FormKeys.START_DATE]).add(1, 'd')*/}
                      {/*        : null*/}
                      {/*    }*/}
                      {/*    /***/}
                      {/*     * only add maxDate check if plan is selected as EVENT*/}
                      {/*     */}
                      {/*    maxDate={*/}
                      {/*      isEventPlan && formData[FormKeys.START_DATE]*/}
                      {/*        ? convertMMDDYYYYToDayJsDate(formData[FormKeys.START_DATE]).add(6, 'd')*/}
                      {/*        : null*/}
                      {/*    }*/}
                      {/*    onChange={(value) => handleDateChange({ name: FormKeys.END_DATE, value })}*/}
                      {/*    disabled={!formData[FormKeys.START_DATE]}*/}
                      {/*    placeholder={t('sales.contract.datePlaceholder')}*/}
                      {/*    format={dateFormat}*/}
                      {/*    inputFormat={dateFormat}*/}
                      {/*    error={!!getError('renewalDate')}*/}
                      {/*    helperText={getError('renewalDate')}*/}
                      {/*  />*/}
                      {/*</Box>*/}
                    </Box>
                  </Box>
                )}
                {/*{isUploadFileFlow && (*/}
                {/*  <>*/}
                {/*    {!isUploadAfterPublishFlow && !isReplaceSignedContractFlow && (*/}
                {/*      <Box className={classes.FileUploader}>*/}
                {/*        <Typography variant="subtitle2">*/}
                {/*          {t('sales.contract.fileUplaod')}*/}
                {/*        </Typography>*/}
                {/*      </Box>*/}
                {/*    )}*/}
                {/*    {fileInfo.file ? (*/}
                {/*      <Box className={classes.accordionData}>*/}
                {/*        <Box className={classes.attachSuccess}>*/}
                {/*          <Box className={classes.attachSuccessInner}>*/}
                {/*            <Featuredicon className={classes.attachIcons} />*/}
                {/*            <Box className={classes.attachNameWrap}>*/}
                {/*              <Typography className={classes.attachName}>*/}
                {/*                {fileInfo.name}*/}
                {/*              </Typography>*/}
                {/*              <Typography*/}
                {/*                className={classes.attachSize}*/}
                {/*              >{`${fileInfo.size}${t('sales.commonText.mb')}`}</Typography>*/}
                {/*            </Box>*/}
                {/*          </Box>*/}
                {/*          <Box className={classes.deleIcons}>*/}
                {/*            <DeleteIcon*/}
                {/*              onClick={() => setFileInfo(inititalFileInfoState)}*/}
                {/*              sx={{ color: 'red' }}*/}
                {/*            />*/}
                {/*          </Box>*/}
                {/*        </Box>*/}
                {/*      </Box>*/}
                {/*    ) : (*/}
                {/*      <Box className={classes.uploadBtnImg}>*/}
                {/*        <input*/}
                {/*          type="file"*/}
                {/*          accept=".pdf, .doc, .docx"*/}
                {/*          onChange={handleFileChange}*/}
                {/*          id="file-input"*/}
                {/*          className={classes.fileUpload}*/}
                {/*        />*/}
                {/*        <label htmlFor="file-input">*/}
                {/*          <Button variant="onlyText" component="span">*/}
                {/*            <UploadSVGIcon className={classes.uploadSvg} />*/}
                {/*          </Button>*/}
                {/*        </label>*/}
                {/*        {fileInfo.error === FileErrors.NOT_ATTACHED && (*/}
                {/*          <Typography variant="body2" className={classes.errorMessage}>*/}
                {/*            {t('sales.commonText.fileNotAttached')}*/}
                {/*          </Typography>*/}
                {/*        )}*/}
                {/*      </Box>*/}
                {/*    )}*/}
                {/*  </>*/}
                {/*)}*/}
              </Box>
            </Box>
          </Box>

          <Box className={classes.sidefooter}>
            <Button
              variant="secondaryGrey"
              className={classNames(classes.blessbtn, classes.btn)}
              onClick={handleModalClose}
            >
              {t('sales.contract.cancel')}
            </Button>
            <Button
              type="submit"
              variant="primary"
              className={classNames(classes.bluebtn, classes.btn)}
            >
              {modal.confirmButtonText}
            </Button>
          </Box>
        </Box>
      </Modal>
    </>
  );
};

PublishContractModal.propTypes = {
  openHandle: PropTypes.func,
  closeHandle: PropTypes.func,
  setContractData: PropTypes.func,
  contractData: PropTypes.object,
  action: PropTypes.string,
  areDatesFilled: PropTypes.bool,
  isUploadAfterPublishFlow: PropTypes.bool,
  isEventPlan: PropTypes.bool,
  dealId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  franchiseId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  setData: PropTypes.func,
  enableOccurences: PropTypes.bool,
};

export default PublishContractModal;
