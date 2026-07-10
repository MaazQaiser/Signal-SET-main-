import { Box, InputLabel } from '@mui/material';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import CustomDropDown from 'src/app/components/common/customDropDown';
import RequiredAsterik from 'src/app/components/common/requiredAsterik';
import { getLocationOptions } from 'src/services/location.service';
import transformArrayForOptions from 'src/utils/array/transformArrayForOptions';
import { toastSettings } from 'src/utils/constants';

import { useStyles } from './style';

const PropertyDropDown = ({ name, property, filter, onChange, required, isError, error }) => {
  const { t } = useTranslation();
  const classes = useStyles();

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchProperty = async (_refresh, search, status) => {
    if (status === 'close') return;
    setLoading(true);
    try {
      const result = await getLocationOptions({ search, ...filter });
      setProperties(transformArrayForOptions(result.data.location_options, 'name', 'id') || []);
    } catch (error) {
      toast.error(error?.message, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProperty();
  }, [filter]);

  return (
    <Box className={`${classes.fieldWrapper}  ${classes.dropdownCommonSection}`}>
      <InputLabel htmlFor={name}>
        {t('sales.locations.propertyName')} {required && <RequiredAsterik />}
      </InputLabel>
      <CustomDropDown
        name={name}
        id={name}
        placeHolder={t('sales.locations.propertyNamePlaceholder')}
        placeHolderClassName={classes?.placeHolderColor}
        options={properties || []}
        selectedValues={property || {}}
        handleChange={onChange}
        className={classes.dropdownWrap}
        disabled={loading}
        bordered
        searchable
        fetchMoreOptions={fetchProperty}
        isError={isError}
        error={error}
      />
      <span className="errorMessage">{error}</span>
    </Box>
  );
};

PropertyDropDown.propTypes = {
  name: PropTypes.string,
  onChange: PropTypes.func,
  property: PropTypes.object,
  filter: PropTypes.object,
  required: PropTypes.bool,
  isError: PropTypes.bool,
  error: PropTypes.string,
};

export default PropertyDropDown;
