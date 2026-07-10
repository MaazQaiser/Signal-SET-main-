import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import PropTypes from 'prop-types';
import React, { lazy, Suspense } from 'react';

const COMMON_PREVIEW_TYPES = new Set([
  'customDropdown',
  'customInput',
  'selectInput',
  'checkbox',
  'radio',
  'iconButton',
  'switch',
  'tabs',
  'noRecord',
  'breadcrumb',
  'loader',
  'modal',
  'drawer',
]);

const LazyShowcasePreview = lazy(() => import('./CommonComponentPreviews'));

const ComponentPreview = ({ previewType, previewProps, classes }) => {
  if (COMMON_PREVIEW_TYPES.has(previewType)) {
    return (
      <Suspense
        fallback={
          <Typography className={classes.previewMeta} variant="body3">
            Loading preview…
          </Typography>
        }
      >
        <LazyShowcasePreview
          previewType={previewType}
          previewProps={previewProps}
          classes={classes}
        />
      </Suspense>
    );
  }

  switch (previewType) {
    case 'button':
      return (
        <Box className={classes.previewRow}>
          <Button disableRipple {...previewProps} />
        </Box>
      );

    case 'typography':
      return (
        <Typography className={classes.previewTypography} {...previewProps}>
          {previewProps.children}
        </Typography>
      );

    case 'chip':
      return <Chip label={previewProps.label} color={previewProps.color} size="small" />;

    case 'surfaces':
      return (
        <Box className={classes.previewRow}>
          <Paper className={classes.previewPaper} elevation={1}>
            <Typography variant="caption">Paper</Typography>
          </Paper>
          <Paper className={classes.previewPaper} variant="outlined">
            <Typography variant="caption">Outlined</Typography>
          </Paper>
        </Box>
      );

    case 'card':
      return (
        <Card className={classes.previewCard} variant="outlined">
          <CardContent className={classes.previewCardContent}>
            <Typography variant="subtitle2">Card title</Typography>
            <Typography variant="body3" color="textSecondary">
              Card body content
            </Typography>
          </CardContent>
        </Card>
      );

    case 'table':
      return (
        <Table className={classes.previewTable} size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>Sample row</TableCell>
              <TableCell>
                <Chip label="Active" color="success" size="small" />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );

    default:
      return null;
  }
};

ComponentPreview.propTypes = {
  previewType: PropTypes.string,
  previewProps: PropTypes.object,
  classes: PropTypes.object.isRequired,
};

ComponentPreview.defaultProps = {
  previewType: null,
  previewProps: {},
};

export default ComponentPreview;
