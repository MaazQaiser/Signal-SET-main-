import { ThemeProvider } from '@mui/material';
import PropTypes from 'prop-types';
import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

import {
  clearDesignTokenOverrides,
  loadDesignTokenOverrides,
  mergePaletteWithOverrides,
  saveDesignTokenOverrides,
} from './designTokenOverrides';
import { createAppTheme } from './index';
import basePalette from './palette';

const DesignTokenContext = createContext(null);

export const useDesignTokens = () => {
  const ctx = useContext(DesignTokenContext);
  if (!ctx) {
    throw new Error('useDesignTokens must be used within DesignTokenProvider');
  }
  return ctx;
};

export const DesignTokenProvider = ({ children }) => {
  const [paletteOverrides, setPaletteOverrides] = useState(loadDesignTokenOverrides);

  const applyPaletteToken = useCallback((paletteKey, hex) => {
    setPaletteOverrides((prev) => {
      const next = { ...prev, [paletteKey]: hex };
      saveDesignTokenOverrides(next);
      return next;
    });
  }, []);

  const applyPaletteTokens = useCallback((entries) => {
    setPaletteOverrides((prev) => {
      const next = { ...prev, ...entries };
      saveDesignTokenOverrides(next);
      return next;
    });
  }, []);

  const removePaletteToken = useCallback((paletteKey) => {
    setPaletteOverrides((prev) => {
      const next = { ...prev };
      delete next[paletteKey];
      saveDesignTokenOverrides(next);
      return next;
    });
  }, []);

  const removePaletteTokens = useCallback((paletteKeys) => {
    setPaletteOverrides((prev) => {
      const next = { ...prev };
      paletteKeys.forEach((key) => delete next[key]);
      saveDesignTokenOverrides(next);
      return next;
    });
  }, []);

  const resetAllOverrides = useCallback(() => {
    clearDesignTokenOverrides();
    setPaletteOverrides({});
  }, []);

  const theme = useMemo(() => {
    const palette = mergePaletteWithOverrides(basePalette, paletteOverrides);
    return createAppTheme(palette);
  }, [paletteOverrides]);

  const value = useMemo(
    () => ({
      paletteOverrides,
      applyPaletteToken,
      applyPaletteTokens,
      removePaletteToken,
      removePaletteTokens,
      resetAllOverrides,
    }),
    [
      paletteOverrides,
      applyPaletteToken,
      applyPaletteTokens,
      removePaletteToken,
      removePaletteTokens,
      resetAllOverrides,
    ],
  );

  return (
    <DesignTokenContext.Provider value={value}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </DesignTokenContext.Provider>
  );
};

DesignTokenProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
