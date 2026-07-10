import { Box, Button, Typography } from '@mui/material';
import { ReactComponent as EditIcon } from 'assets/svg/edit.svg';
import { ReactComponent as RepeatIcon } from 'assets/svg/repeat.svg';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import SweetAlertModal from 'src/app/components/common/sweetAlertModal';
import { followUpActionTypeConstant } from 'src/app/sales/pages/deals/deals.constant';
import { ReactComponent as WarningIcon } from 'src/assets/svg/warning.svg';
import RenderIfHasPermission from 'src/hoc/renderIfHasPermission';
import { getDisplayConfiguration } from 'src/redux/store/slices/regionalCountryConfiguration';
import { markFollowUpDone } from 'src/services/location.service';
import { toastSettings } from 'src/utils/constants';
import { formatISOTimestampToDate } from 'src/utils/date';

import { useStyles } from './followUp.styles';

const FollowUp = ({
  followUp,
  maxLength,
  handleOpenEditModalFollowUp,
  id,
  data,
  setData,
  module,
  setFormData,
  followUpEmptyState,
  permission = { updatePermission: null },
}) => {
  const { dateFormat, timePrecision } = useSelector(getDisplayConfiguration);
  const [showFullText, setShowFullText] = useState(false);
  const classes = useStyles();
  const [showModal, setShowModal] = useState(false);
  const { t } = useTranslation();

  const handleCloseModal = () => {
    setShowModal(false);
  };
  const handleOpenModal = () => {
    setShowModal(true);
  };

  const toggleTextVisibility = () => {
    setShowFullText(!showFullText);
  };

  const displayedText = showFullText ? followUp?.reason : followUp?.reason?.slice(0, maxLength);

  const handleMarkFollowUpDone = async () => {
    try {
      try {
        const response = await markFollowUpDone(module, id, followUp?.id);
        if (response?.statusCode === 200) {
          /**
           * update follow-up object in side location detail
           * set followUp as null
           */
          setData({
            ...data,
            followUp: null,
          });

          toast.success(response.message, {
            position: 'top-right',
            autoClose: toastSettings.AUTO_CLOSE,
          });
          /**
           * reset the form state
           */
          setFormData(followUpEmptyState);
          handleCloseModal();
        }
      } catch (error) {
        /**
         * show error
         */
        toast.error(error?.message, {
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
      }
    } catch (error) {
      /**
       * show error
       */
      toast.error(error?.message, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  return (
    <Box className={classes.followUp}>
      <Box className={classes.followUpHeader}>
        <Box className={classes.followUpLeft}>
          <Box className={classes.followUpRepeatIcon}>
            <RepeatIcon />
          </Box>
          <Typography className={classes.followUpTitle} variant="subtitle2">
            {t('sales.deals.followUpModalHeaderText')}{' '}
            {formatISOTimestampToDate(followUp?.endTime, dateFormat)} •
            {` ${formatISOTimestampToDate(followUp?.startTime, timePrecision)} - ${formatISOTimestampToDate(followUp?.endTime, timePrecision)}`}
          </Typography>
        </Box>
        <RenderIfHasPermission name={permission?.updatePermission}>
          <EditIcon
            onClick={() => handleOpenEditModalFollowUp(followUpActionTypeConstant.EDIT)}
            className={classes.followUpEdit}
          />
        </RenderIfHasPermission>
      </Box>
      <Box className={classes.followUpBody}>
        <Typography className={classes.followUpBodyText} variant="body3">
          {displayedText}{' '}
        </Typography>
        {followUp?.reason?.length > maxLength && (
          <Button
            disableRipple
            variant="onlyText"
            className={classes.followUpMoreLessBtn}
            onClick={toggleTextVisibility}
          >
            {showFullText
              ? t('sales.deals.followUpModalButtonLess')
              : t('sales.deals.followUpModalButtonMore')}
          </Button>
        )}
      </Box>
      <RenderIfHasPermission name={permission?.updatePermission}>
        <Button
          onClick={handleOpenModal}
          className={classes.followUpDoneBtn}
          variant="secondaryGrey"
        >
          {t('sales.deals.followUpModalButtonText')}
        </Button>
      </RenderIfHasPermission>

      <SweetAlertModal
        type="warning"
        customClass={{
          confirmButton: classes.sweetAlertConfirmBlueButton,
        }}
        title={t('sales.deals.followUpDonetitle')}
        text={t('sales.deals.followUpDoneDescription')}
        confirmButtonText={t('sales.deals.followUpDoneButtonText')}
        cancelButtonText={t('links.cancel')}
        show={showModal}
        icon={<WarningIcon />}
        handleConfirmButton={handleMarkFollowUpDone}
        handleCancelButton={handleCloseModal}
        reverseButtons={true}
      />
    </Box>
  );
};

FollowUp.propTypes = {
  followUp: PropTypes.object,
  maxLength: PropTypes.number,
  handleOpenEditModalFollowUp: PropTypes.func,
  id: PropTypes.number,
  data: PropTypes.object,
  setData: PropTypes.func,
  module: PropTypes.string,
  setFormData: PropTypes.func,
  followUpEmptyState: PropTypes.object,
  permission: PropTypes.object,
};

export default FollowUp;
