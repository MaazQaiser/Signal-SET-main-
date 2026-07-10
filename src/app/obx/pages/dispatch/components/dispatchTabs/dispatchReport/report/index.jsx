import { Box, Button, Chip, Typography } from '@mui/material';
import { ReactComponent as RightArrowIcon } from 'assets/svg/chevron-right.svg';
import { ReactComponent as EditBtnIcon } from 'assets/svg/EditBtnIcon.svg';
import SideDrawer from 'commonComponents/sideDrawer';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { fetchShiftActivityReportPdf } from 'services/duty.services';
import { downloadPdfFromUrl } from 'services/reports.services';
import PDFViewDrawer from 'src/app/obx/pages/reports/components/pdfViewDrawer';
import { dayjsWithStandardOffset } from 'src/app/obx/pages/schedules/helper';
import { OBX_TOURE_REPORT } from 'src/app/router/constant/ROUTE';
import { useApiControllers } from 'src/helper/axios';
import { listStatusHandler } from 'src/helper/utilityFunctions';
import { getDispatchTemplates } from 'src/services/dispatch.services';
import { enumStatusReport, toastSettings } from 'src/utils/constants';

import { useStyles } from './report.styles';

const Report = ({ report, type, showDrawerChange }) => {
  const classes = useStyles();
  const { getNewApiController } = useApiControllers();
  const { t } = useTranslation();

  const [pdfUrl, setPdfUrl] = useState('');

  const [isLoading, setLoading] = useState(false);

  const [reset, setReset] = useState(true);

  const [_docNum, setDocNums] = useState(0);

  const [showDrawer, setShowDrawer] = useState(false);

  const handleCloseDrawer = () => {
    setShowDrawer(false);
    setPdfUrl(null);
    setReset(true);
  };

  const fetchActivityReportPdf = async () => {
    const apiController = getNewApiController();
    if (report.status !== enumStatusReport.notSubmitted) {
      setLoading(true);
      setShowDrawer(true);
      setReset(true);

      try {
        const body = { type };
        body.reportId = report?.id;

        let config = {
          signal: apiController.signal,
        };

        const response = await fetchShiftActivityReportPdf({ body: body }, config);

        if (response?.statusCode === 200) {
          setLoading(false);
          setReset(true);
          setPdfUrl(response?.data?.url);
          return;
        }

        const blob = new Blob([response], {
          type: 'application/pdf',
        });
        const objectUrl = URL.createObjectURL(blob);
        setLoading(false);
        setReset(true);
        setPdfUrl(objectUrl);
        // setShowDrawer(true);
      } catch (error) {
        if (!apiController.signal.aborted) {
          setLoading(false);
          setShowDrawer(false);
          toast.error(error?.message, {
            position: 'top-right',
            autoClose: toastSettings.AUTO_CLOSE,
          });
        }
      }
    }
  };

  const downloadPdf = async () => {
    try {
      const response = await downloadPdfFromUrl(pdfUrl, {
        responseType: 'blob',
        skipAuth: true,
      });

      const url = URL.createObjectURL(response);

      downloadLocalPDf(url);
    } catch (error) {
      setLoading(false);
      setShowDrawer(false);

      toast.error(error?.message, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
      console.error('Error downloading PDF:', error);
    }
  };

  const downloadLocalPDf = (url) => {
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${type}_${dayjs().unix()}.pdf`);

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    if (pdfUrl) setReset(false);
  }, [pdfUrl]);

  useEffect(() => {
    setShowDrawer(false);
  }, [showDrawerChange]);

  useEffect(() => {
    const fetchDispatchReport = async () => {
      const result = await getDispatchTemplates();
      console.log(result, 'here');
    };
    fetchDispatchReport();
  }, []);

  const status = listStatusHandler(report?.status);

  return (
    <>
      <Box className={classes.dutyDetailReports}>
        <Box className={classes.dutyDetailReportsContent}>
          <Box
            className={
              report?.status === enumStatusReport.notSubmitted
                ? classes.noCursorHeader
                : classes.dutyDetailReportsHeader
            }
            onClick={fetchActivityReportPdf}
          >
            <Box className={classes.reportTourTitleAndDate}>
              <Typography className={classes.dutyDetailReportsTitle} variant="h4">
                {report?.title}
                {report?.submittedAt
                  ? dayjsWithStandardOffset(report?.submittedAt || report?.startsAt).format(
                      ' • hh:mm A',
                    )
                  : null}
                {!report?.submittedAt && report?.isVisits && report?.visitedAt
                  ? dayjsWithStandardOffset(report?.visitedAt).format(' • hh:mm A')
                  : null}
              </Typography>
              {report?.id && <RightArrowIcon className={classes.dutyDetailReportIcon} />}
            </Box>
            {report?.siteName && (
              <Box>
                <Typography variant="subtitle3">{report?.siteName}</Typography>
              </Box>
            )}
          </Box>
          {status && report?.status !== enumStatusReport?.submitted && (
            <Chip
              label={status?.title}
              size="small"
              color={status?.color}
              className={classes.tourChipStatus}
            />
          )}

          {report?.status === enumStatusReport.submitted && (
            <Box className={classes.reportsActions}>
              <Link
                to={`${OBX_TOURE_REPORT.replace(':reportId', report?.id).replace('/:tourReportId', '')}`}
                className={classes.addVehicle}
              >
                <EditBtnIcon className={classes.addIcon} />
              </Link>
            </Box>
          )}
        </Box>
      </Box>
      <SideDrawer
        closeDrawer={handleCloseDrawer}
        key={`${pdfUrl}-${reset}`}
        isOpen={showDrawer}
        totalWidth={'992px'}
      >
        <Box>
          <PDFViewDrawer
            url={pdfUrl}
            key={pdfUrl}
            loading={reset}
            setLoading={setReset}
            setUrl={setPdfUrl}
            closeDrawer={handleCloseDrawer}
            setDocNums={setDocNums}
          />
        </Box>

        <Box className={classes.reportsDrawerActions}>
          <Button
            onClick={() => {
              downloadPdf();
            }}
            variant="secondaryBlue"
            disableRipple
            disabled={isLoading}
          >
            {t('buttons.downloadReport')}
          </Button>
        </Box>
      </SideDrawer>
    </>
  );
};

Report.propTypes = {
  report: PropTypes.any,
  shiftId: PropTypes.any,
  type: PropTypes.any,
  setShowAcceptModelModal: PropTypes.any,
  setShowRejectModal: PropTypes.any,
  setSelectedId: PropTypes.any,
  setShowDrawer: PropTypes.any,
  showDrawerChange: PropTypes.any,
};

export default Report;
