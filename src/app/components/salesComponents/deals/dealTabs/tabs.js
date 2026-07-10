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
    '&  .MuiButtonBase-root.MuiTab-root.MuiTab-textColorPrimary': {
      padding: '0px 5px 14px 5px',
      width: '100%',
      maxWidth: 'fit-content',
      minWidth: 'fit-content',
      minHeight: '0px',
      height: 'auto',
      marginRight: '10px',
      flexDirection: 'row',
    },
  },
  overviewTab: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1 1',
    paddingRight: '10px',
    '& > .MuiBox-root': {
      padding: '0px',
    },
  },
  overviewTabs: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1 1',
    overflow: 'auto',
    paddingRight: '10px',
    '& > .MuiBox-root': {
      padding: '0px',
    },
  },
  overviewTabsOne: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1 1',
    overflow: 'auto',
    '& > .MuiBox-root': {
      padding: '0px',
      display: 'flex',
      flexDirection: 'column',
      flex: '1 1',
      overflow: 'auto',
      '& > .MuiBox-root': {
        padding: '0px',
        display: 'flex',
        flexDirection: 'column',
        flex: '1 1',
        overflow: 'auto',
      },
    },
  },
  activitySkeleton: {
    padding: '20px 0 !important',
  },
  relevantQuestionsWrap: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1 1',
    overflow: 'auto',
  },
  tabBtn: {
    whiteSpace: 'nowrap',
    '&.Mui-selected': {
      color: `${theme.palette.textBrand} !important`,
    },
  },
  tabsBtnWrapper: {
    '& .MuiTabs-indicator': {
      backgroundColor: `${theme.palette.textBrand} !important`,
    },
  },
  inProgressWrapper: {
    '&.MuiBox-root': {
      padding: '24px',
    },
  },
  languageModalSkeletonWrapper: {
    marginTop: '32px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },

  languageModalSkeleton: {
    '&.MuiSkeleton-root': {
      borderRadius: '8px !important',
    },
  },
  innerScrollBar: {
    flex: 'unset',
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
