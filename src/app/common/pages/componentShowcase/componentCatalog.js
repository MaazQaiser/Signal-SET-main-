/**
 * Catalog of UI primitives and shared components for the showcase page.
 * `previewType` drives rendering in ComponentPreview.jsx.
 */

export const BUTTON_VARIANTS = [
  { variant: 'primary', label: 'Primary' },
  { variant: 'secondaryGrey', label: 'Secondary grey' },
  { variant: 'tertiaryGrey', label: 'Tertiary grey' },
  { variant: 'onlyText', label: 'Only text' },
  { variant: 'secondaryBlue', label: 'Secondary blue' },
  { variant: 'destructive', label: 'Destructive' },
  { variant: 'destructiveSecondary', label: 'Destructive secondary' },
];

export const TYPOGRAPHY_VARIANTS = [
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'subtitle1',
  'subtitle2',
  'subtitle3',
  'subtitle4',
  'body1',
  'body2',
  'body3',
  'caption',
  'overline',
  'info',
];

export const CHIP_VARIANTS = [
  { color: 'primary', label: 'Primary' },
  { color: 'success', label: 'Success' },
  { color: 'warning', label: 'Warning' },
  { color: 'error', label: 'Error' },
  { color: 'info', label: 'Info' },
];

export const SWITCH_VARIANTS = [
  { id: 'on', label: 'Checked', previewProps: { checked: true } },
  { id: 'off', label: 'Unchecked', previewProps: { checked: false } },
  { id: 'disabled', label: 'Disabled', previewProps: { checked: false, disabled: true } },
];

export const COMMON_COMPONENTS = [
  {
    name: 'CustomDropDown',
    importPath: 'src/app/components/common/customDropDown',
    alias: 'commonComponents/customDropDown',
    description: 'Styled select / dropdown with search & multi-select',
    previewType: 'customDropdown',
  },
  {
    name: 'CustomInput',
    importPath: 'src/app/components/common/templates/customInput',
    alias: 'commonComponents/templates/customInput',
    description: 'Form text input with label',
    previewType: 'customInput',
  },
  {
    name: 'SelectInput',
    importPath: 'src/app/components/common/Select',
    alias: 'commonComponents/Select',
    description: 'MUI Select wrapper with optional search',
    previewType: 'selectInput',
  },
  {
    name: 'CheckBoxLabel',
    importPath: 'src/app/components/common/templates/checkBoxLabel',
    alias: 'commonComponents/templates/checkBoxLabel',
    description: 'Checkbox with custom icons + label',
    previewType: 'checkbox',
  },
  {
    name: 'CustomRadioGroup',
    importPath: 'src/app/components/common/templates/customRadioGroup',
    alias: 'commonComponents/templates/customRadioGroup',
    description: 'Radio group with custom SVG icons (row layout)',
    previewType: 'radio',
  },
  {
    name: 'IconButtons',
    importPath: 'src/app/components/common/templates/iconButton',
    alias: 'commonComponents/templates/iconButton',
    description: 'MUI IconButton wrapper — pass any SVG as Icon',
    previewType: 'iconButton',
  },
  {
    name: 'CustomTabsWithPermissions',
    importPath: 'src/app/components/common/customTabsWithPermissions',
    alias: 'commonComponents/customTabsWithPermissions',
    description: 'Settings-style tabs filtered by ACL (needs tab data + router)',
    previewType: 'tabs',
    previewNote: 'Showcase uses MUI Tabs; app uses @mui/base Tabs + permissions',
  },
  {
    name: 'CustomTabPanel',
    importPath: 'src/app/components/common/customTabPanel',
    alias: 'commonComponents/customTabPanel',
    description: 'Tab panel wrapper (use with Tabs + state)',
    previewType: 'tabs',
    previewNote: 'Pair with Tabs; panel shown when value === index',
  },
  {
    name: 'TableComponent',
    importPath: 'src/app/components/common/table',
    alias: 'commonComponents/table',
    description: 'Sortable MUI table with pagination',
    previewType: 'table',
  },
  {
    name: 'NoRecordFound',
    importPath: 'src/app/components/common/table/noRecordFound',
    alias: 'commonComponents/table/noRecordFound',
    description: 'Empty table / listing state',
    previewType: 'noRecord',
  },
  {
    name: 'LoaderComponent',
    importPath: 'src/app/components/common/loader',
    alias: 'commonComponents/loader',
    description: 'Full-screen Lottie loading overlay',
    previewType: 'loader',
  },
  {
    name: 'ModalComponent',
    importPath: 'src/app/components/common/modal',
    alias: 'commonComponents/modal',
    description: 'MUI Modal wrapper',
    previewType: 'modal',
  },
  {
    name: 'SideDrawer',
    importPath: 'src/app/components/common/sideDrawer',
    alias: 'commonComponents/sideDrawer',
    description: 'Right-side drawer panel',
    previewType: 'drawer',
  },
  {
    name: 'Breadcrumb',
    importPath: 'src/app/components/common/breadcrumb',
    alias: 'commonComponents/breadcrumb',
    description: 'Navigation breadcrumb from route',
    previewType: 'breadcrumb',
  },
  {
    name: 'ConfirmationDialog',
    importPath: 'src/app/components/common/confirmationDialog',
    alias: 'commonComponents/confirmationDialog',
    description: 'Confirm / cancel dialog',
    previewType: 'modal',
    previewNote: 'Same overlay pattern as Modal',
  },
  {
    name: 'CommonDataTable',
    importPath: 'src/app/components/common/dataTable',
    alias: 'commonComponents/dataTable',
    description: 'react-data-table-component wrapper',
    previewType: 'table',
    previewNote: 'See Table section for MUI table preview',
  },
];

export const buildSections = () => [
  {
    id: 'buttons',
    title: 'Button',
    source: '@mui/material/Button · src/theme/overrides/muiButton.js',
    items: BUTTON_VARIANTS.flatMap(({ variant, label }) => [
      {
        id: `button-${variant}`,
        name: 'Button',
        variant: label,
        variantCode: variant,
        previewType: 'button',
        previewProps: { variant, children: label },
      },
      {
        id: `button-${variant}-disabled`,
        name: 'Button',
        variant: `${label} (disabled)`,
        variantCode: variant,
        previewType: 'button',
        previewProps: { variant, children: label, disabled: true },
      },
    ]),
  },
  {
    id: 'typography',
    title: 'Typography',
    source: '@mui/material/Typography · src/theme/typography.js',
    items: TYPOGRAPHY_VARIANTS.map((variant) => ({
      id: `typography-${variant}`,
      name: 'Typography',
      variant,
      previewType: 'typography',
      previewProps: { variant, children: `The quick brown fox — ${variant}` },
    })),
  },
  {
    id: 'chips',
    title: 'Chip',
    source: '@mui/material/Chip · src/theme/overrides/muiChip.js',
    items: CHIP_VARIANTS.map(({ color, label }) => ({
      id: `chip-${color}`,
      name: 'Chip',
      variant: `color="${color}"`,
      previewType: 'chip',
      previewProps: { color, label },
    })),
  },
  {
    id: 'switch',
    title: 'Switch',
    source: '@mui/material/Switch · src/theme/overrides/muiSwitch.js',
    items: SWITCH_VARIANTS.map(({ id, label, previewProps }) => ({
      id: `switch-${id}`,
      name: 'Switch',
      variant: label,
      previewType: 'switch',
      previewProps,
    })),
  },
  {
    id: 'dropdowns',
    title: 'Dropdowns',
    source: 'commonComponents/customDropDown · commonComponents/Select',
    items: [
      {
        id: 'dropdown-custom',
        name: 'CustomDropDown',
        variant: 'Single select · search · multi-select',
        description: 'Primary app dropdown',
        previewType: 'customDropdown',
      },
      {
        id: 'dropdown-select',
        name: 'SelectInput',
        variant: 'MUI Select wrapper',
        previewType: 'selectInput',
      },
    ],
  },
  {
    id: 'checkbox-radio',
    title: 'Checkbox & radio',
    source: 'commonComponents/templates · theme/overrides muiCheckbox · muiRadio',
    items: [
      {
        id: 'checkbox-checked',
        name: 'CheckBoxLabel',
        variant: 'Checked',
        previewType: 'checkbox',
        previewProps: { checked: true, label: 'Checked' },
      },
      {
        id: 'checkbox-unchecked',
        name: 'CheckBoxLabel',
        variant: 'Unchecked',
        previewType: 'checkbox',
        previewProps: { checked: false, label: 'Unchecked' },
      },
      {
        id: 'checkbox-disabled',
        name: 'CheckBoxLabel',
        variant: 'Disabled',
        previewType: 'checkbox',
        previewProps: { checked: true, disabled: true, label: 'Disabled' },
      },
      {
        id: 'radio-default',
        name: 'CustomRadioGroup',
        variant: 'Row · 3 options',
        previewType: 'radio',
      },
      {
        id: 'radio-disabled',
        name: 'CustomRadioGroup',
        variant: 'Disabled',
        previewType: 'radio',
        previewProps: { disabled: true },
      },
    ],
  },
  {
    id: 'icon-buttons',
    title: 'Icon button',
    source: 'commonComponents/templates/iconButton · @mui/material/IconButton',
    items: [
      {
        id: 'icon-button-default',
        name: 'IconButtons',
        variant: 'Default · disabled',
        previewType: 'iconButton',
      },
    ],
  },
  {
    id: 'form-inputs',
    title: 'Text inputs',
    source: 'commonComponents/templates/customInput',
    items: [
      {
        id: 'form-input',
        name: 'CustomInput',
        variant: 'Outlined text field',
        previewType: 'customInput',
      },
    ],
  },
  {
    id: 'tabs',
    title: 'Tabs',
    source: 'CustomTabsWithPermissions · CustomTabPanel · MUI Tabs',
    items: [
      {
        id: 'tabs-mui',
        name: 'Tabs',
        variant: 'MUI Tabs (pattern used across app)',
        previewType: 'tabs',
      },
      {
        id: 'tabs-custom',
        name: 'CustomTabsWithPermissions',
        variant: 'commonComponents/customTabsWithPermissions',
        description: 'ACL-filtered settings tabs; requires data + ?activeTab= query',
        previewType: 'tabs',
        previewNote: 'Used on Settings and similar pages',
      },
    ],
  },
  {
    id: 'surfaces',
    title: 'Card & surfaces',
    source: '@mui/material',
    items: [
      {
        id: 'paper',
        name: 'Paper',
        variant: 'elevation · outlined',
        previewType: 'surfaces',
      },
      {
        id: 'card',
        name: 'Card',
        variant: 'Card + CardContent',
        previewType: 'card',
      },
    ],
  },
  {
    id: 'tables',
    title: 'Table',
    source: 'commonComponents/table',
    items: [
      {
        id: 'table-sample',
        name: 'TableComponent',
        variant: 'Sample (2 columns)',
        previewType: 'table',
      },
    ],
  },
  {
    id: 'common',
    title: 'Common components',
    source: 'src/app/components/common/',
    items: COMMON_COMPONENTS.map((component) => ({
      id: `common-${component.name}`,
      name: component.name,
      variant: component.alias,
      description: component.description,
      importPath: component.importPath,
      previewType: component.previewType,
      previewNote: component.previewNote,
    })),
  },
];
