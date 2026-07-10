import { InputLabel, TextField } from '@mui/material';
import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import * as React from 'react';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import RequiredAsterik from 'src/app/components/common/requiredAsterik';
import joiValidate from 'src/utils/formValidator/formValidator.requiredCheck.js';

import DrawerFooter from '../../../components/drawerFooter/index.jsx';
import DrawerHeader from '../../../components/drawerHeader/index.jsx';
import { useStyles } from './addSigneeDrawer.js';

export const FormKeys = {
  NAME: 'name',
  TITLE: 'title',
  EMAIL: 'email',
};

const emptyState = {
  [FormKeys.NAME]: '',
  [FormKeys.TITLE]: '',
  [FormKeys.EMAIL]: '',
};

const AddSigneeDrawer = ({ anchor, filterCloseDrawer, width, addSignee, editData }) => {
  const { t } = useTranslation();
  const classes = useStyles();
  // console.log({ editData });
  const [signee, setSignee] = useState(editData || emptyState);
  const [errorMessages, setErrorMessages] = useState({});

  /**
   * common function to update data to signee object
   */
  const updateFormHandler = useCallback(
    (name, value) => {
      setSignee((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    },
    [setSignee],
  );

  const inputChangedHandler = (event) => {
    const { name, value } = event.target;
    if (value) {
      const { [name]: _, ...rest } = errorMessages;
      setErrorMessages(rest);
    }
    updateFormHandler(name, value);
  };

  const handleAddSignee = async () => {
    const errors = await joiValidate(signee, t);
    if (errors && Object.keys(errors).length) {
      setErrorMessages(errors);
      return;
    }

    addSignee(signee);
  };

  return (
    <Box
      className={classes?.siderBarBox}
      sx={{ width: anchor === 'top' || anchor === 'bottom' ? 'auto' : width }}
      role="presentation"
    >
      <Box className={classes?.sideHeader}>
        <DrawerHeader
          title={editData ? t('sales.contract.editsignee') : t('sales.contract.addSignee')}
          handleCloseDrawer={filterCloseDrawer}
          anchor={anchor}
          className={classes.moreFilterHeader}
        />
      </Box>
      <Box className={classes?.moreFilterForm}>
        <Box className={classes?.fieldWrapper}>
          <InputLabel htmlFor="SigneeName">
            {t('sales.contract.SigneeName')}
            <RequiredAsterik />
          </InputLabel>
          <TextField
            name={FormKeys.NAME}
            id={FormKeys.NAME}
            fullWidth
            value={signee[FormKeys.NAME]}
            onChange={inputChangedHandler}
            placeholder={t('sales.contract.addSigneeName')}
            type="text"
            className={classes?.textFiledFilter}
            error={!!errorMessages[FormKeys.NAME]}
            helperText={errorMessages[FormKeys.NAME]}
            inputProps={{ maxLength: 55 }}
          />
        </Box>
        <Box className={classes?.fieldWrapper}>
          <InputLabel htmlFor="signeeTitle">
            {t('sales.contract.signeeTitle')}
            <RequiredAsterik />
          </InputLabel>
          <TextField
            name={FormKeys.TITLE}
            id={FormKeys.TITLE}
            fullWidth
            value={signee[FormKeys.TITLE]}
            onChange={inputChangedHandler}
            placeholder={t('sales.contract.addSigneeTitle')}
            type="text"
            className={classes?.textFiledFilter}
            error={errorMessages[FormKeys.TITLE]}
            helperText={errorMessages[FormKeys.TITLE]}
            inputProps={{ maxLength: 55 }}
          />
        </Box>
        <Box className={classes?.fieldWrapper}>
          <InputLabel htmlFor="SigneeEmail">
            {t('sales.contract.signeeEmail')}
            <RequiredAsterik />
          </InputLabel>
          <TextField
            name={FormKeys.EMAIL}
            id={FormKeys.EMAIL}
            fullWidth
            value={signee[FormKeys.EMAIL]}
            onChange={inputChangedHandler}
            placeholder={t('sales.contract.addSigneeEmail')}
            type="email"
            className={classes?.textFiledFilter}
            error={!!errorMessages[FormKeys.EMAIL]}
            helperText={errorMessages[FormKeys.EMAIL]}
          />
        </Box>
      </Box>

      <DrawerFooter
        bulkApply={editData ? t('sales.contract.editsignee') : t('sales.contract.addSignee')}
        bulkCancel={t('sales.contract.cancel')}
        onSubmit={handleAddSignee}
        handleCloseDrawer={filterCloseDrawer}
        anchor={anchor}
        type="submit"
        classNameFooter={classes.moreFilterFooter}
      />
    </Box>
  );
};

AddSigneeDrawer.propTypes = {
  anchor: PropTypes.string,
  filterCloseDrawer: PropTypes.func,
  width: PropTypes.number,
  addSignee: PropTypes.func,
  editData: PropTypes.object,
};

export default AddSigneeDrawer;
