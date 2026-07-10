import { Box, TableCell, TableRow, TableSortLabel } from '@mui/material';
import { ReactComponent as ChevronRight } from 'assets/svg/chevron-right.svg';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import SearchComponentWithQuery from 'src/app/components/common/searchWithQuery';
import TableSkeleton from 'src/app/components/common/skeletonLoader/tableSkeleton';
import TableComponent from 'src/app/components/common/table';
import NoRecordFound from 'src/app/components/common/table/noRecordFound';
import { SALES_INDUSTRY_VERTICALS_DETAIL } from 'src/app/router/constant/ROUTE';
import { ACL_MARKET_VERTICALS_QUESTIONS_VIEW } from 'src/app/router/constant/SALESMODULE';
import history from 'src/app/router/utils/history';
import { useApiControllers } from 'src/helper/axios';
import { formatDate } from 'src/helper/utilityFunctions';
import { getDisplayConfiguration } from 'src/redux/store/slices/regionalCountryConfiguration';
import { getIndustryVericals } from 'src/services/industryVerticals.service';
import userHasPermission from 'src/utils/auth/userHasPermission';
import { paginationOptions } from 'src/utils/constants';

import { useStyles } from './IndustryVerticals';

const i18ColumnName = (t, hoverIconClass) => {
  return [
    {
      id: 'name',
      label: `${t('sales.industryVerticals.listingColumnsIndustries')}`,
      className: hoverIconClass,
    },
    {
      id: 'totalDeals',
      label: `${t('sales.industryVerticals.listingColumnsNumberOfQuestions')}`,
    },
    {
      id: 'totalCompanies',
      label: `${t('sales.industryVerticals.listingColumnsNumberOfCompanies')}`,
    },
    {
      id: 'createdSystem',
      label: `${t('sales.industryVerticals.listingColumnsSyncedFrom')}`,
    },
    {
      id: 'lastUpdatedAt',
      label: `${t('sales.industryVerticals.listingColumnsLastSynced')}`,
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
  rowsPerPage: paginationOptions.perPageRows,
  search: '',
  sortBy: '',
  orderBy: '',
};

const IndustryVerticals = () => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { dateFormat } = useSelector(getDisplayConfiguration);

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
      return <>{row[column.id] ? formatDate(row[column.id], dateFormat) : NA}</>;
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
                  onClick={() => {
                    userHasPermission(ACL_MARKET_VERTICALS_QUESTIONS_VIEW)
                      ? gotoDetailPage(column, row.id)
                      : void 0;
                  }}
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

  const onChangeRowsPerPage = async (event) => {
    setQueryParams((prev) => ({
      ...prev,
      page: 1,
      rowsPerPage: event.target.value,
    }));
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
    if (column.id === columnIdsEnum.industryName) {
      history.push(`${SALES_INDUSTRY_VERTICALS_DETAIL.replace(':id', rowId)}`);
    }
  };

  useEffect(() => {
    fetchIndustryVerticals(queryParams);
  }, [queryParams]);

  return (
    <Box className={classes.industryVerticals}>
      {/* {loading && <LoaderComponent size={50} color={'primary'} label={'Loading'} />} */}

      <Box className={classes.industryVerticalsHeader}>
        <SearchComponentWithQuery
          name="search"
          value={queryParams?.search}
          placeHolder={t('sales.companies.searchIndustrys')}
          onSearch={inputChangedHandler}
          className={classes.industryVerticalsHeaderSearch}
        />
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
          rowsPerPageOptions={paginationOptions.perPageOptions}
          onChangeRowsPerPage={onChangeRowsPerPage}
          rowsPerPage={queryParams.rowsPerPage}
        />
      </Box>
    </Box>
  );
};

export default IndustryVerticals;
