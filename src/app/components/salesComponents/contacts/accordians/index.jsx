import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Box, Chip, Tooltip } from '@mui/material';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Typography from '@mui/material/Typography';
import { ReactComponent as InfoIcon } from 'assets/svg/info.svg';
import { ReactComponent as RedirectBlueIcon } from 'assets/svg/redirect-blue.svg';
import { ReactComponent as RedirectIcon } from 'assets/svg/redirect-icon.svg';
import PropTypes from 'prop-types';
import * as React from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { contactAffiliationChipColors } from 'salesComponents/constant/exportEntities.constant';
import * as routes from 'src/app/router/constant/ROUTE';
import { ACL_COMPANIES_VIEW, ACL_PROPERTIES_VIEW } from 'src/app/router/constant/SALESMODULE.jsx';
import history from 'src/app/router/utils/history';
import { getCount } from 'src/helper/utilityFunctions';
import RenderIfHasPermission from 'src/hoc/renderIfHasPermission.jsx';
import { getDisplayConfiguration } from 'src/redux/store/slices/regionalCountryConfiguration';
import { uploadAttachment } from 'src/services/attachment.service';
import { toastSettings } from 'src/utils/constants';
import { formatISOTimestampToDate } from 'src/utils/date';
import { formatAddress } from 'src/utils/formatAddress/formatAddress';
import capitalize from 'src/utils/string/capitalize';
import { capitalizeFirstLetter, getChipColor, spMapping } from 'src/utils/string/common';

import { useStyles } from './accordian.js';

const BasicAccordionContacts = ({ data, setData, id }) => {
  const { t } = useTranslation();
  const NA = t('commonText.nA');

  const classes = useStyles();
  const { dateFormat } = useSelector(getDisplayConfiguration);
  const [_fileInfo, setFileInfo] = useState({ name: '', type: '', size: 0 });
  const [_isSuccess, setIsSuccess] = useState(false);
  const [_isError, setIsError] = useState(false);

  const handleRedirect = (path) => {
    history.push(path);
  };

  const _handleFileChange = async (event) => {
    const selectedFile = event.target.files[0];
    const { name, type, size } = selectedFile;
    const sizeInMB = (size / (1024 * 1024)).toFixed(2);
    /**
     * show error if file size exce
     */
    if (sizeInMB > 5) {
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
        toast.success(upload.message, {
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
      }
    } else {
      setFileInfo({ name: '', type: '', size: 0 });
      setIsSuccess(false);
      setIsError(true);
    }
  };

  return (
    <Box className={classes.accordianWrapper}>
      {/*About this contact accordion*/}
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel2a-content"
          id="panel2a-header"
        >
          <Typography variant="h5">{t('sales.contacts.aboutContact')}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box className={classes.companyFlex}>
            <Typography variant="body2" className={classes.companyLabel}>
              {t('sales.contacts.jobTitle')}
            </Typography>
            <Typography variant="body2" className={classes.companyDetName}>
              {data?.jobtitle || NA}
            </Typography>
          </Box>
          <Box className={classes.companyFlex}>
            <Typography variant="body2" className={classes.companyLabel}>
              {t('sales.contacts.email')}
            </Typography>
            <Typography variant="body2" className={classes.companyDetName}>
              {data?.email || NA}
            </Typography>
          </Box>
          <Box className={classes.companyFlex}>
            <Typography variant="body2" className={classes.companyLabel}>
              {t('sales.contacts.phoneNumber')}
            </Typography>
            <Typography variant="body2" className={classes.companyDetName}>
              {data?.phone || NA}
            </Typography>
          </Box>
          <Box className={classes.companyFlex}>
            <Typography variant="body2" className={classes.companyLabel}>
              {t('sales.contacts.lastModifiedBy')}
            </Typography>
            <Typography variant="body2" className={classes.companyDetName}>
              {data?.lastModifiedBy || NA}
            </Typography>
          </Box>
          <Box className={classes.companyFlex}>
            <Typography variant="body2" className={classes.companyLabel}>
              {t('sales.contacts.lastModifiedDate')}
            </Typography>
            <Typography variant="body2" className={classes.companyDetName}>
              {formatISOTimestampToDate(data?.lastModifiedDate, dateFormat) || NA}
            </Typography>
          </Box>
          <Box className={classes.companyFlex}>
            <Typography variant="body2" className={classes.companyLabel}>
              {t('sales.contacts.lastModifiedSource')}
            </Typography>
            <Typography variant="body2" className={classes.companyDetName}>
              {data?.lastModifiedSource || NA}
            </Typography>
            {/* <Box className={classes.companyFlex}>
              <Typography variant="body2" className={classes.companyLabel}>
                {t('sales.contacts.lastModifiedBy')}
              </Typography>
              <Typography variant="body2" className={classes.companyDetName}>
                {data?.createdBy || NA}
              </Typography>
            </Box>
            <Box className={classes.companyFlex}>
              <Typography variant="body2" className={classes.companyLabel}>
                {t('sales.contacts.createdDate')}
              </Typography>
              <Typography variant="body2" className={classes.companyDetName}>
                {data?.createDate || NA}
              </Typography>
            </Box>
            <Box className={classes.companyFlex}>
              <Typography variant="body2" className={classes.companyLabel}>
                {t('sales.contacts.createdSource')}
              </Typography>
              <Typography variant="body2" className={classes.companyDetName}>
                {data?.createDate || NA}
              </Typography>
            </Box>
            <Box className={classes.companyFlex}>
              <Typography variant="body2" className={classes.companyLabel}>
                {t('sales.contacts.lastCleaned')}
              </Typography>
              <Typography variant="body2" className={classes.companyDetName}>
                {data?.lastCleaned || NA}
              </Typography>
            </Box>
            <Box className={classes.companyFlex}>
              <Typography variant="body2" className={classes.companyLabel}>
                {t('sales.contacts.lastEnriched')}
              </Typography>
              <Typography variant="body2" className={classes.companyDetName}>
                {data?.lastEnriched || NA}
              </Typography>
            </Box>
            <Box className={classes.companyFlex}>
              <Typography variant="body2" className={classes.companyLabel}>
                {t('sales.contacts.signalOwner')}
              </Typography>
              <Typography variant="body2" className={classes.companyDetName}>
                {data?.signalOwner || NA}
              </Typography>
            </Box>
            <Box className={classes.companyFlex}>
              <Typography variant="body2" className={classes.companyLabel}>
                {t('sales.contacts.zoomInfoId')}
              </Typography>
              <Typography variant="body2" className={classes.companyDetName}>
                {data?.zoomInfoId || NA}
              </Typography>
            </Box> */}
          </Box>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel2a-content"
          id="panel2a-header"
        >
          <Typography variant="h5">
            {t('sales.contacts.company')} • {getCount(data?.companies?.length)}
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          {data?.companies && data?.companies.length > 0 ? (
            data?.companies.map((company, _index) => (
              <Box key={company.id} className={classes.dealsData}>
                <Box className={classes.dealsDataFlex}>
                  <Box className={classes.companyFlex}>
                    <Typography variant="body2" className={classes.companyLabel}>
                      {t('sales.contacts.companyName')}
                    </Typography>
                    <Typography variant="body2" className={classes.companyDetName}>
                      {capitalizeFirstLetter(company?.name) || NA}
                    </Typography>
                    <RenderIfHasPermission name={ACL_COMPANIES_VIEW}>
                      <RedirectBlueIcon
                        onClick={() =>
                          handleRedirect(routes.SALES_COMPANY_DETAIL.replace(':id', company?.id))
                        }
                        className={classes.redirectIcon}
                        style={{ cursor: 'pointer' }}
                      />
                    </RenderIfHasPermission>
                  </Box>
                  <Box className={classes.companyFlex}>
                    <Typography variant="body2" className={classes.companyLabel}>
                      {t('sales.contacts.companyOwner')}
                    </Typography>
                    <Typography variant="body2" className={classes.companyDetName}>
                      {capitalize(company?.companyOwner) || NA}
                    </Typography>
                  </Box>
                  <Box className={classes.companyFlex}>
                    <Typography variant="body2" className={classes.companyLabel}>
                      {t('sales.contacts.contact')}
                    </Typography>
                    <Typography variant="body2" className={classes.companyDetName}>
                      {company?.phoneNumber || NA}
                    </Typography>
                  </Box>
                  <Box className={classes.companyFlex}>
                    <Typography className={classes.companyLabel} variant="body2">
                      {t('sales.contacts.companyAddress')}
                    </Typography>

                    <Typography variant="body2" className={classes.companyDetName}>
                      {formatAddress(
                        capitalizeFirstLetter(company?.address),
                        capitalizeFirstLetter(company?.city),
                        capitalizeFirstLetter(company?.state),
                        company?.postalCode,
                      ) || NA}
                    </Typography>
                  </Box>
                  <Box className={classes.companyFlex}>
                    <Typography variant="body2" className={classes.companyLabel}>
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
                        <Typography variant="body2" className={classes.companyDetName}>
                          {NA}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Box>
              </Box>
            ))
          ) : (
            <>{t('sales.deals.noContactsCompany')}</>
          )}
        </AccordionDetails>
      </Accordion>
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel3a-content"
          id="panel3a-header"
        >
          <Typography variant="h5">
            {t('sales.contacts.property')} • {getCount(data?.locations?.length)}
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          {data?.locations && data?.locations.length > 0 ? (
            data?.locations.map((location, index) => (
              <Box key={index} className={classes.dealsData}>
                <Box className={classes.companyFlex}>
                  <Typography variant="body2" className={classes.companyDetName}>
                    {capitalizeFirstLetter(location?.propertyName) || NA}
                  </Typography>

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
                <Box className={classes.chipWrapper}>
                  {location?.type?.map((affiliatedContact, cIndex) => (
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
            ))
          ) : (
            <>{t('sales.deals.noContactsCompany')}</>
          )}
        </AccordionDetails>
      </Accordion>

      {/*<Accordion>*/}
      {/*  <AccordionSummary*/}
      {/*    expandIcon={<ExpandMoreIcon />}*/}
      {/*    aria-controls="panel1a-content"*/}
      {/*    id="panel1a-header"*/}
      {/*  >*/}
      {/*    <Typography variant="h5">*/}
      {/*      {`${t('commonText.deals')}`} • {getCount(deals?.length)}*/}
      {/*    </Typography>*/}
      {/*  </AccordionSummary>*/}
      {/*  <AccordionDetails>*/}
      {/*    {deals.length > 0 ? (*/}
      {/*      deals.map((deal, i) => (*/}
      {/*        <>*/}
      {/*          <Typography variant="body2">{deal?.name}</Typography>*/}
      {/*          <DealsAccordianData*/}
      {/*            key={i}*/}
      {/*            deal={deal?.description}*/}
      {/*            date={deal?.date}*/}
      {/*            amount={deal?.amount}*/}
      {/*            stage={deal?.stage}*/}
      {/*          />*/}
      {/*        </>*/}
      {/*      ))*/}
      {/*    ) : (*/}
      {/*      <Typography variant="body2">{t('sales.deals.noDealCompanies')}</Typography>*/}
      {/*    )}*/}
      {/*  </AccordionDetails>*/}
      {/*</Accordion>*/}
      {/*<Accordion>*/}
      {/*  <AccordionSummary*/}
      {/*    className={classes.attachAccordian}*/}
      {/*    expandIcon={<ExpandMoreIcon />}*/}
      {/*    aria-controls="panel2a-content"*/}
      {/*    id="panel2a-header"*/}
      {/*  >*/}
      {/*    <Typography variant="h5">*/}
      {/*      {t('sales.locations.attachments')} • {getCount(data?.company?.attachments?.length)}*/}
      {/*    </Typography>*/}
      {/*  </AccordionSummary>*/}
      {/*  <AccordionDetails>*/}
      {/*    <Box className={classes.accordionData}>*/}
      {/*      {data?.company?.attachments && data?.company?.attachments?.length*/}
      {/*        ? data?.company?.attachments?.map((file) => {*/}
      {/*            return (*/}
      {/*              <Tooltip*/}
      {/*                className={classes.toolTipBox}*/}
      {/*                title={`Download ${file?.fileName}`}*/}
      {/*                key={file?.id}*/}
      {/*                placement="bottom"*/}
      {/*                arrow*/}
      {/*              >*/}
      {/*                <Box*/}
      {/*                  key={file?.id}*/}
      {/*                  className={classes.attachSuccess}*/}
      {/*                  onClick={() => openFile(file?.fileName, file?.fileUrl)}*/}
      {/*                >*/}
      {/*                  <Featuredicon className={classes.attachIcons} />*/}
      {/*                  <Box className={classes.attachNameWrap}>*/}
      {/*                    <Typography className={classes.attachName}>{file?.fileName}</Typography>*/}
      {/*                    <Typography className={classes.attachSize}>{file?.fileSize}</Typography>*/}
      {/*                  </Box>*/}
      {/*                </Box>*/}
      {/*              </Tooltip>*/}
      {/*            );*/}
      {/*          })*/}
      {/*        : null}*/}
      {/*      {isError && (*/}
      {/*        <Typography variant="body1" style={{ color: 'red' }}>*/}
      {/*          {t('sales.commonText.inValidFile')}*/}
      {/*        </Typography>*/}
      {/*      )}*/}
      {/*    </Box>*/}

      {/*    <Box className={classes.uploadBtnImg}>*/}
      {/*      <input*/}
      {/*        type="file"*/}
      {/*        accept=".pdf, .doc, .docx"*/}
      {/*        onChange={handleFileChange}*/}
      {/*        id="file-input"*/}
      {/*        className={classes.fileUpload}*/}
      {/*      />*/}
      {/*      <label htmlFor="file-input">*/}
      {/*        <Button variant="onlyText" component="span">*/}
      {/*          <ButtonDase className={classes.uploadSvg} />*/}
      {/*        </Button>*/}
      {/*      </label>*/}
      {/*    </Box>*/}
      {/*  </AccordionDetails>*/}
      {/*</Accordion>*/}
    </Box>
  );
};

BasicAccordionContacts.propTypes = {
  deals: PropTypes.array,
  contacts: PropTypes.any, // You might want to replace 'any' with the specific PropTypes for your use case
  data: PropTypes.any, // Similarly, replace 'any' with the specific PropTypes for your use case
  setData: PropTypes.func,
  id: PropTypes.any, // Replace 'any' with the specific PropTypes for your use case
};

export default BasicAccordionContacts;
