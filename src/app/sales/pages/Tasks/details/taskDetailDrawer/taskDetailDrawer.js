import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  siderbarbox: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflow: 'auto',
  },
  boxinner: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflow: 'auto',
    padding: '24px',
  },
  sideheader: {
    display: 'block',
    padding: '24px 24px 0 24px',
    '& .MuiBox-root': {
      marginBottom: 0,
      paddingRight: 0,
    },
  },
  newLocationDrawerHeader: {
    paddingRight: '8px',
  },
  locationForm: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflow: 'auto',
    padding: '0 32px 20px 32px',
  },
  fieldWrapper: {
    width: '100%',
  },
  dropHigh: {
    height: '44px',
  },
  placeHolderText: {
    fontSize: '16px !important',
    fontWeight: '400 !important',
    color: theme.palette.textPlaceholderField,
  },
  sideDrawerFooter: {
    paddingLeft: '32px',
    paddingRight: '32px',
    marginTop: 0,
  },
  Input: {
    marginBottom: '20px',
  },
  taskist: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  taskistlabel: {
    marginBottom: '8px',
    '&.MuiInputLabel-root': {
      width: '150px',
    },
  },
  taskistText: {
    '&.MuiTypography-root': {
      color: theme.palette.text.primary,
      fontSize: '14px',
      fontStyle: 'normal',
      fontWeight: '400',
      lineHeight: '24px',
      letterSpacing: '0.25px',
    },
  },

  typeChip: {
    display: 'inline-flex',
    padding: '4px 12px',
    alignItems: 'center',
    gap: '8px',
    borderRadius: '16px',
    fontSize: '14px',
    '& .MuiSvgIcon-root': {
      width: '16px',
      height: '16px',
    },
    '&.todo': {
      backgroundColor: '#FEF0C7',
      color: '#F4780B',
      '& svg path': {
        stroke: '#F4780B',
      },
    },
    '&.email': {
      backgroundColor: '#EFF8EF',
      color: '#2E964B',
      '& svg path': {
        stroke: '#2E964B',
      },
    },
    '&.call': {
      backgroundColor: '#E5F6FF',
      color: '#146DFF',
      '& svg path': {
        stroke: '#146DFF',
      },
    },
  },
  priorityText: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    textTransform: 'capitalize',
  },
  priorityDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    display: 'inline-block',
    marginRight: '8px',
    '&.high': {
      backgroundColor: theme.palette.error.main,
    },
    '&.medium': {
      backgroundColor: theme.palette.warning.main,
    },
    '&.low': {
      backgroundColor: '#146DFF',
    },
  },
  taskDescription: {
    marginTop: '16px',
  },
  taskistWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    borderRadius: '4px',
    background: '#F5F5F6',
    padding: '16px',
    marginBottom: '16px',
  },
  description: {
    '&.MuiBox-root ': {
      color: theme.palette.text.primary,
      fontSize: '14px',
      fontStyle: 'normal',
      fontWeight: '400',
      lineHeight: '24px',
      letterSpacing: '0.25px',
    },
  },
  boxHeader: {
    margin: '0px 0px 16px 0px',
  },

  titleHead: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',

    '& svg': {
      '& path': {
        fill: theme.palette.textPrimary,
      },
    },
  },

  sideTitle: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
      marginBottom: '0',
      textTransform: 'capitalize',
    },
  },

  bulkSubHeading: {
    '&.MuiTypography-root': {
      color: theme.palette.textPlaceholder,
    },
  },
  menuItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    '& svg': {
      width: '16px',
      height: '16px',
    },
  },
  menuIcon: {
    '& path': {
      stroke: theme.palette.text.primary,
    },
  },
}));
