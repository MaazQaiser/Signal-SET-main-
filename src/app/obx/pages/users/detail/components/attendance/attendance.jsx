import { Box, Chip, TableCell, TableRow, TableSortLabel, Typography } from '@mui/material';
import CustomDropDown from 'commonComponents/customDropDown';
import DateRangePicker from 'commonComponents/RangeDatepicker';
import TableComponent from 'commonComponents/table';
import NoRecordFound from 'commonComponents/table/noRecordFound';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { getAllSitesByOfficerId } from 'services/duty.services';
import { getUsersAttendance } from 'services/user.services';
import TableSkeleton from 'src/app/components/common/skeletonLoader/tableSkeleton';
import {
  appendDefaultStartAndEndTimeWithDates,
  dayjsWithStandardOffset,
} from 'src/app/obx/pages/schedules/helper';
import { useApiControllers } from 'src/helper/axios';
import {
  formatDate,
  listStatusHandler,
  // startAndEndDateFilterWithUTCTime,
  timeFormat12h,
} from 'src/helper/utilityFunctions';
import transformArrayForOptions from 'src/utils/array/transformArrayForOptions';
import { paginationOptions, toastSettings } from 'src/utils/constants';

import { useStyles } from './userAttendance';

const today = dayjs();
const startOfMonth = dayjs().startOf('month');

const i18ColumnName = (t) => {
  return [
    {
      id: 'sites',
      label: `${t('obx.users.usersAttendance.table.listing.columns.site')}`,
      sortable: false,
    },
    {
      id: 'shiftType',
      label: `${t('obx.users.usersAttendance.table.listing.columns.shiftType')}`,
      sortable: false,
    },
    {
      id: 'date',
      label: `${t('obx.users.usersAttendance.table.listing.columns.date')}`,
      sortable: false,
    },
    {
      id: 'startsAt',
      label: `${t('obx.users.usersAttendance.table.listing.columns.shiftStart')}`,
      sortable: false,
    },
    {
      id: 'endsAt',
      label: `${t('obx.users.usersAttendance.table.listing.columns.shiftEnd')}`,
      sortable: false,
    },
    {
      id: 'checkinAt',
      label: `${t('obx.users.usersAttendance.table.listing.columns.checkIn')}`,
      sortable: false,
    },
    {
      id: 'checkoutAt',
      label: `${t('obx.users.usersAttendance.table.listing.columns.checkOut')}`,
      sortable: false,
    },
    {
      id: 'slaStatus',
      label: `${t('obx.users.usersAttendance.table.listing.columns.status')}`,
      sortable: false,
    },
  ];
};

const columnIdsEnum = {
  sites: 'sites',
  dutyType: 'shiftType',
  date: 'date',
  startTime: 'startsAt',
  endTime: 'endsAt',
  checkinTime: 'checkinAt',
  checkoutTime: 'checkoutAt',
  status: 'slaStatus',
};

const timeKeys = ['checkinAt', 'checkoutAt', 'endsAt', 'startsAt'];

const params = {
  page: paginationOptions.defaultPerPage,
  perPage: paginationOptions.perPageRows,
  sortBy: '',
  orderBy: '',
  windowStart: startOfMonth,
  windowEnd: today,
  selectedDates: [startOfMonth, today],
  shiftType: { value: 'all', label: 'All Jobs' },
  sites: [],
  slaStatus: {
    value: 'all',
    label: 'All Statuses',
  },
};

const order = {
  orderBy: 'id',
  orderType: 'asc',
};

const i8ShiftTypeOptions = (t) => {
  return [
    {
      label: `${t('obx.users.usersAttendance.dropDownOptionsLabels.all')}`,
      value: 'all',
    },
    {
      label: `${t('obx.users.usersAttendance.dropDownOptionsLabels.dedicated')}`,
      value: 'dedicated',
    },
    {
      label: `${t('obx.users.usersAttendance.dropDownOptionsLabels.patrol')}`,
      value: 'patrol',
    },
    {
      label: `${t('obx.users.usersAttendance.dropDownOptionsLabels.extra')}`,
      value: 'extra',
    },
    {
      label: `${t('obx.users.usersAttendance.dropDownOptionsLabels.supervisor')}`,
      value: 'supervisor',
    },
  ];
};

const i8StatusDropDownOptions = (t) => {
  return [
    {
      label: `${t('obx.users.usersAttendance.dropDownOptionsLabels.allStatuses')}`,
      value: 'all',
    },
    {
      label: `${t('obx.users.usersAttendance.dropDownOptionsLabels.present')}`,
      value: 'present',
    },
    {
      label: `${t('obx.users.usersAttendance.dropDownOptionsLabels.absent')}`,
      value: 'absent',
    },
    {
      label: `${t('obx.users.usersAttendance.dropDownOptionsLabels.onLeave')}`,
      value: 'leave',
    },
  ];
};

const Attendance = ({ id }) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalRows, setTotalRows] = useState(0);
  const columns = i18ColumnName(t);
  const [queryParams, setQueryParams] = useState(params);
  const shiftTypeOptions = i8ShiftTypeOptions(t);
  const statusDropDownOptions = i8StatusDropDownOptions(t);
  const [stats, setStats] = useState({ assigned: null, absent: null, present: null });

  const { getNewApiController } = useApiControllers();

  const [dropDownOptions, setDropDownOptions] = useState({
    status: statusDropDownOptions,
    shiftType: shiftTypeOptions,
    sites: [],
  });

  const [orderState, setOrderState] = useState(order);
  const NA = t('commonText.nA');

  const fetchAttendance = async (params) => {
    const apiController = getNewApiController();
    try {
      setLoading(true);

      const siteIds = params?.sites?.map((a) => a?.value);

      const startDate = params?.selectedDates?.[0]
        ? dayjsWithStandardOffset(params?.selectedDates?.[0])
        : null;

      const endDate = params?.selectedDates?.[0]
        ? dayjsWithStandardOffset(params?.selectedDates?.[1])
        : null;

      const convertedDates =
        startDate && endDate ? appendDefaultStartAndEndTimeWithDates([startDate, endDate]) : [];

      // const utcSelectedDates = startAndEndDateFilterWithUTCTime(params?.selectedDates || []);

      let queryParams = {
        ...params,
        windowStart: convertedDates?.[0] ? convertedDates?.[0] : '',
        windowEnd: convertedDates?.[1] ? convertedDates?.[1] : '',
        slaStatus: params?.slaStatus?.value || '',
        shiftType: params?.shiftType?.value || '',
        siteId: siteIds.length ? siteIds : [],
      };

      delete queryParams.selectedDates;
      delete queryParams.sites;

      const response = await getUsersAttendance(id, queryParams, { signal: apiController.signal });

      if (response?.statusCode === 200) {
        setData(response?.data?.logs || []);
        const shiftDetails = response?.data?.shiftStats?.[id];
        setStats({
          present: shiftDetails?.presentShifts,
          assigned: shiftDetails?.assignedShifts,
          absent: shiftDetails?.absentShifts,
        });
        setTotalRows(response?.data?.pagination?.totalCount);
      }

      setLoading(false);
    } catch (error) {
      if (!apiController.signal.aborted) {
        toast.error(error?.message, {
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
        setLoading(false);
      }
    }
  };

  const getSitesList = async (officerId) => {
    try {
      let response = await getAllSitesByOfficerId(officerId);
      if (response.statusCode === 200) {
        const sitesList = response?.data?.sites || [];

        setDropDownOptions((prevState) => {
          return {
            ...prevState,
            sites: transformArrayForOptions(sitesList, 'name', 'id'),
          };
        });
      }
    } catch (error) {
      toast.error(error?.message, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  const handleChangePage = async (_, newPage) => {
    setQueryParams((prev) => ({
      ...prev,
      page: newPage + 1,
    }));
  };

  const handleChangeRowsPerPage = (event) => {
    setQueryParams((prev) => ({
      ...prev,
      page: paginationOptions.defaultPerPage,
      perPage: parseInt(event.target.value, 10),
    }));
  };

  const applySorting = (sortBy, orderBy) => {
    setQueryParams((prev) => ({
      ...prev,
      sortBy: sortBy,
      orderBy: orderBy,
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
    const { name, value } = event.target;
    updateFormHandler(name, value);
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
    applySorting(columnId, orderState?.orderType);
  };
  const _tableHead = (_index) => {
    return (
      <>
        <TableRow>
          {columns?.map((column) => (
            <TableCell key={column?.id} sortDirection={sortDirection(column)}>
              {column?.sortable ? (
                <TableSortLabel
                  active={orderState.orderBy === column?.id}
                  direction={orderDirection(column)}
                  onClick={() => handleSort(column?.id)}
                >
                  {column?.label}
                </TableSortLabel>
              ) : (
                `${column?.label}`
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
        {data?.map((row) => (
          <TableRow key={row?.id}>
            {columns?.map((column) => (
              <TableCell key={column?.id}>{renderTableCell(row, column)}</TableCell>
            ))}
          </TableRow>
        ))}
      </>
    );
  };
  const renderTableCell = (row, column) => {
    if (column?.id === columnIdsEnum?.sites) {
      if (row[column.id]?.length < 1) {
        return <>{NA}</>;
      }
      {
        return row[column.id]?.map((a) => {
          return <>{a?.name || NA}</>;
        });
      }
    }

    if (column?.id === columnIdsEnum?.dutyType) {
      const chipData = listStatusHandler(row[column.id]);
      return <>{chipData?.title || NA}</>;
    }

    if (column?.id === columnIdsEnum?.date && (row?.shiftDate || row?.leave?.startTime)) {
      return (
        <>
          {formatDate(
            dayjsWithStandardOffset(row?.shiftDate ? row?.shiftDate : row?.leave.startTime),
          ) || NA}
        </>
      );
    }

    if (timeKeys.includes(column?.id)) {
      return <>{row[column.id] ? timeFormat12h(row[column.id], true) : 'N/A'}</>;
    }

    if (column?.id === columnIdsEnum?.status) {
      const chipData = listStatusHandler(row[column.id]);
      return <>{<Chip color={chipData?.color} size="small" label={chipData?.title} />}</>;
    }

    if (row[column.id] === 0) {
      return <>{row[column.id]}</>;
    }

    return <>{row[column.id] || NA}</>;
  };

  useEffect(() => {
    fetchAttendance(queryParams);
  }, [queryParams, id]);

  useEffect(() => {
    getSitesList(id);
  }, [id]);
  return (
    <Box className={classes.sitesListingCommonContainer}>
      {/* {loading && <LoaderComponent size={50} color={'primary'} label={'Loading'} />} */}
      <Box className={classes.searchSectionDashboard}>
        <Box className={classes.searchSection}>
          <CustomDropDown
            label={t('obx.schedules.filters.sites.label')}
            name="sites"
            selectedValues={queryParams.sites}
            options={dropDownOptions?.sites}
            handleChange={inputChangedHandler}
            multiSelect
            searchPlaceholder={t('obx.schedules.filters.sites.searchPlaceholder')}
            checkmark
            searchable
            withTiles
            clearAll
          />

          <CustomDropDown
            label={t('obx.users.usersAttendance.dropDownOptionsLabels.allStatuses')}
            name="slaStatus"
            selectedValues={queryParams.slaStatus}
            options={dropDownOptions?.status}
            handleChange={inputChangedHandler}
          />

          <CustomDropDown
            label={t('obx.users.usersAttendance.dropDownOptionsLabels.shiftType')}
            name="shiftType"
            selectedValues={queryParams.shiftType}
            options={dropDownOptions.shiftType}
            handleChange={inputChangedHandler}
          />
        </Box>

        <Box className={classes.reportsListingsHeaderRightDate}>
          <DateRangePicker
            selectedDates={queryParams?.selectedDates}
            setDates={(dates) => {
              updateFormHandler('selectedDates', dates);
            }}
          />
        </Box>
      </Box>
      <Box className={classes.shiftBoxes}>
        <Box className={classes.innerShiftBox}>
          <Typography className={classes.shiftName} variant="body3">
            {t('obx.users.usersAttendance.assignedShifts')}
          </Typography>
          <Typography className={classes.shiftValue} variant="subtitle2">
            {stats.assigned == null || stats.assigned === undefined ? NA : stats.assigned}
          </Typography>
        </Box>
        <Box className={classes.innerShiftBox}>
          <Typography className={classes.shiftName} variant="body3">
            {t('obx.users.usersAttendance.presentShifts')}
          </Typography>
          <Typography className={classes.shiftValue} variant="subtitle2">
            {stats.present == null || stats.present === undefined ? NA : stats.present}
          </Typography>
        </Box>
        <Box className={classes.innerShiftBox}>
          <Typography className={classes.shiftName} variant="body3">
            {t('obx.users.usersAttendance.absentShifts')}
          </Typography>
          <Typography className={classes.shiftValue} variant="subtitle2">
            {stats.absent == null || stats.absent === undefined ? NA : stats.absent}
          </Typography>
        </Box>
      </Box>
      <Box className={classes.tableWrapper}>
        <TableComponent
          data={data}
          columns={columns}
          // tableHead={tableHead}
          tableBody={tableBody}
          pagination={true}
          page={queryParams.page - 1}
          rowsPerPage={queryParams.perPage}
          totalRecords={totalRows}
          handleChangePage={handleChangePage}
          applySorting={applySorting}
          rowsPerPageOptions={paginationOptions.perPageOptions}
          onChangeRowsPerPage={handleChangeRowsPerPage}
        />
      </Box>
    </Box>
  );
};

Attendance.propTypes = {
  id: PropTypes.number,
};

export default Attendance;
