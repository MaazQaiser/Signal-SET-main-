import { Button, Popover, Typography } from '@mui/material';
import Box from '@mui/system/Box';
import { ReactComponent as ChevronDown } from 'assets/svg/chevronDown.svg';
import CustomDropDown from 'commonComponents/customDropDown';
import DecisionMakerGraph from 'commonComponents/eBarYChartDecisionMakerGraph';
import DateRangePickerWithButtons from 'commonComponents/RangeDatepicker';
import RangeSlider from 'commonComponents/rangeSlider';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { pageType } from 'salesPages/dashboard/dashboardConstant';
import { useStyles } from 'salesPages/dashboard/dashboardStyle';
import ExportModal from 'salesPages/dashboard/exportModal';
import {
  exportDashboardGraphs,
  getDashboardFiltersData,
  getDecisionMakerMeetings,
  getMembers,
} from 'services/salesDashboard.service';
import { SALES_DASHBOARD } from 'src/app/router/constant/ROUTE';
import { BackIcon } from 'src/assets/svg';
import { useApiControllers } from 'src/helper/axios';
import { formatDate } from 'src/helper/utilityFunctions';
import useDebounceHook from 'src/hooks/useDebounceHook';
import { getDisplayConfiguration } from 'src/redux/store/slices/regionalCountryConfiguration';
import transformArrayForOptions from 'src/utils/array/transformArrayForOptions';
import { toastSettings } from 'src/utils/constants';
import { extractValuesByKeyFromInput } from 'src/utils/dropdownValueExtractor';

const params = {
  meetings: [null, null],
  limit: null,
  userIds: [],
  selectedDates: [dayjs().subtract(30, 'day'), dayjs()],
};

const filtersData = {
  meetingRange: [0, 100],
  members: [],
};

/** Map getDecisionMakerMeetings API series keys to dashboard i18n keys for chart legend */
const DECISION_MEETING_SERIES_KEYS = {
  decisionMakerMeetings: 'sales.dashboard.decisionMakerMeetings',
  nonDecisionMakerMeetings: 'sales.dashboard.nonDecisionMakerMeetings',
};

const DecisionMeetingGraph = ({ type, setMeetingGraphFilters }) => {
  const { t } = useTranslation();

  const classes = useStyles();

  const location = useLocation();
  const { dateFormat } = useSelector(getDisplayConfiguration);

  const { getNewApiController } = useApiControllers();

  const [queryParams, setQueryParams] = useState(params);

  const [openModal, setOpenModal] = useState(false);

  const [exportAPICalled, setExportAPICalled] = useState(false);

  const _handleOpenModal = () => setOpenModal(true);

  const handleCloseModal = () => setOpenModal(false);

  const [filters, setFilters] = useState(filtersData);

  const [decisionMakerMeetingGraph, setDecisionMakerMeetingGraph] = useState({});

  // Contract Popover
  const [anchors, setAnchors] = useState({
    meetings: null,
    visits: null,
    revenue: null,
  });

  /**
   * Refs to handle UseEffect intiall calls
   */
  // const initialRender = useRef(true);
  // const initialRenderUseEffect = useRef(true);

  const handleBack = () => {
    window.location.href = SALES_DASHBOARD;
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

  const updateFormHandler = (name, value) => {
    setQueryParams((prevState) => {
      return {
        ...prevState,
        [name]: value,
      };
    });
  };
  const inputChangedHandler = (event) => {
    // Get name of changed input, and its corresponding value
    const { name, value } = event.target;
    // Update form state against the target input field
    updateFormHandler(name, value);
  };

  const _handleMultipleSelectedValues = async (event, field) => {
    /**
     * get the ids from selected values
     */
    const selectedValues = event.target.value?.map((value) => parseInt(value.value));
    setQueryParams((prevState) => ({
      ...prevState,
      [field]: selectedValues,
    }));
  };

  const assignMaxValue = (arr) => {
    let obj = { min: null, max: null };
    if (!arr.length) return obj;
    if (!arr[0] && arr[1]) {
      obj = {
        min: filters.meetingRange[0],
        max: arr[1],
      };
      return obj;
    }
    if (arr[0] && !arr[1]) {
      obj = {
        min: arr[0],
        max: filters.meetingRange[1],
      };
      return obj;
    }
    obj = {
      min: arr[0],
      max: arr[1],
    };
    return obj;
  };

  const handleRangeSliderToggle = (event, name) => {
    setAnchors({
      [name]: event?.currentTarget || null,
    });
  };

  const _memoizedSelectedMembers = useMemo(() => {
    return (
      transformArrayForOptions(
        filters?.members.filter((member) => queryParams?.userIds?.includes(member.id)),
        'name',
        'id',
      ) || []
    );
  }, [JSON.stringify(queryParams), filters?.members]);

  /**
   * Fetch filter ranges
   * */
  const fetchRangeFiltersData = async () => {
    try {
      const response = await getDashboardFiltersData();
      if (response?.statusCode === 200) {
        // Update filtersData with values from API response.
        setFilters((prevFilters) => ({
          ...prevFilters,
          meetingRange: [0, response?.data.filtersData?.max_meetings],
        }));
      }
    } catch (error) {
      toast.error(error?.message, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  /**
   * fetch members list to show as an option in the dropdown
   */
  const fetchMembers = async () => {
    // changeLoadingState('salesFunnelLoading', true);
    try {
      const response = await getMembers();
      if (response?.statusCode === 200)
        setFilters((prev) => ({
          ...prev,
          members: transformArrayForOptions(response?.data?.members, 'name', 'id') || [],
        }));

      // changeLoadingState('salesFunnelLoading', false);
    } catch (error) {
      // changeLoadingState('salesFunnelLoading', false);
    }
  };

  const fetchDecisionMakerMeetings = async (queryParams) => {
    // changeLoadingState('salesPInsightlLoading', true);
    const apiController = getNewApiController();

    try {
      let params = { ...queryParams };

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
      if (type === pageType.dashboard) {
        params = {
          ...params,
          limit: true,
        };
      }

      if (queryParams.userIds) {
        params.userIds = extractValuesByKeyFromInput(queryParams.userIds, 'value');
      }

      /**
       * format the contract and visit range filter
       */
      if (queryParams?.meetings) {
        const minMax = assignMaxValue(queryParams.meetings);
        /**
         * only add parameter if max value is greater then 0
         */
        if (minMax.max > 0) {
          params.minMeetings = minMax.min;
          params.maxMeetings = minMax.max;
        }
      }

      /**
       * delete the following keys from the params object
       */
      delete params.meetings;
      delete params.selectedDates;

      const response = await getDecisionMakerMeetings(params, { signal: apiController.signal });
      if (response?.statusCode === 200) {
        const decisionMakerMeetings = response?.data?.decisionMakingGraph;

        setDecisionMakerMeetingGraph({
          colors: decisionMakerMeetings?.colors || [],
          dataLabels: decisionMakerMeetings?.dataLabels || [],
          series: decisionMakerMeetings?.series || {},
        });
      }

      // changeLoadingState('salesPInsightlLoading', false);
    } catch (error) {
      // changeLoadingState('salesPInsightlLoading', false);
      if (!apiController.signal.aborted) {
        /**
         * show error in the corresponding field
         * parse errors in array format and set them in errorMessages
         * setErrorMessages(error)
         */
        // changeLoadingState('salesPInsightlLoading', false);
      }
    }
  };

  const exportDecisionMakingGraph = async () => {
    setExportAPICalled(true);
    try {
      let params = { ...queryParams };

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
      if (type === pageType.dashboard) {
        params = {
          ...params,
          limit: true,
        };
      }

      if (queryParams.userIds) {
        params.userIds = extractValuesByKeyFromInput(queryParams.userIds, 'value');
      }

      /**
       * format the contract and visit range filter
       */
      if (queryParams?.meetings) {
        const minMax = assignMaxValue(queryParams.meetings);
        /**
         * only add parameter if max value is greater then 0
         */
        if (minMax.max > 0) {
          params.minMeetings = minMax.min;
          params.maxMeetings = minMax.max;
        }
      }

      /**
       * delete the following keys from the params object
       */
      delete params.meetings;
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

  const debounceFetchMeetings = useDebounceHook(fetchDecisionMakerMeetings, 300); // Adjust debounce delay as needed

  /** Map API series keys to translated labels for chart legend/tooltip */
  const mappedGraphData = useMemo(() => {
    const raw = decisionMakerMeetingGraph || {};
    const rawSeries = raw.series || {};
    const series = {};
    Object.keys(rawSeries).forEach((key) => {
      const label = DECISION_MEETING_SERIES_KEYS[key]
        ? t(DECISION_MEETING_SERIES_KEYS[key])
        : key.replace(/([A-Z])/g, ' $1').trim();
      series[label] = rawSeries[key];
    });
    return {
      colors: raw.colors || [],
      dataLabels: raw.dataLabels || [],
      series,
    };
  }, [decisionMakerMeetingGraph, t]);

  // Update filters whenever queryParams changes
  useEffect(() => {
    // Set filters to the current value of queryParams
    if (setMeetingGraphFilters) {
      setMeetingGraphFilters((prevState) => ({
        ...prevState,
        ...queryParams,
      }));
    }
  }, [queryParams]);

  /**
   * if we recieve any filter state from dashboard this will run
   */
  useEffect(() => {
    if (!type && location.state) {
      const decisionMakingGraphFilters = location.state.decisionMakingMeetingFilters;
      if (decisionMakingGraphFilters?.selectedDates) {
        decisionMakingGraphFilters.selectedDates = decisionMakingGraphFilters.selectedDates.map(
          (date) => (date ? dayjs(date) : null),
        );
      }
      setQueryParams(decisionMakingGraphFilters);
      location.state = null;
      window.history.replaceState({}, '');
    }
    if (!location.state) debounceFetchMeetings(queryParams);
  }, [location?.state, queryParams]);

  useEffect(() => {
    fetchRangeFiltersData();
    fetchMembers();
  }, []);

  return (
    <Box
      className={
        type !== pageType.dashboard ? classes.salesFunnelChartdetail : classes.salesFunnelChart
      }
    >
      {type !== pageType.dashboard && (
        <Box>
          <Button variant="tertiaryGrey" startIcon={<BackIcon />} onClick={handleBack}>
            {t('links.back')}
          </Button>
        </Box>
      )}
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
              {t('sales.dashboard.decisionMakerVsNonDecisionMakerMeeting')}
            </Typography>
          </Box>
        </Box>
        <Box className={classes.salesCustomDropdown}>
          <Button
            variant="onlyText"
            className={classes.popButton}
            // aria-describedby={id}
            onClick={(e) => {
              handleRangeSliderToggle(e, 'meetings');
            }}
            endIcon={<ChevronDown />}
            disableRipple
          >
            {t('sales.dashboard.meetings')}
          </Button>
          <Popover
            anchorEl={anchors.meetings}
            open={Boolean(anchors.meetings)}
            onClose={() => {
              handleRangeSliderToggle(null, 'meetings');
            }}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'left',
            }}
            className={classes.popWrap}
          >
            <RangeSlider
              label={t('sales.dashboard.meetings')}
              name="meetings"
              value={queryParams?.meetings}
              handleChange={handleChange}
              min={filters.meetingRange[0] || 0}
              max={filters.meetingRange[1] || 100}
              minPlaceholder={filters.meetingRange[0] || 0}
              maxPlaceholder={filters.meetingRange[1] || 100}
            />
          </Popover>

          <CustomDropDown
            label={t('sales.locations.selectMember')}
            name="userIds"
            id="userIds"
            placeHolder={`${t('sales.locations.selectMember')}`}
            placeHolderClassName={classes.placeHolderColor}
            options={filters.members}
            selectedValues={queryParams.userIds}
            handleChange={inputChangedHandler}
            searchPlaceholder={t('sales.locations.search')}
            className={classes?.dropdownWrap}
            multiSelect
            checkmark
            searchable
            clearAll={true}
            withTiles
            position="right"
          />

          <Box className={classes.reportsListingsHeaderRightDate}>
            <DateRangePickerWithButtons
              format={dateFormat}
              selectedDates={queryParams?.selectedDates}
              setDates={(dates) => {
                // if (!initialRenderUseEffect.current && !initialRender.current) {
                //   setQueryParams((prevState) => {
                //     return {
                //       ...prevState,
                //       selectedDates: dates,
                //     };
                //   });
                // }
                // setQueryParams((prevState) => ({
                //   ...prevState,
                //   selectedDates: dates,
                // }));
                updateFormHandler('selectedDates', dates);
              }}
            />
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
      <Box className={classes.chartSalesWrapper}>
        <Typography variant="body3" className={classes.salesPersons}>
          {t('sales.dashboard.meetings')}
        </Typography>
        <DecisionMakerGraph
          componentType={type}
          colors={mappedGraphData.colors}
          dataLabels={mappedGraphData.dataLabels}
          series={mappedGraphData.series}
          style={{
            height: type
              ? '500px'
              : `${mappedGraphData?.dataLabels?.length > 1 ? mappedGraphData?.dataLabels?.length * 100 : 150}px`,
            width: '100%',
          }}
        />
      </Box>
      {openModal && (
        <ExportModal
          openModal={openModal}
          handleCloseModal={handleCloseModal}
          exportData={exportDecisionMakingGraph}
          disable={exportAPICalled}
        />
      )}
    </Box>
  );
};

DecisionMeetingGraph.defaultProps = {
  type: '',
};

DecisionMeetingGraph.propTypes = {
  type: PropTypes.string,
  setMeetingGraphFilters: PropTypes.func,
};

export default DecisionMeetingGraph;
