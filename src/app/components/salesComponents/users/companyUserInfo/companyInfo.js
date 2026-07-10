import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  companyDetails: {
    '& .MuiPaper-root.MuiPaper-elevation': {
      boxShadow: 'none',
    },
    '& .companyTable': {
      '& td.MuiTableCell-root': {
        border: 0,
        padding: '8px 0px',
        color: theme.palette.textPlaceholder,
        fontFamily: '$fontInterBase',
        fontSize: '14px',
        fontStyle: 'normal',
        fontWeight: 400,
        lineHeight: '20px',
        textTransform: 'capitalize',
        paddingBottom: 0,
      },
    },
  },
  companyAvatar: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  },
  companyDetailsWrapper: {
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    paddingBottom: '24px',
    marginBottom: '12px',
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    gap: '8px',
    flexDirection: 'column',
  },
  companyLogo: {
    width: '51px',
    height: '51px',
  },
  companyTableWrapper: {
    marginBottom: '30px',
    paddingBottom: '12px',
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    gap: '16px',
  },
  companyFlex: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'flex-end',
    gap: '4px',
    justifyContent: 'space-between',
    '&:first-child': {
      '& .MuiBox-root': {
        padding: '0px 0px 0px 0px !important',
      },
    },
  },
  companyLabel: {
    '&.MuiTypography-root': {
      color: theme.palette.textPlaceholder,
      textTransform: 'capitalize',
      minWidth: '140px',
    },
  },
  companyDetName: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },
  linkBtn: {
    display: 'flex',
    justifyContent: 'flex-start',
    color: 'theme.palette.textPlaceholder !important',
  },
  cardText: {
    '& a': {
      marginTop: '8px',
      color: theme.palette.textSecondary3,
      fontSize: 14,
      fontStyle: 'normal',
      fontWeight: 400,
      lineHeight: '20px',
      textAlign: 'left',
      textDecoration: 'none',
    },
  },
  cardAvatar: {
    width: '51px',
    height: '51px',
  },
  compnayLogo: {
    width: '51px !important',
    height: '51px !important',
  },
  companyInfotext: {
    '&.MuiTypography-root': {
      color: theme.palette.textPlaceholder,
    },
  },
}));
