import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  detailsnWrapper: {
    padding: '0px  24px',
    display: 'flex',
    flex: '1 1',
    overflow: 'auto',
    flexDirection: 'column',
    backgroundColor: '#ffffff',
  },
  paddingRight: {
    paddingRight: '24px',
  },
  detailsSplitWrapper: {
    display: 'flex',
    flex: '1 1',
    overflow: 'auto',
  },
  leftSideArea: {
    display: 'flex',
    flex: '1 1',
    overflow: 'auto',
    flexDirection: 'column',
    flexBasis: '30%',
    padding: '24px 32px 24px 0px',
    borderRight: `1px solid ${theme.palette.borderSubtle1}`,
    [theme.breakpoints.down('lg')]: {
      padding: '24px 24px 24px 0px',
      flexBasis: '35%',
    },
  },
  rightSideArea: {
    flexBasis: '70%',
    display: 'flex',
    flex: '1 1',
    overflow: 'auto',
    flexDirection: 'column',
    [theme.breakpoints.down('lg')]: {
      flexBasis: '65%',
    },
  },

  rightInnerWrapper: {
    padding: '24px 0px 24px 32px',
    display: 'flex',
    flex: '1 1',
    overflow: 'auto',
    flexDirection: 'column',
    [theme.breakpoints.down('lg')]: {
      padding: '24px 0px 24px 24px',
    },
  },
  rightTopWrapper: {
    padding: '20px 0px 20px 32px',
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    [theme.breakpoints.down('lg')]: {
      padding: '20px 0px 20px 24px',
    },
  },
  overHeadr: {
    marginBottom: '12px',
    height: '36px',
    display: 'flex',
    alignItems: 'self-start',
    justifyContent: 'space-between',
  },
  overHeading: {
    color: '#262527',
    fontSize: '20px',
    fontStyle: 'normal',
    fontWeight: '700',
    lineHeight: '24px',
  },
  title: {
    color: theme.palette.textPrimary,
    fontSize: '22px',
    fontStyle: 'normal',
    fontWeight: '700',
    lineHeight: '28px',
  },
  addressDetails: {
    '&.MuiTypography-root': {
      color: theme.palette.textPlaceholder,
      fontSize: '14px',
      fontStyle: 'normal',
      fontWeight: '400',
      lineHeight: '20px',
      marginTop: '8px',
    },
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
  dropdwonWrapper: {
    borderTop: '1px solid #E6E6E7',
    borderBottom: '1px solid #E6E6E7',
    padding: '20px 0px',
    marginBottom: '20px',
  },
  locationDetailSkeletonWrapper: {
    display: 'flex',
    flexDirection: 'column',
  },
  accordionSkeleton: {
    '& .MuiPaper-root ': {
      borderBottom: `none`,
      '& .MuiAccordionSummary-root': {
        paddingLeft: 0,
        paddingRight: 0,
      },
    },
    '&.MuiSkeleton-root': {
      borderRadius: '8px !important',
    },
  },
  chipWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginTop: '8px',
    flexWrap: 'wrap',
  },
}));
