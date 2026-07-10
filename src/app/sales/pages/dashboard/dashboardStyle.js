import { makeStyles } from '@mui/styles';
export const useStyles = makeStyles((theme) => ({
  chipWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  ratioWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: '24px',
  },

  dashboardsales: {
    flex: '1 1',
    overflowY: 'auto',
    overflowX: 'hidden',
    paddingBottom: '32px',
    [theme.breakpoints.down('lg')]: {
      // paddingBottom: ' 24px',
    },
  },
  saleDashHeader: {
    margin: '24px 32px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px',
    [theme.breakpoints.down('lg')]: {
      marginLeft: '24px',
      marginRight: '24px',
    },
  },
  chartWrapper: {
    width: '100%',
    height: '208px',
  },
  headerBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px',
    marginBottom: '16px',
  },
  dataAmount: {
    '&.MuiTypography-root': {
      marginTop: '3px',
      whiteSpace: 'nowrap',
      color: '#000',
      fontSize: '22px',
      fontStyle: 'normal',
      fontWeight: '700',
      lineHeight: '30px',
    },
  },
  salesCustomDropdown: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  },
  chartFooters: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: '0 32px 32px 0px',
    [theme.breakpoints.down('lg')]: {
      padding: '0 24px 24px 24px',
    },
  },
  userLink: {
    cursor: 'pointer',
  },
  charLink: {
    bottom: '32px',
    right: '32px',
    zIndex: '999',
    alignItems: 'center',
    gap: '4px',
    display: 'flex',
    '&.MuiTypography-root': {
      fontFamily: 'Inter',
      fontSize: '14px',
      fontStyle: 'normal',
      fontWeight: 500,
      lineHeight: '20px',
      color: '#146DFF',
    },
  },
  tableLink: {
    '&.MuiTypography-root': {
      color: '#146DFF',
      display: 'flex',
      justifyContent: 'flex-end',
      alignItems: 'center',
      gap: '4px',
    },
  },
  // mainWrapper: {
  //   display: 'flex',
  //   // alignItems: 'center',
  //   justifyContent: 'space-between',
  //   borderBottom: '1px solid #E6E6E7',
  //   borderTop: '1px solid #E6E6E7',
  // },
  // girdSection: {
  //   flex: '1 1',
  //   borderRight: '1px solid #E6E6E7',
  //   padding: '20px 15px 15px 15px',
  //   display: 'flex',
  //   flexDirection: 'column',
  //   justifyContent: 'space-between',
  //   alignSelf: 'stretch',
  // },
  // girdSectionIn: {
  //   justifyContent: 'start',
  // },

  // maxWidCol: {
  //   flexBasis: '20%',
  // },
  chartFooter: {
    '& a': {
      pointerEvents: 'none',
    },
  },
  skeletonLoaderWrapper: {
    padding: '16px',
    display: 'flex',
    flex: 1,
  },
  skeletonWrapperGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 40,
    marginTop: 16,
  },
  keyMetricsWrapper: {
    padding: '32px ',
    [theme.breakpoints.down('lg')]: {
      padding: '24px',
    },
  },
  chart: {
    padding: '32px 32px 0 32px',
    [theme.breakpoints.down('lg')]: {
      padding: '24px 24px 0 24px',
    },
  },
  metricList: {
    display: 'flex',
    alignItems: 'flex-start',
    // justifyContent: 'space-between',
    width: '300px',
    gap: '32px',
    [theme.breakpoints.down('lg')]: {
      display: 'flex !important',
      width: '100%',
      flexDirection: 'column',
      gap: '4px',
    },
    [theme.breakpoints.up('mlgg')]: {
      width: '400px',
    },
  },
  labelStyles: {
    '&.MuiTypography-root': {
      color: '#86868B',
      whiteSpace: 'nowrap',
      width: '200px',
      [theme.breakpoints.up('mlgg')]: {
        width: '250px !important',
      },
      [theme.breakpoints.down('lg')]: {
        width: '100%',
      },
    },
  },
  valueStyles: {
    gap: '14px',
    display: 'flex',
    alignItems: 'flex-start',
    whiteSpace: 'nowrap',
    width: '100px',
    [theme.breakpoints.up('mlgg')]: {
      width: '130px !important',
    },
    [theme.breakpoints.down('lg')]: {
      width: '100%',
      whiteSpace: 'unset',
    },
    '& .MuiTypography-root': {
      color: '#262527',
    },
  },
  salesFunnelChart: {
    padding: '32px 32px 0 32px',
    position: 'relative',
    [theme.breakpoints.down('lg')]: {
      padding: '24px 24px 0 24px',
    },
  },
  salesFunnelChartdetail: {
    padding: '32px ',
    position: 'relative',
    [theme.breakpoints.down('lg')]: {
      padding: '24px',
    },
  },
  keyWraper: {
    [theme.breakpoints.down('lg')]: {
      order: '-1',
      borderBottom: '1px solid #E6E6E7',
    },
  },
  legendsLineChart: {
    display: 'flex',
    alignItems: 'center',
    gap: '32px',
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
    width: '10px',
    height: '10px',
  },

  legendPrimary: {
    backgroundColor: theme.palette.surfaceBrand,
  },
  legendWarning: {
    backgroundColor: theme.palette.surfaceWarningStrong,
  },
  legendSuccess: {
    backgroundColor: theme.palette.surfaceSuccessStrong,
  },
  legendDanger: {
    backgroundColor: theme.palette.surfaceAlertStrong,
  },
  legendLineChartText: {
    '&.MuiTypography-root': {
      fontSize: '12px',
      fontWeight: 500,
      lineHeight: '14px',
      color: theme.palette.textSecondary3,
    },
  },
  borderTopBottom: {
    borderTop: '1px solid #E6E6E7',
    borderBottom: '1px solid #E6E6E7',
  },
  borderTop: {
    borderTop: '1px solid #E6E6E7',
  },
  borderRight: {
    borderRight: '1px solid #E6E6E7',
  },
  borderBottom: {
    borderBottom: '1px solid #E6E6E7',
  },
  hell: {
    display: 'flex',
    flexDirection: 'column',

    justifyContent: ' space-between',
    height: '500px',
    [theme.breakpoints.down('lg')]: {
      display: 'grid !important',
      gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr',
      height: '100%',
      gap: '24px',
    },
  },
  wonStatus: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '32px 32px 0px 32px',
    [theme.breakpoints.down('lg')]: {
      padding: '24px 24px 0 24px',
    },
  },
  popWrap: {
    '& .MuiPaper-root.MuiPaper-elevation.MuiPaper-rounded.MuiPopover-paper': {
      borderRadius: '8px',
    },
  },
  popButton: {
    '&.MuiButtonBase-root': {
      color: theme.palette.textSecondary2,
      '&:hover': {
        color: theme.palette.textSecondary2,
      },
    },
  },
  chartHeading: {
    '&.MuiTypography-root': {
      fontFamily: 'Inter',
      fontSize: '14px',
      fontStyle: 'normal',
      fontWeight: 700,
      lineHeight: '20px' /* 142.857% */,
      color: '#262527' /* Converted color */,
    },
  },
  textSmall: {
    '&.MuiTypography-root': {
      fontFamily: 'Inter',
      fontSize: '10px',
      fontStyle: 'normal',
      fontWeight: 500,
      lineHeight: '14px',
      color: '#5B5B5F',
    },
    position: 'absolute',
    top: '75px',
  },
  visitChartInfo: {
    position: 'relative',
  },
  chartSalesWrapper: {
    position: 'relative',
  },
  salesPersons: {
    '&.MuiTypography-root': {
      fontFamily: 'Inter',
      fontSize: '12px',
      fontStyle: 'normal',
      fontWeight: 500,
      lineHeight: '16px',
      color: '#262527',
    },
    position: 'absolute',
    top: '50%',
    transform: 'translate(50%, 50%) rotate(270deg)',
    left: '-60px',
  },
  placeHolderColor: {
    color: ' #5B5B5F !important',
    '& path': {
      stroke: ' #5B5B5F !important',
    },
  },

  reportsListingsHeaderRightDate: {
    width: '265px',
    '& .MuiBox-root ': {
      '& .MuiStack-root ': {
        '& .MuiFormControl-root ': {
          '& .MuiInputBase-root ': {
            height: '36px',
            minWidth: '265px',
          },
        },
      },
    },
  },
  exportBtn: {
    '&.MuiButtonBase-root.MuiButton-root': {
      color: theme.palette.textSecondary2,
    },
  },
  flagButton: {
    backgroundColor: 'red !important',
  },
  countrySelectWrap: {
    width: '185px',
    '& .MuiFormControl-root': {
      '& .flag-button': {
        height: '36px !important',
      },
    },
    '& .MuiInputBase-root': {
      height: '36px !important',
    },
  },
  countrySelectWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
}));
