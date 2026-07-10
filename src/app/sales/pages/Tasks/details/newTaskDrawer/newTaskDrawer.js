import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  siderbarbox: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflow: 'auto',
  },
  boxinner: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflow: 'auto',
  },
  sideheader: {
    display: 'block',
    padding: '24px 32px 32px 24px',
    '& .MuiBox-root': {
      marginBottom: 0,
      paddingRight: 0,
    },
  },
  newLocationDrawerHeader: {
    paddingRight: '8px',
  },
  locationForm: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflow: 'auto',
    padding: '0 32px 20px 32px',
  },
  fieldWrapper: {
    width: '100%',
  },
  dropHigh: {
    height: '44px',
  },
  placeHolderText: {
    fontSize: '16px !important',
    fontWeight: '400 !important',
    color: theme.palette.textPlaceholderField,
  },
  sideDrawerFooter: {
    paddingLeft: '32px',
    paddingRight: '32px',
    marginTop: 0,
  },
  Input: {
    marginBottom: '20px',
  },
  radioWrapper: {
    '& .MuiFormGroup-root': {
      columnGap: '40px',
    },
  },
}));
