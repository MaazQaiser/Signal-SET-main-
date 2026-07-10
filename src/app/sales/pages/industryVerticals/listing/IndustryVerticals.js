import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  industryVerticals: {
    padding: '24px 32px',
    paddingBottom: 0,
    overflow: 'auto',
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    [theme.breakpoints.down('lg')]: {
      paddingLeft: '24px',
      paddingRight: '24px',
    },
  },

  industryVerticalsHeaderSearch: {
    height: '36px',
  },

  industryVerticalsTable: {
    marginTop: '24px',
    overflow: 'auto',
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
  },
  industryNameTD: {
    '&:hover': {
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
}));
