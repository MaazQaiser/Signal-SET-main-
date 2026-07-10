import { Box, Button, Drawer, TableCell, TableRow, TableSortLabel } from '@mui/material';
import { ReactComponent as DownloadCloud } from 'assets/images/downloadcloud.svg';
import { ReactComponent as ChevronRight } from 'assets/svg/chevron-right.svg';
import { ReactComponent as GraphCollapseIconUpward } from 'assets/svg/collapse-upward-icon.svg';
// import { ReactComponent as DeleteChipIcon } from 'assets/svg/DeleteChipIcon.svg';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
// import { getIndustryTypes } from 'services/company.service';
import CustomDropDown from 'src/app/components/common/customDropDown';
import SearchComponentWithQuery from 'src/app/components/common/searchWithQuery';
import TableSkeleton from 'src/app/components/common/skeletonLoader/tableSkeleton';
import TableComponent from 'src/app/components/common/table';
import NoRecordFound from 'src/app/components/common/table/noRecordFound';
import TableImage from 'src/app/components/common/tableImage';
import { locationDrawerTypes } from 'src/app/components/salesComponents/locations/newLocationsDrawer/location.constant';
import MoreFiltersDrawer from 'src/app/components/salesComponents/users/moreFiltersDrawer';
import { SALES_USER_DETAIL } from 'src/app/router/constant/ROUTE';
import history from 'src/app/router/utils/history';
// import { MoreFilter } from 'src/assets/svg';
import { deepEqual, formatDate } from 'src/helper/utilityFunctions';
import { useTenantLabel } from 'src/hooks/useTenantLabel';
import { getDisplayConfiguration } from 'src/redux/store/slices/regionalCountryConfiguration';
import { getSalesUsers } from 'src/services/user.services';
import transformArrayForOptions from 'src/utils/array/transformArrayForOptions';
import { paginationOptions, rolesEnum } from 'src/utils/constants';
import { KEY } from 'src/utils/constants/events/keyPressEvents';
import { extractValuesByKeyFromInput } from 'src/utils/dropdownValueExtractor';
import { capitalizeFirstLetter } from 'src/utils/string/common';

import TopGraphComponent from '../components/graph';
import { useStyles } from './userListing';

const i18ColumnName = (t, classDealName) => {
  return [
    // { id: 'id', label: 'ID', sortable: true },
    {
      id: 'name', //user name
      label: `${t('sales.users.listingName')}`,
      sortable: true,
      hasImage: true,
      className: classDealName,
    },
    {
      id: 'type', // role or permission assigned to the user
      label: `${t('sales.users.listingRole')}`,
      sortable: false,
    },
    {
      id: 'assignedLocations', // designation of the user
      label: `${t('sales.users.listingAssignedLocations')}`,
      sortable: false,
    },
    {
      id: 'activeLocations', // department of the user
      label: `${t('sales.users.listingActive')}`,
      sortable: false,
    },
    {
      id: 'qualifiedLocations', // phoneNumber of the user displayed as contact
      label: `${t('sales.users.listingQualified')}`,
      sortable: false,
    },
    {
      id: 'unqualifiedLocations', // email of the user
      label: `${t('sales.users.listingUnqualified')}`,
      sortable: false,
    },
    // {
    //   id: 'state', // account status of the user
    //   label: `${t('sales.users.listing.state')}`,
    //   sortable: false,
    // },
    // {
    //   id: 'city', // date of birth of the user
    //   label: `${t('sales.users.listing.city')}`,
    //   sortable: false,
    // },
    // {
    //   id: 'postalCode',
    //   label: `${t('sales.users.listing.zipCodes')}`,
    //   sortable: false,
    // },
    {
      id: 'createdAt',
      label: `${t('sales.users.listingCreatedAt')}`,
      sortable: false,
    },
  ];
};
const emptyState = {
  associatedCompanyIds: [],
  parentCompanyIds: [],
  assignedTo: [],
  // status: locationFilterStatus.APPROVED,
  // assigned: locationFilterOptions[0],
  // createdAt: {
  //   from: null, // start from
  //   to: null, // end to
  // },
  // createdAt: [],
  postalCode: '',
  hsId: '',
  states: [],
  cities: [],
  country: '',
  countryCode: '',
  industryTypeIds: [],
  userType: {},
};

const typeEnum = (getLabel) => ({
  ['Sales Person']: getLabel('roles', 'sales_person'),
  ['Sales Manager']: getLabel('roles', 'sales_manager'),
  ['Home Officer']: getLabel('roles', 'home_officer'),
  ['Franchise Owner']: getLabel('roles', 'franchise_owner'),
  Director: getLabel('roles', 'director'),
  Supervisor: getLabel('roles', 'supervisor'),
  Coordinator: getLabel('roles', 'coordinator'),
});

const i18UserTypeFilters = (t, getLabel) => [
  { value: 'all', label: `${t('sales.users.filtersUsersTypeFiltersAll')}` },
  {
    value: 'home_officer',
    label: getLabel('roles', 'home_officer'),
    type: 'ho',
  },
  {
    value: 'sales_manager',
    label: getLabel('roles', 'sales_manager'),
    type: 'ho',
  },
  {
    value: 'sales_person',
    label: getLabel('roles', 'sales_person'),
    type: 'ho',
  },
  {
    value: 'franchise_owner',
    label: getLabel('roles', 'franchise_owner'),
    type: 'fo',
  },
  { value: 'director', label: getLabel('roles', 'director'), type: 'fo' },
  {
    value: 'supervisor',
    label: getLabel('roles', 'supervisor'),
    type: 'fo',
  },
  {
    value: 'coordinator',
    label: getLabel('roles', 'coordinator'),
    type: 'fo',
  },
];

const params = {
  page: paginationOptions.defaultPerPage,
  perPage: paginationOptions.perPageRows,
  search: '',
  sortBy: '',
  orderBy: '',
  userType: {},

  // more filters
  ...emptyState,
};
const order = {
  orderBy: 'id',
  orderType: 'asc',
};
const columnIdsEnum = {
  name: 'name',
  postalCode: 'postalCode',
  businessWon: 'businessWon',
  city: 'city',
  state: 'state',
  image: 'image',
  type: 'type',
  createdAt: 'createdAt',
};
const UsersListing = () => {
  const { t } = useTranslation();
  const classes = useStyles();
  const { dateFormat } = useSelector(getDisplayConfiguration);
  const NA = t('commonText.nA');
  const classDealName = classes.locationTD;
  const columns = i18ColumnName(t, classDealName);

  const { getLabel } = useTenantLabel();

  const TypeEnum = typeEnum(getLabel);

  const userRole = useSelector((state) => state.auth.userRole);

  const userTypeFilters =
    userRole.slug === rolesEnum.homeOfficer
      ? i18UserTypeFilters(t, getLabel)
      : i18UserTypeFilters(t, getLabel)?.filter((f) => f.type === 'fo' || !f.type);

  const [formData, setFormData] = useState(emptyState);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalRows, setTotalRows] = useState(0);
  // const [companies, setCompanies] = useState([]);/
  // const [industryTypes, setIndustryTypes] = useState([]);
  const [queryParams, setQueryParams] = useState(params);
  // const columns = i18ColumnName(t);
  const [moreFilterState, setMoreFilterState] = useState({
    right: false,
  });
  const [graphCollapse, setGraphCollapse] = useState(false);
  useEffect(() => {
    fetchUsers(queryParams);
    // if (!companies.length) fetchCompanies();
    // if (!industryTypes.length) fetchIndustryTypes();
  }, [queryParams]);
  const toggleFiltersDrawer = (anchor, open) => (event) => {
    if (event.type === KEY.UP && (event.key === KEY.TAB || event.key === KEY.SHIFT)) {
      return;
    }
    setMoreFilterState({ ...moreFilterState, [anchor]: open });
  };
  const filterCloseDrawer = (anchor) => {
    setMoreFilterState({ ...moreFilterState, [anchor]: false });
  };
  const fetchUsers = async (queryParams) => {
    setLoading(true);
    try {
      const params = {
        ...queryParams,
        states: extractValuesByKeyFromInput(queryParams.states, 'value'),
        cities: extractValuesByKeyFromInput(queryParams.cities, 'value'),
        userType:
          extractValuesByKeyFromInput(queryParams.userType, 'value') !== 'all'
            ? extractValuesByKeyFromInput(queryParams.userType, 'value')
            : '',
      };
      const response = await getSalesUsers(params);
      if (response && response?.statusCode === 200) {
        setData(response?.data?.salesPersonsAndSalesManagers || []);
        const total = response?.data?.pagination?.totalCount;
        setTotalRows(total);
      }
    } catch (error) {
      /**
       * show error in the corresponding field
       * parse errors in array format and set them in errorMessages
       * setErrorMessages(error)
       */
    } finally {
      setLoading(false);
    }
  };

  // /**
  //  * Fetch companies listing
  //  */
  // const fetchCompanies = async () => {
  //   try {
  //     const response = await getCompaniesOption();
  //     if (response.statusCode === 200) {
  //       setCompanies(response?.data?.companies);
  //     }
  //   } catch (error) {
  //     /**
  //      * show error
  //      */
  //     toast.error(error?.message, {
  //       position: 'top-right',
  //       autoClose: toastSettings.AUTO_CLOSE,
  //     });
  //   }
  // };

  // const fetchIndustryTypes = async () => {
  //   try {
  //     const response = await getIndustryTypes();
  //     if (response?.statusCode === 200) {
  //       const verticals = response?.data?.industryVerticals;
  //       setIndustryTypes(
  //         Object.keys(verticals)
  //           .map((key) => ({
  //             name: verticals[key],
  //             id: key,
  //           }))
  //           // Sort the industry verticals based on label to show industries in alphabetic order
  //           .sort((a, b) => (a.label > b.label ? 1 : b.label > a.label ? -1 : 0)),
  //       );
  //     }
  //   } catch (e) {
  //     /**
  //      * show error
  //      */
  //   }
  // };

  const handleChangeRowsPerPage = (event) => {
    setQueryParams((prev) => ({
      ...prev,
      page: paginationOptions.defaultPerPage,
      perPage: parseInt(event.target.value, 10),
    }));
  };

  const handleChangePage = async (_, newPage) => {
    setQueryParams((prev) => ({
      ...prev,
      page: newPage + 1,
    }));
  };
  const renderTableCell = (row, column) => {
    if (column.id === columnIdsEnum.postalCode) {
      return <>{row[column.id] || NA}</>;
    }
    if (column.id === columnIdsEnum.city) {
      return <>{row?.city?.name || NA}</>;
    }
    if (column.id === columnIdsEnum.state) {
      return <>{row?.state?.name || NA}</>;
    }
    if (column.id === columnIdsEnum.name) {
      return (
        <>
          {row?.name ? (
            <Box className={classes.locationName}>
              <Box className="tableavatar">
                <TableImage
                  imageUrl={row?.image}
                  // alt={`${t('commonText.image.alt', {
                  //   name: `${row?.owner?.name}`,
                  // })}`}
                  alt=""
                />
                {capitalizeFirstLetter(row?.name)}
              </Box>
              <Box className={classes.locationNameIcon}>
                <ChevronRight />
              </Box>
            </Box>
          ) : (
            NA
          )}
        </>
      );
    }

    if (column.id === columnIdsEnum.type) {
      return <>{TypeEnum[row[column.id]]}</>;
    }

    if (column.id === columnIdsEnum.createdAt) {
      return <>{formatDate(row[column.id], dateFormat)}</>;
    }

    return <>{row[column.id]}</>;
  };
  const [orderState, setOrderState] = useState(order);
  /**
   * Handle column sorting.
   *
   * @param {String} columnId - The ID of the column being sorted.
   */
  const handleSort = (columnId) => {
    const isAsc = orderState.orderBy === columnId && orderState.orderType === 'asc';
    setOrderState({
      orderBy: columnId,
      orderType: isAsc ? 'desc' : 'asc',
    });
    applySorting(columnId, orderState.orderType);
  };
  const applySorting = (sortBy, orderBy) => {
    setQueryParams((prev) => ({
      ...prev,
      page: paginationOptions.defaultPerPage,
      perPage: paginationOptions.perPageRows,
      sortBy: sortBy,
      orderBy: orderBy,
    }));
  };
  /**
   * Determine the sort direction for a column.
   *
   * @param {Object} column - The column configuration object.
   * @return {Boolean|String} - The sort direction or false if not sorted.
   */
  const sortDirection = (column) => {
    return orderState.orderBy === column.id ? orderState.orderType : false;
  };
  /**
   * Determine the order direction for a column.
   *
   * @param {Object} column - The column configuration object.
   * @return {String} - The order direction ('asc' or 'desc').
   */
  const orderDirection = (column) => {
    return orderState.orderBy === column.id ? orderState.orderType : 'asc';
  };
  const tableHead = () => {
    return (
      <>
        <TableRow>
          {columns.map((column) => (
            <TableCell key={column.id} sortDirection={sortDirection(column)}>
              {column.sortable ? (
                <TableSortLabel
                  active={orderState.orderBy === column.id}
                  direction={orderDirection(column)}
                  onClick={() => handleSort(column.id)}
                  hideSortIcon={false}
                  sx={{
                    '& .MuiTableSortLabel-icon': {
                      opacity: 0.5, // Default opacity
                      transition: 'opacity 0.3s ease', // Smooth transition
                    },
                    '&.MuiTableSortLabel-active .MuiTableSortLabel-icon': {
                      opacity: 1, // Active state opacity
                    },
                  }}
                >
                  {column.label}
                </TableSortLabel>
              ) : (
                `${column.label}`
              )}
            </TableCell>
          ))}
        </TableRow>
      </>
    );
  };
  const tableBody = (data, i18ColumnName) => {
    return loading ? (
      <TableSkeleton columns={i18ColumnName} />
    ) : (
      <>
        <NoRecordFound data={data} noOfColumns={i18ColumnName.length} t={t} />
        {data.length > 0 &&
          data.map((row) => (
            <TableRow key={row.id}>
              {i18ColumnName.map((column) => {
                const showHandCursor = column.id === columnIdsEnum.name ? 'pointer' : '';
                return (
                  <TableCell
                    key={column.id}
                    onClick={() => gotoDetailPage(column, row.id)}
                    sx={{ cursor: showHandCursor }}
                    className={column.className}
                  >
                    {renderTableCell(row, column)}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
      </>
    );
  };
  const updateFormHandler = (name, value) => {
    setQueryParams((prevState) => {
      return {
        ...prevState,
        page: paginationOptions.defaultPerPage,
        [name]: value,
      };
    });
  };
  const inputChangedHandler = (event) => {
    // Get name of changed input, and its corresponding value
    const { name, value } = event.target;
    // Update form state against the target input field
    updateFormHandler(name, value);
  };
  const gotoDetailPage = (column, rowId) => {
    if (column.id === columnIdsEnum.name) {
      history.push(`${SALES_USER_DETAIL}/${rowId}`); // goto user detail page ? not yet designed
    }
  };
  const handleClearFilters = () => {
    // Create a new object with status from formData and other fields from emptyState
    // let refreshLocation = true;
    // if (deepEqual(formData, emptyState)) {
    //   refreshLocation = false;
    // }
    // const updatedFormData = {
    //   ...emptyState,
    //   status: formData.status,
    // };
    // setFormData(emptyState);
    // setPage(0);
    // const params = {
    //   page: queryParams.page + 1,
    //   query: updatedFormData,
    // };
    // refreshLocation && fetchLocations(params);
    if (!deepEqual(formData, emptyState)) {
      // refreshLocation = false;
      setFormData(emptyState);
      setQueryParams((prev) => ({
        page: paginationOptions.defaultPerPage,
        ...prev,
        ...emptyState,
      }));
      setMoreFilterState({ ...moreFilterState });
    }
  };
  const applyFilters = (query) => {
    // Create a new object with status from formData and other fields from emptyState
    // const updatedFormData = {
    //   ...query,
    //   status: formData.status,
    // };
    // // setPage(0);
    // const params = {
    //   page: 1,
    //   query: updatedFormData,
    // };
    // fetchLocations(params);
    setQueryParams((prev) => ({
      ...prev,
      ...query,
      page: paginationOptions.defaultPerPage,
      userType: prev.userType,
    }));
  };
  // const handleDelete = () => {};
  return (
    <>
      {/* {loading && <LoaderComponent size={50} color={'primary'} label={'Loading'} />} */}
      <Box className={classes.salesUserListingContainer}>
        <Box className={!graphCollapse ? classes.mainWrapper : classes.graphHide}>
          <TopGraphComponent />
          {!graphCollapse && (
            <Button
              variant="secondaryGrey"
              onClick={() => setGraphCollapse(true)}
              className={classes.graphCollapseBtn}
            >
              <Box>
                <GraphCollapseIconUpward />
              </Box>
            </Button>
          )}
        </Box>
        {graphCollapse && (
          <Button
            variant="secondaryGrey"
            onClick={() => setGraphCollapse(false)}
            className={classes.graphExpandBtn}
          >
            <Box>
              <GraphCollapseIconUpward />
            </Box>
          </Button>
        )}
        <Box className={classes.searchSectionDashboard}>
          <Box className={classes.searchSection}>
            <SearchComponentWithQuery
              name="search"
              placeHolder={t('sales.users.listingSearchmember')}
              value={queryParams?.search}
              onSearch={inputChangedHandler}
            />
            <Box className={classes.dropdownCommonSection}>
              <CustomDropDown
                label={t('sales.users.listingRole')}
                name="userType"
                options={transformArrayForOptions(userTypeFilters, 'label', 'value')}
                selectedValues={queryParams.userType}
                handleChange={inputChangedHandler}
                clearAll
                disabled={false}
              />
            </Box>
            {/* Backend does not have address feilds so commenting this button */}
            {/* <Button
              onClick={toggleFiltersDrawer(locationDrawerTypes.RIGHT, true)}
              className={classes.moreFilter}
              disableRipple
              variant="onlyText"
            >
              {t('sales.locations.moreFilters')} <MoreFilter className={classes.filterIcon} />
            </Button> */}
            <Drawer
              anchor={locationDrawerTypes.RIGHT}
              open={moreFilterState[locationDrawerTypes.RIGHT]}
              onClose={toggleFiltersDrawer(locationDrawerTypes.RIGHT, false)}
            >
              {moreFilterState?.right ? (
                <MoreFiltersDrawer
                  anchor="right"
                  filterCloseDrawer={filterCloseDrawer}
                  width={399}
                  formData_={formData}
                  setFormData_={setFormData}
                  handleClearFilters={handleClearFilters}
                  applyFilters={applyFilters}
                  emptyState={emptyState}
                  // companies={companies}
                  // industryTypes={industryTypes}
                />
              ) : null}
            </Drawer>
          </Box>
          <Box className={classes.userSection}>
            <Button disabled variant="secondaryGrey" startIcon={<DownloadCloud />}>
              {`${t('links.export')}`}
            </Button>
            {/* ? IMPORTANT: Users are invited from Auth0 so there is no need to invite them from Sales. */}
            {/*<Button*/}
            {/*  variant="primary"*/}
            {/*  startIcon={<AddIcon />}*/}
            {/*  onClick={toggleDrawerLocation(locationDrawerTypes.RIGHT, true)}*/}
            {/*>*/}
            {/*  Invite Team Member*/}
            {/*</Button>*/}
            {/*<Drawer*/}
            {/*  anchor={locationDrawerTypes.RIGHT}*/}
            {/*  open={locationState[locationDrawerTypes.RIGHT]}*/}
            {/*  onClose={toggleDrawerLocation(locationDrawerTypes.RIGHT, false)}*/}
            {/*>*/}
            {/*  <NewLocationDrawer*/}
            {/*    anchor={locationDrawerTypes.RIGHT}*/}
            {/*    locationCloseDrawer={locationCloseDrawer}*/}
            {/*    width={796}*/}
            {/*    companies={companies}*/}
            {/*    onSuccess={refetchLocations}*/}
            {/*  />*/}
            {/*</Drawer>*/}
          </Box>
        </Box>
        {/* comment for now? */}
        {/* <Box className={classes.chipsBar}>
          <Box className={classes.chipsWrapper}>
            <Chip
              label="Arizona - AZ"
              size="small"
              onDelete={handleDelete}
              deleteIcon={<DeleteChipIcon />}
            />
            <Chip
              label="Arizona - AZ"
              size="small"
              onDelete={handleDelete}
              deleteIcon={<DeleteChipIcon />}
            />
          </Box>

          <Button
            disableRipple
            className={classes.moreFilter}
          >{`${t('commonText.clearAll')}`}</Button>
        </Box> */}
        <Box className={classes.tableWrapper}>
          <TableComponent
            data={data}
            columns={columns}
            tableHead={tableHead}
            tableBody={tableBody}
            pagination={true}
            page={queryParams.page - 1}
            totalRecords={totalRows}
            handleChangePage={handleChangePage}
            applySorting={applySorting}
            rowsPerPage={queryParams.perPage}
            rowsPerPageOptions={paginationOptions.perPageOptions}
            onChangeRowsPerPage={handleChangeRowsPerPage}
          />
        </Box>
      </Box>
    </>
  );
};
export default UsersListing;
