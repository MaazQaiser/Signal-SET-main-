import { Box, Button, TableCell, TableRow, TableSortLabel, Typography } from '@mui/material';
import { ReactComponent as ChevronRight } from 'assets/svg/chevron-right.svg';
// import ResponsiveDatePickers from 'commonComponents/datePicker';
import DateRangePicker from 'commonComponents/RangeDatepicker';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import TableSkeleton from 'src/app/components/common/skeletonLoader/tableSkeleton';
import TableComponent from 'src/app/components/common/table';
import NoRecordFound from 'src/app/components/common/table/noRecordFound';
// import { SALES_INDUSTRY_VERTICALS_DETAIL } from 'src/app/router/constant/ROUTE';
import { SALES_DASHBOARD } from 'src/app/router/constant/ROUTE';
import { SALES_DEAL } from 'src/app/router/constant/ROUTE.jsx';
import history from 'src/app/router/utils/history';
import { BackIcon } from 'src/assets/svg';
import { useApiControllers } from 'src/helper/axios';
import { formatDate, removeKeysFromObject } from 'src/helper/utilityFunctions';
import { getDisplayConfiguration } from 'src/redux/store/slices/regionalCountryConfiguration';
import { getIndustryVericals, getProposalLostSales } from 'src/services/industryVerticals.service';
import { paginationOptions } from 'src/utils/constants';
import { fomatNumbersWithCommas } from 'src/utils/currencyFormater';
import { capitalizeFirstLetter } from 'src/utils/string/common';

import { useStyles } from './listingDashboard';

const i18ColumnName = (t, hoverIconClass) => {
  return [
    {
      id: 'location',
      label: `${t('sales.dashboard.property')}`,
      className: hoverIconClass,
    },
    {
      id: 'proposalDate',
      label: `${t('sales.dashboard.proposalDate')}`,
    },
    {
      id: 'amount',
      label: `${t('sales.dashboard.amount')}`,
    },
    {
      id: 'terms',
      label: `${t('sales.dashboard.terms')}`,
    },
    {
      id: 'ownerName',
      label: `${t('sales.dashboard.ownerName')}`,
    },
  ];
};

const columnIdsEnum = {
  id: 'id',
  location: 'location',
  name: 'name',
  lastUpdatedAt: 'lastUpdatedAt',
  proposalDate: 'proposalDate',
  amount: 'amount',
  terms: 'terms',
  dealOwnerName: 'ownerName',
};

const order = {
  orderBy: 'id',
  orderType: 'asc',
};

const params = {
  page: 1,
  perPage: paginationOptions.perPageRows,
  search: '',
  sortBy: '',
  orderBy: '',
  startDate: null,
  endDate: null,
  selectedDates: [],
};

const calledFromEnum = {
  dashboard: 'dashboard',
  detail: 'detail',
};

const ProposalLost = ({ calledFrom }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { symbol, dateFormat } = useSelector(getDisplayConfiguration);

  const NA = t('commonText.nA');

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalRows, setTotalRows] = useState(0);
  const [queryParams, setQueryParams] = useState({
    ...params,
    perPage: calledFrom === calledFromEnum.dashboard ? 5 : paginationOptions.perPageRows,
  });
  const [pagination, setPagination] = useState({ currentPage: 0, totalCount: 0, rowsPerPage: 10 });
  const [page, setPage] = useState(0);
  const hoverIconClass = classes.industryNameTD;
  const columns = i18ColumnName(t, hoverIconClass);
  const { getNewApiController } = useApiControllers();

  const _fetchIndustryVerticals = async (queryParams) => {
    const apiController = getNewApiController();
    setLoading(true);
    try {
      const response = await getIndustryVericals(queryParams, { signal: apiController.signal });
      if (response?.statusCode === 200) {
        setData(response?.data?.industryVerticals || []);
        setTotalRows(response?.pagination?.totalCount);
      }
      setLoading(false);
    } catch (error) {
      if (!apiController.signal.aborted) {
        setLoading(false);
      }
    }
  };

  const fetchLostProposalsData = async ({ page, queryParams, rowsPerPage = 10 }) => {
    const apiController = getNewApiController();
    setLoading(true);
    try {
      let params = {
        ...queryParams,
        startDate: queryParams.selectedDates[0]
          ? dayjs(queryParams.selectedDates[0]).format('MM/DD/YYYY')
          : '',
        endDate: queryParams.selectedDates[1]
          ? dayjs(queryParams.selectedDates[1]).format('MM/DD/YYYY')
          : '',
      };
      params = removeKeysFromObject(params, ['selectedDates']);
      const response = await getProposalLostSales(page, rowsPerPage, params, {
        signal: apiController.signal,
      });
      if (response?.statusCode === 200) {
        setData(response?.data?.proposalLost || []);
        setPagination({
          ...response?.pagination,
          rowsPerPage: rowsPerPage,
        });
        setTotalRows(response.pagination.totalCount);
      }
      setLoading(false);
    } catch (error) {
      if (!apiController.signal.aborted) {
        setLoading(false);
      }
    }
  };

  const renderTableCell = (row, column) => {
    if (column.id == columnIdsEnum.proposalDate)
      return <>{row[column.id] ? formatDate(new Date(row[column.id]), dateFormat) : NA}</>;
    if (column.id === columnIdsEnum.name) {
      return (
        <Box className={classes.industryName}>
          <Box className={classes.industryNameText}>{capitalizeFirstLetter(row[column.id])}</Box>
          <Box className={classes.industryNameIcon}>
            <ChevronRight />
          </Box>
        </Box>
      );
    }
    if (column.id === columnIdsEnum.location) {
      return (
        <Box className={classes.industryName}>
          <Box className={classes.industryNameText}>{capitalizeFirstLetter(row[column.id])}</Box>
          <Box className={classes.industryNameIcon}>
            <ChevronRight />
          </Box>
        </Box>
      );
    }
    if (column.id === columnIdsEnum.amount) {
      return <>{row[column.id] ? `${symbol}${fomatNumbersWithCommas(row[column.id])}` : NA}</>;
    }

    if (column.id === columnIdsEnum.terms) {
      return <>{row[column.id] ? t(`sales.contract.${row[column.id]}`) : NA}</>;
    }

    if (column.id === columnIdsEnum.location) {
      return (
        <Box className={classes.industryName}>
          <Box className={classes.industryNameText}>{capitalizeFirstLetter(row[column.id])}</Box>
          <Box className={classes.industryNameIcon}>
            <ChevronRight />
          </Box>
        </Box>
      );
    }

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
      page: paginationOptions.defaultPerPage,
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
      <TableSkeleton numberOfRows={5} columns={columns} />
    ) : (
      <>
        <NoRecordFound data={data} noOfColumns={columns.length} t={t} />
        {data.map((row, rowIndex) => (
          <TableRow key={row.id || rowIndex}>
            {columns.map((column, columnIndex) => {
              const showHandCursor = column.id === columnIdsEnum.name ? 'pointer' : '';
              return column.id === columnIdsEnum.location ? (
                <TableCell
                  key={`${row.id}-${column.id}-${columnIndex}`}
                  onClick={() => gotoDealDetail(column, row?.dealId)}
                  sx={{ cursor: showHandCursor }}
                  className={column.className}
                >
                  {renderTableCell(row, column)}
                </TableCell>
              ) : (
                <TableCell
                  key={`${row.id}-${column.id}-${columnIndex}`}
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

  const gotoDealDetail = (column, rowId) => {
    history.push(`${SALES_DEAL}/${rowId}`);
  };

  // const inputChangedHandler = (event) => {
  //   // Get name of changed input, and its corresponding value
  //   const { name, value } = event.target;
  //   // Update form state against the target input field
  //   updateFormHandler(name, value);
  // };
  //
  // const handleDateChange = (value) => {
  //   inputChangedHandler({ target: { name: 'windowStart', value: dayjs(value) } });
  // };

  const handleChangePage = async (_, newPage) => {
    setPage(newPage);
    const params = {
      page: newPage + 1,
      rowsPerPage: pagination.rowsPerPage,
      queryParams: queryParams,
    };
    await fetchLostProposalsData(params);
    // setQueryParams((prev) => ({
    //   ...prev,
    //   page: newPage + 1,
    // }));
  };

  useEffect(() => {
    // fetchIndustryVerticals(queryParams);
    fetchLostProposalsData({ page: page + 1, queryParams });
  }, [queryParams]);

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

    /**
     * API call to get next page items for location
     */
    const params = {
      page: 1,
      rowsPerPage: event.target.value,
      queryParams: queryParams,
    };
    await fetchLostProposalsData(params);
  };

  const handleBack = () => {
    history.push(SALES_DASHBOARD);
  };

  return (
    <Box className={classes.industryVerticals}>
      {/* {loading && <LoaderComponent size={50} color={'primary'} label={'Loading'} />} */}
      {calledFrom !== calledFromEnum.dashboard && (
        <>
          <Box>
            <Button variant="tertiaryGrey" startIcon={<BackIcon />} onClick={handleBack}>
              {t('links.back')}
            </Button>
          </Box>
          <Box className={classes.proposalWonHeader}>
            {/*<ResponsiveDatePickers*/}
            {/*  value={queryParams?.windowStart}*/}
            {/*  views={['month', 'year']}*/}
            {/*  onChange={handleDateChange}*/}
            {/*  format={null}*/}
            {/*  placeholder="February 2024"*/}
            {/*/>*/}
            <Typography variant="h1">{t('sales.dashboard.proposalLost')}</Typography>

            <Box className={classes.reportsListingsHeaderRightDate}>
              <DateRangePicker
                placeHolder={`${dateFormat} - ${dateFormat}`}
                format={dateFormat}
                selectedDates={queryParams?.selectedDates}
                setDates={(dates) => {
                  updateFormHandler('selectedDates', dates);
                }}
              />
            </Box>
          </Box>
        </>
      )}
      <Box className={classes.industryVerticalsTable}>
        <TableComponent
          data={data}
          columns={columns}
          tableHead={tableHead}
          tableBody={tableBody}
          pagination={calledFrom === calledFromEnum.dashboard ? false : true}
          page={queryParams.page - 1}
          perPage={queryParams.perPage}
          totalRecords={totalRows}
          handleChangePage={handleChangePage}
          rowsPerPageOptions={paginationOptions.perPageOptions}
          onChangeRowsPerPage={onChangeRowsPerPage}
          rowsPerPage={pagination.rowsPerPage}
        />
      </Box>
    </Box>
  );
};

ProposalLost.propTypes = {
  perPage: PropTypes.number,
  calledFrom: PropTypes.oneOf([calledFromEnum.dashboard, calledFromEnum.detail]),
};

ProposalLost.defaultProps = {
  perPage: paginationOptions.perPageRows,
  calledFrom: calledFromEnum.detail,
};

export default ProposalLost;
