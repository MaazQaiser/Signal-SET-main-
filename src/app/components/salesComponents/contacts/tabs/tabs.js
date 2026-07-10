import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  tabArea: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1 1',
    overflow: 'auto',
    '& .MuiTabs-root ': {
      minHeight: 'auto',
    },
  },
  tabBtn: {
    '&.MuiButtonBase-root': {
      padding: '0px 5px 14px 5px',
      width: '100%',
      maxWidth: 'fit-content',
      minWidth: 'fit-content',
      minHeight: '0px',
      height: 'auto',
      marginRight: '10px',
      flexDirection: 'row',
      '&.MuiTab-root': {
        flexDirection: 'row',
      },
    },
    '&.Mui-selected': {
      color: `${theme.palette.textBrand} !important`,
    },
  },
  overviewTabs: {
    paddingRight: '10px',

    overflow: 'auto',
    flex: '1 1',
    '& .MuiBox-root': {
      padding: '0px',
    },
  },
  activitySkeleton: {
    padding: '20px 0 !important',
  },
  tabsInnerWrap: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1 1',
    overflow: 'auto',
  },

  tabsBtnWrapper: {
    '& .MuiTabs-indicator': {
      backgroundColor: `${theme.palette.textBrand} !important`,
    },
  },
  pendingNumber: {
    background: theme.palette.surfaceAlertSubtle,
    color: theme.palette.textAlert,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: '5px',
    padding: '1px 9px',
    fontSize: '10px',
    width: '18px',
    height: '18px',
    borderRadius: ' 6px',
  },
  displayBlock: {
    display: 'block',
  },
}));
