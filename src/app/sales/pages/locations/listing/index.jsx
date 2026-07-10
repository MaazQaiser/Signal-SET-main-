import {
  Box,
  Button,
  Checkbox,
  Chip,
  Drawer,
  Stack,
  TableCell,
  TableRow,
  TableSortLabel,
  Tooltip,
  Typography,
} from '@mui/material';
import { useJsApiLoader } from '@react-google-maps/api';
import { ReactComponent as ChevronRight } from 'assets/svg/chevron-right.svg';
import { ReactComponent as GraphCollapseIconUpward } from 'assets/svg/collapse-upward-icon.svg';
import { ReactComponent as RepeatIcon } from 'assets/svg/repeat.svg';
import classNames from 'classnames';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { locationAffiliationChipColors } from 'salesComponents/constant/exportEntities.constant';
import CustomDropDown from 'src/app/components/common/customDropDown';
// import BarChart from 'src/app/components/common/eBarChart';
import LineToolTouchChart from 'src/app/components/common/eLineToolTouchChart';
import PieChart from 'src/app/components/common/ePieChart';
import SearchComponentWithQuery from 'src/app/components/common/searchWithQuery';
// import BarChartSkeleton from 'src/app/components/common/skeletonLoader/barChartSkeleton';
import LineChartSkeleton from 'src/app/components/common/skeletonLoader/lineChartSkeleton';
import PieChartSkeleton from 'src/app/components/common/skeletonLoader/pieChartSkeleton';
import TableSkeleton from 'src/app/components/common/skeletonLoader/tableSkeleton';
import TableComponent from 'src/app/components/common/table';
import NoRecordFound from 'src/app/components/common/table/noRecordFound';
import TableImage from 'src/app/components/common/tableImage';
import BulkDrawer from 'src/app/components/salesComponents/components/sideDrawer';
import ApproveLocationDrawer from 'src/app/components/salesComponents/locations/approveLocation';
import MoreFiltersDrawer from 'src/app/components/salesComponents/locations/moreFiltersDrawer';
import NewLocationDrawer from 'src/app/components/salesComponents/locations/newLocationsDrawer';
import {
  getLocationFilterOptions,
  locationDrawerTypes,
  locationFilterStatus,
  locationSortingTypes,
  locationStatusFilterOptions,
} from 'src/app/components/salesComponents/locations/newLocationsDrawer/location.constant';
import { SALES_LOCATION, SALES_LOCATIONS_REVIEWS } from 'src/app/router/constant/ROUTE';
import history from 'src/app/router/utils/history';
import { AddIcon, MoreFilter } from 'src/assets/svg';
import { ReactComponent as CheckBoxRegularIcon } from 'src/assets/svg/checkbox.svg';
import { ReactComponent as CheckBoxCheckedIcon } from 'src/assets/svg/checkbox-checked.svg';
import { useApiControllers } from 'src/helper/axios';
import { formatDate } from 'src/helper/utilityFunctions';
import {
  deepEqual,
  // transformBarChartData,
  transformPieChartData,
} from 'src/helper/utilityFunctions';
import {
  getCompaniesOption,
  getLocations,
  getLocationsCumulativeStats,
  getLocationsYearlyStats,
} from 'src/services/location.service';
import { defaultImage, paginationOptions, toastSettings } from 'src/utils/constants';
import { companiesPaginationEmptyState } from 'src/utils/constants/emptyStates/companiesPagination';
import { KEY } from 'src/utils/constants/events/keyPressEvents';
import {
  fomatNumbersWithCommas,
  formatCurrencyWithCommasAndSuffix,
} from 'src/utils/currencyFormater';
import { formatISOTimestampToDate } from 'src/utils/date';
import { capitalizeFirstLetter } from 'src/utils/string/common';
/**
 * library functionalities for Google Maps
 */
const libraries = ['places', 'drawing', 'geometry'];

import { useSelector } from 'react-redux';
import { stageValues } from 'src/app/components/salesComponents/locations/locationStages/stage.constant';
import {
  ACL_PROPERTIES_CREATE,
  ACL_PROPERTIES_UPDATE,
  ACL_PROPERTY_REVIEW_VIEW,
} from 'src/app/router/constant/SALESMODULE';
import RenderIfHasPermission from 'src/hoc/renderIfHasPermission';
import { getDisplayConfiguration } from 'src/redux/store/slices/regionalCountryConfiguration';

import { useStyles } from './listingStyles';
import { locationStages, locationTypes } from './locations.constant.js';
import { _Stages, QualifiedLocations } from './stubbedData';

const perPage = paginationOptions.perPageRows;

const i18ColumnName = (t, classLocationName, textCapitalize) => {
  return [
    {
      id: 'checkbox',
      label: ``,
    },
    // Commented Id columns because of client feedback SSE-3180
    // {
    //   id: 'hubspotId',
    //   label: `${t('sales.locations.id')}`,
    //   sortable: true,
    // },
    {
      id: 'locationName',
      label: `${t('sales.locations.locationName')}`,
      className: classLocationName,
      sortable: true,
    },
    {
      id: 'locationAffiliation',
      label: `${t('sales.locations.locationAffiliation')}`,
      className: textCapitalize,
      // sortable: true,
    },
    // {
    //   id: 'companyName',
    //   label: `${t('sales.locations.companyName')}`,
    //   className: textCapitalize,
    // },
    // {
    //   id: 'parentCompany',
    //   label: `${t('sales.locations.parentCompany')}`,
    //   className: textCapitalize,
    // },
    {
      id: 'lotNumber',
      label: `${t('sales.locations.lotNumber')}`,
      className: textCapitalize,
    },
    {
      id: 'dealsCount',
      label: `${t('sales.locations.dealCount')}`,
      className: textCapitalize,
    },
    {
      id: 'country',
      label: `${t('sales.locations.country')}`,
      className: textCapitalize,
    },
    {
      id: 'state',
      label: `${t('sales.locations.state')}`,
      className: textCapitalize,
    },
    {
      id: 'city',
      label: `${t('sales.locations.city')}`,
      className: textCapitalize,
    },
    {
      id: 'fullAddress',
      label: `${t('sales.locations.address')}`,
    },
    // Commented on Ahsan Awan request
    // {
    //   id: 'score',
    //   label: `${t('sales.locations.score%')}`,
    //   sortable: true,
    // },
    {
      id: 'postalCode',
      label: `${t('sales.locations.postalCode')}`,
    },
    {
      id: 'stage',
      label: `${t('sales.locations.stage')}`,
      sortable: true,
    },
    // {
    //   id: 'industry',
    //   label: `${t('sales.locations.industry')}`,
    // },
    {
      id: 'type',
      label: `${t('sales.locations.type')}`,
      sortable: true,
    },
    // removed as per new design.
    // {
    //   id: 'contactName',
    //   label: `${t('sales.locations.contactName')}`,
    // },
    {
      id: 'assignedUserName',
      label: `${t('sales.locations.assignedUserName')}`,
      hasImage: true,
      className: textCapitalize,
    },
    {
      id: 'franchiseName',
      label: `${t('sales.locations.nearbyFrenchise')}`,
      sortable: true,
    },
    {
      id: 'createDate',
      label: t('sales.locations.createDate'),
      sortable: true,
    },
    {
      id: 'hsLastmodifieddate',
      label: t('sales.locations.lastModify'),
      sortable: true,
    },
  ];
};

const emptyState = {
  associatedCompanyIds: [],
  parentCompanyIds: [],
  parentCompany: [],
  assignedTo: [],
  assigned: { value: null },
  postalCodes: [],
  // postalCode: '',
  hsId: '',
  states: [],
  cities: [],
  country: '',
  countryCode: '',
  locationType: {},
  stage: {},
  source: {},
  site: {},
  score: {},
  minUnits: '',
  maxUnits: '',

  locationAffiliation: {},
  lotNumber: '',
  status: locationStatusFilterOptions[0],

  createdDate: [null, null],
  hsLastmodifieddate: [null, null],
};

// const params = {
//   search: '',
//   devicesFilterSelectedValue: {},
//   zonesFilterSelectedValue: [],
//   sitesFilterSelectedValue: [],
//   sortBy: '',
//   orderBy: '',
// };

const order = {
  orderBy: 'id',
  orderType: 'asc',
};

const columnIdsEnum = {
  stage: 'stage',
  assignedTo: 'assignedUserName',
  companyAmount: 'companyAmount',
  hubspotLeadId: 'hubspotLeadId',
  locationName: 'locationName',
  address: 'fullAddress',
  companyName: 'companyName',
  parentCompany: 'parentCompany',
  franchiseName: 'franchiseName',
  type: 'type',
  locationAffiliation: 'locationAffiliation',
  scpre: 'score',
  createdDate: 'createDate',
  lastModifiedDate: 'hsLastmodifieddate',
};

const emptyStatePagination = { currentPage: 0, totalCount: 0, rowsPerPage: 10 };

const LocationsListing = () => {
  const classes = useStyles();
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries,
  });
  const { t } = useTranslation();
  const location = useLocation();
  const { dateFormat } = useSelector(getDisplayConfiguration);
  const searchParams = new URLSearchParams(location.search);
  const locationStatus = searchParams.get('status');

  const NA = t('commonText.nA');
  const classLocationName = classes.locationTD;
  const textCapitalize = classes.textCapitalize;
  const columns = i18ColumnName(t, classLocationName, textCapitalize);
  const [data, setData] = useState([]);
  const { getNewApiController } = useApiControllers();
  const [formData, setFormData] = useState(emptyState);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [bulkOperationPerformed, setBulkOperationPerformed] = useState(0);
  const [pagination, setPagination] = useState(emptyStatePagination);
  const [counts, setCounts] = useState({});
  const [selectAll, setSelectAll] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [companiesPagination, setCompaniesPagination] = useState(companiesPaginationEmptyState);
  const [orderState, setOrderState] = useState(order);
  // const [_queryParams, setQueryParams] = useState(params);
  const [selectedItems, setSelectedItems] = useState([]);
  const [_stats, setStats] = useState({});
  const [graphs, setGraphs] = useState({
    pieChartData: [],
    barChartData: [],
    lineToolChart: {},
  });
  const [companiesFilters, setCompaniesFilters] = useState({
    associatedCompanyIds: [],
    parentCompanyIds: [],
    assignedTo: [],
  });

  const [searchValue, setSearchValue] = useState('');
  const [moreFilterState, setmoreFilterState] = useState({
    right: false,
  });
  const [loadingPieGraph, setLoadingPieGraph] = useState(true);
  const [loadingLineGraph, setLoadingLineGraph] = useState(true);
  const [graphCollapse, setGraphCollapse] = useState(false);
  const [loadingCompaniesDropDown, setLoadingCompaniesDropDown] = useState(false);

  const previousSearchText = useRef(null);

  const handleSelectAllChange = (event) => {
    const isChecked = event.target.checked;
    setSelectAll(isChecked);

    if (isChecked) {
      /**
       * If "Select All" is checked, select all items
       */
      setSelectedItems(data.map((row) => row.id));
      return; // Return early
    }
    /**
     * If "Select All" is unchecked, clear selected items
     */
    setSelectedItems([]);
  };

  const handleCheckboxChange = (event, id) => {
    if (event.target.checked) {
      /**
       * If the checkbox is checked
       * add the item to the selectedItems array
       */
      const updatedSelectedItems = [...selectedItems, id];
      setSelectedItems(updatedSelectedItems);

      setSelectAll(updatedSelectedItems.length === data.length);
      return; // Return early
    }
    /**
     * If the checkbox is unchecked
     * remove the item from the selectedItems  array
     */
    setSelectedItems(selectedItems.filter((item) => item !== id));
    setSelectAll(false);
  };

  const handleChangePage = async (_, newPage) => {
    /**
     * update pagination object
     */
    setPagination((prev) => ({
      ...prev,
      currentPage: newPage + 1,
    }));
    //remove selected items of current page
    setSelectAll(false);
    setSelectedItems([]);

    /**
     * API call to get next page items for location
     */
    const params = {
      page: newPage + 1,
      rowsPerPage: pagination.rowsPerPage,
      query: { ...formData },
    };
    await fetchLocations(params);
  };

  /**
   * @description function recieve follow-up date and return a icon with tooltip
   * @param {*} followUpDate
   * @returns
   */
  const renderFollowUpIcon = (followUpDate) => {
    if (!followUpDate) return null;

    return (
      <Box className={classes.repeatIcon}>
        <Tooltip
          title={`${t('sales.locations.followUp')}  ${formatISOTimestampToDate(followUpDate)}`}
          arrow
          placement="top"
          slotProps={{
            popper: {
              modifiers: [
                {
                  name: 'offset',
                  options: {
                    offset: [0, -14],
                  },
                },
              ],
            },
          }}
        >
          <RepeatIcon />
        </Tooltip>
      </Box>
    );
  };

  const renderTableCell = (row, column) => {
    /**
     * This condition is only for name column
     * this will display follow-up icon with NA if location name is missing
     */
    if (!row[column.id] && column.id === columnIdsEnum.locationName && row?.followUpDate) {
      return (
        <Box className={classes.inlineContent}>
          <Box className={classes.emptS}>{t('commonText.nA')}</Box>
          {renderFollowUpIcon(row?.followUpDate)}
        </Box>
      );
    }

    /**
     * show 'NA' if there is no value
     */
    if (!row[column.id]) {
      return <Box className={classes.emptS}>{t('commonText.nA')}</Box>;
    }

    if (column.id === columnIdsEnum.locationName) {
      return (
        <Box className={classes.locationName}>
          <Box className={classes.locationNameText}>
            {row[column.id].length > 24 ? (
              <Tooltip
                slotProps={{
                  popper: {
                    modifiers: [
                      {
                        name: 'offset',
                        options: {
                          offset: [0, -14],
                        },
                      },
                    ],
                  },
                }}
                title={capitalizeFirstLetter(row[column.id])}
                arrow
              >
                <Box>{capitalizeFirstLetter(row[column.id]).substring(0, 24) + '...'}</Box>
              </Tooltip>
            ) : (
              <>{capitalizeFirstLetter(row[column.id]) || NA}</>
            )}
            {row?.followUpDate && renderFollowUpIcon(row?.followUpDate)}
          </Box>

          <Box className={classes.locationNameIcon}>
            <ChevronRight />
          </Box>
        </Box>
      );
    }

    /**
     * color selection for location type column
     */
    if (column.id === columnIdsEnum.locationAffiliation) {
      return (
        <Box className={classes.chipsWrapper}>
          {row?.locationAffiliation?.length
            ? row?.locationAffiliation?.map((loc, index) => (
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
        </Box>
      );
    }

    if (column.id === columnIdsEnum.stage) {
      let stageColorClass = '';
      if (row[column.id]?.value === stageValues.APPROVED) {
        stageColorClass = classes.approvedLocationColor;
      } else if (row[column.id]?.value === stageValues.DISCOVERY) {
        stageColorClass = classes.discoveryColor;
      } else if (row[column.id]?.value === stageValues.QUALIFIED) {
        stageColorClass = classes.qualifiedColor;
      } else if (row[column.id]?.value === stageValues.NEEDS_ASSESSMENT) {
        stageColorClass = classes.needAssesmentColor;
      } else if (row[column.id]?.value === stageValues.NEGOTIATION) {
        stageColorClass = classes.negotiationColor;
      } else if (row[column.id]?.value === stageValues.CURRENT_CUSTOMER) {
        stageColorClass = classes.currentCustomer;
      } else if (row[column.id]?.value === stageValues.LOST_PROPOSAL) {
        stageColorClass = classes.lostColor;
      } else if (row[column.id]?.value === stageValues.LOST_CUSTOMER) {
        stageColorClass = classes.lostColor;
      } else if (row[column.id]?.value === stageValues.NURTURE) {
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

    if (column.id === columnIdsEnum.createdDate || column.id === columnIdsEnum.lastModifiedDate)
      return <>{formatDate(row[column.id], dateFormat) || NA}</>;

    /**
     * color selection for location type column
     */
    if (column.id === columnIdsEnum.type) {
      let stageColorClass = '';
      if (row[column.id]?.value === locationTypes.NEW) {
        stageColorClass = classes.newLocationColor;
      } else if (row[column.id]?.value === locationTypes.EXISTING) {
        stageColorClass = classes.eixstingColor;
      } else if (row[column.id]?.value === locationTypes.OLD) {
        stageColorClass = classes.oldLocationColor;
      } else if (row[column.id]?.value === locationTypes.LOST) {
        stageColorClass = classes.lostColor;
      } else {
        stageColorClass = classes.OTHERS;
      }

      return (
        <Box component="span" className={classNames(classes.commonStageColor, stageColorClass)}>
          {row[column.id].label}
        </Box>
      );
    }

    if (column.id === columnIdsEnum.assignedTo) {
      return row[column.id] ? (
        <Stack className={classes.assignToClass} component="div">
          <TableImage className={classes.assignAvatar} imageUrl={row.image || defaultImage} />
          <Box component="span" className={classes.assignToText}>
            {row[column.id]}
          </Box>
        </Stack>
      ) : (
        <Box>{NA}</Box>
      );
    }
    if (column.id === columnIdsEnum.companyAmount) {
      return <Box>$ {fomatNumbersWithCommas(row[column.id])}</Box>;
    }

    if (column.id === columnIdsEnum.address) {
      if (row[column.id].length > 40)
        return (
          <Tooltip title={row[column.id]} arrow>
            {row[column.id].substring(0, 40) + '...'}
          </Tooltip>
        );
      return row[column.id];
    }

    if (column.id === columnIdsEnum.companyAmount) {
      return <Box>{row[column.id]}%</Box>;
    }

    if (
      column.id === columnIdsEnum.companyName ||
      column.id === columnIdsEnum.parentCompany ||
      column.id === columnIdsEnum.franchiseName
    ) {
      return <>{capitalizeFirstLetter(row[column.id]) || NA}</>;
    }

    if (column.id === columnIdsEnum.hubspotLeadId) return <>#{row[column.id]}</>;
    return <>{row[column.id]}</>;
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
    return orderState.orderBy === column.id ? orderState.orderType : locationSortingTypes.ASC;
  };

  const handleSort = (columnId) => {
    const isAsc = orderState.orderType === 'asc';
    setOrderState({
      orderBy: columnId,
      orderType: isAsc ? 'desc' : 'asc',
    });
    applySorting(columnId, orderState.orderType);
  };

  const applySorting = (sortBy, orderBy) => {
    setFormData((prev) => ({
      ...prev,
      sortBy: sortBy,
      orderBy: orderBy,
    }));
    const params = {
      page: 1,
      rowsPerPage: pagination.rowsPerPage,
      query: { ...formData, sortBy: sortBy, orderBy: orderBy },
    };
    fetchLocations(params);
  };

  const [state, setState] = useState({
    right: false,
  });
  const togglebulkDrawer = (anchor, open) => (event) => {
    if (event.type === KEY.UP && (event.key === KEY.TAB || event.key === KEY.SHIFT)) {
      return;
    }
    setState({ ...state, [anchor]: open });
  };
  const bulkCloseDrawer = (anchor) => {
    setState({ ...state, [anchor]: false });
  };

  const [locationState, setLocationState] = useState({
    right: false,
  });
  const toggleDrawerLocation = (anchor, open) => (event) => {
    if (event.type === KEY.UP && (event.key === KEY.TAB || event.key === KEY.SHIFT)) {
      return;
    }
    setLocationState({ ...locationState, [anchor]: open });
  };
  const locationCloseDrawer = (anchor) => {
    setLocationState({ ...locationState, [anchor]: false });
  };

  const toggleFiltersDrawer = (anchor, open) => (event) => {
    if (event.type === KEY.UP && (event.key === KEY.TAB || event.key === KEY.SHIFT)) {
      return;
    }
    setmoreFilterState({ ...moreFilterState, [anchor]: open });
  };

  const filterCloseDrawer = (anchor) => {
    setmoreFilterState({ ...moreFilterState, [anchor]: false });
  };

  const [openApproveLocationDrawer, setOpenApproveLocationDrawer] = useState({
    right: false,
    locationData: null,
  });
  const toggleDrawerApproveLocation = (anchor, open, locationData) => (event) => {
    if (event.type === KEY.UP && (event.key === KEY.TAB || event.key === KEY.SHIFT)) {
      return;
    }
    setOpenApproveLocationDrawer({ ...openApproveLocationDrawer, [anchor]: open, locationData });
  };
  const approveLocationCloseDrawer = (anchor) => {
    setOpenApproveLocationDrawer({
      ...openApproveLocationDrawer,
      [anchor]: false,
    });
  };

  const handleMultipleSelectedValues = async (event, field) => {
    setFormData((prevState) => ({
      ...prevState,
      [field]: event.target.value,
    }));
  };

  /**
   * clear all filters and refetch the data
   */
  const handleClearFilters = () => {
    // Create a new object with status from formData and other fields from emptyState
    let refreshLocation = true;
    if (deepEqual(formData, emptyState)) {
      refreshLocation = false;
    }
    const updatedFormData = {
      ...emptyState,
      status: formData.status,
    };
    setFormData(updatedFormData);
    setPage(0);
    const params = {
      page: page + 1,
      rowsPerPage: pagination.rowsPerPage,
      query: updatedFormData,
    };
    refreshLocation && fetchLocations(params);
    setmoreFilterState({ ...moreFilterState });
  };

  const gotoLocationDetail = (column, rowId) => {
    if (column.id === columnIdsEnum.locationName) {
      history.push(`${SALES_LOCATION}/${rowId}`);
    }
  };

  const redirectToReviewLocations = () => {
    history.push(SALES_LOCATIONS_REVIEWS);
  };

  const tableHead = () => {
    return (
      <TableRow>
        {columns.map((column) =>
          !hasRejectedTab ? (
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
              ) : column.id === 'checkbox' ? (
                !hasRejectedTab && (
                  <Checkbox
                    checked={selectAll}
                    onChange={handleSelectAllChange}
                    icon={<CheckBoxRegularIcon />}
                    checkedIcon={<CheckBoxCheckedIcon />}
                    className={classes.checkBoxCustom}
                  />
                )
              ) : (
                `${column.label}`
              )}
            </TableCell>
          ) : (
            column.id !== 'checkbox' && (
              <TableCell key={column.id} sortDirection={sortDirection(column)}>
                {column.sortable ? (
                  <TableSortLabel
                    active={orderState.orderBy === column.id}
                    direction={orderDirection(column)}
                    onClick={() => handleSort(column.id)}
                  >
                    {column.label}
                  </TableSortLabel>
                ) : column.id === 'checkbox' ? (
                  !hasRejectedTab && (
                    <Checkbox
                      icon={<CheckBoxRegularIcon />}
                      checkedIcon={<CheckBoxCheckedIcon />}
                      className={classes.checkBoxCustom}
                      checked={selectAll}
                      onChange={handleSelectAllChange}
                    />
                  )
                ) : (
                  `${column.label}`
                )}
              </TableCell>
            )
          ),
        )}
      </TableRow>
    );
  };

  const tableBody = (data, columns) => {
    return loading ? (
      <TableSkeleton columns={columns} />
    ) : (
      <>
        <NoRecordFound
          data={data}
          noOfColumns={columns.length}
          t={t}
          text={t('sales.deals.noDeals')}
          description={t('sales.locations.locationsDataSync')}
        />
        {data.length > 0 &&
          data.map((row, rowIndex) => (
            <TableRow key={`${row.id}-${rowIndex}-${Date.now()}`}>
              {columns.map((column, columnIndex) =>
                column.id === columnIdsEnum.locationName ? (
                  <TableCell
                    onClick={(event) => {
                      if ([locationFilterStatus.REJECTED].includes(formData.status?.value)) {
                        toggleDrawerApproveLocation(locationDrawerTypes.RIGHT, true, row)(event);
                      } else gotoLocationDetail(column, row.id);
                    }}
                    key={`${row.id}-${column.id}-${columnIndex}-${Date.now()}`}
                    className={column.className}
                  >
                    {renderTableCell(row, column)}
                  </TableCell>
                ) : column.id === 'checkbox' ? (
                  !hasRejectedTab && (
                    <TableCell key={`${row.id}-${column.id}-${columnIndex}-${Date.now()}`}>
                      <Checkbox
                        checked={selectedItems.includes(row.id)}
                        onChange={(event) => handleCheckboxChange(event, row.id)}
                        icon={<CheckBoxRegularIcon />}
                        checkedIcon={<CheckBoxCheckedIcon />}
                        className={classes.checkBoxCustom}
                      />
                    </TableCell>
                  )
                ) : (
                  <TableCell
                    className={column.className}
                    key={`${row.id}-${column.id}-${columnIndex}-${Date.now()}`}
                  >
                    {renderTableCell(row, column)}
                  </TableCell>
                ),
              )}
            </TableRow>
          ))}
      </>
    );
  };

  /**
   * Fetch location listing
   * @param {*} page
   * @param {*} query
   */
  const fetchLocations = async ({ page, query, rowsPerPage = 10 }) => {
    // const apiController = getNewApiController();
    query = {
      ...query,
      createdDateStart: query?.createdDate?.[0] ? formatDate(query.createdDate?.[0]) : '',
      createdDateEnd: query?.createdDate?.[1] ? formatDate(query.createdDate?.[1]) : '',
      hsLastmodifieddateStart: query?.hsLastmodifieddate?.[0]
        ? formatDate(query.hsLastmodifieddate?.[0])
        : '',
      hsLastmodifieddateEnd: query?.hsLastmodifieddate?.[1]
        ? formatDate(query.hsLastmodifieddate?.[1])
        : '',
    };

    try {
      setLoading(true);
      const search = searchValue ? searchValue.search : '';

      const newQuery = { ...query };
      let cityIds = [];
      let stateIds = [];

      if (newQuery?.states?.length) stateIds = newQuery?.states.map((state) => state?.value);
      if (newQuery?.cities?.length) cityIds = newQuery?.cities.map((city) => city?.value);

      // Remove old keys
      delete newQuery.states;
      delete newQuery.cities;

      const updatedQuery = {
        ...newQuery,
        assigned: newQuery?.assigned?.value,
        status: newQuery?.status?.value,
        search,
        stateIds,
        cityIds,
        stage: newQuery?.stage?.id,
        score: newQuery?.score?.id,
        sites: newQuery?.site?.id,
        locationType: newQuery?.locationType?.id,
        parentCompanyIds: newQuery?.parentCompanyIds?.map((value) => value.value),
        associatedCompanyIds: newQuery?.associatedCompanyIds?.map((value) => value.value),
        locationAffiliation: newQuery?.locationAffiliation?.value,
        source: newQuery?.source?.value,
        associatedFranchise: newQuery?.associatedFranchise?.id,
      };

      // Remove unwanted keys
      delete updatedQuery.site;
      delete updatedQuery.industry;

      const response = await getLocations(page, rowsPerPage, updatedQuery);
      if (response?.statusCode === 200) {
        setData(response?.data?.locations);
        setPagination({
          ...response?.pagination,
          rowsPerPage: rowsPerPage,
        });
        setCounts(response?.data?.counts || {});
      }
      setLoading(false);
    } catch (error) {
      // if (!apiController.signal.aborted) {
      if (error?.message) {
        toast.error(error?.message, {
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
      }
      setLoading(false);
      // }
    }
  };

  const refetchLocations = () => {
    const params = {
      page: page + 1,
      rowsPerPage: pagination.rowsPerPage,
      query: formData,
    };
    fetchLocations(params);
  };

  const fetchLocationCumulativeData = async () => {
    setLoadingPieGraph(true);
    try {
      const response = await getLocationsCumulativeStats();
      if (response.statusCode === 200) {
        /**
         * key locationsBySource is replace with locationsByState
         */
        setStats(response?.data?.locationsByState);
        /**
         * PIECHART
         * Transform the data to match the format expected by ECharts
         * Transform data using helper functions
         */
        const pieChart = transformPieChartData(
          response?.data?.locationsByState.labels,
          response?.data?.locationsByState.values,
        );
        // Update pieChartData
        setGraphs((prevGraphs) => ({
          ...prevGraphs,
          pieChartData: {
            ...pieChart,
            colors: response?.data?.locationsByState?.colors, // Adding an array for colors
          },
        }));

        /**
         * PIECHART
         * Transform the data to match the format expected by ECharts
         * Transform data using helper functions
         */
        const pieChart2 = transformPieChartData(
          response?.data?.locationsByStage.labels,
          response?.data?.locationsByStage.values,
        );
        // Update pieChartData
        setGraphs((prevGraphs) => ({
          ...prevGraphs,
          barChartData: {
            ...pieChart2,
            colors: response?.data?.locationsByStage?.colors, // Adding an array for colors
          },
        }));

        /**
         * Bar chart
         */
        // const barChart = transformBarChartData(
        //   response?.data?.locationsByStage?.labels,
        //   response?.data?.locationsByStage?.values,
        // );
        // Update pieChartData
        // setGraphs((prevGraphs) => ({
        //   ...prevGraphs,
        //   barChartData: {
        //     ...barChart,
        //     colors: response?.data?.locationsByStage?.colors, // Adding an array for colors
        //   },
        // }));
      }
      setLoadingPieGraph(false);
    } catch (error) {
      /**
       * show error in the corresponding field
       * parse errors in array format and set them in errorMessages
       * setErrorMessages(error)
       */
      toast.error(error?.message, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    } finally {
      setLoadingPieGraph(false);
    }
  };

  const fetchLocationsYearlyData = async () => {
    setLoadingLineGraph(true);
    try {
      const response = await getLocationsYearlyStats();

      if (response.statusCode === 200) {
        const { months, values } = response?.data?.stats ?? [];
        const data = { [t('sales.locations.locations')]: values };
        // Update pieChartData
        setGraphs((prevGraphs) => ({
          ...prevGraphs,
          lineToolChart: { dataLabels: months, data: data },
        }));
      }

      setLoadingLineGraph(false);
    } catch (error) {
      /**
       * show error in the corresponding field
       * parse errors in array format and set them in errorMessages
       * setErrorMessages(error)
       */
      toast.error(error?.message, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    } finally {
      setLoadingLineGraph(false);
    }
  };

  const handleSearch = (event) => {
    setSearchValue((prevState) => ({ ...prevState, search: event.target.value }));
  };

  const applyFilters = (query) => {
    // Create a new object with status from formData and other fields from emptyState
    const updatedFormData = {
      ...query,
      status: formData.status,
    };

    setPage(0);
    const params = {
      page: 1,
      rowsPerPage: pagination.rowsPerPage,
      query: updatedFormData,
    };
    fetchLocations(params);
  };

  /**
   * Fetch companies listing
   */
  const fetchCompanies = async (refetch = false, search) => {
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
          setCompanies((prevCompanies) => [...prevCompanies, ...response.data.companies]);
        } else {
          setCompanies(response?.data?.companies);
        }
        // setCompanies(response?.data?.companies);
        setCompaniesPagination(response?.pagination);
        previousSearchText.current = search;
      }
      setLoadingCompaniesDropDown(false);
    } catch (error) {
      if (!apiController.signal.aborted) {
        setLoadingCompaniesDropDown(false);
        toast.error(error?.message, {
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
      }
    }
  };

  useEffect(() => {
    const params = {
      page: 1,
      rowsPerPage: pagination.rowsPerPage,
      query: formData,
    };
    fetchLocations(params);
  }, [
    searchValue,
    formData.assigned,
    formData.status,
    formData.locationAffiliation,
    bulkOperationPerformed,
  ]);

  useEffect(() => {
    // Wrap each function call in Promise.resolve to ensure they return promises
    const promises = [
      Promise.resolve(fetchLocationCumulativeData()),
      Promise.resolve(fetchLocationsYearlyData()),
      Promise.resolve(fetchCompanies()),
    ];

    Promise.allSettled(promises);
  }, []);

  const locationFilterOptionsList = useMemo(() => getLocationFilterOptions(t), [t]);
  const memoizedSelectedLocation = useMemo(() => {
    return (
      locationFilterOptionsList.find((option) => option.value === formData.assigned?.value) ??
      locationFilterOptionsList[0]
    );
  }, [locationFilterOptionsList, formData.assigned?.value]);

  const updateBulkOperationPerformed = () => setBulkOperationPerformed(bulkOperationPerformed + 1);

  const transformFilters = (filters, companyFilters, resolvedAssignedOption) => {
    const modifiedFilters = { ...filters };
    modifiedFilters.parentCompanyIds = companyFilters.parentCompanyIds;
    modifiedFilters.associatedCompanyIds = companyFilters.associatedCompanyIds;
    modifiedFilters.assignedTo = companyFilters.assignedTo;
    if (resolvedAssignedOption) {
      modifiedFilters.assigned = resolvedAssignedOption;
    }
    modifiedFilters.createdDate = filters.createdDate.filter(Boolean).map((date) => ({
      label: formatDate(date, dateFormat),
      value: date?.toString(),
    }));
    modifiedFilters.hsLastmodifieddate = filters.hsLastmodifieddate.filter(Boolean).map((date) => ({
      label: formatDate(date, dateFormat),
      value: date?.toString(),
    }));
    return modifiedFilters;
  };

  const onChangeRowsPerPage = async (event) => {
    /**
     * update pagination object
     */
    setPagination((prev) => ({
      ...prev,
      currentPage: 1,
      rowsPerPage: event.target.value,
    }));
    setPage(pagination.currentPage);
    //remove selected items of current page
    setSelectAll(false);
    setSelectedItems([]);

    /**
     * API call to get next page items for location
     */
    const params = {
      page: 1,
      rowsPerPage: event.target.value,
      query: formData,
    };
    await fetchLocations(params);
  };

  const hasRejectedTab = formData.status?.value === locationFilterStatus.REJECTED;

  const locationStatusOptions = useMemo(() => {
    const safeCounts = counts || {};
    return locationStatusFilterOptions(t).map((option) => ({
      ...option,
      label: `${option.label} (${safeCounts[option.id] || 0})`,
    }));
  }, [counts, t]);

  /**
   * Handle query params from notification redirect
   * if status exist in query params from notification redirect
   * it will be default redirect to that specific tab
   */
  useEffect(() => {
    if (locationStatus)
      setFormData((prevState) => ({ ...prevState, status: parseInt(locationStatus) }));
  }, [location?.search]);

  return (
    <Box className={classes.locationWrapper}>
      {/* {loading && <LoaderComponent size={50} color={'primary'} label={'Loading'} />} */}

      <Box className={!graphCollapse ? classes.mainWrapper : classes.graphHide}>
        {loadingPieGraph ? (
          <Box className={classes.pieChartSkeletonWrapper}>
            <PieChartSkeleton
              legendCount={2}
              title={t('sales.locations.locations')}
              isValue={true}
            />
          </Box>
        ) : (
          <Box className={classes.gridSection}>
            <Box className={classes.headerBar}>
              <Typography variant="subtitle2" className={classes.chartHeading}>
                {t('sales.locations.locations')}
              </Typography>
            </Box>
            <Typography variant="h1" className={classes.dataAmount}>
              {formatCurrencyWithCommasAndSuffix(graphs?.pieChartData?.total)}
            </Typography>

            <PieChart
              colors={graphs?.pieChartData?.colors}
              data={graphs?.pieChartData?.data || []}
              stats={graphs?.pieChartData?.total || 0}
              style={{ height: '200px', width: '100%' }}
              toolTipFormatter="{b}: {c} ({d}%)"
              decimal={0}
              legedFormatter="value"
              legendStyle={{
                icon: 'rect',
                itemWidth: 12,
                itemHeight: 12,
                textStyle: {
                  fontSize: 12,
                  color: '#86868B',
                  fontWeight: 500,
                  lineHeight: 16,
                },
              }}
            />
          </Box>
        )}
        {loadingPieGraph ? (
          <Box className={classes.pieChartSkeletonWrapper}>
            <PieChartSkeleton
              legendCount={2}
              title={t('sales.locations.locationsbyStage')}
              isValue={true}
            />
          </Box>
        ) : (
          <Box className={classes.gridSection}>
            <Box className={classes.headerBar}>
              <Typography variant="subtitle2" className={classes.chartHeading}>
                {t('sales.locations.locationsbyStage')}
              </Typography>
            </Box>
            <Typography variant="h1" className={classes.dataAmount}>
              {formatCurrencyWithCommasAndSuffix(graphs?.barChartData?.total)}
            </Typography>

            <PieChart
              colors={graphs?.barChartData?.colors || []}
              data={graphs?.barChartData?.data || []}
              stats={graphs?.barChartData?.total || 0}
              style={{ height: '200px', width: '100%' }}
              toolTipFormatter="{b}: {c} ({d}%)"
              decimal={0}
              legedFormatter="value"
              legendStyle={{
                icon: 'rect',
                itemWidth: 12,
                itemHeight: 12,
                textStyle: {
                  fontSize: 12,
                  color: '#86868B',
                  fontWeight: 500,
                  lineHeight: 16,
                },
              }}
            />

            {/*<BarChart*/}
            {/*  colors={graphs?.barChartData?.colors}*/}
            {/*  data={graphs?.barChartData || {}}*/}
            {/*  stats={Stages.stats}*/}
            {/*  style={{ height: '200px', width: '100%' }}*/}
            {/*/>*/}
          </Box>
        )}
        {loadingLineGraph ? (
          <Box className={classes.lineChartSkeletonWrapperRight}>
            <LineChartSkeleton title={t('sales.locations.qualifiedLocations')} />
          </Box>
        ) : (
          <Box className={classes.gridSectionOne}>
            <Box
              className={classNames(
                classes.headerBar,
                classes.headerBarIn,
                classes.customHeadingChart,
              )}
            >
              <Typography variant="subtitle2" className={classes.chartHeading}>
                {t('sales.locations.qualifiedLocations')}
              </Typography>
            </Box>

            <LineToolTouchChart
              colors={{ [t('sales.locations.locations')]: QualifiedLocations.colors.Locations }}
              data={graphs?.lineToolChart?.data || {}}
              dataLabels={graphs?.lineToolChart?.dataLabels || []}
              style={{ height: '200px', width: '100%' }}
            />
          </Box>
        )}

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

      <Box className={classes.locationFilterBar}>
        <Box className={classes.filterLeftSide}>
          <SearchComponentWithQuery
            placeHolder={`${t('sales.locations.searchByID')}`}
            onSearch={handleSearch}
          />

          <Box className={classes.dropDownsFilters}>
            <CustomDropDown
              name="status"
              id="status"
              label={t('sales.locations.allLocationAffiliation')}
              options={locationStatusOptions || []}
              selectedValues={formData?.status || {}}
              handleChange={(event) => handleMultipleSelectedValues(event, 'status')}
              className={classes.locationSearch}
            />

            <CustomDropDown
              name="location"
              id="location"
              label={t('sales.locations.allLocations')}
              options={locationFilterOptionsList}
              selectedValues={memoizedSelectedLocation || {}}
              handleChange={(event) => handleMultipleSelectedValues(event, 'assigned')}
              checkmark={true}
              clearAll={false}
              withTiles={false}
              searchPlaceholder={t('sales.locations.allLocations')}
              className={classes.locationSearch}
            />

            <Button
              onClick={toggleFiltersDrawer(locationDrawerTypes.RIGHT, true)}
              className={classes.moreFilter}
              variant="onlyText"
            >
              {t('sales.locations.moreFilters')} <MoreFilter className={classes.filterIcon} />
            </Button>
          </Box>
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
                companies={companies}
                setCompaniesFilters={setCompaniesFilters}
                companiesPagination={companiesPagination}
                fetchCompanies={fetchCompanies}
                loadingCompaniesDropDown={loadingCompaniesDropDown}
              />
            ) : null}
          </Drawer>
        </Box>
        <Box className={classes.filterRightSide}>
          <Box className={classes.twoBtnWrapper}>
            <RenderIfHasPermission name={ACL_PROPERTY_REVIEW_VIEW}>
              <Button
                onClick={redirectToReviewLocations}
                variant="destructive"
                className={classes.btnLocation}
              >
                {`${t('sales.locations.reviewLeads')} (${counts.pending || 0})`}
              </Button>
            </RenderIfHasPermission>
            {!hasRejectedTab && (
              <RenderIfHasPermission name={ACL_PROPERTIES_UPDATE}>
                <Button
                  onClick={togglebulkDrawer(locationDrawerTypes.RIGHT, true)}
                  className={classes.btnLocation}
                  variant="secondaryGrey"
                  disabled={selectedItems.length === 0}
                >
                  {t('sales.locations.bulkAssignment')}
                </Button>
              </RenderIfHasPermission>
            )}
            <Drawer
              anchor={locationDrawerTypes.RIGHT}
              open={state[locationDrawerTypes.RIGHT]}
              onClose={togglebulkDrawer(locationDrawerTypes.RIGHT, false)}
            >
              {state?.right ? (
                <BulkDrawer
                  anchor="right"
                  bulkCloseDrawer={bulkCloseDrawer}
                  width={742}
                  selectedItems={selectedItems}
                  setSelectedItems={setSelectedItems}
                  filtersData={transformFilters(
                    formData,
                    companiesFilters,
                    memoizedSelectedLocation,
                  )}
                  setSelectAll={setSelectAll}
                  setBulkOperationPerformed={updateBulkOperationPerformed}
                />
              ) : null}
            </Drawer>
            <RenderIfHasPermission name={ACL_PROPERTIES_CREATE}>
              <Button
                onClick={toggleDrawerLocation(locationDrawerTypes.RIGHT, true)}
                variant="primary"
                startIcon={<AddIcon />}
              >
                {t('sales.locations.createLocation')}
              </Button>
            </RenderIfHasPermission>

            <Drawer
              anchor={locationDrawerTypes.RIGHT}
              open={locationState[locationDrawerTypes.RIGHT]}
              onClose={toggleDrawerLocation(locationDrawerTypes.RIGHT, false)}
            >
              <NewLocationDrawer
                isLoaded={isLoaded}
                anchor={locationDrawerTypes.RIGHT}
                locationCloseDrawer={locationCloseDrawer}
                width={796}
                companies={companies}
                onSuccess={refetchLocations}
                fetchCompanies={fetchCompanies}
                companiesPagination={companiesPagination}
                loadingCompaniesDropDown={loadingCompaniesDropDown}
              />
            </Drawer>
            <Drawer
              anchor={locationDrawerTypes.RIGHT}
              open={openApproveLocationDrawer[locationDrawerTypes.RIGHT]}
              onClose={toggleDrawerApproveLocation(locationDrawerTypes.RIGHT, false)}
            >
              <ApproveLocationDrawer
                anchor={locationDrawerTypes.RIGHT}
                approveLocationCloseDrawer={approveLocationCloseDrawer}
                width={796}
                locationData={openApproveLocationDrawer.locationData}
                refetchLocations={refetchLocations}
                isApproveableAndRejectable={formData.status?.value === locationFilterStatus.PENDING}
              />
            </Drawer>
          </Box>
        </Box>
      </Box>
      <Box className={hasRejectedTab ? classes.locationListingNew : classes.locationListing}>
        {/* {loading ? (
          <CircularProgressWrapper />
        ) : !loading && data.length === 0 ? (
          <NoData
            text={t('sales.locations.noLocation')}
            description={t('sales.locations.locationsDataSync')}
          />
        ) : ( */}
        <TableComponent
          data={data}
          columns={columns}
          tableHead={tableHead}
          tableBody={tableBody}
          pagination={true}
          page={pagination?.currentPage - 1}
          perPage={perPage}
          totalRecords={pagination?.totalCount}
          handleChangePage={handleChangePage}
          applySorting={applySorting}
          className={classes.locationTable}
          selectionText={
            selectedItems?.length > 0
              ? selectedItems?.length === 1
                ? `${selectedItems.length} ${t('sales.locations.locationSelected')}`
                : `${selectedItems.length} ${t('sales.locations.locationsSelected')}`
              : ''
          }
          rowsPerPageOptions={paginationOptions.perPageOptions}
          onChangeRowsPerPage={onChangeRowsPerPage}
          rowsPerPage={pagination.rowsPerPage}
        />
        {/* )} */}
      </Box>
    </Box>
  );
};

export default LocationsListing;
