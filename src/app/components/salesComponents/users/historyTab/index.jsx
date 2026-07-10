import { Box, TableCell, TableRow, TableSortLabel } from '@mui/material';
import { ReactComponent as ChevronRight } from 'assets/svg/chevron-right.svg';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { locationSortingTypes } from 'salesComponents/users/newLocationsDrawer/location.constant';
import { getOfficerRunSheet } from 'services/runsheet.services';
import TableSkeleton from 'src/app/components/common/skeletonLoader/tableSkeleton';
import TableComponent from 'src/app/components/common/table/index.jsx';
import NoRecordFound from 'src/app/components/common/table/noRecordFound';
import { formatDate } from 'src/helper/utilityFunctions';
import { getDisplayConfiguration } from 'src/redux/store/slices/regionalCountryConfiguration';
import { paginationOptions, toastSettings } from 'src/utils/constants';
import { extractValuesByKeyFromInput } from 'src/utils/dropdownValueExtractor';

import { useStyles } from './historyTab.js';

const i18ColumnName = (t) => {
  return [
    {
      id: 'date',
      label: `${t('sales.users.historyDate')}`,
    },
    {
      id: 'title',
      label: `${t('sales.users.historyScout')}`,
    },
    {
      id: 'totalSites',
      label: `${t('sales.users.historyLocationsAllocated')}`,
    },
    {
      id: 'visitsCompleted',
      label: `${t('sales.users.historyVisitsCompleted')}`,
    },
  ];
};

const params = {
  page: paginationOptions.defaultPerPage,
  perPage: paginationOptions.perPageRows,
  search: '',
  sortBy: '',
  orderBy: '',
  scout: {},
  routeType: 'salesRoute',
};

const order = {
  orderBy: 'id',
  orderType: 'asc',
};

const columnIdsEnum = {
  date: 'date',
  report: 'report',
  totalSites: 'totalSites',
  visitsCompleted: 'visitsCompleted',
};

const HistoryTab = () => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { id: userId } = useParams('id');
  const { dateFormat } = useSelector(getDisplayConfiguration);
  const NA = t('commonText.nA');

  const classDealName = classes.dealNameTD;
  const columns = i18ColumnName(t, classDealName);
  const [data, setData] = useState([]);
  const [totalRows, setTotalRows] = useState(0);

  const [queryParams, setQueryParams] = useState(params);

  const [loading, setLoading] = useState(false);
  const [orderState, _setOrderState] = useState(order);

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
    if (column.id === columnIdsEnum.date) {
      return (
        <Box className={classes.franchiseName}>
          <Box className={classes.franchiseNameText}>
            {formatDate(row[column.id], dateFormat) || NA}
          </Box>
          <Box className={classes.franchiseNameIcon}>
            <ChevronRight />
          </Box>
        </Box>
      );
    }

    if (column.id === columnIdsEnum.totalSites || column.id === columnIdsEnum.visitsCompleted) {
      return <>{row[column.id] > -1 ? row[column.id] : 0}</>;
    }

    return <>{row[column.id] || NA}</>;
  };

  const sortDirection = (column) => {
    return orderState.orderBy === column.id ? orderState.orderType : false;
  };

  const orderDirection = (column) => {
    return orderState.orderBy === column.id ? orderState.orderType : locationSortingTypes.ASC;
  };

  const applySorting = (sortBy, orderBy) => {
    setQueryParams((prev) => ({
      ...prev,
      sortBy: sortBy,
      orderBy: orderBy,
    }));
  };

  /**
   * Fetch deals listing
   * @param {*} page
   * @param {*} query
   */
  const fetchHistories = async (queryParams) => {
    try {
      setLoading(true);

      const params = {
        ...queryParams,
        officerId: userId,
        scout:
          extractValuesByKeyFromInput(queryParams.scout, 'value') !== 'all'
            ? extractValuesByKeyFromInput(queryParams.scout, 'value')
            : '',
      };
      const response = await getOfficerRunSheet(params);
      if (response?.statusCode === 200) {
        setData(response?.data?.routes);
        const total = response?.data?.pagination?.totalCount;
        setTotalRows(total);
      }
    } catch (error) {
      if (error?.message) {
        /**
         * show error
         */
        toast.error(error?.message, {
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistories(queryParams);
  }, [queryParams]);

  const tableHead = () => {
    return (
      <>
        <TableRow className={classes.historyTableHead}>
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
      <TableSkeleton columns={columns} />
    ) : (
      <>
        <NoRecordFound data={data} noOfColumns={columns.length} t={t} />
        {data.length > 0 &&
          data?.map((row) => (
            <TableRow key={row.id}>
              {columns.map((column) => (
                <TableCell className={column.className} key={column.id}>
                  {renderTableCell(row, column)}
                </TableCell>
              ))}
            </TableRow>
          ))}
      </>
    );
  };

  return (
    <Box className={classes.dealsWrapper}>
      {/* {loading && <LoaderComponent size={50} color={'primary'} label={'Loading'} />} */}
      <Box className={classes.scoutingLeftArea}>
        <Box className={classes.locationListing}>
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
    </Box>
  );
};

export default HistoryTab;
