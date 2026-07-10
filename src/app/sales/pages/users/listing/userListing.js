import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  chipsBar: {
    display: 'flex',
    marginBottom: '23px',
  },
  chipsWrapper: {
    display: 'flex',
    gap: '12px',
    '& .MuiButtonBase-root.MuiChip-root.MuiChip-filled': {
      backgroundColor: theme.palette.surfaceGreySubtle,
      '& svg.MuiChip-deleteIcon': {
        marginLeft: '5px',
      },
    },
  },
  salesUserListingContainer: {
    padding: '0 32px 24px 32px',
    paddingBottom: '0',
    display: 'flex',
    flexDirection: 'column',
    flex: '1',
    overflow: 'auto',
    '& table': {
      '& th:nth-child(1), & td:nth-child(1)': {
        boxShadow: '1px 0px 2px -1px rgba(0, 0, 0, 0.12)',
      },
    },
    [theme.breakpoints.down('lg')]: {
      paddingLeft: '24px',
      paddingRight: '24px',
    },
  },
  searchSectionDashboard: {
    padding: '0;',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '24px',
    marginTop: '24px',
    height: '36px',
  },
  searchSection: {
    display: 'flex',
    alignItems: 'center',
    height: '100%',
  },
  userSection: {
    display: 'flex',
    gap: '16px',
    height: '100%',
  },
  filterBtnSection: {
    display: 'flex',
    alignItems: 'center',
    borderRadius: '8px',
    border: `1px solid ${theme.palette.borderSubtle1}`,
    background: '#fff',
    padding: '8px 14px 8px 14px',
    boxSizing: 'border-box',
  },
  tableWrapper: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1',
    overflow: 'auto',
  },
  moreFilter: {
    '&.MuiButtonBase-root': {
      fontSize: '14px',
      fontWeight: '500',
      lineHeight: '20px',
      letterSpacing: '0px',
      color: theme.palette.textPrimary,
      textTransform: 'capitalize',
      border: '0',
      cursor: 'pointer',
      '&:hover': {
        backgroundColor: 'transparent !important',
        color: theme.palette.textPrimary,
      },
      '& svg': {
        marginLeft: '8px',
      },
    },
  },
  locationTD: {
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: `${theme.palette.surfaceGreySubtle} !important`,
      '& .MuiBox-root': {
        '& > :nth-child(2)': {
          '& svg': {
            visibility: 'visible !important',
          },
        },
      },
    },
  },
  locationName: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationNameIcon: {
    width: '20px',
    height: '20px',
    '& svg': {
      visibility: 'hidden',
      width: '20px',
      height: '20px',
      '& path': {
        stroke: theme.palette.textPlaceholder,
      },
    },
  },
  graphHide: {
    display: 'flex',
    maxHeight: 0,
    overflow: 'hidden',
    transition: 'max-height 0.3s ease-in-out',
  },

  graphExpandBtn: {
    '&.MuiButtonBase-root': {
      position: 'fixed',
      left: '52%',
      transform: 'translateX(-50%) rotate(-180deg)',
      top: '46px',
      minWidth: '28px',
      width: '28px',
      height: '28px',
      borderRadius: '50%',
      zIndex: '100',
      padding: '0',
    },
  },

  graphCollapseBtn: {
    '&.MuiButtonBase-root': {
      position: 'absolute',
      left: '50%',
      transform: 'translateX(-50%)',
      bottom: '-14px',
      minWidth: '28px',
      width: '28px',
      height: '28px',
      borderRadius: '50%',
      padding: '0',
    },
  },

  mainWrapper: {
    display: 'flex',
    justifyContent: 'space-between',
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    position: 'relative',
    maxHeight: '284px',
  },
}));
