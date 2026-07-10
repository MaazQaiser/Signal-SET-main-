import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  emailWrapper: {
    padding: '16px 0 0 0 !important',
  },
  calendarHeaderToolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '3.2px',
  },
  newEmailBtn: {
    '&.MuiButtonBase-root': {
      padding: '6px 16px !important',
    },
  },
  locationFilterBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  filterLeftSide: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  filterRightSide: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    justifyContent: 'flex-end',
  },
  twoBtnWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  emailListing: {
    padding: '16px 0px !important',
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
  paginationWrapper: {
    '& .MuiTablePagination-root': {
      overflow: 'hidden',
      '& .MuiToolbar-root': {
        minHeight: '56px',
        padding: 0,
        '& .MuiTablePagination-selectLabel': {
          color: theme.palette.textSecondary1,
        },
        '& .MuiInputBase-root': {
          '& .MuiSelect-select': {
            color: theme.palette.textSecondary1,
            '&:focus': {
              background: 'transparent',
            },
          },
          '& .MuiSelect-icon': {
            width: '18px',
            height: '18px',
            top: '6px',
            '& path': {
              stroke: theme.palette.textSecondary1,
            },
          },
        },
        '& .MuiTablePagination-displayedRows': {
          color: theme.palette.textSecondary1,
          fontSize: '14px',
          fontWeight: '400',
          lineHeight: '20px',
        },
        '& .MuiTablePagination-actions': {
          '& .MuiIconButton-root': {
            border: `1px solid ${theme.palette.borderSubtle1}`,
            borderRadius: '50%',
            padding: '7px',
            margin: '0 4px',
            '&:hover': {
              backgroundColor: theme.palette.surfaceHover,
              borderColor: theme.palette.borderHover,
            },
            '&.Mui-disabled': {
              border: `1px solid ${theme.palette.borderDisabled}`,
            },
          },
        },
      },
    },
  },
  subjectText: {
    '& .MuiTypography-root': {
      fontWeight: '700 ',
    },
    '&.MuiTypography-root': {
      paddingRight: '4px',
    },
  },
  unread: {
    backgroundColor: '#F6F8FA',
    '& .MuiListItemText-root': {
      '& .MuiTypography-root': {
        fontWeight: '400 !important',
        '&.MuiTypography-root ': {
          fontWeight: '400 !important',
          color: 'rgba(0, 0, 0, 0.6)',
        },
        '&.MuiTypography-root': {
          fontWeight: '400 !important',
          color: 'rgba(0, 0, 0, 0.6)',
        },
      },
    },
  },
  read: {
    backgroundColor: '#FFFFFF',
    '& .MuiTypography-root': {
      '&.read': {
        fontWeight: '400 !important',
        paddingLeft: '4px',
      },
    },
  },
  '&.read': {
    fontWeight: '400 !important',
    paddingLeft: '4px',
  },
  borderLessDrop: {
    position: 'static !important',
    color: theme.palette.textPrimary,
    borderRadius: '5px',
    '&:hover': {
      borderRadius: '5px',

      background: theme.palette.surfaceGreySubtle,
    },
    '& > :nth-child(1)': {
      paddingRight: '2px ',
      paddingLeft: '5px ',
    },
    '& > :nth-child(2)': {
      width: '100%',
    },
    '& .MuiTypography-root': {
      color: theme.palette.textPrimary,
      fontWeight: '400',
    },
  },
  dropHeader: {
    height: '44px',
  },
}));
