const DEDICATED_PROBE_ORDER = ['name', 'hourlyRate', 'lineItem', 'officerType'];
const PATROL_PROBE_ORDER = [
  'name',
  'visitsPerWeek',
  'pricePerHit',
  'timeOnProperty',
  'visitType',
  'lineItem',
  'officerType',
];

const FIELD_TO_NODE = {
  name: 'service_name',
  hourlyRate: 'dedicated_hourly_rate',
  lineItem: 'line_item',
  officerType: 'officer_type',
  visitsPerWeek: 'patrol_visits_per_week',
  pricePerHit: 'patrol_price_per_hit',
  timeOnProperty: 'patrol_time_on_property',
  visitType: 'patrol_visit_type',
};

export const isProbeFieldMissing = (service, field) => {
  if (!service) return false;

  switch (field) {
    case 'name':
      return !service.nameConfirmed;
    case 'hourlyRate':
      return service.hourlyRate == null;
    case 'lineItem':
      return !service.lineItem;
    case 'officerType':
      return !service.officerType;
    case 'visitsPerWeek':
      return service.visitsPerWeek == null;
    case 'pricePerHit':
      return service.pricePerHit == null;
    case 'timeOnProperty':
      return service.timeOnProperty == null;
    case 'visitType':
      return !service.visitType;
    default:
      return false;
  }
};

export const getProbeOrderForService = (service) =>
  service?.serviceType === 'patrol' ? PATROL_PROBE_ORDER : DEDICATED_PROBE_ORDER;

export const getNextProbeNodeId = (service) => {
  const order = getProbeOrderForService(service);
  const missingField = order.find((field) => isProbeFieldMissing(service, field));
  if (!missingField) return 'schedule_preference';
  return FIELD_TO_NODE[missingField];
};

export const getServiceLabel = (service, context) => {
  if (service?.name) return service.name;
  const item = context?.serviceQueue?.[context.queueIndex];
  const typeLabel = service?.serviceType === 'patrol' ? 'Patrol' : 'Dedicated';
  const index = (item?.planIndex ?? context?.queueIndex ?? 0) + 1;
  return `${typeLabel} ${index}`;
};

export const buildServiceNameChoicePresets = (service = {}) => {
  const isPatrolService = service?.serviceType === 'patrol';
  const suggested = service?.queueLabel || service?.name;

  if (isPatrolService) {
    const presets = [
      { label: 'Patrol Service', value: 'Patrol Service', recommended: true },
      { label: 'Roving Patrol', value: 'Roving Patrol' },
      {
        label: suggested && suggested !== 'Patrol Service' ? suggested : 'Vehicle Patrol',
        value: suggested && suggested !== 'Patrol Service' ? suggested : 'Vehicle Patrol',
      },
    ];
    return presets;
  }

  return [
    { label: 'Dedicated Security Service', value: 'Dedicated Security Service', recommended: true },
    { label: 'On-Site Dedicated Coverage', value: 'On-Site Dedicated Coverage' },
    {
      label:
        suggested && suggested !== 'Dedicated Security Service' ? suggested : 'Dedicated Service',
      value:
        suggested && suggested !== 'Dedicated Security Service' ? suggested : 'Dedicated Service',
    },
  ];
};
