import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  calendarHeaderToolbar: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '24px',
    gap: '12px',
  },
  warnWrapper: {
    background: '#FEF0C7',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    borderRadius: '4px',
    padding: '2px 4px',
    width: 'fit-content',
  },
  calendarHeaderToolbarLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '3.2px !important',
    border: `1px solid ${theme.palette.borderSubtle1}`,
    borderRadius: '8px',
  },

  calendarHeaderToolbarLeftText: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },

  calendarHeaderToolbarLeftAction: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',

    '&.MuiButtonBase-root': {
      width: '24px',
      height: '24px',
      minWidth: '24px',
      padding: '0',
      borderRadius: '4px',
    },
    '& svg': {
      width: '8px',
      height: '14px',
    },
  },
  calendarHeaderToolbarRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  loaderBox: {
    '&.MuiSkeleton-root': {
      height: '26px',
      transformOrigin: 0,
      transform: 'none',
      borderRadius: '60px ',
      width: '124px',
    },
  },
  calendarHeaderToolbarSwitch: {
    gap: '4px',
    '&.MuiToggleButtonGroup-root': {
      borderRadius: '8px',
      border: `1px solid ${theme.palette.borderSubtle1}`,
      background: `${theme.palette.surfaceWhite}`,
      height: '32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0 2px',

      '& .MuiToggleButtonGroup-grouped': {
        display: 'flex',
        border: '0 ',
        height: '28px',
        borderRadius: '6px !important',
      },
    },
  },

  calendarHeaderToolbarSwitchBtn: {
    '&.MuiButtonBase-root': {
      color: `${theme.palette.textPlaceholder}`,
      border: '1px solid transparent',
      width: '28px',
      height: '28px',
      padding: '0',
      borderRadius: '6px',
      '&:hover': {
        backgroundColor: `${theme.palette.surfaceGreySubtle}`,
      },

      '&:disabled': {
        color: `${theme.palette.surfaceWhite}`,
        backgroundColor: `${theme.palette.surfaceBrandDisabled}`,
        border: `1px solid #A9DEFF`,
      },

      '&.Mui-selected': {
        backgroundColor: `${theme.palette.surfaceBrand}`,
        color: `${theme.palette.textOnColor}`,
        '&:hover': {
          backgroundColor: `${theme.palette.surfaceBrandHover}`,
        },
      },

      '& svg': {
        display: 'block',
        width: '16px',
        height: '16px',

        '& path': {
          stroke: 'currentColor',
        },
      },
    },
  },

  calendarHeaderToolbarToggle: {
    gap: '4px',
    '&.MuiToggleButtonGroup-root': {
      borderRadius: '8px',
      border: `1px solid ${theme.palette.borderSubtle1}`,
      background: `${theme.palette.surfaceWhite}`,
      height: '32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0 2px',

      '& .MuiToggleButtonGroup-grouped': {
        padding: '4px 16px',
        border: '0 ',
        height: '28px',
        borderRadius: '6px !important',
      },
    },
  },

  calendarHeaderToolbarToggleBtn: {
    '&.MuiButtonBase-root': {
      color: `${theme.palette.textPlaceholder}`,
      border: '1px solid transparent',
      '&:hover': {
        backgroundColor: `${theme.palette.surfaceGreySubtle}`,
      },

      '&:disabled': {
        color: `${theme.palette.surfaceWhite}`,
        backgroundColor: `${theme.palette.surfaceBrandDisabled}`,
        border: `1px solid #A9DEFF`,
      },

      '&.Mui-selected': {
        backgroundColor: `${theme.palette.surfaceBrand}`,
        color: `${theme.palette.textOnColor}`,
        '&:hover': {
          backgroundColor: `${theme.palette.surfaceBrandHover}`,
        },
      },
    },
  },

  //Calendar
  calendar: {
    width: '100%',
    position: 'relative',

    '& ::-webkit-scrollbar': {
      display: 'none',
      width: 0,
    },

    '& ::-webkit-scrollbar-thumb': {
      width: 0,
    },

    '& .fc *': {
      msOverflowStyle: 'none',
      scrollbarWidth: 'none',
    },

    '& .fc-theme-standard td': {
      borderColor: theme.palette.borderSubtle1,
      // borderWidth: 0,
    },

    '& .fc-theme-standard th': {
      borderColor: theme.palette.borderSubtle1,
    },

    '& .fc .fc-timegrid-slot-minor': {
      borderTopStyle: 'solid',
      borderTopColor: `${theme.palette.surfaceGreyLight} !important`,
    },

    '& .fc-theme-standard .fc-list': {
      border: `1px solid ${theme.palette.borderSubtle1}`,
      borderRadius: '8px',
      overflow: 'hidden',
    },

    '& .fc-listMonth-view table th': {
      position: 'static !important',
    },

    '& .fc-list-event': {
      display: 'none',
    },

    '& .fc-theme-standard .fc-list-day-cushion': {
      backgroundColor: theme.palette.surfaceWhite,
      textAlign: 'left',
    },

    '& .fc-list-empty': {
      backgroundColor: theme.palette.surfaceWhite,
    },

    '& .fc .fc-list-day-cushion': {
      padding: '16px',
    },
    '& .fc .fc-view-harness': {
      height: 'fit-content !important',
    },
    '& .fc .fc-view-harness-active > .fc-view': {
      height: 'calc(100vh - 231px)',
      overflow: 'auto',
    },

    '& .fc .fc-scrollgrid': {
      height: 'calc(100vh - 231px)',
      // borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
      borderLeft: 0,
      borderRight: 0,
      overflow: 'hidden',
      borderRadius: 0,
    },

    '& .fc-theme-standard td:last-child': {
      borderBottom: 0,
      borderRight: 0,
    },

    '& .fc .fc-scrollgrid-section-liquid > td ': {
      border: 0,
    },

    '& .fc .fc-resource-timeline-divider': {
      width: '1px',
      backgroundColor: '#e6e6e7',
    },

    '& .fc-theme-standard th:last-child': {
      borderRight: 0,
    },

    '& .fc-datagrid-cell-main': {
      fontSize: '14px',
      color: theme.palette.textPrimary,
      fontWeight: '500',
      whiteSpace: 'normal',
    },

    '& .fc .fc-timeline-header-row:last-child .fc-timeline-slot-frame': {
      height: '48px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    },

    '& .fc-theme-standard th:first-child': {
      borderRight: 0,
    },

    '& .fc-direction-ltr .fc-timegrid-col-events': {
      margin: 0,
    },

    '& .fc-event': {
      border: 0,
      backgroundColor: 'transparent',
      width: '90%',
      // marginBottom: '10px',

      '&:focus': {
        boxShadow: 'none',

        '&:focus::after': {
          backgroundColor: 'inherit',
        },
      },

      '&:focus-visible': {
        outline: 'none',
      },
    },

    '& .fc-direction-ltr .fc-daygrid-event.fc-event-end': {
      margin: 'unset',
    },

    '& .fc-direction-ltr .fc-daygrid-event.fc-event-start': {
      margin: 'unset',
      width: 'fit-content',
    },

    '& .fc .fc-daygrid-day.fc-day-today': {
      backgroundColor: '#ffffff ',
    },

    '& .fc-col-header-cell.fc-day.fc-day-today': {
      backgroundColor: '#ffffff',
    },

    '& .fc .fc-timegrid-col.fc-day-today': {
      backgroundColor: '#E5F6FF ',
    },

    '& .fc .fc-col-header-cell-cushion': {
      display: 'block',
      padding: '0 12px',
    },

    '& table': {
      borderRadius: '8px',
      width: '100% !important',

      '& .fc-timegrid-body': {
        width: '100%',
      },

      '& .fc-timegrid-slot-label-cushion': {
        padding: 0,
      },
    },

    '& .fc-v-event .fc-event-title-container': {
      flexGrow: 0,
      flexShrink: 0,
    },

    '& .fc-timegrid-event-harness-inset .fc-timegrid-event': {
      boxShadow: 'none',
      marginBottom: '5px',
    },

    '& .fc-timegrid-event.fc-event-mirror': {
      boxShadow: 'none',
    },

    '& .fc-timegrid-more-link': {
      boxShadow: 'none',
    },

    '& .fc-daygrid-event-harness::before': {
      display: 'none',
    },

    '& .fc-daygrid-event-harness::after': {
      display: 'none',
    },

    '& .fc-timegrid-event .fc-event-main': {
      padding: 0,
      // height: 'auto',
    },

    '& .fc-timegrid-body .fc-timegrid-slots': {
      zIndex: 2,
    },

    '& .fc-timegrid-body .fc-timegrid-slots .fc-timegrid-slot': {
      height: '36px',
    },

    '& .fc-time-grid .fc-slats td': {
      height: '36px',
    },

    '& .fc-daygrid-dot-event': {
      padding: 0,
    },

    '& .fc-timegrid-body': {
      width: '100% !important',
    },

    '& .fc-daygrid-body': {
      width: '100% !important',
    },

    '& .fc .fc-daygrid-day-frame': {
      minHeight: '140px',
      padding: '6px',
      display: 'flex',
      flexDirection: 'column',
      flex: '1',
      height: '100%',
    },

    // day view?
    '& .fc-dayGridDay-view': {
      backgroundColor: '#ffffff !important',
      '& .fc-daygrid-day-frame': {
        backgroundColor: '#ffffff !important',
      },
      '& .MuiTypography-root': {
        fontSize: '14px',
        fontWeight: '400',
        lineHeight: 'normal',
      },
    },
    // week view?

    '& .fc-dayGridWeek-view': {
      '& .fc-daygrid-day-frame': {
        minHeight: '140px',
        padding: '12px 0 !important',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: '#ffffff !important',

        '& .fc-daygrid-day-events': {
          // border: '2px solid #146DFF !important',
          borderRadius: '8px',
          // padding: '12px',
        },
        '& .fc-daygrid-day-top': {
          backgroundColor: '#E5F6FF !important',
          '& .fc-daygrid-day-number': {
            color: '#0032A0 !important',
          },
        },
      },
    },
    '& .fc-direction-ltr .fc-timegrid-slot-label-frame': {
      textAlign: 'left',
    },

    '& .fc-list-day.fc-day-today': {
      '& th > .fc-list-day-cushion ': {
        backgroundColor: '#E6EBF6 ',
      },
    },
    '& .fc-more-popover': {
      backgroundColor: '#ffffff !important',
      borderRadius: '8px',
      '& .fc-popover-header': {
        display: 'none',
      },
      '& .fc-popover-body': {
        padding: '14px !important',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        '& .fc-popover-event': {
          '& .MuiTypography-root': {
            color: '#0032A0',
            fontSize: '12px',
            fontWeight: '400',
            lineHeight: 'normal',
          },
        },
      },
    },
    //month
    '& .fc-dayGridMonth-view': {
      '& .fc-daygrid-day-top': {
        fontSize: '16px',
        fontStyle: 'normal',
        fontWeight: 500,
        lineHeight: '24px',
        color: theme.palette.textPrimary,
        flexDirection: 'row',
        opacity: 1,

        '& .fc-daygrid-day-number': {
          padding: 0,
          fontSize: '12px',
          fontWeight: '400',
          lineHeight: '24px',
        },
      },

      '& .fc-daygrid-day-events': {
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        marginTop: 'auto',

        '&::before': {
          display: 'none',
        },

        '&::after': {
          display: 'none',
        },

        '& .fc-daygrid-event-harness': {
          marginTop: 'auto !important',
        },
      },

      '& .fc-daygrid-day-frame': {
        minHeight: '140px',
        padding: '12px',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      },

      '& .fc-daygrid-day-bottom': {
        // display: 'none',
      },

      '& .fc-event': {
        width: '100%',
      },

      '& .fc-day-today': {
        background: `#E5F6FF !important`,

        '& .fc-daygrid-day-top': {
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '25px',
          height: '26px',
          borderRadius: '19px',
          backgroundColor: theme.palette.surfaceBrand,
          color: theme.palette.textOnColor,
        },
      },
    },
  },

  calendarTimeSlot: {
    textTransform: 'uppercase',
    padding: '0 8px',
    textAlign: 'left',
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary3,
    },
  },

  dutyRedMonth: {
    '& > div > div': {
      background: theme.palette.surfaceAlertStrong,
    },
  },

  dutyGreenMonth: {
    '& > div > div': {
      background: theme.palette.surfaceSuccessStrong,
    },
  },

  dutyBlueMonth: {
    '& > div > div': {
      background: theme.palette.surfaceBrand,
    },
  },

  dutyYellowMonth: {
    '& > div > div': {
      background: theme.palette.surfaceWarningStrong,
    },
  },

  eventContentMonthAlert: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
  },

  eventContent: {
    backgroundColor: theme.palette.surfaceGreySubtle,
    padding: '6px 8px',
    overflow: 'hidden',
    borderRadius: '4px',
    cursor: 'pointer',
    display: 'flex',
    width: '100%',
    gap: '4px',
    marginLeft: '5px',
    marginTop: '3.5px',
    marginBottom: '5px',
  },
  eventContentWeek: {
    flexDirection: 'column',
    gap: '4px',
  },

  eventContentView: {
    backgroundColor: theme.palette.surfaceWhite,
    padding: '2px',
    borderRadius: '6px',
    overflow: 'hidden',
    height: '100%',
  },

  eventDetailHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: '4px',
  },

  eventContentFlex: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    height: '100%',
    borderRadius: '4px',
    padding: '6px 6px 6px 8px',
    margin: 0,
  },
  dutyYellowBg: {
    backgroundColor: '#FFF7E1 !important',
  },
  dutyGreenBg: {
    backgroundColor: `${theme.palette.surfaceSuccessSubtle} !important`,
  },
  dutyBlueBg: {
    backgroundColor: `${theme.palette.surfaceBrandSubtle} !important`,
  },

  dutyRedBg: {
    backgroundColor: `${theme.palette.surfaceAlertSubtle} !important`,
  },

  dutyGreen: {
    borderLeft: `3px solid ${theme.palette.surfaceSuccessStrong}`,
    borderColor: theme.palette.surfaceSuccessStrong,
  },
  dutyRed: {
    borderLeft: `3px solid ${theme.palette.borderAlert}`,
    borderColor: theme.palette.borderAlert,
  },
  dutyBlue: {
    borderLeft: `3px solid ${theme.palette.borderBrand}`,
    borderColor: theme.palette.borderBrand,
  },
  dutyPurple: {
    borderLeft: `3px solid ${theme.palette.borderPurple}`,
    borderColor: theme.palette.borderPurple,
  },

  dutyYellow: {
    borderLeft: `3px solid ${theme.palette.borderWarning}`,
    borderColor: theme.palette.borderWarning,
  },

  eventDetail: {
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },

  eventSiteName: {
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    display: 'block',
    '&.MuiTypography-root': {
      color: theme.palette.textPlaceholder,
    },
  },

  reassignedName: {
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    textTransform: 'capitalize',
    display: 'block',
    '&.MuiTypography-root': {
      color: theme.palette.textPlaceholder,
    },
  },

  eventSiteNameColor: {
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    display: 'block',
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },

  eventAvatar: {
    '&.MuiAvatar-root': {
      width: '16px',
      height: '16px',
      border: `1px solid ${theme.palette.borderSubtle1}`,
    },
  },

  eventAvatarReassignedOfficer: {
    position: 'relative',
    right: '7px',
    zIndex: '2',
    '&.MuiAvatar-root': {
      width: '16px',
      height: '16px',
      border: `1px solid ${theme.palette.borderSubtle1}`,
    },
  },

  reassignedFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '4px',
    height: '16px',
  },

  reassignedFooterFlex: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },

  reassignedFooterFlexGap: {
    display: 'flex',
    alignItems: 'center',
  },

  reassignedOfficerFlex: {
    display: 'flex',
  },

  calendarHeaderCell: {
    textAlign: 'center',
    height: ' 48px',
    display: 'flex',
    alignItems: 'center',
    padding: '12px 0',
    gap: '10px',
  },

  scheduleBoxIcons: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },

  calendarHeaderCellDay: {
    textTransform: 'uppercase',
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary3,
    },
  },

  calendarHeaderCellDate: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },

  calendarHeaderMonthCell: {
    width: 'fit-content',
    textAlign: 'center',
    height: '32px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
    padding: '12px 0',
  },

  calendarHeaderMonthCellDate: {
    textTransform: 'uppercase',
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary3,
    },
  },

  calendarListView: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '45px',
  },

  calendarListViewTime: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    width: '135px',
  },

  calendarListViewDate: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },

  calendarListViewDay: {
    '&.MuiTypography-root': {
      color: theme.palette.textPlaceholder,
      textTransform: 'uppercase',
    },
  },

  calendarListViewRight: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: '16px',
    width: '100%',
  },

  calendarListViewEvent: {
    display: 'flex',
    alignItems: 'center',
    gap: '35px',
    cursor: 'pointer',
  },

  calendarListViewEventBody: {
    display: 'flex',
    alignItems: 'center',
    gap: '35px',
  },

  calendarListViewDutyName: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
    minWidth: '175px',
  },

  calendarListViewDutyTime: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
    minWidth: '175px',
  },

  calendarListViewtooltip: {
    display: 'flex',
    alignItems: 'center',
    columnGap: '4px',
  },

  calendarListEmpty: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
  },

  calendarListViewNoShiftTitle: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
      marginTop: '24px',
      textAlign: 'center',
    },
  },

  calendarListViewNoShiftText: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary3,
      marginTop: '16px',
      textAlign: 'center',
    },
  },

  highlightCurrentDate: {
    width: '28px',
    height: '28px',
    borderRadius: '14px',
    backgroundColor: '#E6EBF6',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    '&.MuiTypography-root': {
      color: '#ffffff',
      width: '25px',
      height: '26px',
      display: 'flex',
      alignItems: 'center',
      borderRadius: '19px',
      justifyContent: 'center',
      backgroundColor: '#146DFF',
    },
  },

  highlightCurrentDay: {
    '&.MuiTypography-root': {
      color: theme.palette.textBrand,
    },
  },
  dayViewWrapper: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '8px',
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    paddingBottom: '8px',

    '&:last-child': {
      borderBottom: 0,
    },
  },
  dayEventContent: {
    padding: '6px 8px',
    overflow: 'hidden',
    borderRadius: '4px',
    cursor: 'pointer',
    display: 'flex',
    width: '100%',
    gap: '4px',
    alignItems: 'flex-start',
    background: theme.palette.surfaceGreySubtle,
  },

  calendarDayCustom: {
    overflowY: 'auto',
  },

  dayLocationName: {
    padding: '8px 0',
    alignItems: 'flex-start',
    display: 'flex',
    justifyContent: 'flex-start',
    // textTransform: 'capitalize',
    color: theme.palette.textPrimary,
  },

  borderBottom: {
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
  },

  dayViewBorder: {
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    '&:last-child': {
      borderBottom: 0,
    },
  },
  missedHitsButton: {
    '&.MuiButtonBase-root': {
      minWidth: 'auto',
      height: 'auto',
      padding: '2px 16px',
      borderRadius: '60px',
      background: theme.palette.surfaceAlertSubtle,
      borderColor: theme.palette.surfaceAlertSubtle,
      fontSize: '12px',
      fontWeight: '500',

      '& .MuiButton-icon': {
        '& svg': {
          width: '10px',
          height: '10px',
          '& path': {
            stroke: theme.palette.textAlert,
          },
        },
      },
    },
  },

  newReassignedFooter: {
    '& span.MuiTypography-root': {
      maxWidth: '80px',
      [theme.breakpoints.down('mlg')]: {
        maxWidth: '50px',
      },
      [theme.breakpoints.down('lg')]: {
        maxWidth: '30px',
      },
    },
  },
  notesIconDiv: {
    display: 'flex',
    gap: '4px',
    alignItems: 'center',
  },
  eventContentContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '3px !important',
    '& .MuiTypography-root': {
      color: '#262527',
      fontSize: '10px',
      fontWeight: '400',
      lineHeight: '12.448px',
      cursor: 'pointer',
      textTransform: 'capitalize',
      whiteSpace: 'pre-wrap',
    },
  },
  eventBlueDot: {
    width: '4.149px',
    height: '4.149px',
    borderRadius: '50%',
    backgroundColor: '#146DFF',
    flexShrink: 0,
  },
  eventPopoverContent: {
    padding: '24px',
    width: '400px',
  },
  eventPopoverContentHeader: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  eventPopoverIconBtn: {
    cursor: 'pointer',
    color: '#6A6A70',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '24px',
    height: '24px',
    borderRadius: '4px',
    '& svg': {
      width: '16px',
      height: '16px',
      '& path': {
        fill: '#6A6A70',
      },
    },
  },
  eventPopoverContentBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  eventPopoverTimeDateRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  eventPopoverTitleText: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
      fontSize: '16px',
      fontWeight: '600',
      lineHeight: 'normal',
    },
  },
  eventPopoverTitleRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '16px',
  },
  eventPopoverBlueSquare: {
    minWidth: '16px',
    minHeight: '16px',
    backgroundColor: '#146DFF',
    borderRadius: '4px',
  },
  eventPopoverTitleContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  eventPopoverTimeDateText: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
      fontSize: '14px',
      fontWeight: '400',
      lineHeight: '24px',
    },
  },
  eventPopoverWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  meetingLinkText: {
    '&.MuiTypography-root': {
      color: '#6A6A70',
      fontSize: '14px',
      fontWeight: '400',
      lineHeight: '24px',
    },
  },
  userListWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  imageWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '34px',
    height: '34px',
    borderRadius: '50%',
    backgroundColor: '#E6EBF6',
    overflow: 'hidden',
    border: '1px solid #e6e6e7',
    '& img': {
      width: '100%',
      height: '100%',
      borderRadius: '50%',
    },
  },
  userNameText: {
    '&.MuiTypography-root': {
      color: '#000',
      fontSize: '14px',
      fontWeight: '500',
      lineHeight: 'normal',
      textTransform: 'capitalize',
    },
  },
  guestText: {
    '&.MuiTypography-root': {
      color: '#6A6A70',
      fontSize: '14px',
      fontWeight: '500',
      lineHeight: '24px',
    },
  },
  iconWrapper: {
    padding: '4px 0',
  },
  guestListWrapper: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '16px',
    flexDirection: 'column',
  },
  menuIcon: {
    width: '16px',
    height: '16px',
    marginRight: '6px',
    '& path': {
      stroke: '#86868B',
    },
  },
  moreEventsText: {
    '&.MuiTypography-root': {
      color: '#0032A0',
      fontSize: '10px',
      fontWeight: '500',
      lineHeight: 'normal',
    },
  },
  weekEventContentContainer: {
    border: '1px solid #146dff',
    borderRadius: '3px',
    padding: '8px 6px !important',
    width: '100%',
    backgroundColor: '#ffffff',
    position: 'relative',
  },
  dayEventContentContainer: {
    border: '1px solid #146dff',
    borderRadius: '3px',
    padding: '8px 6px !important',
    width: '100%',
    backgroundColor: '#ffffff',
    position: 'relative',
  },
}));
