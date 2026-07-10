import { Box, Button, Popover, Typography } from '@mui/material';
import { ReactComponent as ChevronDown } from 'assets/svg/chevronDown.svg';
import CustomDropDown from 'commonComponents/customDropDown';
import BarYChart from 'commonComponents/eBarYChart';
import RangeSlider from 'commonComponents/rangeSlider';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useStyles } from 'salesPages/dashboard/dashboardStyle';
import ExportModal from 'salesPages/dashboard/exportModal';
import {
  exportDashboardGraphs,
  getDashboardFiltersData,
  getMembers,
  getSalesPersonInsight,
} from 'services/salesDashboard.service';
import DateRangePickerWithButtons from 'src/app/components/common/RangeDatepicker';
import LineChartSkeleton from 'src/app/components/common/skeletonLoader/lineChartSkeleton';
import { SALES_DASHBOARD } from 'src/app/router/constant/ROUTE';
import { BackIcon } from 'src/assets/svg';
import { useApiControllers } from 'src/helper/axios';
import { formatDate, formatNumberToKMBT } from 'src/helper/utilityFunctions';
import useDebounceHook from 'src/hooks/useDebounceHook';
import useRegionalStateCityHook from 'src/hooks/useRegionalStateCityHook';
import { getDisplayConfiguration } from 'src/redux/store/slices/regionalCountryConfiguration';
import transformArrayForOptions from 'src/utils/array/transformArrayForOptions';
import { toastSettings } from 'src/utils/constants';
import { fomatNumbersWithCommas } from 'src/utils/currencyFormater';
import { capitalizeFirstLetter } from 'src/utils/string/common';

const filtersData = {
  visitsRange: [0, 100],
  contractsRange: [0, 100],
  revenueRange: [0, 100],
};

const params = {
  contractsRange: [null, null],
  minContracts: null,
  maxContracts: null,
  visitsRange: [null, null],
  minVisits: null,
  maxVisits: null,
  revenueRange: [null, null],
  minRevenue: null,
  maxRevenue: null,
  limit: null,
  userIds: [],
  selectedDates: [dayjs().subtract(30, 'day'), dayjs()],
};

/** Map getSalesPersonInsight API series keys to dashboard i18n keys for chart legend */
const SALES_PERSON_INSIGHT_SERIES_KEYS = {
  visits: 'sales.dashboard.visits',
  decisionMakerMeetings: 'sales.dashboard.decisionMakerMeetings',
  proposals: 'sales.dashboard.proposals',
  contracts: 'sales.dashboard.contracts',
  lost: 'sales.dashboard.lost',
};

const SalesPersonInsights = ({ type, setSalesPInsighFilters }) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const location = useLocation();
  const { symbol, dateFormat } = useSelector(getDisplayConfiguration);

  const { getNewApiController } = useApiControllers();

  const [queryParams, setQueryParams] = useState(params);

  const [openModal, setOpenModal] = useState(false);

  const [exportAPICalled, setExportAPICalled] = useState(false);

  const _handleOpenModal = () => setOpenModal(true);

  const handleCloseModal = () => setOpenModal(false);

  // Update filters whenever queryParams changes
  useEffect(() => {
    // Set filters to the current value of queryParams
    if (setSalesPInsighFilters) {
      setSalesPInsighFilters((prevState) => ({
        ...prevState,
        ...queryParams,
        states: queryParams?.states,
      }));
    }
  }, [queryParams]);

  /**
   * use formData object for state filter
   */
  const [formData, setFormData] = useState({
    states: [],
  });

  // Update filters whenever formdata changes
  useEffect(() => {
    // Set filters to the current value of formdata
    if (setSalesPInsighFilters) {
      setSalesPInsighFilters((prevState) => ({
        ...prevState,
        states: formData?.states,
      }));
    }
  }, [formData]);

  /**
   * filter options
   */
  const [options, setOptions] = useState({
    userIds: [],
  });
  /**
   * Refs to handle UseEffect intiall calls
   */
  const initialRender = useRef(true);
  const initialRenderUseEffect = useRef(true);
  /**
   * hook to for state
   */
  const { states } = useRegionalStateCityHook();

  const handleStateChange = (event) => {
    const { value } = event.target;
    setFormData((prevState) => ({
      ...prevState,
      states: value,
    }));
  };

  const [_loading, setLoading] = useState({
    visitGraphLoading: false,
    contractedRevenueLoading: false,
    keyMetricsLoading: false,
    salesFunnelLoading: false,
    salesPInsightlLoading: false,
  });

  const [graphs, setGraphs] = useState({
    visitsChart: {},
    visits: {},
    contractedRevenueChart: {},
    saleFunnel: {},
    salesPersonInsight: {},
  });

  const changeLoadingState = (name, status) => {
    setLoading((data) => {
      return {
        ...data,
        [name]: status,
      };
    });
  };

  // Contract Popover
  const [anchors, setAnchors] = useState({
    contracts: null,
    visits: null,
    revenue: null,
  });

  const [filters, setFilters] = useState(filtersData);

  const handleMultipleSelectedValues = async (event, field) => {
    /**
     * get the ids from selected values
     */
    const selectedValues = event.target.value?.map((value) => parseInt(value.value));
    setQueryParams((prevState) => ({
      ...prevState,
      [field]: selectedValues,
    }));
  };

  const handleChange = (name, newValue) => {
    // Replace the value at the first index with 0.
    // newValue[0] = 0;

    setQueryParams((a) => {
      return {
        ...a,
        [name]: newValue,
      };
    });
  };

  const handleRangeSliderToggle = (event, name) => {
    setAnchors({
      [name]: event?.currentTarget || null,
    });
  };

  const assignMaxValue = (arr) => {
    let obj = { min: null, max: null };
    if (!arr.length) return obj;
    if (!arr[0] && arr[1]) {
      obj = {
        min: filters.contractsRange[0],
        max: arr[1],
      };
      return obj;
    }
    if (arr[0] && !arr[1]) {
      obj = {
        min: arr[0],
        max: filters.contractsRange[1],
      };
      return obj;
    }
    obj = {
      min: arr[0],
      max: arr[1],
    };
    return obj;
  };

  const fetchSalesPersonInsight = async (queryParams) => {
    changeLoadingState('salesPInsightlLoading', true);

    const apiController = getNewApiController();

    try {
      let params = { ...queryParams };

      /**
       * format the selected States to send in query parameter
       */
      if (formData?.states) {
        let stateIds = [];
        // Convert the array of state objects to an array of state IDs
        stateIds = formData.states.map((state) => state.value);
        params = {
          ...params,
          stateIds: stateIds,
        };
      }

      /**
       * if we have date range values
       */
      if (queryParams?.selectedDates) {
        params = {
          ...params,
          startDate: queryParams?.selectedDates?.[0]
            ? formatDate(queryParams?.selectedDates?.[0])
            : '',
          endDate: queryParams?.selectedDates?.[1]
            ? formatDate(queryParams?.selectedDates?.[1])
            : '',
        };
      }
      /**
       * if we are showing the component on dashboard only then show only 5 records
       */
      if (type === 'dashboard') {
        params = {
          ...params,
          limit: 5,
        };
      }

      /**
       * format the contract and visit range filter
       */
      if (queryParams?.contractsRange) {
        const minMax = assignMaxValue(queryParams.contractsRange);
        /**
         * only add parameter if max value is greater then 0
         */
        if (minMax.max > 0) {
          params.minContracts = minMax.min;
          params.maxContracts = minMax.max;
        }
      }

      if (queryParams?.visitsRange) {
        const minMax = assignMaxValue(queryParams.visitsRange);
        /**
         * only add parameter if max value is greater then 0
         */
        if (minMax.max > 0) {
          params.minVisits = minMax.min;
          params.maxVisits = minMax.max;
        }
      }

      if (queryParams?.revenueRange) {
        const minMax = assignMaxValue(queryParams.revenueRange);
        /**
         * only add parameter if max value is greater then 0
         */
        if (minMax.max > 0) {
          params.minRevenue = minMax.min;
          params.maxRevenue = minMax.max;
        }
      }

      /**
       * delete the following keys from the params object
       */
      delete params.contractsRange;
      delete params.visitsRange;
      delete params.revenueRange;
      delete params.selectedDates;

      const response = await getSalesPersonInsight(params, { signal: apiController.signal });
      if (response?.statusCode === 200) {
        const insights = response?.data?.salesPersonInsights;
        const dataLabels = insights.dataLabels?.map(
          (item) =>
            `${capitalizeFirstLetter(item.name)} - ${symbol}${formatNumberToKMBT(item.contractsAmount)} / ${symbol}${formatNumberToKMBT(item.proposalsAmount)}`,
        );
        setGraphs((prevGraphs) => ({
          ...prevGraphs,
          salesPersonInsight: {
            colors: insights?.colors,
            dataLabels,
            series: insights.series || {},
          },
        }));
      }

      changeLoadingState('salesPInsightlLoading', false);
    } catch (error) {
      changeLoadingState('salesPInsightlLoading', false);
      if (apiController.signal.aborted) {
        // Do something
      }
    }
  };

  const exportSalesInsightGraph = async () => {
    setExportAPICalled(true);
    try {
      let params = { ...queryParams };

      /**
       * format the selected States to send in query parameter
       */
      if (formData?.states) {
        let stateIds = [];
        // Convert the array of state objects to an array of state IDs
        stateIds = formData.states.map((state) => state.value);
        params = {
          ...params,
          stateIds: stateIds,
        };
      }

      /**
       * if we have date range values
       */
      if (queryParams?.selectedDates) {
        params = {
          ...params,
          startDate: queryParams?.selectedDates?.[0]
            ? formatDate(queryParams?.selectedDates?.[0])
            : '',
          endDate: queryParams?.selectedDates?.[1]
            ? formatDate(queryParams?.selectedDates?.[1])
            : '',
        };
      }
      /**
       * if we are showing the component on dashboard only then show only 5 records
       */
      if (type === 'dashboard') {
        params = {
          ...params,
          limit: 5,
        };
      }

      /**
       * format the contract and visit range filter
       */
      if (queryParams?.contractsRange) {
        const minMax = assignMaxValue(queryParams.contractsRange);
        /**
         * only add parameter if max value is greater then 0
         */
        if (minMax.max > 0) {
          params.minContracts = minMax.min;
          params.maxContracts = minMax.max;
        }
      }

      if (queryParams?.visitsRange) {
        const minMax = assignMaxValue(queryParams.visitsRange);
        /**
         * only add parameter if max value is greater then 0
         */
        if (minMax.max > 0) {
          params.minVisits = minMax.min;
          params.maxVisits = minMax.max;
        }
      }

      if (queryParams?.revenueRange) {
        const minMax = assignMaxValue(queryParams.revenueRange);
        /**
         * only add parameter if max value is greater then 0
         */
        if (minMax.max > 0) {
          params.minRevenue = minMax.min;
          params.maxRevenue = minMax.max;
        }
      }

      /**
       * delete the following keys from the params object
       */
      delete params.contractsRange;
      delete params.visitsRange;
      delete params.revenueRange;
      delete params.selectedDates;

      const response = await exportDashboardGraphs(params);
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
      toast.error(error?.message, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
    handleCloseModal();
  };

  const fetchRangeFiltersData = async () => {
    try {
      const response = await getDashboardFiltersData();
      if (response?.statusCode === 200) {
        // Update filtersData with values from API response.
        setFilters((prevFilters) => ({
          ...prevFilters,
          visitsRange: [0, response?.data?.filtersData?.max_visits],
          contractsRange: [0, response?.data.filtersData?.max_contracts],
          revenueRange: [0, response?.data.filtersData?.max_revenue],
        }));
      }

      /**
       * set values to range slider as well
       */
      // setQueryParams((prevFilters) => ({
      //   ...prevFilters,
      //   visitsRange: [0, response?.data?.filtersData.max_visits],
      //   contractsRange: [0, response?.data.filtersData.max_contracts],
      //   revenueRange: [0, response?.data.filtersData.max_revenue],
      // }));

      //as we need filter values so it's required to wait untill we have values
      // Call fetchSalesPersonInsight after setting initial values
      // await fetchSalesPersonInsight({
      //   ...params, // You may need to adjust this based on your requirements
      //   visitsRange: [0, response?.data?.filtersData.max_visits],
      //   contractsRange: [0, response?.data.filtersData.max_contracts],
      //   revenueRange: [0, response?.data.filtersData.max_revenue],
      // });
    } catch (error) {
      toast.error(error?.message, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  /**
   * fetch memebers list to show as an option in the dropdown
   */
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

  // Debounce only for contractsRange using useDebounceHook
  const debouncedFetchSalesPersonInsight = useDebounceHook(fetchSalesPersonInsight, 100);

  // useEffect to debounce fetchSalesPersonInsight specifically for contractsRange
  useEffect(() => {
    if (!initialRender.current) {
      if (queryParams.contractsRange || queryParams.visitsRange || queryParams.revenueRange) {
        debouncedFetchSalesPersonInsight(queryParams);
      }
    } else {
      // It's the initial render, update the ref to false with a 4-second delay
      const timeoutId = setTimeout(() => {
        initialRender.current = false;
      }, 4000); // 4 seconds delay

      // Clean up the timeout to avoid memory leaks
      return () => clearTimeout(timeoutId);
    }
  }, [
    queryParams?.contractsRange,
    queryParams?.visitsRange,
    queryParams?.revenueRange,
    queryParams?.revenueRange,
  ]);

  const memoizedSelectedMemebers = useMemo(() => {
    return options?.userIds.filter((member) => queryParams?.userIds?.includes(member.id));
  }, [JSON.stringify(queryParams), options?.userIds]);

  /** Map API series keys to translated labels for chart legend/tooltip */
  const mappedSalesPersonInsight = useMemo(() => {
    const raw = graphs?.salesPersonInsight || {};
    const rawSeries = raw.series || {};
    const series = {};
    Object.keys(rawSeries).forEach((key) => {
      const label = SALES_PERSON_INSIGHT_SERIES_KEYS[key]
        ? t(SALES_PERSON_INSIGHT_SERIES_KEYS[key])
        : key.replace(/([A-Z])/g, ' $1').trim();
      series[label] = rawSeries[key];
    });
    return {
      colors: raw.colors || [],
      dataLabels: raw.dataLabels || [],
      series,
    };
  }, [graphs?.salesPersonInsight, t]);

  const handleBack = () => {
    window.location.href = SALES_DASHBOARD;
  };

  useEffect(() => {
    fetchRangeFiltersData();
    fetchMembers();
  }, []);

  /**
   * this useEffect will only run when parameters will be changed
   */
  useEffect(() => {
    if (!initialRenderUseEffect.current) {
      fetchSalesPersonInsight(queryParams);
      initialRenderUseEffect.current = false;
    }
  }, [queryParams?.userIds, formData?.states, queryParams?.selectedDates]);

  /**
   * this useEffect will only run once for dashboard view of the component
   */
  useEffect(() => {
    if (type && initialRenderUseEffect.current) {
      fetchSalesPersonInsight(queryParams);
      initialRenderUseEffect.current = false;
    }
  }, []);

  /**
   * if we recieve any filter state from dashboard this will run
   */
  useEffect(() => {
    if (!type && initialRenderUseEffect.current && location.state) {
      const salesPersonInsightsFilters = location.state.salesPersonInsightsFilters;
      if (salesPersonInsightsFilters?.selectedDates) {
        salesPersonInsightsFilters.selectedDates = salesPersonInsightsFilters.selectedDates.map(
          (date) => (date ? dayjs(date) : null),
        );
      }
      setQueryParams(salesPersonInsightsFilters);
      setFormData((prevState) => ({
        ...prevState,
        states: salesPersonInsightsFilters?.states,
      }));
      initialRenderUseEffect.current = false;
    }
  }, [location?.state]);

  return (
    <>
      <Box
        className={type !== 'dashboard' ? classes.salesFunnelChartdetail : classes.salesFunnelChart}
      >
        {type !== 'dashboard' && (
          <Box>
            <Button variant="tertiaryGrey" startIcon={<BackIcon />} onClick={handleBack}>
              {t('links.back')}
            </Button>
          </Box>
        )}
        {/* header? */}
        <Box className={classes.headerBar}>
          {/*<Box className={classes.chipWrapper}>*/}
          {/*  <Typography*/}
          {/*    variant={`${type ? 'body1' : 'h1'}`}*/}
          {/*    className={type && classes.chartHeading}*/}
          {/*  >*/}
          {/*    {t('sales.dashboard.salesInsight')}*/}
          {/*  </Typography>*/}
          {/*</Box>*/}

          <Box>
            <Box className={classes.chipWrapper}>
              <Typography
                variant={`${type ? 'body1' : 'h1'}`}
                className={type && classes.chartHeading}
              >
                {t('sales.dashboard.salesInsight')}
              </Typography>
            </Box>

            <Box className={classes.chipWrapper} paddingLeft={2}>
              <Typography variant={'h6'}>{t('sales.dashboard.contractedProposed')}</Typography>
            </Box>
          </Box>
          <Box className={classes.salesCustomDropdown}>
            <Box>
              <Button
                variant="onlyText"
                className={classes.popButton}
                // aria-describedby={id}
                onClick={(e) => {
                  handleRangeSliderToggle(e, 'contracts');
                }}
                endIcon={<ChevronDown />}
                disableRipple
              >
                {t('sales.dashboard.contracts')}
              </Button>
              <Popover
                anchorEl={anchors.contracts}
                open={Boolean(anchors.contracts)}
                onClose={() => {
                  handleRangeSliderToggle(null, 'contracts');
                }}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'left',
                }}
                className={classes.popWrap}
              >
                <RangeSlider
                  label={t('sales.dashboard.contracts')}
                  name="contractsRange"
                  value={queryParams?.contractsRange}
                  handleChange={handleChange}
                  min={filters.contractsRange[0] || 0}
                  max={filters.contractsRange[1] || 100}
                  minPlaceholder={`${symbol}${fomatNumbersWithCommas(filters.contractsRange[0] || 0)}`}
                  maxPlaceholder={`${symbol}${fomatNumbersWithCommas(filters.contractsRange[1] || 100)}`}
                />
              </Popover>
            </Box>
            <Box>
              <Button
                variant="onlyText"
                className={classes.popButton}
                // aria-describedby={id}
                onClick={(e) => {
                  handleRangeSliderToggle(e, 'visits');
                }}
                endIcon={<ChevronDown />}
                disableRipple
              >
                {t('sales.dashboard.visits')}
              </Button>
              <Popover
                open={Boolean(anchors.visits)}
                anchorEl={anchors.visits}
                onClose={() => {
                  handleRangeSliderToggle(null, 'visits');
                }}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'left',
                }}
                className={classes.popWrap}
              >
                <RangeSlider
                  label={t('sales.dashboard.visits')}
                  value={queryParams?.visitsRange}
                  name="visitsRange"
                  handleChange={handleChange}
                  min={filters.visitsRange[0] || 0}
                  max={filters.visitsRange[1] || 100}
                  minPlaceholder={`${fomatNumbersWithCommas(filters.visitsRange[0] || 0)}`}
                  maxPlaceholder={`${fomatNumbersWithCommas(filters.visitsRange[1] || 100)}`}
                />
              </Popover>
            </Box>
            <Box>
              {' '}
              <Button
                variant="onlyText"
                className={classes.popButton}
                onClick={(e) => {
                  handleRangeSliderToggle(e, 'revenue');
                }}
                endIcon={<ChevronDown />}
                disableRipple
              >
                {t('sales.dashboard.revenue')}
              </Button>
              <Popover
                open={Boolean(anchors.revenue)}
                anchorEl={anchors.revenue}
                onClose={() => {
                  handleRangeSliderToggle(null, 'revenue');
                }}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'left',
                }}
                className={classes.popWrap}
              >
                <RangeSlider
                  label={t('sales.dashboard.revenue')}
                  value={queryParams?.revenueRange}
                  name="revenueRange"
                  handleChange={handleChange}
                  min={filters.revenueRange[0] || 0}
                  max={filters.revenueRange[1] || 100}
                  minPlaceholder={`${symbol}${fomatNumbersWithCommas(filters.revenueRange[0] || 0)}`}
                  maxPlaceholder={`${symbol}${fomatNumbersWithCommas(filters.revenueRange[1] || 100)}`}
                />
              </Popover>
            </Box>
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
              selectedValues={
                transformArrayForOptions(memoizedSelectedMemebers, 'name', 'id') || []
              }
              handleChange={(event) => handleMultipleSelectedValues(event, 'userIds')}
              searchPlaceholder={t('sales.locations.search')}
              className={classes?.dropdownWrap}
              multiSelect
              checkmark
              searchable
              clearAll={true}
              withTiles
              position="right"
            />

            <Box className={classes.countrySelectWrapper}>
              <Box className={classes.reportsListingsHeaderRightDate}>
                <DateRangePickerWithButtons
                  format={dateFormat}
                  selectedDates={queryParams?.selectedDates}
                  setDates={(dates) => {
                    if (!initialRenderUseEffect.current && !initialRender.current)
                      setQueryParams((prevState) => {
                        return {
                          ...prevState,
                          selectedDates: dates,
                        };
                      });
                  }}
                />
              </Box>
            </Box>

            {/*<Box className={classes.exportWrap}>*/}
            {/*  <Button*/}
            {/*    variant="onlyText"*/}
            {/*    onClick={handleOpenModal}*/}
            {/*    endIcon={<DownloadCloudICon />}*/}
            {/*    className={classes.exportBtn}*/}
            {/*    disableRipple*/}
            {/*    disabled={true}*/}
            {/*  >*/}
            {/*    {t('sales.dashboard.export')}*/}
            {/*  </Button>*/}
            {/*</Box>*/}
          </Box>
        </Box>

        {_loading?.salesPInsightlLoading ? (
          <Box className={classes.keyMetricsWrapper}>
            <LineChartSkeleton />
          </Box>
        ) : (
          <Box className={classes.chartSalesWrapper}>
            <Typography variant="body3" className={classes.salesPersons}>
              {t('sales.dashboard.salesTeam')}
            </Typography>
            <BarYChart
              heading={t('sales.dashboard.locationsBySalesPersons')}
              colors={mappedSalesPersonInsight.colors}
              dataLabels={mappedSalesPersonInsight.dataLabels}
              series={mappedSalesPersonInsight.series}
              style={{
                height: type ? '420px' : `${mappedSalesPersonInsight.dataLabels?.length * 60}px`,
                width: '100%',
              }}
            />
          </Box>
        )}
      </Box>
      {openModal && (
        <ExportModal
          openModal={openModal}
          handleCloseModal={handleCloseModal}
          exportData={exportSalesInsightGraph}
          disable={exportAPICalled}
        />
      )}
    </>
  );
};

SalesPersonInsights.propTypes = {
  type: PropTypes.string,
  setSalesPInsighFilters: PropTypes.func,
};

export default SalesPersonInsights;
