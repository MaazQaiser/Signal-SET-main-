import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  sidebarWrapper: {
    paddingLeft: '1px !important',
    borderRight: `1px solid ${theme.palette.borderSubtle1}`,
  },
  industrySideBarSearch: {
    padding: '12px',
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    '& .MuiBox-root': {
      height: '36px',
    },
  },

  industrySideBarScroll: {
    height: 'calc(100vh - 120px)',
    overflowY: 'hidden',
    '&:hover': {
      overflowY: 'auto',
    },
  },

  listItem: {
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    '&.MuiListItem-root': {
      padding: '0px',
    },
  },

  activeListItem: {
    background: '#262527',
    '& .MuiButtonBase-root': {
      '& .MuiTypography-subtitle1': {
        color: '#ffffff',
      },
      '& .MuiTypography-body3': {
        background: '#6A6A70',
        color: '#ffffff',
      },
    },
  },

  listItemTitle: {
    '&.MuiTypography-root': {
      color: '#262527',
    },
  },

  listItemText: {
    borderRadius: '100px',
    background: '#F5F5F6',
    padding: '2px 8px',
    '&.MuiTypography-root': {
      color: '#262527',
    },
  },

  industrySideBarScrollListing: {
    '&.MuiList-root': {
      padding: '0px',
    },
    '& .MuiListItem-root': {
      '& .MuiButtonBase-root': {
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
      },
    },
  },
}));
