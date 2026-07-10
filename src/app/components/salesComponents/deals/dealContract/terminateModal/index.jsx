import { InputLabel, TextField } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import ResponsiveDatePickers from 'commonComponents/datePicker';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import { useCallback, useState } from 'react';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import ModalComponent from 'src/app/components/common/modal';
import RequiredAsterik from 'src/app/components/common/requiredAsterik';
import { getDisplayConfiguration } from 'src/redux/store/slices/regionalCountryConfiguration';
import { joiValidateErrors } from 'src/utils/formValidator/formValidator.requiredCheck';
import { convertMMDDYYYYToDayJsDate, formatDayJsDate } from 'src/utils/passTime/time';

import { useStyles } from './TerminateStyle';

/**
 * RejectModal is a modal component for cloning entities.
 *
 * @param {Boolean} open - Controls the visibility of the modal.
 * @param {Function} handleCancelButton - Function to close the modal.
 * @param {Function} handleConfirmButton - Function to perform the confirm operation.
 * @return Component
 */

const TerminateModal = ({
  open,
  showReason,
  handleCancelButton,
  handleConfirmButton,
  disabled,
  title,
  icon,
  text,
  confirmButtonText,
  cancelButtonText,
  contractDetail,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { dateFormat } = useSelector(getDisplayConfiguration);

  const [formData, setFormData] = useState({ terminationDate: dayjs().add(1, 'day'), reason: '' });
  const [errorMessages, setErrorMessages] = useState({});

  const removeErrorKey = (name) => {
    const { [name]: _, ...rest } = errorMessages;
    setErrorMessages(rest);
  };

  /**
   * common function to update data to formDat object
   */
  const updateFormHandler = useCallback(
    (name, value) => {
      setFormData((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    },
    [setFormData],
  );

  const inputChangedHandler = (event) => {
    const { name, value } = event.target;

    if (value) {
      const { [name]: _key, ...rest } = errorMessages;
      setErrorMessages(rest);
    }
    updateFormHandler(name, value);
  };

  const handleDateChange = (customEvent) => {
    const { name, value } = customEvent;
    const isValidDate = !isNaN(value?.['$d']);
    if (isValidDate) {
      removeErrorKey(name);
    }

    updateFormHandler(name, isValidDate ? value : null);
  };

  const onConfirm = async () => {
    let payload = {};
    if (showReason) {
      payload = {
        ...formData,
        terminationDate: formatDayJsDate(formData?.terminationDate, 'date'),
      };
      const errors = await joiValidateErrors({
        data: payload,
        t,
      });

      if (errors) {
        setErrorMessages(errors);
        return;
      }
    }

    handleConfirmButton(showReason ? payload : null);
  };

  const terminateModalBody = (
    <Box className={classes.rejectModal}>
      {icon}
      <Box className={classes.rejectModalContent}>
        <Typography variant="h4" className={classes.rejectModalTitle}>
          {title}
        </Typography>
        <Typography variant="body2" className={classes.rejectModalDescription}>
          {text}
        </Typography>
      </Box>

      {showReason && (
        <Box className={classes?.rejectModalField}>
          <InputLabel>{t('sales.contract.terminationDate')}</InputLabel>
          <ResponsiveDatePickers
            value={
              formData.terminationDate ? convertMMDDYYYYToDayJsDate(formData.terminationDate) : null
            }
            onChange={(value) => handleDateChange({ name: 'terminationDate', value })}
            minDate={convertMMDDYYYYToDayJsDate(dayjs().add(1, 'day'))}
            // maxDate={contractDetail?.endDate}
            maxDate={
              contractDetail?.endDate
                ? convertMMDDYYYYToDayJsDate(contractDetail?.endDate).subtract(1, 'd')
                : null
            }
            placeholder={`${t('sales.contract.selectTerminationDate')}`}
            format={dateFormat}
            inputFormat={dateFormat}
            error={!!errorMessages?.terminationDate}
            helperText={errorMessages?.terminationDate}
            className={classes.createdDatePicker}
          />
        </Box>
      )}

      {showReason && (
        <Box className={classes.rejectModalField}>
          <InputLabel htmlFor="reason">
            {t('sales.deals.reason')}
            <RequiredAsterik />
          </InputLabel>
          <TextField
            placeholder={t('sales.deals.addReason')}
            multiline
            required
            name="reason"
            id="reason"
            value={formData.reason}
            onChange={inputChangedHandler}
            className={classes.rejectModalTextField}
            error={!!errorMessages.reason}
            helperText={errorMessages.reason}
            inputProps={{ maxLength: 225 }}
          />
        </Box>
      )}
      <Box className={classes.rejectModalActions}>
        <Button disabled={disabled} variant="secondaryGrey" onClick={handleCancelButton}>
          {cancelButtonText}
        </Button>
        <Button disabled={disabled} variant="destructive" onClick={onConfirm}>
          {confirmButtonText}
        </Button>
      </Box>
    </Box>
  );

  return (
    <>
      <ModalComponent open={open} handleClose={handleCancelButton} body={terminateModalBody} />
    </>
  );
};

TerminateModal.propTypes = {
  open: PropTypes.bool,
  showReason: PropTypes.bool,
  handleCancelButton: PropTypes.func,
  handleConfirmButton: PropTypes.func,
  disabled: PropTypes.bool,
  title: PropTypes.string,
  icon: PropTypes.icon,
  text: PropTypes.text,
  confirmButtonText: PropTypes.text,
  cancelButtonText: PropTypes.text,
  contractDetail: PropTypes.object,
};

TerminateModal.defaultProps = {
  open: false,
};

export default TerminateModal;
