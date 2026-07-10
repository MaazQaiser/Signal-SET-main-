import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  taskWrapper: {
    padding: '16px 24px !important',
  },
  taskListingPageWrapper: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1 1',
    overflow: 'hidden',
  },
  taskListingWrapper: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1 1',
    overflow: 'hidden',
    minHeight: 0,
  },
  taskFilterBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filterLeftSide: {
    display: 'flex',
    gap: '16px',
    alignItems: 'center',
  },
  locationFilterBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropDownsFilters: {
    display: 'flex',
    gap: '16px',
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
    color: theme.palette.error.main,
    '& svg path': {
      stroke: theme.palette.error.main,
    },
  },
  taskTableWrapper: {
    marginTop: '16px',
  },
  taskListingPageTableWrapper: {
    marginTop: '16px',
    display: 'flex',
    flexDirection: 'column',
    flex: '1 1',
    minHeight: 0,
    overflow: 'hidden',
    '& .MuiTableContainer-root': {
      flex: '0 1 auto',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'auto',
      minHeight: 0,
      maxHeight: '100%',
    },
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
  menuIcon: {
    '& path': {
      stroke: theme.palette.text.primary,
    },
  },
  alertIcon: {
    marginLeft: '3px',
  },
  leftWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    '& .MuiInputBase-root': {
      height: '36px !important',
    },
    '& .MuiFormControl-root ': {
      width: '285px !important',
    },
  },
}));
