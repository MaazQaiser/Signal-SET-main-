import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  fieldWrapper: {
    width: '100%',
  },
  placeHolderColor: {
    color: theme.palette.textPlaceholderField,
    fontSize: '16px !important',
    fontWeight: '400 !important',
  },
  dropdownWrap: {
    height: '44px',
    fontSize: '16px',
    fontWeight: '400',
  },
}));
