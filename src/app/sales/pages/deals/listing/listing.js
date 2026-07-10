import { makeStyles } from '@mui/styles';
export const useStyles = makeStyles((theme) => ({
  dealsWrapper: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1 1',
    overflow: 'auto',
    padding: '0 32px',
    [theme.breakpoints.down('lg')]: {
      paddingLeft: '24px',
      paddingRight: '24px',
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
    position: 'relative',
    borderTop: `1px solid ${theme.palette.borderSubtle1}`,
  },

  mainWrapperGraph: {
    display: 'flex',
    justifyContent: 'space-between',
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
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
    [theme.breakpoints.down('lg')]: {
      alignSelf: 'flex-end',
    },
  },

  legendLineChart: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },

  legendLineChartIndicator: {
    width: '15px',
    height: '8px',
    borderRadius: '4px',
  },

  legendGray: {
    backgroundColor: theme.palette.surfaceAlertStrong,
  },

  legendBrand: {
    backgroundColor: theme.palette.surfaceSuccessStrong,
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
    [theme.breakpoints.down('lg')]: {
      flexDirection: 'column',
      alignItems: 'flex-start',
      rowGap: '8px',
    },
  },

  chipWrapper: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '8px',
  },

  smallText: {
    '&.MuiTypography-root': {
      color: `${theme.palette.textPlaceholder}`,
      marginLeft: '8px',
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
    '& table': {
      '& th:nth-child(1), & th:nth-child(2), & th:nth-child(3)': {
        zIndex: 21,
        position: 'sticky',
      },
      '& td:nth-child(1), & td:nth-child(2), & td:nth-child(3)': {
        position: 'sticky',
        fontWeight: 500,
        color: `${theme.palette.textSecondary1}`,
      },
      '& th:nth-child(1), & td:nth-child(1)': {
        left: 0,
      },
      '& th:nth-child(2), & td:nth-child(2)': {
        minWidth: '150px',
        left: '64px',
      },
      '& th:nth-child(3), & td:nth-child(3)': {
        minWidth: '230px',
        overflow: 'hidden',
        boxShadow: '1px 0px 2px -1px rgba(0, 0, 0, 0.12)',
        left: '214px',
      },
    },
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
    background: '#fafafa',
  },
  questionsColor: {
    color: '#DC6803',
    background: '#FFFAEB',
  },
  proposalsColor: {
    color: '#146DFF',
    background: '#E5F6FF',
  },
  lostColor: {
    color: theme.palette.surfaceAlertHover,
    background: theme.palette.surfaceAlertSubtle,
  },
  closedcolor: {
    color: '#FFA31C',
    background: '#FDF7EE',
  },
  closedWoncolor: {
    color: '#2E964B',
    background: '#EFF8EF',
  },
  negotiationColor: {
    color: '#9747FF',
    background: '#F4EDFD',
  },
  emptd: {
    textAlign: 'center',
    display: 'block',
  },
  terminated: {
    backgroundColor: '#FEF0C7',
    color: '#F4780B',
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
    '& .MuiChip-root': {
      display: 'flex',
      flexDirection: 'row-reverse',
      alignItems: 'center',
      '&.MuiChip-colorSuccess': {
        '& svg': {
          '& path': {
            stroke: theme.palette.textSuccess,
          },
        },
      },
      '&.MuiChip-colorPrimary': {
        '& svg': {
          '& path': {
            stroke: theme.palette.textBrand,
          },
        },
      },
      '&.MuiChip-colorWarning': {
        '& svg': {
          '& path': {
            stroke: theme.palette.textWarning,
          },
        },
      },
    },
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
      color: '#262527',
      textTransform: 'capitalize',
      border: '0',
      cursor: 'pointer',
      '&:hover': {
        backgroundColor: 'transparent',
        color: '#262527',
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
  pipelineDropdown: {
    maxWidth: '304px',
    padding: '24px 0px',
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

  franchiseNameText: {
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

  franchiseName: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '8px',
  },

  holderColor: {
    color: theme.palette.textPlaceholderField,
    '&.MuiTypography-root': {
      color: theme.palette.textPlaceholderField,
      fontWeight: '500',
      textTransform: 'capitalize',
    },
  },

  textCapitalize: {
    textTransform: 'capitalize',
  },

  graphExpandBtn: {
    '&.MuiButtonBase-root': {
      position: 'absolute',
      left: '50%',
      transform: 'rotate(-180deg)',
      top: '-14px',
      minWidth: '28px',
      width: '28px',
      height: '28px',
      borderRadius: '50%',
      transition: 'max-height 0.3s ease-in-out ',
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

  checkBoxCustom: {
    '&.MuiCheckbox-root': {
      padding: '0',
    },

    '& svg': {
      width: '16px',
      height: '16px',
    },
  },
}));
