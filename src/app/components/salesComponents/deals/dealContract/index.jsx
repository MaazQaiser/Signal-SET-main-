import AddIcon from '@mui/icons-material/Add';
import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
} from '@mui/material';
// import { ReactComponent as DownloadIcon } from 'assets/icons/downloadIcon.svg';
import { ReactComponent as EyeIcon } from 'assets/icons/eyeIcon.svg';
// import { ReactComponent as PdfIcon } from 'assets/icons/pdfIcon.svg';
// import { ReactComponent as UploadPdfIcon } from 'assets/icons/uploadIcon.svg';
import { _SignalIcon, DeleteAlter, DeleteIcon, EditTermIcon } from 'assets/svg';
// import { MoreVert } from 'assets/svg';
import { ReactComponent as AdendumIcon } from 'assets/svg/adendum.svg';
import { ReactComponent as SendIcon } from 'assets/svg/arrowNext.svg';
import { ReactComponent as CloneIcon } from 'assets/svg/clone.svg';
import { ReactComponent as ContactPdfIcon } from 'assets/svg/ContactPdfIcon.svg';
import { ReactComponent as ContractTerminateIcon } from 'assets/svg/ContractTerminateIcon.svg';
// import { ReactComponent as ReplaceIcon } from 'assets/svg/ReplaceIcon.svg';
import { ReactComponent as WarningIcon } from 'assets/svg/signatureIcon.svg';
import { ReactComponent as TerminateCircleIcon } from 'assets/svg/TerminateCircleIcon.svg';
import classNames from 'classnames';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import AddSignModal from 'salesComponents/deals/dealContract/addSignModal';
import RequestSignatureModal from 'salesComponents/deals/dealContract/requestSignatureModal';
import { stageValues } from 'salesComponents/deals/dealStages/stage.constant';
// import CustomDropDown from 'src/app/components/common/customDropDown';
import LoaderComponent from 'src/app/components/common/loader/index.jsx';
import SignContractModal from 'src/app/public/pages/signContract/signContractModal';
// import PopoverButton from 'src/app/components/common/popoverButton';
import * as routes from 'src/app/router/constant/ROUTE';
import { SALES_DEAL } from 'src/app/router/constant/ROUTE.jsx';
import {
  ACL_DEAL_CONTRACTS_CREATE,
  ACL_DEAL_CONTRACTS_DELETE,
  ACL_DEAL_CONTRACTS_UPDATE,
  ACL_DEAL_CONTRACTS_VIEW,
} from 'src/app/router/constant/SALESMODULE.jsx';
import history from 'src/app/router/utils/history.jsx';
import { checkIfDateIsPassed, formatDate, isSameDate } from 'src/helper/utilityFunctions';
import RenderIfHasPermission from 'src/hoc/renderIfHasPermission.jsx';
import { getDisplayConfiguration } from 'src/redux/store/slices/regionalCountryConfiguration';
import {
  createDealAddendumContract,
  createDealCloneContract,
  getContractPDF,
  getSignedContractPDF,
  publishContract,
  requestSignatures,
  signContract,
  terminateContract,
} from 'src/services/deal.service.js';
import { contractTypeEnum, stageStatus, toastSettings } from 'src/utils/constants/index.js';
import { fomatNumbersWithCommas } from 'src/utils/currencyFormater/index.js';
import { openFile } from 'src/utils/files/index.js';
import {
  convertISODateTimeToMMMDoYYYY,
  convertMMDDYYYYToDayJsDate,
} from 'src/utils/passTime/time.jsx';
import capitalize from 'src/utils/string/capitalize.jsx';

import { getCurrentDate } from '../../contractCreation/addServices/helper.js';
import { getPlanTypeTitles, PlanTypeEnums } from '../../contractCreation/paymentTerms/helper.js';
import PublishContractModal from '../publishContractModal/index.jsx';
import AddendumModal from './addendumModal/index.jsx';
import { useStyles } from './dealContract.js';
import TerminateModal from './terminateModal/index.jsx';

export const ContractActions = {
  TERMINATE_CONTRACT: 'terminateContract',
  DELETE_CONTRACT: 'deleteContract',
  PREVIEW_CONTRACT: 'previewContract',
  PREVIEW_SIGNED_CONTRACT: 'previewSignedContract',
  REPLACE_SIGNED_CONTRACT: 'replaceSignedContract',
  PUBLISH_WITH_SIGN: 'publishWithSign',
  PUBLISH_WITHOUT_SIGN: 'publishWithoutSign',
};

export const publishStatuses = {
  UNPUBLISHED: 'unpublished_and_unsigned',
  PUBLISHED_WITHOUT_SIGN: 'published_and_unsigned',
  PUBLISHED_WITH_SIGN: 'published_and_signed',
  TERMINATED: 'terminated',
};

const publishedStatusOptions = [
  {
    value: publishStatuses.PUBLISHED_WITHOUT_SIGN,
    label: 'sales.contract.publishedWithoutSign',
    chipColor: 'warning',
    chipStyles: {
      border: 'none',
      backgroundColor: '#FFF7ED',
      padding: '2px 8px',
      '& .MuiChip-label': {
        padding: 0,
        color: '#C64308',
        // fontWeight: 600,
      },
      '& svg path': {
        stroke: '#F4780B',
      },
    },
  },
  {
    value: publishStatuses.PUBLISHED_WITH_SIGN,
    label: 'sales.contract.publishedAndSigned',
    className: 'greenDropdown',
    chipColor: 'success',
    chipStyles: {
      border: '1px solid #2E964B',
      backgroundColor: '#EFF8EF',
      padding: '2px 8px',
      '& .MuiChip-label': {
        padding: 0,
        color: '#2E964B',
        // fontWeight: 600,
      },
      '& svg path': {
        stroke: '#2E964B',
      },
    },
  },
  {
    value: publishStatuses.TERMINATED,
    label: 'sales.contract.terminated',
    className: 'terminateDropdown',
    chipColor: 'error',
    chipStyles: {
      border: '1px solid #DB0000',
      backgroundColor: '#FFF0F0',
      padding: '2px 8px',
      '& .MuiChip-label': {
        color: '#DB0000',
        // fontWeight: 600,
        padding: 0,
      },
    },
  },
];

const inititalDeleteContractModalState = {
  action: '',
  show: false,
  title: '',
  text: '',
  confirmButtonText: '',
  icon: '',
  handleConfirmButton: () => {},
};

const initialpublishModalState = {
  open: false,
  action: '',
};

const DealContract = ({
  dealId,
  contractData,
  setContractData,
  handleShowContractForm,
  franchiseId,
  setData,
  data,
  enableOccurences,
  stripeEnabled,
}) => {
  const { t } = useTranslation();
  const NA = t('commonText.nA');
  const classes = useStyles();
  const { symbol, dateFormat } = useSelector(getDisplayConfiguration);
  const { details, paymentTerms } = contractData;
  const { dealStage } = data;
  const contractName = capitalize(details?.name, true) || NA;
  const resolvePlanId = () => {
    const detailsPlan = details?.plan;
    if (detailsPlan != null && String(detailsPlan).trim() !== '') return String(detailsPlan);
    const paymentPlan =
      paymentTerms?.plan?.value ??
      paymentTerms?.plan?.id ??
      paymentTerms?.planId ??
      paymentTerms?.plan;
    if (paymentPlan != null && String(paymentPlan).trim() !== '') return String(paymentPlan);
    return '2';
  };

  const selectedPlanId = resolvePlanId();

  const getServiceTotals = (services = [], planId = selectedPlanId) =>
    (Array.isArray(services) ? services : []).reduce((sum, service) => {
      const total = Number(
        service?.calculations?.[String(planId)]?.total ??
          service?.calculations?.total ??
          service?.total ??
          0,
      );
      return Number.isFinite(total) ? sum + total : sum;
    }, 0);

  const servicesForAmount = contractData?._demoFormServices || contractData?.services || [];
  const computedAmount = getServiceTotals(servicesForAmount, selectedPlanId);
  const amountValue = Number(details?.amount);
  const resolvedContractAmount =
    Number.isFinite(amountValue) && amountValue > 0 ? amountValue : computedAmount;
  const contractAmount = fomatNumbersWithCommas(resolvedContractAmount || 0);
  const planTypeTitles = getPlanTypeTitles(t);
  // const planTitle = planTypeTitles[details?.plan];

  const {
    isPublishable = false,
    isEditable = false,
    isUploaded = false,
    isPublished = false,
    isTerminated = false,
    terminatedAt = null,
    status: publishStatus,
    plan,
    hasAddendum = false,
    acknowledgedAt = false,
    type: contractType = '',
  } = details;
  const isDemoFlowReadyToPublish =
    !isPublished &&
    Array.isArray(contractData?.steps) &&
    contractData.steps.length > 0 &&
    contractData.steps.every((step) => step?.status === stageStatus.COMPLETED);
  const canPublishContract = isPublishable || isDemoFlowReadyToPublish;

  const hasEnded = checkIfDateIsPassed(details?.endDate);

  const [openPublishModal, setOpenPublishModal] = useState(initialpublishModalState);
  const [isAddendumModalOpen, setAddendumModalOpen] = useState(false);
  const [isCloneModalOpen, setCloneModalOpen] = useState(false);
  const [requestSignatureModalOpen, setRequestSignatureModalOpen] = useState(false);
  // const [updateRequestModalOpen, setUpdateRequestModalOpen] = useState(false);
  const [signatureMenuAnchor, setSignatureMenuAnchor] = useState(null);
  const signatureMenuOpen = Boolean(signatureMenuAnchor);
  const [addSignModalOpen, setAddSignModalOpen] = useState(false);
  const [signContractModalOpen, setSignContractModalOpen] = useState(false);
  const [selectedSigneeForSign, setSelectedSigneeForSign] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [previewAttachmentUrl, setPreviewAttachmentUrl] = useState('');
  const [deleteContractModal, setDeleteContractModal] = useState(inititalDeleteContractModalState);

  const [disabled, setDisabled] = useState(false);

  const getPlan = () => {
    if (stripeEnabled) {
      if (paymentTerms?.plan?.label) return capitalize(paymentTerms.plan.label);
      if (paymentTerms?.plan?.name) return capitalize(paymentTerms.plan.name);
    }
    return planTypeTitles[selectedPlanId] || planTypeTitles[2];
  };

  const checkIfContractIsAddendumAble = () => {
    // check if contract is not started yet.
    const start = dayjs(details?.startDate);
    if (!checkIfDateIsPassed(start) && !isSameDate(start, dayjs())) {
      return true;
    }

    /**
     * check if endDate is not passed
     * endDate is not today
     * endDate is not 1 day before today
     * */
    if (
      checkIfDateIsPassed(dayjs(details?.endDate)) ||
      isSameDate(dayjs(details?.endDate), dayjs()) ||
      isSameDate(dayjs(details?.endDate), dayjs().subtract(1, 'd'))
    ) {
      return false;
    }

    // if above conditions not met return true
    return true;
    // // check if contract is started already
    // if (checkIfDateIsPassed(details?.startDate) || isSameDate(dayjs(details?.startDate), dayjs())) {
    //   // add 3 days to current day
    //   // const minStartDate = dayjs().add(1, 'd');
    //   // subtract 8 days from the end date of the contract
    //   const maxStartDate = dayjs(details?.endDate).subtract(1, 'd');
    //
    //   // return minStartDate.isAfter(maxStartDate);
    //   return maxStartDate.isAfter(dayjs());
    // }
    // return false;
  };

  // console.log(!hasAddendum, !isTerminated, !hasEnded, checkIfContractIsAddendumAble());

  const handleOpenPublishModal = (action) => {
    if (isTerminated) {
      toast.info(t(`sales.contract.contractTerminatedNoFileUpload`), {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
      return;
    }

    const today = getCurrentDate().startOf('day'); // Start of the current day.
    const startDate = convertMMDDYYYYToDayJsDate(details?.startDate)?.startOf('day'); // Start of startDate

    if (startDate?.isBefore(today, 'date')) {
      // Compare the dates only if the start date is passed throw this error
      toast.info(t(`sales.contract.startDateBeforePublishingDate`), {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
      return;
    }

    setOpenPublishModal({ open: true, action });
  };
  const handleCloseConvert = () => setOpenPublishModal(initialpublishModalState);

  const closeDeleteContractModal = () => setDeleteContractModal(inititalDeleteContractModalState);

  // const publishStatusDropdownValue = isTerminated
  //   ? { ...publishedStatusOptions[2], label: `${publishedStatusOptions[2].label} ${terminatedAt}` }
  //   : publishedStatusOptions.find((option) => option.value === publishStatus);

  // const canPublishAndSign = publishStatus === publishStatuses.PUBLISHED_WITHOUT_SIGN && isUploaded;

  const currentPublishStatus = publishedStatusOptions?.find(
    (f) => f.value === (isTerminated ? publishStatuses.TERMINATED : publishStatus),
  );

  const handleViewContract = (action) => {
    if (action === ContractActions.PREVIEW_CONTRACT) fetchPDLLink();
    else if (action === ContractActions.PREVIEW_SIGNED_CONTRACT) fetchPDLLink(true);
  };

  const fetchPDLLink = async (fetchSignedPDFLink = false) => {
    try {
      setIsLoading(true);

      const response = fetchSignedPDFLink
        ? await getSignedContractPDF(dealId)
        : await getContractPDF(dealId);

      if (response.statusCode === 200) {
        const attachment = response?.data?.attachment;
        if (attachment) {
          setPreviewAttachmentUrl(attachment);
          setIsPreviewDialogOpen(true);
          return;
        }
        toast.info('Proposal preview is being prepared. Please try again in a moment.', {
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
      }
    } catch (error) {
      toast.error(error?.message, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createAddendumContract = async (id) => {
    try {
      setIsLoading(true);
      const response = await createDealAddendumContract(id);
      if (response?.statusCode === 200) {
        toast.success(response.message, {
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
        const { dealId } = response?.data || {};

        const addDealId = routes.SALES_DEAL_DETAIL_CONTRACT_DETAIL.replace(':id', dealId);

        const addContractId = addDealId.replace(':franchiseId', data?.franchiseInfo?.franchiseId);

        history.push(addContractId);
      }
    } catch (error) {
      toast.error(error?.message, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createCloneContract = async (id) => {
    try {
      setIsLoading(true);
      const response = await createDealCloneContract(id);
      if (response?.statusCode === 200) {
        toast.success(response.message, {
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
        const { dealId } = response?.data || {};

        const addDealId = routes.SALES_DEAL_DETAIL_CONTRACT_DETAIL.replace(':id', dealId);

        const addContractId = addDealId.replace(':franchiseId', data?.franchiseInfo?.franchiseId);

        history.push(addContractId);
      }
    } catch (error) {
      toast.error(error?.message, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenConfirmation = (action) => {
    if (action === ContractActions.DELETE_CONTRACT) {
      setDeleteContractModal({
        action,
        show: true,
        title: `${t('sales.contract.deleteProposal')}!`,
        text: t('sales.contract.deleteContractText'),
        confirmButtonText: t('sales.contract.deleteProposal'),
        icon: <DeleteAlter />,
        handleConfirmButton: handleTerminateContract,
      });
    } else if (action === ContractActions.TERMINATE_CONTRACT) {
      setDeleteContractModal({
        action,
        show: true,
        title: `${t('sales.contract.terminate')} ${contractName}`,
        text: t('sales.contract.terminateContractText'),
        confirmButtonText: t('sales.contract.terminateContract'),
        icon: <TerminateCircleIcon />,
        handleConfirmButton: handleTerminateContract,
      });
    }
  };

  const handleTerminateContract = async (payload = {}) => {
    try {
      setIsLoading(true);

      const response = await terminateContract(dealId, payload);
      if (response.statusCode === 200) {
        setContractData(response?.data?.contract ?? null);
      }
      closeDeleteContractModal();
    } catch (error) {
      toast.error(error?.message, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const _handleChangePublishStatus = async () => {
    try {
      setIsLoading(true);
      // const payload = { publishingStatus: publishStatuses.PUBLISHED_WITH_SIGN };
      const response = await publishContract(dealId, {});
      if (response.statusCode === 200) {
        setContractData(response?.data?.contract);
        /**
         * update amount in deal detail
         */
        setData((prevData) => ({
          ...prevData,
          amount: response?.data?.contract?.details?.amount,
        }));
        toast.success(response?.message, {
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
      }
    } catch (error) {
      if (error?.errorObj?.contract_duty_days_conflict) {
        history.push(`${SALES_DEAL}/${dealId}/contract/${franchiseId}`);
      }
      /**
       * if cycle reference date is not between start and enddate of contract
       */
      if (error?.errorObj?.cycle_ref_date_error) {
        history.push({
          pathname: `${SALES_DEAL}/${dealId}/contract/${franchiseId}`,
          state: { cycltRefError: true },
        });
      }
      // use the following url to redirect
      // sales/deals/deal/${dealId}/contract/${contractId}
      toast.error(error?.message, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // AddendumModal
  const handleOpenAddendumModal = () => {
    setAddendumModalOpen(true);
  };
  const handleCloseAddendumModal = () => {
    setAddendumModalOpen(false);
  };

  // CloneModal
  const handleOpenCloneModal = () => {
    setCloneModalOpen(true);
  };
  const handleCloseCloneModal = () => {
    setCloneModalOpen(false);
  };

  const toggleRequestSignatureModal = () => {
    setRequestSignatureModalOpen((a) => !a);
  };

  const updateSigneesSignatureStatus = (idsToUpdate, newStatus = 'Signed') => {
    setContractData((prevData) => {
      if (!prevData?.signees) return prevData;

      const updatedSignees = prevData?.signees?.map((signee) => {
        if (idsToUpdate?.includes(signee?.id)) {
          return {
            ...signee,
            signatureStatus: newStatus,
          };
        }
        return signee;
      });

      return {
        ...prevData,
        signees: updatedSignees,
      };
    });
  };

  // updateSigneesSignatureStatus([491], 'Pending Sign');

  const requestSignaturesFromSignees = async (selectedSignees) => {
    setDisabled(true);
    try {
      const payload = {
        signeeIds: selectedSignees,
      };
      const response = await requestSignatures(dealId, payload);
      if (response?.statusCode === 200) {
        // TODO: Change signee status in setContractData
        updateSigneesSignatureStatus(selectedSignees, 'Pending Sign');
        toast.success(response?.message, {
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
      }
    } catch (error) {
      toast.error(error?.message, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    } finally {
      setDisabled(false);
      toggleRequestSignatureModal();
    }
  };

  return (
    <>
      <Box className={classNames(classes.proposalSave, classes.proposalEdit)}>
        {isLoading && <LoaderComponent size={50} color={'primary'} label={t('sales.loading')} />}

        {isPublished && (
          <>
            <Box className={classes.drop}>
              {/*<CustomDropDown*/}
              {/*  name="publishStatus"*/}
              {/*  id="publishStatus"*/}
              {/*  options={[publishedStatusOptions[1]]}*/}
              {/*  selectedValues={publishStatusDropdownValue}*/}
              {/*  className={`${classes.dropHeader} ${publishStatusDropdownValue.className} ${canPublishAndSign ? classes.showArrows : ''}`}*/}
              {/*  bordered*/}
              {/*  handleChange={handleChangePublishStatus}*/}
              {/*  disabled={!canPublishAndSign}*/}
              {/*/>*/}

              <Chip
                label={
                  (isTerminated && terminatedAt
                    ? `${t(currentPublishStatus?.label)} ${formatDate(terminatedAt, dateFormat)}`
                    : `${t(currentPublishStatus?.label)}`) || NA
                }
                size="small"
                sx={currentPublishStatus?.chipStyles}
              />
              {contractType === contractTypeEnum.addendum && !isTerminated && (
                <Chip
                  label={
                    acknowledgedAt
                      ? t('sales.contract.acknowledged')
                      : t('sales.contract.notAcknowledged')
                  }
                  size="small"
                  color={acknowledgedAt ? 'primary' : 'error'}
                />
              )}
            </Box>
          </>
        )}
        <Box className={classes.proposalGrayBox}>
          <Box className={classes.proposalText}>
            <Box className={classes.dropDownSection}>
              <Box className={classes.headingColor}>
                <Typography variant="h4">{contractName}</Typography>
                &nbsp;•&nbsp;
                <Typography variant="h4">{`${symbol}${contractAmount} ${getPlan()}`}</Typography>
              </Box>
            </Box>

            {isTerminated && (
              <Box>
                <Typography variant="body2" className={classes.reasonText}>
                  <Box component="span" className={classes.reasonHeading}>
                    {t('sales.deals.reason')}
                  </Box>
                  : {''}
                  {details?.reason || NA}
                </Typography>
              </Box>
            )}
            <Box>
              <Typography variant="body2" className={classes.grayText}>
                {t('sales.contract.created')}{' '}
                {convertISODateTimeToMMMDoYYYY(details?.createdAt) || NA} • {t('sales.contract.by')}{' '}
                {details?.createdBy || NA}
              </Typography>
            </Box>
            <RenderIfHasPermission name={ACL_DEAL_CONTRACTS_UPDATE}>
              {canPublishContract &&
                !isTerminated &&
                dealStage?.value !== stageValues.CLOSED_LOST && (
                  <>
                    <Box className={classes.signButtons}>
                      {/*<Button*/}
                      {/*  variant="primary"*/}
                      {/*  onClick={() => handleOpenPublishModal(ContractActions.PUBLISH_WITH_SIGN)}*/}
                      {/*>*/}
                      {/*  {t('sales.contract.publishWithSign')}*/}
                      {/*</Button>*/}
                      <Button
                        variant="primary"
                        onClick={() => handleOpenPublishModal(ContractActions.PUBLISH_WITHOUT_SIGN)}
                      >
                        {t('sales.contract.publishContract')}
                      </Button>
                    </Box>
                  </>
                )}
            </RenderIfHasPermission>
          </Box>

          <Box className={classes.editPublishBtn}>
            <RenderIfHasPermission name={ACL_DEAL_CONTRACTS_UPDATE}>
              {details?.hasPendingSignatures && (
                <>
                  <Button
                    className={classes.requestSignaturesButton}
                    variant="textOnly"
                    endIcon={<KeyboardArrowDown sx={{ fontSize: 20 }} />}
                    onClick={(e) => setSignatureMenuAnchor(e.currentTarget)}
                    aria-controls={signatureMenuOpen ? 'signature-menu' : undefined}
                    aria-haspopup="true"
                    aria-expanded={signatureMenuOpen ? 'true' : undefined}
                  >
                    {t('sales.deals.signature')}
                  </Button>
                  <Menu
                    id="signature-menu"
                    anchorEl={signatureMenuAnchor}
                    open={signatureMenuOpen}
                    onClose={() => setSignatureMenuAnchor(null)}
                    MenuListProps={{
                      'aria-labelledby': 'signature-button',
                    }}
                    anchorOrigin={{
                      vertical: 'bottom',
                      horizontal: 'left',
                    }}
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'left',
                    }}
                    PaperProps={{
                      className: classes.signatureMenuPaper,
                    }}
                  >
                    <MenuItem
                      className={classes.signatureMenuItem}
                      onClick={() => {
                        setSignatureMenuAnchor(null);
                        setAddSignModalOpen(true);
                      }}
                    >
                      <AddIcon />
                      {t('sales.contract.addSign')}
                    </MenuItem>
                    <MenuItem
                      className={classes.signatureMenuItem}
                      onClick={() => {
                        setSignatureMenuAnchor(null);
                        toggleRequestSignatureModal();
                      }}
                    >
                      <SendIcon />
                      {t('sales.contract.requestSign')}
                    </MenuItem>
                  </Menu>
                </>
              )}
            </RenderIfHasPermission>

            <RenderIfHasPermission name={ACL_DEAL_CONTRACTS_UPDATE}>
              {isEditable && (
                <Tooltip title={t('sales.deals.editTooltip')} arrow>
                  <Box className={classes.editIcon} onClick={handleShowContractForm}>
                    <EditTermIcon />
                  </Box>
                </Tooltip>
              )}
            </RenderIfHasPermission>

            {isPublished && (
              <>
                {/* <RenderIfHasPermission name={ACL_DEAL_CONTRACTS_VIEW}> */}
                <Tooltip title={t('sales.deals.viewTooltip')} arrow>
                  <Box className={classes.editIcon} onClick={handleShowContractForm}>
                    <EyeIcon />
                  </Box>
                </Tooltip>
                {/* </RenderIfHasPermission> */}
                <RenderIfHasPermission name={ACL_DEAL_CONTRACTS_CREATE}>
                  {!hasAddendum &&
                    !isTerminated &&
                    !hasEnded &&
                    !enableOccurences &&
                    checkIfContractIsAddendumAble() && (
                      <Tooltip title={t('sales.deals.addendumTooltip')} arrow>
                        <Box className={classes.editIcon} onClick={handleOpenAddendumModal}>
                          <AdendumIcon />
                        </Box>
                      </Tooltip>
                    )}
                </RenderIfHasPermission>
                {isAddendumModalOpen && (
                  <AddendumModal
                    open={isAddendumModalOpen}
                    handleCancelButton={handleCloseAddendumModal}
                    handleConfirmButton={(e) => {
                      e.preventDefault();
                      createAddendumContract(dealId);
                    }}
                    confirmButtonText={`${t('sales.contract.proceed')}`}
                    cancelButtonText={`${t('sales.contract.cancel')}`}
                    disabled={false}
                    icon={<WarningIcon />}
                    modalType={contractTypeEnum.addendum}
                  />
                )}
              </>
            )}
            {!enableOccurences && (
              <RenderIfHasPermission name={ACL_DEAL_CONTRACTS_CREATE}>
                <Tooltip title={t('sales.deals.cloneTooltip')} arrow>
                  <Box className={classes.editIcon} onClick={handleOpenCloneModal}>
                    <CloneIcon />
                  </Box>
                </Tooltip>
              </RenderIfHasPermission>
            )}
            {isCloneModalOpen && (
              <AddendumModal
                open={isCloneModalOpen}
                handleCancelButton={handleCloseCloneModal}
                handleConfirmButton={(e) => {
                  e.preventDefault();
                  createCloneContract(dealId);
                }}
                confirmButtonText={`${t('sales.contract.proceed')}`}
                cancelButtonText={`${t('sales.contract.cancel')}`}
                disabled={false}
                icon={<WarningIcon />}
                modalType={contractTypeEnum.clone}
              />
            )}
            <RenderIfHasPermission name={ACL_DEAL_CONTRACTS_VIEW}>
              <Tooltip title={t('sales.deals.previewPdfTooltip')} arrow>
                <Box
                  className={classes.editIcon}
                  onClick={() => handleViewContract(ContractActions.PREVIEW_CONTRACT)}
                >
                  <ContactPdfIcon />
                </Box>
              </Tooltip>
            </RenderIfHasPermission>
            {!isTerminated && (
              <Box
                className={classes.deleteBtn}
                onClick={() =>
                  handleOpenConfirmation(
                    isPublished
                      ? ContractActions.TERMINATE_CONTRACT
                      : ContractActions.DELETE_CONTRACT,
                  )
                }
              >
                {isPublished ? (
                  <>
                    {!enableOccurences && (
                      <RenderIfHasPermission name={ACL_DEAL_CONTRACTS_UPDATE}>
                        <Tooltip title="Terminate" arrow>
                          <Box className={classes.deleteBtn}>
                            <ContractTerminateIcon />
                          </Box>
                        </Tooltip>
                      </RenderIfHasPermission>
                    )}
                  </>
                ) : (
                  <RenderIfHasPermission name={ACL_DEAL_CONTRACTS_DELETE}>
                    <Tooltip title={t('sales.deals.deleteTooltip')} arrow>
                      <Box className={classes.deleteBtn}>
                        <DeleteIcon />
                      </Box>
                    </Tooltip>
                  </RenderIfHasPermission>
                )}
              </Box>
            )}

            {deleteContractModal.show && (
              <TerminateModal
                showReason={deleteContractModal.action === ContractActions.TERMINATE_CONTRACT}
                title={deleteContractModal.title}
                text={deleteContractModal.text}
                icon={deleteContractModal.icon}
                confirmButtonText={deleteContractModal.confirmButtonText}
                cancelButtonText={t('sales.contract.no')}
                open={deleteContractModal.show}
                handleConfirmButton={deleteContractModal.handleConfirmButton}
                handleCancelButton={closeDeleteContractModal}
                showDate={true}
                contractDetail={details}
              />
            )}
          </Box>
        </Box>
        {/*{isPublished && (*/}
        {/*  <Box className={classes.mainOpenSection}>*/}
        {/*    /!* <Typography variant="h4"> {t('sales.contract.contract')}</Typography> *!/*/}
        {/*    <Box className={classes.mainPdfSection}>*/}
        {/*      {isUploaded ? (*/}
        {/*        <Box className={classes.pdfBox}>*/}
        {/*          <Box className={classes.innerPdfContract}>*/}
        {/*            <Box className={classes.outerPdfBox}>*/}
        {/*              <Box className={classes.pdfContracts}>*/}
        {/*                <Box className={classes.IconPdf}>*/}
        {/*                  <PdfIcon />*/}
        {/*                </Box>*/}

        {/*                <Box>*/}
        {/*                  <Typography variant="h4">{t('sales.contract.contractPdf')}</Typography>*/}
        {/*                  <Typography variant="body3" className={classes.grayText}>*/}
        {/*                    {t('sales.contract.created')}{' '}*/}
        {/*                    {convertISODateTimeToMMMDoYYYY(details?.createdAt) || NA} •{' '}*/}
        {/*                    {t('sales.contract.by')} {details?.createdBy || NA}*/}
        {/*                  </Typography>*/}
        {/*                </Box>*/}
        {/*              </Box>*/}
        {/*              <Box>*/}
        {/*                <PopoverButton*/}
        {/*                  className={classes.questionBankActions}*/}
        {/*                  variant="icon"*/}
        {/*                  Icon={MoreVert}*/}
        {/*                >*/}
        {/*                  <Box className={classes.questionBankActionsMenu}>*/}
        {/*                    <Box*/}
        {/*                      className={classes.questionBankActionsRegular}*/}
        {/*                      onClick={() =>*/}
        {/*                        handleViewContract(ContractActions.PREVIEW_SIGNED_CONTRACT)*/}
        {/*                      }*/}
        {/*                    >*/}
        {/*                      <DownloadIcon className={classes.questionBankActionsIconRegular} />*/}
        {/*                      <Typography*/}
        {/*                        className={classes.questionBankActionsTextRegular}*/}
        {/*                        variant="subtitle2"*/}
        {/*                      >*/}
        {/*                        {t('sales.contract.previewPDF')}*/}
        {/*                      </Typography>*/}
        {/*                    </Box>*/}
        {/*                    {!isTerminated && (*/}
        {/*                      <Box*/}
        {/*                        className={classes.questionBankActionsRegular}*/}
        {/*                        onClick={() =>*/}
        {/*                          handleOpenPublishModal(ContractActions.REPLACE_SIGNED_CONTRACT)*/}
        {/*                        }*/}
        {/*                      >*/}
        {/*                        <ReplaceIcon className={classes.questionBankActionsIconRegular} />*/}
        {/*                        <Typography*/}
        {/*                          className={classes.questionBankActionsTextRegular}*/}
        {/*                          variant="subtitle2"*/}
        {/*                        >*/}
        {/*                          {t('sales.contract.replaceCopy')}*/}
        {/*                        </Typography>*/}
        {/*                      </Box>*/}
        {/*                    )}*/}
        {/*                  </Box>*/}
        {/*                </PopoverButton>*/}
        {/*              </Box>*/}
        {/*            </Box>*/}

        {/*            /!* <Box className={classes.signalPdfContent}>*/}
        {/*              <Box className={classes.pdfTop}>*/}
        {/*                <Typography variant="overline"> {contractName}</Typography>*/}
        {/*              </Box>*/}
        {/*              <Box className={classes.pdfcenter}>*/}
        {/*                <SignalIcon className={classes.signalLogo} />*/}
        {/*                <Typography variant="h5"> {t('sales.contract.pdfLabel')}</Typography>*/}
        {/*                <Box className={classes.pdfBottom}>*/}
        {/*                  <Typography variant="body3">{contractName}</Typography>*/}
        {/*                </Box>*/}
        {/*              </Box>*/}
        {/*            </Box> *!/*/}
        {/*          </Box>*/}
        {/*        </Box>*/}
        {/*      ) : (*/}
        {/*        <Box*/}
        {/*          className={classes.pdfUploadSection}*/}
        {/*          onClick={() => handleOpenPublishModal(ContractActions.PUBLISH_WITH_SIGN)}*/}
        {/*        >*/}
        {/*          <Box className={classes.uploadInnerContent}>*/}
        {/*            <UploadPdfIcon></UploadPdfIcon>*/}
        {/*            <Typography variant="h4">*/}
        {/*              {' '}*/}
        {/*              {t('sales.contract.uploadSignedContract')}*/}
        {/*            </Typography>*/}
        {/*            <Typography variant="body2" className={classes.grayText}>*/}
        {/*              {t('sales.contract.PdfText')}*/}
        {/*            </Typography>*/}
        {/*          </Box>*/}
        {/*        </Box>*/}
        {/*      )}*/}
        {/*    </Box>*/}
        {/*  </Box>*/}
        {/*)}*/}
      </Box>
      {addSignModalOpen && (
        <AddSignModal
          open={addSignModalOpen}
          handleClose={() => setAddSignModalOpen(false)}
          contractData={contractData}
          onAddSignClick={(signee) => {
            setSelectedSigneeForSign(signee);
            setAddSignModalOpen(false);
            setSignContractModalOpen(true);
          }}
        />
      )}
      {signContractModalOpen && selectedSigneeForSign && (
        <SignContractModal
          open={signContractModalOpen}
          handleCancelButton={() => {
            setSignContractModalOpen(false);
            setSelectedSigneeForSign(null);
          }}
          handleConfirmButton={async (payload) => {
            setDisabled(true);
            const signeeResourceId = selectedSigneeForSign?.resourceId ?? selectedSigneeForSign?.id;
            try {
              const response = await signContract(signeeResourceId, payload);
              if (response?.statusCode === 200) {
                updateSigneesSignatureStatus([selectedSigneeForSign?.id], 'Signed');
                toast.success(
                  t('sales.contract.contractSignedSuccessfully') || 'Contract signed successfully',
                  {
                    position: 'top-right',
                    autoClose: toastSettings.AUTO_CLOSE,
                  },
                );
                setSignContractModalOpen(false);
                setSelectedSigneeForSign(null);
              }
            } catch (error) {
              toast.error(error?.message, {
                position: 'top-right',
                autoClose: toastSettings.AUTO_CLOSE,
              });
            } finally {
              setDisabled(false);
            }
          }}
          confirmButtonText={t('sales.contract.signContract')}
          cancelButtonText={t('sales.contract.cancel')}
          disabled={disabled}
          signee={selectedSigneeForSign}
          resourceId={selectedSigneeForSign?.resourceId ?? selectedSigneeForSign?.id}
        />
      )}
      {requestSignatureModalOpen && (
        <RequestSignatureModal
          open={requestSignatureModalOpen}
          handleCancelButton={toggleRequestSignatureModal}
          handleConfirmButton={(e, selectedSignees) => {
            e.preventDefault();
            requestSignaturesFromSignees(selectedSignees);
          }}
          confirmButtonText={`Request Signatures`}
          cancelButtonText={`${t('sales.contract.cancel')}`}
          disabled={disabled}
          icon={<WarningIcon />}
          contractData={contractData}
        />
      )}
      {openPublishModal.open && (
        <PublishContractModal
          openHandle={openPublishModal.open}
          action={openPublishModal.action}
          closeHandle={handleCloseConvert}
          dealId={dealId}
          setContractData={setContractData}
          contractData={contractData}
          areDatesFilled={!!details.startDate}
          isUploadAfterPublishFlow={!isUploaded && isPublished}
          isEventPlan={plan == PlanTypeEnums.EVENT}
          franchiseId={franchiseId}
          setData={setData}
          enableOccurences={enableOccurences}
        />
      )}
      <Dialog
        open={isPreviewDialogOpen}
        onClose={() => {
          setIsPreviewDialogOpen(false);
          setPreviewAttachmentUrl('');
        }}
        maxWidth="lg"
        fullWidth
        aria-labelledby="deal-contract-preview-dialog-title"
      >
        <DialogTitle id="deal-contract-preview-dialog-title">
          {t('sales.contract.previewPDF')}
        </DialogTitle>
        <DialogContent dividers>
          {previewAttachmentUrl ? (
            <Box
              component="iframe"
              src={previewAttachmentUrl}
              title={t('sales.contract.contractPdf')}
              sx={{ width: '100%', height: '70vh', border: 0 }}
            />
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button
            variant="secondaryGrey"
            onClick={() => {
              setIsPreviewDialogOpen(false);
              setPreviewAttachmentUrl('');
            }}
          >
            {t('sales.contract.cancel')}
          </Button>
          <Button
            variant="primary"
            onClick={() => openFile(t('sales.contract.contractPdf'), previewAttachmentUrl)}
            disabled={!previewAttachmentUrl}
          >
            {t('sales.contract.previewPDF')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

DealContract.propTypes = {
  contractData: PropTypes.object,
  setContractData: PropTypes.func,
  handleShowContractForm: PropTypes.func,
  franchiseId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  dealId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  setData: PropTypes.func,
  data: PropTypes.object,
  handleCreateAddendumContract: PropTypes.func,
  enableOccurences: PropTypes.bool,
  stripeEnabled: PropTypes.bool,
};

export default DealContract;
