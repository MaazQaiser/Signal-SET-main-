import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { convertHHMMAToDayJsDate } from 'src/utils/passTime/time';

dayjs.extend(customParseFormat);

const CHAT_TIME_FORMATS = ['h:mm A', 'hh:mm A', 'H:mm', 'HH:mm', 'h:mmA', 'hh:mmA'];

export const parseChatTimeInput = (value) => {
  if (value == null || value === '') return null;
  if (dayjs.isDayjs(value)) return value.isValid() ? value : null;

  const trimmed = String(value).trim();
  if (!trimmed) return null;

  const normalized = trimmed
    .replace(/(\d)([ap]m)$/i, '$1 $2')
    .replace(/\b([ap])m\b/gi, (_, period) => `${period.toUpperCase()}M`)
    .replace(/\s+/g, ' ');

  for (const format of CHAT_TIME_FORMATS) {
    const parsed = dayjs(normalized, format, true);
    if (parsed.isValid()) {
      return parsed;
    }
  }

  try {
    const legacy = convertHHMMAToDayJsDate(normalized);
    if (dayjs.isDayjs(legacy) && legacy.isValid()) {
      return legacy;
    }
  } catch {
    // fall through
  }

  return null;
};
