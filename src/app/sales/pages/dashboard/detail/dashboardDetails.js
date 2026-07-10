import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  industryVerticals: {
    padding: '24px 32px',
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
  proposalWonHeader: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  reportsListingsHeaderRightDate: {
    width: '140px',
    '& .MuiBox-root ': {
      '& .MuiStack-root ': {
        '& .MuiFormControl-root ': {
          '& .MuiInputBase-root ': {
            height: '36px',
            minWidth: '40px',
            fontSize: '14px',
            lineHeight: '20px',
            fontWeight: '500',
            color: theme.palette.textSecondary1,
            '&::placeholder': {
              fontSize: '12px !important',
            },
            '& .MuiInputBase-input ': {
              fontSize: '12px',
              lineHeight: '20px',
              fontWeight: '500',
              color: theme.palette.textSecondary1,
            },
          },
        },
      },
    },
  },
}));
