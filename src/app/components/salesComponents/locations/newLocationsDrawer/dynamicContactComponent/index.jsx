import { Chip } from '@mui/material';
import Box from '@mui/material/Box';
import CustomDropDown from 'commonComponents/customDropDown';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useStyles } from 'salesComponents/locations/newLocationsDrawer/newLocationDrawer';
import { getContactListAgainstRole } from 'services/location.service';
import { useApiControllers } from 'src/helper/axios';
import { isObjectEmpty } from 'src/helper/utilityFunctions';
import transformArrayForOptions from 'src/utils/array/transformArrayForOptions';

const paginationInitState = {
  currentPage: 0,
  nextPage: 0,
  prevPage: 0,
  totalPages: 0,
  totalCount: 0,
};

const DynamicContactComponent = ({
  roleObj,
  formData,
  setFormData,
  errorMessages,
  setErrorMessages,
}) => {
  const classes = useStyles();

  const { t } = useTranslation();

  const { getNewApiController } = useApiControllers();

  // const NA = t('commonText.nA');

  const [contactsList, setContactsList] = useState([]);

  const [contactsPagination, setContactsPagination] = useState(paginationInitState);

  const previousSearchText = useRef(null);

  const inputChangedHandler = (event) => {
    const { name, value } = event.target;
    if (value) {
      // ? NOTE: if the key "key" is not getting used add _ before it or this rule will suffice the need here.
      // eslint-disable-next-line no-unused-vars
      const { [name]: key, ...rest } = errorMessages;
      setErrorMessages(rest);
    }

    updateFormHandler(name, value);
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

  const fetchContacts = async (roleKey, refetch = false, search) => {
    const apiController = getNewApiController();

    try {
      let currentPage = contactsPagination?.currentPage;
      if (!search && !previousSearchText.current && !refetch) {
        currentPage = 1;
      }
      if (!refetch && search && !previousSearchText.current) {
        currentPage = 1;
      }
      if (refetch && search && !previousSearchText.current) {
        currentPage = 1;
      }
      if (
        refetch &&
        search &&
        previousSearchText.current &&
        search !== previousSearchText.current
      ) {
        currentPage = 1;
      }
      if (
        !refetch &&
        search &&
        previousSearchText.current &&
        search !== previousSearchText.current
      ) {
        currentPage = 1;
      }
      if (
        refetch &&
        search &&
        previousSearchText.current &&
        search === previousSearchText.current
      ) {
        currentPage = contactsPagination?.currentPage + 1;
      }
      if (previousSearchText.current && !search) {
        currentPage = 1;
      }
      if (!search && !previousSearchText.current && refetch) {
        currentPage = contactsPagination?.currentPage + 1;
      }

      if (currentPage === contactsPagination.currentPage) return;

      const response = await getContactListAgainstRole(roleKey, currentPage, search, {
        signal: apiController.signal,
      });

      if (response.statusCode === 200) {
        if (refetch && response?.data?.contacts?.length) {
          setContactsList((prev) => ({
            ...(prev || []),
            ...(response?.data?.contacts || []),
          }));
        } else {
          setContactsList(response?.data?.contacts);
        }
        setContactsPagination(response?.pagination);
        previousSearchText.current = search;
      }
    } catch (error) {
      /**
       * show error
       */
      // toast.error(error?.message, {
      //   position: 'top-right',
      //   autoClose: toastSettings.AUTO_CLOSE,
      // });
    }
  };
  useEffect(() => {
    if (isObjectEmpty(roleObj)) return;
    fetchContacts(roleObj?.value);
  }, [JSON.stringify(roleObj)]);

  return (
    <>
      <Box className={classes.contactListItem}>
        <Chip
          size="small"
          label={roleObj?.label}
          value={roleObj?.value}
          className={classes.decisionMakerChip}
        />
        <CustomDropDown
          name={`${roleObj?.value}-contactUser`}
          id={`${roleObj?.value}-contactUser`}
          label={t('sales.locations.selectAContact')}
          options={transformArrayForOptions(contactsList, 'displayName', 'id') || []}
          selectedValues={formData?.[`${roleObj?.value}-contactUser`] || {}}
          handleChange={inputChangedHandler}
          searchPlaceholder={t('sales.locations.searchByName')}
          searchable
          bordered
          className={classes.dropHigh}
          placeHolderClassName={classes.placeHolderText}
          pagination={contactsPagination}
          fetchMoreOptions={fetchContacts}
          // isLoading={loadingCompaniesDropdown}
        />
      </Box>
    </>
  );
};

DynamicContactComponent.propTypes = {
  roleObj: PropTypes.object,
  formData: PropTypes.object,
  setFormData: PropTypes.func,
  errorMessages: PropTypes.object,
  setErrorMessages: PropTypes.func,
};
export default DynamicContactComponent;
