import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  drawerPaper: {
    width: '769px',
    maxWidth: '90vw',
    padding: '24px',
    height: 'auto',
    maxHeight: '80vh',
    bottom: '0 !important',
    right: '0 !important',
    left: 'auto !important',
    borderRadius: '12px',
    boxShadow: '0px -4px 20px rgba(0, 0, 0, 0.1)',
    marginBottom: '24px',
    marginRight: '24px',
  },
  drawerHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  marginBottom: {
    marginBottom: '8px',
  },
  emailChipsContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    padding: '8px 12px ',
    alignItems: 'center',
    border: `1px solid ${theme.palette.grey[300]}`,
    borderRadius: '8px',
    minHeight: '44px',
    cursor: 'text',
    '& .MuiInputBase-root': {
      border: 'none',
      outline: 'none',
      background: 'transparent',
      padding: 0,
      height: 'auto',
      minWidth: '120px',
      flexGrow: 1,
      boxShadow: 'none',
      '&:before, &:after': {
        display: 'none',
        border: 'none',
      },
      '& .MuiOutlinedInput-notchedOutline': {
        border: 'none',
        outline: 'none',
        boxShadow: 'none',
      },
      '&:hover .MuiOutlinedInput-notchedOutline': {
        border: 'none',
        outline: 'none',
        boxShadow: 'none',
      },
      '&.Mui-focused': {
        outline: 'none',
        boxShadow: 'none',
        '& .MuiOutlinedInput-notchedOutline': {
          border: 'none',
          outline: 'none',
          boxShadow: 'none',
        },
      },
    },
    '& .MuiInputBase-input': {
      padding: '4px 0',
      outline: 'none',
      boxShadow: 'none',
      '&::placeholder': {
        color: theme.palette.grey[500],
      },
      '&:focus': {
        outline: 'none',
        boxShadow: 'none',
      },
    },
  },
  emailChip: {
    display: 'inline-flex',
    alignItems: 'center',
    backgroundColor: '#E5F6FF80',
    borderRadius: '16px',
    padding: '4px 8px 4px 12px',
    gap: '8px',
    height: '32px',
    '& .chipText': {
      color: '#0059FF',
      fontSize: '14px',
      lineHeight: '20px',
    },
    '& .deleteIcon': {
      width: '16px',
      height: '16px',
      cursor: 'pointer',
      color: theme.palette.primary.main,
      transition: 'opacity 0.2s ease',
      '&:hover': {
        opacity: 0.7,
      },
    },
  },
  actionButtons: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '16px',
    marginTop: '24px',
    '& .leftActions': {
      display: 'flex',
      // gap: '16px',
      '& .iconButton': {
        padding: '8px',
        color: theme.palette.grey[600],
        '&:hover': {
          color: theme.palette.primary.main,
        },
      },
    },
    '& .rightActions': {
      display: 'flex',
      gap: '16px',
    },
  },
  saleCK: {
    '& .ck-editor__editable': {
      minHeight: '200px',
    },
  },
  subjectContainer: {
    display: 'flex',
    flexDirection: 'column',
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
}));
