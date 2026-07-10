import ReactECharts from 'echarts-for-react';
import PropTypes from 'prop-types';
import { pageType } from 'salesPages/dashboard/dashboardConstant';
import { capitalizeFirstLetter } from 'src/utils/string/common';
import { truncateString } from 'src/utils/string/truncate';

const DecisionMakerGraph = ({ componentType, colors, dataLabels, series, style }) => {
  const safeDataLabels = Array.isArray(dataLabels) ? dataLabels : [];
  const safeSeries = series && typeof series === 'object' ? series : {};
  const safeColors = Array.isArray(colors) ? colors : [];
  // dataLabels = [
  //   'Sir John Peterson III',
  //   'Lady Catherine Fitzwilliam-Smith',
  //   'Dr. Benjamin Franklin Anderson-Smith',
  //   'Countess Victoria Marguerite de la Fontaine',
  //   'Prince Alexander Maximilian von Hohenberg-Schwarzenberg',
  //   'Baroness Isabella Sophia Marie-Claire von und zu Liechtenstein',
  //   "Professor Jonathan Edward Francis Xavier O'Malley-Jones",
  //   'Archduchess Eleanor Margaret Beatrice of Windsor',
  //   'Grand Duke Nikolai Dmitrievich Romanov-Smirnov',
  //   'Duchess Penelope Anastasia Madeleine de Montague',
  //   'Captain Maximilian Augustus Fitzwilliam Smythe-Jones',
  //   'Princess Anastasia Tatiana Ivanovna Romanova',
  //   'King Charles Edward William George Frederick III of England',
  // ];
  // series = {
  //   decisionMakingMeetings: [12, 35, 7, 23, 42, 18, 9, 31, 5, 48, 14, 29, 3],
  //   nonDecisionMakingMeetings: [28, 19, 44, 6, 37, 11, 25, 3, 50, 14, 33, 9, 22],
  // };

  function swapAxisData(param = pageType.page) {
    let yAxisData = {
      type: 'value',
    };

    let xAxisData = {
      // inverse: true,
      type: 'category',
      data: safeDataLabels,
      axisLabel: {
        interval: 0,
        rotate: 30,
        formatter: (name) => {
          return `${truncateString(capitalizeFirstLetter(name), 20)}`;
        },
      },
    };

    if (param !== pageType.dashboard) {
      // Swap the values of xAxisData and yAxisData
      [xAxisData, yAxisData] = [yAxisData, xAxisData];
      yAxisData = {
        inverse: true,
        ...yAxisData,
        axisLabel: {
          ...yAxisData.axisLabel,
          interval: 0,
          rotate: 0,
        },
      };
    }

    return { xAxisData, yAxisData };
  }

  const grid = {
    left: componentType === pageType.dashboard ? 100 : 200,
    right: 100,
    top: componentType === pageType.dashboard ? 50 : 10,
    bottom: componentType === pageType.dashboard ? 120 : 90,
  };

  // const colorsBE = ['#FFA95B', '#A9DEFF'];

  const seriesBESetting = Object.keys(safeSeries)?.map((key) => ({
    name: key.replace(/([A-Z])/g, ' $1').trim(),
    type: 'bar',
    stack: 'total',
    data: Array.isArray(safeSeries[key]) ? safeSeries[key] : [],
    barWidth: '28px',
    barGap: '0%',
    itemStyle: {
      borderRadius: [0, 0, 0, 0],
    },
  }));

  const options = {
    legend: {
      bottom: '0',
      textStyle: {
        color: '#86868B',
        fontStyle: 'normal',
        fontWeight: '400',
        fontSize: 12,
      },
      icon: 'rect',
      itemWidth: 10,
      itemHeight: 10,
      itemGap: 32,
      selectedMode: false,
      formatter: (name) => {
        return `${capitalizeFirstLetter(name)}`;
      },
    },
    textStyle: {
      fontSize: 14,
      color: '#6A6A70',
      fontWeight: '500 !important',
      display: 'flex',
    },
    color: safeColors,
    grid,
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'none',
      },
      formatter: function (params) {
        let itemName = '';
        const tooltipContent = params
          .map(function (item) {
            itemName = `<span>${item?.name}</span><br/><br/>`;
            const colorCircle = `<span style="display:inline-block;margin-right:5px;border-radius:50%;width:10px;height:10px;background-color:${item.color}"></span>`;
            return `${colorCircle} ${capitalizeFirstLetter(item.seriesName) + ': ' + item.value}`;
          })
          .join('<br>');
        return `${itemName} ${tooltipContent}`;
      },
      backgroundColor: '#000',
      borderRadius: 8,
      borderColor: '#000',
      textStyle: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 500,
      },
    },
    yAxis: {
      type: 'value',
      splitLine: {
        show: false,
        lineStyle: {
          type: 'dashed',
        },
      },
      axisLine: {
        show: false,
      },
      ...swapAxisData(componentType).yAxisData,
    },
    xAxis: {
      splitLine: {
        show: false,
      },
      axisLine: {
        show: true,
        lineStyle: {
          color: '#E6E6E7',
        },
      },
      axisLabel: {
        align: 'right',
        margin: 32,
        textStyle: {
          color: '#86868B',
          fontStyle: 'normal',
          fontWeight: '400',
          fontSize: 12,
        },
      },
      ...swapAxisData(componentType).xAxisData,
    },
    series: seriesBESetting,
  };

  return <ReactECharts opts={{ renderer: 'svg' }} option={options} style={style} />;
};

DecisionMakerGraph.defaultProps = {
  style: { height: '100%', width: '100%' },
  componentType: pageType.page,
};

DecisionMakerGraph.propTypes = {
  componentType: PropTypes.oneOf(Object.values(pageType)),
  heading: PropTypes.string,
  colors: PropTypes.array.isRequired,
  className: PropTypes.string,
  dataLabels: PropTypes.array.isRequired,
  series: PropTypes.object.isRequired,
  style: PropTypes.object,
};

export default DecisionMakerGraph;
