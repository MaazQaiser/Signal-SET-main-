import {
  Box,
  Button,
  IconButton,
  Link,
  List,
  ListItem,
  ListItemText,
  Skeleton,
  TablePagination,
  Tooltip,
  Typography,
} from '@mui/material';
import SweetAlertModal from 'commonComponents/sweetAlertModal';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import PropTypes from 'prop-types';

dayjs.extend(customParseFormat);
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getEmails, threadDelete } from 'services/email.services';
import CustomDropDown from 'src/app/components/common/customDropDown';
import SearchComponentWithQuery from 'src/app/components/common/searchWithQuery';
import {
  ACL_PROPERTY_EMAILS_DELETE,
  ACL_PROPERTY_EMAILS_UPDATE,
} from 'src/app/router/constant/SALESMODULE';
import { AddIcon } from 'src/assets/svg';
import { ReactComponent as ChevronDown } from 'src/assets/svg/commonDropdown/chevronDown.svg';
import { ReactComponent as EmailIcon } from 'src/assets/svg/connectEmail.svg';
import { ReactComponent as DeleteIcon } from 'src/assets/svg/DeleteIconBin.svg';
import { ReactComponent as EmailEnvalopIcon } from 'src/assets/svg/emails.svg';
import { useApiControllers } from 'src/helper/axios';
import { isObjectEmpty } from 'src/helper/utilityFunctions';
import { formatDate } from 'src/helper/utilityFunctions';
import RenderIfHasPermission from 'src/hoc/renderIfHasPermission';
import { getDisplayConfiguration } from 'src/redux/store/slices/regionalCountryConfiguration';
import userHasPermission from 'src/utils/auth/userHasPermission';
import { paginationOptions, toastSettings } from 'src/utils/constants';
import { extractValuesByKeyFromInput } from 'src/utils/dropdownValueExtractor';
import { capitalizeFirstLetter } from 'src/utils/string/common';
import { truncateString } from 'src/utils/string/truncate';

import CreateEmailDrawer from '../components/createEmailDrawer';
import EmailDetail from '../components/emailDetail';
import { useStyles } from './styles';

const getReadUnreadFilter = (t) => [
  { label: t('sales.locations.allEmails'), value: 'all' },
  { label: t('sales.locations.read'), value: 'read' },
  { label: t('sales.locations.unread'), value: 'unread' },
];

const getEmailTypeFilter = (t) => [
  { label: t('sales.locations.emailTypeAll'), value: 'all' },
  { label: t('sales.locations.received'), value: 'received' },
  { label: t('sales.locations.sent'), value: 'sent' },
];

const defaultParamsBase = {
  pageNo: 1,
  rowsPerPage: paginationOptions.perPageRows,
  search: '',
  sortBy: '',
  orderBy: '',
  unread: { value: 'all' },
  type: { value: 'received' },
};

const EmailListing = ({
  contacts,
  permissionSet = {
    emailConfigurationCreate: null,
    createEmailPermission: null,
    deleteEmailPermission: null,
  },
}) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const { timePrecision, dateFormat } = useSelector(getDisplayConfiguration);

  const NA = t('commonText.nA');

  const filterOptions = useMemo(
    () => ({
      readUnread: getReadUnreadFilter(t),
      emailType: getEmailTypeFilter(t),
    }),
    [t],
  );
  const defaultParams = useMemo(
    () => ({
      ...defaultParamsBase,
      unread: { value: 'all' },
      type: { value: 'received' },
    }),
    [],
  );

  const { id: locationId } = useParams();

  const { getNewApiController } = useApiControllers();

  const [queryParams, setQueryParams] = useState(defaultParams);

  const selectedUnreadOption = useMemo(
    () =>
      filterOptions.readUnread.find((o) => o.value === (queryParams?.unread?.value ?? 'all')) ??
      filterOptions.readUnread[0],
    [filterOptions.readUnread, queryParams?.unread?.value],
  );
  const selectedTypeOption = useMemo(
    () =>
      filterOptions.emailType.find((o) => o.value === (queryParams?.type?.value ?? 'received')) ??
      filterOptions.emailType[1],
    [filterOptions.emailType, queryParams?.type?.value],
  );
  const [totalRows, setTotalRows] = useState(0);

  const [loading, setLoading] = useState(false);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [selectedEmail, setSelectedEmail] = useState(null);

  const [emails, setEmails] = useState([]);

  const [redirectUri, setRedirectUri] = useState('');

  const [disabled, _setDisabled] = useState(true);

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [showEmailDetail, setShowEmailDetail] = useState(false);

  const [emailConnection, setEmailConnection] = useState(false);

  const _handleStatusChange = (event) => {
    // setSelectedStatus(event.target.value);
    setQueryParams((prev) => ({
      ...prev,
      status: event.target.value,
    }));
  };

  const handleDropdownSelect = async (event) => {
    const { name, value } = event.target;
    const optionValue = value?.value ?? value;
    const updatedParams = {
      ...queryParams,
      pageNo: 1,
      [name]: { value: optionValue },
    };
    setQueryParams(updatedParams);
    await fetchEmails(updatedParams);
  };

  const handleSearch = (event) => {
    const updatedParams = {
      ...queryParams,
      pageNo: 1,
      search: event.target.value || '',
    };
    setQueryParams(updatedParams);
    fetchEmails(updatedParams);
  };

  const handleOpenDrawer = () => {
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
  };

  const handleEmailClick = (email) => {
    setSelectedEmail(email);
  };

  const handleBackToList = () => {
    setSelectedEmail(null);
  };

  const toggleEmailDetail = () => {
    setShowEmailDetail((a) => !a);
  };

  const markEmailRead = (email) => {
    setEmails((prev) => {
      return prev.map((item) => {
        if (item.id === email?.id) {
          return {
            ...item,
            unread: false,
          };
        }
        return item;
      });
    });
  };

  const markEmailUnRead = (email) => {
    setEmails((prev) => {
      return prev.map((item) => {
        if (item.id === email?.id) {
          return {
            ...item,
            unread: true,
          };
        }
        return item;
      });
    });
  };

  const openConnectEmail = (e) => {
    e.stopPropagation();
  };

  // const selectedEmail = emails?.find((email) => email?.id === selectedEmailId);

  const toggleDeleteModal = () => {
    setShowDeleteModal((a) => !a);
  };

  const resetQueryParams = () => {
    setQueryParams(defaultParams);
  };

  const deleteThread = async () => {
    try {
      const response = await threadDelete(locationId, selectedEmail?.id);
      if (response?.statusCode === 200) {
        toast.success(response.message, {
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
        fetchEmails(defaultParams);
      }
    } catch (error) {
      toast.error(error?.message, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    } finally {
      setSelectedEmail(null);
      toggleDeleteModal();
    }
  };

  const fetchEmails = async (queryParams) => {
    const apiController = getNewApiController();
    setLoading(true);
    try {
      const params = {
        ...queryParams,
        pageNo: queryParams.pageNo,
        rowsPerPage: queryParams.rowsPerPage,
        unread:
          isObjectEmpty(queryParams?.unread) || queryParams?.unread?.value === 'all'
            ? ''
            : queryParams?.unread?.value === 'unread',
        type:
          extractValuesByKeyFromInput(queryParams?.type, 'value') !== 'all'
            ? extractValuesByKeyFromInput(queryParams?.type, 'value')
            : '',
      };
      const response = await getEmails({
        locationId,
        params,
        config: {
          signal: apiController.signal,
        },
      });
      if (response?.statusCode === 200) {
        // setEmails([]);
        setEmails(response?.data?.emails || []);
        setTotalRows(response?.pagination?.totalCount || 0);
        setEmailConnection(true);
      }
    } catch (error) {
      if (!apiController.signal.aborted) {
        // if (error?.message) {
        //   toast.error(error?.message, {
        //     position: 'top-right',
        //     autoClose: toastSettings.AUTO_CLOSE,
        //   });
        // }
        if (error?.data?.redirectURI) {
          setRedirectUri(error.data?.redirectURI);
        }
      }
    } finally {
      if (!apiController.signal.aborted) {
        setLoading(false);
      }
    }
  };

  const handleChangePage = async (_, newPage) => {
    const updatedParams = {
      ...queryParams,
      pageNo: newPage + 1,
    };
    setQueryParams(updatedParams);
    // await fetchEmails(updatedParams);
  };

  const handleChangeRowsPerPage = async (event) => {
    const updatedParams = {
      ...queryParams,
      pageNo: 1,
      rowsPerPage: parseInt(event.target.value, 10),
    };
    setQueryParams(updatedParams);
    // await fetchEmails(updatedParams);
  };

  useEffect(() => {
    // fetch email
    fetchEmails(queryParams);
  }, [queryParams]);

  const hasEmailConfigurationConnectPermission = userHasPermission(
    permissionSet?.emailConfigurationCreate,
  );

  // useEffect(() => {
  //   // Get Email connection status
  //   if (!emailConnection) getSMTPConnection();
  // }, []);

  const EmailListingSkeleton = () => (
    <List>
      {[1, 2, 3, 4, 5, 6].map((index) => (
        <ListItem key={index} className={classes.emailListItem}>
          <ListItemText>
            <Box className={classes.emailListItemText}>
              <Skeleton variant="text" width={150} height={32} />
              <Box className={classes.emailDetails}>
                <Box className={classes.emailDetailsText}>
                  <Skeleton variant="text" width="80%" height={32} />
                </Box>
                <Box className={classes.timeAndActions}>
                  <Skeleton variant="text" width={100} height={32} />
                </Box>
              </Box>
            </Box>
          </ListItemText>
        </ListItem>
      ))}
    </List>
  );

  return (
    <>
      {!emailConnection && loading && <EmailListingSkeleton />}

      {!emailConnection && !loading && (
        <>
          {hasEmailConfigurationConnectPermission ? (
            <Box className={classes.connectionEmailWrapper}>
              <EmailIcon />
              <Typography variant="h2" component="h6" className={classes.connectionEmailTitle}>
                {t('sales.settings.emailConfigurationsConnectYourEmail')}
              </Typography>
              <Typography variant="body2" component="p" className={classes.connectionEmailText}>
                {t('sales.settings.emailConfigurationsConnectWithYourEmail')}
              </Typography>
              <Link
                onClick={openConnectEmail}
                target="_blank"
                href={redirectUri}
                rel="noreferrer"
                className={classes.franchiseNameText}
                disabled={disabled}
              >
                {t('sales.settings.emailConfigurationsConnectEmail')}
              </Link>
            </Box>
          ) : (
            <Box className={classes.connectionEmailWrapper}>
              <Typography variant="h6" component="h6" className={classes.connectionEmailTitle}>
                {t('sales.settings.emailConfigurationsNoPermissionToConnect')}
              </Typography>
            </Box>
          )}
        </>
      )}
      {emailConnection && (
        <Box className={classes.emailWrapper}>
          {!showEmailDetail && (
            <Box className={classes.locationFilterBar}>
              <Box className={classes.filterLeftSide}>
                <SearchComponentWithQuery
                  placeHolder={t('sales.locations.searchEmail')}
                  onSearch={handleSearch}
                />
                <Box className={classes.dropDownsFilters}>
                  <CustomDropDown
                    name="unread"
                    id="unread"
                    label={t('sales.locations.allEmails')}
                    options={filterOptions.readUnread}
                    selectedValues={selectedUnreadOption}
                    handleChange={handleDropdownSelect}
                    checkmark={true}
                    className={classes.locationSearch}
                  />
                </Box>
                <Box className={classes.dropDownsFilters}>
                  <CustomDropDown
                    name="type"
                    id="type"
                    label={t('sales.locations.received')}
                    options={filterOptions.emailType}
                    selectedValues={selectedTypeOption}
                    handleChange={handleDropdownSelect}
                    checkmark={true}
                    className={classes.locationSearch}
                  />
                </Box>
              </Box>
              {emails?.length > 0 && (
                <Box className={classes.filterRightSide}>
                  <Box className={classes.twoBtnWrapper}>
                    <RenderIfHasPermission name={permissionSet?.createEmailPermission}>
                      <Button
                        className={classes.newEmailBtn}
                        variant="primary"
                        startIcon={<AddIcon />}
                        onClick={handleOpenDrawer}
                      >
                        {t('sales.locations.newEmail')}
                      </Button>
                    </RenderIfHasPermission>
                  </Box>
                </Box>
              )}
            </Box>
          )}

          {!showEmailDetail ? (
            <Box className={classes.emailListing}>
              {loading ? (
                <EmailListingSkeleton />
              ) : (
                <List>
                  {emails?.length > 0 ? (
                    emails.map((email) => (
                      <ListItem
                        key={email?.id}
                        className={`${classes.emailListItem} ${email?.unread ? classes.read : classes.unread}`}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleEmailClick(email);
                          toggleEmailDetail();
                          markEmailRead(email);
                        }}
                        sx={{ cursor: 'pointer' }}
                      >
                        <ListItemText>
                          <Box className={classes.emailListItemText}>
                            <Typography variant="subtitle2" component="span">
                              {email?.from?.[0]?.name?.length < 20 ? (
                                <>{capitalizeFirstLetter(email?.from?.[0]?.name) || NA}</>
                              ) : (
                                <>
                                  <Tooltip title={email?.from?.[0]?.name} arrow>
                                    {truncateString(
                                      capitalizeFirstLetter(email?.from?.[0]?.name),
                                      20,
                                    ) || NA}
                                  </Tooltip>
                                </>
                              )}
                            </Typography>
                            <Box className={classes.emailDetails}>
                              <Box className={classes.emailDetailsText}>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  component="span"
                                  className="messageText"
                                >
                                  <Typography
                                    variant="subtitle2"
                                    className={classes.subjectText}
                                    component="span"
                                  >
                                    {email?.subject?.length > 0
                                      ? email?.subject
                                      : t('sales.locations.noSubject')}
                                  </Typography>

                                  {email?.content?.length > 0 && (
                                    <Typography
                                      variant="subtitle2"
                                      component="span"
                                      className="read"
                                    >
                                      - {email?.content}
                                    </Typography>
                                  )}
                                </Typography>
                              </Box>
                              <Box className={classes.timeAndActions}>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  component="span"
                                  className="timeDisplay"
                                >
                                  {dayjs(email?.timestamp, 'hh:mm A', true).isValid()
                                    ? formatDate(dayjs(email?.timestamp, 'hh:mm A'), timePrecision)
                                    : formatDate(dayjs(email?.timestamp, 'MMM DD'), dateFormat)}
                                </Typography>
                                <RenderIfHasPermission name={permissionSet?.deleteEmailPermission}>
                                  <IconButton
                                    className="deleteIcon"
                                    sx={{
                                      display: 'none',
                                    }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      e.preventDefault();
                                      // Handle delete
                                      handleEmailClick(email);
                                      toggleDeleteModal();
                                    }}
                                  >
                                    <DeleteIcon />
                                  </IconButton>
                                </RenderIfHasPermission>
                              </Box>
                            </Box>
                          </Box>
                        </ListItemText>
                      </ListItem>
                    ))
                  ) : (
                    <Box className={classes.connectionEmailWrapper}>
                      <EmailEnvalopIcon />
                      <Typography
                        variant="h2"
                        component="h6"
                        className={classes.connectionEmailTitle}
                      >
                        {t('sales.locations.noEmails')}
                      </Typography>
                      <Typography
                        variant="body2"
                        component="p"
                        className={classes.connectionEmailText}
                      >
                        {t('sales.locations.noEmailsDescription')}
                      </Typography>
                      <Button
                        className={classes.newEmailBtn}
                        variant="primary"
                        startIcon={<AddIcon />}
                        onClick={handleOpenDrawer}
                      >
                        {t('sales.locations.newEmail')}
                      </Button>
                    </Box>
                  )}
                </List>
              )}
              {emails?.length > 0 && (
                <Box sx={{ mt: 2 }} className={classes.paginationWrapper}>
                  <TablePagination
                    rowsPerPageOptions={paginationOptions.perPageOptions}
                    component="div"
                    count={totalRows}
                    page={queryParams.pageNo - 1}
                    onPageChange={handleChangePage}
                    rowsPerPage={queryParams.rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    SelectProps={{
                      IconComponent: ChevronDown,
                    }}
                  />
                </Box>
              )}
            </Box>
          ) : (
            <EmailDetail
              emailData={selectedEmail}
              onBack={() => {
                toggleEmailDetail();
                handleBackToList();
                resetQueryParams();
                // fetchEmails(defaultParams);
              }}
              refetchData={() => fetchEmails(defaultParams)}
              markEmailUnread={() => {
                toggleEmailDetail();
                handleBackToList();
                resetQueryParams();
                markEmailUnRead(selectedEmail);
              }}
              permissionSet={{
                updateEmailPermission: ACL_PROPERTY_EMAILS_UPDATE,
                deleteEmailPermission: ACL_PROPERTY_EMAILS_DELETE,
              }}
            />
          )}

          {showDeleteModal && (
            <SweetAlertModal
              type="warning" // 'success', 'error', 'warning', 'info', etc.
              title={t('commonText.modal.areYouSure.title')}
              text={t('commonText.modal.areYouSure.desc')}
              cancelButtonText={t('buttons.no')}
              confirmButtonText={t('buttons.yes')}
              show={showDeleteModal}
              handleConfirmButton={deleteThread}
              handleCancelButton={toggleDeleteModal}
              icon={<DeleteIcon />}
            />
          )}

          {isDrawerOpen && (
            <CreateEmailDrawer
              contacts={contacts}
              open={isDrawerOpen}
              onClose={handleCloseDrawer}
              fetchEmails={() => fetchEmails(defaultParams)}
            />
          )}
        </Box>
      )}
    </>
  );
};

EmailListing.propTypes = {
  contacts: PropTypes.arrayOf(PropTypes.object).isRequired,
  permissionSet: PropTypes.object,
};

export default EmailListing;
