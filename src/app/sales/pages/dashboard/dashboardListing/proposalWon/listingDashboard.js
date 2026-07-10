import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  industryVerticals: {
    padding: ' 24px 32px 0 32px',
    overflow: 'auto',
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    [theme.breakpoints.down('lg')]: {
      padding: '24px 24px 0 24px',
    },
  },

  industryVerticalsHeaderSearch: {
    height: '36px',
  },

  proposalWonHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '24px',
  },

  industryVerticalsTable: {
    overflow: 'auto',
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
  },
  industryNameTD: {
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
  industryNameIcon: {
    width: '20px',
    height: '20px',
    '& svg': {
      visibility: 'hidden',
      width: '20px',
      height: '20px',
      '& path': {
        stroke: '#b3b3b3',
      },
    },
  },
  industryName: {
    display: 'flex !important',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  reportsListingsHeaderRightDate: {
    width: '265px',
    '& .MuiBox-root ': {
      '& .MuiStack-root ': {
        '& .MuiFormControl-root ': {
          '& .MuiInputBase-root ': {
            height: '36px',
            minWidth: '265px',
          },
        },
      },
    },
  },
}));
