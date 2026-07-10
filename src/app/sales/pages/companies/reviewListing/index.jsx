import { Drawer, TableCell, TableRow, TableSortLabel } from '@mui/material';
import { Box, Chip, Tooltip } from '@mui/material';
import { ReactComponent as ChevronRight } from 'assets/svg/chevron-right.svg';
import { ReactComponent as InfoIcon } from 'assets/svg/info.svg';
import TableComponent from 'commonComponents/table';
import { defaultImage, paginationOptions, toastSettings } from 'globalUtils/constants';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import TableSkeleton from 'src/app/components/common/skeletonLoader/tableSkeleton';
import NoRecordFound from 'src/app/components/common/table/noRecordFound';
import TableImage from 'src/app/components/common/tableImage';
import ChangeReviewDrawer from 'src/app/components/salesComponents/components/changeReview';
import Filters from 'src/app/components/salesComponents/filters/companyListings';
import { locationDrawerTypes } from 'src/app/components/salesComponents/users/newLocationsDrawer/location.constant';
import { useApiControllers } from 'src/helper/axios';
import { formatDate } from 'src/helper/utilityFunctions';
import { getDisplayConfiguration } from 'src/redux/store/slices/regionalCountryConfiguration';
import { getCompanies } from 'src/services/company.service';
import { KEY } from 'src/utils/constants/events/keyPressEvents';
import { formatCurrencyWithCommasAndSuffix } from 'src/utils/currencyFormater';
import { capitalizeFirstLetter, getChipColor, spMapping } from 'src/utils/string/common';

import { useStyles } from './listingStyle';

const perPage = paginationOptions.perPageRows;

const order = {
  orderBy: 'id',
  orderType: 'asc',
};

const emptyQuery = {
  industryType: [],
  createdDate: [null, null],
  lastActivityDate: [null, null],
  lastModifiedDate: [null, null],
  cities: [],
  states: [],
  parentCompanyIds: [],
};

const CompaniesReview = () => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { symbol, dateFormat } = useSelector(getDisplayConfiguration);

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalRows, setTotalRows] = useState(0);
  const [page, setPage] = useState(0);
  const [query, setQuery] = useState(emptyQuery);
  const { getNewApiController } = useApiControllers();
  const [orderState, setOrderState] = useState(order);
  const NA = t('commonText.nA');
  const [pagination, setPagination] = useState({ currentPage: 0, totalCount: 0, rowsPerPage: 10 });

  const [openCompanyReviewDrawer, setOpenCompanyReviewDrawer] = useState({
    right: false,
    company: null,
  });

  const toggleDrawer = (anchor, open, company) => (event) => {
    if (event.type === KEY.UP && (event.key === KEY.TAB || event.key === KEY.SHIFT)) {
      return;
    }
    setOpenCompanyReviewDrawer({ ...openCompanyReviewDrawer, [anchor]: open, company });
  };

  const i18Columns = [
    {
      id: 'name',
      label: t('sales.companies.companyName'),
      className: classes.companyNameTD,
      sortable: true,
    },
    {
      id: 'parentCompany',
      label: t('sales.locations.parentCompany'),
    },
    {
      id: 'ownerName',
      label: t('sales.companies.companyOwner'),
      hasImage: true,
      className: classes.textCapitalize,
      sortable: true,
    },
    { id: 'industry', label: t('sales.companies.industry'), sortable: true },

    { id: 'subVertical', label: t('sales.companies.subMarketVertical'), sortable: false },

    { id: 'dealsWon', label: t('sales.companies.dealsWon') },
    { id: 'phoneNumber', label: t('sales.companies.phoneNumber') },
    { id: 'address', label: t('sales.companies.address') },
    { id: 'city', label: t('sales.companies.city') },
    { id: 'state', label: t('sales.companies.state') },
    { id: 'country', label: t('sales.companies.country') },
    { id: 'postalCode', label: t('sales.companies.zipCode') },
    { id: 'companyDomain', label: t('sales.companies.companyDomain') },
    { id: 'createDate', label: t('sales.companies.createDate'), sortable: true },
    { id: 'lastActivityDate', label: t('sales.companies.lastActivity'), sortable: true },
    { id: 'lastModifiedDate', label: t('sales.companies.lastModify'), sortable: true },
    { id: 'revenue', label: t('sales.companies.revenue') },
    { id: 'numberOfLocations', label: t('sales.companies.noOfLocations') },
    { id: 'isPublic', label: t('sales.companies.publicPrivate') },
    { id: 'strategicPartnershipStatus', label: t('sales.companies.strategicPartnership') },
    { id: 'foundedYear', label: t('sales.companies.yearFounded') },
    { id: 'naicsCodes', label: t('sales.companies.naicsCodes') },
  ];

  const fetchCompanies = async ({ page, query, rowsPerPage = 10 }) => {
    query = {
      ...query,
      createdDateStart: query?.createdDate?.[0] ? formatDate(query.createdDate?.[0]) : null,
      createdDateEnd: query?.createdDate?.[1] ? formatDate(query.createdDate?.[1]) : null,
      lastActivityDateStart: query?.lastActivityDate?.[0]
        ? formatDate(query.lastActivityDate?.[0])
        : null,
      lastActivityDateEnd: query?.lastActivityDate?.[1]
        ? formatDate(query.lastActivityDate?.[1])
        : null,
      lastModifiedDateStart: query?.lastModifiedDate?.[0]
        ? formatDate(query.lastModifiedDate?.[0])
        : null,
      lastModifiedDateEnd: query?.lastModifiedDate?.[1]
        ? formatDate(query.lastModifiedDate?.[1])
        : null,
    };

    const apiController = getNewApiController();
    try {
      setLoading(true);
      const newQuery = { ...query };

      let cityIds = [];
      let stateIds = [];

      if (newQuery?.states?.length) stateIds = newQuery?.states.map((state) => state?.value);
      if (newQuery?.cities?.length) cityIds = newQuery?.cities.map((city) => city?.value);

      delete newQuery.states;
      delete newQuery.cities;
      delete newQuery.parentCompany;

      const updatedQuery = {
        ...newQuery,
        stateIds,
        cityIds,
        changeRequest: true,
      };
      const response = await getCompanies(page, rowsPerPage, updatedQuery, {
        signal: apiController.signal,
      });
      if (response?.statusCode === 200) {
        setData(response?.data.companies);
        setPagination({
          ...response?.pagination,
          rowsPerPage: rowsPerPage,
        });
        setTotalRows(response.pagination.totalCount);
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

  const onChangeRowsPerPage = async (event) => {
    setPagination((prev) => ({
      ...prev,
      currentPage: 1,
      rowsPerPage: event.target.value,
    }));
    setPage(pagination.currentPage);

    const query_params = {
      ...query,
      strategicPartnershipStatus: query?.strategicPartnershipStatus?.id
        ? query?.strategicPartnershipStatus?.id
        : null,
    };

    const params = {
      page: 1,
      rowsPerPage: event.target.value,
      query: query_params,
    };
    await fetchCompanies(params);
  };

  const handleChangePage = async (_, newPage) => {
    setPage(newPage);

    const query_params = {
      ...query,
      strategicPartnershipStatus: query?.strategicPartnershipStatus?.id
        ? query?.strategicPartnershipStatus?.id
        : null,
    };

    const params = {
      page: newPage + 1,
      rowsPerPage: pagination.rowsPerPage,
      query: query_params,
    };
    await fetchCompanies(params);
  };

  const applyFilters = (query) => {
    setPage(0);
    query = {
      ...query,
      strategicPartnershipStatus: query?.strategicPartnershipStatus?.id
        ? query?.strategicPartnershipStatus?.id
        : null,
    };

    const params = {
      page: 1,
      rowsPerPage: pagination.rowsPerPage,
      query: query,
    };
    fetchCompanies(params);
  };

  const renderTableCell = (row, column) => {
    if (row[column.id] && row[column.id] === null) {
      return <Box component="span">{NA}</Box>;
    }
    if (column.id === 'ownerName') {
      return (
        <>
          {row?.ownerName ? (
            <Box className={classes.assignToClass}>
              <TableImage className={classes.assignAvatar} imageUrl={row.image || defaultImage} />
              <Box component="span" className={classes.assignToText}>
                {row[column.id]}
              </Box>
            </Box>
          ) : (
            NA
          )}
        </>
      );
    }

    if (column.id === 'name') {
      return (
        <Box className={classes.companyName}>
          <Box className={classes.companyNameText}>
            {capitalizeFirstLetter(row[column.id]) || NA}
          </Box>
          <Box className={classes.companyNameIcon}>
            <ChevronRight />
          </Box>
        </Box>
      );
    }
    if (row[column.id] === 0) {
      return <>{row[column.id]}</>;
    }

    if (column.id === 'parentCompany') {
      return <>{capitalizeFirstLetter(row[column.id]) || NA}</>;
    }

    if (column.id === 'industry') {
      const label = row.industry?.label;
      return <>{label != null && String(label).trim() !== '' ? String(label) : NA}</>;
    }

    if (column.id === 'revenue') {
      return <>{`${symbol}${formatCurrencyWithCommasAndSuffix(row.revenue)}` || NA}</>;
    }

    if (column.id === 'address') {
      return <>{`${row.address} ${row.address2}` || NA}</>;
    }

    if (column.id == 'isPublic') {
      if (row[column.id] === null) {
        return <>{NA}</>;
      }
      return <>{row[column.id] ? t('sales.companies.public') : t('sales.companies.private')}</>;
    }

    if (
      column.id === 'createDate' ||
      column.id === 'lastActivityDate' ||
      column.id === 'lastModifiedDate'
    )
      return <>{formatDate(row[column.id], dateFormat) || NA}</>;

    if (column.id === 'strategicPartnershipStatus') {
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
              <span>{NA}</span>
            )}
          </Box>
        </Box>
      );
    }

    return <>{row[column.id] || NA}</>;
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
    setQuery((prev) => ({
      ...prev,
      sortBy: sortBy,
      orderBy: orderBy,
    }));
    const params = {
      page: 1,
      rowsPerPage: pagination.rowsPerPage,
      query: { ...query, sortBy: sortBy, orderBy: orderBy },
    };
    fetchCompanies(params);
  };

  const tableHead = () => {
    return (
      <>
        <TableRow>
          {i18Columns.map((column) => (
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
      </>
    );
  };

  const tableBody = (data, i18Columns) => {
    return loading ? (
      <TableSkeleton columns={i18Columns} />
    ) : (
      <>
        <NoRecordFound
          data={data}
          noOfColumns={i18Columns.length}
          t={t}
          title={t('sales.locations.noChangeRequest')}
        />
        {data.length > 0 &&
          data.map((row) => (
            <TableRow key={row.id}>
              {i18Columns.map((column) =>
                column.id === 'name' ? (
                  <TableCell
                    onClick={(event) => toggleDrawer(locationDrawerTypes.RIGHT, true, row)(event)}
                    key={column.id}
                    className={column.className}
                  >
                    {renderTableCell(row, column)}
                  </TableCell>
                ) : (
                  <TableCell className={column.className} key={column.id}>
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
    const promises = [Promise.resolve(fetchCompanies({ page: page + 1, query }))];
    Promise.allSettled(promises);
  }, []);

  return (
    <Box className={classes.companiesWraper}>
      <Filters
        query={query}
        showButtons={{ review: false, create: false, export: false }}
        setQuery={setQuery}
        applyFilters={applyFilters}
        emptyQuery={emptyQuery}
        styledClass={classes.companiesFilter}
        fetchCompanies={fetchCompanies}
      />
      <TableComponent
        data={data}
        columns={i18Columns}
        tableHead={tableHead}
        tableBody={tableBody}
        pagination={true}
        page={pagination?.currentPage - 1}
        perPage={pagination?.rowsPerPage || perPage}
        totalRecords={totalRows}
        handleChangePage={handleChangePage}
        rowsPerPageOptions={paginationOptions.perPageOptions}
        onChangeRowsPerPage={onChangeRowsPerPage}
        rowsPerPage={pagination.rowsPerPage}
        scrollToCenter={!loading && !data.length}
      />
      <Drawer
        anchor={locationDrawerTypes.RIGHT}
        open={openCompanyReviewDrawer[locationDrawerTypes.RIGHT]}
        onClose={toggleDrawer(locationDrawerTypes.RIGHT, false)}
      >
        <ChangeReviewDrawer
          type="company"
          anchor={locationDrawerTypes.RIGHT}
          onCloseDrawer={(anchor) =>
            setOpenCompanyReviewDrawer({
              ...openCompanyReviewDrawer,
              [anchor]: false,
            })
          }
          width={796}
          data={openCompanyReviewDrawer.company}
          refetch={() => fetchCompanies({ page: 1, query })}
        />
      </Drawer>
    </Box>
  );
};

export default CompaniesReview;
