import { Box, Typography } from '@mui/material';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import LineToolTouchChart from 'src/app/components/common/eLineToolTouchChart';
import PieChart from 'src/app/components/common/ePieChart';
import LineChartSkeleton from 'src/app/components/common/skeletonLoader/lineChartSkeleton';
import PieChartSkeleton from 'src/app/components/common/skeletonLoader/pieChartSkeleton';
import { transformPieChartData } from 'src/helper/utilityFunctions';
import { getDisplayConfiguration } from 'src/redux/store/slices/regionalCountryConfiguration';
import {
  getDealsCumulativeStats,
  getTeamsDataGraph,
  getUsersGraph,
} from 'src/services/deal.service';
import { formatCurrencyWithCommasAndSuffix } from 'src/utils/currencyFormater';

import { useStyles } from './franchiseUserlistStyle';

const TopGraphComponent = () => {
  const { t } = useTranslation();
  const classes = useStyles();
  const { symbol } = useSelector(getDisplayConfiguration);

  const [stats, setStats] = useState({});

  const [loading, setLoading] = useState({
    internsGraphLoading: false,
    dealsGraphLoading: false,
    teamsGraphLoading: false,
  });

  const [graphs, setGraphs] = useState({
    pieChartData: [],
    usersInternsGraph: {},
    teamsGraph: {},
  });

  const changeLoadingState = (name, status) => {
    setLoading((data) => {
      return {
        ...data,
        [name]: status,
      };
    });
  };

  const fetchDealsCumulativeData = async () => {
    changeLoadingState('dealsGraphLoading', true);
    try {
      const response = await getDealsCumulativeStats('');
      if (response.statusCode === 200) {
        setStats(response?.data?.byOpenDeals);

        const pieChart = transformPieChartData(
          response?.data?.byOpenDeals.labels,
          response?.data?.byOpenDeals.values,
        );
        // Update pieChartData
        setGraphs((prevGraphs) => ({
          ...prevGraphs,
          pieChartData: {
            ...pieChart,
            colors: response?.data?.byOpenDeals?.colors, // Adding an array for colors
          },
        }));
      }
      changeLoadingState('dealsGraphLoading', false);
    } catch (error) {
      changeLoadingState('dealsGraphLoading', false);
    }
  };

  const fetchInternsSalesPersonsGraph = async () => {
    changeLoadingState('internsGraphLoading', true);
    try {
      const response = await getUsersGraph();

      if (response.statusCode === 200) {
        setGraphs((prevGraphs) => ({
          ...prevGraphs,
          usersInternsGraph: response?.data?.usersGraphData,
        }));

        changeLoadingState('internsGraphLoading', false);
      }
    } catch (error) {
      changeLoadingState('internsGraphLoading', false);
    }
  };

  const fetchTeamsGraphData = async () => {
    changeLoadingState('teamsGraphLoading', true);
    try {
      const response = await getTeamsDataGraph();

      if (response.statusCode === 200) {
        setGraphs((prevGraphs) => ({
          ...prevGraphs,
          teamsGraph: {
            ...response?.clientsOverTheYear,
            colors: { [t('sales.graphusers.users')]: response?.clientsOverTheYear?.colors?.users },
            data: { [t('sales.graphusers.users')]: response?.clientsOverTheYear?.data?.users },
          },
        }));

        changeLoadingState('teamsGraphLoading', false);
      }
    } catch (error) {
      changeLoadingState('teamsGraphLoading', false);
    }
  };

  useEffect(() => {
    fetchDealsCumulativeData();
    fetchInternsSalesPersonsGraph();
    fetchTeamsGraphData();
  }, []);

  return (
    <>
      {loading?.internsGraphLoading ? (
        <Box className={classes.pieChartSkeletonWrapper}>
          <PieChartSkeleton legendCount={2} title={t('sales.graphusers.users')} isValue={true} />
        </Box>
      ) : (
        <Box className={classNames(classes.gridSection, classes.firstGrid)}>
          <Box className={classes.chipWrapper}>
            <Typography variant="subtitle2" className={classes.chartHeading}>
              {t('sales.graphusers.users')}
            </Typography>
          </Box>

          <Typography variant="h1" className={classes.dataAmount}>
            {graphs?.usersInternsGraph?.stats?.total}
          </Typography>

          <PieChart
            colors={graphs?.usersInternsGraph?.colors}
            data={graphs?.usersInternsGraph?.data}
            stats={graphs?.usersInternsGraph?.stats}
            toolTipFormatter="{b}: {c} ({d}%)"
            style={{ height: '200px', width: '100%' }}
            decimal={0}
            legedFormatter="value"
            legendStyle={{
              icon: 'rect',
              itemWidth: 12,
              itemHeight: 12,
              textStyle: {
                fontSize: 12,
                color: '#86868B',
                fontWeight: 500,
                lineHeight: 16,
              },
            }}
          />
        </Box>
      )}

      {loading?.dealsGraphLoading ? (
        <Box className={classes.pieChartSkeletonWrapperClient}>
          <PieChartSkeleton
            legendCount={5}
            title={t('sales.deals.totalDealAmount')}
            isValue={true}
          />
        </Box>
      ) : (
        <Box className={classes.gridSection}>
          <Box className={classes.chartInfo}>
            <Typography variant="subtitle2" className={classes.chartHeading}>
              {t('sales.graphusers.totalDeals')}
            </Typography>
            {/* <Chip label={t('stubedData.inProgress')} size="small" color="primary" /> */}
          </Box>

          <Typography variant="h1" className={classes.dataAmount}>
            {symbol} {formatCurrencyWithCommasAndSuffix(stats?.totalAmount)}
          </Typography>

          <PieChart
            heading={t('sales.deals.totalDealAmount')}
            colors={graphs?.pieChartData?.colors}
            data={graphs?.pieChartData?.data || []}
            stats={graphs?.pieChartData?.data?.total || 0}
            style={{ height: '200px', width: '100%' }}
            toolTipFormatter="{b}: {c} ({d}%)"
            legedFormatter="value"
            legendStyle={{
              icon: 'rect',
              itemWidth: 12,
              itemHeight: 12,
              textStyle: {
                fontSize: 12,
                color: '#86868B',
                fontWeight: 500,
                lineHeight: 16,
              },
            }}
          />
        </Box>
      )}
      {loading?.teamsGraphLoading ? (
        <Box className={classes.lineChartSkeletonWrapperRight}>
          <LineChartSkeleton title={t('sales.graphusers.usersOnBoarding')} />
        </Box>
      ) : (
        <Box className={classes.gridSectionOne}>
          <Box
            className={classNames(
              classes.headerBar,
              classes.headerBarIn,
              classes.customHeadingChart,
            )}
          >
            <Box className={classes.chipWrapper}>
              <Typography variant="subtitle2" className={classes.chartHeading}>
                {t('sales.graphusers.usersOnBoarding')}
              </Typography>
              {/* <Chip label={t('stubedData.inProgress')} size="small" color="primary" /> */}
            </Box>
            {/* This filter will be use in future */}
            {/* {showYear && (
                <Button variant="tertiaryGrey" endIcon={<SaleList />}>
                  {t('ho.graph.year')}
                </Button>
              )} */}
          </Box>
          <LineToolTouchChart
            colors={graphs?.teamsGraph?.colors}
            data={graphs?.teamsGraph?.data}
            dataLabels={graphs?.teamsGraph?.dataLabels}
            // stats={UserOverYear.stats}
            style={{ height: '200px', width: '100%' }}
          />
        </Box>
      )}
    </>
  );
};

export default TopGraphComponent;

TopGraphComponent.propTypes = {
  showYear: PropTypes.bool,
  win: PropTypes.bool,
};
