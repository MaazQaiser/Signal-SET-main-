import queryString from 'query-string';
import {
  deleteHttpRequest,
  getHttpRequest,
  patchHttpRequest,
  postHttpRequest,
} from 'src/helper/axios';
import { throwAPIError } from 'src/utils/throwAPIError';

const REACT_APP_MEETINGS_URL = process.env.REACT_APP_SALES;

export const getMeetings = async ({ locationId, calendarId, params, config = {} }) => {
  try {
    const query = queryString.stringify(params, {
      arrayFormat: 'bracket',
      skipEmptyString: true,
      skipNull: true,
    });

    return await getHttpRequest(
      `${REACT_APP_MEETINGS_URL}/web/locations/${locationId}/calendars/${calendarId}/events?${query}`,
      config,
    );
    // const data = {
    //   statusCode: 200,
    //   data: {
    //     events: [
    //       {
    //         id: 1,
    //         title: 'hi',
    //         start: `${new Date().toISOString().split('T')[0]}T10:00:00`,
    //         date: `${new Date().toISOString().split('T')[0]}T10:00:00`,
    //         time: `${new Date().toISOString().split('T')[0]}T12:45:00`,
    //         meetingLink: 'https://zoom.us/6sdihfu8weyrt',
    //         meetingDescription: '<h1> Hello People </h1>', //"<p>ff</p>\n"
    //         guests: [{ name: 'usama', email: 'a@a.c' }],
    //       },
    //       {
    //         id: 2,
    //         title: 'hello',
    //         start: `${new Date().toISOString().split('T')[0]}T12:00:00`,
    //       },
    //       {
    //         id: 3,
    //         title: 'There',
    //         start: `${new Date().toISOString().split('T')[0]}T14:00:00`,
    //       },
    //       {
    //         id: 4,
    //         title: 'Wassup',
    //         start: `${new Date().toISOString().split('T')[0]}T16:00:00`,
    //       },
    //     ],
    //   },
    // };
    // return data;
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getCalenders = async (config = {}) => {
  try {
    return await getHttpRequest(`${REACT_APP_MEETINGS_URL}/shared/config/calendars`, config);
  } catch (e) {
    throwAPIError(e);
  }
};

export const getEvent = async ({ locationId, calendarId, eventId, config = {} }) => {
  try {
    return await getHttpRequest(
      `${REACT_APP_MEETINGS_URL}/web/locations/${locationId}/calendars/${calendarId}/events/${eventId}`,
      config,
    );
  } catch (e) {
    throwAPIError(e);
  }
};

export const createEvent = async ({ locationId, calendarId, data, config = {} }) => {
  try {
    return await postHttpRequest(
      `${REACT_APP_MEETINGS_URL}/web/locations/${locationId}/calendars/${calendarId}/events`,
      data,
      config,
    );
  } catch (e) {
    throwAPIError(e);
  }
};

export const updateEvent = async ({ locationId, calendarId, eventId, data, config = {} }) => {
  try {
    return await patchHttpRequest(
      `${REACT_APP_MEETINGS_URL}/web/locations/${locationId}/calendars/${calendarId}/events/${eventId}`,
      data,
      config,
    );
  } catch (e) {
    throwAPIError(e);
  }
};

export const deleteEvent = async ({ locationId, calendarId, eventId, config = {} }) => {
  try {
    return await deleteHttpRequest(
      `${REACT_APP_MEETINGS_URL}/web/locations/${locationId}/calendars/${calendarId}/events/${eventId}`,
      config,
    );
  } catch (e) {
    throwAPIError(e);
  }
};
