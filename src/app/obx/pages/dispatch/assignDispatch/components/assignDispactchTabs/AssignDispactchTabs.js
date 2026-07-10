import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  payrollTabButtonTops: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
    '& .MuiTabs-scroller': {
      display: 'flex',
      alignItems: 'center',
    },
  },

  tabWrapper: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1 1',
    overflow: 'auto',

    '& .MuiTabs-root': {
      minHeight: '34px',
    },
    '& .MuiTabs-scroller': {
      '& .MuiButtonBase-root': {
        minWidth: 'auto',
        marginRight: '8px',
        minHeight: 'auto',
        fontSize: '14px',
        fontWeight: '500',
        padding: '4px 16px',
        borderRadius: '60px',
        color: theme.palette.textSecondary1,
        border: `1px solid ${theme.palette.borderSubtle1}`,
        '&.Mui-selected': {
          color: theme.palette.textOnColor,
          backgroundColor: theme.palette.textBrand,
          border: `1px solid ${theme.palette.textBrand}`,
        },
      },
      '& span.MuiTabs-indicator': {
        display: 'none',
      },
    },
  },
  tabContent: {
    padding: '12px 32px',
    [theme.breakpoints.down('lg')]: {
      padding: '12px 24px',
    },
    '& > div': {
      padding: '0px',
      display: 'flex',
      flexDirection: 'column',
      flex: '1 1',
      overflow: 'auto',
    },
  },
  tabBarWrap: {
    padding: '0px 32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tabsLabesl: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  skeletonWrapper: {
    display: 'flex',
    gap: '12px',
    width: '100%',
    padding: '12px 32px',
    flexDirection: 'column',
    '& .MuiSkeleton-root ': {
      borderRadius: '4px !important',
    },
  },
  dropdownWrapper: {
    display: 'flex',
    flexDirection: 'row',
  },
}));
