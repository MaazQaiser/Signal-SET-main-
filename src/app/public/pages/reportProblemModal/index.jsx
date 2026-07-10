import { Box, Link } from '@mui/material';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { ReactComponent as CloseIcon } from 'assets/svg/close.svg';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import ModalComponent from 'src/app/components/common/modal';

import { useStyles } from './reportProblem.styles';

const reportProblemLink = process.env.REACT_APP_REPORT_A_PROBLEM_URL;

const ReportProblemModal = ({ open, onClose }) => {
  const classes = useStyles();
  const { t } = useTranslation();

  const reportProblemBody = (
    <Box className={classes.rejectModal}>
      <Button disableRipple className={classes.closeBtn} onClick={onClose}>
        <CloseIcon />
      </Button>
      <Box className={classes.rejectModalContent}>
        <Typography variant="h3" className={classes.rejectModalTitle}>
          {t('reportProblem.reportProblemModal.title')}
        </Typography>
        <Typography variant="body2" className={classes.rejectModalDescription}>
          {t('reportProblem.reportProblemModal.description')}
        </Typography>
      </Box>

      <Box className={classes.rejectModalActions}>
        <Button variant="secondaryBlue">
          <Link
            href={reportProblemLink}
            target="_blank"
            rel="noreferrer"
            className={classes.linkReportProblem}
          >
            {t('reportProblem.reportProblemModal.obx')}
          </Link>
        </Button>
        <Button variant="secondaryBlue">
          <Link
            href={reportProblemLink}
            target="_blank"
            rel="noreferrer"
            className={classes.linkReportProblem}
          >
            {t('reportProblem.reportProblemModal.sales')}
          </Link>
        </Button>
      </Box>
    </Box>
  );

  return <ModalComponent open={open} handleClose={onClose} body={reportProblemBody} />;
};

ReportProblemModal.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
};

export default ReportProblemModal;
