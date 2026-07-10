import { makeStyles } from '@mui/styles';
export const useStyles = makeStyles((theme) => ({
  scoutingWrapper: {
    display: 'flex',
    flex: '1 1',
    overflow: 'auto',
    padding: '0 32px',
  },

  scoutingLeftArea: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'auto',
    paddingRight: '24px',
  },
  mainWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    borderTop: `1px solid ${theme.palette.borderSubtle1}`,
  },
  scoutingRightArea: {
    position: 'relative',
    display: 'flex',
    flex: '1 1',
    overflow: 'hidden',
    margin: '24px 0 24px 0',
  },
  toggleIcon: {
    position: 'absolute',
    top: '50%',
    left: '0',
    cursor: 'pointer',
    zIndex: '1',
  },
  mapWraper: {
    width: '100%',
    height: '100%',
    border: `1px solid ${theme.palette.borderSubtle1}`,
    borderRadius: '8px 0px  0px 8px',
    '& span.MuiSkeleton-root.MuiSkeleton-rounded': {
      borderRadius: '8px 0px  0px 8px !important',
    },
  },
  tableCheck: {
    '&.MuiButtonBase-root': {
      padding: 0,
    },
  },
  locationListing: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1 1',
    overflow: 'auto',
  },
  selectedRowColor: {
    backgroundColor: `${theme.palette.surfaceGreySubtle} !important`,
  },

  assignToClass: {
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  assignAvatar: {
    '&.MuiAvatar-root': {
      width: '24px',
      height: '24px',
    },
  },
  assignToText: {
    marginLeft: 8,
    color: theme.palette.textSecondary3,
  },
  locationFilterBar: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '24px 0',
  },
  filterLeftSide: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',

    gap: '10px',
  },
  reportLinks: {
    '& .MuiButtonBase-root': {
      padding: '0px',
      fontWeight: '500',
      justifyContent: 'flex-start',
    },
  },
  userTypeCol: {
    color: theme.palette.textPrimary,
  },
  searchWidth: {
    maxWidth: '189px',
    width: '189px',
    '& .MuiInputBase-root': {
      minWidth: '100%',
      width: '189px',
    },
  },
  filterRightSide: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  dealNameTD: {
    paddingRight: '10px !important',

    '&:hover': {
      backgroundColor: `${theme.palette.surfaceGreySubtle} !important`,
      '& .MuiBox-root': {
        '& > :nth-child(2)': {
          '& svg': {
            visibility: 'visible !important',
          },
        },
      },
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
        stroke: theme.palette.surfaceGreyStrong1,
      },
    },
  },
  franchiseName: {
    cursor: 'pointer',
    height: '100%',
    display: 'flex !important',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reportsListingsHeaderRightDate: {
    width: '255px',
    '& input': {
      fontSize: '14px !important',
      '&::placeholder': {
        fontSize: '14px !important',
      },
    },
    '& .MuiBox-root ': {
      '& .MuiStack-root ': {
        '& .MuiFormControl-root ': {
          '& .MuiInputBase-root ': {
            height: '36px',
            minWidth: '255px',
          },
        },
      },
    },
  },
}));
