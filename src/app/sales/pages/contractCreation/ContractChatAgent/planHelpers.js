import { buildCollectedServiceFromSpec, formatOfficerTypeLabel } from './serviceParser.js';

export const buildServiceQueueFromParsed = (parsed = {}) => {
  const queue = [];
  const { dedicated = [], patrol = [] } = parsed;

  dedicated.forEach((spec, index) => {
    queue.push({
      serviceType: 'dedicated',
      planIndex: index,
      planTotal: dedicated.length,
      ...spec,
    });
  });

  patrol.forEach((spec, index) => {
    queue.push({
      serviceType: 'patrol',
      planIndex: index,
      planTotal: patrol.length,
      ...spec,
    });
  });

  return queue;
};

export const buildServiceQueue = (plan = {}) => {
  if (plan?.parsed) {
    return buildServiceQueueFromParsed(plan.parsed);
  }

  const queue = [];

  for (let index = 0; index < (plan.patrol || 0); index += 1) {
    queue.push({
      serviceType: 'patrol',
      planIndex: index,
      planTotal: plan.patrol,
    });
  }

  for (let index = 0; index < (plan.dedicated || 0); index += 1) {
    queue.push({
      serviceType: 'dedicated',
      planIndex: index,
      planTotal: plan.dedicated,
    });
  }

  return queue;
};

export const formatDedicatedSpecLabel = (spec, index) => {
  const officers = spec.reqOfficers ?? '?';
  const hours = spec.officerServiceHrsWeek ?? '?';
  const officerLabel = spec.officerType ? formatOfficerTypeLabel(spec.officerType) : 'officers';
  return `Dedicated ${index + 1}: ${officers} ${officerLabel} · ${hours} hrs/week`;
};

export const formatPatrolSpecLabel = (spec, index) => {
  const visits = spec.visitsPerWeek ?? spec.numberOfVisits;
  const officerLabel = spec.officerType ? formatOfficerTypeLabel(spec.officerType) : null;
  if (visits != null) {
    const officerPart = officerLabel ? ` · ${officerLabel}` : '';
    const countPart = spec.reqOfficers ? ` (${spec.reqOfficers} officers)` : '';
    return `Patrol ${index + 1}: ${visits} visits/wk${countPart}${officerPart}`;
  }
  return `Patrol ${index + 1}: visits/week (details needed)`;
};

export const formatParsedPlanDetails = (parsed = {}) => {
  const lines = [];

  (parsed.dedicated || []).forEach((spec, index) => {
    lines.push(formatDedicatedSpecLabel(spec, index));
  });

  (parsed.patrol || []).forEach((spec, index) => {
    lines.push(formatPatrolSpecLabel(spec, index));
  });

  return lines;
};

export const formatPlanSummary = (plan = {}) => {
  const dedicatedCount = plan.dedicated ?? plan.parsed?.dedicated?.length ?? 0;
  const patrolCount = plan.patrol ?? plan.parsed?.patrol?.length ?? 0;
  const parts = [];

  if (dedicatedCount > 0) {
    parts.push(`${dedicatedCount} Dedicated service${dedicatedCount > 1 ? 's' : ''}`);
  }

  if (patrolCount > 0) {
    parts.push(`${patrolCount} Patrol service${patrolCount > 1 ? 's' : ''}`);
  }

  return parts.join(' · ') || 'No services selected';
};

export const formatPlanSummaryMessage = (plan = {}) => {
  const summary = formatPlanSummary(plan);
  const details = formatParsedPlanDetails(plan.parsed || {});

  if (!details.length) {
    return `Here's what I understood:\n${summary}\n\nDoes this look right?`;
  }

  return `Here's what I understood:\n\n${details.join('\n')}\n\nDoes this look right?`;
};

export const getPlanSummaryPayload = (plan = {}) => {
  const dedicated = plan.dedicated ?? plan.parsed?.dedicated?.length ?? 0;
  const patrol = plan.patrol ?? plan.parsed?.patrol?.length ?? 0;

  return {
    dedicated,
    patrol,
    total: dedicated + patrol,
    label: formatPlanSummary(plan),
    details: formatParsedPlanDetails(plan.parsed || {}),
  };
};

export const getServiceIntroMessage = (context) => {
  const item = context.serviceQueue?.[context.queueIndex];
  if (!item) return "Let's configure your services.";

  const typeLabel = item.serviceType === 'patrol' ? 'Patrol' : 'Dedicated';
  const position = context.queueIndex + 1;
  const total = context.serviceQueue.length;

  return `Setting up ${typeLabel} Service ${item.planIndex + 1} (${position} of ${total}).`;
};

export const initializeServicesFromParsed = (parsed, context, collected) => {
  context.parsedPlan = parsed;
  context.plan = {
    dedicated: parsed.dedicated.length,
    patrol: parsed.patrol.length,
    parsed,
  };
  context.serviceQueue = buildServiceQueueFromParsed(parsed);
  context.queueIndex = 0;
  context.currentServiceIndex = 0;
  context.lastSchedule = null;

  collected.services = context.serviceQueue.map((item, index) =>
    buildCollectedServiceFromSpec(item, index),
  );

  return collected;
};

export const generateServiceName = (serviceData) => {
  if (serviceData?.name) return serviceData.name;

  if (serviceData?.serviceType === 'dedicated') {
    const officers = serviceData.reqOfficers ?? '?';
    const hours = serviceData.officerServiceHrsWeek ?? '?';
    return `Dedicated — ${officers} officers · ${hours} hrs/wk`;
  }

  if (serviceData?.serviceType === 'patrol') {
    const visits = serviceData.visitsPerWeek;
    return visits != null ? `Patrol — ${visits} visits/wk` : 'Patrol — visits/wk';
  }

  return 'Service';
};
