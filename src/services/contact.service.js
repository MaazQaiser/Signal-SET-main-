import { deleteHttpRequest, getHttpRequest, postHttpRequest, putHttpRequest } from 'helper/axios';
import queryString from 'query-string';
import { throwAPIError } from 'src/utils/throwAPIError';

const REACT_APP_BASE_URL = process.env.REACT_APP_SALES;

export const getContacts = async (params, config = {}) => {
  try {
    // return contactData.listing;
    let query = queryString.stringify(params, {
      arrayFormat: 'bracket',
      skipEmptyString: true,
      skipNull: true,
    });
    return await getHttpRequest(`${REACT_APP_BASE_URL}/web/contacts?${query}`, config);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getContactDetail = async (id, config = {}) => {
  try {
    return await getHttpRequest(`${REACT_APP_BASE_URL}/web/contacts/${id}`, config);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const checkIfContactExists = async (payload) => {
  try {
    return await postHttpRequest(`${REACT_APP_BASE_URL}/web/contacts/valid_email`, payload);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const createContact = async (payload) => {
  try {
    return await postHttpRequest(`${REACT_APP_BASE_URL}/web/contacts`, payload);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const updateContact = async (id, payload) => {
  try {
    return await putHttpRequest(`${REACT_APP_BASE_URL}/web/contacts/${id}`, payload);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getYearlyStats = async () => {
  try {
    // return contactData.yearlyStats;
    return await getHttpRequest(`${REACT_APP_BASE_URL}/web/contacts/yearly_stats`);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getCumulativeStats = async () => {
  try {
    // return contactData.cumulativeStats;
    return await getHttpRequest(`${REACT_APP_BASE_URL}/web/contacts/cumulative_stats`);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getPaymentTermOptions = async () => {
  try {
    // return contactData.paymentTermsOptions;
    return await getHttpRequest(`${REACT_APP_BASE_URL}/shared/config/payment_terms_options`);
  } catch (e) {
    return {
      statusCode: 200,
      message: 'success',
      data: {
        dueBufferDays: [
          { id: 1, title: 'Due on Receipt' },
          { id: 2, title: '7 Days after Invoice' },
          { id: 3, title: '15 Days after Invoice' },
          { id: 4, title: '30 Days after Invoice' },
        ],
        paymentMethods: [
          { id: 1, title: 'Bank Transfer' },
          { id: 2, title: 'Cash' },
          { id: 3, title: 'Card' },
        ],
        billingTypes: [
          { key: 0, title: 'Recurring' },
          { key: 1, title: 'Per Service' },
        ],
        contractTypes: [
          { key: 1, title: 'Monthly' },
          { key: 2, title: 'Annual' },
        ],
        billingFrequencies: [
          { key: 1, title: 'Monthly' },
          { key: 2, title: 'Quarterly' },
          { key: 3, title: 'Annually' },
        ],
      },
    };
  }
};

export const getContactActivities = async (id) => {
  try {
    if (!id) {
      throw new Error();
    }
    // return companiesData.activities;
    return await getHttpRequest(`${REACT_APP_BASE_URL}/shared/contacts/${id}/engagements`);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getContactNotes = async (id) => {
  try {
    if (!id) {
      throw new Error();
    }
    // return companiesData.companyNotes;
    return await getHttpRequest(`${REACT_APP_BASE_URL}/web/notes/Contact/${id}`);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const deleteContactNote = async (id) => {
  try {
    if (!id) {
      throw new Error();
    }
    // return companiesData.deleteCompanyNote;
    return await deleteHttpRequest(`${REACT_APP_BASE_URL}/web/notes/${id}`);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const createContactNote = async (id, data) => {
  try {
    if (!id) {
      throw new Error();
    }
    return await postHttpRequest(`${REACT_APP_BASE_URL}/web/notes/Contact/${id}`, data);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const updateContactNote = async (noteId, data) => {
  try {
    if (!noteId) {
      throw new Error();
    }
    return await putHttpRequest(`${REACT_APP_BASE_URL}/web/notes/${noteId}`, data);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getContactOptions = async (query, config = {}) => {
  try {
    const queryParams = queryString.stringify(query, {
      arrayFormat: 'bracket',
      skipEmptyString: true,
      skipNull: true,
    });
    return await getHttpRequest(
      `${REACT_APP_BASE_URL}/shared/config/contact_options?${queryParams}`,
      config,
    );
  } catch (e) {
    return throwAPIError(e);
  }
};
