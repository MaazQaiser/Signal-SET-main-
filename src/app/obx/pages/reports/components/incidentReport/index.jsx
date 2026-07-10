import { Box, TableCell, TableRow, TableSortLabel } from '@mui/material';
import CustomDropDown from 'commonComponents/customDropDown';
import DateRangePicker from 'commonComponents/RangeDatepicker';
import SideDrawer from 'commonComponents/sideDrawer';
import TableComponent from 'commonComponents/table';
import NoRecordFound from 'commonComponents/table/noRecordFound';
import TableImage from 'commonComponents/tableImage';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import TableSkeleton from 'src/app/components/common/skeletonLoader/tableSkeleton';
import PDFViewDrawer from 'src/app/obx/pages/reports/components/pdfViewDrawer';
import { useApiControllers } from 'src/helper/axios';
import { formatDate } from 'src/helper/utilityFunctions';
import { getIncidentReport, getPDFViewOfShiftReport } from 'src/services/reports.services';
import { paginationOptions, rolesEnum, toastSettings } from 'src/utils/constants';
import {
  extractValuesByKeyFromInput,
  removeAllFromSelected,
} from 'src/utils/dropdownValueExtractor';
import capitalize from 'src/utils/string/capitalize';
import { capitalizeFirstLetter } from 'src/utils/string/common';

import { dayjsWithStandardOffset } from '../../../schedules/helper';
import { useStyles } from '../../listing/reportsListing.styles';
const perPage = paginationOptions.perPageRows;

const i18ColumnName = (t, hoverIconClass) => {
  return [
    {
      id: 'title',
      label: `${t('obx.incidentReports.table.listing.columns.reports')}`,
      sortable: false,
      className: hoverIconClass,
      hasPermission: [rolesEnum.franchiseOwner, rolesEnum.supervisor],
    },
    {
      id: 'site',
      label: `${t('obx.incidentReports.table.listing.columns.site')}`,
      sortable: false,
      hasPermission: [rolesEnum.franchiseOwner, rolesEnum.supervisor],
    },
    {
      id: 'submittedAt',
      label: `${t('obx.incidentReports.table.listing.columns.submittedAt')}`,
      sortable: false,
      hasPermission: [rolesEnum.franchiseOwner, rolesEnum.supervisor],
    },
    {
      id: 'officer',
      label: `${t('obx.incidentReports.table.listing.columns.submittedBy')}`,
      sortable: false,
      hasImage: true,
      hasPermission: [rolesEnum.franchiseOwner, rolesEnum.supervisor],
    },
  ];
};

const columnIdsEnum = {
  title: 'title',
  site: 'site',
  submittedAt: 'submittedAt',
  officer: 'officer',
};

const order = {};

const IncidentReportTable = ({ params = {}, value, sites, officers }) => {
  const { t } = useTranslation();

  const classes = useStyles();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalRows, setTotalRows] = useState(0);
  const { getNewApiController } = useApiControllers();

  const [orderState, setOrderState] = useState(order);
  const [pdfViewDrawer, setPdfViewDrawer] = useState(false);
  const [pdfUrl, setPdfUrl] = useState('');
  const [error, setError] = useState(false);
  const columns = i18ColumnName(t);
  const NA = t('commonText.nA');

  const [queryParams, setQueryParams] = useState(params);

  const fetchIncidentReport = async () => {
    const apiController = getNewApiController();
    try {
      setLoading(true);
      const updatedParams = {
        siteIds: removeAllFromSelected(
          extractValuesByKeyFromInput(queryParams.site, 'value'),
          'all',
        ),
        officerIds: removeAllFromSelected(
          extractValuesByKeyFromInput(queryParams.officer, 'value'),
          'all',
        ),
        windowStart: queryParams?.selectedDates?.[0]
          ? dayjs(queryParams.selectedDates[0]).format('YYYY-MM-DD')
          : '',
        windowEnd: queryParams?.selectedDates?.[1]
          ? dayjs(queryParams.selectedDates[1]).format('YYYY-MM-DD')
          : '',
      };

      const response = await getIncidentReport(updatedParams, { signal: apiController.signal });

      if (response?.statusCode === 200) {
        setData(response?.data?.reports);
        setTotalRows(response?.data?.pagination?.totalCount);
      }

      setLoading(false);
    } catch (error) {
      if (!apiController.signal.aborted) {
        toast.error(error?.message, {
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
        setLoading(false);
      }
    }
  };

  const updateFormHandler = (name, value) => {
    setQueryParams((prevState) => {
      return {
        ...prevState,
        page: paginationOptions.defaultPerPage,
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

  const handleChangePage = async (_, newPage) => {
    setQueryParams((prev) => ({
      ...prev,
      page: newPage + 1,
    }));
  };

  const applySorting = (sortBy, orderBy) => {
    setQueryParams((prev) => ({
      ...prev,
      sortBy: sortBy,
      orderBy: orderBy,
    }));
  };

  const sortDirection = (column) => {
    return orderState.orderBy === column.id ? orderState.orderType : false;
  };

  const orderDirection = (column) => {
    return orderState.orderBy === column.id ? orderState.orderType : 'asc';
  };

  const handleSort = (columnId) => {
    const isAsc = orderState.orderType === 'asc';
    setOrderState({
      orderBy: columnId,
      orderType: isAsc ? 'desc' : 'asc',
    });
    applySorting(columnId, orderState?.orderType);
  };

  const gotoDetailPage = (column, row) => {
    if (column.id === columnIdsEnum.title) {
      getShiftReportPDF(row);
      // history.push(`${OBX_REPORTS}/${row?.id}`);
      setPdfViewDrawer(true);
    }
  };

  const getShiftReportPDF = async (payload) => {
    try {
      // setLoading(true);
      const response = await getPDFViewOfShiftReport(
        payload?.reportId,
        payload?.templateableType,
        payload?.shiftId,
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
  const tableHead = () => {
    return (
      <>
        <TableRow>
          {columns?.map((column) => (
            <TableCell key={column?.id} sortDirection={sortDirection(column)}>
              {column?.sortable ? (
                <TableSortLabel
                  active={orderState.orderBy === column?.id}
                  direction={orderDirection(column)}
                  onClick={() => handleSort(column?.id)}
                >
                  {column?.label}
                </TableSortLabel>
              ) : (
                `${column?.label}`
              )}
            </TableCell>
          ))}
        </TableRow>
      </>
    );
  };

  const tableBody = (data, columns) => {
    return loading ? (
      <TableSkeleton columns={columns} />
    ) : (
      <>
        <NoRecordFound data={data} noOfColumns={columns.length} t={t} />
        {data?.map((row) => (
          <TableRow key={row?.id}>
            {columns?.map((column) => (
              <TableCell key={column?.id} className={column.className}>
                {renderTableCell(row, column)}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </>
    );
  };

  const renderTableCell = (row, column) => {
    if (column?.id === columnIdsEnum?.title) {
      return (
        <Box onClick={() => gotoDetailPage(column, row)}>
          <Box>{capitalizeFirstLetter(row[column.id].substring(0, 100)) || NA}</Box>
        </Box>
      );
    }

    if (column?.id === columnIdsEnum?.site) {
      return <>{row?.site?.name}</>;
    }
    if (column.id === columnIdsEnum.submittedAt) {
      if (!row[column.id]) return <>{NA}</>;
      return <>{formatDate(dayjsWithStandardOffset(row[column.id]), 'MM/DD/YYYY, hh:mm A')}</>;
    }
    if (column?.id === columnIdsEnum?.officer) {
      return (
        <>
          {row?.officer?.name ? (
            <div className="tableavatar">
              <TableImage
                imageUrl={row?.officer?.imageUrl}
                alt={`${t('commonText.image.alt', {
                  name: `${row?.officer?.name}`,
                })}`}
              />
              {capitalize(row?.officer?.name)}
            </div>
          ) : (
            NA
          )}
        </>
      );
    }
    return <>{row[column.id] || NA}</>;
  };

  useEffect(() => {
    if (value === 1) {
      fetchIncidentReport();
    }
  }, [queryParams, queryParams.selectedDates, queryParams.siteIds, queryParams.officerIds]);

  return (
    <Box className={classes.reportsListings}>
      <Box className={classes.reportsListingsHeader}>
        <Box className={classes.reportsListingsHeaderLeft}>
          {/* <Box className={classes.reportsListingsHeaderRightSwitch}> */}
          {/*<ToggleButtonGroup*/}
          {/*  color="primary"*/}
          {/*  value={queryParams?.status}*/}
          {/*  exclusive*/}
          {/*  onChange={handleToggle}*/}
          {/*>*/}
          {/*  <ToggleButton value={filterStatusEnums.pending}>*/}
          {/*    {statusEnum.submitted}*/}
          {/*    <Box>{totalSubmitted}</Box>*/}
          {/*  </ToggleButton>*/}
          {/*  <ToggleButton value={filterStatusEnums.approved}>*/}
          {/*    {statusEnum.approves}*/}
          {/*  </ToggleButton>*/}
          {/*  <ToggleButton value={filterStatusEnums.rejected}>*/}
          {/*    {statusEnum.rejected}*/}
          {/*  </ToggleButton>*/}
          {/*</ToggleButtonGroup>*/}
          {/* </Box> */}
          <Box className={classes.reportsListingsFilters}>
            <CustomDropDown
              label={t('obx.shiftReports.filters.sites.label')}
              name="site"
              searchable
              options={sites}
              selectedValues={queryParams?.site || []}
              handleChange={inputChangedHandler}
              searchPlaceholder={t('obx.shiftReports.filters.sites.searchPlaceholder')}
              checkmark
              multiSelect={true}
              clearAll
            />

            <CustomDropDown
              label={t('obx.shiftReports.filters.users.label')}
              name="officer"
              searchable
              options={officers}
              selectedValues={queryParams?.officer || []}
              handleChange={inputChangedHandler}
              searchPlaceholder={t('obx.shiftReports.filters.users.searchPlaceholder')}
              checkmark={true}
              multiSelect={true}
              clearAll={true}
            />
          </Box>
        </Box>
        <Box className={classes.reportsListingsHeaderRight}>
          <Box className={classes.reportsListingsHeaderRightDate}>
            <DateRangePicker
              selectedDates={queryParams?.selectedDates}
              setDates={(dates) => {
                updateFormHandler('selectedDates', dates);
              }}
            />
          </Box>
        </Box>
      </Box>
      <Box className={classes.reportsListingsContent}>
        <TableComponent
          data={data}
          columns={columns}
          tableHead={tableHead}
          tableBody={tableBody}
          pagination={true}
          page={params.page - 1}
          perPage={perPage}
          totalRecords={totalRows}
          handleChangePage={handleChangePage}
          applySorting={applySorting}
        />
      </Box>

      {pdfViewDrawer && (
        <SideDrawer
          isOpen={pdfViewDrawer}
          key={`${loading}-${pdfUrl}-${error}`}
          totalWidth="1024px"
        >
          <PDFViewDrawer
            url={pdfUrl}
            setError={setError}
            setUrl={setPdfUrl}
            closeDrawer={setPdfViewDrawer}
          />
        </SideDrawer>
      )}
    </Box>
  );
};

IncidentReportTable.propTypes = {
  params: PropTypes.object,
  value: PropTypes.number,
  sites: PropTypes.array,
  officers: PropTypes.array,
};

export default IncidentReportTable;
