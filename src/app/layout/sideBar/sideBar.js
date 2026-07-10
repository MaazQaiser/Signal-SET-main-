import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  sidebarOverlay: {
    width: '240px',
    height: '100vh',
    position: 'fixed',
    left: 0,
    top: 0,
    zIndex: 999,
    transition: 'all 0.35s',
  },
  backdropOverlay: {
    position: 'fixed',
    height: '100vh',
    width: '100%',
    top: 0,
    left: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    zIndex: 999,
  },
  compressBar: {
    width: 76,
  },
  toggleSidebarButton: {
    position: 'absolute',
    top: '50%',
    left: '100%',
    transition: 'all 0.35s',
    cursor: 'pointer',
    transform: 'translate(-50%, -50%)',
  },
  toggleBtnRotated: {
    transform: 'translate(-50%, -50%) rotate(180deg)',
  },

  sidebarWrapper: {
    backgroundColor: '#262527',
    overflow: 'auto',
    maxHeight: '100vh',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(2, 1),

    '& .active ': {
      background: '#007aff',
    },
  },
  sidebarWapperCollapsed: {
    padding: theme.spacing(4, 3),
  },
  listItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  linksWrapperCollapsed: {
    marginTop: theme.spacing(2),
    display: 'flex',
    justifyContent: 'center',
  },
  linksWrapperExpended: {
    marginTop: theme.spacing(3.75),
  },
  linksListCompressed: {
    '&.MuiList-root': {
      listStyle: 'none',
      margin: 0,
      padding: 0,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      width: 'max-content',
    },
  },
  linksListExpended: {
    '&.MuiList-root': {
      listStyle: 'none',
      margin: 0,
      padding: 0,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'flex-start',
      width: '100%',
    },
  },
  linkListItemExpended: {
    '&.MuiListItem-root': {
      cursor: 'pointer',
      borderRadius: '10px',
      display: 'flex',
      alignItems: 'center',
      padding: 0,
    },
  },
  linkListItemCollapsed: {
    '&.MuiListItem-root': {
      cursor: 'pointer',
      borderRadius: '10px',
      justifyContent: 'center',
      display: 'flex',
      alignItems: 'center',
      padding: 0,
    },
  },
  listLinkCollapsed: {
    height: 44,
    width: 44,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    textDecoration: 'none',
    color: theme.palette.textOnColor,
    '& svg': {
      minHeight: 20,
      minWidth: 20,
      maxHeight: 20,
      maxWidth: 20,
      height: 20,
      width: 20,
    },
    '& img': {
      minHeight: 20,
      minWidth: 20,
      maxHeight: 20,
      maxWidth: 20,
      height: 20,
      width: 20,
    },
  },
  listLinkExpanded: {
    padding: theme.spacing(1.5),
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    flex: 1,
    color: theme.palette.textOnColor,
    '& svg': {
      minHeight: 20,
      minWidth: 20,
      maxHeight: 20,
      maxWidth: 20,
      height: 20,
      width: 20,
    },
    '& img': {
      minHeight: 20,
      minWidth: 20,
      maxHeight: 20,
      maxWidth: 20,
      height: 20,
      width: 20,
    },
  },
  linkText: {
    '&.MuiTypography-root': {
      fontSize: 14,
      fontWeight: 500,
      lineHeight: '20px',
      color: '#ffffff',
    },
  },

  toggleBtnMain: {
    marginTop: theme.spacing(2),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  signalLogoShortIconWrapper: {
    minHeight: 54,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signalLogoWithTextIconWrapper: {
    display: 'flex',
    height: 24,
  },
  signalLogoWithTextIcon: {
    height: 24,
    maxHeight: 24,
    minHeight: 24,
  },
  signalLogoShortIcon: {
    width: 41,
  },
  tabsSidebar: {
    '&.MuiTabs-root': {
      marginTop: theme.spacing(3),
      minHeight: 20,
    },

    '& .MuiTabs-indicator': {
      display: 'none',
    },
  },
  tabStandAlone: {
    '&.MuiButtonBase-root ': {
      backgroundColor: '#45474b',
      color: '#ffffff',
      fontSize: 12,
      lineHeight: '16px',
      fontWeight: 400,
      overflow: 'hidden',
      padding: '7px 14px !important',
      width: '50%',
      textTransform: 'capitalize',
      '& span': {
        borderBottom: 'none !important',
      },
    },
    '&.MuiButtonBase-root': {
      minHeight: 32,
      fontSize: 12,
      fontWeight: 400,
      lineHeight: '18px',
    },
    '&.Mui-selected': {
      backgroundColor: '#ffffff',
      color: '#242628 !important',
    },
  },
}));
