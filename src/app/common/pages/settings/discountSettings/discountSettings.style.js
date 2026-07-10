import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1 1',
    overflow: 'auto',
    position: 'relative',
  },
  header: {
    marginBottom: '24px',
  },
  title: {
    '&.MuiTypography-root': {
      color: `${theme.palette.textPrimary}`,
      marginBottom: '8px',
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
  },
  tableHeader: {
    display: 'grid',
    gridTemplateColumns: '1fr 220px',
    gap: '16px',
    padding: '12px 16px',
    backgroundColor: theme.palette.surfaceSubtle,
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
  },
  headerCell: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary,
      fontWeight: 600,
    },
  },
  tableBody: {
    display: 'flex',
    flexDirection: 'column',
  },
  tableRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 220px',
    gap: '16px',
    padding: '16px',
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    alignItems: 'center',
    '&:last-child': {
      borderBottom: 'none',
    },
    '&:hover': {
      backgroundColor: theme.palette.surfaceSubtle,
    },
  },
  cycleLabel: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },
  inputCell: {
    display: 'flex',
    alignItems: 'center',
  },
  discountInput: {
    width: '100%',
    '& .MuiInputBase-root': {
      backgroundColor: theme.palette.surfaceDefault,
    },
    '& .MuiInputBase-input': {
      textAlign: 'right',
      paddingRight: '4px',
    },
    '& input[type=number]': {
      MozAppearance: 'textfield',
    },
    '& input[type=number]::-webkit-outer-spin-button': {
      WebkitAppearance: 'none',
      margin: 0,
    },
    '& input[type=number]::-webkit-inner-spin-button': {
      WebkitAppearance: 'none',
      margin: 0,
    },
  },
  percentSymbol: {
    '&.MuiTypography-root': {
      color: theme.palette.textPlaceholder,
    },
  },
  footer: {
    borderTop: `1px solid ${theme.palette.borderSubtle1}`,
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    padding: '12px 0 0 0',
    marginTop: '24px',
  },
}));
