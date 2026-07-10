import { Chip, TableCell, TableRow, TableSortLabel, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import { ReactComponent as ChevronRight } from 'assets/svg/chevron-right.svg';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import CustomDropDown from 'src/app/components/common/customDropDown';
import SearchComponent from 'src/app/components/common/search/index.jsx';
import SideDrawer from 'src/app/components/common/sideDrawer/index.jsx';
import TableSkeleton from 'src/app/components/common/skeletonLoader/tableSkeleton.jsx';
import TableComponent from 'src/app/components/common/table';
import NoRecordFound from 'src/app/components/common/table/noRecordFound';
import { useApiControllers } from 'src/helper/axios';
import { formatDate } from 'src/helper/utilityFunctions.js';
import { getDisplayConfiguration } from 'src/redux/store/slices/regionalCountryConfiguration';
import { getHolidayGroups } from 'src/services/holidays.service.js';
import { getFranchisesOptions } from 'src/services/location.service.js';
import transformArrayForOptions from 'src/utils/array/transformArrayForOptions.js';
import { paginationOptions, toastSettings } from 'src/utils/constants';
import { extractValuesByKeyFromInput } from 'src/utils/dropdownValueExtractor';
import capitalize from 'src/utils/string/capitalize.jsx';
import { toaster } from 'src/utils/toast/index.jsx';

import HolidayGroup from './components/addHolidayGroup/index.jsx';
import DeleteHolidayModal from './components/deleteHolidayGroup/index.jsx';
import HolidayDetails from './components/holidaysDetails/index.jsx';
import { useStyles } from './holidayGroupStyle.js';

const params = {
  page: paginationOptions.defaultPerPage,
  perPage: paginationOptions.perPageRows,
  name: '',
  sortBy: '',
  orderBy: '',
  franchise: {},
};

const order = {
  orderBy: 'id',
  orderType: 'asc',
};

export const statusOptions = [
  { label: 'All Statuses', value: null },
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
];

const i18ColumnName = (t, hoverIconClass) => {
  return [
    {
      id: 'groupName',
      label: `${t('obx.settings.preferences.holidayGroups.groupName')}`,
      className: hoverIconClass,
    },
    {
      id: 'numberOfHolidays',
      label: `${t('obx.settings.preferences.holidayGroups.numberOfHolidays')}`,
    },
    {
      id: 'createdBy',
      label: `${t('obx.settings.preferences.holidayGroups.createdBy')}`,
    },
    {
      id: 'createdOn',
      label: `${t('obx.settings.preferences.holidayGroups.createdOn')}`,
    },
  ];
};
const columnIdsEnum = {
  name: 'groupName',
  createdBy: 'createdBy',
  status: 'status',
  createdOn: 'createdOn',
  actions: 'actions',
};

const ALL_TYPE = { value: 'all', label: 'All Franchises', name: 'All Franchises', id: 'all' };

const HolidayGroups = () => {
  const { t } = useTranslation();
  const { dateFormat } = useSelector(getDisplayConfiguration);

  const [loadingHolidays, setLoadingHolidays] = useState(false);
  const [selectedHoliday, setSelectedHoliday] = useState(null);
  const [holidayGroups, setHolidayGroups] = useState([]);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [showHolidayGroupDetails, setShowHolidayGroupDetails] = useState(false);
  const [totalRows, setTotalRows] = useState(0);
  const [queryParams, setQueryParams] = useState(params);
  const [orderState, setOrderState] = useState(order);
  const [franchiseOptions, setFranchiseOptions] = useState([]);

  const classes = useStyles();
  const hoverIconClass = classes.templatesTD;
  const NA = t('commonText.nA');
  const [openHolidayGroupModal, setOpenHolidayGroupModal] = useState(false);

  const columns = i18ColumnName(t, hoverIconClass);
  const { getNewApiController } = useApiControllers();

  const goToHolidayGroup = (holiday) => {
    setSelectedHoliday(holiday);
    setOpenHolidayGroupModal(true);
  };
  const handleCloseDeleteModal = () => setOpenDeleteModal(false);

  const handleCloseDrawer = () => {
    setShowHolidayGroupDetails(false);
    setSelectedHoliday(null);
  };

  const handleDelete = (event, holiday) => {
    event.stopPropagation();
    if (!holiday.id) return;
    setSelectedHoliday(holiday);
    setOpenDeleteModal(true);
  };

  const renderTableCell = (row, column) => {
    if (column.id === columnIdsEnum.name) {
      return (
        <Box className={classes.franchiseName}>
          <Box className={classes.franchiseNameText}>{capitalize(row[column.id]) || NA}</Box>
          <Box className={classes.franchiseNameIcon}>
            <ChevronRight />
          </Box>
        </Box>
      );
    }
    if (column.id === columnIdsEnum.status) {
      return (
        <Chip
          label={row[column.id]}
          size="small"
          color={row[column.id] === 'active' ? 'success' : 'error'}
        />
      );
    }

    if (column.id === columnIdsEnum.createdBy) {
      return <>{capitalize(row[column.id])}</>;
    }

    if (column.id === columnIdsEnum.createdOn) {
      return <>{formatDate(row[column.id], dateFormat)}</>;
    }

    return <>{row[column.id] || NA}</>;
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

  const handleGroupModalClose = () => {
    setOpenHolidayGroupModal(false);
    setSelectedHoliday(null);
    setShowHolidayGroupDetails(false);
  };

  const tableHead = () => {
    return (
      <>
        <TableRow>
          {columns.map((column) => (
            <TableCell key={column.id} align={column.align} sortDirection={sortDirection(column)}>
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
    return loadingHolidays ? (
      <TableSkeleton numberOfRows={10} columns={columns} />
    ) : (
      <>
        {data?.length ? (
          data.map((row) => (
            <TableRow key={row.id}>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align}
                  className={column.className}
                  onClick={() => column.id === columnIdsEnum.name && handlePreview(row)}
                >
                  {renderTableCell(row, column)}
                </TableCell>
              ))}
            </TableRow>
          ))
        ) : (
          <NoRecordFound data={data} noOfColumns={columns?.length} t={t} />
        )}
      </>
    );
  };

  const handlePreview = (holidayGroup) => {
    setShowHolidayGroupDetails(true);
    setSelectedHoliday(holidayGroup);
  };

  const fetchHolidayGroups = async () => {
    setLoadingHolidays(true);
    const apiController = getNewApiController();
    try {
      const params = {
        ...queryParams,
        franchise:
          extractValuesByKeyFromInput(queryParams.franchise, 'value') !== 'all'
            ? extractValuesByKeyFromInput(queryParams.franchise, 'value')
            : '',
      };
      const response = await getHolidayGroups(params, {
        signal: apiController.signal,
      });
      if (response && response?.statusCode === 200) {
        setHolidayGroups(response?.data?.holidayGroups);
        setTotalRows(response?.pagination?.totalCount);
        setLoadingHolidays(false);
      }
    } catch (error) {
      setLoadingHolidays(false);
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  const getFranchisesList = async () => {
    const apiController = getNewApiController();
    try {
      const response = await getFranchisesOptions({
        signal: apiController.signal,
      });
      if (response?.statusCode === 200) {
        setFranchiseOptions(
          transformArrayForOptions(
            [ALL_TYPE, ...(response?.data?.franchises || [])],
            'name',
            'id',
          ) || [],
        );
      }
    } catch (error) {
      // show error or toast
    }
  };

  useEffect(() => {
    getFranchisesList();
  }, []);

  useEffect(() => {
    fetchHolidayGroups();
  }, [queryParams]);

  const handleSearch = (e) => {
    setQueryParams((prev) => ({
      ...prev,
      page: paginationOptions.defaultPerPage,
      search: e.target.value,
    }));
  };

  const handleDropdownSelect = async (event) => {
    const { name, value } = event.target;
    setQueryParams((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  return (
    <>
      <Box className={classes.header}>
        <Typography variant="h4" className={classes.title}>
          {t('obx.settings.preferences.mappingPreferences.holidayGroup.settingTitle')}
        </Typography>
        <Typography variant="body2" className={classes.tagline}>
          {t('obx.settings.preferences.mappingPreferences.holidayGroup.tagLine')}
        </Typography>
      </Box>

      <Box className={classes.templateHeader}>
        <Box className={classes.templateHeaderLeft}>
          <Box className={classes.headerTitlle}>
            <SearchComponent
              name="name"
              placeholder={t('obx.settings.preferences.holidayGroups.searchGroup')}
              onSearch={handleSearch}
            />
          </Box>
          <CustomDropDown
            name="franchise"
            label={t('sales.holidayGroups.allFranchises')}
            options={franchiseOptions || []}
            selectedValues={queryParams?.franchise || {}}
            handleChange={handleDropdownSelect}
            multiSelect={false}
            checkmark={false}
            clearAll={false}
            searchable={true}
            withTiles={false}
          />
        </Box>
      </Box>

      <TableComponent
        data={holidayGroups || []}
        tableHead={tableHead}
        columns={columns}
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
      <SideDrawer
        isOpen={showHolidayGroupDetails}
        closeDrawer={handleCloseDrawer}
        totalWidth={'480px'}
      >
        <HolidayDetails
          setShowDrawer={handleCloseDrawer}
          selectedHoliday={selectedHoliday}
          handleDelete={handleDelete}
          goToHolidayGroup={goToHolidayGroup}
        />
      </SideDrawer>

      {openDeleteModal && (
        <DeleteHolidayModal
          openModal={openDeleteModal}
          handleCloseModal={handleCloseDeleteModal}
          holiday={selectedHoliday}
          refetchHolidays={fetchHolidayGroups}
          handleCloseDrawer={handleCloseDrawer}
        />
      )}

      {openHolidayGroupModal && (
        <HolidayGroup
          open={openHolidayGroupModal}
          onClose={handleGroupModalClose}
          fetchHolidayGroups={fetchHolidayGroups}
          selectedHoliday={selectedHoliday}
          setSelectedHoliday={setSelectedHoliday}
        />
      )}
    </>
  );
};

export default HolidayGroups;
