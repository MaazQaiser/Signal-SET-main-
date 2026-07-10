import { makeStyles } from '@mui/styles';
export const useStyles = makeStyles((theme) => ({
  ZonesTD: {
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: '#f2f2f2 !important',
      '& .MuiBox-root': {
        '& > :nth-child(2)': {
          '& svg': {
            visibility: 'visible !important',
          },
        },
      },
    },
  },

  actionBtns: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },

  btnAction: {
    '&.MuiButtonBase-root': {
      padding: '0px',
      height: '31px',
      width: '31px',
      minWidth: '31px',
    },
    '& .MuiButton-icon': {
      margin: '0px',
    },
    '& svg': {
      height: '16px',
      width: '16px',
    },
  },

  franchiseNameIcon: {
    width: '20px',
    height: '20px',
    '& svg': {
      visibility: 'hidden',
      width: '20px',
      height: '20px',
      '& path': {
        stroke: '#b3b3b3',
      },
    },
  },

  franchiseNameText: {
    '&.MuiBox-root': {
      color: theme.palette.textSecondary1,
      fontWeight: 500,
    },
  },

  franchiseName: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    justifyContent: 'space-between',
  },

  sitesListingContainer: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflow: 'auto',
    padding: '32px',

    [theme.breakpoints.down('lg')]: {
      padding: '24px',
    },
  },

  searchSectionDashboard: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 0,
    marginBottom: '24px',
  },

  invoicesDateRange: {
    width: '284px',
    '& .MuiStack-root': {
      '& div': {
        '& .MuiFormControl-root': {
          '& .MuiInputBase-root': {
            minWidth: '284px',
            height: '36px',
          },
        },
      },
    },
  },

  leftSide: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },

  rightBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },

  greenText: {
    color: theme.palette.borderSuccess,
    background: theme.palette.surfaceSuccessSubtle,
  },

  brandText: {
    color: theme.palette.surfaceWhite,
    background: theme.palette.borderBrand,
  },

  otherStageColor: {
    background: theme.palette.textPlaceholder,
  },

  commonStageColor: {
    textAlign: 'center',
    fontSize: '12px',
    fontStyle: 'normal',
    fontWeight: '500',
    lineHeight: '18px',
    borderRadius: '16px',
    display: 'inline-flex',
    justifyContent: 'flex-start',
    width: 'fit-content',
    padding: '4px 12px',
  },

  notesCloseBtn: {
    '&.MuiButtonBase-root': {
      padding: '0px',
      height: 'auto',
      width: 'auto',
      minWidth: 'auto',
    },
    '& .MuiButton-icon': {
      margin: '0px',
    },
    '& svg': {
      height: '32px',
      width: '32px',
    },
  },

  sideDrawerHeight: {
    '& .MuiDrawer-paper': {
      '& > .MuiBox-root': {
        height: '100%',
      },
    },
  },

  tableWrapper: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1',
    overflow: 'auto',

    '& table': {
      '& th:nth-child(1)': {
        minWidth: '82px',
        maxWidth: '82px',
      },

      '& td:nth-child(1)': {
        minWidth: '82px',
        maxWidth: '82px',
      },

      '& th:nth-child(2)': {
        position: 'sticky',
        left: '82px',
        background: theme.palette.surfaceWhite,
        zIndex: '21',
        minWidth: '250px',
        maxWidth: '250px',
      },

      '& td:nth-child(2)': {
        position: 'sticky',
        left: '82px',
        zIndex: '20',
        minWidth: '250px',
        maxWidth: '250px',
      },
    },
  },
}));
