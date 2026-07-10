import { AppBar, Box, Tooltip } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { ReactComponent as TaskNav } from 'assets/svg/taskNav.svg';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router-dom/cjs/react-router-dom.min';
import { toast } from 'react-toastify';
import BreadCrumb from 'src/app/components/common/breadcrumb';
import { GlobalCountrySelect } from 'src/app/components/common/globalCountrySelect';
import NotificationsDropdown from 'src/app/components/common/notificationsDropdown';
import { NOTIFICATIONS, SALES_TASKS } from 'src/app/router/constant/ROUTE';
import {
  setNotificationsCountRedux,
  toggleNotificationReceived,
} from 'src/redux/store/slices/auth';
import { setCountryData } from 'src/redux/store/slices/user';
import { getNotificationsCount, getUsersNotificationUrl } from 'src/services/notifications.service';
import { fetchConfigList } from 'src/services/settings.services';

import RenderIfHasPermission from '../../../hoc/renderIfHasPermission';
import { toastSettings } from '../../../utils/constants';
import AccountDropdown from '../../components/common/accountDropdown';
import { ACL_TASKS_VIEW } from '../../router/constant/SALESMODULE';

const useStyles = makeStyles((theme) => ({
  header: {
    '&.MuiPaper-root': {
      position: 'sticky',
      zIndex: '99',
      backgroundColor: theme.palette.surfaceWhite,
      boxShadow: 'none',
      borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
      padding: '12px 32px',
      height: '60px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      [theme.breakpoints.down('lg')]: {
        padding: '11px 24px',
      },
    },
  },

  headerContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    gap: '20px',
  },

  headerBoxItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },

  headerTitle: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary1,
    },
  },

  headerContentFlex: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',

    '& .MuiSvgIcon-root': {
      width: '20px',
      height: '20px',
      color: theme.palette.textPlaceholder,
    },
  },
  taskNav: {
    cursor: 'pointer',
    lineHeight: 1,
    height: '40px',
    width: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
}));

export default function Header() {
  const classes = useStyles();
  const userInfo = useSelector((state) => state.auth?.accessToken);

  const { t } = useTranslation();

  const dispatch = useDispatch();

  const notificationsCount = useSelector((state) => state.auth?.notificationsCount);
  const reduxCountries = useSelector((state) => state.user.countries);

  const [serviceUrl, setServiceUrl] = useState(null);

  const setNotificationsCount = (count) => {
    dispatch(setNotificationsCountRedux(count));
  };

  const currentRoute = useLocation().pathname;

  const _getSubscriptionUrl = async () => {
    try {
      const response = await getUsersNotificationUrl();
      if (response?.statusCode === 200) {
        setServiceUrl(response?.data?.url);
      }
    } catch (error) {
      toast.error(error?.message, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  useEffect(() => {
    if (serviceUrl && userInfo) {
      const ws = new WebSocket(serviceUrl);
      ws.onopen = () => console.log('Connected to Azure Web PubSub');
      ws.onmessage = (event) => {
        const data = event.data;
        if (data) {
          setNotificationsCount(1);
          dispatch(toggleNotificationReceived());
        }
        // setMessages((prev) => [...prev, data]);
      };
      ws.onerror = (error) => console.error('WebSocket error:', error);
      ws.onclose = () => console.log('Disconnected');
      return () => ws.close();
    }
  }, [serviceUrl]);

  const getCountries = async () => {
    try {
      const response = await fetchConfigList();
      if (response?.countries) {
        // setNotificationsCount(response?.data?.unreadCount || 0);
        dispatch(setCountryData(response?.countries));
      }
    } catch (error) {
      toast.error(error?.message, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  useEffect(() => {
    if (!reduxCountries?.length) {
      getCountries();
    }
    // if (userInfo) getSubscriptionUrl();
  }, []);

  const fetchNotificationsCount = async () => {
    try {
      const response = await getNotificationsCount();
      if (response?.statusCode === 200) {
        setNotificationsCount(response?.data?.unreadCount || 0);
      }
    } catch (error) {
      toast.error(error?.message, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  useEffect(() => {
    if (userInfo) {
      if (currentRoute == NOTIFICATIONS) {
        setNotificationsCount(0);
      }
    }
  }, [currentRoute]);

  useEffect(() => {
    if (userInfo) {
      if (currentRoute !== NOTIFICATIONS) {
        fetchNotificationsCount();
      }
    }
  }, []);
  return (
    <AppBar className={classes.header}>
      <Box className={classes.headerContent}>
        {/* Logo */}
        <BreadCrumb />
        {/* Navigation */}
        {/* User Actions */}
        <Box className={classes.headerBoxItem}>
          {/** Show change FO DD if FO is loggedin */}
          {/*{userRole === rolesEnum?.franchiseOwner && <ActiveFranchiseList />}*/}
          <GlobalCountrySelect />
          <RenderIfHasPermission name={ACL_TASKS_VIEW}>
            <Tooltip title={t('sideNavBar.linkText.tasks')} arrow>
              <Box component={Link} to={SALES_TASKS} className={classes.taskNav}>
                <TaskNav />
              </Box>
            </Tooltip>
          </RenderIfHasPermission>
          <NotificationsDropdown
            notificationsCount={notificationsCount}
            setNotificationsCount={setNotificationsCount}
          />
          <AccountDropdown />
        </Box>
      </Box>
    </AppBar>
  );
}
