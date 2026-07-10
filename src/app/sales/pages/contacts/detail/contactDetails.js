import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  leftSideBar: {
    padding: '24px 32px !important',
    borderRight: `1px solid ${theme.palette.borderSubtle1}`,
    flex: '0 0 30%',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'auto',
    [theme.breakpoints.down('lg')]: {
      padding: '24px 24px ',
      flex: '0 0 35%',
    },
  },
  companiesArea: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1 1',
    overflow: 'auto',
  },
  companiesGrid: {
    height: '100%',
    display: 'flex',
    flex: '1 1',
    overflow: 'auto',
  },
  rightArea: {
    padding: '24px 32px',
    flex: '0 0 70%',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'auto',
    [theme.breakpoints.down('lg')]: {
      padding: '24px 24px ',
      flex: '0 0 65%',
    },
  },
  overHeadr: {
    marginBottom: '12px',
    height: '36px',
    display: 'flex',
    flexDirection: 'row !important',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    spacing: '0',
  },
  salesAccordionSkeleton: {
    display: 'flex',
    flexDirection: 'column',
    gap: '30px',
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
  lastButton: {
    borderRadius: '6px !important',
    marginLeft: '0px !important',
    border: `1px solid ${theme.palette.borderSubtle1} !important`,
  },
}));
