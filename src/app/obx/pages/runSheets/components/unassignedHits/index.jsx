import { Box, Button } from '@mui/material';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import LoaderComponent from 'src/app/components/common/loader';
import { ReactComponent as ArrowBack } from 'src/assets/svg/ArrowRightBlack.svg';
import useGetHits from 'src/hooks/useGetHits';
import { ADDED_HIT, SET_ENTIRE_STATE } from 'src/redux/reducers/runSheetReducer';
import { toastSettings } from 'src/utils/constants';
import { DRAWER_TYPE } from 'src/utils/constants/schedules';

import PatrolAssignTour from '../../../sites/detail/components/jobs/PatrolAssignTour';
import HitsAccordionListing from '../hitsAccordionListing';
import NoTourTemplateModal from '../noTemplateAssignedModal';
import { useStyles } from './UnassignedHits';

const UnassignedHits = ({ state, dispatch, goBack, searchTerm = '' }) => {
  const { t } = useTranslation();
  const _NA = t('commonText.nA');
  const classes = useStyles();
  const { hitsList, getHits, setHitsList, hitsLoading } = useGetHits(state, true);
  const [hitDetails, setHitDetails] = useState(null);
  const [openNoTourTemplateModal, setOpenNoTourTemplateModal] = useState(false);

  useEffect(() => {
    if (hitsList?.length) return;
    getHits();
  }, []);

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

  const handleShowTourAssignmentDrawer = (hitId) => {
    showSideDrawer(DRAWER_TYPE.TOUR_ASSIGNMENT)({
      id: hitId,
    });
  };

  const handleAction = async (hit) => {
    if (!hit?.tour) {
      setHitDetails(hit);
      setOpenNoTourTemplateModal(true);
      return;
    }
    try {
      let finalNewPayloadOnAddingHit = {
        ...state,
        visitSet: [...state.visitSet, { ...hit, status: ADDED_HIT }],
        pathData: [...state.pathData, { ...hit, status: ADDED_HIT }],
      };
      dispatch({
        type: SET_ENTIRE_STATE,
        payload: finalNewPayloadOnAddingHit,
      });

      const filteredHitList = hitsList.filter((hitItem) => hitItem.hitId !== hit?.hitId);
      setHitsList(filteredHitList);
      toast.success(t('obx.runsheet.hitAdded'), {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    } catch (error) {
      toast.error(error?.message, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  const handleAddTemplateAction = () => {
    setOpenNoTourTemplateModal(false);
    handleShowTourAssignmentDrawer(hitDetails?.hitId);
  };

  const filteredHits = searchTerm
    ? hitsList.filter((hits) =>
        hits.siteName?.trim()?.toLowerCase()?.includes(searchTerm?.toLowerCase()),
      )
    : hitsList;

  return (
    <Box>
      {hitsLoading && <LoaderComponent />}
      <Box>
        <Button onClick={goBack}>
          <ArrowBack />
        </Button>{' '}
        {t('obx.runsheet.addUnassignedHitsToRunsheet')}
      </Box>
      <Box className={classes.accordionWrapper}>
        <HitsAccordionListing
          state={state}
          dispatch={dispatch}
          hitsList={filteredHits}
          showActions={true}
          handleAction={handleAction}
          getHits={getHits}
        />
      </Box>
      <NoTourTemplateModal
        openModal={openNoTourTemplateModal}
        handleCloseModal={() => setOpenNoTourTemplateModal(false)}
        handleSubmit={handleAddTemplateAction}
      />
      {[DRAWER_TYPE.TOUR_ASSIGNMENT, DRAWER_TYPE.TOUR_TEMPLATE_PATROL].includes(
        showDrawer?.open,
      ) && (
        <PatrolAssignTour
          drawerData={{
            type: showDrawer?.open,
            hitId: hitDetails?.hitId,
            siteId: hitDetails?.siteId,
          }}
          closeSideDrawer={showSideDrawer('')}
          changeOnlyDrawerType={changeOnlyDrawerType}
          callbackUponAssignment={getHits}
          canDelete={false}
        />
      )}
    </Box>
  );
};

UnassignedHits.propTypes = {
  state: PropTypes.object,
  dispatch: PropTypes.func,
  searchTerm: PropTypes.string,
  goBack: PropTypes.func,
};

export default UnassignedHits;
