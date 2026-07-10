import queryString from 'query-string';
import {
  deleteHttpRequest,
  getHttpRequest,
  patchHttpRequest,
  postHttpRequest,
} from 'src/helper/axios';
import { throwAPIError } from 'src/utils/throwAPIError';

const REACT_APP_EMAILS_URL = process.env.REACT_APP_SALES;

export const getEmails = async ({ locationId, params, config = {} }) => {
  try {
    let query = queryString.stringify(params, {
      arrayFormat: 'bracket',
      skipEmptyString: true,
      skipNull: true,
    });

    return await getHttpRequest(
      `${REACT_APP_EMAILS_URL}/web/locations/${locationId}/emails?${query}`,
      config,
    );
    // const data = {
    //   statusCode: 200,
    //   data: [
    //     {
    //       id: 1,
    //       subject: 'Meeting Schedule Project Discussion',
    //       from: 'tkxel baku',
    //       date: '25 Mar 2024',
    //       time: '11:30 AM',
    //       content:
    //         'Meeting Schedule Project Discussion Meeting Schedule -Project Discussion Schedule -Project Discussion sdssdsd hedule Project Discussion Meeting Schedule -Project Discussion Schedule -Project Discussion sdssdsd',
    //     },
    //     {
    //       id: 2,
    //       subject: 'Weekly Status Update',
    //       from: 'John Smith',
    //       date: '25 Mar 2024',
    //       time: '10:00 AM',
    //       content: "Here are the updates for this week's progress on the ongoing projects.",
    //     },
    //     {
    //       id: 3,
    //       subject: 'Client Meeting Follow-up',
    //       from: 'Sarah Johnson',
    //       date: '24 Mar 2024',
    //       time: '3:45 PM',
    //       content:
    //         'Following up on our client meeting, here are the key action items we need to address.',
    //     },
    //     {
    //       id: 4,
    //       subject: 'New Feature Requirements',
    //       from: 'Tech Team',
    //       date: '24 Mar 2024',
    //       time: '2:15 PM',
    //       content: 'Attached are the detailed requirements for the new feature implementation.',
    //     },
    //     {
    //       id: 5,
    //       subject: 'Team Building Event',
    //       from: 'HR Department',
    //       date: '24 Mar 2024',
    //       time: '9:00 AM',
    //       content: 'Join us for our upcoming team building event. Details and schedule attached.',
    //     },
    //   ],
    // };
    // return data;
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getEmailConnectionStatus = async (config = {}) => {
  try {
    return await getHttpRequest(`${REACT_APP_EMAILS_URL}/web/nylas/status`, config);
  } catch (e) {
    throwAPIError(e);
  }
};

export const getEmailRegisterUrl = async () => {
  try {
    return await postHttpRequest(`${REACT_APP_EMAILS_URL}/web/nylas/register`);
  } catch (e) {
    throwAPIError(e);
  }
};

export const getEmailDetailAndThread = async (locationId, emailThreadId, config = {}) => {
  try {
    return await getHttpRequest(
      `${REACT_APP_EMAILS_URL}/web/locations/${locationId}/emails/${emailThreadId}`,
      config,
    );
  } catch (e) {
    throwAPIError(e);
  }
};

export const createEmail = async (locationId, payload, config = {}) => {
  try {
    return await postHttpRequest(
      `${REACT_APP_EMAILS_URL}/web//locations/${locationId}/emails`,
      payload,
      config,
    );
  } catch (e) {
    throwAPIError(e);
  }
};

export const threadDelete = async (locationId, emailThreadId, config = {}) => {
  try {
    return await deleteHttpRequest(
      `${REACT_APP_EMAILS_URL}/web/locations/${locationId}/threads/${emailThreadId}/delete`,
      config,
    );
  } catch (e) {
    throwAPIError(e);
  }
};

export const deleteMessage = async (locationId, threadId, messageId, config = {}) => {
  try {
    return await deleteHttpRequest(
      `${REACT_APP_EMAILS_URL}/web/locations/${locationId}/threads/${threadId}/messages/${messageId}/delete`,
      config,
    );
  } catch (e) {
    throwAPIError(e);
  }
};

export const replyMessage = async (locationId, threadId, data, config = {}) => {
  try {
    return await postHttpRequest(
      `${REACT_APP_EMAILS_URL}/web/locations/${locationId}/threads/${threadId}/reply`,
      data,
      config,
    );
  } catch (e) {
    throwAPIError(e);
  }
};

export const markAsUnread = async (locationId, threadId, config = {}) => {
  try {
    return await patchHttpRequest(
      `${REACT_APP_EMAILS_URL}/web/locations/${locationId}/threads/${threadId}/mark_read`,
      { unread: true },
      config,
    );
  } catch (e) {
    throwAPIError(e);
  }
};

export const nylasProfile = async (config = {}) => {
  try {
    return await getHttpRequest(`${REACT_APP_EMAILS_URL}/web/nylas/profile`, config);
  } catch (e) {
    throwAPIError(e);
  }
};

export const unlinkEmail = async (config = {}) => {
  try {
    return await deleteHttpRequest(`${REACT_APP_EMAILS_URL}/web/nylas/unlink`, config);
  } catch (e) {
    throwAPIError(e);
  }
};
