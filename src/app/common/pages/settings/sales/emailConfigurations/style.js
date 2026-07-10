import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles(() => ({
  newEmailBtn: {
    '&.MuiButtonBase-root': {
      padding: '6px 16px !important',
    },
  },
  emailListItem: {
    '& .MuiButtonBase-root': {
      padding: '0px !important',
    },
    borderBottom: '1px solid #E5E7EB !important',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: '#F9FAFB !important',
      '& .deleteIcon': {
        opacity: 1,
        visibility: 'visible',
        display: 'flex !important',
      },
      '& .timeDisplay': {
        opacity: 0,
        visibility: 'hidden',
        display: 'none !important',
      },
    },
  },
  emailListItemText: {
    display: 'flex',
    alignItems: 'flex-start',
    width: '100%',
    gap: '24px',
    '& .MuiTypography-root': {
      minWidth: '180px',
      fontWeight: '700 ',
    },
  },
  emailDetails: {
    display: 'flex',
    alignItems: 'flex-start',
    flex: 1,
    gap: '16px',
    minWidth: 0,
  },
  emailDetailsText: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flex: 1,
    minWidth: 0,
    maxWidth: 'calc(100% - 90px)',
    '& .MuiTypography-body2': {
      display: 'inline-block',
      maxWidth: '100%',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
    '& .messageText': {
      flex: 1,
      minWidth: 0,
    },
  },
  timeAndActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginLeft: 'auto',
    minWidth: '70px',
    justifyContent: 'flex-end',
    '& .MuiTypography-root': {
      fontWeight: '400 !important',
    },
    '& .deleteIcon': {
      width: '24px',
      height: '24px',
      opacity: 0,
      visibility: 'hidden',
      transition: 'all 0.2s ease-in-out',
      padding: '4px',
      color: '#6B7280 !important',
      '& svg': {
        '& path': {
          stroke: '#6B7280',
        },
      },
    },
    '& .timeDisplay': {
      transition: 'all 0.2s ease-in-out',
    },
  },
  connectionEmailWrapper: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    padding: '48px 0 !important',
    gap: '4px',
    // height: 'calc(100vh - 300px)',
    height: '400px',
  },
  connectionEmailTitle: {
    '&.MuiTypography-root': {
      color: '#262527',
    },
  },
  connectionEmailText: {
    '&.MuiTypography-root': {
      marginBottom: '20px',
      color: '#5B5B5F',
      // maxWidth: '350px',
      textAlign: 'center',
    },
  },
  franchiseNameText: {
    '&.MuiTypography-root': {
      padding: '8px 14px',
      height: 36,
      borderRadius: 8,
      display: 'flex',
      width: 'fit-content',
      justifyContent: 'center',
      alignItems: 'center',
      fontSize: 14,
      fontWeight: 500,
      lineHeight: '20px',
      fontFamily: 'Inter',
      textTransform: 'none',
      cursor: 'pointer',
      letterSpacing: 'normal',
      boxShadow: 'none',
      textDecoration: 'none',
      color: '#ffffff',
      backgroundColor: '#146DFF',
      border: '1px solid #146DFF',
      '&:hover': {
        backgroundColor: '#0059FF',
        border: '1px solid #0059FF',
      },
      '&:active': {
        backgroundColor: '#146DFF',
        border: '1px solid #146DFF',
        boxShadow: '0px 0px 0px 4px #E5F6FF, 0px 1px 2px 0px rgba(16, 24, 40, 0.05)',
      },
    },
  },
  root: {
    padding: 24,
    maxWidth: '70%',
  },
  header: {
    borderBottom: '1px solid #E6E6E7',
    paddingBottom: 20,
  },
  emailBox: {
    display: 'flex',
    alignItems: 'center',
    background: '#FAFAFA',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    boxShadow: '0 1px 2px rgba(16,24,40,0.06)',
  },
  emailContainer: {
    padding: '24px 0',
  },
  avatar: {
    marginRight: 16,

    '&.MuiAvatar-root': {
      background: 'white !important',
    },
  },
  emailInfo: {
    flex: 1,
  },
  name: {
    fontWeight: 500,
  },
  iconContainer: {
    display: 'flex',
    gap: 8,
    alignItems: 'center',
  },
  reloadIcon: {
    '&.MuiIconButton-root': {
      borderRadius: 8,
      background: '#E5F6FF',
    },
  },
  deleteIcon: {
    '&.MuiIconButton-root': {
      borderRadius: 8,
      background: '#FEF0C7',
    },
  },
}));
