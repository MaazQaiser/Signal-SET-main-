import CallSplitIcon from '@mui/icons-material/CallSplit';
import {
  Box,
  Button,
  Chip,
  FormControlLabel,
  IconButton,
  InputLabel,
  Radio,
  TableBody,
  TableCell,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';
import { ReactComponent as PlusIcon } from 'assets/svg/add-icon.svg';
import { ReactComponent as AlertYellowIcon } from 'assets/svg/AlertYellowIcon.svg';
import { ReactComponent as AssignIcon } from 'assets/svg/assign-runsheet.svg';
import { ReactComponent as CancelIcon } from 'assets/svg/cancel-hit.svg';
import { ReactComponent as ChevronRight } from 'assets/svg/chevron-right.svg';
import {
  ReactComponent as DeleteIcon,
  ReactComponent as DeleteSweetAlertIcon,
} from 'assets/svg/delete-modal.svg';
import { ReactComponent as EditIcon } from 'assets/svg/edit-icon.svg';
import { ReactComponent as MinusIcon } from 'assets/svg/minus-icon.svg';
import { ReactComponent as AssignRunsheetIcon } from 'assets/svg/runsheetbg.svg';
import classNames from 'classnames';
import TableComponent, { TablePaginationComp } from 'commonComponents/table';
import NoRecordFound from 'commonComponents/table/noRecordFound';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import React, { Fragment, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
// import { useSelector } from 'react-redux';
import { useHistory, useParams } from 'react-router-dom';
import CustomDropDown from 'src/app/components/common/customDropDown';
import ModalComponent from 'src/app/components/common/modal';
import PopoverButton from 'src/app/components/common/popoverButton';
import DateRangePickerWithButtons from 'src/app/components/common/RangeDatepicker';
import AccordionSkeleton from 'src/app/components/common/skeletonLoader/accordionSkeleton';
import TableSkeleton from 'src/app/components/common/skeletonLoader/tableSkeleton';
import SweetAlertModal from 'src/app/components/common/sweetAlertModal';
import ResponsiveTimePickers from 'src/app/components/common/timePicker';
import { visitTypes } from 'src/app/components/salesComponents/contractCreation/addServices/helper';
import { siteStatusEnum } from 'src/app/homeOffice/pages/franchise/utils/enums';
import { NoTourTemplateModalBody } from 'src/app/obx/pages/runSheets/components/noTemplateAssignedModal';
import RunsheetsAccordion from 'src/app/obx/pages/runSheets/components/runsheetsAccordion';
import {
  dayjsWithStandardOffset,
  getCurrentStandardTimeInIsoWrtTimezone,
  getDaysWrtTimezoneAsPerStandardTime,
  getEmbededDateAndTimeWRTStandardOffset,
  getFranchiseIdWithRoleAndSource,
  getLastShiftStartEndTimeOfJob,
  getStartEndTimeWithDesiredDate,
  getTimezone,
} from 'src/app/obx/pages/schedules/helper';
import {
  HO_SITES_CREATE_EXTRA_DUTY,
  OBX_SITES_CREATE_EXTRA_DUTY,
} from 'src/app/router/constant/ROUTE';
import { AddIcon, MoreVert } from 'src/assets/svg';
import { ReactComponent as WarningOrangeIcon } from 'src/assets/svg/info.svg';
import {
  calculateAndDisplayRouteUtils,
  getDaysStringFromNumbers,
  isObjectEmpty,
  timeFormat12h,
  updateLastItemWithUniqueId,
} from 'src/helper/utilityFunctions';
import {
  addHitToRunsheet,
  deleteExtraJob,
  deleteHitById,
  deleteShiftById,
  editPatrolHit,
  fetchJobsAndShiftsListBySiteId,
  fetchRunsheetsByHitAndDay,
} from 'src/services/duty.services';
import { getSitesContracts } from 'src/services/sites.services';
import transformArrayForOptions from 'src/utils/array/transformArrayForOptions';
import {
  contractStatusEnum,
  franchiseIdUrlQueryParam,
  paginationOptions,
  rolesEnum,
  timeZoneKeyUrlQueryParam,
  // rolesEnum,
  toastSettings,
} from 'src/utils/constants';
import { DRAWER_TYPE, SCHEDULE_DUTIES } from 'src/utils/constants/schedules';
import { throwAPIError } from 'src/utils/throwAPIError';
import { toaster } from 'src/utils/toast';

import TableAccordion from '../tableAccordion';
import AccordionHeader from './AccordionHeader';
import AssignmentSideDrawer from './assignmentSideDrawer';
import EditShiftModal from './editShiftModal';
import { useStyles } from './jobs.styles';
import PatrolAssignTour from './PatrolAssignTour';
import SplitJobSideDrawer from './splitJobSideDrawer';

const i18ColumnName = (hoverIconClass, expandableClass, t) => {
  return [
    {
      key: 'expandable',
      label: '',
      className: expandableClass,
    },
    {
      key: 'name',
      label: t('obx.sites.jobs.shiftList.shifts'),
      sortable: false,
      className: hoverIconClass,
    },
    {
      key: 'startsAt',
      label: t('obx.sites.jobs.shiftList.startTime'),
      sortable: false,
    },
    {
      key: 'endsAt',
      label: t('obx.sites.jobs.shiftList.endTime'),
      sortable: false,
    },
    {
      key: 'serviceTime',
      label: t('obx.sites.jobs.shiftList.serviceTime'),
      sortable: false,
      patrolOnly: true,
    },
    {
      key: 'visitType',
      label: t('obx.sites.jobs.shiftList.visitType'),
      sortable: false,
      patrolOnly: true,
    },
    {
      key: 'days',
      label: t('obx.sites.jobs.shiftList.days'),
      sortable: false,
    },
    {
      key: 'actions',
      label: '',
    },
  ];
};

export const assignmentMinDate = (jobStartDateInISO, shiftEndTimeInIso) => {
  if (getCurrentStandardTimeInIsoWrtTimezone() < jobStartDateInISO) {
    // if current time is less than starting of contract date
    return dayjsWithStandardOffset(jobStartDateInISO);
  }

  if (getCurrentStandardTimeInIsoWrtTimezone() >= shiftEndTimeInIso) {
    // if shift end time has passed for today, date selection will start from tomorrow
    return getEmbededDateAndTimeWRTStandardOffset(
      jobStartDateInISO,
      dayjsWithStandardOffset().add(1, 'd').format('YYYY-MM-DD'),
    );
  }

  return getEmbededDateAndTimeWRTStandardOffset(
    jobStartDateInISO,
    dayjsWithStandardOffset().format('YYYY-MM-DD'),
  );
};
export const sortSplittedShifts = (shifts = []) => {
  return shifts.sort((a, b) => (a.name > b.name ? 1 : -1));
};

export const sortDays = (days = []) => {
  // sunday should be at last in ascending order sorting
  return days?.sort((a, b) => {
    let first = a || 7; // if day is zero then convert it to 7.
    let second = b || 7; // if day is zero then convert it to 7.
    return first - second;
  });
};

const Jobs = ({ siteData }) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const hoverIconClass = classes.SitesTD;
  const expandableClass = classes.expandClass;
  const columns = i18ColumnName(hoverIconClass, expandableClass, t);
  // const currentUserRole = useSelector((state) => state?.auth?.userRole?.slug);
  const [confirmationModal, setConfirmationModal] = useState(false);
  const [deletableShiftDetail, setDeletableShiftDetail] = useState(null);
  const [deletableShiftActionBtn, setDeletableShiftActionBtn] = useState(false);
  const [selectedShiftDates, setSelectedShiftDates] = useState([]);
  const [deleteShiftErrorMessage, setDeleteShiftErrorMessage] = useState('');

  const [jobsList, setJobsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDrawer, setShowDrawer] = useState({
    open: '',
    data: {},
  });
  const [showSubDetail, setShowSubDetail] = useState({});
  const param = useParams();
  const [queryParams, setQueryParams] = useState({
    page: paginationOptions.defaultPerPage,
    perPage: paginationOptions.perPageRows,
    totalRecords: 0,
    contractId: undefined,
  });
  const [contracts, setContracts] = useState([]);
  const [selectedContract, setSelectedContract] = useState({});
  const [editableHitDetail, setEditableHitDetail] = useState(null);
  const [showAssignToRunsheet, setShowAssignToRunsheet] = useState(null);

  const franchiseIdWithRoleAndSource = getFranchiseIdWithRoleAndSource();
  const franchiseTimeZoneFromUrl = getTimezone();
  const [showEditJobTimeModal, setShowEditJobTimeModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  const history = useHistory();

  const showSubDetailHandler = (selectedRow) => {
    setShowSubDetail({ ...showSubDetail, [selectedRow?.id]: !showSubDetail[selectedRow?.id] });
  };

  const handleDeleteJob = async (jobId) => {
    try {
      setConfirmationModal(null);
      setLoading(true);

      const res = await deleteExtraJob(jobId);

      // get jobs
      getJobsListBySiteId();

      toaster.success({
        text: res?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
      setLoading(false);
      setConfirmationModal(null);
    } catch (error) {
      setConfirmationModal(null);
      setLoading(false);
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  const selectDatesHandler = (dates) => {
    setSelectedShiftDates(dates);
    setDeleteShiftErrorMessage('');
  };

  const handleCancelDeleteShift = () => {
    setSelectedShiftDates([]);
    setDeleteShiftErrorMessage('');
    setDeletableShiftDetail(null);
    setDeletableShiftActionBtn(false);
  };

  const handleDeleteShift = async (shift) => {
    try {
      if (!selectedShiftDates?.[0]) {
        setDeleteShiftErrorMessage(
          t('obx.sites.jobs.deleteShiftModal.errorMessages.startDateRequired'),
        );
        return;
      }
      if (!selectedShiftDates?.[1]) {
        setDeleteShiftErrorMessage(
          t('obx.sites.jobs.deleteShiftModal.errorMessages.endDateRequired'),
        );
        return;
      }

      setDeletableShiftActionBtn(true);
      let startDate = null;
      let endDate = null;
      if (shift?.shiftType === SCHEDULE_DUTIES.PATROL) {
        const dateForValidation = '2024-01-01';
        const { isEndTimeOnNextDateWrtStandardTime } = getStartEndTimeWithDesiredDate(
          dateForValidation,
          selectedShiftDates?.[0],
          selectedShiftDates?.[1],
        );
        startDate = getEmbededDateAndTimeWRTStandardOffset(
          shift?.startsAt,
          selectedShiftDates?.[0],
        );
        endDate = getEmbededDateAndTimeWRTStandardOffset(shift?.endsAt, selectedShiftDates?.[1]);
        if (isEndTimeOnNextDateWrtStandardTime) {
          endDate = endDate.date(endDate.date() + 1);
        }
      } else {
        // dedicated
        startDate = getEmbededDateAndTimeWRTStandardOffset(
          shift?.startsAt,
          selectedShiftDates?.[0],
        );
        endDate = getEmbededDateAndTimeWRTStandardOffset(shift?.startsAt, selectedShiftDates?.[1]);
      }

      const res =
        shift?.shiftType === SCHEDULE_DUTIES.PATROL
          ? await deleteHitById({
              hitId: shift?.id,
              start: startDate?.toISOString(),
              end: endDate?.toISOString(),
            })
          : await deleteShiftById({
              shiftId: shift?.id,
              start: startDate?.toISOString(),
              end: endDate?.toISOString(),
            });

      // get jobs
      getJobsListBySiteId();

      toaster.success({
        text: res?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });

      setSelectedShiftDates([]);
      setDeleteShiftErrorMessage('');
      setDeletableShiftDetail(null);
      setDeletableShiftActionBtn(false);
    } catch (error) {
      setSelectedShiftDates([]);
      setDeleteShiftErrorMessage('');
      setDeletableShiftDetail(null);
      setDeletableShiftActionBtn(false);
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  const jobEndValidationMessage = (job) => {
    if (
      job?.contractStatus === contractStatusEnum.TERMINATED &&
      job?.dutyType !== SCHEDULE_DUTIES.EXTRA
    ) {
      return t('obx.sites.jobs.error.contractTerminated');
    }
    if (getCurrentStandardTimeInIsoWrtTimezone() >= job?.lastShiftEndTime) {
      return t('obx.sites.jobs.error.jobEnded');
    }

    return '';
  };

  const handleShowAssignmentDrawer = (shiftId, startsAt, endsAt, job) => {
    const jobEndCheckInfoMessage = jobEndValidationMessage(job);

    if (jobEndCheckInfoMessage) {
      return toaster.info({
        text: t(jobEndCheckInfoMessage),
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }

    const { endTime: shiftEndTimeWRTCurrentDate } = getStartEndTimeWithDesiredDate(
      dayjsWithStandardOffset().format('YYYY-MM-DD'),
      startsAt,
      endsAt,
    ); // shift start and end time WRT current standard time

    showSideDrawer(DRAWER_TYPE.ASSIGN)({
      id: shiftId,
      shiftDate: assignmentMinDate(startsAt, shiftEndTimeWRTCurrentDate),
    });
  };
  const handleShowSplitDrawer = (shiftId, job) => {
    const jobEndCheckInfoMessage = jobEndValidationMessage(job);

    if (jobEndCheckInfoMessage) {
      return toaster.info({
        text: t(jobEndCheckInfoMessage),
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }

    showSideDrawer(DRAWER_TYPE.SPLIT)({ id: shiftId });
  };
  const handleShowTourAssignmentDrawer = (hitId) => {
    showSideDrawer(DRAWER_TYPE.TOUR_ASSIGNMENT)({
      id: hitId,
    });
  };
  const handleShowEditHit = (hitDetail) => {
    setEditableHitDetail(hitDetail);
  };
  const handleCancelEditHit = () => {
    setEditableHitDetail(null);
  };

  const handleShowAssignToRunsheet = (hitDetail) => {
    setShowAssignToRunsheet(hitDetail);
  };
  const handleCloseAssignToRunsheet = () => {
    setShowAssignToRunsheet(null);
  };

  const handleShowDeleteShiftModal = (shift) => {
    setDeleteShiftErrorMessage('');
    setDeletableShiftDetail(shift);
    setDeletableShiftActionBtn(false);
  };

  const VisitTypeValues = {
    fixed: 'Fixed',
    random: 'Random',
  };

  const getShiftDaysWRTStandardTime = (startsAt, days, disableDaysShortNotation) => {
    return getDaysStringFromNumbers(
      sortDays(getDaysWrtTimezoneAsPerStandardTime(startsAt, days)),
      disableDaysShortNotation,
    );
  };

  const shiftTableRenderer = ({ shift, showSubDetailHandler, job }) => {
    const showAssignmentCheck =
      [SCHEDULE_DUTIES.DEDICATED, SCHEDULE_DUTIES.EXTRA].includes(shift?.shiftType) &&
      (!shift?.splitShifts || shift?.splitShifts?.length === 0);

    const isJobEnded = getCurrentStandardTimeInIsoWrtTimezone() >= job?.lastShiftEndTime;

    let days = <></>;
    if (shift?.shiftType === SCHEDULE_DUTIES.PATROL) {
      days = (
        <>
          <span style={{ color: 'green', marginRight: '4px' }}>
            {getShiftDaysWRTStandardTime(
              shift?.startsAt,
              shift?.assignedDays,
              shift?.assignedDays?.length > 0 && shift?.assignedDays?.length !== 7,
            )}
            {shift?.assignedDays?.length > 0 && shift?.unassignedDays?.length > 0 ? ',' : ''}
          </span>
          <span style={{ color: 'red' }}>
            {getShiftDaysWRTStandardTime(
              shift?.startsAt,
              shift?.unassignedDays,
              shift?.assignedDays?.length > 0 && shift?.assignedDays?.length !== 7,
            )}
          </span>
        </>
      );
    } else {
      days = <>{getShiftDaysWRTStandardTime(shift?.startsAt, shift?.shiftDays)}</>;
    }

    return {
      expandable:
        shift?.splitShifts?.length > 0 ? (
          <Box className={classes.jobsSplitIcon} onClick={() => showSubDetailHandler(shift)}>
            {showSubDetail[shift?.id] ? (
              <IconButton size="small" disableRipple>
                <MinusIcon />
              </IconButton>
            ) : (
              <PlusIcon />
            )}
          </Box>
        ) : (
          <></>
        ),
      name: (
        <Box
          className={classes.franchiseName}
          onClick={() => {
            if (showAssignmentCheck) {
              handleShowAssignmentDrawer(shift?.id, shift?.startsAt, shift?.endsAt, job);
              return;
            }
            if (shift?.shiftType === SCHEDULE_DUTIES.PATROL) {
              handleShowTourAssignmentDrawer(shift?.id);
              return;
            }
          }}
        >
          <Box>{shift?.name || t('commonText.nA')}</Box>
          {shift?.shiftType === SCHEDULE_DUTIES.PATROL && (
            <>
              {shift?.cancelled ? (
                <Chip color="error" size="small" label={t('obx.sites.jobs.cancelBadge')} />
              ) : !shift?.tour ? (
                <Tooltip
                  arrow
                  slotProps={{
                    popper: {
                      modifiers: [
                        {
                          name: 'offset',
                          options: {
                            offset: [0, -14],
                          },
                        },
                      ],
                      sx: { cursor: 'pointer' },
                    },
                  }}
                  title={t('obx.sites.jobs.addTourInfoMsg')}
                  placement="bottom"
                >
                  <WarningOrangeIcon className={classes.aletIcon} />
                </Tooltip>
              ) : (
                <></>
              )}
            </>
          )}
          {(showAssignmentCheck || shift?.shiftType === SCHEDULE_DUTIES.PATROL) && (
            <Box className={classes.franchiseNameIcon}>
              <ChevronRight />
            </Box>
          )}
        </Box>
      ),
      startsAt: timeFormat12h(shift?.startsAt, true),
      endsAt: timeFormat12h(shift?.endsAt, true),
      serviceTime: `${shift?.serviceTime}m`,
      visitType: VisitTypeValues[shift?.visitType],
      days: <Box>{days}</Box>,
      actions: (
        <>
          {shift?.shiftType === SCHEDULE_DUTIES.PATROL && isJobEnded ? (
            <></>
          ) : (
            <PopoverButton
              className={classes.questionBankActions}
              variant="icon"
              Icon={MoreVert}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'center',
              }}
            >
              {shift?.shiftType === SCHEDULE_DUTIES.PATROL ? (
                <>
                  {shift?.visitType === visitTypes.RANDOM && (
                    <Box className={classes.questionBankActionsMenu}>
                      <Box
                        onClick={() => {
                          handleShowEditHit(shift);
                        }}
                        className={classes.templateActionsRegular}
                      >
                        <Typography
                          className={classes.templateActionsTextRegular}
                          variant="subtitle2"
                        >
                          <EditIcon /> {t('obx.sites.jobs.editHit')}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                  <Box className={classes.questionBankActionsMenu}>
                    <Box
                      onClick={() => handleShowAssignToRunsheet(shift)}
                      className={classes.templateActionsRegular}
                    >
                      <Typography
                        className={classes.templateActionsTextRegular}
                        variant="subtitle2"
                      >
                        <AssignIcon /> {t('obx.sites.jobs.assignToRunsheet')}
                      </Typography>
                    </Box>
                  </Box>
                  <Box className={classes.questionBankActionsMenu}>
                    <Box
                      onClick={() => handleShowDeleteShiftModal(shift)}
                      className={classes.questionBankActionsDelete}
                    >
                      <Typography
                        className={classes.questionBankActionsTextDelete}
                        variant="subtitle2"
                      >
                        <CancelIcon /> {t('obx.sites.jobs.cancelHit')}
                      </Typography>
                    </Box>
                  </Box>
                </>
              ) : (
                <Box className={classes.questionBankActionsMenu}>
                  <Box
                    onClick={() => handleShowSplitDrawer(shift?.id, job)}
                    className={classes.templateActionsRegular}
                  >
                    <CallSplitIcon className={classes.templateActionsIconRegular} />
                    <Typography className={classes.templateActionsTextRegular} variant="subtitle2">
                      {t('obx.sites.jobs.splitBtn')}
                    </Typography>
                  </Box>
                </Box>
              )}

              {/* {rolesEnum.franchiseOwner === currentUserRole && !shift?.splitShifts?.length && (
            <Box className={classes.questionBankActionsMenu}>
              <Box
                onClick={() => handleShowDeleteShiftModal(shift)}
                className={classes.questionBankActionsDelete}
              >
                <TrashIcon className={classes.questionBankActionsIconDelete} />
                <Typography className={classes.questionBankActionsTextDelete} variant="subtitle2">
                  {t('commonText.delete')}
                </Typography>
              </Box>
            </Box>
          )} */}
            </PopoverButton>
          )}
        </>
      ),
    };
  };

  const tableBody = (data, columns, job) => {
    const shiftsList = data;

    return loading ? (
      <TableSkeleton columns={columns} />
    ) : (
      <>
        <NoRecordFound data={shiftsList} noOfColumns={columns.length} />
        {shiftsList?.map((shift) => (
          <Fragment key={shift?.id}>
            <TableRow>
              {columns?.map((column) => (
                <Fragment key={column?.id}>
                  <TableCell className={column.className} align={column.align}>
                    {shiftTableRenderer({
                      showSubDetailHandler,
                      shift,
                      job,
                    })[column.key] || <>{shift[column.key] || t('commonText.nA')}</>}
                  </TableCell>
                </Fragment>
              ))}
            </TableRow>

            <TableBody
              sx={{
                display: 'contents',
              }}
            >
              {showSubDetail[shift?.id] &&
                shift?.splitShifts?.map((splittedShift) => {
                  return (
                    <TableRow key={splittedShift?.id} classes={{ root: classes.tableRowNew }}>
                      <TableCell></TableCell>
                      <TableCell
                        className={hoverIconClass}
                        onClick={() =>
                          handleShowAssignmentDrawer(
                            splittedShift?.id,
                            splittedShift?.startsAt,
                            splittedShift?.endsAt,
                            job,
                          )
                        }
                      >
                        <Box className={classes.franchiseName}>
                          <Box>{splittedShift?.name || t('commonText.nA')}</Box>

                          <Box className={classes.franchiseNameIcon}>
                            <ChevronRight />
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>{timeFormat12h(splittedShift?.startsAt, true)}</TableCell>
                      <TableCell>{timeFormat12h(splittedShift?.endsAt, true)}</TableCell>
                      <TableCell>
                        {getDaysStringFromNumbers(
                          sortDays(
                            getDaysWrtTimezoneAsPerStandardTime(
                              splittedShift?.startsAt,
                              splittedShift?.shiftDays,
                            ),
                          ),
                        )}
                      </TableCell>
                      <TableCell>
                        {/* {rolesEnum.franchiseOwner === currentUserRole && (
                          <PopoverButton
                            className={classes.questionBankActions}
                            variant="icon"
                            Icon={MoreVert}
                            anchorOrigin={{
                              vertical: 'bottom',
                              horizontal: 'center',
                            }}
                          >
                            <Box className={classes.questionBankActionsMenu}>
                              <Box
                                onClick={() => {
                                  setDeleteShiftErrorMessage('');
                                  setDeletableShiftDetail(splittedShift);
                                }}
                                className={classes.questionBankActionsDelete}
                              >
                                <TrashIcon className={classes.questionBankActionsIconDelete} />
                                <Typography
                                  className={classes.questionBankActionsTextDelete}
                                  variant="subtitle2"
                                >
                                  {t('commonText.delete')}
                                </Typography>
                              </Box>
                            </Box>
                          </PopoverButton>
                        )} */}
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Fragment>
        ))}
      </>
    );
  };

  const tableSkeletonBody = (_data = {}, columns) => {
    return <TableSkeleton numberOfRows={2} columns={columns} />;
  };

  const showSideDrawer = (value) => (data) => {
    setShowDrawer({ open: value, data: value ? data : null });
  };
  const changeOnlyDrawerType = (value) => () => {
    setShowDrawer((prev) => ({ open: value, data: value ? prev?.data : null }));
  };

  const getJobsListBySiteId = async (queryParams) => {
    setLoading(true);

    try {
      const response = await fetchJobsAndShiftsListBySiteId({
        siteId: param?.id,
        page: queryParams?.page,
        perPage: queryParams?.perPage,
        contractId: queryParams?.contractId,
      });
      setLoading(false);

      const jobs = response?.data?.jobs?.map((job) => {
        const { lastShiftStartTime, lastShiftEndTime } = getLastShiftStartEndTimeOfJob(
          job?.startsAt,
          job?.endsAt,
        );

        const allShiftDays = job?.shifts?.flatMap((shift) =>
          getDaysWrtTimezoneAsPerStandardTime(shift?.startsAt, shift?.shiftDays),
        );
        const standardJobDays = [...new Set(allShiftDays)];

        return {
          ...job,
          standardJobDays,
          lastShiftStartTime,
          lastShiftEndTime,
          shifts: sortSplittedShifts(job?.shifts)?.map((shift) => ({
            ...shift,
            splitShifts: sortSplittedShifts(shift?.splitShifts || []),
          })),
        };
      });

      setJobsList(jobs);
      setQueryParams((prev) => ({
        ...prev,
        totalRecords: response?.data?.pagination?.totalCount,
      }));
    } catch (error) {
      setLoading(false);
      setJobsList([]);
    }
  };

  useEffect(() => {
    getJobsListBySiteId(queryParams);
  }, [param?.id, queryParams?.page, queryParams?.perPage, queryParams?.contractId]);

  const handleChangePage = (_, newPage) => {
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

  const handleClickCreateExtraJob = (e) => {
    e.stopPropagation();
    if (
      franchiseIdWithRoleAndSource.role === rolesEnum.homeOfficer &&
      franchiseIdWithRoleAndSource?.[franchiseIdUrlQueryParam]
    ) {
      const createExtraJob = HO_SITES_CREATE_EXTRA_DUTY;
      const queryParams = new URLSearchParams({
        siteId: `${param?.id}`,
        [franchiseIdUrlQueryParam]: franchiseIdWithRoleAndSource?.[franchiseIdUrlQueryParam],
        [timeZoneKeyUrlQueryParam]: franchiseTimeZoneFromUrl,
      }).toString();
      history.push(`${createExtraJob}?${queryParams}`);
    } else {
      history.push(OBX_SITES_CREATE_EXTRA_DUTY + `?siteId=${param?.id}`);
    }
  };

  const getContracts = async (id) => {
    try {
      const response = await getSitesContracts(id);
      setContracts(response?.data?.contracts || []);
    } catch (error) {
      setContracts([]);
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  useEffect(() => {
    if (!param?.id) return;
    getContracts(param?.id);
  }, [param?.id]);

  const handleSelectContract = (e) => {
    // if contract is selected, reset page and per page params

    let selectedValue = e.target?.value || {};

    const updatedQueryParams = {
      ...queryParams,
      page: paginationOptions.defaultPerPage,
      perPage: paginationOptions.perPageRows,
      contractId: selectedValue?.id,
    };

    setQueryParams((prev) => ({
      ...prev,
      ...updatedQueryParams,
    }));

    setSelectedContract(selectedValue);
  };

  /**
   * if site is nonFunctional disable the create extra job button
   * */
  // const disableIfSiteNonFunctional = () => {
  //   return (
  //     siteData.status === siteStatusEnum.requiresAttention ||
  //     siteData.status === siteStatusEnum.nonFunctional
  //   );
  // };
  const disableIfSiteNonFunctional = useMemo(() => {
    return (
      !isObjectEmpty(siteData) &&
      (siteData.status === siteStatusEnum.requiresAttention ||
        siteData.status === siteStatusEnum.nonFunctional)
    );
  }, [siteData]);

  const ContractOptions = [
    { label: t('obx.sites.jobs.contractsFilterTitle'), value: '' },
    ...transformArrayForOptions(contracts, 'title', 'id'),
  ];

  const deleteShiftContent =
    deletableShiftDetail?.shiftType === SCHEDULE_DUTIES.PATROL
      ? {
          title: t('obx.sites.jobs.cancelHitModal.title'),
          description: t('obx.sites.jobs.cancelHitModal.description'),
          cancel: t('obx.sites.jobs.cancelHitModal.cancelBtn'),
          delete: t('obx.sites.jobs.cancelHitModal.deleteBtn'),
        }
      : {
          title: t('obx.sites.jobs.deleteShiftModal.title'),
          description: t('obx.sites.jobs.deleteShiftModal.description'),
          cancel: t('obx.sites.jobs.deleteShiftModal.cancelBtn'),
          delete: t('obx.sites.jobs.deleteShiftModal.deleteBtn'),
        };

  const deletedDates = deletableShiftDetail?.cancelHits?.map((cancelledHitDate) =>
    dayjs(dayjsWithStandardOffset(cancelledHitDate?.startsAt).format('YYYY-MM-DD')),
  );
  const shouldDisableDate = (date) => {
    const calendarDate = dayjs(dayjs(date).format('YYYY-MM-DD'));
    return deletedDates?.some((deletedDate) => {
      return calendarDate.isSame(deletedDate);
    });
  };

  const deleteShiftModalBody = (
    <Box className={classes.deletejobShiftModal}>
      <Box className={classes.modalBody}>
        <Box className={classes.deletIcon}>
          {deletableShiftDetail?.shiftType === SCHEDULE_DUTIES.PATROL ? (
            <AlertYellowIcon />
          ) : (
            <DeleteSweetAlertIcon />
          )}
        </Box>
        <Typography variant="subtitle2" className={classes.modalTitle}>
          {deleteShiftContent.title}
        </Typography>
        <Typography variant="body2" className={classes.modalDescription}>
          {deleteShiftContent.description}
        </Typography>
        <Box className={classes.range}>
          <InputLabel>{t('obx.sites.jobs.deleteShiftModal.dateRangeSelectText')}</InputLabel>
          <DateRangePickerWithButtons
            selectedDates={selectedShiftDates}
            setDates={selectDatesHandler}
            shouldDisableDate={shouldDisableDate}
            // minDate={dayjs(deletableShiftDetail?.startsAt)}
            // maxDate={dayjs(deletableShiftDetail?.endsAt)}
          />
          <p className="errorMessage"> {deleteShiftErrorMessage}</p>
        </Box>
      </Box>
      <Box className={classes.modalFooter}>
        <Button onClick={handleCancelDeleteShift} variant="secondaryGrey">
          {deleteShiftContent.cancel}
        </Button>
        <Button
          onClick={() => handleDeleteShift(deletableShiftDetail)}
          variant="destructive"
          disabled={deletableShiftActionBtn}
        >
          {deleteShiftContent.delete}
        </Button>
      </Box>
    </Box>
  );

  const handleClickAddTemplate = () => {
    handleCloseAssignToRunsheet();
    handleShowTourAssignmentDrawer(showAssignToRunsheet?.id);
  };

  return (
    <Box className={classes.contractsWrapper}>
      <Box className={classes.jobsHeader}>
        <CustomDropDown
          label={t('obx.sites.jobs.contractsFilterTitle')}
          name="contracts"
          handleChange={handleSelectContract}
          options={ContractOptions}
          selectedValues={selectedContract}
          searchable={true}
        />

        <Tooltip
          placement="top"
          arrow
          title={
            disableIfSiteNonFunctional && t('obx.sites.cannotCreateExtraJobForNonFunctionalSite')
          }
        >
          <Box>
            <Button
              onClick={handleClickCreateExtraJob}
              variant="primary"
              startIcon={<AddIcon />}
              disabled={disableIfSiteNonFunctional}
            >
              {t('obx.sites.jobs.accordionHeader.createExtraJob')}
            </Button>
          </Box>
        </Tooltip>
      </Box>
      {loading ? (
        <Box className={classes.jobsSkeletonWrapper}>
          <AccordionSkeleton accordionSkeletonHeader={false} noOfRows={3} pills={false}>
            <TableComponent
              data={{}}
              columns={columns}
              tableBody={tableSkeletonBody}
              pagination={false}
            />
          </AccordionSkeleton>
        </Box>
      ) : (
        <>
          {!loading && (
            <NoRecordFound data={jobsList} noOfColumns={columns.length} type={'listing'} />
          )}
          {jobsList.length > 0 && (
            <Box className={classes.collapseContainer}>
              {jobsList?.map((job, index) => {
                const updatedColumns = columns?.filter((column) => {
                  if (job?.dutyType === SCHEDULE_DUTIES.PATROL) {
                    return true;
                  }
                  return !column?.patrolOnly;
                });

                return (
                  <TableAccordion
                    key={index}
                    accordionNo={index}
                    header={
                      <AccordionHeader
                        job={job}
                        index={index}
                        setConfirmationModal={setConfirmationModal}
                        setSelectedJob={() => job && setSelectedJob(job)}
                        setShowEditJobTimeModal={setShowEditJobTimeModal}
                      />
                    }
                  >
                    <TableComponent
                      data={job?.shifts}
                      columns={updatedColumns}
                      tableBody={(data, columns) => tableBody(data, columns, job)}
                      pagination={false}
                      classNameTable={classes.accordianTableJobs}
                    />
                  </TableAccordion>
                );
              })}
            </Box>
          )}
        </>
      )}
      {/* Delete Shift in a range Confirmation Modal */}
      <ModalComponent
        open={!!deletableShiftDetail}
        handleClose={handleCancelDeleteShift}
        body={deleteShiftModalBody}
      />

      {/* Edit Hit */}
      <ModalComponent
        open={!!editableHitDetail}
        handleClose={handleCancelDeleteShift}
        body={
          <EditHitModalBody
            {...{
              editableHitDetail,
              setEditableHitDetail,
              getJobsListBySiteId,
              handleCancelEditHit,
            }}
          />
        }
      />

      {/* Assign To Runsheet */}
      <ModalComponent
        open={!!showAssignToRunsheet}
        handleClose={handleCloseAssignToRunsheet}
        body={
          <>
            {showAssignToRunsheet?.tour ? (
              <AssignToRunsheetModalBody
                {...{
                  showAssignToRunsheet,
                  setShowAssignToRunsheet,
                  getJobsListBySiteId,
                  handleCloseAssignToRunsheet,
                }}
              />
            ) : (
              <NoTourTemplateModalBody
                handleSubmit={handleClickAddTemplate}
                handleCloseModal={handleCloseAssignToRunsheet}
              />
            )}
          </>
        }
      />

      {/* Edit Shift Modal */}
      {showEditJobTimeModal && (
        <EditShiftModal
          open={showEditJobTimeModal}
          onClose={() => {
            setSelectedJob(null);
            setShowEditJobTimeModal(false);
          }}
          refetchJobs={getJobsListBySiteId}
          selectedJob={selectedJob}
        />
      )}

      {/* Delete Extra Job Confirmation Modal */}
      <SweetAlertModal
        type="warning"
        title={t('obx.sites.jobs.deleteExtraJobModal.title')}
        text={t('obx.sites.jobs.deleteExtraJobModal.description')}
        cancelButtonText={t('links.cancel')}
        confirmButtonText={t('obx.sites.jobs.deleteExtraJobModal.deleteBtn')}
        show={!!confirmationModal}
        handleConfirmButton={() => handleDeleteJob(confirmationModal)}
        handleCancelButton={() => setConfirmationModal(null)}
        icon={<DeleteIcon />}
      />
      {showDrawer?.open === DRAWER_TYPE.SPLIT && (
        <SplitJobSideDrawer
          drawerData={{
            type: showDrawer?.open,
            shiftId: showDrawer?.data?.id,
            siteId: param?.id,
          }}
          closeSideDrawer={showSideDrawer('')}
          callbackUponSplitting={() => getJobsListBySiteId(queryParams)}
        />
      )}
      {[
        DRAWER_TYPE.ASSIGN,
        DRAWER_TYPE.TOUR_TEMPLATE,
        DRAWER_TYPE.REASSIGNMENT,
        DRAWER_TYPE.EDIT_REASSIGNMENT,
      ].includes(showDrawer?.open) && (
        <AssignmentSideDrawer
          drawerData={{
            type: showDrawer?.open,
            shiftId: showDrawer?.data?.id,
            siteId: param?.id,
            shiftDate: showDrawer?.data?.shiftDate,
          }}
          closeSideDrawer={showSideDrawer('')}
          changeOnlyDrawerType={changeOnlyDrawerType}
          callbackUponAssignment={() => getJobsListBySiteId(queryParams)}
        />
      )}
      {[DRAWER_TYPE.TOUR_ASSIGNMENT, DRAWER_TYPE.TOUR_TEMPLATE_PATROL].includes(
        showDrawer?.open,
      ) && (
        <PatrolAssignTour
          drawerData={{
            type: showDrawer?.open,
            hitId: showDrawer?.data?.id,
            siteId: param?.id,
          }}
          closeSideDrawer={showSideDrawer('')}
          changeOnlyDrawerType={changeOnlyDrawerType}
          callbackUponAssignment={() => getJobsListBySiteId(queryParams)}
        />
      )}
      <Box className={classes.accordianTablePagination}>
        <TablePaginationComp
          page={queryParams?.page - 1}
          rowsPerPage={queryParams?.perPage}
          totalRecords={queryParams?.totalRecords}
          handleChangePage={handleChangePage}
          rowsPerPageOptions={paginationOptions.perPageOptions}
          onChangeRowsPerPage={handleChangeRowsPerPage}
        />
      </Box>
    </Box>
  );
};

Jobs.propTypes = {
  id: PropTypes.number,
  siteData: PropTypes.object,
};

export default Jobs;

const EditHitModalBody = ({
  editableHitDetail,
  setEditableHitDetail,
  getJobsListBySiteId,
  handleCancelEditHit,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    startTime: dayjsWithStandardOffset(editableHitDetail?.startsAt),
    endTime: dayjsWithStandardOffset(editableHitDetail?.endsAt),
  });
  const [loading, setLoading] = useState(false);

  const handleChangeStartEndTime = (value, key) => {
    const updatedValue = value?.isValid() ? value.set('seconds', 0).set('millisecond', 0) : null;

    setFormData((prev) => ({
      ...prev,
      [key]: updatedValue,
    }));
  };

  const handleSaveEditHit = async () => {
    try {
      if (!formData?.startTime?.isValid() || !formData?.endTime?.isValid()) {
        return;
      }

      setLoading(true);

      const payload = {
        startsAt: formData?.startTime?.toISOString(),
        endsAt: formData?.endTime?.toISOString(),
      };

      const res = await editPatrolHit({ hitId: editableHitDetail?.id, payload });

      setEditableHitDetail(null); // close modal
      getJobsListBySiteId(); // get updated jobs list

      toaster.success({
        text: res?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
      setLoading(false);
    } catch (error) {
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
      setLoading(false);
    }
  };

  // set initial start and end time values
  useEffect(() => {
    setFormData({
      startTime: dayjsWithStandardOffset(editableHitDetail?.startsAt),
      endTime: dayjsWithStandardOffset(editableHitDetail?.endsAt),
    });
  }, []);

  return (
    <Box className={classes.deletejobShiftModal}>
      <Box className={classes.modalBody}>
        <Typography variant="h3" sx={{ mb: 2 }}>
          {t('obx.jobs.editVisit')}
        </Typography>
        <Box className={classes.deleteShiftInputWrapper}>
          <Box>
            <InputLabel>{t('obx.jobs.startTime')}</InputLabel>
            <ResponsiveTimePickers
              name="startTime"
              value={formData.startTime ? formData.startTime : null}
              onChange={(value) => handleChangeStartEndTime(value, 'startTime')}
              placeholder={t('obx.jobs.startTime')}
            />
          </Box>
          <Box>
            <InputLabel>{t('obx.jobs.endTime')}</InputLabel>
            <ResponsiveTimePickers
              name="endTime"
              value={formData.endTime ? formData.endTime : null}
              onChange={(value) => handleChangeStartEndTime(value, 'endTime')}
              placeholder={t('obx.jobs.endTime')}
            />
          </Box>
        </Box>
      </Box>

      <Box className={classes.modalFooter}>
        <Button disabled={loading} onClick={handleCancelEditHit} variant="secondaryGrey">
          {t('obx.buttons.cancel')}
        </Button>
        <Button disabled={loading} onClick={() => handleSaveEditHit()} variant="primary">
          {t('obx.buttons.save')}
        </Button>
      </Box>
    </Box>
  );
};

EditHitModalBody.propTypes = {
  editableHitDetail: PropTypes.object,
  setEditableHitDetail: PropTypes.func,
  getJobsListBySiteId: PropTypes.func,
  handleCancelEditHit: PropTypes.func,
};

const DaysTitle = {
  0: 'Sunday',
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday',
};
const libraries = ['places', 'drawing', 'geometry'];

const AssignToRunsheetModalBody = ({
  showAssignToRunsheet,
  setShowAssignToRunsheet,
  getJobsListBySiteId,
  handleCloseAssignToRunsheet,
}) => {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries,
  });
  const param = useParams();
  const classes = useStyles();
  const { t } = useTranslation();
  const [accordionOpen, setAccordionOpen] = useState({});
  const [runsheetsPerDay, setRunsheetsPerDay] = useState({});
  const [disableActionBtn, setDisableActionBtn] = useState(false);
  const [hitDetail, setHitDetail] = useState({});

  const RenderAccordionHeader = (title) => {
    return (
      <Box className={classes.accordionHeader}>
        <Box className={classes.accordionHeaderLeft}>
          <Typography variant="subtitle2" className={classes.accordionHeaderDay}>
            {title}
          </Typography>
        </Box>
      </Box>
    );
  };

  const getRunsheetsByHitAndDay = async (day) => {
    try {
      const isoDay = getDaysWrtTimezoneAsPerStandardTime(
        showAssignToRunsheet?.startsAt,
        [day],
        true,
      )[0];
      const res = await fetchRunsheetsByHitAndDay({ hitId: showAssignToRunsheet?.id, day: isoDay });
      setHitDetail(res?.data?.hitInfo || {});
      setRunsheetsPerDay((prev) => ({
        ...prev,
        [day]: res?.data?.runsheets || [],
      }));
    } catch (error) {
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  const handleShowAccordion = (day) => {
    setAccordionOpen((prev) => ({
      ...prev,
      [day]: !prev?.[day],
    }));

    if (!runsheetsPerDay?.[day]?.length || runsheetsPerDay?.[day]?.length <= 0) {
      getRunsheetsByHitAndDay(day);
    }
  };

  const handleAssign = async () => {
    try {
      const selectedRunsheets = Object.values(runsheetsPerDay)
        ?.flat(1)
        ?.filter((runsheet) => runsheet?.selected);

      if (!selectedRunsheets?.length) {
        toaster.info({
          text: t('obx.sites.jobs.assignToRunsheetModal.noRunsheetSelected'),
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
        return;
      }

      setDisableActionBtn(true);

      // Start --> Creating path data
      const hitPayload = {
        endsAt: showAssignToRunsheet?.endsAt,
        hitId: showAssignToRunsheet?.id,
        name: showAssignToRunsheet?.name,
        startsAt: showAssignToRunsheet?.startsAt,
        tour: showAssignToRunsheet?.tour,
        position: hitDetail?.position,
        siteName: hitDetail?.siteName,
        day: hitDetail?.day,
        siteImage: hitDetail?.siteImage,
        start_location: hitDetail?.position,
      };

      const pathErrorDays = [];
      let runsheetsWithMapDataPromise = selectedRunsheets?.map(async (runSheet) => {
        const updatedPathData = [...(runSheet?.pathData || []), hitPayload];
        const waypoints = updatedPathData?.slice(1);
        // return waypoints;
        const result = await calculateAndDisplayRouteUtils(
          updatedPathData?.[0],
          waypoints,
          t,
        ).catch(() => {
          pathErrorDays.push(runSheet?.day);
        });

        let calculatedPathData = {
          // verfify this
          ...runSheet,
          pathData: result?.visitSetPolyLines,
          // pathData: result.mapPolyLineArray, // visitSet
          // startEndLocation: { position: result.mapPolyLineArray?.[0]?.[0] },
        };
        if (runSheet?.startEndLocation?.id) {
          calculatedPathData.pathData = updateLastItemWithUniqueId(
            calculatedPathData,
            runSheet?.startEndLocation?.id,
          );
        }

        return calculatedPathData;
      });

      const updatedSelectedRunsheets = await Promise.all(runsheetsWithMapDataPromise);

      if (pathErrorDays?.length > 0) {
        const daysString = pathErrorDays?.map((day) => DaysTitle[day]).join(', ');
        return throwAPIError(
          t('obx.sites.jobs.assignToRunsheetModal.pathCreationFailed', { days: daysString }),
        );
      }

      // End --> Creating path data

      const payload = updatedSelectedRunsheets?.map((selectedRunsheet) => ({
        patrolTemplateId: selectedRunsheet?.runsheetId,
        pathData: selectedRunsheet?.pathData,
        hits: [
          {
            day: showAssignToRunsheet?.day || selectedRunsheet?.day,
            hitId: showAssignToRunsheet?.id,
            siteId: Number(param?.id),
            startsAt: showAssignToRunsheet?.startsAt,
            endsAt: showAssignToRunsheet?.endsAt,
          },
        ],
      }));

      const res = await addHitToRunsheet({ payload: { data: payload } });

      setShowAssignToRunsheet(null); // close modal
      getJobsListBySiteId(); // get updated jobs list

      toaster.success({
        text: res?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
      setDisableActionBtn(false);
    } catch (error) {
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
      setDisableActionBtn(false);
    }
  };

  const unassignedDaysWRTStandardTime = getDaysWrtTimezoneAsPerStandardTime(
    showAssignToRunsheet?.startsAt,
    showAssignToRunsheet?.unassignedDays,
  );

  return (
    <Box className={classes.assignRunsheetModal}>
      <Box className={classNames(classes.modalBody, 'innerScrollBar')}>
        <AssignRunsheetIcon />
        <Typography variant="h3">{t('obx.sites.jobs.assignToRunsheetModal.title')}</Typography>
        <Typography variant="info">
          {t('obx.sites.jobs.assignToRunsheetModal.description')}
        </Typography>
        <Box className={classes.runsheetsAccordion}>
          {unassignedDaysWRTStandardTime?.map((day, index) => {
            const runsheets = runsheetsPerDay?.[day] || [];

            return (
              <RunsheetsAccordion
                key={day}
                accordionNo={index}
                // className={classes.runsheetsAccordionCurrent}
                header={RenderAccordionHeader(DaysTitle[day])}
                showAccordion={!!accordionOpen?.[day]}
                setShowAccordion={() => handleShowAccordion(day)}
              >
                {runsheets?.map((runsheet) => (
                  <AccordionListItem
                    key={runsheet?.runsheetId}
                    {...{ runsheet, day, setRunsheetsPerDay }}
                  />
                ))}
              </RunsheetsAccordion>
            );
          })}
        </Box>
      </Box>
      <Box className={classes.modalFooter}>
        <Button onClick={handleCloseAssignToRunsheet} variant="secondaryGrey">
          {t('obx.sites.jobs.assignToRunsheetModal.cancelBtn')}
        </Button>
        <Button disabled={disableActionBtn} onClick={handleAssign} variant="primary">
          {t('obx.sites.jobs.assignToRunsheetModal.saveBtn')}
        </Button>
      </Box>
      {/* hide it from dom */}
      {isLoaded && <GoogleMap />}
    </Box>
  );
};

AssignToRunsheetModalBody.propTypes = {
  showAssignToRunsheet: PropTypes.object,
  setShowAssignToRunsheet: PropTypes.func,
  getJobsListBySiteId: PropTypes.func,
  handleCloseAssignToRunsheet: PropTypes.func,
};

const AccordionListItem = ({ runsheet, day, setRunsheetsPerDay }) => {
  const classes = useStyles();
  const { t } = useTranslation();

  const handleSelectRunsheet = (_e) => {
    setRunsheetsPerDay((prev) => ({
      ...prev,
      [day]: prev[day]?.map((data) => {
        if (data?.runsheetId == runsheet?.runsheetId) {
          return {
            ...data,
            day,
            selected: !data?.selected,
          };
        }
        return {
          ...data,
          selected: false,
        };
      }),
    }));
  };

  return (
    // accordian body?
    <Box className={classNames(classes.accordionListItem, classes.accordionListItemUnassigned)}>
      <Box className={classes.accordionListTitle}>
        <Typography variant="h5" className={classes.accordionListTitleText}>
          {runsheet?.name}
        </Typography>
      </Box>
      <Box>
        <FormControlLabel
          checked={!!runsheet?.selected}
          value={runsheet?.runsheetId}
          control={<Radio onClick={handleSelectRunsheet} />}
          label={t('obx.sites.jobs.assignToRunsheetModal.selectLabel')}
        />
      </Box>
    </Box>
  );
};
AccordionListItem.propTypes = {
  runsheet: PropTypes.object,
  day: PropTypes.number,
  setRunsheetsPerDay: PropTypes.func,
};
