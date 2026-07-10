import { _Chip, Avatar, Box, Button, Tooltip, Typography } from '@mui/material';
import sitePlaceHolderImage from 'assets/svg/Site-Placeholder.svg';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import HeaderDetailsSkeleton from 'src/app/components/common/skeletonLoader/headerDetailsSkeleton';
import { OBX_DISPATCH_DETAILS } from 'src/app/router/constant/ROUTE';
import history from 'src/app/router/utils/history';
import { ReactComponent as EditIcon } from 'src/assets/svg/edit-icon.svg';
import { capitalizeFirstLetter } from 'src/utils/string/common';
import { truncateString } from 'src/utils/string/truncate';

import { DISPATCH_STATUS_ENUM } from '../../dispatch.constant';
import { useStyles } from './TopDetailDispatch.style';

export default function TopDetailDispatch({ dispatch, className, loading }) {
  const { t } = useTranslation();
  const classes = useStyles();
  const NA = t('commonText.nA');

  const gotoAssignPage = (dispatch) => {
    history.push(
      `${OBX_DISPATCH_DETAILS}/${dispatch?.id}/assign-officer?siteId=${dispatch?.site?.id}${dispatch.assignee ? `&officerId=${dispatch?.assignee?.id}` : ''}`,
    );
  };
  const statusClass =
    classes[DISPATCH_STATUS_ENUM?.[dispatch?.status]?.statusClass] || 'commonStageColor';
  return (
    <>
      {loading ? (
        <HeaderDetailsSkeleton />
      ) : (
        <Box className={classNames(classes.sitesSubheader, { className })}>
          <Box className={classes.headerDetail}>
            <Box className={classes.avatarSection}>
              <Box className={classes.avatarImage}>
                <img src={dispatch?.site?.imageUrl || sitePlaceHolderImage} />
              </Box>
              <Box>
                <Typography variant="h1" className={classes.siteName}>
                  {dispatch?.site?.name > 75 ? (
                    <>
                      <Tooltip title={dispatch?.site?.name} arrow>
                        {truncateString(capitalizeFirstLetter(dispatch?.site?.name), 75) || NA}
                      </Tooltip>
                    </>
                  ) : (
                    <>{capitalizeFirstLetter(dispatch?.site?.name) || NA}</>
                  )}
                </Typography>
                <Typography variant="body3" className={classes.address}>
                  {capitalizeFirstLetter(dispatch?.franchiseName)}
                  {dispatch?.site?.address}
                </Typography>
              </Box>
            </Box>
            <Box className={classes.rightContent}>
              <Box className={classes.rightDetail}>
                <Typography variant="body3" className={classes.textLabel}>
                  {t('obx.sites.siteInformation.status')}
                </Typography>
                {dispatch?.status ? (
                  <Box>
                    <Box
                      component="span"
                      className={classNames(classes.commonStageColor, statusClass)}
                    >
                      {DISPATCH_STATUS_ENUM?.[dispatch?.status]?.label ||
                        dispatch?.status
                          ?.toLowerCase()
                          ?.split('_')
                          ?.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                          ?.join(' ') ||
                        'NA'}
                    </Box>
                  </Box>
                ) : (
                  NA
                )}
              </Box>
              {dispatch?.assignee?.id ? (
                <React.Fragment>
                  <Box className={classes.rightDetail}>
                    <Typography variant="body3" className={classes.textLabel}>
                      Officer
                    </Typography>
                    <Typography variant="body2" className={classes.textDetail}>
                      <Avatar
                        className={classes.assignAvatar}
                        alt="Remy Sharp"
                        src={dispatch?.assignee?.imageUrl || sitePlaceHolderImage}
                      />
                      {dispatch?.assignee?.name > 75 ? (
                        <Tooltip title={dispatch?.assignee?.name} arrow>
                          {truncateString(capitalizeFirstLetter(dispatch?.assignee?.name), 75) ||
                            NA}
                        </Tooltip>
                      ) : (
                        capitalizeFirstLetter(dispatch?.assignee?.name) || NA
                      )}
                      {![
                        DISPATCH_STATUS_ENUM.close.value,
                        DISPATCH_STATUS_ENUM.completed.value,
                      ].includes(dispatch?.status) && (
                        <EditIcon
                          className={classes.editIcon}
                          onClick={() => gotoAssignPage(dispatch)}
                        />
                      )}
                    </Typography>
                  </Box>
                  <Box className={classes.rightDetail}>
                    <Typography variant="body3" className={classes.textLabel}>
                      Officer Phone No.
                    </Typography>
                    <Typography variant="body2" className={classes.textDetail}>
                      {dispatch?.assignee?.phoneNumber || NA}
                    </Typography>
                  </Box>
                </React.Fragment>
              ) : (
                dispatch?.status !== 'close' && (
                  <Button variant="destructive" onClick={() => gotoAssignPage(dispatch)}>
                    {t('obx.dispatch.assignDispatch')}
                  </Button>
                )
              )}
            </Box>
          </Box>
        </Box>
      )}
    </>
  );
}

TopDetailDispatch.propTypes = {
  className: PropTypes.string,
  dispatch: PropTypes.object,
  loading: PropTypes.bool,
};
