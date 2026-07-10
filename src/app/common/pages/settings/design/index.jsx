import { Box, Tab, Tabs, TextField, Typography } from '@mui/material';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { APP_COMPONENT, COMMON_SETTING } from 'src/app/router/constant/ROUTE';

import { useStyles } from './designTokens.style';
import HardcodedHexTab from './HardcodedHexTab';
import TokenCollectionsTab from './TokenCollectionsTab';

const TAB_TOKENS = 'tokens';
const TAB_HARDCODED = 'hardcoded';

const DesignTokens = () => {
  const classes = useStyles();
  const [activeTab, setActiveTab] = useState(TAB_TOKENS);
  const [search, setSearch] = useState('');

  const searchPlaceholder =
    activeTab === TAB_TOKENS
      ? 'Search collections or variables…'
      : 'Search hex, token, file path, or line…';

  return (
    <Box className={classes.page}>
      <Box className={classes.header}>
        <Box>
          <Typography className={classes.title} component="h1">
            Design tokens
          </Typography>
          <Typography className={classes.subtitle}>
            Tokens tab: edit and apply theme variables. Hardcoded hex tab: direct #colors in source
            with file locations. <Link to={COMMON_SETTING}>Back to settings</Link>
            {' · '}
            <Link to={APP_COMPONENT}>Component library</Link>
          </Typography>
        </Box>
        <TextField
          className={classes.searchField}
          size="small"
          placeholder={searchPlaceholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </Box>

      <Tabs
        value={activeTab}
        onChange={(_, value) => setActiveTab(value)}
        className={classes.mainTabs}
      >
        <Tab label="Tokens" value={TAB_TOKENS} className={classes.mainTab} />
        <Tab label="Hardcoded hex" value={TAB_HARDCODED} className={classes.mainTab} />
      </Tabs>

      {activeTab === TAB_TOKENS && <TokenCollectionsTab classes={classes} search={search} />}
      {activeTab === TAB_HARDCODED && <HardcodedHexTab classes={classes} search={search} />}
    </Box>
  );
};

export default DesignTokens;
