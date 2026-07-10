import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Chip,
  TableCell,
  TableRow,
  Typography,
} from '@mui/material';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import { ReactComponent as ChevronUpIcon } from 'assets/svg/chevron-up.svg';
import CustomDropDown from 'commonComponents/customDropDown';
import DateRangePicker from 'commonComponents/RangeDatepicker';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import PaginationComponent from 'src/app/components/common/pagination';
import AccordionSkeleton from 'src/app/components/common/skeletonLoader/accordionSkeleton';
import TableSkeleton from 'src/app/components/common/skeletonLoader/tableSkeleton';
import TableComponent from 'src/app/components/common/table';
import NoRecordFound from 'src/app/components/common/table/noRecordFound';
import IncidentReportTable from 'src/app/obx/pages/reports/components/incidentReport';
import { formatDate, timeFormat12h } from 'src/helper/utilityFunctions';
import { getFranchiseReports, getOfficersDropDown } from 'src/services/reports.services';
import { getAllSites } from 'src/services/sites.services';
import { getTemplateReportTypes } from 'src/services/template.services';
import transformArrayForOptions from 'src/utils/array/transformArrayForOptions';
import {
  dataReportCheckPointShiftSummary,
  dataReportShiftSummary,
  dataShiftTourReports,
  paginationOptions,
  runsheetDayEndReport,
  toastSettings,
} from 'src/utils/constants';
import {
  extractValuesByKeyFromInput,
  removeAllFromSelected,
} from 'src/utils/dropdownValueExtractor';

import { dayjsWithStandardOffset } from '../../schedules/helper';
import ReportTable, { i18ColumnName, statusValidationEnum } from '../components/reportsTable';
import { useStyles } from './reportsListing.styles';

const today = dayjsWithStandardOffset();
const startOfMonth = today.startOf('month');
const endOfMonth = today.endOf('month');

const filterStatusEnums = {
  pending: 'submitted',
  approved: 'accepted',
  rejected: 'rejected',
};
const params = {
  page: paginationOptions.defaultPerPage,
  perPage: paginationOptions.perPageRows,
  search: '',
  reportType: [],
  site: [],
  officer: [],
  sortBy: '',
  submittedAt: null,
  status: filterStatusEnums.pending,
  orderBy: '',
  selectedDates: [startOfMonth, endOfMonth],
};

export default function SitesListing() {
  const { t } = useTranslation();
  const classes = useStyles();

  const _statusEnum = {
    submitted: t('buttons.pending'),
    approves: t('buttons.approved'),
    rejected: t('buttons.rejected'),
  };

  const [data, setData] = useState([]);
  const [templateTypes, setTemplatTypes] = useState([]);
  const [allSites, setAllSites] = useState([]);
  const [allOfficers, setAllOfficers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [queryParams, setQueryParams] = useState(params);
  const [totalRows, setTotalRows] = useState(0);
  const columnsWithOutFilter = i18ColumnName(t);

  const [expanded, setExpanded] = useState([]);
  const [value, setValue] = useState(0);

  // const [totalIncidentReport, setTotalIncidentReport] = useState(0);
  // const [allIncidentReport, setAllIncidentReport] = useState([]);

  const handleChangeTab = (event, newValue) => {
    setValue(newValue);
    setQueryParams(params);
  };
  let columns = useMemo(() => {
    return queryParams?.status !== statusValidationEnum.rejected
      ? columnsWithOutFilter.filter((col) => col.id !== 'reason')
      : columnsWithOutFilter;
  }, [queryParams.status]);

  const handleChangePage = async (_, newPage) => {
    setQueryParams((prev) => ({
      ...prev,
      page: newPage + 1,
    }));
  };

  const _handleToggle = (event, newAlignment) => {
    if (newAlignment)
      setQueryParams((prevState) => {
        return {
          ...prevState,
          page: paginationOptions.defaultPerPage,
          status: newAlignment,
        };
      });
  };

  const handleChange = (panel) => (event, isExpanded) => {
    const tempExpand = isExpanded ? [...expanded, panel] : expanded.filter((item) => item != panel);
    setExpanded(tempExpand);
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

  const fetchShiftReports = async () => {
    try {
      setLoading(true);

      const response = await getFranchiseReports({
        page: queryParams?.page,
        perPage: queryParams?.perPage,
        search: queryParams?.search,
        officerId: removeAllFromSelected(
          extractValuesByKeyFromInput(queryParams.officer, 'value'),
          'all',
        ),
        siteId: removeAllFromSelected(
          extractValuesByKeyFromInput(queryParams?.site, 'value'),
          'all',
        ),
        templateType: removeAllFromSelected(
          extractValuesByKeyFromInput(queryParams?.reportType, 'value'),
          'all',
        ),
        submittedAt: queryParams?.submittedAt?.format(),
        windowStart: queryParams?.selectedDates?.[0]
          ? dayjs(queryParams.selectedDates[0]).format('YYYY-MM-DD')
          : '',
        windowEnd: queryParams?.selectedDates?.[1]
          ? dayjs(queryParams.selectedDates[1]).format('YYYY-MM-DD')
          : '',
      });
      setLoading(false);
      if (response?.statusCode === 200 && response?.data) {
        const updateDataModel = response?.data?.shifts?.map((d) => {
          const updateDataPossible = { ...d };

          if (d?.shiftStatus === 'shiftEnded' || d?.shiftStatus === 'shiftAutoEnded') {
            if (updateDataPossible?.siteName) {
              updateDataPossible.reports.push({
                ...dataShiftTourReports,
                reportId: null,
                templateableType: 'tourReports',
                shiftId: d?.reports[0]?.shiftId,
                sendShiftId: true,
              });
            } else {
              updateDataPossible.reports = [
                ...updateDataPossible.reports,

                {
                  ...runsheetDayEndReport,
                  reportId: null,
                  templateableType: 'runsheetSummaryReport',
                  shiftId: d?.reports[0]?.shiftId,
                  sendShiftId: true,
                },
              ];
            }
          }

          if (d?.isSummaryAvailable) {
            if (updateDataPossible?.siteName) {
              updateDataPossible.reports = [
                ...updateDataPossible.reports,

                {
                  ...dataReportCheckPointShiftSummary,
                  reportId: null,
                  templateableType: 'checkpointSummaryReport',
                  shiftId: d?.reports[0]?.shiftId,
                  sendShiftId: true,
                },

                {
                  ...dataReportShiftSummary,
                  reportId: null,
                  templateableType: 'shiftSummaryReport',
                  shiftId: d?.reports[0]?.shiftId,
                  sendShiftId: true,
                },
              ];
            } else {
              updateDataPossible.reports = [
                ...updateDataPossible.reports,

                {
                  ...runsheetDayEndReport,
                  reportId: null,
                  templateableType: 'runsheetSummaryReport',
                  shiftId: d?.reports[0]?.shiftId,
                  sendShiftId: true,
                },
              ];
            }
          }

          if (updateDataPossible?.visits) {
            const visitMapped = updateDataPossible?.visits
              ?.filter((f) => f?.tour?.reportId)
              .map((visit) => {
                return {
                  title: visit?.tour?.title || '',
                  reportId: visit?.tour?.reportId || '',
                  siteId: visit?.siteId || '',
                  status: visit?.tour?.reportId ? 'submitted' : 'notSubmitted',
                  visitType: visit?.visitType,
                  templateableType: visit?.visitType === 'dispatch' ? 'dispatch' : 'siteHitReport',
                  submittedAt: null,
                  isVisits: true,
                  siteName: visit?.siteName || '',
                  visitedAt: visit?.visitedAt || null,
                  sendSiteId: visit?.visitType === 'dispatch',
                };
              });

            updateDataPossible.reports = [...updateDataPossible.reports, ...visitMapped];
          }

          return updateDataPossible;
        });

        setData(updateDataModel);

        setTotalRows(response?.data?.pagination?.totalCount);
        return;
      }
      setData([]);
    } catch (error) {
      console.log({ error });
      setLoading(false);
    }
  };

  const fetchTemplateTypes = async () => {
    try {
      const response = await getTemplateReportTypes();

      if (response?.statusCode == 200) {
        let tempTypes = response?.data?.responseTypes || {};
        const tempTypesArray = Object.keys(tempTypes).map((key) => ({
          value: key,
          label: tempTypes[key],
        }));
        setTemplatTypes([{ value: 'all', label: 'All Reports' }, ...tempTypesArray]);
        return;
      }
      setTemplatTypes([]);
    } catch (error) {
      //error handling
    }
  };

  const fetchAllSites = async () => {
    try {
      const response = await getAllSites();

      if (response?.statusCode === 200) {
        let transformedSites = transformArrayForOptions(response?.data?.sites, 'name', 'id') || [];

        setAllSites([{ value: 'all', label: 'All Sites' }, ...transformedSites]);
      }
    } catch (error) {
      //error handling
      toast.error(error?.message, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  const fetchAllOfficers = async () => {
    try {
      const response = await getOfficersDropDown();
      if (response?.data?.statusCode === 200) {
        const transformedUsers = transformArrayForOptions(response?.data?.users, 'name', 'id');
        setAllOfficers([
          {
            value: 'all',
            label: 'All Officers',
            image: 'someDefaultImageString',
          },
          ...transformedUsers,
        ]);
      }
    } catch (error) {
      //error handling
      toast.error(error?.message, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  useEffect(() => {
    if (value === 0) {
      fetchShiftReports();
    }
  }, [queryParams]);

  useEffect(() => {
    fetchTemplateTypes();
    fetchAllSites();
    fetchAllOfficers();
  }, []);

  const tableSkeletonBody = (_data = {}, columns) => {
    return <TableSkeleton numberOfRows={2} columns={columns} />;
  };

  const handleChangeRowsPerPage = (event) => {
    setQueryParams((prev) => ({
      ...prev,
      page: paginationOptions.defaultPerPage,
      perPage: parseInt(event.target.value, 10),
    }));
  };

  return (
    <Box>
      <Box className={classes.functionalDiv}>
        <Tabs
          variant="scrollable"
          scrollButtons="auto"
          value={value}
          onChange={handleChangeTab}
          className={classes.tabContainer}
        >
          <Tab label={t('obx.shiftReports.tabtitle.shift')} />
          <Tab label={t('obx.shiftReports.tabtitle.incident')} />
        </Tabs>
      </Box>
      <CustomTabPanel value={value} index={0}>
        <Box className={classes.reportsListings}>
          {/* {loading && <LoaderComponent size={50} color={'primary'} label={'Loading'} />} */}
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
                  label={t('obx.shiftReports.filters.reports.label')}
                  name="reportType"
                  options={templateTypes}
                  selectedValues={queryParams?.reportType || []}
                  handleChange={inputChangedHandler}
                  searchPlaceholder={t('obx.shiftReports.filters.reports.search')}
                  searchable={true}
                  checkmark
                  multiSelect={true}
                  clearAll={true}
                />

                <CustomDropDown
                  label={t('obx.shiftReports.filters.sites.label')}
                  name="site"
                  clearAll
                  searchable
                  options={allSites}
                  selectedValues={queryParams?.site || []}
                  handleChange={inputChangedHandler}
                  searchPlaceholder={t('obx.shiftReports.filters.sites.searchPlaceholder')}
                  checkmark
                  multiSelect={true}
                />

                <CustomDropDown
                  label={t('obx.shiftReports.filters.users.label')}
                  name="officer"
                  searchable
                  options={allOfficers}
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
          {/* {data.length == 0 && !loading ? (
        <NoData text={t('commonText.table.noRecordFound')} className={classes.noDataWrapper} />
      ) : (
        <> */}
          {loading ? (
            <Box className={classes.reportsListingsContent}>
              <AccordionSkeleton accordionSkeletonHeader={true} noOfRows={3} pills={false}>
                <TableComponent
                  data={{}}
                  columns={columns}
                  tableHead={() => (
                    <>
                      <TableRow>
                        {columns.map((column) => (
                          <TableCell key={column.id}>{column.label}</TableCell>
                        ))}
                      </TableRow>
                    </>
                  )}
                  tableBody={tableSkeletonBody}
                  pagination={false}
                />
              </AccordionSkeleton>
            </Box>
          ) : (
            <>
              {!loading && data?.length <= 0 && (
                <Box className={classes.shiftRecordsNoRecord}>
                  <NoRecordFound data={data} t={t} type={'listing'} />
                </Box>
              )}
              {data?.length > 0 && (
                <>
                  <Box className={classes.reportsListingsContent}>
                    {data.map((shift, index) => (
                      <Accordion
                        key={shift?.id}
                        defaultExpanded={index === 0}
                        // expanded={expanded.includes(shift?.id)}
                        onChange={handleChange(shift?.id)}
                      >
                        <AccordionSummary expandIcon={<ChevronUpIcon />}>
                          <Typography
                            variant="subtitle2"
                            className={classes.reportsListingsAccordionTitle}
                          >
                            {shift?.name} •{' '}
                            {shift?.siteName ? (
                              shift?.siteName
                            ) : (
                              <>
                                <Chip label={t('obx.runsheet.runsheet')} color="primary" />
                              </>
                            )}
                          </Typography>
                          <Box className={classes.reportsListingsAccordionRight}>
                            <Typography
                              variant="subtitle3"
                              className={classes.reportsListingsAccordionTime}
                            >
                              {t(
                                'obx.schedules.assignDedicatedDuty.toursAndReports.reports.noOfReports',
                              )}
                              : {shift?.reports?.length}
                            </Typography>

                            <Typography
                              variant="subtitle3"
                              className={classes.reportsListingsAccordionTime}
                            >
                              {t(
                                'obx.schedules.assignDedicatedDuty.toursAndReports.reports.listing.shiftTiming',
                              )}
                              :{' '}
                              {`${timeFormat12h(shift?.startsAt, true)} - ${timeFormat12h(shift?.endsAt, true)} • ${formatDate(dayjsWithStandardOffset(shift?.startsAt))}`}
                            </Typography>
                          </Box>
                        </AccordionSummary>
                        <AccordionDetails>
                          <ReportTable
                            selectedStatus={queryParams.status}
                            queryParams={queryParams}
                            data={shift?.reports || []}
                            fetchReport={fetchShiftReports}
                          />
                        </AccordionDetails>
                      </Accordion>
                    ))}
                  </Box>
                </>
              )}
            </>
          )}

          <Box className={classes.reportsListingsPagination}>
            <PaginationComponent
              page={queryParams.page - 1}
              perPage={queryParams.perPage}
              totalRecords={totalRows}
              handleChangePage={handleChangePage}
              perPageOptions={paginationOptions.perPageOptions}
              onChangeRowsPerPage={handleChangeRowsPerPage}
            />
          </Box>
        </Box>
      </CustomTabPanel>

      <CustomTabPanel value={value} index={1}>
        <IncidentReportTable
          params={params}
          setQueryParams={setQueryParams}
          value={value}
          sites={allSites}
          officers={allOfficers}
        />
      </CustomTabPanel>
    </Box>
  );
}

function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;
  const classes = useStyles();

  return (
    <Box
      role="tabpanel"
      className={classes.faqTabPanel}
      id={`simple-tabpanel-${index}`}
      hidden={value !== index}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <>{children}</>}
    </Box>
  );
}

CustomTabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};
