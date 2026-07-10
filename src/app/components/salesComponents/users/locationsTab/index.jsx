import { TableCell, TableRow, TableSortLabel } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import classNames from 'classnames';
import NoRecordFound from 'commonComponents/table/noRecordFound';
import PropTypes from 'prop-types';
import React, { useRef } from 'react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { useHistory } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getCompaniesOption, getUserLocations } from 'services/location.service';
import CustomDropDown from 'src/app/components/common/customDropDown';
import MoreFilterDrawer from 'src/app/components/common/moreFilterDrawer/index.jsx';
import SearchComponentWithQuery from 'src/app/components/common/searchWithQuery';
import TableSkeleton from 'src/app/components/common/skeletonLoader/tableSkeleton';
import TableComponent from 'src/app/components/common/table';
import {
  locationDrawerTypes,
  // stagesDropdownOptions,
} from 'src/app/components/salesComponents/locations/newLocationsDrawer/location.constant';
import { SALES_LOCATION } from 'src/app/router/constant/ROUTE.jsx';
import { locationStages } from 'src/app/sales/pages/locations/listing/locations.constant.js';
import { MoreFilter } from 'src/assets/svg';
import { useApiControllers } from 'src/helper/axios';
import { removeKeysFromObject } from 'src/helper/utilityFunctions';
import transformArrayForOptions from 'src/utils/array/transformArrayForOptions';
import { paginationOptions, rolesEnum, toastSettings } from 'src/utils/constants';
import { companiesPaginationEmptyState } from 'src/utils/constants/emptyStates/companiesPagination.js';
import { KEY } from 'src/utils/constants/events/keyPressEvents';
import { extractValuesByKeyFromInput } from 'src/utils/dropdownValueExtractor';
import capitalize from 'src/utils/string/capitalize';

import { stageValues } from '../../locations/locationStages/stage.constant.js';
import { useStyles } from './locationStyles.js';

const i18ColumnName = (t) => {
  return [
    // { id: 'id', label: 'ID', sortable: true },
    {
      id: 'hsId', //user name
      label: `${t('sales.users.listingId')}`,
      sortable: false,
    },
    {
      id: 'name', // designation of the user
      label: `${t('sales.users.listingLocationName')}`,
      sortable: false,
    },
    {
      id: 'companyName', // email of the user
      label: `${t('sales.users.listingCompanyName')}`,
      sortable: false,
    },
    {
      id: 'companyIndustry', // email of the user
      label: `${t('sales.users.listingCompanyIndustry')}`,
      sortable: false,
    },
    {
      id: 'stage', // email of the user
      label: `${t('sales.users.listingStage')}`,
      sortable: true,
    },
    {
      id: 'type', // role or permission assigned to the user
      label: `${t('sales.users.listingType')}`,
      sortable: true,
    },
    {
      id: 'assignedTo', // role or permission assigned to the user
      label: `${t('sales.users.listingAssignedTo')}`,
      sortable: false,
    },
    {
      id: 'address', // account status of the user
      label: `${t('sales.users.listingAddress')}`,
      sortable: false,
    },
    {
      id: 'postalCode',
      label: `${t('sales.users.listingZipCodes')}`,
      sortable: false,
    },
    {
      id: 'state', // account status of the user
      label: `${t('sales.users.listingState')}`,
      sortable: false,
    },
    {
      id: 'city', // date of birth of the user
      label: `${t('sales.users.listingCity')}`,
      sortable: false,
    },
    {
      id: 'nearbyFranchise',
      label: `${t('sales.users.listingNearByFranchise')}`,
      sortable: false,
    },
  ];
};

const emptyState = {
  associatedCompanyIds: [],
  associatedCompanies: [],
  parentCompanyIds: [],
  parentCompanies: [],
  // assignedTo: [],
  postalCode: '',
  postalCodes: [],
  hsId: '',
  states: [],
  cities: [],
};
const locationStagesFilter = [
  { value: 'all', label: 'All', enumId: undefined },
  { value: 'approved', label: 'Approved', enumId: 0 },
  { value: 'discovery', label: 'Discovery', enumId: 1 },
  { value: 'qualified', label: 'Qualified', enumId: 3 },
  { value: 'need_assessment', label: 'Needs Assessment', enumId: 4 },
  { value: 'negotiation', label: 'Negotiation', enumId: 5 },
  { value: 'current_customer', label: 'Current Customer', enumId: 6 },
  { value: 'lost_proposal', label: 'Lost Proposal', enumId: 7 },
  { value: 'lost_customer', label: 'Lost Customer', enumId: 8 },
  { value: 'nurture', label: 'Nurture', enumId: 9 },
];

const params = {
  pageNo: paginationOptions.defaultPerPage,
  rowsPerPage: paginationOptions.perPageRows,
  search: '',
  sortBy: '',
  orderBy: '',
  stage: {},
  location: '',

  // More filter params
  // associatedCompanyIds: [],
  // parentCompanyIds: [],
  // assignedTo: [],
  // postalCode: '',
  // hsId: '',
  // states: [],
  // cities: [],

  // More filters params can be assigned like this too. Uncomment this if it is suites you
  ...emptyState,
};

const order = {
  orderBy: 'id',
  orderType: 'asc',
};

const columnIdsEnum = {
  hsId: 'hsId',
  stage: 'stage',
  name: 'name',
  postalCode: 'postalCode',
  businessWon: 'businessWon',
  city: 'city',
  state: 'state',
  image: 'image',
  assignedTo: 'assignedTo',
};
function LocationTab({ userDetail }) {
  const { id: userId } = useParams();
  const { t } = useTranslation();
  const classes = useStyles();
  const NA = t('commonText.nA');
  const [formData, setFormData] = useState(emptyState);

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalRows, setTotalRows] = useState(0);
  const [companies, setCompanies] = useState([]);
  const [companiesPagination, setCompaniesPagination] = useState(companiesPaginationEmptyState);
  const [queryParams, setQueryParams] = useState(params);
  const [_companiesFilters, setCompaniesFilters] = useState({
    associatedCompanyIds: [],
    // parentCompanyIds: [],
    assignedTo: [],
  });

  const history = useHistory();

  const { getNewApiController } = useApiControllers();

  const [loadingCompaniesDropDown, setLoadingCompaniesDropDown] = useState(false);

  const previousSearchText = useRef(null);

  const columns = i18ColumnName(t);
  const [moreFilterState, setMoreFilterState] = useState({
    right: false,
  });

  /**
   * Fetch companies listing
   */
  const fetchCompanies = async (refetch = false, search = '') => {
    const apiController = getNewApiController();
    try {
      setLoadingCompaniesDropDown(true);

      let currentPage = companiesPagination?.currentPage;
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
        currentPage = companiesPagination?.currentPage + 1;
      }
      if (previousSearchText.current && !search) {
        currentPage = 1;
      }
      if (!search && !previousSearchText.current && refetch) {
        currentPage = companiesPagination?.currentPage + 1;
      }

      const response = await getCompaniesOption(currentPage, search, {
        signal: apiController.signal,
      });
      if (response.statusCode === 200) {
        if (refetch && response?.data?.companies?.length) {
          setCompanies((prevCompanies) => [
            ...prevCompanies,
            ...transformArrayForOptions(response?.data?.companies || [], 'name', 'id'),
          ]);
        } else {
          setCompanies(transformArrayForOptions(response?.data?.companies || [], 'name', 'id'));
        }
        // setCompanies(response?.data?.companies);
        setCompaniesPagination(response?.pagination);
        previousSearchText.current = search;
      }
      setLoadingCompaniesDropDown(false);
    } catch (error) {
      if (!apiController.signal.aborted) {
        toast.error(error?.message, {
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
      }
    }
  };

  const fetchLocations = async (queryParams) => {
    try {
      setLoading(true);
      let params = {
        ...queryParams,
        stateIds: extractValuesByKeyFromInput(queryParams.states, 'value'),
        cityIds: extractValuesByKeyFromInput(queryParams.cities, 'value'),
        stage:
          extractValuesByKeyFromInput(queryParams.stage, 'value') !== 'all'
            ? extractValuesByKeyFromInput(queryParams.stage, 'value')
            : '',
      };
      params = removeKeysFromObject(params, [
        'states',
        'cities',
        'associatedCompanies',
        'parentCompanies',
      ]);
      // get list of locations
      const response = await getUserLocations(userId, params);
      if (response.statusCode === 200) {
        setData(response?.data?.locations);
        const total = response?.pagination?.totalCount;
        setTotalRows(total);
        setLoading(false);
      }
    } catch (e) {
      // show toast if needed
      toast.error(e?.message, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations(queryParams);
    if (companies?.length < 1) fetchCompanies();
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

  const handleChangeRowsPerPage = (event) => {
    setQueryParams((prev) => ({
      ...prev,
      pageNo: paginationOptions.defaultPerPage,
      rowsPerPage: parseInt(event.target.value, 10),
    }));
  };

  const handleChangePage = async (_, newPage) => {
    setQueryParams((prev) => ({
      ...prev,
      pageNo: newPage + 1,
    }));
  };

  const renderTableCell = (row, column) => {
    if (column.id === columnIdsEnum.postalCode) {
      return <>{row?.address?.postalCode || NA}</>;
    }

    if (column.id === columnIdsEnum.city) {
      return <>{row?.address?.city || NA}</>;
    }

    if (column.id === 'address') {
      return <>{row?.address?.addressLine1}</>;
    }

    if (column.id === columnIdsEnum.state) {
      return <>{row?.address?.state || NA}</>;
    }

    if (column.id === columnIdsEnum.name) {
      return (
        <>
          {row?.name ? (
            <Box className="tableavatar">
              {/* <TableImage
                imageUrl={row?.image}
                // alt={`${t('commonText.image.alt', {
                //   name: `${row?.owner?.name}`,
                // })}`}
                alt=""
              /> */}
              {row?.name}
            </Box>
          ) : (
            NA
          )}
        </>
      );
    }

    if (column.id === columnIdsEnum.stage) {
      let stageColorClass = '';
      if (row[column.id].value === stageValues.APPROVED) {
        stageColorClass = classes.approvedLocationColor;
      } else if (row[column.id].value === stageValues.DISCOVERY) {
        stageColorClass = classes.discoveryColor;
      } else if (row[column.id].value === stageValues.QUALIFIED) {
        stageColorClass = classes.qualifiedColor;
      } else if (row[column.id].value === stageValues.NEEDS_ASSESSMENT) {
        stageColorClass = classes.needAssesmentColor;
      } else if (row[column.id].value === stageValues.NEGOTIATION) {
        stageColorClass = classes.negotiationColor;
      } else if (row[column.id].value === stageValues.CURRENT_CUSTOMER) {
        stageColorClass = classes.currentCustomer;
      } else if (row[column.id].value === stageValues.LOST_PROPOSAL) {
        stageColorClass = classes.lostColor;
      } else if (row[column.id].value === stageValues.LOST_CUSTOMER) {
        stageColorClass = classes.lostColor;
      } else if (row[column.id].value === stageValues.NURTURE) {
        stageColorClass = classes.nurtureColor;
      } else {
        stageColorClass = locationStages.OTHERS;
      }

      return (
        <Box component="span" className={classNames(classes.commonStageColor, stageColorClass)}>
          {row[column.id]?.label}
        </Box>
      );
    }

    if (column.id === columnIdsEnum.assignedTo) {
      return <>{capitalize(row[column.id]) || NA}</>;
    }

    if (column.id === columnIdsEnum.hsId) return <>{row[column.id] ? `#${row[column.id]}` : NA}</>;
    return <>{row[column.id] || NA}</>;
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

  const goToDetail = (rowId) => {
    history.push(`${SALES_LOCATION}/${rowId}`);
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
                >
                  {column.label}
                </TableSortLabel>
              ) : (
                <>
                  {column.id === 'assignedTo' &&
                  (userDetail.slug === rolesEnum.homeOfficer ||
                    userDetail.slug === rolesEnum.salesManager)
                    ? `${column.label}`
                    : `${column.label}`}
                </>
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
        {data?.length > 0 &&
          data?.map((row) => (
            <TableRow key={row.id}>
              {i18ColumnName.map((column) => {
                const showHandCursor = column.id === columnIdsEnum.hsId ? 'pointer' : '';
                return (
                  <TableCell
                    key={column.id}
                    onClick={() => column.id === columnIdsEnum.hsId && goToDetail(row?.id)}
                    sx={{ cursor: showHandCursor }}
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
        pageNo: paginationOptions.defaultPerPage,
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
    // setFormData(updatedFormData);
    // // setPage(0);
    // const params = {
    //   page: page + 1,
    //   query: updatedFormData,
    // };
    // refreshLocation && fetchLocations(params);
    // setMoreFilterState({ ...moreFilterState });
    setFormData(emptyState);
    setQueryParams((prev) => ({
      pageNo: paginationOptions.defaultPerPage,
      ...prev,
      ...emptyState,
    }));
  };
  const applyFilters = (query) => {
    // Create a new object with status from formData and other fields from emptyState
    // const updatedFormData = {
    //   ...query,
    //   status: formData.status,
    // };

    // setPage(0);
    // const params = {
    //   page: 1,
    //   query: updatedFormData,
    // };
    // fetchLocations(params);

    setQueryParams((prev) => ({
      pageNo: paginationOptions.defaultPerPage,
      ...prev,
      ...query,
    }));
  };
  return (
    <Box>
      <Box className={classes.searchSectionDashboard}>
        <Box className={classes.searchSection}>
          <SearchComponentWithQuery
            name="search"
            placeHolder={`${t('sales.locations.searchByID')}`}
            value={queryParams?.search}
            onSearch={inputChangedHandler}
          />
          <Box className={classes.dropdownCommonSection}>
            <CustomDropDown
              label={t('sales.users.propertiesStages')}
              name="stage"
              options={transformArrayForOptions(locationStagesFilter, 'label', 'enumId')}
              selectedValues={queryParams.stage}
              handleChange={inputChangedHandler}
              clearAll
              disabled={false}
            />
          </Box>
          <Button
            onClick={toggleFiltersDrawer(locationDrawerTypes.RIGHT, true)}
            className={classes.moreFilter}
            variant="onlyText"
          >
            {t('sales.locations.moreFilters')} <MoreFilter className={classes.filterIcon} />
          </Button>
          <Drawer
            anchor={locationDrawerTypes.RIGHT}
            open={moreFilterState[locationDrawerTypes.RIGHT]}
            onClose={toggleFiltersDrawer(locationDrawerTypes.RIGHT, false)}
          >
            {moreFilterState?.right ? (
              <MoreFilterDrawer
                anchor="right"
                filterCloseDrawer={filterCloseDrawer}
                width={399}
                formData_={formData}
                setFormData_={setFormData}
                handleClearFilters={handleClearFilters}
                applyFilters={applyFilters}
                emptyState={emptyState}
                companies={companies}
                setCompaniesFilters={setCompaniesFilters}
                companiesPagination={companiesPagination}
                fetchMoreOptions={fetchCompanies}
                loadingCompaniesDropDown={loadingCompaniesDropDown}
                isDealDrawer={false}
              />
            ) : null}
          </Drawer>
        </Box>
      </Box>
      <Box className={classes.tableWrapper}>
        <TableComponent
          data={data}
          columns={columns}
          tableHead={tableHead}
          tableBody={tableBody}
          pagination={true}
          page={queryParams.pageNo - 1}
          totalRecords={Number(totalRows)}
          handleChangePage={handleChangePage}
          applySorting={applySorting}
          rowsPerPage={queryParams.rowsPerPage}
          rowsPerPageOptions={paginationOptions.perPageOptions}
          onChangeRowsPerPage={handleChangeRowsPerPage}
        />
      </Box>
    </Box>
  );
}

LocationTab.propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  userDetail: PropTypes.object,
};
export default LocationTab;
