import { makeStyles } from '@mui/styles';
export const useStyles = makeStyles((theme) => ({
  sitesListingCommonContainer: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1',
    overflow: 'auto',
    paddingBottom: '0',
    // paddingTop: '24px',
  },
  mainBoxWrapperAvailbiltity: {
    // width: 'calc(100% - 300px)',

    '@media only screen and (max-width: 1024px)': {
      width: '100%',
    },
  },
  searchSectionDashboard: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0',
  },
  searchSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    columnGap: '12px',
    padding: '24px 0',
  },
  tableWrapper: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1',
    overflow: 'auto',
  },
  tableWrapperCalendar: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1',
    overflow: 'auto',
    paddingBottom: '24px',
  },
  tableWrapperOne: {
    // padding: '6px 24px',
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
  },
  tableavatar: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
  },
  headerTitlle: {
    paddingBottom: '20px',
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    marginBottom: '16px',
  },
  zoneDetailText: {
    '&.MuiTypography-root': {
      color: theme.palette.textPlaceholder,
    },
  },
  tableCalendarHeading: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary2,
    },
  },
  weekDaysName: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary1,
      textTransform: 'capitalize',
    },
  },
  saveBtnWrapper: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  description: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary3,
    },
  },
  timeHeader: {
    display: 'grid',
    gap: '48px',
    gridTemplateColumns: ' 1fr 4fr 220px',
    padding: '12px 24px',
    alignItems: 'center',
  },
  availabiliySectionWrapper: {
    position: 'relative',
    display: 'grid',
    gridTemplateColumns: '1fr 4fr 220px',
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    padding: '6px 24px',
    gap: '48px',
    alignItems: 'center',
  },

  systemDefaulttimeHeader: {
    display: 'grid',
    gap: '48px',
    gridTemplateColumns: ' 1fr 280px ',
    padding: '12px 24px',
    alignItems: 'center',
  },
  systemDefaultSectionWrapper: {
    position: 'relative',
    display: 'grid',
    gridTemplateColumns: '1fr 280px ',
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    padding: '6px 24px',
    gap: '48px',
    alignItems: 'center',
  },
  devices: {
    paddingBottom: '20px',
  },
  tableTitleWrapper: {
    paddingBottom: '20px',
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
  },
  tableTitle: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
      textTransform: 'capitalize',
    },
  },
  serviceSectionWrapper: {
    position: 'relative',
    display: 'grid',
    gridTemplateColumns: '1.5fr 1.5fr 300px',
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    padding: '6px 24px',
    gap: '48px',
    alignItems: 'center',
  },
  serviceHeader: {
    display: 'grid',
    gap: '48px',
    gridTemplateColumns: ' 1.5fr 1.5fr 300px',
    padding: '12px 24px',
    alignItems: 'center',
  },
  zoneCustomText: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
      textTransform: 'capitalize',
      marginBottom: '4px',
    },
  },
  inputStyles: {
    '& .MuiInputBase-root': {
      maxHeight: '36px',
    },
  },
  dropDownSectionBoxText: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },

  dropDownSectionBoxFlexText: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '12px',
  },

  servicesDash: {
    paddingTop: '8px',
  },

  inputStylesRange: {
    // height: '36px !important',

    '& .MuiInputBase-root': {
      maxWidth: '130px',
      minWidth: '130px',
      maxHeight: '36px',
    },
  },
}));
