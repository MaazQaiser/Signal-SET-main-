import { makeStyles } from '@mui/styles';
export const useStyles = makeStyles((theme) => ({
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

  lineHeaderBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },

  dateInGreen: {
    '&.MuiTypography-root': {
      color: '#5CB85C',
      fontSize: '12px',
      fontStyle: 'normal',
      fontWeight: '400',
      lineHeight: '16px',
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
    },

    '& svg': {
      width: '16px',
      height: '16px',
      '& path': {
        stroke: '#5CB85C',
      },
    },
  },

  charLink: {
    '&.MuiTypography-root': {
      display: 'flex',
      justifyContent: 'flex-end',
      alignItems: 'center',
      color: theme.palette.textBrand,
      fontSize: '12px',
      fontWeight: '400',
      lineHeight: '16px',
      marginRight: '5px',
      marginTop: '20px',
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
  companiesWraper: {
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
  textCapitalize: {
    textTransform: 'capitalize',
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

  companiesFilter: {
    borderTop: 0,
  },

  mainWrapper: {
    display: 'flex',
    justifyContent: 'space-between',
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    position: 'relative',
    maxHeight: '284px',
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

  graphHide: {
    display: 'flex',
    maxHeight: 0,
    overflow: 'hidden',
    transition: 'max-height 0.3s ease-in-out',
  },
}));
