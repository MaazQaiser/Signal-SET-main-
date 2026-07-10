import { InputLabel, Stack, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import classNames from 'classnames';
import LoaderComponent from 'commonComponents/loader';
import PropTypes from 'prop-types';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import CustomDropDown from 'src/app/components/common/customDropDown';
import { CONTACT_AFFILIATION } from 'src/app/sales/pages/contacts/listing/contacts.constant';
import { useApiControllers } from 'src/helper/axios';
import {
  getContactListAgainstRole,
  updateLocationContactAffiliation,
} from 'src/services/location.service';
import transformArrayForOptions from 'src/utils/array/transformArrayForOptions';
import { toastSettings } from 'src/utils/constants';
import { companiesPaginationEmptyState } from 'src/utils/constants/emptyStates/companiesPagination';

import formValidatorJoi from '../../../../../utils/formValidator/formValidator.requiredCheck';
import DrawerFooter from '../../components/drawerFooter';
import DrawerHeader from '../../components/drawerHeader';
import { useStyles } from './contactAssociation.js';

const ContactAssociation = ({
  anchor,
  onClose,
  width,
  contact,
  location,
  onSuccess,
  refetch = () => {},
}) => {
  const classes = useStyles();
  const { t } = useTranslation();

  const { getNewApiController } = useApiControllers();

  const [formData, setFormData] = useState({ contactAffiliation: [] });
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  const [errorMessages, setErrorMessages] = useState({});

  const [contacts, setContact] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [contactsPagination, setContactsPagination] = useState(companiesPaginationEmptyState);

  const updateFormHandler = (name, value) => {
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const inputChangedHandler = (event) => {
    const { name, value } = event.target;
    updateFormHandler(name, value);
    setErrorMessages({});
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsSubmittingForm(true);
    try {
      const errors = await formValidatorJoi(
        {
          propertyName: formData.contact?.value?.toString() || '',
          contactAffiliations: formData?.contactAffiliation,
        },
        t,
      );
      if (errors && Object.keys(errors).length) {
        setErrorMessages(errors);
        setIsSubmittingForm(false);
        return;
      }

      const payload = {
        contactId: contact?.id || formData?.contact?.value,
        contactAffiliation: formData?.contactAffiliation?.map((item) => item.value),
      };

      const apiResponse = await updateLocationContactAffiliation(location?.locationId, {
        locationContactsAttributes: [payload],
      });

      if (apiResponse.statusCode === 200) {
        onSuccess();
        toast.success(apiResponse.message, {
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
        onClose(anchor);
        refetch();
      }
    } catch (error) {
      toast.error(error?.message, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    } finally {
      setIsSubmittingForm(false);
    }
  };

  const fetchContacts = async () => {
    try {
      const apiController = getNewApiController();
      setLoadingContacts(true);
      const response = await getContactListAgainstRole('', currentPage, search, {
        signal: apiController.signal,
      });
      if (response?.statusCode === 200) {
        currentPage == 1
          ? setContact(response?.data?.contacts)
          : setContact((prev) => [...prev, ...(response?.data?.contacts || [])]);
        setContactsPagination(response?.pagination);
      }
    } catch (error) {
      if (error?.code === 'ERR_CANCELED') return;
      toast.error(error?.message, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
    setLoadingContacts(false);
  };

  const handleFetchMore = (status, searchText) => {
    if (status === undefined) return;
    if (status === false) {
      setCurrentPage(1);
      setSearch(() => searchText);
    } else {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  const filteredContacts = useMemo(() => {
    return transformArrayForOptions(
      contacts?.filter((item) => !location?.contacts?.find((i) => i.id === item.id)),
      'displayName',
      'id',
    );
  }, [contacts]);

  useEffect(() => {
    fetchContacts();
  }, [currentPage, search]);

  useEffect(() => {
    if (!contact?.id) return;
    const payload = {
      contact: { label: contact?.fullName, value: contact?.id },
      contactAffiliation: contact?.contactAffiliation?.map((item) => ({
        label: item.name,
        value: item.key,
      })),
    };
    setFormData({ ...payload });
  }, [contact]);

  return (
    <>
      {isSubmittingForm && <LoaderComponent label={t('sales.loading')} />}
      <Box
        className={classes.siderbarbox}
        sx={{ width: anchor === 'top' || anchor === 'bottom' ? 'auto' : width }}
        role="presentation"
        component="form"
        onSubmit={handleFormSubmit}
      >
        <Stack className={classes.boxinner} justifyContent="space-between">
          <Box className={classes.sideheader}>
            <DrawerHeader
              title={contact?.id ? t('sales.contacts.editContact') : t('sales.contacts.addContact')}
              subtext={
                contact?.id
                  ? t('sales.contacts.editContactText')
                  : t('sales.contacts.addContactText')
              }
              handleCloseDrawer={onClose}
              anchor={anchor}
              className={classes.AddCompanyHeader}
            />
          </Box>
          <Box className={classNames(classes.locationForm, 'innerScrollBar')}>
            <Box className={`${classes.sideBySideCol}`}>
              {contact?.id ? (
                <Box className={classes.ownerNameCol}>
                  <Typography
                    variant="body2"
                    className={`${classes.fieldWrapper}  ${classes.textWrapper}`}
                    component="div"
                  >
                    {contact?.fullName}
                  </Typography>
                  <Typography className={classes.phoneWrapper}>
                    {contact?.email ? `${contact?.email}` : ''}
                    {contact?.phoneNumber ? ` . ${contact?.phoneNumber}` : ''}
                  </Typography>
                </Box>
              ) : (
                <Box
                  className={`${classes.fieldWrapper}  ${classes.dropdownCommonSection}`}
                  component="div"
                >
                  <InputLabel htmlFor="contact">{t('sales.contacts.contact')}</InputLabel>
                  <CustomDropDown
                    name="contact"
                    id="contact"
                    label={t('sales.contacts.contact')}
                    disabled={!!contact?.id}
                    options={filteredContacts || []}
                    selectedValues={formData?.contact || {}}
                    handleChange={inputChangedHandler}
                    placeHolder={`${t('sales.locations.select')} ${t('sales.contacts.contact')}`}
                    searchable
                    bordered
                    className={classes.dropHigh}
                    placeHolderClassName={classes.placeHolderText}
                    isError={errorMessages?.contact}
                    error={errorMessages?.contact}
                    pagination={contactsPagination}
                    fetchMoreOptions={handleFetchMore}
                    isLoading={loadingContacts}
                  />
                  {errorMessages?.propertyName && (
                    <span className="errorMessage">Contact is required</span>
                  )}
                </Box>
              )}
            </Box>
            <Box className={`${classes.sideBySideCol}`}>
              <Box className={`${classes?.fieldWrapper}  ${classes?.dropdownCommonSection}`}>
                <InputLabel>{t('sales.contacts.contactAffiliation')}</InputLabel>
                <CustomDropDown
                  name="contactAffiliation"
                  id="contactAffiliation"
                  placeHolder={`${t('sales.locations.select')} ${t('sales.contacts.contactAffiliation')}`}
                  placeHolderClassName={classes.placeHolderColor}
                  options={CONTACT_AFFILIATION || []}
                  selectedValues={formData?.contactAffiliation || []}
                  handleChange={inputChangedHandler}
                  searchPlaceholder={t('sales.locations.search')}
                  className={classes?.dropHigh}
                  searchable
                  bordered
                  multiSelect
                  withTiles
                />
                {errorMessages?.contactAffiliations && (
                  <span className="errorMessage">Contact Labels are required</span>
                )}
              </Box>
            </Box>
          </Box>
          <DrawerFooter
            classNameFooter={classes.sideDrawerFooter}
            bulkApply={t('sales.locations.save')}
            bulkCancel={t('sales.locations.cancel')}
            handleCloseDrawer={onClose}
            anchor={anchor}
            type="submit"
            disabled={isSubmittingForm}
          />
        </Stack>
      </Box>
    </>
  );
};

ContactAssociation.propTypes = {
  isLoaded: PropTypes.bool.isRequired,
  anchor: PropTypes.string,
  onClose: PropTypes.func,
  width: PropTypes.number,
  contact: PropTypes.object,
  location: PropTypes.object,
  onSuccess: PropTypes.func,
  refetch: PropTypes.func,
};

export default ContactAssociation;
