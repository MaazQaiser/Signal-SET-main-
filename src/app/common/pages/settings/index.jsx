import CustomTabsWithPermissions from 'commonComponents/customTabsWithPermissions';
import React from 'react';
import { useTranslation } from 'react-i18next';
import EmailConfigurations from 'src/app/common/pages/settings/sales/emailConfigurations';
import HolidayGroups from 'src/app/common/pages/settings/sales/holidayGroups';
import * as SALES from 'src/app/router/constant/SALESMODULE';
import { dashboardOptions } from 'src/utils/constants';

import DiscountSettings from './discountSettings';
import ProductSettings from './productSettings';
import RegionalConfiguration from './regionalConfiguration';
import RolesAndPermissions from './rolesAndPermissions';
import PricingConfigurations from './sales/pricingConfigurations';

const settingsTabs = (t) => {
  return [
    {
      title: `${t('obx.settings.preferences.mappingPreferences.title')}`,
      permission: SALES.MODULE_SALES_SETTINGS,
      tabValue: 'preferences',
      activeModule: [dashboardOptions.sale],
      aclPermission: SALES.ACL_SETTINGS_PREFERENCES_VIEW,
      components: [
        {
          title: `${t('obx.settings.preferences.mappingPreferences.holidayGroup.settingTitle')}`,
          component: <HolidayGroups />,
          permission: SALES.MODULE_SALES_SETTINGS,
          activeModule: [dashboardOptions.sale],
          aclPermission: SALES.ACL_SETTINGS_PREFERENCES_VIEW,
        },
      ],
    },
    {
      title: t('sales.settings.emailConfiguration'),
      permission: SALES.MODULE_SALES_SETTINGS, // changed permission so this tab won't appear
      tabValue: 'emailConfigurations',
      activeModule: [dashboardOptions.sale],
      component: <EmailConfigurations />,
      aclPermission: SALES.ACL_SETTINGS_EMAIL_CONFIGURATIONS_VIEW,
    },
    {
      title: 'Discount Settings',
      permission: SALES.MODULE_SALES_SETTINGS,
      tabValue: 'discountSettings',
      activeModule: [dashboardOptions.sale],
      aclPermission: SALES.ACL_SETTINGS_DISCOUNTS_VIEW,
      component: <DiscountSettings />,
    },
    {
      title: t('sales.settings.productSettings'),
      permission: SALES.MODULE_SALES_SETTINGS,
      tabValue: 'productSettings',
      activeModule: [dashboardOptions.sale],
      aclPermission: SALES.ACL_SETTINGS_PRODUCTS_VIEW,
      component: <ProductSettings />,
    },
    {
      title: `${t('sales.settings.rolesAndPermissions')}`,
      permission: SALES.MODULE_SALES_SETTINGS,
      tabValue: 'rolesAndPermissions',
      activeModule: [dashboardOptions.sale],
      aclPermission: SALES.ACL_SETTINGS_ROLES_PERMISSIONS_VIEW,
      component: <RolesAndPermissions />,
    },
    {
      title: t('sales.settings.pricingConfigurationsTab'),
      permission: SALES.MODULE_SALES_SETTINGS,
      tabValue: 'pricingConfigurations',
      activeModule: [dashboardOptions.sale],
      aclPermission: SALES.ACL_SETTINGS_PRICING_CONFIGURATIONS_VIEW,
      component: <PricingConfigurations />,
    },
    {
      title: t('sales.settings.regionalConfigurations.title'),
      permission: SALES.MODULE_SALES_SETTINGS,
      tabValue: 'regionalConfigurations',
      activeModule: [dashboardOptions.sale],
      aclPermission: SALES.ACL_SETTINGS_REGIONAL_CONFIGURATIONS_VIEW,
      component: <RegionalConfiguration />,
    },
  ];
};

const ObxSettings = () => {
  const { t } = useTranslation();

  const tabs = settingsTabs(t);

  return <CustomTabsWithPermissions data={tabs} defaultTab={0} />;
};

export default ObxSettings;
