import { Box, Button, Chip, InputLabel, Skeleton, TextField, Typography } from '@mui/material';
import { SignalIcon } from 'assets/svg';
import classNames from 'classnames';
import dayjs from 'dayjs';
import { t } from 'i18next';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import CustomDropDown from 'src/app/components/common/customDropDown';
import ResponsiveDatePickers from 'src/app/components/common/datePicker';
import LoaderComponent from 'src/app/components/common/loader';
import { ReactComponent as PlusIcon } from 'src/assets/svg/plus.svg';
import { isObjectEmpty } from 'src/helper/utilityFunctions';
import {
  createNewInvoice,
  getFranchiseSiteContracts,
  getFranchiseSites,
  getInvoice,
  updateInvoice,
} from 'src/services/invoice.services';
import transformArrayForOptions from 'src/utils/array/transformArrayForOptions';
import { toastSettings } from 'src/utils/constants';
import { PaymentTerms } from 'src/utils/constants/index';
import { formatIsoDateToMmDdYyyy } from 'src/utils/date';
import joiValidate from 'src/utils/formValidator/formValidator.requiredCheck';
import { formatNumber } from 'src/utils/regexField/regexFiledForm';
import { toaster } from 'src/utils/toast';

import {
  dayjsWithStandardOffset,
  getCurrentTimeWithDisabledDlsInIso,
} from '../../../schedules/helper';
import { useStyles } from './invoiceDrawer';
import LineItemTable from './listing';
const InvoiceDrawer = ({ setShowDrawer, selectedInvoice, setSelectedInvoice, refetchData }) => {
  const classes = useStyles();
  const params = {
    site: {},
    invoiceDate: null,
    dueDate: null,
    periodStart: null,
    periodEnd: null,
    contract: {},
    paymentTerm: {},
    poNumber: '',
  };
  const initialLineItems = {
    id: null,
    sageItem: null,
    quantity: 0,
    description: '',
    price: 0,
    index: 0,
    total: '',
    _destroy: false,
  };
  const siteContractBill = {
    billTo: {},
    sites: {},
    contracts: {},
  };
  const initialEditInvoice = {
    contractDetails: {},
    billingDetails: {},
    invoiceNumber: '',
    poNumber: '',
  };
  const [queryParams, _setQueryParams] = useState(params);
  const [invoiceSitesContracts, setInvoiceSitesContracts] = useState(siteContractBill);
  const [lineItems, setLineItems] = useState([initialLineItems]);
  const [errorMessages, setErrorMessages] = useState({});
  const [loading, setLoading] = useState(false);
  const [invoiceLoading, setLoadingInvoice] = useState(true);
  const [existingInvoice, setExistingInvoice] = useState(initialEditInvoice);
  const [deletedLineItems, setDeletedLineItems] = useState([]);
  const NA = t('commonText.nA');
  const [detailsLoading, setDetailsLoading] = useState({
    site: false,
    contract: false,
    billTo: false,
  });
  const inputChangedHandler = (selectedValues) => {
    _setQueryParams((prev) => ({
      ...prev,
      [selectedValues?.target?.name]: selectedValues?.target?.value,
    }));
    if (selectedValues?.target?.name == 'contract') {
      _setQueryParams((prev) => ({
        ...prev,
        paymentTerm: selectedValues?.target?.value?.paymentTerms
          ? {
              value: selectedValues?.target?.value?.paymentTerms,
              label: selectedValues?.target?.value?.paymentTerms,
            }
          : {},
      }));
    }
  };
  const closeDrawer = () => {
    setSelectedInvoice(null);
    setShowDrawer(false);
  };
  const fetchFranchiseSites = async () => {
    try {
      setDetailsLoading((prev) => ({
        ...prev,
        site: true,
      }));
      const params = {
        perPage: 500,
        billingInfo: true,
      };
      const response = await getFranchiseSites(params);
      if (response?.statusCode === 200) {
        setInvoiceSitesContracts((prev) => ({
          ...prev,
          sites: transformArrayForOptions(response?.data?.sites, 'name', 'id'),
        }));
      }
      setDetailsLoading((prev) => ({
        ...prev,
        site: false,
      }));
    } catch (error) {
      /**
       * show error
       */
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };
  const fetchFranchiseSiteContracts = async () => {
    try {
      setDetailsLoading((prev) => ({
        ...prev,
        contract: true,
        billTo: true,
      }));
      const response = await getFranchiseSiteContracts(queryParams?.site?.id);
      if (response?.statusCode === 200) {
        setInvoiceSitesContracts((prev) => ({
          ...prev,
          contracts: transformArrayForOptions(
            response?.data?.contracts,
            'name',
            'id',
            'paymentTerms',
          ),
          billTo: response?.data?.billTo,
        }));
      }
      setDetailsLoading((prev) => ({
        ...prev,
        contract: false,
        billTo: false,
      }));
    } catch (error) {
      /**
       * show error
       */
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };
  const handleAddItem = () => {
    setLineItems([...lineItems, { ...initialLineItems, index: lineItems.length }]);
  };
  const handleRemoveItem = (index) => {
    if (lineItems.length > 1) {
      if (!!lineItems[index].id) {
        const updatedDeletedLineItem = {
          ...lineItems?.[index],
          _destroy: true,
        };
        setDeletedLineItems((prev) => [...prev, updatedDeletedLineItem]);
      }
      const updatedItems = lineItems.filter((item) => item.index !== index);
      const reindexedItems = updatedItems.map((item, i) => ({ ...item, index: i }));
      setLineItems(reindexedItems);
    }
  };
  const handleUpdateItem = (event, index) => {
    const { name, value } = event.target;
    const updatedItems = lineItems.map((item, i) => {
      if (i === index) {
        let processedValue = value;
        name === 'price' &&
          (processedValue = formatNumber(processedValue, 4, 20, lineItems[i]?.price));
        name === 'quantity' &&
          (processedValue = formatNumber(processedValue, 4, 20, lineItems[i]?.quantity));
        const updatedItem = { ...item, [name]: processedValue };
        if (updatedItem.quantity && updatedItem.price) {
          updatedItem.total = +updatedItem.quantity * +updatedItem.price;
        } else {
          updatedItem.total = '';
        }
        return updatedItem;
      }
      return item;
    });
    setLineItems(updatedItems);
  };
  const getTotalAmount = () => {
    return lineItems.reduce((accumulator, item) => accumulator + +item.total, 0).toFixed(2);
  };
  let dueDateCount = PaymentTerms.find((term) => term.value === queryParams?.paymentTerm?.value);
  const handleCreateInvoice = async () => {
    setLoading(true);
    const DueDate = dayjs(queryParams?.invoiceDate).add(dueDateCount.dueDays, 'day');
    const payload = {
      contractId: queryParams?.contract?.id,
      siteId: queryParams?.site?.id,
      paymentTerm: queryParams?.paymentTerm?.value,
      invoiceDate: formatIsoDateToMmDdYyyy(
        getCurrentTimeWithDisabledDlsInIso(queryParams?.invoiceDate),
      ),
      dueDate: formatIsoDateToMmDdYyyy(getCurrentTimeWithDisabledDlsInIso(DueDate)),
      periodEnd: formatIsoDateToMmDdYyyy(
        getCurrentTimeWithDisabledDlsInIso(queryParams?.periodEnd),
      ),
      periodStart: formatIsoDateToMmDdYyyy(
        getCurrentTimeWithDisabledDlsInIso(queryParams?.periodStart),
      ),
      lineItems: [...lineItems, ...(deletedLineItems.length ? deletedLineItems : [])],
      poNumber: queryParams?.poNumber,
    };
    try {
      const response = await createNewInvoice(payload);
      if (response.statusCode === 200) {
        toaster.success({
          text: response?.message,
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
        setSelectedInvoice(null);
        setShowDrawer(false);
        refetchData();
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
  const handleSubmit = async () => {
    const formData = {
      lineItems,
    };
    if (!selectedInvoice) {
      formData['contract'] = queryParams?.contract?.id || null;
      formData['site'] = queryParams?.site?.id || null;
      formData['invoiceDate'] = queryParams?.invoiceDate;
      formData['paymentTerm'] = queryParams?.paymentTerm?.value || null;
      formData['periodEnd'] = queryParams?.periodEnd;
      formData['periodStart'] = queryParams?.periodStart;
    } else {
      formData['paymentTerm'] = queryParams?.paymentTerm?.value || null;
    }
    const errors = await joiValidate(formData, t);
    if (errors && Object.keys(errors).length) {
      setErrorMessages(errors);
      setLoading(false);
      return;
    }
    if (!selectedInvoice) {
      const newErrorMessages = datesValidation();
      if (newErrorMessages && Object.keys(newErrorMessages).length) {
        setErrorMessages(newErrorMessages);
        setLoading(false);
        return;
      }
    }
    if (!selectedInvoice) handleCreateInvoice();
    else {
      let dueDateCount = PaymentTerms.find(
        (term) => term.value === queryParams?.paymentTerm?.value,
      );
      const DueDate = dayjs(
        dayjsWithStandardOffset(existingInvoice?.billingDetails?.invoiceGenerated),
        'MM/DD/YYYY',
      ).add(dueDateCount?.dueDays, 'day');
      try {
        setLoading(true);
        const payload = {
          lineItems: [...lineItems, ...(deletedLineItems.length ? deletedLineItems : [])],
          paymentTerm: formData.paymentTerm,
          dueDate: formatIsoDateToMmDdYyyy(DueDate),
          poNumber: queryParams?.poNumber,
        };
        const response = await updateInvoice(selectedInvoice, payload);
        if (response.statusCode === 200) {
          toaster.success({
            text: response?.message,
            position: 'top-right',
            autoClose: toastSettings.AUTO_CLOSE,
          });
        }
        setLoading(false);
        setSelectedInvoice(null);
        setShowDrawer(false);
        refetchData();
      } catch (error) {
        toaster.error({
          text: error?.message,
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
      } finally {
        setLoading(false);
      }
    }
  };
  const datesValidation = () => {
    const newErrorMessages = {};
    const today = dayjs();
    if (dayjs(queryParams?.periodEnd).isBefore(dayjs(queryParams?.periodStart))) {
      newErrorMessages['periodEnd'] = t('obx.invoice.periodEndError');
      newErrorMessages['periodStart'] = t('obx.invoice.periodStartError');
    }
    if (dayjs(queryParams?.invoiceDate).startOf('day').isBefore(today.startOf('day'))) {
      newErrorMessages['invoiceDate'] = t('obx.invoice.invoiceDateError');
    }
    if (dayjs(queryParams?.dueDate).startOf('day').isBefore(today.startOf('day'))) {
      newErrorMessages['dueDate'] = t('obx.invoice.dueDateError');
    }
    return newErrorMessages;
  };
  const fetchInvoice = async () => {
    try {
      const response = await getInvoice(selectedInvoice);
      if (response.statusCode === 200) {
        setInvoiceSitesContracts((prev) => ({
          ...prev,
          billTo: response?.data?.invoice?.billTo,
        }));
        setExistingInvoice((prev) => ({
          ...prev,
          ...response?.data?.invoice,
          // contractDetails: response?.data?.invoice?.contractDetails,
          // billingDetails: response?.data?.invoice?.billingDetails,
          // invoiceNumber: response?.data?.invoice?.invoiceNumber,
          // poNumber: response?.data?.invoice?.poNumber,
        }));
        _setQueryParams((prev) => ({
          ...prev,
          poNumber: response?.data?.invoice?.poNumber,
          paymentTerm: response?.data?.invoice?.billingDetails?.paymentTerm
            ? {
                value: response?.data?.invoice?.billingDetails?.paymentTerm,
                label: response?.data?.invoice?.billingDetails?.paymentTerm,
              }
            : {},
        }));
        const updatedLineItems = response?.data?.invoice?.lineItems.map((item, index) => {
          item['index'] = index;
          item['_destroy'] = false;
          return item;
        });
        setLineItems(updatedLineItems);
        setLoadingInvoice(false);
      }
    } catch (error) {
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
      setShowDrawer(false);
    }
  };
  useEffect(() => {
    if (selectedInvoice) fetchInvoice();
    else fetchFranchiseSites();
  }, []);
  useEffect(() => {
    if (queryParams?.site?.id) fetchFranchiseSiteContracts();
  }, [queryParams?.site]);

  const renderBillingDetails = (key) => {
    const noSiteSelected = isObjectEmpty(queryParams?.site) && !selectedInvoice;
    const noBillingDetails = selectedInvoice && isObjectEmpty(existingInvoice?.billingDetails);
    const loadingDetails = detailsLoading?.billTo && !selectedInvoice;
    const billToAvailable = selectedInvoice && !isObjectEmpty(invoiceSitesContracts?.billTo);
    if (noSiteSelected && billToAvailable) {
      return NA;
    } else if (loadingDetails || noBillingDetails) {
      return <Skeleton className={classes.textSkeleton} />;
    } else {
      return key;
    }
  };
  return (
    <>
      {loading && <LoaderComponent />}
      <Box className={classes.drawerWrapper}>
        <Box className={classes.headerArea}>
          <SignalIcon className={classes.signalLogo} />
          <Box className={classes.headerWrapper}>
            <Box className={classes.headerCol}>
              <Box className={classes.titleTop}>
                <Typography variant="subtitle1"> {t('obx.invoice.billFrom')}</Typography>
                <Typography variant="subtitle1"> Signal 88, LLC.</Typography>
              </Box>
              <Box>
                <Typography variant="body2">PO Box 8246</Typography>
                <Typography variant="body2">Omaha, NE 68108</Typography>
                <Typography variant="body2" className={classes.textFlex}>
                  <Box>{t('obx.invoice.email')}</Box>
                  remittance@teamsignal.com
                </Typography>
              </Box>
            </Box>
            <Box className={classes.headerCol}>
              <Box className={classes.titleTop}>
                <Typography variant="subtitle1"> {t('obx.invoice.billTo')}</Typography>
                <Typography variant="subtitle1">
                  {renderBillingDetails(invoiceSitesContracts?.billTo?.name)}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2">
                  {detailsLoading?.billTo ? (
                    <Skeleton className={classes.textSkeleton} />
                  ) : (
                    invoiceSitesContracts?.billTo?.address
                  )}
                </Typography>
                <Typography variant="body2" className={classes.textFlex}>
                  <Box>{t('obx.invoice.contactPerson')}</Box>
                  {renderBillingDetails(invoiceSitesContracts?.billTo?.contactPerson)}
                </Typography>
                <Typography variant="body2" className={classes.textFlex}>
                  <Box> {t('obx.invoice.phone')}</Box>
                  {renderBillingDetails(invoiceSitesContracts?.billTo?.phone)}
                </Typography>
                <Typography variant="body2" className={classes.textFlex}>
                  <Box>{t('obx.invoice.email')} </Box>
                  {renderBillingDetails(invoiceSitesContracts?.billTo?.email)}
                </Typography>
              </Box>
            </Box>
            <Box className={classes.headerCol}>
              <Typography variant="subtitle1"> {t('obx.invoice.invoiceNumber')}</Typography>
              <Typography variant="body2">
                {!selectedInvoice ? (
                  NA
                ) : !existingInvoice?.invoiceNumber ? (
                  <Skeleton className={classes.textSkeleton} />
                ) : (
                  existingInvoice?.invoiceNumber
                )}
              </Typography>
            </Box>
          </Box>
        </Box>
        <Box className={classes.contentArea}>
          {!selectedInvoice ? (
            <>
              <Box className={classes.fieldColms}>
                <Box className={classes.colmDataDropdown}>
                  <InputLabel htmlFor="sites">{t('obx.invoice.site')}</InputLabel>
                  {!detailsLoading?.site ? (
                    <CustomDropDown
                      label={'Sites'}
                      name="site"
                      placeHolder={`${t('obx.invoice.select')} ${t('obx.invoice.site')}`}
                      options={invoiceSitesContracts?.sites || []}
                      selectedValues={queryParams.site}
                      handleChange={inputChangedHandler}
                      searchable={false}
                      withTiles={false}
                      bordered
                      className={classes.dutyInformationDropdownOfficer}
                      isError={!!errorMessages?.site}
                    />
                  ) : (
                    <Skeleton className={classes.skeletonDropdown} />
                  )}
                  {!!errorMessages?.site && (
                    <Box className={classes.invalidFeedback}>{errorMessages?.site}</Box>
                  )}
                </Box>
                <Box className={classes.colmDataDropdown}>
                  <InputLabel htmlFor="contract">{t('obx.invoice.contract')}</InputLabel>
                  {!detailsLoading.contract ? (
                    <CustomDropDown
                      label={'contract'}
                      name="contract"
                      placeHolder={`${t('obx.invoice.select')} ${t('obx.invoice.contract')}`}
                      options={invoiceSitesContracts?.contracts || []}
                      selectedValues={queryParams.contract}
                      handleChange={inputChangedHandler}
                      searchable={false}
                      withTiles={false}
                      bordered
                      className={classes.dutyInformationDropdownOfficer}
                      isError={!!errorMessages?.contract}
                    />
                  ) : (
                    <Skeleton className={classes.skeletonDropdown} />
                  )}
                  {!!errorMessages?.contract && !errorMessages?.site && (
                    <Box className={classes.invalidFeedback}>{errorMessages?.contract}</Box>
                  )}
                  {!isObjectEmpty(invoiceSitesContracts?.sites) &&
                    !isObjectEmpty(invoiceSitesContracts?.billTo) &&
                    isObjectEmpty(invoiceSitesContracts?.contracts) && (
                      <Box className={classes.invalidFeedback}>{t('obx.invoice.noContracts')}</Box>
                    )}
                </Box>
                <Box className={classes.colmDataDropdown}>
                  <InputLabel htmlFor="contract">{t('obx.invoice.poNumber')}</InputLabel>
                  <TextField
                    name={t('obx.invoice.poNumberKey')}
                    id={t('obx.invoice.poNumberKey')}
                    fullWidth
                    placeholder={t('obx.invoice.poNumberPlaceholder')}
                    type="text"
                    value={queryParams.poNumber}
                    onChange={(e) => inputChangedHandler(e)}
                  />
                </Box>
              </Box>
              <Box className={classes.fieldColms}>
                <Box className={classes.colmData}>
                  <InputLabel htmlFor="invoiceDate">{t('obx.invoice.invoiceDate')}</InputLabel>
                  <ResponsiveDatePickers
                    format="MM/DD/YYYY"
                    placeholder="MM/DD/YYYY"
                    error={!!errorMessages?.invoiceDate}
                    value={queryParams?.invoiceDate}
                    helperText={!!errorMessages?.invoiceDate && errorMessages?.invoiceDate}
                    onChange={(e) =>
                      inputChangedHandler({
                        target: { name: 'invoiceDate', value: e?.toISOString() },
                      })
                    }
                  />
                </Box>
                <Box className={classes.fieldColms}>
                  <Box className={classes.colmData}>
                    <InputLabel htmlFor="PaymentTerms">
                      {t('obx.sites.createSite.PaymentTerms')}
                    </InputLabel>
                    <CustomDropDown
                      label={t('obx.sites.createSite.PaymentTerms')}
                      name="paymentTerm"
                      id="paymentTerm"
                      placeHolder={`${t('obx.sites.createSite.select')} ${t('obx.sites.createSite.PaymentTerms')}`}
                      placeHolderClassName={classes.placeHolderColor}
                      className={classes.dropdownWrap}
                      options={transformArrayForOptions(PaymentTerms, 'label', 'value')}
                      selectedValues={queryParams.paymentTerm}
                      handleChange={inputChangedHandler}
                      bordered
                    />
                    {!!errorMessages?.paymentTerm && (
                      <Box className={classes.invalidFeedback}>{errorMessages?.paymentTerm}</Box>
                    )}
                  </Box>
                </Box>
                {/* <Box className={classes.colmData}>
                  <InputLabel htmlFor="dueDate">{t('obx.invoice.dueDate')}</InputLabel>
                  <ResponsiveDatePickers
                    format="MM/DD/YYYY"
                    placeholder="MM/DD/YYYY"
                    error={!!errorMessages?.dueDate}
                    helperText={!!errorMessages?.dueDate && errorMessages?.dueDate}
                    onChange={(e) =>
                      inputChangedHandler({ target: { name: 'dueDate', value: e?.toISOString() } })
                    }
                  />
                </Box> */}
                <Box className={classes.colmData}>
                  <InputLabel htmlFor="periodStart">{t('obx.invoice.periodStart')}</InputLabel>
                  <ResponsiveDatePickers
                    format="MM/DD/YYYY"
                    placeholder="MM/DD/YYYY"
                    error={!!errorMessages?.periodStart}
                    value={queryParams?.periodStart}
                    helperText={!!errorMessages?.periodStart && errorMessages?.periodStart}
                    onChange={(e) =>
                      inputChangedHandler({
                        target: { name: 'periodStart', value: e?.toISOString() },
                      })
                    }
                  />
                </Box>
                <Box className={classes.colmData}>
                  <InputLabel htmlFor="periodEnd">{t('obx.invoice.periodEnd')}</InputLabel>
                  <ResponsiveDatePickers
                    format="MM/DD/YYYY"
                    placeholder="MM/DD/YYYY"
                    value={queryParams?.periodEnd}
                    error={!!errorMessages?.periodEnd}
                    helperText={!!errorMessages?.periodEnd && errorMessages?.periodEnd}
                    onChange={(e) =>
                      inputChangedHandler({
                        target: { name: 'periodEnd', value: e?.toISOString() },
                      })
                    }
                  />
                </Box>
              </Box>{' '}
            </>
          ) : (
            <>
              <Box className={classNames(classes.textFieldColms, classes.padBottom)}>
                <Box className={classes.colmDatas}>
                  <Typography variant="subtitle1"> {t('obx.invoice.contractDetails')}</Typography>
                </Box>
                <Box className={classes.colmDatas}>
                  <Typography variant="subtitle2"> {t('obx.invoice.siteName')}</Typography>
                  <Typography variant="body2">
                    {isObjectEmpty(existingInvoice?.contractDetails) ? (
                      <Skeleton className={classes.textSkeleton} />
                    ) : (
                      existingInvoice?.contractDetails?.siteName
                    )}
                  </Typography>
                </Box>
                <Box className={classes.colmDatas}>
                  <Typography variant="subtitle2"> {t('obx.invoice.contract')}</Typography>
                  {isObjectEmpty(existingInvoice?.contractDetails) ? (
                    <Skeleton className={classes.textSkeleton} />
                  ) : (
                    <>
                      {existingInvoice?.contractDetails?.contract?.map((contractName, index) => (
                        <Chip
                          key={index}
                          sx={{
                            color: 'grey',
                            backgroundColor: 'lightgrey',
                          }}
                          label={contractName}
                          size="small"
                        />
                      ))}
                    </>
                  )}
                </Box>
              </Box>
              <Box className={classes.textFieldColms}>
                <Box className={classes.colmDatas}>
                  <Typography variant="subtitle1"> {t('obx.invoice.billingDetails')}</Typography>
                </Box>
                <Box className={classes.colmDatas}>
                  <Typography variant="subtitle2"> {t('obx.invoice.invoiceGenerated')}</Typography>
                  <Typography variant="body2">
                    {isObjectEmpty(existingInvoice?.billingDetails) ? (
                      <Skeleton className={classes.textSkeleton} />
                    ) : (
                      existingInvoice?.billingDetails?.invoiceGenerated
                    )}
                  </Typography>
                </Box>
                <Box className={classes.colmDatas}>
                  <Typography variant="subtitle2"> {t('obx.invoice.invoiceDuration')}</Typography>
                  <Typography variant="body2">
                    {isObjectEmpty(existingInvoice?.billingDetails) ? (
                      <Skeleton className={classes.textSkeleton} />
                    ) : (
                      existingInvoice?.billingDetails?.invoiceDuration
                    )}
                  </Typography>
                </Box>
                <Box className={classes.colmDatas}>
                  <Typography variant="subtitle2"> {t('obx.invoice.poNumber')}</Typography>
                  <Typography variant="body2">
                    {invoiceLoading && !existingInvoice?.poNumber ? (
                      <Skeleton className={classes.textSkeleton} />
                    ) : (
                      <TextField
                        name={t('obx.invoice.poNumberKey')}
                        id={t('obx.invoice.poNumberKey')}
                        fullWidth
                        placeholder={t('obx.invoice.poNumberPlaceholder')}
                        type="text"
                        value={queryParams?.poNumber}
                        onChange={(e) => inputChangedHandler(e)}
                      />
                    )}
                  </Typography>
                </Box>
                <Box className={classes.colmDatas}>
                  <Typography variant="subtitle2">
                    {t('obx.sites.createSite.PaymentTerms')}
                  </Typography>
                  <Box className={classes.paymentDropdown}>
                    <CustomDropDown
                      label={t('obx.sites.createSite.PaymentTerms')}
                      name="paymentTerm"
                      id="paymentTerm"
                      placeHolder={`${t('obx.sites.createSite.select')} ${t('obx.sites.createSite.PaymentTerms')}`}
                      placeHolderClassName={classes.placeHolderColor}
                      options={transformArrayForOptions(PaymentTerms, 'label', 'value')}
                      selectedValues={queryParams.paymentTerm}
                      handleChange={inputChangedHandler}
                      bordered
                    />
                    {!!errorMessages?.paymentTerm && (
                      <Box className={classes.invalidFeedback}>{errorMessages?.paymentTerm}</Box>
                    )}
                  </Box>
                </Box>
              </Box>
            </>
          )}
          <Box className={classes.tableWrapper}>
            <LineItemTable
              lineItems={lineItems}
              removeLineItem={handleRemoveItem}
              handleUpdateItem={handleUpdateItem}
              errorMessages={errorMessages}
            />
            <Button
              disableRipple
              className={classes.notesCloseBtn}
              variant="onlyText"
              startIcon={<PlusIcon />}
              onClick={handleAddItem}
              disabled={selectedInvoice && !existingInvoice?.invoiceNumber}
            >
              {t('obx.invoice.lineItem')}
            </Button>
          </Box>
          <Box className={classes.footerColms}>
            <Box className={classes.inlineTD}>
              <Typography variant="subtitle2"> {t('obx.invoice.lineItems')}</Typography>
              <Typography variant="subtitle1">${getTotalAmount()}</Typography>
            </Box>
            <Box className={classes.inlineTD}>
              <Typography variant="subtitle2"> {t('obx.invoice.taxes')}</Typography>
              <Typography variant="subtitle1">TBD</Typography>
            </Box>
            <Box className={classes.inlineTD}>
              <Typography variant="subtitle2"> {t('obx.invoice.grandTotal')}</Typography>
              <Typography variant="subtitle1">TBD</Typography>
            </Box>
          </Box>
        </Box>
        <Box className={classes.footerArea}>
          <Button
            variant="secondaryGrey"
            onClick={() => {
              closeDrawer();
            }}
          >
            {t('obx.invoice.cancel')}
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={loading}>
            {selectedInvoice ? t('obx.invoice.save') : t('obx.invoice.createInvoice')}
          </Button>
        </Box>
      </Box>
    </>
  );
};
InvoiceDrawer.propTypes = {
  setShowDrawer: PropTypes.func,
  data: PropTypes.object,
  selectedInvoice: PropTypes.number,
  setSelectedInvoice: PropTypes.func,
  refetchData: PropTypes.func,
};
InvoiceDrawer.defaultProps = {
  setShowDrawer: () => {},
  data: {},
  selectedInvoice: 0,
  setSelectedInvoice: () => {},
  refetchData: () => {},
};
export default InvoiceDrawer;
