import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  btnLocation: {
    '&.MuiButtonBase-root': {
      marginRight: '12px',
    },
  },
  sashboardsales: {
    flex: '1 1',
    overflow: 'auto',
  },
  saleDashHeader: {
    margin: '22px 32px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  chartHeading: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary1,
      marginBottom: '8px',
    },
  },

  chartHeadingBar: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary1,
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

  mainWrapper: {
    display: 'flex',
    justifyContent: 'space-between',
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    position: 'relative',
    maxHeight: '305px',
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

  noDataAmount: {
    marginBottom: '32px',
  },

  customHeadingChart: {
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    paddingBottom: '12px',
  },

  locationTD: {
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

  locationNameText: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },

  repeatIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '16px',
    height: '16px',
    borderRadius: '4px',
    backgroundColor: theme.palette.surfaceBrand,
  },

  locationWrapper: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1 1',
    overflow: 'auto',
    position: 'relative',
    padding: '0 32px',
    [theme.breakpoints.down('lg')]: {
      paddingLeft: '24px',
      paddingRight: '24px',
    },
  },

  locationListing: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1 1',
    overflow: 'auto',
    '& table': {
      '& th:nth-child(1), & th:nth-child(2), & th:nth-child(3)': {
        zIndex: '22 !important',
        position: 'sticky',
      },
      '& td:nth-child(1), & td:nth-child(2),  & td:nth-child(3)': {
        position: 'sticky',
        fontWeight: 500,
        color: theme.palette.textSecondary1,
      },
      '& th:nth-child(1), & td:nth-child(1)': {
        left: 0,
      },
      '& th:nth-child(2), & td:nth-child(2)': {
        minWidth: '130px',
        left: '64px',
      },
      '& th:nth-child(3), & td:nth-child(3)': {
        minWidth: '230px',
        overflow: 'hidden',
        boxShadow: '1px 0px 2px -1px rgba(0, 0, 0, 0.12)',
        left: '194px',
      },
    },
  },
  approvedLocationColor: {
    background: '#E8F0FF',
    color: '#146DFF',
  },
  discoveryColor: {
    color: '#F6933C',
    background: '#FEF6EF',
  },
  newLocationColor: {
    color: '#DC6803',
    background: '#FEF0C7',
  },
  qualifiedColor: {
    background: '#EFF8EF',
    color: '#027A48',
  },
  oldLocationColor: {
    color: '#9747FF',
    backgroundColor: '#F4EDFD',
  },
  needAssesmentColor: {
    color: '#DBB22D',
    background: '#DBB22D1A',
  },
  currentCustomer: {
    color: '#B468F7',
    background: '#F9F3FF',
  },
  eixstingColor: {
    color: theme.palette.textBrand,
    background: theme.palette.surfaceBrandSubtle,
  },
  lostColor: {
    color: '#B32318',
    backgroundColor: '#FBEEED',
  },
  connectedColor: {
    color: '#F768CC',
    background: '#F768CC1A',
    opacity: '10%',
  },
  nurtureColor: {
    color: '#2E964B',
    background: '#EFF8EF',
  },
  UnQualifiedColor: {
    color: theme.palette.surfaceAlertHover,
    background: theme.palette.surfaceAlertSubtle,
  },
  workingColor: {
    color: theme.palette.textBrand,
    background: theme.palette.surfaceBrandSubtle,
  },
  negotiationColor: {
    color: '#23A3F2',
    background: '#E9F6FE',
  },
  nurturingColor: {
    color: '#a142f5',
    background: '#f6ecfe',
  },
  otherStageColor: {
    background: '#fafafa',
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
  emptd: {
    textAlign: 'center',
    display: 'block',
  },
  assignToClass: {
    flexDirection: 'row !important',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  assignAvatar: {
    width: '24px !important',
    height: '24px !important',
  },
  assignToText: {
    marginLeft: '8px',
  },
  locationFilterBar: {
    display: 'flex',
    flexDirection: 'row ',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
    margin: '24px 0',
    [theme.breakpoints.down('mlgg')]: {
      flexDirection: 'column',
    },
  },
  filterLeftSide: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '12px',
    [theme.breakpoints.down('mlgg')]: {
      width: '100%',
    },
  },

  locationSearch: {
    paddingRight: 0,
  },

  dropDownsFilters: {
    display: 'flex',
    alignItems: 'center',
  },

  statesButtons: {
    height: '37px',
    borderRadius: '8px',
    padding: '1px',
    border: `1px solid ${theme.palette.borderSubtle1}`,
    '& button.MuiButtonBase-root': {
      border: '0px !important',
    },
    '& .Mui-selected': {
      borderRadius: '6px !important',
      backgroundColor: `${theme.palette.textBrand} !important`,
      color: 'white !important',
      '& .MuiBox-root': {
        borderRadius: '6px',

        background: `${theme.palette.surfaceBrandSubtle} !important`,
        color: `${theme.palette.textBrand} !important`,
      },
    },
  },
  // firstButton: {
  //   '&.MuiButtonBase-root': {
  //     borderRadius: '8px 0px 0px 8px',
  //   },
  // },
  // lastButton: {
  //   '&.MuiButtonBase-root': {
  //     borderRadius: '0px 8px 8px 0px',
  //   },
  // },
  pendingNumber: {
    background: theme.palette.surfaceAlertSubtle,
    color: theme.palette.textAlert,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: '5px',
    padding: '1px 9px',
    fontSize: '10px',
    width: '18px',
    height: '18px',
    borderRadius: ' 6px',
  },
  filterRightSide: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    [theme.breakpoints.down('mlgg')]: {
      width: '100%',
    },
  },
  twoBtnWrapper: {
    display: 'flex',
    [theme.breakpoints.down('mlgg')]: {
      justifyContent: 'flex-end',
      width: '100%',
    },
  },
  moreFilter: {
    '&.MuiButtonBase-root': {
      fontSize: '14px',
      fontWeight: '500',
      lineHeight: '20px',
      letterSpacing: '0px',
      color: theme.palette.textPrimary,
      textTransform: 'capitalize',
      border: '0',
      cursor: 'pointer',
      '&:hover': {
        backgroundColor: 'transparent !important',
        color: theme.palette.textPrimary,
      },
      '& svg': {
        marginLeft: '8px',
      },
    },
  },
  locationNameIcon: {
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

  locationName: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '8px',
  },

  locationListingNew: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1 1',
    overflow: 'auto',
    '& table': {
      '& th:nth-child(1), & th:nth-child(2)': {
        zIndex: 22,
      },
      '& th:nth-child(1), & td:nth-child(1), & th:nth-child(2), & td:nth-child(2)': {
        position: 'sticky',
        fontWeight: 500,
        color: '#444446',
      },
      '& th:nth-child(1), & td:nth-child(1)': {
        left: 0,
        minWidth: '130px',
      },
      '& th:nth-child(2), & td:nth-child(2)': {
        left: '130px',
        minWidth: '230px',
        overflow: 'hidden',
        boxShadow: '1px 0px 2px -1px rgba(0, 0, 0, 0.12)',
      },
    },
  },
  textCapitalize: {
    textTransform: 'capitalize',
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

  checkBoxCustom: {
    '&.MuiCheckbox-root': {
      padding: '0',
    },

    '& svg': {
      width: '16px',
      height: '16px',
    },
  },
  inlineContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: '8px',
  },

  chipsWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
}));
