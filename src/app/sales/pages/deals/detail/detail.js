import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  detailsnWrapper: {
    padding: '0px 24px',
    display: 'flex',
    flex: '1 1',
    overflow: 'auto',
    flexDirection: 'column',
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
    display: 'flex',
    flex: '1 1',
    overflow: 'auto',
    flexDirection: 'column',
    flexBasis: '70%',
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
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '12px',
    height: '36px',
  },
  overHeading: {
    color: '#262527',
    fontSize: '20px',
    fontStyle: 'normal',
    fontWeight: '700',
    lineHeight: '24px',
  },

  title: {
    '&.MuiTypography-root': {
      color: `${theme.palette.textPrimary}`,
      lineHeight: '30px',
    },
  },
  locationAddress: {
    marginBottom: '20px',
  },
  addressDetails: {
    '&.MuiTypography-root': {
      color: `${theme.palette.textPlaceholder}`,
      marginTop: '8px',
    },
  },
  statesButtonsWrap: {
    margin: '0px 0px 20px 0',
  },
  statesButtons: {
    backgroundColor: `${theme.palette.surfaceGreySubtle}`,
  },
  gropBtn: {
    '&.MuiButtonBase-root': {
      color: `${theme.palette.surfaceGreyStrong2}`,
      fontSize: '14px',
      fontStyle: 'normal',
      fontWeight: '500',
      lineHeight: '20px',
      padding: '6px 12px',
    },
  },
  firstButton: {
    borderRadius: '6px 0px 0px 6px !important',
  },
  middleBtn: {
    borderRadius: '0px !important',
    borderLeft: 0,
  },
  centerBtn: {
    borderRadius: '0px 6px 6px 0px !important',
  },
  dropdwonWrapper: {
    borderTop: `1px solid ${theme.palette.borderSubtle1}`,
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    padding: '20px 0px',
    marginBottom: '20px',
  },
  gradeColor: {
    color: `${theme.palette.textSuccess}`,
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

  followUpContent: {
    marginBottom: '16px',
  },
}));
