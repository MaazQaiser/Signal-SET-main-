import {
  Box,
  Button,
  Checkbox,
  Chip,
  Drawer,
  IconButton,
  Link,
  Menu,
  MenuItem,
  TableCell,
  TableRow,
  TableSortLabel,
  Tooltip,
} from '@mui/material';
import { ReactComponent as InfoIcon } from 'assets/svg/info.svg';
import DateRangePicker from 'commonComponents/RangeDatepicker';
import { convertToDraft, getPlainTextOfDraft } from 'commonComponents/richText';
import TableSkeleton from 'commonComponents/skeletonLoader/tableSkeleton';
import NoRecordFound from 'commonComponents/table/noRecordFound';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useLocation, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { locationSortingTypes } from 'salesComponents/locations/newLocationsDrawer/location.constant';
import {
  i18PriorityTypes,
  i18RecordTypes,
  i18StatusTypes,
  i18TaskTypes,
} from 'salesComponents/locations/newTaskDrawer/task.constant';
import CustomDropDown from 'src/app/components/common/customDropDown';
import SearchComponentWithQuery from 'src/app/components/common/searchWithQuery';
import SweetAlertModal from 'src/app/components/common/sweetAlertModal';
import TableComponent from 'src/app/components/common/table';
import {
  SALES_COMPANY,
  SALES_CONTACT_DETAILS,
  SALES_DEAL,
  SALES_LOCATION,
} from 'src/app/router/constant/ROUTE';
import { ACL_TASKS_CREATE } from 'src/app/router/constant/SALESMODULE';
import history from 'src/app/router/utils/history';
import NewTaskDrawer from 'src/app/sales/pages/Tasks/details/newTaskDrawer';
import { AddIcon } from 'src/assets/svg';
import { ReactComponent as CallIcon } from 'src/assets/svg/call.svg';
import { ReactComponent as CheckBoxRegularIcon } from 'src/assets/svg/checkbox.svg';
import { ReactComponent as CheckBoxCheckedIcon } from 'src/assets/svg/checkbox-checked.svg';
import { ReactComponent as DeleteIcon } from 'src/assets/svg/DeleteIconBin.svg';
import { ReactComponent as EditIcon } from 'src/assets/svg/edit.svg';
import { ReactComponent as EmailIcon } from 'src/assets/svg/emailType.svg';
import { ReactComponent as LinkedInIcon } from 'src/assets/svg/linkedin.svg';
import { ReactComponent as MoreVertIcon } from 'src/assets/svg/more-vertical.svg';
import { ReactComponent as TodoIcon } from 'src/assets/svg/todo.svg';
import { useApiControllers } from 'src/helper/axios';
import { checkIfDateIsPassed, formatDate, getTaskableType } from 'src/helper/utilityFunctions';
import RenderIfHasPermission from 'src/hoc/renderIfHasPermission';
import { getDisplayConfiguration } from 'src/redux/store/slices/regionalCountryConfiguration';
import { deleteWebTask, getWebTasks, updateWebTask } from 'src/services/webTasks.service';
import userHasPermission from 'src/utils/auth/userHasPermission';
import { paginationOptions, toastSettings } from 'src/utils/constants';
import { KEY } from 'src/utils/constants/events/keyPressEvents';
import { extractValuesByKeyFromInput } from 'src/utils/dropdownValueExtractor';
import { capitalizeFirstLetter } from 'src/utils/string/common';
import { truncateString } from 'src/utils/string/truncate';

import TaskDetailDrawer from '../details/taskDetailDrawer';
import { useStyles } from './styles';

const columnIdConst = {
  checkbox: 'checkbox',
  title: 'title',
  recordType: 'recordType',
  description: 'description',
  dueDate: 'dueDate',
  priority: 'priority',
  type: 'type',
  createdBy: 'createdBy',
};

const i18Columns = (t) => [
  {
    id: columnIdConst.checkbox,
    label: '',
    sortable: false,
  },
  {
    id: columnIdConst.title,
    label: `${t('sales.tasks.title')}`,
    sortable: true,
  },
  {
    id: columnIdConst.recordType,
    label: `${t('sales.tasks.recordType')}`,
    sortable: true,
  },
  {
    id: columnIdConst.description,
    label: `${t('sales.tasks.taskDescription')}`,
    sortable: true,
  },
  {
    id: columnIdConst.createdBy,
    label: `${t('sales.tasks.createdBy')}`,
    sortable: true,
  },
  {
    id: columnIdConst.dueDate,
    label: `${t('sales.tasks.dueDate')}`,
    sortable: true,
  },
  {
    id: columnIdConst.priority,
    label: `${t('sales.tasks.priority')}`,
    sortable: true,
  },
  {
    id: columnIdConst.type,
    label: `${t('sales.tasks.type')}`,
    sortable: true,
  },
  {
    id: 'actions',
    label: '',
    sortable: false,
  },
];

const order = {
  orderBy: 'id',
  orderType: 'asc',
};

const params = {
  pageNo: paginationOptions.defaultPerPage,
  rowsPerPage: paginationOptions.perPageRows,
  search: '',
  sortBy: '',
  orderBy: '',

  type: {},
  taskableType: {},
  priority: {},
  status: {},

  createdDate: null,
};

const Tasks = ({
  permissionSet = {
    createTaskPermission: null,
    updateTaskPermission: null,
    deleteTaskPermission: null,
  },
}) => {
  const { t } = useTranslation();

  const NA = t('commonText.nA');

  const { id: paramId } = useParams();
  const location = useLocation();
  const { dateFormat } = useSelector(getDisplayConfiguration);

  const taskableType = getTaskableType(location?.pathname);

  const classes = useStyles();

  const { getNewApiController } = useApiControllers();

  const columns = i18Columns(t);
  const taskTypes = i18TaskTypes(t);
  const priorityTypes = i18PriorityTypes(t);
  const statusTypes = i18StatusTypes(t);
  const recordTypes = i18RecordTypes(t);
  const defaultType = taskTypes.find((type) => type.value === 'all') || {};
  const defaultStatus = statusTypes.find((status) => status.value === 'not_started') || {};

  const [orderState, setOrderState] = useState(order);
  const [anchorEl, setAnchorEl] = useState(null);
  const [data, setData] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);
  const [queryParams, setQueryParams] = useState({
    ...params,
    type: defaultType,
    status: defaultStatus,
  });
  const [selectedTask, setSelectedTask] = useState(null);
  const [confirmationModal, setConfirmationModal] = useState(false);
  const [locationState, setLocationState] = useState({
    right: false,
  });

  const [openDetailDrawer, setOpenDetailDrawer] = useState({
    right: false,
  });

  const toggleDrawerLocation = (anchor, open) => (event) => {
    if (event.type === KEY.UP && (event.key === KEY.TAB || event.key === KEY.SHIFT)) {
      return;
    }
    setLocationState({ ...locationState, [anchor]: open });
    setSelectedTask(null);
  };

  const toggleDetailDrawer = (anchor, open) => (event) => {
    if (event.type === KEY.UP && (event.key === KEY.TAB || event.key === KEY.SHIFT)) {
      return;
    }
    setOpenDetailDrawer({ ...locationState, [anchor]: open });
    !open && setSelectedTask(null);
  };

  const locationCloseDrawer = (anchor) => {
    setLocationState({ ...locationState, [anchor]: false });
    setSelectedTask(null);
  };

  const closeDetailDrawer = (anchor) => {
    setOpenDetailDrawer({ ...locationState, [anchor]: false });
    setSelectedTask(null);
  };

  const handleDropdownChange = (event) => {
    const { name, value } = event.target;
    setQueryParams((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSearch = (event) => {
    setQueryParams((prev) => ({ ...prev, search: event.target.value || '' }));
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
    return orderState.orderBy === column.id ? orderState.orderType : locationSortingTypes.ASC;
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
    setSelectedTask(null);
  };

  const handleChangePage = async (_, newPage) => {
    setQueryParams((prev) => ({ ...prev, pageNo: newPage + 1 }));
    setSelectedTask(null);
  };

  const onChangeRowsPerPage = async (event) => {
    setQueryParams((prev) => ({
      ...prev,
      pageNo: paginationOptions.defaultPerPage,
      rowsPerPage: parseInt(event.target.value, 10),
    }));
    setSelectedTask(null);
  };

  const handleSelectItem = (event, row) => {
    event.stopPropagation();
    changeSelectedTaskStatus(row);
  };

  const handleMoreClick = (event, row) => {
    setAnchorEl(event.currentTarget);
    setSelectedTask(row);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    setLocationState((prev) => ({ ...prev, right: true }));
    handleMenuClose();
  };

  const handleDelete = () => {
    setConfirmationModal(true);
    handleMenuClose();
  };

  const showMoreBtn =
    userHasPermission(permissionSet.updateTaskPermission) ||
    userHasPermission(permissionSet.deleteTaskPermission);

  const changeSelectedTaskStatus = async (task) => {
    try {
      const nextStatus = task?.status === 'completed' ? 'not_started' : 'completed';
      const payload = { status: nextStatus };
      const taskResponse = await updateWebTask(task?.id, payload);
      if (taskResponse?.statusCode === 200) {
        const activeStatusFilter = extractValuesByKeyFromInput(queryParams?.status, 'value');
        const shouldRemoveFromCurrentView =
          activeStatusFilter && activeStatusFilter !== 'all' && activeStatusFilter !== nextStatus;
        setData((prev) =>
          shouldRemoveFromCurrentView
            ? prev.filter((item) => item.id !== task.id)
            : prev.map((item) => (item.id === task.id ? { ...item, status: nextStatus } : item)),
        );
        setQueryParams((prev) => ({ ...prev }));
      }
    } catch (error) {
      toast.error(t('sales.tasks.statusChangeError'), {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  const onConfirmDelete = async () => {
    setConfirmationModal(false);
    try {
      const deleteTaskResponse = await deleteWebTask(selectedTask?.id);
      if (deleteTaskResponse?.statusCode === 200) {
        toast.success(deleteTaskResponse.message, {
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
        await fetchTasks(queryParams);
      }
    } catch (error) {
      // Error handled by toast in fetchTasks if needed
    } finally {
      setLoading(false);
      closeDetailDrawer(true);
    }
  };

  const tableHead = () => {
    return (
      <TableRow>
        {columns.map((column) => (
          <TableCell key={column.id} sortDirection={sortDirection(column)}>
            {column.id === columnIdConst.checkbox || column.id === columnIdConst.actions ? (
              ''
            ) : column.sortable ? (
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
              column.label
            )}
          </TableCell>
        ))}
      </TableRow>
    );
  };

  const renderTableCell = (row, column) => {
    if (column.id === columnIdConst.recordType) {
      const taskableName =
        row?.taskable?.name ||
        row?.taskable?.location_name ||
        row?.taskable?.property_name ||
        row?.taskable?.firstname + ' ' + row?.taskable?.lastname ||
        '';
      const taskableId = row?.taskable_id || row?.taskableId || row?.taskable?.id;
      const taskableTypeRaw = row?.taskable_type || row?.taskableType || '';
      const taskableType = taskableTypeRaw?.toString()?.toLowerCase();

      const getTaskableDetailRoute = () => {
        if (!taskableId || !taskableType) return null;
        if (taskableType === 'location') return `${SALES_LOCATION}/${taskableId}`;
        if (taskableType === 'company') return `${SALES_COMPANY}/${taskableId}`;
        if (taskableType === 'deal') return `${SALES_DEAL}/${taskableId}`;
        if (taskableType === 'contact') return `${SALES_CONTACT_DETAILS}/${taskableId}`;
        return null;
      };

      const detailRoute = getTaskableDetailRoute();

      if (!taskableName) return <>{NA}</>;

      return detailRoute ? (
        <Link
          component="button"
          underline="hover"
          color="inherit"
          className={classes.cursor}
          onClick={(event) => {
            event.stopPropagation();
            history.push(detailRoute);
          }}
        >
          {capitalizeFirstLetter(taskableName)}
        </Link>
      ) : (
        <>{capitalizeFirstLetter(taskableName)}</>
      );
    }

    /**
     * show 'NA' if there is no value
     */
    if (!row[column.id]) {
      return <Box className={classes.emptS}>{t('commonText.nA')}</Box>;
    }

    if (column.id === columnIdConst.description) {
      const maxLength = 50;
      const text = getPlainTextOfDraft(convertToDraft(row[column.id]));
      const truncatedText = text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;

      return (
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
          title={
            <>
              <Box dangerouslySetInnerHTML={{ __html: text }} />
            </>
          }
          placement="top"
        >
          <Box dangerouslySetInnerHTML={{ __html: truncatedText }} />
        </Tooltip>
      );
    }
    if (column.id === columnIdConst.dueDate) {
      return (
        <>
          {formatDate(row[column.id], dateFormat)}
          {checkIfDateIsPassed(row[column.id]) && row?.status !== 'completed' && (
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
              title={t('sales.tasks.dueDatePassed')}
              placement="bottom"
            >
              <InfoIcon className={classes.alertIcon} />
            </Tooltip>
          )}
        </>
      );
    }

    if (column.id === columnIdConst.priority) {
      return <Priority priority={row[column.id]} t={t} />;
    }

    if (column.id === columnIdConst.type) {
      return <Type type={row[column.id]} t={t} />;
    }

    if (column.id === columnIdConst.title) {
      return row?.title?.length > 25 ? (
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
          title={row?.title}
          placement="top"
        >
          <Box>{truncateString(capitalizeFirstLetter(row?.title), 25) || NA}</Box>
        </Tooltip>
      ) : (
        <>{capitalizeFirstLetter(row?.title) || NA}</>
      );
    }

    return <>{row[column.id]}</>;
  };

  const tableBody = (data) => {
    // show table skelton if loading
    return loading ? (
      <TableSkeleton columns={columns} />
    ) : (
      <>
        <NoRecordFound
          data={data}
          noOfColumns={columns.length}
          t={t}
          title={t('sales.tasks.noTasks')}
          description={t('sales.tasks.noTasksDesc')}
        />
        {data.length > 0 &&
          data?.map((row) => (
            <TableRow key={row.id}>
              {columns.map((column) => (
                <TableCell
                  key={`${row.id}-${column.id}`}
                  className={`${classes.cursor} ${
                    row.status === 'completed' ? classes.completedTaskTitle : ''
                  }`}
                  onClick={(event) => {
                    if (column.id === columnIdConst.title) {
                      setSelectedTask(row);
                      toggleDetailDrawer('right', true)(event);
                    }
                  }}
                >
                  {column.id === columnIdConst.checkbox ? (
                    <RenderIfHasPermission name={permissionSet?.updateTaskPermission}>
                      <Checkbox
                        checked={row.status === 'completed'}
                        onChange={(event) => handleSelectItem(event, row)}
                        icon={<CheckBoxRegularIcon />}
                        checkedIcon={<CheckBoxCheckedIcon />}
                        className={classes.checkBoxCustom}
                      />
                    </RenderIfHasPermission>
                  ) : column.id === 'actions' ? (
                    row?.generatedBy !== 'system' &&
                    showMoreBtn && (
                      <IconButton
                        onClick={(event) => handleMoreClick(event, row)}
                        className={classes.moreButton}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    )
                  ) : (
                    <>{renderTableCell(row, column)}</>
                  )}
                </TableCell>
              ))}
            </TableRow>
          ))}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          <RenderIfHasPermission name={permissionSet?.updateTaskPermission}>
            <MenuItem onClick={handleEdit} className={classes.menuItem}>
              <EditIcon className={classes.menuIcon} />
              {t('sales.locations.edit')}
            </MenuItem>
          </RenderIfHasPermission>
          <RenderIfHasPermission name={permissionSet?.deleteTaskPermission}>
            <MenuItem
              onClick={handleDelete}
              className={`${classes.menuItem} ${classes.deleteMenuItem}`}
            >
              <DeleteIcon className={classes.menuIcon} />
              {t('sales.locations.delete')}
            </MenuItem>
          </RenderIfHasPermission>
        </Menu>
      </>
    );
  };

  const fetchTasks = async (queryParams) => {
    const apiController = getNewApiController();
    try {
      setLoading(true);

      const params = {
        ...queryParams,
        priority:
          extractValuesByKeyFromInput(queryParams?.priority, 'value') !== 'all'
            ? extractValuesByKeyFromInput(queryParams?.priority, 'value')
            : '',
        type:
          extractValuesByKeyFromInput(queryParams?.type, 'value') !== 'all'
            ? extractValuesByKeyFromInput(queryParams?.type, 'value')
            : '',
        status:
          extractValuesByKeyFromInput(queryParams?.status, 'value') !== 'all'
            ? extractValuesByKeyFromInput(queryParams?.status, 'value')
            : '',
        taskableType:
          extractValuesByKeyFromInput(queryParams?.taskableType, 'value') !== 'all'
            ? extractValuesByKeyFromInput(queryParams?.taskableType, 'value')
            : taskableType || '',
        startDate: queryParams?.selectedDates?.[0]
          ? formatDate(queryParams?.selectedDates?.[0])
          : '',
        endDate: queryParams?.selectedDates?.[1] ? formatDate(queryParams?.selectedDates?.[1]) : '',
        taskable_id: paramId,
      };

      delete params?.selectedDates;

      const response = await getWebTasks(params, {
        signal: apiController.signal,
      });
      if (response?.statusCode === 200) {
        setData(response?.data?.tasks);
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
    fetchTasks(queryParams);
  }, [queryParams]);

  return (
    <Box className={`${classes.taskWrapper} ${classes.taskListingPageWrapper}`}>
      <Box className={classes.taskListingWrapper}>
        <Box className={classes.taskFilterBar}>
          <Box className={classes.filterLeftSide}>
            <SearchComponentWithQuery
              placeHolder={t('sales.tasks.searchByTitle')}
              onSearch={handleSearch}
            />
            <Box className={classes.dropDownsFilters}>
              <CustomDropDown
                name="type"
                id="type"
                label={t('sales.tasks.taskType')}
                options={taskTypes}
                selectedValues={queryParams?.type || {}}
                handleChange={handleDropdownChange}
                checkmark={true}
                multiSelect={false}
                className={classes.locationSearch}
              />
              <CustomDropDown
                name="taskableType"
                id="taskableType"
                label={t('sales.tasks.recordType')}
                options={recordTypes}
                selectedValues={queryParams?.taskableType || {}}
                handleChange={handleDropdownChange}
                checkmark={true}
                multiSelect={false}
                className={classes.locationSearch}
              />
              <CustomDropDown
                name="priority"
                id="priority"
                label={t('sales.tasks.priority')}
                options={priorityTypes}
                selectedValues={queryParams.priority || {}}
                handleChange={handleDropdownChange}
                checkmark={true}
                className={classes.locationSearch}
              />
              <CustomDropDown
                name="status"
                id="status"
                label={t('sales.tasks.status')}
                options={statusTypes}
                selectedValues={queryParams.status || {}}
                handleChange={handleDropdownChange}
                checkmark={true}
                className={classes.locationSearch}
              />
            </Box>
          </Box>
          <Box className={classes.filterRightSide}>
            <Box className={classes.leftWrapper}>
              <DateRangePicker
                placeHolder={`${dateFormat} - ${dateFormat}`}
                dateFormat={dateFormat}
                selectedDates={queryParams?.selectedDates}
                setDates={(dates) => {
                  setQueryParams((prevState) => ({
                    ...prevState,
                    pageNo: paginationOptions.defaultPerPage,
                    selectedDates: dates,
                  }));
                }}
              />
              <RenderIfHasPermission name={ACL_TASKS_CREATE}>
                <Button
                  onClick={toggleDrawerLocation('right', true)}
                  variant="primary"
                  startIcon={<AddIcon />}
                >
                  {t('sales.tasks.newTask')}
                </Button>
              </RenderIfHasPermission>
            </Box>
          </Box>
          <Drawer
            anchor={'right'}
            open={locationState['right']}
            onClose={toggleDrawerLocation('right', false)}
          >
            <NewTaskDrawer
              anchor={'right'}
              locationCloseDrawer={locationCloseDrawer}
              width={500}
              selectedTask={selectedTask}
              fetchTasks={() => fetchTasks(queryParams)}
            />
          </Drawer>

          <Drawer
            anchor={'right'}
            open={openDetailDrawer['right']}
            onClose={toggleDetailDrawer('right', false)}
          >
            <TaskDetailDrawer
              anchor={'right'}
              locationCloseDrawer={toggleDetailDrawer('right', false)}
              width={500}
              taskableType={taskableType}
              selectedTask={selectedTask}
              fetchTasks={() => fetchTasks(queryParams)}
              onConfirmDelete={onConfirmDelete}
              permissionSet={{
                updateTaskPermission: permissionSet.updateTaskPermission,
                deleteTaskPermission: permissionSet.deleteTaskPermission,
              }}
            />
          </Drawer>
          {/*)}*/}
        </Box>
        <Box className={classes.taskListingPageTableWrapper}>
          <TableComponent
            data={data}
            columns={columns}
            tableHead={tableHead}
            tableBody={tableBody}
            className={classes.taskTable}
            pagination={true}
            page={queryParams.pageNo - 1}
            totalRecords={totalRecords}
            handleChangePage={handleChangePage}
            applySorting={applySorting}
            rowsPerPageOptions={paginationOptions.perPageOptions}
            onChangeRowsPerPage={onChangeRowsPerPage}
            rowsPerPage={queryParams.rowsPerPage}
          />
        </Box>
      </Box>
      <SweetAlertModal
        type="warning"
        title={t('sales.tasks.deleteTask')}
        text={t('sales.tasks.deleteMessage')}
        cancelButtonText={t('links.cancel')}
        confirmButtonText={t('links.delete')}
        show={confirmationModal}
        handleConfirmButton={onConfirmDelete}
        handleCancelButton={() => setConfirmationModal(false)}
        icon={<DeleteIcon />}
      />
    </Box>
  );
};

Tasks.propTypes = {
  permissionSet: PropTypes.object,
};

export default Tasks;

const Priority = ({ priority = '', t }) => {
  const classes = useStyles();
  const priorityClass = priority?.toLowerCase();

  return (
    <Box className={classes.priorityWrapper}>
      <Box className={`${classes.priorityDot} ${priorityClass}`} />
      {t(`sales.tasks.${priority}`)}
    </Box>
  );
};

Priority.propTypes = {
  priority: PropTypes.string.isRequired,
  t: PropTypes.func.isRequired,
};

export const Type = ({ type = '', t }) => {
  const classes = useStyles();
  const typeClass = type?.toLowerCase();

  const getIcon = () => {
    switch (typeClass) {
      case 'todo':
        return <TodoIcon className={classes.typeIcon} />;
      case 'email':
        return <EmailIcon className={classes.typeIcon} />;
      case 'call':
        return <CallIcon className={classes.typeIcon} />;
      case 'linked_in':
        return <LinkedInIcon className={classes.typeIcon} />;
      default:
        return null;
    }
  };

  return (
    <Chip
      icon={getIcon()}
      label={
        type === 'linked_in'
          ? t('sales.tasks.linkedIn')
          : type === 'todo'
            ? t('sales.tasks.todo')
            : type
      }
      className={`${classes.typeChip} ${typeClass}`}
      size="small"
    />
  );
};

Type.propTypes = {
  type: PropTypes.string.isRequired,
  t: PropTypes.func.isRequired,
};
