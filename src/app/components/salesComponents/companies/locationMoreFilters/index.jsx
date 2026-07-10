import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ReactComponent as Morefilter } from 'src/assets/svg';
import { KEY } from 'src/utils/constants/events/keyPressEvents';

const LocationMoreFilters = () => {
  const { t } = useTranslation('sales');
  const [state, setState] = useState({
    right: false,
  });

  const toggleDrawer = (anchor, open) => (event) => {
    if (event.type === KEY.UP && (event.key === KEY.TAB || event.key === KEY.SHIFT)) {
      return;
    }

    setState({ ...state, [anchor]: open });
  };
  const handleCloseDrawer = (anchor) => {
    setState({ ...state, [anchor]: false });
  };
  const list = (anchor) => (
    <Box
      sx={{ width: anchor === 'top' || anchor === 'bottom' ? 'auto' : 351 }}
      role="presentation"
    ></Box>
  );

  return (
    <div>
      {['right'].map((anchor) => (
        <React.Fragment key={anchor}>
          <Button className="morefilter" onClick={toggleDrawer(anchor, true)}>
            {t('locations.moreFilters')} <Morefilter className="filtericon" />
          </Button>

          <Drawer
            className="sideDraw"
            anchor={anchor}
            open={state[anchor]}
            onClose={() => handleCloseDrawer(anchor)}
            onOpen={() => toggleDrawer(anchor, false)}
          >
            {list(anchor)}
          </Drawer>
        </React.Fragment>
      ))}
    </div>
  );
};
export default LocationMoreFilters;
