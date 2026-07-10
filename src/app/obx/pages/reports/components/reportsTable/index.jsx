import { Avatar, Box, Button, TableCell, TableRow, TableSortLabel, Tooltip } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { ReactComponent as ChevronRight } from 'assets/svg/chevron-right.svg';
import { ReactComponent as EditBtnIcon } from 'assets/svg/EditBtnIcon.svg';
import SideDrawer from 'commonComponents/sideDrawer';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import LoaderComponent from 'src/app/components/common/loader';
import TableSkeleton from 'src/app/components/common/skeletonLoader/tableSkeleton';
import TableComponent from 'src/app/components/common/table';
import NoRecordFound from 'src/app/components/common/table/noRecordFound';
import PDFViewDrawer from 'src/app/obx/pages/reports/components/pdfViewDrawer';
import { OBX_TOURE_REPORT } from 'src/app/router/constant/ROUTE';
import history from 'src/app/router/utils/history';
import { formatDate, timeFormat12h } from 'src/helper/utilityFunctions';
import {
  downloadPdfFromUrl,
  getPDFViewOfShiftReport,
  updateReportStatus,
} from 'src/services/reports.services';
import { toastSettings } from 'src/utils/constants';
import capitalize from 'src/utils/string/capitalize';
import { capitalizeFirstLetter } from 'src/utils/string/common';

import { dayjsWithStandardOffset } from '../../../schedules/helper';
import ApproveModal from '../approveModal';
import RejectModal from '../rejectModal';

const useStyles = makeStyles((theme) => ({
  reportsTableStickyColumn: {
    position: 'sticky',
    left: 0,
    zIndex: 99,
  },

  reportsTableActions: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
  },

  reportsTableActionApprove: {
    '&.MuiButton-onlyText': {
      minHeight: '0',
      padding: '0',
    },
  },

  reportsTableSites: {
    minWidth: '380px',
    maxWidth: '380px',
  },

  reportsTableOfficer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },

  reportsTableOfficerAvatar: {
    '&.MuiAvatar-root': {
      width: '24px',
      height: '24px',
    },
  },

  franchiseNameIcon: {
    width: '20px',
    height: '20px',
    '& svg': {
      visibility: 'hidden',
      width: '20px',
      height: '20px',
      '& path': {
        stroke: '#b3b3b3',
      },
    },
  },
  franchiseName: {
    display: 'flex ',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  reportsTableActionReject: {
    '&.MuiButton-onlyText': {
      minHeight: '0',
      padding: '0',
      color: theme.palette.surfaceAlertStrong,

      '&:hover': {
        color: theme.palette.surfaceAlertHover,
      },

      '&:active': {
        color: theme.palette.surfaceAlertStrong,
      },

      '&:disabled': {
        color: theme.palette.surfaceAlertDisabled,
      },
    },
  },

  reportsDrawerActions: {
    borderTop: `1px solid ${theme.palette.borderSubtle1}`,
    padding: '16px 24px',
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: '12px',
  },

  reportsTableTitle: {
    paddingRight: '10px !important',
    minWidth: '380px',
    maxWidth: '380px',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: '#f2f2f2 !important',
      '& .MuiBox-root': {
        '& > :nth-child(2)': {
          '& svg': {
            visibility: 'visible !important',
          },
        },
      },
    },
  },
}));

export const i18ColumnName = (t, classSticky, classSites, classTitle) => {
  return [
    {
      id: 'title',
      label: `${t(
        'obx.schedules.assignDedicatedDuty.toursAndReports.reports.listing.columns.name',
      )}`,
      className: classTitle,
    },
    // {
    //   id: 'site',
    //   label: `${t(
    //     'obx.schedules.assignDedicatedDuty.toursAndReports.reports.listing.columns.site',
    //   )}`,
    //   className: classSites,
    // },
    // {
    //   id: 'dueTime',
    //   label: `${t(
    //     'obx.schedules.assignDedicatedDuty.toursAndReports.reports.listing.columns.dueDate',
    //   )}`,
    // },
    {
      id: 'submittedDate',
      label: `${t(
        'obx.schedules.assignDedicatedDuty.toursAndReports.reports.listing.columns.submittedDate',
      )}`,
      className: classSites,
    },
    // {
    //   id: 'submittedTime',
    //   label: `${t(
    //     'obx.schedules.assignDedicatedDuty.toursAndReports.reports.listing.columns.submittedTime',
    //   )}`,
    // },
    {
      id: 'officer',
      label: `${t(
        'obx.schedules.assignDedicatedDuty.toursAndReports.reports.listing.columns.submittedBy',
      )}`,
      hasImage: true,
      className: classSites,
    },
    {
      id: 'reason',
      label: `${t(
        'obx.schedules.assignDedicatedDuty.toursAndReports.reports.listing.columns.reason',
      )}`,
      hasImage: true,
      className: classSites,
    },
  ];
};

const columnIdsEnum = {
  id: 'id',
  name: 'title',
  actions: 'actions',
  officer: 'officer',
  site: 'site',
  dueTime: 'dueTime',
  submittedDate: 'submittedDate',
  submittedTime: 'submittedTime',
  reason: 'reason',
};

export const statusValidationEnum = {
  submitted: 'submitted',
  approves: 'approved',
  rejected: 'rejected',
};

const order = {
  orderBy: 'id',
  orderType: 'asc',
};

const ReportTable = ({ selectedStatus = '', data = [], fetchReport }) => {
  const { t } = useTranslation();
  const classes = useStyles();

  const NA = t('commonText.nA');
  const [loading, setLoading] = useState(false);
  const [rejectModal, setRejectModal] = useState(false);
  const [approveModal, setApproveModal] = useState(false);
  // const [selectedId, setSelectedId] = useState();
  const [currentSelected, setCurrentSelected] = useState();
  const [disabled, setDisabled] = useState(false);
  const [downloading, setDownloading] = useState(true);
  const classSticky = classes.reportsTableStickyColumn;
  const classSites = classes.reportsTableSites;
  const classTitle = classes.reportsTableTitle;
  const columnsWithOutFilter = i18ColumnName(t, classSticky, classSites, classTitle);

  let columns = useMemo(() => {
    return selectedStatus !== statusValidationEnum.rejected
      ? columnsWithOutFilter.filter((col) => col.id !== 'reason')
      : columnsWithOutFilter;
  }, [selectedStatus]);

  const [pdfUrl, setPdfUrl] = useState('');
  const [pdfViewDrawer, setPdfViewDrawer] = useState(false);
  const [error, setError] = useState(false);
  const closeRejectModal = () => {
    setRejectModal(false);
    // setSelectedId('');
    // setCurrentSelected({});
  };
  const _openRejectModal = (data) => {
    setRejectModal(true);
    // setSelectedId(data.id);
    setCurrentSelected(data);
  };

  const confirmButton = async (comments = '', isRejected = false) => {
    try {
      setDisabled(true);
      setLoading(true);
      const body = isRejected
        ? {
            status: 'rejected',
            supervisorComments: comments,
          }
        : {
            status: 'accepted',
            supervisorComments: '',
          };
      const response = await updateReportStatus({
        reportId: currentSelected?.id,
        report: body,
      });
      if (response?.statusCode == 200) {
        toast.success(response?.message, {
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
        fetchReport();
      }
      setDisabled(false);
      setLoading(false);
      closeApproveModal();
      closeRejectModal();
    } catch (error) {
      toast.error(error?.message, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
      setDisabled(false);
      setLoading(false);
    }
  };

  const getShiftReportPDF = async (payload) => {
    try {
      // setLoading(true);
      const response = await getPDFViewOfShiftReport(
        payload?.reportId,
        payload?.templateableType,
        payload?.sendShiftId ? payload?.shiftId : null,
        payload?.sendSiteId ? payload?.siteId : null,
      );

      if (response?.statusCode === 200) {
        setPdfUrl(response?.data?.url);
        return;
      }

      const blob = new Blob([response], {
        type: 'application/pdf',
      });
      const objectUrl = URL.createObjectURL(blob);

      setPdfUrl(objectUrl);
      // setLoading(false);
    } catch (error) {
      // setLoading(false);

      setPdfViewDrawer(false);
      toast.error(error?.message, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  const closeApproveModal = () => {
    setApproveModal(false);
    // setSelectedId('');
    // setCurrentSelected({});
  };
  const _openApproveModal = (data) => {
    setApproveModal(true);
    // setSelectedId(data.id);
    setCurrentSelected(data);
  };

  const renderTableCell = (row, column) => {
    if (column.id === columnIdsEnum.actions) {
      if (
        row?.templateableType !== 'checkpointSummaryReport' &&
        row?.templateableType !== 'shiftSummaryReport' &&
        row?.templateableType !== 'tourReports'
      ) {
        return (
          <>
            <Box
              onClick={() => {
                if (row?.tourId && row?.reportId) {
                  history.push(
                    OBX_TOURE_REPORT.replace(':reportId', 'tour-report').replace(
                      ':tourReportId',
                      row?.reportId,
                    ),
                  );
                } else {
                  history.push(
                    OBX_TOURE_REPORT.replace(':reportId', row?.reportId).replace(
                      '/:tourReportId',
                      '',
                    ),
                  );
                }
              }}
              className={classes.reportsTableActions}
            >
              <EditBtnIcon className={classes.addIcon} />
            </Box>
          </>
        );
      } else {
        return '';
      }
    }
    if (column.id === columnIdsEnum.officer)
      return (
        <Box className={classes.reportsTableOfficer}>
          <Avatar className={classes.reportsTableOfficerAvatar} src={row[column.id]?.imageUrl} />
          {capitalize(row[column.id]?.name) || NA}
        </Box>
      );

    if (column.id === columnIdsEnum.name) {
      if (row[column.id]?.length > 32) {
        return (
          <Tooltip title={row[column.id]} arrow>
            <Box className={classes.franchiseName} onClick={() => gotoDetailPage(column, row)}>
              <Box className={classes.franchiseNameText}>
                {capitalizeFirstLetter(row[column.id].substring(0, 32)) + '...' || NA}
              </Box>
              <Box className={classes.franchiseNameIcon}>
                <ChevronRight />
              </Box>
            </Box>
          </Tooltip>
        );
      }
      return (
        <Box className={classes.franchiseName} onClick={() => gotoDetailPage(column, row)}>
          <Box className={classes.franchiseNameText}>
            {capitalizeFirstLetter(row[column.id]) || NA}
          </Box>
          <Box className={classes.franchiseNameIcon}>
            <ChevronRight />
          </Box>
        </Box>
      );
    }

    if (column.id === columnIdsEnum.site) {
      if (row[column.id]?.name?.length > 32) {
        return (
          <Tooltip title={row[column.id]} arrow>
            {capitalizeFirstLetter(row[column.id]?.name.substring(0, 32)) + '...' || NA}
          </Tooltip>
        );
      }
      return <>{capitalizeFirstLetter(row[column.id]?.name) || NA}</>;
    }

    if (column.id === columnIdsEnum.dueTime) {
      if (!row[column.id]) return <>{NA}</>;
      return (
        <>{`${formatDate(dayjsWithStandardOffset(row[column.id]))}, ${timeFormat12h(row[column.id], true)}`}</>
      );
    }
    if (column.id === columnIdsEnum.submittedDate && row?.submittedAt) {
      return (
        <>{`${formatDate(dayjsWithStandardOffset(row?.submittedAt))}, ${timeFormat12h(row?.submittedAt, true)}`}</>
      );
    }
    // if (column.id == columnIdsEnum.submittedTime && row?.submittedAt) {
    //   return <>{formatDate(row?.submittedAt, 'hh:mm A')}</>;
    // }

    if (column.id === columnIdsEnum.reason && row.status === statusValidationEnum.rejected) {
      const content = row[column.id] || NA;
      const displayContent = content.length > 25 ? `${content.substring(0, 25)}...` : content;

      return (
        <>
          <Tooltip title={content} arrow>
            {displayContent}
          </Tooltip>
        </>
      );
    }

    return <>{row[column.id] || NA}</>;
  };

  const [orderState, setOrderState] = useState(order);

  /**
   * Handle column sorting.
   *
   * @param {String} columnId - The ID of the column being sorted.
   */
  const handleSort = (columnId) => {
    const isAsc = orderState.orderBy === columnId && orderState.orderType === 'asc';
    setOrderState({
      orderBy: columnId,
      orderType: isAsc ? 'desc' : 'asc',
    });
    applySorting(columnId, orderState.orderType);
  };

  /**
   * Determine the sort direction for a column.
   *
   * @param {Object} column - The column configuration object.
   * @return {Boolean|String} - The sort direction or false if not sorted.
   */
  const sortDirection = (column) => {
    return orderState.orderBy === column.id ? orderState.orderType : false;
  };

  /**
   * Determine the order direction for a column.
   *
   * @param {Object} column - The column configuration object.
   * @return {String} - The order direction ('asc' or 'desc').
   */
  const orderDirection = (column) => {
    return orderState.orderBy === column.id ? orderState.orderType : 'asc';
  };

  const tableHead = () => {
    return (
      <>
        <TableRow>
          {columns.map((column) => (
            <TableCell key={column.id} sortDirection={sortDirection(column)}>
              {column.sortable ? (
                <TableSortLabel
                  active={orderState.orderBy === column.id}
                  direction={orderDirection(column)}
                  onClick={() => handleSort(column.id)}
                >
                  {column.label}
                </TableSortLabel>
              ) : (
                `${column.label}`
              )}
            </TableCell>
          ))}
        </TableRow>
      </>
    );
  };

  const tableBody = (data, columns) => {
    return loading ? (
      <TableSkeleton numberOfRows={10} columns={columns} />
    ) : (
      <>
        <NoRecordFound data={data} noOfColumns={columns.length} t={t} />
        {data.map((row) => (
          <TableRow key={row.id}>
            {columns.map((column) => {
              const showHandCursor = column.id === columnIdsEnum.name ? 'pointer' : '';
              return (
                <TableCell
                  key={column.id}
                  style={{ cursor: showHandCursor }}
                  className={column.className}
                >
                  {renderTableCell(row, column)}
                </TableCell>
              );
            })}
          </TableRow>
        ))}
      </>
    );
  };

  const gotoDetailPage = (column, row) => {
    if (column.id === columnIdsEnum.name) {
      getShiftReportPDF(row);
      // setSelectedId(row.id);
      setCurrentSelected(row);
      // history.push(`${OBX_REPORTS}/${row?.id}`);
      setPdfViewDrawer(true);
      setError(false);
    }
  };

  const downloadPdf = async () => {
    try {
      setDownloading(false);
      const response = await downloadPdfFromUrl(pdfUrl, {
        responseType: 'blob',
        skipAuth: true,
      });
      const url = URL.createObjectURL(response);

      downloadLocalPDf(url);
      setDownloading(true);
    } catch (error) {
      setDownloading(true);
      console.error('Error downloading PDF:', error);
    }
  };
  const downloadLocalPDf = (url) => {
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${currentSelected?.templateableType}_${dayjs().unix()}.pdf`);

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      {loading && <LoaderComponent size={50} color={'primary'} label={'Loading'} />}

      <TableComponent
        data={data}
        columns={columns}
        tableHead={tableHead}
        tableBody={tableBody}
        pagination={false}
      />

      <RejectModal
        open={rejectModal}
        handleClose={closeRejectModal}
        handleReject={confirmButton}
        disabled={disabled}
      />
      <ApproveModal
        open={approveModal}
        handleClose={closeApproveModal}
        handleApprove={confirmButton}
        disabled={disabled}
      />

      {pdfViewDrawer && (
        <SideDrawer
          isOpen={pdfViewDrawer}
          key={`${loading}-${pdfUrl}-${error}`}
          totalWidth={'992px'}
        >
          <PDFViewDrawer
            url={pdfUrl}
            setError={setError}
            setUrl={setPdfUrl}
            closeDrawer={setPdfViewDrawer}
          />

          <>
            <Box className={classes.reportsDrawerActions}>
              <Button
                onClick={() => {
                  downloadPdf();
                }}
                variant="secondaryBlue"
                disableRipple
                disabled={!(!loading && !error && pdfUrl?.length && downloading)}
              >
                {t('buttons.downloadReport')}
              </Button>

              {/*{currentSelected?.templateableType !== 'checkpointSummaryReport' &&*/}
              {/*  currentSelected?.templateableType !== 'shiftSummaryReport' &&*/}
              {/*  currentSelected?.templateableType !== 'tourReports' &&*/}
              {/*  !loading &&*/}
              {/*  !error &&*/}
              {/*  pdfUrl?.length > 0 && (*/}
              {/*    <Button*/}
              {/*      onClick={() => {*/}
              {/*        if (currentSelected?.tourId && currentSelected?.reportId) {*/}
              {/*          history.push(*/}
              {/*            OBX_TOURE_REPORT.replace(':reportId', 'tour-report').replace(*/}
              {/*              ':tourReportId',*/}
              {/*              currentSelected?.reportId,*/}
              {/*            ),*/}
              {/*          );*/}
              {/*        } else {*/}
              {/*          history.push(*/}
              {/*            OBX_TOURE_REPORT.replace(':reportId', currentSelected?.reportId).replace(*/}
              {/*              '/:tourReportId',*/}
              {/*              '',*/}
              {/*            ),*/}
              {/*          );*/}
              {/*        }*/}
              {/*      }}*/}
              {/*      variant="secondaryBlue"*/}
              {/*      disableRipple*/}
              {/*    >*/}
              {/*      {t('buttons.editReport')}*/}
              {/*    </Button>*/}
              {/*  )}*/}
            </Box>
          </>
        </SideDrawer>
      )}
    </>
  );
};

ReportTable.propTypes = {
  selectedStatus: PropTypes.string,
  data: PropTypes.array,
  fetchReport: PropTypes.any,
};

export default ReportTable;
