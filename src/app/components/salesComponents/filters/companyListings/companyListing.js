import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  dropdownCommonSection: {
    margin: '0px 20px',
  },
  filterWrapper: {
    borderTop: `1px solid ${theme.palette.borderSubtle1}`,
    padding: '23px 0px',
  },
  rightItems: {
    gap: '12px',
  },
  exportBtn: {
    '& .MuiButton-startIcon': {
      marginRight: '4px !important',
      marginLeft: '0',
    },
    '& svg': {
      width: '16px',
    },
  },
}));
