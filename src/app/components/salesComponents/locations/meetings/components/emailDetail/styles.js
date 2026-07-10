import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  container: {
    padding: '20px',
    backgroundColor: theme.palette.background.paper,
    borderRadius: '8px',
    position: 'relative',
    maxWidth: '100%',
    display: 'flex',
    flexDirection: 'column',
    // overflow: 'hidden',
  },
  header: {
    padding: '20px 20px 0',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    justifyContent: 'space-between',
    position: 'sticky',
    top: 0,
    backgroundColor: theme.palette.background.paper,
    zIndex: 1100,
  },
  subject: {
    '&.MuiTypography-root': {
      color: '#262527',
      fontFamily: 'Inter',
      fontSize: '20px',
      fontStyle: 'normal',
      fontWeight: 500,
      lineHeight: 'normal',
    },
  },
  deleteButton: {
    marginLeft: 'auto',
  },
  accordion: {
    boxShadow: 'none',
    borderBottom: '1px solid #EAECF0',
    transition: 'all 0.3s ease-in-out',
    '&:before': {
      display: 'none',
    },
    '&.Mui-expanded': {
      margin: 0,
    },
  },
  accordionSummary: {
    minHeight: 'unset',
    transition: 'all 0.3s ease-in-out',
    '&.Mui-expanded': {
      minHeight: 'unset !important',
    },
    '& .MuiAccordionSummary-content': {
      padding: '16px 0',
      margin: 0,
      transition: 'all 0.3s ease-in-out',
      width: '100%',
    },
  },
  userInfoContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    flex: 1,
    minWidth: 0,
    transition: 'all 0.3s ease-in-out',
  },
  avatar: {
    '&.MuiAvatar-root': {
      padding: '4px !important',
      width: '44px',
      height: '44px',
      backgroundColor: '#E5F6FF',
      color: '#146DFF',
      fontSize: '16px',
      fontWeight: 500,
      transition: 'all 0.3s ease-in-out',
    },
  },
  userDetailsContainer: {
    flex: 1,
    overflow: 'hidden',
    transition: 'all 0.3s ease-in-out',
  },
  userDetails: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    '&.MuiTypography-root': {
      fontSize: '14px',
      lineHeight: '20px',
      fontWeight: 500,
      color: '#101828',
      marginBottom: '2px',
      transition: 'all 0.3s ease-in-out',
    },
  },
  emailAddress: {
    color: '#475467',
    opacity: 0,
    transition: 'opacity 0.3s ease-in-out',
    '&.MuiTypography-root': {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      fontFamily: 'Inter',
      fontSize: '14px',
      fontStyle: 'normal',
      fontWeight: 400,
      lineHeight: '20px',
      color: '#5B5B5F',
      opacity: 0,
      transition: 'opacity 0.3s ease-in-out',
      '.Mui-expanded &': {
        opacity: 1,
      },
    },
  },
  recipients: {
    '&.MuiTypography-root': {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      fontFamily: 'Inter',
      fontSize: '14px',
      fontStyle: 'normal',
      fontWeight: 400,
      lineHeight: '20px',
      color: '#5B5B5F',
      opacity: 0,
      height: 0,
      '.Mui-expanded &': {
        opacity: 1,
        height: '20px',
      },
    },
  },
  previewText: {
    '&.MuiTypography-root': {
      color: '#5B5B5F',
      fontSize: '14px',
      lineHeight: '20px',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      transition: 'all 0.3s ease-in-out',
      opacity: 1,
      height: '20px',
      '.Mui-expanded &': {
        opacity: 0,
        height: 0,
      },
    },
  },
  timestamp: {
    '&.MuiTypography-root': {
      color: '#86868B',
      whiteSpace: 'nowrap',
      marginRight: '4px',
    },
  },

  messageContent: {
    padding: '0 0 16px 52px',
    transition: 'all 0.3s ease-in-out',
  },
  message: {
    '&.MuiTypography-root': {
      fontSize: '14px',
      lineHeight: '20px',
      color: '#262527',
      whiteSpace: 'pre-line',
      transition: 'all 0.3s ease-in-out',
    },
  },
  wrapper: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    width: '100%',
  },
  topUser: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
  },
  actionContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  menuButton: {
    padding: '4px',
    '&:hover': {
      backgroundColor: 'rgba(0, 0, 0, 0.04)',
    },
  },
  menuItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    minWidth: '160px',
    '&:hover': {
      backgroundColor: '#F9FAFB',
    },
  },
  deleteMenuItem: {
    display: 'flex',
    padding: '6px 16px',
    color: '#F04438',
    '&:hover': {
      backgroundColor: '#FEF3F2',
    },
  },
  menuIcon: {
    width: '20px',
    height: '20px',
    color: '#475467',
  },
  menu: {
    padding: 0,
    '& .MuiPaper-root': {
      padding: 0,
    },
  },
  emailDetailContainer: {
    padding: '20px',
    backgroundColor: theme.palette.background.paper,
    borderRadius: '8px',
  },
  cursor: {
    cursor: 'pointer',
  },
  replyButtonsContainer: {
    display: 'flex',
    justifyContent: 'flex-start',
    padding: '16px 0',
    gap: '16px',
    marginTop: '16px',
  },
  emailThreadContainer: {
    flex: 1,
    overflow: 'auto',
    padding: '20px',
    paddingBottom: (props) => (props.showReplyBox ? '280px' : '20px'),
  },
  replyContainer: {
    // position: 'fixed',
    bottom: 0,
    right: 0,
    padding: '24px 0px !important',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    backgroundColor: '#fff',
    zIndex: 1200,
    width: '100%',
  },
  replyBoxContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: '8px',
    border: '1px solid #EAECF0',
    boxShadow: '0px 1px 3px rgba(16, 24, 40, 0.1), 0px 1px 2px rgba(16, 24, 40, 0.06)',
  },
  replyHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    padding: '12px 16px 0 16px !important',
    gap: '12px',
    justifyContent: 'space-between',
  },
  replyAvatar: {
    width: '44px !important',
    height: '44px !important',
    backgroundColor: '#E6EBF6 !important',
    color: '#0032A0 !important',
    fontSize: '14px !important',
    fontWeight: '500 !important',
    padding: '4px !important',
  },
  replyTo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flex: 1,
  },
  replyToLabel: {
    color: '#6A6A70',
    fontSize: '14px',
    fontStyle: 'normal',
    fontWeight: 400,
    lineHeight: '20px',
  },
  replyToText: {
    color: '#262527',
    fontSize: '14px',
    fontStyle: 'normal',
    fontWeight: 600,
    lineHeight: '20px',
  },
  closeButton: {
    color: '#98A2B3',
    fontSize: '24px',
    padding: '0 !important',
    lineHeight: '1',
    '& svg': {
      width: '16px !important',
      height: '16px !important',
    },
    '&:hover': {
      backgroundColor: '#F9FAFB',
    },
  },
  replyTextField: {
    '& .rdw-editor-wrapper': {
      display: 'flex',
      flexDirection: 'column-reverse',
      border: 'none',
    },
    '& .rdw-inline-wrapper': {
      gap: '8px',
    },
    '& .rdw-list-wrapper': {
      gap: '8px',
    },
    '& .rdw-dropdownoption-active': {
      background: '#f5f5f6',
    },
    '& .rdw-editor-toolbar': {
      background: theme.palette.surfaceWhite,
      borderBottom: 'none',
      padding: '0',
      margin: 0,
      display: 'flex',
      gap: '8px',
      alignItems: 'center',
      position: 'absolute',
      bottom: '38px',
      left: '193px',
      border: 'none !important',
      '& .rdw-option-wrapper': {
        border: 'none',
        background: '#f5f5f6',
        margin: 0,
        padding: '8px',
        minWidth: 'auto',
        opacity: 0.7,
        lineHeight: 1,
        height: 36,
        width: 36,
        '& img': {
          height: 16,
          width: 16,
        },
        '&:hover': {
          boxShadow: 'none',
          background: '#F9FAFB',
        },
      },
      '& .rdw-option-active': {
        background: 'transparent',
        boxShadow: 'none',
        border: '1px solid #ebecf0',
      },
    },
    '& .rdw-editor-main': {
      minHeight: '120px',
      maxHeight: '120px',
      padding: '16px',
      overflow: 'auto',
      fontSize: '14px',
      lineHeight: '20px',
      color: '#101828',
      '&:focus': {
        outline: 'none',
      },
      '& .public-DraftEditorPlaceholder-root': {
        color: '#98A2B3',
      },
    },
  },
  replyFooter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px !important',
    // borderTop: '1px solid #EAECF0',
  },
  attachmentOptions: {
    display: 'flex',
    gap: '8px',
    '& .MuiButtonBase-root': {
      borderRadius: '8px !important',
      padding: '8px !important',
      '&:hover': {
        backgroundColor: '#F9FAFB !important',
      },
    },
  },
  attachButton: {
    padding: '8px',
    '&:hover': {
      backgroundColor: '#F9FAFB',
    },
  },
  sendButton: {
    '&.MuiButton-contained': {
      backgroundColor: '#0032A0',
      color: '#FFFFFF',
      padding: '8px 16px',
      borderRadius: '8px',
      textTransform: 'none',
      fontSize: '14px',
      fontWeight: 500,
      '&:hover': {
        backgroundColor: '#002375',
      },
      '&.Mui-disabled': {
        backgroundColor: '#E6EBF6',
        color: '#98A2B3',
      },
    },
  },
  activityBarSkeleton: {
    marginTop: '16px',
  },

  ccBccContainer: {
    display: 'flex',
    gap: '8px',
    justifyContent: 'flex-end',

    '& .MuiButton-root': {
      padding: '0',
      minWidth: '0',
      color: '#5B5B5F',
      fontSize: '14px',
      lineHeight: '20px',
      fontWeight: 500,
      fontFamily: 'Inter',
      textTransform: 'none',
      letterSpacing: 'normal',
      '&:hover': {
        backgroundColor: 'transparent',
        textDecoration: 'underline',
      },
    },
  },
  ccInput: {
    width: '100%',
    border: 'none',
    margin: 0,
    '& .MuiInputBase-input': {
      padding: '4px 8px',
      fontSize: '12px',
      lineHeight: '20px',
      '&::placeholder': {
        fontSize: '12px',
        lineHeight: '20px',
        fontFamily: 'Inter',
        color: '#98A2B3',
        opacity: 1,
      },
      '&:focus': {
        outline: 'none',
      },
    },
    '& .MuiOutlinedInput-root': {
      border: 'none',
      '&:hover .MuiOutlinedInput-notchedOutline': {
        border: 'none',
      },
      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
        border: 'none',
        boxShadow: 'none',
      },
      '& .MuiOutlinedInput-notchedOutline': {
        border: 'none',
      },
    },
    '& .MuiInputBase-root': {
      boxShadow: 'none',
      '&:hover': {
        boxShadow: 'none',
      },
      '&.Mui-focused': {
        boxShadow: 'none',
      },
    },
  },
  ccContainer: {
    // padding: '4px 16px !important',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
    '& .MuiInputBase-root': {
      width: '100%',
      padding: '0',
    },
  },
  ccContainera: {
    padding: '4px 16px !important',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    '& .MuiInputBase-root': {
      width: '100%',
      padding: '0',
    },
  },
  emailChipsContainer: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center !important',
    flexWrap: 'wrap',
    width: '100%',
    padding: '4px 0',
    '& .MuiTextField-root': {
      flex: '1 0 150px',
      minWidth: '150px',
      maxWidth: '100%',
      '& .MuiInputBase-input': {
        fontSize: '12px',
        lineHeight: '20px',
        fontFamily: 'Inter',
        color: '#262527',
        padding: '4px 8px',
        height: '20px',
        '&::placeholder': {
          fontSize: '12px',
          lineHeight: '20px',
          fontFamily: 'Inter',
          color: '#98A2B3',
          opacity: 1,
        },
        '&:focus': {
          outline: 'none',
          boxShadow: 'none',
        },
      },
      '& .MuiOutlinedInput-root': {
        padding: 0,
        '&:hover .MuiOutlinedInput-notchedOutline': {
          border: 'none',
        },
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
          border: 'none',
          boxShadow: 'none',
        },
        '& .MuiOutlinedInput-notchedOutline': {
          border: 'none',
        },
      },
    },
  },

  emailChip: {
    display: 'inline-flex',
    alignItems: 'center',
    backgroundColor: '#E5F6FF80',
    borderRadius: '16px',
    padding: '4px 8px !important',
    gap: '8px',
    height: '28px',
    margin: 0,
    '& .chipText': {
      color: '#0059FF',
      fontSize: '12px',
      lineHeight: '20px',
      wordBreak: 'break-all',
      fontFamily: 'Inter',
    },
    '& svg': {
      height: '14px',
      width: '14px',
      '& path': {
        fill: '#0059FF',
      },
      '& circle': {
        fill: '#0059FF',
      },
      cursor: 'pointer',
      color: theme.palette.primary.main,
      transition: 'opacity 0.2s ease',
      '&:hover': {
        opacity: 0.7,
      },
    },
  },
}));
