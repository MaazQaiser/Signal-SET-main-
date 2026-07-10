import { Box, InputLabel } from '@mui/material';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import CustomDropDown from 'src/app/components/common/customDropDown';
import FieldError from 'src/app/components/common/fieldError';
import RequiredAsterik from 'src/app/components/common/requiredAsterik';
import { getContactOptions } from 'src/services/contact.service';
import transformArrayForOptions from 'src/utils/array/transformArrayForOptions';
import { toastSettings } from 'src/utils/constants';

import { useStyles } from './style';

const ContactDropDown = ({ name, contact, onChange, filter, required, error }) => {
  const { t } = useTranslation();
  const classes = useStyles();

  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchContact = async (search, status) => {
    if (status === 'close') return;
    setLoading(true);
    try {
      const result = await getContactOptions({ search, ...filter });
      setContacts(transformArrayForOptions(result.data.contact_options, 'name', 'id'));
    } catch (error) {
      toast.error(error?.message, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    if (filter?.locationId) {
      fetchContact();
    }
  }, [filter]);

  return (
    <Box className={`${classes.fieldWrapper}  ${classes.dropdownCommonSection}`}>
      <InputLabel htmlFor={name}>
        {t('sales.deals.contact')} {required && <RequiredAsterik />}
      </InputLabel>
      <CustomDropDown
        name={name}
        id={name}
        placeHolder={t('sales.deals.contact')}
        placeHolderClassName={classes?.placeHolderColor}
        options={contacts || []}
        selectedValues={contact || {}}
        handleChange={onChange}
        className={classes.dropdownWrap}
        disabled={loading}
        bordered
        searchable
        // fetchMoreOptions={fetchContact}
      />
      <FieldError error={!!error && error} />
    </Box>
  );
};

ContactDropDown.propTypes = {
  name: PropTypes.string,
  onChange: PropTypes.func,
  contact: PropTypes.object,
  filter: PropTypes.object,
  required: PropTypes.bool,
  isError: PropTypes.bool,
  error: PropTypes.object,
};

export default ContactDropDown;
