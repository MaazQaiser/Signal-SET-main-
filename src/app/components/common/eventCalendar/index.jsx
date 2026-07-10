import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import FullCalendar from '@fullcalendar/react';
import resourceTimelinePlugin from '@fullcalendar/resource-timeline';
import timeGridPlugin from '@fullcalendar/timegrid';
import {
  Avatar,
  Box,
  Button,
  Menu,
  MenuItem,
  Popover,
  Skeleton,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import MissedHitsDrawer from 'src/app/obx/pages/schedules/components/missedHitsDrawer';
import { dayjsWithTimezone } from 'src/app/obx/pages/schedules/helper';
import { ReactComponent as NoShiftIcon } from 'src/assets/images/no-shift.svg';
import { ReactComponent as CalendarIcon } from 'src/assets/svg/calendar.svg';
import { ReactComponent as LeftArrow } from 'src/assets/svg/calendar-left.svg';
import { ReactComponent as RightArrow } from 'src/assets/svg/calendar-right.svg';
import { ReactComponent as CrossIcon } from 'src/assets/svg/crossMeeting.svg';
import { ReactComponent as DeleteIcon } from 'src/assets/svg/DeleteIconBin.svg';
import { ReactComponent as EditIcon } from 'src/assets/svg/edit-3.svg';
import { ReactComponent as MenuIcon } from 'src/assets/svg/meetingMenu.svg';
import { ReactComponent as UserIcon } from 'src/assets/svg/meetingUser.svg';
import { formatDate } from 'src/helper/utilityFunctions';
import RenderIfHasPermission from 'src/hoc/renderIfHasPermission';
import { getDisplayConfiguration } from 'src/redux/store/slices/regionalCountryConfiguration';
import {
  DAY_GRID,
  DEFAULT_CALENDER_VIEW,
  SCHEDULE_DUTIES,
  TIME_GRID,
} from 'src/utils/constants/schedules';
import { getNameOrEmailInitials } from 'src/utils/string/common';

import SideDrawer from '../sideDrawer';
import CalendarSkeleton from '../skeletonLoader/calendarSkeleton';
import { useStyles } from './eventCalendar.styles';

const EventCalendar = ({
  events,
  // listEvents,
  // weekViewLocations,
  // dayViewDuties,
  // setShowDrawer,
  queryParams,
  setQueryParams,
  loading,
  selectedEvent,
  setOpenEditDrawer,
  deleteEvent,
  getEventDetails,
  detailComponentLoading,
  permissionSet = {
    updateMeetingPermission: null,
    deleteMeetingPermission: null,
  },
}) => {
  const calendarRef = useRef(null);
  const classes = useStyles();
  const { t } = useTranslation();
  const { dateFormat, timePrecision } = useSelector(getDisplayConfiguration);
  const [styleState, setStyle] = useState(null);

  const NA = t('commonText.nA');

  const [openEventModal, setOpenEventModal] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [moreAnchorEl, setMoreAnchorEl] = useState(null);

  const handleEventClick = (info) => {
    const id = info.event?.id;
    const extendedProps = info.event._def?.extendedProps || {};

    const eventData = {
      id,
      title: info.event.title,
      start: info.event.start,
      end: info.event.end,
      ...extendedProps,
    };

    //Todo: open event modal here
    setOpenEventModal(true);
    getEventDetails(eventData);

    const element = info.el;

    // Popover width (approximate) - adjust as needed
    const popoverWidth = 300;
    const screenWidth = window.innerWidth;

    let shouldShowOnLeft = false;
    let isDayView = false;

    if (queryParams.selectedView?.type === DAY_GRID.DAY) {
      isDayView = true;
      shouldShowOnLeft = false;
    } else if (queryParams.selectedView?.type !== DAY_GRID.DAY) {
      // ✅ Get bounding client rect
      const rect = element?.parentElement?.parentElement?.getBoundingClientRect();
      shouldShowOnLeft = rect.right + popoverWidth > screenWidth;
    }
    if (queryParams.selectedView?.type === DAY_GRID.WEEK) {
      // ✅ Get bounding client rect
      const rect = element?.parentElement?.getBoundingClientRect();
      shouldShowOnLeft = rect.right + popoverWidth > screenWidth;
    }
    if (queryParams.selectedView?.type === 'resourceTimelineWeek') {
      // ✅ Get bounding client rect
      const rect = element?.parentElement?.getBoundingClientRect();
      shouldShowOnLeft = rect.right + popoverWidth > screenWidth;
    }

    setStyle({
      shouldShowOnLeft,
      isDayView,
    });

    setAnchorEl(info.el);
  };

  const dutyColorClass = {
    [SCHEDULE_DUTIES.DEDICATED]: 'dutyGreen',
    [SCHEDULE_DUTIES.PATROL]: 'dutyBlue',
    [SCHEDULE_DUTIES.DISPATCH]: 'dutyPurple',
    [SCHEDULE_DUTIES.HIT]: 'dutyBlue',
    [SCHEDULE_DUTIES.EXTRA]: 'dutyYellow',
  };

  const eventMounted = (info) => {
    const { shiftType } = info.event._def?.extendedProps || {};
    // BEAUTIFY EVENTS
    // const eventClassName = classes[dutyColorClass[shiftType]]; // Todo: there is no dutyClass so we will change it to event class
    const eventClassName = classes[dutyColorClass[shiftType]];
    info.el.className += ` ${eventClassName}`;
  };

  const renderMonthEventContent = (info) => {
    return (
      <Box className={`${classes.eventContentContainer} ${classes.monthEventContentContainer}`}>
        <Box className={classes.eventBlueDot} />
        <Typography variant="body2">{info.event.title}</Typography>
      </Box>
    );
  };
  const renderWeekEventContent = (info) => {
    return (
      <Box className={`${classes.eventContentContainer} ${classes.weekEventContentContainer}`}>
        <Typography variant="body2">{info.event.title}</Typography>
      </Box>
    );
  };
  const renderDayEventContent = (info) => {
    return (
      <Box className={`${classes.eventContentContainer} ${classes.dayEventContentContainer}`}>
        <Typography variant="body2">{info.event.title}</Typography>
      </Box>
    );
  };

  const eventContent = (info) => {
    const viewType = info.view.type;

    if (viewType === DAY_GRID.MONTH) {
      return renderMonthEventContent(info);
    }

    if (viewType === DAY_GRID.WEEK) {
      return renderWeekEventContent(info);
    }

    if (viewType === DAY_GRID.DAY) {
      return renderDayEventContent(info);
    }

    return (
      <Box className={classes.eventContentContainer}>
        <Box className={classes.eventBlueDot} />
        <Typography variant="body2">{info.event.title}</Typography>
      </Box>
    );
  };

  const renderMoreEvents = (arg) => {
    return (
      <Box className={classes.eventContentContainer}>
        <Typography variant="body2" className={classes.moreEventsText}>{`${arg.text}`}</Typography>
      </Box>
    );
  };

  // TimeSlot View
  const customTimeSlotView = (info) => {
    const hour = info.date.getHours();
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 === 0 ? 12 : hour % 12;
    return (
      <Typography variant="subtitle3" className={classes.calendarTimeSlot}>
        {formattedHour} {ampm}
      </Typography>
    );
  };

  // FullCalendar header view
  const customHeaderView = (info) => {
    const date = info.date.getDate();
    const dayName = info.date.toLocaleString('default', { weekday: 'short' });
    // const dayMonth = info.date.toLocaleString('default', { month: 'short' });
    const currentView = info.view.type;

    // Get the current date
    const currentDate = dayjsWithTimezone();
    const currentDay = currentDate.date();
    const currentMonth = currentDate.month();

    // Check if the date being rendered is both in the current month and is the current date
    const isCurrentDate = date === currentDay && info.date.getMonth() === currentMonth;
    const highlightClass = isCurrentDate ? classes.highlightCurrentDate : '';
    // const highlightClassDay = isCurrentDate ? classes.highlightCurrentDay : '';

    if ([DAY_GRID.WEEK].includes(currentView)) {
      return (
        <Box className={classes.calendarHeaderCell}>
          <Typography variant="subtitle2" className={classes.calendarHeaderCellDay}>
            {dayName}
          </Typography>
          <Typography
            variant="subtitle2"
            className={`${classes.calendarHeaderCellDate} ${highlightClass}`}
          >
            {date}
          </Typography>
        </Box>
      );
    }

    if (currentView === DAY_GRID.MONTH) {
      return (
        <Box className={classes.calendarHeaderMonthCell}>
          <Typography variant="subtitle2" className={classes.calendarHeaderMonthCellDate}>
            {info.text}
          </Typography>
        </Box>
      );
    }

    if ([DAY_GRID.DAY].includes(currentView)) {
      return (
        <Box>
          <Box className={classes.calendarHeaderCell}>
            <Typography variant="subtitle2" className={classes.calendarHeaderCellDay}>
              {dayName}
            </Typography>
            <Typography
              variant="subtitle2"
              className={`${classes.calendarHeaderCellDate} ${highlightClass}`}
            >
              {date}
            </Typography>
          </Box>
        </Box>
      );
    }
  };

  const weekViewCustomDaysHeader = (info) => {
    const date = info.date.getDate();
    const dayName = info.date.toLocaleString('default', { weekday: 'short' });

    // Get the current date
    const currentDate = dayjsWithTimezone();
    const currentDay = currentDate.date();
    const currentMonth = currentDate.month();

    // Check if the date being rendered is both in the current month and is the current date
    const isCurrentDate = date === currentDay && info.date.getMonth() === currentMonth;
    const highlightClass = isCurrentDate ? classes.highlightCurrentDate : '';

    return (
      <Box className={classes.calendarHeaderCell}>
        <Typography variant="subtitle2" className={classes.calendarHeaderCellDay}>
          {dayName}
        </Typography>
        <Typography
          variant="subtitle2"
          className={`${classes.calendarHeaderCellDate} ${highlightClass}`}
        >
          {date}
        </Typography>
      </Box>
    );
  };

  const handleMoreClick = (event) => {
    event.stopPropagation();
    event.preventDefault();

    setMoreAnchorEl(event.currentTarget);
  };

  const handleMoreClose = () => {
    setMoreAnchorEl(null);
  };

  return (
    <>
      <Box className={classes.calendar}>
        <CalendarHeaderToolbar
          calendarRef={calendarRef}
          queryParams={queryParams}
          setQueryParams={setQueryParams}
        />
        {loading && <CalendarSkeleton />}

        <FullCalendar
          plugins={[
            dayGridPlugin,
            timeGridPlugin,
            listPlugin,
            interactionPlugin,
            resourceTimelinePlugin,
          ]}
          headerToolbar={false}
          initialView={DEFAULT_CALENDER_VIEW}
          events={events}
          eventDidMount={eventMounted}
          eventClick={handleEventClick}
          ref={calendarRef}
          allDaySlot={false}
          dayHeaderContent={customHeaderView}
          eventContent={eventContent}
          slotLabelContent={customTimeSlotView}
          noEventsContent={<NoEvent />}
          // resources={weekViewLocations || []}
          nowIndicator={false}
          firstDay={0} // Sunday
          slotDuration="00:30:00" // 30 minute slots
          slotLabelInterval="01:00" // 1-hour labels
          // dayMaxEvents={3} // Only show up to 5 events per day
          // moreLinkContent={renderMoreEvents}
          views={{
            resourceTimelineWeek: {
              slotLabelContent: weekViewCustomDaysHeader,
              resourceAreaWidth: '15%',
              dragScroll: false,
            },
            dayGridMonth: {
              dayMaxEvents: 3, // ✅ show "+X more" in month
              moreLinkContent: renderMoreEvents,
            },
            dayGridWeek: {
              dayMaxEvents: 3, // ✅ show "+X more" in week
              moreLinkContent: renderMoreEvents,
            },
            timeGridDay: {
              dayMaxEvents: false, // ❌ disables "+X more" in day view
            },
          }}
        />
      </Box>

      <Popover
        open={openEventModal}
        anchorEl={anchorEl}
        onClose={() => {
          setOpenEventModal(false);
          setAnchorEl(null);
        }}
        anchorReference="anchorEl"
        anchorOrigin={{
          vertical: 'center',
          horizontal: styleState?.isDayView
            ? 'center'
            : styleState?.shouldShowOnLeft
              ? 'left'
              : 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: styleState?.isDayView
            ? 'center'
            : styleState?.shouldShowOnLeft
              ? 'right'
              : 'left',
        }}
        PaperProps={{
          sx: {
            borderRadius: '8px',
            boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.15)',
            minWidth: '300px',
            maxWidth: '400px',
            maxHeight: '80vh',
            overflow: 'auto',
          },
        }}
        slotProps={{
          paper: {
            sx: {
              '&.MuiPopover-paper': {
                margin: '8px',
              },
            },
          },
        }}
      >
        <Box className={classes.eventPopoverContent}>
          {!detailComponentLoading ? (
            <>
              <Box className={classes.eventPopoverContentHeader}>
                <Box className={classes.eventPopoverIconBtn} onClick={handleMoreClick}>
                  <MenuIcon />
                </Box>
                <Menu
                  anchorEl={moreAnchorEl}
                  open={Boolean(moreAnchorEl)}
                  onClose={handleMoreClose}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                >
                  <RenderIfHasPermission name={permissionSet?.updateMeetingPermission}>
                    <MenuItem
                      onClick={() => {
                        setOpenEditDrawer(true);
                        handleMoreClose();
                        setOpenEventModal(false);
                        setAnchorEl(null);
                      }}
                      className={classes.menuItem}
                    >
                      <EditIcon fontSize="small" className={classes.menuIcon} />
                      Edit
                    </MenuItem>
                  </RenderIfHasPermission>
                  <RenderIfHasPermission name={permissionSet?.deleteMeetingPermission}>
                    <MenuItem
                      onClick={() => {
                        deleteEvent(true);
                        handleMoreClose();
                        setOpenEventModal(false);
                        setAnchorEl(null);
                      }}
                      className={classes.deleteMenuItem}
                    >
                      <DeleteIcon fontSize="small" className={classes.menuIcon} />
                      Delete
                    </MenuItem>
                  </RenderIfHasPermission>
                </Menu>
                <Box
                  className={classes.eventPopoverIconBtn}
                  onClick={() => {
                    setOpenEventModal(false);
                    setAnchorEl(null);
                  }}
                >
                  <CrossIcon />
                </Box>
              </Box>
              <Box className={classes.eventPopoverWrapper}>
                <Box className={classes.eventPopoverContentBody}>
                  <Box className={classes.eventPopoverTitleRow}>
                    <Box className={classes.iconWrapper}>
                      <Box className={classes.eventPopoverBlueSquare} />
                    </Box>
                    <Box className={classes.eventPopoverTitleContent}>
                      <Typography variant="body2" className={classes.eventPopoverTitleText}>
                        {selectedEvent?.title}
                      </Typography>
                      <Box className={classes.eventPopoverTimeDateRow}>
                        <Typography variant="body2" className={classes.eventPopoverTimeDateText}>
                          {formatDate(selectedEvent?.startTime, timePrecision)}
                        </Typography>
                        <Typography variant="body2">-</Typography>
                        <Typography variant="body2" className={classes.eventPopoverTimeDateText}>
                          {formatDate(selectedEvent?.endTime, timePrecision)}
                        </Typography>
                        <Typography variant="body2"> . </Typography>
                        <Typography variant="body2" className={classes.eventPopoverTimeDateText}>
                          {formatDate(selectedEvent?.start, dateFormat)}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>
                {/* meeting details */}
                {selectedEvent?.meetingLink && (
                  <Box className={classes.eventPopoverContentBody}>
                    <Box className={classes.eventPopoverTitleRow}>
                      <Box className={classes.iconWrapper}>
                        <CalendarIcon />
                      </Box>
                      <Box className={classes.eventPopoverTitleContent}>
                        <Typography variant="body2" className={classes.eventPopoverTitleText}>
                          <Button
                            variant="primary"
                            className={classes.eventPopoverTitleBtn}
                            onClick={() => window.open(selectedEvent?.meetingLink, '_blank')}
                          >
                            Join Meeting
                          </Button>
                        </Typography>
                        <Box className={classes.eventPopoverTimeDateRow}>
                          <Typography variant="body2" className={classes.meetingLinkText}>
                            {selectedEvent?.meetingLink}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                )}
                {/* guest details */}
                <Box className={classes.eventPopoverContentBody}>
                  <Box className={classes.eventPopoverTitleRow}>
                    <Box className={classes.iconWrapper}>
                      <UserIcon />
                    </Box>
                    <Box className={classes.eventPopoverTitleContent}>
                      <Typography variant="body2" className={classes.eventPopoverTitleText}>
                        <Typography variant="body2" className={classes.guestText}>
                          Guests
                        </Typography>
                      </Typography>
                      <Box className={classes.guestListWrapper}>
                        {selectedEvent?.guests?.length > 0 &&
                          selectedEvent?.guests?.map((guest) => {
                            return (
                              <Box key={guest?.email} className={classes.userListWrapper}>
                                <Box className={classes.eventPopoverGuestList}>
                                  <Box className={classes.imageWrapper}>
                                    <Avatar className={classes.userImage}>
                                      {getNameOrEmailInitials(guest?.name || guest?.email)}
                                    </Avatar>
                                  </Box>
                                </Box>
                                <Box className={classes.eventPopoverGuestListText}>
                                  {guest?.name && (
                                    <Typography variant="body2" className={classes.userNameText}>
                                      {guest?.name || NA}
                                    </Typography>
                                  )}
                                  <Typography variant="body2" className={classes.meetingLinkText}>
                                    {guest?.email || NA}
                                  </Typography>
                                </Box>
                              </Box>
                            );
                          })}
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </>
          ) : (
            <Box className={classes.eventPopoverSkeleton}>
              {[...Array(2)].map((_, idx) => (
                <Box className={classes.eventPopoverSkeleton} key={idx}>
                  <Box className={classes.eventPopoverContentBody}>
                    <Box className={classes.eventPopoverTitleRow}>
                      <Box className={classes.iconWrapper}>
                        <Skeleton variant="rounded" width={40} height={40} />
                      </Box>
                      <Box className={classes.eventPopoverTitleContent}>
                        <Skeleton variant="text" width={200} height={30} />
                        <Box className={classes.eventPopoverTimeDateRow}>
                          <Skeleton variant="text" width={150} height={25} />
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              ))}
            </Box>
          )}
        </Box>
      </Popover>
    </>
  );
};

EventCalendar.propTypes = {
  events: PropTypes.object,
  weekViewLocations: PropTypes.array,
  listEvents: PropTypes.object,
  dayViewDuties: PropTypes.object,
  setShowDrawer: PropTypes.func,
  queryParams: PropTypes.object,
  setQueryParams: PropTypes.func,
  loading: PropTypes.bool,
  missedHitsCount: PropTypes.number,
  selectedEvent: PropTypes.object,
  setSelectedEvent: PropTypes.func,
  setOpenEditDrawer: PropTypes.func,
  deleteEvent: PropTypes.func,
  getEventDetails: PropTypes.func,
  detailComponentLoading: PropTypes.bool,
  permissionSet: PropTypes.object,
};
export default EventCalendar;

// Custom Header Toolbar
const CalendarHeaderToolbar = ({ calendarRef, queryParams, setQueryParams }) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const [title, setTitle] = useState('');

  const calendarView = queryParams.selectedView?.type;
  const [missedHitDrawerData, setMissedHitDrawerData] = useState(null);
  // Custom Header Toolbar Prev/Next Button
  const handlePrevNext = (isNext) => () => {
    const calendarGetApi = calendarRef.current.getApi();
    if (isNext) {
      calendarGetApi.next();
    } else {
      calendarGetApi.prev();
    }
    const { activeEnd, activeStart, type } = calendarGetApi.view || {};
    const { windowStart, windowEnd } = getStartEndTimeForView({ activeEnd, activeStart, type });

    setQueryParams((prev) => ({
      ...prev,
      selectedView: {
        ...prev.selectedView,
        windowStart,
        windowEnd,
      },
    }));
  };

  const headerTitle = (calenderGetApi) => ({
    [DAY_GRID.DAY]: dayTitleFormat(calenderGetApi),
    [DAY_GRID.WEEK]: weekTitleFormat(calenderGetApi),
    [DAY_GRID.MONTH]: monthTitleFormat(calenderGetApi),
  });

  const handleChangeCalenderView = (selectedType) => () => {
    const calendarGetApi = calendarRef.current.getApi();
    calendarGetApi?.changeView(selectedType);

    const { activeEnd, activeStart, type } = calendarGetApi.view || {};
    const { windowStart, windowEnd } = getStartEndTimeForView({ activeEnd, activeStart, type });

    setQueryParams((prev) => ({
      ...prev,
      selectedView: {
        ...prev.selectedView,
        type: type,
        windowStart,
        windowEnd,
      },
    }));
  };

  // Day Title Format
  const dayTitleFormat = (info) => {
    const { view } = info;
    const currentDisplayDate = view.activeStart;

    const month = currentDisplayDate.toLocaleString('default', { month: 'long' });
    const day = currentDisplayDate.getDate();
    const year = currentDisplayDate.getFullYear();

    return `${month} ${day}, ${year}`;
  };

  // Week Title Format
  const weekTitleFormat = (info) => {
    const { view } = info;
    const currentDisplayDate = view.activeStart;

    // Calculate the start and end dates of the week
    const weekStartDate = new Date(currentDisplayDate);
    const weekEndDate = new Date(currentDisplayDate);
    weekEndDate.setDate(weekEndDate.getDate() + 6);

    const startMonth = weekStartDate.toLocaleString('default', { month: 'short' });
    const endMonth = weekEndDate.toLocaleString('default', { month: 'short' });
    const startDay = weekStartDate.getDate();
    const endDay = weekEndDate.getDate();
    const year = weekStartDate.getFullYear();

    if (startMonth === endMonth) {
      return `${startMonth} ${startDay} – ${endDay}, ${year}`;
    }
    return `${startMonth} ${startDay} – ${endMonth} ${endDay}, ${year}`;
  };

  // Month Title Format
  const monthTitleFormat = (info) => {
    const { view } = info;

    const currentDisplayDate = view.currentStart;

    const month = currentDisplayDate.toLocaleString('default', { month: 'long' });
    const year = currentDisplayDate.getFullYear();

    return `${month}, ${year}`;
  };

  useEffect(() => {
    if (!calendarRef.current) return;
    const calendarGetApi = calendarRef.current?.getApi();
    if (!calendarGetApi) return;

    const { activeEnd, activeStart, type } = calendarGetApi.view || {};
    const { windowStart, windowEnd } = getStartEndTimeForView({ activeEnd, activeStart, type });

    setQueryParams((prev) => ({
      ...prev,
      selectedView: {
        ...prev.selectedView,
        windowStart,
        windowEnd,
      },
    }));
  }, []);

  useEffect(() => {
    if (
      calendarRef.current &&
      queryParams.selectedView.windowStart &&
      queryParams.selectedView.windowEnd &&
      queryParams.selectedView.type
    ) {
      const calendarGetApi = calendarRef.current?.getApi();
      if (!calendarGetApi) return;

      const { type } = calendarGetApi.view || {};
      setTitle(headerTitle(calendarGetApi)?.[type]);
    }
  }, [queryParams.selectedView]);

  return (
    <Box className={classes.calendarHeaderToolbar}>
      <Box className={classes.calendarHeaderToolbarLeft}>
        <Button
          variant="tertiaryGrey"
          className={classes.calendarHeaderToolbarLeftAction}
          onClick={handlePrevNext(false)}
        >
          <LeftArrow />
        </Button>
        <Typography className={classes.calendarHeaderToolbarLeftText} variant="subtitle2">
          {title}
        </Typography>
        <Button
          variant="tertiaryGrey"
          className={classes.calendarHeaderToolbarLeftAction}
          onClick={handlePrevNext(true)}
        >
          <RightArrow />
        </Button>
      </Box>
      <Box className={classes.calendarHeaderToolbarRight}>
        <SideDrawer isOpen={!!missedHitDrawerData} totalWidth={'571px'}>
          <MissedHitsDrawer
            missedHitDrawerData={missedHitDrawerData}
            setMissedHitDrawerData={setMissedHitDrawerData}
          />
        </SideDrawer>

        {calendarView !== TIME_GRID.LIST && (
          <ToggleButtonGroup
            value={calendarView}
            exclusive
            className={classes.calendarHeaderToolbarToggle}
          >
            <ToggleButton
              className={classes.calendarHeaderToolbarToggleBtn}
              value={DAY_GRID.DAY}
              onClick={handleChangeCalenderView(DAY_GRID.DAY)}
            >
              {t('obx.schedules.calendar.view.day')}
            </ToggleButton>
            <ToggleButton
              className={classes.calendarHeaderToolbarToggleBtn}
              value={DAY_GRID.WEEK}
              onClick={handleChangeCalenderView(DAY_GRID.WEEK)}
            >
              {t('obx.schedules.calendar.view.week')}
            </ToggleButton>
            <ToggleButton
              className={classes.calendarHeaderToolbarToggleBtn}
              value={DAY_GRID.MONTH}
              onClick={handleChangeCalenderView(DAY_GRID.MONTH)}
            >
              {t('obx.schedules.calendar.view.month')}
            </ToggleButton>
          </ToggleButtonGroup>
        )}
      </Box>
    </Box>
  );
};

CalendarHeaderToolbar.propTypes = {
  calendarRef: PropTypes.object,
  queryParams: PropTypes.func,
  setQueryParams: PropTypes.func,
  missedHitsCount: PropTypes.number,
};
// When there are no events
const NoEvent = () => {
  const { t } = useTranslation();

  const classes = useStyles();

  return (
    <Box className={classes.calendarListEmpty}>
      <NoShiftIcon />
      <Typography variant="h2" className={classes.calendarListViewNoShiftTitle}>
        {t('obx.schedules.calendar.noEvents.title')}
      </Typography>
      <Typography variant="body2" className={classes.calendarListViewNoShiftText}>
        {t('obx.schedules.calendar.noEvents.description')}
      </Typography>
    </Box>
  );
};

const getStartEndTimeForView = ({ activeStart, activeEnd, type }) => {
  if (type == DAY_GRID.MONTH) {
    activeEnd?.setDate(activeEnd?.getDate() - 1);
    return {
      windowStart: dayjs(activeStart)?.format('YYYY-MM-DD'),
      windowEnd: dayjs(activeEnd)?.format('YYYY-MM-DD'),
    };
  }

  return {
    windowStart: dayjs(activeStart)?.toISOString(),
    windowEnd: dayjs(activeEnd)?.toISOString(),
  };
};
