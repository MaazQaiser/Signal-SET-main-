import { Box, Switch, Tab, Tabs, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { MemoryRouter } from 'react-router-dom';
import CustomDropDown from 'src/app/components/common/customDropDown';
import SelectInput from 'src/app/components/common/Select';
import NoRecordFound from 'src/app/components/common/table/noRecordFound';
import CheckBoxLabel from 'src/app/components/common/templates/checkBoxLabel';
import CustomInput from 'src/app/components/common/templates/customInput';
import CustomRadioGroup from 'src/app/components/common/templates/customRadioGroup';
import IconButtons from 'src/app/components/common/templates/iconButton';
import { ReactComponent as EditIcon } from 'src/assets/svg/edit.svg';

const MOCK_DROPDOWN_OPTIONS = [
  { label: 'Option one', value: '1' },
  { label: 'Option two', value: '2' },
  { label: 'Option three', value: '3' },
];

const MOCK_SELECT_OPTIONS = [
  { id: '1', value: 'First choice' },
  { id: '2', value: 'Second choice' },
];

const MOCK_RADIO_OPTIONS = [
  { id: 'option-a', optionText: 'Option A' },
  { id: 'option-b', optionText: 'Option B' },
  { id: 'option-c', optionText: 'Option C' },
];

const previewFrameClass = 'component-showcase-preview-frame';

export const DropdownPreview = () => {
  const [selected, setSelected] = useState('');

  return (
    <Box className={previewFrameClass} sx={{ minWidth: 220, maxWidth: 280 }}>
      <CustomDropDown
        name="showcaseDropdown"
        label="Label"
        placeHolder="Select option"
        options={MOCK_DROPDOWN_OPTIONS}
        selectedValues={selected}
        handleChange={(e) => setSelected(e.target.value)}
        bordered
      />
    </Box>
  );
};

export const InputPreview = () => {
  const [value, setValue] = useState('Sample text');

  return (
    <Box className={previewFrameClass} sx={{ minWidth: 220, maxWidth: 280 }}>
      <CustomInput
        label="Label"
        name="showcaseInput"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Enter value"
      />
    </Box>
  );
};

export const SelectPreview = () => {
  const [selected, setSelected] = useState('1');

  return (
    <Box className={previewFrameClass} sx={{ minWidth: 220, maxWidth: 280 }}>
      <SelectInput
        name="showcaseSelect"
        defaultLabel="Choose one"
        options={MOCK_SELECT_OPTIONS}
        selectedValue={selected}
        onChange={(e) => setSelected(e.target.value)}
      />
    </Box>
  );
};

export const CheckboxPreview = ({
  checked: initialChecked = true,
  disabled = false,
  label = 'Remember me',
}) => {
  const [checked, setChecked] = useState(initialChecked);

  return (
    <CheckBoxLabel
      label={label}
      name="showcaseCheckbox"
      value={checked}
      disabled={disabled}
      handleChange={(e) => setChecked(e.target.checked)}
    />
  );
};

CheckboxPreview.propTypes = {
  checked: PropTypes.bool,
  disabled: PropTypes.bool,
  label: PropTypes.string,
};

export const RadioPreview = ({ disabled = false }) => {
  const [value, setValue] = useState('option-a');

  return (
    <Box className={previewFrameClass}>
      <CustomRadioGroup
        label="Choose one"
        options={MOCK_RADIO_OPTIONS}
        value={value}
        handleChange={(e) => setValue(e.target.value)}
        disabled={disabled}
      />
    </Box>
  );
};

RadioPreview.propTypes = {
  disabled: PropTypes.bool,
};

export const IconButtonPreview = () => (
  <Box className={previewFrameClass} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
    <IconButtons Icon={<EditIcon />} aria-label="Edit" size="small" />
    <IconButtons Icon={<EditIcon />} aria-label="Edit disabled" size="small" disabled />
  </Box>
);

export const SwitchPreview = ({ checked = true, disabled = false }) => (
  <Switch checked={checked} disabled={disabled} inputProps={{ 'aria-label': 'Switch preview' }} />
);

SwitchPreview.propTypes = {
  checked: PropTypes.bool,
  disabled: PropTypes.bool,
};

export const TabsPreview = () => {
  const [tab, setTab] = useState(0);

  return (
    <Box sx={{ width: '100%', maxWidth: 320 }}>
      <Tabs value={tab} onChange={(_, v) => setTab(v)}>
        <Tab label="Tab one" disableRipple />
        <Tab label="Tab two" disableRipple />
        <Tab label="Tab three" disableRipple />
      </Tabs>
      <Box sx={{ pt: 1.5, px: 0.5 }}>
        <Typography variant="body3" color="textSecondary">
          Panel {tab + 1} content
        </Typography>
      </Box>
    </Box>
  );
};

export const NoRecordPreview = () => (
  <Box className={previewFrameClass}>
    <NoRecordFound data={[]} type="listing" title="No records found" />
  </Box>
);

export const BreadcrumbPreview = () => (
  <MemoryRouter initialEntries={['/app/settings']}>
    <Typography variant="body2" color="textSecondary">
      Home / Settings / Profile
    </Typography>
  </MemoryRouter>
);

export const LoaderPreview = () => (
  <Box
    sx={{
      position: 'relative',
      width: 120,
      height: 48,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 1,
      border: '1px dashed',
      borderColor: 'divider',
      bgcolor: 'action.hover',
    }}
  >
    <Typography variant="caption" color="textSecondary">
      Full-screen Lottie loader
    </Typography>
  </Box>
);

export const ModalPreview = () => (
  <Typography variant="body3" color="textSecondary">
    Opens overlay on trigger (not shown inline)
  </Typography>
);

export const DrawerPreview = () => (
  <Typography variant="body3" color="textSecondary">
    Slides in from the right (not shown inline)
  </Typography>
);

const PREVIEW_COMPONENTS = {
  customDropdown: DropdownPreview,
  customInput: InputPreview,
  selectInput: SelectPreview,
  checkbox: CheckboxPreview,
  radio: RadioPreview,
  iconButton: IconButtonPreview,
  tabs: TabsPreview,
  noRecord: NoRecordPreview,
  breadcrumb: BreadcrumbPreview,
  loader: LoaderPreview,
  modal: ModalPreview,
  drawer: DrawerPreview,
};

/**
 * Renders a single common-component preview (loaded lazily from ComponentPreview).
 */
const ShowcasePreviewHost = ({ previewType, previewProps, classes }) => {
  if (previewType === 'switch') {
    return (
      <Box className={classes?.previewRow}>
        <SwitchPreview {...previewProps} />
      </Box>
    );
  }

  const PreviewComponent = PREVIEW_COMPONENTS[previewType];
  if (!PreviewComponent) {
    return null;
  }

  const passesProps = previewType === 'checkbox' || previewType === 'radio';

  return (
    <Box className={classes?.previewRow}>
      {passesProps ? <PreviewComponent {...previewProps} /> : <PreviewComponent />}
    </Box>
  );
};

ShowcasePreviewHost.propTypes = {
  previewType: PropTypes.string.isRequired,
  previewProps: PropTypes.object,
  classes: PropTypes.object,
};

ShowcasePreviewHost.defaultProps = {
  previewProps: {},
  classes: {},
};

export default ShowcasePreviewHost;
