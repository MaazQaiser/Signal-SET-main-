import {
  Box,
  Collapse,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import PropTypes from 'prop-types';
import React, { useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { COMMON_SETTING_DESIGN } from 'src/app/router/constant/ROUTE';

import { buildSections } from './componentCatalog';
import ComponentPreview from './ComponentPreview';
import { useStyles } from './componentShowcase.style';

const createInitialSections = () =>
  buildSections().map((section) => ({
    ...section,
    collapsed: false,
  }));

const ShowcaseRow = ({ item, classes }) => {
  const usageSnippet =
    item.previewType === 'button' && item.variantCode
      ? `<Button variant="${item.variantCode}">Label</Button>`
      : item.previewType === 'typography'
        ? `<Typography variant="${item.variant}">…</Typography>`
        : item.previewType === 'chip'
          ? `<Chip color="${item.previewProps?.color}" label="…" />`
          : item.previewType === 'radio'
            ? '<CustomRadioGroup options={[…]} value={…} handleChange={…} />'
            : item.previewType === 'checkbox'
              ? '<CheckBoxLabel label="…" name="…" value={…} handleChange={…} />'
              : item.previewType === 'iconButton'
                ? '<IconButtons Icon={<YourIcon />} aria-label="…" />'
                : item.previewType === 'customDropdown'
                  ? '<CustomDropDown options={[…]} selectedValues={…} handleChange={…} />'
                  : null;

  return (
    <TableRow className={classes.row}>
      <TableCell>
        <Typography className={classes.cellName} component="span">
          {item.name}
        </Typography>
        {item.description && (
          <Typography className={classes.cellDescription} component="span">
            {item.description}
          </Typography>
        )}
      </TableCell>
      <TableCell>
        <Typography className={classes.cellVariant} component="span">
          {item.variant}
        </Typography>
        {item.importPath && (
          <Typography className={classes.cellDescription} component="span">
            {item.importPath}
          </Typography>
        )}
        {usageSnippet && <Box className={classes.usageCode}>{usageSnippet}</Box>}
        {item.previewNote && (
          <Typography className={classes.cellDescription} component="span">
            {item.previewNote}
          </Typography>
        )}
      </TableCell>
      <TableCell>
        <ComponentPreview
          previewType={item.previewType}
          previewProps={item.previewProps}
          classes={classes}
        />
      </TableCell>
    </TableRow>
  );
};

ShowcaseRow.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    variant: PropTypes.string.isRequired,
    variantCode: PropTypes.string,
    description: PropTypes.string,
    importPath: PropTypes.string,
    previewType: PropTypes.string,
    previewProps: PropTypes.object,
    previewNote: PropTypes.string,
  }).isRequired,
  classes: PropTypes.object.isRequired,
};

function ComponentShowcase() {
  const classes = useStyles();
  const [sections, setSections] = useState(createInitialSections);
  const [search, setSearch] = useState('');

  const handleToggleCollapse = useCallback((sectionId) => {
    setSections((prev) =>
      prev.map((section) =>
        section.id === sectionId ? { ...section, collapsed: !section.collapsed } : section,
      ),
    );
  }, []);

  const filteredSections = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return sections;

    return sections
      .map((section) => ({
        ...section,
        items: section.items.filter((item) => {
          const haystack = [
            item.name,
            item.variant,
            item.description,
            item.importPath,
            item.variantCode,
            section.title,
            section.source,
          ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();
          return haystack.includes(q);
        }),
      }))
      .filter((section) => section.items.length > 0);
  }, [search, sections]);

  const totalItems = useMemo(
    () => sections.reduce((sum, section) => sum + section.items.length, 0),
    [sections],
  );

  const visibleCount = useMemo(
    () => filteredSections.reduce((sum, section) => sum + section.items.length, 0),
    [filteredSections],
  );

  return (
    <Box className={classes.page}>
      <Box className={classes.header}>
        <Box>
          <Typography className={classes.title} component="h1">
            Component library
          </Typography>
          <Typography className={classes.subtitle}>
            Live previews of theme variants and shared UI.{' '}
            <Link to={COMMON_SETTING_DESIGN}>Design tokens</Link>
          </Typography>
        </Box>
        <Box className={classes.toolbar}>
          <TextField
            className={classes.searchField}
            size="small"
            placeholder="Search components or variants…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </Box>
      </Box>

      <Typography className={classes.stats}>
        {filteredSections.length} sections · {visibleCount} of {totalItems} entries
      </Typography>

      {filteredSections.length === 0 ? (
        <Typography className={classes.emptyState}>No components match your search.</Typography>
      ) : (
        filteredSections.map((section) => (
          <Box key={section.id} className={classes.sectionBlock}>
            <Box
              className={classes.sectionHeader}
              onClick={() => handleToggleCollapse(section.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleToggleCollapse(section.id)}
            >
              <span className={classes.chevron} aria-hidden>
                {section.collapsed ? '▸' : '▾'}
              </span>
              <Typography className={classes.sectionTitle} component="span">
                {section.title}
              </Typography>
              <Typography className={classes.sectionMeta} component="span">
                {section.items.length} · {section.source}
              </Typography>
            </Box>

            <Collapse in={!section.collapsed}>
              <Box className={classes.tableWrap}>
                <Table className={classes.table} size="small">
                  <TableHead className={classes.thead}>
                    <TableRow>
                      <TableCell className={classes.colName}>Name</TableCell>
                      <TableCell className={classes.colVariant}>Variant</TableCell>
                      <TableCell className={classes.colPreview}>Preview</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {section.items.map((item) => (
                      <ShowcaseRow key={item.id} item={item} classes={classes} />
                    ))}
                  </TableBody>
                </Table>
              </Box>
            </Collapse>
          </Box>
        ))
      )}
    </Box>
  );
}

export default ComponentShowcase;
