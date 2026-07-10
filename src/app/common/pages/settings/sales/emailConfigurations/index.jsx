import {
  Avatar,
  Box,
  IconButton,
  Link,
  List,
  ListItem,
  ListItemText,
  Skeleton,
  Tooltip,
  Typography,
} from '@mui/material';
import { ReactComponent as DeleteEmailIcon } from 'assets/svg/deleteEmailIcon.svg';
import { ReactComponent as GmailIcon } from 'assets/svg/gmailIcon.svg';
import SweetAlertModal from 'commonComponents/sweetAlertModal';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
// import { toast } from 'react-toastify';
import { nylasProfile, unlinkEmail } from 'services/email.services';
import { SALES_DASHBOARD } from 'src/app/router/constant/ROUTE';
import {
  ACL_SETTINGS_EMAIL_CONFIGURATIONS_CREATE,
  ACL_SETTINGS_EMAIL_CONFIGURATIONS_DELETE,
  ACL_SETTINGS_EMAIL_CONFIGURATIONS_VIEW,
} from 'src/app/router/constant/SALESMODULE';
import history from 'src/app/router/utils/history';
// import { AddIcon } from 'src/assets/svg';
import { ReactComponent as EmailIcon } from 'src/assets/svg/connectEmail.svg';
import { ReactComponent as DeleteIcon } from 'src/assets/svg/delete-modal.svg';
import { isObjectEmpty } from 'src/helper/utilityFunctions';
import RenderIfHasPermission from 'src/hoc/renderIfHasPermission';
import userHasPermission from 'src/utils/auth/userHasPermission';

// import { toastSettings } from 'src/utils/constants';
import { useStyles } from './style';

const EmailListingSkeleton = ({ classes }) => (
  <List>
    {[1, 2, 3, 4, 5, 6].map((index) => (
      <ListItem key={index} className={classes.emailListItem}>
        <ListItemText>
          <Box className={classes.emailListItemText}>
            <Skeleton variant="text" width={150} height={32} />
            <Box className={classes.emailDetails}>
              <Box className={classes.emailDetailsText}>
                <Skeleton variant="text" width="80%" height={32} />
              </Box>
              <Box className={classes.timeAndActions}>
                <Skeleton variant="text" width={100} height={32} />
              </Box>
            </Box>
          </Box>
        </ListItemText>
      </ListItem>
    ))}
  </List>
);

EmailListingSkeleton.propTypes = {
  classes: PropTypes.node,
};

const ConnectEmailComp = ({ redirectUri, disabled, classes }) => {
  const { t } = useTranslation();
  const openConnectEmail = (e) => {
    e.stopPropagation();
  };

  return (
    <>
      <Box className={classes.connectionEmailWrapper}>
        <EmailIcon />
        <Typography variant="h2" component="h6" className={classes.connectionEmailTitle}>
          {t('sales.settings.emailConfigurationsConnectYourEmail')}
        </Typography>
        <Typography variant="body2" component="p" className={classes.connectionEmailText}>
          {t('sales.settings.emailConfigurationsConnectWithYourEmail')}
        </Typography>
        <Link
          onClick={openConnectEmail}
          target="_blank"
          href={redirectUri}
          rel="noreferrer"
          className={classes.franchiseNameText}
          disabled={disabled}
        >
          {t('sales.settings.emailConfigurationsConnectEmail')}
        </Link>
      </Box>
    </>
  );
};

ConnectEmailComp.propTypes = {
  redirectUri: PropTypes.string,
  disabled: PropTypes.bool,
  classes: PropTypes.node,
};
const EmailConfigurations = () => {
  const { t } = useTranslation();

  const classes = useStyles();

  const NA = t('commonText.nA');

  const [loading, setLoading] = useState(false);

  const [disabled, setDisabled] = useState(true);

  const [redirectUri, setRedirectUri] = useState('');

  const [profile, setProfile] = useState({});

  const [unlinkModal, setUnlinkModal] = useState(false);

  const toggleUnlinkModal = () => {
    setUnlinkModal((a) => !a);
  };

  const _gotoDashboard = () => {
    history.push(`${SALES_DASHBOARD}`);
  };

  const getNylasProfile = async () => {
    setDisabled(true);
    try {
      const response = await nylasProfile();
      if (response?.statusCode === 200) {
        // Email connection URL came
        setProfile(response?.data);
      }
    } catch (error) {
      //
      if (error?.message) {
        // toast.error(error?.message, {
        //   position: 'top-right',
        //   autoClose: toastSettings.AUTO_CLOSE,
        // });
        if (error?.data?.redirectURI) {
          setRedirectUri(error.data?.redirectURI);
        }
      }
    } finally {
      setDisabled(false);
    }
  };

  const unLinkEmailAccount = async () => {
    setLoading(true);
    try {
      const response = await unlinkEmail();
      if (response?.statusCode === 200) {
        // Email is disconnected
        setProfile({});
        setRedirectUri(response?.redirectURI);
        // gotoDashboard();
      }
    } catch (error) {
      if (error) {
        console.log('error occurred unlinking email account', error);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getNylasProfile();
  }, []);

  const hasCreatePermission = userHasPermission(ACL_SETTINGS_EMAIL_CONFIGURATIONS_CREATE);

  const hasViewPermission = userHasPermission(ACL_SETTINGS_EMAIL_CONFIGURATIONS_VIEW);

  return (
    <Box>
      {loading && <EmailListingSkeleton classes={classes} />}
      {!loading && redirectUri && (
        <>
          {hasCreatePermission ? (
            <ConnectEmailComp redirectUri={redirectUri} disabled={disabled} classes={classes} />
          ) : (
            <Box className={classes.connectionEmailWrapper}>
              <Typography variant="h6" component="h6" className={classes.connectionEmailTitle}>
                {t('sales.settings.emailConfigurationsNoPermissionToConnect')}
              </Typography>
            </Box>
          )}
        </>
      )}
      {!loading && !isObjectEmpty(profile) && hasViewPermission && (
        <Box className={classes.root}>
          <Box className={classes.header}>
            <Typography variant="h4" component="h2" gutterBottom>
              {t('sales.settings.emailConfigurationsEmailConfiguration')}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {t('sales.settings.emailConfigurationsConnectPersonalEmailDesc')}
            </Typography>
          </Box>
          <Box className={classes.emailContainer}>
            <Box className={classes.emailBox}>
              <Avatar className={classes.avatar}>
                <GmailIcon color="error" />
              </Avatar>
              <Box className={classes.emailInfo}>
                {profile?.name && (
                  <Typography className={classes.name}>{profile?.name || NA}</Typography>
                )}
                <Typography variant="body2" color="text.secondary">
                  {profile?.email || NA}
                </Typography>
              </Box>
              <RenderIfHasPermission name={ACL_SETTINGS_EMAIL_CONFIGURATIONS_DELETE}>
                <Box className={classes.iconContainer}>
                  <Tooltip
                    title={t('sales.settings.emailConfigurationsRemoveEmail')}
                    placement="top"
                    arrow
                  >
                    <IconButton
                      color="warning"
                      className={classes.deleteIcon}
                      onClick={toggleUnlinkModal}
                    >
                      <DeleteEmailIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </RenderIfHasPermission>
            </Box>
          </Box>
        </Box>
      )}
      {unlinkModal && (
        <SweetAlertModal
          type="warning" // 'success', 'error', 'warning', 'info', etc.
          title={t('commonText.modal.areYouSure.title')}
          text={t('commonText.modal.areYouSure.desc')}
          cancelButtonText={t('buttons.no')}
          confirmButtonText={t('buttons.yes')}
          show={unlinkModal}
          handleConfirmButton={unLinkEmailAccount}
          handleCancelButton={toggleUnlinkModal}
          icon={<DeleteIcon />}
        />
      )}
    </Box>
  );
};

export default EmailConfigurations;
