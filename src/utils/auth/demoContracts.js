import { stageStatus } from 'src/utils/constants';

const STORAGE_KEY = 'demo_deal_contracts';

const CONTRACT_STEPS = [
  {
    name: 'Services',
    value: 'services',
    status: stageStatus.CURRENT,
    subtext: 'Add services of this proposal',
  },
  {
    name: 'Devices',
    value: 'devices',
    status: stageStatus.PENDING,
    subtext: 'Choose devices for checkpoints',
  },
  {
    name: 'On Demand',
    value: 'onDemandServices',
    status: stageStatus.PENDING,
    subtext: 'Add services of this proposal',
  },
  {
    name: 'Payment Terms',
    value: 'paymentTerms',
    status: stageStatus.PENDING,
    subtext: 'Set payment preferences',
  },
  {
    name: 'Description',
    value: 'descriptions',
    status: stageStatus.PENDING,
    subtext: 'Terms & conditions for proposals',
  },
  {
    name: 'Configuration',
    value: 'signees',
    status: stageStatus.PENDING,
    subtext: 'Add/choose signees for contract',
  },
];

const STEP_VALUE_MAP = {
  service: 'services',
  demandServices: 'onDemandServices',
  description: 'descriptions',
  configuration: 'signees',
};

const readAll = () => {
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
};

const writeAll = (contracts) => {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(contracts));
  } catch {
    // ignore quota / private mode errors in local dev
  }
};

export const buildDemoProfitability = (services = []) => {
  if (!Array.isArray(services) || services.length === 0) {
    return null;
  }

  const total = services.length;
  const inProfit = services.filter((service) => {
    const hourlyRate = Number(service?.hourlyRate);
    const pricePerHit = Number(service?.pricePerHit ?? service?.price_per_hit);
    return hourlyRate > 0 || pricePerHit > 0;
  }).length;

  const ratio = inProfit / total;
  const color = ratio >= 1 ? '#4caf50' : ratio > 0 ? '#ff9800' : '#f44336';

  return { inProfit, total, color };
};

export const normalizeContractForClient = (contract, { persistDemoData = false } = {}) => {
  if (!contract) {
    return null;
  }

  const normalized = { ...contract };

  delete normalized.servicePlans;

  if (persistDemoData) {
    if (Array.isArray(normalized._demoFormServices) && normalized._demoFormServices.length > 0) {
      normalized.services = normalized._demoFormServices;
    } else if (!Array.isArray(normalized.services)) {
      normalized.services = [];
    }

    if (Array.isArray(normalized._demoFormDevices) && normalized._demoFormDevices.length > 0) {
      normalized.devices = normalized._demoFormDevices;
    } else if (!Array.isArray(normalized.devices)) {
      normalized.devices = [];
    }

    if (normalized._demoDescriptionsForm) {
      normalized.descriptions = normalized._demoDescriptionsForm;
    } else if (!normalized.descriptions) {
      normalized.descriptions = {};
    }

    if (Array.isArray(normalized._demoSigneesForm) && normalized._demoSigneesForm.length > 0) {
      normalized.signees = normalized._demoSigneesForm;
    } else if (!Array.isArray(normalized.signees)) {
      normalized.signees = [];
    }
  } else {
    // The services wizard always seeds tenant defaults; persisted API rows are not form-ready.
    normalized.services = [];
  }

  if (!Array.isArray(normalized.onDemandServices)) {
    normalized.onDemandServices = [];
  }

  if (normalized.descriptions == null && normalized.description) {
    normalized.descriptions = normalized.description;
  }

  if (!Array.isArray(normalized.signees) && Array.isArray(normalized.configuration)) {
    normalized.signees = normalized.configuration;
  }

  if (Array.isArray(normalized.steps)) {
    normalized.steps = normalized.steps.map((step) => ({
      ...step,
      value: STEP_VALUE_MAP[step.value] || step.value,
    }));
  } else {
    normalized.steps = CONTRACT_STEPS;
  }

  normalized.details = {
    stripeEnabled: false,
    isEditable: true,
    isPublishable: false,
    isPublished: false,
    ...normalized.details,
  };

  if (!normalized.profitability) {
    const servicesForProfitability = normalized._demoFormServices || normalized.services || [];
    normalized.profitability = buildDemoProfitability(servicesForProfitability);
  }

  return normalized;
};

export const buildNewContractMock = (payload = {}) => ({
  details: {
    name: payload.name || 'New Proposal',
    amount: 0,
    createdAt: new Date().toISOString(),
    createdBy: 'Demo User',
    assignees: [],
    isEditable: true,
    isPublishable: false,
    isPublished: false,
    startDate: payload.startDate || null,
    endDate: payload.endDate || null,
    timezone: payload.timezone || null,
    selectedDateType: payload.selectedDateType || 'renewalDate',
    renewalReminderDays: payload.renewalReminderDays ?? 10,
    autoRenewal: payload.autoRenewal ?? false,
    areDatesToBeDecided: payload.areDatesToBeDecided ?? false,
    proposalType: payload.proposalType || 'default',
    stripeEnabled: false,
    plan: null,
  },
  services: [],
  devices: [],
  paymentTerms: null,
  onDemandServices: [],
  descriptions: {},
  signees: [],
  steps: CONTRACT_STEPS,
});

export const getDemoContract = (dealId) => {
  if (!dealId) {
    return null;
  }
  const contract = readAll()[String(dealId)] || null;
  return contract ? normalizeContractForClient(contract, { persistDemoData: true }) : null;
};

export const saveDemoContract = (dealId, contract) => {
  if (!dealId || !contract) {
    return;
  }
  const contracts = readAll();
  contracts[String(dealId)] = contract;
  writeAll(contracts);
};

export const hasDemoContract = (dealId) => !!readAll()[String(dealId)];

export const removeDemoContract = (dealId) => {
  if (!dealId) {
    return;
  }
  const contracts = readAll();
  delete contracts[String(dealId)];
  writeAll(contracts);
};
