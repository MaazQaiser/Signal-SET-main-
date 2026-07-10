import LoaderComponent from 'commonComponents/loader';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { useHistory, useParams } from 'react-router-dom/cjs/react-router-dom.min';
import { toast } from 'react-toastify';
import ContractCreation from 'salesPages/contractCreation';
import { getContractDetails } from 'services/deal.service';
import * as routes from 'src/app/router/constant/ROUTE';
import { clearApiServicesData } from 'src/redux/store/slices/contractServices';
import { toastSettings } from 'src/utils/constants';

const ContractDetails = () => {
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();
  const history = useHistory();

  const [contractData, setContractData] = useState(null);
  const tenantPermissions = useSelector((state) => state.auth.tenantPermissions);
  const enableOccurences = tenantPermissions?.enableOccurences || false;
  const stripeEnabled = tenantPermissions?.stripeEnabled || false;
  const taxExemptionEnabled = tenantPermissions?.enableTaxExempt || false;

  const dispatch = useDispatch();

  const { id: dealId, franchiseId } = useParams();
  const fetchContractDetails = async () => {
    try {
      setContractData(null);
      dispatch(clearApiServicesData());
      setLoading(true);
      const response = await getContractDetails(dealId);
      if (response.statusCode === 200) {
        setContractData(response?.data?.contract);
      }
    } catch (error) {
      toast.error(error?.message, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContractDetails();
  }, []);

  return (
    <>
      {loading && <LoaderComponent size={50} color={'primary'} label={t('sales.loading')} />}
      <ContractCreation
        data={contractData}
        setData={setContractData}
        dealId={dealId}
        franchiseId={franchiseId}
        fetchContractDetails={fetchContractDetails}
        handleContractCompleted={() => {
          history.push(routes.SALES_DEAL_DETAIL.replace(':id', dealId));
        }}
        enableOccurences={enableOccurences}
        stripeEnabled={stripeEnabled}
        taxExemptionEnabled={taxExemptionEnabled}
      />
    </>
  );
};
export default ContractDetails;
