import { useSelector } from 'react-redux';

/**
 * Custom React hook to retrieve tenant-specific labels.
 *
 * This hook looks up a label string from the Redux store (`tenantConfigs.tenantLabels.labels`)
 * based on the given category and key. If the label is not found in Redux,
 * it falls back to the provided translation function (`t`).
 *
 * @example
 * // Usage inside a component
 * import { useTenantLabel } from 'hooks/useTenantLabel';
 * import { useTranslation } from 'react-i18next';
 *
 * function DashboardHeader() {
 *   const { t } = useTranslation();
 *   const { getLabel } = useTenantLabel();
 *
 *   // Retrieve a label by category and key
 *   const titleLabel = getLabel('terms', 'dashboardTitle', t);
 *
 *   return <h1>{titleLabel}</h1>;
 * }
 *
 * @returns {Object}
 * @returns {Function} getLabel - Function to fetch a label by category and key.
 */
export function useTenantLabel() {
  // Access all tenant-specific labels from Redux state
  const tenantLabels = useSelector((state) => state.tenantConfigs?.tenantLabels);

  /**
   * Retrieves a label from tenant labels or translation fallback.
   *
   * @param {string} [category='terms'] - The category under which the label is stored.
   * @param {string} key - The key identifying the specific label.
   * @param {Function} t - The translation function from react-i18next for fallback.
   * @returns {string} - The resolved label text.
   */
  const getLabel = (category = 'terms', key) => {
    if (!key) return '';

    // Attempt to fetch the label from tenantConfigs in Redux
    const reduxLabel = tenantLabels?.[category]?.[key];

    return reduxLabel;
  };

  return { getLabel };
}
