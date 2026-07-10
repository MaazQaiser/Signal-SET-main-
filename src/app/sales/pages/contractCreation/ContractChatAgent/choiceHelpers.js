export const CHOICE_KEYS = ['A', 'B', 'C'];
const EXTENDED_CHOICE_KEYS = ['A', 'B', 'C', 'D', 'E'];

const getChoiceKeyByIndex = (index) => EXTENDED_CHOICE_KEYS[index] || String(index + 1);

export const buildChoiceOptions = (
  presets,
  {
    customLabel = 'Something else',
    customPlaceholder = 'Type your answer...',
    customInputType = 'text',
  } = {},
) => ({
  presets: presets.slice(0, 3).map((preset, index) => ({
    key: getChoiceKeyByIndex(index),
    label: preset.label,
    value: preset.value,
    recommended: Boolean(preset.recommended),
  })),
  custom: {
    key: getChoiceKeyByIndex(Math.min(presets.length, 3)),
    label: customLabel,
    placeholder: customPlaceholder,
    inputType: customInputType,
  },
});

export const parseCustomDutyDays = (text) => {
  const dayMap = {
    sun: 0,
    mon: 1,
    tue: 2,
    wed: 3,
    thu: 4,
    fri: 5,
    sat: 6,
  };

  return String(text || '')
    .split(/[,/\s]+/)
    .map((part) => dayMap[part.trim().toLowerCase().slice(0, 3)])
    .filter((day) => day != null);
};

export const formatChoiceDisplay = (choiceOptions, answer) => {
  if (answer == null || answer === '') return '';

  if (typeof answer === 'object' && answer.isCustom) {
    return `${choiceOptions?.custom?.key || 'D'}: ${answer.displayValue ?? answer.value}`;
  }

  const presets = choiceOptions?.presets || [];
  const match = presets.find((option) => option.value === answer);
  if (match) {
    return `${match.key}. ${match.label}`;
  }

  return String(answer);
};
