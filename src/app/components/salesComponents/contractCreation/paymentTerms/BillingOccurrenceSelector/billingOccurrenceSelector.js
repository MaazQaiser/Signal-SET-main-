import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  title: {
    '&.MuiTypography-root': {
      marginBottom: '0',
    },
  },
  contractDuration: {
    '&.MuiTypography-root': {
      fontSize: '14px',
      fontWeight: '400',
      color: theme.palette.textSecondary,
    },
  },
  optionsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    columnGap: '12px',
    rowGap: '12px',
    width: '100%',
    [theme.breakpoints.down('lg')]: {
      gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    },
    [theme.breakpoints.down('sm')]: {
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    },
  },
  optionCard: {
    width: '100%',
    border: `1px solid ${theme.palette.borderSubtle1}`,
    borderRadius: '8px',
    padding: '10px 14px',
    cursor: 'pointer',
    transition: 'all 0.2s ease-in-out',
    position: 'relative',
    backgroundColor: theme.palette.surfaceWhite,
    '&:hover': {
      borderColor: theme.palette.borderBrand,
      backgroundColor: theme.palette.surfaceWhite,
    },
    [theme.breakpoints.down('md')]: {
      flex: '1 1 100%',
    },
  },
  optionCardSelected: {
    borderColor: theme.palette.borderBrand,
    backgroundColor: theme.palette.surfaceBrandSubtle,
    '&:hover': {
      backgroundColor: theme.palette.surfaceBrandSubtle,
    },
    '& $currentPrice': {
      '&.MuiTypography-root': {
        color: theme.palette.textBrand,
      },
    },
    '& $discountBadge': {
      '&.MuiBox-root': {
        backgroundColor: theme.palette.surfaceBrand,
        color: theme.palette.surfaceWhite,
      },
    },
  },
  optionCardDisabled: {
    cursor: 'not-allowed',
    opacity: 0.5,
    '&:hover': {
      borderColor: theme.palette.borderSubtle1,
      backgroundColor: theme.palette.surfaceWhite,
    },
  },
  radioControl: {
    display: 'flex',
    alignItems: 'center',
    '& .MuiRadio-root': {
      padding: '0 12px 0 0',
    },
    '& .MuiFormControlLabel-root': {
      marginRight: '0',
      '& .MuiTypography-root': {
        fontSize: '16px',
        fontWeight: '700',
        color: theme.palette.textPrimary,
      },
    },
    ' & input': {
      position: 'relative',
      width: '8px',
    },
  },
  planDetails: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  discountBadge: {
    '&.MuiBox-root ': {
      backgroundColor: theme.palette.surfaceSuccessSubtle,
      color: theme.palette.textSuccess,
      padding: '2px 8px',
      borderRadius: '16px',
      fontSize: '12px',
      fontWeight: '600',
    },
  },
  priceContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0px',
    marginLeft: '32px',
  },
  originalPrice: {
    '&.MuiTypography-root': {
      fontSize: '12px',
      fontWeight: '500',
      color: theme.palette.textPlaceholder,
      textDecoration: 'line-through',
      marginRight: '8px',
    },
  },
  currentPrice: {
    '&.MuiTypography-root': {
      fontSize: '12px',
      fontWeight: '700',
      color: theme.palette.textPlaceholder,
    },
  },
}));
