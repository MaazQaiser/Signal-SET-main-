import {
  Box,
  Button,
  Drawer,
  Link,
  List,
  ListItem,
  ListItemText,
  Skeleton,
  Typography,
} from '@mui/material';
import CustomDropDown from 'commonComponents/customDropDown';
import EventCalendar from 'commonComponents/eventCalendar';
import CalendarSkeleton from 'commonComponents/skeletonLoader/calendarSkeleton';
import SweetAlertModal from 'commonComponents/sweetAlertModal';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import CreateMeetingDrawer from 'salesComponents/locations/meetings/components/meetingDrawer';
import { deleteEvent, getCalenders, getEvent, getMeetings } from 'services/meetings.services';
import { AddIcon } from 'src/assets/svg';
import { ReactComponent as EmailIcon } from 'src/assets/svg/connectEmail.svg';
import { ReactComponent as DeleteIcon } from 'src/assets/svg/deleteMeeting.svg';
import { useApiControllers } from 'src/helper/axios';
import { formatDate, isObjectEmpty, removeKeysFromObject } from 'src/helper/utilityFunctions';
import RenderIfHasPermission from 'src/hoc/renderIfHasPermission';
import transformArrayForOptions from 'src/utils/array/transformArrayForOptions';
import userHasPermission from 'src/utils/auth/userHasPermission';
import { toastSettings } from 'src/utils/constants';
import { DEFAULT_CALENDER_VIEW } from 'src/utils/constants/schedules';
import { convertHHMMAToDayJsDate, convertMMDDYYYYToDayJsDate } from 'src/utils/passTime/time';

import { useStyles } from './styles';

const defaultParams = {
  selectedView: {
    type: DEFAULT_CALENDER_VIEW,
    windowStart: '',
    windowEnd: '',
  },
};

const MeetingsCalendar = ({
  contacts,
  permissionSet = {
    emailConfigurationCreate: null,
    createMeetingPermission: null,
    updateMeetingPermission: null,
    deleteMeetingPermission: null,
  },
}) => {
  const { t } = useTranslation();
  const classes = useStyles();

  const _NA = t('commonText.nA');

  const { id: locationId } = useParams();

  const { getNewApiController } = useApiControllers();

  const [queryParams, setQueryParams] = useState(defaultParams);

  const [selectedEvent, setSelectedEvent] = useState({});

  const [loading, setLoading] = useState(true);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);

  const [events, setEvents] = useState([]);

  const [redirectUri, setRedirectUri] = useState('');

  const [disabled, setDisabled] = useState(true);

  // const [currentSelected, setCurrentSelected] = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [defaultCalender, setDefaultCalendar] = useState({});

  const [calendars, setCalendars] = useState([]);

  const [detialComponentLoading, setDetialComponentLoading] = useState(false);

  const [isEmailConnected, setIsEmailConnected] = useState(false);

  const toggleCreateDrawer = () => {
    setIsDrawerOpen((a) => !a);
  };

  const toggleDetailDrawer = () => {
    setDetailDrawerOpen((a) => !a);
  };

  const openConnectEmail = (e) => {
    e.stopPropagation();
  };

  const toggleDeleteModal = () => {
    setShowDeleteModal((a) => !a);
  };

  const _resetQueryParams = () => {
    setQueryParams(defaultParams);
  };

  const handleCalenderChange = (event) => {
    const { value } = event.target;
    if (isObjectEmpty(value)) {
      toast.info(t('sales.locations.calendarMustBeSelected'), {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
      return;
    }
    setDefaultCalendar(value);
  };

  const deleteCalendarEvent = async () => {
    const apiController = getNewApiController();

    try {
      const response = await deleteEvent({
        locationId: locationId,
        calendarId: defaultCalender?.id,
        eventId: selectedEvent?.id,
        config: {
          signal: apiController.signal,
        },
      });
      if (response?.statusCode === 200) {
        toast.success(response.message, {
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
        fetchCalendarEvents(defaultParams);
      }
    } catch (error) {
      toast.error(error?.message, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    } finally {
      if (!apiController.signal.aborted) {
        setLoading(false);
      }
      toggleDeleteModal();
    }
  };
  const _stripTimezoneOffset = (dateString) => {
    return dateString.replace(/(\+|)\d{2}:\d{2}$/, ''); // Removes +00:00 or +05:00 etc.
  };

  const combineDateAndTime = (date, time) => {
    // Parse the date in the "MM/DD/YYYY" format
    const parsedDate = dayjs(date, 'MM/DD/YYYY');

    // Combine the parsed date with time
    const combined = parsedDate.format(`YYYY-MM-DD`) + `T${time}`;

    // Return the combined date and time as an ISO string
    return dayjs(combined).format(); // ISO 8601 format: "YYYY-MM-DDTHH:mm:ss"
  };

  const fetchCalendarEvents = async (queryParams) => {
    const apiController = getNewApiController();
    setLoading(true);
    try {
      let params = {
        ...queryParams,
        startDate: formatDate(queryParams?.selectedView?.windowStart),
        endDate: formatDate(queryParams?.selectedView?.windowEnd),
      };
      params = removeKeysFromObject(params, ['selectedView']);
      const response = await getMeetings({
        locationId: locationId,
        calendarId: defaultCalender?.id,
        params,
        config: {
          signal: apiController.signal,
        },
      });
      if (response?.statusCode === 200) {
        // setIsEmailConnected(true);dayjs(event.startTime).local().toISOString()

        setEvents(
          response?.data?.events?.map((o) => ({
            ...o,
            start: combineDateAndTime(o?.startDate, o?.startTime),
            end: combineDateAndTime(o?.endTime, o?.endTime),
            startTime: combineDateAndTime(o?.startDate, o?.startTime),
            endTime: combineDateAndTime(o?.endTime, o?.endTime),
          })) || [],
        );
      }
    } catch (error) {
      if (!apiController.signal.aborted) {
        if (error?.message) {
          toast.error(error?.message, {
            position: 'top-right',
            autoClose: toastSettings.AUTO_CLOSE,
          });
        }
      }
    } finally {
      if (!apiController.signal.aborted) {
        setLoading(false);
      }
    }
  };

  const getCalendarsList = async () => {
    setDisabled(true);
    try {
      const response = await getCalenders();
      if (response?.statusCode === 200) {
        const transformedCalendars = transformArrayForOptions(
          response?.data?.calendars,
          'name',
          'id',
        );
        setIsEmailConnected(true);
        setCalendars(transformedCalendars || []);
        const primaryCalendar = transformedCalendars?.find((f) => f.isPrimary);
        setDefaultCalendar(primaryCalendar);
      }
    } catch (error) {
      // toast.error(error?.message, {
      //   position: 'top-right',
      //   autoClose: toastSettings.AUTO_CLOSE,
      // });
      if (error?.data?.redirectURI) {
        setRedirectUri(error.data.redirectURI);
      }
    } finally {
      setDisabled(false);
    }
  };

  const getEventDetails = async (event) => {
    setDetialComponentLoading(true);
    try {
      const response = await getEvent({
        locationId: locationId,
        calendarId: defaultCalender?.id,
        eventId: event?.id,
      });
      if (response.statusCode === 200) {
        const event = response?.data?.event || {};

        setSelectedEvent({
          ...event,
          start: convertMMDDYYYYToDayJsDate(event?.startDate, false),
          date: convertMMDDYYYYToDayJsDate(event?.startDate, false),
          startTime: convertHHMMAToDayJsDate(event?.startTime),
          endTime: convertHHMMAToDayJsDate(event?.endTime),
        });
      }
    } catch (error) {
      //
    } finally {
      setDetialComponentLoading(false);
    }
  };

  useEffect(() => {
    // fetch email
    if (!isObjectEmpty(defaultCalender)) fetchCalendarEvents(queryParams);
  }, [queryParams, defaultCalender]);

  useEffect(() => {
    // Get Calendars
    getCalendarsList();
  }, []);

  const hasEmailConfigurationConnectPermission = userHasPermission(
    permissionSet?.emailConfigurationCreate,
  );

  // useEffect(() => {
  //   // Get Email connection status
  //   if (!emailConnection) getSMTPConnection();
  // }, []);

  const _EmailListingSkeleton = () => (
    <List>
      {[1, 2, 3, 4, 5, 6].map((index) => (
        <ListItem key={index} className={classes.emailListItem}>
          <ListItemText>
            <Box className={classes.emailListItemText}>
              <Skeleton variant="text" width={150} height={32} />
              <Box className={classes.emailDetails}>
                <Box className={classes.emailDetailsText}>
                  <Skeleton variant="text" width="80%" height={32} />
                </Box>
                <Box className={classes.timeAndActions}>
                  <Skeleton variant="text" width={100} height={32} />
                </Box>
              </Box>
            </Box>
          </ListItemText>
        </ListItem>
      ))}
    </List>
  );

  return (
    <>
      {!isEmailConnected && disabled && <CalendarSkeleton />}

      {!isEmailConnected && (
        <>
          {hasEmailConfigurationConnectPermission ? (
            <Box className={classes.connectionEmailWrapper}>
              <EmailIcon />
              <Typography variant="h2" component="h6" className={classes.connectionEmailTitle}>
                {t('sales.settings.emailConfigurationsConnectYourEmail')}
              </Typography>
              <Typography variant="body2" component="p" className={classes.connectionEmailText}>
                {t('sales.settings.emailConfigurationsConnectWithYourEmail')}
              </Typography>
              <Link
                onClick={disabled ? undefined : openConnectEmail}
                target="_blank"
                href={disabled ? undefined : redirectUri}
                rel="noreferrer"
                className={classes.franchiseNameText}
                disabled={disabled}
                style={{
                  pointerEvents: disabled ? 'none' : 'auto',
                  opacity: disabled ? 0.5 : 1,
                }}
              >
                {t('sales.settings.emailConfigurationsConnectEmail')}
              </Link>
            </Box>
          ) : (
            <Box className={classes.connectionEmailWrapper}>
              <Typography variant="h6" component="h6" className={classes.connectionEmailTitle}>
                {t('sales.settings.emailConfigurationsNoPermissionToConnect')}
              </Typography>
            </Box>
          )}
        </>
      )}
      {isEmailConnected && (
        <Box className={classes.emailWrapper}>
          <Box className={classes.filterRightSide}>
            <Box className={classes.twoBtnWrapper}>
              <Box className={classes.twoBtnWrapper}>
                <CustomDropDown
                  name={'calendar'}
                  id={'calendar'}
                  key={calendars?.length}
                  placeHolder={t('sales.locations.selectCalendar')}
                  options={calendars || []}
                  selectedValues={defaultCalender || {}}
                  handleChange={handleCalenderChange}
                  className={classes.borderLessDrop}
                  customDropdownOptionsListClass={classes.dropdwonValues}
                  customDropdownSelectHeaderCusrom={classes.dropheader}
                  bordered
                />
              </Box>
              <RenderIfHasPermission name={permissionSet?.createMeetingPermission}>
                <Button onClick={toggleCreateDrawer} variant="primary" startIcon={<AddIcon />}>
                  {t('sales.locations.newMeeting')}
                </Button>
              </RenderIfHasPermission>
            </Box>
          </Box>

          <Drawer anchor={'right'} open={isDrawerOpen} onClose={toggleCreateDrawer}>
            <CreateMeetingDrawer
              anchor={'right'}
              locationCloseDrawer={toggleCreateDrawer}
              width={500}
              calendarId={defaultCalender?.id}
              fetchMeetings={() => {
                fetchCalendarEvents(defaultParams);
              }}
              contacts={contacts}
            />
          </Drawer>
          {/*This drawer is for detail*/}
          <Drawer anchor={'right'} open={detailDrawerOpen} onClose={toggleDetailDrawer}>
            <CreateMeetingDrawer
              anchor={'right'}
              locationCloseDrawer={toggleDetailDrawer}
              width={500}
              selectedMeeting={selectedEvent}
              calendarId={defaultCalender?.id}
              fetchMeetings={() => {
                fetchCalendarEvents(defaultParams);
              }}
            />
          </Drawer>

          <EventCalendar
            events={events}
            listEvents={events}
            dayViewDuties={[]}
            weekViewLocations={[]}
            setShowDrawer={() => {}}
            queryParams={queryParams}
            setQueryParams={setQueryParams}
            loading={loading}
            missedHitsCount={0}
            selectedEvent={selectedEvent}
            setSelectedEvent={setSelectedEvent}
            setOpenEditDrawer={setDetailDrawerOpen}
            deleteEvent={setShowDeleteModal}
            getEventDetails={getEventDetails}
            detailComponentLoading={detialComponentLoading}
            permissionSet={{
              updateMeetingPermission: permissionSet?.updateMeetingPermission,
              deleteMeetingPermission: permissionSet?.deleteMeetingPermission,
            }}
          />
        </Box>
      )}

      {showDeleteModal && (
        <SweetAlertModal
          type="warning" // 'success', 'error', 'warning', 'info', etc.
          title={t('commonText.modal.areYouSure.deleteMeeting')}
          text={t('commonText.modal.areYouSure.deleteMeetingDesc')}
          cancelButtonText={t('buttons.cancel')}
          confirmButtonText={t('commonText.delete')}
          show={showDeleteModal}
          handleConfirmButton={deleteCalendarEvent}
          handleCancelButton={toggleDeleteModal}
          icon={<DeleteIcon />}
        />
      )}
    </>
  );
};

MeetingsCalendar.propTypes = {
  contacts: PropTypes.object.isRequired,
  createMeetingPermission: PropTypes.object,
  permissionSet: PropTypes.object,
};

export default MeetingsCalendar;
