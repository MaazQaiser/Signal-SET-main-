import 'slick-carousel/slick/slick-theme.css';
import 'slick-carousel/slick/slick.css';

import { useAuth0 } from '@auth0/auth0-react';
import { Link } from '@mui/material';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { makeStyles } from '@mui/styles';
import { Box } from '@mui/system';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';
import Slider from 'react-slick';
import { toast } from 'react-toastify';
import LoaderComponent from 'src/app/components/common/loader';
// import ReportProblemDrawer from 'src/app/components/common/reportProblemDrawer';
// import SideDrawer from 'src/app/components/common/sideDrawer';
import { isObjectEmpty, mainDomain } from 'src/helper/utilityFunctions';
import { useLabels } from 'src/hooks/updateObjectLabelsHook';
import {
  setConfigurations,
  setSelectedCountry,
} from 'src/redux/store/slices/regionalCountryConfiguration';
import { setTenantLanguageData } from 'src/redux/store/slices/tenantConfigs';
import { getLanguageConfigs, getUserData } from 'src/services/auth.services';
import { getRegionalConfigurations } from 'src/services/regionalConfiguration.service';
import {
  hoAgentModuleAccessList,
  hoModuleAccessList,
  salesModuleAccessList,
} from 'src/stubbedData/moduleAccessList';
import {
  bootstrapDemoSession,
  DEMO_CREDENTIALS,
  validateDemoLogin,
} from 'src/utils/auth/demoSession';
import {
  dashboardOptions,
  handleAuthRedirection,
  rolesEnumWithName,
  toastSettings,
} from 'src/utils/constants';
import { MULTI_TENANT_AUTH } from 'src/utils/constants/multiTanentAuthInfo';
import isDevBypassAuth from 'src/utils/isDevBypassAuth';
import capitalize from 'src/utils/string/capitalize';

import {
  setAccessControlPermissions,
  setAccessToken,
  setCurrentLanguage,
  setDashboardActive,
  setFranchiseId,
  setTenantId,
  setTenantInfo,
  setTenantPermissions,
  // setFranchiseId,
  // setFranchiseTimeZone,
  setUserAccessList,
  setUserRole,
} from '../../../../redux/store/slices/auth';
import { setInfoData } from '../../../../redux/store/slices/user';
import { rolesEnum } from '../../../../utils/constants/index';

const useStyles = makeStyles((theme) => ({
  mainFormLogin: {
    display: 'flex',
    height: '100dvh',
    overflow: 'hidden',
  },

  mainFormSlider: {
    width: '50%',

    '& .slick-dots': {
      bottom: '70px',
      '& li': {
        margin: 0,
        '&.slick-active': {
          '& button': {
            '&::before': {
              fontSize: '12px',
              color: theme.palette.surfaceBrand,
            },
          },
        },
        '& button': {
          '&:focus': {
            '&:before': {
              opacity: 1,
            },
          },
          '&::before': {
            fontSize: '10px',
            color: theme.palette.borderSubtle1,
            opacity: 1,
          },
        },
      },
    },
  },

  mainFormContent: {
    width: '50%',
    paddingTop: '120px',
    paddingBottom: ' 52px',
    paddingLeft: ' 36px',
    paddingRight: ' 36px',
  },

  innerContent: {
    maxWidth: '360px',
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '88px',
    margin: '0 auto',
    justifyContent: 'space-between',
  },

  mainHeading: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },
  manageText: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary3,
      marginTop: '4px ',
    },
  },
  copyRightText: {
    '&.MuiTypography-root': {
      display: 'block',
      color: theme.palette.textPlaceholder,
      textAlign: 'center ',
    },
  },
  forgotTextBtn: {
    '&.MuiTypography-root': {
      color: theme.palette.textBrand,
    },
  },

  welcomeLinks: {
    marginBottom: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    '& .MuiTypography-root ': {
      fontSize: '14px',
      lineHeight: '20px',
      textAlign: 'center',
      fontWeight: '500',
      color: theme.palette.textBrand,
      cursor: 'pointer',
      textDecoration: 'none',
    },
  },

  welcomeLink: {
    fontSize: '14px',
    lineHeight: '20px',
    textAlign: 'center',
    fontWeight: '500',
    color: theme.palette.textBrand,
    cursor: 'pointer',
  },

  logoImage: {
    height: '50px',
    margin: '0 auto',
  },

  welcomeContent: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: '40px',
    flex: '1',
  },

  sliderBg: {
    height: '100dvh',
    position: 'relative',
  },

  sliderBgImage: {
    display: 'block',
    width: '100%',
    height: '100dvh',
    objectFit: 'cover',
  },

  sliderBgOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '100%',
    height: '100dvh',
    opacity: '0.8',
    background: 'linear-gradient(355deg, #000 26.18%, rgba(109, 109, 109, 0.00) 96.67%)',
  },

  sliderBgContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    position: 'absolute',
    bottom: '114px',
    left: 0,
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    width: '100%',
    padding: '0 12px',
  },

  sliderBgTitle: {
    '&.MuiTypography-root': {
      color: theme.palette.textOnColor,
    },
  },

  sliderBgText: {
    '&.MuiTypography-root': {
      color: theme.palette.textOnColor,
    },
  },
  loginButton: {
    width: '100%',
  },
  demoLoginButton: {
    width: '100%',
    marginTop: '12px',
  },
  demoForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  demoHint: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary3,
      fontSize: '12px',
      lineHeight: '16px',
      textAlign: 'center',
    },
  },
  privacyPolicy: {
    '&.MuiTypography-root': {
      display: 'block',
      color: theme.palette.textPlaceholder,
      textAlign: 'center ',
      fontSize: '12px',
      lineHeight: '16px',
      fontWeight: '400',
      textDecoration: 'underline',
    },
  },
  copyRightTextWrapper: {
    display: 'flex',
    textAlign: 'center',
    gap: '8px',
    justifyContent: 'center',
    alignItems: 'center',
  },
}));

const errorObj = {
  unauthorized: 'unauthorized',
  access_denied: 'access_denied',
};

// const sliderData = [
//   {
//     id: 1,
//     imageUrl: 'https://signalassets.blob.core.windows.net/signal/assets/Mask-group.png',
//     title: 'Take control of your sales team',
//     desc: 'Gain complete control and visibility over your Sales Managers and interns within the web portal.',
//   },
//   {
//     id: 2,
//     imageUrl: 'https://signalassets.blob.core.windows.net/signal/assets/signal2-1.png',
//     title: 'Manage tasks with efficiency',
//     desc: 'Assign leads in bulk to the sales people who meet the necessary job requirements, and view their activity.',
//   },
//   {
//     id: 3,
//     imageUrl: 'https://signalassets.blob.core.windows.net/signal/assets/signal1-1.png',
//     title: 'Real-time insights and analytics',
//     desc: 'Real-time statistics, empowering you to identify status, optimize operations, and drive sales rationally.',
//   },
// ];

export default function Login() {
  const {
    isAuthenticated,
    loginWithRedirect,
    getAccessTokenSilently,
    error,
    logout,
    isLoading: load,
  } = useAuth0();

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const errorState = queryParams.get('error');
  const loginError = queryParams.get('loginError');

  const classes = useStyles();
  const history = useHistory();
  const [isLoading, setIsLoading] = useState(false);
  const [isShow, setShow] = useState(load);

  const userRole = useSelector((state) => state.auth.userRole);

  const rolesEnumWithTenantUpdatedName = useLabels(
    rolesEnumWithName,
    'tenantConfigs.tenantLabels.roles',
  );

  const [disabled, _setDisabled] = useState(false);
  const [demoEmail, setDemoEmail] = useState(DEMO_CREDENTIALS.email);
  const [demoPassword, setDemoPassword] = useState(DEMO_CREDENTIALS.password);
  const [demoError, setDemoError] = useState('');

  const { t, i18n } = useTranslation();

  const dispatch = useDispatch();

  const tenantInfo = MULTI_TENANT_AUTH[mainDomain()];

  var settings = {
    arrows: false,
    dots: true,
    infinite: true,
    speed: 1000,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
  };

  useEffect(() => {
    if (loginError) {
      if (loginError === errorObj.unauthorized) {
        toast.error(t('errors.unauthorized'), {
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
      } else if (loginError === errorObj.access_denied) {
        toast.error(t('errors.access_denied'), {
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
      } else {
        toast.error(t('errors.somethingWentWrong'), {
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
      }
    }

    history.push(window.location.pathname);
  }, [loginError]);

  useEffect(() => {
    if (errorState && error) {
      logout({ logoutParams: { returnTo: window.location.origin + '?loginError=' + errorState } });
    }
    if (localStorage.getItem('accessToken') && !isObjectEmpty(userRole)) {
      history.push(handleAuthRedirection(userRole?.slug));
    }

    if (isAuthenticated) {
      getToken();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    setShow(load);
  }, [load]);

  const getToken = async () => {
    try {
      setIsLoading(true);
      const accessToken = await getAccessTokenSilently();
      localStorage.setItem('accessToken', accessToken);
      dispatch(setAccessToken(accessToken));
      setTimeout(() => {
        getPermission();
      }, 1000);
    } catch (error) {
      // console.error('Error getting access token:', error);
    }
  };

  const checkIfThisRoleIsAuthorizedToAccessThisApp = (roleSlug) => {
    const allowedRolesSlug = [
      rolesEnum.homeOfficer,
      rolesEnum.salesManager,
      rolesEnum.franchiseOwner,
      rolesEnum.director,
      rolesEnum.supervisor,
      rolesEnum.coordinator,
    ];

    return allowedRolesSlug.includes(roleSlug);
  };

  const getPermission = async () => {
    try {
      setIsLoading(true);
      // TODO: Removed Permission as we shifted toward user data API but keeping it comment yet.
      // const response = await getUserLoginPermission();
      const response = await getUserData();
      if (response && response.statusCode == 200) {
        const accessToken = localStorage.getItem('accessToken');
        const roles = rolesEnumWithTenantUpdatedName[response?.data?.user?.assignedRoles[0]];

        if (
          !checkIfThisRoleIsAuthorizedToAccessThisApp(roles?.slug) ||
          response?.data?.user?.tenantId === null ||
          isObjectEmpty(response?.data?.user?.tenantConfiguration)
        ) {
          await logout({
            logoutParams: {
              returnTo: window.location.origin + '?loginError=' + 'access_denied',
            },
          });
          localStorage.setItem('accessToken', null);
          return;
        }

        // const roles = response?.data?.roles; // ? commented as we removed Permission API.
        dispatch(setUserRole(roles));
        dispatch(setFranchiseId(response?.data?.user?.franchiseId || ''));

        dispatch(setTenantId(response?.data?.user?.tenantId || ''));

        if (response?.data?.user?.tenantConfiguration) {
          dispatch(setTenantInfo(response?.data?.user?.tenantConfiguration));
        }

        if (
          response?.data?.user?.tenantConfiguration?.permissions?.set?.contract?.enableOccurences &&
          response?.data?.user?.tenantConfiguration?.permissions?.set?.contract?.stripeEnabled
        ) {
          dispatch(
            setTenantPermissions(
              response?.data?.user?.tenantConfiguration?.permissions?.set?.contract,
            ),
          );
        }

        // TODO: need to get this list from backend
        /**
         * TODO: Backend will update its access list in accessToken and we will pick it up by decoding token.
         */
        switch (roles?.slug) {
          case rolesEnum.homeOfficer:
            // ? if the role is home office add access list of home office
            dispatch(setUserAccessList(hoModuleAccessList));
            break;

          case rolesEnum.franchiseOwner:
            // ? if the role is franchise owner add access list of franchise owner
            dispatch(setUserAccessList(salesModuleAccessList));
            break;

          case rolesEnum.director:
            // ? if the role is director add access list of franchise owner
            dispatch(setUserAccessList(salesModuleAccessList));
            break;

          case rolesEnum.supervisor:
            // ? if the role is supervisor add access list of franchise owner
            dispatch(setUserAccessList(salesModuleAccessList));
            break;

          case rolesEnum.salesManager:
            // ? if the role is sales person add access list of sales person
            dispatch(setUserAccessList(salesModuleAccessList));
            break;

          case rolesEnum.hoAgent:
            // ? if the role is sales person add access list of sales person
            dispatch(setUserAccessList(hoAgentModuleAccessList));
            break;

          case rolesEnum.coordinator:
            // ? if the role is coordinator add access list of franchise owner
            dispatch(setUserAccessList(salesModuleAccessList));
            break;

          // Add more cases as needed for other roles
        }
        // ? Turned this ON as we started receiving access list from backend
        dispatch(setAccessControlPermissions(response?.data?.user?.accessControlList));
        dispatch(setAccessToken(accessToken));
        dispatch(setCurrentLanguage(response?.data?.language));

        i18n.changeLanguage(response?.data?.language?.code);

        dispatch(setInfoData(response?.data?.user));

        dispatch(setDashboardActive(dashboardOptions.sale));

        // if (roles.slug !== rolesEnum.homeOfficer && roles.slug !== rolesEnum.salesManager) {
        //   dispatch(setFranchiseTimeZone(response?.data?.user?.franchiseTimezone));
        // }

        await Promise.all([fetchAndSetRegionalConfigs(), getTenantlanguageConfigs()]);

        history.push(handleAuthRedirection(roles?.slug));
      }
    } catch (error) {
      setIsLoading(false);
      logout({
        logoutParams: { returnTo: window.location.origin + '?loginError=something_went_wrong' },
      });

      /**
       * show error in the corresponding field
       * parse errors in array format and set them in errorMessages // salesPerson
       * setErrorMessages(error)
       */
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAndSetRegionalConfigs = async () => {
    try {
      const regionalResponse = await getRegionalConfigurations();
      const countryConfigurations = regionalResponse.data?.countryConfigurations || [];
      if (regionalResponse?.statusCode === 200) {
        dispatch(setConfigurations(countryConfigurations));
        const defaultCountry = countryConfigurations.find((country) => country.default === true);
        dispatch(setSelectedCountry(defaultCountry || countryConfigurations?.[0]));
      }
    } catch (err) {
      console.log(err);
    }
  };

  const getTenantlanguageConfigs = async () => {
    try {
      const response = await getLanguageConfigs();
      if (response || response.statusCode == 200) {
        dispatch(setTenantLanguageData(response?.data?.labels));
      }
    } catch (error) {
      logout({
        logoutParams: { returnTo: window.location.origin + '?loginError=something_went_wrong' },
      });
    }
  };

  const handleDemoLogin = async (event) => {
    event?.preventDefault();
    if (!validateDemoLogin(demoEmail, demoPassword)) {
      setDemoError('Invalid email or password.');
      return;
    }
    setDemoError('');
    try {
      await bootstrapDemoSession({ dispatch, history, i18n, tenantInfo });
    } catch (error) {
      setDemoError('Could not sign in. Refresh the page and try again.');
    }
  };

  const renderForm = isDevBypassAuth() ? (
    <Box component="form" onSubmit={handleDemoLogin} className={classes.demoForm}>
      <TextField
        label="Email"
        type="email"
        name="email"
        value={demoEmail}
        onChange={(e) => {
          setDemoEmail(e.target.value);
          setDemoError('');
        }}
        fullWidth
        autoComplete="username"
      />
      <TextField
        label="Password"
        type="password"
        name="password"
        value={demoPassword}
        onChange={(e) => {
          setDemoPassword(e.target.value);
          setDemoError('');
        }}
        fullWidth
        autoComplete="current-password"
        error={Boolean(demoError)}
        helperText={demoError}
      />
      <Button className={classes.loginButton} variant="primary" type="submit">
        Sign in
      </Button>
      <Typography className={classes.demoHint} variant="body2">
        Demo account — email: {DEMO_CREDENTIALS.email}, password: {DEMO_CREDENTIALS.password}
      </Typography>
    </Box>
  ) : (
    <Button
      className={classes.loginButton}
      variant="primary"
      type="button"
      onClick={loginWithRedirect}
      disabled={disabled}
    >
      {t('commonText.login.buttons.loginSSO')}
    </Button>
  );

  if (isLoading || isShow) {
    return isLoading || isShow ? (
      <LoaderComponent size={100} color={'primary'} label={'Loading'} />
    ) : (
      ''
    );
  }

  const reportProblemLink = process.env.REACT_APP_REPORT_A_PROBLEM_URL;

  return (
    <>
      <Box className={classes.mainFormLogin}>
        <Box className={classes.mainFormSlider}>
          {/* <img src={bannerImage} alt="banner Image" className={classes.bannerImage} /> */}
          <Slider {...settings}>
            {tenantInfo?.sliderData.map((item) => {
              return (
                <div className={classes.sliderBg} key={item.id}>
                  <div className={classes.sliderBgOverlay}></div>
                  <img src={item.imageUrl} className={classes.sliderBgImage} alt="" />
                  <div className={classes.sliderBgContent}>
                    <Typography variant="h1" className={classes.sliderBgTitle}>
                      {item.title}
                    </Typography>
                    <Typography variant="body2" className={classes.sliderBgText}>
                      {item.desc}
                    </Typography>
                  </div>
                </div>
              );
            })}
          </Slider>
        </Box>
        <Box className={classes.mainFormContent}>
          <Box className={classes.innerContent}>
            <Box className={classes.logoImage}>
              {/* <Logo /> */}
              {tenantInfo?.logo ? (
                <img
                  src={tenantInfo?.logo}
                  alt={tenantInfo?.logo}
                  style={{ width: '168px', height: '49px' }}
                />
              ) : null}
            </Box>
            <Box className={classes.welcomeContent}>
              <Box className={classes.loginHeadingWrapper}>
                <Typography variant="h1" className={classes.loginHeading}>
                  {t('commonText.login.welcome')}
                </Typography>
                <Typography className={classes.manageText} variant="body2">
                  {t('commonText.login.desc')}
                </Typography>
              </Box>
              {renderForm}
            </Box>
            <Box>
              <Box className={classes.welcomeLinks}>
                <Link
                  href={reportProblemLink}
                  target="_blank"
                  rel="noreferrer"
                  className={classes.linkReportProblem}
                >
                  {t('reportProblem.reportProblem')}?
                </Link>
              </Box>
              <Box className={classes.copyRightTextWrapper}>
                <Typography component="span" variant="body3" className={classes.copyRightText}>
                  @{new Date().getFullYear()} {capitalize(tenantInfo?.name)}.{' '}
                  {t('commonText.login.copyRightText')}
                </Typography>
                {/* add a link to the privacy policy */}
                <Link
                  className={classes.privacyPolicy}
                  href="https://www.teamsignal.com/privacy-policy/"
                  target="_blank"
                  rel="noreferrer"
                >
                  {t('commonText.login.privacyPolicy')}
                </Link>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* {reportProblemDrawer && (
        <SideDrawer isOpen={reportProblemDrawer} totalWidth="624px">
          <ReportProblemDrawer setReportProblemDrawer={setReportProblemDrawer} />
        </SideDrawer>
      )} */}
    </>
  );
}
