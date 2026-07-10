import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getCitiesOptions, getStatesOptions } from 'src/services/location.service';

const useRegionalStateCityHook = () => {
  const { selectedCountry } = useSelector((state) => state.regionalCountryConfiguration);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStates();
  }, [selectedCountry]);

  const fetchStates = async () => {
    if (selectedCountry?.country?.value) {
      setLoading(true);
      const response = await getStatesOptions({ countryIds: [selectedCountry.country.value] });
      if (response?.statusCode === 200) {
        setStates(
          response.data?.states?.map((item) => ({ label: item.name, value: item.id })) || [],
        );
        setCities([]);
      }
      setLoading(false);
    }
  };

  const fetchCities = async (stateIds) => {
    if (stateIds) {
      setLoading(true);
      const response = await getCitiesOptions({ stateIds });
      if (response?.statusCode === 200) {
        setCities(
          response.data?.cities?.map((item) => ({ label: item.name, value: item.id })) || [],
        );
      }
      setLoading(false);
    } else {
      setCities([]);
    }
  };

  return {
    states,
    cities,
    fetchCities,
    loading,
    selectedCountry,
  };
};

export default useRegionalStateCityHook;
