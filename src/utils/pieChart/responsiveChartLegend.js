import { fomatNumbersWithCommas } from '../currencyFormater';

/**
 * @description this will handle the legend format in responsive case for PIE chart grapgh
 * @param {*} data // array of label and value to view in chart
 * @param {*} name  // label of the chart
 * @param {*} maxWidth // width in number to manage responsive
 * @param {*} legedFormatter // formatter sign
 * @returns
 */
export function resonsivePieChartLegendFormat(data, name, maxWidth, legedFormatter) {
  const value = data?.find((item) => item.name === name).value;
  if (maxWidth >= 1280 && maxWidth <= 1540 && name.length > 22) {
    name = name.substring(0, 22) + '...'; // Truncate the legend label

    // if legedFormatter is value then show the value after name (label) and also localize
    if (legedFormatter === 'value') return `${name} • ${fomatNumbersWithCommas(value)}`;

    return `${name} • ${legedFormatter}${fomatNumbersWithCommas(value)}`;
  } else if (maxWidth <= 1280 && name.length > 12) {
    name = name.substring(0, 12) + '...'; // Truncate the legend label

    // if legedFormatter is value then show the value after name (label) and also localize
    if (legedFormatter === 'value') return `${name} • ${fomatNumbersWithCommas(value)}`;

    return `${name} • ${legedFormatter}${fomatNumbersWithCommas(value)}`;
  }
}
