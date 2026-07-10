import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import * as React from 'react';
import { useTranslation } from 'react-i18next';

const VisuallyHiddenInput = styled('input')`
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  height: 1px;
  overflow: hidden;
  position: absolute;
  bottom: 0;
  left: 0;
  white-space: nowrap;
  width: 1px;
`;

export default function InputFileUpload() {
  const { t } = useTranslation('sales');
  return (
    <Button
      component="label"
      variant="contained"
      startIcon={<CloudUploadIcon />}
      href="#file-upload"
    >
      {t('companies.uploadFile')}
      <VisuallyHiddenInput type="file" />
    </Button>
  );
}
