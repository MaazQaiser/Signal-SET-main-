import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  createTemplateDivider: {
    '&.MuiDivider-root': {
      display: 'block',
      margin: '16px 0',
      borderColor: theme.palette.borderSubtle1,
    },
  },

  createTemplateHeader: {
    marginTop: '24px',
  },

  infoWrapper: {
    maxWidth: '860px',
    width: '100%',
    margin: '0px auto',

    [theme.breakpoints.down('lg')]: {
      paddingLeft: '24px',
      paddingRight: '24px',
    },
  },

  lowerWrap: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    padding: '7px 32px',
    borderTop: `1px solid ${theme.palette.borderSubtle1}`,
  },

  siteDetaisFields: {
    display: 'flex',
    columnGap: '32px',
    margin: '16px 0px 0px 0px',
    flexWrap: 'wrap',
  },

  fieldWrapper: {
    flex: '1 1 48%',
    marginBottom: '24px',
  },

  fieldWrapperNew: {
    width: '48%',
  },

  onecols: {
    flex: '0 0 25%',
  },

  dropdownWrap: {
    height: '44px !important',
  },

  noMarginBottom: {
    marginBottom: '0px',
  },

  buttonGroupUpper: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'space-between',
    paddingTop: '24px',
    paddingBottom: '16px',
  },

  buttonGroup: {
    display: 'flex',
    gap: '12px',
  },

  invalidFeedback: {
    fontSize: '14px',
    lineHeight: '20px',
    fontWeight: '400',
    margin: 0,
    marginTop: '6px',
    color: theme.palette.textAlert,
    textShadow: '0px 0px 0px #F4EBFF, 0px 1px 2px rgba(16, 24, 40, 0.05)',
  },

  siteDetais: {
    marginTop: '20px',
  },

  zonesDivider: {
    '&.MuiDivider-root': {
      borderColor: theme.palette.borderSubtle1,
    },
  },
}));
