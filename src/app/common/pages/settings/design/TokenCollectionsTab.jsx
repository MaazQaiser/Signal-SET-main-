import {
  Box,
  Button,
  Collapse,
  IconButton,
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
import { getPaletteKeysWithHex } from 'src/theme/designTokenOverrides';
import { useDesignTokens } from 'src/theme/DesignTokenProvider';
import basePalette from 'src/theme/palette';
import { toaster } from 'src/utils/toast';

import {
  buildInitialColorValues,
  buildInitialGroups,
  createCustomGroup,
  createCustomToken,
  getDefaultHex,
  makeTokenKey,
} from './colorTokenData';
import { isValidHex, normalizeHexInput, toPickerHex } from './hexUtils';
import {
  getApplyScopeMessage,
  getImpactSummary,
  getLinkedPaletteKeys,
  getTokenImpact,
} from './tokenImpact';

const TokenTableRow = ({
  token,
  groupId,
  hex,
  defaultHex,
  appliedHex,
  classes,
  onHexChange,
  onPickerChange,
  onNameChange,
  onReset,
  onRemove,
  onApply,
}) => {
  const tokenKey = makeTokenKey(groupId, token.id);
  const valid = isValidHex(hex);
  const displayHex = valid ? normalizeHexInput(hex).toUpperCase() : hex;
  const appliedDisplay = normalizeHexInput(appliedHex).toUpperCase();
  const hasDraftChange = valid && displayHex !== appliedDisplay;
  const impact = getTokenImpact(groupId, token.id);
  const linkedKeys = token.name.startsWith('$') ? getLinkedPaletteKeys(defaultHex) : [];

  return (
    <>
      <TableRow className={classes.row}>
        <TableCell className={classes.colSwatch}>
          <Box
            className={classes.swatch}
            style={{ backgroundColor: valid ? displayHex : '#f5f5f6' }}
            aria-hidden
          />
        </TableCell>
        <TableCell>
          {token.isCustom ? (
            <TextField
              className={classes.nameField}
              size="small"
              fullWidth
              value={token.name}
              onChange={(e) => onNameChange(groupId, token.id, e.target.value)}
              placeholder="Token name"
            />
          ) : (
            <Typography component="span" sx={{ fontSize: 13, fontWeight: 500 }}>
              {token.name}
            </Typography>
          )}
        </TableCell>
        <TableCell>
          <Box className={classes.valueCell}>
            <input
              type="color"
              className={classes.colorPicker}
              value={toPickerHex(hex)}
              onChange={(e) => onPickerChange(tokenKey, e.target.value)}
              aria-label={`Pick color for ${token.name}`}
            />
            <TextField
              className={`${classes.hexField} ${!valid && hex ? classes.hexFieldInvalid : ''}`}
              size="small"
              fullWidth
              value={hex}
              onChange={(e) => onHexChange(tokenKey, e.target.value)}
              placeholder="#000000"
            />
          </Box>
        </TableCell>
        <TableCell>
          <Box className={classes.rowActions}>
            {hasDraftChange && (
              <Button
                className={classes.applyBtn}
                size="small"
                variant="contained"
                onClick={() => onApply(groupId, token, displayHex)}
              >
                Apply
              </Button>
            )}
            {!token.isCustom && (
              <Button
                className={classes.actionBtn}
                size="small"
                onClick={() => onReset(tokenKey, groupId, token)}
                disabled={appliedDisplay === defaultHex && displayHex === defaultHex}
              >
                Reset
              </Button>
            )}
            {token.isCustom && (
              <Button
                className={classes.actionBtn}
                size="small"
                color="error"
                onClick={() => onRemove(groupId, token.id)}
              >
                Delete
              </Button>
            )}
          </Box>
        </TableCell>
      </TableRow>
      {hasDraftChange && (
        <TableRow className={classes.impactRow}>
          <TableCell colSpan={4}>
            <Box className={classes.impactBox}>
              <Typography className={classes.impactTitle} component="p">
                Impact preview — {impact.totalRefs} usage
                {impact.totalRefs === 1 ? '' : 's'} across {impact.fileCount} file
                {impact.fileCount === 1 ? '' : 's'}
                {linkedKeys.length > 0 && (
                  <>
                    {' '}
                    · {linkedKeys.length} theme key{linkedKeys.length === 1 ? '' : 's'} will update
                  </>
                )}
              </Typography>
              <Typography className={classes.impactDetail} component="p">
                {getImpactSummary(impact)}
              </Typography>
              <Typography className={classes.impactDetail} component="p">
                {getApplyScopeMessage(impact, token.name, defaultHex)}
              </Typography>
            </Box>
          </TableCell>
        </TableRow>
      )}
    </>
  );
};

const TokenCollectionsTab = ({ classes, search }) => {
  const { paletteOverrides, applyPaletteTokens, removePaletteTokens, resetAllOverrides } =
    useDesignTokens();

  const [groups, setGroups] = useState(buildInitialGroups);
  const [colorValues, setColorValues] = useState(() =>
    buildInitialColorValues(buildInitialGroups()),
  );
  const [newGroupName, setNewGroupName] = useState('');
  const [showNewGroupInput, setShowNewGroupInput] = useState(false);

  const getAppliedHex = useCallback(
    (token) => {
      const defaultHex = (token.defaultHex || '#000000').toUpperCase();
      if (token.isCustom) return defaultHex;
      if (!token.name.startsWith('$')) {
        return (paletteOverrides[token.name] || defaultHex).toUpperCase();
      }
      const linked = getPaletteKeysWithHex(basePalette, defaultHex);
      const overridden = linked.find((key) => paletteOverrides[key]);
      return (overridden ? paletteOverrides[overridden] : defaultHex).toUpperCase();
    },
    [paletteOverrides],
  );

  const handleHexChange = useCallback((tokenKey, value) => {
    setColorValues((prev) => ({ ...prev, [tokenKey]: value }));
  }, []);

  const handlePickerChange = useCallback((tokenKey, value) => {
    setColorValues((prev) => ({ ...prev, [tokenKey]: value.toUpperCase() }));
  }, []);

  const handleTokenNameChange = useCallback((groupId, tokenId, name) => {
    setGroups((prev) =>
      prev.map((g) =>
        g.id !== groupId
          ? g
          : { ...g, tokens: g.tokens.map((t) => (t.id === tokenId ? { ...t, name } : t)) },
      ),
    );
  }, []);

  const handleApply = useCallback(
    (groupId, token, hex) => {
      if (token.isCustom) {
        toaster.success({ text: `Saved ${token.name} locally (custom tokens are not in theme)` });
        return;
      }
      if (token.name.startsWith('$')) {
        const linked = getLinkedPaletteKeys(token.defaultHex);
        if (linked.length === 0) {
          toaster.error({ text: 'No matching theme.palette keys for this SCSS color.' });
          return;
        }
        const entries = linked.reduce((acc, key) => {
          acc[key] = hex;
          return acc;
        }, {});
        applyPaletteTokens(entries);
        toaster.success({ text: `Applied to ${linked.length} theme keys across the app` });
        return;
      }
      applyPaletteTokens({ [token.name]: hex });
      const impact = getTokenImpact(groupId, token.id);
      toaster.success({
        text: `Applied ${token.name} — ${impact.paletteRefs} theme references updated live`,
      });
    },
    [applyPaletteTokens],
  );

  const handleResetToken = useCallback(
    (tokenKey, groupId, token) => {
      const defaultHex = getDefaultHex(groups, groupId, token.id);
      setColorValues((prev) => ({ ...prev, [tokenKey]: defaultHex }));
      if (token.isCustom) return;
      if (token.name.startsWith('$')) {
        removePaletteTokens(getLinkedPaletteKeys(token.defaultHex));
      } else {
        removePaletteTokens([token.name]);
      }
    },
    [groups, removePaletteTokens],
  );

  const handleToggleCollapse = useCallback((groupId) => {
    setGroups((prev) =>
      prev.map((g) => (g.id === groupId ? { ...g, collapsed: !g.collapsed } : g)),
    );
  }, []);

  const handleAddToken = useCallback((groupId) => {
    const token = createCustomToken();
    const tokenKey = makeTokenKey(groupId, token.id);
    setGroups((prev) =>
      prev.map((g) =>
        g.id !== groupId ? g : { ...g, collapsed: false, tokens: [...g.tokens, token] },
      ),
    );
    setColorValues((prev) => ({ ...prev, [tokenKey]: token.defaultHex }));
  }, []);

  const handleRemoveToken = useCallback((groupId, tokenId) => {
    const tokenKey = makeTokenKey(groupId, tokenId);
    setGroups((prev) =>
      prev.map((g) =>
        g.id !== groupId ? g : { ...g, tokens: g.tokens.filter((t) => t.id !== tokenId) },
      ),
    );
    setColorValues((prev) => {
      const next = { ...prev };
      delete next[tokenKey];
      return next;
    });
  }, []);

  const handleRemoveGroup = useCallback((groupId) => {
    setGroups((prev) => {
      const target = prev.find((g) => g.id === groupId);
      if (!target?.isCustom) return prev;
      return prev.filter((g) => g.id !== groupId);
    });
    setColorValues((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((key) => {
        if (key.startsWith(`${groupId}::`)) delete next[key];
      });
      return next;
    });
  }, []);

  const handleAddGroup = useCallback(() => {
    const group = createCustomGroup(newGroupName);
    setGroups((prev) => [...prev, group]);
    setNewGroupName('');
    setShowNewGroupInput(false);
    toaster.success({ text: `Collection "${group.title}" created` });
  }, [newGroupName]);

  const handleResetAll = useCallback(() => {
    const initialGroups = buildInitialGroups();
    setGroups(initialGroups);
    setColorValues(buildInitialColorValues(initialGroups));
    resetAllOverrides();
    toaster.success({ text: 'All tokens and global theme overrides reset' });
  }, [resetAllOverrides]);

  const filteredGroups = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return groups;
    return groups
      .map((group) => ({
        ...group,
        tokens: group.tokens.filter((token) => {
          const key = makeTokenKey(group.id, token.id);
          const hex = colorValues[key] || '';
          return (
            token.name.toLowerCase().includes(q) ||
            hex.toLowerCase().includes(q) ||
            (token.defaultHex || '').toLowerCase().includes(q) ||
            group.title.toLowerCase().includes(q)
          );
        }),
      }))
      .filter((group) => group.tokens.length > 0 || group.title.toLowerCase().includes(q));
  }, [search, groups, colorValues]);

  const totalTokens = useMemo(() => groups.reduce((sum, g) => sum + g.tokens.length, 0), [groups]);
  const visibleCount = useMemo(
    () => filteredGroups.reduce((sum, g) => sum + g.tokens.length, 0),
    [filteredGroups],
  );
  const appliedOverrideCount = useMemo(
    () => Object.keys(paletteOverrides).length,
    [paletteOverrides],
  );

  return (
    <>
      <Box className={classes.tabToolbar}>
        <Button variant="outlined" size="small" onClick={() => setShowNewGroupInput(true)}>
          New collection
        </Button>
        <Button variant="outlined" size="small" onClick={handleResetAll}>
          Reset all tokens
        </Button>
      </Box>

      {showNewGroupInput && (
        <Box className={classes.newGroupBar}>
          <TextField
            className={classes.newGroupField}
            size="small"
            placeholder="Collection name"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddGroup()}
            autoFocus
          />
          <Button variant="contained" size="small" onClick={handleAddGroup}>
            Create
          </Button>
          <Button size="small" onClick={() => setShowNewGroupInput(false)}>
            Cancel
          </Button>
        </Box>
      )}

      <Typography className={classes.stats}>
        {filteredGroups.length} collections · {visibleCount} of {totalTokens} variables
        {appliedOverrideCount > 0 && ` · ${appliedOverrideCount} applied globally`}
      </Typography>

      {filteredGroups.length === 0 ? (
        <Typography className={classes.emptyState}>No variables match your search.</Typography>
      ) : (
        filteredGroups.map((group) => (
          <Box key={group.id} className={classes.collectionBlock}>
            <Box
              className={classes.collectionHeader}
              onClick={() => handleToggleCollapse(group.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleToggleCollapse(group.id)}
            >
              <span className={classes.chevron} aria-hidden>
                {group.collapsed ? '▸' : '▾'}
              </span>
              <Typography className={classes.collectionTitle} component="span">
                {group.title}
              </Typography>
              <Typography className={classes.collectionMeta} component="span">
                {group.tokens.length} · {group.source}
              </Typography>
              <Box
                className={classes.collectionActions}
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
              >
                <Button
                  size="small"
                  className={classes.addRowBtn}
                  onClick={() => handleAddToken(group.id)}
                >
                  + Variable
                </Button>
                {group.isCustom && (
                  <IconButton
                    size="small"
                    aria-label="Delete collection"
                    onClick={() => handleRemoveGroup(group.id)}
                  >
                    ×
                  </IconButton>
                )}
              </Box>
            </Box>

            <Collapse in={!group.collapsed}>
              <Box className={classes.tableWrap}>
                <Table className={classes.table} size="small">
                  <TableHead className={classes.thead}>
                    <TableRow>
                      <TableCell className={classes.colSwatch} />
                      <TableCell className={classes.colName}>Name</TableCell>
                      <TableCell className={classes.colValue}>Value</TableCell>
                      <TableCell className={classes.colActions} align="right">
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {group.tokens.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4}>
                          <Typography className={classes.collectionMeta} sx={{ py: 1 }}>
                            No variables yet. Add one below.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      group.tokens.map((token) => {
                        const tokenKey = makeTokenKey(group.id, token.id);
                        const defaultHex = (token.defaultHex || '#000000').toUpperCase();
                        return (
                          <TokenTableRow
                            key={tokenKey}
                            token={token}
                            groupId={group.id}
                            hex={colorValues[tokenKey] ?? getAppliedHex(token)}
                            defaultHex={defaultHex}
                            appliedHex={getAppliedHex(token)}
                            classes={classes}
                            onHexChange={handleHexChange}
                            onPickerChange={handlePickerChange}
                            onNameChange={handleTokenNameChange}
                            onReset={handleResetToken}
                            onRemove={handleRemoveToken}
                            onApply={handleApply}
                          />
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </Box>
              <Box className={classes.addRow}>
                <Button className={classes.addRowBtn} onClick={() => handleAddToken(group.id)}>
                  + Add color variable
                </Button>
              </Box>
            </Collapse>
          </Box>
        ))
      )}
    </>
  );
};

TokenCollectionsTab.propTypes = {
  classes: PropTypes.object.isRequired,
  search: PropTypes.string.isRequired,
};

export default TokenCollectionsTab;
