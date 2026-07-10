import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles(() => ({
  stageModal: {
    maxWidth: '400px',
    margin: '0 auto',
    width: '100%',

    '& .MuiPaper-root.MuiPaper-elevation': {
      overflow: 'visible',
      borderRadius: '12px',
      minWidth: '500px',
    },
  },
  modalTopArea: {
    padding: '24px',
    borderRadius: '12px',
  },
  modalHeading: {
    '&.MuiTypography-root': {
      color: '#262527',
      fontSize: '20px',
      fontStyle: 'normal',
      fontWeight: '700',
      lineHeight: '20px',
    },
  },
  modalTextBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  modalText: {
    '&.MuiTypography-root': {
      color: '#5B5B5F',
      fontSize: '12px',
      fontStyle: 'normal',
      fontWeight: '400',
      lineHeight: '18px',
    },
  },
  modalTextUpper: {
    '&.MuiTypography-root': {
      paddingTop: '4px',
      color: '#6A6A70',
      fontSize: '14px',
      fontStyle: 'normal',
      fontWeight: '400',
      lineHeight: '20px',
      marginRight: '2px',
    },
  },
  modalTextBlue: {
    '&.MuiTypography-root': {
      color: '#146DFF',
      fontSize: '14px',
      fontStyle: 'normal',
      fontWeight: '400',
      lineHeight: '18px',
      // paddingLeft: '10px',
    },
  },
  inlineBoxIcons: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  arrowIcons: {
    margin: '0px 12px',
    '& path': {
      stroke: '#000000',
    },
  },
  modalBottomArea: {
    padding: ' 0 24px 24px 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '12px',
    '& button.MuiButtonBase-root': {
      width: 'fit-content',
    },
  },
  stageDropdwon: {
    marginTop: '16px',
  },
  spaceBelow: {
    '&.MuiTypography-root': {
      marginBottom: '8px',
    },
  },
  modalTypoBox: {
    display: 'flex',
    gap: '4px',
    marginTop: '16px',
  },
  stagesStepperSkeletonWrapper: {
    display: 'flex',
    gap: 10,
    width: '100%',
  },
  barSkeleton: {
    '&.MuiSkeleton-root': {
      borderRadius: '8px !important',
    },
  },
}));
