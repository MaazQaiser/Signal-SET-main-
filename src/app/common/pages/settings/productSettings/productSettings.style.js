import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1 1',
    overflow: 'auto',
    position: 'relative',
    paddingRight: '32px',
  },
  header: {
    marginBottom: '16px',
  },
  title: {
    '&.MuiTypography-root': {
      color: `${theme.palette.textPrimary}`,
      marginBottom: '4px',
    },
  },
  subtitle: {
    '&.MuiTypography-root': {
      color: `${theme.palette.textPlaceholder}`,
    },
  },
  content: {
    flex: '1 1',
    overflow: 'auto',
    paddingBlock: '10px',
  },
  addProductContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: '12px',
  },
  addProductInput: {
    '& .MuiInputBase-root': {
      height: '40px',
      width: '362px',
    },
    '& .MuiOutlinedInput-input': {
      padding: '10px 14px',
      fontSize: '14px',
      lineHeight: '20px',
      '&::placeholder': {
        fontSize: '14px',
        lineHeight: '20px',
      },
    },
    '& .MuiFormHelperText-root': {
      marginLeft: 0,
      marginTop: '4px',
      fontSize: '12px',
      color: '#D92D20',
    },
  },
  addProductButton: {
    '&.MuiButton-root': {
      height: '40px',
    },
  },
  tableWrapper: {
    marginTop: '24px',
    width: '100%',

    '& .MuiTableRow-root:hover': {
      backgroundColor: 'transparent !important',
    },
    '& .MuiTableCell-root': {
      height: '44px !important',
      '&:first-child': {
        height: '44px !important',
      },
      '&:hover': {
        backgroundColor: 'transparent !important',
      },
    },
    '& .MuiTableCell-head': {
      height: '44px !important',
    },
  },
  actionsContainer: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: '6px',
  },
  actionIcon: {
    cursor: 'pointer',
    width: '16px',
    height: '16px',
    color: '#5B5B5F',
  },
  actionIconHidden: {
    opacity: 0.3,
    cursor: 'not-allowed',
    pointerEvents: 'none',
  },
  actionIconDelete: {
    cursor: 'pointer',
    width: '16px',
    height: '16px',
    color: '#D9534F',
  },
  actionIconConfirm: {
    cursor: 'pointer',
    width: '20px',
    height: '20px',
  },
  actionIconCancel: {
    cursor: 'pointer',
    width: '20px',
    height: '20px',
    color: '#667085',
    '&:hover': {
      color: '#344054',
    },
  },
  actionIconDisabled: {
    cursor: 'not-allowed',
    color: '#D0D5DD',
    opacity: 0.5,
    pointerEvents: 'none',
    '&:hover': {
      color: '#D0D5DD',
    },
  },
  editInputWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    '& .MuiInputBase-root': {
      height: '40px',
    },
  },
  editActionsWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    '& svg': {
      height: '30px',
      width: '30px',
    },
  },
  productNameTextContainer: {
    display: 'flex',
    alignItems: 'center',
  },
  productNameText: {
    display: 'block',
    alignItems: 'center',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    maxWidth: '300px',
    fontSize: '12px',
    lineHeight: '18px',
  },
  editProductInput: {
    '& .MuiInputBase-root': {
      height: '32px',
      paddingInline: '8px',
      '& .MuiInputBase-input': {
        fontSize: '12px',
      },
    },
    '& .MuiOutlinedInput-input': {
      padding: '8px 12px',
      fontSize: '14px',
      lineHeight: '20px',
    },
  },
  editProductInputError: {
    '& .MuiOutlinedInput-root': {
      '& fieldset': {
        borderColor: '#FDA29B',
      },
      '&:hover fieldset': {
        borderColor: '#FDA29B',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#FDA29B',
      },
    },
  },
  paginationWrapper: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: '16px',
    paddingBottom: '16px',
  },
}));
