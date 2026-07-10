import { Box, Skeleton, Stack, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { getContractChangeHistory } from 'services/deal.service';
import { ReactComponent as ArrowNextIcon } from 'src/assets/svg/arrowNext.svg';
import { ReactComponent as DotIcon } from 'src/assets/svg/dot.svg';
import { toastSettings } from 'src/utils/constants';

import { useStyles } from './publishContractModal';

const ContractAddendumServices = ({ dealId }) => {
  const classes = useStyles();
  const { t } = useTranslation();

  const [changeHistory, setChangeHistory] = useState({});
  const [loading, setLoading] = useState(false);

  const checkIfChangeMade = (changeHistory) => {
    return !!(
      changeHistory?.services?.length ||
      changeHistory?.onDemandServices?.length ||
      changeHistory?.paymentTerms?.changes?.length ||
      changeHistory?.devices?.length
    );
  };

  const getChangesHistory = async () => {
    try {
      setLoading(true);
      const response = await getContractChangeHistory(dealId);
      if (response.statusCode === 200) {
        setChangeHistory(response?.data?.changeHistory);
        setLoading(false);
      }
    } catch (error) {
      /**
       * show error
       */
      setLoading(false);
      toast.error(error?.message, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  useEffect(() => {
    getChangesHistory();
  }, []);

  return (
    <>
      {loading ? (
        <>
          <Stack spacing={1}>
            <Skeleton variant="rectangular" width={150} height={20} />
            <Skeleton variant="text" width={100} sx={{ fontSize: '1rem' }} />
            <Skeleton variant="rectangular" height={30} />
            <Skeleton variant="rectangular" height={30} />
            <Skeleton variant="text" width={100} sx={{ fontSize: '1rem' }} />
            <Skeleton variant="rectangular" height={30} />
            <Skeleton variant="rectangular" height={30} />
          </Stack>
        </>
      ) : (
        <Box className={classes.addendumServiceChargesWrapper}>
          {checkIfChangeMade(changeHistory) ? (
            <Typography variant="body2" className={classes.serviceTagline}>
              {t('sales.contract.serviceTitle')}
            </Typography>
          ) : (
            <Typography variant="body2" className={classes.serviceTagline}>
              {t('sales.contract.noChangeMade')}
            </Typography>
          )}

          {changeHistory?.services?.length > 0 && (
            <Box className={classes.box}>
              <Typography variant="h5" className={classes.serviceTitle}>
                {t('sales.contract.serviceChanges')}
              </Typography>
              {changeHistory?.services?.map((changedServices, sIndex) => (
                <>
                  <Box className={classes.ServicesBox} key={sIndex}>
                    <Typography variant="subtitle2" className={classes.servicesubTitle}>
                      {changedServices?.serviceName}
                    </Typography>
                    {/* list? */}
                    {changedServices?.changes?.map((change, index) => (
                      <Box className={classes.serviceListItem} key={`${sIndex} - ${index}`}>
                        <Typography variant="subtitle2" className={classes.serviceName}>
                          {change?.key}
                        </Typography>
                        <Box className={classes.valueBox}>
                          {change?.old && (
                            <>
                              <Typography
                                variant="body2"
                                className={classes.minValue}
                                sx={{ textDecoration: 'line-through' }}
                              >
                                {change?.old}
                              </Typography>
                            </>
                          )}
                          {change?.new && change?.old && (
                            <>
                              <ArrowNextIcon />
                            </>
                          )}
                          {change?.new && (
                            <>
                              <Typography variant="body2" className={classes.maxValue}>
                                {change?.new}
                              </Typography>
                            </>
                          )}
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </>
              ))}
            </Box>
          )}
          {/* Devices*/}
          {changeHistory?.devices?.length > 0 && (
            <DeviceSection devices={changeHistory?.devices || []} />
          )}
          {/* OnDemand Service?*/}
          {changeHistory?.onDemandServices?.length > 0 && (
            <OnDemandServiceSection onDemandServices={changeHistory?.onDemandServices || {}} />
          )}
          {/* //payment Terms */}
          {changeHistory?.paymentTerms?.changes?.length > 0 && (
            <PaymentTerms paymentTermsChanges={changeHistory.paymentTerms?.changes || []} />
          )}
        </Box>
      )}
    </>
  );
};

export default ContractAddendumServices;

const DeviceSection = ({ devices }) => {
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <Box className={classes.box}>
      <Box className={classes.demandBox}>
        <Typography variant="h5" className={classes.serviceTitle}>
          {t('sales.contract.devices')}
        </Typography>
        <Box className={classes.deviceListWrapper}>
          {devices?.map((device, index) => (
            <Box className={classes.deviceList} key={index}>
              <Box className={classes.nfc}>
                {/*<NfcIcon/>*/}
                <img src={device?.imageUrl} className={classes.deviceIcons} />
                <Typography variant="subtitle2" className={classes.serviceNameDemand}>
                  {device?.name}
                </Typography>
              </Box>
              <DotIcon />
              <Typography variant="subtitle2" className={classes.serviceNameDemand}>
                {device?.price}
              </Typography>
              <DotIcon />
              <Typography variant="body2" className={classes.serviceNameDemand}>
                Quantity X {device?.quantity} / Month
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

const OnDemandServiceSection = ({ onDemandServices }) => {
  const classes = useStyles();

  const { t } = useTranslation();

  return (
    <>
      {onDemandServices?.length > 0 && (
        <Box className={classes.box}>
          <Typography variant="h5" className={classes.serviceTitle}>
            {t('sales.contract.onDemandServices')}
          </Typography>
          {onDemandServices?.map((changedServices, sIndex) => (
            <>
              <Box className={classes.ServicesBox} key={sIndex}>
                {/* list? */}
                {changedServices?.changes?.map((change, index) => (
                  <Box className={classes.serviceListItem} key={`${sIndex} - ${index}`}>
                    <Typography variant="subtitle2" className={classes.serviceName}>
                      {change?.key}
                    </Typography>
                    <Box className={classes.valueBox}>
                      {change?.old && (
                        <>
                          <Typography
                            variant="body2"
                            className={classes.minValue}
                            sx={{ textDecoration: 'line-through' }}
                          >
                            {change?.old}
                          </Typography>
                        </>
                      )}
                      {change?.new && change?.old && (
                        <>
                          <ArrowNextIcon />
                        </>
                      )}
                      {change?.new && (
                        <>
                          <Typography variant="body2" className={classes.maxValue}>
                            {change?.new}
                          </Typography>
                        </>
                      )}
                    </Box>
                  </Box>
                ))}
              </Box>
            </>
          ))}
        </Box>
      )}
    </>
  );
};

const PaymentTerms = ({ paymentTermsChanges }) => {
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <Box className={classes.box}>
      <Typography variant="h5" className={classes.serviceTitle}>
        {t('sales.contract.paymentTerm')}
      </Typography>
      <Box className={classes.ServicesBox}>
        {/* list? */}
        {paymentTermsChanges?.map((change, index) => (
          <Box className={classes.serviceListItem} key={index}>
            <Typography variant="subtitle2" className={classes.serviceNamePayment}>
              {change?.key}
            </Typography>
            <Box className={classes.valueBox}>
              <Typography variant="body2" className={classes.minValue}>
                {change?.old}
              </Typography>
              <ArrowNextIcon />
              <Typography variant="body2" className={classes.maxValue}>
                {change?.new}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

DeviceSection.propTypes = {
  devices: PropTypes.array,
};

OnDemandServiceSection.propTypes = {
  onDemandServices: PropTypes.object,
};

PaymentTerms.propTypes = {
  paymentTermsChanges: PropTypes.array,
};

ContractAddendumServices.propTypes = {
  dealId: PropTypes.string,
};
