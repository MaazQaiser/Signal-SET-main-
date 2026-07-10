import { Box, Button, Drawer, Typography } from '@mui/material';
import { ReactComponent as DeleteIcon } from 'assets/icons/trashIcon.svg';
import { MoreVert } from 'assets/svg';
import { EditTermIcon } from 'assets/svg';
import { ReactComponent as AddSigneIcon } from 'assets/svg/AddSigneIcon.svg';
import { ReactComponent as SigneeAvatarIcon } from 'assets/svg/SigneeAvatarIcon.svg';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { useEffect } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import PopoverButton from 'src/app/components/common/popoverButton';
import {
  ActiveStepsKeys,
  getViewDisabledContractClass,
} from 'src/app/sales/pages/contractCreation/helper';
import { filterActiveData } from 'src/utils/array/removeDestroyItems';
import { KEY } from 'src/utils/constants/events/keyPressEvents';
import capitalize from 'src/utils/string/capitalize';

import AddSigneeDrawer, { FormKeys as SigneeFormKeys } from './addSigneeDrawer';
import { useStyles } from './configuration.js';

export const MIN_SIGNEES = 2;
const MAX_SIGNEES = 4;

const Configuration = ({ formData, setFormData, editData, isPublished }) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const signees = formData?.[ActiveStepsKeys.SIGNEES] || [];
  // const totalSignees = signees?.filter((signee) => !signee._destroy).length;

  useEffect(() => {
    if (editData) {
      setFormData(editData);
    }
  }, [editData, setFormData]);

  const locationDrawerTypes = {
    RIGHT: 'right',
  };

  const [drawerState, setDrawerState] = useState({
    right: false,
    index: null,
  });
  const toggleFiltersDrawer = (anchor, open, index) => (event) => {
    if (event.type === KEY.UP && (event.key === KEY.TAB || event.key === KEY.SHIFT)) {
      return;
    }
    setDrawerState({ [anchor]: open, index: index });
  };
  const filterCloseDrawer = (anchor) => {
    setDrawerState({ [anchor]: false, index: null });
  };

  /**
   * add or edit signees
   * @param {*} signee
   */
  const addSignee = async (signee) => {
    setFormData((prevData) => {
      const updatedSignees =
        drawerState.index !== undefined // Check if index is defined
          ? [
              ...(signees?.slice(0, drawerState.index) || []), // Copy elements before the index
              signee, // Replace the element at the index with the new signee
              ...(signees?.slice(drawerState.index + 1) || []), // Copy elements after the index
            ]
          : [...signees, { ...signee }]; // Add new signee if no index is provided

      return { ...prevData, [ActiveStepsKeys.SIGNEES]: updatedSignees };
    });
    filterCloseDrawer(locationDrawerTypes.RIGHT);
  };

  const deleteSignee = (index) => {
    setFormData((prevData) => {
      const updatedSignees = [
        ...(signees?.slice(0, index) || []),
        ...(Object.prototype.hasOwnProperty.call(signees?.[index], 'id')
          ? [{ ...signees?.[index], _destroy: true }]
          : []),
        ...(signees?.slice(index + 1) || []),
      ];

      return { ...prevData, [ActiveStepsKeys.SIGNEES]: updatedSignees };
    });
  };

  let signeeCounter = 1;

  return (
    <Box className={classes.configStep}>
      <Typography variant="h3" className={classes.stepperHeadding}>
        {t('sales.contract.selectSignees')}
      </Typography>
      <Box
        className={classNames(classes.signBoxWrapper, getViewDisabledContractClass(isPublished))}
      >
        {signees?.map((signee, index) => {
          if (signee._destroy) return null;

          return (
            <Box key={index} className={classes.signCard}>
              <Box className={classes.popoverBtn}>
                <Typography variant="h4" className={classes.signeeCount}>
                  {`${t('sales.contract.signee')} ${signeeCounter++}`}
                </Typography>

                <PopoverButton
                  className={classes.questionBankActions}
                  variant="icon"
                  Icon={MoreVert}
                >
                  <Box className={classes.questionBankActionsMenu}>
                    <Box
                      className={classes.questionBankActionsRegular}
                      onClick={toggleFiltersDrawer(locationDrawerTypes.RIGHT, true, index)}
                    >
                      <EditTermIcon className={classes.questionBankActionsIconRegular} />
                      <Typography
                        className={classes.questionBankActionsTextRegular}
                        variant="subtitle2"
                      >
                        {t('sales.contract.edit')}
                      </Typography>
                    </Box>
                  </Box>
                  <Box
                    className={classes.questionBankActionsMenu}
                    onClick={() => deleteSignee(index)}
                  >
                    <Box className={classes.questionBankActionsDelete}>
                      <DeleteIcon className={classes.questionBankActionsIconDelete} />
                      <Typography
                        className={classes.questionBankActionsTextDelete}
                        variant="subtitle2"
                      >
                        {t('sales.contract.delete')}
                      </Typography>
                    </Box>
                  </Box>
                </PopoverButton>
              </Box>

              <SigneeAvatarIcon />
              <Typography variant="h4" className={classes.signeeName}>
                {capitalize(signee[SigneeFormKeys.NAME], true)}
              </Typography>
              <Typography variant="body2" className={classes.signeeDesignation}>
                {capitalize(signee[SigneeFormKeys.TITLE], true)}
              </Typography>
            </Box>
          );
        })}
        {/* Check to Add Maximum number of Signees */}
        {filterActiveData(signees)?.length < MAX_SIGNEES && (
          <Box className={classes.signCard}>
            <Box className={classes.addSigneeard}>
              <Box className={classes.addCard}>
                <Button
                  onClick={toggleFiltersDrawer(locationDrawerTypes.RIGHT, true)}
                  disableRipple
                  variant="onlyText"
                >
                  <AddSigneIcon />
                </Button>
              </Box>
              <Typography variant="h4" className={classes.signeeName}>
                {`${t('sales.contract.addsignee')} `}
              </Typography>
            </Box>
          </Box>
        )}
      </Box>
      <Drawer
        anchor={locationDrawerTypes.RIGHT}
        open={drawerState[locationDrawerTypes.RIGHT]}
        onClose={toggleFiltersDrawer(locationDrawerTypes.RIGHT, false)}
      >
        {drawerState?.right && (
          <AddSigneeDrawer
            anchor={locationDrawerTypes.RIGHT}
            filterCloseDrawer={filterCloseDrawer}
            width={399}
            addSignee={addSignee}
            editData={signees?.[drawerState.index] || null}
          />
        )}
      </Drawer>
    </Box>
  );
};

Configuration.propTypes = {
  formData: PropTypes.object,
  setFormData: PropTypes.func,
  editData: PropTypes.any,
  errorMessages: PropTypes.object,
  setErrorMessages: PropTypes.func,
  isPublished: PropTypes.bool,
};
export default Configuration;
