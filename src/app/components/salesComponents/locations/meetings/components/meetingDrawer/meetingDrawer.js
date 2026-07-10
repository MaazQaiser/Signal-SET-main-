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
  guestInput: {
    width: '100% !important',
    '& .MuiInputBase-root': {},
  },
  emailChipsContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
  },
  emailChip: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8px',
    padding: '4px 8px',
    borderRadius: '4px',
    width: '100%',
    fontSize: '14px',
    fontWeight: '400',
  },
  emailChipText: {
    fontSize: '14px',
    fontWeight: '400',
    color: '#000',
  },
  emailChipTextWrapperImage: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  imageWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '34px',
    height: '34px',
    borderRadius: '50%',
    backgroundColor: '#E6EBF6',
    overflow: 'hidden',
    border: '1px solid #e6e6e7',
    '& img': {
      width: '100%',
      height: '100%',
      borderRadius: '50%',
    },
  },
  emailChipTextName: {
    '&.MuiTypography-root': {
      color: '#9D9D9D',
      fontSize: '12px',
      fontWeight: '400',
      lineHeight: 'normal',
    },
  },
  emailChipTextEmail: {
    '&.MuiTypography-root': {
      color: '#000',
      fontSize: '12px',
      fontWeight: '400',
      lineHeight: 'normal',
    },
  },
}));
