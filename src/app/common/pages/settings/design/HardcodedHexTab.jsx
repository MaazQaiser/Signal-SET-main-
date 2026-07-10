import {
  Box,
  Button,
  Collapse,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import PropTypes from 'prop-types';
import React, { useMemo, useState } from 'react';
import { getPaletteKeysWithHex } from 'src/theme/designTokenOverrides';
import { useDesignTokens } from 'src/theme/DesignTokenProvider';
import basePalette from 'src/theme/palette';
import { toaster } from 'src/utils/toast';

import hardcodedHexIndex from './hardcodedHexIndex.json';

const formatLines = (lines, hasMoreLines, count) => {
  const preview = lines.join(', ');
  if (hasMoreLines) return `${preview} … (+${count - lines.length} more)`;
  return preview;
};

const HardcodedHexRow = ({ entry, classes, onApplyToken }) => {
  const [open, setOpen] = useState(false);
  const canApply = Boolean(entry.matchingToken);

  return (
    <>
      <TableRow className={classes.row}>
        <TableCell className={classes.colSwatch}>
          <Box className={classes.swatch} style={{ backgroundColor: entry.hex }} aria-hidden />
        </TableCell>
        <TableCell>
          <Typography className={classes.hexMono} component="span">
            {entry.hex}
          </Typography>
        </TableCell>
        <TableCell>
          {entry.matchingToken ? (
            <Typography className={classes.tokenBadge} component="span">
              theme.palette.{entry.matchingToken}
            </Typography>
          ) : (
            <Typography className={classes.collectionMeta} component="span">
              No palette token
            </Typography>
          )}
        </TableCell>
        <TableCell align="right">{entry.totalRefs}</TableCell>
        <TableCell align="right">{entry.fileCount}</TableCell>
        <TableCell>
          <Box className={classes.rowActions}>
            <Button className={classes.actionBtn} size="small" onClick={() => setOpen((v) => !v)}>
              {open ? 'Hide' : 'Places'}
            </Button>
            {canApply && (
              <Button
                className={classes.applyBtn}
                size="small"
                variant="outlined"
                onClick={() => onApplyToken(entry)}
              >
                Apply token
              </Button>
            )}
          </Box>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell colSpan={6} className={classes.locationsCell}>
          <Collapse in={open}>
            <Box className={classes.locationsPanel}>
              {entry.truncated && (
                <Typography className={classes.impactDetail} sx={{ mb: 1 }}>
                  Showing first {entry.locations.length} of {entry.fileCount} files. Regenerate
                  index to refresh: node scripts/buildHardcodedHexIndex.js
                </Typography>
              )}
              {entry.locations.length === 0 ? (
                <Typography className={classes.collectionMeta}>No locations recorded.</Typography>
              ) : (
                <Box component="ul" className={classes.locationsList}>
                  {entry.locations.map((loc) => (
                    <Box component="li" key={loc.file} className={classes.locationItem}>
                      <Typography className={classes.locationPath} component="span">
                        {loc.file}
                      </Typography>
                      <Typography className={classes.locationLines} component="span">
                        lines {formatLines(loc.lines, loc.hasMoreLines, loc.count)} ({loc.count}{' '}
                        {loc.count === 1 ? 'use' : 'uses'})
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

HardcodedHexRow.propTypes = {
  entry: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
  onApplyToken: PropTypes.func.isRequired,
};

const HardcodedHexTab = ({ classes, search }) => {
  const { applyPaletteTokens } = useDesignTokens();

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return hardcodedHexIndex.colors;
    return hardcodedHexIndex.colors.filter((entry) => {
      const locMatch = entry.locations.some(
        (loc) =>
          loc.file.toLowerCase().includes(q) || loc.lines.some((line) => String(line).includes(q)),
      );
      return (
        entry.hex.toLowerCase().includes(q) ||
        (entry.matchingToken || '').toLowerCase().includes(q) ||
        locMatch
      );
    });
  }, [search]);

  const handleApplyToken = (entry) => {
    if (!entry.matchingToken) return;
    const keys = [entry.matchingToken, ...getPaletteKeysWithHex(basePalette, entry.hex)];
    const unique = [...new Set(keys)];
    const payload = unique.reduce((acc, key) => {
      acc[key] = entry.hex;
      return acc;
    }, {});
    applyPaletteTokens(payload);
    toaster.success({
      text: `Applied ${entry.hex} to ${unique.length} theme.palette key(s). Hardcoded files unchanged.`,
    });
  };

  const visibleRefs = filtered.reduce((s, e) => s + e.totalRefs, 0);

  return (
    <>
      <Typography className={classes.stats}>
        {filtered.length} of {hardcodedHexIndex.totalUniqueColors} unique hex colors · {visibleRefs}{' '}
        references (scan from {hardcodedHexIndex.generatedAt.slice(0, 10)})
      </Typography>

      <Box className={classes.collectionBlock}>
        <Box className={classes.tableWrap}>
          <Table className={classes.table} size="small">
            <TableHead className={classes.thead}>
              <TableRow>
                <TableCell className={classes.colSwatch} />
                <TableCell>Hex</TableCell>
                <TableCell>Closest token</TableCell>
                <TableCell align="right">Refs</TableCell>
                <TableCell align="right">Files</TableCell>
                <TableCell align="right">Usage</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6}>
                    <Typography className={classes.emptyState}>
                      No hardcoded colors match your search.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((entry) => (
                  <HardcodedHexRow
                    key={entry.hex}
                    entry={entry}
                    classes={classes}
                    onApplyToken={handleApplyToken}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </Box>
      </Box>
    </>
  );
};

HardcodedHexTab.propTypes = {
  classes: PropTypes.object.isRequired,
  search: PropTypes.string.isRequired,
};

export default HardcodedHexTab;
