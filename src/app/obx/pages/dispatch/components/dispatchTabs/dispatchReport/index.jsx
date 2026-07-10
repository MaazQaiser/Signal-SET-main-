import { Box, Skeleton, Typography } from '@mui/material';
import { ReactComponent as NoDataIcon } from 'assets/images/Nodata.svg';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
// import { dayjsWithStandardOffset } from 'src/app/obx/pages/schedules/helper';
import { getDispatchShiftReport } from 'src/services/dispatch.services';
import { toastSettings } from 'src/utils/constants';

import { useStyles } from './dispatchReport.styles';
import Report from './report';

const DispatchReport = ({ dispatchId }) => {
  const classes = useStyles();
  const { t } = useTranslation();

  const [report, setReport] = useState();
  const [loading, setLoading] = useState(false);

  const fetchDispatchReport = async () => {
    try {
      setLoading(true);
      const result = await getDispatchShiftReport(dispatchId);
      setReport(result.data);
    } catch (error) {
      toast.error(error?.message, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    dispatchId && fetchDispatchReport();
  }, [dispatchId]);

  if (loading)
    return (
      <Box className={classes.dispatchSkelton}>
        <Skeleton variant="text" height={'50px'} />
        <Skeleton variant="text" height={'50px'} />
        <Skeleton variant="text" height={'50px'} />
        <Skeleton variant="text" height={'50px'} />
      </Box>
    );

  return (
    <Box>
      <Box marginBottom={'14px'}>
        <Typography className={classes.dutyDetailReportsTitle} variant="h4">
          Dispatch Report
        </Typography>
      </Box>
      <Box>
        {!report && !loading && (
          <Box className={classes.notRecordFounWrapper}>
            <Box className={classes.noRecordFound}>
              <NoDataIcon />
              <Typography variant="h2">{t('commonText.table.noRecordFound')}</Typography>
            </Box>
          </Box>
        )}
        {report && <Report key={report.id} report={report} type={'dispatch'} />}
      </Box>
    </Box>
  );
};

DispatchReport.propTypes = {
  dispatchId: PropTypes.string,
};

export default DispatchReport;
