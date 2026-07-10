import { Box, Button, TableCell, TableRow, TextField, Typography } from '@mui/material';
import { ReactComponent as TrashIcon } from 'assets/svg/DeleteOutlineRounded.svg';
import { ReactComponent as EditIcon } from 'assets/svg/edit-3-black.svg';
import { ReactComponent as CrossIcon } from 'assets/svg/edit-product-cross.svg';
import { ReactComponent as CheckIcon } from 'assets/svg/edit-product-tick.svg';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import PaginationComponent from 'src/app/components/common/pagination';
import TableSkeleton from 'src/app/components/common/skeletonLoader/tableSkeleton';
import SweetAlertModal from 'src/app/components/common/sweetAlertModal';
import TableComponent from 'src/app/components/common/table';
import NoRecordFound from 'src/app/components/common/table/noRecordFound';
import {
  ACL_SETTINGS_PRODUCTS_CREATE,
  ACL_SETTINGS_PRODUCTS_DELETE,
  ACL_SETTINGS_PRODUCTS_UPDDATE,
} from 'src/app/router/constant/SALESMODULE';
import { useApiControllers } from 'src/helper/axios';
import RenderIfHasPermission from 'src/hoc/renderIfHasPermission';
import useFormHook from 'src/hooks/useFormHook';
import {
  addProduct,
  deleteProduct,
  getPaginatedProducts,
  updateProduct,
} from 'src/services/settings.services';
import { paginationOptions } from 'src/utils/constants';
import { toastSettings } from 'src/utils/constants';
import formValidatorJoi from 'src/utils/formValidator/formValidator.requiredCheck';
import { toaster } from 'src/utils/toast';

import { useStyles } from './productSettings.style';

const pageParams = {
  paginate: true,
  rowsPerPage: paginationOptions.perPageRows,
  pageNo: paginationOptions.defaultPerPage,
};

const i18ColumnName = (t, tableHeaderClass) => {
  return [
    {
      id: 'name',
      label: t('sales.settings.productProductNameTableHeading'),
      sortable: false,
      className: tableHeaderClass,
    },
    {
      id: 'actions',
      label: '',
      sortable: false,
      className: tableHeaderClass,
    },
  ];
};

const columnIdsEnum = {
  name: 'name',
  actions: 'actions',
};

const ProductSettings = () => {
  const classes = useStyles();
  const { t } = useTranslation();
  const tableHeaderClass = classes.tableHeader;
  const columns = i18ColumnName(t, tableHeaderClass);
  const editInputRef = useRef(null);
  const { getNewApiController } = useApiControllers();

  const [loading, setLoading] = useState(true);
  const [addProductLoader, setAddProductLoader] = useState(false);
  const [editProductLoader, setEditProductLoader] = useState(false);
  const [queryParams, setQueryParams] = useState(pageParams);
  const [products, setProducts] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editingProductId, setEditingProductId] = useState(null);
  const [editingProductName, setEditingProductName] = useState('');
  const [editError, setEditError] = useState(false);

  // Pagination state aligned with server response
  const [paginationData, setPaginationData] = useState({
    currentPage: paginationOptions.defaultPerPage,
    nextPage: null,
    prevPage: null,
    totalPages: 0,
    totalCount: 0,
    rowsPerPage: paginationOptions.perPageRows,
  });

  const { handleInputChange, formData, errorMessages, setErrorMessages, setFormData } = useFormHook(
    {
      defaultFormData: {
        name: '',
      },
    },
  );

  const fetchProducts = async (params = queryParams) => {
    const apiController = getNewApiController();
    try {
      setLoading(true);
      let config = {
        signal: apiController.signal,
      };
      const productsResponse = await getPaginatedProducts(params, config);
      if (productsResponse.statusCode === 200) {
        setProducts(productsResponse?.data?.products || []);

        // Update pagination data from server response
        const pagination = productsResponse?.pagination || {};
        setPaginationData({
          currentPage: pagination.currentPage || params.pageNo,
          nextPage: pagination.nextPage || null,
          prevPage: pagination.prevPage || null,
          totalPages: pagination.totalPages || 0,
          totalCount: pagination.totalCount || 0,
          rowsPerPage: params.rowsPerPage,
        });

        setQueryParams(params);

        setLoading(false);
      }
    } catch (error) {
      if (!apiController.signal.aborted) {
        setLoading(false);
      }
      toaster.error({
        text: error?.message || t('sales.settings.productFetchingProductsError'),
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  const goToPage = (serverPage) => {
    // Cancel any existing edit before changing page
    handleCancelEdit();

    const updatedParams = {
      ...queryParams,
      pageNo: serverPage,
    };
    fetchProducts(updatedParams);
  };

  const handlePageChange = (event, newPage) => {
    // MUI TablePagination uses 0-based index, convert to 1-based for server
    const serverPage = newPage + 1;
    goToPage(serverPage);
  };

  const handleRowsPerPageChange = (event) => {
    // Cancel any existing edit before changing rows per page
    handleCancelEdit();

    const newRowsPerPage = parseInt(event.target.value, 10);

    const updatedParams = {
      ...queryParams,
      rowsPerPage: newRowsPerPage,
      pageNo: paginationOptions.defaultPerPage, // Reset to first page when changing rows per page
    };
    fetchProducts(updatedParams);
  };

  const handleAddProduct = async () => {
    setErrorMessages({});

    try {
      setAddProductLoader(true);
      const trimmedValue = formData?.name?.trim();

      if (!trimmedValue) {
        setErrorMessages({
          name: t('sales.settings.productAddProducterror', { '#label': 'Product name' }),
        });
        setAddProductLoader(false);
        return;
      }

      const errors = await formValidatorJoi({ name: trimmedValue }, t);
      if (errors && Object.keys(errors).length) {
        setErrorMessages(errors);
        setAddProductLoader(false);
        return;
      }

      const productPayload = {
        product: {
          name: trimmedValue,
        },
      };
      const response = await addProduct(productPayload);

      if (response.statusCode === 200) {
        toaster.success({
          text: response.message,
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
        // Reset form and fetch products
        setFormData({ name: '' });
        fetchProducts();
        setAddProductLoader(false);
      }
    } catch (error) {
      setAddProductLoader(false);
      toaster.error({
        text: error?.message || t('sales.settings.productProductAddedError'),
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  const handleEditProduct = (product) => {
    setEditingProductId(product.id);
    setEditingProductName(product.name);
    setEditError(false);

    setTimeout(() => {
      if (editInputRef.current) {
        editInputRef.current.focus();
        const length = product.name.length;
        editInputRef.current.setSelectionRange(length, length);
      }
    }, 0);
  };

  const handleCancelEdit = () => {
    setEditingProductId(null);
    setEditingProductName('');
    setEditError(false);
  };

  const handleEditInputChange = (e) => {
    const value = e.target.value;
    setEditingProductName(value);

    // Validate: check if empty or only spaces
    const trimmedValue = value.trim();
    setEditError(!trimmedValue);
  };

  const handleConfirmEdit = async () => {
    try {
      setEditProductLoader(true);
      const trimmedValue = editingProductName.trim();
      // Validate empty or spaces only
      if (!trimmedValue) {
        setEditError(true);
        setEditProductLoader(false);
        return;
      }
      const editProductPayload = {
        product: {
          name: trimmedValue,
        },
      };
      const response = await updateProduct(editingProductId, editProductPayload);
      if (response.statusCode === 200) {
        toaster.success({
          text: response.message,
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
        setProducts((prev) =>
          prev.map((product) =>
            product.id === editingProductId ? { ...product, name: trimmedValue } : product,
          ),
        );
        setEditProductLoader(false);
        // Reset edit state
        handleCancelEdit();
      }
    } catch (error) {
      toaster.error({
        text: error?.message || t('sales.settings.productProductUpdatedError'),
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
      setEditProductLoader(false);
    }
  };

  const handleEditKeyDown = (e) => {
    if (e.key === 'Enter' && !editError) {
      handleConfirmEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  const handleOpenDeleteModal = (product) => {
    // Cancel any existing edit before opening delete modal
    handleCancelEdit();
    setSelectedProduct(product);
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setSelectedProduct(null);
  };

  const handleConfirmDelete = async () => {
    handleCloseDeleteModal();
    try {
      if (selectedProduct) {
        const response = await deleteProduct(selectedProduct?.id);
        if (response.statusCode === 200) {
          toaster.success({
            text: response.message,
            position: 'top-right',
            autoClose: toastSettings.AUTO_CLOSE,
          });

          // If current page has only one item and it's not the first page, go to previous page
          if (products.length === 1 && paginationData.currentPage > 1) {
            // Use goToPage with 1-based index directly
            goToPage(paginationData.currentPage - 1);
          } else {
            fetchProducts();
          }
        }
      }
    } catch (error) {
      toaster.error({
        text: error?.message || t('sales.settings.productProductDeletedError'),
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  const renderTableCell = (row, column) => {
    const isEditing = editingProductId === row.id;

    if (column.id === columnIdsEnum.actions) {
      return (
        <Box className={classes.actionsContainer}>
          <RenderIfHasPermission name={ACL_SETTINGS_PRODUCTS_UPDDATE}>
            <EditIcon
              className={`${classes.actionIcon} ${isEditing ? classes.actionIconHidden : ''}`}
              onClick={!isEditing ? () => handleEditProduct(row) : undefined}
            />
          </RenderIfHasPermission>
          <RenderIfHasPermission name={ACL_SETTINGS_PRODUCTS_DELETE}>
            {row?.isDeleteable && (
              <TrashIcon
                className={`${classes.actionIconDelete} ${isEditing ? classes.actionIconHidden : ''}`}
                onClick={!isEditing ? () => handleOpenDeleteModal(row) : undefined}
              />
            )}
          </RenderIfHasPermission>
        </Box>
      );
    }

    if (column.id === columnIdsEnum.name) {
      if (isEditing) {
        return (
          <Box className={classes.editInputWrapper}>
            <TextField
              inputRef={editInputRef}
              value={editingProductName}
              onChange={handleEditInputChange}
              onKeyDown={handleEditKeyDown}
              className={`${classes.editProductInput} ${editError ? classes.editProductInputError : ''}`}
              size="small"
              autoFocus
              disabled={editProductLoader}
            />
            <Box className={classes.editActionsWrapper}>
              <CheckIcon
                className={`${classes.actionIconConfirm} ${editError || editProductLoader ? classes.actionIconDisabled : ''}`}
                onClick={!editError && !editProductLoader ? handleConfirmEdit : undefined}
              />
              <CrossIcon
                className={`${classes.actionIconCancel} ${editProductLoader ? classes.actionIconDisabled : ''}`}
                onClick={!editProductLoader ? handleCancelEdit : undefined}
              />
            </Box>
          </Box>
        );
      }

      return (
        <Box className={classes.productNameTextContainer}>
          <Typography variant="subtitle" className={classes.productNameText}>
            {row.name}
          </Typography>
        </Box>
      );
    }

    return <>{row[column.id]}</>;
  };

  const tableHead = () => {
    return (
      <TableRow>
        {columns.map((column) => (
          <TableCell key={column.id} className={column.className}>
            {column.label}
          </TableCell>
        ))}
      </TableRow>
    );
  };

  const tableBody = (data, columns) => {
    return loading ? (
      <TableSkeleton columns={columns} />
    ) : (
      <>
        {data.length > 0 ? (
          data.map((row) => (
            <TableRow key={row.id}>
              {columns.map((column) => (
                <TableCell key={column.id}>{renderTableCell(row, column)}</TableCell>
              ))}
            </TableRow>
          ))
        ) : (
          <NoRecordFound data={data} noOfColumns={columns.length} t={t} />
        )}
      </>
    );
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <Box className={classes.container}>
      <Box className={classes.header}>
        <Typography variant="h4" className={classes.title}>
          {t('sales.settings.productProductPageTitle')}
        </Typography>
        <Typography variant="body2" className={classes.subtitle}>
          {t('sales.settings.productProductPageDescription')}
        </Typography>
      </Box>

      {/* Product Content */}
      <Box className={classes.content}>
        <RenderIfHasPermission name={ACL_SETTINGS_PRODUCTS_CREATE}>
          <Box className={classes.addProductContainer}>
            <TextField
              placeholder={t('sales.settings.productAddProduct')}
              type="text"
              name="name"
              value={formData?.name || ''}
              onChange={handleInputChange}
              className={classes.addProductInput}
              error={!!errorMessages?.name}
              helperText={errorMessages?.name || null}
            />
            <Button
              variant="primary"
              onClick={handleAddProduct}
              disabled={addProductLoader}
              className={classes.addProductButton}
            >
              {t('sales.settings.productAddProduct')}
            </Button>
          </Box>
        </RenderIfHasPermission>

        {/* Products Table */}
        <Box className={classes.tableWrapper}>
          <TableComponent
            data={products}
            columns={columns}
            tableHead={tableHead}
            tableBody={tableBody}
            pagination={false}
          />
        </Box>

        {/* Pagination */}
        {!loading && paginationData.totalCount > 0 && (
          <Box className={classes.paginationWrapper}>
            <PaginationComponent
              totalRecords={paginationData.totalCount}
              page={paginationData.currentPage - 1}
              perPage={paginationData.rowsPerPage}
              handleChangePage={handlePageChange}
              onChangeRowsPerPage={handleRowsPerPageChange}
              perPageOptions={[10, 25, 50, 100]}
            />
          </Box>
        )}
      </Box>

      <SweetAlertModal
        type="warning"
        title={t('commonText.modal.areYouSure.title')}
        text={t('sales.settings.productDeleteProductTitle')}
        cancelButtonText={t('links.cancel') || 'Cancel'}
        confirmButtonText={t('sales.settings.productDeleteProduct') || 'Delete Product'}
        show={showDeleteModal}
        handleConfirmButton={handleConfirmDelete}
        handleCancelButton={handleCloseDeleteModal}
        reverseButtons={true}
      />
    </Box>
  );
};

export default ProductSettings;
