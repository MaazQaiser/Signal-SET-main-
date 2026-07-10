import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
// import { dealStages } from 'src/app/sales/pages/deals/deals.constant.js';
import { getDisplayConfiguration } from 'src/redux/store/slices/regionalCountryConfiguration';
import { numberToUsdCurrencyFormat } from 'src/utils/currencyFormater/index.js';
import { formatISOTimestampToDate } from 'src/utils/date/index.js';

import { stageValues } from '../../deals/dealStages/stage.constant.js';
import { useStyles } from './dealAccordianData.js';

const DealsAccordianData = ({ deal, amount, stage, date }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { dateFormat } = useSelector(getDisplayConfiguration);

  const getDealStage = (stageName) => {
    if (!stageName) return classes.otherStageColor;

    let stageColorClass = '';
    if (stageName === stageValues.QUESTIONS) {
      stageColorClass = classes.questionsColor;
    } else if (stageName === stageValues.PROPOSAL_CREATION) {
      stageColorClass = classes.proposalsColor;
    } else if (stageName === stageValues.CLOSED_LOST) {
      stageColorClass = classes.lostColor;
    } else if (stageName === stageValues.CLOSED_WON) {
      stageColorClass = classes.closedWoncolor;
    } else if (stageName === stageValues.PROPOSAL_DELIVERED) {
      stageColorClass = classes.negotiationColor;
    } else if (stageName === stageValues.NEGOTIATION) {
      stageColorClass = classes.negotiationColor;
    } else if (stageName === stageValues.TERMINATED) {
      stageColorClass = classes.terminated;
    } else {
      stageColorClass = stageValues.OTHERS;
    }

    return stageColorClass;
  };

  return (
    <Box className={classes.accordianCards}>
      <Box direction="row" justifyContent="flex-start" alignItems="flex-start">
        <Box className="card-text">
          <Typography variant="body2" className={classes.heading}>
            {deal}
          </Typography>
          <Typography variant="body2" className={classes.subHeading}>
            {t('sales.companies.amount')}: {numberToUsdCurrencyFormat(amount)}
          </Typography>
          <Typography variant="body2" className={classes.subHeading}>
            {t('sales.companies.date')} {formatISOTimestampToDate(date, dateFormat)} •{' '}
            {t('sales.companies.stage')}:{' '}
            <Box
              component="span"
              className={classNames(classes.commonStageColor, getDealStage(stage?.value))}
            >
              {stage?.label || NA}
            </Box>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

DealsAccordianData.propTypes = {
  deal: PropTypes.string,
  amount: PropTypes.number, // Assuming amount is a number, adjust as needed
  stage: PropTypes.string,
  date: PropTypes.instanceOf(Date), // Assuming date is a Date object, adjust as needed
};

export default DealsAccordianData;
