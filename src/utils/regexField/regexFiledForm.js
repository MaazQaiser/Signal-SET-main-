export function formatNumber(value, decimal = 2, maxCount = 20, prevValue = '') {
  let processedValue = value;
  if (typeof value === 'number') {
    processedValue = value.toString();
  } else if (typeof value === 'string') {
    processedValue = value;
  } else {
    // Handle unexpected types
    return '';
  }

  // Allow empty string as a valid input
  if (processedValue === '') {
    return '';
  }

  // If the input is '0' and a new digit is being added, replace '0' with the new digit
  if (processedValue.length > 1 && processedValue.startsWith('0') && processedValue[1] !== '.') {
    processedValue = processedValue.slice(1);
  }

  // Regex to allow:
  // - '0' by itself
  // - Numbers starting with a digit 1-9, followed by up to (maxCount - 1) digits
  // - Optional decimal point with up to 'decimal' places
  const regex = new RegExp(`^(0|[1-9]\\d{0,${maxCount - 1}})(\\.|\\.\\d{0,${decimal}})?$`);

  const match = processedValue.match(regex);

  if (match) {
    // If the input matches the pattern, process it
    processedValue = match[1]; // Digits before the decimal point
    if (match[2]) {
      // If there's a decimal part, include up to 'decimal' places
      processedValue += match[2].substring(0, decimal + 1);
    }
  } else {
    processedValue = prevValue;
  }

  return processedValue;
}
