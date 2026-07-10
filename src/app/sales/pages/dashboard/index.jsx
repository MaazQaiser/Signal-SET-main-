import { _Popover, Box, Button, Grid, Skeleton, Typography } from '@mui/material';
import { ReactComponent as ChevronRightIcon } from 'assets/icons/chevronRighIcon.svg';
import { ReactComponent as DownloadCloudICon } from 'assets/svg/DownloadCloudICon.svg';
import classNames from 'classnames';
import CustomDropDown from 'commonComponents/customDropDown';
import _RangeSlider from 'commonComponents/rangeSlider';
import PieChartSkeleton from 'commonComponents/skeletonLoader/pieChartSkeleton';
import dayjs from 'dayjs';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom/cjs/react-router-dom';
import { Link } from 'react-router-dom/cjs/react-router-dom.min';
import { toast } from 'react-toastify';
import DecisionMeetingGraph from 'salesPages/dashboard/dashboardListing/decisionMeetingGraph';
import SalesPersonInsights from 'salesPages/dashboard/dashboardListing/salesPersonInsights';
import LineToolTouchChart from 'src/app/components/common/eLineToolTouchChart';
import DateRangePickerWithButtons from 'src/app/components/common/RangeDatepicker';
import LineChartSkeleton from 'src/app/components/common/skeletonLoader/lineChartSkeleton';
import {
  SALES_DASHBOARD_DECISION_MAKING,
  SALES_DASHBOARD_PROPOSAL_LOST,
  SALES_DASHBOARD_PROPOSAL_WON,
  SALES_DASHBOARD_SALES_PERSON_INSIGHTS,
} from 'src/app/router/constant/ROUTE';
import { useApiControllers } from 'src/helper/axios';
import { formatDate, isObjectEmpty, transformPieChartData } from 'src/helper/utilityFunctions';
import useRegionalStateCityHook from 'src/hooks/useRegionalStateCityHook';
import { useTenantLabel } from 'src/hooks/useTenantLabel';
import { getDisplayConfiguration } from 'src/redux/store/slices/regionalCountryConfiguration';
import {
  exportDashboardGraphs,
  getContractRevenueStats,
  getKeyMetricsStats,
  getMembers,
  getSalesFunnelStats,
  getSalesPersonInsight,
  getVisitStats,
} from 'src/services/salesDashboard.service';
import transformArrayForOptions from 'src/utils/array/transformArrayForOptions';
import { toastSettings } from 'src/utils/constants';
import {
  fomatNumbersWithCommas,
  formatCurrencyWithCommasAndSuffix,
  numberToUsdCurrencyFormat,
} from 'src/utils/currencyFormater';
import { capitalizeFirstLetter } from 'src/utils/string/common';

import PieChart from '../../../components/common/ePieChart';
import {
  decisionMakingEmptyState,
  emptyState,
  filtersEmptyState,
  keyMetricEmptyState,
  pageType,
} from './dashboardConstant';
import ProposalLost from './dashboardListing/proposalLost';
import ProposalWon from './dashboardListing/proposalWon';
import { useStyles } from './dashboardStyle';
import ExportModal from './exportModal';

export default function Dashboard() {
  const classes = useStyles();
  const { t } = useTranslation();
  const { symbol, dateFormat } = useSelector(getDisplayConfiguration);

  const hasMounted = useRef(false);

  const { getNewApiController } = useApiControllers();

  const { getLabel } = useTenantLabel();

  const NA = t('commonText.nA');
  const [openModal, setOpenModal] = useState(false);
  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);
  /**
   * it will hold the applied filters on sales person insights
   * this state will be passed to detail view of sales person insights
   */
  const [salesPInsighFilters, setSalesPInsighFilters] = useState(filtersEmptyState);

  const [meetingGraphFilters, setMeetingGraphFilters] = useState(decisionMakingEmptyState);

  const [formData, setFormData] = useState(emptyState);
  const [options, setOptions] = useState({
    userIds: [],
  });

  const handleMultipleSelectedValues = async (event, field) => {
    /**
     * get the ids from selected values
     */
    const selectedValues = event.target.value?.map((value) => parseInt(value.value));
    setFormData((prevState) => ({
      ...prevState,
      [field]: selectedValues,
    }));
  };

  const { states } = useRegionalStateCityHook();

  const handleStateChange = (event) => {
    const { value } = event.target;
    setFormData((prevState) => ({
      ...prevState,
      states: value,
    }));
  };

  const [graphs, setGraphs] = useState({
    visitsChart: {},
    visits: {},
    contractedRevenueChart: {},
    saleFunnel: {},
    salesPersonInsight: {},
  });

  const [keyMetricsData, setKeyMetricsData] = useState(keyMetricEmptyState);

  const [loading, setLoading] = useState({
    visitGraphLoading: false,
    contractedRevenueLoading: false,
    keyMetricsLoading: false,
    salesFunnelLoading: false,
  });

  const [exportAPICalled, setExportAPICalled] = useState(false);

  const changeLoadingState = (name, status) => {
    setLoading((data) => {
      return {
        ...data,
        [name]: status,
      };
    });
  };

  const fetchGraphVisitsData = async (queryParams, apiController) => {
    changeLoadingState('visitGraphLoading', true);
    // const apiController = getNewApiController();

    try {
      const response = await getVisitStats(queryParams, { signal: apiController.signal });
      if (response?.statusCode === 200) {
        /**
         * PIECHART
         * Transform the data to match the format expected by ECharts
         * Transform data using helper functions
         */
        const pieChart = transformPieChartData(
          response?.data?.visits.labels,
          response?.data?.visits.values,
          response?.data?.visits.totalVisits,
        );
        // Update pieChartData
        setGraphs((prevGraphs) => ({
          ...prevGraphs,
          visits: {
            ...prevGraphs.visits,
            pieChart,
            colors: response?.data?.visits?.colors, // Adding an array for colors
            total: response?.data?.visits.totalVisits,
          },
        }));
      }

      changeLoadingState('visitGraphLoading', false);
    } catch (error) {
      if (!apiController.signal.aborted) {
        changeLoadingState('visitGraphLoading', false);
      }
    } finally {
      changeLoadingState('visitGraphLoading', false);
    }
  };

  const fetchGraphContractedRevenueData = async (queryParams, apiController) => {
    changeLoadingState('contractedRevenueLoading', true);
    // const apiController = getNewApiController();

    try {
      const response = await getContractRevenueStats(queryParams, { signal: apiController.signal });
      if (response?.statusCode === 200) {
        /**
         * PIECHART
         * Transform the data to match the format expected by ECharts
         * Transform data using helper functions
         */
        const pieChart = transformPieChartData(
          response?.data?.contractedRevenue.labels,
          response?.data?.contractedRevenue.values,
          response?.data?.contractedRevenue.totalRevenue,
        );
        // Update pieChartData
        setGraphs((prevGraphs) => ({
          ...prevGraphs,
          contractedRevenueChart: {
            ...pieChart,
            totalRevenue: response?.data?.contractedRevenue?.totalRevenue,
            colors: response?.data?.contractedRevenue?.colors,
            percentage: response?.data?.contractedRevenue?.contractedRevenuePercentage,
          },
        }));
      }

      changeLoadingState('contractedRevenueLoading', false);
    } catch (error) {
      if (!apiController.signal.aborted) {
        // Do anything
      }
      changeLoadingState('contractedRevenueLoading', false);
    }
  };

  const fetchKeyMetricsData = async (queryParams, apiController) => {
    changeLoadingState('keyMetricsLoading', true);
    // const apiController = getNewApiController();

    try {
      const response = await getKeyMetricsStats(queryParams, { signal: apiController.signal });
      if (response?.statusCode === 200) setKeyMetricsData(response?.data?.table);

      changeLoadingState('keyMetricsLoading', false);
    } catch (error) {
      if (!apiController.signal.aborted) {
        changeLoadingState('keyMetricsLoading', false);
      }
    }
  };

  const fetchSalesFunnelData = async (queryParams, apiController) => {
    changeLoadingState('salesFunnelLoading', true);
    // const apiController = getNewApiController();

    try {
      const response = await getSalesFunnelStats(queryParams, { signal: apiController.signal });
      if (response?.statusCode === 200) {
        const saleFunnelData = response?.data?.salesFunnel;

        const translatedVisits = t('sales.dashboard.visits');
        const translatedProposals = t('sales.dashboard.proposal');
        const translatedContracts = t('sales.dashboard.contracts');
        const translatedLost = t('sales.dashboard.lost');

        const translateObjectKeys = (obj) => {
          if (!obj) return {};
          return {
            [translatedVisits]: obj.visits,
            [translatedProposals]: obj.proposals,
            [translatedContracts]: obj.contracts,
            [translatedLost]: obj.lost,
          };
        };

        const translatedSaleFunnel = {
          ...saleFunnelData,
          data: translateObjectKeys(saleFunnelData?.data),
          stats: translateObjectKeys(saleFunnelData?.stats),
          colors: translateObjectKeys(saleFunnelData?.colors),
        };

        setGraphs((prevGraphs) => ({
          ...prevGraphs,
          saleFunnel: translatedSaleFunnel,
        }));
      }

      changeLoadingState('salesFunnelLoading', false);
    } catch (error) {
      if (!apiController.signal.aborted) {
        changeLoadingState('salesFunnelLoading', false);
      }
    } finally {
      changeLoadingState('salesFunnelLoading', false);
    }
  };

  const fetchMembers = async () => {
    changeLoadingState('salesFunnelLoading', true);
    try {
      const response = await getMembers();
      if (response?.statusCode === 200)
        setOptions((prevOptions) => ({
          ...prevOptions,
          userIds: response?.data?.members,
        }));

      changeLoadingState('salesFunnelLoading', false);
    } catch (error) {
      changeLoadingState('salesFunnelLoading', false);
    }
  };

  const _fetchSalesPersonInsight = async () => {
    changeLoadingState('salesPersonInsight', true);

    try {
      const response = await getSalesPersonInsight();
      if (response?.statusCode === 200) {
        const insights = response?.data?.salesPersonInsights;
        const dataLabels = insights.dataLabels?.map(
          (item) =>
            `${capitalizeFirstLetter(item.name)} \n ${item.amount ? numberToUsdCurrencyFormat(item.amount) : ''}`,
        );
        const series = insights.series;
        setGraphs((prevGraphs) => ({
          ...prevGraphs,
          salesPersonInsight: {
            colors: insights?.colors,
            dataLabels,
            series,
          },
        }));
      }

      changeLoadingState('salesPersonInsight', false);
    } catch (error) {
      changeLoadingState('salesPersonInsight', false);
    }
  };

  const exportOverallGraphStats = async () => {
    setExportAPICalled(true);
    try {
      // Make sure formData.states is not null/undefined
      let stateIds = [];
      let userIds = [];
      let startDate = '';
      let endDate = '';

      if (formData?.states) {
        // Convert the array of state objects to an array of state IDs
        stateIds = formData.states.map((state) => state.value);
      }

      if (formData?.selectedDates) {
        startDate = formData?.selectedDates?.[0] ? formatDate(formData?.selectedDates?.[0]) : '';
        endDate = formData?.selectedDates?.[1] ? formatDate(formData?.selectedDates?.[1]) : '';
      }

      if (formData?.userIds) userIds = formData?.userIds;

      const queryParams = {
        stateIds,
        startDate,
        endDate,
        userIds,
      };
      const response = await exportDashboardGraphs(queryParams);
      if (response.statusCode === 200) {
        setExportAPICalled(false);
        //show toast that you data has been exported on the email
        toast.success(response?.message, {
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
      }
    } catch (error) {
      setExportAPICalled(false);
      // show error
      toast.error(error?.message, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
    handleCloseModal();
  };

  // const handleChange = (name, newValue) => {
  //   setFilters((a) => {
  //     return {
  //       ...a,
  //       [name]: newValue,
  //     };
  //   });
  // };
  //
  // const handleRangeSliderToggle = (event, name) => {
  //   setAnchors({
  //     [name]: event?.currentTarget || null,
  //   });
  // };

  // Visits Popover

  /**
   * API calls which will trigged on change filters
   */
  useEffect(() => {
    // Skip the first render as it is rendering it twice
    if (!hasMounted?.current) {
      hasMounted.current = true;
      return;
    }

    // Make sure formData.states is not null/undefined
    let stateIds = [];
    let userIds = [];
    let startDate = '';
    let endDate = '';

    if (formData?.states) {
      // Convert the array of state objects to an array of state IDs
      stateIds = formData.states.map((state) => state.value);
    }

    if (formData?.selectedDates) {
      startDate = formData?.selectedDates?.[0] ? formatDate(formData?.selectedDates?.[0]) : '';
      endDate = formData?.selectedDates?.[1] ? formatDate(formData?.selectedDates?.[1]) : '';
    }

    if (formData?.userIds) userIds = formData?.userIds;

    const queryParams = {
      stateIds,
      startDate,
      endDate,
      userIds,
    };

    const apiController = getNewApiController();

    fetchGraphVisitsData(queryParams, apiController);
    fetchGraphContractedRevenueData(queryParams, apiController);
    fetchKeyMetricsData(queryParams, apiController);
    fetchSalesFunnelData(queryParams, apiController);

    return () => {
      apiController.abort();
    };
  }, [formData.states, formData.selectedDates, formData.userIds]);

  /**
   * API call to trigger once page loaded
   */
  useEffect(() => {
    fetchMembers();
  }, []);

  const memoizedSelectedMemebers = useMemo(() => {
    return options?.userIds.filter((member) => formData?.userIds?.includes(member.id));
  }, [JSON.stringify(formData), options?.userIds]);

  const history = useHistory();

  const handleRedirect = () => {
    // Define your state object
    const state = {
      salesPersonInsightsFilters: {
        ...salesPInsighFilters,
        selectedDates: salesPInsighFilters?.selectedDates?.map((date) =>
          date ? dayjs(date).toISOString() : null,
        ),
      },
    };
    // Redirect to the next page with state
    history.push(`${SALES_DASHBOARD_SALES_PERSON_INSIGHTS}`, state);
  };

  const goToDecisionMakingGraph = () => {
    // Define your state object
    const state = {
      decisionMakingMeetingFilters: {
        ...meetingGraphFilters,
        selectedDates: meetingGraphFilters?.selectedDates?.map((date) =>
          date ? dayjs(date).toISOString() : null,
        ),
      },
    };
    history.push(`${SALES_DASHBOARD_DECISION_MAKING}`, state);
  };

  return (
    <Box className={classes.dashboardsales}>
      {/* header? */}
      <Box className={classes.saleDashHeader}>
        <Typography className={classes.dataAmount}>{t('sales.dashboard.salesInsights')}</Typography>{' '}
        <Box className={classes.salesCustomDropdown}>
          <CustomDropDown
            label={t('sales.users.selectStates')}
            name="states"
            options={states}
            selectedValues={formData.states}
            handleChange={handleStateChange}
            multiSelect={true}
            checkmark={true}
            searchable={true}
            withTiles={true}
            placeHolder={t('sales.users.selectStates')}
            className={classes.dropdownWrap}
            placeHolderClassName={classes.placeHolderColor}
            clearAll={true}
          />
          <CustomDropDown
            label={t('sales.locations.selectMember')}
            name="userIds"
            id="userIds"
            placeHolder={`${t('sales.locations.selectMember')}`}
            placeHolderClassName={classes.placeHolderColor}
            options={transformArrayForOptions(options?.userIds, 'name', 'id') || []}
            selectedValues={transformArrayForOptions(memoizedSelectedMemebers, 'name', 'id') || []}
            handleChange={(event) => handleMultipleSelectedValues(event, 'userIds')}
            searchPlaceholder={t('sales.locations.search')}
            className={classes?.dropdownWrap}
            multiSelect
            checkmark
            searchable
            clearAll={true}
            withTiles
          />

          <Box className={classes.reportsListingsHeaderRightDate}>
            <DateRangePickerWithButtons
              format={dateFormat}
              selectedDates={formData?.selectedDates}
              setDates={(dates) => {
                setFormData((prevState) => {
                  return {
                    ...prevState,
                    selectedDates: dates,
                  };
                });
              }}
            />
          </Box>
          <Box className={classes.exportWrap}>
            <Button
              variant="onlyText"
              onClick={handleOpenModal}
              endIcon={<DownloadCloudICon />}
              className={classes.exportBtn}
              disableRipple
            >
              {t('sales.dashboard.export')}
            </Button>
          </Box>
        </Box>
      </Box>
      {/* chart grid? */}
      <Grid container spacing={0} className={classes.borderTopBottom}>
        {/* visit chart row*/}
        <Grid item xs={12} lg={8} md={12} className={classes.borderRight}>
          <Grid container spacing={0} className={classes.borderBottom}>
            <Grid item xs={6} lg={6} md={6} className={classes.borderRight}>
              {loading?.visitGraphLoading ? (
                <Box className={classes.chart}>
                  <PieChartSkeleton
                    legendCount={4}
                    title={t('sales.dashboard.visits')}
                    isValue={true}
                  />
                </Box>
              ) : (
                <Box className={classes.chart}>
                  <Box className={classes.visitChartInfo}>
                    <Typography className={classes.chartHeading}>
                      {t('sales.dashboard.visits')}
                    </Typography>
                    <Typography variant="h4" className={classes.dataAmount}>
                      {fomatNumbersWithCommas(graphs?.visits.total, 0) || NA}
                    </Typography>
                    <Typography variant="body3" className={classes.textSmall}>
                      {t('sales.dashboard.locationVisit')}
                    </Typography>
                    <PieChart
                      heading={t('sales.dashboard.BuisnessOverView')}
                      colors={graphs?.visits?.colors}
                      data={graphs?.visits?.pieChart?.data}
                      stats={graphs?.visits?.pieChart?.total}
                      className={classes.chartWrapper}
                      toolTipFormatter="{b}: {c}"
                      style={{ height: '220px', width: '100%' }}
                      decimal={0}
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
                      legedFormatter="value"
                    />
                  </Box>
                </Box>
              )}
            </Grid>
            <Grid item xs={6} lg={6} md={6}>
              <Box className={classes.chart}>
                {loading?.contractedRevenueLoading ? (
                  <Box className={classes.pieChartSkeletonWrapper}>
                    <PieChartSkeleton
                      legendCount={2}
                      title={t('sales.dashboard.contractedRevenue')}
                      isValue={true}
                    />
                  </Box>
                ) : (
                  <Box className={classes.chartInfo}>
                    <Typography className={classes.chartHeading}>
                      {t('sales.dashboard.contractedRevenue')}
                    </Typography>
                    <Typography variant="h4" className={classes.dataAmount}>
                      {`${graphs?.contractedRevenueChart?.totalRevenue ? `${symbol}${formatCurrencyWithCommasAndSuffix(graphs?.contractedRevenueChart?.totalRevenue)}` : `${symbol}0`}`}
                    </Typography>
                    <PieChart
                      heading={t('sales.dashboard.BuisnessOverView')}
                      colors={graphs?.contractedRevenueChart?.colors}
                      data={graphs?.contractedRevenueChart?.data}
                      stats={graphs?.contractedRevenueChart?.total}
                      className={classes.chartWrapper}
                      toolTipFormatter={`{b}: ${symbol}{c}`}
                      style={{ height: '220px', width: '100%' }}
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
                      legedFormatter={symbol}
                    />
                  </Box>
                )}
              </Box>
            </Grid>
          </Grid>
          <Grid>
            {/* //Sales Funnel */}
            {loading?.salesFunnelLoading ? (
              <Box className={classes.keyMetricsWrapper}>
                <LineChartSkeleton title={t('sales.dashboard.salesFunnel')} />
              </Box>
            ) : (
              <Box className={classNames(classes.keyMetricsWrapper, classes.maxWidCol)}>
                <Box className={classes.chartInfo}>
                  <Box className={classes.headerBar}>
                    <Box className={classes.ratioWrapper}>
                      <Typography className={classes.chartHeading}>
                        {t('sales.dashboard.salesFunnel')}
                      </Typography>
                      <Box className={classes.legendsLineChart}>
                        <Box className={classes.legendLineChart}>
                          <Box
                            className={classNames(
                              classes.legendLineChartIndicator,
                              classes.legendWarning,
                            )}
                          />
                          <Typography variant="subtitle3" className={classes.legendLineChartText}>
                            {t('sales.dashboard.visits')}
                          </Typography>
                        </Box>
                        <Box className={classes.legendLineChart}>
                          <Box
                            className={classNames(
                              classes.legendLineChartIndicator,
                              classes.legendPrimary,
                            )}
                          />
                          <Typography variant="subtitle3" className={classes.legendLineChartText}>
                            {t('sales.dashboard.proposal')}
                          </Typography>
                        </Box>
                        <Box className={classes.legendLineChart}>
                          <Box
                            className={classNames(
                              classes.legendLineChartIndicator,
                              classes.legendSuccess,
                            )}
                          />
                          <Typography variant="subtitle3" className={classes.legendLineChartText}>
                            {t('sales.dashboard.contracts')}
                          </Typography>
                        </Box>
                        <Box className={classes.legendLineChart}>
                          <Box
                            className={classNames(
                              classes.legendLineChartIndicator,
                              classes.legendDanger,
                            )}
                          />
                          <Typography variant="subtitle3" className={classes.legendLineChartText}>
                            {t('sales.dashboard.lost')}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                </Box>

                {!isObjectEmpty(graphs?.saleFunnel) && (
                  <LineToolTouchChart
                    heading={'dcdsf'}
                    colors={graphs?.saleFunnel?.colors}
                    data={graphs?.saleFunnel?.data}
                    dataLabels={graphs?.saleFunnel?.dataLabels}
                    stats={graphs?.saleFunnel?.stats}
                    style={{ height: '200px', width: '100%' }}
                    dataZoom="disabled"
                  />
                )}
              </Box>
            )}
          </Grid>
        </Grid>
        {/* sales key */}
        <Grid item xs={12} md={12} lg={4} className={classes.keyWraper}>
          <Box className={classNames(classes.keyMetricsWrapper)}>
            <Box className={classes.chartInfo}>
              <Typography className={classes.chartHeading} mb={4}>
                {t('sales.dashboard.KeyMatrices')}
              </Typography>

              {loading?.keyMetricsLoading ? (
                <Box className={classes.hell}>
                  <Box className={classes.metricList}>
                    <Typography variant="body2" className={classes.labelStyles}>
                      {t('sales.dashboard.totalVisits')}
                    </Typography>
                    <Skeleton animation="wave" variant="rounded" width={120} height={10} />
                  </Box>
                  <Box className={classes.metricList}>
                    <Typography variant="body2" className={classes.labelStyles}>
                      {t('sales.dashboard.decisionMakerMeetings')}
                    </Typography>
                    <Skeleton animation="wave" variant="rounded" width={120} height={10} />
                  </Box>
                  <Box className={classes.metricList}>
                    <Typography variant="body2" className={classes.labelStyles}>
                      {t('sales.dashboard.proposalSent')}
                    </Typography>
                    <Skeleton animation="wave" variant="rounded" width={130} height={10} />
                  </Box>
                  <Box className={classes.metricList}>
                    <Typography variant="body2" className={classes.labelStyles}>
                      {t('sales.dashboard.proposalWon')}
                    </Typography>
                    <Skeleton animation="wave" variant="rounded" width={130} height={10} />
                  </Box>
                  <Box className={classes.metricList}>
                    <Typography variant="body2" className={classes.labelStyles}>
                      {t('sales.dashboard.proposalLost')}
                    </Typography>
                    <Skeleton animation="wave" variant="rounded" width={130} height={10} />
                  </Box>
                  <Box className={classes.metricList}>
                    <Typography variant="body2" className={classes.labelStyles}>
                      {t('sales.dashboard.avgPropsalRev')}
                    </Typography>
                    <Skeleton animation="wave" variant="rounded" width={130} height={10} />
                  </Box>
                  <Box className={classes.metricList}>
                    <Typography variant="body2" className={classes.labelStyles}>
                      {t('sales.dashboard.contractMonthlyRev')}
                    </Typography>
                    <Skeleton animation="wave" variant="rounded" width={130} height={10} />
                  </Box>
                  <Box className={classes.metricList}>
                    <Typography variant="body2" className={classes.labelStyles}>
                      {t('sales.dashboard.AvgcontractRev')}
                    </Typography>
                    <Skeleton animation="wave" variant="rounded" width={130} height={10} />
                  </Box>
                  <Box className={classes.metricList}>
                    <Typography variant="body2" className={classes.labelStyles}>
                      {t('sales.dashboard.visitPerProposal')}
                    </Typography>
                    <Skeleton animation="wave" variant="rounded" width={130} height={10} />
                  </Box>
                  <Box className={classes.metricList}>
                    <Typography variant="body2" className={classes.labelStyles}>
                      {t('sales.dashboard.visitPerContract')}
                    </Typography>
                    <Skeleton animation="wave" variant="rounded" width={130} height={10} />
                  </Box>
                  <Box className={classes.metricList}>
                    <Typography variant="body2" className={classes.labelStyles}>
                      {t('sales.dashboard.salesPersonInterns', {
                        salesManagerRoleLabel: getLabel('roles', 'sales_manager'),
                        salesPersonRoleLabel: getLabel('roles', 'sales_person'),
                      })}
                    </Typography>
                    <Skeleton animation="wave" variant="rounded" width={130} height={10} />
                  </Box>
                </Box>
              ) : (
                <Box className={classes.hell}>
                  <Box className={classes.metricList}>
                    <Typography variant="body2" className={classes.labelStyles}>
                      {t('sales.dashboard.totalVisits')}
                    </Typography>
                    <Typography variant="h5" className={classes.valueStyles}>
                      {fomatNumbersWithCommas(keyMetricsData?.total_visits, 0)}
                    </Typography>
                  </Box>
                  <Box className={classes.metricList}>
                    <Typography variant="body2" className={classes.labelStyles}>
                      {t('sales.dashboard.decisionMakerMeetings')}
                    </Typography>
                    <Typography variant="h5" className={classes.valueStyles}>
                      {`${fomatNumbersWithCommas(keyMetricsData?.decision_maker_meetings_count, 0)} • ${keyMetricsData?.decision_maker_meetings_percentage}%`}
                    </Typography>
                  </Box>
                  <Box className={classes.metricList}>
                    <Typography variant="body2" className={classes.labelStyles}>
                      {t('sales.dashboard.proposalSent')}
                    </Typography>
                    <Typography variant="h5" className={classes.valueStyles}>
                      {`${fomatNumbersWithCommas(keyMetricsData?.proposals_sent_count, 0)} • ${keyMetricsData?.proposals_sent_percentage}%`}
                    </Typography>
                  </Box>
                  <Box className={classes.metricList}>
                    <Typography variant="body2" className={classes.labelStyles}>
                      {t('sales.dashboard.proposalWon')}
                    </Typography>
                    <Typography variant="h5" className={classes.valueStyles}>
                      {`${fomatNumbersWithCommas(keyMetricsData?.proposals_won_count, 0)} • ${keyMetricsData?.proposals_won_percentage}%`}
                    </Typography>
                  </Box>
                  <Box className={classes.metricList}>
                    <Typography variant="body2" className={classes.labelStyles}>
                      {t('sales.dashboard.proposalLost')}
                    </Typography>
                    <Typography variant="h5" className={classes.valueStyles}>
                      {`${fomatNumbersWithCommas(keyMetricsData?.proposals_lost_count, 0)} • ${keyMetricsData?.proposals_lost_percentage}%`}
                    </Typography>
                  </Box>
                  <Box className={classes.metricList}>
                    <Typography variant="body2" className={classes.labelStyles}>
                      {t('sales.dashboard.avgPropsalRev')}
                    </Typography>
                    <Typography variant="h5" className={classes.valueStyles}>
                      {`${symbol}${fomatNumbersWithCommas(keyMetricsData?.avg_proposal_revenue)}`}
                    </Typography>
                  </Box>
                  <Box className={classes.metricList}>
                    <Typography variant="body2" className={classes.labelStyles}>
                      {t('sales.dashboard.contractMonthlyRev')}
                    </Typography>
                    <Typography variant="h5" className={classes.valueStyles}>
                      {`${symbol}${fomatNumbersWithCommas(keyMetricsData?.contract_monthly_revenue)} • ${keyMetricsData?.contract_monthly_revenue_percentage}%`}
                    </Typography>
                  </Box>
                  <Box className={classes.metricList}>
                    <Typography variant="body2" className={classes.labelStyles}>
                      {t('sales.dashboard.AvgcontractRev')}
                    </Typography>
                    <Typography variant="h5" className={classes.valueStyles}>
                      {`${symbol}${fomatNumbersWithCommas(keyMetricsData?.avg_contract_revenue)}`}
                    </Typography>
                  </Box>
                  <Box className={classes.metricList}>
                    <Typography variant="body2" className={classes.labelStyles}>
                      {t('sales.dashboard.visitPerProposal')}
                    </Typography>
                    <Typography variant="h5" className={classes.valueStyles}>
                      {fomatNumbersWithCommas(keyMetricsData?.visits_per_propsal)}
                    </Typography>
                  </Box>
                  <Box className={classes.metricList}>
                    <Typography variant="body2" className={classes.labelStyles}>
                      {t('sales.dashboard.visitPerContract')}
                    </Typography>
                    <Typography variant="h5" className={classes.valueStyles}>
                      {fomatNumbersWithCommas(keyMetricsData?.visits_per_contract)}
                    </Typography>
                  </Box>
                  <Box className={classes.metricList}>
                    <Typography variant="body2" className={classes.labelStyles}>
                      {t('sales.dashboard.salesPersonInterns', {
                        salesManagerRoleLabel: getLabel('roles', 'sales_manager'),
                        salesPersonRoleLabel: getLabel('roles', 'sales_person'),
                      })}
                    </Typography>
                    <Typography variant="h5" className={classes.valueStyles}>
                      {fomatNumbersWithCommas(keyMetricsData?.sales_persons_and_interns, 0)}
                    </Typography>
                  </Box>
                </Box>
              )}
            </Box>
          </Box>
        </Grid>
      </Grid>
      <Box>
        <SalesPersonInsights
          type="dashboard"
          options={options}
          setSalesPInsighFilters={setSalesPInsighFilters}
        />
        <Box className={classes.chartFooters}>
          {/* <Link to={SALES_DASHBOARD_SALES_PERSON_INSIGHTS}> */}
          <Box className={classes.userLink} onClick={handleRedirect}>
            <Typography className={classes.charLink} variant="button">
              {t('sales.dashboard.viewAll')} {t('sales.dashboard.users')}
              <ChevronRightIcon />
            </Typography>
          </Box>
          {/* </Link> */}
        </Box>
      </Box>
      <Box>
        <DecisionMeetingGraph
          type={pageType.dashboard}
          options={options}
          setMeetingGraphFilters={setMeetingGraphFilters}
        />
        <Box className={classes.chartFooters}>
          {/* <Link to={SALES_DASHBOARD_SALES_PERSON_INSIGHTS}> */}
          <Box className={classes.userLink} onClick={goToDecisionMakingGraph}>
            <Typography className={classes.charLink} variant="button">
              {t('sales.dashboard.viewAll')} {t('sales.dashboard.users')}
              <ChevronRightIcon />
            </Typography>
          </Box>
          {/* </Link> */}
        </Box>
      </Box>
      {/* //tabel */}
      <Grid container spacing={0} className={classes.borderTop}>
        <Grid item xs={12} md={12} lg={6} className={classes.borderRight}>
          <Box className={classes.wonStatus}>
            <Typography variant="h5">{t('sales.dashboard.proposalWon')}</Typography>
            <Link to={SALES_DASHBOARD_PROPOSAL_WON}>
              <Typography className={classes.tableLink} variant="button">
                {t('sales.dashboard.viewAll')} <ChevronRightIcon />
              </Typography>
            </Link>
          </Box>
          <Box>
            <ProposalWon calledFrom={'dashboard'} />
          </Box>
        </Grid>
        <Grid item xs={12} md={12} lg={6}>
          <Box className={classes.wonStatus}>
            <Typography variant="h5">{t('sales.dashboard.proposalLost')}</Typography>
            <Link to={SALES_DASHBOARD_PROPOSAL_LOST}>
              <Typography className={classes.tableLink} variant="button">
                {t('sales.dashboard.viewAll')}
                <ChevronRightIcon />
              </Typography>
            </Link>
          </Box>
          <Box>
            <ProposalLost calledFrom={'dashboard'} />
          </Box>
        </Grid>
      </Grid>
      {openModal && (
        <ExportModal
          openModal={openModal}
          handleCloseModal={handleCloseModal}
          exportData={exportOverallGraphStats}
          disable={exportAPICalled}
        />
      )}
    </Box>
  );
}
