import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  vehicleListingContainer: {
    display: 'flex',
    flexDirection: 'column;',
    flex: '1',
    overflow: 'auto',

    [theme.breakpoints.down('lg')]: {
      paddingLeft: '24px',
      paddingRight: '24px',
    },
  },

  searchSectionDashboard: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    margin: '20px 0',
    height: '36px',
  },
  daysColumn: {
    whiteSpace: 'pre-line',
    textAlign: 'center !important',
  },
  tableWrapper: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1',
    overflow: 'auto',
    '& td.MuiTableCell-root , th.MuiTableCell-root': {
      textAlign: 'center',
      '&:not(:last-child)': {
        borderRight: `1px solid ${theme.palette.borderSubtle1}`,
      },
    },
    '& table': {
      '& th:last-child, & td:last-child': {
        zIndex: '22',
        position: 'sticky',
        right: '0px',
        fontWeight: '700 !important',
        color: `theme.palette.textSecondary1 !important`,
      },

      '& th': {
        fontSize: '14px !important',
        '&:nth-child(1)': {
          minWidth: '300px',
          maxWidth: '300px',
          fontWeight: '700 !important',
          textAlign: 'left',
          color: `${theme.palette.textSecondary1} !important`,
          boxShadow: 'none',
        },
      },
      '& td:nth-child(1)': {
        minWidth: '300px',
        maxWidth: '300px',
        boxShadow: 'none',
        fontWeight: '500 !important',
      },
      '& tr:nth-child(odd)': {
        '& td': {
          backgroundColor: `${theme.palette.surfaceGreySubtle} !important`,
        },
      },
      '& th:nth-child(odd)': {
        '& td': {
          backgroundColor: `${theme.palette.surfaceGreySubtle} !important`,
        },
      },
    },
  },
  userName: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    '& .MuiAvatar-root': {
      width: '24px',
      height: '24px',
    },
  },
}));
