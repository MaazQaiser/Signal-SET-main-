import { Box, Button } from '@mui/material';
import LoaderComponent from 'commonComponents/loader';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { getContractToSign, signContract } from 'services/deal.service';
import PDFViewDrawer from 'src/app/obx/pages/reports/components/pdfViewDrawer';
import SignContractModal from 'src/app/public/pages/signContract/signContractModal';
import { isObjectEmpty } from 'src/helper/utilityFunctions';
import { toastSettings } from 'src/utils/constants';

import { useStyles } from './signContract.styles';

const SignContract = ({ resourceId: resourceIdProp }) => {
  const { t } = useTranslation();

  const classes = useStyles();

  const searchParams = new URLSearchParams(window.location.search);

  const resourceIdFromUrl = searchParams.get('resource');
  const resourceId = resourceIdProp ?? resourceIdFromUrl;

  const [state, setState] = useState({});

  const [disabled, setDisabled] = useState(false);

  const [signatureModalOpen, setSignatureModalOpen] = useState(false);

  const [loading, setLoading] = useState(false);

  const toggleSignatureModal = () => {
    setSignatureModalOpen((a) => !a);
  };

  const getContractDetail = async () => {
    setLoading(true);
    try {
      const response = await getContractToSign(resourceId);
      if (response?.statusCode === 200) {
        setState(response?.data);
      }
    } catch (error) {
      console.log({ error });
      toast.error(error?.message, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    } finally {
      setLoading(false);
    }
  };

  const signTheContract = async (payload) => {
    if (!payload?.signature?.length) {
      toast.error('Signatures are required', {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
      return;
    }

    try {
      setDisabled(true);
      const response = await signContract(resourceId, payload);
      if (response?.statusCode === 200) {
        toast.success(response.message, {
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
        setState((prev) => ({
          ...prev,
          signee: {
            ...prev?.signee,
            signatureStatus: 'Signed',
          },
        }));
      }
    } catch (error) {
      toast.error(error?.message, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    } finally {
      setDisabled(false);
      toggleSignatureModal();
    }
  };

  useEffect(() => {
    if (resourceId) {
      getContractDetail();
    }
  }, [resourceId]);

  return (
    <Box className={classes.faq}>
      {loading && <LoaderComponent size={50} color={'primary'} label={'Loading'} />}

      {!isObjectEmpty(state?.signee) && state?.signee?.signatureStatus !== 'Signed' && (
        <Box className={classes.signContractBtnWrapper}>
          <Button
            onClick={toggleSignatureModal}
            disableRipple
            className={classes.signContractBtn}
            variant="primary"
            // disabled={isObjectEmpty(state?.signee)}
          >
            Sign Contract
          </Button>
        </Box>
      )}
      <Box className={classes.pdfViewDrawerWrapper}>
        {!isObjectEmpty(state) && (
          <PDFViewDrawer url={state?.contract?.attachment} showCloseButton={false} />
        )}
      </Box>
      {signatureModalOpen && (
        <SignContractModal
          open={signatureModalOpen}
          handleCancelButton={toggleSignatureModal}
          handleConfirmButton={signTheContract}
          confirmButtonText={`Sign Contract`}
          cancelButtonText={`${t('sales.contract.cancel')}`}
          disabled={disabled}
          signee={state?.signee}
          contractId={resourceId}
        />
      )}
    </Box>
  );
};

SignContract.propTypes = {
  resourceId: PropTypes.string,
};

SignContract.defaultProps = {
  resourceId: undefined,
};

export default SignContract;
