export const HEX_PATTERN = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

export const normalizeHexInput = (value) => {
  const trimmed = value.trim();
  if (!trimmed) return '';
  return trimmed.startsWith('#') ? trimmed : `#${trimmed}`;
};

export const isValidHex = (value) => HEX_PATTERN.test(normalizeHexInput(value));

export const toPickerHex = (hex) => {
  if (!isValidHex(hex)) return '#000000';
  const normalized = normalizeHexInput(hex).toUpperCase();
  if (normalized.length === 4) {
    const r = normalized[1];
    const g = normalized[2];
    const b = normalized[3];
    return `#${r}${r}${g}${g}${b}${b}`;
  }
  return normalized;
};
