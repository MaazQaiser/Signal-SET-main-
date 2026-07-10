// eslint-disable-next-line simple-import-sort/imports
import { Box, Button, Checkbox, Chip, Tooltip } from '@mui/material';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Typography from '@mui/material/Typography';

import { ReactComponent as HitAccordionArrow } from 'assets/svg/HitAccordionArrow.svg';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
// import { useTranslation } from 'react-i18next';
import { ReactComponent as CheckedCheckBoxIcon } from 'src/assets/svg/checkbox-checked.svg';
import { ReactComponent as CheckBoxRegularIcon } from 'src/assets/svg/checkbox.svg';
import { ReactComponent as DeleteAccordionIcon } from 'src/assets/svg/DeleteAccordionIcon.svg';
import { ReactComponent as DragIcon } from 'src/assets/svg/DragIcon.svg';
import { ReactComponent as ExclamationMarkIcon } from 'src/assets/svg/ExclamationMark.svg';
import { ReactComponent as ExclamatoryRoundIcon } from 'src/assets/svg/ExclamatoryRoundIcon.svg';
import { ReactComponent as HitPlusIcon } from 'src/assets/svg/HitPlusIcon.svg';
// import { ReactComponent as HyperlinkIcon } from 'src/assets/svg/HyperlinkIcon.svg';
// import { ReactComponent as MissedHitAccordianIcon } from 'src/assets/svg/missed.svg';
import { ReactComponent as DispatchPinDropIcon } from 'src/assets/svg/dispatchPinDrop.svg';
import { ReactComponent as MissedHitsIcon } from 'src/assets/svg/MissedHitsIcon.svg';
import { ReactComponent as PinDropGreenIcon } from 'src/assets/svg/PinDropGreenIcon.svg';
import { ReactComponent as PinDropIcon } from 'src/assets/svg/PinDropIcon.svg';
// import { ReactComponent as ReassignedHitAccordianIcon } from 'src/assets/svg/reassigned.svg';

// import { ReactComponent as ReportNotFoundHitAccordionIcon } from 'src/assets/svg/incomplete.svg';

// import { ReactComponent as NoReportFoundToolTipHitAccordianIcon } from 'src/assets/svg/hitnoreporterror.svg';

// import { ReactComponent as CancelledHitAccordianIcon } from 'src/assets/svg/cancelledHit.svg';
import { ReactComponent as HyperlinkIcon } from 'src/assets/svg/HyperlinkIcon.svg';
import { ReactComponent as MissedHitAccordianIcon } from 'src/assets/svg/missed.svg';
import { ReactComponent as ReassignedHitAccordianIcon } from 'src/assets/svg/reassigned.svg';

import { ReactComponent as ReportNotFoundHitAccordionIcon } from 'src/assets/svg/incomplete.svg';

import { ReactComponent as NoReportFoundToolTipHitAccordianIcon } from 'src/assets/svg/hitnoreporterror.svg';

import { ReactComponent as CancelledHitAccordianIcon } from 'src/assets/svg/cancelledHit.svg';

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import LoaderComponent from 'src/app/components/common/loader';
import NoRecordFound from 'src/app/components/common/table/noRecordFound';
import { OBX_SITES_DETAIL } from 'src/app/router/constant/ROUTE';
import { useApiControllers } from 'src/helper/axios';
import { timeFormat12h } from 'src/helper/utilityFunctions';
import { UPDATE_RUNSHEET_STATE } from 'src/redux/reducers/runSheetReducer';
import { getDispatch } from 'src/services/dispatch.services';
import { getHitsDetailDataForRunSheet } from 'src/services/runsheet.services';
import { toastSettings } from 'src/utils/constants';
import { DRAWER_TYPE } from 'src/utils/constants/schedules';
import { dayjsWithStandardOffset } from '../../../schedules/helper';
import PatrolAssignTour from '../../../sites/detail/components/jobs/PatrolAssignTour';
import NewRunsheetHit from '../newRunsheetHit';
import RunsheetHits from '../runsheetHits';
import { useStyles } from './HitsAccordionListing';

const HitsAccordionListing = (props) => {
  const {
    idKey,
    isDispatched,
    getHits = () => {},
    hitsList,
    hitsLoading,
    splitRunSheet,
    handleDelete,
    state,
    dispatch,
    showSelectionCheckBox,
    showOrder,
    showDragAndDrop,
    showDelete,
    showMissedHits,
    selectAllHits,
    showEdit,
    showActions,
    handleAction,
    setChecked,
    visitedPoints,
    showVisitedPoints,
    fetchRunsheetDetails,
    unfilteredHitList,
    searchTerm,
    shiftDetails,
  } = props;
  console.log({ props });
  // const { t } = useTranslation();
  const [accordionOpen, setAccordionOpen] = useState(false);
  const [openedHitAccordionId, setOpenedHitAccordionId] = useState(null);

  const [selectedHitsIdsObject, setSelectedHitsIdsObject] = useState({});
  const [hitDetailsData, setHitDetailData] = useState(null);
  const [fetchingHitLoading, setFetchingHitLoading] = useState(true);
  const [isRestoredPreviousSelection, setIsRestoredPreviousSelection] = useState(false);
  const { getNewApiController } = useApiControllers();
  const [drawerHitDetail, setDrawerHitDetail] = useState(null);
  const { t } = useTranslation();

  const [showDrawer, setShowDrawer] = useState({
    open: '',
    data: {},
  });

  const changeOnlyDrawerType = (value) => () => {
    setShowDrawer((prev) => ({ open: value, data: value ? prev?.data : null }));
  };

  const showSideDrawer = (value) => (data) => {
    setShowDrawer({ open: value, data: value ? data : null });
  };

  const handleShowTourAssignmentDrawer = (hit) => {
    setDrawerHitDetail(hit);
    showSideDrawer(DRAWER_TYPE.TOUR_ASSIGNMENT)({
      id: hit?.hitId,
    });
  };

  // const [accordionOpen, setAccordionOpen] = useState(null);
  const classes = useStyles({});
  const handleCheckboxFocus = (event) => {
    event.stopPropagation(); // Prevents the focus event from affecting the accordion
  };
  // const handleEditButton = (event) => {
  //   event.stopPropagation(); // Prevents the focus event from affecting the accordion
  // };
  const handleAccordionToggle = (hitId) => {
    if (!openedHitAccordionId) {
      setOpenedHitAccordionId(hitId?.hitId ? { hitId: hitId?.hitId } : hitId);
      return;
    }

    setOpenedHitAccordionId(
      openedHitAccordionId === hitId ||
        openedHitAccordionId === hitId?.hitId ||
        openedHitAccordionId?.hitId === hitId?.hitId ||
        openedHitAccordionId?.hitId === hitId ||
        openedHitAccordionId
        ? null
        : hitId,
    );
    setHitDetailData(null);
    setAccordionOpen(!accordionOpen);
  };

  useEffect(() => {
    if (openedHitAccordionId) getHitDetails();
  }, [openedHitAccordionId]);

  useEffect(() => {
    if (state?.visitSet) {
      const result = {};
      state.visitSet.forEach((hitDetail) => {
        if (hitDetail?.tour) result[hitDetail?.[idKey]] = true;
      });
      console.log({ result });
      setSelectedHitsIdsObject(result);
    }
  }, [state?.visitSet]);
  const handleSelectionOrSelectAll = (e, data = null) => {
    let dataSet = state?.visitSet || [];
    let finalDataSet = [];
    let newData = { ...selectedHitsIdsObject };
    const { checked } = e?.target || {};
    const isSelectAll = data === null;

    if (isSelectAll) {
      // Handle selecting and deselect all
      if (selectAllHits) {
        // Mapping true against all IDs and saving in selected hits
        hitsList.forEach((hit) => {
          if (hit?.tour) newData[hit?.[idKey]] = true;
        });
        finalDataSet = hitsList.filter((item) => {
          if (item?.tour) return item;
        });
      } else {
        // Reset selected hits
        newData = {};
        finalDataSet = [];
      }
    } else {
      // Handle individual item selection
      if (checked) {
        newData = { ...newData, [data?.[idKey]]: true };
        finalDataSet = [...dataSet, data];
        // getHitDetails(data?.[idKey]);
      } else {
        // setHitDetailData(null);
        delete newData?.[data?.[idKey]];
        finalDataSet = dataSet?.filter((item) => item?.[idKey] !== data?.[idKey]);
      }
    }
    console.log({ finalDataSet });
    setSelectedHitsIdsObject(newData);
    dispatch({ type: UPDATE_RUNSHEET_STATE, payload: { key: 'visitSet', value: finalDataSet } });
  };

  const handleSelection = (e, data) => handleSelectionOrSelectAll(e, data);

  const handleSelectAllHits = () => handleSelectionOrSelectAll(null);

  useEffect(() => {
    if (selectAllHits !== null) handleSelectAllHits();
  }, [selectAllHits]);

  useEffect(() => {
    if (
      hitsList?.length &&
      !isRestoredPreviousSelection &&
      Object.keys(selectedHitsIdsObject)?.length === unfilteredHitList?.length
    ) {
      setChecked(true);
      setIsRestoredPreviousSelection(true);
    }
  }, [selectedHitsIdsObject, hitsList]);

  /**
   * @description handle drag and drop on reorder hits tab
   * @param {*} result
   * @returns
   */
  const handleDragEnd = (result) => {
    if (!result.destination) return;

    let tempData = [...hitsList];

    let [selectedRow] = tempData.splice(result.source.index, 1);

    tempData.splice(result.destination.index, 0, selectedRow);
    dispatch({ type: UPDATE_RUNSHEET_STATE, payload: { key: 'visitSet', value: tempData } });
  };

  const getHitDetails = async () => {
    if (!openedHitAccordionId) return;
    const apiController = getNewApiController();
    try {
      setFetchingHitLoading(true);
      let data = null;
      if (openedHitAccordionId?.hitId) {
        data = await getDispatch(openedHitAccordionId?.hitId);
        setHitDetailData(data?.data?.dispatch || {});
      } else {
        data = await getHitsDetailDataForRunSheet(openedHitAccordionId, {
          signal: apiController.signal,
        });
        setHitDetailData(data?.data);
      }

      setFetchingHitLoading(false);
    } catch (error) {
      if (!apiController.signal.aborted) {
        toast.error(error, {
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
      }
    }
  };

  const refetchHitDetails = () => {
    fetchRunsheetDetails();
    getHitDetails();
    getHits();
  };

  /**
   * Loader
   */
  if (hitsLoading) {
    return <LoaderComponent />;
  }

  /**
   * No hits found
   */
  if (!hitsList?.length) {
    return (
      <Box className={classes.noFound}>
        <NoRecordFound data={[]} />
      </Box>
    );
  }

  const filteredHits = searchTerm
    ? hitsList.filter((hits) => hits.siteName?.toLowerCase().includes(searchTerm?.toLowerCase()))
    : hitsList;

  const goToSiteDetails = (event, siteId, extraParams = '') => {
    event.stopPropagation();
    window.open(`${OBX_SITES_DETAIL}/${siteId}?${extraParams}`, '_blank');
  };

  return (
    <Box>
      <DragDropContext onDragEnd={(results) => handleDragEnd(results)}>
        <Droppable droppableId="droppable">
          {(provided) => {
            return (
              <Box {...provided.droppableProps} ref={provided.innerRef}>
                {!filteredHits?.length && !isDispatched && (
                  <Box className={classes.noRecordFoundFromSearch}>
                    <NoRecordFound data={filteredHits} />
                  </Box>
                )}
                {hitsList?.map((data, _index) => {
                  if (
                    !isDispatched &&
                    !data?.siteName?.toLowerCase()?.includes(searchTerm?.toLowerCase())
                  )
                    return;
                  let icon = (
                    <>
                      <PinDropIcon />
                    </>
                  );
                  let classForLeftMarker = classes.hitAccordionWrapperWithPils;
                  if (showVisitedPoints && visitedPoints[data?.hitId]) {
                    classForLeftMarker = classes.visitedHitAccordionWrapperWithPils;
                    icon = (
                      <>
                        <PinDropGreenIcon />
                      </>
                    );
                  } else if (data?.dispatchId) {
                    icon = <DispatchPinDropIcon />;
                    classForLeftMarker = classes.dispatchedHitAccordionWrapperWithPils;
                  } else if (data?.isVisited && !data?.tour?.reportId) {
                    icon = (
                      <>
                        <ReportNotFoundHitAccordionIcon />
                      </>
                    );
                    classForLeftMarker = classes.reportNotSubmittedHitAccordionWrapperWithPils;
                  } else if (!data?.isVisited && shiftDetails?.scheduleStatus === 'completed') {
                    icon = (
                      <>
                        <MissedHitAccordianIcon />
                      </>
                    );
                    classForLeftMarker = classes.missedHitAccordionWrapperWithPils;
                  } else if (data?.isDisabled) {
                    icon = (
                      <>
                        <CancelledHitAccordianIcon />
                      </>
                    );
                    classForLeftMarker = classes.cancelledHitAccordionWrapperWithPils;
                  } else if (data?.isReassigned) {
                    icon = (
                      <>
                        <ReassignedHitAccordianIcon />
                      </>
                    );
                    classForLeftMarker = classes.reAssignedHitAccordionWrapperWithPils;
                  }

                  return (
                    <Draggable
                      isDragDisabled={!showDragAndDrop}
                      key={data?.hitId}
                      draggableId={data?.hitId}
                      index={_index}
                    >
                      {(provided) => (
                        <Box
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          key={data?.hitId}
                          className={classNames(
                            classes.hitAccordionWrapper,
                            showOrder && classForLeftMarker,
                            showDelete && classes.removeLeftBorder,
                            showEdit && classes.editButtonSpace,
                          )}
                        >
                          {showDragAndDrop && (
                            <Button
                              className={classNames(classes.iconButton, classes.dragButton)}
                              disableRipple
                              variant="onlyText"
                            >
                              <DragIcon />
                            </Button>
                          )}
                          <Box className={classes.dragBox}>
                            {showOrder && (
                              <Box className={classes.pinDropBox}>
                                {icon}
                                <Typography>{_index + 1}</Typography>
                              </Box>
                            )}
                            <Accordion
                              expanded={
                                data?.dispatchId
                                  ? openedHitAccordionId?.hitId === data?.dispatchId
                                  : data?.hitId === openedHitAccordionId
                              }
                            >
                              <AccordionSummary
                                onClick={() => {
                                  handleAccordionToggle(
                                    data?.visitType === 'dispatch' || !!data?.dispatchId
                                      ? { hitId: data?.dispatchId, isDispatch: true }
                                      : data?.hitId,
                                  );
                                }}
                                expandIcon={<HitAccordionArrow />}
                              >
                                <Box className={classes.summeryEditButton}>
                                  <Box className={classes.summeryAndChip}>
                                    <Box className={classes.accordianFlex}>
                                      <Box className={classes.summeryText}>
                                        {showSelectionCheckBox && (
                                          <Checkbox
                                            key={`${selectedHitsIdsObject?.[data?.[idKey]]}-${hitsList?.length}`}
                                            // onClick={handleCheckboxClick}
                                            onFocus={handleCheckboxFocus}
                                            disabled={
                                              !data?.tour || (splitRunSheet && data?.isVisited)
                                            }
                                            id="mark-emergency-contact"
                                            onChange={(e) => {
                                              handleSelection(e, data);
                                            }}
                                            onClick={(e) => e.stopPropagation()}
                                            icon={<CheckBoxRegularIcon />}
                                            checked={
                                              data?.tour && selectedHitsIdsObject?.[data?.[idKey]]
                                            }
                                            checkedIcon={<CheckedCheckBoxIcon />}
                                            className={classes.checkBoxCustom}
                                          />
                                        )}
                                        <Typography variant="h5">
                                          {' '}
                                          {data?.siteName?.length > 30 ? (
                                            <Tooltip
                                              arrow
                                              title={<>{data?.siteName}</>}
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
                                              {data?.siteName.substring(0, 30) + '...'}
                                            </Tooltip>
                                          ) : (
                                            data?.siteName
                                          )}
                                        </Typography>
                                        {data?.siteId && (
                                          <Box>
                                            <HyperlinkIcon
                                              onClick={(e) => goToSiteDetails(e, data?.siteId)}
                                            />
                                          </Box>
                                        )}
                                        {isDispatched ? (
                                          <>
                                            <Typography variant="h5">
                                              {t('obx.schedules.dutyDetail.dispatchTour')}
                                            </Typography>
                                            <Typography variant="h5" className={classes.grayColor}>
                                              {'•'}
                                            </Typography>
                                            <Typography
                                              variant="body2"
                                              className={classes.grayColor}
                                            >
                                              {timeFormat12h(data?.startsAt, true)}
                                            </Typography>
                                          </>
                                        ) : (
                                          <>
                                            <Typography variant="h5">{'•'}</Typography>
                                            <Typography
                                              variant="body2"
                                              className={classes.grayColor}
                                            >
                                              {`${timeFormat12h(data?.startsAt, true)} - ${timeFormat12h(data?.endsAt, true)}`}
                                            </Typography>
                                            {!data?.tour && (
                                              <Tooltip title={t('obx.runsheet.noTour')} arrow>
                                                <ExclamatoryRoundIcon />
                                              </Tooltip>
                                            )}
                                          </>
                                        )}
                                        {showMissedHits && (
                                          <>
                                            {data?.visitType === 'dispatch' ? (
                                              <Chip
                                                sx={{
                                                  color: 'purple',
                                                  backgroundColor: '#fae4ff',
                                                  '&:hover': {
                                                    backgroundColor: '#fae4ff', // Keep the same background color on hover
                                                    color: 'purple', // Keep the same text color on hover
                                                  },
                                                }}
                                                label="Dispatch"
                                                size="small"
                                                onClick={(e) =>
                                                  goToSiteDetails(
                                                    e,
                                                    data?.siteId,
                                                    'activeTab=duty&value=0',
                                                  )
                                                }
                                              />
                                            ) : !data?.isVisited &&
                                              shiftDetails?.scheduleStatus === 'completed' ? (
                                              <Chip
                                                icon={<MissedHitsIcon />}
                                                label="missed hit"
                                                size="small"
                                                color="error"
                                                onClick={(e) =>
                                                  goToSiteDetails(
                                                    e,
                                                    data?.siteId,
                                                    'activeTab=duty&value=0',
                                                  )
                                                }
                                              />
                                            ) : data?.isReassigned ? (
                                              <Chip
                                                sx={{
                                                  color: 'darkorange',
                                                  backgroundColor: 'lightgoldenrodyellow',
                                                  '&:hover': {
                                                    backgroundColor: 'lightgoldenrodyellow', // Keep the same background color on hover
                                                    color: 'darkorange', // Keep the same text color on hover
                                                  },
                                                }}
                                                label="Reassigned"
                                                size="small"
                                                onClick={(e) =>
                                                  goToSiteDetails(
                                                    e,
                                                    data?.siteId,
                                                    'activeTab=duty&value=0',
                                                  )
                                                }
                                              />
                                            ) : data?.isDisabled ? (
                                              <Chip
                                                sx={{
                                                  color: 'grey',
                                                  backgroundColor: 'lightgrey',
                                                  '&:hover': {
                                                    backgroundColor: 'lightgrey', // Keep the same background color on hover
                                                    color: 'grey', // Keep the same text color on hover
                                                  },
                                                }}
                                                label="Cancelled"
                                                size="small"
                                                onClick={(e) =>
                                                  goToSiteDetails(
                                                    e,
                                                    data?.siteId,
                                                    'activeTab=duty&value=0',
                                                  )
                                                }
                                              />
                                            ) : null}
                                          </>
                                        )}
                                      </Box>
                                      <Box>
                                        {showMissedHits &&
                                          data?.isVisited &&
                                          !data?.tour?.reportId && (
                                            <Tooltip
                                              arrow
                                              title={<>No report found for this visit</>}
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
                                              <Chip
                                                sx={{
                                                  backgroundColor: 'white',
                                                  '&:hover': {
                                                    backgroundColor: 'white', // Keep the same background color on hover
                                                  },
                                                }}
                                                icon={<NoReportFoundToolTipHitAccordianIcon />}
                                                size="small"
                                                onClick={(e) =>
                                                  goToSiteDetails(
                                                    e,
                                                    data?.siteId,
                                                    'activeTab=duty&value=0',
                                                  )
                                                }
                                              />
                                            </Tooltip>
                                          )}
                                      </Box>
                                    </Box>
                                    {data?.hitId === openedHitAccordionId && (
                                      <Typography
                                        variant="overline"
                                        className={`${classes.dateOverLine} ${showSelectionCheckBox ? classes.checkedBoxPadding : ''}`}
                                      >
                                        {dayjsWithStandardOffset(data?.startsAt).format(
                                          'MM/DD/YYYY',
                                        )}{' '}
                                        -{' '}
                                        {dayjsWithStandardOffset(data?.endsAt).format('MM/DD/YYYY')}
                                      </Typography>
                                    )}
                                  </Box>
                                </Box>
                                {showEdit && data?.hitId === openedHitAccordionId && (
                                  <Button
                                    className={classes.editButton}
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      event.preventDefault();
                                      handleShowTourAssignmentDrawer(data);
                                    }}
                                    disableRipple
                                    variant="primary"
                                  >
                                    {t('obx.runsheet.edit')}
                                  </Button>
                                )}
                              </AccordionSummary>

                              <AccordionDetails>
                                {openedHitAccordionId?.hitId ? (
                                  <NewRunsheetHit
                                    hitDetails={hitDetailsData}
                                    fetchingHitLoading={fetchingHitLoading}
                                  />
                                ) : (
                                  <RunsheetHits
                                    hitDetails={hitDetailsData}
                                    refetchData={refetchHitDetails}
                                    fetchingHitLoading={fetchingHitLoading}
                                  />
                                )}
                              </AccordionDetails>
                            </Accordion>
                            {(showDelete || showActions) && (
                              <Box>
                                {/** Show delete button on edit */}
                                {showDelete && (
                                  <Button
                                    className={classes.iconButton}
                                    disableRipple
                                    variant="onlyText"
                                    onClick={() =>
                                      hitsList?.length > 1 && handleDelete(data?.[idKey])
                                    }
                                  >
                                    <DeleteAccordionIcon />
                                  </Button>
                                )}
                                {showActions && (
                                  <Button
                                    className={classes.iconButton}
                                    disableRipple
                                    variant="onlyText"
                                    onClick={() => handleAction(data)}
                                  >
                                    {data?.tour ? (
                                      <Box>
                                        <Tooltip title={t('obx.runsheet.addHit')} arrow>
                                          <HitPlusIcon />
                                        </Tooltip>
                                      </Box>
                                    ) : (
                                      <Box>
                                        <Tooltip title={t('obx.runsheet.noTour')} arrow>
                                          <ExclamationMarkIcon />
                                        </Tooltip>
                                      </Box>
                                    )}
                                  </Button>
                                )}
                              </Box>
                            )}
                          </Box>
                        </Box>
                      )}
                    </Draggable>
                  );
                })}
              </Box>
            );
          }}
        </Droppable>
      </DragDropContext>

      {[DRAWER_TYPE.TOUR_ASSIGNMENT, DRAWER_TYPE.TOUR_TEMPLATE_PATROL].includes(
        showDrawer?.open,
      ) && (
        <PatrolAssignTour
          drawerData={{
            type: showDrawer?.open,
            hitId: drawerHitDetail?.hitId,
            siteId: drawerHitDetail?.siteId,
          }}
          closeSideDrawer={showSideDrawer('')}
          changeOnlyDrawerType={changeOnlyDrawerType}
          callbackUponAssignment={getHitDetails}
        />
      )}
    </Box>
  );
};

HitsAccordionListing.propTypes = {
  key: PropTypes.string,
  idKey: PropTypes.string,
  handleDelete: PropTypes.func.isRequired,
  hitsLoading: PropTypes.bool,
  state: PropTypes.shape({
    runsheetName: PropTypes.string,
    startsAt: PropTypes.object,
    startDate: PropTypes.object,
    endsAt: PropTypes.object, // Ensure this line is present
    startEndLocation: PropTypes.object,
    dutyDay: PropTypes.array,
    visitSet: PropTypes.array,
  }).isRequired,
  dispatch: PropTypes.function,
  errorMessages: PropTypes.object,
  setErrorMessages: PropTypes.func,
  hitsList: PropTypes.array,
  showDragAndDrop: PropTypes.bool,
  showOrder: PropTypes.bool,
  showDelete: PropTypes.bool,
  showSelectionCheckBox: PropTypes.bool,
  showMissedHits: PropTypes.bool,
  selectAllHits: PropTypes.bool,
  showEdit: PropTypes.bool,
  showActions: PropTypes.bool,
  handleAction: PropTypes.func,
  setChecked: PropTypes.func,
  visitedPoints: PropTypes.object,
  showVisitedPoints: PropTypes.bool,
  splitRunSheet: PropTypes.bool,
  fetchRunsheetDetails: PropTypes.func,
  unfilteredHitList: PropTypes.array,
  getHits: PropTypes.func,
  isDispatched: PropTypes.bool,
  searchTerm: PropTypes.string,
  shiftDetails: PropTypes.object,
};

HitsAccordionListing.defaultProps = {
  hitsLoading: false,
  idKey: '_id',
  splitRunSheet: false,
  state: {
    runsheetName: '',
    startsAt: {},
    startDate: {},
    endsAt: {},
    startEndLocation: {},
    dutyDay: [],
    visitSet: [],
  },
  shiftDetails: {},
  handleDelete: () => {},
  isDispatched: false,
  dispatch: () => {},
  errorMessages: {},
  setErrorMessages: () => {},
  hitsList: {},
  showDragAndDrop: false,
  showOrder: false,
  showDelete: false,
  showSelectionCheckBox: false,
  showMissedHits: false,
  selectAllHits: null,
  showEdit: false,
  showActions: false,
  handleAction: () => {},
  setChecked: () => {},
  visitedPoints: {},
  showVisitedPoints: false,
  fetchRunsheetDetails: () => {},
  unfilteredHitList: [],
  searchTerm: '',
};

export default HitsAccordionListing;
