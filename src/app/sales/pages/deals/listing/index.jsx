const {
  Box,
  Typography,
  Button,
  Drawer,
  TableRow,
  TableCell,
  Checkbox,
  TableSortLabel,
  Tooltip,
  Chip,
} = require('@mui/material');

import { ReactComponent as ChevronRight } from 'assets/svg/chevron-right.svg';
import { ReactComponent as GraphCollapseIconUpward } from 'assets/svg/collapse-upward-icon.svg';
import { ReactComponent as InfoIcon } from 'assets/svg/info.svg';
import { ReactComponent as RepeatIcon } from 'assets/svg/repeat.svg';
import classNames from 'classnames';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import CustomDropDown from 'src/app/components/common/customDropDown/index.jsx';
import LineToolTouchChart from 'src/app/components/common/eLineToolTouchChart/index.jsx';
import PieChart from 'src/app/components/common/ePieChart/index.jsx';
import SearchComponentWithQuery from 'src/app/components/common/searchWithQuery/index.jsx';
import LineChartSkeleton from 'src/app/components/common/skeletonLoader/lineChartSkeleton.jsx';
import PieChartSkeleton from 'src/app/components/common/skeletonLoader/pieChartSkeleton.jsx';
import TableSkeleton from 'src/app/components/common/skeletonLoader/tableSkeleton.jsx';
import TableComponent from 'src/app/components/common/table/index.jsx';
import NoRecordFound from 'src/app/components/common/table/noRecordFound.jsx';
import TableImage from 'src/app/components/common/tableImage/index.jsx';
import DealDrawer from 'src/app/components/salesComponents/deals/dealDrawer/index.jsx';
import DealsAssignment from 'src/app/components/salesComponents/deals/dealsAssignment/index.jsx';
import { stageValues } from 'src/app/components/salesComponents/deals/dealStages/stage.constant.js';
import ListingMoreFiltersDrawer from 'src/app/components/salesComponents/deals/listingMoreFilter/index.jsx';
import { SALES_DEAL } from 'src/app/router/constant/ROUTE.jsx';
import { ACL_DEALS_CREATE, ACL_DEALS_UPDATE } from 'src/app/router/constant/SALESMODULE.jsx';
import history from 'src/app/router/utils/history';
import { ReactComponent as AlertCircleIcon } from 'src/assets/svg/alertCircle.svg';
import { ReactComponent as CheckBoxRegularIcon } from 'src/assets/svg/checkbox.svg';
import { ReactComponent as CheckBoxCheckedIcon } from 'src/assets/svg/checkbox-checked.svg';
import { ReactComponent as AlertIcon } from 'src/assets/svg/DedicatedDuty/alertCircle.svg';
import { AddIcon, MoreFilter } from 'src/assets/svg/index.jsx';
import { useApiControllers } from 'src/helper/axios/index.js';
import { formatDate, isValidNumber } from 'src/helper/utilityFunctions';
import { deepEqual, transformPieChartData } from 'src/helper/utilityFunctions.js';
import RenderIfHasPermission from 'src/hoc/renderIfHasPermission.jsx';
import { getDisplayConfiguration } from 'src/redux/store/slices/regionalCountryConfiguration/index.js';
import {
  getDealOwnerOptions,
  getDeals,
  getDealsCumulativeStats,
  getDealsYearlyStats,
  getPipelineOptions,
} from 'src/services/deal.service.js';
import { getCompaniesOption } from 'src/services/location.service.js';
import transformArrayForOptions from 'src/utils/array/transformArrayForOptions.js';
import { companiesPaginationEmptyState } from 'src/utils/constants/emptyStates/companiesPagination.js';
import { KEY, OBJECTKEY } from 'src/utils/constants/events/keyPressEvents';
import { defaultImage, paginationOptions, toastSettings } from 'src/utils/constants/index.js';
import {
  fomatNumbersWithCommas,
  formatCurrencyWithCommasAndSuffix,
} from 'src/utils/currencyFormater/index.js';
import { formatISOTimestampToDate } from 'src/utils/date/index.js';
import { capitalizeFirstLetter, getChipColor, spMapping } from 'src/utils/string/common.jsx';

import {
  dealFilterOptions,
  dealStages,
  dealTypes,
  locationDrawerTypes,
} from '../deals.constant.js';
import { useStyles } from './listing.js';

const perPage = paginationOptions.perPageRows;

const i18ColumnName = (t, classDealName, textCapitalize) => {
  return [
    {
      id: 'checkbox',
      label: ``,
    },
    // Commented Id columns because of client feedback SSE-3180
    // {
    //   id: 'hubspotId',
    //   label: `${t('sales.deals.dealId')}`,
    //   sortable: true,
    // },
    {
      id: 'dealName',
      label: `${t('sales.deals.dealName')}`,
      className: classDealName,
      sortable: true,
    },
    {
      id: 'dealAmount',
      label: `${t('sales.deals.dealamount')}`,
      sortable: true,
    },
    {
      id: 'dealOwner',
      label: `${t('sales.deals.dealOwner')}`,
      hasImage: true,
      className: textCapitalize,
    },
    {
      id: 'stage',
      label: `${t('sales.deals.stage')}`,
      sortable: true,
    },
    {
      id: 'industry',
      label: `${t('sales.deals.industry')}`,
    },
    {
      id: 'dealType',
      label: `${t('sales.locations.dealType')}`,
      sortable: true,
    },
    {
      id: 'associatedFranchise',
      label: `${t('sales.deals.associatedFranchise')}`,
    },
    {
      id: 'address',
      label: `${t('sales.deals.address')}`,
    },
    {
      id: 'location',
      label: `${t('sales.deals.location')}`,
    },
    {
      id: 'postalCode',
      label: `${t('sales.deals.postalCode')}`,
    },
    {
      id: 'city',
      label: `${t('sales.deals.city')}`,
      className: textCapitalize,
    },
    {
      id: 'state',
      label: `${t('sales.deals.state')}`,
      className: textCapitalize,
    },
    {
      id: 'createDate',
      label: t('sales.deals.createDate'),
      sortable: true,
    },
    {
      id: 'lastActivityDate',
      label: t('sales.deals.lastActivity'),
      sortable: true,
    },
    {
      id: 'lastModifiedDate',
      label: t('sales.deals.lastModify'),
      sortable: true,
    },
    {
      id: 'strategicPartnershipStatus',
      label: t('sales.companies.strategicPartnership'),
      className: textCapitalize,
    },
  ];
};

const _params = {
  search: '',
  devicesFilterSelectedValue: {},
  zonesFilterSelectedValue: [],
  sitesFilterSelectedValue: [],
  sortBy: '',
  orderBy: '',
};

const emptyState = {
  states: [],
  cities: [],
  country: '',
  countryCode: '',
  pipelineId: { id: '', name: '' },
  assigned: { value: null },
  postalCode: '',
  postalCodes: [],
  hsId: '',
  dealOwnerIds: [],
  sites: null,
  stage: null,
  dealType: null,
  proposalStatus: null,
  industryIds: [],
  createdDate: [null, null],
  lastActivityDate: [null, null],
  lastModifiedDate: [null, null],
};
const companyFilters = {
  dealOwnerIds: [],
  industryIds: [],
};
const order = {
  orderBy: 'id',
  orderType: 'asc',
};

const columnIdsEnum = {
  stage: 'stage',
  dealOwner: 'dealOwner',
  dealName: 'dealName',
  hubspotId: 'hubspotId',
  dealAmount: 'dealAmount',
  location: 'location',
  strategicPartnership: 'strategicPartnershipStatus',
  dealAddress: 'dealAddress',
  address: 'address',
  industry: 'industry',
  dealType: 'dealType',
  createDate: 'createDate',
  lastActivityDate: 'lastActivityDate',
  lastModifiedDate: 'lastModifiedDate',
};

const pipelineDefaultObj = (t) => ({ id: '', name: t('sales.deals.allPipelines') });

const DealsListing = () => {
  const classes = useStyles();
  const { t } = useTranslation();
  const NA = t('commonText.nA');
  const defaultPipeline = useMemo(() => pipelineDefaultObj(t), [t]);
  const initialEmptyState = useMemo(
    () => ({ ...emptyState, pipelineId: defaultPipeline }),
    [defaultPipeline],
  );
  const { symbol, dateFormat } = useSelector(getDisplayConfiguration);

  const classDealName = classes.dealNameTD;
  const textCapitalize = classes.textCapitalize;
  const columns = i18ColumnName(t, classDealName, textCapitalize);
  const [data, setData] = useState([]);
  const [page, setPage] = useState(0);
  const [stats, setStats] = useState({});
  const { getNewApiController } = useApiControllers();
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ currentPage: 0, totalCount: 0, rowsPerPage: 10 });
  const [selectAll, setSelectAll] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [orderState, setOrderState] = useState(order);
  const [errorMessages, setErrorMessages] = useState({});
  const [selectedItems, setSelectedItems] = useState([]);
  const [formData, setFormData] = useState(initialEmptyState);
  const [options, setOptions] = useState({
    dealOwners: [],
    pipeline: [],
    pipelines: [],
    stages: [],
    companies: [],
    locations: [],
  });
  const [graphs, setGraphs] = useState({
    pieChartData: [],
    dealsVerticalData: [],
    lineToolChart: {},
  });
  const [companiesPagination, setCompaniesPagination] = useState(companiesPaginationEmptyState);
  const [companiesFilters, setCompaniesFilters] = useState(companyFilters);
  const [loadingPieGraph, setLoadingPieGraph] = useState(true);
  const [loadingLineGraph, setLoadingLineGraph] = useState(true);
  const [moreFilterState, setmoreFilterState] = useState({
    right: false,
  });
  const [dealState, setDealState] = useState({
    right: false,
  });
  const [assignmentState, setAssignmentState] = useState({
    right: false,
  });
  const [graphCollapse, setGraphCollapse] = useState(true);

  const [loadingCompaniesDropDown, setLoadingCompaniesDropDown] = useState(false);

  const previousSearchText = useRef(null);

  const handleSearch = (event) => {
    setSearchValue((prevState) => ({ ...prevState, search: event.target.value }));
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

  const toggleDealDrawer = (anchor, open) => (event) => {
    if (event.type === KEY.UP && (event.key === KEY.TAB || event.key === KEY.SHIFT)) {
      return;
    }
    setDealState({ ...dealState, [anchor]: open });
  };
  const dealCloseDrawer = (anchor) => {
    setDealState({ ...dealState, [anchor]: false });
  };

  const toggleAssignmentDrawer = (anchor, open) => (event) => {
    if (event.type === KEY.UP && (event.key === KEY.TAB || event.key === KEY.SHIFT)) {
      return;
    }
    setAssignmentState({ ...assignmentState, [anchor]: open });
  };
  const assignmentCloseDrawer = (anchor) => {
    setAssignmentState({ ...assignmentState, [anchor]: false });
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
          setOptions((prevOptions) => ({
            ...prevOptions,
            companies: [
              ...(prevOptions.companies || []), // Ensure prevOptions.companies is an array
              ...(response?.data?.companies || []), // Ensure response.data.companies is an array
            ],
          }));
        } else {
          setOptions((prevOptions) => ({
            ...prevOptions,
            companies: response?.data?.companies,
          }));
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

  /**
   * Fetch pipelines listing
   */
  const fetchPipelines = async () => {
    try {
      const response = await getPipelineOptions();
      if (response?.statusCode === 200) {
        setOptions((prevOptions) => ({
          ...prevOptions,
          pipelines: response?.data?.pipelines,
        }));
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

  /**
   * Fetch deal owners
   */
  const fetchDealOwners = async () => {
    try {
      const response = await getDealOwnerOptions();
      if (response?.statusCode === 200) {
        setOptions((prevOptions) => ({
          ...prevOptions,
          dealOwners: response?.data?.owners,
        }));
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

  useEffect(() => {
    // Wrap each function call in Promise.resolve to ensure they return promises
    const promises = [
      Promise.resolve(fetchCompanies()),
      Promise.resolve(fetchPipelines()),
      Promise.resolve(fetchDealOwners()),
    ];
    Promise.allSettled(promises);
  }, []);

  const handleSelectAllChange = (event) => {
    const isChecked = event.target.checked;
    setSelectAll(isChecked);

    if (isChecked) {
      setSelectedItems(data.map((row) => row.dealId));
      return;
    }

    setSelectedItems([]);
  };

  const handleCheckboxChange = (event, id) => {
    if (event.target.checked) {
      /**
       * If the checkbox is checked
       * add the item to the selectedItems array
       */
      setSelectedItems([...selectedItems, id]);
      return; // Return early
    }
    /**
     * If the checkbox is unchecked
     * remove the item from the selectedItems array
     */
    setSelectedItems(selectedItems.filter((item) => item !== id));
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
    await fetchDeals(params);
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
          title={`${t('sales.locations.followUp')} ${formatISOTimestampToDate(followUpDate, dateFormat)}`}
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

  /**
   * @description function return required signature icon with tooltip
   * @returns
   */
  const renderRequiredSignIcon = () => {
    return (
      <Tooltip
        arrow
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
            sx: { cursor: 'pointer' },
          },
        }}
        title={
          <Box
            //Don't have option to add class sx is required here
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <AlertIcon />
            {t('sales.deals.requiresSignature')}
          </Box>
        }
        slots={<Box />}
        placement="top"
      >
        <AlertCircleIcon />
      </Tooltip>
    );
  };

  const renderTableCell = (row, column) => {
    /**
     * This condition is only for deal name column
     * this will display follow-up icon and required signature icon with NA if deal name is missing
     */
    if (!row[column.id] && column.id === columnIdsEnum.dealName) {
      return (
        <Box className={classes.inlineContent}>
          <Box className={classes.emptS}>{t('commonText.nA')}</Box>

          {/* show follow-up icon and tooltip */}
          {row?.followUpDate && renderFollowUpIcon(row?.followUpDate)}

          {/* show signature required icon and tooltip */}
          {row?.signatureRequired && renderRequiredSignIcon()}
        </Box>
      );
    }

    if (column.id == columnIdsEnum.strategicPartnership) {
      return (
        <Box className={`${classes.assignToClass}`}>
          <Box component="span" className={classes.assignToText}>
            {row[column.id] ? (
              <Chip
                label={spMapping[row[column.id]]}
                size="small"
                icon={
                  row.strategicPartnershipTooltip && (
                    <Tooltip
                      title={
                        <span
                          dangerouslySetInnerHTML={{
                            __html: row.strategicPartnershipTooltip,
                          }}
                        />
                      }
                    >
                      <InfoIcon fontSize="small" sx={{ stroke: getChipColor(row[column.id]) }} />
                    </Tooltip>
                  )
                }
                color={getChipColor(row[column.id])}
              />
            ) : (
              <span> {NA} </span>
            )}
          </Box>
        </Box>
      );
    }

    if (column.id === columnIdsEnum.dealAmount) {
      return isValidNumber(row[column.id]) ? (
        <Box>{`${symbol}${fomatNumbersWithCommas(row[column.id])}`}</Box>
      ) : (
        <Box>{NA}</Box>
      );
    }

    if (!row[column.id]) {
      return (
        <Box component="span" className={classes.emptS}>
          {t('commonText.nA')}
        </Box>
      );
    }

    /**
     * handle colors for stage column
     */
    if (column.id === columnIdsEnum.stage) {
      let stageColorClass = '';
      if (row[column.id]?.value === stageValues.QUESTIONS) {
        stageColorClass = classes.questionsColor;
      } else if (row[column.id]?.value === stageValues.PROPOSAL_CREATION) {
        stageColorClass = classes.proposalsColor;
      } else if (row[column.id]?.value === stageValues.CLOSED_LOST) {
        stageColorClass = classes.lostColor;
      } else if (row[column.id]?.value === stageValues.CLOSED_WON) {
        stageColorClass = classes.closedWoncolor;
      } else if (row[column.id]?.value === stageValues.PROPOSAL_DELIVERED) {
        stageColorClass = classes.negotiationColor;
      } else if (row[column.id]?.value === stageValues.NEGOTIATION) {
        stageColorClass = classes.negotiationColor;
      } else if (row[column.id]?.value === stageValues.TERMINATED) {
        stageColorClass = classes.terminated;
      } else {
        stageColorClass = dealStages.OTHERS;
      }
      return (
        <Box component="span" className={classNames(classes.commonStageColor, stageColorClass)}>
          {row[column.id]?.label}
        </Box>
      );
    }

    if (column.id === columnIdsEnum.industry) {
      return (
        <Box
          component="span"
          className={classNames(classes.commonStageColor, classes.proposalsColor)}
        >
          {row[column.id]?.label}
        </Box>
      );
    }

    if (column.id === columnIdsEnum.dealType) {
      let stageColorClass = '';
      if (row[column.id]?.value === dealTypes.EXISTING) {
        stageColorClass = classes.negotiationColor;
      } else if (row[column.id]?.value === dealTypes.NEW) {
        stageColorClass = classes.questionsColor;
      } else if (row[column.id]?.value === dealTypes.OLD) {
        stageColorClass = classes.proposalsColor;
      } else if (row[column.id]?.value === dealTypes.LOST) {
        stageColorClass = classes.lostColor;
      } else {
        stageColorClass = dealStages.OTHERS;
      }
      return (
        <Box component="span" className={classNames(classes.commonStageColor, stageColorClass)}>
          {row[column.id]?.label}
        </Box>
      );
    }

    if (column.id === columnIdsEnum.dealOwner) {
      return row[column.id] ? (
        <Box className={classes.assignToClass} component="div">
          <TableImage className={classes.assignAvatar} imageUrl={row.image || defaultImage} />

          <Box component="span" className={classes.assignToText}>
            {row[column.id]}
          </Box>
        </Box>
      ) : (
        <Box>{NA}</Box>
      );
    }

    if (column.id === columnIdsEnum.dealName) {
      return (
        <Box className={classes.franchiseName}>
          <Box className={classes.franchiseNameText}>
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
              <>{capitalizeFirstLetter(row[column.id]) || NA} </>
            )}

            {/* show follow-up icon and tooltip */}
            {row?.followUpDate && renderFollowUpIcon(row?.followUpDate)}

            {/* show signature required icon and tooltip */}
            {row?.signatureRequired && renderRequiredSignIcon()}
          </Box>
          <Box className={classes.franchiseNameIcon}>
            <ChevronRight />
          </Box>
        </Box>
      );
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

    if (
      column.id === columnIdsEnum.location ||
      column.id === columnIdsEnum.dealAddress ||
      column.id === columnIdsEnum.industry
    ) {
      return <>{capitalizeFirstLetter(row[column.id]) || NA}</>;
    }

    if (
      column.id === columnIdsEnum.createDate ||
      column.id === columnIdsEnum.lastActivityDate ||
      column.id === columnIdsEnum.lastModifiedDate
    ) {
      return <>{formatDate(row[column.id], dateFormat) || NA}</>;
    }

    if (column.id === columnIdsEnum.hubspotId) return <>#{row[column.id]}</>;

    return <>{row[column.id]}</>;
  };

  const sortDirection = (column) => {
    return orderState.orderBy === column.id ? orderState.orderType : false;
  };

  const orderDirection = (column) => {
    return orderState.orderBy === column.id ? orderState.orderType : 'asc';
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
    fetchDeals(params);
  };

  /**
   * clear all filters and refetch the data
   */
  const handleClearFilters = () => {
    let refreshLocation = true;
    if (deepEqual(formData, initialEmptyState)) {
      refreshLocation = false;
    }
    setFormData({ ...initialEmptyState });
    setCompaniesFilters({ ...companyFilters });
    setPage(0);
    const params = {
      page: page + 1,
      rowsPerPage: pagination.rowsPerPage,
      query: { ...emptyState },
    };
    refreshLocation && fetchDeals(params);
    setmoreFilterState({ ...moreFilterState });
  };

  const applyFilters = (query) => {
    // Create a new object with status from formData and other fields from emptyState
    const updatedFormData = {
      ...query,
    };

    setPage(0);
    const params = {
      page: 1,
      rowsPerPage: pagination.rowsPerPage,
      query: updatedFormData,
    };
    fetchDeals(params);
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

  const inputChangedHandler = (event) => {
    const { name, value } = event.target;
    if (value) {
      // ? NOTE: if the variable "value" is not getting used add _ before it or this rule will suffice the need here.
      // eslint-disable-next-line no-unused-vars
      const { [name]: key, ...rest } = errorMessages;
      setErrorMessages(rest);
    }
    updateFormHandler(name, value);
  };

  const fetchDealsCumulativeData = async () => {
    setLoadingPieGraph(true);
    try {
      const response = await getDealsCumulativeStats(formData?.pipelineId.id);
      if (response.statusCode === 200) {
        setStats(response?.data?.byOpenDeals);
        /**
         * PIECHART
         * Transform the data to match the format expected by ECharts
         * Transform data using helper functions
         */
        const pieChart = transformPieChartData(
          response?.data?.byOpenDeals.labels,
          response?.data?.byOpenDeals.values,
        );
        // Update pieChartData
        setGraphs((prevGraphs) => ({
          ...prevGraphs,
          pieChartData: {
            ...pieChart,
            colors: response?.data?.byOpenDeals?.colors, // Adding an array for colors
          },
        }));

        /**
         * parse data for Deals Breakdown by Verticals
         */
        const parsedIndustryVerticals = {
          data: response?.data?.byIndustries?.verticals.map((item) => ({
            value: item.value,
            name: item.name,
          })),
          stats: {
            total: response?.data?.byIndustries?.totalCount,
            totalDetail: t('sales.deals.totalDeals'),
          },
          colors: response?.data?.byIndustries?.colors,
        };

        // Update industry verticals
        setGraphs((prevGraphs) => ({
          ...prevGraphs,
          dealsVerticalData: parsedIndustryVerticals,
        }));
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

  const fetchDealsYearlyData = async () => {
    setLoadingLineGraph(true);
    try {
      const response = await getDealsYearlyStats(formData?.pipelineId.id);
      if (response.statusCode === 200) {
        const { data, stats, colors } = response?.data?.yearlyStats ?? {};
        let { dataLabels } = response?.data?.yearlyStats ?? {};

        const updatedKeysData = {
          [t('sales.dashboard.won')]: data?.win,
          [t('sales.dashboard.lost')]: data?.lost,
        };

        const updatedKeysStats = {
          [t('sales.dashboard.won')]: stats?.win,
          [t('sales.dashboard.lost')]: stats?.lost,
        };

        setGraphs((prevGraphs) => ({
          ...prevGraphs,
          lineToolChart: {
            data: updatedKeysData,
            dataLabels,
            stats: updatedKeysStats,
            colors: {
              [t('sales.dashboard.won')]: colors?.win,
              [t('sales.dashboard.lost')]: colors?.lost,
            },
          },
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

  /**
   * Fetch deals listing
   * @param {*} page
   * @param {*} query
   */
  const fetchDeals = async ({ page, query, rowsPerPage = 10 }) => {
    query = {
      ...query,

      createdDateStart: query?.createdDate?.[0] ? formatDate(query.createdDate?.[0]) : null,
      createdDateEnd: query?.createdDate?.[1] ? formatDate(query.createdDate?.[1]) : null,
      lastModifiedDateStart: query?.lastModifiedDate?.[0]
        ? formatDate(query.lastModifiedDate?.[0])
        : null,
      lastModifiedDateEnd: query?.lastModifiedDate?.[1]
        ? formatDate(query.lastModifiedDate?.[1])
        : null,
      lastActivityDateStart: query?.lastActivityDate?.[0]
        ? formatDate(query.lastActivityDate?.[0])
        : null,
      lastActivityDateEnd: query?.lastActivityDate?.[1]
        ? formatDate(query.lastActivityDate?.[1])
        : null,
    };

    const apiController = getNewApiController();
    try {
      setLoading(true);
      const search = searchValue ? searchValue.search : '';

      let cityIds = [];
      let stateIds = [];

      if (query?.states?.length) stateIds = query?.states.map((state) => state?.value);
      if (query?.cities?.length) cityIds = query?.cities.map((city) => city?.value);

      // Remove old keys
      delete query.states;
      delete query.cities;

      const updatedQuery = {
        ...query,
        assigned: query.assigned.value,
        pipelineId: query.pipelineId.id,
        search,
        stateIds,
        cityIds,
        sites: query?.sites?.id ? query?.sites?.id : null,
        stage: query?.stage?.id !== undefined ? query?.stage?.id : null,
        dealType: query?.dealType?.id !== undefined ? query?.dealType?.id : null,
        strategicPartnershipStatus: query?.strategicPartnershipStatus?.id
          ? query?.strategicPartnershipStatus?.id
          : null,
        proposalStatus: query?.proposalStatus?.id !== undefined ? query?.proposalStatus?.id : null,
      };

      const response = await getDeals(page, rowsPerPage, updatedQuery, {
        signal: apiController.signal,
      });
      if (response?.statusCode === 200) {
        setData(response?.data?.deals);
        setPagination({
          ...response?.pagination,
          rowsPerPage: rowsPerPage,
        });
      }
      setLoading(false);
    } catch (error) {
      if (!apiController.signal.aborted) {
        if (error?.message) {
          toast.error(error?.message, {
            position: 'top-right',
            autoClose: toastSettings.AUTO_CLOSE,
          });
        }
        setLoading(false);
      }
    }
  };

  /**
   * Fetch pipeline filters
   * @param {*} page
   * @param {*} query
   */
  const fetchPipeline = async () => {
    try {
      const response = await getPipelineOptions();
      if (response?.statusCode === 200) {
        /**
         * set pipeline options
         */
        setOptions((prevOptions) => ({
          ...prevOptions,
          pipeline: [defaultPipeline, ...(response?.data?.pipelines ?? [])],
        }));
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

  useEffect(() => {
    fetchPipeline();
  }, [defaultPipeline]);

  const refreshData = () => {
    const params = {
      page: page + 1,
      rowsPerPage: pagination.rowsPerPage,
      query: { ...emptyState },
    };
    fetchDeals(params);
  };

  useEffect(() => {
    const params = {
      page: page + 1,
      rowsPerPage: pagination.rowsPerPage,
      query: { ...formData },
    };
    fetchDeals(params);
  }, [searchValue, formData?.assigned, formData?.searchValue, formData?.pipelineId]);

  useEffect(() => {
    // Wrap each function call in Promise.resolve to ensure they return promises
    const promises = [
      Promise.resolve(fetchDealsCumulativeData()),
      Promise.resolve(fetchDealsYearlyData()),
    ];

    Promise.allSettled(promises);
  }, [formData?.pipelineId]);

  const dealFilterOptionsList = useMemo(() => dealFilterOptions(t), [t]);
  const memoizedSelectedDeals = useMemo(() => {
    return (
      dealFilterOptionsList.find((option) => option.value === formData.assigned?.value) ??
      dealFilterOptionsList[0]
    );
  }, [dealFilterOptionsList, formData.assigned?.value]);

  const gotoDealDetail = (column, rowId) => {
    if (column.id === OBJECTKEY.DEAL_NAME) {
      history.push(`${SALES_DEAL}/${rowId}`);
    }
  };

  const tableHead = () => {
    return (
      <>
        <TableRow>
          {columns.map((column) => (
            <TableCell key={column.id} sortDirection={sortDirection(column)}>
              {column.id === 'checkbox' && (
                <Checkbox
                  icon={<CheckBoxRegularIcon />}
                  checkedIcon={<CheckBoxCheckedIcon />}
                  className={classes.checkBoxCustom}
                  checked={selectAll}
                  onChange={handleSelectAllChange}
                />
              )}
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
          description={t('sales.deals.dealsDataSync')}
        />
        {data?.map((row, rowIndex) => (
          <TableRow key={row.id || rowIndex}>
            {columns.map((column, columnIndex) =>
              column.id === OBJECTKEY.DEAL_NAME ? (
                <TableCell
                  className={column.className}
                  onClick={() => gotoDealDetail(column, row.dealId)}
                  key={`${row.id}-${column.id}-${columnIndex}`}
                >
                  {renderTableCell(row, column)}
                </TableCell>
              ) : column.id === 'checkbox' ? (
                <TableCell key={`${row.id}-${column.id}-${columnIndex}`}>
                  <Checkbox
                    checked={selectedItems.includes(row.dealId)}
                    onChange={(event) => handleCheckboxChange(event, row.dealId)}
                    icon={<CheckBoxRegularIcon />}
                    checkedIcon={<CheckBoxCheckedIcon />}
                    className={classes.checkBoxCustom}
                  />
                </TableCell>
              ) : (
                <TableCell
                  className={column.className}
                  key={`${row.id}-${column.id}-${columnIndex}`}
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

  const refetchDeals = () => {
    const params = {
      page: page + 1,
      query: formData,
    };
    fetchDeals(params);
  };

  const transformFilters = (filters, resolvedAssignedOption) => {
    const modifiedFilters = { ...filters };
    modifiedFilters.dealOwnerIds = companiesFilters.dealOwnerIds;
    modifiedFilters.industryIds = companiesFilters.industryIds;
    if (resolvedAssignedOption) {
      modifiedFilters.assigned = resolvedAssignedOption;
    }
    modifiedFilters.createdDate = filters.createdDate.filter(Boolean).map((date) => ({
      label: formatDate(date, dateFormat),
      value: date?.toString(),
    }));
    modifiedFilters.lastActivityDate = filters.lastActivityDate.filter(Boolean).map((date) => ({
      label: formatDate(date, dateFormat),
      value: date?.toString(),
    }));
    modifiedFilters.lastModifiedDate = filters.lastModifiedDate.filter(Boolean).map((date) => ({
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
      query: { ...formData },
    };
    await fetchDeals(params);
  };

  return (
    <Box className={classes.dealsWrapper}>
      {/* {loading && <LoaderComponent size={50} color={'primary'} label={'Loading'} />} */}
      <Box className={classes.pipelineDropdown}>
        <CustomDropDown
          name="pipelineId"
          id="pipelineId"
          placeHolder={t('sales.deals.allPipelinesPlaceholder')}
          options={transformArrayForOptions(options?.pipeline, 'name', 'id') || []}
          selectedValues={formData?.pipelineId || {}}
          handleChange={inputChangedHandler}
          bordered
          isError={errorMessages?.pipeline}
          placeHolderClassName={classes.holderColor}
          className={classes.borderLessDrop}
        />
      </Box>
      <Box className={classes.mainWrapper}>
        <Box className={graphCollapse ? classes.mainWrapperGraph : classes.graphHide}>
          {loadingPieGraph ? (
            <Box className={classes.pieChartSkeletonWrapper}>
              <PieChartSkeleton
                legendCount={5}
                title={`${t('sales.deals.dealsVerticles')}`}
                isValue={true}
              />
            </Box>
          ) : (
            <Box className={classes.gridSection}>
              <Box className={classes.headerBar}>
                <Typography variant="subtitle2" className={classes.chartHeading}>{`${t(
                  'sales.deals.dealsVerticles',
                )}`}</Typography>
              </Box>
              <Typography variant="h1" className={classes.dataAmount}>
                {formatCurrencyWithCommasAndSuffix(graphs?.dealsVerticalData?.stats?.total)}

                <Typography variant="overline" className={classes.smallText}>
                  {`${t('sales.graphusers.totalDeals')}`}
                </Typography>
              </Typography>

              <PieChart
                heading={t('sales.deals.dealsVerticles')}
                colors={graphs?.dealsVerticalData?.colors}
                data={graphs?.dealsVerticalData?.data || []}
                stats={graphs?.dealsVerticalData?.stats?.total || 0}
                style={{ height: '200px', width: '100%' }}
                decimal={0}
                toolTipFormatter="{b}: {c} ({d}%)"
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
            <Box className={classes.pieChartSkeletonWrapperClient}>
              <PieChartSkeleton
                legendCount={3}
                title={`${t('sales.deals.totalDealAmount')}`}
                isValue={true}
              />
            </Box>
          ) : (
            <Box className={classes.gridSection}>
              <Box className={classes.headerBar}>
                <Typography variant="subtitle2" className={classes.chartHeading}>{`${t(
                  'sales.deals.totalDealAmount',
                )}`}</Typography>
              </Box>
              <Typography variant="h1" className={classes.dataAmount}>
                {`${symbol} ${formatCurrencyWithCommasAndSuffix(stats?.totalAmount)}`}
              </Typography>

              <PieChart
                heading={t('sales.deals.totalDealAmount')}
                colors={graphs?.pieChartData?.colors}
                data={graphs?.pieChartData?.data || []}
                stats={graphs?.pieChartData?.data?.total || 0}
                style={{ height: '200px', width: '100%' }}
                toolTipFormatter="{b}: {c} ({d}%)"
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
          {loadingLineGraph ? (
            <Box className={classes.lineChartSkeletonWrapperRight}>
              <LineChartSkeleton title={`${t('sales.deals.dealsLost')}`} />
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
                <Typography variant="subtitle2" className={classes.chartHeadingBar}>{`${t(
                  'sales.deals.dealsLost',
                )}`}</Typography>
                <Box className={classes.legendsLineChart}>
                  <Box className={classes.legendLineChart}>
                    <Box
                      className={classNames(classes.legendLineChartIndicator, classes.legendGray)}
                    />
                    <Typography variant="subtitle3" className={classes.legendLineChartText}>
                      {t('sales.deals.lost')}
                    </Typography>
                  </Box>
                  <Box className={classes.legendLineChart}>
                    <Box
                      className={classNames(classes.legendLineChartIndicator, classes.legendBrand)}
                    />
                    <Typography variant="subtitle3" className={classes.legendLineChartText}>
                      {t('sales.deals.won')}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <LineToolTouchChart
                heading={t('sales.deals.dealsWonVsLost')}
                colors={graphs?.lineToolChart?.colors || {}}
                data={graphs?.lineToolChart?.data || {}}
                dataLabels={graphs?.lineToolChart?.dataLabels || []}
                stats={graphs?.lineToolChart?.stats || {}}
                style={{ height: '200px', width: '100%' }}
              />
            </Box>
          )}
        </Box>

        <Button
          variant="secondaryGrey"
          onClick={() => setGraphCollapse(!graphCollapse)}
          className={graphCollapse ? classes.graphCollapseBtn : classes.graphExpandBtn}
        >
          <Box>
            <GraphCollapseIconUpward />
          </Box>
        </Button>
      </Box>
      <Box className={classes.locationFilterBar}>
        <Box className={classes.filterLeftSide}>
          <SearchComponentWithQuery
            placeHolder={`${t('sales.deals.searchByDeal')}`}
            onSearch={handleSearch}
          />
          <Box className={classes.dropdownCommonSection}>
            <CustomDropDown
              name="assigned"
              id="assigned"
              placeHolder={t('sales.deals.allDealsPlaceholder')}
              options={dealFilterOptionsList}
              selectedValues={memoizedSelectedDeals || {}}
              handleChange={inputChangedHandler}
            />
          </Box>
          <Button
            onClick={toggleFiltersDrawer(locationDrawerTypes.RIGHT, true)}
            disableRipple
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
            {moreFilterState?.right && (
              <ListingMoreFiltersDrawer
                anchor={locationDrawerTypes.RIGHT}
                filterCloseDrawer={filterCloseDrawer}
                width={399}
                formData_={formData}
                setCompaniesFilters={setCompaniesFilters}
                setFormData_={setFormData}
                errorMessages={errorMessages}
                setErrorMessages={setErrorMessages}
                inputChangedHandler={inputChangedHandler}
                applyFilters={applyFilters}
                emptyState={initialEmptyState}
                handleClearFilters={handleClearFilters}
              />
            )}
          </Drawer>
        </Box>
        <Box className={classes.filterRightSide}>
          <RenderIfHasPermission name={ACL_DEALS_UPDATE}>
            <Button
              onClick={toggleAssignmentDrawer(locationDrawerTypes.RIGHT, true)}
              className={classes.btnLocation}
              variant="secondaryGrey"
              disabled={selectedItems.length === 0}
            >
              {t('sales.locations.bulkAssignment')}
            </Button>
          </RenderIfHasPermission>
          <Drawer
            anchor={locationDrawerTypes.RIGHT}
            open={assignmentState[locationDrawerTypes.RIGHT]}
            onClose={toggleAssignmentDrawer(locationDrawerTypes.RIGHT, false)}
          >
            {assignmentState?.right ? (
              <DealsAssignment
                anchor="right"
                assignmentCloseDrawer={assignmentCloseDrawer}
                width={796}
                selectedItems={selectedItems}
                setSelectedItems={setSelectedItems}
                filtersData={transformFilters(formData, memoizedSelectedDeals)}
                setSelectAll={setSelectAll}
                refreshData={refreshData}
              />
            ) : null}
          </Drawer>
          <RenderIfHasPermission name={ACL_DEALS_CREATE}>
            <Button
              onClick={toggleDealDrawer(locationDrawerTypes.RIGHT, true)}
              variant="primary"
              startIcon={<AddIcon />}
            >
              {t('sales.deals.createDeal')}
            </Button>
          </RenderIfHasPermission>
          <Drawer
            anchor={locationDrawerTypes.RIGHT}
            open={dealState[locationDrawerTypes.RIGHT]}
            onClose={toggleDealDrawer(locationDrawerTypes.RIGHT, false)}
          >
            <DealDrawer
              anchor={locationDrawerTypes.RIGHT}
              dealCloseDrawer={dealCloseDrawer}
              width={796}
              options={options}
              setOptions={setOptions}
              onSuccess={refetchDeals}
              companiesPagination={companiesPagination}
              fetchMoreOptions={fetchCompanies}
              loadingCompaniesDropDown={loadingCompaniesDropDown}
            />
          </Drawer>
        </Box>
      </Box>
      <Box className={classes.locationListing}>
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
          selectionText={
            selectedItems?.length
              ? selectedItems?.length === 1
                ? `${selectedItems.length} ${t('sales.deals.dealSelected')}`
                : `${selectedItems.length} ${t('sales.deals.dealsSelected')}`
              : ''
          }
          rowsPerPageOptions={paginationOptions.perPageOptions}
          onChangeRowsPerPage={onChangeRowsPerPage}
          rowsPerPage={pagination.rowsPerPage}
        />
      </Box>
    </Box>
  );
};

export default DealsListing;
