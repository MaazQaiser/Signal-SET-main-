import { Box, Button, Checkbox, InputLabel } from '@mui/material';
import LocationPlaceHolder from 'assets/images/LocationPlaceHolder.jpeg';
import { ReactComponent as EditLocationIcon } from 'assets/svg/EditLocationIcon.svg';
import { ReactComponent as UnassignedLocationIcon } from 'assets/svg/UnassignedLocationIcon.svg';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import SearchComponentWithQuery from 'src/app/components/common/searchWithQuery';
import { ReactComponent as CheckBoxRegularIcon } from 'src/assets/svg/BlueCheckboxIcon.svg';
import { ReactComponent as CheckBoxCheckedIcon } from 'src/assets/svg/BlueCheckedIcon.svg';
import { isObjectEmpty } from 'src/helper/utilityFunctions';
import useGetHits from 'src/hooks/useGetHits';
import { UPDATE_RUNSHEET_STATE } from 'src/redux/reducers/runSheetReducer';
import { CONST_RE_ORDER_HITS } from 'src/utils/constants';

import HitsAccordionListing from '../hitsAccordionListing';
import LocationModal from '../locationModal';
import { useStyles } from './SelectHitsTab';
const SelectHitsTab = (props) => {
  const {
    state,
    showStartEnd,
    showSelectAll,
    showSearch,
    activeStep,
    dispatch,
    isSameDate,
    handleBack,
  } = props;
  const { t } = useTranslation();

  const { hitsList, hitsLoading, getHits } = useGetHits(state);
  const classes = useStyles();

  const [openModal, setOpenModal] = useState(false);
  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);
  const [checked, setChecked] = useState(null);

  const handleButtonClick = () => {
    setChecked((prevChecked) => !prevChecked);
  };

  const [queryString, setQueryString] = useState('');

  const handleSearch = (e) => {
    setQueryString(e.target.value);
  };

  useEffect(() => {
    if (hitsList?.length) return;
    // Passing true for appending runsheet name to payload
    getHits(true, handleBack);
    if (isSameDate) setChecked(false);
  }, []);

  /**
   * @description Delete selected hit
   * @param {*} id
   */
  const handleDelete = (id) => {
    dispatch({
      type: UPDATE_RUNSHEET_STATE,
      payload: { key: 'visitSet', value: state?.visitSet?.filter((data) => data?._id !== id) },
    });
  };

  const filteredHitList =
    activeStep !== CONST_RE_ORDER_HITS
      ? queryString
        ? hitsList?.filter((data) =>
            data?.siteName?.toLowerCase()?.includes(queryString.toLowerCase()),
          )
        : hitsList
      : state?.visitSet;

  const finalProps = {
    ...props,
    hitsList: filteredHitList,
    unfilteredHitList: hitsList.filter((data) => data?.tour),
    hitsLoading,
    selectAllHits: checked,
    setChecked,
    handleDelete,
    fetchRunsheetDetails: () => getHits(true),
  };
  return (
    <>
      <Box className={classes.hitsWrapper}>
        {/** show location selection */}
        {showStartEnd && (
          <Box className={classes.locationButtons}>
            <InputLabel htmlFor="runsheetName">
              {t('obx.runsheet.startingEndingLocation')}
            </InputLabel>
            {/* NOTE::::: there are two buttons one for edit and one for add  */}
            {isObjectEmpty(state?.startEndLocation) ? (
              <Button
                onClick={handleOpenModal}
                disableRipple
                startIcon={<UnassignedLocationIcon />}
                className={classes.redButton}
                type="button"
                variant="destructive"
              >
                {t('obx.runsheet.addStartingEndingLocation')}
              </Button>
            ) : (
              <Button
                onClick={handleOpenModal}
                disableRipple
                endIcon={<EditLocationIcon />}
                className={classes.editButton}
                type="button"
                variant="destructive"
              >
                <Box component="span" className={classes.editButtonInner}>
                  <img src={LocationPlaceHolder} alt="" /> {state?.startEndLocation?.name}
                </Box>
              </Button>
            )}
          </Box>
        )}
        {/** Show search */}
        <Box className={classes.searchSelected}>
          {showSearch && (
            <SearchComponentWithQuery
              onSearch={handleSearch}
              placeHolder={t('obx.runsheet.search')}
            />
          )}
          {/** show select all button */}
          {showSelectAll && (
            <Button
              disableRipple
              className={classes.selectAll}
              type="button"
              variant="secondaryBlue"
              onClick={handleButtonClick}
            >
              <Checkbox
                id="mark-emergency-contact"
                icon={<CheckBoxRegularIcon />}
                checkedIcon={<CheckBoxCheckedIcon />}
                className={classes.checkBoxCustom}
                checked={checked}
                onChange={handleButtonClick} // Optional: handle checkbox click separately if needed
              />
              {t('obx.runsheet.selectAll')}
            </Button>
          )}
        </Box>

        <Box className={classNames(classes.accordionWrapper, 'innerScrollBar')}>
          <HitsAccordionListing {...finalProps} />
        </Box>
        <LocationModal openModal={openModal} handleCloseModal={handleCloseModal} {...props} />
      </Box>
    </>
  );
};

SelectHitsTab.propTypes = {
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
  isSameDate: PropTypes.bool,
  handleBack: PropTypes.func,
};
export default SelectHitsTab;
