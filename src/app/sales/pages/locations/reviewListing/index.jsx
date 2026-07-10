import {
  Box,
  Button,
  Chip,
  Drawer,
  Stack,
  TableCell,
  TableRow,
  TableSortLabel,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
} from '@mui/material';
import { ReactComponent as ChevronRight } from 'assets/svg/chevron-right.svg';
import { ReactComponent as RepeatIcon } from 'assets/svg/repeat.svg';
import classNames from 'classnames';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { locationAffiliationChipColors } from 'salesComponents/constant/exportEntities.constant';
import SearchComponentWithQuery from 'src/app/components/common/searchWithQuery';
import TableSkeleton from 'src/app/components/common/skeletonLoader/tableSkeleton';
import TableComponent from 'src/app/components/common/table';
import NoRecordFound from 'src/app/components/common/table/noRecordFound';
import TableImage from 'src/app/components/common/tableImage';
import ChangeReviewDrawer from 'src/app/components/salesComponents/components/changeReview';
import ApproveLocationDrawer from 'src/app/components/salesComponents/locations/approveLocation';
import { stageValues } from 'src/app/components/salesComponents/locations/locationStages/stage.constant';
import MoreFiltersDrawer from 'src/app/components/salesComponents/locations/moreFiltersDrawer';
import {
  locationDrawerTypes,
  locationFilterStatus,
  locationReviewFilterOptions,
  locationSortingTypes,
} from 'src/app/components/salesComponents/locations/newLocationsDrawer/location.constant';
import { MoreFilter } from 'src/assets/svg';
import { useApiControllers } from 'src/helper/axios';
import { deepEqual, formatDate } from 'src/helper/utilityFunctions';
import { getCompaniesOption, getLocations } from 'src/services/location.service';
import { defaultImage, paginationOptions, toastSettings } from 'src/utils/constants';
import { companiesPaginationEmptyState } from 'src/utils/constants/emptyStates/companiesPagination';
import { KEY } from 'src/utils/constants/events/keyPressEvents';
import { fomatNumbersWithCommas } from 'src/utils/currencyFormater';
import { formatISOTimestampToDate } from 'src/utils/date';
import { capitalizeFirstLetter } from 'src/utils/string/common';

import { locationStages, locationTypes } from '../listing/locations.constant';
import { useStyles } from './listingStyles';

const perPage = paginationOptions.perPageRows;

const i18ColumnName = (t, classLocationName, textCapitalize) => {
  return [
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
    },
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
      id: 'address',
      label: `${t('sales.locations.address')}`,
    },
    {
      id: 'postalCode',
      label: `${t('sales.locations.postalCode')}`,
    },
    {
      id: 'stage',
      label: `${t('sales.locations.stage')}`,
      sortable: true,
    },
    {
      id: 'type',
      label: `${t('sales.locations.type')}`,
      sortable: true,
    },
    {
      id: 'assignedUserName',
      label: `${t('sales.locations.assignedUserName')}`,
      hasImage: true,
      className: textCapitalize,
    },
    {
      id: 'franchiseName',
      label: `${t('sales.locations.nearbyFrenchise')}`,
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
  status: locationFilterStatus.PENDING,
  assigned: locationReviewFilterOptions[0],
  postalCodes: [],
  hsId: '',
  states: [],
  cities: [],
  locationType: {},
  stage: {},
  source: {},
  site: {},
  score: {},
  minUnits: '',
  maxUnits: '',
  locationAffiliation: {},
  lotNumber: '',

  createdDate: [null, null],
  hsLastmodifieddate: [null, null],
};

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
  address: 'address',
  companyName: 'companyName',
  parentCompany: 'parentCompany',
  franchiseName: 'franchiseName',
  type: 'type',
  locationAffiliation: 'locationAffiliation',
  scpre: 'score',
  dealsCount: 'dealsCount',
  createdDate: 'createDate',
  lastModifiedDate: 'hsLastmodifieddate',
};

const emptyStatePagination = { currentPage: 0, totalCount: 0, rowsPerPage: 10 };

const LocationsListing = () => {
  const classes = useStyles();
  const { t } = useTranslation();
  const location = useLocation();
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
  const [pagination, setPagination] = useState(emptyStatePagination);
  const [counts, setCounts] = useState({});
  const [companies, setCompanies] = useState([]);
  const [companiesPagination, setCompaniesPagination] = useState(companiesPaginationEmptyState);
  const [orderState, setOrderState] = useState(order);
  const locationApiController = useRef();
  const [tab, setTab] = useState('pending');

  const [searchValue, setSearchValue] = useState('');
  const [moreFilterState, setmoreFilterState] = useState({
    right: false,
  });
  const [loadingCompaniesDropDown, setLoadingCompaniesDropDown] = useState(false);

  const previousSearchText = useRef(null);

  const handleChangePage = async (_, newPage) => {
    setPagination((prev) => ({
      ...prev,
      currentPage: newPage + 1,
    }));

    const params = {
      page: newPage + 1,
      rowsPerPage: pagination.rowsPerPage,
      query: { ...formData },
    };
    await fetchLocations(params);
  };

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

    if (column.id === columnIdsEnum.dealsCount) {
      return <>{row[column.id]}</>;
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

    if (column.id === columnIdsEnum.createdDate || column.id === columnIdsEnum.lastModifiedDate)
      return <>{formatDate(row[column.id]) || NA}</>;

    /**
     * color selection for location type column
     */
    if (column.id === columnIdsEnum.type) {
      let stageColorClass = '';
      if (row[column.id].value === locationTypes.NEW) {
        stageColorClass = classes.newLocationColor;
      } else if (row[column.id].value === locationTypes.EXISTING) {
        stageColorClass = classes.eixstingColor;
      } else if (row[column.id].value === locationTypes.OLD) {
        stageColorClass = classes.oldLocationColor;
      } else if (row[column.id].value === locationTypes.LOST) {
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

  const sortDirection = (column) => {
    return orderState.orderBy === column.id ? orderState.orderType : false;
  };

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

  const toggleFiltersDrawer = (anchor, open) => (event) => {
    if (event.type === KEY.UP && (event.key === KEY.TAB || event.key === KEY.SHIFT)) {
      return;
    }
    setmoreFilterState({ ...moreFilterState, [anchor]: open });
  };

  const filterCloseDrawer = (anchor) => {
    setmoreFilterState({ ...moreFilterState, [anchor]: false });
  };

  const [openPendingLocationDrawer, setOpenPendingLocationDrawer] = useState({
    right: false,
    locationData: null,
  });

  const [openReviewLocationDrawer, setOpenReviewLocationDrawer] = useState({
    right: false,
    locationData: null,
  });

  const toggleDrawerPendingLocation = (anchor, open, locationData) => (event) => {
    if (event.type === KEY.UP && (event.key === KEY.TAB || event.key === KEY.SHIFT)) {
      return;
    }
    setOpenPendingLocationDrawer({ ...openPendingLocationDrawer, [anchor]: open, locationData });
  };

  const toggleDrawerReviewLocation = (anchor, open, locationData) => (event) => {
    if (event.type === KEY.UP && (event.key === KEY.TAB || event.key === KEY.SHIFT)) {
      return;
    }
    setOpenReviewLocationDrawer({ ...openPendingLocationDrawer, [anchor]: open, locationData });
  };

  const onChangeRowsPerPage = async (event) => {
    setPagination((prev) => ({
      ...prev,
      currentPage: 1,
      rowsPerPage: event.target.value,
    }));
    setPage(pagination.currentPage);
    const params = {
      page: 1,
      rowsPerPage: event.target.value,
      query: formData,
    };
    await fetchLocations(params);
  };

  const handleClearFilters = () => {
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

  const fetchLocations = async ({ page, query, rowsPerPage = 10 }) => {
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
      locationApiController.current?.abort();
      locationApiController.current = new AbortController();

      const search = searchValue ? searchValue.search : '';
      const newQuery = { ...query };
      let cityIds = [];
      let stateIds = [];

      if (newQuery?.states?.length) stateIds = newQuery?.states.map((state) => state?.value);
      if (newQuery?.cities?.length) cityIds = newQuery?.cities.map((city) => city?.value);

      delete newQuery.states;
      delete newQuery.cities;

      const updatedQuery = {
        ...newQuery,
        assigned: newQuery?.assigned?.value,
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
      };

      if (tab === 'changeReview') {
        updatedQuery.changeRequest = true;
        delete updatedQuery.status;
      } else {
        updatedQuery.status = locationFilterStatus.PENDING;
      }

      delete updatedQuery.site;
      delete updatedQuery.industry;

      const response = await getLocations(page, rowsPerPage, updatedQuery, {
        signal: locationApiController.current?.signal,
      });
      if (response?.statusCode === 200) {
        setData(response?.data?.locations);
        setPagination({
          ...response?.pagination,
          rowsPerPage: rowsPerPage,
        });
        setCounts(response?.data?.counts);
        setLoading(false);
      }
    } catch (error) {
      if (error?.code !== 'ERR_CANCELED' && error?.message) {
        toast.error(error?.message, {
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
        setLoading(false);
      }
    }
  };

  const handleSearch = (event) => {
    setSearchValue((prevState) => ({ ...prevState, search: event.target.value }));
  };

  const applyFilters = (query) => {
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

  const refetchLocations = () => {
    const params = {
      page: page + 1,
      rowsPerPage: pagination.rowsPerPage,
      query: formData,
    };
    fetchLocations(params);
  };

  const handleChangeStatus = (event, newValue) => {
    if (newValue !== undefined && newValue !== null) {
      setTab(newValue);
    }
  };

  const tableHead = () => {
    return (
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
          title={
            formData?.status == 0
              ? t('sales.locations.noLeadRequest')
              : t('sales.locations.noChangeRequest')
          }
        />
        {data.length > 0 &&
          data.map((row, rowIndex) => (
            <TableRow key={`${row.id}-${rowIndex}-${Date.now()}`}>
              {columns.map((column, columnIndex) =>
                column.id === columnIdsEnum.locationName ? (
                  <TableCell
                    onClick={(event) => {
                      if (row.status === 'pending') {
                        toggleDrawerPendingLocation(locationDrawerTypes.RIGHT, true, row)(event);
                      } else
                        toggleDrawerReviewLocation(locationDrawerTypes.RIGHT, true, row)(event);
                    }}
                    key={`${row.id}-${column.id}-${columnIndex}-${Date.now()}`}
                    className={column.className}
                  >
                    {renderTableCell(row, column)}
                  </TableCell>
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

  useEffect(() => {
    const params = {
      page: 1,
      rowsPerPage: pagination.rowsPerPage,
      query: formData,
    };
    fetchLocations(params);
  }, [searchValue, formData.assigned, formData.status, formData.locationAffiliation, tab]);

  useEffect(() => {
    const promises = [Promise.resolve(fetchCompanies())];
    Promise.allSettled(promises);
  }, []);

  useEffect(() => {
    if (locationStatus)
      setFormData((prevState) => ({ ...prevState, status: parseInt(locationStatus) }));
  }, [location?.search]);

  return (
    <Box className={classes.locationWrapper}>
      <Box className={classes.locationFilterBar}>
        <Box className={classes.filterLeftSide}>
          <ToggleButtonGroup
            className={classes.statesButtons}
            value={tab}
            exclusive
            onChange={handleChangeStatus}
          >
            <ToggleButton value={'pending'}>
              {t('sales.locations.newLeadsRequest')}
              <Box component="span" className={classes.pendingNumber}>
                {counts?.pending}
              </Box>
            </ToggleButton>
            <ToggleButton value={'changeReview'}>{t('sales.changeReview.title')}</ToggleButton>
          </ToggleButtonGroup>

          <SearchComponentWithQuery
            placeHolder={`${t('sales.locations.searchByID')}`}
            onSearch={handleSearch}
          />

          <Box className={classes.dropDownsFilters}>
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
                companiesPagination={companiesPagination}
                fetchCompanies={fetchCompanies}
                loadingCompaniesDropDown={loadingCompaniesDropDown}
              />
            ) : null}
          </Drawer>
        </Box>
        <Box className={classes.filterRightSide}>
          <Box className={classes.twoBtnWrapper}></Box>
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
          className={classes.locationTable}
          rowsPerPageOptions={paginationOptions.perPageOptions}
          onChangeRowsPerPage={onChangeRowsPerPage}
          rowsPerPage={pagination.rowsPerPage}
        />
      </Box>
      <Drawer
        anchor={locationDrawerTypes.RIGHT}
        open={openReviewLocationDrawer[locationDrawerTypes.RIGHT]}
        onClose={toggleDrawerReviewLocation(locationDrawerTypes.RIGHT, false)}
      >
        <ChangeReviewDrawer
          type="property"
          anchor={locationDrawerTypes.RIGHT}
          onCloseDrawer={(anchor) =>
            setOpenReviewLocationDrawer({
              ...openReviewLocationDrawer,
              [anchor]: false,
            })
          }
          width={796}
          data={openReviewLocationDrawer.locationData}
          refetch={refetchLocations}
        />
      </Drawer>
      <Drawer
        anchor={locationDrawerTypes.RIGHT}
        open={openPendingLocationDrawer[locationDrawerTypes.RIGHT]}
        onClose={toggleDrawerPendingLocation(locationDrawerTypes.RIGHT, false)}
      >
        <ApproveLocationDrawer
          anchor={locationDrawerTypes.RIGHT}
          approveLocationCloseDrawer={toggleDrawerPendingLocation(locationDrawerTypes.RIGHT, false)}
          width={796}
          locationData={openPendingLocationDrawer.locationData}
          refetchLocations={refetchLocations}
          isApproveableAndRejectable={formData.status === locationFilterStatus.PENDING}
        />
      </Drawer>
    </Box>
  );
};

export default LocationsListing;
