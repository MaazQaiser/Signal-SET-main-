import { Box, InputLabel, TextField } from '@mui/material';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { makeStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import * as React from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import ResponsiveDatePickers from 'src/app/components/common/datePicker';
import { exportCompanies } from 'src/services/company.service';
import { toastSettings } from 'src/utils/constants';

import formValidatorJoi from '../../../../../utils/formValidator/formValidator.requiredCheck';
import { exportDataEntities } from '../../constant/exportEntities.constant';
const useStyles = makeStyles((theme) => ({
  exportWrapper: {
    width: '299px',
    borderRadius: '8px',
    backgroundColor: `${theme.palette.surfaceWhite}`,
  },
  exportHeader: {
    padding: '23px 16px 15px 16px',
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
  },
  exportDatePicker: {
    padding: '12px 16px 16px 16px',
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
  },
  exportEmail: {
    padding: '11.5px 16px',
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
  },
  inputField: {
    '& .MuiInputBase-root': {
      height: '44px',
      margin: '6px 0px 8px 0px',
    },
  },
  smallText: {
    '&.MuiTypography-root': {
      color: `${theme.palette.textPlaceholder}`,
    },
  },
  mainHeading: {
    '&.MuiTypography-root': {
      color: `${theme.palette.textSecondary1}`,
    },
  },

  marginBelow: {
    marginBottom: '12px',
  },
  popoverButtons: {
    display: 'flex',

    justifyContent: 'center',
    alignItems: 'center',
    padding: '16px 16px 20px 16px',
    gap: '12px',
    '& .MuiButtonBase-root': {
      width: '100%',
    },
  },
}));

const queryKeys = {
  email: 'email',
};

const emptyState = {
  startDate: null,
  endDate: null,
  email: null,
};
const CompaniesExportButton = ({ handleClose }) => {
  const { t } = useTranslation();
  const classes = useStyles();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(emptyState);
  const [errorMessages, setErrorMessages] = useState({});

  const handleMultipleSelectedValues = async (event, field) => {
    /**
     * for input and text areas
     */
    setFormData((prevState) => ({
      ...prevState,
      [field]: event.target.value,
    }));
  };

  const handleExportCompanies = async () => {
    setLoading(true);
    const errors = await formValidatorJoi(formData, t);
    if (errors && Object.keys(errors).length) {
      setErrorMessages(errors);
      setLoading(false);
      return;
    }
    /**
     * empty errors incase of all fields are filled
     */
    setErrorMessages({});
    try {
      const payload = {
        ...formData,
        entity: exportDataEntities.Company,
      };
      const exportResp = await exportCompanies(payload);

      if (exportResp.statusCode === 200) {
        toast.success(exportResp.message`${formData.email}`, {
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
        setFormData(emptyState);
        handleClose();
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      toast.error(error?.message, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  return (
    <Box className={classes.exportWrapper}>
      <Box className={classes.exportHeader}>
        <Typography className={classes.mainHeading} variant="subtitle2">
          {t('sales.companies.exportData')}
        </Typography>
        <Typography className={classes.smallText} variant="body3">
          {t('sales.companies.exportDataText')}
        </Typography>
      </Box>
      <Box className={classes.exportDatePicker}>
        <Box className={classes.marginBelow}>
          <ResponsiveDatePickers
            value={formData?.startDate}
            onChange={(value) => {
              const isValidDate = !isNaN(value['$d']);
              if (isValidDate)
                setFormData((prevState) => ({
                  ...prevState,
                  startDate: `${value['$y']}/${value['$M'] + 1}/${value['$D']}`,
                }));
              else
                setFormData((prevState) => ({
                  ...prevState,
                  startDate: null,
                }));
            }}
            error={!!errorMessages?.startDate}
            placeholder={t('sales.companies.to')}
          />
        </Box>
        <ResponsiveDatePickers
          value={formData?.endDate}
          onChange={(value) => {
            const isValidDate = !isNaN(value['$d']);
            if (isValidDate)
              setFormData((prevState) => ({
                ...prevState,
                endDate: `${value['$y']}/${value['$M'] + 1}/${value['$D']}`,
              }));
            else
              setFormData((prevState) => ({
                ...prevState,
                endDate: null,
              }));
          }}
          error={!!errorMessages?.endDate}
          placeholder={t('sales.companies.from')}
        />
      </Box>
      <Box className={classes.exportEmail}>
        <InputLabel htmlFor="email">{t('sales.companies.email')}</InputLabel>
        <TextField
          name="email"
          id="email"
          fullWidth
          placeholder="example@signal.com"
          type="email"
          onChange={(event) => handleMultipleSelectedValues(event, queryKeys.email)}
          value={formData?.email || ''}
          error={!!errorMessages?.email}
          className={classes.inputField}
        />
        <Typography className={classes.smallText} variant="body3">
          {t('sales.companies.emailtext')}
        </Typography>
      </Box>
      <Box className={classes.popoverButtons}>
        <Button variant="secondaryGrey"> {t('sales.companies.cancel')}</Button>
        <Button variant="primary" disabled={loading} onClick={handleExportCompanies}>
          {' '}
          {t('sales.companies.export')}
        </Button>
      </Box>
    </Box>
  );
};

CompaniesExportButton.propTypes = {
  handleClose: PropTypes.func,
};

export default CompaniesExportButton;
