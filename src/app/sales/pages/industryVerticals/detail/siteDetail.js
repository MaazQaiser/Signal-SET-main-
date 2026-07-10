import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  siteDetail: {
    display: 'flex',
    flexDirection: 'row',
    overflow: 'auto',
    overflowY: 'hidden',
    flex: '1 1',
  },

  siteDetaiLeftSide: {
    width: '247px',
  },

  siteDetailListing: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'auto',
    flex: '1 1',
  },

  siteDetailListings: {
    padding: '0 32px',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'auto',
    flex: '1 1',

    [theme.breakpoints.down('lg')]: {
      paddingLeft: '24px',
      paddingRight: '24px',
    },
  },

  siteDetailAddBtn: {
    '&.MuiButtonBase-root': {
      fontWeight: '400',
    },
  },

  siteDetailExportBtn: {
    '&.MuiButtonBase-root': {
      fontWeight: '400',

      '&.Mui-disabled': {
        '& svg path': {
          stroke: '#aeaeb2;',
        },
      },
    },
  },

  siteDetailListingHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '24px',
    marginBottom: '24px',
    gap: '12px',
  },

  siteDetailSearch: {
    height: '36px',
  },

  siteDetailGroupBtn: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: '12px',
  },
}));
