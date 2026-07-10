import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  salesUserListingContainer: {
    padding: '0 32px 24px 32px',
    paddingBottom: '0',
    display: 'flex',
    flexDirection: 'column',
    flex: '1',
    overflow: 'auto',
  },
  searchSectionDashboard: {
    padding: '0;',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '24px',
    marginTop: '24px',
    height: '36px',
  },
  searchSection: {
    display: 'flex',
    alignItems: 'center',
    height: '100%',
    gap: '10px',
  },
  userSection: {
    display: 'flex',
    gap: '16px',
    height: '100%',
  },
  filterBtnSection: {
    display: 'flex',
    alignItems: 'center',
    borderRadius: '8px',
    border: `1px solid ${theme.palette.borderSubtle1}`,
    background: '#fff',
    padding: '8px 14px 8px 14px',
    boxSizing: 'border-box',
  },
  tableWrapper: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1 1',
    overflow: 'auto',
    '& table': {
      '& th:nth-child(1), & th:nth-child(2)': {
        zIndex: '22 !important',
        position: 'sticky',
      },
      '& td:nth-child(1), & td:nth-child(2)': {
        position: 'sticky',
        fontWeight: 500,
        color: theme.palette.textSecondary1,
      },
      '& th:nth-child(1), & td:nth-child(1)': {
        left: 0,
        width: '200px',
        minWidth: '200px',
      },
      '& th:nth-child(2), & td:nth-child(2)': {
        left: '200px',
        width: '260px',
      },
    },
  },

  newLocationColor: {
    color: theme.palette.textSuccess,
    background: theme.palette.surfaceSuccessSubtle,
  },
  qualifiedColor: {
    color: '#F6A300',
    background: '#FFF4D8',
  },
  UnQualifiedColor: {
    color: '#FFA31C',
    background: '#FEF0C7',
  },
  workingColor: {
    color: theme.palette.textBrand,
    background: theme.palette.surfaceBrandSubtle,
  },
  nurturingColor: {
    color: '#a142f5',
    background: '#f6ecfe',
  },
  otherStageColor: {
    background: '#fafafa',
  },
  commonStageColor: {
    textAlign: 'center',
    fontSize: '12px',
    fontStyle: 'normal',
    fontWeight: '500',
    lineHeight: '18px',
    borderRadius: '16px',
    display: 'inline-flex',
    justifyContent: 'flex-start',
    width: 'fit-content',
    padding: '4px 12px',
  },
  siderBarBox: {
    padding: '24px 24px 0px 24px',
    height: '100vh',
  },
  textFiledFil: {
    height: '44px',
  },
  textFiledFilter: {
    height: '44px',
  },
  boxInner: {
    '&.MuiStack-root': {
      height: '100%',
    },
  },
  sideHeader: {
    display: 'block',
  },
  fieldWrapper: {
    marginBottom: '24px',
    '&  dropdownWrap': {
      height: '44px',
    },
  },

  moreFilterHeader: {
    marginBottom: '16px !important',
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
  createdDatePicker: {
    '& input': {
      fontSize: '16px !important',
      '&::placeholder': {
        fontSize: '16px !important',
      },
    },
  },
  marginBotom: {
    marginTop: '24px',
  },
  dropdownCommonSection: {
    '& .MuiFormControl-root.MuiTextField-root': {
      width: '100%',
    },
  },

  moreFilterFooter: {
    margin: '0 24px 0px 24px',
    padding: '24px 0px',
  },

  moreFilterForm: {
    flex: '1 1 auto',
    overflowY: 'auto',
    paddingTop: '24px',
  },

  autoCompleteField: {
    minHeight: '44px',
    '& .MuiFormControl-root': {
      '& .MuiInputBase-root': {
        fontSize: 16,
        lineHeight: '24px',
        color: '#262527', // Change the color of input text
        zIndex: 1,
        padding: '10px 14px',
        background: 'transparent',
        gap: '4px',
        borderRadius: '8px',
        border: `1px solid ${theme.palette.borderSubtle2}`,

        '& .MuiChip-root': {
          margin: 0,
        },

        '&:hover': {
          borderColor: theme.palette.borderStrong1, // Border Color when Hovered
          boxShadow: 'none',
        },

        '&::after': {
          display: 'none',
        },
        '&::before': {
          display: 'none',
        },
        '& .MuiInputBase-input': {
          padding: 0,

          '&::placeholder': {
            color: theme.palette.textPlaceholderField, // Placeholder Color
            fontSize: '16px',
            fontWeight: '400',
            lineHeight: '24px',
            opacity: 1,
          },
        },
      },
    },
  },
}));
