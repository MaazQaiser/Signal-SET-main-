import { Box, Button, Skeleton, Typography } from '@mui/material';
import { ReactComponent as WarningIcon } from 'assets/svg/warning.svg';
import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { updateUsersPermissions } from 'services/user.services';
import PermissionsGrid from 'src/app/common/pages/settings/rolesAndPermissions/components/permissionGrid';
// import ResetModal from 'src/app/common/pages/settings/rolesAndPermissions/components/resetModal';
import { useStyles } from 'src/app/common/pages/settings/rolesAndPermissions/RolesAndPermission.style';
import ConfirmationDialog from 'src/app/components/common/confirmationDialog';
import { ACL_USER_ROLES_AND_PERMISSIONS_UPDATE } from 'src/app/router/constant/SALESMODULE';
import { isObjectEmpty } from 'src/helper/utilityFunctions';
import RenderIfHasPermission from 'src/hoc/renderIfHasPermission';
import { resetUserRolePrivileges } from 'src/services/settings.services';
import { toastSettings } from 'src/utils/constants';
import { toaster } from 'src/utils/toast';

const UserPermissions = ({ data, loadingApi, id, refetch }) => {
  const { t } = useTranslation();
  const classes = useStyles();

  const [selectedRole, setSelectedRole] = useState(null);
  const [isPending, startTransition] = useTransition();
  const gridRef = useRef({});
  const [isEdited, setIsEditied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);

  const [openResetModal, setOpenResetModal] = useState(false);

  const userId = useSelector((state) => state.user?.info?.id);

  const toggleConfirmModal = () => {
    setConfirmModal((a) => !a);
  };

  const toggleResetModal = () => {
    setOpenResetModal((a) => !a);
  };

  const handleGridValueUpdate = (data) => {
    if (!isObjectEmpty(data)) {
      setIsEditied(true);
    }

    gridRef.current = data;
  };

  const handleRoleSelection = (data) => {
    startTransition(() => {
      setIsEditied(false);
      setSelectedRole(data);
    });
  };

  useEffect(() => {
    if (!isObjectEmpty(data)) {
      handleRoleSelection(data);
    }
  }, [data]);

  const handleResetRole = async () => {
    try {
      setLoading(true);
      const res = await resetUserRolePrivileges(selectedRole?.id);
      if (res?.statusCode === 200) {
        toaster.success({
          text: res?.message,
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
      }
      refetch(selectedRole?.id);
    } catch (e) {
      toaster.error({
        text: e?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    } finally {
      toggleResetModal();
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const setPrivileges = gridRef.current;
      const response = await updateUsersPermissions(
        { user: { set_privileges: setPrivileges } },
        selectedRole?.id,
      );

      if (response?.statusCode === 200) {
        // setData((prev) => ({
        //   ...prev,
        //   setPrivileges,
        // }));
        toaster.success({
          text: response?.message,
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
      }
    } catch (e) {
      toaster.error({
        text: e?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    } finally {
      // refetch();
      setIsEditied(false);
      setLoading(false);
      toggleConfirmModal();
    }
  };

  if (loadingApi) {
    return (
      <>
        <Skeleton className={classes.rowSkeleton} />
        <Skeleton className={classes.rowSkeleton} />
        <Skeleton className={classes.rowSkeleton} />
        <Skeleton className={classes.rowSkeleton} />
        <Skeleton className={classes.rowSkeleton} />
        <Skeleton className={classes.rowSkeleton} />
        <Skeleton className={classes.rowSkeleton} />
        <Skeleton className={classes.rowSkeleton} />
        <Skeleton className={classes.rowSkeleton} />
        <Skeleton className={classes.rowSkeleton} />
        <Skeleton className={classes.rowSkeleton} />
        <Skeleton className={classes.rowSkeleton} />
        <Skeleton className={classes.rowSkeleton} />
        <Skeleton className={classes.rowSkeleton} />
        <Skeleton className={classes.rowSkeleton} />
      </>
    );
  }

  return (
    <Box>
      <Box className={classes.rolesButtonsBar}>
        <Box className={classes.buttonBarLeft}>
          <Typography variant="h4" className={classes.zoneCustomText}>
            {t('sales.rolesPermissions.title')}
          </Typography>
          <Typography variant="body2" className={classes.zoneDetailText}>
            {t('sales.rolesPermissions.userSubTitle')}{' '}
            {t('sales.rolesPermissions.userSubTitleNote')}
          </Typography>
        </Box>
        <RenderIfHasPermission name={ACL_USER_ROLES_AND_PERMISSIONS_UPDATE}>
          {!isObjectEmpty(selectedRole) && userId != id && (
            <Box className={classes.buttonBarRight}>
              <Box className={classes.rightButtons}>
                {/* We are not showing reset button as this functionality is not implemented */}
                <Button variant="secondaryGrey" onClick={toggleResetModal}>
                  {t('sales.rolesPermissions.resetToDefault')}
                </Button>
                {openResetModal && (
                  <ConfirmationDialog
                    open={openResetModal}
                    title={t('sales.rolesPermissions.resetChanges')}
                    description={t('sales.rolesPermissions.resetToDefaultText')}
                    action={t('sales.rolesPermissions.reset')}
                    icon={<WarningIcon />}
                    disabled={loading}
                    handleClose={toggleResetModal}
                    handleConfirm={handleResetRole}
                  />
                )}
                {/* We are not showing activities currently */}
                {/* <Button variant="secondaryGrey" onClick={() => setShowDrawer(true)}>
                {t('sales.rolesPermissions.viewActivity')}
              </Button> */}
              </Box>
            </Box>
          )}
        </RenderIfHasPermission>
      </Box>
      <Box className={classes.moudlesRoles}>
        <React.Fragment key={JSON.stringify(selectedRole)}>
          <PermissionsGrid
            key={JSON.stringify(selectedRole)}
            setFormValues={handleGridValueUpdate}
            isPending={isPending}
            selectedRole={selectedRole}
          />
        </React.Fragment>
      </Box>

      <RenderIfHasPermission name={ACL_USER_ROLES_AND_PERMISSIONS_UPDATE}>
        {!isObjectEmpty(selectedRole) && isEdited && !loadingApi && userId != id && (
          <Box onClick={toggleConfirmModal} disabled={loading} className={classes.rolesBottombar}>
            <Button variant="primary" disabled={loading}>
              {t('sales.rolesPermissions.save')}
            </Button>
          </Box>
        )}
      </RenderIfHasPermission>

      {confirmModal && (
        <ConfirmationDialog
          open={!!confirmModal}
          title={t('commonText.modal.areYouSure.title')}
          description={t('sales.rolesPermissions.updateUserPermissionsConfirm')}
          action={t('buttons.yes')}
          // icon={<WarningIcon />}
          disabled={loading}
          handleClose={toggleConfirmModal}
          handleConfirm={handleSubmit}
        />
      )}
    </Box>
  );
};

UserPermissions.propTypes = {
  data: PropTypes.object,
  loadingApi: PropTypes.bool,
  id: PropTypes.string,
  setData: PropTypes.func,
  refetch: PropTypes.func,
};

export default UserPermissions;
