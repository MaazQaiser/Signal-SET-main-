import { parseCustomDutyDays } from './choiceHelpers.js';
import { parseChatTimeInput } from './timeParser.js';

export const SCHEDULE_PRESETS = {
  WEEKDAY_BUSINESS: {
    dutyDays: [1, 2, 3, 4, 5],
    startTime: '9:00 AM',
    endTime: '5:00 PM',
    label: 'Mon–Fri, 9:00 AM – 5:00 PM',
  },
  OVERNIGHT: {
    dutyDays: [1, 2, 3, 4, 5, 6],
    startTime: '6:00 PM',
    endTime: '6:00 AM',
    label: 'Mon–Sat, 6:00 PM – 6:00 AM',
  },
};

const TIME_RANGE_PATTERN =
  /(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)\s*(?:-|–|to)\s*(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/i;

export const parseSchedulePreference = (answer) => {
  if (answer == null || answer === '') {
    return { skipped: true };
  }

  if (typeof answer === 'object' && answer.skipped) {
    return { skipped: true };
  }

  const value = typeof answer === 'object' ? (answer.value ?? answer) : answer;

  if (value === 'skip' || value === 'skipped') {
    return { skipped: true };
  }

  if (value === 'same_as_previous') {
    return { sameAsPrevious: true };
  }

  if (value === SCHEDULE_PRESETS.WEEKDAY_BUSINESS.label || value === 'weekday_business') {
    return { ...SCHEDULE_PRESETS.WEEKDAY_BUSINESS, skipped: false };
  }

  if (value === SCHEDULE_PRESETS.OVERNIGHT.label || value === 'overnight') {
    return { ...SCHEDULE_PRESETS.OVERNIGHT, skipped: false };
  }

  const text = String(value).trim();
  if (!text) return { skipped: true };

  const lower = text.toLowerCase();
  if (lower.includes('skip') || lower.includes('no preference')) {
    return { skipped: true };
  }

  let dutyDays = [];
  if (/mon(?:day)?\s*[–-]\s*fri(?:day)?/i.test(text) || /weekday/i.test(text)) {
    dutyDays = [1, 2, 3, 4, 5];
  } else if (/every\s+day|daily|7\s*days?/i.test(text)) {
    dutyDays = [0, 1, 2, 3, 4, 5, 6];
  } else {
    dutyDays = parseCustomDutyDays(text);
  }

  const timeMatch = text.match(TIME_RANGE_PATTERN);
  let startTime = null;
  let endTime = null;

  if (timeMatch) {
    startTime = parseChatTimeInput(timeMatch[1]) ? timeMatch[1].trim() : null;
    endTime = parseChatTimeInput(timeMatch[2]) ? timeMatch[2].trim() : null;
  }

  return {
    dutyDays,
    startTime,
    endTime,
    skipped: false,
  };
};

export const applyScheduleToService = (service, schedule, previousSchedule) => {
  if (schedule?.sameAsPrevious && previousSchedule && !previousSchedule.skipped) {
    return {
      ...service,
      dutyDays: [...(previousSchedule.dutyDays || [])],
      startTime: previousSchedule.startTime,
      endTime: previousSchedule.endTime,
      scheduleSkipped: false,
    };
  }

  if (!schedule || schedule.skipped) {
    return {
      ...service,
      scheduleSkipped: true,
    };
  }

  return {
    ...service,
    dutyDays: schedule.dutyDays || [],
    startTime: schedule.startTime || null,
    endTime: schedule.endTime || null,
    scheduleSkipped: false,
  };
};
