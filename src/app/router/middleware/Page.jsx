import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Redirect } from 'react-router-dom';
import { mainDomain } from 'src/helper/utilityFunctions';
import { MULTI_TENANT_AUTH } from 'src/utils/constants/multiTanentAuthInfo';
import capitalize from 'src/utils/string/capitalize';

export default function Page({ route }) {
  const { t } = useTranslation();

  const tenant = MULTI_TENANT_AUTH[mainDomain()];

  useEffect(() => {
    const translatedTitle = route?.meta?.title ? t(`page.${route.meta.title}`) : '';
    document.title = translatedTitle
      ? `${translatedTitle} - ${capitalize(tenant?.name)}`
      : `${capitalize(tenant?.name || 'Signal')}`;
  }, [route?.meta?.title, t]);

  function next(newRoute) {
    if (newRoute && (typeof newRoute === 'string' || typeof newRoute === 'object')) {
      return <Redirect to={newRoute} />;
    }

    return route?.element;
  }

  return next();
}

Page.propTypes = {
  route: PropTypes.object,
};
