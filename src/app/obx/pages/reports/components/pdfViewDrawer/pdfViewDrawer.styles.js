import { makeStyles } from '@mui/styles';
export const useStyles = makeStyles((_theme) => ({
  addBannedVisitorDrawer: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'auto',
    flex: 1,
  },

  addBannedVisitorDrawerHeader: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: '12px',
    padding: '24px',
  },

  closeBtn: {
    '&.MuiButtonBase-root': {
      minWidth: 'fit-content',
      padding: 0,

      '&:hover': {
        background: 'transparent',
      },
    },
  },

  addBannedVisitorDrawerBody: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'auto',
    flex: 1,
    gap: '16px',
    paddingTop: 0,
    padding: '24px 24px',
  },

  pdfLoadingSkeletons: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',

    '& .MuiSkeleton-root': {
      height: 100,
      borderRadius: '8px !important',
      transform: 'none',
      transformOrigin: 0,
    },
  },
}));
