import { getPaletteKeysWithHex } from 'src/theme/designTokenOverrides';
import basePalette from 'src/theme/palette';

import { makeTokenKey } from './colorTokenData';
import tokenUsageIndex from './tokenUsageIndex.json';

export const getTokenImpact = (groupId, tokenId) => {
  const key = makeTokenKey(groupId, tokenId);
  const entry = tokenUsageIndex[key];
  if (!entry) {
    return {
      paletteRefs: 0,
      hexRefs: 0,
      fileCount: 0,
      totalRefs: 0,
      canApplyGlobally: false,
    };
  }

  const canApplyGlobally = !entry.tokenName.startsWith('$') && entry.paletteRefs > 0;

  return {
    ...entry,
    canApplyGlobally,
  };
};

export const getImpactSummary = (impact) => {
  if (!impact || impact.totalRefs === 0) {
    return 'No tracked usages in src/ (may still appear in assets or runtime styles).';
  }

  const parts = [];
  if (impact.fileCount > 0) {
    parts.push(`${impact.fileCount} file${impact.fileCount === 1 ? '' : 's'}`);
  }
  if (impact.paletteRefs > 0) {
    parts.push(
      `${impact.paletteRefs} theme.palette reference${impact.paletteRefs === 1 ? '' : 's'}`,
    );
  }
  if (impact.hexRefs > 0) {
    parts.push(`${impact.hexRefs} hardcoded hex match${impact.hexRefs === 1 ? '' : 'es'}`);
  }

  return parts.join(' · ');
};

export const getLinkedPaletteKeys = (defaultHex) => getPaletteKeysWithHex(basePalette, defaultHex);

export const getApplyScopeMessage = (impact, tokenName, defaultHex) => {
  const linked = tokenName.startsWith('$') ? getLinkedPaletteKeys(defaultHex) : [];

  if (tokenName.startsWith('$') && linked.length > 0) {
    return `Apply updates ${linked.length} live theme key${linked.length === 1 ? '' : 's'} (${linked.slice(0, 4).join(', ')}${linked.length > 4 ? '…' : ''}). Hardcoded hex in ${impact.fileCount} files still need a source update.`;
  }

  if (!impact.canApplyGlobally) {
    return 'Apply saves theme overrides where possible. Hardcoded hex in source files is not changed automatically.';
  }

  return `Apply updates theme.palette.${tokenName} across the app immediately (${impact.paletteRefs} references).`;
};
