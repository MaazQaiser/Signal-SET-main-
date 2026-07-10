import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  activityDetailsWrapper: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    width: '100%',
    gap: '16px',
    marginTop: '24px',
  },
  activityDetails: {
    flexBasis: '100%',
    textAlign: 'left',
  },
  activityDetailsInner: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: '4px',
  },
  // activityDate: {
  //   flexBasis: '20%',
  //   textAlign: 'right',
  // },
  activityStatus: {
    fontWeight: '400',
    display: 'block',
    color: theme.palette.textPrimary,
    fontSize: '14px',
  },
  tabTypo: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary3,
      fontSize: '14px',
    },
  },
  cals: {
    marginRight: '16px',
  },
  wrapperBox: {
    display: 'flex',
    alignContent: 'center',
  },
  notesTime: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary3,
    },
  },
  accordionRoot: {
    boxShadow: 'none',
    border: 'none',
    '&:before': {
      display: 'none',
    },
    '&.MuiAccordion-root': {
      '&.Mui-expanded': {
        margin: '0 !important',
        height: 'unset !important',
      },
    },
  },
  accordionSummary: {
    '&.MuiButtonBase-root ': {
      padding: 0,
      minHeight: 'unset !important',
    },

    '& .MuiAccordionSummary-content': {
      margin: '0 !important',
      '& .Mui-expanded': {
        margin: '0 !important',
        minHeight: 'unset !important',
      },
    },
  },
  activityStatusByText: {
    color: theme.palette.textSecondary3,
    fontSize: '14px',
    lineHeight: '20px',
    fontWeight: '400',
  },
  descriptionText: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary3,
      fontSize: '14px',
      lineHeight: '20px',
      fontWeight: '400',
    },
  },
  accordionDetails: {
    '&.MuiAccordionDetails-root': {
      padding: '4px 0',
    },
    '&.Mui-expanded': {
      margin: '0 !important',
      height: 'unset !important',
    },
  },
  accordionSummaryText: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary3,
      fontSize: '12px',
      fontWeight: '400',
    },
    '&.MuiAccordionSummary-root': {
      height: 'unset !important',
      '& .Mui-expanded': {
        margin: '0 !important',
        height: 'unset !important',
      },
    },
  },
  accordionSummaryContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '1px',
    color: theme.palette.textSecondary3,
  },
  accordionSummaryIcon: {
    transform: 'rotate(180deg)',
    transition: 'transform 200ms ease',
    '& path': {
      fill: theme.palette.textSecondary3,
    },
  },

  //accordian

  row: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr 1fr',
    gap: '24px',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
  },
  cell: {
    display: 'flex',
    alignItems: 'flex-start',
    flexDirection: 'column',
    gap: '2px',
  },
  priorityRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '12px',
  },
  typeChip: {
    '&.MuiChip-root': {
      background: theme.palette.surfaceWarningSubtle,
      color: theme.palette.textWarning,
      height: '22px !important',
    },
  },
  dangerDot: {
    color: '#F44336',
    '&.MuiSvgIcon-root': {
      height: '8px',
      width: '8px',
    },
  },
  namee: {
    '&.MuiTypography-root': {
      color: '#5B5B5F',
      lineHeight: '12px',
      marginBottom: '2px',
    },
  },
  activityDetails2: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    borderTop: `1px solid ${theme.palette.borderSubtle1}`,
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    padding: '12px 0 !important',
    marginTop: '8px',
    marginBottom: '8px',
  },
  description: {
    marginTop: '2px',
    '& a': {
      color: '#146DFF',
      fontSize: '12px',
      fontWeight: '400',
      lineHeight: 'normal',
    },
  },
  guestsContainer: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  meetingLink: {
    '&.MuiLink-root': {
      color: '#146DFF',
      fontSize: '12px',
      fontWeight: '400',
      lineHeight: 'normal',
    },
  },
  sectionSpacing: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  expandButtonWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    userSelect: 'none',
    mt: 0.5,
  },
  expandButtonText: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary3,
      fontSize: '12px',
      fontWeight: '400',
      cursor: 'pointer',
    },
  },
  expandButtonIcon: {
    fontSize: 18,
    cursor: 'pointer',
    transform: 'rotate(180deg)',
    transition: 'transform 200ms ease',
    '& path': {
      fill: theme.palette.textSecondary3,
    },
  },
}));
