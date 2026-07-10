import { makeStyles } from '@mui/styles';
export const useStyles = makeStyles((theme) => ({
  dealsWrapper: {
    display: 'flex',
    flex: '1 1',
    overflow: 'auto',
    paddingBottom: '0',
  },
  scoutingLeftArea: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'auto',
    // flex: '0 0 75%',
    flex: '0 0 100%',
    paddingRight: '24px',
  },
  mainWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    borderTop: `1px solid ${theme.palette.borderSubtle1}`,
  },
  scoutingRightArea: {
    flex: '0 0 25%',
  },

  mapWraper: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E5F6FF',
  },
  tableCheck: {
    '&.MuiButtonBase-root': {
      padding: 0,
    },
  },
  locationListing: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1 1',
    overflow: 'auto',
  },

  assignToClass: {
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  assignAvatar: {
    '&.MuiAvatar-root': {
      width: '24px',
      height: '24px',
    },
  },
  assignToText: {
    marginLeft: 8,
    color: theme.palette.textSecondary3,
  },
  locationFilterBar: {
    margin: '24px 0',
  },

  reportLinks: {
    '& .MuiButtonBase-root': {
      padding: '0px',
      fontWeight: '500',
      justifyContent: 'flex-start',
    },
  },

  searchWidth: {
    maxWidth: '189px',
    '& .MuiInputBase-root': {
      minWidth: '100%',
    },
  },

  historyTableHead: {
    background: 'red',

    '& .MuiTableCell-root': {
      borderTop: '0 !important',
    },
  },

  dropHigh: {
    maxWidth: '320px',
  },
  franchiseNameIcon: {
    width: '20px',
    height: '20px',
    '& svg': {
      visibility: 'hidden',
      width: '20px',
      height: '20px',
      '& path': {
        stroke: theme.palette.surfaceGreyStrong1,
      },
    },
  },
  franchiseName: {
    display: 'flex !important',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dealNameTD: {
    paddingRight: '10px !important',
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
}));
