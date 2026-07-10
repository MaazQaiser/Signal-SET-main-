import { Box, Drawer, Link, TableCell, TableRow, TableSortLabel } from '@mui/material';
import { ApprovedIcon, PendingIcon, PendingIconContact } from 'assets/svg';
import { ReactComponent as ChevronRight } from 'assets/svg/chevron-right.svg';
import { ReactComponent as DetailEmailIcon } from 'assets/svg/DetailEmailIcon.svg';
import classNames from 'classnames';
import DateRangePicker from 'commonComponents/RangeDatepicker';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import SearchComponentWithQuery from 'src/app/components/common/searchWithQuery/index.jsx';
import TableSkeleton from 'src/app/components/common/skeletonLoader/tableSkeleton';
import TableComponent from 'src/app/components/common/table/index.jsx';
import NoRecordFound from 'src/app/components/common/table/noRecordFound';
import TableImage from 'src/app/components/common/tableImage';
import ChangeReviewDrawer from 'src/app/components/salesComponents/components/changeReview';
import { locationDrawerTypes } from 'src/app/components/salesComponents/users/newLocationsDrawer/location.constant';
import { useApiControllers } from 'src/helper/axios';
import { formatDate } from 'src/helper/utilityFunctions.js';
import { getDisplayConfiguration } from 'src/redux/store/slices/regionalCountryConfiguration';
import { getContacts } from 'src/services/contact.service';
import { paginationOptions, toastSettings } from 'src/utils/constants';
import { KEY } from 'src/utils/constants/events/keyPressEvents';
import { defaultImage } from 'src/utils/constants/index.js';
import { formatISOTimestampToDate } from 'src/utils/date';
import { capitalizeFirstLetter } from 'src/utils/string/common';

import { contactTypes } from '../listing/contacts.constant';
import { useStyles } from './listing.js';

const i18ColumnName = (t, companyNameTD) => {
  return [
    {
      id: 'fullName',
      label: `${t('sales.contacts.name')}`,
      sortable: true,
      className: companyNameTD,
    },
    {
      id: 'email',
      label: `${t('sales.contacts.email')}`,
    },
    {
      id: 'phone',
      label: `${t('sales.contacts.phoneNumber')}`,
    },
    {
      id: 'jobtitle',
      label: `${t('sales.contacts.jobTitle')}`,
    },
    {
      id: 'createDate',
      label: t('sales.deals.createDate'),
      sortable: true,
    },
    {
      id: 'lastModifiedBy',
      label: `${t('sales.contacts.lastModifiedBy')}`,
    },
  ];
};

const params = {
  pageNo: paginationOptions.defaultPerPage,
  rowsPerPage: paginationOptions.perPageRows,
  search: '',
  sortBy: '',
  orderBy: '',
  createdDate: [null, null],
  changeRequest: true,
};

const order = {
  orderBy: 'id',
  orderType: 'asc',
};

const columnIdsEnum = {
  fullName: 'fullName',
  name: 'name',
  status: 'status',
  createDate: 'createDate',
  email: 'email',
};

const ContactsReviewsListing = () => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { dateFormat } = useSelector(getDisplayConfiguration);

  const companyNameTD = classes.companyNameTD;
  const columns = i18ColumnName(t, companyNameTD);
  const [data, setData] = useState([]);
  const { getNewApiController } = useApiControllers();
  const [loading, setLoading] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [orderState, setOrderState] = useState(order);
  const [selectedItems, setSelectedItems] = useState([]);

  const [queryParams, setQueryParams] = useState(params);

  const [openContactReviewDrawer, setOpenContactReviewDrawer] = useState({
    right: false,
    contact: null,
  });

  const toggleDrawer = (anchor, open, contact) => (event) => {
    if (event.type === KEY.UP && (event.key === KEY.TAB || event.key === KEY.SHIFT)) {
      return;
    }
    setOpenContactReviewDrawer({ ...openContactReviewDrawer, [anchor]: open, contact });
  };

  const handleDateChange = (dates) => {
    if (dates && Array.isArray(dates)) {
      const [startDate, endDate] = dates;
      if (startDate && endDate) {
        setQueryParams((prevState) => ({
          ...prevState,
          createdDate: dates,
        }));
      } else {
        setQueryParams((prevState) => ({
          ...prevState,
          createdDate: [null, null],
        }));
      }
    }
  };

  const handleSearch = (event) => {
    setQueryParams((prev) => ({ ...prev, search: event.target.value || '' }));
  };

  const handleChangePage = async (_, newPage) => {
    setQueryParams((prev) => ({ ...prev, pageNo: newPage + 1 }));
    setSelectedItems([]);
  };

  const onChangeRowsPerPage = async (event) => {
    setQueryParams((prev) => ({
      ...prev,
      pageNo: paginationOptions.defaultPerPage,
      rowsPerPage: parseInt(event.target.value, 10),
    }));
    setSelectedItems([]);
  };

  const renderTableCell = (row, column) => {
    if (!row[column.id]) {
      return (
        <Box component="span" className={classes.emptS}>
          {t('commonText.nA')}
        </Box>
      );
    }
    if (column.id === columnIdsEnum.status) {
      let stageColorClass = '';
      if (row[column.id] === contactTypes.APPROVED) {
        stageColorClass = classes.approvedColor;
      } else if (row[column.id] === contactTypes.PENDING) {
        stageColorClass = classes.pendingColor;
      } else if (row[column.id] === contactTypes.REJECTED) {
        stageColorClass = classes.rejectedColor;
      } else {
        stageColorClass = 'otherStageColor';
      }
      return (
        <Box component="span" className={classNames(classes.commonStageColor, stageColorClass)}>
          {row[column.id] === contactTypes.APPROVED ? (
            <ApprovedIcon />
          ) : row[column.id] === contactTypes.PENDING ? (
            <PendingIconContact />
          ) : (
            <PendingIcon />
          )}{' '}
          {row[column.id]}
        </Box>
      );
    }

    if (column.id === columnIdsEnum.fullName) {
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

    if (column.id === columnIdsEnum.name) {
      return (
        <Box className={classes.assignToClass}>
          <TableImage className={classes.assignAvatar} imageUrl={row.image || defaultImage} />
          <Box component="span" className={classes.assignToText}>
            {row[column.id]}
          </Box>
        </Box>
      );
    }
    if (column.id === columnIdsEnum.email) {
      return (
        <Box className={classes.emailIcon}>
          <Link className={classes.linkStyle} href={`mailto:${row[column.id]}`}>
            <DetailEmailIcon />
          </Link>
          {row[column.id]}
        </Box>
      );
    }
    if (column.id === columnIdsEnum.createDate)
      return formatISOTimestampToDate(row[column.id], dateFormat);

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
    setQueryParams((prev) => ({
      ...prev,
      pageNo: paginationOptions.defaultPerPage,
      rowsPerPage: paginationOptions.perPageRows,
      sortBy: sortBy,
      orderBy: orderBy,
    }));
    setSelectedItems([]);
  };

  const fetchContacts = async (queryParams) => {
    const apiController = getNewApiController();
    try {
      setLoading(true);

      let params = {
        ...queryParams,
        createdDateStart: queryParams?.createdDate?.[0]
          ? formatDate(queryParams.createdDate?.[0])
          : null,
        createdDateEnd: queryParams?.createdDate?.[1]
          ? formatDate(queryParams.createdDate?.[1])
          : null,
      };

      const response = await getContacts(params, {
        signal: apiController.signal,
      });
      if (response?.statusCode === 200) {
        setData(response?.data?.contacts);

        setTotalRecords(response?.pagination?.totalCount);
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

  useEffect(() => {
    fetchContacts(queryParams);
  }, [queryParams]);

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
          title={t('sales.locations.noChangeRequest')}
        />
        {data.length > 0 &&
          data?.map((row, rowIndex) => (
            <TableRow key={row.id || rowIndex}>
              {columns.map((column, columnIndex) =>
                column.id === columnIdsEnum.fullName ? (
                  <TableCell
                    className={column.className}
                    key={`${row.id}-${column.id}-${columnIndex}`}
                    onClick={(event) => toggleDrawer(locationDrawerTypes.RIGHT, true, row)(event)}
                  >
                    {renderTableCell(row, column)}
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

  return (
    <Box className={classes.dealsWrapper}>
      <Box className={classes.locationFilterBar}>
        <Box className={classes.filterLeftSide}>
          <SearchComponentWithQuery
            placeHolder={`${t('sales.contacts.search')}`}
            onSearch={handleSearch}
            className={classes.searchWidth}
          />
          <Box className={`${classes.fieldWrapper} ${classes.companiesDatePicker}`}>
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
      <Box className={classes.locationListing}>
        <TableComponent
          data={data}
          columns={columns}
          tableHead={tableHead}
          tableBody={tableBody}
          pagination={true}
          page={queryParams.pageNo - 1}
          totalRecords={totalRecords}
          handleChangePage={handleChangePage}
          applySorting={applySorting}
          selectionText={
            !!selectedItems?.length && `${selectedItems.length} ${t('sales.deals.dealsSelected')}`
          }
          rowsPerPageOptions={paginationOptions.perPageOptions}
          onChangeRowsPerPage={onChangeRowsPerPage}
          rowsPerPage={queryParams.rowsPerPage}
        />
      </Box>
      <Drawer
        anchor={locationDrawerTypes.RIGHT}
        open={openContactReviewDrawer[locationDrawerTypes.RIGHT]}
        onClose={toggleDrawer(locationDrawerTypes.RIGHT, false)}
      >
        <ChangeReviewDrawer
          type="contact"
          anchor={locationDrawerTypes.RIGHT}
          onCloseDrawer={(anchor) =>
            setOpenContactReviewDrawer({
              ...openContactReviewDrawer,
              [anchor]: false,
            })
          }
          width={796}
          data={openContactReviewDrawer.contact}
          refetch={() => fetchContacts(queryParams)}
        />
      </Drawer>
    </Box>
  );
};

export default ContactsReviewsListing;
