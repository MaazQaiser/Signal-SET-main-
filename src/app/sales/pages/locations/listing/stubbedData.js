export const LocationsGraphs = {
  colors: ['#146DFF', '#A9DEFF', '#FFA95B', '#E43F32'],
  data: [
    { value: 62, name: 'Direct' },
    { value: 13, name: 'Strategic' },
    { value: 25, name: 'Organic' },
  ],
  stats: {
    total: '1.21M',
  },
};

export const Stages = {
  colors: ['#146DFF'],
  data: {
    xAxis: ['New', 'Working', 'Nurturing', 'Qualified'],
    series: [0, 0.5, 1, 1.5],
  },
  stats: {
    increaseSaleInPercent: '7%',
    increaseSaleInAmount: '$1M',
    total: '$950k',
  },
};

export const QualifiedLocations = {
  dataLabels: [
    'Jan-23',
    'Feb-23',
    'Mar-23',
    'Apr-23',
    'May-23',
    'Jun-23',
    'Jul-23',
    'Aug-23',
    'Sep-23',
    'Oct-23',
    'Nov-23',
    'Dec-23',
  ],
  data: {
    Locations: [0, 3, 5, 7, 9, 11, 20, 15, 20, 17, 14, 10],
  },
  stats: {
    Locations: 2,
  },
  colors: {
    Locations: ['#146DFF', '#A6C3F0'],
  },
};
