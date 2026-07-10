import { Box, Button, InputLabel, Skeleton, TextField, Typography } from '@mui/material';
import classNames from 'classnames';
import { EditorState } from 'draft-js';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import CustomDropDown from 'src/app/components/common/customDropDown';
import PhoneNumberWithCountry from 'src/app/components/common/phoneNumberWithCountry';
import RichTextEditor, { convertDataToHtml } from 'src/app/components/common/richText';
import SideDrawer from 'src/app/components/common/sideDrawer';
import { OBX_DISPATCH } from 'src/app/router/constant/ROUTE';
import history from 'src/app/router/utils/history';
import { isObjectEmpty } from 'src/helper/utilityFunctions';
import useFormHook from 'src/hooks/useFormHook';
import usePersistentApiData from 'src/hooks/usePresistantApiData';
import { createDispatch, getDispatchTypes } from 'src/services/dispatch.services';
import { getAllTypeOfSites, getSitesInstructions } from 'src/services/sites.services';
import transformArrayForOptions from 'src/utils/array/transformArrayForOptions';
import { toastSettings } from 'src/utils/constants';
import joiValidate from 'src/utils/formValidator/formValidator.requiredCheck';

import {
  callerRequestOfficerCallBackOptions,
  callFromMonitoringServiceTypeOptions,
} from '../helper';
import CallerHistoryDrawer from './components/callerHistoryDrawer';
import { useStyles } from './createDispatch';

const initialFormData = {
  site: {},
  dispatchType: {},
  callerName: '',
  callerAddress: '',
  buildingNumber: '',
  apartmentNumber: '',
  callerRequest: '',
  dispatchDescription: EditorState.createEmpty(),
  callerRequestOfficerCallBack: {},
  callFromMonitoringServiceType: {},
  callerPhoneNumber: '',
};

// Status Enum
const DISPATCH_STATUS_ENUM = {
  NEW_ALARM: 'new_alarm',
};

const CreateDispatch = () => {
  const classes = useStyles();
  const { t } = useTranslation();
  const [showDrawer, setShowDrawer] = useState(false);
  const [allSites, setAllSites] = useState([]);
  const [isSitesLoading, setIsSitesLoading] = useState(true);
  const [instructions, setInstructions] = useState({});
  const franchiseId = useSelector((state) => state.auth.franchiseId);
  const currentUser = useSelector((state) => state.user.info.name);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { handleInputChange, errorMessages, setErrorMessages, formData } = useFormHook({
    defaultFormData: initialFormData,
  });

  const { data: DISPATCH_TYPE_ENUM, loading: typesLoading } = usePersistentApiData(
    'dispatch-types',
    getDispatchTypes,
  );
  const DISPATCH_TYPE_OPTIONS = Object.keys(DISPATCH_TYPE_ENUM || {}).map((key) => ({
    value: key,
    label: DISPATCH_TYPE_ENUM[key],
  }));

  const handlePhoneNumber = (event) => {
    if (!event) return;
    handleInputChange({
      target: {
        value: event,
        name: t('obx.dispatch.callerPhoneNumberKey'),
      },
    });
  };

  const fetchSitesInstruction = async () => {
    try {
      const response = await getSitesInstructions(formData?.site?.id, {
        instructionType: 'dispatch',
      });

      if (response?.statusCode === 200) {
        if (!isObjectEmpty(response?.data?.instruction)) {
          setInstructions(response?.data?.instruction);
        }
      }
    } catch {
      setInstructions({});
    }
  };

  const fetchAllSites = async () => {
    try {
      const response = await getAllTypeOfSites();

      if (response?.statusCode === 200) {
        let transformedSites =
          transformArrayForOptions(response?.data?.sites, 'name', 'id', 'address') || [];
        setAllSites([...transformedSites]);
      }
    } catch (error) {
      toast.error(error?.message, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    } finally {
      setIsSitesLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      const validatePayload = {
        site: formData?.site?.id || null,
        dispatchType: formData?.dispatchType?.value || null,
        callerPhoneNumber: formData?.callerPhoneNumber || null,
        callerName: formData?.callerName || null,
        callerAddress: formData?.callerAddress || null,
        dispatchDescription: convertDataToHtml(formData?.dispatchDescription) || null,
        callerRequestOfficerCallBack: formData.callerRequestOfficerCallBack.value ?? false,
      };
      const errors = await joiValidate(validatePayload, t);
      if (errors && Object.keys(errors).length) {
        setErrorMessages(errors);
        return;
      }

      const payload = {
        siteId: formData?.site?.id,
        dispatchType: formData?.dispatchType?.value,
        status: DISPATCH_STATUS_ENUM.NEW_ALARM,
        callerDetails: {
          phoneNumber: formData?.callerPhoneNumber,
          buildingNumber: formData?.buildingNumber,
          apartmentNumber: formData?.apartmentNumber,
          name: formData?.callerName,
          address: formData?.callerAddress,
          monitoringServiceType: formData?.callFromMonitoringServiceType?.value,
        },
        createdBy: currentUser,
        description: convertDataToHtml(formData?.dispatchDescription),
        callback: formData.callerRequestOfficerCallBack.value,
        franchiseId,
      };
      const response = await createDispatch(payload);
      if (response && response.statusCode === 200) {
        history.push(OBX_DISPATCH);
        toast.success(response?.message, {
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
      }
    } catch (error) {
      toast.error(error?.message, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!allSites.length) fetchAllSites();
    if (!isObjectEmpty(formData.site)) fetchSitesInstruction();
  }, [formData.site.id]);

  return (
    <Box className={classes.mainCreateWraper}>
      <Box className={classNames(classes.dispatchMainWrapper, 'innerScrollBar')}>
        <Box className={classes.CreateDispatchWrapper}>
          <Typography variant="body1" className={classes.mainHeading}>
            {`${t('obx.dispatch.dispatchDetails')}`}
          </Typography>
          <Box className={classes.rowGaps}>
            {!isSitesLoading ? (
              <Box className={classes.rowField}>
                <InputLabel
                  htmlFor={t('obx.dispatch.site')}
                >{`${t('obx.dispatch.select')} ${t('obx.dispatch.site')}`}</InputLabel>
                <CustomDropDown
                  maxWidth="700px"
                  searchPlaceholder={`${t('obx.dispatch.searchByNameOrAddress')}`}
                  label={t('obx.dispatch.site')}
                  placeHolder={`${t('obx.dispatch.searchByNameOrAddress')}`}
                  name={t('obx.dispatch.siteKey')}
                  selectedValues={formData.site || {}}
                  options={allSites || []}
                  handleChange={handleInputChange}
                  searchable
                  bordered
                  className={classes.dropdownWrap}
                  isError={!!errorMessages[t('obx.dispatch.siteKey')]}
                />
                {errorMessages && (
                  <Box className={classes.invalidFeedback}>
                    {!!errorMessages[t('obx.dispatch.siteKey')]
                      ? errorMessages[t('obx.dispatch.siteKey')]
                      : null}
                  </Box>
                )}
              </Box>
            ) : (
              <Skeleton className={classes.dropDownSkeleton} />
            )}
            {formData?.site?.address && (
              <Box className={classes.rowField}>
                <Box className={classes.rowFieldInline}>
                  <InputLabel>{`${t('obx.dispatch.siteAddress')} :`}</InputLabel>
                  <Typography variant="body2">{formData?.site?.address}</Typography>
                </Box>
              </Box>
            )}
            {formData?.site?.id && !isObjectEmpty(instructions) && (
              <Box className={classes.rowField}>
                <Box className={classes.rowFieldBlueBox}>
                  <Typography>{`${t('obx.dispatch.dispatchPostOrders')}`}</Typography>
                  <Typography className={classes.text}>
                    {' '}
                    <Box
                      dangerouslySetInnerHTML={{
                        __html: instructions?.content,
                      }}
                    />
                  </Typography>
                </Box>
              </Box>
            )}
            <Box className={classes.rowField}>
              <InputLabel htmlFor={t('obx.dispatch.dispatchType')}>
                {t('obx.dispatch.dispatchType')}
              </InputLabel>
              <CustomDropDown
                label={t('obx.dispatch.dispatchType')}
                placeHolder={`${t('obx.dispatch.select')} ${t('obx.dispatch.dispatchType')}`}
                name={t('obx.dispatch.dispatchTypeKey')}
                selectedValues={formData?.dispatchType || {}}
                options={[...DISPATCH_TYPE_OPTIONS]}
                handleChange={handleInputChange}
                searchable
                bordered
                isLoading={typesLoading}
                className={classes.dropdownWrap}
                isError={!!errorMessages[t('obx.dispatch.dispatchTypeKey')]}
              />
              {errorMessages && (
                <Box className={classes.invalidFeedback}>
                  {!!errorMessages[t('obx.dispatch.dispatchTypeKey')]
                    ? errorMessages[t('obx.dispatch.dispatchTypeKey')]
                    : null}
                </Box>
              )}
            </Box>
          </Box>
          <Box className={classes.rowGaps}>
            <Typography variant="body1" className={classes.mainHeading}>
              {`${t('obx.dispatch.callerDetails')}`}
            </Typography>
            <Box className={classes.rowField}>
              <InputLabel>{t('obx.dispatch.callerPhoneNumber')}</InputLabel>
              <PhoneNumberWithCountry
                value={formData.callerPhoneNumber}
                onChange={handlePhoneNumber}
                name={t('obx.dispatch.callerPhoneNumberKey')}
                className={classes.countryPhnNumber}
                isError={!!errorMessages?.callerPhoneNumber}
              />
              {errorMessages && (
                <Box className={classes.invalidFeedback}>
                  {!!errorMessages[t('obx.dispatch.callerPhoneNumberKey')]
                    ? errorMessages[t('obx.dispatch.callerPhoneNumberKey')]
                    : null}
                </Box>
              )}
              {/* <Button
                variant="onlyText"
                className={classes.callHistory}
                disableRipple
                onClick={() => setShowDrawer(true)}
              >
                View 5 Previous Calls
              </Button> */}
            </Box>
            <Box className={classes.rowField}>
              <InputLabel>{t('obx.dispatch.callerName')}</InputLabel>
              <TextField
                className={classes.fullWidth}
                name={t('obx.dispatch.callerNameKey')}
                placeholder={`${t('obx.dispatch.type')} ${t('obx.dispatch.callerName')}`}
                type="text"
                onChange={handleInputChange}
                value={formData?.callerName}
                error={!!errorMessages?.callerName}
                helperText={errorMessages?.callerName ? errorMessages?.callerName : null}
              />
            </Box>
            <Box className={classes.rowField}>
              <InputLabel>{t('obx.dispatch.callerAddress')}</InputLabel>
              <TextField
                className={classes.fullWidth}
                name={t('obx.dispatch.callerAddressKey')}
                placeholder={`${t('obx.dispatch.type')} ${t('obx.dispatch.callerAddress')}`}
                type="text"
                onChange={handleInputChange}
                value={formData?.callerAddress}
                error={!!errorMessages?.callerAddress}
                helperText={errorMessages?.callerAddress ? errorMessages?.callerAddress : null}
              />
            </Box>
            <Box className={classes.rowField}>
              <Box className={classes.rowFieldTwo}>
                <Box>
                  <InputLabel>{t('obx.dispatch.buildingNumber')}</InputLabel>
                  <TextField
                    className={classes.fullWidth}
                    name={t('obx.dispatch.buildingNumberKey')}
                    placeholder={`${t('obx.dispatch.type')} ${t('obx.dispatch.buildingNumber')}`}
                    type="text"
                    onChange={handleInputChange}
                    value={formData?.buildingNumber}
                    error={!!errorMessages?.buildingNumber}
                    helperText={
                      errorMessages?.buildingNumber ? errorMessages?.buildingNumber : null
                    }
                  />
                </Box>
                <Box>
                  <InputLabel>{t('obx.dispatch.apartmentNumber')}</InputLabel>
                  <TextField
                    className={classes.fullWidth}
                    name={t('obx.dispatch.apartmentNumberKey')}
                    placeholder={`${t('obx.dispatch.type')} ${t('obx.dispatch.apartmentNumber')}`}
                    type="text"
                    onChange={handleInputChange}
                    value={formData?.apartmentNumber}
                    error={!!errorMessages?.apartmentNumber}
                    helperText={
                      errorMessages?.apartmentNumber ? errorMessages?.apartmentNumber : null
                    }
                  />
                </Box>
              </Box>
            </Box>

            <Box className={classes.rowField}>
              <Box className={classes.rowFieldTwo}>
                <Box>
                  <InputLabel htmlFor={t('obx.dispatch.callerRequestOfficerCallBack')}>
                    {t('obx.dispatch.callerRequestOfficerCallBack')}
                  </InputLabel>
                  <CustomDropDown
                    label={t('obx.dispatch.callerRequestOfficerCallBack')}
                    placeHolder={`${t('obx.dispatch.select')}`}
                    name={t('obx.dispatch.callerRequestOfficerCallBackKey')}
                    options={callerRequestOfficerCallBackOptions}
                    selectedValues={formData?.callerRequestOfficerCallBack}
                    bordered
                    className={classes.dropdownWrap}
                    handleChange={handleInputChange}
                    isError={!!errorMessages[t('obx.dispatch.callerRequestOfficerCallBackKey')]}
                  />
                  {errorMessages && (
                    <Box className={classes.invalidFeedback}>
                      {!!errorMessages[t('obx.dispatch.callerRequestOfficerCallBackKey')]
                        ? errorMessages[t('obx.dispatch.callerRequestOfficerCallBackKey')]
                        : null}
                    </Box>
                  )}
                </Box>
                <Box>
                  <InputLabel htmlFor={t('obx.dispatch.callFromMonitoringServiceType')}>
                    {t('obx.dispatch.callFromMonitoringServiceType')}
                  </InputLabel>
                  <CustomDropDown
                    label={t('obx.dispatch.callFromMonitoringServiceType')}
                    placeHolder={`${t('obx.dispatch.select')}`}
                    name={t('obx.dispatch.callFromMonitoringServiceTypeKey')}
                    options={callFromMonitoringServiceTypeOptions}
                    selectedValues={formData?.callFromMonitoringServiceType}
                    bordered
                    className={classes.dropdownWrap}
                    handleChange={handleInputChange}
                    isError={!!errorMessages[t('obx.dispatch.callFromMonitoringServiceTypeKey')]}
                  />
                  {errorMessages && (
                    <Box className={classes.invalidFeedback}>
                      {!!errorMessages[t('obx.dispatch.callFromMonitoringServiceTypeKey')]
                        ? errorMessages[t('obx.dispatch.callFromMonitoringServiceTypeKey')]
                        : null}
                    </Box>
                  )}
                </Box>
              </Box>
            </Box>

            <Box className={classes.rowField}>
              <RichTextEditor
                handleChange={(event) => handleInputChange(event)}
                name={t('obx.dispatch.dispatchDescriptionKey')}
                placeholder={t('obx.dispatch.rictTextPlaceholder')}
                value={formData?.dispatchDescription || EditorState.createEmpty()}
                className={classes.richText}
                error={!!errorMessages?.dispatchDescription}
              />
              {!!errorMessages?.dispatchDescription && (
                <Typography className={classes.errorMessage}>
                  {errorMessages.dispatchDescription}
                </Typography>
              )}
            </Box>
          </Box>
        </Box>
      </Box>
      <Box className={classes.bottomButtons}>
        <Button variant="secondaryGrey" onClick={() => history.goBack()} disableRipple>
          {t('obx.dispatch.cancel')}
        </Button>
        <Button variant="primary" disabled={isSubmitting} disableRipple onClick={handleSubmit}>
          {t('obx.dispatch.createDispatch')}
        </Button>
      </Box>
      <SideDrawer isOpen={showDrawer} totalWidth={'920px'}>
        <CallerHistoryDrawer showDrawer={showDrawer} setShowDrawer={setShowDrawer} />
      </SideDrawer>
    </Box>
  );
};

export default CreateDispatch;
