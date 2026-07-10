import { ReactComponent as ChevronRight } from 'assets/svg/chevron-right.svg';
import { ReactComponent as HoriToogleIcon } from 'assets/svg/HoriToogleIcon.svg';
import DateRangePicker from 'commonComponents/RangeDatepicker';
import CommonScoutingMap from 'commonComponents/scoutingMap';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { locationSortingTypes } from 'salesComponents/users/newLocationsDrawer/location.constant';
import { getMapRoutes, getScoutListings } from 'services/scout.service';
import CustomDropDown from 'src/app/components/common/customDropDown/index.jsx';
import SearchComponentWithQuery from 'src/app/components/common/searchWithQuery/index.jsx';
import TableSkeleton from 'src/app/components/common/skeletonLoader/tableSkeleton';
import TableComponent from 'src/app/components/common/table/index.jsx';
import NoRecordFound from 'src/app/components/common/table/noRecordFound';
import TableImage from 'src/app/components/common/tableImage';
import NoLocationFound from 'src/app/components/salesComponents/scouting/noLocationFound/index.jsx';
import { getDisplayConfiguration } from 'src/redux/store/slices/regionalCountryConfiguration';
import transformArrayForOptions from 'src/utils/array/transformArrayForOptions';
import { paginationOptions } from 'src/utils/constants';
import { defaultImage } from 'src/utils/constants/index.js';
import { extractValuesByKeyFromInput } from 'src/utils/dropdownValueExtractor';

const { Box, TableRow, TableCell, TableSortLabel, Skeleton } = require('@mui/material');

import classNames from 'classnames';
import { formatDate, isObjectEmpty } from 'src/helper/utilityFunctions';
import { useTenantLabel } from 'src/hooks/useTenantLabel.jsx';

import { useStyles } from './listing.js';

const dateFormatLocal = 'MM/DD/YYYY';

const i18ColumnName = (t, classDealName) => {
  return [
    {
      id: 'name',
      label: `${t('sales.scouting.name')}`,
      hasImage: true,
      className: classDealName,
    },
    {
      id: 'userType',
      label: `${t('sales.scouting.userType')}`,
    },
    {
      id: 'sitesVisited',
      label: `${t('sales.scouting.sitesVisited')}`,
    },
    {
      id: 'decisionMakerMeetings',
      label: `${t('sales.scouting.decisionMakerMeetings')}`,
    },
    {
      id: 'routeCreatedDate',
      label: `${t('sales.scouting.visitedDate')}`,
    },
  ];
};

const i18UserTypes = (t, getLabel) => [
  { value: 'all', name: `${t('sales.scouting.listingFiltersAll')}` },
  { value: 'Sales Manager', name: getLabel('roles', 'sales_manager') },
  { value: 'Sales Person', name: getLabel('roles', 'sales_person') },
];

const params = {
  pageNo: paginationOptions.defaultPerPage,
  rowsPerPage: paginationOptions.perPageRows,
  search: '',
  sortBy: '',
  orderBy: '',
  userType: {},
  createdDate: [null, null],
  windowEnd: null,
};

const order = {
  orderBy: 'id',
  orderType: 'asc',
};

const columnIdsEnum = {
  name: 'name',
  report: 'report',
  userType: 'userType',
  routeCreatedDate: 'routeCreatedDate',
};

const ScoutingListing = () => {
  const { getLabel } = useTenantLabel();

  const [rightAreaWidth, setRightAreaWidth] = useState('30%'); // Initial width of scoutingRightArea
  const [leftAreaWidth, setLeftAreaWidth] = useState('70%'); // Initial width of scoutingLeftArea

  const toggleDiv = () => {
    setRightAreaWidth('30%');
    setLeftAreaWidth('70%');
  };

  const toggleIcon = () => {
    setRightAreaWidth('0%');
    setLeftAreaWidth('100%');
  };
  const classes = useStyles();
  const { t } = useTranslation();
  const { dateFormat } = useSelector(getDisplayConfiguration);
  const classDealName = classes.dealNameTD;
  const columns = i18ColumnName(t, classDealName);
  const userTypeFilters = i18UserTypes(t, getLabel);
  const [data, setData] = useState([]);
  const [routeData, setRouteData] = useState([]);

  const [queryParams, setQueryParams] = useState(params);
  const [totalRows, setTotalRows] = useState(0);
  const [loading, setLoading] = useState(false);
  const [routeLoading, setRouteLoading] = useState(true);
  const [orderState, setOrderState] = useState(order);

  const [currentObject, setCurrentObject] = useState({});

  const handleChangePage = async (_, newPage) => {
    setQueryParams((prev) => ({
      ...prev,
      pageNo: newPage + 1,
    }));
  };

  const handleChangeRowsPerPage = (event) => {
    setQueryParams((prev) => ({
      ...prev,
      pageNo: paginationOptions.defaultPerPage,
      rowsPerPage: parseInt(event.target.value, 10),
    }));
  };

  const renderTableCell = (row, column) => {
    if (!row[column.id]) {
      return (
        <Box component="span" className={classes.emptS}>
          {t('commonText.nA')}
        </Box>
      );
    }

    if (column.id === columnIdsEnum.name) {
      return (
        <Box onClick={toggleDiv} className={classes.franchiseName}>
          <Box className={classes.assignToClass}>
            <TableImage className={classes.assignAvatar} imageUrl={row.image || defaultImage} />
            <Box component="span" className={classes.assignToText}>
              {row[column.id]}
            </Box>
          </Box>
          <Box className={classes.franchiseNameIcon}>
            <ChevronRight />
          </Box>
        </Box>
      );
    }

    if (column.id === columnIdsEnum.userType) {
      return <Box className={classes.userTypeCol}>{row[column.id]}</Box>;
    }

    if (column.id === columnIdsEnum.routeCreatedDate)
      return <>{formatDate(row[column.id], dateFormat) || t('commonText.nA')}</>;

    return <>{row[column.id]}</>;
  };

  const sortDirection = (column) => {
    return orderState.orderBy === column.id ? orderState.orderType : false;
  };

  const handleSort = (columnId) => {
    const isAsc = orderState.orderBy === columnId && orderState.orderType === 'asc';
    setOrderState({
      orderBy: columnId,
      orderType: isAsc ? 'desc' : 'asc',
    });
    applySorting(columnId, orderState.orderType);
  };

  const orderDirection = (column) => {
    return orderState.orderBy === column.id ? orderState.orderType : locationSortingTypes.ASC;
  };

  const applySorting = (sortBy, orderBy) => {
    setQueryParams((prev) => ({
      ...prev,
      sortBy: sortBy,
      orderBy: orderBy,
      pageNo: paginationOptions.defaultPerPage,
    }));
  };

  /**
   * Fetch scout listing
   * @param {*} page
   * @param {*} query
   */
  const fetchScouts = async (queryParams) => {
    setLoading(true);
    try {
      const params = {
        ...queryParams,
        userType:
          extractValuesByKeyFromInput(queryParams.userType, 'value') !== 'all'
            ? extractValuesByKeyFromInput(queryParams.userType, 'value')
            : '',
        createdDateStart: queryParams?.createdDate?.[0]
          ? formatDate(queryParams.createdDate?.[0], dateFormatLocal)
          : null,
        createdDateEnd: queryParams?.createdDate?.[1]
          ? formatDate(queryParams.createdDate?.[1], dateFormatLocal)
          : null,
      };
      const response = await getScoutListings(params);
      if (response && response?.statusCode === 200) {
        setData(response?.data?.routes || []);
        setRouteData([]);
        const total = response?.pagination?.totalCount;
        setTotalRows(total);
        setCurrentObject(response?.data?.routes?.[0] || {});
        if (response?.data?.routes?.length < 1 && isObjectEmpty(response?.data?.routes?.[0]))
          setRouteLoading(false);
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

  const fetchMapRoutes = async (routeId) => {
    setRouteLoading(true);
    try {
      const response = await getMapRoutes(routeId);
      if (response && response?.statusCode === 200) {
        setRouteData(response?.data?.visits || []);
      }
    } catch (error) {
      /**
       * show error in the corresponding field
       * parse errors in array format and set them in errorMessages
       * setErrorMessages(error)
       */
    } finally {
      setRouteLoading(false);
    }
  };

  const getClickedObjectVisits = (row) => {
    setRouteData([]);
    setCurrentObject(row);
    fetchMapRoutes(row.routeId);
  };

  useEffect(() => {
    fetchScouts(queryParams);
  }, [queryParams]);

  useEffect(() => {
    if (currentObject.routeId) fetchMapRoutes(currentObject.routeId);
  }, [currentObject]);

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
    const { name, value } = event.target;
    updateFormHandler(name, value);
  };
  const handleDateChange = (dates) => {
    if (dates && Array.isArray(dates)) {
      const [startDate, endDate] = dates;
      if (startDate && endDate) {
        setQueryParams((prevState) => ({
          ...prevState,
          createdDate: dates,
          pageNo: paginationOptions.defaultPerPage,
        }));
      } else {
        setQueryParams((prevState) => ({
          ...prevState,
          createdDate: [null, null],
          pageNo: paginationOptions.defaultPerPage,
        }));
      }
    }
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

  const applySelectedClass = (id) => {
    return `${currentObject.routeId === id && classes.selectedRowColor}`;
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
          title={t('sales.scouting.noScoutingRouteFound')}
          description={t('sales.scouting.noScoutingRouteFoundDesc')}
        />
        {data.length > 0 &&
          data?.map((row) => (
            <TableRow
              key={`${row.routeId}-${row.id}`}
              className={`${applySelectedClass(row.routeId)}`}
            >
              {columns.map((column) => (
                <TableCell
                  className={`${column.className}`}
                  key={column.id}
                  onClick={() => getClickedObjectVisits(row)}
                >
                  {renderTableCell(row, column)}
                </TableCell>
              ))}
            </TableRow>
          ))}
      </>
    );
  };

  return (
    <Box className={classes.scoutingWrapper}>
      {/* {loading && <LoaderComponent size={50} color={'primary'} label={'Loading'} />} */}
      <Box className={classes.scoutingLeftArea} style={{ flex: `0 0 ${leftAreaWidth}` }}>
        <Box className={classes.locationFilterBar}>
          <Box className={classes.filterLeftSide}>
            <SearchComponentWithQuery
              name="search"
              placeHolder={`${t('sales.scouting.search')}`}
              onSearch={inputChangedHandler}
            />

            <CustomDropDown
              name="userType"
              id="userType"
              // placeHolder={t('sales.scouting.allUsers')}
              options={transformArrayForOptions(userTypeFilters, 'name', 'value') || []}
              selectedValues={queryParams.userType}
              label={t('sales.scouting.userType')}
              handleChange={inputChangedHandler}
              className={classes.dropHigh}
              placeHolderClassName={classes.placeHolderSize}
            />
          </Box>
          <Box className={classes.filterRightSide}>
            <Box className={classes.reportsListingsHeaderRightDate}>
              <DateRangePicker
                format={dateFormat}
                placeHolder={`${dateFormat} - ${dateFormat}`}
                selectedDates={queryParams?.createdDate || [null, null]}
                setDates={(dates) => {
                  handleDateChange(dates);
                }}
              />
            </Box>
          </Box>
        </Box>
        <Box className={classNames(classes.locationListing)}>
          <TableComponent
            data={data}
            columns={columns}
            tableHead={tableHead}
            tableBody={tableBody}
            pagination={true}
            page={queryParams.pageNo - 1}
            rowsPerPage={queryParams.rowsPerPage}
            rowsPerPageOptions={paginationOptions.perPageOptions}
            totalRecords={totalRows}
            handleChangePage={handleChangePage}
            onChangeRowsPerPage={handleChangeRowsPerPage}
            applySorting={applySorting}
          />
        </Box>
      </Box>
      {toggleIcon && (
        <Box className={classes.scoutingRightArea} style={{ flex: `0 0 ${rightAreaWidth}` }}>
          <Box onClick={toggleIcon} className={classes.toggleIcon}>
            <HoriToogleIcon />
          </Box>

          <Box className={classes.mapWraper}>
            {/* Add Map Code inside this BOX */}
            {routeLoading ? (
              <Skeleton animation="wave" variant="rounded" width="100%" height="100%" />
            ) : !routeLoading && routeData.length > 0 ? (
              <CommonScoutingMap
                createOrUpdate={false}
                mapCenter={routeData?.[0].coordinates}
                routeData={routeData}
              />
            ) : (
              <NoLocationFound />
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default ScoutingListing;
