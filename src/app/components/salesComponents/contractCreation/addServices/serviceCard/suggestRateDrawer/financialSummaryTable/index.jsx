import { Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getDisplayConfiguration } from 'src/redux/store/slices/regionalCountryConfiguration';

import { useStyles } from './styles';

const FinancialSummaryTable = ({ data, className }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { symbol } = useSelector(getDisplayConfiguration);

  return (
    <div className={`${classes.tableWrapper} ${className || ''}`}>
      <Table>
        <TableHead className={classes.tableHeader}>
          <TableRow>
            <TableCell className={classes.tableCell}>
              {t('sales.contract.financialSummaryCategory')}
            </TableCell>
            <TableCell align="right" className={classes.tableCell}>
              {t('sales.contract.financialSummaryAmount')}
            </TableCell>
            <TableCell align="right" className={classes.tableCell}>
              {t('sales.contract.financialSummaryPercentage')}
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data?.map((row, index) => (
            <TableRow key={index} className={row.highlighted ? classes.highlightedRow : ''}>
              <TableCell>{row?.highlighted ? <strong>{row?.label}</strong> : row?.label}</TableCell>
              <TableCell align="right">
                {row.highlight ? (
                  <strong>
                    {symbol}
                    {row?.value}
                  </strong>
                ) : (
                  <>
                    {symbol}
                    {row?.value}
                  </>
                )}
              </TableCell>
              <TableCell align="right">
                {row?.highlight ? <strong>{row?.percentage}</strong> : row?.percentage}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

FinancialSummaryTable.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.string.isRequired,
      percentage: PropTypes.string.isRequired,
      highlighted: PropTypes.bool,
    }),
  ).isRequired,
  className: PropTypes.string,
};

export default FinancialSummaryTable;
