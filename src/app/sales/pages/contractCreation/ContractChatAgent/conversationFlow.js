import { ActiveStepsKeys } from '../helper.js';
import { buildChoiceOptions, parseCustomDutyDays } from './choiceHelpers.js';
import {
  ANNUAL_RATE_INCREASE_PRESETS,
  buildCycleRefDatePresets,
  HOLIDAY_MULTIPLIER_PRESETS,
  isValidCycleRefDate,
  resolveCycleRefDateChoice,
  TAX_RATE_PRESETS,
} from './paymentChatHelpers.js';
import {
  buildServiceQueue,
  formatPlanSummaryMessage,
  getServiceIntroMessage,
  initializeServicesFromParsed,
} from './planHelpers.js';
import {
  buildServiceNameChoicePresets,
  getNextProbeNodeId,
  getProbeOrderForService,
  getServiceLabel,
  isProbeFieldMissing,
} from './probeHelpers.js';
import {
  applyScheduleToService,
  parseSchedulePreference,
  SCHEDULE_PRESETS,
} from './scheduleParser.js';
import { parseServicesFromText } from './serviceParser.js';
import { parseChatTimeInput } from './timeParser.js';

export const STOP_AFTER_STEP = ActiveStepsKeys.SIGNEES;

export const STEP_ORDER = [
  ActiveStepsKeys.SERVICES,
  ActiveStepsKeys.DEVICES,
  ActiveStepsKeys.ON_DEMAND_SERVICES,
  ActiveStepsKeys.PAYMENT_TERMS,
  ActiveStepsKeys.DESCRIPTIONS,
  ActiveStepsKeys.SIGNEES,
];

export const STEP_LABELS = {
  [ActiveStepsKeys.SERVICES]: 'Add Service',
  [ActiveStepsKeys.DEVICES]: 'Devices',
  [ActiveStepsKeys.ON_DEMAND_SERVICES]: 'On Demand Services',
  [ActiveStepsKeys.PAYMENT_TERMS]: 'Payment Terms',
  [ActiveStepsKeys.DESCRIPTIONS]: 'Description',
  [ActiveStepsKeys.SIGNEES]: 'Signees',
};

export const STEP_COMPLETE = 'STEP_COMPLETE';

const PLAN_OPTIONS = [
  { label: 'Weekly', value: '2' },
  { label: 'Bi-Weekly', value: '1' },
  { label: 'Monthly', value: '0' },
];

const DISPATCH_OPTIONS = [
  { label: 'Flat Rate', value: 'flat_rate' },
  { label: 'Charge Per Alarm', value: 'charge_per_alarm' },
  { label: 'Non-Billable', value: 'non_billable' },
];

const PAYMENT_METHOD_OPTIONS = [
  { label: 'Check', value: '1' },
  { label: 'ACH / Bank Transfer', value: '2' },
  { label: 'Credit Card', value: '3' },
];

const PAYMENT_DATE_OPTIONS = [
  { label: 'Due on receipt', value: '0' },
  { label: 'Net 15', value: '15' },
  { label: 'Net 30', value: '30' },
];

const BILLING_TYPE_OPTIONS = [
  { label: 'Recurring', value: '1' },
  { label: 'Per service completion', value: '2' },
];

const CONTRACT_TYPE_OPTIONS = [
  { label: 'Standard', value: '1' },
  { label: 'Master agreement', value: '2' },
];

const BILLING_ADDRESS_OPTIONS = [
  { label: 'Same as company', value: 'company' },
  { label: 'Same as property', value: 'property' },
  { label: 'Other address', value: 'other' },
];

export const getInitialContext = () => ({
  plan: { patrol: 0, dedicated: 0, parsed: null },
  parsedPlan: null,
  serviceQueue: [],
  queueIndex: 0,
  currentServiceIndex: 0,
  currentSigneeIndex: 0,
  currentDeviceIndex: 0,
  deviceList: [],
  lineItems: [],
  holidayGroups: [],
  lastSchedule: null,
});

export const getInitialCollected = () => ({
  services: [],
  devices: [],
  paymentTerms: {},
  onDemandServices: { customServices: [] },
  descriptions: {},
  signees: [],
});

const getCurrentService = (collected, context) =>
  collected.services[context.currentServiceIndex] || {};

const getQueueService = (context) => context.serviceQueue?.[context.queueIndex] || {};

const isPatrol = (collected, context) => {
  const fromQueue = getQueueService(context)?.serviceType;
  if (fromQueue) return fromQueue === 'patrol';
  return getCurrentService(collected, context).serviceType === 'patrol';
};

const stepCompleteId = (step) => `${STEP_COMPLETE}:${step}`;

export const matchesCreateProposalIntent = (text) => {
  const normalized = String(text || '')
    .toLowerCase()
    .trim();
  return /create\s+(a\s+)?proposal/.test(normalized) || normalized === 'proposal';
};

export const resolveChoiceOptions = (node, collected, context) => {
  if (!node?.choiceOptions) return null;
  if (typeof node.choiceOptions === 'function') {
    return node.choiceOptions(collected, context);
  }
  return node.choiceOptions;
};

const unwrapChoiceAnswer = (answer) => {
  if (answer && typeof answer === 'object' && answer.isCustom) {
    return answer.value;
  }
  return answer;
};

const ensureServiceSlot = (collected, context) => {
  const services = [...(collected.services || [])];
  const queueItem = getQueueService(context);
  const index = context.queueIndex;

  services[index] = {
    ...(services[index] || {}),
    serviceType: queueItem?.serviceType || services[index]?.serviceType,
  };

  return services;
};

const advanceServiceQueue = (collected, context) => {
  context.queueIndex += 1;
  if (context.queueIndex < context.serviceQueue.length) {
    context.currentServiceIndex = context.queueIndex;
    return 'probe_dispatcher';
  }
  return stepCompleteId(ActiveStepsKeys.SERVICES);
};

const applyParsedPlanFromText = (text, collected, context) => {
  const parsed = parseServicesFromText(text);
  if (!parsed.hasAny) return null;
  initializeServicesFromParsed(parsed, context, collected);
  return parsed;
};

export const FLOW_NODES = {
  awaiting_intent: {
    id: 'awaiting_intent',
    step: null,
    message: 'Hi! I can help you build this proposal quickly.',
    inputType: 'intent',
    required: true,
    next: () => 'describe_services',
  },

  describe_services: {
    id: 'describe_services',
    step: ActiveStepsKeys.SERVICES,
    message:
      'Share your service requirements and add service details to get started with the proposal.',
    inputType: 'text',
    multiline: true,
    required: true,
    next: (answer, collected, context) => {
      const parsed = applyParsedPlanFromText(answer, collected, context);
      if (!parsed) return 'describe_services_retry';
      return 'confirm_plan';
    },
  },

  describe_services_retry: {
    id: 'describe_services_retry',
    step: ActiveStepsKeys.SERVICES,
    message:
      'I could not detect any services from that message.\n\ne.g. "2 officers at 120 hrs/week dedicated, 4 officers at 40 hrs/week, and 3 patrol visits per week"\n\nTry describing your services again.',
    inputType: 'text',
    multiline: true,
    required: true,
    next: (answer, collected, context) => {
      const parsed = applyParsedPlanFromText(answer, collected, context);
      if (!parsed) return 'describe_services_retry';
      return 'confirm_plan';
    },
  },

  confirm_plan: {
    id: 'confirm_plan',
    step: ActiveStepsKeys.SERVICES,
    message: (collected, context) => formatPlanSummaryMessage(context.plan),
    inputType: 'choice',
    choiceOptions: buildChoiceOptions(
      [
        { label: 'Yes, continue', value: 'yes', recommended: true },
        { label: 'No, let me re-describe', value: 'redescribe' },
      ],
      {
        customLabel: 'Correct it (type changes)',
        customPlaceholder: 'Describe corrections to your service plan',
        customInputType: 'text',
      },
    ),
    required: true,
    next: (answer, collected, context) => {
      const value = unwrapChoiceAnswer(answer);
      if (value === 'yes') return 'probe_dispatcher';
      if (value === 'redescribe') return 'describe_services';
      const parsed = applyParsedPlanFromText(value, collected, context);
      if (!parsed) return 'describe_services_retry';
      return 'confirm_plan';
    },
  },

  probe_dispatcher: {
    id: 'probe_dispatcher',
    step: ActiveStepsKeys.SERVICES,
    message: (collected, context) => {
      const service = collected.services?.[context.queueIndex];
      if (service) {
        const filledAny = getProbeOrderForService(service).some(
          (field) => !isProbeFieldMissing(service, field),
        );
        if (filledAny) return '';
      }
      return getServiceIntroMessage(context);
    },
    inputType: 'none',
    next: (answer, collected, context) => {
      context.currentServiceIndex = context.queueIndex;
      collected.services = ensureServiceSlot(collected, context);
      return getNextProbeNodeId(collected.services[context.queueIndex]);
    },
  },

  schedule_preference: {
    id: 'schedule_preference',
    step: ActiveStepsKeys.SERVICES,
    field: 'schedulePreference',
    scope: 'schedule',
    message: (collected, context) => {
      const service = collected.services[context.currentServiceIndex];
      const label = getServiceLabel(service, context);
      return `Do you have any job day and time preference for ${label}? (optional)\n(e.g. Mon–Fri 9 AM–5 PM)`;
    },
    inputType: 'choice',
    choiceOptions: (collected, context) => {
      const hasPreviousSchedule =
        context.lastSchedule && !context.lastSchedule.skipped && context.queueIndex > 0;

      if (hasPreviousSchedule) {
        return buildChoiceOptions(
          [
            { label: 'Skip / no preference', value: 'skip', recommended: true },
            {
              label: `Same as previous (${context.lastSchedule.label || 'previous schedule'})`,
              value: 'same_as_previous',
            },
            {
              label: SCHEDULE_PRESETS.WEEKDAY_BUSINESS.label,
              value: SCHEDULE_PRESETS.WEEKDAY_BUSINESS.label,
            },
          ],
          {
            customLabel: 'Type your preference',
            customPlaceholder: 'e.g. Mon–Fri 9 AM – 5 PM',
          },
        );
      }

      return buildChoiceOptions(
        [
          { label: 'Skip / no preference', value: 'skip', recommended: true },
          {
            label: SCHEDULE_PRESETS.WEEKDAY_BUSINESS.label,
            value: SCHEDULE_PRESETS.WEEKDAY_BUSINESS.label,
          },
          { label: SCHEDULE_PRESETS.OVERNIGHT.label, value: SCHEDULE_PRESETS.OVERNIGHT.label },
        ],
        {
          customLabel: 'Type your preference',
          customPlaceholder: 'e.g. Mon–Fri 9 AM – 5 PM',
        },
      );
    },
    required: false,
    next: (answer, collected, context) => advanceServiceQueue(collected, context),
  },

  plan_patrol_count: {
    id: 'plan_patrol_count',
    step: ActiveStepsKeys.SERVICES,
    field: 'patrol',
    scope: 'plan',
    message: 'How many Patrol services should this proposal include?',
    inputType: 'choice',
    choiceOptions: buildChoiceOptions(
      [
        { label: '1 Patrol service', value: 1, recommended: true },
        { label: '2 Patrol services', value: 2 },
        { label: 'No Patrol services', value: 0 },
      ],
      {
        customLabel: 'Other count (type below)',
        customPlaceholder: 'Enter number of patrol services',
        customInputType: 'number',
      },
    ),
    required: true,
    next: () => 'plan_dedicated_count',
  },

  plan_dedicated_count: {
    id: 'plan_dedicated_count',
    step: ActiveStepsKeys.SERVICES,
    field: 'dedicated',
    scope: 'plan',
    message: 'How many Dedicated services should this proposal include?',
    inputType: 'choice',
    choiceOptions: buildChoiceOptions(
      [
        { label: '2 Dedicated services', value: 2, recommended: true },
        { label: '1 Dedicated service', value: 1 },
        { label: 'No Dedicated services', value: 0 },
      ],
      {
        customLabel: 'Other count (type below)',
        customPlaceholder: 'Enter number of dedicated services',
        customInputType: 'number',
      },
    ),
    required: true,
    next: (answer, collected, context) => {
      context.serviceQueue = buildServiceQueue(context.plan);
      context.queueIndex = 0;
      context.currentServiceIndex = 0;
      collected.services = context.serviceQueue.map((item) => ({ serviceType: item.serviceType }));
      return 'plan_summary';
    },
  },

  plan_summary: {
    id: 'plan_summary',
    step: ActiveStepsKeys.SERVICES,
    message: (collected, context) => formatPlanSummaryMessage(context.plan),
    inputType: 'plan_summary',
    next: () => 'service_intro',
  },

  service_intro: {
    id: 'service_intro',
    step: ActiveStepsKeys.SERVICES,
    message: (collected, context) => getServiceIntroMessage(context),
    inputType: 'none',
    next: (answer, collected, context) => {
      context.currentServiceIndex = context.queueIndex;
      collected.services = ensureServiceSlot(collected, context);
      return 'probe_dispatcher';
    },
  },

  service_name: {
    id: 'service_name',
    step: ActiveStepsKeys.SERVICES,
    field: 'name',
    scope: 'service',
    message: (collected, context) => {
      const service = collected.services?.[context.currentServiceIndex];
      const typeLabel = service?.serviceType === 'patrol' ? 'patrol' : 'dedicated';
      return `What name should we use for this ${typeLabel} service?`;
    },
    inputType: 'choice',
    choiceOptions: (collected, context) => {
      const service = collected.services?.[context.currentServiceIndex] || {};
      return buildChoiceOptions(buildServiceNameChoicePresets(service), {
        customLabel: 'Type a custom name',
        customPlaceholder: 'Enter service name',
      });
    },
    required: true,
    next: () => 'probe_dispatcher',
  },

  line_item: {
    id: 'line_item',
    step: ActiveStepsKeys.SERVICES,
    field: 'lineItem',
    scope: 'service',
    message: 'What line item should we use for this service?\n\ni.e. Roving Patrol, Alarm Response',
    inputType: 'text',
    required: true,
    next: () => 'probe_dispatcher',
  },

  officer_type: {
    id: 'officer_type',
    step: ActiveStepsKeys.SERVICES,
    field: 'officerType',
    scope: 'service',
    message: 'Which officer type should be assigned?',
    inputType: 'choice',
    choiceOptions: (collected, context) => {
      const patrol = isPatrol(collected, context);
      return buildChoiceOptions(
        patrol
          ? [
              { label: 'Patrol Officer', value: 'patrol_officer', recommended: true },
              { label: 'Armed Officer', value: 'armed_officer' },
              { label: 'Dedicated Officer', value: 'dedicated_officer' },
            ]
          : [
              { label: 'Dedicated Officer', value: 'dedicated_officer', recommended: true },
              { label: 'Armed Officer', value: 'armed_officer' },
              { label: 'Patrol Officer', value: 'patrol_officer' },
            ],
        {
          customLabel: 'Other officer type (type below)',
          customPlaceholder: 'armed_officer, patrol_officer, or dedicated_officer',
        },
      );
    },
    required: true,
    next: () => 'probe_dispatcher',
  },

  patrol_price_per_hit: {
    id: 'patrol_price_per_hit',
    step: ActiveStepsKeys.SERVICES,
    field: 'pricePerHit',
    scope: 'service',
    message: 'What is the price per visit (hit)?',
    inputType: 'choice',
    choiceOptions: buildChoiceOptions(
      [
        { label: '$25 per hit', value: 25, recommended: true },
        { label: '$30 per hit', value: 30 },
        { label: '$35 per hit', value: 35 },
      ],
      {
        customLabel: 'Custom price (type below)',
        customPlaceholder: 'Enter price per hit',
        customInputType: 'number',
      },
    ),
    required: true,
    next: () => 'probe_dispatcher',
  },

  patrol_time_on_property: {
    id: 'patrol_time_on_property',
    step: ActiveStepsKeys.SERVICES,
    field: 'timeOnProperty',
    scope: 'service',
    message: 'How many minutes on property per visit?',
    inputType: 'choice',
    choiceOptions: buildChoiceOptions(
      [
        { label: '15 minutes', value: 15, recommended: true },
        { label: '30 minutes', value: 30 },
        { label: '45 minutes', value: 45 },
      ],
      {
        customLabel: 'Custom duration (type below)',
        customPlaceholder: 'Enter minutes on property',
        customInputType: 'number',
      },
    ),
    required: true,
    next: () => 'probe_dispatcher',
  },

  patrol_visits_per_week: {
    id: 'patrol_visits_per_week',
    step: ActiveStepsKeys.SERVICES,
    field: 'visitsPerWeek',
    scope: 'service',
    message: (collected, context) => {
      const service = collected.services[context.currentServiceIndex];
      const label = getServiceLabel(service, context);
      return `How many visits per week for ${label}?`;
    },
    inputType: 'choice',
    choiceOptions: buildChoiceOptions(
      [
        { label: '2 visits', value: 2, recommended: true },
        { label: '3 visits', value: 3 },
        { label: '4 visits', value: 4 },
      ],
      {
        customLabel: 'Custom count (type below)',
        customPlaceholder: 'Enter visits per week',
        customInputType: 'number',
      },
    ),
    required: true,
    next: () => 'probe_dispatcher',
  },

  patrol_visit_type: {
    id: 'patrol_visit_type',
    step: ActiveStepsKeys.SERVICES,
    field: 'visitType',
    scope: 'service',
    message: 'Should visits be Fixed or Random?',
    inputType: 'choice',
    choiceOptions: buildChoiceOptions(
      [
        { label: 'Random visits', value: 'random', recommended: true },
        { label: 'Fixed visits', value: 'fixed' },
        { label: 'Random with check-ins', value: 'random' },
      ],
      {
        customLabel: 'Custom (type fixed or random)',
        customPlaceholder: 'fixed or random',
      },
    ),
    required: true,
    next: () => 'probe_dispatcher',
  },

  dedicated_req_officers: {
    id: 'dedicated_req_officers',
    step: ActiveStepsKeys.SERVICES,
    field: 'reqOfficers',
    scope: 'service',
    message: 'How many officers are required?',
    inputType: 'choice',
    choiceOptions: buildChoiceOptions(
      [
        { label: '1 officer', value: 1, recommended: true },
        { label: '2 officers', value: 2 },
        { label: '3 officers', value: 3 },
      ],
      {
        customLabel: 'Custom count (type below)',
        customPlaceholder: 'Enter number of officers',
        customInputType: 'number',
      },
    ),
    required: true,
    next: () => 'dedicated_hourly_rate',
  },

  dedicated_hourly_rate: {
    id: 'dedicated_hourly_rate',
    step: ActiveStepsKeys.SERVICES,
    field: 'hourlyRate',
    scope: 'service',
    message: (collected, context) => {
      const service = collected.services[context.currentServiceIndex];
      const label = getServiceLabel(service, context);
      return `What hourly rate for ${label}?`;
    },
    inputType: 'choice',
    choiceOptions: buildChoiceOptions(
      [
        { label: '$22 / hour', value: 22, recommended: true },
        { label: '$25 / hour', value: 25 },
        { label: '$28 / hour', value: 28 },
      ],
      {
        customLabel: 'Custom rate (type below)',
        customPlaceholder: 'Enter hourly rate',
        customInputType: 'number',
      },
    ),
    required: true,
    next: () => 'probe_dispatcher',
  },

  duty_days: {
    id: 'duty_days',
    step: ActiveStepsKeys.SERVICES,
    field: 'dutyDays',
    scope: 'service',
    message: 'Which days should this service run?',
    inputType: 'choice',
    choiceOptions: buildChoiceOptions(
      [
        { label: 'Monday – Friday', value: [1, 2, 3, 4, 5], recommended: true },
        { label: 'Monday – Saturday', value: [1, 2, 3, 4, 5, 6] },
        { label: 'Every day', value: [0, 1, 2, 3, 4, 5, 6] },
      ],
      {
        customLabel: 'Custom days (type below)',
        customPlaceholder: 'e.g. Mon, Wed, Fri',
        customInputType: 'days',
      },
    ),
    required: true,
    next: () => 'start_time',
  },

  start_time: {
    id: 'start_time',
    step: ActiveStepsKeys.SERVICES,
    field: 'startTime',
    scope: 'service',
    message: 'What is the start time?',
    inputType: 'choice',
    choiceOptions: buildChoiceOptions(
      [
        { label: '9:00 AM', value: '9:00 AM', recommended: true },
        { label: '6:00 PM', value: '6:00 PM' },
        { label: '8:00 AM', value: '8:00 AM' },
      ],
      {
        customLabel: 'Custom time (type below)',
        customPlaceholder: 'e.g. 9:00 AM',
        customInputType: 'time',
      },
    ),
    required: true,
    next: () => 'end_time',
  },

  end_time: {
    id: 'end_time',
    step: ActiveStepsKeys.SERVICES,
    field: 'endTime',
    scope: 'service',
    message: 'What is the end time?',
    inputType: 'choice',
    choiceOptions: buildChoiceOptions(
      [
        { label: '5:00 PM', value: '5:00 PM', recommended: true },
        { label: '6:00 AM', value: '6:00 AM' },
        { label: '10:00 PM', value: '10:00 PM' },
      ],
      {
        customLabel: 'Custom time (type below)',
        customPlaceholder: 'e.g. 5:00 PM',
        customInputType: 'time',
      },
    ),
    required: true,
    next: () => 'include_vehicle',
  },

  include_vehicle: {
    id: 'include_vehicle',
    step: ActiveStepsKeys.SERVICES,
    field: 'includeVehicle',
    scope: 'service',
    message: 'Should a vehicle be included?',
    inputType: 'choice',
    choiceOptions: buildChoiceOptions(
      [
        { label: 'No vehicle', value: 'no', recommended: true },
        { label: 'Yes — 1 vehicle', value: 'yes' },
        { label: 'Yes — 2 vehicles', value: 'yes_two' },
      ],
      {
        customLabel: 'Custom (type yes or no)',
        customPlaceholder: 'yes or no',
      },
    ),
    required: true,
    next: (answer, collected, context) => {
      const value = unwrapChoiceAnswer(answer);
      if (value === 'yes' || value === 'yes_two') {
        const services = [...collected.services];
        services[context.currentServiceIndex] = {
          ...services[context.currentServiceIndex],
          includeVehicle: 'yes',
          noOfVehicles: value === 'yes_two' ? 2 : 1,
        };
        collected.services = services;
        return 'vehicle_rate';
      }
      return 'instructions';
    },
  },

  vehicle_rate: {
    id: 'vehicle_rate',
    step: ActiveStepsKeys.SERVICES,
    field: 'vehicleRate',
    scope: 'service',
    message: 'What is the vehicle rate per hour?',
    inputType: 'choice',
    choiceOptions: buildChoiceOptions(
      [
        { label: '$15 / hour', value: 15, recommended: true },
        { label: '$18 / hour', value: 18 },
        { label: '$20 / hour', value: 20 },
      ],
      {
        customLabel: 'Custom rate (type below)',
        customPlaceholder: 'Enter vehicle rate',
        customInputType: 'number',
      },
    ),
    required: true,
    next: () => 'instructions',
  },

  instructions: {
    id: 'instructions',
    step: ActiveStepsKeys.SERVICES,
    field: 'instructions',
    scope: 'service',
    message: 'Any special instructions for this service?',
    inputType: 'choice',
    choiceOptions: buildChoiceOptions(
      [
        { label: 'No special instructions', value: '', recommended: true },
        {
          label: 'Standard patrol checklist',
          value: 'Follow standard patrol route and check all entry points.',
        },
        {
          label: 'Access control focus',
          value: 'Prioritize access control points and visitor logs.',
        },
      ],
      {
        customLabel: 'Custom instructions (type below)',
        customPlaceholder: 'Enter special instructions',
      },
    ),
    required: false,
    next: (answer, collected, context) => advanceServiceQueue(collected, context),
  },

  devices_intro: {
    id: 'devices_intro',
    step: ActiveStepsKeys.DEVICES,
    message:
      'Devices are pre-filled from your franchise defaults (quantity 0). Adjust them on the Devices tab if needed.',
    inputType: 'none',
    skippable: true,
    next: (answer, collected, context) => {
      if (context.deviceList?.length) {
        collected.devices = context.deviceList.map((device) => ({
          obxId: device.obxId,
          name: device.name,
          slug: device.slug,
          quantity: 0,
          price: device.price ?? 0,
          image: device.image,
        }));
      }
      return stepCompleteId(ActiveStepsKeys.DEVICES);
    },
  },

  device_quantity: {
    id: 'device_quantity',
    step: ActiveStepsKeys.DEVICES,
    field: 'quantity',
    scope: 'device',
    message: (collected, context) => {
      const device = context.deviceList[context.currentDeviceIndex];
      return `How many "${device?.name || 'device'}" do you need?`;
    },
    inputType: 'number',
    required: false,
    next: (answer, collected, context) => {
      const nextIndex = context.currentDeviceIndex + 1;
      if (nextIndex < context.deviceList.length) {
        context.currentDeviceIndex = nextIndex;
        return 'device_quantity';
      }
      return stepCompleteId(ActiveStepsKeys.DEVICES);
    },
  },

  dispatch_option: {
    id: 'dispatch_option',
    step: ActiveStepsKeys.ON_DEMAND_SERVICES,
    field: 'dispatchOption',
    scope: 'onDemand',
    message: 'How should Dispatch Request be billed?',
    inputType: 'select',
    options: DISPATCH_OPTIONS,
    required: true,
    next: (answer) => {
      if (answer === 'flat_rate') return 'dispatch_rate';
      if (answer === 'charge_per_alarm') return 'dispatch_price';
      return 'add_custom_service';
    },
  },

  on_demand_intro: {
    id: 'on_demand_intro',
    step: ActiveStepsKeys.ON_DEMAND_SERVICES,
    message:
      'On-demand services are optional. Dispatch billing can be set on the form — skip this step or add a custom service.',
    inputType: 'choice',
    choiceOptions: buildChoiceOptions(
      [
        { label: 'Skip on-demand setup', value: 'skip', recommended: true },
        { label: 'Add a custom on-demand service', value: 'add' },
      ],
      {
        customLabel: 'Other (type below)',
        customPlaceholder: 'skip or add',
      },
    ),
    required: true,
    next: (answer) => {
      const value = unwrapChoiceAnswer(answer);
      if (value === 'add') return 'custom_service_title';
      return stepCompleteId(ActiveStepsKeys.ON_DEMAND_SERVICES);
    },
  },

  dispatch_rate: {
    id: 'dispatch_rate',
    step: ActiveStepsKeys.ON_DEMAND_SERVICES,
    field: 'dispatchRate',
    scope: 'onDemand',
    message: 'What is the flat dispatch rate?',
    inputType: 'number',
    required: true,
    next: () => 'add_custom_service',
  },

  dispatch_price: {
    id: 'dispatch_price',
    step: ActiveStepsKeys.ON_DEMAND_SERVICES,
    field: 'price',
    scope: 'onDemand',
    message: 'What is the price per alarm?',
    inputType: 'number',
    required: true,
    next: () => 'peak_hours_price',
  },

  peak_hours_price: {
    id: 'peak_hours_price',
    step: ActiveStepsKeys.ON_DEMAND_SERVICES,
    field: 'peakHoursPrice',
    scope: 'onDemand',
    message: 'What is the peak hours price?',
    inputType: 'number',
    required: true,
    next: () => 'add_custom_service',
  },

  add_custom_service: {
    id: 'add_custom_service',
    step: ActiveStepsKeys.ON_DEMAND_SERVICES,
    message: 'Would you like to add another custom on-demand service?',
    inputType: 'choice',
    choiceOptions: buildChoiceOptions(
      [
        { label: 'No, continue', value: 'no', recommended: true },
        { label: 'Yes, add another', value: 'yes' },
      ],
      {
        customLabel: 'Other (type yes or no)',
        customPlaceholder: 'yes or no',
      },
    ),
    required: true,
    next: (answer) => {
      const value = unwrapChoiceAnswer(answer);
      return value === 'yes'
        ? 'custom_service_title'
        : stepCompleteId(ActiveStepsKeys.ON_DEMAND_SERVICES);
    },
  },

  custom_service_title: {
    id: 'custom_service_title',
    step: ActiveStepsKeys.ON_DEMAND_SERVICES,
    field: 'title',
    scope: 'customService',
    message: 'What is the custom service title?',
    inputType: 'choice',
    choiceOptions: buildChoiceOptions(
      [
        { label: 'Emergency Response', value: 'Emergency Response', recommended: true },
        { label: 'Lockout Service', value: 'Lockout Service' },
        { label: 'Alarm Response', value: 'Alarm Response' },
      ],
      {
        customLabel: 'Custom title (type below)',
        customPlaceholder: 'Enter service title',
      },
    ),
    required: true,
    next: () => 'custom_service_price',
  },

  custom_service_price: {
    id: 'custom_service_price',
    step: ActiveStepsKeys.ON_DEMAND_SERVICES,
    field: 'price',
    scope: 'customService',
    message: 'What is the price?',
    inputType: 'choice',
    choiceOptions: buildChoiceOptions(
      [
        { label: '$50', value: 50, recommended: true },
        { label: '$75', value: 75 },
        { label: '$100', value: 100 },
      ],
      {
        customLabel: 'Custom price (type below)',
        customPlaceholder: 'Enter price',
        customInputType: 'number',
      },
    ),
    required: true,
    next: () => 'custom_service_quantity',
  },

  custom_service_quantity: {
    id: 'custom_service_quantity',
    step: ActiveStepsKeys.ON_DEMAND_SERVICES,
    field: 'quantity',
    scope: 'customService',
    message: 'What is the quantity?',
    inputType: 'choice',
    choiceOptions: buildChoiceOptions(
      [
        { label: '1', value: 1, recommended: true },
        { label: '2', value: 2 },
        { label: '5', value: 5 },
      ],
      {
        customLabel: 'Custom quantity (type below)',
        customPlaceholder: 'Enter quantity',
        customInputType: 'number',
      },
    ),
    required: true,
    next: () => 'add_custom_service',
  },

  payment_plan: {
    id: 'payment_plan',
    step: ActiveStepsKeys.PAYMENT_TERMS,
    field: 'plan',
    scope: 'paymentTerms',
    message: 'What billing plan should be used?',
    inputType: 'choice',
    choiceOptions: buildChoiceOptions(
      PLAN_OPTIONS.map((o) => ({ ...o, recommended: o.value === '2' })),
    ),
    required: true,
    next: () => 'payment_tax_rate',
  },

  payment_tax_rate: {
    id: 'payment_tax_rate',
    step: ActiveStepsKeys.PAYMENT_TERMS,
    field: 'taxRate',
    scope: 'paymentTerms',
    message: 'What is the tax rate (%)?',
    inputType: 'choice',
    choiceOptions: buildChoiceOptions(TAX_RATE_PRESETS, {
      customLabel: 'Custom tax rate (type below)',
      customPlaceholder: 'Enter tax rate %',
      customInputType: 'number',
    }),
    required: true,
    next: () => 'payment_holiday_multiplier',
  },

  payment_holiday_multiplier: {
    id: 'payment_holiday_multiplier',
    step: ActiveStepsKeys.PAYMENT_TERMS,
    field: 'holidayMultiplier',
    scope: 'paymentTerms',
    message: 'What is the holiday rate multiplier?',
    inputType: 'choice',
    choiceOptions: buildChoiceOptions(HOLIDAY_MULTIPLIER_PRESETS, {
      customLabel: 'Custom multiplier (type below)',
      customPlaceholder: 'e.g. 1.5 or skip',
      customInputType: 'number',
    }),
    required: false,
    next: () => 'payment_cycle_ref_date',
  },

  payment_holiday_group: {
    id: 'payment_holiday_group',
    step: ActiveStepsKeys.PAYMENT_TERMS,
    field: 'holidayGroup',
    scope: 'paymentTerms',
    message: 'What holiday group should be used? (type the exact group name)',
    inputType: 'text',
    required: false,
    next: () => 'payment_cycle_ref_date',
  },

  payment_cycle_ref_date: {
    id: 'payment_cycle_ref_date',
    step: ActiveStepsKeys.PAYMENT_TERMS,
    field: 'cycleRefDate',
    scope: 'paymentTerms',
    message: 'What is the cycle reference date?',
    inputType: 'choice',
    choiceOptions: (collected, context) =>
      buildChoiceOptions(buildCycleRefDatePresets(context), {
        customLabel: 'Custom date (type below)',
        customPlaceholder: 'MM/DD/YYYY',
      }),
    required: true,
    next: () => 'payment_due_terms',
  },

  payment_due_terms: {
    id: 'payment_due_terms',
    step: ActiveStepsKeys.PAYMENT_TERMS,
    field: 'paymentDate',
    scope: 'paymentTerms',
    message: 'What are the payment terms (due buffer)?',
    inputType: 'choice',
    choiceOptions: buildChoiceOptions(
      PAYMENT_DATE_OPTIONS.map((o) => ({ ...o, recommended: o.value === '30' })),
    ),
    required: true,
    next: () => 'payment_method',
  },

  payment_method: {
    id: 'payment_method',
    step: ActiveStepsKeys.PAYMENT_TERMS,
    field: 'paymentMethod',
    scope: 'paymentTerms',
    message: 'What is the payment method?',
    inputType: 'choice',
    choiceOptions: buildChoiceOptions(
      PAYMENT_METHOD_OPTIONS.map((o) => ({ ...o, recommended: o.value === '1' })),
    ),
    required: true,
    next: () => 'annual_rate_increase',
  },

  annual_rate_increase: {
    id: 'annual_rate_increase',
    step: ActiveStepsKeys.PAYMENT_TERMS,
    field: 'annualRateIncrease',
    scope: 'paymentTerms',
    message: 'What is the annual rate increase (%)?',
    inputType: 'choice',
    choiceOptions: buildChoiceOptions(ANNUAL_RATE_INCREASE_PRESETS, {
      customLabel: 'Custom rate (type below)',
      customPlaceholder: 'Enter annual increase %',
      customInputType: 'number',
    }),
    required: true,
    next: () => 'billing_type',
  },

  billing_type: {
    id: 'billing_type',
    step: ActiveStepsKeys.PAYMENT_TERMS,
    field: 'billingType',
    scope: 'paymentTerms',
    message: 'What is the billing type?',
    inputType: 'choice',
    choiceOptions: buildChoiceOptions(
      BILLING_TYPE_OPTIONS.map((o) => ({ ...o, recommended: o.value === '1' })),
    ),
    required: true,
    next: () => 'contract_type',
  },

  contract_type: {
    id: 'contract_type',
    step: ActiveStepsKeys.PAYMENT_TERMS,
    field: 'contractType',
    scope: 'paymentTerms',
    message: 'What is the contract type?',
    inputType: 'choice',
    choiceOptions: buildChoiceOptions(
      CONTRACT_TYPE_OPTIONS.map((o) => ({ ...o, recommended: o.value === '1' })),
    ),
    required: true,
    next: () => stepCompleteId(ActiveStepsKeys.PAYMENT_TERMS),
  },

  billing_address_option: {
    id: 'billing_address_option',
    step: ActiveStepsKeys.PAYMENT_TERMS,
    field: 'billingAddressOption',
    scope: 'paymentTerms',
    message: 'Which billing address should be used?',
    inputType: 'choice',
    choiceOptions: (collected, context) =>
      buildChoiceOptions(
        BILLING_ADDRESS_OPTIONS.map((o) => ({
          ...o,
          recommended: context.billingContact ? o.value === 'property' : o.value === 'company',
        })),
      ),
    required: true,
    next: (answer) => {
      const value = unwrapChoiceAnswer(answer);
      return value === 'other' ? 'billing_address' : stepCompleteId(ActiveStepsKeys.PAYMENT_TERMS);
    },
  },

  billing_address: {
    id: 'billing_address',
    step: ActiveStepsKeys.PAYMENT_TERMS,
    field: 'address',
    scope: 'paymentTerms',
    message: 'Street address?',
    inputType: 'choice',
    choiceOptions: buildChoiceOptions(
      [
        { label: '123 Main Street', value: '123 Main Street', recommended: true },
        { label: '456 Oak Avenue', value: '456 Oak Avenue' },
        { label: '789 Commerce Blvd', value: '789 Commerce Blvd' },
      ],
      {
        customLabel: 'Custom address (type below)',
        customPlaceholder: 'Enter street address',
      },
    ),
    required: true,
    next: () => 'billing_city',
  },

  billing_city: {
    id: 'billing_city',
    step: ActiveStepsKeys.PAYMENT_TERMS,
    field: 'city',
    scope: 'paymentTerms',
    message: 'City?',
    inputType: 'choice',
    choiceOptions: buildChoiceOptions(
      [
        { label: 'New York', value: 'New York', recommended: true },
        { label: 'Los Angeles', value: 'Los Angeles' },
        { label: 'Chicago', value: 'Chicago' },
      ],
      {
        customLabel: 'Custom city (type below)',
        customPlaceholder: 'Enter city',
      },
    ),
    required: true,
    next: () => 'billing_state',
  },

  billing_state: {
    id: 'billing_state',
    step: ActiveStepsKeys.PAYMENT_TERMS,
    field: 'state',
    scope: 'paymentTerms',
    message: 'State?',
    inputType: 'choice',
    choiceOptions: buildChoiceOptions(
      [
        { label: 'NY', value: 'NY', recommended: true },
        { label: 'CA', value: 'CA' },
        { label: 'TX', value: 'TX' },
      ],
      {
        customLabel: 'Custom state (type below)',
        customPlaceholder: 'Enter state',
      },
    ),
    required: true,
    next: () => 'billing_zip',
  },

  billing_zip: {
    id: 'billing_zip',
    step: ActiveStepsKeys.PAYMENT_TERMS,
    field: 'postalCode',
    scope: 'paymentTerms',
    message: 'Postal / ZIP code?',
    inputType: 'choice',
    choiceOptions: buildChoiceOptions(
      [
        { label: '10001', value: '10001', recommended: true },
        { label: '90210', value: '90210' },
        { label: '60601', value: '60601' },
      ],
      {
        customLabel: 'Custom ZIP (type below)',
        customPlaceholder: 'Enter postal code',
      },
    ),
    required: true,
    next: () => stepCompleteId(ActiveStepsKeys.PAYMENT_TERMS),
  },

  description_intro: {
    id: 'description_intro',
    step: ActiveStepsKeys.DESCRIPTIONS,
    message:
      'Terms & conditions are pre-filled from your proposal template. Review them on the Description tab.',
    inputType: 'none',
    skippable: true,
    next: () => stepCompleteId(ActiveStepsKeys.DESCRIPTIONS),
  },

  configuration_intro: {
    id: 'configuration_intro',
    step: ActiveStepsKeys.SIGNEES,
    message: (collected, context) => {
      const repName = context.currentUser?.name || 'You';
      return `${repName} is added as Signee 1 (Sales Rep). Who should be Signee 2?`;
    },
    inputType: 'none',
    next: (answer, collected, context) => {
      const user = context.currentUser || {};
      collected.signees = [
        {
          name: user.name || 'Demo User',
          title: 'Sales Rep',
          email: user.email || '',
        },
      ];
      context.currentSigneeIndex = 1;
      return 'signee_two_name';
    },
  },

  signee_two_name: {
    id: 'signee_two_name',
    step: ActiveStepsKeys.SIGNEES,
    field: 'name',
    scope: 'signee',
    message: 'Signee 2 — what is their full name?',
    inputType: 'text',
    required: true,
    next: () => 'signee_two_title',
  },

  signee_two_title: {
    id: 'signee_two_title',
    step: ActiveStepsKeys.SIGNEES,
    field: 'title',
    scope: 'signee',
    message: 'Signee 2 — what is their title?',
    inputType: 'text',
    required: true,
    next: () => 'signee_two_email',
  },

  signee_two_email: {
    id: 'signee_two_email',
    step: ActiveStepsKeys.SIGNEES,
    field: 'email',
    scope: 'signee',
    message: 'Signee 2 — what is their email?',
    inputType: 'text',
    required: true,
    next: () => stepCompleteId(ActiveStepsKeys.SIGNEES),
  },

  all_done: {
    id: 'all_done',
    step: null,
    message:
      'All steps are complete! Your contract data has been saved. Review the stepper on the right.',
    inputType: 'none',
    next: () => null,
  },
};

const STEP_START_NODES = {
  [ActiveStepsKeys.SERVICES]: 'describe_services',
  [ActiveStepsKeys.DEVICES]: 'devices_intro',
  [ActiveStepsKeys.ON_DEMAND_SERVICES]: 'on_demand_intro',
  [ActiveStepsKeys.PAYMENT_TERMS]: 'payment_plan',
  [ActiveStepsKeys.DESCRIPTIONS]: 'description_intro',
  [ActiveStepsKeys.SIGNEES]: 'configuration_intro',
};

export const getNode = (id) => FLOW_NODES[id] || null;

export const getInitialNodeId = () => 'awaiting_intent';

export const getStepStartNode = (stepKey) => STEP_START_NODES[stepKey] || null;

export const getNextStepKey = (currentStep) => {
  if (currentStep === STOP_AFTER_STEP) return null;
  const index = STEP_ORDER.indexOf(currentStep);
  if (index === -1 || index >= STEP_ORDER.length - 1) return null;
  return STEP_ORDER[index + 1];
};

export const isStepCompleteNode = (nodeId) =>
  typeof nodeId === 'string' && nodeId.startsWith(`${STEP_COMPLETE}:`);

export const getCompletedStepFromNodeId = (nodeId) =>
  nodeId?.replace(`${STEP_COMPLETE}:`, '') || null;

export const resolveMessage = (node, collected, context) => {
  const { message } = node;
  if (typeof message === 'function') return message(collected, context);
  return message;
};

export const parseAnswer = (node, rawValue) => {
  if (node.inputType === 'choice') {
    if (rawValue?.isCustom) {
      const customType = resolveChoiceOptions(node, {}, {})?.custom?.inputType || 'text';
      const rawCustomValue = String(rawValue.value ?? '').trim();

      if (customType === 'number') {
        const num = Number(rawCustomValue);
        return {
          isCustom: true,
          value: Number.isNaN(num) ? null : num,
          displayValue: rawCustomValue,
        };
      }

      if (customType === 'days') {
        return {
          isCustom: true,
          value: parseCustomDutyDays(rawCustomValue),
          displayValue: rawCustomValue,
        };
      }

      if (customType === 'time') {
        return {
          isCustom: true,
          value: rawCustomValue,
          displayValue: rawCustomValue,
        };
      }

      return {
        isCustom: true,
        value: rawCustomValue,
        displayValue: rawCustomValue,
      };
    }

    return rawValue?.value ?? rawValue;
  }

  if (node.inputType === 'intent') {
    return String(rawValue || '').trim();
  }

  if (node.inputType === 'number') {
    if (rawValue === '' || rawValue == null) return null;
    const num = Number(rawValue);
    return Number.isNaN(num) ? null : num;
  }
  if (node.inputType === 'multiselect') {
    return Array.isArray(rawValue) ? rawValue : [];
  }
  if (node.inputType === 'select') {
    return rawValue;
  }
  if (node.inputType === 'text' || node.inputType === 'time') {
    const trimmed = String(rawValue || '').trim();
    if (!node.required && trimmed.toLowerCase() === 'skip') return '';
    return trimmed;
  }
  return rawValue;
};

export const validateAnswer = (node, answer, context = {}) => {
  if (node.inputType === 'none' || node.inputType === 'plan_summary') return null;

  if (node.inputType === 'intent') {
    if (!matchesCreateProposalIntent(answer)) {
      return 'Type "create a proposal" to start building your plan.';
    }
    return null;
  }

  if (node.inputType === 'choice') {
    if (answer && typeof answer === 'object' && answer.isCustom) {
      const customType = resolveChoiceOptions(node, {}, context)?.custom?.inputType || 'text';

      if (!String(answer.displayValue ?? answer.value ?? '').trim()) {
        return 'Please enter a custom answer or pick A, B, or C.';
      }

      if (customType === 'number' && (answer.value == null || Number.isNaN(answer.value))) {
        return 'Please enter a valid number.';
      }

      if (customType === 'days' && (!Array.isArray(answer.value) || answer.value.length === 0)) {
        return 'Please enter valid days (e.g. Mon, Wed, Fri).';
      }

      if (customType === 'time' && answer.value && !parseChatTimeInput(answer.value)) {
        return 'Please enter a valid time (e.g. 9:00 AM).';
      }
    } else if (node.required && (answer === null || answer === undefined || answer === '')) {
      return 'Please pick an option.';
    }

    if (node.id === 'plan_dedicated_count') {
      const patrolCount = context.plan?.patrol || 0;
      const dedicatedCount = unwrapChoiceAnswer(answer) || 0;
      if (patrolCount + dedicatedCount <= 0) {
        return 'Your plan needs at least one Patrol or Dedicated service.';
      }
    }

    return null;
  }

  if (node.inputType === 'multiselect') {
    if (node.required && (!answer || answer.length === 0)) {
      return 'Please select at least one option.';
    }
    return null;
  }

  if (node.required) {
    if (answer === null || answer === undefined || answer === '') {
      return 'This field is required.';
    }
  }

  if (node.inputType === 'number' && node.required && (answer === null || Number.isNaN(answer))) {
    return 'Please enter a valid number.';
  }

  if (node.field === 'cycleRefDate') {
    if (answer && typeof answer === 'object' && answer.isCustom) {
      if (!isValidCycleRefDate(answer.value)) {
        return 'Please enter a valid date (MM/DD/YYYY).';
      }
    }
  }

  if (node.inputType === 'time' && answer) {
    if (!parseChatTimeInput(answer)) {
      return 'Please enter a valid time (e.g. 9:00 AM or 17:00).';
    }
  }

  return null;
};

export const applyAnswerToCollected = (node, answer, collected, context) => {
  const updated = { ...collected };
  const resolvedAnswer = unwrapChoiceAnswer(answer);

  if (node.scope === 'plan') {
    context.plan = {
      ...(context.plan || {}),
      [node.field]: resolvedAnswer,
    };
    return updated;
  }

  if (node.scope === 'service') {
    const services = [...updated.services];
    const idx = context.currentServiceIndex;
    let value = resolvedAnswer;

    if (node.field === 'includeVehicle' && value === 'yes_two') {
      value = 'yes';
    }

    if (node.field === 'officerType' && typeof value === 'string') {
      value = value.toLowerCase().replace(/\s+/g, '_');
    }

    if (node.field === 'visitType' && typeof value === 'string') {
      value = value.toLowerCase().includes('fix') ? 'fixed' : 'random';
    }

    if (node.field === 'includeVehicle' && typeof value === 'string') {
      const normalized = value.toLowerCase();
      if (normalized.startsWith('y')) value = 'yes';
      if (normalized.startsWith('n')) value = 'no';
    }

    if (node.field === 'name') {
      services[idx] = {
        ...(services[idx] || {}),
        name: value,
        queueLabel: value,
        nameConfirmed: true,
      };
      updated.services = services;
      return updated;
    }

    if (node.field === 'visitsPerWeek') {
      services[idx] = {
        ...(services[idx] || {}),
        visitsPerWeek: value,
        ...(!services[idx]?.nameConfirmed && value != null
          ? {
              name: `Patrol — ${value} visits/wk`,
              queueLabel: `Patrol — ${value} visits/wk`,
            }
          : {}),
      };
      updated.services = services;
      return updated;
    }

    services[idx] = { ...(services[idx] || {}), [node.field]: value };
    updated.services = services;
  } else if (node.scope === 'schedule') {
    const services = [...updated.services];
    const idx = context.currentServiceIndex;
    const schedule = parseSchedulePreference(resolvedAnswer);
    const updatedService = applyScheduleToService(
      services[idx] || {},
      schedule,
      context.lastSchedule,
    );
    services[idx] = updatedService;

    if (!schedule.skipped && !schedule.sameAsPrevious) {
      context.lastSchedule = {
        dutyDays: updatedService.dutyDays,
        startTime: updatedService.startTime,
        endTime: updatedService.endTime,
        label:
          resolvedAnswer === SCHEDULE_PRESETS.WEEKDAY_BUSINESS.label
            ? SCHEDULE_PRESETS.WEEKDAY_BUSINESS.label
            : resolvedAnswer === SCHEDULE_PRESETS.OVERNIGHT.label
              ? SCHEDULE_PRESETS.OVERNIGHT.label
              : String(resolvedAnswer),
      };
    } else if (schedule.sameAsPrevious && context.lastSchedule) {
      context.lastSchedule = { ...context.lastSchedule };
    }

    updated.services = services;
  } else if (node.scope === 'device') {
    const devices = [...updated.devices];
    const deviceMeta = context.deviceList[context.currentDeviceIndex];
    devices[context.currentDeviceIndex] = {
      ...(devices[context.currentDeviceIndex] || {
        obxId: deviceMeta?.obxId,
        name: deviceMeta?.name,
        slug: deviceMeta?.slug,
        price: deviceMeta?.price,
        image: deviceMeta?.image,
      }),
      [node.field]: answer ?? 0,
    };
    updated.devices = devices;
  } else if (node.scope === 'paymentTerms') {
    let value = resolvedAnswer;
    if (node.field === 'cycleRefDate') {
      value = resolveCycleRefDateChoice(resolvedAnswer, context);
    }
    if (
      node.field === 'holidayMultiplier' &&
      (value == null || String(value).trim().toLowerCase() === 'skip')
    ) {
      value = null;
    }
    updated.paymentTerms = { ...updated.paymentTerms, [node.field]: value };
  } else if (node.scope === 'onDemand') {
    updated.onDemandServices = { ...updated.onDemandServices, [node.field]: answer };
  } else if (node.scope === 'customService') {
    const customServices = [...(updated.onDemandServices.customServices || [])];
    const lastIndex = customServices.length - 1;
    if (node.field === 'title' && (lastIndex < 0 || customServices[lastIndex]?.title)) {
      customServices.push({ [node.field]: answer });
    } else if (lastIndex >= 0) {
      customServices[lastIndex] = { ...customServices[lastIndex], [node.field]: answer };
    } else {
      customServices.push({ [node.field]: answer });
    }
    updated.onDemandServices = { ...updated.onDemandServices, customServices };
  } else if (node.scope === 'descriptions') {
    updated.descriptions = { ...updated.descriptions, [node.field]: answer };
  } else if (node.scope === 'signee') {
    const signees = [...updated.signees];
    const idx = context.currentSigneeIndex;
    signees[idx] = { ...(signees[idx] || {}), [node.field]: answer };
    updated.signees = signees;
  }

  return updated;
};

export const getStepConfirmationMessage = (stepKey) => {
  const labels = {
    [ActiveStepsKeys.SERVICES]: 'Services saved! Review the Services tab on the right.',
    [ActiveStepsKeys.DEVICES]: 'Devices saved!',
    [ActiveStepsKeys.ON_DEMAND_SERVICES]: 'On demand services saved!',
    [ActiveStepsKeys.PAYMENT_TERMS]: 'Payment terms saved!',
    [ActiveStepsKeys.DESCRIPTIONS]: 'Description saved!',
    [ActiveStepsKeys.SIGNEES]: 'Configuration saved! Your proposal is ready.',
  };
  return labels[stepKey] || 'Step saved!';
};
