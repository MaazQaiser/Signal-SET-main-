/**
 * Color token catalog for the Design showcase page.
 * Semantic tokens mirror src/theme/palette.js; scales mirror src/global.scss.
 */

export const COLOR_TOKEN_GROUPS = [
  {
    id: 'semantic-text',
    title: 'Semantic — Text',
    source: 'src/theme/palette.js',
    tokens: [
      { name: 'textPrimary', hex: '#262527' },
      { name: 'textSecondary1', hex: '#444446' },
      { name: 'textSecondary2', hex: '#5B5B5F' },
      { name: 'textSecondary3', hex: '#86868B' },
      { name: 'textPlaceholder', hex: '#6A6A70' },
      { name: 'textPlaceholderField', hex: '#CCCCCC' },
      { name: 'textDisabled', hex: '#AEAEB2' },
      { name: 'textOnColor', hex: '#FFFFFF' },
      { name: 'textBrand', hex: '#146DFF' },
      { name: 'textBrandHover', hex: '#0059FF' },
      { name: 'textBrandDisabled', hex: '#A9DEFF' },
      { name: 'textAlert', hex: '#B32318' },
      { name: 'textAlerDisabled', hex: '#FECDCA' },
      { name: 'textSuccess', hex: '#2E964B' },
      { name: 'textWarning', hex: '#F19F02' },
    ],
  },
  {
    id: 'semantic-border',
    title: 'Semantic — Border',
    source: 'src/theme/palette.js',
    tokens: [
      { name: 'borderSubtle1', hex: '#E6E6E7' },
      { name: 'borderSubtle2', hex: '#D0CFD2' },
      { name: 'borderStrong1', hex: '#AEAEB2' },
      { name: 'borderStrong2', hex: '#6A6A70' },
      { name: 'borderBrand', hex: '#146DFF' },
      { name: 'borderWarning', hex: '#F19F02' },
      { name: 'borderSuccess', hex: '#2E964B' },
      { name: 'borderAlert', hex: '#E43F32' },
      { name: 'borderPurple', hex: '#9747FF' },
      { name: 'borderAlertHover', hex: '#B32318' },
      { name: 'borderAlertDisabled', hex: '#FECDCA' },
      { name: 'borderBrandDisabled', hex: '#A9DEFF' },
    ],
  },
  {
    id: 'semantic-surface',
    title: 'Semantic — Surface',
    source: 'src/theme/palette.js',
    tokens: [
      { name: 'surfaceWhite', hex: '#FFFFFF' },
      { name: 'surfaceGreySubtle', hex: '#F5F5F6' },
      { name: 'surfaceGreyLight', hex: '#F6F6F6' },
      { name: 'surfaceGreyStrong1', hex: '#6A6A70' },
      { name: 'surfaceGreyDisabled', hex: '#AEAEB2' },
      { name: 'surfaceGreyStrong2', hex: '#262527' },
      { name: 'surfaceAlertSubtle', hex: '#FBEEED' },
      { name: 'surfaceAlertStrong', hex: '#E43F32' },
      { name: 'surfaceAlertDisabled', hex: '#FECDCA' },
      { name: 'surfaceAlertHover', hex: '#B32318' },
      { name: 'surfaceSuccessSubtle', hex: '#EFF8EF' },
      { name: 'surfaceSuccessStrong', hex: '#31A150' },
      { name: 'surfaceSuccessActive', hex: '#2DA551' },
      { name: 'surfaceWarningSubtle', hex: '#FEF0C7' },
      { name: 'surfaceWarningStrong', hex: '#FFAC0D' },
      { name: 'surfaceBrandSubtle', hex: '#E5F6FF' },
      { name: 'surfaceBrand', hex: '#146DFF' },
      { name: 'surfaceBrandDisabled', hex: '#A9DEFF' },
      { name: 'surfaceBrandHover', hex: '#0059FF' },
    ],
  },
  {
    id: 'scss-blue',
    title: 'SCSS — Blue scale',
    source: 'src/global.scss',
    tokens: [
      { name: '$blue-50', hex: '#E5F6FF' },
      { name: '$blue-100', hex: '#CFEFFF' },
      { name: '$blue-200', hex: '#A9DEFF' },
      { name: '$blue-300', hex: '#75C4FF' },
      { name: '$blue-400', hex: '#3F99FF' },
      { name: '$blue-500', hex: '#146DFF' },
      { name: '$blue-600', hex: '#0058FF' },
      { name: '$blue-700', hex: '#0059FF' },
      { name: '$blue-800', hex: '#004FE3' },
      { name: '$blue-900', hex: '#0032A0' },
      { name: '$blue-950', hex: '#001D66' },
      { name: '$light-blue-700', hex: '#0369A1' },
    ],
  },
  {
    id: 'scss-orange',
    title: 'SCSS — Orange scale',
    source: 'src/global.scss',
    tokens: [
      { name: '$orange-50', hex: '#FFF7ED' },
      { name: '$orange-100', hex: '#FFEED4' },
      { name: '$orange-200', hex: '#FFD9A8' },
      { name: '$orange-300', hex: '#FFBD71' },
      { name: '$orange-400', hex: '#FF9332' },
      { name: '$orange-500', hex: '#FE7711' },
      { name: '$orange-600', hex: '#EF5C07' },
      { name: '$orange-700', hex: '#C64308' },
      { name: '$orange-800', hex: '#9D360F' },
      { name: '$orange-900', hex: '#7E2F10' },
      { name: '$orange-950', hex: '#441406' },
    ],
  },
  {
    id: 'scss-grey',
    title: 'SCSS — Grey scale',
    source: 'src/global.scss',
    tokens: [
      { name: '$white', hex: '#FFFFFF' },
      { name: '$black', hex: '#000000' },
      { name: '$grey-50', hex: '#F5F5F6' },
      { name: '$grey-100', hex: '#E6E6E7' },
      { name: '$grey-200', hex: '#D0CFD2' },
      { name: '$grey-300', hex: '#AEAEB2' },
      { name: '$grey-400', hex: '#86868B' },
      { name: '$grey-500', hex: '#6A6A70' },
      { name: '$grey-600', hex: '#5B5B5F' },
      { name: '$grey-700', hex: '#4D4D51' },
      { name: '$grey-800', hex: '#444446' },
      { name: '$grey-900', hex: '#3C3C3D' },
      { name: '$grey-950', hex: '#262527' },
    ],
  },
  {
    id: 'scss-yellow',
    title: 'SCSS — Yellow scale',
    source: 'src/global.scss',
    tokens: [
      { name: '$yellow-100', hex: '#FEF7ED' },
      { name: '$yellow-200', hex: '#FCEFDC' },
      { name: '$yellow-300', hex: '#F9DEB8' },
      { name: '$yellow-400', hex: '#F6CE95' },
      { name: '$yellow-500', hex: '#FFBA57' },
    ],
  },
  {
    id: 'scss-success',
    title: 'SCSS — Success scale',
    source: 'src/global.scss',
    tokens: [
      { name: '$success-100', hex: '#EFF8EF' },
      { name: '$success-200', hex: '#DEF1DE' },
      { name: '$success-300', hex: '#BEE3BE' },
      { name: '$success-400', hex: '#9DD49D' },
      { name: '$success-500', hex: '#5CB85C' },
    ],
  },
  {
    id: 'scss-alert',
    title: 'SCSS — Alert scale',
    source: 'src/global.scss',
    tokens: [
      { name: '$alert-100', hex: '#FBEEED' },
      { name: '$alert-200', hex: '#F7DDDC' },
      { name: '$alert-300', hex: '#F0BAB9' },
      { name: '$alert-400', hex: '#E89895' },
      { name: '$alert-500', hex: '#D9534F' },
    ],
  },
  {
    id: 'scss-assign',
    title: 'SCSS — Assign / purple scale',
    source: 'src/global.scss',
    tokens: [
      { name: '$assign-100', hex: '#F6ECFE' },
      { name: '$assign-200', hex: '#ECD9FD' },
      { name: '$assign-300', hex: '#D9B3FB' },
      { name: '$assign-400', hex: '#C78EF9' },
      { name: '$assign-500', hex: '#A142F5' },
    ],
  },
];

export const makeTokenKey = (groupId, tokenId) => `${groupId}::${tokenId}`;

const slugify = (value) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'token';

export const buildInitialGroups = () =>
  COLOR_TOKEN_GROUPS.map((group) => ({
    id: group.id,
    title: group.title,
    source: group.source,
    isCustom: false,
    collapsed: false,
    tokens: group.tokens.map((token) => ({
      id: slugify(token.name),
      name: token.name,
      defaultHex: token.hex.toUpperCase(),
      isCustom: false,
    })),
  }));

export const buildInitialColorValues = (groups) => {
  const map = {};
  groups.forEach((group) => {
    group.tokens.forEach((token) => {
      map[makeTokenKey(group.id, token.id)] = (token.defaultHex || '#000000').toUpperCase();
    });
  });
  return map;
};

/** @deprecated use buildInitialColorValues(buildInitialGroups()) */
export const buildInitialColorMap = () => buildInitialColorValues(buildInitialGroups());

export const getDefaultHex = (groups, groupId, tokenId) => {
  const group = groups.find((g) => g.id === groupId);
  const token = group?.tokens.find((t) => t.id === tokenId);
  return token?.defaultHex?.toUpperCase() ?? '#000000';
};

export const createCustomGroup = (title) => ({
  id: `custom-group-${Date.now()}`,
  title: title.trim() || 'New collection',
  source: 'Custom',
  isCustom: true,
  collapsed: false,
  tokens: [],
});

export const createCustomToken = (name = 'newColor') => ({
  id: `custom-token-${Date.now()}`,
  name,
  defaultHex: '#146DFF',
  isCustom: true,
});
