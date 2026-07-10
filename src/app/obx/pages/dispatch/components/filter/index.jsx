import { Box, Button, InputLabel, Stack, SwipeableDrawer, Typography } from '@mui/material';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import CustomDropDown from 'src/app/components/common/customDropDown';
import { Clossicon } from 'src/assets/svg';
import { MoreFilter } from 'src/assets/svg';
import usePersistentApiData from 'src/hooks/usePresistantApiData';
import { getDispatchTypes } from 'src/services/dispatch.services';
import { getFranchiseSitesbyId, getFranchisesList } from 'src/services/franchise.services';
import { rolesEnum } from 'src/utils/constants';

import { TIME_ELAPSED_OPTIONS } from '../../dispatch.constant';
import { useStyles } from './filterStyle';

const Filter = ({ open, anchor, onChange, toggleDrawer }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { data: DISPATCH_TYPE_ENUM } = usePersistentApiData('dispatch-types', getDispatchTypes);

  const [selected, setSelected] = useState({});
  const [franchises, setFranchises] = useState([]);
  const [sites, setSites] = useState([]);

  const DISPATCH_TYPE_OPTIONS = Object?.keys(DISPATCH_TYPE_ENUM || {})?.map((key) => ({
    value: key,
    label: DISPATCH_TYPE_ENUM[key],
  }));

  const handleChange = (event) => {
    const { name, value } = event.target;
    setSelected((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const userRole = useSelector((state) => state.auth.userRole);

  const userInfo = useSelector((state) => state.user.info);

  const fetchFranchiseList = async () => {
    try {
      const response = await getFranchisesList({ status: 'functional' });
      if (response && response?.statusCode === 200) {
        setFranchises(response?.data?.franchises || []);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchFranchiseSites = async (id) => {
    try {
      const response = await getFranchiseSitesbyId(id, {
        status: 'functional',
      });
      console.log(response, 'here', franchises);
      if (response && response?.statusCode === 200) {
        setSites(response?.data?.sites || []);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleApplyFilter = () => onChange(selected);

  const handleClearAll = () => setSelected(null);

  const franchiseOptions =
    franchises.map((franchise) => ({
      label: franchise.name,
      value: franchise.id,
    })) || [];

  const sitesOptions =
    sites.map((site) => ({
      label: site.name,
      value: site.id,
    })) || [];

  useEffect(() => {
    if (!userRole.slug === rolesEnum.homeOfficer && !userRole.slug === rolesEnum.hoAgent) {
      return;
    }

    fetchFranchiseList();
  }, []);

  useEffect(() => {
    if (
      (userRole.slug === rolesEnum.homeOfficer || userRole.slug === rolesEnum.hoAgent) &&
      selected?.franchise?.value
    ) {
      fetchFranchiseSites(selected?.franchise?.value);
      return;
    }
    if (userInfo?.franchiseId) {
      fetchFranchiseSites(userInfo.franchiseId);
      return;
    }
  }, [selected?.franchise]);

  const filters = selected
    ? Object.values(selected).filter((v) => v?.length || v?.value)?.length
    : 0;

  const list = (anchor) => (
    <Box
      className={classes.siderBarBox}
      sx={{ width: anchor === 'top' || anchor === 'bottom' ? 'auto' : 399 }}
      role="presentation"
    >
      <Box className={classes.sideHeader}>
        <Stack
          direction="row"
          spacing={2}
          className={classes.sideHeaderTop}
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="h3">{`${t('commonText.allFilters')}`}</Typography>
          <div className={classes.cancelBtn} onClick={() => toggleDrawer(false)}>
            <Clossicon className={classes.crossIcons} />
          </div>
        </Stack>
        <Button
          onClick={handleClearAll}
          className={classes.clearAll}
          variant="tertiaryGrey"
          disableRipple
          endIcon={<Clossicon className={classes.filterIcon} />}
        >
          {`${t('commonText.clearAll')}`}
        </Button>
      </Box>
      <Box className={classNames(classes.filedArea, 'innerScrollBar')}>
        <Box>
          <InputLabel>{`${t('obx.dispatch.timeElapsed')}`}</InputLabel>
          <CustomDropDown
            placeHolder={`Select ${t('obx.dispatch.timeElapsed')}`}
            name="timeElapsed"
            label={t('obx.dispatch.timeElapsed')}
            options={TIME_ELAPSED_OPTIONS}
            clearAll={true}
            selectedValues={selected?.timeElapsed || {}}
            handleChange={handleChange}
            bordered
            className={classes.dropHigh}
          />
        </Box>
        <Box>
          <Box className={classes.marginBotom}>
            <InputLabel>{`${t('obx.dispatch.dispatchType')}`}</InputLabel>
            <CustomDropDown
              placeHolder={`Select ${t('obx.dispatch.dispatchType')}`}
              name="types"
              label={t('obx.dispatch.dispatchType')}
              options={DISPATCH_TYPE_OPTIONS}
              selectedValues={selected?.types || []}
              multiSelect={true}
              clearAll={true}
              handleChange={handleChange}
              bordered
              className={classes.dropHigh}
            />
          </Box>
        </Box>
        {(userRole.slug === rolesEnum.homeOfficer || userRole.slug === rolesEnum.hoAgent) && (
          <Box>
            <Box className={classes.marginBotom}>
              <InputLabel>{`${t('obx.dispatch.franchise')}`}</InputLabel>
              <CustomDropDown
                placeHolder={`Select ${t('obx.dispatch.franchise')}`}
                name="franchise"
                label={t('obx.dispatch.franchise')}
                options={franchiseOptions}
                selectedValues={selected?.franchise || {}}
                clearAll={true}
                clear={true}
                handleChange={handleChange}
                bordered
                className={classes.dropHigh}
              />
            </Box>
          </Box>
        )}

        <Box>
          <Box className={classes.marginBotom}>
            <InputLabel>{`${t('obx.dispatch.sites')}`}</InputLabel>
            <CustomDropDown
              placeHolder={`Select ${t('obx.dispatch.sites')}`}
              name="sites"
              search={true}
              options={sitesOptions}
              selectedValues={selected?.sites || []}
              multiSelect={true}
              clearAll={true}
              handleChange={handleChange}
              bordered
              className={classes.dropHigh}
            />
          </Box>
        </Box>
      </Box>

      <Box className={classes.sideFooter}>
        <Stack direction="row" justifyContent="end" className={classes.buttonStacks}>
          <Button onClick={() => toggleDrawer(false)} variant="secondaryGrey">
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleApplyFilter}
          >{`${t('commonText.applyFilters')}`}</Button>
        </Stack>
      </Box>
    </Box>
  );

  return (
    <>
      <Button
        onClick={toggleDrawer}
        className={classes.moreFilter}
        variant="onlyText"
        disableRipple
      >
        {t('sales.locations.moreFilters')}
        {filters ? <Box className={classes.redCircle}>{filters}</Box> : null}
        <MoreFilter className={classes.filterIcon} />
      </Button>
      <SwipeableDrawer
        className={classes.sideDraw}
        anchor={anchor}
        open={open}
        onClose={() => toggleDrawer(false)}
        onOpen={() => toggleDrawer(true)}
      >
        {list(anchor)}
      </SwipeableDrawer>
    </>
  );
};

Filter.propTypes = {
  open: PropTypes.bool.isRequired,
  anchor: PropTypes.string.isRequired,
  onChange: PropTypes.func,
  toggleDrawer: PropTypes.func,
};
export default Filter;
