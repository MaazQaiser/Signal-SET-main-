import { createSlice } from '@reduxjs/toolkit';
import dayjs from 'dayjs';
import {
  emptyStateDedicated,
  emptyStatePatrol,
  emptyStatePatrolVisit,
  FormKeys,
  getDedicatedCalculations,
  getDefaultServicesData,
  getPatrolCalculations,
  repeatModes,
  serviceTypes,
  slugs,
  visitTypes,
} from 'salesComponents/contractCreation/addServices/helper';
import { getServicesApiData } from 'salesPages/contractCreation/helper';
import { PlanTypeEnums } from 'src/app/components/salesComponents/contractCreation/paymentTerms/helper';
import { convertMMDDYYYYToDayJsDate } from 'src/utils/passTime/time';

const initialState = {
  startDate: '',
  endDate: '',
  timezone: null,
  services: [],
  errorMessages: {},
};

const getDefaultOfficerType = (type) =>
  type === serviceTypes.DEDICATED
    ? {
        id: slugs.DEDICATED_OFFICER,
        name: 'Dedicated Officer',
        label: 'Dedicated Officer',
        value: slugs.DEDICATED_OFFICER,
      }
    : {
        id: slugs.PATROL_OFFICER,
        name: 'Patrol Officer',
        label: 'Patrol Officer',
        value: slugs.PATROL_OFFICER,
      };

export const contractServicesSlice = createSlice({
  name: 'contractServices',
  initialState,
  reducers: {
    setApiServicesData(
      state,
      { payload: { apiData, baseRates, lineItems, tenantInfo, productsOptions, enableOccurences } },
    ) {
      const servicesApiData = getServicesApiData(
        apiData,
        baseRates,
        lineItems,
        tenantInfo,
        productsOptions,
        enableOccurences,
      );
      state.endDate = servicesApiData?.endDate;
      state.startDate = servicesApiData?.startDate;
      state.timezone = servicesApiData?.timezone;
      state.services = servicesApiData?.services;
      state.selectedDateType = servicesApiData?.selectedDateType;
      state.renewalReminderDays = servicesApiData?.renewalReminderDays;
      state.autoRenewal = servicesApiData?.autoRenewal;
      state.type = servicesApiData?.type;
      state.actualContractDates = servicesApiData?.actualContractDates;
      state.proposalType = servicesApiData?.proposalType;
      state.errorMessages = {};
    },
    clearApiServicesData(state) {
      state.endDate = null;
      state.startDate = null;
      state.timezone = null;
      state.services = [];
      state.selectedDateType = null;
      state.name = null;
      state.renewalReminderDays = null;
      state.autoRenewal = null;
      state.type = null;
      state.actualContractDates = null;
      state.proposalType = null;
    },
    updateServiceFormData(state, { payload: { name, value } }) {
      state[name] = value;
      if ([FormKeys.START_DATE, FormKeys.END_DATE].includes(name)) {
        state.services = state.services.map((service) => ({
          ...service,
          [FormKeys.VISITS]: service[FormKeys.VISITS].map((visit) => ({
            ...visit,
            [FormKeys.DUTY_DAYS]: [],
            [FormKeys.START_TIME]: null,
            [FormKeys.END_TIME]: null,
          })),
        }));

        state['errorMessages'] = {};
      }
    },
    updateProposalDrawerData(state, { payload }) {
      // const changedDateKey =
      //   payload?.[FormKeys.SELECTED_DATE_TYPE] === FormKeys.END_DATE
      //     ? FormKeys.END_DATE
      //     : FormKeys.RENEWAL_DATE;
      const changedDate =
        payload?.[FormKeys.SELECTED_DATE_TYPE] === FormKeys.END_DATE
          ? payload.endDate
          : payload.renewalDate;
      state[FormKeys.NAME] = payload?.[FormKeys.NAME];
      state[FormKeys.TIMEZONE] = payload?.[FormKeys.TIMEZONE];
      state[FormKeys.START_DATE] = convertMMDDYYYYToDayJsDate(
        payload?.[FormKeys.START_DATE],
        false,
      );
      state[FormKeys.SELECTED_DATE_TYPE] = payload?.[FormKeys.SELECTED_DATE_TYPE];
      state[FormKeys.END_DATE] = convertMMDDYYYYToDayJsDate(changedDate, false);
      state[FormKeys.RENEWAL_DATE] = convertMMDDYYYYToDayJsDate(changedDate, false);
      state[FormKeys.AUTO_RENEWAL] = payload?.[FormKeys.AUTO_RENEWAL];
      state[FormKeys.RENEWAL_REMINDER_DAYS] = payload?.[FormKeys.RENEWAL_REMINDER_DAYS];
      state[FormKeys.PROPOSAL_TYPE] = payload?.[FormKeys.PROPOSAL_TYPE];
      if (payload.startDate || changedDate) {
        // state.services = state.services.map((service) => ({
        //   ...service,
        //   [FormKeys.VISITS]: service[FormKeys.VISITS].map((visit) => ({
        //     ...visit,
        //     [FormKeys.DUTY_DAYS]: [],
        //     [FormKeys.START_TIME]: null,
        //     [FormKeys.END_TIME]: null,
        //   })),
        // }));

        state['errorMessages'] = {};
      }
    },
    updateServiceCardData(
      state,
      {
        payload: { index, name, value, baseRates, stripeEnabled = false, contractStartDate = null },
      },
    ) {
      const updatedServices = state.services;

      if (name === FormKeys.TYPE) {
        const calculations = Object.values(PlanTypeEnums).reduce((acc, planTypeValue) => {
          acc[planTypeValue] = {
            [FormKeys.TOTAL]: 0,
            [FormKeys.ESTIMATED_PROFIT]: 0,
            [FormKeys.HOURS]: 0,
            [FormKeys.TOTAL_DUTY_DAYS]: {},
            [FormKeys.TOTAL_VISITS]: 0,
          };
          return acc;
        }, {});

        if (value === serviceTypes.DEDICATED) {
          updatedServices[index] = {
            ...emptyStateDedicated,
            [FormKeys.NAME]: updatedServices[index][FormKeys.NAME],
            [FormKeys.OFFICER_TYPE]: getDefaultOfficerType(value),
            [FormKeys.CALCULATIONS]: calculations,
            [FormKeys.SERVICE_START_DATE]: stripeEnabled ? null : dayjs(contractStartDate) || null,
          };
        } else {
          updatedServices[index] = {
            ...emptyStatePatrol,
            [FormKeys.NAME]: updatedServices[index][FormKeys.NAME],
            [FormKeys.OFFICER_TYPE]: getDefaultOfficerType(value),
            [FormKeys.CALCULATIONS]: calculations,
            [FormKeys.SERVICE_START_DATE]: stripeEnabled ? null : dayjs(contractStartDate) || null,
            [FormKeys.VISITS]: emptyStatePatrol[FormKeys.VISITS].map((visit) => ({
              ...visit,
              [FormKeys.REPEAT_MODE]: stripeEnabled
                ? repeatModes.REPEAT_AFTER
                : repeatModes.EVERY_WEEK,
            })),
          };
        }
      } else {
        updatedServices[index][name] = value;

        if (name === FormKeys.SERVICE_START_DATE) {
          updatedServices[index][FormKeys.VISITS] = updatedServices[index][FormKeys.VISITS].map(
            (visit) => ({
              ...visit,
              [FormKeys.DUTY_DAYS]: [],
            }),
          );
        }

        updatedServices[index][FormKeys.CALCULATIONS] =
          updatedServices[index][FormKeys.TYPE] === serviceTypes.DEDICATED
            ? getDedicatedCalculations({
                service: { ...updatedServices[index] },
                baseRates: { ...baseRates },
              })
            : getPatrolCalculations({
                service: { ...updatedServices[index] },
                baseRates: { ...baseRates },
              });
      }
    },
    addNewService(state, { payload }) {
      const tenantInfo = payload?.tenantInfo || null;
      state.services.push(
        getDefaultServicesData(
          state?.services?.length,
          tenantInfo,
          payload?.stripeEnabled,
          payload?.contractStartDate,
        ),
      );
    },
    deleteService(state, { payload: { deleteServiceIndex } }) {
      const services = state.services;
      state.services = services.filter((_, index) => index !== deleteServiceIndex);
    },
    updateServiceVisit(state, { payload: { name, value, visitIndex, index, baseRates } }) {
      const isTimeField = [FormKeys.START_TIME, FormKeys.END_TIME].includes(name);

      const isValidDate = !isNaN(value?.['$d']);

      const services = state?.services;
      if (!isTimeField) state.services[index][FormKeys.VISITS][visitIndex][name] = value;
      else state.services[index][FormKeys.VISITS][visitIndex][name] = isValidDate ? value : null;

      if (value === visitTypes.FIXED)
        state.services[index][FormKeys.VISITS][visitIndex][FormKeys.NUMBER_OF_VISITS] = 1;

      /**
       * set the value null for visit type random
       */
      if (value === visitTypes.RANDOM)
        state.services[index][FormKeys.VISITS][visitIndex][FormKeys.NUMBER_OF_VISITS] = '';

      let calculations = {};
      if (services[index][FormKeys.TYPE] === serviceTypes.DEDICATED) {
        calculations = getDedicatedCalculations({
          service: services[index],
          baseRates: { ...baseRates },
        });
      } else {
        calculations = getPatrolCalculations({
          service: services[index],
          baseRates: { ...baseRates },
        });
      }
      state.services[index][FormKeys.CALCULATIONS] = calculations;
    },
    addNewServiceVisit(
      state,
      {
        payload: {
          index,
          // stripeEnabled = false
        },
      },
    ) {
      const visit = {
        ...emptyStatePatrolVisit,
        [FormKeys.PRODUCTS]: [],
        // [FormKeys.REPEAT_MODE]: stripeEnabled ? repeatModes.REPEAT_AFTER : repeatModes.EVERY_WEEK,
        [FormKeys.REPEAT_MODE]: repeatModes.EVERY_WEEK,
      };
      state.services[index][FormKeys.VISITS].push(visit);
    },
    deleteServiceVisit(state, { payload: { index, deleteVisitIndex, baseRates } }) {
      const service = state.services[index];
      service[FormKeys.VISITS] = service[FormKeys.VISITS].filter(
        (_, index) => index !== deleteVisitIndex,
      );

      /**
       * recalculate the service price
       */
      const services = state?.services;
      const svc = services[index];
      state.services[index][FormKeys.CALCULATIONS] =
        svc[FormKeys.TYPE] === serviceTypes.DEDICATED
          ? getDedicatedCalculations({
              service: svc,
              baseRates: { ...baseRates },
            })
          : getPatrolCalculations({
              service: svc,
              baseRates: { ...baseRates },
            });
    },
    setContractErrorMessages(state, { payload }) {
      state.errorMessages = payload;
    },
    removeContractErrorKey(state, { payload }) {
      const { [payload]: _, ...rest } = state.errorMessages;
      state.errorMessages = rest;
    },
    removeContractErrorKeysByPrefix(state, { payload: prefix }) {
      const updated = {};
      for (const key in state.errorMessages) {
        if (!key.startsWith(prefix)) {
          updated[key] = state.errorMessages[key];
        }
      }
      state.errorMessages = updated;
    },
    // this will remove all the errors from index which service is deleted
    // it will reset the object indexes as well
    deleteErrorMessageAtIndex: (state, { payload: indexToDelete }) => {
      const updatedErrorMessages = {};
      for (const key in state.errorMessages) {
        if (Object.prototype.hasOwnProperty.call(state.errorMessages, key)) {
          const [_prefix, currentIndex, ..._rest] = key.split(',');
          const currentServiceIndex = parseInt(currentIndex, 10);

          // Copy all error messages except the ones matching indexToDelete
          if (currentServiceIndex !== indexToDelete) {
            updatedErrorMessages[key] = state.errorMessages[key];
          }
        }
      }
      state.errorMessages = updatedErrorMessages;
    },
    syncServicesFormData(state, { payload: { formData } }) {
      if (!formData) return;

      const services = formData.services;

      if (formData.timezone) state.timezone = formData.timezone;
      if (formData.startDate !== undefined) state.startDate = formData.startDate;
      if (formData.endDate !== undefined) state.endDate = formData.endDate;
      if (formData.name) state.name = formData.name;
      if (Array.isArray(services) && services.length > 0) {
        state.services = services;
      }
      state.errorMessages = {};
    },
  },
});

export const {
  setApiServicesData,
  updateServiceCardData,
  addNewService,
  updateServiceFormData,
  updateProposalDrawerData,
  updateServiceVisit,
  addNewServiceVisit,
  deleteServiceVisit,
  setContractErrorMessages,
  removeContractErrorKey,
  removeContractErrorKeysByPrefix,
  deleteService,
  deleteErrorMessageAtIndex,
  clearApiServicesData,
  syncServicesFormData,
} = contractServicesSlice.actions;

export default contractServicesSlice.reducer;
