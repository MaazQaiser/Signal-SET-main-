import { Box, Button, Typography } from '@mui/material';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import SweetAlertModal from 'src/app/components/common/sweetAlertModal';
import { getViewDisabledContractClass } from 'src/app/sales/pages/contractCreation/helper';
import { DeleteAlterIcon, DemandEditIcon, TrashIcon } from 'src/assets/svg';
import { getDisplayConfiguration } from 'src/redux/store/slices/regionalCountryConfiguration';
import { fomatNumbersWithCommas } from 'src/utils/currencyFormater';

import { useStyles } from '../onDemandServices';

const CustomService = ({
  item,
  index,
  // counter,
  handleEditService,
  setData,
  resetForm,
  isPublished,
}) => {
  const { t } = useTranslation();

  const classes = useStyles();
  const { symbol } = useSelector(getDisplayConfiguration);
  const [showModal, setShowModal] = useState(false);

  const toggleDeleteModal = () => {
    setShowModal(!showModal);
  };

  const deleteService = () => {
    setData((prevData) => {
      const updatedAdditionalServices = [
        ...prevData.slice(0, index),
        ...(Object.prototype.hasOwnProperty.call(prevData[index], 'id')
          ? [{ ...prevData[index], _destroy: true }]
          : []),
        ...prevData.slice(index + 1),
      ];

      return updatedAdditionalServices;
    });

    toggleDeleteModal();
    resetForm();
  };

  const onEditService = () => {
    handleEditService(item, index);
  };

  return (
    <Box
      key={index}
      className={classNames(classes.demandPricesRow, getViewDisabledContractClass(isPublished))}
    >
      <Box className={classes.priceLeftSide}>
        <Box className={classes.priceLeftSideInner}>
          <Box className={classes.labelCount}>{index + 1}.</Box>
          <Box className={classes.labelTextColum}>
            <Typography variant="body2" className={classes.labelHeading}>
              {item?.title || NA}
            </Typography>
            <Typography variant="body2" className={classes.labelSubText}>
              {t('sales.contract.count')} {item?.quantity || NA} • {t('sales.contract.price')}{' '}
              {item?.price ? `${symbol}${fomatNumbersWithCommas(item?.price)}` : NA}
            </Typography>
          </Box>
        </Box>
      </Box>
      <Box className={classes.priceRightSide}>
        <Box className={classes.addPriceRow}>
          <Box className={classes.servicePrice}>
            <Typography variant="h3" className={classes.labelHeadingThree}>
              {item?.price && item?.quantity
                ? `${symbol}${fomatNumbersWithCommas(item?.price * item?.quantity)}`
                : NA}
            </Typography>
          </Box>
          <Box className={classes.crudButtons}>
            <Button
              variant="onlyText"
              className={classes.editIcon}
              onClick={onEditService}
              disableRipple
            >
              <DemandEditIcon />
            </Button>
            <Button
              variant="onlyText"
              className={classes.binIcon}
              onClick={toggleDeleteModal}
              disableRipple
            >
              <TrashIcon />
            </Button>
            <Box className={classes.sweetAlertWrapper}>
              <SweetAlertModal
                type="warning" // 'success', 'error', 'warning', 'info', etc.
                title={t('sales.contract.deleteAddService')}
                text={t('sales.contract.deleteAddServiceText')}
                confirmButtonText={t('sales.contract.deleteAddServiceBtn')}
                cancelButtonText={t('sales.contract.cancel')}
                show={showModal}
                icon={<DeleteAlterIcon />}
                handleConfirmButton={deleteService}
                handleCancelButton={toggleDeleteModal}
                reverseButtons={true}
              />
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

CustomService.propTypes = {
  item: PropTypes.object,
  index: PropTypes.number,
  setData: PropTypes.func,
  // counter: PropTypes.number,
  resetForm: PropTypes.func,
  handleEditService: PropTypes.func,
  isPublished: PropTypes.bool,
};

export default CustomService;
