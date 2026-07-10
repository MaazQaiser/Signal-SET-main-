import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  updateSites: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'auto',
  },

  mainBoxForm: {
    maxWidth: '974px',
    width: '100%',
    margin: '0 auto',
    padding: '24px 32px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },

  btnBox: {
    display: 'flex',
    justifyContent: 'space-between',
    paddingBottom: '16px',
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
  },

  flexControlEmail: {
    marginBottom: '20px',
    width: '48.243%',
  },

  buttonGroup: {
    display: 'flex',
    gap: '12px',
  },

  backBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },

  formBox: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: '32px',
    marginBottom: '20px',
  },

  avatarFormImage: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
  },

  flexControl: {
    flex: 1,
  },

  flexHalf: {
    width: 'calc(50% - 16px)',
  },

  mapBox: {
    display: 'flex',
    flexDirection: 'row',
    marginTop: '10px',
    marginBottom: '10px',
  },

  buttonGroupLast: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
    paddingTop: '16px',
    borderTop: `1px solid ${theme.palette.borderSubtle1}`,
  },

  sitesFieldsTitle: {
    '&.MuiTypography-root': {
      marginBottom: '20px',
      color: theme.palette.textPrimary,
    },
  },

  addContacts: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '8px',
    padding: '16px 24px',
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
    alignItems: 'center',
    gap: '32px',
  },

  inputLabel: {
    display: 'flex',
    alignItems: 'center',
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

  addContactsBoxHeaderTitle: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },
}));
