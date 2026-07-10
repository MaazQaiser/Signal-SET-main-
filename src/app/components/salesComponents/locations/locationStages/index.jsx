import { Box, Skeleton, Typography } from '@mui/material';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Tooltip from '@mui/material/Tooltip';
import { ReactComponent as ArrowRight } from 'assets/svg/arrow-right.svg';
import { ReactComponent as StagesArrows } from 'assets/svg/stagesarrows.svg';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CustomDropDown from 'src/app/components/common/customDropDown/index.jsx';
import { ACL_PROPERTIES_UPDATE } from 'src/app/router/constant/SALESMODULE.jsx';
import { AddIcon } from 'src/assets/svg/index.jsx';
import RenderIfHasPermission from 'src/hoc/renderIfHasPermission.jsx';
import transformArrayForOptions from 'src/utils/array/transformArrayForOptions.js';
import userHasPermission from 'src/utils/auth/userHasPermission.jsx';
import { stageStatus } from 'src/utils/constants/index.js';

import { useStyles } from './locationStages.js';
import { stepperDefaultStage } from './stage.constant.js';

const LocationStages = ({
  data,
  updateLocation,
  fetchStageOptions,
  // stageLoading,
  stageOptions,
  setOptions,
  notQualified,
  isLoading,
}) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currAndcomingStage, setcurrAndcomingStage] = useState({
    current: {},
    upcoming: {},
  });
  const [stageToOpen, setStageToOpen] = useState({});
  const [stagesModelData, setStagesModelData] = useState(stepperDefaultStage);
  const [selectedhubSpotStage, setSelectedhubSpotStage] = useState({});
  const disabled = Object.keys(selectedhubSpotStage).length === 0 || loading;
  const handleOpen = (stage) => {
    /**
     * Empty previous hubspot stages selected for stage
     */
    setOptions((prevOptions) => ({
      ...prevOptions,
      stages: [],
    }));
    setSelectedhubSpotStage({});
    /**
     * get upcoming stage which user want to complete
     * if user click Mark stage as complete button then set current stage as selectedStage
     */
    let selectedStage;
    if (stage) selectedStage = stagesModelData.find((detail) => detail.value === stage.value);
    else
      selectedStage = stagesModelData
        .slice()
        .find((detail) => detail.status === stageStatus.PENDING);

    setStageToOpen(stage);

    /**
     * get the last completed stage from the stepper
     * set this as previous stage in model
     */
    const currentStage = stagesModelData.find((detail) => detail.status === stageStatus.CURRENT);

    if (stage?.value === currentStage?.value) return;

    fetchStageOptions(stage ? stage.value : selectedStage.value);
    setcurrAndcomingStage((prevOptions) => ({
      ...prevOptions,
      upcoming: selectedStage,
      current: currentStage,
    }));
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleConfirm = async () => {
    setLoading(true);
    const payload = {
      locationStage: currAndcomingStage?.upcoming?.value,
      leadStageId: selectedhubSpotStage?.id,
    };

    await updateLocation(payload);
    setOpen(false);
    setLoading(false);
  };

  const inputChangedHandler = (event) => {
    setSelectedhubSpotStage(event.target.value);
  };

  const getTooltipContent = (stage) => {
    const item = data?.stepperDetails?.find((detail) => detail?.value === stage?.value);
    return item?.description;
  };

  useEffect(() => {
    if (data && Object.keys(data).length && stagesModelData.length) {
      const updatedStagesModelData = stagesModelData?.map((button) => {
        const stepperDetail = data?.stepperDetails.find((detail) => detail.value === button.value);

        if (stepperDetail) {
          return {
            ...button,
            value: stepperDetail.value,
            status: stepperDetail.status,
          };
        }

        return button; // If no match is found, return the original button
      });
      setStagesModelData(updatedStagesModelData);
    }
  }, [data]);

  useEffect(() => {
    if (stageOptions.length) {
      const currentStage = data?.stepperDetails?.find(
        (detail) => detail.status === stageStatus.CURRENT,
      );

      const upcomingStageDialog =
        stageOptions?.find((o) => o.value === stageToOpen?.value)?.description || '';
      setcurrAndcomingStage((prevOptions) => ({
        ...prevOptions,
        upcoming: { ...currAndcomingStage?.upcoming, description: upcomingStageDialog },
        current: currentStage,
      }));
    }
  }, [stageOptions]);

  return (
    <>
      <Box className={classes.stagesHeader}>
        <Typography variant="h5" className={classes.stagesHeading}>
          {t('sales.locations.locationStages')}
        </Typography>
        <RenderIfHasPermission name={ACL_PROPERTIES_UPDATE}>
          {notQualified && (
            <Button
              className={classes.noPadding}
              variant="onlyText"
              disableRipple
              onClick={() => handleOpen(null)}
              startIcon={<AddIcon className={classes.whiteBtn} />}
            >
              {t('sales.locations.markCompleted')}
            </Button>
          )}
        </RenderIfHasPermission>
      </Box>
      {isLoading ? (
        <Box className={classes.stagesStepperSkeletonWrapper}>
          <Skeleton
            animation="wave"
            width={'25%'}
            variant="rounded"
            height={40}
            className={classes.barSkeleton}
          />
          <Skeleton
            animation="wave"
            width={'25%'}
            variant="rounded"
            height={40}
            className={classes.barSkeleton}
          />
          <Skeleton
            animation="wave"
            width={'25%'}
            variant="rounded"
            height={40}
            className={classes.barSkeleton}
          />
          <Skeleton
            animation="wave"
            width={'25%'}
            variant="rounded"
            height={40}
            className={classes.barSkeleton}
          />
        </Box>
      ) : (
        <Box className={classes.stageWraperr}>
          {data?.stepperDetails?.map((stage, _i) => (
            <Tooltip
              className={classes.toolTipBox}
              title={getTooltipContent(stage)}
              key={stage?.name}
              placement="bottom"
              arrow
            >
              <Button
                className={`${classes.defaultStage} ${
                  stage?.status === stageStatus.COMPLETED
                    ? classes.checked
                    : stage?.status === stageStatus.CURRENT
                      ? classes.current
                      : ''
                }`}
                disableRipple
                // disabled={
                // stage?.status === stageStatus.COMPLETED ||
                // stage?.status === stageStatus.CURRENT
                // stage?.value === stageValues.UNQUALIFIED ||
                // (stage?.name === stageName.QUALIFIED && stage?.status === stageStatus.COMPLETED)
                // }
                disabled={!userHasPermission(ACL_PROPERTIES_UPDATE)}
                onClick={() => handleOpen(stage)}
              >
                {stage?.status === stageStatus.COMPLETED ? (
                  <>
                    {' '}
                    <StagesArrows />{' '}
                    {stage?.value ? t(`sales.locations.${stage.value}`) : stage?.name}
                  </>
                ) : stage?.value ? (
                  t(`sales.locations.${stage.value}`)
                ) : (
                  stage?.name
                )}
              </Button>
            </Tooltip>
          ))}
          <Dialog className={classes.stageModal} open={open}>
            <Box className={classes.modalTopArea}>
              <Typography className={classes.modalHeading}>
                {t('sales.locations.askProcessed')}
              </Typography>
              <Box className={classes.modalTypoBox}>
                <Box className={classes.modalTextBody}>
                  <Typography variant="body3" className={classes.modalTextUpper}>
                    {currAndcomingStage?.upcoming?.value
                      ? t(`sales.locations.${currAndcomingStage.upcoming.value}`)
                      : currAndcomingStage?.upcoming?.name}
                  </Typography>
                  <Typography variant="body3" className={classes.modalText}>
                    {currAndcomingStage?.upcoming?.description}
                    {/*{stageOptions?.[0]?.description}*/}
                  </Typography>
                </Box>
              </Box>
              <Box display="flex" alignItems="center">
                <Box className={classes.inlineBoxIcons}>
                  {currAndcomingStage?.current?.icon}
                  <Typography className={classes.modalTextBlue}>
                    {currAndcomingStage?.current?.value
                      ? t(`sales.locations.${currAndcomingStage.current.value}`)
                      : currAndcomingStage?.current?.name}
                  </Typography>
                </Box>
                <ArrowRight className={classes.arrowIcons} />
                <Box className={classes.inlineBoxIcons}>
                  {currAndcomingStage?.upcoming?.icon}
                  <Typography className={classes.modalTextBlue}>
                    {currAndcomingStage?.upcoming?.value
                      ? t(`sales.locations.${currAndcomingStage.upcoming.value}`)
                      : currAndcomingStage?.upcoming?.name}
                  </Typography>
                </Box>
              </Box>
              <Box className={classes.stageDropdwon}>
                <Typography className={classes.spaceBelow} variant="h5">
                  {t('sales.locations.chooseMap')}
                </Typography>
                <CustomDropDown
                  name="level"
                  id="level"
                  placeHolder={t('commonText.dropDown.stagePlaceholder')}
                  options={transformArrayForOptions(stageOptions, 'name', 'id')}
                  selectedValues={selectedhubSpotStage || {}}
                  handleChange={inputChangedHandler}
                  className={classes.borderLessDrop}
                  customDropdownOptionsListClass={classes.dropdwonValues}
                  customDropdownSelectHeaderCusrom={classes.dropheader}
                  bordered
                  showDescription={false}
                />
              </Box>
            </Box>
            <Box className={classes.modalBottomArea}>
              <Button variant="secondaryGrey" onClick={handleClose}>
                {t('sales.no')}
              </Button>
              <Button disabled={disabled} variant="primary" onClick={handleConfirm}>
                {t('sales.yes')}
              </Button>
            </Box>
          </Dialog>
        </Box>
      )}
    </>
  );
};

LocationStages.propTypes = {
  data: PropTypes.object, // Adjust the type accordingly based on the expected data structure
  updateLocation: PropTypes.func,
  fetchStageOptions: PropTypes.func,
  // stageLoading: PropTypes.bool,
  stageOptions: PropTypes.array, // Adjust the type accordingly based on the expected data structure
  setOptions: PropTypes.func,
  notQualified: PropTypes.bool,
  isLoading: PropTypes.bool,
};

export default LocationStages;
