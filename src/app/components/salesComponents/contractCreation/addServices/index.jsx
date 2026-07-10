import { Box, Button, Drawer, Typography } from '@mui/material';
import classNames from 'classnames';
import LoaderComponent from 'commonComponents/loader';
import PropTypes from 'prop-types';
import React, { memo, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import ContractDrawer from 'salesComponents/deals/contractDrawer';
import { updateContract } from 'services/deal.service';
// import CustomDropDown from 'src/app/components/common/customDropDown';
// import ResponsiveDatePickers from 'src/app/components/common/datePicker';
import CustomDropDown from 'src/app/components/common/customDropDown/index.jsx';
import {
  ActiveStepsKeys,
  getViewDisabledContractClass,
} from 'src/app/sales/pages/contractCreation/helper.js';
import { ServicesEditIcon } from 'src/assets/svg';
import { AddServiceIcon } from 'src/assets/svg/index.jsx';
import {
  addNewService,
  // removeContractErrorKey,
  updateProposalDrawerData,
} from 'src/redux/store/slices/contractServices';
import { getTimezoneOptions } from 'src/services/settings.services.js';
import { KEY } from 'src/utils/constants/events/keyPressEvents';
import {
  contractTypeEnum,
  SelectedDateTpeContract,
  toastSettings,
} from 'src/utils/constants/index.js';
import { convertMMDDYYYYToDayJsDate } from 'src/utils/passTime/time';

// import { convertMMDDYYYYToDayJsDate } from 'src/utils/passTime/time.jsx';
import { useStyles } from './addServices.js';
import { _getCurrentDate, FormKeys } from './helper.js';
import ServiceCard from './serviceCard/index.jsx';
import ServiceCardSkeleton from './serviceCardSkeleton.jsx';

const locationDrawerTypes = {
  RIGHT: 'right',
};

const AddServicesTab = ({
  contractName,
  isPublished,
  baseRates,
  isFetchingPreferences,
  lineItems,
  // setErrorMessages,
  fetchContractDetails, // use this prop to fetch contract details
  enableOccurences,
  products,
  selectedPlanType,
  billingCycles,
  onBillingCycleChange,
  apiData,
  stripeEnabled,
  chatServicesSync,
}) => {
  const { id: dealId } = useParams();

  const { t } = useTranslation();
  const classes = useStyles();
  // const [timezoneOptions, setTimezoneOptions] = useState([]);

  const [moreFilterState, setMoreFilterState] = useState({
    right: false,
  });

  const [loading, setLoading] = useState(false);

  const handleUpdateProposal = (event) => {
    toggleFiltersDrawer(locationDrawerTypes.RIGHT, true)(event);
  };

  const toggleFiltersDrawer = (anchor, open) => (event) => {
    if (event.type === KEY.UP && (event.key === KEY.TAB || event.key === KEY.SHIFT)) {
      return;
    }
    setMoreFilterState({ ...moreFilterState, [anchor]: open });
  };

  const filterCloseDrawer = (anchor) => {
    setMoreFilterState({ ...moreFilterState, [anchor]: false });
  };

  const dispatch = useDispatch();

  const totalServices = useSelector(
    (state) => state.contractServices[ActiveStepsKeys.SERVICES].length,
  );

  const errorMessages = useSelector((state) => state.contractServices.errorMessages);

  const contractService = useSelector((state) => state.contractServices);

  // Memoized contract data object - only recalculate when contractService changes
  const contractDataObj = useMemo(
    () => ({
      stripeEnabled: enableOccurences,
      [FormKeys.NAME]: contractService?.[FormKeys.NAME] || contractName,
      [FormKeys.TIMEZONE]: {
        ...contractService?.[FormKeys.TIMEZONE],
        id: contractService?.[FormKeys.TIMEZONE]?.value,
      },
      [FormKeys.PROPOSAL_TYPE]: contractService?.[FormKeys.PROPOSAL_TYPE],
      ...(!!contractService?.[FormKeys.START_DATE]
        ? {
            [FormKeys.START_DATE]: convertMMDDYYYYToDayJsDate(
              contractService?.[FormKeys.START_DATE],
            ),
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
    }),
    [contractService, contractName],
  );

  // console.log({ contractService }, { contractDataObj });

  /**
   * Fetch timezone options
   */
  const _fetchTimezoneOptions = async () => {
    try {
      const response = await getTimezoneOptions();
      if (response.statusCode === 200) {
        // setTimezoneOptions(response?.data?.timezones); // state is commented
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

  useEffect(() => {
    // fetchTimezoneOptions(); // since it is not getting used anywhere so I am commenting it for now.
  }, []);

  const tenantInfo = useSelector((state) => state.auth.tenantInfo);

  const handleAddService = () => {
    dispatch(
      addNewService({
        tenantInfo,
        enableOccurences,
        contractStartDate: convertMMDDYYYYToDayJsDate(contractService?.[FormKeys.START_DATE]),
      }),
    );
  };

  const renderServices = useMemo(() => {
    if (chatServicesSync?.active) {
      const skeletonCount = chatServicesSync.count || totalServices || 1;
      return Array.from({ length: skeletonCount }, (_, index) => (
        <ServiceCardSkeleton key={`chat-sync-skeleton-${index}`} />
      ));
    }

    let servicesJsx = [];
    for (let i = 0; i < totalServices; i++) {
      servicesJsx.push(
        <ServiceCard
          key={i}
          index={i}
          isPublished={isPublished}
          totalServices={totalServices}
          errorMessages={errorMessages}
          baseRates={baseRates}
          lineItems={lineItems}
          enableOccurences={enableOccurences}
          products={products}
          selectedPlanType={selectedPlanType}
          apiData={apiData}
          stripeEnabled={stripeEnabled}
        />,
      );
    }

    return servicesJsx;
  }, [
    chatServicesSync?.active,
    chatServicesSync?.count,
    totalServices,
    selectedPlanType,
    products,
    apiData,
    isPublished,
    errorMessages,
    baseRates,
    lineItems,
    enableOccurences,
    stripeEnabled,
  ]);

  const showLoader = useMemo(
    () => isFetchingPreferences && !isPublished,
    [isFetchingPreferences, isPublished],
  );

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

        filterCloseDrawer(locationDrawerTypes.RIGHT);
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

  // Memoized display name
  const displayName = useMemo(
    () => contractService?.[FormKeys.NAME] || contractName,
    [contractService, contractName],
  );

  return (
    <Box
      className={classes.descStep}
      onBlur={() => {
        // console.log('We are focusing out');
      }}
    >
      {showLoader && <LoaderComponent size={50} color={'primary'} label={t('sales.loading')} />}

      <Box
        className={classNames(classes.ServiceHeaders, getViewDisabledContractClass(isPublished))}
      >
        <Box className={classes.ServiceLeft}>
          <Box className={classes.contractNameFlex}>
            <Typography variant="h3" className={classes.stepperHeadding}>
              {displayName}
            </Typography>
            {!enableOccurences && (
              <Box className={classes.billingCycleWrapper}>
                <Typography variant="subtitle2" className={classes.billingCycleText}>
                  {t('sales.contract.billingCycle')} {' : '}
                </Typography>
                <CustomDropDown
                  label={t('sales.contract.billingCycle')}
                  options={billingCycles}
                  selectedValues={selectedPlanType || {}}
                  handleChange={onBillingCycleChange}
                  name="billingCycle"
                />
              </Box>
            )}
          </Box>
        </Box>
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
      </Box>

      <Box>
        <Drawer
          anchor={locationDrawerTypes.RIGHT}
          open={moreFilterState[locationDrawerTypes.RIGHT]}
          onClose={toggleFiltersDrawer(locationDrawerTypes.RIGHT, false)}
        >
          {moreFilterState?.right && (
            <ContractDrawer
              anchor={locationDrawerTypes.RIGHT}
              filterCloseDrawer={filterCloseDrawer}
              width={399}
              createOrUpdateProposal={updateProposal}
              contractData={contractDataObj}
              disabled={loading}
              enableOccurences={enableOccurences}
            />
          )}
        </Drawer>
      </Box>

      <Box className={classNames(classes.servicesWrap, 'innerScrollBar')}>
        {renderServices}

        {!enableOccurences && (
          <Box className={classNames(classes.serviceBox, classes.serviceBoxEnd)}>
            <Box
              className={classNames(classes.addServices, getViewDisabledContractClass(isPublished))}
            >
              <Button disableRipple variant="onlyText" onClick={handleAddService}>
                <AddServiceIcon />
              </Button>
              <Typography className={classes.addServise} variant="h3">
                {t('sales.contract.addService')}
              </Typography>
              <Typography variant="body2" className={classes.serviceBoxtext}>
                {t('sales.contract.addServiceText')}
              </Typography>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};

AddServicesTab.propTypes = {
  isFetchingPreferences: PropTypes.bool,
  isPublished: PropTypes.bool,
  contractName: PropTypes.string,
  setErrorMessages: PropTypes.func,
  baseRates: PropTypes.object,
  restProps: PropTypes.object,
  fetchContractDetails: PropTypes.func,
  lineItems: PropTypes.array,
  products: PropTypes.array,
  selectedPlanType: PropTypes.object,
  billingCycles: PropTypes.array,
  onBillingCycleChange: PropTypes.func,
  apiData: PropTypes.object,
  enableOccurences: PropTypes.bool,
  stripeEnabled: PropTypes.bool,
  chatServicesSync: PropTypes.shape({
    active: PropTypes.bool,
    count: PropTypes.number,
  }),
};

export default memo(AddServicesTab);
