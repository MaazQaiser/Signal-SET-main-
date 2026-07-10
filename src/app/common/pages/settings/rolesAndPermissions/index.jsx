import { Box, Button, Typography } from '@mui/material';
import React, { useEffect, useRef, useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import ConfirmationDialog from 'src/app/components/common/confirmationDialog';
import LoaderComponent from 'src/app/components/common/loader';
import SideDrawer from 'src/app/components/common/sideDrawer';
import { ACL_SETTINGS_ROLES_PERMISSIONS_UPDDATE } from 'src/app/router/constant/SALESMODULE';
// import { ReactComponent as PlusIcon } from 'src/assets/svg/WhitePlusIcon.svg';
import { isObjectEmpty } from 'src/helper/utilityFunctions';
import RenderIfHasPermission from 'src/hoc/renderIfHasPermission';
import {
  getRolesForSettings,
  resetPrivileges,
  updatePermissions,
} from 'src/services/settings.services';
import { toastSettings } from 'src/utils/constants';
import { toaster } from 'src/utils/toast';

import ActivityLogDrawer from './components/activityLogsDrawer';
import PermissionsGrid from './components/permissionGrid';
import ResetModal from './components/resetModal';
// import RoleModal from './components/roleModal';
import { useStyles } from './RolesAndPermission.style';

const SideTabsList = ({ renderList, selectedRole, handleRoleSelection }) => {
  const classes = useStyles();

  const [localSelection, setLocalSelection] = useState(selectedRole);

  const handleClick = (data) => {
    const tempSelectedRole = { ...data };
    setLocalSelection(tempSelectedRole);
    handleRoleSelection(data);
  };
  useEffect(() => {
    if (selectedRole) {
      setLocalSelection(selectedRole);
    }
  }, [JSON.stringify(selectedRole)]);

  return renderList?.map((data) => (
    <React.Fragment key={data?.id}>
      <Button
        variant={`${localSelection?.id === data?.id ? 'primary' : 'secondary'}`}
        onClick={() => {
          handleClick(data);
        }}
        className={classes.rolesButton}
      >
        {data?.name}
      </Button>
    </React.Fragment>
  ));
};

const RolesAndPermissions = () => {
  const { t } = useTranslation();
  const classes = useStyles();
  const authUserType = useSelector((data) => data?.auth?.userRole?.slug);

  // const authUser = useSelector((data) => data?.auth?.userRole?.slug);
  // const franchiseId = useSelector((state) => state?.auth?.franchiseId);

  const [loading, setLoading] = useState(false);
  const [openResetModal, setOpenResetModal] = useState(false);
  const [isPending, startTransition] = useTransition();
  const gridRef = useRef({});
  const [isEdited, setIsEditied] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);

  //
  /**
   * ? This state hold the permision matrix with roles
   * homeoffice
   *    privileges
   */
  const [rolePermissions, setRolePermissions] = useState([]);

  const [confirmModal, setConfirmModal] = useState(false);

  // const [openRoleModal, setOpenRoleModal] = useState(false);

  const handleResetModalClose = () => {
    setOpenResetModal(false);
  };

  const toggleResetModal = () => {
    setOpenResetModal((a) => !a);
  };

  // const handleRoleModalOpen = () => {
  //   setOpenRoleModal(true);
  // };

  // const handleRoleModalClose = () => {
  //   setOpenRoleModal(false);
  // };

  const toggleConfirmModal = () => {
    setConfirmModal((a) => !a);
  };

  const [showDrawer, setShowDrawer] = useState(false);

  const handleGridValueUpdate = (data) => {
    if (!isObjectEmpty(data)) {
      setIsEditied(true);
    }

    gridRef.current = data;
  };
  const handleRoleSelection = (data) => {
    if (selectedRole?.slug === data?.slug) return;
    startTransition(() => {
      setIsEditied(false);
      setSelectedRole(data);
    });
  };
  const refetch = () => {
    setSelectedRole(null);
    getRolesAndPermissions();
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      console.log({ selectedRole }, { set_privileges: gridRef.current });

      const response = await updatePermissions(
        { role: { set_privileges: gridRef.current } },
        selectedRole?.id,
      );

      if (response?.statusCode === 200) {
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
      refetch();
      setLoading(false);
      toggleConfirmModal();
    }
  };

  const handleResetRole = async () => {
    try {
      setLoading(true);
      const res = await resetPrivileges(selectedRole?.id);
      if (res?.data?.statusCode === 200) {
        toaster.success({
          text: res?.data?.message,
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
      }
      setTimeout(() => {
        refetch();
      }, 1000);
      // await refetch();
    } catch (e) {
      toaster.error({
        text: e?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    } finally {
      handleResetModalClose();
      setLoading(false);
    }
  };

  const getRolesAndPermissions = async () => {
    try {
      setLoading(true);
      const data = await getRolesForSettings();

      if (data?.statusCode === 200) {
        // perform all the success actions here
        setRolePermissions(data?.data || []);
        const selected = data?.data?.find((a) => a?.slug === selectedRole?.slug);
        setSelectedRole(!isObjectEmpty(selectedRole) ? selected : data?.data?.[0] || {});
      }
    } catch (e) {
      toaster.error({
        text: e?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    } finally {
      setLoading(false);
      setIsEditied(false);
    }
  };

  useEffect(() => {
    getRolesAndPermissions();
  }, []);

  // save button if the selected role is same as the logged in user type
  const hideOnBasisOFRole = !(selectedRole?.slug === authUserType);
  return (
    <Box className={classes.rolesTopWrapper}>
      {loading && <LoaderComponent size={50} color={'primary'} label={t('sales.loading')} />}
      <Box className={classes.rolesMian}>
        <Box className={classes.rolesLeftBar}>
          <Box className={classes.rolesValueButton}></Box>

          {/* This component show roles in sidebar */}
          <SideTabsList
            renderList={rolePermissions}
            selectedRole={selectedRole}
            handleRoleSelection={handleRoleSelection}
          />
        </Box>
        <Box className={classes.rolesRightBar}>
          <Box className={classes.rolesButtonsBar}>
            <Box className={classes.buttonBarLeft}>
              <Typography variant="h4" className={classes.zoneCustomText}>
                {t('sales.rolesPermissions.title')}
              </Typography>
              <Typography variant="body2" className={classes.zoneDetailText}>
                {t('sales.rolesPermissions.subTitle')}{' '}
                {/* {!franchiseId && t('sales.rolesPermissions.subTitleNote')} */}
              </Typography>
            </Box>

            <RenderIfHasPermission name={ACL_SETTINGS_ROLES_PERMISSIONS_UPDDATE}>
              {!isObjectEmpty(selectedRole) && hideOnBasisOFRole && (
                <Box className={classes.buttonBarRight}>
                  <Box className={classes.rightButtons}>
                    <Button variant="secondaryGrey" onClick={toggleResetModal}>
                      {t('sales.rolesPermissions.resetToDefault')}
                    </Button>
                    {openResetModal && (
                      <ResetModal
                        openModal={openResetModal}
                        handleCloseModal={toggleResetModal}
                        handleSubmit={handleResetRole}
                        selectedRole={selectedRole}
                      />
                    )}
                    {/* We are not showing activities currently */}
                    {/* <Button variant="secondaryGrey" onClick={() => setShowDrawer(true)}>
                      {t('sales.rolesPermissions.viewActivity')}
                    </Button> */}

                    {/* this functionality to add new role is paused for a reason */}
                    {/*<Button startIcon={<PlusIcon />} variant="primary" onClick={handleRoleModalOpen}>*/}
                    {/*  {t('sales.rolesPermissions.addNewRole')}*/}
                    {/*</Button>*/}

                    {/* <RoleModal
                      openModal={openRoleModal}
                      handleCloseModal={handleRoleModalClose}
                      handleSubmit={handleRoleModalClose}
                      refetch={refetch}
                    /> */}
                  </Box>
                </Box>
              )}
            </RenderIfHasPermission>
          </Box>
          <Box className={classes.moudlesRoles}>
            <React.Fragment key={selectedRole?.id}>
              <PermissionsGrid
                disabled={!hideOnBasisOFRole}
                // key={JSON.stringify(selectedRole)}
                setFormValues={handleGridValueUpdate}
                isPending={isPending}
                selectedRole={selectedRole}
              />
            </React.Fragment>
          </Box>
        </Box>
      </Box>
      <RenderIfHasPermission name={ACL_SETTINGS_ROLES_PERMISSIONS_UPDDATE}>
        {!isObjectEmpty(selectedRole) && isEdited && hideOnBasisOFRole && (
          <Box className={classes.rolesBottombar}>
            <Button variant="primary" disabled={loading} onClick={toggleConfirmModal}>
              {t('sales.rolesPermissions.save')}
            </Button>
          </Box>
        )}
      </RenderIfHasPermission>
      {showDrawer && (
        <SideDrawer isOpen={showDrawer} totalWidth={'1144px'}>
          <ActivityLogDrawer showDrawer={showDrawer} setShowDrawer={setShowDrawer} />
        </SideDrawer>
      )}

      {confirmModal && (
        <ConfirmationDialog
          open={!!confirmModal}
          title={t('commonText.modal.areYouSure.title')}
          description={t('sales.rolesPermissions.updateRolePermissionsConfirm')}
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

export default RolesAndPermissions;
