import { makeStyles } from '@mui/styles';
export const useStyles = makeStyles((theme) => ({
  dealsWrapper: {
    padding: '0px 32px',
    overflow: 'auto',
    display: 'flex',
    flex: '1 1',
    flexDirection: 'column',
    '& table': {
      '& th:nth-child(1), & td:nth-child(1)': {
        boxShadow: '1px 0px 2px -1px rgba(0, 0, 0, 0.12)',
      },
    },
    [theme.breakpoints.down('lg')]: {
      padding: '0px 24px',
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
  // searchWidth: {
  //   width: '189px',
  //   '& .MuiInputBase-root': {
  //     minWidth: '100%',
  //   },
  // },
  commonStageColor: {
    textAlign: 'center',
    fontSize: '12px',
    fontStyle: 'normal',
    fontWeight: '500',
    lineHeight: '18px',
    borderRadius: '16px',
    display: 'inline-flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    width: 'fit-content',
    padding: '2px 10px',
    background: `${theme.palette.textDisabled}`,
    '& svg': {
      marginRight: '4px',
      width: '12px',
      height: '12px',
    },
  },
  approvedColor: {
    color: `${theme.palette.textSuccess}`,
    backgroundColor: `${theme.palette.surfaceSuccessSubtle}`,
  },
  rejectedColor: {
    color: `${theme.palette.textAlert}`,
    backgroundColor: `${theme.palette.surfaceAlertSubtle}`,
  },
  pendingColor: {
    backgroundColor: '#FFFAEB',
    color: '#DC6803',
  },
  emptd: {
    textAlign: 'center',
    display: 'block',
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
  },
  locationFilterBar: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: '24px 0',
  },
  filterLeftSide: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '10px',
  },
  moreFilter: {
    '&.MuiButtonBase-root': {
      fontSize: '14px',
      fontWeight: '500',
      lineHeight: '20px',
      letterSpacing: '0px',
      color: `${theme.palette.textPrimary}`,
      textTransform: 'capitalize',
      border: '0',
      cursor: 'pointer',
      '&:hover': {
        backgroundColor: 'transparent',
        color: `${theme.palette.textPrimary}`,
      },
      '& svg': {
        marginLeft: 8,
      },
    },
  },
  filterRightSide: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },

  dealNameTD: {
    paddingRight: '10px !important',
    cursor: 'pointer',
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
    display: 'flex !important',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  holderColor: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
      fontWeight: '500',
      textTransform: 'capitalize',
    },
  },
  borderLessDrop: {
    '& .MuiTypography-root': {
      color: theme.palette.textPrimary,
      fontWeight: '500',
      textTransform: 'capitalize',
    },
  },

  chartHeading: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary1,
      marginBottom: '8px',
    },
  },

  chartHeadingBar: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary2,
    },
  },

  dataAmount: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },

  headerBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  // mainWrapperGraph: {
  //   display: 'flex',
  //   justifyContent: 'space-between',
  //   borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
  //   maxHeight: '284px',
  // },

  mainWrapper: {
    display: 'flex',
    justifyContent: 'space-between',
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    position: 'relative',
    maxHeight: '284px',
  },
  graphHide: {
    display: 'flex',
    maxHeight: 0,
    overflow: 'hidden',
    transition: 'max-height 0.3s ease-in-out',
  },
  gridSection: {
    width: '28%',
    paddingLeft: '16px',
    paddingRight: '16px',
    paddingTop: '24px',
    borderRight: `1px solid ${theme.palette.borderSubtle1}`,
    resize: 'both',
    [theme.breakpoints.down('lg')]: {
      width: '33.333%',
      paddingLeft: '8px',
      paddingRight: '8px',
    },
  },

  gridSectionClient: {
    width: '28%',
    paddingLeft: '16px',
    paddingRight: '16px',
    paddingTop: '24px',
    borderRight: `1px solid ${theme.palette.borderSubtle1}`,
    resize: 'both',
    [theme.breakpoints.down('lg')]: {
      width: '33.333%',
      paddingLeft: '8px',
      paddingRight: '8px',
    },
  },

  gridSectionOne: {
    width: '44%',
    paddingLeft: '16px',
    paddingRight: '16px',
    paddingTop: '24px',
    resize: 'both',
    [theme.breakpoints.down('lg')]: {
      width: '33.333%',
      paddingLeft: '8px',
      paddingRight: '8px',
    },
  },

  pieChartSkeletonWrapperClient: {
    width: '28%',
    padding: '24px 16px',
    borderRight: `1px solid ${theme.palette.borderSubtle1}`,
    resize: 'both',
    [theme.breakpoints.down('lg')]: {
      width: '33.333%',
      paddingLeft: '8px',
      paddingRight: '8px',
    },
  },

  lineChartSkeletonWrapperRight: {
    width: '44%',
    padding: '24px 16px',
    resize: 'both',
    [theme.breakpoints.down('lg')]: {
      width: '33.333%',
      paddingLeft: '8px',
      paddingRight: '8px',
    },
  },

  pieChartSkeletonWrapper: {
    width: '28%',
    padding: '24px 16px',
    borderRight: `1px solid ${theme.palette.borderSubtle1}`,
    resize: 'both',
    [theme.breakpoints.down('lg')]: {
      width: '33.333%',
      paddingLeft: '8px',
      paddingRight: '8px',
    },
  },

  headerBarIn: {
    marginBottom: '20px',
  },

  legendsLineChart: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },

  legendLineChart: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },

  legendLineChartIndicator: {
    width: '25px',
    height: '14px',
    borderRadius: '4px',
  },

  legendGray: {
    backgroundColor: theme.palette.surfaceGreyStrong1,
  },

  legendBrand: {
    backgroundColor: theme.palette.surfaceBrand,
  },

  legendLineChartText: {
    '&.MuiTypography-root': {
      fontSize: '10px',
      fontWeight: 500,
      lineHeight: '14px',
      color: theme.palette.textSecondary3,
    },
  },

  customHeadingChart: {
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    paddingBottom: '12px',
  },

  chipWrapper: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '8px',
  },
  graphExpandBtn: {
    '&.MuiButtonBase-root': {
      position: 'fixed',
      left: '52%',
      transform: 'translateX(-50%) rotate(-180deg)',
      top: '46px',
      minWidth: '28px',
      width: '28px',
      height: '28px',
      borderRadius: '50%',
      zIndex: '100',
      padding: '0',
    },
  },

  graphCollapseBtn: {
    '&.MuiButtonBase-root': {
      position: 'absolute',
      left: '50%',
      transform: 'translateX(-50%)',
      bottom: '-14px',
      minWidth: '28px',
      width: '28px',
      height: '28px',
      borderRadius: '50%',
      padding: '0',
    },
  },
  emailIcon: {
    display: 'flex',
    alignItems: 'self-end',
    gap: '8px',
  },
  linkStyle: {
    lineHeight: '1 !important',
  },
  //drawer
  siderBarBox: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflow: 'auto',
  },
  sideHeader: {
    display: 'block',
    padding: '24px 32px 32px 24px',

    '& .MuiBox-root': {
      marginBottom: 0,
      paddingRight: 0,
    },
  },
  fieldWrapper: {
    width: '100%',
  },
  fiftyWidth: {
    width: '48%',
  },
  locationForm: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflow: 'auto',
    padding: '0 32px 20px 32px',
  },
  boxInner: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflow: 'auto',
  },
  sideBySideCol: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: '20px',
    gap: '24px',
  },
  Input: {
    marginBottom: '20px',
  },
  approveTextBox: {
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    marginTop: '32px',
    paddingBottom: '8px',
    '&:last-child': {
      borderBottom: 0,
      paddingBottom: 0,
    },
  },

  approveTextBoxTitle: {
    '&.MuiTypography-root': {
      marginBottom: '8px',
    },
  },

  additionalFieldBox: {
    margin: '32px 0 0 0',
    paddingBottom: '32px',
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
  },

  companyFlex: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cLabel: {
    flex: '0 0 40%',
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },
  compDetName: {
    flex: '0 0 60%',
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary3,
    },
  },
  placeHolderColor: {
    color: theme.palette.textPlaceholderField,
    fontSize: '16px !important',
    fontWeight: '400 !important',
  },

  sideDrawerFooter: {
    paddingLeft: '32px',
    paddingRight: '32px',
    marginTop: 0,
  },
  noMarginBottom: {
    marginBottom: 0,
  },

  companiesDatePicker: {
    '& .MuiFormControl-root': {
      minWidth: '281px',
    },
    '& .MuiInputBase-root': {
      height: '36px',
      maxHeight: '36px',
    },
  },

  invalidFeedback: {
    fontSize: 14,
    lineHeight: '20px',
    fontWeight: 400,
    margin: 0,
    marginTop: '6px',
    color: '#B32318',
    textShadow: '0px 0px 0px #F4EBFF, 0px 1px 2px rgba(16, 24, 40, 0.05)',
    '&::first-letter ': {
      textTransform: 'capitalize',
    },
  },

  companyNameTD: {
    cursor: 'pointer',
    '&:hover': {
      '& .MuiBox-root': {
        '& > :nth-child(2)': {
          '& svg': {
            visibility: 'visible !important',
          },
        },
      },
    },
  },

  companyNameIcon: {
    width: '20px',
    height: '20px',
    '& svg': {
      visibility: 'hidden',
      width: '20px',
      height: '20px',
      '& path': {
        stroke: theme.palette.textPlaceholder,
      },
    },
  },
  companyName: {
    display: 'flex !important',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  contactField: {
    marginTop: '32px',
  },
}));
