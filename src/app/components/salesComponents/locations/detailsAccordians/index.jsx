import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Box, Button, Chip, Link, Modal, Tooltip } from '@mui/material';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Typography from '@mui/material/Typography';
import { MoreVert } from 'assets/svg';
import { ReactComponent as DeleteSweetAlertIcon } from 'assets/svg/delete-modal.svg';
import { ReactComponent as DetailEmailIcon } from 'assets/svg/DetailEmailIcon.svg';
import { ReactComponent as InfoIcon } from 'assets/svg/info.svg';
import { ReactComponent as RedirectIcon } from 'assets/svg/redirect-icon.svg';
import { ReactComponent as TrasIcon } from 'assets/svg/trash.svg';
import { ReactComponent as WarningIcon } from 'assets/svg/warning.svg';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
  contactAffiliationChipColors,
  locationAffiliationChipColors,
} from 'salesComponents/constant/exportEntities.constant';
import ConfirmationDialog from 'src/app/components/common/confirmationDialog';
import LoaderComponent from 'src/app/components/common/loader';
import PopoverButton from 'src/app/components/common/popoverButton';
import SweetAlertModal from 'src/app/components/common/sweetAlertModal';
import * as routes from 'src/app/router/constant/ROUTE';
import {
  ACL_COMPANIES_VIEW,
  ACL_CONTACTS_VIEW,
  ACL_DEALS_VIEW,
  ACL_PROPERTIES_UPDATE,
} from 'src/app/router/constant/SALESMODULE';
import { locationDrawerTypes } from 'src/app/sales/pages/contacts/listing/contacts.constant';
import { _InputPDFDocx, Featuredicon } from 'src/assets/svg';
import { getCount, isObjectEmpty } from 'src/helper/utilityFunctions';
import RenderIfHasPermission from 'src/hoc/renderIfHasPermission';
import { useTenantLabel } from 'src/hooks/useTenantLabel';
import { getDisplayConfiguration } from 'src/redux/store/slices/regionalCountryConfiguration';
import { deleteAttachment, uploadAttachment } from 'src/services/attachment.service';
import {
  removeLocationCompanyAffiliation,
  removeLocationContactAffiliation,
} from 'src/services/location.service';
import userHasPermission from 'src/utils/auth/userHasPermission';
import { attachmentSettings, defaultImage, toastSettings } from 'src/utils/constants';
import { fomatNumbersWithCommas } from 'src/utils/currencyFormater';
import { formatISOTimestampToDate } from 'src/utils/date';
import { openFile } from 'src/utils/files';
import { formatAddress } from 'src/utils/formatAddress/formatAddress';
import capitalize from 'src/utils/string/capitalize';
import { capitalizeFirstLetter, getChipColor, spMapping } from 'src/utils/string/common';

import { stageValues } from '../../deals/dealStages/stage.constant';
import CompanyAssociation from '../companyAssociation';
import ContactAssociation from '../contactAssociation';
import AttachmentsUpload from '../locationsAttachmentsUpload';
import { useStyles } from './detailsAccordians';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '100%',
  maxWidth: '760px',
  bgcolor: 'background.paper',
  boxShadow: '0px 8px 8px -4px rgba(16, 24, 40, 0.04), 0px 20px 24px -4px rgba(16, 24, 40, 0.10)',
  borderRadius: '12px',
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  overflow: 'auto',
};

const DetailsAccordians = ({ data, setData, franchise, id, fetchLocation }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const NA = t('commonText.nA');
  const { dateFormat, symbol } = useSelector(getDisplayConfiguration);

  const { getLabel } = useTenantLabel();

  const [expanded, setExpanded] = useState(false); // Track if accordion is open or closed
  const [companyAccordion, setCompanyAccordion] = useState(false);

  const [dialog, setDialog] = useState(null);

  const handleAccordionChange = () => {
    setExpanded(!expanded); // Toggle accordion open/close
  };

  const franchiseAssociated = [
    {
      label: t('sales.locations.name'),
      value: capitalizeFirstLetter(franchise?.franchiseName) || NA,
    },
    {
      label: getLabel('roles', 'franchiseOwner'),
      value:
        franchise?.firstName || franchise?.lastName
          ? capitalizeFirstLetter(franchise?.firstName) +
            ' ' +
            capitalizeFirstLetter(franchise.lastName)
          : NA,
    },
    {
      label: t('sales.locations.email'),
      value: franchise?.email || NA,
    },
    {
      label: `${t('sales.locations.contact')}`,
      value: franchise?.phoneNumber || NA,
    },
    {
      label: t('sales.locations.address'),
      value:
        (franchise?.address ? `${capitalizeFirstLetter(franchise?.address)}, ` : NA) +
        (franchise?.city?.name ? `${capitalizeFirstLetter(franchise?.city?.name)}, ` : NA) +
        (franchise?.state?.name ? `${capitalizeFirstLetter(franchise?.state?.name)}, ` : NA) +
        (franchise?.zipCode ? `${franchise?.zipCode}` : NA),
    },
  ];

  // Use this array in your component
  <Box className={classes.accordionData}>
    {franchiseAssociated.map((item, index) => (
      <Box key={index} className={classes.dataColWrap}>
        <Typography className={classes.dataColmLabel}>{item.label}</Typography>
        <Box className={classes.dataColmDetail}>
          {item.label === 'Email' || item.label === 'Contact #' ? (
            <Link
              className={classes.dataLink}
              href={item.label === 'Email' ? `mailto:${item.value}` : `tel:${item.value}`}
            >
              <Typography>{item.value}</Typography>
            </Link>
          ) : (
            <Typography>{item.value}</Typography>
          )}
        </Box>
      </Box>
    ))}
  </Box>;

  const [_fileInfo, setFileInfo] = useState({ name: '', type: '', size: 0 });
  const [_isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState({ id: null, active: false });
  const [companyModal, setCompanyModal] = useState(null);
  const [contactModal, setContactModal] = useState(null);
  const [removeLoading, setRemoveLoading] = useState(false);

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
      setLoading(true);

      /**
       * before sending the API call insert the new fine in local state and reflect
       */

      const formData = new FormData();
      formData.append('attachableId', id);
      formData.append('attachableType', 'Location');
      formData.append('file', selectedFile);

      try {
        const upload = await uploadAttachment(formData);
        if (upload?.statusCode === 200) {
          const newArray = [upload?.data?.attachment, ...(data?.attachments ?? [])];
          setData((prevOptions) => ({
            ...prevOptions,
            attachments: newArray,
          }));
          toast.success(upload.message, {
            position: 'top-right',
            autoClose: toastSettings.AUTO_CLOSE,
          });
          setLoading(false);
        }
      } catch (error) {
        setLoading(false);
        toast.error(error?.message, {
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
      }
    } else {
      setFileInfo({ name: '', type: '', size: 0 });
      setIsSuccess(false);
      setIsError(true);
      setLoading(false);
    }
    event.target.value = '';
  };

  const handleRedirect = (path) => {
    window.open(path, '_blank');
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

  const handleCompanyDialog = (company) => {
    setDialog({
      type: 'company',
      title: t('sales.locations.removeAssociation'),
      description: 'Do you want to remove this company from the property?',
      object: company,
      action: t('sales.locations.remove'),
    });
  };

  const handleContactDialog = (contact) => {
    setDialog({
      type: 'contact',
      title: t('sales.locations.removeAssociationConfirm'),
      description: 'Do you want to remove this contact from the property?',
      object: contact,
      action: t('sales.locations.remove'),
    });
  };

  const handleRemove = (type, object) => {
    if (type === 'contact') {
      handleRemoveContact(object);
    } else if (type === 'company') {
      hanldeRemoveCompany(object);
    }
  };

  const handleRemoveContact = async (object) => {
    try {
      setRemoveLoading(true);
      const payload = { contactId: object.id, _destroy: true };
      const response = await removeLocationContactAffiliation(id, {
        locationContactsAttributes: [payload],
      });
      if (response.statusCode === 200) {
        fetchLocation();
        toast.success(response.message, {
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
      }
    } catch (error) {
      toast.error(error?.message, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
    setDialog(null);
    setRemoveLoading(false);
  };

  const hanldeRemoveCompany = async (object) => {
    try {
      const payload = { companyId: object.id, _destroy: true };
      setRemoveLoading(true);
      const response = await removeLocationCompanyAffiliation(data?.locationId, {
        companyLocationsAttributes: [payload],
      });

      if (response.statusCode === 200) {
        fetchLocation();
        toast.success(response.message, {
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
      }
    } catch (error) {
      toast.error(error?.message, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
    setDialog(null);
    setRemoveLoading(false);
  };

  const getDealStage = (stageName) => {
    if (!stageName) return classes.otherStageColor;

    let stageColorClass = '';
    if (stageName === stageValues.QUESTIONS) {
      stageColorClass = classes.questionsColor;
    } else if (stageName === stageValues.PROPOSAL_CREATION) {
      stageColorClass = classes.proposalsColor;
    } else if (stageName === stageValues.CLOSED_LOST) {
      stageColorClass = classes.lostColor;
    } else if (stageName === stageValues.CLOSED_WON) {
      stageColorClass = classes.closedWoncolor;
    } else if (stageName === stageValues.PROPOSAL_DELIVERED) {
      stageColorClass = classes.negotiationColor;
    } else if (stageName === stageValues.NEGOTIATION) {
      stageColorClass = classes.negotiationColor;
    } else if (stageName === stageValues.TERMINATED) {
      stageColorClass = classes.terminated;
    } else {
      stageColorClass = stageValues.OTHERS;
    }

    return stageColorClass;
  };

  const referredContact = data?.referredBy?.contact || {};
  const hasPropertyUpdatePermission = userHasPermission(ACL_PROPERTIES_UPDATE);

  return (
    <>
      {loading && <LoaderComponent size={50} color={'primary'} label={t('sales.loading')} />}
      <Box className={classes.accordianWrapper}>
        <Accordion>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1a-content"
            id="panel1a-header"
          >
            <Typography>{t('sales.locations.locationDetails')} </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box className={classes.accordionData}>
              <Box key={`index-name`} className={classes.dataColWrap}>
                <Typography className={classes.dataColmLabel}>
                  {t('sales.locations.name')}
                </Typography>
                <Box className={classes.dataColmDetail}>
                  <Typography>{capitalizeFirstLetter(data?.locationName) || NA}</Typography>
                </Box>
              </Box>
              {/* <Box key={`index-industry`} className={classes.dataColWrap}>
                <Typography className={classes.dataColmLabel}>
                  {t('sales.locations.industry')}
                </Typography>
                <Box className={classes.dataColmDetail}>
                  <Typography>{capitalizeFirstLetter(data?.industry) || NA}</Typography>
                </Box>
              </Box> */}

              <Box className={classes.dataColWrap}>
                <Typography className={classes.dataColmLabel}>
                  {t('sales.locations.referredBy')}
                </Typography>
                <Box>
                  <Typography className={classes.dataColmDetail}>
                    {capitalize(data?.referredBy?.property?.name) || NA}
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
                  <Typography>{data?.company?.parentCompany || NA}</Typography>
                </Box>
              </Box>
              <Box key={`index-createdBy`} className={classes.dataColWrap}>
                <Typography className={classes.dataColmLabel}>
                  {t('sales.locations.createdBy')}
                </Typography>
                <Box className={classes.dataColmDetail}>
                  <Typography>{capitalizeFirstLetter(data?.createdBy) || NA}</Typography>
                </Box>
              </Box>
              <Box key={`index-creationDate`} className={classes.dataColWrap}>
                <Typography className={classes.dataColmLabel}>
                  {t('sales.locations.creationDate')}
                </Typography>
                <Box className={classes.dataColmDetail}>
                  <Typography>
                    {capitalizeFirstLetter(
                      formatISOTimestampToDate(data?.creationDate, dateFormat),
                    ) || NA}
                  </Typography>
                </Box>
              </Box>
              <Box key={`index-lastUpdated`} className={classes.dataColWrap}>
                <Typography className={classes.dataColmLabel}>
                  {t('sales.locations.lastUpdated')}
                </Typography>
                <Box className={classes.dataColmDetail}>
                  <Typography>
                    {capitalizeFirstLetter(
                      formatISOTimestampToDate(data?.lastUpdated, dateFormat),
                    ) || NA}
                  </Typography>
                </Box>
              </Box>
              {/* new colum? */}
              {/* <Box className={classes.dataColWrap}>
                <Typography className={classes.dataColmLabel}>
                  {t('sales.locations.managementCompany')}
                </Typography>
                <Box className={classes.dataColmDetail}>
                  <Typography>{capitalizeFirstLetter(data?.managementCompany) || NA}</Typography>
                </Box>
              </Box> */}
              {/* new colum? */}
              <Box className={classes.dataColWrap}>
                <Typography className={classes.dataColmLabel}>
                  {t('sales.locations.units')}
                </Typography>
                <Box className={classes.dataColmDetail}>
                  <Typography>{data?.numberOfUnits || NA}</Typography>
                </Box>
              </Box>
              {/* new colum? */}
              <Box className={classes.dataColWrap}>
                <Typography className={classes.dataColmLabel}>
                  {t('sales.locations.accupancyRate')}
                </Typography>
                <Box className={classes.dataColmDetail}>
                  <Typography>{data?.occupancyRate ? `${data?.occupancyRate}%` : NA}</Typography>
                </Box>
              </Box>
              {/* new colum? */}
              <Box className={classes.dataColWrap}>
                <Typography className={classes.dataColmLabel}>
                  {t('sales.locations.avgRent')}
                </Typography>
                <Box className={classes.dataColmDetail}>
                  <Typography>
                    {(data?.averageRent &&
                      `${symbol}${fomatNumbersWithCommas(data?.averageRent)}`) ||
                      NA}
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
              {/*    <Typography>{data?.leadStatus || NA}</Typography>*/}
              {/*  </Box>*/}
              {/*</Box>*/}
              <Box className={classes.dataColWrap}>
                <Typography className={classes.dataColmLabel}>
                  {t('sales.locations.annualRevenue')}
                </Typography>
                <Box className={classes.dataColmDetail}>
                  <Typography>
                    {(data?.annualRevenue &&
                      `${symbol}${fomatNumbersWithCommas(data?.annualRevenue)}`) ||
                      NA}
                  </Typography>
                </Box>
              </Box>
              <Box className={classes.dataColWrap}>
                <Typography className={classes.dataColmLabel}>
                  {t('sales.locations.createdSource')}
                </Typography>
                <Box className={classes.dataColmDetail}>
                  <Typography>{data?.createdSource || NA}</Typography>
                </Box>
              </Box>
              <Box className={classes.dataColWrap}>
                <Typography className={classes.dataColmLabel}>
                  {t('sales.locations.lastModifiedBy')}
                </Typography>
                <Box className={classes.dataColmDetail}>
                  <Typography>{data?.lastModifiedBy || NA}</Typography>
                </Box>
              </Box>
              <Box className={classes.dataColWrap}>
                <Typography className={classes.dataColmLabel}>
                  {t('sales.locations.lastModifiedSource')}
                </Typography>
                <Box className={classes.dataColmDetail}>
                  <Typography>{data?.lastModifiedSource || NA}</Typography>
                </Box>
              </Box>
              <Box className={classes.dataColWrap}>
                <Typography className={classes.dataColmLabel}>
                  {t('sales.locations.lastCleaned')}
                </Typography>
                <Box className={classes.dataColmDetail}>
                  <Typography>
                    {data?.lastCleaned
                      ? formatISOTimestampToDate(data?.lastCleaned, dateFormat)
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
                    {data?.lastEnriched
                      ? formatISOTimestampToDate(data?.lastEnriched, dateFormat)
                      : NA}
                  </Typography>
                </Box>
              </Box>
              <Box className={classes.dataColWrap}>
                <Typography className={classes.dataColmLabel}>
                  {t('sales.locations.squareFootage')}
                </Typography>
                <Box className={classes.dataColmDetail}>
                  <Typography>{data?.squareFootageOfBuilding || NA}</Typography>
                </Box>
              </Box>
              <Box className={classes.dataColWrap}>
                <Typography className={classes.dataColmLabel}>
                  {t('sales.locations.parkingSpaces')}
                </Typography>
                <Box className={classes.dataColmDetail}>
                  <Typography>{data?.parkingSpaces || NA}</Typography>
                </Box>
              </Box>
              <Box className={classes.dataColWrap}>
                <Typography className={classes.dataColmLabel}>
                  {t('sales.locations.buildingClass')}
                </Typography>
                <Box className={classes.dataColmDetail}>
                  <Typography>{data?.buildingClass || NA}</Typography>
                </Box>
              </Box>
              <Box className={classes.dataColWrap}>
                <Typography className={classes.dataColmLabel}>
                  {t('sales.locations.tenancy')}
                </Typography>
                <Box className={classes.dataColmDetail}>
                  <Typography>{data?.tenancy || NA}</Typography>
                </Box>
              </Box>
              <Box className={classes.dataColWrap}>
                <Typography className={classes.dataColmLabel}>
                  {t('sales.locations.amenities')}
                </Typography>
                <Box className={classes.dataColmDetail}>
                  <Typography>{data?.amenities || NA}</Typography>
                </Box>
              </Box>
              <Box className={classes.dataColWrap}>
                <Typography className={classes.dataColmLabel}>
                  {t('sales.locations.numberOfBuildings')}
                </Typography>
                <Box className={classes.dataColmDetail}>
                  <Typography>{data?.numberOfBuildings || NA}</Typography>
                </Box>
              </Box>
              <Box className={classes.dataColWrap}>
                <Typography className={classes.dataColmLabel}>
                  {t('sales.locations.lotNumber')}
                </Typography>
                <Box className={classes.dataColmDetail}>
                  <Typography>{data?.lotNumber || NA}</Typography>
                </Box>
              </Box>
            </Box>
          </AccordionDetails>
        </Accordion>
        <Accordion
          expanded={companyAccordion}
          onChange={() => setCompanyAccordion(!companyAccordion)}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel2a-content"
            id="panel2a-header"
          >
            <Typography>
              {t('sales.locations.companyAccount')} • {getCount(data?.companies?.length)}
            </Typography>
            {companyAccordion && (
              <RenderIfHasPermission name={ACL_PROPERTIES_UPDATE}>
                <Button variant="onlyText" onClick={() => setCompanyModal({})}>
                  {t('sales.locations.addCompany')}
                </Button>
              </RenderIfHasPermission>
            )}
          </AccordionSummary>
          <AccordionDetails>
            {data?.companies?.length > 0 ? (
              data?.companies?.map((company, index) => (
                <Box key={company?.id || index} className={classes.accordionData}>
                  <Box className={classes.dataColWrap}>
                    <Typography className={classes.dataColmLabel}>
                      {t('sales.locations.name')}
                    </Typography>
                    <Box className={classes.dataColmDetail}>
                      <Typography>{capitalizeFirstLetter(company?.name) || NA}</Typography>
                    </Box>
                    <Box className={classes.redirectWraper}>
                      <RenderIfHasPermission name={ACL_COMPANIES_VIEW}>
                        <RedirectIcon
                          onClick={() =>
                            handleRedirect(routes.SALES_COMPANY_DETAIL.replace(':id', company?.id))
                          }
                          className={classes.redirectIcon}
                          style={{ cursor: 'pointer' }}
                        />
                      </RenderIfHasPermission>
                      {companyAccordion && hasPropertyUpdatePermission && (
                        <PopoverButton
                          className={classes.actions}
                          variant="icon"
                          Icon={MoreVert}
                          anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'center',
                          }}
                          width={150}
                        >
                          <Box className={classes.actionsMenu}>
                            <RenderIfHasPermission name={ACL_PROPERTIES_UPDATE}>
                              <Box
                                className={classes.actionsRegular}
                                onClick={() => setCompanyModal(company)}
                              >
                                <Typography
                                  className={classes.actionsTextRegular}
                                  variant="subtitle2"
                                >
                                  Edit
                                </Typography>
                              </Box>
                            </RenderIfHasPermission>
                            {data?.companies?.length > 1 && (
                              <RenderIfHasPermission name={ACL_PROPERTIES_UPDATE}>
                                <Box
                                  className={classes.actionsRegular}
                                  onClick={() => handleCompanyDialog(company)}
                                >
                                  <Typography
                                    className={classes.actionsTextRegular}
                                    variant="subtitle2"
                                  >
                                    {t('sales.locations.removeAssociation')}
                                  </Typography>
                                </Box>
                              </RenderIfHasPermission>
                            )}
                          </Box>
                        </PopoverButton>
                      )}
                    </Box>
                  </Box>
                  <Box className={classes.dataColWrap}>
                    <Typography className={classes.dataColmLabel}>
                      {t('sales.locations.companyOwner')}
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
                      <Link className={classes.dataLink} href={`tel:${company?.contact || '#'}`}>
                        <Typography>{company?.contact || NA}</Typography>
                      </Link>
                    </Box>
                  </Box>
                  <Box className={classes.dataColWrap}>
                    <Typography className={classes.dataColmLabel}>
                      {t('sales.locations.address')}
                    </Typography>
                    <Box className={classes.dataColmDetail}>
                      <Typography>
                        {company?.fullAddress ||
                          formatAddress(
                            capitalizeFirstLetter(company?.address),
                            capitalizeFirstLetter(company?.city),
                            capitalizeFirstLetter(company?.state),
                            company?.postalCode,
                          ) ||
                          NA}
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
                        <Typography variant="body2" className={classes.title}>
                          {NA}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                  <Box className={classes.dataColWrap}>
                    <Typography className={classes.dataColmLabel}>
                      {t('sales.locations.score')}
                    </Typography>
                    <Typography variant="body2" className={classes.title}>
                      {company?.score && company?.score > 0 ? `${company?.score} %` : NA}
                    </Typography>
                  </Box>
                  <Box className={classes.dataColWrap}>
                    <Typography className={classes.dataColmLabel}>
                      {t('commonText.affiliations')}
                    </Typography>
                    <Box className={classes.chipWrapperCompanies}>
                      {company?.companyAffiliation?.map((affiliation, cIndex) => (
                        <Chip
                          key={cIndex}
                          label={capitalizeFirstLetter(affiliation?.name || NA)}
                          size="small"
                          variant="outlined"
                          style={locationAffiliationChipColors[affiliation?.key]}
                          sx={{ border: 'none' }}
                        />
                      ))}
                    </Box>
                  </Box>
                </Box>
              ))
            ) : (
              <>{t('sales.locations.noCompanyAssociatedAgainstLocation')}</>
            )}
          </AccordionDetails>
        </Accordion>
        <Accordion>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel2a-content"
            id="panel2a-header"
          >
            <Typography>
              {t('sales.locations.deals')} • {getCount(data?.deals?.length)}{' '}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box className={classes.accordionData}>
              {data?.deals && data?.deals?.length > 0
                ? data?.deals?.map((deal, index) => (
                    <Box key={index} className={classes.dealsData}>
                      <Box className={classes.dealsDataFlex}>
                        <Typography className={classes.dataLabel}>
                          {capitalizeFirstLetter(deal?.name) || NA}
                        </Typography>
                        <RenderIfHasPermission name={ACL_DEALS_VIEW}>
                          <RedirectIcon
                            onClick={() =>
                              handleRedirect(routes.SALES_DEAL_DETAIL.replace(':id', deal?.id))
                            }
                            className={classes.redirectIcon}
                            style={{ cursor: 'pointer' }}
                          />
                        </RenderIfHasPermission>
                      </Box>
                      <Typography className={classes.dataColmDetail}>
                        {t('sales.locations.amount')}: {`${symbol}${deal?.amount}` || NA}
                      </Typography>
                      <Typography className={classes.dataColmDetail}>
                        {t('sales.companies.date')}:{' '}
                        {formatISOTimestampToDate(deal?.date, dateFormat) || NA} •{' '}
                        {t('sales.locations.stage')}:{' '}
                        <Box
                          component="span"
                          className={classNames(
                            classes.commonStageColor,
                            getDealStage(deal?.stage?.value),
                          )}
                        >
                          {deal?.stage?.label || NA}
                        </Box>
                      </Typography>
                    </Box>
                  ))
                : t('sales.locations.noDeals')}
            </Box>
          </AccordionDetails>
        </Accordion>

        <Accordion expanded={expanded} onChange={handleAccordionChange}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel2a-content"
            id="panel2a-header"
          >
            <Typography>
              {t('sales.locations.contacts')} • {getCount(data?.contacts?.length)}
            </Typography>

            {expanded && (
              <RenderIfHasPermission name={ACL_PROPERTIES_UPDATE}>
                <Button onClick={() => setContactModal({})} variant="onlyText">
                  {t('sales.locations.addContactTitle')}
                </Button>
              </RenderIfHasPermission>
            )}
          </AccordionSummary>
          <AccordionDetails>
            <Box className={classes.accordionData}>
              <Box key={`contact-details`} className={classes.contactWrap}>
                {data?.contacts
                  ? data?.contacts?.map((contact, index) => (
                      <Box key={index} className={classes.contactContent}>
                        <img src={contact?.image || defaultImage} className={classes.userImage} />
                        <Box className={classes.contactDetailsWrapper}>
                          <Box className={classes.contactDetails}>
                            <Typography className={classes.dataColmLabelContact}>
                              {contact?.fullName || `${t('sales.contract.name')}: ${NA}`}
                              {contact?.jobTitle ? ` • ${contact?.jobTitle}` : null}
                            </Typography>

                            <Link className={classes.dataLink} href={`mailto:${contact?.email}`}>
                              {contact?.email ? (
                                <Typography className={classes.emailIcon}>
                                  {contact.email} <DetailEmailIcon />
                                </Typography>
                              ) : (
                                <Typography>{`${t('sales.contacts.email')}: ${NA}`}</Typography>
                              )}
                            </Link>
                            <Link className={classes.dataLink} href={`tel:${contact?.phoneNumber}`}>
                              <Typography>
                                {contact?.phoneNumber ||
                                  `${t('sales.contacts.phoneNumber')}: ${NA}`}
                              </Typography>
                            </Link>
                          </Box>
                          <Box className={classes.chipWrapper}>
                            {contact?.contactAffiliation?.map((affiliatedContact, cIndex) => (
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
                        <Box>
                          <Box className={classes.redirectWraper}>
                            <RenderIfHasPermission name={ACL_CONTACTS_VIEW}>
                              <RedirectIcon
                                onClick={() =>
                                  handleRedirect(
                                    routes.SALES_CONTACT_DETAIL_ROUTE.replace(':id', contact?.id),
                                  )
                                }
                                className={classes.redirectIcon}
                                style={{ cursor: 'pointer' }}
                              />
                            </RenderIfHasPermission>
                            {expanded && hasPropertyUpdatePermission && (
                              <PopoverButton
                                className={classes.actions}
                                variant="icon"
                                Icon={MoreVert}
                                anchorOrigin={{
                                  vertical: 'bottom',
                                  horizontal: 'center',
                                }}
                              >
                                <Box className={classes.actionsMenu}>
                                  <RenderIfHasPermission name={ACL_PROPERTIES_UPDATE}>
                                    <Box
                                      className={classes.actionsRegular}
                                      onClick={() => setContactModal(contact)}
                                    >
                                      <Typography
                                        className={classes.actionsTextRegular}
                                        variant="subtitle2"
                                      >
                                        {t('sales.locations.edit')}
                                      </Typography>
                                    </Box>
                                    {data?.contacts?.length > 1 && (
                                      <Box
                                        className={classes.actionsRegular}
                                        onClick={() => handleContactDialog(contact)}
                                      >
                                        <Typography
                                          className={classes.actionsTextRegular}
                                          variant="subtitle2"
                                        >
                                          {t('sales.locations.removeAssociation')}
                                        </Typography>
                                      </Box>
                                    )}
                                  </RenderIfHasPermission>
                                </Box>
                              </PopoverButton>
                            )}
                          </Box>
                        </Box>
                      </Box>
                    ))
                  : t('sales.contacts.noContacts')}
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
              {!isObjectEmpty(franchise) > 0
                ? franchiseAssociated.map((item, index) => (
                    <Box key={index} className={classes.dataColWrap}>
                      <Typography className={classes.dataColmLabel}>{item?.label}</Typography>
                      <Box className={classes.dataColmDetail}>
                        {item?.label === 'Email' || item?.label === 'Contact #' ? (
                          <Link
                            className={classes.dataLink}
                            href={
                              item?.label === 'Email'
                                ? `mailto:${item?.value}`
                                : `tel:${item?.value}`
                            }
                          >
                            <Typography>
                              {item?.value} {item?.label === 'Email' && <DetailEmailIcon />}
                            </Typography>
                          </Link>
                        ) : (
                          <Typography>{capitalizeFirstLetter(item?.value)}</Typography>
                        )}
                      </Box>
                    </Box>
                  ))
                : t('sales.deals.noAssciatedFranchiseLocation')}
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
                        key={file?.fileName}
                        placement="bottom"
                        arrow
                      >
                        <Box key={file.id} className={classes.attachSuccess}>
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
          title={t('sales.locations.areYouSureToDelete')}
          text={t('sales.locations.areYouSureToDeleteDesc')}
          cancelButtonText={t('sales.locations.cancelBtn')}
          confirmButtonText={t('sales.locations.deleteBtn')}
          show={showDeleteModal?.active}
          handleConfirmButton={() => handleDeleteAttachment(showDeleteModal?.id)}
          handleCancelButton={() => setShowDeleteModal({ id: null, active: false })}
          icon={<DeleteSweetAlertIcon />}
        />
      )}
      {companyModal && (
        <Modal
          open={companyModal}
          onClose={() => setCompanyModal(null)}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={style} className={classes.companyAssociationWrapper}>
            <CompanyAssociation
              anchor={locationDrawerTypes.RIGHT}
              onClose={() => setCompanyModal(null)}
              location={data}
              company={companyModal}
              onSuccess={fetchLocation}
            />
          </Box>
        </Modal>
      )}
      {!!contactModal && (
        <Modal
          open={!!contactModal}
          onClose={() => setContactModal(null)}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={style}>
            <ContactAssociation
              anchor={locationDrawerTypes.RIGHT}
              onClose={() => setContactModal(null)}
              contact={contactModal}
              location={data}
              onSuccess={fetchLocation}
            />
          </Box>
        </Modal>
      )}
      <ConfirmationDialog
        open={!!dialog}
        title={dialog?.title}
        description={dialog?.description}
        action={dialog?.action}
        icon={<WarningIcon />}
        disabled={removeLoading}
        handleClose={() => setDialog(null)}
        handleConfirm={() => handleRemove(dialog.type, dialog.object)}
      />
    </>
  );
};

DetailsAccordians.propTypes = {
  data: PropTypes.object, // Adjust the type accordingly based on the expected data structure
  setData: PropTypes.func,
  franchise: PropTypes.object, // Adjust the type accordingly based on the expected data structure
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  fetchLocation: PropTypes.func,
};

export default DetailsAccordians;
