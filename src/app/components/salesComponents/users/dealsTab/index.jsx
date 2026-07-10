import { TableCell, TableRow, TableSortLabel } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import classNames from 'classnames';
import NoRecordFound from 'commonComponents/table/noRecordFound';
import React, { useRef } from 'react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { useHistory } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getUserDeals } from 'services/deal.service';
import { getCompaniesOption } from 'services/location.service';
import CustomDropDown from 'src/app/components/common/customDropDown';
import MoreFilterDrawer from 'src/app/components/common/moreFilterDrawer/index.jsx';
import SearchComponentWithQuery from 'src/app/components/common/searchWithQuery';
import TableSkeleton from 'src/app/components/common/skeletonLoader/tableSkeleton';
import TableComponent from 'src/app/components/common/table';
import { locationDrawerTypes } from 'src/app/components/salesComponents/locations/newLocationsDrawer/location.constant';
import { SALES_DEAL } from 'src/app/router/constant/ROUTE.jsx';
import { MoreFilter } from 'src/assets/svg';
import { useApiControllers } from 'src/helper/axios';
import { deepEqual, removeKeysFromObject } from 'src/helper/utilityFunctions';
import { getDisplayConfiguration } from 'src/redux/store/slices/regionalCountryConfiguration';
import transformArrayForOptions from 'src/utils/array/transformArrayForOptions';
import { paginationOptions, toastSettings } from 'src/utils/constants';
import { companiesPaginationEmptyState } from 'src/utils/constants/emptyStates/companiesPagination.js';
import { KEY } from 'src/utils/constants/events/keyPressEvents';
import { extractValuesByKeyFromInput } from 'src/utils/dropdownValueExtractor';

import { stageValues } from '../../deals/dealStages/stage.constant.js';
import { useStyles } from './dealsStyles.js';

const i18ColumnName = (t) => {
  return [
    { id: 'hsId', label: `${t('sales.users.dealsListingId')}`, sortable: false },
    {
      id: 'name', //user name
      label: `${t('sales.users.dealsListingName')}`,
      sortable: false,
      hasImage: false,
    },
    {
      id: 'amount', //user name
      label: `${t('sales.users.dealsListingAmount')}`,
      sortable: false,
      hasImage: false,
    },
    {
      id: 'owner', //user name
      label: `${t('sales.users.dealsListingOwner')}`,
      sortable: false,
      hasImage: true,
    },
    {
      id: 'stage', //user name
      label: `${t('sales.users.dealsListingStage')}`,
      sortable: false,
      hasImage: false,
    },
    {
      id: 'associatedFranchise', // designation of the user
      label: `${t('sales.users.dealsListingAssociatedFranchise')}`,
      sortable: false,
    },
    {
      id: 'location', // department of the user
      label: `${t('sales.users.dealsListingLocation')}`,
      sortable: false,
    },
    {
      id: 'address', // phoneNumber of the user displayed as contact
      label: `${t('sales.users.dealsListingAddress')}`,
      sortable: false,
    },
    {
      id: 'postalCode',
      label: `${t('sales.users.dealsListingPostalCode')}`,
      sortable: false,
    },
    {
      id: 'city', // date of birth of the user
      label: `${t('sales.users.dealsListingCity')}`,
      sortable: false,
    },
    {
      id: 'state', // account status of the user
      label: `${t('sales.users.dealsListingState')}`,
      sortable: false,
    },
    {
      id: 'industry',
      label: `${t('sales.users.dealsListingIndustry')}`,
      sortable: false,
    },
  ];
};

const emptyState = {
  parentCompanies: [],
  associatedCompanies: [],
  associatedCompanyIds: [],
  parentCompanyIds: [],
  // assignedTo: [],
  postalCode: '',
  postalCodes: [],
  hsId: '',
  states: [],
  cities: [],
};
const stageFilter = [
  // { value: 'all', label: 'All Deals', enumId: undefined },
  { value: 'proposalCreation', label: 'Proposal Creation', enumId: 0 },
  { value: 'proposalDelivered', label: 'Proposal Delivered', enumId: 1 },
  { value: 'closedLost', label: 'Closed Lost', enumId: 2 },
  { value: 'closedWon', label: 'Closed Won', enumId: 3 },
];

// const userSortByFilter = [
//   { value: 'all', label: 'All Users' },
//   { value: 'byDesignation', label: 'By Designation' },
//   { value: 'byDepartment', label: 'By Department' },
//   { value: 'byJoiningDate', label: 'By Joining Date' },
// ];

const params = {
  pageNo: paginationOptions.defaultPerPage,
  rowsPerPage: paginationOptions.perPageRows,
  search: '',
  sortBy: '',
  orderBy: '',
  stages: [],

  // More filters params can be assigned like this too. Uncomment this if it is suites you
  ...emptyState,
};

const order = {
  orderBy: 'id',
  orderType: 'asc',
};

const columnIdsEnum = {
  id: 'hsId',
  name: 'name',
  stage: 'stage',
  postalCode: 'postalCode',
  businessWon: 'businessWon',
  city: 'city',
  state: 'state',
  image: 'image',
  owner: 'owner',
  address: 'address',
  amount: 'amount',
  industry: 'industry',
};
function DealsTab() {
  const { t } = useTranslation();
  const { id: userId } = useParams();
  const classes = useStyles();
  const { symbol } = useSelector(getDisplayConfiguration);
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
    parentCompanyIds: [],
    assignedTo: [],
  });

  const history = useHistory();

  const previousSearchText = useRef(null);

  const [loadingCompaniesDropDown, setLoadingCompaniesDropDown] = useState(false);

  const { getNewApiController } = useApiControllers();

  const columns = i18ColumnName(t);
  const [moreFilterState, setmoreFilterState] = useState({
    right: false,
  });

  useEffect(() => {
    fetchDeals(queryParams);
    if (companies?.length < 1) fetchCompanies();
  }, [queryParams]);
  const toggleFiltersDrawer = (anchor, open) => (event) => {
    if (event.type === KEY.UP && (event.key === KEY.TAB || event.key === KEY.SHIFT)) {
      return;
    }
    setmoreFilterState({ ...moreFilterState, [anchor]: open });
  };
  const filterCloseDrawer = (anchor) => {
    setmoreFilterState({ ...moreFilterState, [anchor]: false });
  };

  const fetchDeals = async (queryParams) => {
    setLoading(true);
    try {
      let params = {
        ...queryParams,
        stateIds: extractValuesByKeyFromInput(queryParams.states, 'value'),
        cityIds: extractValuesByKeyFromInput(queryParams.cities, 'value'),
        stage:
          extractValuesByKeyFromInput(queryParams.stages, 'value') !== 'all'
            ? extractValuesByKeyFromInput(queryParams.stages, 'value')
            : [],
      };

      params = removeKeysFromObject(params, [
        'states',
        'cities',
        'stages',
        'parentCompanies',
        'associatedCompanies',
      ]);

      const response = await getUserDeals(userId, params);
      if (response && response?.statusCode === 200) {
        setData(response?.data?.deals || []);
        const total = response?.pagination?.totalCount;
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
    if (column.id === columnIdsEnum.stage) {
      let stageColorClass = '';
      if (row[column.id]?.value === stageValues.PROPOSAL_CREATION) {
        stageColorClass = classes.newLocationColor;
      } else if (row[column.id]?.value === stageValues.NEGOTIATION) {
        stageColorClass = classes.qualifiedColor;
      } else if (row[column.id]?.value === stageValues.CLOSED_LOST) {
        stageColorClass = classes.UnQualifiedColor;
      } else if (row[column.id]?.value === stageValues.CLOSED_WON) {
        stageColorClass = classes.workingColor;
      } else if (row[column.id]?.value === stageValues.TERMINATED) {
        stageColorClass = classes.nurturingColor;
      } else if (row[column.id]?.value === stageValues.EXPIRED) {
        stageColorClass = classes.nurturingColor;
      } else {
        stageColorClass = stageValues.OTHERS;
      }

      return (
        <Box component="span" className={classNames(classes.commonStageColor, stageColorClass)}>
          {row[column.id]?.label}
        </Box>
      );
    }

    if (column.id === columnIdsEnum.industry) {
      return <>{row[column.id]?.label || NA}</>;
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

    if (column.id === columnIdsEnum.owner) {
      return <>{row?.owner?.name || NA}</>;
    }

    if (column.id === columnIdsEnum.address) {
      return <>{`${row?.address?.addressLine1} ${row?.address?.addressLine2 ?? ''}` || NA}</>;
    }

    if (column.id === columnIdsEnum.postalCode) {
      return <>{row?.address?.postalCode || NA}</>;
    }

    if (column.id === columnIdsEnum.city) {
      return <>{`${row?.address?.city}` || NA}</>;
    }

    if (column.id === columnIdsEnum.state) {
      return <>{`${row?.address?.state}` || NA}</>;
    }
    if (column.id === columnIdsEnum.id) return <>{row[column.id] ? `#${row[column.id]}` : NA}</>;
    if (column.id === columnIdsEnum.amount)
      return <>{row[column.id] ? `${symbol}${row[column.id]}` : NA}</>;
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
    history.push(`${SALES_DEAL}/${rowId}`);
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
                const showHandCursor = column.id === columnIdsEnum.id ? 'pointer' : '';
                return (
                  <TableCell
                    key={column.id}
                    onClick={() => column.id === columnIdsEnum.id && goToDetail(row?.id)}
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

  const _gotoDetailPage = (column, _rowId) => {
    if (column.id === columnIdsEnum.name) {
      // history.push(''); // goto user detail page ? not yet designed
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
    // setFormData(updatedFormData);
    // setPage(0);
    // const params = {
    //   page: page + 1,
    //   query: updatedFormData,
    // };
    // refreshLocation && fetchLocations(params);
    // setmoreFilterState({ ...moreFilterState });

    if (!deepEqual(formData, emptyState)) {
      // refreshLocation = false;
      setFormData(emptyState);
      setQueryParams((prev) => ({
        page: paginationOptions.defaultPerPage,
        ...prev,
        ...emptyState,
      }));
      setmoreFilterState({ ...moreFilterState });
    }

    // setQueryParams((prev) => ({
    //   pageNo: paginationOptions.defaultPerPage,
    //   ...prev,
    //   ...emptyState,
    // }));
  };
  const applyFilters = (query) => {
    // Create a new object with status from formData and other fields from emptyState
    // const updatedFormData = {
    //   ...query,
    //   status: formData.status,
    // };
    //
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
            placeHolder={`${t('sales.users.searchByLocationID')}`}
            value={queryParams?.search}
            onSearch={inputChangedHandler}
          />
          <Box className={classes.dropdownCommonSection}>
            <CustomDropDown
              label={t('sales.users.dealsStages')}
              name="stages"
              options={transformArrayForOptions(stageFilter, 'label', 'enumId')}
              selectedValues={queryParams.stages}
              handleChange={inputChangedHandler}
              clearAll
              disabled={false}
              multiSelect
              // checkmark
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
                isDealDrawer={true}
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
          totalRecords={totalRows}
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

export default DealsTab;
