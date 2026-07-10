export const numberToUsdCurrencyFormat = (value) =>
  // eslint-disable-next-line no-undef
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(value);

/**
 * @description Format number to K, million, billion format
 * Also add commas where required
 * @param {*} number
 * @returns {string}
 */
export const formatCurrencyWithCommasAndSuffix = (number) => {
  if (isNaN(number) || !number) {
    return '0';
  }

  const suffixes = ['', 'k', 'M', 'B', 'T'];

  let suffixIndex = 0;
  if (number >= 10000) {
    while (number >= 1000 && suffixIndex < suffixes.length - 1) {
      number /= 1000;
      suffixIndex++;
    }
  }

  const isInteger = number % 1 === 0;

  const formattedNumber = isInteger
    ? number.toLocaleString()
    : number.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return formattedNumber + suffixes[suffixIndex];
};

/**
 * Converts a number (float or whole) to a value with 2 decimal precision.
 * @param {number|string} number - Input number
 * @returns {number} Number rounded to 2 decimal places
 */
export const toTwoDecimalPrecision = (number) => {
  if (number === null || number === undefined || number === '') {
    return 0;
  }
  const num = Number(number);
  if (Number.isNaN(num)) {
    return 0;
  }
  return Math.round(num * 100) / 100;
};

/**
 * Localize number and add commas for better understanding
 * @param {*} number
 * @returns {string}
 */
export const fomatNumbersWithCommas = (number, decimal = 2) => {
  if (isNaN(number) || number === null || number === undefined || number === '') {
    return Number(0).toFixed(decimal);
  }

  return Number(number).toLocaleString(undefined, {
    minimumFractionDigits: decimal,
    maximumFractionDigits: 2,
  });
};
