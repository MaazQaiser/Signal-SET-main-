import { Box, Button, Checkbox, Chip, TableCell, TableRow, Tooltip } from '@mui/material';
import { ReactComponent as ChevronRight } from 'assets/svg/chevron-right.svg';
import { ReactComponent as TickWhiteIcon } from 'assets/svg/TickWhiteIcon.svg';
import { ReactComponent as PlusIcon } from 'assets/svg/Whiteplus.svg';
import DateRangePicker from 'commonComponents/RangeDatepicker';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import CustomDropDown from 'src/app/components/common/customDropDown';
import SearchComponentWithQuery from 'src/app/components/common/searchWithQuery/index.jsx';
import SideDrawer from 'src/app/components/common/sideDrawer/index.jsx';
import TableSkeleton from 'src/app/components/common/skeletonLoader/tableSkeleton';
import TableComponent from 'src/app/components/common/table/index.jsx';
import NoRecordFound from 'src/app/components/common/table/noRecordFound';
import DeleteInvoice from 'src/app/obx/pages/invoices/components/deleteInvoice';
import { ReactComponent as ApproveInvoiceIcon } from 'src/assets/svg/approve-invoices.svg';
import { ReactComponent as CheckBoxRegularIcon } from 'src/assets/svg/checkbox.svg';
import { ReactComponent as CheckBoxCheckedIcon } from 'src/assets/svg/checkbox-checked.svg';
import { ReactComponent as CheckBoxCheckedDisabledIcon } from 'src/assets/svg/checkbox-checked-disabled.svg';
import { ReactComponent as CheckboxDisabledIcon } from 'src/assets/svg/checkbox-disabled.svg';
import { ReactComponent as DustinBinIcon } from 'src/assets/svg/DustinBinIcon.svg';
import { ReactComponent as InProgressIcon } from 'src/assets/svg/in-progress-invoices.svg';
import { ReactComponent as FailedIcon } from 'src/assets/svg/invoices-failed.svg';
import { ReactComponent as PushedSageIcon } from 'src/assets/svg/pushed-sage-invoices.svg';
import { ReactComponent as SyncIcon } from 'src/assets/svg/sync-refresh.svg';
import { useApiControllers } from 'src/helper/axios';
import {
  deleteInvoice,
  getInvoicePDF,
  getInvoices,
  getSites,
  pushedToSage,
  refreshInvoice,
} from 'src/services/invoice.services.js';
import transformArrayForOptions from 'src/utils/array/transformArrayForOptions';
import { paginationOptions, toastSettings } from 'src/utils/constants';
import { extractValuesByKeyFromInput } from 'src/utils/dropdownValueExtractor/index.js';

import PDFViewDrawer from '../reports/components/pdfViewDrawer/index.jsx';
import ApproveInvoice from './components/approveInvoice/index.jsx';
import ApproveSelectedInvoice from './components/approveSelectedInvoice/index.jsx';
import InvoiceDrawer from './components/invoiceDrawer/index.jsx';
import PreviewInvoiceDrawer from './components/previewInvoiceDrawer/index.jsx';
import { useStyles } from './invoiceStyles.js';

const i18ColumnName = (t, hoverIconClass) => {
  return [
    {
      id: 'checkbox',
      label: ``,
    },
    {
      id: 'invoiceNumber',
      label: `${t('obx.invoice.invoiceNumber')}`,
      sortable: false,
      className: hoverIconClass,
    },
    {
      id: 'siteName',
      label: `${t('obx.invoice.siteName')}`,
      sortable: false,
    },
    {
      id: 'invoiceType',
      label: `${t('obx.invoice.type')}`,
      sortable: false,
    },
    {
      id: 'invoiceGenerated',
      label: `${t('obx.invoice.invoiceGenerated')}`,
      sortable: false,
    },
    {
      id: 'dueDate',
      label: `${t('obx.invoice.dueDate')}`,
      sortable: false,
    },
    {
      id: 'status',
      label: `${t('obx.invoice.status')}`,
      sortable: false,
    },
    {
      id: 'invoiceDuration',
      label: `${t('obx.invoice.invoiceDuration')}`,
      sortable: false,
    },
    {
      id: 'action',
      label: ``,
      sortable: false,
    },
  ];
};

const params = {
  page: paginationOptions.defaultPerPage,
  perPage: paginationOptions.perPageRows,
  siteName: [],
  invoiceNumber: '',
  selectedDates: [],
  type: {},
  status: {},
};

const invoiceStatuses = [
  {
    value: '',
    label: 'All Statuses',
  },
  {
    value: 0,
    label: 'Pending',
  },
  {
    value: 1,
    label: 'In Progress',
  },
  {
    value: 2,
    label: 'Sync Approved',
  },
  {
    value: 3,
    label: 'Sync Failed',
  },
];

const statusesEnum = {
  syncApprove: 0,
  inProgress: 1,
  sentToSage: 2,
  failed: 3,
};

const invoiceStatusLabelEnum = {
  0: { label: 'Pending', color: 'primary' },
  1: { label: 'In Progress', color: 'info' },
  2: { label: 'Sync Approved', color: 'success' },
  3: { label: 'Sync Failed', color: 'error' },
};

const invoiceTypeFilter = [
  {
    value: '',
    label: 'All Types',
  },
  {
    value: 0,
    label: 'Ad hoc',
  },
  {
    value: 1,
    label: 'Scheduled',
  },
];

const columnIdsEnum = {
  checkbox: 'checkbox',
  invoiceNumber: 'invoiceNumber',
  siteName: 'siteName',
  invoiceGenerated: 'invoiceGenerated',
  dueDate: 'dueDate',
  status: 'status',
  invoiceDuration: 'invoiceDuration',
  invoiceType: 'invoiceType',
  action: 'action',
  id: 'invoiceNumber',
};

const invoiceEnumTypes = {
  SCHEDULED: 'scheduled',
  ADHOC: 'ad_hoc',
};

const invoiceTypes = {
  SCHEDULED: 'Scheduled',
  ADHOC: 'Ad hoc',
};

const dateFormat = 'MM/DD/YYYY';

export const sitesPaginationEmptyState = {
  currentPage: 0,
  nextPage: 1,
  prevPage: 0,
  totalPages: 0,
  totalCount: 0,
};

export default function index() {
  const { t } = useTranslation();
  const NA = t('commonText.nA');
  const classes = useStyles();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalRows, setTotalRows] = useState(0);
  const { getNewApiController } = useApiControllers();
  const [queryParams, setQueryParams] = useState(params);
  const [sitesPagination, setSitesPagination] = useState(sitesPaginationEmptyState);
  const [sites, setSites] = useState([]);
  const hoverIconClass = classes.ZonesTD;
  const columns = i18ColumnName(t, hoverIconClass);
  const [showDrawer, setShowDrawer] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showPreviewDrawer, setPreviewShowDrawer] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showApproveInvoice, setShowApproveInvoice] = useState(-1);
  const [showApproveSelectedInvoice, setShowApproveSelectedInvoice] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [sitesLoader, setSitesLoader] = useState(true);
  const [pdfViewDrawer, setPdfViewDrawer] = useState(false);
  const [pdfUrl, setPdfUrl] = useState('');
  const [showDeleteInvoiceModel, setShowDeleteInvoiceModel] = useState(false);
  const [currentSearchKey, setCurrentSearchKey] = useState('');

  const handleSelectAllChange = (event) => {
    const isChecked = event.target.checked;
    setSelectAll(isChecked);
    if (isChecked) {
      setSelectedItems(
        data
          .filter(
            (item) =>
              item.status !== statusesEnum.inProgress && item.status !== statusesEnum.sentToSage,
          )
          .map((item) => item.id),
      );
      return;
    }

    setSelectedItems([]);
  };

  const handleCheckboxChange = (event, id) => {
    if (event.target.checked) {
      setSelectedItems([...selectedItems, id]);
      return; // Return early
    }
    setSelectedItems(selectedItems.filter((item) => item !== id));
  };

  const handleMultipleInvoiceApprove = async () => {
    const payload = data
      .filter((invoice) => {
        if (
          invoice.status !== statusesEnum.inProgress &&
          invoice.status !== statusesEnum.sentToSage
        )
          return selectedItems.includes(invoice.id);
      })
      .map((invoice) => invoice.id);

    await update({
      invoice_ids: payload,
    });
    setShowApproveSelectedInvoice(false);
    setSelectedItems([]);
    setSelectAll(false);
  };

  const fetchInvoices = async (queryParams) => {
    setLoading(true);
    try {
      let params = {
        ...queryParams,
        perPage: queryParams.perPage,
        page: queryParams.page,
        periodStart: queryParams?.selectedDates?.[0]
          ? queryParams?.selectedDates?.[0]?.format(dateFormat)
          : '',
        periodEnd: queryParams?.selectedDates?.[1]
          ? queryParams?.selectedDates?.[1]?.format(dateFormat)
          : '',
        siteName: queryParams?.siteName.map((a) => a.label),
        type: extractValuesByKeyFromInput(queryParams.type, 'value'),
        status: extractValuesByKeyFromInput(queryParams.status, 'value'),
      };

      delete params.selectedDates;
      const response = await getInvoices(params);

      if (response && response?.statusCode === 200) {
        setData(response?.data?.invoices || []);
        const total = response?.data?.pagination?.totalCount;
        setTotalRows(total);
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  const fetchSites = async (refetch = false, searchKey = '') => {
    const apiController = getNewApiController();
    setSitesLoader(true);

    try {
      // If the search key has changed, reset pagination to its initial state
      if (searchKey !== currentSearchKey) {
        setCurrentSearchKey(searchKey);
        setSitesPagination(sitesPaginationEmptyState); // Reset pagination state
      }

      // Determine the correct page number after resetting
      const nextPage = searchKey !== currentSearchKey ? 1 : sitesPagination?.nextPage || 1;

      const queryParams = {
        page: nextPage,
        name: searchKey,
      };

      const response = await getSites(queryParams, {
        signal: apiController.signal,
      });

      if (refetch && response?.data?.sites?.length) {
        setSites((prevSites) => [...prevSites, ...response.data.sites]);
      } else {
        setSites(response?.data?.sites || []);
      }

      setSitesPagination(response?.pagination);
      setSitesLoader(false);
    } catch (error) {
      setSitesLoader(false);
    }
  };

  const invokeSyncWithPayroll = async (id) => {
    try {
      const response = await refreshInvoice(id);
      if (response?.statusCode === 200) {
        toast.success(response.message, {
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
      }
    } catch (error) {
      toast.error(error?.message, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  const handleRowUpdate = async (index) => {
    if (data[index] === statusesEnum.sentToSage || data[index] === statusesEnum.inProgress) return;
    const payload = {
      invoice_ids: [data[index].id],
    };
    await update(payload);
  };

  const handleInvoiceApprove = async () => {
    await handleRowUpdate(showApproveInvoice);
    setShowApproveInvoice(-1);
  };

  const update = async (payload) => {
    setIsUpdating(true);
    try {
      const response = await pushedToSage(payload);
      if (response?.statusCode === 200) {
        fetchInvoices(queryParams);
        toast.success(response?.message, {
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
      }
    } catch (error) {
      toast.error(error?.message, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
    setIsUpdating(false);
  };

  const deleteInvoiceRequest = async () => {
    setIsUpdating(true);
    try {
      const response = await deleteInvoice(selectedInvoice);
      if (response?.statusCode === 200) {
        setShowDeleteInvoiceModel(false);

        fetchInvoices(queryParams);
        toast.success(response?.message, {
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
      }
      setIsUpdating(false);
    } catch (error) {
      setShowDeleteInvoiceModel(false);
      toast.error(error?.message, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
    setIsUpdating(false);
  };

  const tableHead = () => {
    return (
      <>
        <TableRow>
          {columns.map((column) => (
            <TableCell key={column.id}>
              {column.id === 'checkbox' ? (
                <Checkbox
                  icon={<CheckBoxRegularIcon />}
                  checkedIcon={<CheckBoxCheckedIcon />}
                  className={classes.checkBoxCustom}
                  checked={selectAll}
                  onChange={handleSelectAllChange}
                />
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
        <NoRecordFound data={data} noOfColumns={columns.length} t={t} />
        {data.length > 0 &&
          data.map((row, index) => (
            <TableRow key={row.id}>
              {columns.map((column) => {
                const showHandCursor = column.id === columnIdsEnum.name ? 'pointer' : '';
                return (
                  <TableCell
                    key={column.id}
                    onClick={() => {
                      if (column?.id === columnIdsEnum.invoiceNumber) openInvoicePdf(column, row);
                    }}
                    sx={{ cursor: showHandCursor }}
                    className={column.className}
                  >
                    {renderTableCell(row, column, index)}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
      </>
    );
  };

  const renderTableCell = (row, column, index) => {
    if (column.id === columnIdsEnum.action) {
      return (
        <Box className={classes.actionBtns}>
          {row.status === statusesEnum.syncApprove && (
            <Tooltip title={`${t('obx.invoice.approveStatus')}`} arrow placement="top">
              <Button
                disableRipple
                className={classes.notesCloseBtn}
                variant="text"
                onClick={() => setShowApproveInvoice(index)}
                startIcon={<ApproveInvoiceIcon />}
              ></Button>
            </Tooltip>
          )}
          {row.status === statusesEnum.inProgress && (
            <Tooltip title={`${t('obx.invoice.inProgressStatus')}`} arrow placement="top">
              <Button
                disableRipple
                className={classes.notesCloseBtn}
                variant="text"
                startIcon={<InProgressIcon />}
                sx={{ cursor: 'default' }}
              ></Button>
            </Tooltip>
          )}
          {row.status === statusesEnum.sentToSage && (
            <Tooltip title={`${t('obx.invoice.pushedToSageStatus')}`} arrow placement="top">
              <Button
                disableRipple
                className={classes.notesCloseBtn}
                variant="text"
                startIcon={<PushedSageIcon />}
                sx={{ cursor: 'default' }}
              ></Button>
            </Tooltip>
          )}
          {row.status === statusesEnum.failed && (
            <Tooltip title={`${t('obx.invoice.failedStatus')}`} arrow placement="top">
              <Button
                disableRipple
                className={classes.notesCloseBtn}
                variant="text"
                startIcon={<FailedIcon />}
                onClick={() => setShowApproveInvoice(index)}
              ></Button>
            </Tooltip>
          )}

          {(row.status === statusesEnum.syncApprove || row.status === statusesEnum.failed) &&
            invoiceEnumTypes.SCHEDULED === row.invoiceType && (
              <Tooltip title={`${t('obx.invoice.resyncPayrollStatus')}`} arrow placement="top">
                <Button
                  disableRipple
                  className={classes.notesCloseBtn}
                  variant="text"
                  startIcon={<SyncIcon />}
                  onClick={() => invokeSyncWithPayroll(row.id)}
                />
              </Tooltip>
            )}

          {(row.status === statusesEnum.failed || row.status === statusesEnum.syncApprove) && (
            <Button
              disableRipple
              className={classes.notesCloseBtn}
              variant="text"
              startIcon={<DustinBinIcon />}
              onClick={() => {
                setSelectedInvoice(row?.id);
                setShowDeleteInvoiceModel(true);
              }}
            />
          )}
        </Box>
      );
    }

    if (column.id === columnIdsEnum.checkbox) {
      return (
        <>
          <Checkbox
            checked={selectedItems.includes(row.id)}
            onChange={(event) => handleCheckboxChange(event, row.id)}
            icon={
              row.status === statusesEnum.sentToSage || row.status === statusesEnum.inProgress ? (
                <CheckboxDisabledIcon />
              ) : (
                <CheckBoxRegularIcon />
              )
            }
            checkedIcon={
              row.status === statusesEnum.sentToSage || row.status === statusesEnum.inProgress ? (
                <CheckBoxCheckedDisabledIcon />
              ) : (
                <CheckBoxCheckedIcon />
              )
            }
            disableRipple
            className={classes.checkBoxCustom}
            disabled={
              row.status === statusesEnum.sentToSage || row.status === statusesEnum.inProgress
            }
          />
        </>
      );
    }

    if (column.id === columnIdsEnum.invoiceNumber) {
      return (
        <>
          <Box className={classes.franchiseName}>
            <Box className={classes.franchiseNameText}>{row[column?.id] || NA}</Box>
            <Box className={classes.franchiseNameIcon}>
              <ChevronRight />
            </Box>
          </Box>
        </>
      );
    }

    if (column.id === columnIdsEnum.invoiceGenerated || column.id === columnIdsEnum.dueDate) {
      return <>{row[column.id] ? dayjs(row[column.id])?.format('MM-DD-YYYY') : NA}</>;
    }

    if (column.id === columnIdsEnum.invoiceDuration) {
      const [startDate, endDate] = row[column?.id].split(' - ');

      return (
        <>
          {row[column?.id] ? (
            <>
              <Box component="span">{dayjs(startDate)?.format('MM-DD-YYYY')}</Box> {' - '}
              <Box component="span">{dayjs(endDate)?.format('MM-DD-YYYY')}</Box>
            </>
          ) : (
            NA
          )}
        </>
      );
    }

    if (column.id === columnIdsEnum.status) {
      return (
        <Chip
          label={invoiceStatusLabelEnum?.[row[column.id]].label}
          color={invoiceStatusLabelEnum?.[row[column?.id]].color}
        />
      );
    }

    if (column.id === columnIdsEnum.invoiceType) {
      return (
        <>
          {row[column?.id] === invoiceEnumTypes.ADHOC ? invoiceTypes.ADHOC : invoiceTypes.SCHEDULED}
        </>
      );
    }
    if (row[column.id] === 0) {
      return <>{row[column.id]}</>;
    }

    return <>{row[column.id] || NA}</>;
  };

  //open Invoice details modal
  const openInvoicePdf = (column, row) => {
    if (row?.status === statusesEnum.inProgress) return;
    if (row?.status === statusesEnum.sentToSage) {
      fetchPDF(row?.id);
      setPdfViewDrawer(true);
    } else {
      setSelectedInvoice(row?.id);
      if (column.id === columnIdsEnum.id) {
        setShowDrawer(true);
      }
    }
  };

  const handleChangePage = async (_, newPage) => {
    setQueryParams((prev) => ({
      ...prev,
      page: newPage + 1,
    }));
  };

  const handleChangeRowsPerPage = (event) => {
    setQueryParams((prev) => ({
      ...prev,
      page: paginationOptions.defaultPerPage,
      perPage: parseInt(event.target.value, 10),
    }));
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

  const fetchPDF = async (invoiceId) => {
    try {
      // setLoading(true);
      const response = await getInvoicePDF(invoiceId, {
        responseType: 'arraybuffer',
      });

      const blob = new Blob([response], {
        type: 'application/pdf',
      });
      const objectUrl = URL.createObjectURL(blob);

      setPdfUrl(objectUrl);
    } catch (error) {
      setPdfViewDrawer(false);
      toast.error(error?.message, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  const fetchData = () => {
    fetchInvoices(queryParams);
    fetchSites();
  };

  useEffect(() => {
    fetchData();
  }, [queryParams]);

  return (
    <Box className={classes.sitesListingContainer}>
      <Box className={classes.searchSectionDashboard}>
        <Box className={classes.leftSide}>
          <SearchComponentWithQuery
            name="invoiceNumber"
            onSearch={inputChangedHandler}
            placeHolder={`${t('obx.invoice.search')}`}
          />
          <CustomDropDown
            label={`${t('obx.invoice.siteDropdownLabel')}`}
            name="siteName"
            checkmark
            options={transformArrayForOptions(sites, 'name', 'id') || []}
            selectedValues={queryParams.siteName}
            handleChange={inputChangedHandler}
            multiSelect={true}
            searchable={true}
            withTiles={true}
            clearAll
            fetchMoreOptions={fetchSites}
            pagination={sitesPagination}
            isLoading={sitesLoader}
          />
          <CustomDropDown
            label={`${t('obx.invoice.statusesDropdownLabel')}`}
            name="status"
            options={transformArrayForOptions(invoiceStatuses, 'label', 'value')}
            selectedValues={queryParams.status}
            handleChange={inputChangedHandler}
          />
          <CustomDropDown
            label={`${t('obx.invoice.typesDropdownLabel')}`}
            name="type"
            options={transformArrayForOptions(invoiceTypeFilter, 'label', 'value')}
            selectedValues={queryParams.type}
            handleChange={inputChangedHandler}
          />
        </Box>
        <Box className={classes.rightBar}>
          {selectedItems.length ? (
            <Button
              onClick={() => setShowApproveSelectedInvoice(true)}
              variant="primary"
              startIcon={<TickWhiteIcon />}
            >
              {`${t('obx.invoice.approvePushToSage')}`}
            </Button>
          ) : (
            <Box className={classes.rightBar}>
              <Box className={classes.invoicesDateRange}>
                <DateRangePicker
                  placeHolder={'MM/DD/YYYY - MM/DD/YYYY'}
                  selectedDates={queryParams?.selectedDates}
                  setDates={(dates) => {
                    updateFormHandler('selectedDates', dates);
                  }}
                />
              </Box>
              <Button
                variant="primary"
                startIcon={<PlusIcon />}
                onClick={() => setShowDrawer(true)}
              >
                {`${t('obx.invoice.createInvoice')}`}
              </Button>
            </Box>
          )}
        </Box>
      </Box>
      <Box className={classes.tableWrapper}>
        <TableComponent
          data={data}
          columns={columns}
          tableHead={tableHead}
          tableBody={tableBody}
          pagination={true}
          page={queryParams.page - 1}
          rowsPerPage={queryParams.perPage}
          totalRecords={totalRows}
          handleChangePage={handleChangePage}
          rowsPerPageOptions={paginationOptions.perPageOptions}
          onChangeRowsPerPage={handleChangeRowsPerPage}
        />
      </Box>
      {/* Invoice Drawer */}
      <SideDrawer isOpen={showDrawer} totalWidth={'1200px'} className={classes.sideDrawerHeight}>
        <InvoiceDrawer
          showDrawer={showDrawer}
          setShowDrawer={setShowDrawer}
          selectedInvoice={selectedInvoice}
          setSelectedInvoice={setSelectedInvoice}
          refetchData={fetchData}
        />
      </SideDrawer>
      {pdfViewDrawer && (
        <SideDrawer isOpen={pdfViewDrawer} key={`${loading}-${pdfUrl}`} totalWidth="1024px">
          <PDFViewDrawer url={pdfUrl} setUrl={setPdfUrl} closeDrawer={setPdfViewDrawer} />
        </SideDrawer>
      )}
      <SideDrawer isOpen={false} totalWidth={'1200px'} className={classes.sideDrawerHeight}>
        <PreviewInvoiceDrawer showDrawer={showPreviewDrawer} setShowDrawer={setPreviewShowDrawer} />
      </SideDrawer>

      <ApproveInvoice
        open={showApproveInvoice > -1}
        onClose={() => setShowApproveInvoice(-1)}
        onSave={handleInvoiceApprove}
        loading={isUpdating}
      />
      <ApproveSelectedInvoice
        open={showApproveSelectedInvoice}
        loading={isUpdating}
        onClose={() => setShowApproveSelectedInvoice(false)}
        onSave={handleMultipleInvoiceApprove}
      />

      <DeleteInvoice
        open={showDeleteInvoiceModel}
        loading={isUpdating}
        onClose={() => setShowDeleteInvoiceModel(false)}
        onSubmit={deleteInvoiceRequest}
      />
    </Box>
  );
}
