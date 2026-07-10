import { Box, Skeleton } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import CommonLeadsMap from 'src/app/components/common/leadsMap';
import { getLeadsData } from 'src/services/location.service';

import { useStyles } from './leadsMap';
const LeadsMap = () => {
  const [leadsMapData, setLeadsMapData] = useState([]);
  const [loading, setLoading] = useState(true);
  const classes = useStyles();
  const defaultCenter = { lat: 41.216362, lng: -96.13607 };
  const getLeadsMapData = async () => {
    try {
      setLoading(true);
      const data = await getLeadsData();
      setLeadsMapData(data?.data);
    } catch (e) {
      toast.error(e.message, {
        position: 'top-right',
        autoClose: 2000,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!leadsMapData?.franchises?.length) {
      getLeadsMapData();
    }
  }, []);

  return (
    <>
      <Box className={classes.mainMapSectionWrapper}>
        {!loading && leadsMapData?.franchises && (
          <CommonLeadsMap
            key={leadsMapData?.length}
            mapCenter={defaultCenter}
            franchiseData={leadsMapData}
            externalCenter={defaultCenter}
            refetch={getLeadsMapData}
          />
        )}
        {loading && <Skeleton variant="rect" width={'100vw'} height={'100vh'} />}
      </Box>
    </>
  );
};

export default LeadsMap;
