import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  container: {
    minWidth: 0,
    maxWidth: '100%',
    overflow: 'hidden',
  },
  heading: {
    '&.MuiTypography-root': {
      marginBottom: theme.spacing(2),
      fontSize: '16px',
      fontWeight: 700,
      color: theme.palette.text.primary,
    },
  },
  productCardsWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: theme.spacing(1),
    minWidth: 0,
    maxWidth: '100%',
  },
  productCard: {
    backgroundColor: theme.palette.surfaceGreyLight || theme.palette.grey[100],
    borderRadius: '12px',
    padding: theme.spacing(1),
    width: '100%',
    minWidth: 0,
    maxWidth: '100%',
    boxSizing: 'border-box',
    overflow: 'hidden',
  },
  productCardHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '12px',
  },
  productLabel: {
    '&.MuiTypography-root': {
      fontSize: '12px',
      fontWeight: 500,
      color: theme.palette.textSecondary3,
    },
  },
  productDropdownWrap: {
    marginBottom: theme.spacing(1.5),
    minWidth: 0,
    '& .MuiBox-root': {
      '& .MuiBox-root': {
        backgroundColor: theme.palette.common.white,
        borderRadius: '8px',
      },
    },
    '& .MuiOutlinedInput-root': {
      backgroundColor: theme.palette.common.white,
      borderRadius: '8px',
      height: '26px',
      minWidth: 0,
    },
  },
  detailsRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    maxWidth: '100%',
  },
  detailsLabelsRow: {
    display: 'grid',
    gridTemplateColumns: '2fr 2fr 1fr',
    gap: '6px',
    alignItems: 'center',
  },

  detailsInputsRow: {
    display: 'grid',
    gridTemplateColumns: '2fr 2fr 1fr',
    gap: '6px',
    alignItems: 'flex-start',
  },
  detailLabel: {
    '&.MuiTypography-root': {
      fontSize: '12px',
      fontWeight: 400,
      color: theme.palette.textSecondary3,
    },
  },
  detailInputCell: {
    minWidth: 0,
    '& .MuiTextField-root': {
      minWidth: 0,
    },
    '& .MuiOutlinedInput-root': {
      backgroundColor: theme.palette.background.paper,
      borderRadius: '8px',
      height: '40px',
      minWidth: 0,
    },
    '& .MuiOutlinedInput-input': {
      padding: theme.spacing(1, 1.5),
      minWidth: 0,
    },
  },
  subTotalValueCell: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  subTotalValue: {
    '&.MuiTypography-root': {
      padding: ' 8px',
      color: theme.palette.text.primary,
    },
  },
  columnProduct: {
    '& .MuiOutlinedInput-root': {
      height: '36px',
    },
  },
  columnRate: {
    '& .MuiTextField-root': {
      width: '100%',
      minWidth: 0,
      '& .MuiOutlinedInput-root': {
        height: '36px',
      },
    },
  },
  columnQty: {
    '& .MuiTextField-root': {
      width: '100%',
      minWidth: 0,
      '& .MuiOutlinedInput-root': {
        height: '36px',
      },
      '& .MuiFormHelperText-root': {
        margin: '4px 0 0 0',
        fontSize: '10px',
        color: theme.palette.error.main,
      },
    },
  },
  columnTotal: {
    display: 'flex',
    alignItems: 'center',
    '& .MuiTypography-root': {
      fontSize: '14px',
      fontWeight: 600,
      color: theme.palette.text.primary,
    },
  },
  columnAction: {
    display: 'flex',
    justifyContent: 'center',
  },
  deleteBtn: {
    color: theme.palette.error.main,
    padding: theme.spacing(0.5),
    '&:hover': {
      backgroundColor: theme.palette.error.light + '20',
    },
    '& .MuiSvgIcon-root': {
      width: '18px',
      height: '18px',
    },
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: theme.spacing(2),

    borderTop: `1px solid ${theme.palette.divider}`,
  },
  totalLabel: {
    fontSize: '14px',
    fontWeight: 600,
    color: theme.palette.text.primary,
  },
  totalAmount: {
    '&.MuiTypography-root': {
      fontSize: '14px',
      fontWeight: 700,
      color: theme.palette.text.primary,
    },
  },
  addProductBtn: {
    '&.MuiButton-root': {
      width: '100%',
      padding: '8px 14px',
      borderRadius: '8px',
      border: `1px solid ${theme.palette.primary.main}`,
      color: theme.palette.primary.main,
      textTransform: 'none',
      fontSize: '14px',
      fontWeight: 500,
    },
    '&:hover': {
      backgroundColor: theme.palette.primary.main + '10',
      border: `1px solid ${theme.palette.primary.main}`,
    },
    '&:active': {
      backgroundColor: theme.palette.primary.main + '10',
      border: `1px solid ${theme.palette.primary.main}`,
    },
    '&:disabled': {
      backgroundColor: theme.palette.primary.main + '10',
      border: `1px solid ${theme.palette.primary.main}`,
    },
  },
  errorText: {
    color: theme.palette.error.main,
    fontSize: '12px',
    lineHeight: '16px',
    margin: '4px 0 0 0',
    '&.MuiTypography-root': {
      fontSize: '12px',
      lineHeight: '16px',
    },
  },
  subTotalLabel: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
}));
