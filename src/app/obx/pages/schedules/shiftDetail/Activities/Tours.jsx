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
import PDFViewDrawer from 'src/app/obx/pages/reports/components/pdfViewDrawer';
import { OBX_TOURE_REPORT } from 'src/app/router/constant/ROUTE';
import history from 'src/app/router/utils/history';
import { useApiControllers } from 'src/helper/axios';
import { listStatusHandler } from 'src/helper/utilityFunctions';
import { isObjectEmpty } from 'src/helper/utilityFunctions';
import { enumStatusReport, toastSettings } from 'src/utils/constants';

import { useStyles } from './activities.styles';

const Tours = ({
  tours,
  shiftId,
  type,

  showDrawerChange,
}) => {
  const { getNewApiController } = useApiControllers();
  const [showDrawer, setShowDrawer] = useState(false);

  const classes = useStyles();

  const { t } = useTranslation();

  const [pdfUrl, setPdfUrl] = useState('');

  const [isLoading, setLoading] = useState(false);

  const [reset, setReset] = useState(true);

  const [selectedData, setSelectedData] = useState({});

  const [docNum, setDocNums] = useState(0);

  const handleCloseDrawer = () => {
    setShowDrawer(false);
    setPdfUrl(null);
    setReset(true);
  };

  const fetchActivityReportPdf = async (tour) => {
    const apiController = getNewApiController();
    if (tour.status !== enumStatusReport.notSubmitted) {
      setSelectedData(tour);
      setLoading(true);
      setShowDrawer(true);
      setReset(true);

      try {
        const payLoad = { shiftId: shiftId, body: { type } };
        payLoad.body = { ...payLoad.body, reportId: tour?.reportId };

        const response = await fetchShiftActivityReportPdf(payLoad, {
          responseType: 'arraybuffer',
          signal: apiController.signal,
        });

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
          setReset(true);
          toast.error(error?.message, {
            position: 'top-right',
            autoClose: toastSettings.AUTO_CLOSE,
          });
        }
      }
    }
  };

  useEffect(() => {
    if (pdfUrl) {
      setReset(false);
    }
  }, [pdfUrl]);

  useEffect(() => {
    setShowDrawer(false);
  }, [showDrawerChange]);

  return (
    <>
      {tours?.map((tour) => {
        const status = listStatusHandler(tour?.status);
        return (
          <Box key={tour?.id}>
            <Box className={classes.dutyDetailReports}>
              <Box className={classes.dutyDetailReportsContent}>
                <Box
                  className={classes.dutyDetailReportsHeader}
                  onClick={() => {
                    fetchActivityReportPdf(tour);
                  }}
                >
                  <Typography className={classes.dutyDetailReportsTitle} variant="h4">
                    {tour?.title}
                    {tour?.submittedAt ? dayjs(tour?.submittedAt).format(' • hh:mm A') : null}
                  </Typography>
                  {tour?.reportId && <RightArrowIcon className={classes.dutyDetailReportIcon} />}
                </Box>
                {/* {report?.reportId && (
            <>
              <Typography className={classes.dutyDetailReportsDescription} variant="subtitle3">
                {report?.description}
              </Typography>
              {report?.submittedAt && (
                <Typography className={classes.dutyDetailReportsTime} variant="subtitle3">
                  {t('obx.schedules.dutyDetail.activities.reportSubmittionTime', {
                    submittedAt: dayjs(report?.submittedAt).format('hh:mm A'),
                  })}
                </Typography>
              )}
            </>
          )} */}
                {status && tour.status !== enumStatusReport.submitted && (
                  <Chip label={status?.title} size="small" color={status?.color} />
                )}

                {tour.status === enumStatusReport.submitted && (
                  <Box className={classes.reportsActions}>
                    {/* <Tooltip
                      title="Reject"
                      arrow
                      slotProps={{
                        popper: {
                          modifiers: [
                            {
                              name: 'offset',
                              options: {
                                offset: [0, -14],
                              },
                            },
                          ],
                          sx: { cursor: 'pointer' },
                        },
                      }}
                    >
                      <Button
                        onClick={() => {
                          setShowRejectModal(true);
                          setSelectedId(tour?.reportId);
                        }}
                        variant="destructiveSecondary"
                        className={classes.reportsActionsCross}
                      >
                        <RedCrossIcon />
                      </Button>
                    </Tooltip>
                    <Tooltip
                      title="Approve"
                      arrow
                      slotProps={{
                        popper: {
                          modifiers: [
                            {
                              name: 'offset',
                              options: {
                                offset: [0, -14],
                              },
                            },
                          ],
                          sx: { cursor: 'pointer' },
                        },
                      }}
                    >
                      <Button
                        onClick={() => {
                          setShowAcceptModelModal(true);
                          setSelectedId(tour?.reportId);
                        }}
                        variant="secondaryBlue"
                        className={classes.reportsActionsTick}
                      >
                        <BlueTickIcon />
                      </Button>
                    </Tooltip> */}
                    {/*<Chip color="success" size="small" label="sent" />*/}
                    <Link
                      to={`${OBX_TOURE_REPORT.replace(':reportId', 'tour-report').replace(':tourReportId', tour?.reportId)}`}
                      className={classes.addVehicle}
                    >
                      <EditBtnIcon className={classes.addIcon} />
                    </Link>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        );
      })}

      {!isObjectEmpty(selectedData) && (
        <SideDrawer
          closeDrawer={handleCloseDrawer}
          key={`${pdfUrl}-${reset}`}
          isOpen={showDrawer}
          totalWidth={'920px'}
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
                const link = document.createElement('a');
                link.href = pdfUrl;
                link.setAttribute('download', `${type}.pdf`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
              variant="secondaryBlue"
              disableRipple
              disabled={isLoading}
            >
              {t('buttons.downloadReport')}
            </Button>
            {selectedData?.status === enumStatusReport.submitted && pdfUrl && !!docNum && (
              <Button
                onClick={() => {
                  history.push(
                    OBX_TOURE_REPORT.replace(':reportId', 'tour-report').replace(
                      ':tourReportId',
                      selectedData?.reportId,
                    ),
                  );
                }}
                variant="secondaryBlue"
                disableRipple
                disabled={isLoading}
              >
                {t('buttons.editReport')}
              </Button>
            )}
          </Box>
        </SideDrawer>
      )}
    </>
  );
};

Tours.propTypes = {
  tours: PropTypes.array,
  shiftId: PropTypes.any,
  type: PropTypes.any,
  setShowAcceptModelModal: PropTypes.any,
  setShowRejectModal: PropTypes.any,
  setSelectedId: PropTypes.any,
  setShowDrawer: PropTypes.any,
  showDrawerChange: PropTypes.any,
};

export default Tours;
