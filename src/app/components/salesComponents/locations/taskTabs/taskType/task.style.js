import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles(() => ({
  typeChip: {
    '&.MuiChip-root': {
      display: 'flex',
      padding: '2px 8px 2px 6px',
      justifyContent: 'center',
      width: 'fit-content',
      alignItems: 'center',
      gap: '4px',
      '& .MuiChip-label': {
        fontSize: '12px',
        fontWeight: 500,
      },
    },
    '&.todo': {
      backgroundColor: '#FEF0C7',
      color: '#F4780B',
    },
    '&.email': {
      backgroundColor: '#EFF8EF',
      color: '#2E964B',
    },
    '&.call': {
      backgroundColor: '#E5F6FF',
      color: '#146DFF',
    },
    '&.linked_in': {
      backgroundColor: '#E5F6FF',
      color: '#0B63BD',
    },
  },
  typeIcon: {
    width: '14px !important',
    height: '14px !important',
    marginRight: '4px',
  },
}));
