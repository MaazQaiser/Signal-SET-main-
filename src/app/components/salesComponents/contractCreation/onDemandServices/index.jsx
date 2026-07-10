import { Box, Button, Drawer, Typography } from '@mui/material';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FormKeys } from 'salesComponents/contractCreation/addServices/helper';
import ContractDrawer from 'salesComponents/deals/contractDrawer';
import { locationDrawerTypes } from 'salesPages/deals/deals.constant';
import { updateContract } from 'services/deal.service';
import {
  getOnDemandTotal,
  getViewDisabledContractClass,
} from 'src/app/sales/pages/contractCreation/helper';
import { AddIcon, ServicesEditIcon } from 'src/assets/svg/index.jsx';
import { updateProposalDrawerData } from 'src/redux/store/slices/contractServices';
import {
  contractTypeEnum,
  proposalTypeEnum,
  SelectedDateTpeContract,
  toastSettings,
} from 'src/utils/constants';
import { KEY } from 'src/utils/constants/events/keyPressEvents';
import { convertMMDDYYYYToDayJsDate } from 'src/utils/passTime/time';

import CustomService from './customService';
import CustomServiceForm from './customServiceForm';
import { useStyles } from './onDemandServices.js';
import SystemService, { MONTHLY_RATE } from './systemService';

const emptyState = {
  title: null,
  price: null,
  quantity: null,
  rate: MONTHLY_RATE,
};

export const intentTypes = {
  SYSTEM: 'system',
  CUSTOM: 'custom',
};

const OnDemandServicesTab = ({
  formData: data,
  setFormData: setData,
  editData,
  errorMessages,
  setErrorMessages,
  setOnDemandTotal,
  isPublished,
  contractName,
  fetchContractDetails,
  proposalType = proposalTypeEnum.default,
  enableOccurences = false,
}) => {
  const { id: dealId } = useParams();

  const { t } = useTranslation();
  const classes = useStyles();
  const [formData, setFormData] = useState(emptyState);

  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);

  const [editIndex, setEditIndex] = useState(null);

  const [drawerSide, setDrawerSide] = useState({
    right: false,
  });

  const contractService = useSelector((state) => state.contractServices);

  const contractDataObj = {
    [FormKeys.NAME]: contractService?.[FormKeys.NAME] || contractName,
    [FormKeys.TIMEZONE]: {
      ...contractService?.[FormKeys.TIMEZONE],
      id: contractService?.[FormKeys.TIMEZONE]?.value,
    },
    [FormKeys.PROPOSAL_TYPE]: contractService?.[FormKeys.PROPOSAL_TYPE],
    ...(!!contractService?.[FormKeys.START_DATE]
      ? {
          [FormKeys.START_DATE]: convertMMDDYYYYToDayJsDate(contractService?.[FormKeys.START_DATE]),
          ...(contractService?.type === contractTypeEnum.addendum && {
            [FormKeys.EFFECTIVE_DATE]: convertMMDDYYYYToDayJsDate(
              contractService?.[FormKeys.START_DATE],
            ),
          }),
          [FormKeys.SELECTED_DATE_TYPE]:
            contractService?.[FormKeys.SELECTED_DATE_TYPE] || FormKeys.RENEWAL_DATE,
          [contractService?.[FormKeys.SELECTED_DATE_TYPE] === FormKeys.END_DATE
            ? FormKeys.END_DATE
            : FormKeys.RENEWAL_DATE]: convertMMDDYYYYToDayJsDate(
            contractService?.[FormKeys.END_DATE],
          ),
          [FormKeys.RENEWAL_REMINDER_DAYS]: contractService?.[FormKeys.RENEWAL_REMINDER_DAYS],
          [FormKeys.AUTO_RENEWAL]: contractService?.[FormKeys.AUTO_RENEWAL] || false,
          [contractService?.[FormKeys.SELECTED_DATE_TYPE] === FormKeys.END_DATE
            ? FormKeys.RENEWAL_DATE
            : FormKeys.END_DATE]: null,
        }
      : {}),
    type: contractService?.['type'],
    actualContractDates: contractService?.['actualContractDates'],
  };

  useEffect(() => setData(editData), [editData]);

  useEffect(() => {
    setOnDemandTotal(getOnDemandTotal(data));
  }, [data]);

  const [showAddServiceForm, setShowAddServiceForm] = useState(false);

  const resetForm = () => {
    setFormData(emptyState);
    setShowAddServiceForm(false);
    setEditIndex(null);
  };

  const handleEditService = (item, index) => {
    setFormData(item);
    setEditIndex(index);
    setShowAddServiceForm(true);
  };

  const handleUpdateProposal = (event) => {
    toggleDrawer(locationDrawerTypes.RIGHT, true)(event);
  };

  const toggleDrawer = (anchor, open) => (event) => {
    if (event.type === KEY.UP && (event.key === KEY.TAB || event.key === KEY.SHIFT)) {
      return;
    }
    setDrawerSide({ ...drawerSide, [anchor]: open });
  };

  const closeDrawer = (anchor) => {
    setDrawerSide({ ...drawerSide, [anchor]: false });
  };

  const updateProposal = async (payload) => {
    try {
      setLoading(true);

      const bePayload = {
        ...payload,
        [FormKeys.TIMEZONE]: payload?.[FormKeys.TIMEZONE]?.id,
        [FormKeys.SELECTED_DATE_TYPE]:
          payload?.[FormKeys.SELECTED_DATE_TYPE] === FormKeys.END_DATE
            ? SelectedDateTpeContract.oneTime
            : SelectedDateTpeContract.onGoing,
      };
      const response = await updateContract(dealId, bePayload);
      if (response.statusCode === 200) {
        setLoading(false);
        // update proposal stored
        dispatch(updateProposalDrawerData(payload));

        closeDrawer(locationDrawerTypes.RIGHT);
        fetchContractDetails();
      }
    } catch (error) {
      setLoading(false);
      toast.error(error?.message, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  let lineItemsCounter = 1;

  return (
    <Box className={classNames(classes?.onDemandStep, getViewDisabledContractClass(isPublished))}>
      <Box className={classes.onDemandHeadInner}>
        <Box className={classes.onDemandHead}>
          <Typography variant="h3" className={classes.stepperHeadding}>
            {t('sales.contract.demandGeading')}
          </Typography>
          <Typography variant="body2" className={classes.demandSubText}>
            {t('sales.contract.demandSubText')}
          </Typography>
        </Box>
        {proposalType === proposalTypeEnum.dispatch && (
          <Box className={classes.ServiceRight}>
            <Button
              onClick={handleUpdateProposal}
              disableRipple
              // className={classes.moreFilter}
              startIcon={<ServicesEditIcon />}
              variant="secondaryBlue"
            >
              {t('sales.deals.updateProposalDrawer')}
            </Button>
          </Box>
        )}
      </Box>
      <Box className={classNames(classes.onDemandContent, 'innerScrollBar')}>
        <Box className={classes.demandContent}>
          {data?.map((item, index) => {
            if (item._destroy) return null;

            if (item.intent === intentTypes.SYSTEM)
              return (
                <SystemService
                  key={index}
                  data={data}
                  setData={setData}
                  index={index}
                  item={item}
                  errorMessages={errorMessages}
                  setErrorMessages={setErrorMessages}
                  isPublished={isPublished}
                />
              );

            return showAddServiceForm && editIndex === index ? (
              <CustomServiceForm
                setData={setData}
                editIndex={editIndex}
                formData={formData}
                setFormData={setFormData}
                resetForm={resetForm}
                enableOccurences={enableOccurences}
              />
            ) : (
              <CustomService
                key={index}
                item={item}
                index={index}
                setData={setData}
                resetForm={resetForm}
                isPublished={isPublished}
                counter={lineItemsCounter++}
                handleEditService={handleEditService}
              />
            );
          })}
        </Box>
        {drawerSide?.right && (
          <Box>
            <Drawer
              anchor={locationDrawerTypes.RIGHT}
              open={drawerSide[locationDrawerTypes.RIGHT]}
              onClose={toggleDrawer(locationDrawerTypes.RIGHT, false)}
            >
              {drawerSide?.right && (
                <ContractDrawer
                  anchor={locationDrawerTypes.RIGHT}
                  filterCloseDrawer={closeDrawer}
                  width={399}
                  createOrUpdateProposal={updateProposal}
                  contractData={contractDataObj}
                  disabled={loading}
                  enableOccurences={enableOccurences}
                />
              )}
            </Drawer>
          </Box>
        )}
        {!showAddServiceForm && (
          <Box className={classNames(classes.addButton, getViewDisabledContractClass(isPublished))}>
            <Button
              className={classes.noPadding}
              variant="primary"
              disableRipple
              startIcon={<AddIcon className={classes.whiteBtn} />}
              onClick={() => setShowAddServiceForm(true)}
            >
              {t('sales.contract.lineItem')}
            </Button>
          </Box>
        )}
        {showAddServiceForm && editIndex === null && (
          <CustomServiceForm
            setData={setData}
            editIndex={editIndex}
            formData={formData}
            setFormData={setFormData}
            resetForm={resetForm}
            enableOccurences={enableOccurences}
          />
        )}
      </Box>
    </Box>
  );
};

OnDemandServicesTab.propTypes = {
  formData: PropTypes.object,
  setFormData: PropTypes.func,
  editData: PropTypes.any,
  errorMessages: PropTypes.object,
  setErrorMessages: PropTypes.func,
  setOnDemandTotal: PropTypes.func,
  isPublished: PropTypes.bool,
  contractName: PropTypes.string,
  fetchContractDetails: PropTypes.func,
  proposalType: PropTypes.string,
  enableOccurences: PropTypes.bool,
};

export default OnDemandServicesTab;
