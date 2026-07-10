import { Avatar, Box, Button, Link, Typography } from '@mui/material';
import Divider from '@mui/material/Divider';
import Menu from '@mui/material/Menu';
import { ReactComponent as EmployeesSVG } from 'assets/icons/employees.svg';
import { ReactComponent as EmployeesChevronRight } from 'assets/icons/employeesChevronRight.svg';
import { ReactComponent as EmployeesLogOutIcon } from 'assets/icons/employeesLogOut.svg';
import { ReactComponent as DropDownIcon } from 'assets/svg/chevron-down.svg';
import { ReactComponent as HelperCircleIcon } from 'assets/svg/helper-circle.svg';
import { ReactComponent as LanguageIcon } from 'assets/svg/language.svg';
import { ReactComponent as RepeatBlackIcon } from 'assets/svg/repeat-black.svg';
import { ReactComponent as ReportProbleIcon } from 'assets/svg/ReportProbleIcon.svg';
import LanguageModel from 'commonComponents/accountDropdown/languageModel';
import LoaderComponent from 'commonComponents/loader';
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
// import ReportProblemModal from 'src/app/public/pages/reportProblemModal';
import history from 'src/app/router/utils/history';
import { mainDomain } from 'src/helper/utilityFunctions';
import { dashboardOptions, rolesEnum } from 'src/utils/constants';
import { MULTI_TENANT_AUTH } from 'src/utils/constants/multiTanentAuthInfo';

import {
  HO_WEB_FAQS,
  LOGOUT,
  OBX_WEB_FAQS,
  PROFILE,
  SALES_WEB_FAQS,
} from '../../../router/constant/ROUTE';
// import ReportProblemDrawer from '../reportProblemDrawer';
// import SideDrawer from '../sideDrawer';
import { useStyles } from './accountDropdown';

const AccountDropdown = () => {
  const classes = useStyles();
  const { t } = useTranslation();
  const userInfo = useSelector((state) => state.user.info);

  const tenant = MULTI_TENANT_AUTH[mainDomain()];
  // const [showModal, setShowModal] = useState(false);

  // const userRole = useSelector((state) => state.auth.userRole);
  // const dashboardActive = useSelector((state) => state.auth.dashboardActive);
  // const currentLanguage = useSelector((state) => state.auth.currentLanguage);

  /**
   * Destructured the approach but keeping the previous code commented in case 🤣
   * */
  const { userRole, dashboardActive, currentLanguage } = useSelector((state) => state.auth);
  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [languageModel, setLanguageModel] = useState(false);
  // const [reportProblemDrawer, setReportProblemDrawer] = useState(false);
  const dropdownRef = useRef(null);

  // Function to open the dropdown
  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
    setOpen(true);
  };

  // const handleCloseModal = () => {
  //   setShowModal(false);
  // };

  // Function to close the dropdown
  const handleClose = () => {
    setOpen(false);
    setAnchorEl(null);
  };

  const toggleProfileModel = (e) => {
    e.stopPropagation();
    handleClose();
    setLanguageModel((a) => !a);
  };

  const openFranchiseViewInNewTab = (e) => {
    e.stopPropagation();
  };

  const toggleProfileDrawer = (e) => {
    e.stopPropagation();

    handleClose();
  };

  const moveTo = (e, path) => {
    e.stopPropagation();
    handleClose();
    history.push(path);
  };

  const createFaqPath = () => {
    if (userRole?.slug === rolesEnum.homeOfficer) {
      const hoFaqPath = dashboardActive === dashboardOptions.ops ? HO_WEB_FAQS : SALES_WEB_FAQS;
      return hoFaqPath;
    }
    if (userRole?.slug === rolesEnum.salesManager) {
      return SALES_WEB_FAQS;
    }
    if (userRole?.slug === rolesEnum.franchiseOwner || userRole?.slug === rolesEnum.supervisor) {
      return OBX_WEB_FAQS;
    }
    return SALES_WEB_FAQS;
  };

  const reportProblemLink = process.env.REACT_APP_REPORT_A_PROBLEM_URL;

  const franchiseViewLink = tenant?.edgeUrl || '';

  const faqHandler = (e, path) => {
    e.stopPropagation();
    handleClose();
    history.push(path);
  };

  const logoutUser = () => {
    handleClose();
    setLoading(true);
    history.push(LOGOUT);
    // logout({ logoutParams: { returnTo: window.location.origin } });
    // LogoutRedux();
  };

  if (loading) {
    return <LoaderComponent size={50} color={'primary'} label={'Loading'} />;
  }

  return (
    <>
      <Box
        onClick={handleOpen}
        className={classes.mainBoxWrapper}
        ref={dropdownRef}
        aria-haspopup="true"
      >
        {loading && <LoaderComponent size={50} color={'primary'} label={'Loading'} />}
        {userInfo?.image ? <Avatar alt={userInfo?.name || ''} src={userInfo?.image} /> : ''}
        <Box className={classes.mainProfile}>
          <Typography className={classes.employeeName} variant="subtitle2">
            {userInfo?.name}
            <Menu
              id="demo-positioned-paper"
              aria-labelledby="demo-positioned-button"
              anchorEl={anchorEl}
              onClose={(e) => {
                e.stopPropagation();
                handleClose();
              }}
              open={open}
              classes={{ paper: classes.menuMainWrapper }}
              MenuListProps={{
                'aria-labelledby': 'demo-positioned-button',
                className: classes.menuMainWrapper,
              }}
            >
              <Box className={classes.mainAvatarItem}>
                <>{userInfo?.image ? <Avatar alt={userInfo?.name} src={userInfo?.image} /> : ''}</>
                <Box className={classes.dropRight}>
                  <Typography className={classes.userName} variant="subtitle2">
                    {userInfo?.name}
                  </Typography>
                  <Typography className={classes.userDesignation} variant="body3">
                    {userInfo?.label}
                  </Typography>
                </Box>
              </Box>
              <Box className={classes.dropFooter}>
                <Button
                  variant="onlyText"
                  disableRipple
                  onClick={(e) => {
                    moveTo(e, PROFILE);
                  }}
                  className={classes.profileBtn}
                >
                  <Box className={classes.logoutItem}>
                    <EmployeesSVG />
                    <Typography className={classes.userName} variant="subtitle2">
                      {t('profile.label')}
                    </Typography>
                  </Box>
                  <EmployeesChevronRight />
                </Button>

                <Divider className={classes.dividerGap} />
                {/*Switch to Franchise View button*/}
                {userRole?.slug !== rolesEnum.salesManager &&
                  userRole?.slug !== rolesEnum.internee && (
                    <>
                      <Link
                        onClick={openFranchiseViewInNewTab}
                        disableRipple
                        className={classes.linkBtn}
                        href={franchiseViewLink}
                        target="_blank"
                      >
                        <Box className={classes.logoutItem}>
                          <RepeatBlackIcon />
                          <Typography className={classes.reportProblemLink} variant="subtitle2">
                            {t('profile.switchToFranchiseView')}
                          </Typography>
                        </Box>
                        <EmployeesChevronRight />
                      </Link>
                      <Divider className={classes.dividerGap} />
                    </>
                  )}
                <Button
                  variant="onlyText"
                  disableRipple
                  onClick={toggleProfileModel}
                  className={classes.profileBtn}
                >
                  <Box className={classes.logoutItem}>
                    <LanguageIcon />
                    <Typography className={classes.userName} variant="subtitle2">
                      {t('profile.language')}
                    </Typography>
                  </Box>
                  <Box className={classes.addLanguage}>
                    <Box className={classes.IconClass}>
                      <img
                        className={classes.flagImages}
                        alt={currentLanguage?.image}
                        src={currentLanguage?.image}
                      />
                    </Box>
                    <Typography variant="subtitle3">{currentLanguage?.name}</Typography>
                    <EmployeesChevronRight />
                  </Box>
                </Button>
                <Divider className={classes.dividerGap} />

                <Link
                  onClick={toggleProfileDrawer}
                  disableRipple
                  className={classes.linkBtn}
                  href={reportProblemLink}
                  target="_blank"
                >
                  <Box className={classes.logoutItem}>
                    <ReportProbleIcon />
                    <Typography className={classes.reportProblemLink} variant="subtitle2">
                      {t('sideNavBar.linkText.reportProblem')}
                    </Typography>
                  </Box>
                  <EmployeesChevronRight />
                </Link>

                {/*{userRole?.slug === rolesEnum.homeOfficer && (*/}
                {/*  <>*/}
                {/*    <Divider className={classes.dividerGap} />*/}

                {/*    <Button*/}
                {/*      onClick={(e) => {*/}
                {/*        const faqPath =*/}
                {/*          dashboardActive === dashboardOptions.ops ? HO_WEB_FAQS : SALES_WEB_FAQS;*/}
                {/*        faqHandler(e, faqPath);*/}
                {/*      }}*/}
                {/*      variant="onlyText"*/}
                {/*      disableRipple*/}
                {/*      className={classes.profileBtn}*/}
                {/*    >*/}
                {/*      <Box className={classes.logoutItem}>*/}
                {/*        <HelperCircleIcon />*/}
                {/*        <Typography className={classes.userName} variant="subtitle2">*/}
                {/*          {t('sideNavBar.linkText.faq')} home officer*/}
                {/*        </Typography>*/}
                {/*      </Box>*/}
                {/*      <EmployeesChevronRight />*/}
                {/*    </Button>*/}
                {/*  </>*/}
                {/*)}*/}

                <Divider className={classes.dividerGap} />

                <Button
                  onClick={(e) => {
                    const path = createFaqPath();
                    faqHandler(e, path);
                  }}
                  variant="onlyText"
                  disableRipple
                  className={classes.profileBtn}
                >
                  <Box className={classes.logoutItem}>
                    <HelperCircleIcon />
                    <Typography className={classes.userName} variant="subtitle2">
                      {t('sideNavBar.linkText.faq')}
                    </Typography>
                  </Box>
                  <EmployeesChevronRight />
                </Button>

                <Divider className={classes.dividerGap} />
                <Button
                  startIcon={<EmployeesLogOutIcon />}
                  variant="onlyText"
                  className={classes.logoutBtn}
                  onClick={logoutUser}
                  type="button"
                  disableRipple
                >
                  <Typography className={classes.logoutText} variant="subtitle2">
                    {t('sideNavBar.linkText.logout')}
                  </Typography>
                </Button>
              </Box>
            </Menu>
          </Typography>

          <Typography className={classes.userDesignation} variant="body3">
            {userInfo?.label}
          </Typography>
        </Box>

        <Box className={classes.svgWrapper}>
          <DropDownIcon />
        </Box>
      </Box>
      {languageModel && <LanguageModel open={languageModel} handleClose={toggleProfileModel} />}
      {/* {reportProblemDrawer && (
        <SideDrawer isOpen={reportProblemDrawer} totalWidth="624px">
          <ReportProblemDrawer setReportProblemDrawer={setReportProblemDrawer} />
        </SideDrawer>
      )} */}
    </>
  );
};

export default AccountDropdown;
