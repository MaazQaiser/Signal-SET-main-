const WORD_NUMBERS = {
  zero: 0,
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  eleven: 11,
  twelve: 12,
};

const HOURS_TOKEN = '(?:hours?|hrs?|hr)';
const WEEK_TOKEN = '(?:week|wk)';

const parseTokenNumber = (token) => {
  if (token == null || token === '') return null;
  const normalized = String(token).toLowerCase().trim();
  if (WORD_NUMBERS[normalized] != null) return WORD_NUMBERS[normalized];
  const num = Number(normalized);
  return Number.isNaN(num) ? null : num;
};

const NUMBER_TOKEN = '(\\d+|zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve)';

const OFFICER_TYPE_LABELS = {
  armed_officer: 'armed officers',
  dedicated_officer: 'dedicated officers',
  patrol_officer: 'patrol officers',
};

const parseOfficerTypeFromQualifier = (qualifier) => {
  if (!qualifier) return null;
  const q = qualifier.toLowerCase();
  if (q === 'armed') return 'armed_officer';
  if (q === 'dedicated') return 'dedicated_officer';
  if (q === 'patrol') return 'patrol_officer';
  return null;
};

const getContextWindow = (text, index, matchLength) => {
  const start = Math.max(0, index - 50);
  const end = Math.min(text.length, index + matchLength + 80);
  return text.slice(start, end);
};

const inferCoverageFromContext = (context) => {
  if (/\bpatrol\s+coverage\b/i.test(context)) return 'patrol';
  if (/\bdedicated\s+coverage\b/i.test(context)) return 'dedicated';
  return null;
};

const resolveOfficerType = (qualifier, coverage, context) => {
  const fromQualifier = parseOfficerTypeFromQualifier(qualifier);
  if (fromQualifier) return fromQualifier;

  if (coverage === 'patrol') return 'patrol_officer';
  if (coverage === 'dedicated') return 'dedicated_officer';

  if (/\barmed\s+officers?\b/i.test(context)) return 'armed_officer';
  if (/\bpatrol\s+officers?\b/i.test(context)) return 'patrol_officer';
  if (/\bdedicated\s+officers?\b/i.test(context)) return 'dedicated_officer';

  return null;
};

const defaultOfficerTypeForCoverage = (coverage) =>
  coverage === 'patrol' ? 'patrol_officer' : 'dedicated_officer';

const splitSegments = (text) =>
  String(text || '')
    .split(/\band\b|,|;|\bi\s+need\b|\bneed\b/i)
    .map((part) => part.trim())
    .filter(Boolean);

const DEDICATED_OFFICERS_FIRST = new RegExp(
  `${NUMBER_TOKEN}\\s+(?:(armed|dedicated|patrol)\\s+)?(?:officers?|guards?)\\s+(?:for\\s+)?(\\d+)\\s*${HOURS_TOKEN}(?:\\s*(?:per\\s+|a\\s+|\\/\\s*)?${WEEK_TOKEN})?`,
  'i',
);

const DEDICATED_HOURS_FIRST = new RegExp(
  `(\\d+)\\s*${HOURS_TOKEN}(?:\\s*(?:per\\s+|a\\s+|\\/\\s*)?${WEEK_TOKEN})?\\s+(?:for\\s+)?${NUMBER_TOKEN}\\s+(?:(armed|dedicated|patrol)\\s+)?(?:officers?|guards?)`,
  'i',
);

const PATROL_OFFICER_VISITS = new RegExp(
  `${NUMBER_TOKEN}\\s+(?:(armed|dedicated|patrol)\\s+)?(?:officers?|guards?)\\s+(?:for\\s+)?(\\d+)\\s+(?:visits?|hits?)\\s*(?:per\\s+|a\\s+|\\/\\s*)?${WEEK_TOKEN}`,
  'i',
);

const buildDedicatedSpec = (reqOfficers, officerServiceHrsWeek, qualifier, context) => {
  if (!(reqOfficers > 0 && officerServiceHrsWeek > 0)) return null;

  const coverage = inferCoverageFromContext(context) || 'dedicated';
  const officerType =
    resolveOfficerType(qualifier, coverage, context) || defaultOfficerTypeForCoverage(coverage);

  return {
    reqOfficers,
    officerServiceHrsWeek,
    officerType,
    coverageType: 'dedicated',
  };
};

const buildPatrolSpec = (reqOfficers, visitsPerWeek, qualifier, context) => {
  if (!(visitsPerWeek > 0)) return null;

  const coverage = inferCoverageFromContext(context) || 'patrol';
  const officerType =
    resolveOfficerType(qualifier, coverage, context) || defaultOfficerTypeForCoverage(coverage);

  const spec = {
    visitsPerWeek,
    officerType,
    coverageType: 'patrol',
  };

  if (reqOfficers > 0) {
    spec.reqOfficers = reqOfficers;
  }

  return spec;
};

const parseDedicatedOfficersFirst = (match, context = '') =>
  buildDedicatedSpec(parseTokenNumber(match[1]), parseTokenNumber(match[3]), match[2], context);

const parseDedicatedHoursFirst = (match, context = '') =>
  buildDedicatedSpec(parseTokenNumber(match[2]), parseTokenNumber(match[1]), match[3], context);

const parseDedicatedSegment = (segment) => {
  const officersFirst = segment.match(DEDICATED_OFFICERS_FIRST);
  if (officersFirst) return parseDedicatedOfficersFirst(officersFirst, segment);

  const hoursFirst = segment.match(DEDICATED_HOURS_FIRST);
  if (hoursFirst) return parseDedicatedHoursFirst(hoursFirst, segment);

  return null;
};

const findAllDedicatedInText = (text) => {
  const results = [];
  const regex = new RegExp(DEDICATED_OFFICERS_FIRST.source, 'gi');
  let match = regex.exec(text);
  while (match) {
    const context = getContextWindow(text, match.index, match[0].length);
    const spec = parseDedicatedOfficersFirst(match, context);
    if (spec) results.push(spec);
    match = regex.exec(text);
  }
  return results;
};

const parsePatrolSegment = (segment) => {
  if (!/\bpatrol\b|\bvisits?\b|\bhits?\b/i.test(segment)) {
    return null;
  }

  const officerVisitsMatch = segment.match(PATROL_OFFICER_VISITS);
  if (officerVisitsMatch) {
    return buildPatrolSpec(
      parseTokenNumber(officerVisitsMatch[1]),
      parseTokenNumber(officerVisitsMatch[3]),
      officerVisitsMatch[2],
      segment,
    );
  }

  const visitsPerWeekMatch = segment.match(
    /(\d+)\s+(?:visits?|hits?)\s*(?:per\s+|a\s+|\/\s*)?(?:week|wk)/i,
  );
  if (visitsPerWeekMatch) {
    return buildPatrolSpec(null, parseTokenNumber(visitsPerWeekMatch[1]), null, segment);
  }

  const patrolWithCount = segment.match(/patrol\s+(?:with\s+)?(\d+)\s+visits?/i);
  if (patrolWithCount) {
    return buildPatrolSpec(null, parseTokenNumber(patrolWithCount[1]), 'patrol', segment);
  }

  if (/\bpatrol\b/i.test(segment) && /visits?\s+(?:per\s+|a\s+)(?:week|wk)/i.test(segment)) {
    return buildPatrolSpec(null, null, 'patrol', segment);
  }

  return null;
};

const findAllPatrolInText = (text) => {
  const results = [];
  const visitsFromOfficerPattern = new Set();

  const officerVisitsRegex = new RegExp(PATROL_OFFICER_VISITS.source, 'gi');
  let officerMatch = officerVisitsRegex.exec(text);
  while (officerMatch) {
    const context = getContextWindow(text, officerMatch.index, officerMatch[0].length);
    const spec = buildPatrolSpec(
      parseTokenNumber(officerMatch[1]),
      parseTokenNumber(officerMatch[3]),
      officerMatch[2],
      context,
    );
    if (spec) {
      results.push(spec);
      visitsFromOfficerPattern.add(spec.visitsPerWeek);
    }
    officerMatch = officerVisitsRegex.exec(text);
  }

  const visitsRegex = /(\d+)\s+(?:visits?|hits?)\s*(?:per\s+|a\s+|\/\s*)?(?:week|wk)/gi;
  let match = visitsRegex.exec(text);
  while (match) {
    const visitsPerWeek = parseTokenNumber(match[1]);
    if (visitsFromOfficerPattern.has(visitsPerWeek)) {
      match = visitsRegex.exec(text);
      continue;
    }
    const context = getContextWindow(text, match.index, match[0].length);
    if (/\bpatrol\b|\bvisits?\b|\bhits?\b/i.test(context)) {
      const spec = buildPatrolSpec(null, visitsPerWeek, null, context);
      if (spec) results.push(spec);
    }
    match = visitsRegex.exec(text);
  }

  return results;
};

const dedupeDedicatedKey = (spec) =>
  `${spec.officerType || 'dedicated_officer'}:${spec.reqOfficers}:${spec.officerServiceHrsWeek}`;

const dedupePatrolKey = (spec) =>
  `${spec.officerType || 'patrol_officer'}:${spec.visitsPerWeek ?? 'unknown'}`;

const addDedicated = (dedicated, dedicatedSeen, spec) => {
  if (!spec?.reqOfficers || !spec?.officerServiceHrsWeek) return;
  const key = dedupeDedicatedKey(spec);
  if (dedicatedSeen.has(key)) return;
  dedicatedSeen.add(key);
  dedicated.push(spec);
};

const addPatrol = (patrol, patrolSeen, spec) => {
  if (!spec?.visitsPerWeek) return;
  const key = dedupePatrolKey(spec);
  if (patrolSeen.has(key)) {
    const existing = patrol.find((item) => dedupePatrolKey(item) === key);
    if (existing && !existing.reqOfficers && spec.reqOfficers) {
      existing.reqOfficers = spec.reqOfficers;
    }
    return;
  }
  patrolSeen.add(key);
  patrol.push(spec);
};

export const formatOfficerTypeLabel = (officerType) =>
  OFFICER_TYPE_LABELS[officerType] || 'officers';

export const formatOfficerTypeShort = (officerType) => {
  if (officerType === 'armed_officer') return 'armed';
  if (officerType === 'dedicated_officer') return 'dedicated';
  if (officerType === 'patrol_officer') return 'patrol';
  return '';
};

export const parseServicesFromText = (text) => {
  const input = String(text || '').trim();
  const dedicated = [];
  const patrol = [];
  const dedicatedSeen = new Set();
  const patrolSeen = new Set();

  findAllDedicatedInText(input).forEach((spec) => addDedicated(dedicated, dedicatedSeen, spec));

  findAllPatrolInText(input).forEach((spec) => addPatrol(patrol, patrolSeen, spec));

  splitSegments(input).forEach((segment) => {
    addDedicated(dedicated, dedicatedSeen, parseDedicatedSegment(segment));
    addPatrol(patrol, patrolSeen, parsePatrolSegment(segment));
  });

  return {
    dedicated,
    patrol,
    hasAny: dedicated.length + patrol.length > 0,
  };
};

export const buildCollectedServiceFromSpec = (queueItem, index) => {
  const { serviceType, reqOfficers, officerServiceHrsWeek, visitsPerWeek, officerType } = queueItem;

  const service = {
    serviceType,
    includeVehicle: 'no',
    scheduleSkipped: false,
  };

  if (officerType) {
    service.officerType = officerType;
  }

  if (serviceType === 'dedicated') {
    service.reqOfficers = reqOfficers ?? null;
    service.officerServiceHrsWeek = officerServiceHrsWeek ?? null;
    const typeShort = formatOfficerTypeShort(officerType);
    const officerLabel = typeShort ? `${typeShort} officers` : 'officers';
    service.name = `Dedicated — ${reqOfficers} ${officerLabel} · ${officerServiceHrsWeek} hrs/wk`;
  } else {
    service.visitsPerWeek = visitsPerWeek ?? null;
    const typeShort = formatOfficerTypeShort(officerType);
    const officerLabel = typeShort ? `${typeShort} coverage` : 'Patrol';
    service.name =
      visitsPerWeek != null
        ? `Patrol — ${visitsPerWeek} visits/wk (${officerLabel})`
        : 'Patrol — visits/wk';
    service.visitType = 'random';
  }

  service.queueLabel = service.name;
  service.planIndex = queueItem.planIndex ?? index;

  return service;
};
