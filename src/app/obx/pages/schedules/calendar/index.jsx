import { Box, Button, Skeleton, Tooltip, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  allDutyData,
  allMonthDutyData,
  getAllSitesByOfficerId,
  getMissedHitsCount,
} from 'services/duty.services';
import CustomDropDown from 'src/app/components/common/customDropDown';
import SearchComponent from 'src/app/components/common/search';
import { siteStatusEnum } from 'src/app/homeOffice/pages/franchise/utils/enums';
import {
  HO_SITES_CREATE_EXTRA_DUTY,
  HO_SITES_DETAIL,
  OBX_SCHEDULES_CREATE_EXTRA_DUTY,
  OBX_SITES,
  OBX_SITES_CREATE_EXTRA_DUTY,
  OBX_USER,
  OBX_USERS_CREATE_EXTRA_DUTY,
} from 'src/app/router/constant/ROUTE';
import history from 'src/app/router/utils/history';
import { AddIcon, AlertIcon } from 'src/assets/svg';
import { useApiControllers } from 'src/helper/axios';
import { getAllSites, getSitesAllLocations } from 'src/services/sites.services';
import transformArrayForOptions from 'src/utils/array/transformArrayForOptions';
import {
  franchiseIdUrlQueryParam,
  rolesEnum,
  timeZoneKeyUrlQueryParam,
  toastSettings,
} from 'src/utils/constants';
import {
  DAY_GRID,
  DEFAULT_CALENDER_VIEW,
  DRAWER_TYPE,
  DUTIES_FILTER_DATA,
  SCHEDULE_DUTIES,
  TIME_GRID,
} from 'src/utils/constants/schedules';
import { throwAPIError } from 'src/utils/throwAPIError';

import Calendar from '../../../../components/common/calendar';
import AssignmentSideDrawer from '../../sites/detail/components/jobs/assignmentSideDrawer';
import {
  dayjsWithStandardOffset,
  getCurrentTimeWithDisabledDlsInIso,
  getFranchiseIdWithRoleAndSource,
  getOffsetWithStandardTime,
  getTimezone,
} from '../helper';
import ShiftDetail from '../shiftDetail';
import { useStyles } from './scheduleCalendar.styles';

const STATUS_FILTER_DATA = (t) => [
  { value: undefined, label: t('obx.schedules.filters.status.all') },
  {
    value: t('obx.schedules.filters.status.completedKey'),
    label: t('obx.schedules.filters.status.completed'),
  },
  {
    value: t('obx.schedules.filters.status.inProgressKey'),
    label: t('obx.schedules.filters.status.inProgress'),
  },
  {
    value: t('obx.schedules.filters.status.notStartedKey'),
    label: t('obx.schedules.filters.status.notStarted'),
  },
  // {
  //   value: t('obx.schedules.filters.status.functionalKey'),
  //   label: t('obx.schedules.filters.status.upcoming'),
  // },
  {
    value: t('obx.schedules.filters.status.requiresAttentionKey'),
    label: t('obx.schedules.filters.status.unassigned'),
  },
];

const params = {
  search: '',
  allSites: [],
  siteLocations: [],
  filter: {
    selectedSites: [],
    selectedDutyType: {},
    selectedStatus: {},
    selectedLocations: { label: 'All Locations', value: '' },
  },
  selectedView: {
    type: DEFAULT_CALENDER_VIEW,
    windowStart: '',
    windowEnd: '',
  },
};

const ScheduleCalendar = (props) => {
  const [allDuties, setAllDuties] = useState();
  const [listDuties, setListDuties] = useState();
  const [dayViewDuties, setDayViewDuties] = useState();
  const [weekViewLocations, setWeekViewLocations] = useState([]);
  const [showDrawer, setShowDrawer] = useState({
    open: '',
    data: {},
    activeIndex: 0,
  });
  const [queryParams, setQueryParams] = useState(params);
  const [loading, setLoading] = useState(false);
  const classes = useStyles();
  const location = useLocation();
  const { id: paramId = '' } = useParams();

  const isSitesModule =
    location.pathname?.includes(OBX_SITES) || location.pathname?.includes(HO_SITES_DETAIL);
  const isUsersModule = location.pathname?.includes(OBX_USER);
  const [requireAttentionJobs, setRequireAttentionJobs] = useState(null);
  const [missedHitsCount, setMissedHitsCount] = useState(null);

  const franchiseIdWithRoleAndSource = getFranchiseIdWithRoleAndSource();

  const franchiseTimeZoneFromUrl = getTimezone();

  const { getNewApiController } = useApiControllers();

  const { t } = useTranslation();

  const showSideDrawer = (value) => (data) => {
    setShowDrawer({ open: value, data: value ? data : null });
  };
  const changeOnlyDrawerType = (value) => () => {
    setShowDrawer((prev) => ({ open: value, data: value ? prev?.data : null }));
  };

  const handleSelectFilter = (event, key) => {
    setQueryParams((prev) => ({
      ...prev,
      filter: {
        ...prev.filter,
        [key]: event.target.value,
      },
    }));
  };

  const dutyNameMonth = {
    [SCHEDULE_DUTIES.DEDICATED]: t('obx.schedules.legends.dedicated'),
    [SCHEDULE_DUTIES.PATROL]: t('obx.schedules.legends.patrol'),
    [SCHEDULE_DUTIES.EXTRA]: t('obx.schedules.legends.extra'),
  };

  const getDutiesByMonth = async (query, config) => {
    const response = await allMonthDutyData(query, config);

    const shiftsRes = response?.data?.shifts || [];

    const shifts = shiftsRes?.flatMap((shiftRes) => {
      const shift = Object.values(shiftRes).reduce((acc, current) => {
        const count = (current?.assignedCount || 0) + (current?.unassignedCount || 0);
        if (!current?.type || !count) return acc;

        acc = [
          ...acc,
          {
            date: shiftRes?.date,
            name: `${count}x ${dutyNameMonth[current?.type]}`,
            requiresAttention: current?.requiresAttention,
            shiftType: current?.type,
            unassignedCount: current?.unassignedCount,
            assignedCount: current?.assignedCount,
          },
        ];

        return acc;
      }, []);

      return shift;
    }, []);

    setRequireAttentionJobs(response?.data?.unassignedCount || 0);
    return shifts;
  };

  const getAllDuties = async (query, config) => {
    try {
      query.windowStart = getCurrentTimeWithDisabledDlsInIso(query?.windowStart);
      query.windowEnd = getCurrentTimeWithDisabledDlsInIso(query?.windowEnd);

      const response = await allDutyData(query, config);

      if (response?.statusCode === 200) {
        const data = response?.data;
        setRequireAttentionJobs(response?.data?.unassignedCount || 0);
        return data || [];
      }

      return [];
    } catch (error) {
      throwAPIError(error);
    }
  };

  const getAllListDuties = async (query, config) => {
    query.list = true;

    let shifts = [];
    let listShifts = {};

    const shiftsRes = (await getAllDuties(query, config))?.shifts;
    shiftsRes.forEach((shift) => {
      shifts.push({ ...shift, start: shift?.startsAt, end: shift?.endsAt });

      const date = new Date(shift?.startsAt).getDate();
      listShifts[date] = [
        ...(listShifts[date] || []),
        {
          ...shift,
          start: shift?.startsAt,
          end: shift?.endsAt,
          name: shift?.name,
        },
      ];
    });

    return { shifts, listShifts };
  };

  const getAllDutiesData = async (filter, selectedView, search) => {
    const apiController = getNewApiController();

    try {
      setLoading(true);
      setListDuties([]);
      setAllDuties([]);
      setDayViewDuties({});
      setWeekViewLocations([]);
      setRequireAttentionJobs(null);

      if ((isSitesModule && !props.selectedSite?.id) || (isUsersModule && !props.officerId)) {
        setLoading(false);
        setListDuties([]);
        setDayViewDuties({});
        setWeekViewLocations([]);
        setAllDuties([]);
        setRequireAttentionJobs(0);

        return;
      }

      const { type, windowStart, windowEnd } = selectedView;

      const siteIds = isSitesModule
        ? [props.selectedSite?.id]
        : filter.selectedSites?.map((site) => site?.id);
      const shiftType = filter?.selectedDutyType?.value;
      const shiftStatus = filter?.selectedStatus?.value;
      const locationId = filter?.selectedLocations?.value;
      const query = {
        windowStart: windowStart,
        windowEnd: windowEnd,
        shiftType,
        shiftStatus,
        search,
        siteId: siteIds,
        officerId: props.officerId,
        isSite: isSitesModule,
        locationId,
      };

      let shifts = [];
      let listShifts = undefined;
      let dayViewShifts = {};
      let weekViewLocations = [];

      const config = { signal: apiController.signal };
      if (type == DAY_GRID.MONTH) {
        query.offset = getOffsetWithStandardTime();
        shifts = await getDutiesByMonth(query, config);
      } else if (type == TIME_GRID.LIST) {
        const res = await getAllListDuties(query, config);
        shifts = res.shifts;
        listShifts = res.listShifts || {};
      } else if (type == DAY_GRID.DAY) {
        shifts = [];
        query.isDayView = true;
        dayViewShifts = (await getAllDuties(query, config))?.shifts;
      } else if (type == DAY_GRID.WEEK) {
        const res = await getAllDuties(query, config);
        shifts = res?.shifts || [];
        shifts = shifts?.map((shift) => ({
          ...shift,
          startsAt: shift?.startsAt,
          start: dayjsWithStandardOffset(shift?.start).format('YYYY-MM-DD'),
          endsAt: shift?.endsAt,
        }));
        weekViewLocations = res?.locations || [];
      }

      setListDuties(listShifts);
      setDayViewDuties(dayViewShifts);
      setWeekViewLocations(weekViewLocations);
      setAllDuties(shifts);
      setLoading(false);
    } catch (error) {
      if (!apiController.signal.aborted) {
        toast.error(error?.message, {
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
        setListDuties([]);
        setDayViewDuties({});
        setWeekViewLocations([]);
        setAllDuties([]);
        setRequireAttentionJobs(0);
        setLoading(false);
      }
    }
  };

  const getMissedHitsCountFunc = async ({ start, end }) => {
    try {
      setMissedHitsCount(undefined);

      const startsAt = getCurrentTimeWithDisabledDlsInIso(start);
      const endsAt = getCurrentTimeWithDisabledDlsInIso(end);
      const response = await getMissedHitsCount({
        startsAt: startsAt,
        endsAt: endsAt,
      });

      setMissedHitsCount(response?.data?.missedHitsCount || 0);
    } catch (error) {
      setMissedHitsCount(null);
      toast.error(error?.message, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  // fetch missed hits count
  useEffect(() => {
    if (isSitesModule || isUsersModule) return;
    if (queryParams.selectedView.windowStart && queryParams.selectedView.windowEnd) {
      getMissedHitsCountFunc({
        start: queryParams.selectedView?.windowStart,
        end: queryParams.selectedView?.windowEnd,
      });
    }
  }, [queryParams.selectedView?.windowStart, queryParams.selectedView?.windowEnd]);

  const onSearch = (e) => {
    setQueryParams((prev) => ({
      ...prev,
      search: e.target.value,
    }));

    getAllDutiesData(queryParams.filter, queryParams.selectedView, e.target.value);
  };
  useEffect(() => {
    if (queryParams.selectedView.windowStart && queryParams.selectedView.windowEnd) {
      getAllDutiesData(queryParams.filter, queryParams.selectedView);
    } else {
      setListDuties([]);
      setDayViewDuties({});
      setWeekViewLocations([]);
      setAllDuties([]);
    }
  }, [queryParams.filter, queryParams.selectedView, props.selectedSite?.id, props.officerId]);

  const getSitesList = async (officerId) => {
    try {
      let response;
      if (officerId) {
        response = await getAllSitesByOfficerId(officerId);
      } else {
        response = await getAllSites({});
      }

      const sitesList = response?.data?.sites || [];
      setQueryParams((prev) => ({
        ...prev,
        allSites: [...sitesList],
      }));
    } catch (error) {
      toast.error(error?.message, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });

      setQueryParams((prev) => ({
        ...prev,
        allSites: [],
        filter: {
          ...prev.filter,
          selectedSites: [],
        },
      }));
    }
  };

  const getLocationsOfSite = async (siteId) => {
    try {
      const response = await getSitesAllLocations(siteId);

      if (response?.statusCode === 200) {
        const locationsRes = response?.data?.locations || [];

        setQueryParams((prev) => ({
          ...prev,
          siteLocations: [
            { label: 'All Locations', value: '' },
            ...transformArrayForOptions(locationsRes, 'name', 'id'),
          ],
        }));
      }
    } catch (error) {
      setQueryParams((prev) => ({
        ...prev,
        siteLocations: [],
      }));
    }
  };

  /**
   * if site is nonFunctional disable the create extra job button
   * */
  const disableIfSiteNonFunctional = () => {
    if (Object.keys(props?.selectedSite).length === 1) return true;

    if (Object.keys(props?.selectedSite).length > 1) {
      if (
        props?.selectedSite?.status === siteStatusEnum.requiresAttention ||
        props?.selectedSite?.status === siteStatusEnum.nonFunctional
      ) {
        return true;
      }
    }
    return false;
  };

  useEffect(() => {
    if (isSitesModule) return;

    getSitesList(props.officerId);
  }, [props.officerId]);

  useEffect(() => {
    if (isSitesModule) {
      getLocationsOfSite(props.selectedSite?.id);
    }
  }, [isSitesModule]);

  const onClickCreateExtraDuty = () => {
    if (
      franchiseIdWithRoleAndSource?.role === rolesEnum.homeOfficer &&
      franchiseIdWithRoleAndSource?.[franchiseIdUrlQueryParam]
    ) {
      const createExtraJob = HO_SITES_CREATE_EXTRA_DUTY;
      const queryParams = new URLSearchParams({
        siteId: `${paramId}`,
        [franchiseIdUrlQueryParam]: franchiseIdWithRoleAndSource?.[franchiseIdUrlQueryParam],
        [timeZoneKeyUrlQueryParam]: franchiseTimeZoneFromUrl,
      }).toString();
      return history.push(`${createExtraJob}?${queryParams}`);
    }

    if (isSitesModule) {
      return history.push(OBX_SITES_CREATE_EXTRA_DUTY + `?siteId=${paramId}`);
    }
    if (isUsersModule) {
      return history.push(OBX_USERS_CREATE_EXTRA_DUTY + `?userId=${paramId}`);
    }

    return history.push(OBX_SCHEDULES_CREATE_EXTRA_DUTY);
  };

  return (
    <Box className={`${classes.scheduleCalendar} ${props.className}`}>
      <Box className={classes.scheduleCalendarHeader}>
        <Box className={classes.scheduleCalendarHeaderLeft}>
          {queryParams.selectedView.type === TIME_GRID.LIST && (
            <SearchComponent
              name="search"
              placeholder={t('form.input.textField.search.placeHolder')}
              onSearch={onSearch}
            />
          )}

          <Box className={classes.scheduleCalendarHeaderFilters}>
            {!isSitesModule && (
              <CustomDropDown
                name="sites"
                label={t('obx.schedules.filters.sites.label')}
                options={transformArrayForOptions(queryParams.allSites, 'name', 'id') || []}
                selectedValues={queryParams.filter.selectedSites}
                handleChange={(e) => handleSelectFilter(e, 'selectedSites')}
                multiSelect
                searchPlaceholder={t('obx.schedules.filters.sites.searchPlaceholder')}
                checkmark
                searchable
                withTiles
                clearAll
              />
            )}

            {isSitesModule && (
              <CustomDropDown
                label={t('obx.schedules.filters.locations.all')}
                name="location"
                options={queryParams.siteLocations}
                selectedValues={queryParams.filter.selectedLocations}
                handleChange={(e) => handleSelectFilter(e, 'selectedLocations')}
                searchPlaceholder={t('obx.schedules.filters.locations.searchPlaceholder')}
                searchable
              />
            )}

            <CustomDropDown
              name="duties"
              label={t('obx.schedules.filters.duties.label')}
              options={DUTIES_FILTER_DATA(t) || []}
              selectedValues={queryParams.filter.selectedDutyType}
              handleChange={(e) => handleSelectFilter(e, 'selectedDutyType')}
              checkmark
            />
            {!isUsersModule && (
              <CustomDropDown
                name="status"
                label={t('obx.schedules.filters.status.label')}
                options={STATUS_FILTER_DATA(t) || []}
                selectedValues={queryParams.filter.selectedStatus}
                handleChange={(e) => handleSelectFilter(e, 'selectedStatus')}
              />
            )}
          </Box>
        </Box>

        <Box className={classes.scheduleCalendarHeaderRight}>
          {!isUsersModule && requireAttentionJobs !== 0 && (
            <>
              {typeof requireAttentionJobs === 'number' ? (
                <Typography variant="subtitle2" className={classes.scheduleCalendarAlert}>
                  <AlertIcon />
                  {t('obx.schedules.calendar.jobsRequireAttention', {
                    count: requireAttentionJobs,
                  })}
                </Typography>
              ) : (
                <Skeleton className={classes.scheduleCalendarAlertSkeleton} />
              )}
            </>
          )}
          {/* Loader */}
          <Tooltip
            placement="top"
            arrow
            title={
              isSitesModule &&
              disableIfSiteNonFunctional() &&
              t('obx.sites.cannotCreateExtraJobForNonFunctionalSite')
            }
          >
            <Box>
              <Button
                onClick={onClickCreateExtraDuty}
                variant="primary"
                startIcon={<AddIcon />}
                disabled={isSitesModule && disableIfSiteNonFunctional()}
              >
                {t('obx.obxExtraDuty.labels.createExtraDuty')}
              </Button>
            </Box>
          </Tooltip>
        </Box>
      </Box>
      <Box className={classes.scheduleCalendarFull}>
        <Calendar
          {...{
            events: allDuties,
            listEvents: listDuties,
            dayViewDuties,
            weekViewLocations,
            setShowDrawer,
            queryParams,
            setQueryParams,
            loading,
            missedHitsCount,
          }}
        />
      </Box>

      {[
        DRAWER_TYPE.ASSIGN,
        DRAWER_TYPE.TOUR_TEMPLATE,
        DRAWER_TYPE.REASSIGNMENT,
        DRAWER_TYPE.EDIT_REASSIGNMENT,
      ].includes(showDrawer?.open) && (
        <AssignmentSideDrawer
          isOpen={true}
          drawerData={{
            type: showDrawer?.open,
            shiftId: showDrawer?.data?.shiftId,
            siteId: showDrawer?.data?.site?.id,
            shiftDate: showDrawer?.data?.startsAt,
          }}
          closeSideDrawer={showSideDrawer('')}
          changeOnlyDrawerType={changeOnlyDrawerType}
          callbackUponAssignment={() =>
            getAllDutiesData(queryParams.filter, queryParams.selectedView)
          }
        />
      )}
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
            setAllDuties,
            getAllDuties: () => getAllDutiesData(queryParams.filter, queryParams.selectedView),
          }}
        />
      )}
    </Box>
  );
};

ScheduleCalendar.propTypes = {
  props: PropTypes.any,
  selectedSite: PropTypes.number,
  officerId: PropTypes.number,
  className: PropTypes.string,
};

export default ScheduleCalendar;

export const DUTY_COLORS = {
  [SCHEDULE_DUTIES.DEDICATED]: '#31a150',
  [SCHEDULE_DUTIES.EXTRA]: '#FFAC0D',
  [SCHEDULE_DUTIES.PATROL]: '#146dff',
  [SCHEDULE_DUTIES.HIT]: '#146dff',
  [SCHEDULE_DUTIES.DISPATCH]: '#9747FF',
};
