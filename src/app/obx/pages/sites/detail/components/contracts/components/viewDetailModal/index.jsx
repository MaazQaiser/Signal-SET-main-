import { Box, Button, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import ModalComponent from 'src/app/components/common/modal';
import { dayjsWithStandardOffset } from 'src/app/obx/pages/schedules/helper';
import { CloseIcon } from 'src/assets/svg';
import { formatDate } from 'src/helper/utilityFunctions';
import { billingFrequency, billingFrequencyType } from 'src/utils/constants';

import { useStyles } from './viewEditModal.styles';

const ViewDetailModal = ({ open, onClose, data, id }) => {
  const classes = useStyles();

  const { t } = useTranslation();
  const NA = t('commonText.nA');

  const filteredData = data.find((item) => item.id === id);

  const getLabelByValue = (array, value) => {
    const match = array.find((item) => item.value === value);
    return match ? match.label : t('commonText.nA');
  };

  const billingFrequencyLabel = getLabelByValue(billingFrequency, filteredData?.billingFrequency);
  const billingFrequencyTypeLabel = getLabelByValue(
    billingFrequencyType,
    filteredData?.billingFrequencyType,
  );

  const viewDetailBody = (
    <Box className={classes.viewDetailModal}>
      <Box className={classes.viewDetailModalHeader}>
        <Typography variant="h3" className={classes.viewDetailModalTitle}>
          {t('obx.contracts.billingInformation')}
        </Typography>
        <Button
          disableRipple
          className={classes.notesCloseBtn}
          variant="text"
          onClick={() => onClose(false)}
        >
          <CloseIcon />
        </Button>
      </Box>
      <Box className={classes.viewDetailModalBody}>
        <Box className={classes.viewDetailModalList}>
          <Box className={classes.viewDetailModalCircle}></Box>
          <Box className={classes.viewDetailModalListItem}>
            <Typography variant="body2" className={classes.viewDetailModalListTitle}>
              {t('obx.contracts.billingFrequency')}
            </Typography>
            <Typography variant="body3" className={classes.viewDetailModalListText}>
              {billingFrequencyLabel}
            </Typography>
          </Box>
        </Box>
        <Box className={classes.viewDetailModalList}>
          <Box className={classes.viewDetailModalCircle}></Box>
          <Box className={classes.viewDetailModalListItem}>
            <Typography variant="body2" className={classes.viewDetailModalListTitle}>
              {t('obx.contracts.billingFrequencyType')}
            </Typography>
            <Typography variant="body3" className={classes.viewDetailModalListText}>
              {billingFrequencyTypeLabel}
            </Typography>
          </Box>
        </Box>
        <Box className={classes.viewDetailModalList}>
          <Box className={classes.viewDetailModalCircle}></Box>
          <Box className={classes.viewDetailModalListItem}>
            <Typography variant="body2" className={classes.viewDetailModalListTitle}>
              {t('obx.contracts.billingStartDate')}
            </Typography>
            <Typography variant="body3" className={classes.viewDetailModalListText}>
              {formatDate(dayjsWithStandardOffset(filteredData?.startDate)) || NA}
            </Typography>
          </Box>
        </Box>
        <Box className={classes.viewDetailModalList}>
          <Box className={classes.viewDetailModalCircle}></Box>
          <Box className={classes.viewDetailModalListItem}>
            <Typography variant="body2" className={classes.viewDetailModalListTitle}>
              {t('obx.contracts.paymentsTerms')}
            </Typography>
            <Typography variant="body3" className={classes.viewDetailModalListText}>
              {filteredData?.paymentTerm || NA}
            </Typography>
          </Box>
        </Box>
        <Box className={classes.viewDetailModalList}>
          <Box className={classes.viewDetailModalCircle}></Box>
          <Box className={classes.viewDetailModalListItem}>
            <Typography variant="body2" className={classes.viewDetailModalListTitle}>
              {t('obx.contracts.billingEndDate')}
            </Typography>
            <Typography variant="body3" className={classes.viewDetailModalListText}>
              {formatDate(dayjsWithStandardOffset(filteredData?.endDate)) || NA}
            </Typography>
          </Box>
        </Box>
        <Box className={classes.viewDetailModalList}>
          <Box className={classes.viewDetailModalCircle}></Box>
          <Box className={classes.viewDetailModalListItem}>
            <Typography variant="body2" className={classes.viewDetailModalListTitle}>
              {t('obx.contracts.nextInvoiceDate')}
            </Typography>
            <Typography variant="body3" className={classes.viewDetailModalListText}>
              {filteredData?.nextInvoiceDate
                ? formatDate(dayjsWithStandardOffset(filteredData?.nextInvoiceDate))
                : NA}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );

  return <ModalComponent open={open} handleClose={onClose} body={viewDetailBody} />;
};

ViewDetailModal.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  data: PropTypes.array,
  id: PropTypes.number,
};

export default ViewDetailModal;
