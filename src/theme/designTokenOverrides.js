const STORAGE_KEY = 'signal-design-token-overrides';

export const loadDesignTokenOverrides = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
};

export const saveDesignTokenOverrides = (overrides) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
};

export const clearDesignTokenOverrides = () => {
  localStorage.removeItem(STORAGE_KEY);
};

/** MUI palette keys only (semantic tokens from theme/palette.js) */
export const isPaletteTokenName = (name) => name && !name.startsWith('$');

export const mergePaletteWithOverrides = (palette, overrides) => {
  if (!overrides || !Object.keys(overrides).length) return palette;
  return { ...palette, ...overrides };
};

export const getPaletteKeysWithHex = (palette, hex) => {
  if (!hex) return [];
  const target = hex.toLowerCase();
  return Object.entries(palette).reduce((keys, [key, value]) => {
    if (typeof value === 'string' && value.toLowerCase() === target) {
      keys.push(key);
    }
    return keys;
  }, []);
};
