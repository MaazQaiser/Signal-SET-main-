import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles(() => ({
  tableWrapper: {
    width: '100%',
    overflowX: 'auto',
  },
  tableHeader: {
    backgroundColor: '#f8f9fa',
    '& .MuiTableCell-head': {
      backgroundColor: '#f8f9fa',
      fontWeight: 600,
      color: '#333',
    },
  },
  highlightedRow: {
    backgroundColor: '#f5f5f5',
    '&:hover': {
      backgroundColor: '#eeeeee',
    },
  },
}));
