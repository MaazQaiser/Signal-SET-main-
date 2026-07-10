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
import { ReactComponent as LockPayrunIcon } from 'assets/svg/LockPayrunIcon.svg';
import { ReactComponent as TickWhiteIcon } from 'assets/svg/TickWhiteIcon.svg';
import { ReactComponent as WhitePlusIcon } from 'assets/svg/WhitePlusIcon.svg';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import CustomDropDown from 'src/app/components/common/customDropDown';
import InfiniteScrollCustom from 'src/app/components/common/infiniteScrollCustom';
// import DateRangePickerWithButtons from 'src/app/components/common/RangeDatepicker';
import SideDrawer from 'src/app/components/common/sideDrawer';
import TableSkeleton from 'src/app/components/common/skeletonLoader/tableSkeleton';
import TableComponent from 'src/app/components/common/table';
import NoRecordFound from 'src/app/components/common/table/noRecordFound';
import ExportPayrollModel from 'src/app/obx/pages/payroll/components/exportPayrollModel';
import {
  default as DutyDetail,
  default as ShiftDetail,
} from 'src/app/obx/pages/schedules/shiftDetail';
import { ReactComponent as BlueTickIcon } from 'src/assets/svg/BlueTickIcon.svg';
import { ReactComponent as CalanderIcon } from 'src/assets/svg/CalanderIcon.svg';
import { ReactComponent as CheckBoxRegularIcon } from 'src/assets/svg/checkbox.svg';
import { ReactComponent as CheckBoxCheckedIcon } from 'src/assets/svg/checkbox-checked.svg';
import { ReactComponent as CheckBoxCheckedDisabledIcon } from 'src/assets/svg/checkbox-checked-disabled.svg';
import { ReactComponent as CheckboxDisabledIcon } from 'src/assets/svg/checkbox-disabled.svg';
import { ReactComponent as EmployIcon } from 'src/assets/svg/EmployIcon.svg';
// import { ReactComponent as EyeViewIcon } from 'src/assets/svg/EyeViewIcon.svg';
import { ReactComponent as UnlockedIcon } from 'src/assets/svg/UnlockedIcon.svg';
import { useApiControllers } from 'src/helper/axios';
import { formatDate, timeFormat12h } from 'src/helper/utilityFunctions';
import {
  getPatrolPayroll,
  getPatrolPayrollFilters,
  getPayrolls,
  getSupervisorPayrolls,
  updatePayrolls,
} from 'src/services/payroll.services';
import { getAllSites, getSitesAllLocations } from 'src/services/sites.services';
import { getUsersWithDesiredType } from 'src/services/user.services';
import transformArrayForOptions from 'src/utils/array/transformArrayForOptions';
import { rolesEnum, toastSettings } from 'src/utils/constants';
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
import CreatePayrollDrawer from '../components/createPayrollDrawer';
import TextFieldPopover from '../components/invoiceAbleHoursPopover';
import NotesModal from '../components/notesModal';
import RunSheetPayrollDetailsDrawer from '../components/runSheetPayrollDetailsDrawer';
import SelectedShiftHours from '../components/selectedShiftHoursModal';
import ShiftHours from '../components/shiftHoursModal';
import TimeOffModal from '../components/timeOffModal';
import TimePopover from '../components/timePopover';
import { useStyles } from './payrollListing';

const PAYROLL_TYPES = {
  PATROL: 'patrol',
  DEDICATED: 'dedicated',
  SUPERVISOR: 'supervisor',
};

const SHIFT_DRAWER_INDICES = {
  DETAILS: 0,
  REPORTS: 1,
  NOTES: 2,
  LOGS: 3,
};

const i18ColumnName = (t, selectedTab) => {
  return [
    {
      id: 'checkbox',
      label: ``,
    },
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
    {
      id: 'action',
      label: ``,
      sortable: false,
    },
  ];
};

const statusFilterOptions = [
  { value: undefined, label: 'Payroll Statuses' },
  { value: true, label: 'Approved' },
  { value: false, label: 'Unapproved' },
];

const shiftStatusFilterOptions = [
  { value: undefined, label: 'All Shift Statuses' },
  { value: 'completed', label: 'Completed' },
  { value: 'unassigned', label: 'Unassigned' },
  { value: 'notStarted', label: 'Not Started' },
];

const shiftStatusesEnum = {
  COMPLETED: 'completed',
  UNASSIGNED: 'unassigned',
  NOT_STARTED: 'notStarted',
};

const today = dayjsWithStandardOffset().startOf('day');

// const lastMonth = dayjsWithStandardOffset().subtract(1, 'month').endOf('day');

const threeDaysBefore = dayjsWithStandardOffset().subtract(3, 'day');

// Value for pagination (infinite scroll) on payroll listing
const INFINITE_SCROLL_VALUES = {
  INITIAL_RENDER: 15,
};

const params = {
  search: '',
  sortBy: '',
  orderBy: '',
  selectedDates: [threeDaysBefore, today],
  officerId: [],
  siteIds: {},
  locationId: {},
  runsheetIds: [],
  isApproved: { value: undefined, label: 'Payroll Statuses' },
  shiftStatus: { value: 'completed', label: 'Completed' },
  page: 1,
  perPage: INFINITE_SCROLL_VALUES.INITIAL_RENDER,
  // more filters
};

const order = {
  orderBy: 'id',
  orderType: 'asc',
};

const columnIdsEnum = {
  checkbox: 'checkbox',
  action: 'action',
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
  hitsDone: 'hitsDone',
  name: 'name',
};

const Payroll = ({ selectedDates, exportModal, setExportModal }) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const { getNewApiController } = useApiControllers();
  const classDealName = classes.locationTD;
  const [selectedTab, setSelectedTab] = useState(PAYROLL_TYPES.DEDICATED);
  const [showDetailsDrawer, setShowDetailsDrawer] = useState(false);
  const [showDrawer, setShowDrawer] = useState({
    open: '',
    data: {},
    activeIndex: 0,
  });
  const columns = i18ColumnName(t, selectedTab, classDealName);
  const userRole = useSelector((state) => state.auth.userRole);
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
  const [runsheetOptions, setRunsheetOptions] = useState([]);
  const [allSites, setAllSites] = useState([]);
  const [allOfficers, setAllOfficers] = useState([]);
  const [siteLocations, setSiteLocations] = useState([]);
  const [errors, setErrors] = useState({});
  const [selectedRow, setSelectedRow] = useState(null);
  const [showPayrollDrawer, setShowPayrollDrawer] = useState(false);
  const [lastElement, setLastElement] = useState(null);

  const [shiftData, setShiftData] = useState(null);
  const [showDedicatedDetailsDrawer, setShowDedicatedDetailsDrawer] = useState(false);
  const [openShiftSideDrawer, setOpenShiftSideDrawer] = useState(false);
  const [paginationStats, setPaginationStats] = useState(null);
  const [addingMoreData, setAddingMoreData] = useState(false);

  const NA = t('commonText.nA');

  const handleOpenPayrollDrawer = () => {
    setShowPayrollDrawer(true);
  };
  const handleSelection = (event, newSelection) => {
    if (newSelection !== null) {
      setLoading(true);
      setData([]);
      setSelectAll(false);
      setSelectedItems([]);
      setQueryParams((prev) => ({
        ...prev,
        page: 1,
      }));
      setSelectedTab(newSelection);
    }
  };

  const handleShiftHourModal = (row) => {
    setShowSelectedHoursModal(true);
    setSelectedRow(row);
  };

  const handleOpenTimeModal = () => {
    setShowTimeOffModal(true);
  };

  useEffect(() => {
    if (queryParams?.siteIds?.value) {
      getLocationsOfSite(queryParams?.siteIds?.value);
    }
  }, [queryParams?.siteIds?.value]);

  useEffect(() => {
    if (!allOfficers.length) fetchAllOfficers();
    if (selectedTab === PAYROLL_TYPES.DEDICATED && !allSites.length) fetchAllSites();
    if (selectedTab === PAYROLL_TYPES.PATROL && !runsheetOptions.length) fetchAllRunsheets();
  }, [selectedTab]);

  const handleSelectAllChange = (event) => {
    const isChecked = event.target.checked;
    setSelectAll(isChecked);
    if (isChecked) {
      setSelectedItems(
        data.filter((row) => !row?.isApproved && row?.officer?.id).map((row) => row?.id),
      );
      return;
    }
    setSelectedItems([]);
  };

  const handleCheckboxChange = (event, id) => {
    if (event.target.checked) {
      setSelectedItems([...selectedItems, id]);
      return; // Return early
    }
    setSelectedItems(selectedItems.filter((item) => item !== id));
  };

  const handleRowUpdate = async (index, key, value) => {
    const payload = {
      id: data[index].id,
      dataType: data[index].dataType,
      payableHours: data[index].payableHours,
      [key]: value,
      isApproved: false,
    };
    if (selectedTab === PAYROLL_TYPES.PATROL) payload.isPatrol = true;
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
      if (selectedTab === PAYROLL_TYPES.PATROL) payload.isPatrol = true;
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

  const getLocationsOfSite = async (siteIds) => {
    try {
      const response = await getSitesAllLocations(siteIds);

      if (response?.statusCode === 200) {
        const locationsRes = response?.data?.locations || [];

        if (locationsRes?.length) {
          setSiteLocations([
            { label: 'All Locations', value: '' },
            ...transformArrayForOptions(locationsRes, 'name', 'id'),
          ]);
        } else {
          setSiteLocations([]);
        }
      }
    } catch (error) {
      setSiteLocations([]);
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
            ? getSupervisorPayrolls
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
              siteId: queryParams?.siteId?.value ? [queryParams?.siteId?.value] : [],
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

  useEffect(() => {
    fetchPayrolls();
  }, [selectedTab, queryParams]);

  useEffect(() => {
    setData([]);
    setQueryParams((prev) => ({ ...prev, page: 1 }));
  }, [selectedDates]);

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

  const renderTableCell = (row, column, index) => {
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
              {row?.officer?.name?.length > 25 ? (
                <Tooltip
                  title={<Box sx={{ textTransform: 'capitalize' }}>{row?.officer?.name}</Box>}
                  placement="right"
                  arrow
                >
                  {truncateString(row?.officer?.name, 25) || NA}
                </Tooltip>
              ) : (
                row?.officer?.name
              )}
              {/* {row?.site?.id && row?.notes?.length ? <EmployIcon /> : ''} */}
              {row?.site?.id && row?.notes?.length ? (
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
              {/*{selectedTab === PAYROLL_TYPES.PATROL && (*/}
              {/*  <Button*/}
              {/*    disableRipple*/}
              {/*    onClick={() => setShowDetailsDrawer(true)}*/}
              {/*    className={classes.notesCloseBtn}*/}
              {/*    variant="onlyText"*/}
              {/*    startIcon={<EyeViewIcon />}*/}
              {/*  ></Button>*/}
              {/*)}*/}
              {(selectedTab === PAYROLL_TYPES.DEDICATED ||
                selectedTab === PAYROLL_TYPES.PATROL) && (
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
              )}
              {row.isApproved ? (
                <Button
                  disableRipple
                  className={classes.notesCloseBtn}
                  variant="onlyText"
                  startIcon={<UnlockedIcon />}
                ></Button>
              ) : (
                <Button
                  disableRipple
                  className={classes.notesCloseBtn}
                  variant="onlyText"
                  startIcon={<BlueTickIcon />}
                  disabled={!row?.approvedStartsAt && !row?.approvedEndsAt}
                  onClick={() => row?.officer?.id && handleShiftHourModal(row)}
                ></Button>
              )}
            </Box>
          }
        </>
      );
    }
    if (column.id === columnIdsEnum.invoiceableHours) {
      return (
        <>
          <TextFieldPopover
            disabled={!row?.officer?.id}
            value={row.invoiceableHours}
            onSave={(time) => handleRowUpdate(index, 'invoiceableHours', time)}
            isLoading={isUpdating}
          />
        </>
      );
    }
    if (column.id === columnIdsEnum.approvedHours) {
      return (
        <>
          {
            <Box className={classes.inlineField}>
              <TimePopover
                disabled={!row?.officer?.id || userRole.slug === rolesEnum.supervisor}
                value={row?.approvedStartsAt ? dayjsWithStandardOffset(row?.approvedStartsAt) : ''}
                onSave={(time) =>
                  handleRowUpdate(
                    index,
                    'approvedStartsAt',
                    dayjsWithStandardOffset(time).second(0),
                  )
                }
                isLoading={isUpdating}
              />
              <Typography className={classes.spaceer}>-</Typography>
              <Tooltip
                title={
                  !row?.approvedStartsAt &&
                  row?.officer?.id &&
                  t('obx.payroll.approvedEndsAtTooltip')
                }
                arrow
              >
                <Box>
                  <TimePopover
                    disabled={
                      !row?.officer?.id ||
                      !row?.approvedStartsAt ||
                      userRole.slug === rolesEnum.supervisor
                    }
                    value={row?.approvedEndsAt ? dayjsWithStandardOffset(row?.approvedEndsAt) : ''}
                    onSave={(time) =>
                      handleRowUpdate(
                        index,
                        'approvedEndsAt',
                        dayjsWithStandardOffset(time).second(0),
                      )
                    }
                    isLoading={isUpdating}
                  />
                </Box>
              </Tooltip>
              <Typography className={classes.hourValue}>({row?.payableHours || 0}h)</Typography>
            </Box>
          }
        </>
      );
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
        <>{`${row?.checkin ? timeFormat12h(row?.checkin, true) : 0} - ${row?.checkout ? timeFormat12h(row?.checkout, true) : 0}  (${row?.punchedHours || 0}h)`}</>
      );
    }
    if (column.id === columnIdsEnum.checkbox) {
      return (
        <>
          <Checkbox
            checked={selectedItems.includes(row?.id)}
            onChange={(event) => row?.officer?.id && handleCheckboxChange(event, row?.id)}
            icon={row?.isApproved ? <CheckboxDisabledIcon /> : <CheckBoxRegularIcon />}
            checkedIcon={
              row?.isApproved ? <CheckBoxCheckedDisabledIcon /> : <CheckBoxCheckedIcon />
            }
            disableRipple
            className={classes.checkBoxCustom}
            disabled={row?.isApproved}
          />
        </>
      );
    }
    if (column.id === columnIdsEnum.hourlyRate) {
      return <>{`$${row?.hourlyRate}`}</>;
    }
    if (column.id === columnIdsEnum.adpBadgeNumber) {
      return (
        <>
          {row?.adpBadgeNumber?.length > 14 ? (
            <>
              <Tooltip title={row?.adpBadgeNumber} placement="right" arrow>
                {truncateString(row?.adpBadgeNumber, 14) || NA}
              </Tooltip>
            </>
          ) : (
            <>{truncateString(row?.adpBadgeNumber, 14) || NA}</>
          )}
        </>
        // <Tooltip title={row?.adpBadgeNumber} placement="right" arrow>
        //   {truncateString(row?.adpBadgeNumber, 20) || NA}
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
      page: 1,
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

  const getMoreData = () => {
    if (paginationStats?.nextPage) {
      setAddingMoreData(true);
      setQueryParams((prev) => ({
        ...prev,
        page: paginationStats?.nextPage,
      }));
    }
  };

  const tableBody = (data, i18ColumnName) => {
    return loading ? (
      <TableSkeleton columns={i18ColumnName} />
    ) : (
      <>
        <NoRecordFound data={data} noOfColumns={i18ColumnName?.length} t={t} />
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
            <Tooltip
              title={!row?.officer?.id && t('obx.payroll.noOfficerTooltip')}
              arrow
              key={row?.id}
            >
              <TableRow
                key={row?.id}
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
    // const differenceInDays = Math.abs(startDate?.diff(endDate, 'day')) || null;
    // if (differenceInDays > 30) {
    //   setErrors({ ...errors, selectedDates: 'You can select maximum 30 days data' });
    //   console.log(queryParams?.selectedDates);
    //   updateFormHandler(name, queryParams?.selectedDates);
    //   return;
    // }

    if (startDate) {
      setMinMaxDates({
        min: dayjsWithStandardOffset(startDate).subtract(1, 'month').startOf('day'),
        max: dayjsWithStandardOffset(startDate).add(1, 'month').endOf('day'),
      });
    }
    delete errors.selectedDates;
    setErrors({ ...errors });
    updateFormHandler(name, dates);
  };

  const updateFormHandler = (name, value) => {
    setData([]);
    setQueryParams((prevState) => {
      return {
        ...prevState,
        [name]: value,
        page: 1,
      };
    });
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

  const inputChangedHandler = (event) => {
    // Get name of changed input, and its corresponding value

    const { name, value } = event.target;

    // Update form state against the target input field
    updateFormHandler(name, value);
  };

  const gotoDetailPage = (column, row) => {
    const isADPBadgeOrEmployeeName =
      column.id === columnIdsEnum.adpBadgeNumber || column.id === columnIdsEnum.employeeName;

    const isDedicatedTab = selectedTab === PAYROLL_TYPES.DEDICATED && row?.site?.id;
    // const isPatrolTab = selectedTab === PAYROLL_TYPES.PATROL && row?.id;

    if (isADPBadgeOrEmployeeName && isDedicatedTab) {
      setSelectedRow({
        ...row,
        shiftActivityLogId: row?.id,
        activeIndex: SHIFT_DRAWER_INDICES.DETAILS,
      });
      setOpenShiftSideDrawer(true);
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
                aria-label="tab 3"
                className={classes.lastButton}
              >
                {t('obx.payroll.supervisor')}
              </ToggleButton>
            </ToggleButtonGroup>
            <Box className={classes.dropdownCommonSection}>
              <CustomDropDown
                label={t('obx.payroll.users')}
                name="officerId"
                searchable
                checkmark={true}
                options={allOfficers}
                selectedValues={queryParams.officerId}
                handleChange={inputChangedHandler}
                clearAll
                disabled={queryParams.shiftStatus.value === shiftStatusesEnum.UNASSIGNED}
                multiSelect={true}
                withTiles={true}
              />
            </Box>
            {selectedTab === PAYROLL_TYPES.DEDICATED && (
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
                  multiSelect={false}
                  withTiles={true}
                  checkmark={true}
                />
              </Box>
            )}
            {selectedTab === PAYROLL_TYPES.PATROL && (
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

            {selectedTab === PAYROLL_TYPES.DEDICATED && (
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
            )}

            <Box className={classes.dropdownCommonSection}>
              <CustomDropDown
                label={t('obx.payroll.payrollStatuses')}
                name="isApproved"
                options={statusFilterOptions}
                selectedValues={queryParams.isApproved}
                handleChange={inputChangedHandler}
                multiSelect={false}
                checkmark={false}
                searchable={false}
                withTiles={true}
              />
            </Box>
            {selectedTab !== PAYROLL_TYPES.SUPERVISOR && (
              <Box className={classes.dropdownCommonSection}>
                <CustomDropDown
                  label={t('obx.payroll.allShiftStatuses')}
                  name={t('obx.payroll.shiftStatusKey')}
                  options={shiftStatusFilterOptions}
                  selectedValues={queryParams.shiftStatus || {}}
                  handleChange={inputChangedHandler}
                  multiSelect={false}
                  checkmark={false}
                  searchable={false}
                  withTiles={true}
                />
              </Box>
            )}
          </Box>
          <Box className={classes.userSection}>
            <Button
              variant="secondaryGrey"
              startIcon={<LockPayrunIcon />}
              onClick={handleOpenTimeModal}
            >
              {`${t('obx.payroll.lockPayrun')}`}
            </Button>

            {selectedItems?.length ? (
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
            {selectedTab === PAYROLL_TYPES.DEDICATED && (
              <Button
                variant="primary"
                startIcon={<WhitePlusIcon />}
                onClick={handleOpenPayrollDrawer}
              >
                {`${t('obx.payroll.createPayroll')}`}
              </Button>
            )}
          </Box>
        </Box>

        <>
          <Box
            className={
              selectedTab === PAYROLL_TYPES.SUPERVISOR
                ? classes.tableWrapperSupervisor
                : classes.tableWrapper
            }
          >
            <TableComponent
              data={data}
              columns={columns}
              tableHead={tableHead}
              tableBody={tableBody}
              pagination={false}
              applySorting={applySorting}
            />
          </Box>
        </>

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

        {exportModal && (
          <ExportPayrollModel
            open={exportModal}
            onClose={() => setExportModal(false)}
            refetchPayroll={() => resetPage()}
            isPatrol={selectedTab === PAYROLL_TYPES.PATROL}
          />
        )}

        <TimeOffModal
          open={showTimeOffModal}
          onClose={() => setShowTimeOffModal(false)}
          refetchPayroll={() => resetPage()}
          isPatrol={selectedTab === PAYROLL_TYPES.PATROL}
        />

        {showDrawer?.open === DRAWER_TYPE.DETAIL && (
          <ShiftDetail
            {...{
              isOpen: showDrawer?.open === DRAWER_TYPE.DETAIL,
              hideButtons: true,
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

        <SideDrawer isOpen={showPayrollDrawer} totalWidth="1000px">
          <CreatePayrollDrawer
            setShowDrawer={setShowPayrollDrawer}
            refreshData={() => {
              resetPage();
            }}
            isPatrol={selectedTab === PAYROLL_TYPES.PATROL}
          />
        </SideDrawer>
        <SideDrawer
          isOpen={showDetailsDrawer}
          totalWidth={'1261px'}
          className={classes.sideDrawerHeight}
        >
          <RunSheetPayrollDetailsDrawer
            showDrawer={showDetailsDrawer}
            setShowDrawer={setShowDetailsDrawer}
          />
        </SideDrawer>
        {openShiftSideDrawer && (
          <ShiftDetail
            isOpen={openShiftSideDrawer}
            drawerData={{
              shiftId: selectedRow?.id,
              shiftDate: selectedRow?.startsAt,
              shiftType: selectedRow?.shiftType,
              rest: selectedRow,
            }}
            closeDrawer={setOpenShiftSideDrawer}
            setShowDrawer={setOpenShiftSideDrawer}
            readonly={true}
            activeIndex={selectedRow?.activeIndex || SHIFT_DRAWER_INDICES.DETAIL}
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
      </Box>
    </>
  );
};
export default Payroll;

Payroll.propTypes = {
  selectedDates: PropTypes.array,
  exportModal: PropTypes.bool,
  setExportModal: PropTypes.func,
};

Payroll.defaultProps = {
  selectedDates: [],
  exportModal: false,
  setExportModal: () => {},
};
