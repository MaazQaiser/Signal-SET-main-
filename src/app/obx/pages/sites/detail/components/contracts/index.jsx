import { Box, Chip, TableCell, TableRow, Tooltip, useMediaQuery, useTheme } from '@mui/material';
import Typography from '@mui/material/Typography';
import { ReactComponent as DeleteIcon } from 'assets/svg/delete-modal.svg';
import { ReactComponent as EyeIcon } from 'assets/svg/eye.svg';
import { ReactComponent as BanIcon } from 'assets/svg/not-allowed-icon.svg';
import { ReactComponent as PdfIcon } from 'assets/svg/pdf.svg';
import PopoverButton from 'commonComponents/popoverButton';
import SideDrawer from 'commonComponents/sideDrawer';
import SweetAlertModal from 'commonComponents/sweetAlertModal';
import TableComponent from 'commonComponents/table';
import NoRecordFound from 'commonComponents/table/noRecordFound';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { deleteSitesContract, getSitesContracts } from 'services/sites.services';
import AccordionSkeleton from 'src/app/components/common/skeletonLoader/accordionSkeleton';
import TableSkeleton from 'src/app/components/common/skeletonLoader/tableSkeleton';
import {
  dayjsWithStandardOffset,
  getDaysWrtTimezoneAsPerStandardTime,
} from 'src/app/obx/pages/schedules/helper';
import ContractDetails from 'src/app/obx/pages/sites/detail/components/contracts/components/contractDetails';
import TableAccordion from 'src/app/obx/pages/sites/detail/components/tableAccordion';
import { MoreVert, TrashIcon } from 'src/assets/svg';
import { ReactComponent as ActiveIcon } from 'src/assets/svg/check_circle_outline.svg';
import { ReactComponent as DangerIcon } from 'src/assets/svg/not-available-icon-officer.svg';
import { formatDate, timeFormat12h } from 'src/helper/utilityFunctions';
import {
  contractStatusEnum,
  daysOfWeekWithVal,
  DUTY_TYPES,
  rolesEnum,
  toastSettings,
} from 'src/utils/constants';
import { toaster } from 'src/utils/toast';

import ViewDetailModal from './components/viewDetailModal';
import { useStyles } from './contractsStyles';
// import CallSplitIcon from "@mui/icons-material/CallSplit";

const i18ColumnName = (t) => {
  return [
    {
      id: 'name',
      label: `${t('obx.contracts.tables.listing.columns.serviceName')}`,
      sortable: false,
    },
    {
      id: 'duty',
      label: `${t('obx.contracts.tables.listing.columns.jobType')}`,
      sortable: false,
    },
    {
      id: 'startTime',
      label: `${t('obx.contracts.tables.listing.columns.startTime')}`,
      sortable: false,
    },
    {
      id: 'endTime',
      label: `${t('obx.contracts.tables.listing.columns.endTime')}`,
      sortable: false,
    },
    {
      id: 'dutyDays',
      label: `${t('obx.contracts.tables.listing.columns.jobDays')}`,
      sortable: false,
    },
    {
      id: 'noOfHits',
      label: `${t('obx.contracts.tables.listing.columns.noOfHits')}`,
      sortable: false,
    },
    {
      id: 'officersCount',
      label: `${t('obx.contracts.tables.listing.columns.noOfOfficers')}`,
      sortable: false,
    },
    {
      id: 'hourlyRate',
      label: `${t('obx.contracts.tables.listing.columns.hourlyRate')}`,
      sortable: false,
    },
    {
      id: 'additionalServices',
      label: `${t('obx.contracts.tables.listing.columns.additionalServices')}`,
      sortable: false,
    },
  ];
};

const enumContractListing = {
  dutyDays: 'dutyDays',
  additionalServices: 'additionalServices',
  startTime: 'startTime',
  endTime: 'endTime',
  name: 'name',
  duty: 'duty',
  officersCount: 'officersCount',
  noOfHits: 'noOfHits',
  hourlyRate: 'hourlyRate',
};

const _enumStatus = {
  inactive: 'InActive',
  active: 'Active',
  expired: 'Expired',
};

export const ContractStatusChip = ({ contractStatus }) => {
  const { t } = useTranslation();

  const classes = useStyles();

  return (
    <>
      {contractStatus === contractStatusEnum.ACTIVE && (
        <Chip color="success" label={`${t('obx.contracts.status.active')}`} icon={<ActiveIcon />} />
      )}
      {contractStatus === contractStatusEnum.TERMINATED && (
        <Chip
          color="error"
          label={`${t('obx.contracts.status.terminated')}`}
          icon={<BanIcon />}
          className={classes.terminatedChip}
        />
      )}
      {contractStatus === contractStatusEnum.EXPIRED && (
        <Chip color="error" label={`${t('obx.contracts.status.expired')}`} icon={<DangerIcon />} />
      )}
    </>
  );
};

ContractStatusChip.propTypes = {
  contractStatus: PropTypes.object,
};

const Contracts = ({ id }) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const columns = i18ColumnName(t);

  const userRole = useSelector((state) => state.auth.userRole);

  const isFO = userRole?.slug === rolesEnum?.franchiseOwner;
  const isSUP = userRole?.slug === rolesEnum?.supervisor;

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDrawer, setShowDrawer] = useState(false);
  const [confirmationModal, setConfirmationModal] = useState(false);

  const [deleteContractId, setDeleteContractId] = useState(null);
  const [modalDetailId, setModalDetailId] = useState(null);
  const handleCloseDrawer = () => setShowDrawer(false);
  const [openModalViewDetail, setOpenModalViewDetail] = useState(false);
  const [pdfUrl, setPdfUrl] = useState('');

  const theme = useTheme();

  const isScreenLg = useMediaQuery(theme.breakpoints.down('lg'));

  const convertStartAndEndTime = (t) => {
    const hour = t?.split(':')?.[0] || 0;
    const time = t?.split(':')?.[1] || 0;

    const formatTime = dayjs.utc().set('hour', hour).set('minute', time);
    return formatTime.local();
  };

  const fetchSiteContracts = async () => {
    try {
      setLoading(true);
      const response = await getSitesContracts(id);

      if (response?.statusCode === 200) {
        const updateContractsData = response?.data?.contracts?.map((data) => {
          const updateData = data?.data?.map((iData) => {
            const localStartTime = convertStartAndEndTime(iData?.startTime);
            const localEndTime = convertStartAndEndTime(iData?.endTime);

            const timeZondedDays = getDaysWrtTimezoneAsPerStandardTime(
              localStartTime,
              iData?.dutyDays,
            );

            const convertValuesToLabels = timeZondedDays?.map(
              (a) => daysOfWeekWithVal?.find((b) => a == b?.value)?.label,
            );

            // Handle visits array
            const updatedVisits = iData?.visits?.map((visit) => {
              const localVisitStartDateTime =
                visit?.startTime === null ? null : convertStartAndEndTime(visit?.startTime);
              const localVisitEndDateTime =
                visit?.endTime === null ? null : convertStartAndEndTime(visit?.endTime);

              const visitTimeZonedDays = getDaysWrtTimezoneAsPerStandardTime(
                localVisitStartDateTime,
                visit?.dutyDays,
              );

              const visitConvertValuesToLabels = visitTimeZonedDays?.map(
                (a) => daysOfWeekWithVal?.find((b) => a == b?.value)?.label,
              );

              return {
                ...visit,
                dutyDays: visitConvertValuesToLabels,
                startTime: localVisitStartDateTime,
                endTime: localVisitEndDateTime,
              };
            });

            return {
              ...iData,
              dutyDays: convertValuesToLabels,
              startTime: localStartTime,
              endTime: localEndTime,
              visits: updatedVisits,
            };
          });

          return {
            ...data,
            data: updateData,
          };
        });

        setData(updateContractsData);
      }

      setLoading(false);
    } catch (error) {
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
      setLoading(false);
    }
  };

  const handleDeleteJob = async () => {
    try {
      setConfirmationModal(false);
      setLoading(true);

      const res = await deleteSitesContract(deleteContractId);
      toaster.success({
        text: res?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });

      fetchSiteContracts();

      setConfirmationModal(false);
    } catch (error) {
      setConfirmationModal(false);
      setLoading(false);
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  const onlyDispatch = (data) => data?.every((contract) => contract.duty === DUTY_TYPES.dispatch);

  const tableHead = (data) => {
    const isDispatch = onlyDispatch(data);
    return (
      <>
        {isDispatch ? (
          <TableRow>
            {columns?.map((column) =>
              [enumContractListing.name, enumContractListing.duty].includes(column.id) ? (
                <TableCell key={column?.id}>{`${column?.label}`}</TableCell>
              ) : null,
            )}
          </TableRow>
        ) : (
          <TableRow>
            {columns?.map((column) => (
              <TableCell key={column?.id}>{`${column?.label}`}</TableCell>
            ))}
          </TableRow>
        )}
      </>
    );
  };

  const tableBody = (data, columns) => {
    return loading ? (
      <TableSkeleton columns={columns} />
    ) : (
      <>
        <NoRecordFound data={data} noOfColumns={columns.length} t={t} />
        {data?.map((row) => {
          const visitsLength = row?.visits?.length || 0; // Get length of visits
          const isDispatch = onlyDispatch(data);

          if (isDispatch) {
            return (
              <TableRow key={row.id}>
                {columns?.map(
                  (column) =>
                    [enumContractListing.name, enumContractListing.duty].includes(column.id) && (
                      <TableCell key={column.id}>{renderTableCell(row, column)}</TableCell>
                    ),
                )}
              </TableRow>
            );
          } else if (visitsLength > 0) {
            // If there are visits, render them
            return row.visits.map((visit, visitIndex) => (
              <TableRow
                key={`${row?.id}-${visitIndex}`}
                className={visitsLength > 1 ? classes.contractTableCell : ''}
              >
                {columns?.map((column) => {
                  if (column.id === 'name') {
                    if (visitIndex === 0) {
                      // Apply rowSpan only if visits length is greater than 1
                      return (
                        <TableCell key={column?.id} rowSpan={visitsLength}>
                          {renderTableCell(row, column, visit)}
                        </TableCell>
                      );
                    } else {
                      // Skip rendering for subsequent rows when rowSpan is applied
                      return null;
                    }
                  } else {
                    // Render other columns normally for each visit row
                    return (
                      <TableCell className={classes.contractNotSpan} key={column?.id}>
                        {renderTableCell(row, column, visit)}
                      </TableCell>
                    );
                  }
                })}
              </TableRow>
            ));
          } else {
            // If no visits, render normal row using data array
            return (
              <TableRow key={row.id}>
                {columns?.map((column) => (
                  <TableCell key={column.id}>{renderTableCell(row, column)}</TableCell>
                ))}
              </TableRow>
            );
          }
        })}
      </>
    );
  };

  const tableSkeletonBody = (_data = {}, columns) => {
    return <TableSkeleton numberOfRows={2} columns={columns} />;
  };

  const renderTableCell = (row, column, visitIndex) => {
    if (enumContractListing.dutyDays === column.id) {
      if (row.duty === DUTY_TYPES.dispatch) return t('commonText.nA');
      if (row.duty === DUTY_TYPES.patrol) {
        return visitIndex?.dutyDays ? (
          <Tooltip
            title={visitIndex?.dutyDays
              ?.map((str) => str?.charAt(0)?.toUpperCase() + str?.slice(1))
              .join(', ')}
            placement="right"
            arrow
          >
            {visitIndex?.dutyDays?.map((a) => a[0]?.toUpperCase())?.join(', ')}
          </Tooltip>
        ) : (
          t('commonText.nA')
        );
      }

      return (
        <Tooltip
          title={row?.dutyDays
            ?.map((str) => str?.charAt(0)?.toUpperCase() + str?.slice(1))
            .join(', ')}
          placement="right"
          arrow
        >
          {row?.dutyDays?.map((a) => a[0]?.toUpperCase())?.join(', ')}
        </Tooltip>
      );
    }

    if (enumContractListing.additionalServices === column.id) {
      if (row.duty === DUTY_TYPES.dispatch) return t('commonText.nA');
      return row?.additionalServices?.length > 0 ? (
        <Box className={classes.chipWrapper}>
          {row?.additionalServices?.map((a, index) => {
            return <Chip key={index} color="primary" size="small" label={a} />;
          })}
        </Box>
      ) : (
        t('commonText.nA')
      );
    }

    if (enumContractListing.startTime === column.id) {
      if (row.duty === DUTY_TYPES.dispatch) return t('commonText.nA');
      if (row.duty === DUTY_TYPES.patrol) {
        return <>{timeFormat12h(visitIndex?.startTime, true)}</>;
      }
      return <>{timeFormat12h(row[column.id], true)}</>;
    }

    if (enumContractListing.endTime === column.id) {
      if (row.duty === DUTY_TYPES.dispatch) return t('commonText.nA');
      if (row.duty === DUTY_TYPES.patrol) {
        return (
          <>{visitIndex?.endTime ? timeFormat12h(visitIndex?.endTime, true) : t('commonText.nA')}</>
        );
      }
      return <>{timeFormat12h(row[column.id], true)}</>;
    }

    if (enumContractListing.duty === column.id) {
      return (
        <Box className={classes.jobType}>
          {row[column.id]}

          {!!visitIndex && (
            <Chip
              key={visitIndex?.visitType}
              color="primary"
              size="small"
              label={visitIndex?.visitType}
            />
          )}
        </Box>
      );
    }

    if (enumContractListing.name === column.id) {
      return (
        <>
          {row[column.id] || t('commonText.nA')}{' '}
          {row.duty === DUTY_TYPES.patrol && row.visits.length > 1 && <>({row.visits.length})</>}
        </>
      );
    }

    if (enumContractListing.officersCount === column.id) {
      if (row.duty === DUTY_TYPES.dispatch) return t('commonText.nA');
      if (row.duty === DUTY_TYPES.patrol) {
        return <>{t('commonText.nA')}</>;
      }
      return <>{row[column?.id] || t('commonText.nA')}</>;
    }

    if (enumContractListing.hourlyRate === column.id) {
      return <>{!isSUP ? row[column?.id] : t('commonText.nA') || t('commonText.nA')}</>;
    }

    return <>{row[column.id] || t('commonText.nA')}</>;
  };

  const renderAccordionHeader = (data) => {
    // const isStatusActive = data?.status === 'active';
    // const status = contractStatusEnum[data?.status];
    return (
      <Box className={classes.accordianWrapper}>
        <Box className={classes.titleWrapper}>
          <Tooltip
            title={data?.title.length >= 40 ? data?.title : ''}
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
              },
            }}
          >
            <Typography variant="subtitle2" className={classes.Title}>
              {isScreenLg && data?.title.length >= 40 ? (
                <>{data?.title.substring(0, 25) + '...'}</>
              ) : (
                <>{data?.title}</>
              )}
            </Typography>
          </Tooltip>

          <ContractStatusChip contractStatus={data?.status} />
          {/*{isStatusActive ? (*/}
          {/*  <Chip label={status} color="success" icon={<ActiveIcon />} />*/}
          {/*) : (*/}
          {/*  <Chip label={status} color="error" icon={<WarningIcon />} />*/}
          {/*)}*/}
          {isFO && data?.contractFile ? (
            <>
              <PdfIcon
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDrawer(true);
                  setPdfUrl(data?.contractFile);
                }}
              />
            </>
          ) : (
            ''
          )}
        </Box>
        <Box>
          <Tooltip
            title={t('obx.sites.siteInformation.contractDuration')}
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
              },
            }}
          >
            <Typography variant="subtitle3" className={classes.timeSpan}>
              {`${formatDate(dayjsWithStandardOffset(data?.startDate))} - ${formatDate(dayjsWithStandardOffset(data?.endDate))} `}
            </Typography>
          </Tooltip>

          <PopoverButton
            className={classes.questionBankActions}
            variant="icon"
            Icon={MoreVert}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'center',
            }}
          >
            <Box className={classes.questionBankActionsMenu}>
              <Box
                onClick={() => {
                  setOpenModalViewDetail(true);
                  setModalDetailId(data?.id);
                }}
                className={classes.questionBankActionsRegular}
              >
                <EyeIcon className={classes.questionBankActionsIconRegular} />
                <Typography className={classes.questionBankActionsTextRegular} variant="subtitle2">
                  {t('obx.contracts.viewDetails')}
                </Typography>
              </Box>
              <Box
                onClick={() => {
                  setDeleteContractId(data?.id);
                  setConfirmationModal(true);
                }}
                className={classes.questionBankActionsDelete}
              >
                <TrashIcon className={classes.questionBankActionsIconDelete} />
                <Typography className={classes.questionBankActionsTextDelete} variant="subtitle2">
                  {t('commonText.delete')}
                </Typography>
              </Box>
            </Box>
          </PopoverButton>
        </Box>
      </Box>
    );
  };

  useEffect(() => {
    if (id) fetchSiteContracts();
  }, [id]);

  return (
    <Box className={classes.contractsWrapper}>
      {/* {loading && <LoaderComponent size={50} color={'primary'} label={'Loading'} />} */}

      {loading ? (
        <AccordionSkeleton accordionSkeletonHeader={true} noOfRows={3} pills={true}>
          <TableComponent
            data={{}}
            columns={columns}
            tableHead={tableHead}
            tableBody={tableSkeletonBody}
            pagination={false}
          />
        </AccordionSkeleton>
      ) : (
        <>
          {!loading && (
            <NoRecordFound data={data} noOfColumns={columns.length} t={t} type={'listing'} />
          )}
          {data.length > 0 && (
            <Box className={classes.collapseContainer}>
              {data?.map((a, key) => {
                return (
                  <TableAccordion
                    key={key}
                    accordionNo={key}
                    header={renderAccordionHeader(a)}
                    title={a?.title}
                  >
                    <TableComponent
                      data={a?.data}
                      columns={columns}
                      tableHead={() => tableHead(a.data)}
                      tableBody={tableBody}
                      pagination={false}
                      tableBodyClass={classes.contractsTableBody}
                    />
                  </TableAccordion>
                );
              })}
            </Box>
          )}
        </>
      )}

      <SweetAlertModal
        type="warning"
        title={t('obx.sites.siteInformation.contractDeleteTitle')}
        text={t('obx.sites.siteInformation.contractDeleteDesc')}
        cancelButtonText={t('links.cancel')}
        confirmButtonText={t('obx.sites.siteInformation.contractDeleteButtonConfirm')}
        show={!!confirmationModal}
        handleConfirmButton={() => handleDeleteJob()}
        handleCancelButton={() => setConfirmationModal(null)}
        icon={<DeleteIcon />}
      />
      <SideDrawer
        closeDrawer={() => {
          setShowDrawer(false);
        }}
        isOpen={showDrawer}
        totalWidth={'900px'}
      >
        <ContractDetails
          url={pdfUrl}
          siteId={id}
          showDrawer={showDrawer}
          handleClose={handleCloseDrawer}
        />
      </SideDrawer>

      {openModalViewDetail && (
        <ViewDetailModal
          open={openModalViewDetail}
          onClose={setOpenModalViewDetail}
          data={data}
          id={modalDetailId}
        />
      )}
    </Box>
  );
};

Contracts.propTypes = {
  id: PropTypes.number,
};

export default Contracts;
