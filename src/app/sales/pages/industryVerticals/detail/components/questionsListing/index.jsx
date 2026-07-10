import {
  Avatar,
  Box,
  TableBody,
  TableCell,
  TableRow,
  TableSortLabel,
  Tooltip,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { ReactComponent as ChevronRight } from 'assets/svg/chevron-right.svg';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import LoaderComponent from 'src/app/components/common/loader';
import DetailDrawer from 'src/app/components/common/rightDrawer';
import TableSkeleton from 'src/app/components/common/skeletonLoader/tableSkeleton';
import SweetAlertModal from 'src/app/components/common/sweetAlertModal';
import TableComponent from 'src/app/components/common/table';
import NoRecordFound from 'src/app/components/common/table/noRecordFound';
import { SALES_QUESTION_BANK_EDIT_ROUTE } from 'src/app/router/constant/ROUTE';
import {
  ACL_MARKET_VERTICALS_QUESTIONS_DELETE,
  ACL_MARKET_VERTICALS_QUESTIONS_UPDATE,
} from 'src/app/router/constant/SALESMODULE';
import history from 'src/app/router/utils/history';
import QuestionDetails from 'src/app/sales/pages/questionBank/components/previewQuestion';
import { ReactComponent as DeleteIcon } from 'src/assets/svg/delete-modal.svg';
import { ReactComponent as DraggableIcon } from 'src/assets/svg/draggable.svg';
import { useApiControllers } from 'src/helper/axios';
import { getDisplayConfiguration } from 'src/redux/store/slices/regionalCountryConfiguration';
import {
  deleteQuestion,
  getQuestionsTemplates,
  updateQuestionsOrder,
} from 'src/services/question.services';
import userHasPermission from 'src/utils/auth/userHasPermission';
import { paginationOptions, toastSettings } from 'src/utils/constants';
import { defaultImage } from 'src/utils/constants';
import { formatISOTimestampToDate } from 'src/utils/date';
import { capitalizeFirstLetter } from 'src/utils/string/common';

import QuestionBankActions from '../questionBankActions';

const useStyles = makeStyles((theme) => ({
  dealNameTD: {
    paddingRight: '10px !important',
    cursor: 'pointer',
    zIndex: 1,
    fontWeight: '500 !important',
    color: `${theme.palette.textPrimary} !important`,

    '&:hover': {
      '& .MuiBox-root': {
        '& > :nth-child(2)': {
          '& svg': {
            visibility: 'visible !important',
          },
        },
      },
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
        stroke: theme.palette.surfaceGreyStrong1,
      },
    },
  },
  franchiseName: {
    display: 'flex !important',
    justifyContent: 'space-between',
    alignItems: 'center',
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
}));

const i18ColumnName = (t, classDealName) => {
  return [
    {
      id: 'dragDrop',
      label: '',
    },
    {
      id: 'questionStatement',
      label: `${t('sales.questions.listingColumnsQuestionStatement')}`,
      className: classDealName,
    },
    {
      id: 'updatedBy',
      label: `${t('sales.questions.listingColumnsLastEditedBy')}`,
      hasImage: true,
    },
    {
      id: 'updatedAt',
      label: `${t('sales.questions.listingColumnsLastEditedOn')}`,
    },
    {
      id: 'responseTypeLabel',
      label: `${t('sales.questions.listingColumnsAnswerType')}`,
    },
    {
      id: 'actions',
      label: '',
      align: 'right',
    },
  ];
};

const columnIdsEnum = {
  dragDrop: 'dragDrop',
  id: 'id',
  questionStatement: 'questionStatement',
  actions: 'actions',
  updatedBy: 'updatedBy',
};

const order = {
  orderBy: 'id',
  orderType: 'asc',
};

const params = {
  page: 1,
  perPage: paginationOptions.perPageRows,
  questionStatement: '',
  sortBy: '',
  orderBy: '',
};

const QuestionsListing = ({
  queryParams = params,
  setQueryParams,
  currentId,
  setTotalQuestion,
}) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const { dateFormat } = useSelector(getDisplayConfiguration);
  const { getNewApiController } = useApiControllers();

  const { id } = useParams();

  const NA = t('commonText.nA');

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [totalRows, setTotalRows] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const classDealName = classes.dealNameTD;
  const columns = i18ColumnName(t, classDealName);

  const fetchIndustryVerticals = async (queryParams) => {
    setLoading(true);
    try {
      // const response = await getIndustryVericals(queryParams);
      const response = await getQuestionsTemplates(queryParams, currentId);
      if (response?.statusCode === 200) {
        setData(response?.data?.questions || []);
        const totalCount = response?.data?.questions?.length || 0;
        setTotalRows(totalCount);
        if (!queryParams?.search) setTotalQuestion(totalCount);
        setLoading(false);
      }
    } catch (e) {
      setLoading(false);
      toast.error(e?.message, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  const updateVerticalsQuestionOrders = async (bodyData) => {
    const apiController = getNewApiController();
    try {
      const body = {
        ordered_question_ids: bodyData.map((a) => a?.questionsIndustryVerticalId),
      };

      await updateQuestionsOrder(body, { signal: apiController.signal });
    } catch (e) {
      if (!apiController.signal.aborted) {
        setLoading(false);

        toast.error(e?.message, {
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
      }
    }
  };

  const handleAlertCancel = () => {
    setShowModal(false);
  };

  const showAlert = (template) => {
    setShowModal(true);
    setSelectedTemplate(template);
  };

  const goToEditPage = (template) => {
    history.push(
      `${SALES_QUESTION_BANK_EDIT_ROUTE}/${template?.id}`.replace(':industryVerticalId', id),
    );
  };

  const showMenuBtn =
    userHasPermission(ACL_MARKET_VERTICALS_QUESTIONS_UPDATE) ||
    userHasPermission(ACL_MARKET_VERTICALS_QUESTIONS_DELETE);

  const renderTableCell = (row, column, provided) => {
    if (column.id === columnIdsEnum.dragDrop) {
      return (
        <Box {...provided.dragHandleProps}>
          <DraggableIcon />
        </Box>
      );
    }
    if (column.id === columnIdsEnum.questionStatement) {
      if (row[column.id].length > 75) {
        return (
          <Tooltip title={row[column.id]} arrow>
            <Box className={classes.franchiseName}>
              <Box className={classes.franchiseNameText}>
                {row[column.id].substring(0, 75) + '...'}
              </Box>
              <Box className={classes.franchiseNameIcon}>
                <ChevronRight />
              </Box>
            </Box>
          </Tooltip>
        );
      }
      return (
        <Box className={classes.franchiseName}>
          <Box className={classes.franchiseNameText}>{row[column.id]}</Box>
          <Box className={classes.franchiseNameIcon}>
            <ChevronRight />
          </Box>
        </Box>
      );
    }

    if (column.id == columnIdsEnum.actions)
      return (
        <>
          {/* <RenderIfHasPermission
            name={ACL_MARKET_VERTICALS_QUESTIONS_UPDATE || ACL_MARKET_VERTICALS_QUESTIONS_DELETE}
          > */}
          {showMenuBtn && (
            <QuestionBankActions
              handleDelete={showAlert}
              handleEdit={goToEditPage}
              question={row}
              disabled={false}
            />
          )}
          {/* </RenderIfHasPermission> */}
        </>
      );
    if (column.id == columnIdsEnum.updatedBy)
      return (
        <Box className={classes.reportsTableOfficer}>
          <Avatar className={classes.reportsTableOfficerAvatar} src={defaultImage} />
          {capitalizeFirstLetter(row[column.id]?.name) || NA}
        </Box>
      );
    if (column.id == 'updatedAt')
      return <>{row[column.id] ? formatISOTimestampToDate(row[column.id], dateFormat) : NA}</>;
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
        <Droppable droppableId="tbody">
          {(provided) => {
            return (
              <TableBody ref={provided.innerRef} {...provided.droppableProps}>
                {data.map((row, index) => (
                  <Draggable draggableId={row.id.toString()} key={row.id} index={index}>
                    {(provided, snapshot) => {
                      return (
                        <TableRow
                          key={row.id}
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          style={{
                            ...provided.draggableProps.style,
                            display: snapshot.isDragging ? 'table' : 'table-row',
                          }}
                        >
                          {columns.map((column) => {
                            const showHandCursor =
                              column.id === columnIdsEnum.industryName ? 'pointer' : '';

                            return (
                              <TableCell
                                key={column.id}
                                onClick={() => gotoDetailPage(column, row)}
                                sx={{ cursor: showHandCursor }}
                                className={column.className}
                                align={column.align}
                              >
                                {renderTableCell(row, column, provided)}
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      );
                    }}
                  </Draggable>
                ))}
                {provided.placeholder}
              </TableBody>
            );
          }}
        </Droppable>
      </>
    );
  };

  const handleChangePage = async (_, newPage) => {
    setQueryParams((prev) => ({
      ...prev,
      page: newPage + 1,
    }));
  };

  const gotoDetailPage = (column, row) => {
    if (column.id === columnIdsEnum.questionStatement) {
      setShowPreview(true);
      setSelectedTemplate(row);
    }
  };

  const handleClose = () => {
    setShowPreview(false);
    setSelectedTemplate({});
  };

  const handleDeleteQuestion = async () => {
    try {
      setLoadingDelete(true);
      const response = await deleteQuestion(selectedTemplate?.id);
      if (response?.statusCode === 200) {
        toast.success(response?.message, {
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
        if (queryParams?.page == 1) {
          fetchIndustryVerticals(queryParams);
          setLoadingDelete(false);
          return;
        }
        setQueryParams((prev) => ({
          ...prev,
          page: 1,
        }));
      }
      setLoadingDelete(false);
    } catch (error) {
      toast.error(error?.message, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
      setLoadingDelete(false);
    } finally {
      setShowModal(false);
    }
  };

  useEffect(() => {
    if (currentId) fetchIndustryVerticals(queryParams);
  }, [queryParams, currentId]);

  const handleDrageEnd = (results) => {
    if (!results.destination) return;

    let tempData = [...data];

    let [selectedRow] = tempData.splice(results.source.index, 1);

    tempData.splice(results.destination.index, 0, selectedRow);

    setData(tempData);
    updateVerticalsQuestionOrders(tempData);
  };

  return (
    <>
      {loadingDelete && <LoaderComponent size={50} color={'primary'} label={'Loading'} />}

      <DragDropContext onDragEnd={(results) => handleDrageEnd(results)}>
        <TableComponent
          data={data}
          columns={columns}
          tableHead={tableHead}
          tableBody={tableBody}
          pagination={false}
          page={queryParams.page - 1}
          perPage={queryParams.perPage}
          totalRecords={totalRows}
          handleChangePage={handleChangePage}
          hasTBody={true}
        />
      </DragDropContext>
      <SweetAlertModal
        type="warning" // 'success', 'error', 'warning', 'info', etc.
        title={t('sales.questions.deleteQuestion')}
        text={t('sales.questions.deleteMessage')}
        cancelButtonText={t('links.cancel')}
        confirmButtonText={t('sales.questions.deleteQuestion')}
        show={showModal}
        handleConfirmButton={handleDeleteQuestion}
        handleCancelButton={handleAlertCancel}
        icon={<DeleteIcon />}
      />
      {showPreview && (
        <DetailDrawer open={showPreview} onClose={handleClose} position={'right'}>
          <QuestionDetails
            question={selectedTemplate}
            onClose={handleClose}
            goToEditPage={() => goToEditPage(selectedTemplate)}
          />
        </DetailDrawer>
      )}
    </>
  );
};

QuestionsListing.propTypes = {
  queryParams: PropTypes.object,
  setQueryParams: PropTypes.func,
  currentId: PropTypes.number,
  setTotalQuestion: PropTypes.func,
};

export default QuestionsListing;
