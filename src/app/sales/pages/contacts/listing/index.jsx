import {
  Box,
  Button,
  Drawer,
  Link,
  TableCell,
  TableRow,
  TableSortLabel,
  Typography,
} from '@mui/material';
import { ApprovedIcon, DownloadCloudIcon, PendingIcon, PendingIconContact } from 'assets/svg';
import { ReactComponent as ChevronRight } from 'assets/svg/chevron-right.svg';
import { ReactComponent as GraphCollapseIconUpward } from 'assets/svg/collapse-upward-icon.svg';
import { ReactComponent as DetailEmailIcon } from 'assets/svg/DetailEmailIcon.svg';
import classNames from 'classnames';
import DateRangePicker from 'commonComponents/RangeDatepicker';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import LineToolTouchChart from 'src/app/components/common/eLineToolTouchChart/index.jsx';
import PieChart from 'src/app/components/common/ePieChart/index.jsx';
import SearchComponentWithQuery from 'src/app/components/common/searchWithQuery/index.jsx';
import LineChartSkeleton from 'src/app/components/common/skeletonLoader/lineChartSkeleton';
import PieChartSkeleton from 'src/app/components/common/skeletonLoader/pieChartSkeleton';
import TableSkeleton from 'src/app/components/common/skeletonLoader/tableSkeleton';
import TableComponent from 'src/app/components/common/table/index.jsx';
import NoRecordFound from 'src/app/components/common/table/noRecordFound';
import TableImage from 'src/app/components/common/tableImage';
import { SALES_CONTACT_DETAILS, SALES_CONTACTS_REVIEWS } from 'src/app/router/constant/ROUTE';
import { ACL_CONTACT_REVIEW_VIEW, ACL_CONTACTS_CREATE } from 'src/app/router/constant/SALESMODULE';
import history from 'src/app/router/utils/history';
import { AddIcon } from 'src/assets/svg/index.jsx';
import { useApiControllers } from 'src/helper/axios';
import { formatDate, transformPieChartData } from 'src/helper/utilityFunctions.js';
import RenderIfHasPermission from 'src/hoc/renderIfHasPermission';
import { getDisplayConfiguration } from 'src/redux/store/slices/regionalCountryConfiguration';
import { getContacts, getCumulativeStats, getYearlyStats } from 'src/services/contact.service';
import { paginationOptions, toastSettings } from 'src/utils/constants';
import { defaultImage } from 'src/utils/constants/index.js';
import { formatCurrencyWithCommasAndSuffix } from 'src/utils/currencyFormater';
import { formatISOTimestampToDate } from 'src/utils/date';
import { capitalizeFirstLetter } from 'src/utils/string/common';

import { QualifiedLocations } from '../../locations/listing/stubbedData';
import { contactTypes } from './contacts.constant';
import CreateContractDrawer from './createContractDrawer';
import { useStyles } from './listing.js';

const i18ColumnName = (t, companyNameTD) => {
  return [
    {
      id: 'fullName',
      label: `${t('sales.contacts.name')}`,
      sortable: true,
      className: companyNameTD,
    },
    {
      id: 'email',
      label: `${t('sales.contacts.email')}`,
    },
    {
      id: 'phone',
      label: `${t('sales.contacts.phoneNumber')}`,
    },
    {
      id: 'jobtitle',
      label: `${t('sales.contacts.jobTitle')}`,
    },
    {
      id: 'createDate',
      label: t('sales.deals.createDate'),
      sortable: true,
    },
    {
      id: 'lastActivityDate',
      label: t('sales.deals.lastActivity'),
      sortable: true,
    },
    {
      id: 'lastModifiedDate',
      label: t('sales.deals.lastModify'),
      sortable: true,
    },
    {
      id: 'lastModifiedBy',
      label: `${t('sales.contacts.lastModifiedBy')}`,
    },
  ];
};

// const emptyState = {
//   country: null,
//   countryCode: null,
//   states: [],
//   cities: [],
//   parentCompanyIds: [],
//   companyIds: [],
//   industryIds: [],
//   createdDate: null,
// };

const params = {
  pageNo: paginationOptions.defaultPerPage,
  rowsPerPage: paginationOptions.perPageRows,
  search: '',
  sortBy: '',
  orderBy: '',

  createdDate: [null, null],
};

const order = {
  orderBy: 'id',
  orderType: 'asc',
};

const columnIdsEnum = {
  fullName: 'fullName',
  name: 'name',
  status: 'status',
  createDate: 'createDate',
  lastActivityDate: 'lastActivityDate',
  lastModifiedDate: 'lastModifiedDate',
  email: 'email',
};

const ContactsListing = () => {
  const [graphCollapse, setGraphCollapse] = useState(false);
  const classes = useStyles();
  const { t } = useTranslation();
  const { dateFormat } = useSelector(getDisplayConfiguration);
  const companyNameTD = classes.companyNameTD;
  const columns = i18ColumnName(t, companyNameTD);
  const [data, setData] = useState([]);
  const { getNewApiController } = useApiControllers();
  const [loading, setLoading] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [orderState, setOrderState] = useState(order);
  const [selectedItems, setSelectedItems] = useState([]);

  const [graphs, setGraphs] = useState({
    pieChartData: [],
    dealsVerticalData: [],
    lineToolChart: {},
  });

  const [queryParams, setQueryParams] = useState(params);

  const [loadingPieGraph, setLoadingPieGraph] = useState(true);
  const [loadingLineGraph, setLoadingLineGraph] = useState(true);

  // const previousSearchText = useRef(null);

  const handleDateChange = (dates) => {
    if (dates && Array.isArray(dates)) {
      const [startDate, endDate] = dates;
      if (startDate && endDate) {
        const start = dayjs(startDate);
        const end = dayjs(endDate);
        if (!start.isSame(end, 'day')) {
          setQueryParams((prevState) => ({
            ...prevState,
            createdDate: dates,
          }));
        }
      } else {
        setQueryParams((prevState) => ({
          ...prevState,
          createdDate: [null, null],
        }));
      }
    }
  };

  const handleSearch = (event) => {
    setQueryParams((prev) => ({ ...prev, search: event.target.value || '' }));
  };

  // const toggleFiltersDrawer = (anchor, open) => (event) => {
  //   if (event.type === KEY.UP && (event.key === KEY.TAB || event.key === KEY.SHIFT)) {
  //     return;
  //   }
  //   setmoreFilterState({ ...moreFilterState, [anchor]: open });
  // };
  // const filterCloseDrawer = (anchor) => {
  //   setmoreFilterState({ ...moreFilterState, [anchor]: false });
  // };

  /**
   * Fetch companies listing
   */
  // const fetchCompanies = async (refetch = false, search) => {
  //   const apiController = getNewApiController();
  //   try {
  //     setLoadingCompaniesDropDown(true);
  //     let currentPage = companiesPagination?.currentPage;
  //     if (!search && !previousSearchText.current && !refetch) {
  //       currentPage = 1;
  //     }
  //     if (!refetch && search && !previousSearchText.current) {
  //       currentPage = 1;
  //     }
  //     if (refetch && search && !previousSearchText.current) {
  //       currentPage = 1;
  //     }
  //     if (
  //       refetch &&
  //       search &&
  //       previousSearchText.current &&
  //       search !== previousSearchText.current
  //     ) {
  //       currentPage = 1;
  //     }
  //     if (
  //       !refetch &&
  //       search &&
  //       previousSearchText.current &&
  //       search !== previousSearchText.current
  //     ) {
  //       currentPage = 1;
  //     }
  //     if (
  //       refetch &&
  //       search &&
  //       previousSearchText.current &&
  //       search === previousSearchText.current
  //     ) {
  //       currentPage = companiesPagination?.currentPage + 1;
  //     }
  //     if (previousSearchText.current && !search) {
  //       currentPage = 1;
  //     }
  //     if (!search && !previousSearchText.current && refetch) {
  //       currentPage = companiesPagination?.currentPage + 1;
  //     }
  //
  //     if (currentPage === companiesPagination.currentPage) return;
  //
  //     const response = await getCompaniesOption(currentPage, search, {
  //       signal: apiController.signal,
  //     });
  //     if (response.statusCode === 200) {
  //       if (refetch && response?.data?.companies?.length) {
  //         setOptions((prevOptions) => ({
  //           ...prevOptions,
  //           companies: [
  //             ...(prevOptions.companies || []), // Ensure prevOptions.companies is an array
  //             ...(response?.data?.companies || []), // Ensure response.data.companies is an array
  //           ],
  //         }));
  //       } else {
  //         setOptions((prevOptions) => ({
  //           ...prevOptions,
  //           companies: response?.data?.companies,
  //         }));
  //       }
  //       setCompaniesPagination(response?.pagination);
  //       previousSearchText.current = search;
  //     }
  //     setLoadingCompaniesDropDown(false);
  //   } catch (error) {
  //     if (!apiController.signal.aborted) {
  //       setLoadingCompaniesDropDown(false);
  //       toast.error(error?.message, {
  //         position: 'top-right',
  //         autoClose: toastSettings.AUTO_CLOSE,
  //       });
  //     }
  //   }
  // };

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setIsDrawerOpen(open);
  };
  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
  };
  /**
   * Fetch deal owners
   */
  // const fetchDealOwners = async () => {
  //   try {
  //     const response = await getDealOwnerOptions();
  //     if (response?.statusCode === 200) {
  //       setOptions((prevOptions) => ({
  //         ...prevOptions,
  //         dealOwners: response?.data?.owners,
  //       }));
  //     }
  //   } catch (error) {
  //     /**
  //      * show error
  //      */
  //     toast.error(error?.message, {
  //       position: 'top-right',
  //       autoClose: toastSettings.AUTO_CLOSE,
  //     });
  //   }
  // };

  // useEffect(() => {
  //   // Wrap each function call in Promise.resolve to ensure they return promises
  //   const promises = [Promise.resolve(fetchCompanies()), Promise.resolve(fetchDealOwners())];
  //   Promise.allSettled(promises).then((_results) => {});
  // }, []);

  const handleChangePage = async (_, newPage) => {
    /**
     * update pagination object
     */
    setQueryParams((prev) => ({ ...prev, pageNo: newPage + 1 }));
    //remove selected items of current page
    setSelectedItems([]);
  };

  const onChangeRowsPerPage = async (event) => {
    /**
     * update pagination object
     */
    setQueryParams((prev) => ({
      ...prev,
      pageNo: paginationOptions.defaultPerPage,
      rowsPerPage: parseInt(event.target.value, 10),
    }));
    //remove selected items of current page
    setSelectedItems([]);
  };

  const gotoContactDetail = (column, rowId) => {
    if (column.id === columnIdsEnum.fullName) {
      history.push(`${SALES_CONTACT_DETAILS}/${rowId}`);
    }
  };

  const gotoContactsReviews = () => {
    history.push(`${SALES_CONTACTS_REVIEWS}`);
  };

  const renderTableCell = (row, column) => {
    if (!row[column.id]) {
      return (
        <Box component="span" className={classes.emptS}>
          {t('commonText.nA')}
        </Box>
      );
    }
    if (column.id === columnIdsEnum.status) {
      let stageColorClass = '';
      if (row[column.id] === contactTypes.APPROVED) {
        stageColorClass = classes.approvedColor;
      } else if (row[column.id] === contactTypes.PENDING) {
        stageColorClass = classes.pendingColor;
      } else if (row[column.id] === contactTypes.REJECTED) {
        stageColorClass = classes.rejectedColor;
      } else {
        stageColorClass = 'otherStageColor';
      }
      return (
        <Box component="span" className={classNames(classes.commonStageColor, stageColorClass)}>
          {row[column.id] === contactTypes.APPROVED ? (
            <ApprovedIcon />
          ) : row[column.id] === contactTypes.PENDING ? (
            <PendingIconContact />
          ) : (
            <PendingIcon />
          )}{' '}
          {row[column.id]}
        </Box>
      );
    }

    if (column.id === columnIdsEnum.fullName) {
      return (
        <Box className={classes.companyName}>
          <Box className={classes.companyNameText}>
            {capitalizeFirstLetter(row[column.id]) || NA}
          </Box>
          <Box className={classes.companyNameIcon}>
            <ChevronRight />
          </Box>
        </Box>
      );
    }

    if (column.id === columnIdsEnum.name) {
      return (
        <Box className={classes.assignToClass}>
          <TableImage className={classes.assignAvatar} imageUrl={row.image || defaultImage} />
          <Box component="span" className={classes.assignToText}>
            {row[column.id]}
          </Box>
        </Box>
      );
    }
    if (column.id === columnIdsEnum.email) {
      return (
        <Box className={classes.emailIcon}>
          <Link className={classes.linkStyle} href={`mailto:${row[column.id]}`}>
            <DetailEmailIcon />
          </Link>
          {row[column.id]}
        </Box>
      );
    }
    if (
      column.id === columnIdsEnum.createDate ||
      column.id === columnIdsEnum.lastActivityDate ||
      column.id === columnIdsEnum.lastModifiedDate
    )
      return formatISOTimestampToDate(row[column.id], dateFormat);

    return <>{row[column.id]}</>;
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
    applySorting(columnId, orderState.orderType);
  };

  const applySorting = (sortBy, orderBy) => {
    setQueryParams((prev) => ({
      ...prev,
      pageNo: paginationOptions.defaultPerPage,
      rowsPerPage: paginationOptions.perPageRows,
      sortBy: sortBy,
      orderBy: orderBy,
    }));
    setSelectedItems([]);
  };

  /**
   * clear all filters and refetch the data
   */
  // const handleClearFilters = () => {
  //   /**
  //    * check if user apply the filters or not. If user only select the filter and don't apply
  //    * then don't refetch contacts listing
  //    */
  //
  //   if (!deepEqual(formData, emptyState)) {
  //     setFormData(emptyState);
  //     setQueryParams((prev) => ({
  //       pageNo: paginationOptions.defaultPerPage,
  //       ...prev,
  //       ...emptyState,
  //     }));
  //     setmoreFilterState({ ...moreFilterState });
  //   }
  // };

  // const applyFilters = (query) => {
  //   setQueryParams((prev) => ({
  //     pageNo: paginationOptions.defaultPerPage,
  //     ...prev,
  //     ...query,
  //   }));
  // };

  /**
   * common function to update data to formDat object
   */
  // const updateFormHandler = useCallback(
  //   (name, value) => {
  //     setFormData((prevState) => ({
  //       ...prevState,
  //       [name]: value,
  //     }));
  //   },
  //   [setFormData],
  // );

  // const inputChangedHandler = (event) => {
  //   const { name, value } = event.target;
  //   if (value) {
  //     // ? NOTE: if the variable "key" is not getting used add _ before it or this rule will suffice the need here.
  //     // eslint-disable-next-line no-unused-vars
  //     const { [name]: key, ...rest } = errorMessages;
  //     setErrorMessages(rest);
  //   }
  //   updateFormHandler(name, value);
  // };

  const fetchContactCumulativeData = async () => {
    setLoadingPieGraph(true);
    try {
      const response = await getCumulativeStats();
      if (response.statusCode === 200) {
        /**
         * PIECHART
         * Transform the data to match the format expected by ECharts
         * Transform data using helper functions
         */
        const pieChart = transformPieChartData(
          response?.data?.companiesStats.labels,
          response?.data?.companiesStats.values,
        );
        // Update pieChartData
        setGraphs((prevGraphs) => ({
          ...prevGraphs,
          pieChartData: {
            ...pieChart,
            colors: response?.data?.companiesStats?.colors, // Adding an array for colors
          },
        }));

        /**
         * parse data for Deals Breakdown by Verticals
         */
        const parsedIndustryVerticals = {
          data: response?.data?.industriesStats?.verticals.map((item) => ({
            value: item.percentage,
            name: item.name,
          })),
          stats: {
            total: response?.data?.industriesStats?.totalCount,
            totalDetail: 'total deals',
          },
          colors: response?.data?.industriesStats?.colors,
        };

        // Update industry verticals
        setGraphs((prevGraphs) => ({
          ...prevGraphs,
          dealsVerticalData: parsedIndustryVerticals,
        }));
      }
      setLoadingPieGraph(false);
    } catch (error) {
      /**
       * show error in the corresponding field
       * parse errors in array format and set them in errorMessages
       * setErrorMessages(error)
       */
      toast.error(error?.message, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    } finally {
      setLoadingPieGraph(false);
    }
  };

  const fetchContactsYearlyData = async () => {
    setLoadingLineGraph(true);
    try {
      const response = await getYearlyStats();
      if (response.statusCode === 200) {
        const { months, values } = response?.data?.stats ?? {};
        const data = { [t('sales.locations.locations')]: values };
        // Update pieChartData
        setGraphs((prevGraphs) => ({
          ...prevGraphs,
          lineToolChart: { dataLabels: months, data: data },
        }));
      }
      setLoadingLineGraph(false);
    } catch (error) {
      /**
       * show error in the corresponding field
       * parse errors in array format and set them in errorMessages
       * setErrorMessages(error)
       */
      toast.error(error?.message, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    } finally {
      setLoadingLineGraph(false);
    }
  };

  /**
   * Fetch deals listing
   * @param {*} page
   * @param {*} query
   */
  const fetchContacts = async (queryParams) => {
    const apiController = getNewApiController();
    try {
      setLoading(true);

      let params = {
        ...queryParams,
        createdDateStart: queryParams?.createdDate?.[0]
          ? formatDate(queryParams.createdDate?.[0])
          : null,
        createdDateEnd: queryParams?.createdDate?.[1]
          ? formatDate(queryParams.createdDate?.[1])
          : null,
      };

      const response = await getContacts(params, {
        signal: apiController.signal,
      });
      if (response?.statusCode === 200) {
        setData(response?.data?.contacts);

        setTotalRecords(response?.pagination?.totalCount);
      }
      setLoading(false);
    } catch (error) {
      if (!apiController.signal.aborted) {
        if (error?.message) {
          toast.error(error?.message, {
            position: 'top-right',
            autoClose: toastSettings.AUTO_CLOSE,
          });
        }
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchContacts(queryParams);
  }, [queryParams]);

  useEffect(() => {
    // Wrap each function call in Promise.resolve to ensure they return promises
    const promises = [
      Promise.resolve(fetchContactCumulativeData()),
      Promise.resolve(fetchContactsYearlyData()),
    ];

    Promise.allSettled(promises).then((_results) => {});
  }, []);

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
                  hideSortIcon={false}
                  sx={{
                    '& .MuiTableSortLabel-icon': {
                      opacity: 0.5, // Default opacity
                      transition: 'opacity 0.3s ease', // Smooth transition
                    },
                    '&.MuiTableSortLabel-active .MuiTableSortLabel-icon': {
                      opacity: 1, // Active state opacity
                    },
                  }}
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
      <TableSkeleton columns={columns} />
    ) : (
      <>
        <NoRecordFound
          data={data}
          noOfColumns={columns.length}
          t={t}
          title={t('sales.contacts.noContacts')}
          description={t('sales.contacts.contactsDataSync')}
        />
        {data.length > 0 &&
          data?.map((row, rowIndex) => (
            <TableRow key={row.id || rowIndex}>
              {columns.map((column, columnIndex) =>
                column.id === columnIdsEnum.fullName ? (
                  <TableCell
                    className={column.className}
                    key={`${row.id}-${column.id}-${columnIndex}`}
                    onClick={() => gotoContactDetail(column, row.id)}
                  >
                    {renderTableCell(row, column)}
                  </TableCell>
                ) : (
                  <TableCell
                    className={column.className}
                    key={`${row.id}-${column.id}-${columnIndex}`}
                  >
                    {renderTableCell(row, column)}
                  </TableCell>
                ),
              )}
            </TableRow>
          ))}
      </>
    );
  };

  return (
    <Box className={classes.dealsWrapper}>
      {/* {loading && <LoaderComponent size={50} color={'primary'} label={'Loading'} />} */}
      <Box className={!graphCollapse ? classes.mainWrapper : classes.graphHide}>
        {loadingPieGraph ? (
          <Box className={classes.pieChartSkeletonWrapper}>
            <PieChartSkeleton
              legendCount={3}
              title={`${t('sales.contacts.contacts')}`}
              isValue={true}
            />
          </Box>
        ) : (
          <Box className={classes.gridSection}>
            <Box className={classes.headerBar}>
              <Typography variant="subtitle2" className={classes.chartHeading}>{`${t(
                'sales.contacts.contacts',
              )}`}</Typography>
            </Box>
            <Typography variant="h1" className={classes.dataAmount}>
              {formatCurrencyWithCommasAndSuffix(graphs?.dealsVerticalData?.stats?.total)}
            </Typography>

            <PieChart
              heading={t('sales.contacts.contacts')}
              colors={graphs?.pieChartData?.colors}
              data={graphs?.pieChartData?.data || []}
              stats={graphs?.pieChartData?.data?.total || 0}
              style={{ height: '200px', width: '100%' }}
              decimal={0}
              toolTipFormatter="{b}: {c} ({d}%)"
              legedFormatter="value"
              legendStyle={{
                icon: 'rect',
                itemWidth: 12,
                itemHeight: 12,
                textStyle: {
                  fontSize: 12,
                  color: '#86868B',
                  fontWeight: 500,
                  lineHeight: 16,
                },
              }}
            />
          </Box>
        )}
        {loadingPieGraph ? (
          <Box className={classes.pieChartSkeletonWrapperClient}>
            <PieChartSkeleton
              legendCount={5}
              title={`${t('sales.contacts.contactsVerticals')}`}
              isValue={true}
            />
          </Box>
        ) : (
          <Box className={classes.gridSection}>
            <Box className={classes.headerBar}>
              <Typography variant="subtitle2" className={classes.chartHeading}>{`${t(
                'sales.contacts.contactsVerticals',
              )}`}</Typography>
            </Box>
            <Typography variant="h1" className={classes.dataAmount}>
              {formatCurrencyWithCommasAndSuffix(graphs?.dealsVerticalData?.stats?.total)}
            </Typography>

            <PieChart
              heading={t('sales.contacts.contactsVerticals')}
              colors={graphs?.dealsVerticalData?.colors}
              data={graphs?.dealsVerticalData?.data || []}
              stats={graphs?.dealsVerticalData?.stats?.total || 0}
              style={{ height: '200px', width: '100%' }}
              toolTipFormatter="{b}: {c} ({d}%)"
              legedFormatter="value"
              legendStyle={{
                icon: 'rect',
                itemWidth: 12,
                itemHeight: 12,
                textStyle: {
                  fontSize: 12,
                  color: '#86868B',
                  fontWeight: 500,
                  lineHeight: 16,
                },
              }}
            />
          </Box>
        )}
        {loadingLineGraph ? (
          <Box className={classes.lineChartSkeletonWrapperRight}>
            <LineChartSkeleton title={`${t('sales.contacts.contacts')}`} />
          </Box>
        ) : (
          <Box className={classes.gridSectionOne}>
            <Box
              className={classNames(
                classes.headerBar,
                classes.headerBarIn,
                classes.customHeadingChart,
              )}
            >
              <Typography variant="subtitle2" className={classes.chartHeading}>{`${t(
                'sales.contacts.contacts',
              )}`}</Typography>
            </Box>
            <LineToolTouchChart
              heading={t('sales.contacts.contacts')}
              colors={{ [t('sales.locations.locations')]: QualifiedLocations.colors.Locations }}
              data={graphs?.lineToolChart?.data || {}}
              dataLabels={graphs?.lineToolChart?.dataLabels || []}
              style={{ height: '200px', width: '100%' }}
            />
          </Box>
        )}
        {!graphCollapse && (
          <Button
            variant="secondaryGrey"
            onClick={() => setGraphCollapse(true)}
            className={classes.graphCollapseBtn}
          >
            <Box>
              <GraphCollapseIconUpward />
            </Box>
          </Button>
        )}
      </Box>
      {graphCollapse && (
        <Button
          variant="secondaryGrey"
          onClick={() => setGraphCollapse(false)}
          className={classes.graphExpandBtn}
        >
          <Box>
            <GraphCollapseIconUpward />
          </Box>
        </Button>
      )}

      <Box className={classes.locationFilterBar}>
        <Box className={classes.filterLeftSide}>
          <SearchComponentWithQuery
            placeHolder={`${t('sales.contacts.search')}`}
            onSearch={handleSearch}
            className={classes.searchWidth}
          />

          {/* <Box className={classes.dropdownCommonSection}>
            <CustomDropDown
              enableForceClose={false}
              name={`${t('sales.contacts.locationStatus')}`}
              label={`${t('sales.contacts.locationStatus')}`}
              placeHolder={`${t('sales.contacts.locationStatus')}`}
              options={[
                { label: 'Option 1', value: 'option1' },
                { label: 'Option 2', value: 'option2' },
                { label: 'Option 3', value: 'option3' },
              ]}
              selectedValues={{
                label: 'Option 1',
                value: 'option1',
              }}
            />
          </Box> */}
          <Box className={`${classes.fieldWrapper} ${classes.companiesDatePicker}`}>
            <DateRangePicker
              format={dateFormat}
              placeHolder={`${dateFormat} - ${dateFormat}`}
              selectedDates={queryParams?.createdDate || [null, null]}
              setDates={(dates) => {
                handleDateChange(dates);
              }}
            />
          </Box>
          {/*<Button*/}
          {/*  onClick={toggleFiltersDrawer(locationDrawerTypes.RIGHT, true)}*/}
          {/*  disableRipple*/}
          {/*  className={classes.moreFilter}*/}
          {/*  variant="onlyText"*/}
          {/*>*/}
          {/*  {t('sales.locations.moreFilters')} <MoreFilter className={classes.filterIcon} />*/}
          {/*</Button>*/}

          {/*<Drawer*/}
          {/*  anchor={locationDrawerTypes.RIGHT}*/}
          {/*  open={moreFilterState[locationDrawerTypes.RIGHT]}*/}
          {/*  onClose={toggleFiltersDrawer(locationDrawerTypes.RIGHT, false)}*/}
          {/*>*/}
          {/*  {moreFilterState?.right && (*/}
          {/*    <ListingMoreFiltersDrawer*/}
          {/*      anchor={locationDrawerTypes.RIGHT}*/}
          {/*      filterCloseDrawer={filterCloseDrawer}*/}
          {/*      width={399}*/}
          {/*      formData_={formData}*/}
          {/*      setFormData_={setFormData}*/}
          {/*      errorMessages={errorMessages}*/}
          {/*      setErrorMessages={setErrorMessages}*/}
          {/*      inputChangedHandler={inputChangedHandler}*/}
          {/*      applyFilters={applyFilters}*/}
          {/*      emptyState={emptyState}*/}
          {/*      handleClearFilters={handleClearFilters}*/}
          {/*      companies={options?.companies}*/}
          {/*      companiesPagination={companiesPagination}*/}
          {/*      fetchMoreOptions={fetchCompanies}*/}
          {/*      loadingCompaniesDropdown={loadingCompaniesDropDown}*/}
          {/*    />*/}
          {/*  )}*/}
          {/*</Drawer>*/}
        </Box>
        <Box className={classes.filterRightSide}>
          <RenderIfHasPermission name={ACL_CONTACT_REVIEW_VIEW}>
            <Button variant="destructive" onClick={gotoContactsReviews}>
              {t('sales.contacts.reviewContacts')}
            </Button>
          </RenderIfHasPermission>
          <Button
            disabled
            variant="secondaryGrey"
            className={classes.templateExportButton}
            startIcon={<DownloadCloudIcon />}
          >
            {`${t('links.export')}`}
          </Button>
          <RenderIfHasPermission name={ACL_CONTACTS_CREATE}>
            <Button variant="primary" startIcon={<AddIcon />} onClick={toggleDrawer(true)}>
              {t('sales.contacts.createContact')}
            </Button>
          </RenderIfHasPermission>
          <Drawer anchor="right" open={isDrawerOpen}>
            <CreateContractDrawer
              creationCloseDrawer={handleCloseDrawer}
              width={796}
              refresh={fetchContacts}
            />
          </Drawer>
        </Box>
      </Box>
      <Box className={classes.locationListing}>
        <TableComponent
          data={data}
          columns={columns}
          tableHead={tableHead}
          tableBody={tableBody}
          pagination={true}
          page={queryParams.pageNo - 1}
          totalRecords={totalRecords}
          handleChangePage={handleChangePage}
          applySorting={applySorting}
          selectionText={
            !!selectedItems?.length && `${selectedItems.length} ${t('sales.deals.dealsSelected')}`
          }
          rowsPerPageOptions={paginationOptions.perPageOptions}
          onChangeRowsPerPage={onChangeRowsPerPage}
          rowsPerPage={queryParams.rowsPerPage}
        />
        {/* )} */}
      </Box>
    </Box>
  );
};

export default ContactsListing;
