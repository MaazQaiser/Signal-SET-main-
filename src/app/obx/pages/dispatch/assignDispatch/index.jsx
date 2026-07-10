import { Box, Button, Typography } from '@mui/material';
import dayjs from 'dayjs';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useParams } from 'react-router-dom/cjs/react-router-dom.min';
import { toast } from 'react-toastify';
import LoaderComponent from 'src/app/components/common/loader';
import { OBX_DISPATCH } from 'src/app/router/constant/ROUTE';
import history from 'src/app/router/utils/history';
import DedicatedOfficer from 'src/assets/images/dedicated-officer.png';
import DedicatedOfficerSelected from 'src/assets/images/dedicated-officer-selected.png';
import SiteDispatchIcon from 'src/assets/images/site-dispatch.png';
import { useApiControllers } from 'src/helper/axios';
import { decode, generateUniqueId } from 'src/helper/utilityFunctions';
import {
  assignDispatch,
  assignDispatchSupervisor,
  getShiftAssignmentJobs,
  getShiftAssignmentJobsFilters,
} from 'src/services/dispatch.services';
import { toastSettings } from 'src/utils/constants';

import { dayjsWithStandardOffset } from '../../schedules/helper';
import DispatchDirectionsMap from '../components/dispatchMap';
import { SHIFT_TIME_OPTIONS } from '../dispatch.constant';
import { stateToQueryParams } from '../helper';
import { useStyles } from './assignDispatch';
import AssignDispactchTabs from './components/assignDispactchTabs';
import OfficerPopup from './components/officerPopup';
import RunSheetPopup from './components/runSheetPopup';
import SupervisorList from './components/supervisorList';

const DEFAULT_PARAMS = {
  windowEnd: dayjsWithStandardOffset(dayjs()).toISOString(),
  windowStart: dayjsWithStandardOffset(dayjs().subtract(4, 'hour')).toISOString(),
  officerIds: [],
  shiftType: 0,
  minutes: { ...SHIFT_TIME_OPTIONS[0] },
};

const SHIFT_TYPE_MAP = ['', 'dedicated', 'patrol'];

const filterQueryParams = (obj) => {
  const transformed = {};
  for (const key in obj) {
    if (key === 'shiftType') {
      transformed[key] = SHIFT_TYPE_MAP[obj[key]];
    } else {
      transformed[key] = stateToQueryParams(obj, key);
    }
  }
  return transformed;
};

const convertLocation = (location) => {
  if (!location) return null;
  return { lat: parseFloat(location?.lat), lng: parseFloat(location?.lng) };
};

export default function AssignDispatch() {
  const { getNewApiController } = useApiControllers();

  const { t } = useTranslation();
  const classes = useStyles();
  const location = useLocation();
  const params = useParams();
  const searchParams = new URLSearchParams(location.search);
  const siteId = searchParams.get('siteId');
  const officerId = searchParams.get('officerId');

  const [data, setData] = useState({});
  const [selectedJob, setSelectedJob] = useState(null);
  const [officers, setOfficers] = useState([]);

  const [queryParams, setQueryParams] = useState({ ...DEFAULT_PARAMS, siteId });

  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);

  const handleAssign = async () => {
    try {
      setLoading(true);
      let response;
      if (showSupervisorList) {
        const payload = {
          siteId: Number(siteId),
          officerId: Number(selectedJob?.id),
          dispatchId: Number(params.id),
        };
        response = await assignDispatchSupervisor(payload);
      } else {
        const payload = {
          ...selectedJob,
          dispatchId: Number(params.id),
        };
        response = await assignDispatch(payload);
      }
      if (response?.statusCode === 200) {
        toast.success(response?.message, {
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
        history.push(OBX_DISPATCH);
      }
    } catch (error) {
      toast.error(error?.message, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
    setLoading(false);
  };

  const handleCancel = async () => {
    history.goBack();
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setQueryParams((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleJobChange = (job) => setSelectedJob(job);
  const handleTabChange = (tab) =>
    setQueryParams((prev) => ({
      ...prev,
      shiftType: tab,
    }));

  const fetchShiftAssignmentJobs = async (payload, apiController) => {
    try {
      setDataLoading(true);
      const result = await getShiftAssignmentJobs(payload, {
        signal: apiController.signal,
      });
      const uniqueJobs = {
        ...result?.data,
        dedicatedJobs: result?.data?.dedicatedJobs.map((job) => ({
          ...job,
          uniqueId: generateUniqueId(),
        })),
        patrolJobs: result?.data?.patrolJobs.map((job) => ({
          ...job,
          uniqueId: generateUniqueId(),
        })),
      };
      setData(uniqueJobs);
    } catch (error) {
      if (!apiController.signal.aborted) {
        setData({
          dedicatedJobs: [],
          patrolJobs: [],
          patrolSupervisors: [],
        });
        console.error(error);
      }
    }
    setDataLoading(false);
  };

  const fetchShiftAssignmentJobsFilters = async (payload, apiController) => {
    try {
      const filtersParam = { ...payload };
      delete filtersParam.officerIds;
      const result = await getShiftAssignmentJobsFilters(filtersParam, {
        signal: apiController.signal,
      });
      setOfficers(result?.data?.officers || []);
    } catch (error) {
      if (!apiController.signal.aborted) {
        console.error(error);
      }
    }
  };

  useEffect(() => {
    const payload = filterQueryParams({ ...queryParams, siteId, dispatchId: Number(params.id) });
    const apiController = getNewApiController();

    Promise.all([
      fetchShiftAssignmentJobs(payload, apiController),
      fetchShiftAssignmentJobsFilters(payload, apiController),
    ])
      .then((_result) => {})
      .catch((error) => {
        if (!apiController.signal.aborted) {
          console.error(error);
        }
      });
  }, [queryParams]);

  useEffect(() => {
    if (!selectedJob && data) {
      let jobResult = data?.dedicatedJobs?.find((job) => job?.officer?.id == officerId);
      jobResult = jobResult || data?.patrolJobs?.find((job) => job?.officer?.id == officerId);
      jobResult && setSelectedJob(jobResult);
    }
  }, [officerId, data]);

  const polygons = useMemo(
    () =>
      data?.patrolJobs?.map((job) => ({
        data: job,
        position: job?.pathData?.[0]?.start_location,
        lines: job?.pathData.map((path) => ({ ...path, mapPath: decode(path.mapPath) })) || [],
      })),
    [data?.patrolJobs],
  );

  const markers = useMemo(() => {
    const markers = [
      {
        position: null,
        icon: SiteDispatchIcon,
      },
    ];
    data?.dedicatedJobs?.forEach((job) =>
      markers.push({
        position: convertLocation(job?.location),
        icon: DedicatedOfficer,
        selectedIcon: DedicatedOfficerSelected,
        data: job,
      }),
    );
    return markers;
  }, [data?.dedicatedJobs]);

  const center = useMemo(
    () =>
      convertLocation(selectedJob?.location) ||
      convertLocation(selectedJob?.pathData?.[0]?.start_location),
    [selectedJob],
  );

  const showSupervisorList = useMemo(
    () => !data?.dedicatedJobs?.length && !data?.patrolJobs?.length && !queryParams.shiftType,
    [data],
  );

  return (
    <Box className={classes.assignDispatchWrap}>
      {loading && <LoaderComponent size={50} color={'primary'} label={'Loading'} />}
      <Box className={classes.assignDispatchLeft}>
        <Typography variant="h3" className={classes.assignDispatchHeading}>
          {t('obx.dispatch.assignDispatch')}
        </Typography>
        {showSupervisorList ? (
          <SupervisorList
            supervisors={data?.patrolSupervisors || []}
            selectedSupervisor={selectedJob}
            loading={dataLoading}
            handleSupervisorChange={handleJobChange}
          />
        ) : (
          <AssignDispactchTabs
            jobs={data}
            officers={officers}
            selectedOfficers={queryParams?.officerIds}
            minutes={queryParams?.minutes}
            queryParams={queryParams}
            selectedJob={selectedJob}
            selectedTab={queryParams.shiftType}
            loading={dataLoading}
            showSupervisorList={showSupervisorList}
            handleOfficerChange={handleChange}
            handleShiftChange={handleChange}
            handleJobChange={handleJobChange}
            handleTabChange={handleTabChange}
          />
        )}
        <Box className={classes.bottomButtons}>
          <Button variant="secondaryGrey" disableRipple disabled={loading} onClick={handleCancel}>
            {t('obx.dispatch.cancel')}
          </Button>
          <Button
            variant="primary"
            disableRipple
            disabled={loading || !selectedJob}
            onClick={handleAssign}
          >
            {t('obx.dispatch.assignDispatch')}
          </Button>
        </Box>
      </Box>
      <Box className={classes.assignDispatchRight}>
        <DispatchDirectionsMap
          containerClassName="dispatch-map"
          center={center}
          polygons={polygons}
          markers={markers}
          selectedUniqueId={selectedJob?.uniqueId}
          markerInfoWindow={OfficerPopup}
          polygonInfoWindow={RunSheetPopup}
        />
      </Box>
    </Box>
  );
}
