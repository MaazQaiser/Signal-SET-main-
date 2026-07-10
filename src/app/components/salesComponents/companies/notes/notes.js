import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  activityCards: {
    gap: '0px',
    width: '100%',
    display: 'flex',
    marginTop: '20px',
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  notesTextCol: {
    flexBasis: '80%',
    textAlign: 'left',
    display: 'flex',
    alignItems: 'flex-start',
  },
  cals: {
    marginRight: '16px',
  },
  notesDetails: {
    '& ul, & ol': {
      paddingLeft: '21px',
      color: theme.palette.textSecondary3,
      fontSize: '14px',
    },
    '& p': {
      color: theme.palette.textSecondary3,
      fontSize: '14px',
    },
  },
  descriptionText: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
      paddingLeft: '0px !important',
    },
  },
  activityDetails: {
    textAlign: 'left',
  },
  notesBtns: {
    textAlign: 'right',
    display: 'flex',
    alignItems: 'baseline',
  },
  deleteBtn: {
    '&.MuiButtonBase-root': {
      color: `${theme.palette.textAlert} !important`,
    },
    '& svg': {
      marginRight: '8px',
    },
  },
  editBtn: {
    '& svg': {
      marginRight: '8px',
    },
  },
  seeMore: {
    cursor: 'pointer',
    color: theme.palette.textBrand,
    fontSize: '14px',
    fontStyle: 'normal',
    fontWeight: '400',
    lineHeight: '20px',
  },
  notesTime: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary3,
    },
  },
}));
