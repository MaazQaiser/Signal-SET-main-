import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  leftSideBar: {
    padding: '24px 32px 24px 32px ',
    borderRight: `1px solid ${theme.palette.borderSubtle1}`,
    flex: '0 0 30%',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'auto',
    [theme.breakpoints.down('lg')]: {
      padding: '24px 24px 24px  24px',
      flex: '0 0 35%',
    },
  },
  skeletonWrapper: {
    paddingRight: '24px',
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
}));
