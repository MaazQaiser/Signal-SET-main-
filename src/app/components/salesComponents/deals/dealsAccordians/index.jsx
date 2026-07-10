import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Box, Chip, Link, Tooltip } from '@mui/material';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Typography from '@mui/material/Typography';
import { ReactComponent as DeleteSweetAlertIcon } from 'assets/svg/delete-modal.svg';
import { ReactComponent as DetailEmailIcon } from 'assets/svg/DetailEmailIcon.svg';
import { ReactComponent as InfoIcon } from 'assets/svg/info.svg';
import { ReactComponent as RedirectIcon } from 'assets/svg/redirect-icon.svg';
import { ReactComponent as TrasIcon } from 'assets/svg/trash.svg';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { contactAffiliationChipColors } from 'salesComponents/constant/exportEntities.constant';
import LoaderComponent from 'src/app/components/common/loader';
import SweetAlertModal from 'src/app/components/common/sweetAlertModal';
import * as routes from 'src/app/router/constant/ROUTE';
import {
  ACL_COMPANIES_VIEW,
  ACL_CONTACTS_VIEW,
  ACL_PROPERTIES_VIEW,
} from 'src/app/router/constant/SALESMODULE';
import history from 'src/app/router/utils/history';
import { _InputPDFDocx, Featuredicon } from 'src/assets/svg';
import { getCount, isObjectEmpty, isValidNumber } from 'src/helper/utilityFunctions';
import RenderIfHasPermission from 'src/hoc/renderIfHasPermission';
import { useTenantLabel } from 'src/hooks/useTenantLabel';
import { getDisplayConfiguration } from 'src/redux/store/slices/regionalCountryConfiguration';
import { deleteAttachment, uploadAttachment } from 'src/services/attachment.service';
import { attachmentSettings, defaultImage, toastSettings } from 'src/utils/constants';
import { fomatNumbersWithCommas } from 'src/utils/currencyFormater';
import { formatISOTimestampToDate } from 'src/utils/date';
import { openFile } from 'src/utils/files';
import { formatAddress } from 'src/utils/formatAddress/formatAddress';
import capitalize from 'src/utils/string/capitalize';
import { capitalizeFirstLetter, getChipColor, spMapping } from 'src/utils/string/common';

import AttachmentsUpload from '../dealsAttachmentsUpload';
import { useStyles } from './dealsAccordians';

const DealsDetailsAccordians = ({ data, setData, id }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const NA = t('commonText.nA');
  const { symbol, dateFormat } = useSelector(getDisplayConfiguration);

  const [_fileInfo, setFileInfo] = useState({ name: '', type: '', size: 0 });
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  const [_loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState({ id: null, active: false });

  const { getLabel } = useTenantLabel();

  const handleFileChange = async (event) => {
    if (!event?.target?.files?.length) return;

    const selectedFile = event.target.files[0];
    const { name, type, size } = selectedFile;
    const sizeInMB = (size / (1024 * 1024)).toFixed(2);

    /**
     * show error if file size exce
     */
    if (sizeInMB > attachmentSettings.FILE_SIZE_LIMIT) {
      toast.error(t('sales.commonText.fileSizeLimit'), {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
      event.target.value = '';
      return;
    }
    const duplicateFile = data?.attachments?.some((file) => file?.fileName === name);
    if (duplicateFile) {
      toast.error(t('sales.commonText.fileAlreadyExists'), {
        position: 'top-right',
        autoClose: 2000,
      });
      event.target.value = '';
      return;
    }
    if (selectedFile) {
      setFileInfo({ name, type, size: sizeInMB });
      setIsSuccess(true);
      setIsError(false);

      const formData = new FormData();
      formData.append('attachableId', id);
      formData.append('attachableType', 'Deal');
      formData.append('file', selectedFile);

      try {
        const upload = await uploadAttachment(formData);
        if (upload?.statusCode === 200) {
          const newArray = [upload?.data?.attachment, ...(data?.attachments ?? [])];
          setData((prevOptions) => ({
            ...prevOptions,
            attachments: newArray,
          }));
          setIsSuccess(false);
          toast.success(upload.message, {
            position: 'top-right',
            autoClose: toastSettings.AUTO_CLOSE,
          });
        }
      } catch (error) {
        setIsSuccess(false);
        toast.error(error?.message, {
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
      }
    } else {
      setFileInfo({ name: '', type: '', size: 0 });
      setIsSuccess(false);
      setIsError(true);
    }
    event.target.value = '';
  };

  const { company = {}, location = {}, contact = {}, franchise = {} } = data;

  const referredContact = location?.referredBy?.contact || {};

  const handleRedirect = (path) => {
    history.push(path);
  };

  const handleDeleteAttachment = async (id) => {
    try {
      const deleteResp = await deleteAttachment(id);
      if (deleteResp?.statusCode === 200) {
        // Filter out the attachment with the specified id
        const newArray = data?.attachments?.filter((attachment) => attachment.id !== id) ?? [];

        // Update the state with the new array
        setData((prevOptions) => ({
          ...prevOptions,
          attachments: newArray,
        }));
        toast.success(deleteResp.message, {
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
        setLoading(false);
        setShowDeleteModal({ id: null, active: false });
      }
    } catch (error) {
      setLoading(false);
      setShowDeleteModal({ id: null, active: false });
      toast.error(error?.message, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  return (
    <>
      {isSuccess && <LoaderComponent size={50} color={'primary'} label={t('sales.loading')} />}
      <Box className={classes.accordianWrapper}>
        <Accordion>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1a-content"
            id="panel1a-header"
          >
            <Typography>{t('sales.deals.aboutThis')}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box className={classes.accordionData}>
              <Box className={classes.dataColWrap}>
                <Typography className={classes.dataColmLabel}>
                  {t('sales.locations.name')}
                </Typography>
                <Typography className={classes.dataColmDetail}>
                  {capitalizeFirstLetter(data?.dealName) || NA}
                </Typography>
              </Box>
              <Box className={classes.dataColWrap}>
                <Typography className={classes.dataColmLabel}>
                  {t('sales.locations.amount')}
                </Typography>
                <Typography className={classes.dataColmDetail}>
                  {isValidNumber(data?.amount)
                    ? `${symbol}${fomatNumbersWithCommas(data?.amount)}`
                    : NA}
                </Typography>
              </Box>
              <Box className={classes.dataColWrap}>
                <Typography className={classes.dataColmLabel}>
                  {t('sales.locations.dealOwner')}
                </Typography>
                <Typography className={classes.dataColmDetail}>
                  {capitalize(data?.owner?.name) || NA}
                </Typography>
              </Box>
              <Box className={classes.dataColWrap}>
                <Typography className={classes.dataColmLabel}>
                  {t('sales.locations.createdBy')}
                </Typography>
                <Typography className={classes.dataColmDetail}>
                  {capitalize(data?.createdBy || NA)}
                </Typography>
              </Box>
              <Box className={classes.dataColWrap}>
                <Typography className={classes.dataColmLabel}>
                  {t('sales.locations.creationDate')}
                </Typography>
                <Typography className={classes.dataColmDetail}>
                  {formatISOTimestampToDate(data?.createdAt, dateFormat) || NA}
                </Typography>
              </Box>
              <Box className={classes.dataColWrap}>
                <Typography className={classes.dataColmLabel}>
                  {t('sales.locations.lastUpdated')}
                </Typography>
                <Typography className={classes.dataColmDetail}>
                  {formatISOTimestampToDate(data?.updatedAt, dateFormat) || NA}
                </Typography>
              </Box>
              <Box className={classes.dataColWrap}>
                <Typography className={classes.dataColmLabel}>
                  {t('sales.locations.contractType')}
                </Typography>
                <Typography className={classes.dataColmDetail}>
                  {capitalize(data?.contractType || NA)}
                </Typography>
              </Box>
              <Box className={classes.dataColWrap}>
                <Typography className={classes.dataColmLabel}>
                  {t('sales.locations.serviceType')}
                </Typography>
                <Typography className={classes.dataColmDetail}>
                  {capitalize(data?.serviceType || NA)}
                </Typography>
              </Box>
              <Box className={classes.dataColWrap}>
                <Typography className={classes.dataColmLabel}>
                  {t('sales.locations.startDate')}
                </Typography>
                <Typography className={classes.dataColmDetail}>
                  {formatISOTimestampToDate(data?.startDate, dateFormat) || NA}
                </Typography>
              </Box>
              <Box className={classes.dataColWrap}>
                <Typography className={classes.dataColmLabel}>
                  {data?.contractType === 'Ongoing'
                    ? t('sales.locations.renewalDate')
                    : t('sales.locations.endDate')}
                </Typography>
                <Typography className={classes.dataColmDetail}>
                  {formatISOTimestampToDate(data?.renewalDate, dateFormat) || NA}
                </Typography>
              </Box>
              <Box className={classes.dataColWrap}>
                <Typography className={classes.dataColmLabel}>
                  {t('sales.locations.loadManagement')}
                </Typography>
                <Typography className={classes.dataColmDetail}>
                  {data?.loadManagement === true
                    ? t('sales.locations.yes')
                    : data?.loadManagement === false
                      ? t('sales.locations.no')
                      : NA}
                </Typography>
              </Box>
              <Box className={classes.dataColWrap}>
                <Typography className={classes.dataColmLabel}>
                  {t('sales.locations.visitorManagement')}
                </Typography>
                <Typography className={classes.dataColmDetail}>
                  {data?.visitorManagement === true
                    ? t('sales.locations.yes')
                    : data?.visitorManagement === false
                      ? t('sales.locations.no')
                      : NA}
                </Typography>
              </Box>
            </Box>
          </AccordionDetails>
        </Accordion>
        <Accordion>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel2a-content"
            id="panel2a-header"
          >
            <Typography>{t('sales.deals.company')}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box className={classes.accordionData}>
              {!isObjectEmpty(company) ? (
                <>
                  <Box className={classes.dataColWrap}>
                    <Typography className={classes.dataColmLabel}>
                      {t('sales.locations.name')}
                    </Typography>
                    <Box className={classes.dataColmDetail}>
                      <Typography>{capitalizeFirstLetter(company?.name) || NA}</Typography>
                    </Box>
                    <RenderIfHasPermission name={ACL_COMPANIES_VIEW}>
                      <RedirectIcon
                        onClick={() =>
                          handleRedirect(routes.SALES_COMPANY_DETAIL.replace(':id', company?.id))
                        }
                        className={classes.redirectIcon}
                        style={{ cursor: 'pointer' }}
                      />
                    </RenderIfHasPermission>
                  </Box>
                  <Box className={classes.dataColWrap}>
                    <Typography className={classes.dataColmLabel}>
                      {t('sales.companies.companyOwner')}
                    </Typography>
                    <Box className={classes.dataColmDetail}>
                      <Typography>{capitalize(company?.companyOwner) || NA}</Typography>
                    </Box>
                  </Box>
                  <Box className={classes.dataColWrap}>
                    <Typography className={classes.dataColmLabel}>
                      {t('sales.locations.contact')}
                    </Typography>
                    <Box className={classes.dataColmDetail}>
                      <Link className={classes.dataLink} href={`tel:${company?.contact}`}>
                        <Typography>{company?.contact || NA}</Typography>
                      </Link>
                    </Box>
                  </Box>
                  {/*<Box className={classes.dataColWrap}>*/}
                  {/*  <Typography className={classes.dataColmLabel}>*/}
                  {/*    {t('sales.locations.email')}*/}
                  {/*  </Typography>*/}
                  {/*  <Box className={classes.dataColmDetail}>*/}
                  {/*    <Link className={classes.dataLink} href={`mailto:${company?.email}`}>*/}
                  {/*      {company?.email ? (*/}
                  {/*        <Typography className={classes.emailIcon}>*/}
                  {/*          {company.email} <DetailEmailIcon />*/}
                  {/*        </Typography>*/}
                  {/*      ) : (*/}
                  {/*        NA*/}
                  {/*      )}*/}
                  {/*    </Link>*/}
                  {/*  </Box>*/}
                  {/*</Box>*/}
                  <Box className={classes.dataColWrap}>
                    <Typography className={classes.dataColmLabel}>
                      {t('sales.locations.address')}
                    </Typography>
                    <Box className={classes.dataColmDetail}>
                      <Typography>
                        {formatAddress(
                          capitalizeFirstLetter(company?.address),
                          capitalizeFirstLetter(company?.city),
                          capitalizeFirstLetter(company?.state),
                          company?.postalCode,
                        ) || NA}
                      </Typography>
                    </Box>
                  </Box>
                  <Box className={classes.dataColWrap}>
                    <Typography className={classes.dataColmLabel}>
                      {t('sales.commonText.spStatus')}
                    </Typography>
                    <Box className={classes.assignToText}>
                      {company?.strategicPartnershipStatus ? (
                        <Chip
                          label={spMapping[company?.strategicPartnershipStatus]}
                          size="small"
                          icon={
                            company?.strategicPartnershipTooltip && (
                              <Tooltip
                                title={
                                  <span
                                    dangerouslySetInnerHTML={{
                                      __html: company?.strategicPartnershipTooltip,
                                    }}
                                  />
                                }
                              >
                                <InfoIcon
                                  fontSize="small"
                                  sx={{ color: getChipColor(company?.strategicPartnershipStatus) }}
                                />
                              </Tooltip>
                            )
                          }
                          color={getChipColor(company?.strategicPartnershipStatus)}
                        />
                      ) : (
                        <Typography>{NA}</Typography>
                      )}
                    </Box>
                  </Box>
                </>
              ) : (
                <>{t('sales.deals.noCompanyDeals')}</>
              )}
            </Box>
          </AccordionDetails>
        </Accordion>
        <Accordion>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel2a-content"
            id="panel2a-header"
          >
            <Typography>{t('sales.deals.locationDetails')}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box className={classes.accordionData}>
              {!isObjectEmpty(location) ? (
                <Box className={classes.accordionData}>
                  <Box key={`index-name`} className={classes.dataColWrap}>
                    <Typography className={classes.dataColmLabel}>
                      {t('sales.locations.name')}
                    </Typography>
                    <Box className={classes.dataColmDetail}>
                      <Typography>{capitalizeFirstLetter(location?.name) || NA}</Typography>
                    </Box>
                    <RenderIfHasPermission name={ACL_PROPERTIES_VIEW}>
                      <RedirectIcon
                        onClick={() =>
                          handleRedirect(routes.SALES_LOCATION_DETAIL.replace(':id', location?.id))
                        }
                        className={classes.redirectIcon}
                        style={{ cursor: 'pointer' }}
                      />
                    </RenderIfHasPermission>
                  </Box>
                  <Box key={`index-industry`} className={classes.dataColWrap}>
                    <Typography className={classes.dataColmLabel}>
                      {t('sales.locations.industry')}
                    </Typography>
                    <Box className={classes.dataColmDetail}>
                      <Typography>{capitalizeFirstLetter(location?.industry) || NA}</Typography>
                    </Box>
                  </Box>
                  <Box className={classes.dataColWrap}>
                    <Typography className={classes.dataColmLabel}>
                      {t('sales.locations.referredBy')}
                    </Typography>
                    <Box>
                      <Typography className={classes.dataColmDetail}>
                        {capitalize(location?.referredBy?.property?.name) || NA}
                      </Typography>
                      <Box key={`contact-details`} className={classes.referredContactWrap}>
                        {!isObjectEmpty(referredContact) && (
                          <>
                            <Box className={classes.contactDetails}>
                              <Box className={classes.referredContactAvatar}>
                                <img src={referredContact?.image || defaultImage} />
                                <Typography>
                                  {referredContact?.name || `${t('sales.contract.name')}: ${NA}`}
                                </Typography>
                              </Box>
                              <Box className={classes.dataColmDetail}>
                                <Link
                                  className={classes.dataLink}
                                  href={`mailto:${referredContact?.email}`}
                                >
                                  <Typography className={classes.emailIcon}>
                                    {referredContact.email}
                                  </Typography>
                                </Link>
                              </Box>
                              <Box className={classes.dataColmDetail}>
                                <Typography>{referredContact?.phoneNumber}</Typography>
                              </Box>
                            </Box>
                          </>
                        )}
                      </Box>
                    </Box>
                  </Box>
                  {/* new colum? */}
                  <Box key={`index-industry`} className={classes.dataColWrap}>
                    <Typography className={classes.dataColmLabel}>
                      {t('sales.users.parentCompany')}
                    </Typography>
                    <Box className={classes.dataColmDetail}>
                      <Typography>{location?.company?.parentCompany || NA}</Typography>
                    </Box>
                  </Box>
                  {/*<Box key={`index-createdBy`} className={classes.dataColWrap}>*/}
                  {/*  <Typography className={classes.dataColmLabel}>*/}
                  {/*    {t('sales.locations.createdBy')}*/}
                  {/*  </Typography>*/}
                  {/*  <Box className={classes.dataColmDetail}>*/}
                  {/*    <Typography>{capitalizeFirstLetter(location?.createdBy) || NA}</Typography>*/}
                  {/*  </Box>*/}
                  {/*</Box>*/}
                  <Box key={`index-creationDate`} className={classes.dataColWrap}>
                    <Typography className={classes.dataColmLabel}>
                      {t('sales.locations.creationDate')}
                    </Typography>
                    <Box className={classes.dataColmDetail}>
                      <Typography>
                        {capitalizeFirstLetter(
                          formatISOTimestampToDate(location?.createdAt, dateFormat),
                        ) || NA}
                      </Typography>
                    </Box>
                  </Box>
                  {/*<Box key={`index-lastUpdated`} className={classes.dataColWrap}>*/}
                  {/*  <Typography className={classes.dataColmLabel}>*/}
                  {/*    {t('sales.locations.lastUpdated')}*/}
                  {/*  </Typography>*/}
                  {/*  <Box className={classes.dataColmDetail}>*/}
                  {/*    <Typography>*/}
                  {/*      {capitalizeFirstLetter(formatISOTimestampToDate(location?.updatedAt)) || NA}*/}
                  {/*    </Typography>*/}
                  {/*  </Box>*/}
                  {/*</Box>*/}
                  {/* new colum? */}
                  {/*<Box className={classes.dataColWrap}>*/}
                  {/*  <Typography className={classes.dataColmLabel}>*/}
                  {/*    {t('sales.locations.managementCompany')}*/}
                  {/*  </Typography>*/}
                  {/*  <Box className={classes.dataColmDetail}>*/}
                  {/*    <Typography>*/}
                  {/*      {capitalizeFirstLetter(location?.managementCompany) || NA}*/}
                  {/*    </Typography>*/}
                  {/*  </Box>*/}
                  {/*</Box>*/}
                  {/* new colum? */}
                  <Box className={classes.dataColWrap}>
                    <Typography className={classes.dataColmLabel}>
                      {t('sales.locations.units')}
                    </Typography>
                    <Box className={classes.dataColmDetail}>
                      <Typography>{location?.numberOfUnits || NA}</Typography>
                    </Box>
                  </Box>
                  {/* new colum? */}
                  <Box className={classes.dataColWrap}>
                    <Typography className={classes.dataColmLabel}>
                      {t('sales.locations.accupancyRate')}
                    </Typography>
                    <Box className={classes.dataColmDetail}>
                      <Typography>
                        {isValidNumber(location?.occupancyRate)
                          ? `${fomatNumbersWithCommas(location?.occupancyRate)}%`
                          : NA}
                      </Typography>
                    </Box>
                  </Box>
                  {/* new colum? */}
                  <Box className={classes.dataColWrap}>
                    <Typography className={classes.dataColmLabel}>
                      {t('sales.locations.avgRent')}
                    </Typography>
                    <Box className={classes.dataColmDetail}>
                      <Typography>
                        {isValidNumber(location?.averageRent)
                          ? `${symbol}${fomatNumbersWithCommas(location?.averageRent)}`
                          : NA}
                      </Typography>
                    </Box>
                  </Box>
                  <Box key={`index-address`} className={classes.dataColWrap}>
                    <Typography className={classes.dataColmLabel}>
                      {t('sales.locations.address')}
                    </Typography>
                    <Box className={classes.dataColmDetail}>
                      <Typography>{data?.fullAddress || NA}</Typography>
                    </Box>
                  </Box>
                  {/*<Box className={classes.dataColWrap}>*/}
                  {/*  <Typography className={classes.dataColmLabel}>*/}
                  {/*    {t('sales.locations.leadStatus')}*/}
                  {/*  </Typography>*/}
                  {/*  <Box className={classes.dataColmDetail}>*/}
                  {/*    <Typography>{location?.leadStatus || NA}</Typography>*/}
                  {/*  </Box>*/}
                  {/*</Box>*/}
                  <Box className={classes.dataColWrap}>
                    <Typography className={classes.dataColmLabel}>
                      {t('sales.locations.annualRevenue')}
                    </Typography>
                    <Box className={classes.dataColmDetail}>
                      <Typography>
                        {isValidNumber(location?.annualRevenue)
                          ? `${symbol}${fomatNumbersWithCommas(location?.annualRevenue)}`
                          : NA}
                      </Typography>
                    </Box>
                  </Box>
                  <Box className={classes.dataColWrap}>
                    <Typography className={classes.dataColmLabel}>
                      {t('sales.locations.createdBy')}
                    </Typography>
                    <Box className={classes.dataColmDetail}>
                      <Typography>{location?.createdBy || NA}</Typography>
                    </Box>
                  </Box>
                  <Box className={classes.dataColWrap}>
                    <Typography className={classes.dataColmLabel}>
                      {t('sales.locations.createdSource')}
                    </Typography>
                    <Box className={classes.dataColmDetail}>
                      <Typography>{location?.createdSource || NA}</Typography>
                    </Box>
                  </Box>
                  <Box className={classes.dataColWrap}>
                    <Typography className={classes.dataColmLabel}>
                      {t('sales.locations.lastModifiedBy')}
                    </Typography>
                    <Box className={classes.dataColmDetail}>
                      <Typography>{location?.lastModifiedBy || NA}</Typography>
                    </Box>
                  </Box>
                  <Box className={classes.dataColWrap}>
                    <Typography className={classes.dataColmLabel}>
                      {t('sales.locations.lastModifiedSource')}
                    </Typography>
                    <Box className={classes.dataColmDetail}>
                      <Typography>{location?.lastModifiedSource || NA}</Typography>
                    </Box>
                  </Box>
                  <Box className={classes.dataColWrap}>
                    <Typography className={classes.dataColmLabel}>
                      {t('sales.locations.lastCleaned')}
                    </Typography>
                    <Box className={classes.dataColmDetail}>
                      <Typography>
                        {location?.lastCleaned
                          ? formatISOTimestampToDate(location?.lastCleaned, dateFormat)
                          : NA}
                      </Typography>
                    </Box>
                  </Box>
                  <Box className={classes.dataColWrap}>
                    <Typography className={classes.dataColmLabel}>
                      {t('sales.locations.lastEnriched')}
                    </Typography>
                    <Box className={classes.dataColmDetail}>
                      <Typography>
                        {location?.lastEnriched
                          ? formatISOTimestampToDate(location?.lastEnriched, dateFormat)
                          : NA}
                      </Typography>
                    </Box>
                  </Box>
                  <Box className={classes.dataColWrap}>
                    <Typography className={classes.dataColmLabel}>
                      {t('sales.locations.squareFootage')}
                    </Typography>
                    <Box className={classes.dataColmDetail}>
                      <Typography>{location?.squareFootageOfBuilding || NA}</Typography>
                    </Box>
                  </Box>
                  <Box className={classes.dataColWrap}>
                    <Typography className={classes.dataColmLabel}>
                      {t('sales.locations.parkingSpaces')}
                    </Typography>
                    <Box className={classes.dataColmDetail}>
                      <Typography>{location?.parkingSpaces || NA}</Typography>
                    </Box>
                  </Box>
                  <Box className={classes.dataColWrap}>
                    <Typography className={classes.dataColmLabel}>
                      {t('sales.locations.buildingClass')}
                    </Typography>
                    <Box className={classes.dataColmDetail}>
                      <Typography>{location?.buildingClass || NA}</Typography>
                    </Box>
                  </Box>
                  <Box className={classes.dataColWrap}>
                    <Typography className={classes.dataColmLabel}>
                      {t('sales.locations.tenancy')}
                    </Typography>
                    <Box className={classes.dataColmDetail}>
                      <Typography>{location?.tenancy || NA}</Typography>
                    </Box>
                  </Box>
                  <Box className={classes.dataColWrap}>
                    <Typography className={classes.dataColmLabel}>
                      {t('sales.locations.amenities')}
                    </Typography>
                    <Box className={classes.dataColmDetail}>
                      <Typography>{location?.amenities || NA}</Typography>
                    </Box>
                  </Box>
                  <Box className={classes.dataColWrap}>
                    <Typography className={classes.dataColmLabel}>
                      {t('sales.locations.numberOfBuildings')}
                    </Typography>
                    <Box className={classes.dataColmDetail}>
                      <Typography>{location?.numberOfBuildings || NA}</Typography>
                    </Box>
                  </Box>
                </Box>
              ) : (
                <>{t('sales.deals.noLocation')}</>
              )}
            </Box>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel2a-content"
            id="panel2a-header"
          >
            <Typography>{t('sales.deals.contact')}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box className={classes.accordionData}>
              <Box key={`contact-details`} className={classes.contactWrap}>
                {!isObjectEmpty(contact) ? (
                  <>
                    <Box className={classes.contatcAvtar}>
                      <img src={contact?.image || defaultImage} className={classes.userImage} />
                    </Box>
                    <Box className={classes.contactDetails}>
                      <Typography className={classes.dataColmLabelContact}>
                        {contact?.fullName || `${t('sales.contract.name')}: ${NA}`}
                        {contact?.designation ? ` • ${contact?.designation}` : null}
                      </Typography>
                      <Box className={classes.dataColmDetail}>
                        <Link className={classes.dataLink} href={`mailto:${contact?.email}`}>
                          {contact?.email ? (
                            <Typography className={classes.emailIcon}>
                              {contact.email} <DetailEmailIcon />
                            </Typography>
                          ) : (
                            <Typography>{`${t('sales.contacts.email')}: ${NA}`}</Typography>
                          )}
                        </Link>
                      </Box>
                      <Box className={classes.dataColmDetail}>
                        <Link className={classes.dataLink} href={'#'}>
                          <Typography>
                            {contact?.contact || `${t('sales.contacts.phoneNumber')}: ${NA}`}
                          </Typography>
                        </Link>
                      </Box>
                      <Box className={classes.chipWrapper}>
                        {contact?.type?.map((affiliatedContact, cIndex) => (
                          <Chip
                            key={cIndex}
                            label={capitalizeFirstLetter(affiliatedContact?.name || NA)}
                            size="small"
                            variant="outlined"
                            style={contactAffiliationChipColors[affiliatedContact?.key]}
                            sx={{ border: 'none' }}
                          />
                        ))}
                      </Box>
                    </Box>
                    <RenderIfHasPermission name={ACL_CONTACTS_VIEW}>
                      <RedirectIcon
                        onClick={() =>
                          handleRedirect(
                            routes.SALES_CONTACT_DETAIL_ROUTE.replace(':id', contact?.id),
                          )
                        }
                        className={classes.redirectIcon}
                        style={{ cursor: 'pointer', marginLeft: 'auto' }}
                      />
                    </RenderIfHasPermission>
                  </>
                ) : (
                  <>{t('sales.deals.noContacts')}</>
                )}
              </Box>
            </Box>
          </AccordionDetails>
        </Accordion>
        <Accordion>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel2a-content"
            id="panel2a-header"
          >
            <Typography>{t('sales.locations.franchiseAssociated')}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box className={classes.accordionData}>
              {!isObjectEmpty(franchise) ? (
                <>
                  <Box className={classes.dataColWrap}>
                    <Typography className={classes.dataColmLabel}>
                      {t('sales.locations.name')}
                    </Typography>
                    <Typography className={classes.dataColmDetail}>
                      {capitalizeFirstLetter(franchise?.franchiseName) || NA}
                    </Typography>
                  </Box>
                  <Box className={classes.dataColWrap}>
                    <Typography className={classes.dataColmLabel}>
                      {getLabel('roles', 'franchiseOwner')}
                    </Typography>
                    <Typography className={classes.dataColmDetail}>
                      {capitalizeFirstLetter(franchise?.firstName) || NA}{' '}
                      {franchise?.firstName && capitalizeFirstLetter(franchise?.lastName)}
                    </Typography>
                  </Box>
                  <Box className={classes.dataColWrap}>
                    <Typography className={classes.dataColmLabel}>
                      {t('sales.locations.email')}
                    </Typography>
                    <Box className={classes.dataColmDetail}>
                      <Link className={classes.dataLink} href={`mailto:${franchise?.email}`}>
                        {franchise?.email ? (
                          <Tooltip
                            title={franchise.email.length > 20 ? franchise.email : ''}
                            placement="top"
                          >
                            <Typography className={classes.emailIcon} component="span">
                              <span className={classes.emailIconText}>
                                {franchise.email.length > 20
                                  ? `${franchise.email.slice(0, 20)}...`
                                  : franchise.email}
                              </span>
                              <DetailEmailIcon />
                            </Typography>
                          </Tooltip>
                        ) : (
                          NA
                        )}
                      </Link>
                    </Box>
                  </Box>
                  <Box className={classes.dataColWrap}>
                    <Typography className={classes.dataColmLabel}>
                      {t('sales.locations.contact')}
                    </Typography>
                    <Box className={classes.dataColmDetail}>
                      <Link className={classes.dataLink} href={'#'}>
                        <Typography>{franchise?.phoneNumber || NA}</Typography>
                      </Link>
                    </Box>
                  </Box>

                  <Box className={classes.dataColWrap}>
                    <Typography className={classes.dataColmLabel}>
                      {t('sales.locations.address')}
                    </Typography>
                    <Typography className={classes.dataColmDetail}>
                      {formatAddress(
                        capitalizeFirstLetter(franchise?.address),
                        capitalizeFirstLetter(franchise?.city?.name),
                        capitalizeFirstLetter(franchise?.state?.name),
                        franchise?.zipCode,
                      ) || NA}
                    </Typography>
                  </Box>
                </>
              ) : (
                <>{t('sales.deals.noAssciatedFranchiseLocation')}</>
              )}
            </Box>
          </AccordionDetails>
        </Accordion>
        <Accordion>
          <AccordionSummary
            className={classes.attachAccordian}
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel2a-content"
            id="panel2a-header"
          >
            <Typography>
              {t('sales.locations.attachments')} • {getCount(data?.attachments?.length)}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box className={classes.accordionData}>
              {data?.attachments && data?.attachments?.length
                ? data?.attachments?.map((file) => {
                    return (
                      <Tooltip
                        className={classes.toolTipBox}
                        title={`Download ${file?.fileName}`}
                        key={file?.id}
                        placement="bottom"
                        arrow
                      >
                        <Box
                          key={file?.id}
                          className={classes.attachSuccess}
                          // onClick={() => openFile(file?.fileName, file?.fileUrl)}
                        >
                          <Box
                            onClick={() => openFile(file?.fileName, file?.fileUrl)}
                            className={classes.attachSuccessFile}
                          >
                            <Featuredicon className={classes.attachIcons} />
                            <Box className={classes.attachNameWrap}>
                              <Typography className={classes.attachName}>
                                {file?.fileName}
                              </Typography>
                              <Typography className={classes.attachSize}>
                                {file?.fileSize}
                              </Typography>
                            </Box>
                          </Box>

                          <Box
                            className={classes.trashIconBox}
                            onClick={() => setShowDeleteModal({ id: file.id, active: true })}
                          >
                            <TrasIcon />
                          </Box>
                        </Box>
                      </Tooltip>
                    );
                  })
                : null}
              {isError && (
                <Typography variant="body1" style={{ color: 'red' }}>
                  {t('sales.commonText.inValidFile')}
                </Typography>
              )}
            </Box>

            <AttachmentsUpload
              fileUploadHandler={handleFileChange}
              acceptAttachment={attachmentSettings.ACCEPT}
            />
          </AccordionDetails>
        </Accordion>
      </Box>
      {showDeleteModal?.active && (
        <SweetAlertModal
          type="warning"
          title={t('sales.deals.areYouSureToDelete')}
          text={t('sales.deals.areYouSureToDeleteDesc')}
          cancelButtonText={t('sales.deals.cancelBtn')}
          confirmButtonText={t('sales.deals.deleteBtn')}
          show={showDeleteModal?.active}
          handleConfirmButton={() => handleDeleteAttachment(showDeleteModal?.id)}
          handleCancelButton={() => setShowDeleteModal({ id: null, active: false })}
          icon={<DeleteSweetAlertIcon />}
        />
      )}
    </>
  );
};

DealsDetailsAccordians.propTypes = {
  data: PropTypes.object, // Adjust the type accordingly based on the expected data structure
  setData: PropTypes.func,
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default DealsDetailsAccordians;
