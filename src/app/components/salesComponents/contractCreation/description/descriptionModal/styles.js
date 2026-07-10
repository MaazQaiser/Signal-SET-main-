import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  notesModalContainer: {
    display: 'block',
  },
  popStyle: {
    height: '650px',
    width: open ? 'calc(100vw - 20vw)' : '0px',
    borderRadius: '12px',
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: open
      ? 'translate(-50%, -50%) scale(1)  !important'
      : 'translate(-50%, -50%) scale(0) !important',
    transition: 'width 1.5s ease-in-out, transform 1.5s ease-in',
    padding: '0',
    background: theme.palette.surfaceWhite,
    boxShadow: '0px 8px 8px -4px rgba(16, 24, 40, 0.04), 0px 20px 24px -4px rgba(16, 24, 40, 0.1)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    outline: 'none',
    '&:focus': {
      outline: 'none',
    },
    '&:focus-visible': {
      outline: 'none',
    },
  },
  editorCustomHeight: {
    height: '500px',
    overflow: 'auto',
    borderRadius: '0 !important',
    '&::-webkit-scrollbar': {
      width: '4px',
    },
    '&::-webkit-scrollbar-track': {
      background: '#f1f1f1',
      borderRadius: '4px',
    },
    '&::-webkit-scrollbar-thumb': {
      background: '#c1c1c1',
      borderRadius: '4px',
      '&:hover': {
        background: '#a8a8a8',
      },
    },
  },

  richTextEditor: {
    marginTop: '22px',
  },
  wrapperClass: {
    borderRadius: '8px',
    border: `1px solid ${theme.palette.borderSubtle1}`,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'auto',
    flex: 1,
    background: 'red !important',
  },
  editorClass: {
    backgroundColor: theme.palette.surfaceWhite,
    minHeight: '155px',
    maxHeight: '155px',
    padding: '10px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    color: theme.palette.textPrimary,
  },

  toolbarClass: {
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    borderRadius: '8px 8px 0 0',
    // backgroundColor: theme.palette.surfaceGreySubtle,
    padding: '10px 8px',
    marginBottom: 0,
    background: 'red !important',
  },

  richTextBox: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflow: 'auto',
  },
  stepperHeadding: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    '&.MuiTypography-root': {
      marginBottom: '12px',
      color: theme.palette.textPrimary,
    },
    '&.svg': {
      marginBottom: '12px',
      color: theme.palette.textPrimary,
    },
  },
  descriptionTextArea: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1',
    overflow: 'hidden',
    height: '100%',
  },
  singleDescription: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1',
    overflow: 'hidden',
    marginBottom: '24px',
  },

  descriptionText: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1',
    overflow: 'hidden',
    paddingBottom: '4px',
    height: '100%',
  },

  descriptionDropdown: {
    maxWidth: '370px',
    marginBottom: '16px',
  },
  descriptionWrapper: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1',
    overflow: 'auto',
    gap: '16px',
    paddingTop: '24px',
  },
  bannerImageDetailTitle: {
    color: `${theme.palette.textPrimary} `,
  },
  dragText: {
    '&.MuiTypography-root': {
      color: `${theme.palette.textPlaceholder} `,
    },
  },
  dragTextBelow: {
    '&.MuiTypography-body3': {
      display: 'block',
      color: `${theme.palette.textPlaceholder} `,
      marginTop: '4px',
      fontSize: '12px ',
    },
  },
  boldText: {
    '&.MuiTypography-subtitle2': {
      color: `${theme.palette.textPrimary} `,
      fontWeight: '500 ',
    },
  },
  formBoxImage: {
    display: 'flex',
    flexDirection: 'row',
    gap: '20px',
  },
  paperWrapper: {
    flex: '1',
    width: '100%',
    padding: '16px 24px',
    textAlign: 'center',
    cursor: 'pointer',
    border: `1px solid ${theme.palette.borderSubtle1} `,
    boxShadow: 'none !important',
    borderRadius: '8px ',
  },
  inputFileWrapper: {
    position: 'relative',
    padding: '0 ',
    height: 'unset ',
  },
  uploadBtn: {
    display: 'flex',
    gap: '6px',
    justifyContent: 'center',
    marginTop: '12px',
  },
  customFileInput: {
    position: 'absolute',
    top: '0',
    left: '0',
    height: '100%',
    width: '100%',
    opacity: '0',
    padding: '0 !important',
    cursor: 'pointer',
  },
  trashIconBox: {
    cursor: 'pointer',
    lineHeight: 1,
  },
  bannerImageDetail: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  toolTipBox: {
    cursor: 'pointer',
    width: 'fit-content',
  },
  icon: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    justifyContent: 'flex-end',
    position: 'absolute',
    top: '8px',
    right: '-8px',
  },
}));
