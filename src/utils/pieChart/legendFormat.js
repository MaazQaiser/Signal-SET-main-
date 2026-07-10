import { fomatNumbersWithCommas } from '../currencyFormater';

/**
 * @description it will format the legend for PIE chart grapgh
 * @param {*} data //array of label and value to view in chart
 * @param {*} name  // label of the chart
 * @param {*} legedFormatter // formatter sign
 * @returns
 */
export function pieChartLegendFormat(data, name, legedFormatter, decimal) {
  const value = data?.find((item) => item.name === name).value;

  // if legedFormatter is value then show the value after name (label) and also localize
  if (legedFormatter === 'value') return `${name} • ${fomatNumbersWithCommas(value, decimal)}`;

  // if legedFormatter is $ then show the value after name (label). Add legedFormatter (sign) and also localize
  return `${name} • ${legedFormatter}${fomatNumbersWithCommas(value, decimal)}`;
}
