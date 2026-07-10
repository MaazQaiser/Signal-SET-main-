import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  siderBarBox: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1',
    overflow: 'auto',
  },

  sideHeader: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'auto',
    padding: '24px 24px 10px',
  },

  moreFilterForm: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1',
    overflow: 'auto',
    padding: '6px 24px 16px 24px',
  },

  fieldWrapper: {
    marginBottom: '16px',
    '&  dropdownWrap': {
      height: '44px',
    },

    '&:last-child': {
      marginBottom: 0,
    },
  },

  dropdownHeight: {
    height: '44px !important',
  },
  textFiledFilter: {
    height: '44px !important',
  },

  moreFilterFooter: {
    marginTop: 0,
    padding: '24px',
  },
  footerWrap: {
    margin: '0px 24px',
  },
  moreFilter: {
    '&.MuiButtonBase-root': {
      fontSize: '14px',
      fontWeight: '500',
      lineHeight: '20px',
      letterSpacing: '0px',
      color: theme.palette.textPrimary,
      textTransform: 'capitalize',
      width: 'fit-content',
      height: 'auto',
      padding: '0',
      '&:hover': {
        background: 'transparent',
      },

      '&.Mui-disabled': {
        '& svg': {
          '& path': {
            fill: theme.palette.textDisabled,
          },
        },
      },
    },
    '& svg': {
      width: '14px',
      height: '14px',
    },
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
