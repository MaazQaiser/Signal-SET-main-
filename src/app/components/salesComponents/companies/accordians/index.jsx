import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Box, Chip, Tooltip } from '@mui/material';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Typography from '@mui/material/Typography';
import { ReactComponent as DeleteSweetAlertIcon } from 'assets/svg/delete-modal.svg';
import { ReactComponent as InfoIcon } from 'assets/svg/info.svg';
import { ReactComponent as RedirectIcon } from 'assets/svg/redirect-icon.svg';
import { ReactComponent as TrasIcon } from 'assets/svg/trash.svg';
import PropTypes from 'prop-types';
import * as React from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { locationAffiliationChipColors } from 'salesComponents/constant/exportEntities.constant';
import LoaderComponent from 'src/app/components/common/loader';
import SweetAlertModal from 'src/app/components/common/sweetAlertModal';
import * as routes from 'src/app/router/constant/ROUTE';
import { ACL_DEALS_VIEW, ACL_PROPERTIES_VIEW } from 'src/app/router/constant/SALESMODULE';
import history from 'src/app/router/utils/history';
import { Featuredicon } from 'src/assets/svg';
import { getCount } from 'src/helper/utilityFunctions';
import RenderIfHasPermission from 'src/hoc/renderIfHasPermission';
import { getDisplayConfiguration } from 'src/redux/store/slices/regionalCountryConfiguration';
import { deleteAttachment, uploadAttachment } from 'src/services/attachment.service';
import { attachmentSettings, defaultImage, toastSettings } from 'src/utils/constants';
import { formatCurrencyWithCommasAndSuffix } from 'src/utils/currencyFormater';
import { openFile } from 'src/utils/files';
import { formatAddress } from 'src/utils/formatAddress/formatAddress';
import capitalize from 'src/utils/string/capitalize';
import { capitalizeFirstLetter, getChipColor, spMapping } from 'src/utils/string/common';

import AttachmentsUpload from '../companiesAttachmentsUpload';
import ContactAccordianData from '../contactAccordianData';
import DealsAccordianData from '../dealsAccordianData';
import { useStyles } from './accordian.js';

const BasicAccordion = ({ deals = [], data, setData, id }) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const { symbol } = useSelector(getDisplayConfiguration);
  const [_fileInfo, setFileInfo] = useState({ name: '', type: '', size: 0 });
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  const [_loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState({
    active: false,
    id: null,
  });
  const NA = t('commonText.nA');

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
    const duplicateFile = data?.company?.attachments?.some((file) => file?.fileName === name);
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
      formData.append('attachableType', 'Company');
      formData.append('file', selectedFile);

      try {
        const upload = await uploadAttachment(formData);
        if (upload?.statusCode === 200) {
          const newArray = [upload?.data?.attachment, ...(data?.company?.attachments ?? [])];
          setData((prevOptions) => ({
            ...prevOptions,
            company: {
              ...prevOptions.company,
              attachments: newArray,
            },
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

  const handleRedirect = (path) => {
    history.push(path);
  };

  const handleDeleteAttachment = async (id) => {
    try {
      const deleteResp = await deleteAttachment(id);
      if (deleteResp?.statusCode === 200) {
        // Filter out the attachment with the specified id
        const newArray =
          data?.company?.attachments?.filter((attachment) => attachment.id !== id) ?? [];

        // Update the state with the new array
        setData((prevOptions) => ({
          ...prevOptions,
          // attachments: newArray,
          company: {
            ...prevOptions.company,
            attachments: newArray,
          },
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
        {/*Company Detail Accordion*/}
        <Accordion>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1a-content"
            id="panel1a-header"
          >
            <Typography>{`${t('sales.companies.aboutThisCompany')}`}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box className={classes.accwrapper}>
              <Box className={classes.dataColWrap}>
                <Typography variant="body2" className={classes.dataColmLabel}>
                  {t('sales.companies.name')}
                </Typography>
                <Typography variant="body2" className={classes.dataColmDetail}>
                  {capitalizeFirstLetter(data?.company?.name) || NA}
                </Typography>
              </Box>
              <Box className={classes.dataColWrap}>
                <Typography variant="body2" className={classes.dataColmLabel}>
                  {t('sales.companies.companyOwner')}
                </Typography>
                <Typography variant="body2" className={classes.dataColmDetail}>
                  {capitalize(data?.company?.ownerName) || NA}
                </Typography>
              </Box>
              <Box className={classes.dataColWrap}>
                <Typography variant="body2" className={classes.dataColmLabel}>
                  {t('sales.companies.contact')}
                </Typography>
                <Typography variant="body2" className={classes.dataColmDetail}>
                  {capitalize(data?.company?.phoneNumber) || NA}
                </Typography>
              </Box>
              <Box className={classes.dataColWrap}>
                <Typography variant="body2" className={classes.dataColmLabel}>
                  {t('sales.locations.address')}
                </Typography>
                <Typography variant="body2" className={classes.dataColmDetail}>
                  {data?.company?.fullAddress ||
                    formatAddress(
                      capitalizeFirstLetter(data?.company?.address),
                      capitalizeFirstLetter(data?.company?.city),
                      capitalizeFirstLetter(data?.company?.state),
                      data?.company?.postalCode,
                    ) ||
                    NA}
                </Typography>
              </Box>
              <Box className={classes.dataColWrap}>
                <Typography variant="body2" className={classes.dataColmLabel}>
                  {t('sales.companies.verticalMarket')}
                </Typography>
                <Typography variant="body2" className={classes.dataColmDetail}>
                  {data?.company?.industry?.label || NA}
                </Typography>
              </Box>
              <Box className={classes.dataColWrap}>
                <Typography variant="body2" className={classes.dataColmLabel}>
                  {t('sales.companies.subVertical')}
                </Typography>
                <Typography variant="body2" className={classes.dataColmDetail}>
                  {data?.company?.subVertical || NA}
                </Typography>
              </Box>
              <Box className={classes.dataColWrap}>
                <Typography variant="body2" className={classes.dataColmLabel}>
                  {t('sales.companies.naicsCodes')}
                </Typography>
                <Typography variant="body2" className={classes.dataColmDetail}>
                  {data?.company?.naicsCodes || NA}
                </Typography>
              </Box>
              <Box className={classes.dataColWrap}>
                <Typography variant="body2" className={classes.dataColmLabel}>
                  {t('sales.companies.noOfLocations')}
                </Typography>
                <Typography variant="body2" className={classes.dataColmDetail}>
                  {data?.company?.numberOfLocations || NA}
                </Typography>
              </Box>
              <Box className={classes.dataColWrap}>
                <Typography variant="body2" className={classes.dataColmLabel}>
                  {t('sales.companies.revenue')}
                </Typography>
                <Typography variant="body2" className={classes.dataColmDetail}>
                  {`${symbol}${formatCurrencyWithCommasAndSuffix(data?.company?.revenue)}` || NA}
                </Typography>
              </Box>
              <Box className={classes.dataColWrap}>
                <Typography variant="body2" className={classes.dataColmLabel}>
                  {t('sales.companies.noOfEmployees')}
                </Typography>
                <Typography variant="body2" className={classes.dataColmDetail}>
                  {data?.company?.numberOfEmployees || NA}
                </Typography>
              </Box>
              <Box className={classes.dataColWrap}>
                <Typography variant="body2" className={classes.dataColmLabel}>
                  {t('sales.companies.publicPrivate')}
                </Typography>
                <Typography variant="body2" className={classes.dataColmDetail}>
                  {data?.company?.isPublic && data?.company?.isPublic
                    ? t('sales.companies.public')
                    : t('sales.companies.private') || NA}
                </Typography>
              </Box>
              <Box className={classes.dataColWrap}>
                <Typography variant="body2" className={classes.dataColmLabel}>
                  {t('sales.companies.strategicPartnership')}
                </Typography>
                <Typography
                  variant="body2"
                  className={`${classes.dataColmDetail}`}
                  display="flex"
                  alignItems="center"
                >
                  <Box className={classes.assignToText}>
                    {data?.company?.strategicPartnershipStatus ? (
                      <Chip
                        label={spMapping[data?.company?.strategicPartnershipStatus]}
                        size="small"
                        icon={
                          data?.company?.strategicPartnershipTooltip && (
                            <Tooltip
                              title={
                                <span
                                  dangerouslySetInnerHTML={{
                                    __html: data?.company?.strategicPartnershipTooltip,
                                  }}
                                />
                              }
                            >
                              <InfoIcon
                                fontSize="small"
                                sx={{
                                  color: getChipColor(data?.company?.strategicPartnershipStatus),
                                }}
                              />
                            </Tooltip>
                          )
                        }
                        color={getChipColor(data?.company?.strategicPartnershipStatus)}
                      />
                    ) : (
                      <span> {NA} </span>
                    )}
                  </Box>
                </Typography>
              </Box>
              <Box className={classes.dataColWrap}>
                <Typography variant="body2" className={classes.dataColmLabel}>
                  {t('sales.companies.companyDomain')}
                </Typography>
                <Typography variant="body2" className={classes.dataColmDetail}>
                  {data?.company?.companyDomain || NA}
                </Typography>
              </Box>
              <Box className={classes.dataColWrap}>
                <Typography variant="body2" className={classes.dataColmLabel}>
                  {t('sales.companies.yearFounded')}
                </Typography>
                <Typography variant="body2" className={classes.dataColmDetail}>
                  {data?.company?.foundedYear || NA}
                </Typography>
              </Box>
            </Box>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1a-content"
            id="panel1a-header"
          >
            <Typography>
              {`${t('sales.locations.locations')}`} • {getCount(data?.locations?.length)}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            {data?.locations?.length > 0 ? (
              data?.locations?.map((location, i) => (
                <>
                  <Box className={classes.accawrapper}>
                    <Box key={i} className={classes.dataColWrap}>
                      <Typography variant="body2" className={classes.dataColmLabel}>
                        {t('sales.locations.name')}
                      </Typography>
                      <Typography variant="body2" className={classes.dataColmDetail}>
                        {capitalizeFirstLetter(location?.name) || NA}
                      </Typography>
                      <RenderIfHasPermission name={ACL_PROPERTIES_VIEW}>
                        <RedirectIcon
                          onClick={() =>
                            handleRedirect(
                              routes.SALES_LOCATION_DETAIL.replace(':id', location?.id),
                            )
                          }
                          style={{ cursor: 'pointer', alignSelf: 'center' }}
                        />
                      </RenderIfHasPermission>
                    </Box>
                    <Box className={classes.dataColWrap}>
                      <Typography variant="body2" className={classes.dataColmLabel}>
                        {t('sales.companies.industry')}
                      </Typography>
                      <Typography variant="body2" className={classes.dataColmDetail}>
                        {capitalizeFirstLetter(location?.industry?.label) || NA}
                      </Typography>
                    </Box>
                    <Box className={classes.dataColWrap}>
                      <Typography variant="body2" className={classes.dataColmLabel}>
                        {t('sales.locations.address')}
                      </Typography>
                      <Typography variant="body2" className={classes.dataColmDetail}>
                        {location?.fullAddress || NA}
                      </Typography>
                    </Box>
                    <Box className={classes.dataColWrap}>
                      <Typography variant="body2" className={classes.dataColmLabel}>
                        {t('sales.deals.source')}
                      </Typography>
                      <Typography variant="body2" className={classes.dataColmDetail}>
                        {location?.source || NA}
                      </Typography>
                    </Box>
                    <Box className={classes.dataColWrap}>
                      <Typography variant="body2" className={classes.dataColmLabel}>
                        {t('sales.locations.level')}
                      </Typography>
                      <Typography variant="body2" className={classes.dataColmDetail}>
                        {location?.level || NA}
                      </Typography>
                    </Box>
                    <Box className={classes.dataColWrap}>
                      <Typography variant="body2" className={classes.dataColmLabel}>
                        {t('sales.locations.type')}
                      </Typography>
                      <Typography variant="body2" className={classes.dataColmDetail}>
                        {location?.type?.length
                          ? location?.type?.map((loc, index) => (
                              <Chip
                                key={index}
                                label={capitalizeFirstLetter(loc?.name || NA)}
                                size="small"
                                variant="outlined"
                                style={locationAffiliationChipColors[loc?.key]}
                                sx={{ border: 'none' }}
                              />
                            ))
                          : NA}
                      </Typography>
                    </Box>
                  </Box>
                  {/* <DealsAccordianData
                  key={i}
                  deal={deal?.description}
                  date={deal?.date}
                  amount={deal?.amount}
                  stage={deal?.stage}
                /> */}
                </>
              ))
            ) : (
              <Box>{t('sales.deals.noLocationCompanies')}</Box>
            )}
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1a-content"
            id="panel1a-header"
          >
            <Typography>
              {`${t('commonText.deals')}`} • {getCount(deals?.length)}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            {deals.length > 0 ? (
              deals.map((deal, i) => (
                <>
                  <Box className={classes.dataColWrap}>
                    <Typography variant="body2">
                      {capitalizeFirstLetter(deal?.name || NA)}
                    </Typography>
                    <RenderIfHasPermission name={ACL_DEALS_VIEW}>
                      <RedirectIcon
                        onClick={() =>
                          handleRedirect(routes.SALES_DEAL_DETAIL.replace(':id', deal?.id))
                        }
                        style={{ cursor: 'pointer', alignSelf: 'center' }}
                      />
                    </RenderIfHasPermission>
                  </Box>
                  <DealsAccordianData
                    key={i}
                    deal={deal?.description}
                    date={deal?.date}
                    amount={deal?.amount}
                    stage={deal?.stage}
                  />
                </>
              ))
            ) : (
              <Box>{t('sales.deals.noDealCompanies')}</Box>
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
              {`${t('commonText.contacts')}`} • {getCount(data?.contacts?.length)}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            {data?.contacts && data?.contacts.length > 0 ? (
              data?.contacts.map((contact) => (
                <ContactAccordianData
                  id={contact.id}
                  key={contact?.email}
                  name={`${contact?.firstName} ${contact?.lastName}`}
                  email={contact?.email}
                  jobTitle={contact?.jobTitle}
                  phoneNumber={contact?.phoneNumber}
                  image={contact?.image || defaultImage}
                />
              ))
            ) : (
              <Box>{t('sales.deals.noContactsCompany')}</Box>
            )}
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
              {t('sales.locations.attachments')} • {getCount(data?.company?.attachments?.length)}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box className={classes.accordionData}>
              {data?.company?.attachments && data?.company?.attachments?.length
                ? data?.company?.attachments?.map((file) => {
                    return (
                      <Tooltip
                        className={classes.toolTipBox}
                        title={`Download ${file?.fileName}`}
                        key={file?.id}
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
                            onClick={() =>
                              setShowDeleteModal({
                                id: file?.id, // TODO: wrote this to check if the file got deleted by attachable id file?.attachableId,
                                active: true,
                              })
                            }
                            className={classes.trashIconBox}
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
          title={t('sales.companies.areYouSureToDelete')}
          text={t('sales.companies.areYouSureToDeleteDesc')}
          cancelButtonText={t('sales.companies.cancelBtn')}
          confirmButtonText={t('sales.companies.deleteBtn')}
          show={showDeleteModal?.active}
          handleConfirmButton={() => handleDeleteAttachment(showDeleteModal.id)}
          handleCancelButton={() => setShowDeleteModal({ id: null, active: false })}
          icon={<DeleteSweetAlertIcon />}
        />
      )}
    </>
  );
};

BasicAccordion.propTypes = {
  deals: PropTypes.array,
  contacts: PropTypes.any, // You might want to replace 'any' with the specific PropTypes for your use case
  data: PropTypes.any, // Similarly, replace 'any' with the specific PropTypes for your use case
  setData: PropTypes.func,
  id: PropTypes.any, // Replace 'any' with the specific PropTypes for your use case
};

export default BasicAccordion;
