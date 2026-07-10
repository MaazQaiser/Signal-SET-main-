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

  topFilterBtn: {
    display: 'flex',
    flexDirection: 'column',
  },

  filedArea: {
    padding: '0 24px 16px',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'auto',
    flex: '1',
  },

  sideHeaderTop: {
    '&.MuiStack-root': {
      marginBottom: '16px',
    },
  },

  marginBotom: {
    marginTop: '16px',
  },

  dateRanges: {
    '& .MuiFormControl-root ': {
      width: '100%',
    },
  },

  buttonStacks: {
    display: 'flex',
    gap: '10px',
  },
  sideFooter: {
    borderTop: `1px solid ${theme.palette.borderSubtle1}`,
    padding: '24px 0px',
    margin: '24px 24px 0px 24px',
  },
  dropHight: {
    height: '44px !important',
  },

  moreFilterForm: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1',
    overflow: 'auto',
    padding: '6px 24px 16px 24px',
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

  spaceBtn: {
    color: `${theme.palette.textPrimary} !important`,
    '& svg': {
      marginLeft: '8px',
      padding: '0px',
      '& path': {
        fill: theme.palette.textPrimary,
      },
    },
    '&:hover': {
      backgroundColor: 'transparent !important',
    },
  },
  cancelBtn: {
    cursor: 'pointer',
    '& svg': {
      width: '24px',
      height: '24px',
      '& path': {
        fill: theme.palette.textPrimary,
      },
    },
  },
  lastModifiedDatePicker: {
    '& input': {
      fontSize: '14px !important',
      '&::placeholder': {
        fontSize: '14px !important',
      },
    },
  },
  lastActivityDatePicker: {
    '& input': {
      fontSize: '14px !important',
      '&::placeholder': {
        fontSize: '14px !important',
      },
    },
  },
  createdDatePicker: {
    '& input': {
      fontSize: '14px !important',
      '&::placeholder': {
        fontSize: '14px !important',
      },
    },
  },
}));
