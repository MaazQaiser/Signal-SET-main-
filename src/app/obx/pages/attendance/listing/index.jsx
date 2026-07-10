import {
  Box,
  Button,
  Checkbox,
  Chip,
  TableCell,
  TableRow,
  TableSortLabel,
  Tooltip,
  Typography,
} from '@mui/material';
import { ReactComponent as RejectIcon } from 'assets/svg/close.svg';
import { ReactComponent as DeleteSweetAlertIcon } from 'assets/svg/delete-modal.svg';
import { ReactComponent as ApproveIcon } from 'assets/svg/tick-white.svg';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { getUsersWithDesiredType } from 'services/user.services';
import AvatarGroupImage from 'src/app/components/common/avatarGroupImage';
import CustomDropDown from 'src/app/components/common/customDropDown';
import DateRangePicker from 'src/app/components/common/RangeDatepicker';
import TableSkeleton from 'src/app/components/common/skeletonLoader/tableSkeleton';
import SweetAlertModal from 'src/app/components/common/sweetAlertModal';
import TableComponent from 'src/app/components/common/table';
import NoRecordFound from 'src/app/components/common/table/noRecordFound';
import TableImage from 'src/app/components/common/tableImage';
import LeaveRequestModal from 'src/app/obx/pages/attendance/components/LeaveRequestModal';
import RejectLeaveModal from 'src/app/obx/pages/attendance/components/RejectLeaveModal';
import { ReactComponent as CheckIcon } from 'src/assets/svg/check.svg';
import { ReactComponent as CheckBoxRegularIcon } from 'src/assets/svg/checkbox.svg';
import { ReactComponent as CheckBoxCheckedIcon } from 'src/assets/svg/checkbox-checked.svg';
import { ReactComponent as CheckBoxCheckedDisabledIcon } from 'src/assets/svg/checkbox-checked-disabled.svg';
import { ReactComponent as CheckboxDisabledIcon } from 'src/assets/svg/checkbox-disabled.svg';
import { ReactComponent as DeleteIcon } from 'src/assets/svg/trash-2.svg';
import { useApiControllers } from 'src/helper/axios';
import { formatDate, listStatusHandler } from 'src/helper/utilityFunctions';
import {
  cancelLeaveRequest,
  changeAttendanceRequest,
  getAttendances,
  patchApplyLeave,
} from 'src/services/attendance.services';
import transformArrayForOptions from 'src/utils/array/transformArrayForOptions';
import { paginationOptions, rolesEnum, toastSettings } from 'src/utils/constants';
import { capitalizeFirstLetter } from 'src/utils/string/common';

import {
  appendDefaultStartAndEndTimeWithDates,
  dayjsWithStandardOffset,
} from '../../schedules/helper';
import { useStyles } from './listingStyles';

const i18ColumnName = (t) => {
  return [
    { id: 'select', label: '', sortable: false, hasPermission: [rolesEnum.franchiseOwner] },
    {
      id: 'officer',
      label: `${t('obx.attendance.table.listing.columns.name')}`,
      sortable: false,
      hasImage: true,
      hasPermission: [rolesEnum.franchiseOwner, rolesEnum.supervisor],
    },
    {
      id: 'supervisors',
      label: `${t('obx.attendance.table.listing.columns.supervisors')}`,
      sortable: false,
      hasPermission: [rolesEnum.franchiseOwner],
    },
    {
      id: 'startTime',
      label: `${t('obx.attendance.table.listing.columns.startDateAndTime')}`,
      sortable: false,
      hasPermission: [rolesEnum.franchiseOwner, rolesEnum.supervisor],
    },
    {
      id: 'endTime',
      label: `${t('obx.attendance.table.listing.columns.endDateAndTime')}`,
      sortable: false,
      hasPermission: [rolesEnum.franchiseOwner, rolesEnum.supervisor],
    },
    {
      id: 'leaveStatus',
      label: `${t('obx.attendance.table.listing.columns.leaveStatus')}`,
      sortable: false,
      hasPermission: [rolesEnum.franchiseOwner, rolesEnum.supervisor],
    },
    {
      id: 'reason',
      label: `${t('obx.attendance.table.listing.columns.reason')}`,
      sortable: false,
      hasPermission: [rolesEnum.franchiseOwner],
    },
    {
      id: 'reason',
      label: `${t('obx.attendance.table.listing.columns.leaveReason')}`,
      sortable: false,
      hasPermission: [rolesEnum.supervisor],
    },
    {
      id: 'action',
      label: '',
      sortable: false,
      hasPermission: [rolesEnum.supervisor],
    },
  ];
};

const order = {
  orderBy: 'id',
  orderType: 'asc',
};

const timeKeys = ['checkinTime', 'checkoutTime', 'startTime', 'endTime'];

const changeRequestStatusFormData = {
  attendanceIds: [],
  status: '',
  supervisorComments: '',
};
const requestStatuses = {
  approve: 'approved',
  reject: 'rejected',
};

const columnsEnums = {
  officer: 'officer',
  userType: 'userType',
  startTime: 'startTime',
  endTime: 'endTime',
  reason: 'reason',
  leaveStatus: 'leaveStatus',
  select: 'select',
  action: 'action',
  leaveApplied: 'pending',
  supervisor: 'supervisors',
  leaveRejected: 'rejected',
};

const i8StatusDropDownOptions = (t) => {
  return [
    {
      label: `${t('obx.attendance.dropDownOptionsLabels.allStatuses')}`,
      value: 'all',
    },
    {
      label: `${t('obx.attendance.dropDownOptionsLabels.pending')}`,
      value: 'leaveApplied',
    },
    {
      label: `${t('obx.attendance.dropDownOptionsLabels.approved')}`,
      value: 'leaveApproved',
    },
    {
      label: `${t('obx.attendance.dropDownOptionsLabels.rejected')}`,
      value: 'leaveRejected',
    },
  ];
};

const i8UserTypeOptions = (t) => {
  return [
    {
      label: `${t('obx.attendance.dropDownOptionsLabels.allUsers')}`,
      value: 'supervisor,officer',
    },
    {
      label: `${t('obx.attendance.dropDownOptionsLabels.officers')}`,
      value: 'officer',
    },
    {
      label: `${t('obx.attendance.dropDownOptionsLabels.supervisor')}`,
      value: 'supervisor',
    },
  ];
};

const params = {
  page: paginationOptions.defaultPerPage,
  perPage: paginationOptions.perPageRows,
  search: '',
  sortBy: '',
  orderBy: '',
  'leave.status': {
    label: 'Pending',
    value: 'leaveApplied',
  },
  officers: [],
  supervisor: [],
  selectedDates: [],
};

const AttendanceListing = () => {
  const { t } = useTranslation();
  const classes = useStyles();
  const NA = t('commonText.nA');

  const userRole = useSelector((state) => state.auth?.userRole?.slug);
  const userId = useSelector((state) => state.user?.info?.id);

  const { getNewApiController } = useApiControllers();

  const userTypeOptions = i8UserTypeOptions(t);
  const statusDropDownOptions = i8StatusDropDownOptions(t);

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalRows, setTotalRows] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAcceptModelModal, setShowAcceptModelModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [applyLeaveModal, setApplyLeaveModal] = useState(false);
  const [selectAll, setSelectAll] = useState(false);
  const [rejectLeaveLoader, setRejectLeaveLoader] = useState(false);
  const [applyLeaveLoader, setApplyLeaveLoader] = useState(false);

  const [deleteLeaveRequestId, setDeleteLeaveRequestId] = useState(null);

  const [dropDownOptions, setDropDownOptions] = useState({
    supervisors: [],
    users: [],
    status: statusDropDownOptions,
    userTypes: userTypeOptions,
  });

  const [userTypeSelectedOptions] = useState({});

  const [requestStatusFormData, setRequestStatusFormData] = useState(changeRequestStatusFormData);
  const [queryParams, setQueryParams] = useState(params);

  const columns = i18ColumnName(t).filter((a) => a?.hasPermission?.includes(userRole));

  useEffect(() => {
    fetchAttendances(queryParams);
  }, [queryParams]);

  useEffect(() => {
    if (userRole === rolesEnum.franchiseOwner) {
      getSuperVisors();
    }
  }, []);

  useEffect(() => {
    getUsers();
  }, []);

  const fetchAttendances = async (params) => {
    const apiController = getNewApiController();

    try {
      setLoading(true);
      let officerId = [];

      let selectedOfficers = params.officers?.map((a) => a?.value);

      if (selectedOfficers.length) {
        officerId = [...officerId, ...selectedOfficers];
      }

      let supervisorIds = [];

      let selectedSupervisors = params.supervisor?.map((a) => a?.value);

      if (selectedSupervisors.length) {
        supervisorIds = [...supervisorIds, ...selectedSupervisors];
      }

      const convertedDates = params.selectedDates.length
        ? appendDefaultStartAndEndTimeWithDates(params?.selectedDates)
        : [];

      let queryParams = {
        ...params,
        windowStart: params?.selectedDates?.[0] ? convertedDates?.[0] : '',
        windowEnd: params?.selectedDates?.[1] ? convertedDates?.[1] : '',
        officerId: officerId.length > 0 ? officerId : 'all',
        supervisorId: supervisorIds.length > 0 ? supervisorIds : '',
        'leave.status':
          params['leave.status']?.value === 'all' ? '' : params['leave.status']?.value,
      };

      delete queryParams.selectedDates;
      delete queryParams.officers;
      delete queryParams.supervisor;

      const response = await getAttendances(queryParams, { signal: apiController.signal });
      if (response && response?.statusCode === 200) {
        let leaveData = [];
        response?.data?.data?.map((a) => {
          leaveData = [...leaveData, { ...a }];
        });

        setData(leaveData);

        const total = response?.data?.pagination?.totalCount;
        setTotalRows(total);
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

  const changeSelectedRequestStatus = async (reason) => {
    try {
      setRejectLeaveLoader(true);

      const finalPayload = {
        ...requestStatusFormData,
      };

      if (requestStatusFormData.status === requestStatuses.reject) {
        finalPayload.FOComments = reason || '';
      }

      const response = await changeAttendanceRequest(finalPayload);
      if (response?.statusCode === 200) {
        // setData((prev) => {
        //   return prev.filter((o) => o?.id !== requestStatusFormData);
        // });
        toast.success(response?.message, {
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
        fetchAttendances(queryParams);
        setSelectAll(false);
        setShowDeleteModal(false);
        setShowAcceptModelModal(false);
        setRejectLeaveLoader(false);
        setShowRejectModal(false);
        setRequestStatusFormData((prev) => ({
          ...prev,
          attendanceIds: [],
        }));
      }
    } catch (error) {
      setSelectAll(false);
      setShowDeleteModal(false);
      setRejectLeaveLoader(false);
      setShowAcceptModelModal(false);
      setShowRejectModal(false);
      toast.error(error?.message, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  const cancelSelectedLeave = async () => {
    try {
      const finalPayload = {
        attendanceIds: [deleteLeaveRequestId],
      };

      const response = await cancelLeaveRequest(finalPayload);
      if (response?.statusCode === 200) {
        toast.success(response?.message, {
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });

        setShowDeleteModal(false);

        fetchAttendances(queryParams);

        setDeleteLeaveRequestId(null);
      }
    } catch (error) {
      toast.error(error?.message, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  const applyLeave = async (formData) => {
    try {
      const payload = {
        reason: formData.leaveReason,
        startTime: formData.startDateTime,
        endTime: formData.endDateTime,
      };
      setApplyLeaveLoader(true);
      const response = await patchApplyLeave(payload);
      if (response?.statusCode === 200) {
        fetchAttendances(queryParams);
        toast.success(response?.message, {
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
      }
      setApplyLeaveLoader(false);
      setApplyLeaveModal(false);
    } catch (error) {
      setApplyLeaveLoader(false);
      // setApplyLeaveModal(false);
      toast.error(error?.message, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  const getSuperVisors = async () => {
    try {
      const query = {
        userType: ['supervisor'],
      };
      const response = await getUsersWithDesiredType(query);
      if (response?.data?.statusCode === 200) {
        setDropDownOptions((prevState) => {
          return {
            ...prevState,
            supervisors: transformArrayForOptions(response?.data?.users, 'name', 'id').map((a) => {
              return {
                ...a,
                label: capitalizeFirstLetter(a?.label),
              };
            }),
          };
        });
      }
    } catch (e) {
      toast.error(e.message, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  const getUsers = async () => {
    try {
      const query = {
        userType:
          userRole === rolesEnum.supervisor
            ? [rolesEnum.officer]
            : userTypeSelectedOptions?.value
              ? userTypeSelectedOptions?.value?.split(',')
              : userTypeOptions[0]?.value?.split(','),
      };
      const response = await getUsersWithDesiredType(query);
      if (response?.data?.statusCode === 200) {
        setDropDownOptions((prevState) => {
          return {
            ...prevState,
            users: transformArrayForOptions(response?.data?.users, 'name', 'id').map((a) => {
              return {
                ...a,
                label: capitalizeFirstLetter(a?.label),
              };
            }),
          };
        });
      }
    } catch (e) {
      toast.error(e.message, {
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

    setRequestStatusFormData((prev) => {
      return {
        ...prev,
        attendanceIds: [],
      };
    });

    setSelectAll(false);
  };

  const handleChangeRowsPerPage = (event) => {
    setQueryParams((prev) => ({
      ...prev,
      page: paginationOptions.defaultPerPage,
      perPage: parseInt(event.target.value, 10),
    }));

    setRequestStatusFormData((prev) => {
      return {
        ...prev,
        attendanceIds: [],
      };
    });

    setSelectAll(false);
  };

  const handleSelectAllChange = (event) => {
    const isChecked = event.target.checked;
    setSelectAll(isChecked);

    if (isChecked) {
      setRequestStatusFormData((prev) => ({
        ...prev,
        attendanceIds: data
          ?.filter((a) => a?.leaveStatus === columnsEnums.leaveApplied)
          ?.map((row) => row.id),
      }));
      return;
    }

    setRequestStatusFormData((prev) => ({
      ...prev,
      attendanceIds: [],
    }));
  };

  const handleCheckboxChange = (event, id) => {
    if (event.target.checked) {
      setRequestStatusFormData((prev) => {
        const selectedIds = [...prev.attendanceIds, id];
        setSelectAll(data?.length === selectedIds?.length);

        return {
          ...prev,
          attendanceIds: selectedIds,
        };
      });

      return; // Return early
    }

    setRequestStatusFormData((prev) => ({
      ...prev,
      attendanceIds: prev.attendanceIds.filter((item) => item !== id),
    }));
    setSelectAll(false);
  };

  const renderTableCell = (row, column) => {
    if (column.id === columnsEnums.supervisor) {
      const transformedSupervisors = row?.supervisors?.map((supervisor) => ({
        ...supervisor,
        image: supervisor.imageUrl,
      }));

      return (
        <>
          {row?.supervisors.length ? (
            <Box className={classes.supervisorColumnWrapper}>
              <AvatarGroupImage data={transformedSupervisors} />
            </Box>
          ) : (
            NA
          )}
        </>
      );
    }

    if (column.id === columnsEnums.officer) {
      return (
        <>
          <Box className={classes.tableAvatar}>
            {row?.officer?.imageUrl && <TableImage imageUrl={row?.officer?.imageUrl} alt="Image" />}
            <Typography variant="subtitle2" className={classes.tableNameText}>
              {capitalizeFirstLetter(row?.officer?.name) || NA}
            </Typography>
          </Box>
        </>
      );
    }

    if (timeKeys.includes(column?.id)) {
      return (
        <>
          {row[column.id]
            ? formatDate(dayjsWithStandardOffset(row[column.id]), 'MM/DD/YYYY hh:mm A')
            : 'N/A'}
        </>
      );
    }

    if (column.id === columnsEnums.select) {
      return (
        <Checkbox
          icon={
            row?.leaveStatus !== columnsEnums.leaveApplied ? (
              <CheckboxDisabledIcon />
            ) : (
              <CheckBoxRegularIcon />
            )
          }
          checkedIcon={
            row?.leaveStatus !== columnsEnums.leaveApplied ? (
              <CheckBoxCheckedDisabledIcon />
            ) : (
              <CheckBoxCheckedIcon />
            )
          }
          disabled={row?.leaveStatus !== columnsEnums.leaveApplied}
          className={classes.checkBoxCustom}
          checked={requestStatusFormData.attendanceIds.includes(row.id)}
          onChange={(event) => handleCheckboxChange(event, row.id)}
        />
      );
    }

    if (column.id === columnsEnums.action && rolesEnum.supervisor === userRole) {
      if (row?.leaveStatus === columnsEnums.leaveApplied && row?.officer?.id == userId) {
        return (
          <DeleteIcon
            className={classes.attendanceListingDelete}
            role="button"
            onClick={() => {
              setShowDeleteModal(true);
              setDeleteLeaveRequestId(row.id);
            }}
          />
        );
      } else {
        return null;
      }
    }

    if (column.id === columnsEnums.leaveStatus && row.leaveStatus === columnsEnums.leaveRejected) {
      const status = listStatusHandler(row[column.id]);

      return (
        <Tooltip
          title={
            <>
              <strong>{t('obx.attendance.table.listing.columns.reason')}: </strong>
              {row.FOComments}
            </>
          }
          arrow
        >
          <Chip label={status?.title} size="small" color={status?.color} />
        </Tooltip>
      );
    }

    if (column.id === columnsEnums.leaveStatus) {
      const status = listStatusHandler(row[column.id]);
      return <Chip label={status?.title} size="small" color={status?.color} />;
    }

    if (column.id === columnsEnums?.reason) {
      if (row[column.id]?.length > 75) {
        return (
          <Tooltip
            title={
              <>
                <strong>{t('obx.attendance.table.listing.columns.reason')}: </strong>
                {row[column.id]}
              </>
            }
            arrow
          >
            {row[column.id].substring(0, 75) + '...'}
          </Tooltip>
        );
      }
      return <>{row[column.id]}</>;
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
      sortBy: sortBy,
      orderBy: orderBy,
    }));
  };

  const sortDirection = (column) => {
    return orderState.orderBy === column.id ? orderState.orderType : false;
  };

  const orderDirection = (column) => {
    return orderState.orderBy === column.id ? orderState.orderType : 'asc';
  };

  const tableHead = () => {
    const disabled = data.length < 1;

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
              ) : column.id === 'select' ? (
                <Checkbox
                  icon={disabled ? <CheckboxDisabledIcon /> : <CheckBoxRegularIcon />}
                  checkedIcon={disabled ? <CheckBoxCheckedDisabledIcon /> : <CheckBoxCheckedIcon />}
                  className={classes.checkBoxCustom}
                  onChange={handleSelectAllChange}
                  checked={selectAll}
                  disabled={disabled}
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

  const tableBody = (data, columns) => {
    return loading ? (
      <TableSkeleton columns={columns} />
    ) : (
      <>
        <NoRecordFound data={data} noOfColumns={columns?.length} t={t} />
        {data.map((row) => (
          <TableRow key={row.id}>
            {columns.map((column) => {
              return (
                <TableCell
                  key={column.id || column?.officer?.id}
                  // onClick={() => gotoDetailPage(column, row?.officer?.id)}
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
  const inputChangedHandler = (event) => {
    const { name, value } = event.target;

    updateFormHandler(name, value);
  };

  return (
    <>
      <Box className={classes.attendancesListing}>
        <Box className={classes.attendancesListingHeader}>
          <Box className={classes.reportsListingsHeaderLeft}>
            <CustomDropDown
              label={t('obx.attendance.dropDownOptionsLabels.allUsers')}
              name="officers"
              selectedValues={queryParams?.officers}
              options={dropDownOptions?.users}
              handleChange={inputChangedHandler}
              multiSelect
              checkmark
              clearAll
            />

            {rolesEnum.franchiseOwner === userRole && (
              <CustomDropDown
                label={t('obx.attendance.dropDownOptionsLabels.supervisor')}
                name="supervisor"
                selectedValues={queryParams?.supervisor}
                options={dropDownOptions?.supervisors}
                handleChange={inputChangedHandler}
                multiSelect
                checkmark
                clearAll
              />
            )}
            <CustomDropDown
              label={t('obx.attendance.dropDownOptionsLabels.statuses')}
              name="leave.status"
              selectedValues={queryParams['leave.status']}
              options={dropDownOptions?.status}
              handleChange={inputChangedHandler}
            />
          </Box>
          <Box className={classes.reportsListingsHeaderRight}>
            {rolesEnum.franchiseOwner === userRole && (
              <>
                <Button
                  variant="destructiveSecondary"
                  className={classes.rejectBtn}
                  disabled={requestStatusFormData.attendanceIds.length < 1}
                  startIcon={<RejectIcon />}
                  onClick={() => {
                    setShowRejectModal(true);
                    setRequestStatusFormData((prev) => ({
                      ...prev,
                      status: requestStatuses.reject,
                    }));
                  }}
                >
                  {t('obx.attendance.pendingAttendanceRequestModal.reject')}
                </Button>
                <Button
                  variant="primary"
                  startIcon={<ApproveIcon />}
                  disabled={requestStatusFormData.attendanceIds.length < 1}
                  onClick={() => {
                    setShowAcceptModelModal(true);
                    setRequestStatusFormData((prev) => ({
                      ...prev,
                      status: requestStatuses.approve,
                    }));
                  }}
                >
                  {t('obx.attendance.pendingAttendanceRequestModal.approve')}
                </Button>
              </>
            )}
            <Box className={classes.reportsListingsHeaderRightDate}>
              <DateRangePicker
                selectedDates={queryParams?.selectedDates}
                setDates={(dates) => {
                  setQueryParams((prevState) => {
                    return {
                      ...prevState,
                      page: paginationOptions.defaultPerPage,
                      selectedDates: dates,
                    };
                  });
                }}
              />
            </Box>
            {rolesEnum.supervisor === userRole && (
              <>
                <Button
                  variant="primary"
                  // startIcon={<ApproveIcon />}
                  // className={classes.rejectBtn}
                  onClick={() => {
                    setApplyLeaveModal(true);
                  }}
                >
                  {t('obx.attendance.pendingAttendanceRequestModal.applyLeave')}
                </Button>
              </>
            )}
          </Box>
        </Box>

        <Box className={classes.tableWrapper}>
          <TableComponent
            data={data}
            columns={columns}
            tableHead={tableHead}
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
      {/* Delete SweetAlert */}
      <SweetAlertModal
        type="warning"
        title={t('obx.attendance.pendingAttendanceRequestModal.deleteRequestTitle')}
        text={t('obx.attendance.pendingAttendanceRequestModal.deleteRequestDesc')}
        cancelButtonText={t('links.cancel')}
        confirmButtonText={t('obx.attendance.pendingAttendanceRequestModal.deleteRequestButton')}
        show={showDeleteModal}
        handleConfirmButton={cancelSelectedLeave}
        handleCancelButton={() => setShowDeleteModal(false)}
        icon={<DeleteSweetAlertIcon />}
      />

      {/* Delete SweetAlert */}
      <SweetAlertModal
        customClass={{
          confirmButton: classes.sweetAlertConfirmBlueButton,
        }}
        type="warning"
        title={t('obx.attendance.pendingAttendanceRequestModal.approveRequest')}
        text={t('obx.attendance.pendingAttendanceRequestModal.approveRequestDesc')}
        cancelButtonText={t('links.cancel')}
        confirmButtonText={t('obx.attendance.pendingAttendanceRequestModal.approveRequest')}
        show={showAcceptModelModal}
        handleConfirmButton={changeSelectedRequestStatus}
        handleCancelButton={() => setShowAcceptModelModal(false)}
        icon={<CheckIcon />}
      />
      {/* Reject Modal */}
      {showRejectModal && (
        <RejectLeaveModal
          open={showRejectModal}
          handleClose={() => setShowRejectModal(false)}
          handleRejectReason={setRequestStatusFormData}
          onSubmit={changeSelectedRequestStatus}
          isLoading={rejectLeaveLoader}
        />
      )}
      {applyLeaveModal && (
        <LeaveRequestModal
          open={applyLeaveModal}
          handleClose={() => setApplyLeaveModal(false)}
          onSubmit={applyLeave}
          isLoading={applyLeaveLoader}
          t={t}
        />
      )}
    </>
  );
};

export default AttendanceListing;
