import { Box, TableCell, TableRow, TableSortLabel, Typography } from '@mui/material';
import { ReactComponent as ChevronRight } from 'assets/svg/chevron-right.svg';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ResponsiveDatePickers from 'src/app/components/common/datePicker';
import TableSkeleton from 'src/app/components/common/skeletonLoader/tableSkeleton';
import TableComponent from 'src/app/components/common/table';
import NoRecordFound from 'src/app/components/common/table/noRecordFound';
// import { SALES_INDUSTRY_VERTICALS_DETAIL } from 'src/app/router/constant/ROUTE';
// import { SALES_DASHBOARD_DETAILS_ROUTE } from 'src/app/router/constant/ROUTE';
// import history from 'src/app/router/utils/history';
import { useApiControllers } from 'src/helper/axios';
import { formatDate } from 'src/helper/utilityFunctions';
import { getIndustryVericals } from 'src/services/industryVerticals.service';
import { paginationOptions } from 'src/utils/constants';

// import { monthAbbr } from 'src/utils/date';
import { useStyles } from './dashboardDetails.js';

const i18ColumnName = (t, hoverIconClass) => {
  return [
    {
      id: 'name',
      label: `${t('sales.dashboard.property')}`,
      className: hoverIconClass,
    },
    {
      id: 'totalDeals',
      label: `${t('sales.dashboard.proposalDate')}`,
    },
    {
      id: 'totalCompanies',
      label: `${t('sales.dashboard.amount')}`,
    },
    {
      id: 'createdSystem',
      label: `${t('sales.dashboard.terms')}`,
    },
  ];
};

const columnIdsEnum = {
  id: 'id',
  industryName: 'name',
  lastUpdatedAt: 'lastUpdatedAt',
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
};

const DashboardDetails = () => {
  const classes = useStyles();
  const { t } = useTranslation();

  const NA = t('commonText.nA');

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalRows, setTotalRows] = useState(0);
  const [queryParams, setQueryParams] = useState(params);
  const hoverIconClass = classes.industryNameTD;
  const columns = i18ColumnName(t, hoverIconClass);
  const { getNewApiController } = useApiControllers();

  const fetchIndustryVerticals = async (queryParams) => {
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

  const renderTableCell = (row, column) => {
    if (column.id == columnIdsEnum.lastUpdatedAt)
      return <>{row[column.id] ? formatDate(new Date(row[column.id]), 'MM/DD/YYYY') : NA}</>;
    if (column.id === columnIdsEnum.industryName) {
      return (
        <Box className={classes.industryName}>
          <Box className={classes.industryNameText}>{row[column.id]}</Box>
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
      <TableSkeleton numberOfRows={10} columns={columns} />
    ) : (
      <>
        <NoRecordFound data={data} noOfColumns={columns.length} t={t} />
        {data.map((row) => (
          <TableRow key={row.id}>
            {columns.map((column) => {
              const showHandCursor = column.id === columnIdsEnum.industryName ? 'pointer' : '';
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

  const handleChangePage = async (_, newPage) => {
    setQueryParams((prev) => ({
      ...prev,
      page: newPage + 1,
    }));
  };

  useEffect(() => {
    fetchIndustryVerticals(queryParams);
  }, [queryParams]);
  const handleDateChange = (value) => {
    inputChangedHandler({ target: { name: 'windowStart', value: dayjs(value) } });
  };
  return (
    <Box className={classes.industryVerticals}>
      {/* {loading && <LoaderComponent size={50} color={'primary'} label={'Loading'} />} */}

      <Box className={classes.proposalWonHeader}>
        <Typography variant="h1">{t('sales.dashboard.proposalsWon')}</Typography>
        {/* <Typography variant="h1">Proposals Lost</Typography> */}
        <Box className={classes.reportsListingsHeaderRightDate}>
          <ResponsiveDatePickers
            value={queryParams?.windowStart}
            views={['month', 'year']}
            onChange={handleDateChange}
            format={null}
            placeholder={t('sales.dashboard.datePlaceholder')}
          />
        </Box>
      </Box>

      <Box className={classes.industryVerticalsTable}>
        <TableComponent
          data={data}
          columns={columns}
          tableHead={tableHead}
          tableBody={tableBody}
          pagination={true}
          page={queryParams.page - 1}
          perPage={queryParams.perPage}
          totalRecords={totalRows}
          handleChangePage={handleChangePage}
        />
      </Box>
    </Box>
  );
};

export default DashboardDetails;
