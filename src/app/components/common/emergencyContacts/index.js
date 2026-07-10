import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  addContacts: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '8px',
    padding: '16px',
    borderRadius: '8px',
    border: `1px solid ${theme.palette.borderSubtle1}`,
    fontSize: '14px',
    fontWeight: 500,
    color: theme.palette.textBrand,
    cursor: 'pointer',
  },

  addContactsWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },

  addContactsBox: {
    background: theme.palette.surfaceGreySubtle,
    padding: '16px',
    borderRadius: '8px',
  },

  addContactsBoxHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
    paddingBottom: '12px',
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
  },
  disabledButtonStyle: {
    opacity: '0.6',
  },
  addContactsBoxHeaderBtn: {
    '&.MuiButtonBase-root': {
      padding: 0,
      background: 'transparent',
      border: 0,
      fontSize: '14px',
      height: 'auto',
      boxShadow: 'none',
      borderRadius: 'none',
      '&:hover': {
        border: 0,
        background: 'transparent',
      },
      '&:active': {
        background: 'transparent',
        border: 0,
        boxShadow: 'none',
      },
      '&:disabled': {
        color: '#FECDCA',
        background: 'transparent',
        border: 0,
        '& .MuiButton-startIcon': {
          '& svg': {
            ' & path': {
              stroke: '#FECDCA',
            },
          },
        },
      },
      '& .MuiButton-startIcon': {
        marginRight: '4px',
        '& svg': {
          width: '16px',
          height: '16px',
        },
      },
    },
  },

  addContactsBoxContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginTop: '20px',
  },

  addContactsBoxGroup: {
    display: 'flex',
    gap: '32px',
  },

  addContactsBoxGroupControl: {
    width: '50%',
  },

  addContactsInputs: {
    '& .MuiInputBase-root': {
      '& .MuiOutlinedInput-notchedOutline': {
        background: theme.palette.surfaceWhite,
      },
    },
  },

  checkBoxCustom: {
    '&.MuiCheckbox-root': {
      padding: '0',
    },

    '& svg': {
      width: '16px',
      height: '16px',
    },
  },

  sitesContactCheckbox: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: '8px',
    width: '50%',
    marginTop: 'auto',

    '& .MuiFormLabel-root': {
      marginBottom: 0,
      fontWeight: 400,
      color: theme.palette.textPrimary,
    },
  },

  formBoxLast: {
    marginBottom: 0,
  },

  sitesDynamicContent: {
    marginBottom: '20px',
  },

  addContactsBoxHeaderTitle: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },
}));
