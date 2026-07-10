import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  accordianCards: {
    marginTop: 4,
    '&:not(:last-child)': {
      marginBottom: 16,
    },
  },
  accBox: {
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  cardText: {
    marginLeft: '8px',
    '& a': {
      color: theme.palette.textSecondary3,
      fontSize: 14,
      fontStyle: 'normal',
      fontWeight: 400,
      lineHeight: '20px',
      textAlign: 'left',
      textDecoration: 'none',
    },
  },
  subHeading: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary3,
    },
  },
  heading: {
    '&.MuiTypography-root': {
      marginBottom: '4px',
    },
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
    background: '#fafafa',
  },
  questionsColor: {
    color: '#DC6803',
    background: '#FFFAEB',
  },
  proposalsColor: {
    color: '#146DFF',
    background: '#E5F6FF',
  },
  lostColor: {
    color: theme.palette.surfaceAlertHover,
    background: theme.palette.surfaceAlertSubtle,
  },
  closedcolor: {
    color: '#FFA31C',
    background: '#FDF7EE',
  },
  closedWoncolor: {
    color: '#2E964B',
    background: '#EFF8EF',
  },
  negotiationColor: {
    color: '#9747FF',
    background: '#F4EDFD',
  },
  terminated: {
    backgroundColor: '#FEF0C7',
    color: '#F4780B',
  },
}));
