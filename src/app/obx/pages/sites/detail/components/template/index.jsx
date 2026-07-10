import { Box, Button, TableCell, TableRow, TableSortLabel, Typography } from '@mui/material';
import { ReactComponent as ChevronRight } from 'assets/svg/chevron-right.svg';
import { ReactComponent as Dustbin } from 'assets/svg/Dustbin.svg';
import { ReactComponent as EditIcon } from 'assets/svg/edit-drop.svg';
import { ReactComponent as PlusIcon } from 'assets/svg/plus.svg';
import SearchComponentWithQuery from 'commonComponents/searchWithQuery';
import TableComponent from 'commonComponents/table';
import NoRecordFound from 'commonComponents/table/noRecordFound';
import TableImage from 'commonComponents/tableImage';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import CustomDropDown from 'src/app/components/common/customDropDown';
import PopoverButton from 'src/app/components/common/popoverButton';
import TableSkeleton from 'src/app/components/common/skeletonLoader/tableSkeleton';
import SweetAlertModal from 'src/app/components/common/sweetAlertModal';
import {
  HO_TEMPLATE_CREATE,
  HO_TEMPLATE_PREVIEW,
  HO_TEMPLATE_UPDATE,
} from 'src/app/router/constant/ROUTE';
import { DeleteAlterIcon, MoreVert } from 'src/assets/svg';
import { useApiControllers } from 'src/helper/axios';
import { formatDate } from 'src/helper/utilityFunctions';
import { deleteTemplate } from 'src/services/template.services';
import { getVisitorsLoadsTemplates } from 'src/services/visitorsLoads.service';
import transformArrayForOptions from 'src/utils/array/transformArrayForOptions';
import { defaultImage, paginationOptions, toastSettings } from 'src/utils/constants';
import { capitalizeFirstLetter } from 'src/utils/string/common';
import { toaster } from 'src/utils/toast';

import { useStyles } from './templateStyles';

const i18ColumnName = (t, hoverIconClass) => {
  return [
    {
      id: 'type',
      label: `${t('obx.visitors.tables.listing.columns.type')}`,
      sortable: false,
      className: hoverIconClass,
    },

    {
      id: 'createdOn',
      label: `${t('obx.visitors.tables.listing.columns.createdOn')}`,
      sortable: false,
    },
    {
      id: 'templateableType',
      label: `${t('obx.visitors.tables.listing.columns.type')}`,
      sortable: false,
    },
    {
      id: 'createdBy',
      label: `${t('obx.visitors.tables.listing.columns.createdBy')}`,
      sortable: false,
      className: hoverIconClass,
      hasImage: true,
    },
    {
      id: 'action',
      label: `${t('obx.visitors.tables.listing.columns.action')}`,
      sortable: false,
    },
  ];
};

const columnIdsEnum = {
  createdBy: 'createdBy',
  createdOn: 'createdOn',
  action: 'action',
  type: 'type',
  templateableType: 'templateableType',
};

const enumTypeCategory = {
  visitors: 'visitors',
  loads: 'loads',
};

const initializeParams = (categoryType) => {
  return {
    page: paginationOptions.defaultPerPage,
    perPage: paginationOptions.perPageRows,
    siteId: '',
    templateableType: '',
    title: '',
    ...(categoryType === enumTypeCategory.loads ? { loadsTypes: [] } : {}),
    ...(categoryType === enumTypeCategory.visitors ? { visitorsTypes: [] } : {}),
  };
};

const Template = ({ siteId, categoryType }) => {
  const { t } = useTranslation();
  const { getNewApiController } = useApiControllers();
  const history = useHistory();
  const classes = useStyles();

  // const CATEGORY = [`${categoryType}CheckIn`, `${categoryType}CheckOut`];

  const NA = t('commonText.nA');

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [totalRows, setTotalRows] = useState(0);
  const [typeOptions, setTypeOptions] = useState([]);
  const [queryParams, setQueryParams] = useState(initializeParams(categoryType));
  const [filterQuery, setFilterQuery] = useState({
    ...(categoryType === enumTypeCategory.loads ? { loadsTypes: [] } : {}),
    ...(categoryType === enumTypeCategory.visitors ? { visitorsTypes: [] } : {}),
  });

  const hoverIconClass = classes.SitesTD;
  const columns = i18ColumnName(t, hoverIconClass);

  const handleCreate = () => {
    const urlParams = new URLSearchParams(location.search);
    const existingParams = urlParams.toString();
    history.push(
      `${HO_TEMPLATE_CREATE}?siteId=${siteId}&page=${categoryType}${existingParams ? `&${existingParams}` : ''}`,
    );
  };

  const inputChangedHandler = (event) => {
    const { value } = event.target;
    fetchTemplatesVisitorLoads({ value, ...queryParams });
  };

  const updateFormHandler = (name, value) => {
    setFilterQuery((prevState) => ({
      ...prevState,
      [name]: value,
    }));
    const values = value?.map((item) => item.id);
    setQueryParams((prevState) => {
      return {
        ...prevState,
        page: paginationOptions.defaultPerPage,
        [name]: values,
      };
    });
  };
  const handleSelectUpdate = (event) => {
    const { name, value } = event.target;
    updateFormHandler(name, value);
  };

  const fetchTemplatesVisitorLoads = async ({ value, ...queryParams }) => {
    const apiController = getNewApiController();

    try {
      setLoading(true);
      let params = {
        ...queryParams,
        siteId: siteId,
        templateableType: queryParams?.[`${categoryType}Types`].length
          ? queryParams?.[`${categoryType}Types`]
          : [`${categoryType}CheckIn`, `${categoryType}CheckOut`],
      };

      if (value) {
        params.title = value;
      }

      const response = await getVisitorsLoadsTemplates(params, {
        signal: apiController.signal,
      });
      if (response?.statusCode === 200) {
        setData(response.data.templates);
        if (typeOptions.length === 0) {
          const options = response?.data?.templates
            ?.map((item) => ({
              id: item.templateableType,
              title: t(`obx.visitors.tables.listing.columns.${item.templateableType}`),
            }))
            ?.reduce((acc, current) => {
              const x = acc.find((item) => item.id === current.id);
              if (!x) {
                acc.push(current);
              }
              return acc;
            }, []);
          setTypeOptions(transformArrayForOptions(options, 'title', 'id'));
        }
        setTotalRows(response?.data?.pagination?.totalCount);
        setLoading(false);
      }
    } catch (error) {
      if (!apiController.signal.aborted) {
        setLoading(false);
      }
    }
  };

  const handleEdit = (template) => {
    const urlParams = new URLSearchParams(location.search);
    const existingParams = urlParams.toString();
    history.push(
      `${HO_TEMPLATE_UPDATE}/${template?.id}?siteId=${siteId}&page=${categoryType}${existingParams ? `&${existingParams}` : ''}`,
    );
  };
  const handleAlertCancel = () => {
    setShowModal(false);
  };

  const showAlert = (template) => {
    setShowModal(true);
    setSelectedTemplate(template);
  };

  const handleDeleteTemplate = async () => {
    try {
      setLoading(true);
      setShowModal(false);
      const response = await deleteTemplate(selectedTemplate?.id);

      if (response?.statusCode === 200) {
        toaster.success({
          text: response?.message,
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });

        setQueryParams((prev) => ({
          ...prev,
          page: 1,
        }));
      }
    } catch (error) {
      setLoading(false);
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    } finally {
      setLoading(false);
      setSelectedTemplate({});
    }
  };

  const renderTableCell = (row, column) => {
    if (column.id === columnIdsEnum.type) {
      return (
        <Box className={classes.franchiseName}>
          <Box className={classes.franchiseNameText}>{capitalizeFirstLetter(row.title) || NA}</Box>
          <Box className={classes.franchiseNameIcon}>
            <ChevronRight />
          </Box>
        </Box>
      );
    }

    if (column.id === columnIdsEnum.createdBy) {
      return (
        <Box className={classes.franchiseName}>
          <TableImage imageUrl={row[column.id].image || defaultImage} alt="" />
          <Box className={classes.franchiseNameText}>
            {capitalizeFirstLetter(row[column.id].name) || NA}
          </Box>
        </Box>
      );
    }

    if (column.id === columnIdsEnum.templateableType) {
      return (
        <Box className={classes.franchiseName}>
          <Box className={classes.franchiseNameText}>
            {t(`obx.visitors.tables.listing.columns.${row[column.id]}`) || NA}
          </Box>
        </Box>
      );
    }

    if (column.id === columnIdsEnum.action) {
      return (
        <PopoverButton
          className={classes.visitorsActions}
          variant="icon"
          Icon={MoreVert}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
        >
          <Box
            onClick={() => {
              handleEdit(row);
            }}
            className={classes.simpleList}
          >
            <EditIcon />
            <Typography className={classes.simpleListText} variant="subtitle2">
              {t('obx.visitors.edit')}
            </Typography>
          </Box>
          <Box
            onClick={() => {
              showAlert(row);
            }}
            className={classes.visitorsActionsDelete}
          >
            <Dustbin />
            <Typography className={classes.visitorsActionsTextDelete} variant="subtitle2">
              {t('obx.visitors.delete')}
            </Typography>
          </Box>
        </PopoverButton>
      );
    }

    if (column.id === columnIdsEnum.createdOn) {
      return <>{formatDate(row[column.id], 'MM/DD/YYYY, HH:mm') || NA}</>;
    }

    return <>{row[column.id] || NA}</>;
  };
  const handlePreview = (template) => {
    const urlParams = new URLSearchParams(location.search);
    const existingParams = urlParams.toString();
    history.push(
      `${HO_TEMPLATE_PREVIEW}/${template?.id}?siteId=${siteId}&page=${categoryType}${existingParams ? `&${existingParams}` : ''}`,
    );
  };
  const openVisitorDetail = (column, row) => {
    if (column.id === 'type') {
      handlePreview(row);
    }
  };

  const tableHead = () => {
    return (
      <>
        <TableRow>
          {columns?.map((column) => (
            <TableCell key={column?.id}>
              {column?.sortable ? (
                <TableSortLabel>{column?.label}</TableSortLabel>
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
        {data.length > 0 &&
          data.map((row) => (
            <TableRow key={row.id}>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  onClick={() => openVisitorDetail(column, row)}
                  className={column.className}
                >
                  {renderTableCell(row, column)}
                </TableCell>
              ))}
            </TableRow>
          ))}
      </>
    );
  };

  useEffect(() => {
    fetchTemplatesVisitorLoads(queryParams);
  }, [siteId, queryParams]);

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

  const modalText = {
    visitors: {
      title: t('ho.templates.delete.visitorTitle'),
      description: t('ho.templates.delete.visitorDescription'),
    },
    loads: {
      title: t('ho.templates.delete.loadsTitle'),
      description: t('ho.templates.delete.loadsDescription'),
    },
  };

  return (
    <Box className={classes.visitors}>
      {/* {loading && <LoaderComponent size={50} color={'primary'} label={'Loading'} />} */}
      <Box className={classes.visitorsHeader}>
        <Box className={classes.visitorsHeaderSearch}>
          <SearchComponentWithQuery
            name="search"
            placeHolder={t('obx.visitorsLoadsOfficer.searchTemplateType')}
            onSearch={inputChangedHandler}
          />
          <CustomDropDown
            label={t('obx.visitors.dropdownTypeLabel')}
            name={`${categoryType}Types`}
            options={typeOptions}
            selectedValues={filterQuery?.[`${categoryType}Types`]}
            handleChange={handleSelectUpdate}
            clearAll
            searchable
            checkmark
            multiSelect
          />
        </Box>
        <Box className={classes.visitorsHeaderRight}>
          <Button
            onClick={handleCreate}
            className={classes.addBannedVisitorBtn}
            variant="primary"
            startIcon={<PlusIcon />}
          >
            {t('obx.visitors.tables.listing.columns.createNewTemplate')}
          </Button>
        </Box>
      </Box>
      <Box className={classes.visitorsTable}>
        <TableComponent
          data={data}
          columns={columns}
          tableHead={tableHead}
          tableBody={tableBody}
          pagination={true}
          page={queryParams.page - 1}
          handleChangePage={handleChangePage}
          totalRecords={totalRows}
          rowsPerPage={queryParams?.perPage}
          rowsPerPageOptions={paginationOptions.perPageOptions}
          onChangeRowsPerPage={handleChangeRowsPerPage}
        />
      </Box>

      <SweetAlertModal
        type="warning"
        title={modalText?.[categoryType]?.title}
        text={t('ho.templates.delete.templateDescription')}
        confirmButtonText={t('ho.templates.delete.deleteButtonText')}
        cancelButtonText={t('ho.templates.delete.cancelButtonText')}
        show={showModal}
        handleConfirmButton={handleDeleteTemplate}
        handleCancelButton={handleAlertCancel}
        reverseButtons={true}
        icon={<DeleteAlterIcon />}
      />
    </Box>
  );
};

Template.propTypes = {
  siteId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  categoryType: PropTypes.string,
};

export default Template;
