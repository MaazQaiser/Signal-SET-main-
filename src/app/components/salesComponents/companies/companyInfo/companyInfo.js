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
  userImage: {
    height: '48px',
    width: '100%',
  },

  companyDetailsWrapper: {
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    marginBottom: '12px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    gap: '8px',
  },
  companyHeaderDetails: {
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    gap: '8px',
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
      textTransform: 'capitalize',
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
  statesButtonsWrap: {
    margin: '20px 0px',
  },
  statesButtons: {
    backgroundColor: '#F5F5F6',
    borderRadius: '6px !important',
  },
  gropBtn: {
    '&.MuiButtonBase-root': {
      color: '#262527',
      fontSize: '14px',
      fontStyle: 'normal',
      fontWeight: '500',
      lineHeight: '20px',
      padding: '6px 12px',
    },
  },
  firstButton: {
    borderRadius: '6px 0px 0px 6px',
  },
}));
