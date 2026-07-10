import { Box, List, ListItem, Tooltip, Typography } from '@mui/material';
import { ReactComponent as Tasks } from 'assets/svg/tasks.svg';
import { ReactComponent as MinimizeDrawerIcon } from 'assetsComponents/images/minimizeSideBar.svg';
import classNames from 'classnames';
import userHasPermissionSideBar from 'globalUtils/auth/userHasPermissionSideBar';
import PropTypes from 'prop-types';
import { Children } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import * as HOMODULE from 'routerComponent/constant/HOMODULE';
import * as OBXMODULE from 'routerComponent/constant/OBXMODULE';
import * as ROUTE from 'routerComponent/constant/ROUTE';
import * as SALESMODULE from 'routerComponent/constant/SALESMODULE';
import { dashboardOptions } from 'src/utils/constants';

import {
  _Runsheet,
  Analytics,
  AttendanceIcon,
  CompanyIcon,
  ContactIcon,
  DashboardIcon,
  DealsIcon,
  Devices,
  // Dispatch,
  FranchiseIcon,
  IndustryVerticalsIcon,
  Invoices,
  LeaderBoardIcon,
  LocationIconSideBar,
  LucidUsertIcon,
  MapIcon,
  PayrollIcon,
  Report,
  Runsheet,
  Schedules,
  ScoutingIcon,
  SettingIcon,
  Sites,
  VehiclesIcon,
  Zones,
} from '../../../assets/svg/index';
import { rolesEnum } from '../../../utils/constants/index';
import { useStyles } from './sideBar';

const Sidebar = ({
  toggleSidebar,
  isCollapsed,
  isSidebarTransformed,
  // transformSidebar,
  className,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { pathname } = useLocation();

  const tenantInfo = useSelector((state) => state.auth?.tenantInfo);

  const sidebarItems = [
    // Home Office Sales Routes
    {
      title: `${t('sideNavBar.linkText.hoDashboard')}`,
      icon: <DashboardIcon />,
      iconActive: <DashboardIcon />,
      iconActiveCollapsed: <DashboardIcon />,
      path: ROUTE.HO_DASHBOARD,
      permission: HOMODULE.MODULE_HO_DASHBOARD,
      activeModule: [dashboardOptions.ops],
    },

    // franchises
    {
      title: `${t('sideNavBar.linkText.franchises')}`,
      icon: <FranchiseIcon />,
      iconActive: <FranchiseIcon />,
      iconActiveCollapsed: <FranchiseIcon />,
      path: ROUTE.HO_FRANCHISE_LISTING,
      permission: HOMODULE.MODULE_HO_FRANCHISE_LISTING,
      activeModule: [dashboardOptions.ops],
    },

    // Dashboard OBX Routes
    {
      title: `${t('sideNavBar.linkText.obxDashboard')}`,
      icon: <DashboardIcon />,
      iconActive: <DashboardIcon />,
      iconActiveCollapsed: <DashboardIcon />,
      path: ROUTE.OBX_DASHBOARD,
      permission: OBXMODULE.MODULE_OBX_DASHBOARD,
      activeModule: [dashboardOptions.ops],
    },
    {
      title: `${t('sideNavBar.linkText.franchiseMap')}`,
      icon: <MapIcon color="#ACACAE" />,
      iconActive: <MapIcon color="#64CC64" />,
      iconActiveCollapsed: <MapIcon color="#64CC64" />,
      path: ROUTE.HO_VIEW_SIGNAL_MAP,
      permission: HOMODULE.MODULE_HO_VIEW_FRANCHISE_MAP,
      activeModule: ['OPS'],
    },
    // zones Routes
    {
      title: `${t('sideNavBar.linkText.zones')}`,
      icon: <Zones />,
      iconActive: <Zones />,
      iconActiveCollapsed: <Zones />,
      path: ROUTE.OBX_ZONES,
      permission: OBXMODULE.MODULE_OBX_ZONES,
      activeModule: [dashboardOptions.ops],
    },

    // sites Routes
    {
      title: `${t('sideNavBar.linkText.sites')}`,
      icon: <Sites />,
      iconActive: <Sites />,
      iconActiveCollapsed: <Sites />,
      path: ROUTE.OBX_SITES,
      permission: OBXMODULE.MODULE_OBX_SITES,
      activeModule: [dashboardOptions.ops],
    },
    // franchiseMap Routes
    {
      title: `${t('sideNavBar.linkText.franchiseMap')}`,
      icon: <MapIcon />,
      iconActive: <MapIcon />,
      iconActiveCollapsed: <MapIcon />,
      path: ROUTE.OBX_FRANCHISE_MAP,
      permission: OBXMODULE.MODULE_OBX_FRANCHISE_MAP,
      activeModule: [dashboardOptions.ops],
    },
    // schedules Routes
    {
      title: `${t('sideNavBar.linkText.schedules')}`,
      icon: <Schedules />,
      iconActive: <Schedules />,
      iconActiveCollapsed: <Schedules />,
      path: ROUTE.OBX_SCHEDULES,
      permission: OBXMODULE.MODULE_OBX_SCHEDULE,
      activeModule: [dashboardOptions.ops],
    },
    // runSheets Routes
    {
      title: `${t('sideNavBar.linkText.runSheets')}`,
      icon: <Runsheet />,
      iconActive: <Runsheet />,
      iconActiveCollapsed: <Runsheet />,
      path: ROUTE.OBX_RUNSHEET,
      permission: OBXMODULE.MODULE_OBX_RUNSHEET,
      activeModule: [dashboardOptions.ops],
    },

    // Dispatch Routes
    // {
    //   title: `${t('sideNavBar.linkText.dispatch')}`,
    //   icon: <Dispatch />,
    //   iconActive: <Dispatch />,
    //   iconActiveCollapsed: <Dispatch />,
    //   path: ROUTE.OBX_DISPATCH,
    //   permission: OBXMODULE.MODULE_OBX_DISPATCH,
    //   activeModule: [dashboardOptions.ops],
    // },

    // reports Routes
    {
      title: `${t('sideNavBar.linkText.reports')}`,
      icon: <Report />,
      iconActive: <Report />,
      iconActiveCollapsed: <Report />,
      path: ROUTE.OBX_REPORTS,
      permission: OBXMODULE.MODULE_OBX_REPORTS,
      activeModule: [dashboardOptions.ops],
    },
    // users Routes
    {
      title: `${t('sideNavBar.linkText.users')}`,
      icon: <LucidUsertIcon />,
      iconActive: <LucidUsertIcon />,
      iconActiveCollapsed: <LucidUsertIcon />,
      path: ROUTE.OBX_USER,
      permission: OBXMODULE.MODULE_OBX_USERS,
      activeModule: [dashboardOptions.ops],
    },

    // attendance Routes
    {
      title: `${t('sideNavBar.linkText.leaveRequest')}`,
      icon: <AttendanceIcon />,
      iconActive: <AttendanceIcon />,
      iconActiveCollapsed: <AttendanceIcon />,
      path: ROUTE.OBX_ATTENDANCE,
      permission: OBXMODULE.MODULE_OBX_ATTENDANCE,
      activeModule: [dashboardOptions.ops],
    },
    // OBX Payroll
    {
      title: `${t('sideNavBar.linkText.payroll')}`,
      icon: <PayrollIcon />,
      iconActive: <PayrollIcon />,
      iconActiveCollapsed: <PayrollIcon />,
      path: ROUTE.OBX_PAYROLL,
      permission: OBXMODULE.MODULE_OBX_PAYROLL,
      activeModule: [dashboardOptions.ops],
    },
    // invoices Routes
    {
      title: `${t('sideNavBar.linkText.invoices')}`,
      icon: <Invoices />,
      iconActive: <Invoices />,
      iconActiveCollapsed: <Invoices />,
      path: ROUTE.OBX_INVOICES,
      permission: OBXMODULE.MODULE_OBX_INVOICES,
      activeModule: [dashboardOptions.ops],
    },
    // ho users Routes
    {
      title: `${t('sideNavBar.linkText.users')}`,
      icon: <LucidUsertIcon />,
      iconActive: <LucidUsertIcon />,
      iconActiveCollapsed: <LucidUsertIcon />,
      path: ROUTE.HO_USER,
      permission: HOMODULE.MODULE_HO_USERS,
      activeModule: [dashboardOptions.ops],
    },
    // analytics Routes
    {
      title: `${t('sideNavBar.linkText.analytics')}`,
      icon: <Analytics />,
      iconActive: <Analytics />,
      iconActiveCollapsed: <Analytics />,
      path: ROUTE.OBX_ANALYTICS,
      permission: OBXMODULE.MODULE_OBX_ANALYTICS,
      activeModule: [dashboardOptions.ops],
    },
    // leaderBoard Routes
    {
      title: `${t('sideNavBar.linkText.leaderBoard')}`,
      icon: <LeaderBoardIcon />,
      iconActive: <LeaderBoardIcon />,
      iconActiveCollapsed: <LeaderBoardIcon />,
      path: ROUTE.OBX_LEADERBOARD,
      permission: OBXMODULE.MODULE_OBX_LEADERBOARD,
      activeModule: [dashboardOptions.ops],
    },
    // devices Routes
    {
      title: `${t('sideNavBar.linkText.devices')}`,
      icon: <Devices />,
      iconActive: <Devices />,
      iconActiveCollapsed: <Devices />,
      path: ROUTE.OBX_DEVICES,
      permission: OBXMODULE.MODULE_OBX_DEVICES,
      activeModule: [dashboardOptions.ops],
    },
    // vehicles Routes
    {
      title: `${t('sideNavBar.linkText.vehicles')}`,
      icon: <VehiclesIcon />,
      iconActive: <VehiclesIcon />,
      iconActiveCollapsed: <VehiclesIcon />,
      path: ROUTE.OBX_VEHICLES,
      permission: OBXMODULE.MODULE_OBX_VEHICLES,
      activeModule: [dashboardOptions.ops],
    },
    // OBX setting Routes
    {
      title: `${t('sideNavBar.linkText.obxSetting')}`,
      icon: <SettingIcon />,
      iconActive: <SettingIcon />,
      iconActiveCollapsed: <SettingIcon />,
      path: ROUTE.COMMON_SETTING_PREFERENCES,
      permission: OBXMODULE.MODULE_OBX_settings,
      activeModule: [dashboardOptions.ops],
    },
    // Ho setting Routes
    {
      title: `${t('sideNavBar.linkText.hoSetting')}`,
      icon: <SettingIcon />,
      iconActive: <SettingIcon />,
      iconActiveCollapsed: <SettingIcon />,
      path: ROUTE.HO_SETTINGS,
      permission: HOMODULE.MODULE_HO_SETTINGS,
      activeModule: [dashboardOptions.ops],
    },

    // SALES Routes Dashboard
    {
      title: `${t('sideNavBar.linkText.obxDashboard')}`,
      icon: <DashboardIcon />,
      iconActive: <DashboardIcon />,
      iconActiveCollapsed: <DashboardIcon />,
      path: ROUTE.SALES_DASHBOARD,
      permission: SALESMODULE.MODULE_SALES_DASHBOARD,
      activeModule: [dashboardOptions.sale],
      aclPermission: SALESMODULE.ACL_DASHBOARD_VIEW,
    },
    // SALES Locations/Properties
    {
      title: `${t('sideNavBar.linkText.locations')}`,
      icon: <LocationIconSideBar />,
      iconActive: <LocationIconSideBar />,
      iconActiveCollapsed: <LocationIconSideBar />,
      path: ROUTE.SALES_LOCATIONS,
      permission: SALESMODULE.MODULE_LOCATIONS_LISTING,
      activeModule: [dashboardOptions.sale],
      aclPermission: SALESMODULE.ACL_PROPERTIES_VIEW,
    },
    // SALES Deals
    {
      title: `${t('sideNavBar.linkText.deals')}`,
      icon: <DealsIcon />,
      iconActive: <DealsIcon />,
      iconActiveCollapsed: <DealsIcon />,
      path: ROUTE.SALES_DEALS,
      permission: SALESMODULE.MODULE_DEALS_LISTING,
      activeModule: [dashboardOptions.sale],
      aclPermission: SALESMODULE.ACL_DEALS_VIEW,
    },

    // SALES Company
    {
      title: `${t('sideNavBar.linkText.companies')}`,
      icon: <CompanyIcon />,
      iconActive: <CompanyIcon />,
      iconActiveCollapsed: <CompanyIcon />,
      path: ROUTE.SALES_COMPANIES,
      permission: SALESMODULE.MODULE_COMPANIES_LISTING,
      activeModule: [dashboardOptions.sale],
      aclPermission: SALESMODULE.ACL_COMPANIES_VIEW,
    },

    // SALES Contacts
    {
      title: `${t('sideNavBar.linkText.contacts')}`,
      icon: <ContactIcon />,
      iconActive: <ContactIcon />,
      iconActiveCollapsed: <ContactIcon />,
      path: ROUTE.SALES_CONTACTS,
      permission: SALESMODULE.MODULE_CONTACTS_LISTING,
      activeModule: [dashboardOptions.sale],
      aclPermission: SALESMODULE.ACL_CONTACTS_VIEW,
    },
    {
      title: `${t('sideNavBar.linkText.tasks')}`,
      icon: <Tasks />,
      iconActive: <Tasks />,
      iconActiveCollapsed: <Tasks />,
      path: ROUTE.SALES_TASKS,
      activeModule: [dashboardOptions.sale],
      aclPermission: SALESMODULE.ACL_TASKS_VIEW,
    },
    {
      title: `${t('sideNavBar.linkText.leadsMap', {
        mapTerm: tenantInfo?.name,
      })}`,
      icon: <MapIcon />,
      iconActive: <MapIcon />,
      iconActiveCollapsed: <MapIcon />,
      path: ROUTE.SALES_LEADS_MAP,
      permission: SALESMODULE.MODULE_LEADS_MAP,
      activeModule: [dashboardOptions.sale],
      aclPermission: SALESMODULE.ACL_MAP_VIEW,
    },
    // Sales Users
    {
      title: `${t('sideNavBar.linkText.users')}`,
      icon: <LucidUsertIcon />,
      iconActive: <LucidUsertIcon />,
      iconActiveCollapsed: <LucidUsertIcon />,
      path: ROUTE.SALES_USERS,
      permission: SALESMODULE.MODULE_USERS_LISTING,
      activeModule: [dashboardOptions.sale],
      aclPermission: SALESMODULE.ACL_USERS_VIEW,
    },
    // Sales Industry Verticals
    {
      title: `${t('sideNavBar.linkText.marketVerticals')}`,
      icon: <IndustryVerticalsIcon />,
      iconActive: <IndustryVerticalsIcon />,
      iconActiveCollapsed: <IndustryVerticalsIcon />,
      path: ROUTE.SALES_INDUSTRY_VERTICALS,
      permission: SALESMODULE.MODULE_INDUSTRY_VERTICALS_LISTING,
      activeModule: [dashboardOptions.sale],
      aclPermission: SALESMODULE.ACL_INDUSTRY_VERTICALS_VIEW,
    },
    // SALES Scouting
    {
      title: `${t('sideNavBar.linkText.scoutingRoutes')}`,
      icon: <ScoutingIcon />,
      iconActive: <ScoutingIcon />,
      iconActiveCollapsed: <ScoutingIcon />,
      path: ROUTE.SALES_SCOUTING,
      permission: SALESMODULE.MODULE_SCOUTING_LISTING,
      activeModule: [dashboardOptions.sale],
      aclPermission: SALESMODULE.ACL_SCOUTING_VIEW,
    },
    // SALES Settings
    {
      title: `${t('sideNavBar.linkText.settings')}`,
      icon: <SettingIcon />,
      iconActive: <SettingIcon />,
      iconActiveCollapsed: <SettingIcon />,
      path: ROUTE.COMMON_SETTING_MAPPING_PREFERENCE,
      permission: SALESMODULE.MODULE_SALES_SETTINGS,
      activeModule: [dashboardOptions.sale],
      aclPermission: SALESMODULE.ACL_SETTINGS_VIEW,
    },
  ];

  // Modify this check accordingly when operation's dashboard is being added
  const _getDashboardLink = (role) => {
    if (role === rolesEnum.homeOfficer) {
      return ROUTE.SALES_DASHBOARD;
    }
    return ROUTE.OBX_DASHBOARD;
  };

  return (
    <>
      {isCollapsed && <Box className={classes.backdropOverlay} onClick={toggleSidebar}></Box>}
      <Box
        className={`${classes.sidebarOverlay} ${className} ${
          !isCollapsed ? classes.compressBar : ''
        } `}
      >
        {/* this is to close the Sidebar */}
        <Box
          className={classNames(
            classes.toggleSidebarButton,
            isCollapsed && classes.toggleBtnRotated,
          )}
          onClick={toggleSidebar}
        >
          <MinimizeDrawerIcon />
        </Box>
        <Box
          className={`${classes.sidebarWrapper} ${isCollapsed && classes.sidebarWapperCollapsed} ${
            isSidebarTransformed ? 'transformed' : ''
          }`}
        >
          <Box
            className={classNames(
              !isCollapsed && classes.signalLogoShortIconWrapper,
              isCollapsed && classes.signalLogoWithTextIconWrapper,
            )}
          >
            {isCollapsed ? (
              <img
                src={tenantInfo?.images?.logo1 || tenantInfo?.logo}
                alt=""
                className={classes.signalLogoWithTextIcon}
              />
            ) : (
              <img
                src={tenantInfo?.images?.logo1 || tenantInfo?.logo}
                alt=""
                className={classes.signalLogoShortIcon}
              />
            )}
          </Box>

          <Box
            className={classNames(
              !isCollapsed && classes.linksWrapperCollapsed,
              isCollapsed && classes.linksWrapperExpended,
            )}
          >
            <List
              className={classNames(
                !isCollapsed && classes.linksListCompressed,
                isCollapsed && classes.linksListExpended,
              )}
            >
              {Children.toArray(
                sidebarItems
                  // filter links for which user has permission to access
                  .filter((link) =>
                    'aclPermission' in link
                      ? userHasPermissionSideBar(
                          link?.permission,
                          link?.activeModule,
                          link?.aclPermission,
                        )
                      : false,
                  )
                  .map((item) => {
                    let navIcon = item.icon;
                    if (pathname.startsWith(item.path)) {
                      navIcon = item.iconActive;
                    }
                    if (isCollapsed && pathname.startsWith(item.path)) {
                      navIcon = item.iconActiveCollapsed;
                    }

                    return !isCollapsed ? (
                      <Tooltip
                        classes={classes.customTooltip}
                        title={item.title}
                        placement="right"
                        arrow
                      >
                        <ListItem
                          className={classNames(classes.linkListItemCollapsed, {
                            active: pathname.startsWith(item.path),
                          })}
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          <Link to={item.path} className={classes.listLinkCollapsed}>
                            {navIcon}
                          </Link>
                        </ListItem>
                      </Tooltip>
                    ) : (
                      <ListItem
                        className={classNames(classes.linkListItemExpended, {
                          active: pathname.startsWith(item.path),
                        })}
                      >
                        <Link to={item.path} underline="none" className={classes.listLinkExpanded}>
                          {navIcon}
                          <Typography className={classes.linkText} component="span">
                            {item.title}
                          </Typography>
                        </Link>
                      </ListItem>
                    );
                  }),
              )}
            </List>
          </Box>
        </Box>
      </Box>
    </>
  );
};

Sidebar.propTypes = {
  toggleSidebar: PropTypes.func,
  isCollapsed: PropTypes.bool,
  isSidebarTransformed: PropTypes.bool,
  transformSidebar: PropTypes.func,
  className: PropTypes.string, // Adjust the type accordingly based on your use case
};

export default Sidebar;
