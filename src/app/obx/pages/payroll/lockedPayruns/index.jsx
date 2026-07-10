import {
  Box,
  Button,
  Checkbox,
  Chip,
  TableCell,
  TableRow,
  TableSortLabel,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material';
import { ReactComponent as TickWhiteIcon } from 'assets/svg/TickWhiteIcon.svg';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import CustomDropDown from 'src/app/components/common/customDropDown';
import InfiniteScrollCustom from 'src/app/components/common/infiniteScrollCustom';
import TableSkeleton from 'src/app/components/common/skeletonLoader/tableSkeleton';
import TableComponent from 'src/app/components/common/table';
import NoRecordFound from 'src/app/components/common/table/noRecordFound';
import ExportPayrollModel from 'src/app/obx/pages/payroll/components/exportPayrollModel';
import ShiftDetail from 'src/app/obx/pages/schedules/shiftDetail';
import DutyDetail from 'src/app/obx/pages/schedules/shiftDetail';
import { DownloadCloud } from 'src/assets/svg';
import { ReactComponent as CalanderIcon } from 'src/assets/svg/CalanderIcon.svg';
import { ReactComponent as CheckBoxRegularIcon } from 'src/assets/svg/checkbox.svg';
import { ReactComponent as CheckBoxCheckedIcon } from 'src/assets/svg/checkbox-checked.svg';
import { ReactComponent as EmployIcon } from 'src/assets/svg/EmployIcon.svg';
import { useApiControllers } from 'src/helper/axios';
import { formatDate, timeFormat12h } from 'src/helper/utilityFunctions';
import {
  getPatrolPayroll,
  getPatrolPayrollFilters,
  getPayrolls,
  getSupervisorLockedPayrolls,
  updatePayrolls,
} from 'src/services/payroll.services';
import { getAllSites, getSitesAllLocations } from 'src/services/sites.services';
import { getUsersWithDesiredType } from 'src/services/user.services';
import transformArrayForOptions from 'src/utils/array/transformArrayForOptions';
import { toastSettings } from 'src/utils/constants';
import { DRAWER_TYPE, SCHEDULE_DUTIES } from 'src/utils/constants/schedules';
import {
  extractValuesByKeyFromInput,
  removeAllFromSelected,
} from 'src/utils/dropdownValueExtractor';
import { capitalizeFirstLetter } from 'src/utils/string/common';
import { truncateString } from 'src/utils/string/truncate';

import {
  appendDefaultStartAndEndTimeWithDates,
  dayjsWithStandardOffset,
  getCurrentStandardTimeInIsoWrtTimezone,
} from '../../schedules/helper';
import NotesModal from '../components/notesModal';
import SelectedShiftHours from '../components/selectedShiftHoursModal';
import ShiftHours from '../components/shiftHoursModal';
import TimeOffModal from '../components/timeOffModal';
import { useStyles } from './lockedPayruns';

const SHIFT_DRAWER_INDICES = {
  DETAILS: 0,
  REPORTS: 1,
  NOTES: 2,
  LOGS: 3,
};

const shiftStatusesEnum = {
  COMPLETED: 'completed',
  UNASSIGNED: 'unassigned',
  NOT_STARTED: 'notStarted',
};

const i18ColumnName = (t, selectedTab) => {
  return [
    {
      id: 'adpBadgeNumber',
      label: `${t('obx.payroll.badgeNo')}`,
      sortable: false,
    },
    ...(selectedTab === PAYROLL_TYPES.PATROL
      ? [
          {
            id: 'name',
            label: `${t('obx.payroll.runSheetName')}`,
            sortable: false,
          },
        ]
      : []),
    {
      id: 'employeeName',
      label: `${t('obx.payroll.employeeName')}`,
      sortable: false,
    },
    ...(selectedTab === PAYROLL_TYPES.DEDICATED
      ? [
          {
            id: 'isAdhocPayroll',
            label: `${t('obx.payroll.type')}`,
            sortable: false,
          },
          {
            id: 'site',
            label: `${t('obx.payroll.sites')}`,
            sortable: false,
          },
          {
            id: 'location',
            label: `${t('obx.payroll.location')}`,
            sortable: false,
          },
        ]
      : []),
    {
      id: 'shiftDate',
      label: `${t('obx.payroll.shiftDate')}`,
      sortable: false,
    },
    ...(selectedTab !== PAYROLL_TYPES.SUPERVISOR
      ? [
          {
            id: 'shiftTime',
            label: `${t('obx.payroll.shiftTime')}`,
            sortable: false,
          },
        ]
      : []),
    {
      id: 'punchinOut',
      label: `${t('obx.payroll.punchinOut')}`,
      sortable: false,
    },
    ...(selectedTab !== PAYROLL_TYPES.SUPERVISOR
      ? [
          {
            id: 'totalHours',
            label: `${t('obx.payroll.timeSpentOnJob')}`,
            sortable: false,
          },
          {
            id: 'breakTime',
            label: `${t('obx.payroll.timeSpentOnBreak')}`,
            sortable: false,
          },
        ]
      : []),

    ...(selectedTab === PAYROLL_TYPES.DEDICATED
      ? [
          {
            id: 'isBreakPayable',
            label: `${t('obx.payroll.breakRule')}`,
            sortable: false,
          },
        ]
      : []),
    {
      id: 'approvedHours',
      label: `${t('obx.payroll.approvedHours')}`,
      sortable: false,
    },
    ...(selectedTab === PAYROLL_TYPES.DEDICATED
      ? [
          {
            id: 'invoiceableHours',
            label: `${t('obx.payroll.invoiceAbleHours')}`,
            sortable: false,
          },
        ]
      : []),
    ...(selectedTab === PAYROLL_TYPES.PATROL
      ? [
          {
            id: 'hitsDone',
            label: `${t('obx.payroll.hitsDone')}`,
            sortable: false,
          },
        ]
      : []),
    ...(selectedTab !== PAYROLL_TYPES.SUPERVISOR
      ? [
          {
            id: 'action',
            label: ``,
            sortable: false,
          },
        ]
      : []),
  ];
};

const PAYROLL_TYPES = {
  PATROL: 'patrol',
  DEDICATED: 'dedicated',
  SUPERVISOR: 'supervisor',
};

const today = dayjsWithStandardOffset().startOf('day');

const threeDaysBefore = dayjsWithStandardOffset().subtract(3, 'day');

// Value for pagination (infinite scroll) on payroll listing
const INFINITE_SCROLL_VALUES = {
  INITIAL_RENDER: 15,
  ON_SCROLL: 10,
};

const params = {
  search: '',
  sortBy: '',
  orderBy: '',
  selectedDates: [threeDaysBefore, today],
  officerId: [],
  locationId: {},
  isApproved: { value: undefined, label: 'All Statuses' },
  runsheetIds: [],
  siteIds: [],
  page: 1,
  perPage: INFINITE_SCROLL_VALUES.INITIAL_RENDER,
};

const order = {
  orderBy: 'id',
  orderType: 'asc',
};

const columnIdsEnum = {
  checkbox: 'checkbox',
  invoiceableHours: 'invoiceableHours',
  approvedHours: 'approvedHours',
  employeeName: 'employeeName',
  isAdhocPayroll: 'isAdhocPayroll',
  employeeType: 'employeeType',
  site: 'site',
  punchinOut: 'punchinOut',
  shiftDate: 'shiftDate',
  shiftTime: 'shiftTime',
  hourlyRate: 'hourlyRate',
  adpBadgeNumber: 'adpBadgeNumber',
  location: 'location',
  isBreakPayable: 'isBreakPayable',
  breakTime: 'breakTime',
  totalHours: 'totalHours',
  action: 'action',
  hitsDone: 'hitsDone',
  name: 'name',
};

const LockedPayruns = ({ selectedDates }) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const classDealName = classes.locationTD;
  const [selectedTab, setSelectedTab] = useState(PAYROLL_TYPES.DEDICATED);
  const columns = i18ColumnName(t, selectedTab, classDealName);

  const [showSelectedHoursModal, setShowSelectedHoursModal] = useState(false);
  const [shiftHoursModal, setShiftHoursModal] = useState(-1);
  const [notes, setNotes] = useState(null);
  const [showTimeOffModal, setShowTimeOffModal] = useState(false);

  const [selectedItems, setSelectedItems] = useState([]);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [queryParams, setQueryParams] = useState(params);
  const [selectAll, setSelectAll] = useState(false);

  const [allSites, setAllSites] = useState([]);
  const [allOfficers, setAllOfficers] = useState([]);
  const [siteLocations, setSiteLocations] = useState([]);
  const [errors, setErrors] = useState({});
  const [selectedRow, setSelectedRow] = useState(null);
  const { getNewApiController } = useApiControllers();
  const [exportModal, setExportModal] = useState(false);
  const [runsheetOptions, setRunsheetOptions] = useState([]);
  const [shiftData, setShiftData] = useState(null);
  const [showDedicatedDetailsDrawer, setShowDedicatedDetailsDrawer] = useState(false);
  const [showDrawer, setShowDrawer] = useState({
    open: '',
    data: {},
    activeIndex: 0,
  });

  const [openShiftSideDrawer, setOpenShiftSideDrawer] = useState(false);
  const [lastElement, setLastElement] = useState(null);
  const [addingMoreData, setAddingMoreData] = useState(false);
  const [paginationStats, setPaginationStats] = useState(null);

  const [modelState, setModelState] = useState({
    exportModel: false,
  });
  const NA = t('commonText.nA');

  const handleModelChange = (name, state) => {
    setModelState((prevState) => {
      return {
        ...prevState,
        [name]: state,
      };
    });
  };

  useEffect(() => {
    fetchPayrolls(queryParams);
  }, [queryParams, selectedTab, selectedDates]);

  useEffect(() => {
    if (queryParams?.siteId?.value) {
      getLocationsOfSite(queryParams?.siteId?.value);
    }
  }, [queryParams?.siteId?.value]);

  useEffect(() => {
    if (!allOfficers.length) fetchAllOfficers();
    if (selectedTab === PAYROLL_TYPES.DEDICATED && !allSites.length) fetchAllSites();
    if (selectedTab === PAYROLL_TYPES.PATROL && !runsheetOptions.length) fetchAllRunsheets();
  }, [selectedTab]);

  const handleSelectAllChange = (event) => {
    const isChecked = event.target.checked;
    setSelectAll(isChecked);
    if (isChecked) {
      setSelectedItems(data.filter((row) => !row.isApproved).map((row) => row.id));
      return;
    }
    setSelectedItems([]);
  };

  const handleRowUpdate = async (index, key, value) => {
    const payload = {
      id: data[index].id,
      dataType: data[index].dataType,
      payableHours: data[index].payableHours,
      [key]: value,
    };
    await update([payload]);
  };

  const handleApprovePayroll = async () => {
    try {
      const payload = {
        id: selectedRow?.id,
        dataType: selectedRow?.dataType,
        isApproved: true,
        invoiceableHours: selectedRow?.invoiceableHours,
        payableHours: selectedRow?.payableHours,
        isBreakPayable: selectedRow?.isBreakPayable,
      };
      await update([payload]);
    } catch (error) {
      toast.error(error?.message, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    } finally {
      setSelectedRow(null);
      setShowSelectedHoursModal(false);
    }
  };

  const handleShiftApprove = async () => {
    await handleRowUpdate(shiftHoursModal, 'isApproved', true);
    setShiftHoursModal(-1);
  };

  const handleMultipleShiftApprove = async () => {
    if (selectedRow) {
      handleApprovePayroll();
    } else {
      const payload = data.filter(
        (payroll) => selectedItems.includes(payroll.id) && !payroll.isApproved,
      );
      await update(
        payload.map((payroll) => ({
          id: payroll.id,
          dataType: payroll.dataType,
          isApproved: true,
          invoiceableHours: payroll?.invoiceableHours,
          payableHours: payroll?.payableHours,
        })),
      );
      setShowSelectedHoursModal(false);
      setSelectedItems([]);
      setSelectAll(false);
    }
  };

  const fetchPayrolls = async () => {
    const apiFunction =
      selectedTab === PAYROLL_TYPES.PATROL
        ? getPatrolPayroll
        : selectedTab === PAYROLL_TYPES.DEDICATED
          ? getPayrolls
          : selectedTab === PAYROLL_TYPES.SUPERVISOR
            ? getSupervisorLockedPayrolls
            : () => {};
    if (!data?.length) setLoading(true);
    const apiController = getNewApiController();
    try {
      const convertedDates = selectedDates?.length
        ? appendDefaultStartAndEndTimeWithDates(selectedDates)
        : [];

      const commonParams = {
        isApproved: queryParams?.isApproved?.value ?? '',
        windowStart: selectedDates?.[0] ? convertedDates?.[0] : '',
        windowEnd: selectedDates?.[1] ? convertedDates?.[1] : '',
        shiftStatus: queryParams?.shiftStatus?.value || '',
        isLocked: true,
        page: queryParams?.page || 1,
        perPage: queryParams?.perPage,
        officerId:
          queryParams?.shiftStatus?.value !== shiftStatusesEnum.UNASSIGNED
            ? removeAllFromSelected(
                extractValuesByKeyFromInput(queryParams?.officerId, 'value'),
                'all',
              )
            : [],
      };

      const params = {
        ...commonParams,
        ...(selectedTab === PAYROLL_TYPES.DEDICATED
          ? {
              siteId: queryParams?.siteIds.map((site) => site?.id),
              locationId: queryParams?.locationId?.value || '',
            }
          : {}),
        ...(selectedTab === PAYROLL_TYPES.PATROL || selectedTab === PAYROLL_TYPES.SUPERVISOR
          ? {
              runsheetIds: queryParams?.runsheetIds.map((runsheetOption) => runsheetOption?.id),
            }
          : {}),
      };

      const response = await apiFunction(params, {
        signal: apiController.signal,
      });
      if (response && response?.statusCode === 200) {
        setData([...data, ...response.data.payroll]);
        setPaginationStats(response?.data?.pagination);
      }
      setLoading(false);
    } catch (error) {
      if (!apiController.signal.aborted) {
        toast.error(error?.message, {
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
      }
    } finally {
      setAddingMoreData(false);
    }
  };

  const fetchAllSites = async () => {
    try {
      const response = await getAllSites();

      if (response?.statusCode === 200) {
        let transformedSites = transformArrayForOptions(response?.data?.sites, 'name', 'id') || [];
        setAllSites([
          { value: t('obx.payroll.all'), label: t('obx.payroll.allSites') },
          ...transformedSites,
        ]);
      }
    } catch (error) {
      toast.error(error?.message, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  const fetchAllRunsheets = async () => {
    try {
      const response = await getPatrolPayrollFilters();
      if (response && response?.statusCode === 200) {
        let transformedRunsheets =
          transformArrayForOptions(response?.data?.runsheets, 'name', 'id') || [];
        setRunsheetOptions([
          {
            label: t('obx.payroll.allRunsheets'),
            value: t('obx.payroll.all'),
          },
          ...transformedRunsheets,
        ]);
      }
    } catch (error) {
      toast.error(error?.message, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  const showSideDrawerHandler = ({ requiresAttention, id, shiftId, ...rest }) => {
    // open assign duty side drawer
    let open = undefined;
    let activeIndex = rest?.activeIndex || 0;

    if (
      requiresAttention &&
      [SCHEDULE_DUTIES.DEDICATED, SCHEDULE_DUTIES.EXTRA].includes(rest?.shiftType)
    ) {
      if (getCurrentStandardTimeInIsoWrtTimezone() >= rest?.endsAt) {
        open = DRAWER_TYPE.DETAIL;
        activeIndex = 2;
      } else {
        open = DRAWER_TYPE.ASSIGN;
      }
    } else {
      open = DRAWER_TYPE.DETAIL;
    }

    setShowDrawer({
      open: open,
      data: { id, shiftId, ...rest },
      activeIndex: activeIndex,
    });
  };

  const handleViewSchedule = (row, isNotes = false) => {
    if (selectedTab === PAYROLL_TYPES.DEDICATED) {
      if (!row?.shiftId) return;
      setShiftData((prev) => ({
        ...prev,
        shiftId: row?.id,
        shiftDate: row?.startsAt,
        activeIndex: isNotes ? SHIFT_DRAWER_INDICES.NOTES : SHIFT_DRAWER_INDICES.DETAILS,
        shiftActivityLogId: row?.shiftActivityLogId,
        shiftType: row?.shiftType,
      }));
      setShowDedicatedDetailsDrawer(true);
      return;
    }
    showSideDrawerHandler({
      id: row?.shiftId,
      shiftId: row?.shiftId,
      shiftType: row?.shiftType,
      startsAt: row?.startsAt,
      // runsheetId: row?.id,
      endsAt: row?.endsAt,
      shiftDate: row?.startsAt,
      shiftActivityLogId: row?.shiftActivityLogId,
      rest: row,
      activeIndex: isNotes ? SHIFT_DRAWER_INDICES.NOTES : SHIFT_DRAWER_INDICES.DETAILS,
    });
  };

  const showSideDrawer = (value) => (data) => {
    setShowDrawer({ open: value, data: value ? data : null });
  };

  const getLocationsOfSite = async (siteId) => {
    try {
      const response = await getSitesAllLocations(siteId);

      if (response?.statusCode === 200) {
        const locationsRes = response?.data?.locations || [];

        setSiteLocations([
          { label: 'All Locations', value: '' },
          ...transformArrayForOptions(locationsRes, 'name', 'id'),
        ]);
      }
    } catch (error) {
      setSiteLocations([]);
    }
  };

  const fetchAllOfficers = async () => {
    try {
      const response = await getUsersWithDesiredType();
      if (response?.data?.statusCode === 200) {
        const transformedUsers = transformArrayForOptions(response?.data?.users, 'name', 'id');
        setAllOfficers([
          {
            value: 'all',
            label: 'All Officers',
            image: 'someDefaultImageString',
          },
          ...transformedUsers,
        ]);
      }
    } catch (error) {
      toast.error(error?.message, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  const update = async (payload) => {
    setIsUpdating(true);
    try {
      const response = await updatePayrolls(payload);
      if (response?.statusCode === 200) {
        const updatedPayrolls = response.data || [];
        setData((previousData) => {
          return previousData.map((payroll) => {
            const updatedPayroll = updatedPayrolls?.find((updated) => updated.id === payroll.id);
            return updatedPayroll || payroll;
          });
        });
        toast.success(response?.message, {
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
      }
    } catch (error) {
      toast.error(error?.message, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
    setIsUpdating(false);
  };

  const renderTableCell = (row, column) => {
    if (column.id === columnIdsEnum.employeeName) {
      return (
        <>
          {
            <Box
              className={selectedTab === PAYROLL_TYPES.DEDICATED && classes.employeeNameClass}
              onClick={(e) => {
                if (selectedTab !== PAYROLL_TYPES.DEDICATED) return;
                e.stopPropagation();
                handleViewSchedule(row);
              }}
            >
              {row.officer.name.length > 25 ? (
                <Tooltip
                  title={<Box sx={{ textTransform: 'capitalize' }}>{row.officer.name}</Box>}
                  placement="right"
                  arrow
                >
                  {truncateString(row.officer.name, 25) || NA}
                </Tooltip>
              ) : (
                row.officer.name
              )}
              {row?.site?.id && row?.notes?.length ? (
                <Tooltip
                  componentsProps={{
                    tooltip: {
                      sx: {
                        maxHeight: '300px',
                        overflowY: 'auto',
                        borderRadius: '4px',
                      },
                    },
                  }}
                  title={
                    <Box>
                      {row?.notes?.map((note) => {
                        return (
                          <Box key={note.id} className={classes.repateNotes}>
                            <Typography className={classes.notesSubHeading} variant="subtitle2">
                              {note.text}
                            </Typography>
                            <Typography className={classes.notesArea} variant="subtitle3">
                              {note.updatedAt
                                ? `Updated: ${dayjsWithStandardOffset(note.updatedAt).format('YYYY-MM-DD hh:mm')}`
                                : `Created: ${dayjsWithStandardOffset(note.createdAt).format('YYYY-MM-DD hh:mm')}`}
                            </Typography>
                          </Box>
                        );
                      })}
                    </Box>
                  }
                  placement="right"
                  arrow
                >
                  <EmployIcon
                    onClick={(e) => {
                      if (selectedTab !== PAYROLL_TYPES.DEDICATED) return;
                      e.stopPropagation();
                      handleViewSchedule(row, true);
                    }}
                  />
                </Tooltip>
              ) : (
                ''
              )}
            </Box>
          }
        </>
      );
    }
    if (column.id === columnIdsEnum.action) {
      return (
        <>
          {
            <Box className={classes.actionButtons}>
              <Button
                disableRipple
                className={classes.notesCloseBtn}
                variant="onlyText"
                onClick={() => handleViewSchedule(row)}
                startIcon={
                  <Box>
                    <Tooltip
                      title={
                        row?.shiftId
                          ? t('obx.payroll.viewShiftDetails')
                          : t('obx.payroll.supervisorTooltip')
                      }
                      arrow
                    >
                      <CalanderIcon />
                    </Tooltip>
                  </Box>
                }
              ></Button>
            </Box>
          }
        </>
      );
    }
    if (column.id === columnIdsEnum.invoiceableHours) {
      return <>{row.invoiceableHours}</>;
    }
    if (column.id === columnIdsEnum.approvedHours) {
      return (
        <>
          {
            <Box className={classes.inlineField}>
              <Typography className={classes.spaceer}>
                {timeFormat12h(dayjsWithStandardOffset(row.approvedStartsAt), true)}
              </Typography>
              <Typography className={classes.spaceer}>-</Typography>
              <Typography className={classes.spaceer}>
                {timeFormat12h(dayjsWithStandardOffset(row.approvedEndsAt), true)}
              </Typography>
              <Typography className={classes.hourValue}>({row.payableHours || 0}h)</Typography>
            </Box>
          }
        </>
      );
    }
    if (column.id === columnIdsEnum.site) {
      return <>{row?.[column.id]?.name || NA}</>;
    }
    if (column.id === columnIdsEnum.location) {
      return <>{row?.[column.id]?.name || NA}</>;
    }
    if (column.id === columnIdsEnum.employeeType) {
      return <>{row?.officer.type || NA}</>;
    }
    if (column.id === columnIdsEnum.shiftDate) {
      return <>{formatDate(dayjsWithStandardOffset(row?.startsAt))}</>;
    }
    if (column.id === columnIdsEnum.shiftTime) {
      return <>{`${timeFormat12h(row?.startsAt, true)} - ${timeFormat12h(row?.endsAt, true)}`}</>;
    }
    if (column.id === columnIdsEnum.punchinOut) {
      return (
        <>{`${timeFormat12h(row?.checkin, true)} - ${timeFormat12h(row?.checkout, true)}  (${row?.punchedHours || 0}h)`}</>
      );
    }
    if (column.id === columnIdsEnum.hourlyRate) {
      return <>{`$${row.hourlyRate}`}</>;
    }
    if (column.id === columnIdsEnum.adpBadgeNumber) {
      return (
        <>
          {row.adpBadgeNumber.length > 20 ? (
            <>
              <Tooltip title={row.adpBadgeNumber} placement="right" arrow>
                {truncateString(row.adpBadgeNumber, 20) || NA}
              </Tooltip>
            </>
          ) : (
            <>{truncateString(row.adpBadgeNumber, 20) || NA}</>
          )}
        </>
        // <Tooltip title={row.adpBadgeNumber} placement="right" arrow>
        //   {truncateString(row.adpBadgeNumber, 20) || NA}
        // </Tooltip>
      );
    }
    if (column.id === columnIdsEnum.isAdhocPayroll) {
      return (
        <>
          {row?.isAdhocPayroll ? (
            <Chip className={classes.adhocPayrollChip} label={t('obx.payroll.adhoc')} />
          ) : (
            <Chip color="primary" label={t('obx.payroll.logged')} />
          )}
        </>
      );
    }

    if (column.id === columnIdsEnum.isBreakPayable) {
      return <>{row?.[column.id] ? t('obx.payroll.payable') : t('obx.payroll.notPayable')}</>;
    }

    if (column.id === columnIdsEnum.breakTime || column.id === columnIdsEnum.totalHours) {
      return <>{row?.[column.id] ? row?.[column.id] : 0}</>;
    }

    if (column.id === columnIdsEnum.hitsDone) {
      return <>{`${row?.hits?.hitsDone || 0}`}</>;
    }

    if (row?.[column.id] === 0) {
      return <>{row?.[column.id]}</>;
    }

    if (column.id === columnIdsEnum.name) {
      return (
        <Box
          className={selectedTab === PAYROLL_TYPES.PATROL && classes.employeeNameClass}
          onClick={(e) => {
            if (selectedTab !== PAYROLL_TYPES.PATROL) return;
            e.stopPropagation();
            handleViewSchedule(row);
          }}
        >
          {row?.[column.id]?.length > 25 ? (
            <>
              <Tooltip title={row?.[column.id]} arrow>
                {truncateString(capitalizeFirstLetter(row?.[column.id]), 25) || NA}
              </Tooltip>
            </>
          ) : (
            <>{capitalizeFirstLetter(row?.[column.id]) || NA}</>
          )}
          {selectedTab === PAYROLL_TYPES.PATROL && row?.notes?.length ? (
            <Tooltip
              title={
                <Box>
                  {row?.notes?.map((note) => {
                    return (
                      <Box key={note.id} className={classes.repateNotes}>
                        <Typography className={classes.notesSubHeading} variant="subtitle2">
                          {note.text}
                        </Typography>
                        <Typography className={classes.notesArea} variant="subtitle3">
                          {note.updatedAt
                            ? `Updated: ${dayjsWithStandardOffset(note.updatedAt).format('YYYY-MM-DD hh:mm')}`
                            : `Created: ${dayjsWithStandardOffset(note.createdAt).format('YYYY-MM-DD hh:mm')}`}
                        </Typography>
                      </Box>
                    );
                  })}
                </Box>
              }
              placement="right"
              arrow
            >
              <EmployIcon
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewSchedule(row, true);
                }}
              />
            </Tooltip>
          ) : (
            ''
          )}
        </Box>
      );
    }

    return <>{row?.[column.id] || NA}</>;
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
              {column.sortable && (
                <TableSortLabel
                  active={orderState.orderBy === column.id}
                  direction={orderDirection(column)}
                  onClick={() => handleSort(column.id)}
                >
                  {column.label}
                </TableSortLabel>
              )}
              {column.id === 'checkbox' ? (
                <Checkbox
                  icon={<CheckBoxRegularIcon />}
                  checkedIcon={<CheckBoxCheckedIcon />}
                  className={classes.checkBoxCustom}
                  checked={selectAll}
                  onChange={handleSelectAllChange}
                />
              ) : (
                `${column.label}`
              )}
            </TableCell>
          ))}
        </TableRow>
      </>
    );
  };

  const getMoreData = () => {
    if (paginationStats?.nextPage) {
      setAddingMoreData(true);
      setQueryParams((prev) => ({
        ...prev,
        page: paginationStats?.nextPage,
      }));
    }
  };

  const scrollBody = (i18ColumnName) => {
    return (
      <>
        {data?.length > 0 &&
          !loading &&
          data.map((row, index) => {
            const isLastElement = index === data?.length - 1 && !loading;
            return (
              <Tooltip
                title={!row?.officer?.id && t('obx.payroll.noOfficerTooltip')}
                followCursor
                key={row?.id}
              >
                <TableRow
                  key={row?.id}
                  ref={isLastElement ? setLastElement : null}
                  className={`${!row?.officer?.id ? classes.disabledRecord : ''}`}
                >
                  {i18ColumnName.map((column) => {
                    const showHandCursor =
                      (column.id === columnIdsEnum.adpBadgeNumber ||
                        column.id === columnIdsEnum.employeeName) &&
                      row?.site?.id
                        ? 'pointer'
                        : '';
                    return (
                      <TableCell
                        key={column.id}
                        onClick={() => row?.officer?.id && gotoDetailPage(column, row)}
                        sx={{ cursor: showHandCursor }}
                        className={column.className}
                      >
                        {renderTableCell(row, column, index)}
                      </TableCell>
                    );
                  })}
                </TableRow>
              </Tooltip>
            );
          })}
      </>
    );
  };

  const tableBody = (data, i18ColumnName) => {
    return loading ? (
      <TableSkeleton columns={i18ColumnName} />
    ) : (
      <>
        <NoRecordFound data={data} noOfColumns={i18ColumnName.length} t={t} />
        <InfiniteScrollCustom
          totalNoOfRecords={data?.length}
          noOfRecordsBeingDisplayed={data?.length}
          lastElement={lastElement}
          body={() => scrollBody(i18ColumnName)}
          getMoreData={getMoreData}
        />
        {addingMoreData && <TableSkeleton columns={i18ColumnName} />}
        {/* {data.length > 0 &&
          data.map((row, index) => (
            <TableRow key={row.id}>
              {i18ColumnName.map((column) => {
                const showHandCursor =
                  (column.id === columnIdsEnum.adpBadgeNumber ||
                    column.id === columnIdsEnum.employeeName) &&
                  row?.site?.id
                    ? 'pointer'
                    : '';
                return (
                  <TableCell
                    key={column.id}
                    onClick={() => gotoDetailPage(column, row)}
                    sx={{ cursor: showHandCursor }}
                    className={column.className}
                  >
                    {renderTableCell(row, column, index)}
                  </TableCell>
                );
              })}
            </TableRow>
          ))} */}
      </>
    );
  };

  const _handleDateRange = (name, dates) => {
    const [startDate, endDate] = dates;
    if (
      startDate.isSame(queryParams.selectedDates[0]) &&
      endDate.isSame(queryParams.selectedDates[1])
    )
      return;
    const differenceInDays = Math.abs(startDate?.diff(endDate, 'day')) || null;
    if (differenceInDays > 30) {
      setErrors({ ...errors, selectedDates: 'You can select maximum 30 days data' });
      return;
    }
    delete errors.selectedDates;
    setErrors({ ...errors });
    updateFormHandler(name, dates);
  };

  const updateFormHandler = (name, value) => {
    setQueryParams((prevState) => {
      return {
        ...prevState,
        [name]: value,
      };
    });
  };

  const inputChangedHandler = (event) => {
    // Get name of changed input, and its corresponding value

    const { name, value } = event.target;
    if (name === 'siteId') {
      setSiteLocations([]);
      updateFormHandler('locationId', {});
    }
    // Update form state against the target input field
    updateFormHandler(name, value);
  };

  const gotoDetailPage = (column, row) => {
    if (
      (column.id === columnIdsEnum.adpBadgeNumber || column.id === columnIdsEnum.employeeName) &&
      row?.site?.id
    ) {
      setSelectedRow(row);
      setOpenShiftSideDrawer(true);
    }
  };

  const handleSelection = (event, newSelection) => {
    if (newSelection !== null) {
      setLoading(true);
      setData([]);
      setQueryParams((prev) => ({
        ...prev,
        page: 1,
      }));
      setSelectedTab(newSelection);
    }
  };

  const resetPage = () => {
    setData([]);
    setQueryParams((prevState) => {
      return {
        ...prevState,
        page: 1,
      };
    });
  };

  useEffect(() => {
    setData([]);
    setQueryParams((prev) => ({ ...prev, page: 1 }));
  }, [selectedDates]);

  // const handleDelete = () => {};
  return (
    <>
      <Box className={classes.salesUserListingContainer}>
        <Box className={classes.searchSectionDashboard}>
          <Box className={classes.searchSection}>
            <ToggleButtonGroup
              value={selectedTab}
              className={classes.statesButtons}
              exclusive
              onChange={handleSelection}
              aria-label="toggle button tabs"
            >
              <ToggleButton
                value={PAYROLL_TYPES.DEDICATED}
                aria-label="tab 1"
                className={classes.firstButton}
              >
                {t('obx.dashboard.dedicated')}
              </ToggleButton>
              <ToggleButton
                value={PAYROLL_TYPES.PATROL}
                aria-label="tab 2"
                className={classes.centerButton}
              >
                {t('obx.dashboard.patrol')}
              </ToggleButton>
              <ToggleButton
                value={PAYROLL_TYPES.SUPERVISOR}
                aria-label="tab 2"
                className={classes.lastButton}
              >
                {t('obx.payroll.supervisor')}
              </ToggleButton>
            </ToggleButtonGroup>
            <Box className={classes.dropdownCommonSection}>
              <CustomDropDown
                label={'Users'}
                name="officerId"
                searchable
                checkmark={true}
                options={allOfficers}
                selectedValues={queryParams.officerId}
                handleChange={inputChangedHandler}
                clearAll
                disabled={false}
                multiSelect={true}
                withTiles={true}
              />
            </Box>
            {selectedTab === PAYROLL_TYPES.DEDICATED ? (
              <Box className={classes.dropdownCommonSection}>
                <CustomDropDown
                  label={t('obx.payroll.allSites')}
                  name="siteIds"
                  searchable
                  options={allSites}
                  selectedValues={queryParams.siteIds}
                  handleChange={inputChangedHandler}
                  clearAll
                  disabled={false}
                  multiSelect={true}
                  withTiles={true}
                  checkmark={true}
                />
              </Box>
            ) : (
              <Box className={classes.dropdownCommonSection}>
                <CustomDropDown
                  label={t('obx.payroll.allRunsheets')}
                  name="runsheetIds"
                  searchable
                  options={runsheetOptions}
                  selectedValues={queryParams.runsheetIds}
                  handleChange={inputChangedHandler}
                  clearAll
                  disabled={false}
                  multiSelect={true}
                  withTiles={true}
                  checkmark={true}
                />
              </Box>
            )}
            <Box className={classes.dropdownCommonSection}>
              <CustomDropDown
                label={t('obx.schedules.filters.locations.all')}
                name="locationId"
                options={siteLocations}
                selectedValues={queryParams.locationId}
                handleChange={inputChangedHandler}
                searchPlaceholder={t('obx.schedules.filters.locations.searchPlaceholder')}
                searchable
              />
            </Box>
          </Box>
          <Box className={classes.userSection}>
            {selectedItems.length ? (
              <Button
                variant="primary"
                startIcon={<TickWhiteIcon />}
                onClick={() => setShowSelectedHoursModal(true)}
              >
                {`${t('obx.payroll.approvedLockPayroll')}`}
              </Button>
            ) : (
              ''
            )}
            <Box className={classes.invoicesDateRange}>
              <Button
                variant="secondaryGrey"
                startIcon={<DownloadCloud />}
                onClick={() => setExportModal(true)}
              >
                {`${t('obx.payroll.exportPayrun')}`}
              </Button>
            </Box>
          </Box>
        </Box>

        <Box className={classes.tableWrapper}>
          <TableComponent
            data={data}
            columns={columns}
            tableHead={tableHead}
            tableBody={tableBody}
            pagination={false}
            applySorting={applySorting}
          />
        </Box>
        <SelectedShiftHours
          open={showSelectedHoursModal}
          loading={isUpdating}
          onClose={() => setShowSelectedHoursModal(false)}
          onSave={handleMultipleShiftApprove}
        />
        <ShiftHours
          open={shiftHoursModal > -1}
          onClose={() => setShiftHoursModal(-1)}
          onSave={handleShiftApprove}
          loading={isUpdating}
        />
        <NotesModal open={!!notes} notes={notes} onClose={() => setNotes(null)} />

        {modelState?.exportModel && (
          <ExportPayrollModel
            open={modelState?.exportModel}
            onClose={() => handleModelChange('exportModel', false)}
            refetchPayroll={() => resetPage()}
            isPatrol={selectedTab === PAYROLL_TYPES.PATROL}
          />
        )}

        <TimeOffModal
          open={showTimeOffModal}
          onClose={() => setShowTimeOffModal(false)}
          refetchPayroll={() => resetPage()}
        />

        {openShiftSideDrawer && (
          <ShiftDetail
            isOpen={openShiftSideDrawer}
            drawerData={{
              shiftId: selectedRow?.id,
              shiftDate: selectedRow?.startsAt,
            }}
            closeDrawer={setOpenShiftSideDrawer}
            setShowDrawer={setOpenShiftSideDrawer}
            readonly={true}
          />
        )}

        {exportModal && (
          <ExportPayrollModel
            open={exportModal}
            onClose={() => setExportModal(false)}
            refetchPayroll={() => resetPage()}
            isPatrol={selectedTab === PAYROLL_TYPES.PATROL}
          />
        )}

        {showDedicatedDetailsDrawer && (
          <DutyDetail
            isOpen={showDedicatedDetailsDrawer}
            drawerData={shiftData}
            closeDrawer={() => setShowDedicatedDetailsDrawer(false)}
            setShowDrawer={() => setShowDedicatedDetailsDrawer(true)}
            getAllDuties={() => {}}
            activeIndex={shiftData?.activeIndex}
          />
        )}

        {console.log('---', { showDrawer })}

        {showDrawer?.open === DRAWER_TYPE.DETAIL && (
          <ShiftDetail
            {...{
              isOpen: showDrawer?.open === DRAWER_TYPE.DETAIL,
              drawerData: {
                shiftId: showDrawer?.data?.id,
                shiftType: showDrawer?.data?.shiftType,
                shiftDate: showDrawer?.data?.startsAt,
                startsAt: showDrawer?.data?.startsAt,
                endsAt: showDrawer?.data?.endsAt,
                runsheetId: showDrawer?.data?.runsheetId,
                shiftActivityLogId: showDrawer?.data?.shiftActivityLogId,
                rest: showDrawer.data,
              },
              activeIndex: showDrawer?.activeIndex,
              closeDrawer: showSideDrawer(''),
              setShowDrawer,
              // setAllDuties,
              // getAllDuties: () => getAllDutiesData(queryParams.filter, queryParams.selectedView),
            }}
          />
        )}
      </Box>
    </>
  );
};
export default LockedPayruns;

LockedPayruns.propTypes = {
  selectedDates: PropTypes.array,
};

LockedPayruns.defaultProps = {
  selectedDates: [],
};
