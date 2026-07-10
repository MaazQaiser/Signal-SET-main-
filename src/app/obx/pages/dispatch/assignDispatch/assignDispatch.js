import { makeStyles } from '@mui/styles';
export const useStyles = makeStyles((theme) => ({
  assignDispatchWrap: {
    display: 'flex',
    flex: '1',
    overflow: 'auto',
  },
  assignDispatchLeft: {
    display: 'flex',
    overflow: 'auto',
    flex: '1',
    flexDirection: 'column',
    borderRight: `1px solid ${theme.palette.borderSubtle1}`,
    paddingLeft: '1px',
  },
  assignDispatchRight: {
    display: 'flex',
    flex: '1',
    overflow: 'auto',
    flexDirection: 'column',
  },
  mapArea: {
    backgroundColor: '#f9f5ed',
    width: '100%',
    height: '500px',
  },
  assignDispatchHeading: {
    padding: '24px 32px 16px 32px',
    [theme.breakpoints.down('lg')]: {
      padding: '16px 24px 16px 24px',
    },
  },
  bottomButtons: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    padding: '7px 20px',
    borderTop: `1px solid ${theme.palette.borderSubtle1}`,
  },
}));
