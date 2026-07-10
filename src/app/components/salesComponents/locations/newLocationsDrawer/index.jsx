import { Button, Checkbox, Chip, InputLabel, Stack, TextField, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import classNames from 'classnames';
import LoaderComponent from 'commonComponents/loader';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import { toast } from 'react-toastify';
// import DynamicContactComponent from 'salesComponents/locations/newLocationsDrawer/dynamicContactComponent';
import CustomDropDown from 'src/app/components/common/customDropDown';
import GoogleMapViewComponent from 'src/app/components/common/googleMap/googleMapView';
import GoogleMapSearchAddressComponent from 'src/app/components/common/googleMap/searchAddress';
import RequiredAsterik from 'src/app/components/common/requiredAsterik';
import { SALES_LOCATIONS } from 'src/app/router/constant/ROUTE';
import { ACL_COMPANIES_CREATE, ACL_CONTACTS_CREATE } from 'src/app/router/constant/SALESMODULE';
import { AddBlueIcon } from 'src/assets/svg';
import { PlusIcon } from 'src/assets/svg';
import { useApiControllers } from 'src/helper/axios';
import {
  // findKeyByValue,
  generateUniqueId,
  isObjectEmpty,
  removeKey,
  removeKeysFromObject,
} from 'src/helper/utilityFunctions';
import RenderIfHasPermission from 'src/hoc/renderIfHasPermission';
import { useTenantLabel } from 'src/hooks/useTenantLabel';
import { getDealOwnerOptions } from 'src/services/deal.service';
import {
  createLocation,
  getContactAffiliationLabels,
  getContactListAgainstRole,
  getFranchisesOptions,
  // getInternsOptions,
  getLeadStageOptions,
  getLocationAffiliationLabels,
  getLocationSources,
  // getSalesPersonOptions,
  updateLocation,
} from 'src/services/location.service';
import transformArrayForOptions from 'src/utils/array/transformArrayForOptions';
import { rolesEnum, toastSettings } from 'src/utils/constants';
import { extractValuesByKeyFromInput } from 'src/utils/dropdownValueExtractor';
import { updateAssignToPayload } from 'src/utils/formatAssignedTo';

import formValidatorJoi from '../../../../../utils/formValidator/formValidator.requiredCheck';
import DrawerFooter from '../../components/drawerFooter';
import DrawerHeader from '../../components/drawerHeader';
import ContactDropDown from '../../contacts/contactDropDown';
import CreateNewCompanyModal from '../createNewCompany';
import { stageValues } from '../locationStages/stage.constant';
import NewContactModal from '../newContactModal';
import PropertyDropDown from '../propertyDropDown';
import {
  assignToEnums,
  // assignToOptionsHash,
  // locationAffiliationOptions,
} from './location.constant';
import { useStyles } from './newLocationDrawer.js';

const formDataDefaultState = {
  // city: '',
  // state: '',
  company: {},
  propertyName: '',
  associatedFranchise: null,
  assignee: {},
  associatedSupervisor: {},
  locationSource: {},
  firstName: '',
  lastName: '',
  email: '',
  // postalCode: '',
  // address: '',
  title: '',
  phoneNumber: '',
  HubspotMap: {},
  googleAddress: {},
  // numberOfUnits: '',
  // occupancyRate: '',
  // averageRent: '',
  // managementCompany: '',
  locationAffiliation: [],
  contactAffiliation: [],
  referredByProperty: {},
  // referredByContact: {}, // ? Add it while adding referred by property
};
const defaultCenter = { lat: 41.216362, lng: -96.13607 };

// const contactLabels = [
//   {
//     value: 'decisionMaker',
//     label: 'Decision-Maker',
//     sortOrder: 0,
//   },
//   {
//     value: 'endUser',
//     label: 'End-User',
//     sortOrder: 1,
//   },
//   {
//     value: 'billing',
//     label: 'Billing',
//     sortOrder: 2,
//   },
//   {
//     value: 'blocker',
//     label: 'Blocker',
//     sortOrder: 3,
//   },
// ];

// Function to convert non-array values to an array
function convertNonArrayValuesToArray(inputObj) {
  for (let key in inputObj) {
    if (Array.isArray(inputObj[key])) {
      continue; // Skip if the value is already an array
    }
    inputObj[key] = [inputObj[key]]; // Convert non-array values to an array
  }
  return inputObj;
}

const cannotAssignSupervisorToUsers = ['Home Officer'];

const NewLocationDrawer = ({
  anchor,
  locationCloseDrawer,
  width,
  companies,
  editLocationData,
  onSuccess,
  fetchCompanies,
  isLoaded,
  refetch = () => {},
  addressFromParent = null,
  companiesPagination,
  loadingCompaniesDropDown,
}) => {
  // const userId = useSelector((state) => state.user.info?.id);

  const userRole = useSelector((state) => state.auth.userRole);

  const { getLabel } = useTenantLabel();

  // const [assignTo, setAssignTo] = useState(
  //   editLocationData
  //     ? editLocationData?.assignTo?.intent
  //     : assignToOptionsHash[rolesEnum?.[findKeyByValue(rolesEnum, userRole?.slug)]]?.value,
  // );

  const [formData, setFormData] = useState(
    editLocationData
      ? { ...editLocationData }
      : userRole?.slug === rolesEnum.salesManager
        ? { ...formDataDefaultState, associatedSupervisor: null }
        : formDataDefaultState,
  );
  const [supervisors, setSupervisors] = useState([]);
  const [assignees, setAssignees] = useState([]);
  const [locationAffiliationLabels, setLocationAffiliationLabels] = useState([]);
  const [_contactAffiliationLabels, setContactAffiliationLabels] = useState([]);
  const [leadStages, setLeadStages] = useState([]);
  const [contactsList, setContactsList] = useState({});
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  const [errorMessages, setErrorMessages] = useState({});
  const [center, setCenter] = useState({});
  const handleOpenConvert = () => setOpenConvert(true);
  const handleCloseConvert = () => setOpenConvert(false);
  const [address, setAddress] = useState('');
  const [openConvert, setOpenConvert] = useState(false);
  const [activeMarker, setActiveMarker] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState({});
  const [contactsPagination, setContactsPagination] = useState({});
  const [loadingStates, setLoadingStates] = useState({});
  const [openNewContactModal, setOpenNewContactModal] = useState(false);
  const [franchises, setFranchises] = useState([]);
  const [locationSources, setLocationSources] = useState([]);

  const [addSupervisor, setAddSupervisor] = useState(false);

  const currentSelectedDropdown = useRef(null);
  const previousSearchText = useRef(null);
  const fillName = useRef(true);

  const { getNewApiController } = useApiControllers();
  const _apiController = getNewApiController();

  const classes = useStyles();
  const { t } = useTranslation();
  const NA = t('commonText.nA');
  const history = useHistory();

  // Handle Close New Contact
  const handleCloseNewContactModal = () => {
    setOpenNewContactModal('');
  };

  // Handle Close New Contact
  const handleOpenNewContactModal = (type) => {
    setOpenNewContactModal(type);
  };

  const handleContactCreated = (contact, type) => {
    const contacts = [
      {
        id: contact.id,
        value: contact.id,
        label: contact.fullName,
      },
    ];
    inputChangedHandler({
      target: {
        name: `contactAffiliation.${type}`,
        value: contacts.concat(formData.contactAffiliation[type] || []),
      },
    });
  };

  const handleCompanyCreated = (company) => {
    inputChangedHandler({
      target: {
        name: 'company',
        value: {
          id: company.id,
          value: company.id,
          label: company.name,
        },
      },
    });
  };

  //Chip Affiliation
  const handleChipClick = (id) => {
    if (formData?.locationAffiliation?.includes(id)) {
      updateFormHandler(
        'locationAffiliation',
        formData?.locationAffiliation?.filter((chipId) => chipId !== id),
      );
    } else {
      updateFormHandler('locationAffiliation', [...(formData?.locationAffiliation || []), id]);
    }
  };

  const updateFormHandler = useCallback(
    (name, value) => {
      setFormData((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    },
    [setFormData],
  );

  //input Changed Handler
  const inputChangedHandler = (event) => {
    const { name, value } = event.target;
    if (value) {
      // ? NOTE: if the key "key" is not getting used add _ before it or this rule will suffice the need here.
      // eslint-disable-next-line no-unused-vars
      const { [name]: key, ...rest } = errorMessages;
      setErrorMessages(rest);
    }

    if (name === 'company') {
      setLocationAffiliationLabels([]);
      // remove selected location affiliations
      updateFormHandler('locationAffiliation', []);
      // setFormData((prev) => ({
      //   ...prev,
      //   locationAffiliation: [],
      // }));
      fetchLocationLabels(value?.id);
    }

    if (name?.includes('contactAffiliation')) {
      setErrorMessages((prev) => removeKey(['contactAffiliation'], prev));

      const splittedName = name.split('.');
      currentSelectedDropdown.current = splittedName?.[1];
      // Check if value length is 0, and if so, remove the key from formData
      if (value.length === 0) {
        const { [splittedName[1]]: _removed, ...updatedFormData } = formData[splittedName[0]] || {};
        updateFormHandler(splittedName[0], updatedFormData);
      } else {
        updateFormHandler(splittedName[0], {
          ...formData?.[splittedName[0]],
          [`${splittedName?.[1]}`]: value,
        });
      }
      return;
    }
    if (name === 'referredByProperty') {
      updateFormHandler('referredByContact', {});
    }
    updateFormHandler(name, value);
  };

  // Update Map Value
  const updateMapValue = (name, value) => {
    if (value) {
      // ? NOTE: if the key "key" is not getting used add _ before it or this rule will suffice the need here.
      const { [name]: _key, ...rest } = errorMessages;
      setErrorMessages(rest);
    }
    updateFormHandler(name, value);
  };

  // Handle Submit
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsSubmittingForm(true);
    try {
      /**
       * remove the following keys from formData object
       * to avoid validation
       */
      let keysToRemove = [
        'associatedFranchise',
        'firstName',
        'lastName',
        'title',
        'email',
        'phoneNumber',
      ];

      /**
       * check assignTo value
       * and add/remove from formdata object accordingly
       */
      if (!addSupervisor) {
        keysToRemove.push('associatedSupervisor');
      }

      if (formData?.locationSource?.value !== 'referred') {
        keysToRemove.push('referredByProperty', 'referredByContact');
      }

      // Remove specified keys from formData
      let tempValidate = removeKeysFromObject(formData, keysToRemove);

      /**
       * Updated ifs to this approach
       * kept ifs in case this approach turn out a disaster ðŸ˜¶â€ðŸŒ«ï¸
       * */
      const propertiesToCopy = [
        'phoneNumber',
        'email',
        'firstName',
        'lastName',
        'title',
        // 'numberOfUnits',
        // 'occupancyRate',
        // 'averageRent',
        // 'managementCompany',
      ];

      propertiesToCopy.forEach((property) => {
        if (formData?.[property]) {
          tempValidate[property] = formData[property];
        }
      });

      if (addressFromParent) {
        tempValidate = {
          ...tempValidate,
          googleAddress: { name: addressFromParent?.formatted_address },
        };
      }

      const errors = await formValidatorJoi(tempValidate, t);
      if (errors && Object.keys(errors).length) {
        console.log({ errors });
        setErrorMessages(errors);
        return;
      }

      // // Initialize an empty object to store the result
      let affiliatedContactPayload = {};

      for (const key in formData.contactAffiliation) {
        if (formData.contactAffiliation[key]) {
          affiliatedContactPayload[key] = extractValuesByKeyFromInput(
            formData.contactAffiliation[key],
            'id',
          );
        }
      }

      affiliatedContactPayload = convertNonArrayValuesToArray(affiliatedContactPayload);

      const payload = {
        locationName: formData?.propertyName,
        locationSource: formData?.locationSource?.value,
        associatedFranchiseId: formData?.associatedFranchise?.id,
        companyId: formData?.company?.id,
        leadStageId: formData?.HubspotMap?.id,
        // contactDetails: {
        //   firstName: formData?.firstName?.trim(),
        //   lastName: formData?.lastName?.trim(),
        //   title: formData?.title,
        //   email: formData?.email,
        //   contact: formData?.phoneNumber,
        // },
        address: addressFromParent
          ? addressFromParent?.formatted_address
          : formData?.googleAddress?.name,
        coordinates: addressFromParent
          ? addressFromParent?.coordinates
          : formData?.googleAddress?.position,
        // address: {
        //   streetAddress: formData?.address,
        //   addressLine2: formData?.address2,
        //   postalCode: formData?.postalCode,
        //   stateId: formData?.state,
        //   cityId: formData?.city,
        //   countryId: formData?.country,
        // },
        assignTo: updateAssignToPayload(addSupervisor, formData),
        // numberOfUnits: formData.numberOfUnits,
        // occupancyRate: formData?.occupancyRate,
        // averageRent: formData?.averageRent,
        // managementCompany: formData?.managementCompany,
        locationAffiliation: formData?.locationAffiliation,
        contactAffiliation: affiliatedContactPayload,
        placeId: selectedLocation.id,
        referredByPropertyId: formData?.referredByProperty?.id,
        referredByContactId: formData?.referredByContact?.id,
      };

      // if (payload) {
      //   console.log({ payload }, { formData });
      //   return;
      // }

      let apiResponse;
      if (editLocationData) apiResponse = await updateLocation(editLocationData?.id, payload);
      else apiResponse = await createLocation(payload);

      if (apiResponse.statusCode === 200) {
        onSuccess();
        toast.success(apiResponse.message, {
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });

        /**
         * if user is creating a location from map then redirect the user
         * to location listing after creation
         */
        if (addressFromParent) history.push(`${SALES_LOCATIONS}`);
        /**
         * close the side drawer after successful response
         */
        locationCloseDrawer(anchor);
        refetch();
      }
    } catch (error) {
      console.log({ error });
      /**
       * show error
       */
      toast.error(error?.message, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    } finally {
      setIsSubmittingForm(false);
    }
  };

  //Fetching Contacts
  const fetchContacts = async (refetch = false, search, apiController = {}) => {
    let roleKey = currentSelectedDropdown.current;

    if (!roleKey) return;
    try {
      setLoadingStates((prevOptions) => ({
        ...prevOptions,
        [roleKey]: true,
      }));
      let currentPage = contactsPagination?.[roleKey]?.currentPage;
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
        currentPage = contactsPagination?.[roleKey]?.currentPage + 1;
      }
      if (previousSearchText.current && !search) {
        currentPage = 1;
      }
      if (!search && !previousSearchText.current && refetch) {
        currentPage = contactsPagination?.[roleKey]?.currentPage + 1;
      }

      // if (currentPage === contactsPagination?.[roleKey]?.currentPage) return;

      const response = await getContactListAgainstRole(roleKey, currentPage, search);

      if (response.statusCode === 200) {
        if (refetch && response?.data?.contacts?.length) {
          // setContactsList((prev) => ({
          //   ...(prev || []),
          //   ...(response?.data?.contacts || []),
          // }));

          setContactsList((prevOptions) => ({
            ...prevOptions,
            [roleKey]: transformArrayForOptions(
              [...(prevOptions?.[roleKey] || []), ...(response?.data?.contacts || [])],
              'displayName',
              'id',
            ),
          }));
        } else {
          // setContactsList(response?.data?.contacts);

          setContactsList((prevOptions) => ({
            ...prevOptions,
            [roleKey]: transformArrayForOptions(
              response?.data?.contacts || [],
              'displayName',
              'id',
            ),
          }));
        }
        // setContactsPagination(response?.pagination);
        setContactsPagination((prevOptions) => ({
          ...prevOptions,
          [roleKey]: response?.pagination,
        }));

        setLoadingStates((prevOptions) => ({
          ...prevOptions,
          [roleKey]: false,
        }));
        previousSearchText.current = search;
      }
    } catch (error) {
      console.log(error);
      if (!apiController.signal.aborted) {
        setLoadingStates((prevOptions) => ({
          ...prevOptions,
          [roleKey]: false,
        }));
      }
    }
  };

  //Fetch franchise listing
  const fetchFranchises = async () => {
    try {
      const response = await getFranchisesOptions();
      if (response?.statusCode === 200) {
        setFranchises(response?.data?.franchises || []);
        // if (userRole?.slug === rolesEnum.franchiseOwner) {
        //   setFranchises(
        //     response?.data?.franchises.filter((f) => {
        //       // filter functional franchises only
        //       const isFunctional = f?.status !== franchiseStatusEnum.nonFunctional;
        //
        //       const matchesFranchiseId = userId ? f?.ownerId === userId : false;
        //
        //       return isFunctional && matchesFranchiseId;
        //     }) || [],
        //   );
        // } else {
        //   setFranchises(
        //     response?.data?.franchises?.filter((f) => {
        //       // Filter out non-functional franchises
        //       // Return true only if both conditions are met
        //       return f?.status !== franchiseStatusEnum.nonFunctional;
        //     }),
        //   );
        // }
      }
    } catch (error) {
      /**
       * show error in the toast
       */
      toast.error(error?.message, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  //Fetch location sources
  const fetchLocationSources = async () => {
    try {
      const response = await getLocationSources();
      if (response?.statusCode === 200) {
        const locationSourcesData = response?.data?.locationSources || [];
        const transformedLocationSources = transformArrayForOptions(
          locationSourcesData,
          'title',
          'value',
        );
        setLocationSources(transformedLocationSources || []);
      }
    } catch (error) {
      toast.error(error?.message, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  // Fetch sales person listing for dropdown options
  const fetchAssigneesList = async () => {
    try {
      const response = await getDealOwnerOptions();
      if (response.statusCode === 200) {
        const dealOwners = transformArrayForOptions(response?.data?.owners, 'name', 'id', 'type');
        setAssignees(dealOwners || []);
        setSupervisors(dealOwners || []);
      }
    } catch (error) {
      /**
       * show error
       */
      toast.error(error?.message, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  // Location Labels
  const fetchLocationLabels = async (companyId) => {
    try {
      const response = await getLocationAffiliationLabels(companyId);
      if (response.statusCode === 200) {
        setLocationAffiliationLabels(response?.data?.locationLabels);
      }
    } catch (error) {
      /**
       * show error
       */
      toast.error(error?.message, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  //Fetch Contact Labels
  const _fetchContactLabels = async () => {
    try {
      const response = await getContactAffiliationLabels();
      if (response.statusCode === 200) {
        setContactAffiliationLabels(response?.data?.contactLabels);
      }
    } catch (error) {
      /**
       * show error
       */
      toast.error(error?.message, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  //Fetch sales Interns listing for dropdown options
  const _fetchSupervisorsList = async () => {
    try {
      const response = await getDealOwnerOptions();
      if (response.statusCode === 200)
        setSupervisors(
          transformArrayForOptions(response?.data?.owners, 'name', 'id', 'email') || [],
        );
    } catch (error) {
      /**
       * show error
       */
      toast.error(error?.message, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  //Fetch new location stages listing for dropdown options
  const fetchLeadStageList = async (stage) => {
    try {
      const response = await getLeadStageOptions(stage);
      if (response.statusCode === 200) setLeadStages(response?.data?.stages);
    } catch (error) {
      /**
       * show error in the corresponding field
       */
      toast.error(error?.message, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  //calculate the center of the map
  const getFinalCenter = useMemo(() => {
    let result = {};
    if (!isObjectEmpty(addressFromParent?.coordinates)) {
      result = addressFromParent?.coordinates;
    }
    if (addressFromParent && !isObjectEmpty(center)) {
      result = center;
    }

    if (!addressFromParent && isObjectEmpty(center)) {
      result = defaultCenter;
    }
    if (!addressFromParent && !isObjectEmpty(center)) {
      result = center;
    }

    return result;
  }, [addressFromParent, center]);

  const getFinalLocation = useMemo(() => {
    let result = {};

    if (addressFromParent) {
      result = {
        id: generateUniqueId(),
        name: addressFromParent?.formatted_address,
        position: addressFromParent?.coordinates,
      };
    }
    if (!isObjectEmpty(selectedLocation)) {
      result = selectedLocation;
    }
    return result;
  }, [addressFromParent, selectedLocation]);

  const finalSelectedLocation = getFinalLocation;
  const finalCenter = getFinalCenter;
  const fillNameConstant = fillName.current
    ? formData?.propertyName || addressFromParent?.name || ''
    : formData?.propertyName;

  useEffect(() => {
    if (editLocationData) {
      if (!formData?.id) setFormData(editLocationData);
      // setAssignTo(editLocationData.assignTo?.intent);
    }
  }, [editLocationData]);

  useEffect(() => {
    fetchAssigneesList();
    // fetchSupervisorsList();
    fetchFranchises();
    fetchLeadStageList(stageValues.APPROVED);
    fetchLocationSources();
    // fetchContactLabels();
  }, []);

  useEffect(() => {
    if (addressFromParent) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        propertyName: addressFromParent?.name || prevFormData?.propertyName,
        phoneNumber:
          addressFromParent?.international_phone_number ||
          addressFromParent?.formatted_phone_number ||
          formData?.phoneNumber ||
          '',
      }));
    }
  }, JSON.stringify(addressFromParent));

  /**
   * Determines if a user with a specific role is allowed to assign to a target role.
   *
   * @param userRoleSlug - The slug/identifier of the current user's role
   * @param targetRoleValue - The enum value of the role being assigned to
   * @returns true if the assignment is allowed, false otherwise
   */
  const _isAssignable = (userRoleSlug, targetRoleValue) => {
    // Define role-based assignment permissions
    const rolePermissions = {
      // Sales Manager can assign to themselves or Sales Person only
      [rolesEnum.salesManager]: [assignToEnums.SALES_MANAGER, assignToEnums.SALES_PERSON],

      // Franchise Owner can assign to themselves, Sales Manager, or Sales Person
      [rolesEnum.franchiseOwner]: [
        assignToEnums.FRANCHISE_OWNER,
        assignToEnums.SALES_MANAGER,
        assignToEnums.SALES_PERSON,
      ],

      // Director can assign to themselves, Sales Manager, or Sales Person
      [rolesEnum.director]: [
        assignToEnums.DIRECTOR,
        assignToEnums.SALES_MANAGER,
        assignToEnums.SALES_PERSON,
      ],

      // Home Officer can assign to themselves, Sales Manager, or Sales Person
      [rolesEnum.homeOfficer]: [
        assignToEnums.HOME_OFFICE,
        assignToEnums.SALES_MANAGER,
        assignToEnums.SALES_PERSON,
      ],

      // Supervisor can assign to themselves, Sales Manager, or Sales Person
      [rolesEnum.supervisor]: [
        assignToEnums.SUPERVISOR,
        assignToEnums.SALES_MANAGER,
        assignToEnums.SALES_PERSON,
      ],

      // Coordinator can assign to themselves, Sales Manager, or Sales Person
      [rolesEnum.coordinator]: [
        assignToEnums.COORDINATOR,
        assignToEnums.SALES_MANAGER,
        assignToEnums.SALES_PERSON,
      ],
    };

    // Get allowed roles for the current user's role
    const allowedValues = rolePermissions[userRoleSlug] || [];

    // Check if the target role is in the allowed list
    return allowedValues.includes(targetRoleValue);
  };

  const isDisabled = cannotAssignSupervisorToUsers.includes(formData?.assignee?.type);

  useEffect(() => {
    if (isDisabled) {
      setAddSupervisor(false);
    }
  }, [isDisabled]);

  const contactFilter = useMemo(
    () => ({ locationId: formData?.referredByProperty?.id }),
    [formData.referredByProperty?.id],
  );

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
              title={t(
                editLocationData
                  ? 'sales.locations.editLocation'
                  : 'sales.locations.createLocation',
              )}
              subtext={t(
                editLocationData
                  ? 'sales.locations.editText'
                  : 'sales.locations.createLocationText',
              )}
              handleCloseDrawer={locationCloseDrawer}
              anchor={anchor}
              className={classes.newLocationDrawerHeader}
            />
          </Box>
          <Box className={classNames(classes.locationForm, 'innerScrollBar')}>
            <Box className={classes.sideBySideCol}>
              <Box
                className={`${classes.fieldWrapper}  ${classes.dropdownCommonSection}`}
                component="div"
              >
                <Box className={classes.inlineLables}>
                  <InputLabel htmlFor="company">
                    {t('sales.locations.company')}
                    <RequiredAsterik />
                  </InputLabel>
                  <RenderIfHasPermission name={ACL_COMPANIES_CREATE}>
                    <Button
                      className={classes.noPadding}
                      variant="onlyText"
                      disableRipple
                      onClick={handleOpenConvert}
                      startIcon={<AddBlueIcon className={classes.whiteBtn} />}
                    >
                      {t('sales.locations.createNew')}
                    </Button>
                  </RenderIfHasPermission>
                </Box>

                <CustomDropDown
                  name="company"
                  id="company"
                  label={t('sales.locations.company')}
                  options={transformArrayForOptions(companies, 'name', 'id') || []}
                  selectedValues={formData?.company || {}}
                  handleChange={inputChangedHandler}
                  placeHolder={t('sales.locations.searchCompany')}
                  searchable
                  bordered
                  className={classes.dropHigh}
                  placeHolderClassName={classes.placeHolderText}
                  isError={errorMessages?.company}
                  error={errorMessages?.company}
                  pagination={companiesPagination}
                  fetchMoreOptions={fetchCompanies}
                  isLoading={loadingCompaniesDropDown}
                />
                <span className="errorMessage">{errorMessages?.company}</span>
              </Box>
              <Box className={classes.fieldWrapper}>
                <InputLabel htmlFor="parentCompany">
                  {t('sales.locations.parentCompany')}
                </InputLabel>
                <TextField
                  name="parentCompany"
                  id="parentCompany"
                  value={formData?.company?.parentCompanyName || ''}
                  fullWidth
                  disabled={true}
                  placeholder={t('sales.locations.parentCompanyPlaceholder')}
                />
              </Box>
            </Box>
            <Box className={classes.sideBySideCol}>
              <Box className={classes.fieldWrapper}>
                <InputLabel htmlFor="propertyName">
                  {t('sales.locations.propertyName')}
                  <RequiredAsterik />
                </InputLabel>
                <TextField
                  id="propertyName"
                  name="propertyName"
                  fullWidth
                  placeholder={t('sales.locations.propertyNamePlaceholder')}
                  error={!!errorMessages?.propertyName}
                  helperText={errorMessages?.propertyName}
                  onChange={(e) => {
                    if (fillName.current) {
                      fillName.current = false;
                    }
                    inputChangedHandler(e);
                  }}
                  value={fillNameConstant}
                  className={classes.dropHigh}
                  placeHolderClassName={classes.placeHolderText}
                />
                <span className="errorMessage">{errorMessages?.propertyName}</span>
              </Box>
              <Box
                className={`${classes.fieldWrapper}  ${classes.dropdownCommonSection}`}
                component="div"
              >
                <InputLabel htmlFor="locationSource">
                  {t('sales.locations.locationSource')}
                  <RequiredAsterik />
                </InputLabel>
                <CustomDropDown
                  id="locationSource"
                  name="locationSource"
                  label={t('sales.locations.locationSource')}
                  options={locationSources || []}
                  selectedValues={formData?.locationSource || {}}
                  handleChange={inputChangedHandler}
                  placeHolder={t('sales.locations.locationSourcePlaceholder')}
                  bordered
                  className={classes.dropHigh}
                  isError={errorMessages?.locationSource}
                  placeHolderClassName={classes.placeHolderText}
                />
                <span className="errorMessage">{errorMessages?.locationSource}</span>
              </Box>
            </Box>
            <Box className={`${classes.sideBySideCol}`}>
              <Box
                className={`${classes.fieldWrapper}  ${classes.dropdownCommonSection}`}
                component="div"
              >
                <InputLabel htmlFor="associatedFranchise">
                  {t('sales.locations.associatedFranchise')}
                </InputLabel>
                <CustomDropDown
                  name="associatedFranchise"
                  id="associatedFranchise"
                  label={t('sales.locations.associatedFranchise')}
                  options={transformArrayForOptions(franchises, 'name', 'id') || []}
                  selectedValues={formData?.associatedFranchise || {}}
                  handleChange={inputChangedHandler}
                  placeHolder={t('sales.locations.associatedFranchisePlaceholder')}
                  className={classes.dropHigh}
                  isError={errorMessages?.associatedFranchise}
                  bordered
                  placeHolderClassName={classes.placeHolderText}
                  searchable
                />
              </Box>
              <Box
                className={`${classes.fieldWrapper}  ${classes.dropdownCommonSection}`}
                component="div"
              >
                <InputLabel htmlFor="HubspotMap">
                  {t('sales.locations.chooseMap')}
                  <RequiredAsterik />
                </InputLabel>
                <CustomDropDown
                  name="HubspotMap"
                  id="HubspotMap"
                  label={t('sales.locations.HubspotMap')}
                  options={transformArrayForOptions(leadStages, 'name', 'id') || []}
                  selectedValues={formData?.HubspotMap || {}}
                  handleChange={inputChangedHandler}
                  placeHolder={t('sales.locations.leadStages')}
                  className={classes.dropHigh}
                  isError={errorMessages?.HubspotMap}
                  placeHolderClassName={classes.placeHolderText}
                  bordered
                  showDescription={false}
                />
                <span className="errorMessage">{errorMessages?.HubspotMap}</span>
              </Box>
            </Box>
            {/* Location Affiliation selection*/}
            <Divider variant="fullWidth" className={classes.locationsDivider} />
            <Box>
              <Box className={classes.assignToradio}>
                <Box className={classes.radioWrapper}>
                  <h5 className={classes.sidetitle}>{t('sales.locations.locationAffiliation')}:</h5>
                  <Box className={classes.locationAffiliationChip}>
                    {(locationAffiliationLabels?.length &&
                      locationAffiliationLabels?.map((chip) => (
                        <Chip
                          className={classes.radioStyle}
                          key={chip.key}
                          label={chip?.title}
                          onClick={() => handleChipClick(chip.key)}
                          disabled={chip?.disabled}
                          variant="outlined"
                          style={{
                            borderColor: formData?.locationAffiliation.includes(chip.key)
                              ? '#146DFF'
                              : '#E6E6E7',
                            borderWidth: formData?.locationAffiliation.includes(chip.key)
                              ? '1.5px'
                              : '1px',
                          }}
                        />
                      ))) ||
                      NA}
                  </Box>
                </Box>
                <Box className={classes.invalidFeedback}>
                  {errorMessages?.locationAffiliation && <>{errorMessages?.locationAffiliation}</>}
                </Box>
              </Box>
            </Box>
            <Divider variant="fullWidth" className={classes.locationsDivider} />
            <Box>
              {/* <Box className={classes.radioWrapper}>
                <h5 className={classes.sidetitle}>{t('sales.locations.assignTo')}</h5>
                 <FormControl className={classes.radioOption}>
                  <RadioGroup
                    row
                    value={assignTo}
                    onChange={handleChange}
                    name="radio-buttons-group"
                  >
                    {Object.entries(assignToOptionsHash).map(([key, item]) => {
                      // Skip rendering if the current user is not allowed to assign to this role
                      if (!isAssignable(userRole?.slug, item?.value)) return null;

                      return (
                        <FormControlLabel
                          value={item?.value}
                          control={<Radio />}
                          label={
                            userRole?.slug === item?.value ? `Myself (${item?.label})` : item.label
                          }
                          key={key}
                        />
                      );
                    })}
                  </RadioGroup>
                </FormControl>
              </Box> */}
              {/* {assignTo === assignToOptionsHash?.sales_manager.value && (
                <Box className={classes.sideBySideColEmail}>
                  <Box className={`${classes.fieldWrapper}  ${classes.secondDropdown}`}>
                    <InputLabel htmlFor="salesManager">
                      {t('sales.locations.salesManager')}
                      <RequiredAsterik />
                    </InputLabel>
                    <CustomDropDown
                      name="salesManager"
                      id="salesManager"
                      label={t('sales.locations.salesManager')}
                      options={
                        transformArrayForOptions(salesPersons, 'fullName', 'id', 'email') || []
                      }
                      selectedValues={formData?.salesManager || {}}
                      handleChange={inputChangedHandler}
                      placeHolder={t('sales.locations.selectSalesManager')}
                      searchable
                      bordered
                      className={classes.dropHigh}
                      placeHolderClassName={classes.placeHolderText}
                      isError={errorMessages?.salesManager}
                      showEmailInLine={true}
                    />
                    <span className="errorMessage">{errorMessages?.salesManager}</span>
                  </Box>
                </Box>
              )} */}

              {/* {assignTo === assignToOptionsHash.sales_person.value && ( */}
              <Box className={classes.sideBySideCol}>
                <Box
                  style={{ width: '50%' }}
                  className={`${classes.fieldWrapper}   ${classes.secondDropdown}`}
                >
                  <InputLabel htmlFor="assignee">
                    {' '}
                    {t('sales.locations.assignTo')}
                    <RequiredAsterik />
                  </InputLabel>
                  <CustomDropDown
                    name="assignee"
                    id="assignee"
                    label={t('sales.locations.selectAssignTo')}
                    options={assignees || []}
                    selectedValues={formData?.assignee || {}}
                    handleChange={inputChangedHandler}
                    placeHolder={t('sales.locations.selectAssignTo')}
                    searchable
                    bordered
                    className={classes.dropHigh}
                    placeHolderClassName={classes.placeHolderText}
                    isError={errorMessages?.assignee}
                  />
                  <span className="errorMessage">{errorMessages?.assignee}</span>
                </Box>
                <Box style={{ width: '50%' }}>
                  {addSupervisor &&
                    !cannotAssignSupervisorToUsers.includes(formData?.assignee?.type) && (
                      <Box className={`${classes.fieldWrapper}  ${classes.secondDropdown}`}>
                        <InputLabel htmlFor="supervisor">
                          {t('sales.locations.associatedSupervisor', {
                            supervisor: getLabel('roles', 'supervisor'),
                          })}
                          <RequiredAsterik />
                        </InputLabel>
                        <CustomDropDown
                          name="associatedSupervisor"
                          id="associatedSupervisor"
                          label={t('sales.locations.supervisor', {
                            supervisor: getLabel('roles', 'supervisor'),
                          })}
                          options={supervisors || []}
                          selectedValues={formData?.associatedSupervisor || {}}
                          handleChange={inputChangedHandler}
                          placeHolder={t('sales.locations.selectAssociatedSupervisor', {
                            supervisor: getLabel('roles', 'supervisor'),
                          })}
                          searchable
                          bordered
                          className={classes.dropHigh}
                          placeHolderClassName={classes.placeHolderText}
                          isError={errorMessages?.associatedSupervisor}
                        />
                        {errorMessages?.associatedSupervisor && (
                          <span className="errorMessage">
                            {errorMessages?.associatedSupervisor}
                          </span>
                        )}
                      </Box>
                    )}
                </Box>
              </Box>
              <Box className={classes.sideBySideCol}>
                <Box className={classes.inineField}>
                  <Checkbox
                    id="addSupervisor"
                    checked={addSupervisor}
                    onChange={() => setAddSupervisor(!addSupervisor)}
                    disabled={isDisabled}
                  />
                  <InputLabel htmlFor="addSupervisor">
                    {t('sales.locations.associateSupervisor', {
                      supervisor: getLabel('roles', 'supervisor'),
                    })}
                  </InputLabel>
                </Box>
              </Box>
              {/* {addSupervisor && (
                <Box className={classes.sideBySideCol}>
                  <Box className={`${classes.fieldWrapper}  ${classes.secondDropdown}`}>
                    <InputLabel htmlFor="supervisor">
                      {t('sales.locations.associatedSupervisor')}
                      <RequiredAsterik />
                    </InputLabel>
                    <CustomDropDown
                      name="associatedSupervisor"
                      id="associatedSupervisor"
                      label={t('sales.locations.supervisor')}
                      options={supervisors || []}
                      selectedValues={formData?.associatedSupervisor || {}}
                      handleChange={inputChangedHandler}
                      placeHolder={t('sales.locations.selectAssociatedSupervisor')}
                      searchable
                      bordered
                      className={classes.dropHigh}
                      placeHolderClassName={classes.placeHolderText}
                      isError={errorMessages?.associatedSupervisor}
                    />
                    {errorMessages?.associatedSupervisor && (
                      <span className="errorMessage">{errorMessages?.associatedSupervisor}</span>
                    )}
                  </Box>
                </Box>
              )} */}
              {/* )} */}
            </Box>
            {formData?.locationSource.value === 'referred' && (
              <>
                <Divider variant="fullWidth" className={classes.locationsDivider} />
                <Box className={classes.referredWrapper}>
                  <Typography variant="h4" className={classes.referredByTitle}>
                    {t('sales.locations.referredBy')}
                  </Typography>
                  <Box className={classes.sideBySideCol}>
                    <PropertyDropDown
                      name="referredByProperty"
                      required={true}
                      property={formData?.referredByProperty || {}}
                      onChange={inputChangedHandler}
                      isError={errorMessages?.referredByProperty}
                      error={errorMessages?.referredByProperty}
                    />
                    <ContactDropDown
                      name="referredByContact"
                      filter={contactFilter}
                      contact={formData?.referredByContact || {}}
                      onChange={inputChangedHandler}
                      required={true}
                      error={errorMessages?.referredByContact}
                    />
                  </Box>
                </Box>
              </>
            )}
            <Divider variant="fullWidth" className={classes.locationsDivider} />
            <Box className={classes.contactDetailsWrapper}>
              <Typography variant="h4" className={classes.sidetitle}>
                {t('sales.locations.contactDetails')}
              </Typography>
              <Typography variant="body2" className={classes.subtext}>
                {t('sales.locations.addContactDescription')}
              </Typography>
              <Box className={classes.contactList}>
                {/*{contactAffiliationLabels?.length > 0 &&*/}
                {/*  contactAffiliationLabels?.map((contactChip, index) => (*/}
                {/*    <DynamicContactComponent*/}
                {/*      key={index}*/}
                {/*      roleObj={contactChip}*/}
                {/*      formData={formData}*/}
                {/*      setFormData={setFormData}*/}
                {/*      errorMessages={errorMessages}*/}
                {/*      setErrorMessages={setErrorMessages}*/}
                {/*    />*/}
                {/*    // <Box className={classes.contactListItem} key={index}>*/}
                {/*    //   <Chip*/}
                {/*    //     size="small"*/}
                {/*    //     label={contactChip?.label}*/}
                {/*    //     value={contactChip?.value}*/}
                {/*    //     className={classes.decisionMakerChip}*/}
                {/*    //   />*/}
                {/*    //   <CustomDropDown*/}
                {/*    //     name="company"*/}
                {/*    //     id="company"*/}
                {/*    //     label={t('sales.locations.company')}*/}
                {/*    //     options={transformArrayForOptions(companies, 'name', 'id') || []}*/}
                {/*    //     selectedValues={formData?.company || {}}*/}
                {/*    //     handleChange={inputChangedHandler}*/}
                {/*    //     placeHolder={t('sales.locations.searchCompany')}*/}
                {/*    //     searchable*/}
                {/*    //     bordered*/}
                {/*    //     className={classes.dropHigh}*/}
                {/*    //     placeHolderClassName={classes.placeHolderText}*/}
                {/*    //   />*/}
                {/*    // </Box>*/}
                {/*  ))}*/}

                <Box className={classes.contactListHeader}>
                  <Typography variant="subtitle3" className={classes.contactListText}>
                    {t('sales.locations.contactTitle')}
                  </Typography>
                  <Typography variant="subtitle3" className={classes.contactListText}>
                    {t('sales.locations.contactUsers')}
                  </Typography>
                </Box>

                <Box className={classes.contactListItem}>
                  <Box className={classes.makerChip}>
                    <Chip
                      size="small"
                      label={t('sales.locations.decisionMaker')}
                      value={'decisionMaker'}
                      className={classes.decisionMakerChip}
                    />
                  </Box>
                  <CustomDropDown
                    name={`contactAffiliation.decision_maker`}
                    id={'decision_maker'}
                    label={
                      formData?.contactAffiliation?.[`decision_maker`]?.length > 0
                        ? t('sales.locations.selectedContact')
                        : t('sales.locations.selectAContact')
                    }
                    multiSelect
                    options={contactsList?.['decision_maker'] || []}
                    selectedValues={formData?.contactAffiliation?.[`decision_maker`] || []}
                    additionalOption={
                      <RenderIfHasPermission name={ACL_CONTACTS_CREATE}>
                        <Box
                          onClick={() => handleOpenNewContactModal('decision_maker')}
                          className={classNames(classes.customDropdownOptionLink)}
                        >
                          <PlusIcon />
                          <Typography variant="body2">
                            {t('sales.locations.createNewContact')}
                          </Typography>
                        </Box>
                      </RenderIfHasPermission>
                    }
                    handleChange={inputChangedHandler}
                    searchPlaceholder={t('sales.locations.searchByName')}
                    searchable
                    bordered
                    placeHolderClassName={classes.placeHolderText}
                    pagination={contactsPagination?.['decision_maker']}
                    fetchMoreOptions={(refetch, search, apiController) => {
                      currentSelectedDropdown.current = 'decision_maker';
                      fetchContacts(refetch, search, apiController);
                    }}
                    isLoading={loadingStates?.['decision_maker']}
                    popperWidth={'487px'}
                  />
                </Box>
                <Box className={classes.contactListItem}>
                  <Box className={classes.makerChip}>
                    <Chip size="small" label={t('sales.locations.endUser')} color="primary" />
                  </Box>
                  <CustomDropDown
                    name={`contactAffiliation.end_user`}
                    id={'endUser'}
                    label={
                      formData?.contactAffiliation?.[`end_user`]?.length > 0
                        ? t('sales.locations.selectedContact')
                        : t('sales.locations.selectAContact')
                    }
                    multiSelect
                    options={contactsList?.['end_user'] || []}
                    selectedValues={formData?.contactAffiliation?.[`end_user`] || []}
                    handleChange={inputChangedHandler}
                    searchPlaceholder={t('sales.locations.searchByName')}
                    searchable
                    bordered
                    additionalOption={
                      <RenderIfHasPermission name={ACL_CONTACTS_CREATE}>
                        <Box
                          onClick={() => handleOpenNewContactModal('end_user')}
                          className={classNames(classes.customDropdownOptionLink)}
                        >
                          <PlusIcon />
                          <Typography variant="body2">
                            {t('sales.locations.createNewContact')}
                          </Typography>
                        </Box>
                      </RenderIfHasPermission>
                    }
                    placeHolderClassName={classes.placeHolderText}
                    pagination={contactsPagination?.['end_user']}
                    fetchMoreOptions={(refetch, search, apiController) => {
                      currentSelectedDropdown.current = 'end_user';
                      fetchContacts(refetch, search, apiController);
                    }}
                    isLoading={loadingStates?.['end_user']}
                    popperWidth={'487px'}
                  />
                </Box>
                <Box className={classes.contactListItem}>
                  <Box className={classes.makerChip}>
                    <Chip size="small" label={t('sales.locations.billing')} color="success" />
                  </Box>
                  <CustomDropDown
                    name={`contactAffiliation.billing`}
                    id={'billing'}
                    label={
                      formData?.contactAffiliation?.[`billing`]?.length > 0
                        ? t('sales.locations.selectedContact')
                        : t('sales.locations.selectAContact')
                    }
                    multiSelect
                    options={contactsList?.['billing'] || []}
                    selectedValues={formData?.contactAffiliation?.[`billing`] || []}
                    handleChange={inputChangedHandler}
                    searchPlaceholder={t('sales.locations.searchByName')}
                    searchable
                    bordered
                    additionalOption={
                      <RenderIfHasPermission name={ACL_CONTACTS_CREATE}>
                        <Box
                          onClick={() => handleOpenNewContactModal('billing')}
                          className={classNames(classes.customDropdownOptionLink)}
                        >
                          <PlusIcon />
                          <Typography variant="body2">
                            {t('sales.locations.createNewContact')}
                          </Typography>
                        </Box>
                      </RenderIfHasPermission>
                    }
                    placeHolderClassName={classes.placeHolderText}
                    pagination={contactsPagination?.['billing']}
                    fetchMoreOptions={(refetch, search, apiController) => {
                      currentSelectedDropdown.current = 'billing';
                      fetchContacts(refetch, search, apiController);
                    }}
                    isLoading={loadingStates?.['billing']}
                    popperWidth={'487px'}
                  />
                </Box>
                <Box className={classes.contactListItem}>
                  <Box className={classes.makerChip}>
                    <Chip size="small" label={t('sales.locations.blocker')} color="error" />
                  </Box>
                  <CustomDropDown
                    name={`contactAffiliation.blocker`}
                    id={'blocker'}
                    label={
                      formData?.contactAffiliation?.[`blocker`]?.length > 0
                        ? t('sales.locations.selectedContact')
                        : t('sales.locations.selectAContact')
                    }
                    multiSelect
                    options={contactsList?.['blocker'] || []}
                    selectedValues={formData?.contactAffiliation?.[`blocker`] || []}
                    handleChange={inputChangedHandler}
                    searchPlaceholder={t('sales.locations.searchByName')}
                    searchable
                    bordered
                    additionalOption={
                      <RenderIfHasPermission name={ACL_CONTACTS_CREATE}>
                        <Box
                          onClick={() => handleOpenNewContactModal('blocker')}
                          className={classNames(classes.customDropdownOptionLink)}
                        >
                          <PlusIcon />
                          <Typography variant="body2">
                            {t('sales.locations.createNewContact')}
                          </Typography>
                        </Box>
                      </RenderIfHasPermission>
                    }
                    placeHolderClassName={classes.placeHolderText}
                    pagination={contactsPagination?.['blocker']}
                    fetchMoreOptions={(refetch, search, apiController) => {
                      currentSelectedDropdown.current = 'blocker';
                      fetchContacts(refetch, search, apiController);
                    }}
                    isLoading={loadingStates?.['blocker']}
                    popperWidth={'487px'}
                  />
                </Box>
                <Box className={classes.contactListItem}>
                  <Box className={classes.makerChip}>
                    <Chip size="small" label={t('sales.locations.influencer')} color="warning" />
                  </Box>
                  <CustomDropDown
                    name={`contactAffiliation.influencer`}
                    id={'influencer'}
                    label={
                      formData?.contactAffiliation?.[`influencer`]?.length > 0
                        ? t('sales.locations.selectedContact')
                        : t('sales.locations.selectAContact')
                    }
                    multiSelect
                    options={contactsList?.['influencer'] || []}
                    selectedValues={formData?.contactAffiliation?.[`influencer`] || []}
                    handleChange={inputChangedHandler}
                    searchPlaceholder={t('sales.locations.searchByName')}
                    searchable
                    bordered
                    additionalOption={
                      <RenderIfHasPermission name={ACL_CONTACTS_CREATE}>
                        <Box
                          onClick={() => handleOpenNewContactModal('influencer')}
                          className={classNames(classes.customDropdownOptionLink)}
                        >
                          <PlusIcon />
                          <Typography variant="body2">
                            {t('sales.locations.createNewContact')}
                          </Typography>
                        </Box>
                      </RenderIfHasPermission>
                    }
                    placeHolderClassName={classes.placeHolderText}
                    pagination={contactsPagination?.['influencer']}
                    fetchMoreOptions={(refetch, search, apiController) => {
                      currentSelectedDropdown.current = 'influencer';
                      fetchContacts(refetch, search, apiController);
                    }}
                    isLoading={loadingStates?.['influencer']}
                    popperWidth={'487px'}
                  />
                </Box>

                {errorMessages?.contactAffiliation && (
                  <Box className={classes.invalidFeedback}>{errorMessages?.contactAffiliation}</Box>
                )}
              </Box>
              {/* <Box className={classes.sideBySideCol}>
                <Box className={classes.fieldWrapper}>

                  <InputLabel htmlFor="name">{t('sales.locations.firstname')}</InputLabel>
                  <TextField
                    name="firstName"
                    id="firstName"
                    fullWidth
                    Disabled
                    placeholder={t('sales.locations.firstNamePlaceholder')}
                    error={!!errorMessages?.firstName}
                    helperText={errorMessages?.firstName}
                    onChange={inputChangedHandler}
                    value={formData?.firstName || ''}
                    className={classes.dropHigh}
                  />
                </Box>
                <Box className={classes.fieldWrapper}>
                  <InputLabel htmlFor="name">{t('sales.locations.lastname')}</InputLabel>
                  <TextField
                    name="lastName"
                    id="lastName"
                    fullWidth
                    Disabled
                    placeholder={t('sales.locations.lastNamePlaceholder')}
                    error={!!errorMessages?.lastName}
                    helperText={errorMessages?.lastName}
                    onChange={inputChangedHandler}
                    value={formData?.lastName || ''}
                    className={classes.dropHigh}
                  />
                </Box>
              </Box>
              <Box className={classes.sideBySideCol}>
                <Box className={classes.fieldWrapper}>
                  <InputLabel htmlFor="title">{t('sales.locations.title')}</InputLabel>
                  <TextField
                    name="title"
                    id="title"
                    fullWidth
                    Disabled
                    placeholder={t('sales.locations.titlePlaceholder')}
                    error={!!errorMessages?.title}
                    helperText={errorMessages?.title}
                    onChange={inputChangedHandler}
                    value={formData?.title || ''}
                    className={classes.dropHigh}
                  />
                </Box>
                <Box className={classes.fieldWrapper}>
                  <InputLabel htmlFor="phoneNumber">{t('sales.locations.contact')}</InputLabel>
                  <TextField
                    name="phoneNumber"
                    id="phoneNumber"
                    type="string"
                    fullWidth
                    placeholder="+1 234 3409 0823"
                    error={!!errorMessages?.phoneNumber}
                    helperText={errorMessages?.phoneNumber}
                    onChange={inputChangedHandler}
                    value={formData?.phoneNumber || ''}
                    className={classes.dropHigh}
                  />
                </Box>
              </Box>
              <Box className={classes.sideBySideColEmail}>
                <Box className={classes.fieldWrapper}>
                  <InputLabel htmlFor="email">{t('sales.locations.email')}</InputLabel>
                  <TextField
                    name="email"
                    id="email"
                    type="email"
                    fullWidth
                    placeholder="mike.henry@costco.co"
                    error={!!errorMessages?.email}
                    helperText={errorMessages?.email}
                    onChange={inputChangedHandler}
                    value={formData?.email || ''}
                    className={classes.dropHigh}
                  />
                </Box>
              </Box> */}
            </Box>
            {/* New Fields added */}
            {/* Not required now */}
            {/* <Divider variant="fullWidth" className={classes.locationsDivider} />
            <Box className={classes.contactDetails}>
              <h5 className={`${classes.marginTopBottom}  ${classes.sidetitle}`}>
                {t('sales.locations.additionalDetails')}
              </h5>
              <Box className={classes.sideBySideCol}>
                <Box className={classes.fieldWrapper}>
                  <InputLabel htmlFor="noOfUnits">{t('sales.locations.otherNoOfUnits')}</InputLabel>
                  <TextField
                    name="numberOfUnits"
                    id="numberOfUnits"
                    fullWidth
                    type={'number'}
                    placeholder={t('sales.locations.otherNoOfUnitsPlaceholder')}
                    error={!!errorMessages?.numberOfUnits}
                    helperText={errorMessages?.numberOfUnits}
                    onChange={(event) => {
                      const newValue = event.target.value.replace(/[^\d]/g, ''); // Remove any non-digit characters

                      const newEvent = {
                        target: {
                          name: event?.target?.name,
                          value: newValue,
                        },
                      };

                      inputChangedHandler(newEvent);
                    }}
                    value={formData?.numberOfUnits}
                    className={classes.dropHigh}
                  />
                </Box>
                <Box className={classes.fieldWrapper}>
                  <InputLabel htmlFor="occupancyRate">
                    {t('sales.locations.otherOccupancyRate')}
                  </InputLabel>
                  <TextField
                    name="occupancyRate"
                    id="occupancyRate"
                    fullWidth
                    type={'number'}
                    placeholder={t('sales.locations.otherOccupancyRatePlaceholder')}
                    error={!!errorMessages?.occupancyRate}
                    helperText={errorMessages?.occupancyRate}
                    onChange={inputChangedHandler}
                    value={formData?.occupancyRate || ''}
                    className={classes.dropHigh}
                  />
                </Box>
              </Box>
              <Box className={classes.sideBySideCol}>
                <Box className={classes.fieldWrapper}>
                  <InputLabel htmlFor="averageRate">
                    {t('sales.locations.otherAverageRate')}
                  </InputLabel>
                  <TextField
                    name="averageRent"
                    id="averageRent"
                    fullWidth
                    type={'number'}
                    placeholder={t('sales.locations.otherAverageRatePlaceholder')}
                    error={!!errorMessages?.averageRent}
                    helperText={errorMessages?.averageRent}
                    onChange={inputChangedHandler}
                    value={formData?.averageRent || ''}
                    className={classes.dropHigh}
                  />
                </Box>
                <Box className={classes.fieldWrapper}>
                  <InputLabel htmlFor="managementCompany">
                    {t('sales.locations.otherManagementCompany')}
                  </InputLabel>
                  <TextField
                    name="managementCompany"
                    id="managementCompany"
                    type="string"
                    fullWidth
                    placeholder={t('sales.locations.otherManagementCompanyPlaceholder')}
                    error={!!errorMessages?.managementCompany}
                    helperText={errorMessages?.managementCompany}
                    onChange={inputChangedHandler}
                    value={formData?.managementCompany || ''}
                    className={classes.dropHigh}
                  />
                </Box>
              </Box>
            </Box> */}
            <Divider variant="fullWidth" className={classes.locationsDivider} />
            <Box className={classes.addressetails}>
              <h5 className={`${classes.marginTopBottom}  ${classes.sidetitle}`}>
                {t('sales.locations.address')}
              </h5>
              {isLoaded && (
                <GoogleMapSearchAddressComponent
                  isLoaded={isLoaded}
                  updateMapValue={updateMapValue}
                  errorMessages={errorMessages}
                  formKey="googleAddress"
                  setAddress={setAddress}
                  address={address || addressFromParent?.formatted_address}
                  setActiveMarker={setActiveMarker}
                  setSelectedLocation={setSelectedLocation}
                  setCenter={setCenter}
                  disabled={!isObjectEmpty(addressFromParent)}
                />
              )}
              {isLoaded && (
                <GoogleMapViewComponent
                  isLoaded={isLoaded}
                  updateMapValue={updateMapValue}
                  formKey="googleAddress"
                  setAddress={setAddress}
                  setActiveMarker={setActiveMarker}
                  activeMarker={activeMarker}
                  setSelectedLocation={setSelectedLocation}
                  selectedLocation={finalSelectedLocation}
                  setCenter={setCenter}
                  center={finalCenter}
                  mapContainerStyle={{ width: '100%', height: '300px', borderRadius: '10px' }}
                />
              )}
              {/* Below code is for old flow where user add all address details */}
              {/* <Box className={classes.sideBySideCol}>
                <Box className={classes.fieldWrapper}>
                  <InputLabel htmlFor="streetAddress">
                    {t('sales.locations.streetAddress')}
                  </InputLabel>

                  <TextField
                    name="address"
                    id="address"
                    fullWidth
                    placeholder={t('sales.locations.streetAddressPlaceholder')}
                    error={!!errorMessages?.address}
                    helperText={errorMessages?.address}
                    onChange={inputChangedHandler}
                    value={formData?.address || ''}
                    className={classes.dropHigh}
                  />
                </Box>
                <Box className={classes.fieldWrapper}>
                  <InputLabel htmlFor="addressLine">{t('sales.locations.addressLine')}</InputLabel>
                  <TextField
                    name="address2"
                    id="address2"
                    fullWidth
                    placeholder={t('sales.locations.addressLinePlaceholder')}
                    error={!!errorMessages?.address2}
                    onChange={inputChangedHandler}
                    value={formData?.address2 || ''}
                    className={classes.dropHigh}
                  />
                </Box>
              </Box>
              <Box className={classes.sideBySideCol}>
                <Box className={classes.fieldWrapper}>
                  <InputLabel htmlFor="country">
                    {t('form.input.textField.country.label')}
                  </InputLabel>
                  <CountrySelectHookComponent searchable={true} />
                </Box>
                <Box className={classes.fieldWrapper}>
                  <InputLabel htmlFor="city">{t('sales.locations.state')}</InputLabel>
                  <StateHookComponent searchable={true} />
                </Box>
              </Box>
              <Box className={classes.sideBySideCol}>
                <Box className={`${classes.fieldWrapper} ${classes.fiftyWidth}`}>
                  <InputLabel htmlFor="state">{t('sales.locations.city')}</InputLabel>
                  <CityHookComponent searchable={true} />
                </Box>
                <Box className={`${classes.fieldWrapper} ${classes.fiftyWidth}`}>
                  <InputLabel htmlFor="postalCode">{t('sales.locations.postalCode')}</InputLabel>
                  <TextField
                    name="postalCode"
                    id="postalCode"
                    type="string"
                    fullWidth
                    placeholder="68010"
                    error={!!errorMessages?.postalCode}
                    helperText={errorMessages?.postalCode}
                    onChange={inputChangedHandler}
                    value={formData?.postalCode || ''}
                    className={classes.dropHigh}
                  />
                </Box>
              </Box> */}
            </Box>
          </Box>
          <DrawerFooter
            classNameFooter={classes.sideDrawerFooter}
            bulkApply={t(
              editLocationData ? 'sales.locations.save' : 'sales.locations.createLocation',
            )}
            bulkCancel={t('sales.locations.cancel')}
            handleCloseDrawer={locationCloseDrawer}
            anchor={anchor}
            type="submit"
            disabled={isSubmittingForm}
          />
        </Stack>
      </Box>

      {openNewContactModal && (
        <NewContactModal
          openHandle={!!openNewContactModal}
          closeHandle={handleCloseNewContactModal}
          type={openNewContactModal}
          onContactCreated={handleContactCreated}
        />
      )}

      {openConvert ? (
        <CreateNewCompanyModal
          openHandle={openConvert}
          closeHandle={handleCloseConvert}
          fetchCompanies={fetchCompanies}
          onCompanyCreated={handleCompanyCreated}
        />
      ) : null}
    </>
  );
};

NewLocationDrawer.propTypes = {
  locationInformationFromMap: PropTypes.object,
  addressFromParent: PropTypes.object,
  isLoaded: PropTypes.bool.isRequired,
  anchor: PropTypes.string,
  locationCloseDrawer: PropTypes.func,
  width: PropTypes.number,
  companies: PropTypes.array, // Adjust the type accordingly based on the expected data structure
  editLocationData: PropTypes.object, // Adjust the type accordingly based on the expected data structure
  onSuccess: PropTypes.func,
  fetchCompanies: PropTypes.func,
  refetch: PropTypes.func,
  companiesPagination: PropTypes.object,
  loadingCompaniesDropDown: PropTypes.bool,
};

export default NewLocationDrawer;
