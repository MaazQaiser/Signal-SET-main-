import { Box, InputLabel, Typography } from '@mui/material';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { default as React } from 'react';
import { useTranslation } from 'react-i18next';
import { UPDATE_RUNSHEET_STATE } from 'src/redux/reducers/runSheetReducer.js';

import HitsAccordionListing from '../../hitsAccordionListing/index.jsx';
import { useStyles } from './reOrder.js';
const SplitReOrderHits = (props) => {
  const { state, showStartEnd, showSelectAll, showSearch, activeStep, dispatch } = props;
  const { t } = useTranslation();
  /**
   * @description Delete selected hit
   * @param {*} id
   */
  const handleDelete = (id) => {
    dispatch({
      type: UPDATE_RUNSHEET_STATE,
      payload: { key: 'visitSet', value: state?.visitSet?.filter((data) => data?.hitId !== id) },
    });
  };
  //   const { hitsList, hitsLoading, getHits } = useGetHits(state);
  console.log({ state, showStartEnd, showSelectAll, showSearch, activeStep, dispatch });
  const classes = useStyles();
  const finalProps = {
    ...props,
    hitsList: state?.visitSet,
    showSelectionCheckBox: false,
    handleDelete: handleDelete,
    idKey: 'hitId',
  };
  return (
    <Box className={classes.hitsSplitWrapper}>
      <Box>
        <Typography variant="h5">{t('obx.runsheet.reorderHits')}</Typography>
        <InputLabel htmlFor="runsheetName">{t('obx.runsheet.reorderHitsText')}</InputLabel>
      </Box>
      <Box className={classNames(classes.accordionWrapper, 'innerScrollBar')}>
        <HitsAccordionListing {...finalProps} />
      </Box>
    </Box>
  );
};

SplitReOrderHits.propTypes = {
  activeStep: PropTypes.string,
  state: PropTypes.shape({
    runsheetName: PropTypes.string,
    startsAt: PropTypes.string,
    startDate: PropTypes.string,
    endsAt: PropTypes.string,
    startEndLocation: PropTypes.object,
    dutyDay: PropTypes.array,
    visitSet: PropTypes.array,
  }).isRequired,
  dispatch: PropTypes.function,
  showStartEnd: PropTypes.bool || undefined,

  showSearch: PropTypes.bool || undefined,
  showSelectAll: PropTypes.bool || undefined,
  errorMessages: PropTypes.object,
  setErrorMessages: PropTypes.func,
};
export default SplitReOrderHits;
