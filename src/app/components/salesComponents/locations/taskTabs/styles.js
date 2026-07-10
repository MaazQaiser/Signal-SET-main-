import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  taskWrapper: {
    padding: '16px 0 !important',
  },
  filterLeftSide: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
  },
  filterRightSide: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
    '& .MuiInputBase-root': {
      height: '36px !important',
      width: '254px !important',
      '& .MuiInputBase-input': {
        fontSize: '14px !important',
        '&::placeholder': {
          fontSize: '14px !important',
        },
      },
    },
  },
  locationFilterBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  datePickerFilter: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
  },
  dropDownsFilters: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
  },

  checkBoxCustom: {
    '&.MuiCheckbox-root': {
      padding: '0',
      cursor: 'pointer',
    },
    '& svg': {
      width: '16px',
      height: '16px',
    },
  },
  cursor: {
    cursor: 'pointer',
  },
  moreButton: {
    padding: '4px !important',
    '& svg': {
      width: '16px',
      height: '16px',
      path: {
        stroke: theme.palette.text.secondary,
      },
    },
  },
  deleteMenuItem: {
    '&.MuiMenuItem-root': {
      color: theme.palette.textSecondary2,
      '& svg': {
        '& path': {
          stroke: theme.palette.textSecondary2,
        },
      },
    },
  },
  menuIcon: {
    '&.MuiMenuItem-root': {
      color: theme.palette.textSecondary2,
      '& svg': {
        '& path': {
          stroke: theme.palette.textSecondary2 || '#5b5b5f',
        },
      },
    },
  },
  taskTableWrapper: {
    marginTop: '16px',
  },
  taskTable: {
    '& .MuiTableCell-root': {
      padding: '12px 16px !important',
    },
  },
  completedTaskTitle: {
    textDecoration: 'line-through',
    color: theme.palette.text.disabled,
  },

  priorityWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  priorityDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    '&.high': {
      backgroundColor: theme.palette.error.main,
    },
    '&.medium': {
      backgroundColor: theme.palette.warning.main,
    },
    '&.low': {
      backgroundColor: '#146DFF',
    },
  },
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
      color: '#146DFF',
    },
  },
  typeIcon: {
    width: '14px !important',
    height: '14px !important',
    marginRight: '4px',
  },
  menuItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    '& svg': {
      width: '16px',
      height: '16px',
    },
  },

  alertIcon: {
    marginLeft: '3px',
  },
}));
