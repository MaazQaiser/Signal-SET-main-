import { ReactComponent as AssignedIcon } from 'src/assets/svg/AssignedIcon.svg';
import { ReactComponent as CallReceivedIcon } from 'src/assets/svg/CallReceivedIcon.svg';
import { ReactComponent as DispacthClosedIcon } from 'src/assets/svg/DispacthClosedIcon.svg';
import { ReactComponent as incidentToReportIcons } from 'src/assets/svg/incidentToReportIcons.svg';
import { ReactComponent as NewAlramIcon } from 'src/assets/svg/NewAlramIcon.svg';
import { ReactComponent as OnSiteAllClearIcon } from 'src/assets/svg/OnSiteAllClearIcon.svg';
import { ReactComponent as OnSiteIcon } from 'src/assets/svg/OnSiteIcon.svg';
import { ReactComponent as OnTheWayIcon } from 'src/assets/svg/OnTheWayIcon.svg';
import { ReactComponent as ReportCompletedIcon } from 'src/assets/svg/ReportCompletedIcon.svg';

export const DISPATCH_STATUS_ENUM = {
  unassigned: {
    label: 'Unassigned',
    value: 'unassigned',
    color: 'primary',
    statusClass: '',
    icon: '',
  },
  assigned: {
    statusClass: 'assigned',
    label: 'Assigned',
    value: 'assigned',
    color: 'primary',
    icon: AssignedIcon,
  },
  new_alarm: {
    label: 'New Alarm',
    value: 'new_alarm',
    color: 'error',
    icon: NewAlramIcon,
    statusClass: 'newAlarm',
  },
  call_received: {
    label: 'Call Received',
    value: 'call_received',
    color: 'success',
    icon: CallReceivedIcon,
    statusClass: 'callReceived',
  },
  acknowledged: {
    statusClass: 'acknowledged',
    label: 'Acknowledged',
    value: 'acknowledged',
    color: 'info',
    icon: NewAlramIcon,
  },
  on_the_way: {
    statusClass: 'onTheWay',
    label: 'On the Way',
    value: 'on_the_way',
    color: 'error',
    icon: OnTheWayIcon,
  },
  on_site: {
    statusClass: 'onSite',
    label: 'On Site',
    color: 'error',
    value: 'on_site',
    icon: OnSiteIcon,
  },
  on_site_all_clear: {
    statusClass: 'onSiteAllClear',
    label: 'On Site: All Clear',
    value: 'on_site_all_clear',
    color: 'success',
    icon: OnSiteAllClearIcon,
  },
  incident_to_report: {
    statusClass: 'incidentToReport',
    label: 'Incident To Report',
    color: 'error',
    value: 'incident_to_report',
    icon: incidentToReportIcons,
  },
  completed: {
    statusClass: 'reportCompleted',
    label: 'Completed',
    value: 'completed',
    color: 'success',
    icon: ReportCompletedIcon,
  },
  close: {
    statusClass: 'close',
    label: 'Close',
    value: 'close',
    color: 'info',
    icon: DispacthClosedIcon,
  },
};

export const TIME_ELAPSED_OPTIONS = [
  {
    label: 'All',
    value: '',
  },
  {
    label: 'Upto 10 mins',
    value: 'upto-10',
  },
  {
    label: '10-30',
    value: '10-30',
  },
  {
    label: '30-60',
    value: '30-60',
  },
  {
    label: 'More than 1 hour',
    value: 'more_than_1_hour',
  },
];

export const SHIFT_TIME_OPTIONS = [
  {
    label: '1 Hour',
    value: 60,
  },
  {
    label: '2 Hours',
    value: 120,
  },
  {
    label: '4 Hours',
    value: 240,
  },
  {
    label: '6 Hours',
    value: 360,
  },
  {
    label: '8 Hours',
    value: 480,
  },
  {
    label: '10 Hours',
    value: 600,
  },
  {
    label: '12 Hours',
    value: 720,
  },
];

export const DISPATCH_STATUS_OPTIONS = Object.keys(DISPATCH_STATUS_ENUM).map((key) => ({
  value: key,
  label: DISPATCH_STATUS_ENUM[key].label,
}));

export const DEFAULT_CENTER = {
  lat: 40.7128,
  lng: -74.006,
};
