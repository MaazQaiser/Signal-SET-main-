import { ReactComponent as Approved } from 'assets/svg/approvedIcon.svg';
import { ReactComponent as CurrentCustomer } from 'assets/svg/currentCustomer.svg';
import { ReactComponent as Discovery } from 'assets/svg/discovery.svg';
import { ReactComponent as LostProposal } from 'assets/svg/Leads.svg';
import { ReactComponent as LostCustomer } from 'assets/svg/lostCustomer.svg';
import { ReactComponent as NeedAssessment } from 'assets/svg/needAssesment.svg';
import { ReactComponent as Negotiation } from 'assets/svg/negociation.svg';
import { ReactComponent as Nurture } from 'assets/svg/nurturing.svg';
import { ReactComponent as Qualified } from 'assets/svg/qualified.svg';
/**
 * stages values for backend
 */
export const stageValues = {
  // WORKING: 'working',
  // NURTURING: 'nurturing',
  // QUALIFIED: 'qualified',
  // UNQUALIFIED: 'unqualified',
  // NEW_LOCATION: 'open_location',

  APPROVED: 'approved',
  DISCOVERY: 'discovery',
  QUALIFIED: 'qualified',
  NEEDS_ASSESSMENT: 'needs_assessment',
  NEGOTIATION: 'negotiation',
  CURRENT_CUSTOMER: 'current_customer',
  LOST_PROPOSAL: 'lost_proposal',
  LOST_CUSTOMER: 'lost_customer',
  NURTURE: 'nurture',
};

export const STAGES_LABELS = 'sales.locations';

/**
 * stages
 */
export const stageName = {
  newLocation: 'newLocation',
  WORKING: 'working',
  NURTURING: 'nurturing',
  QUALIFIED: 'qualified',
};

/**
 * Location stages
 */

export const stepperDefaultStage = [
  {
    name: 'Approved',
    value: stageValues.APPROVED,
    tooltipContentKey: `${STAGES_LABELS}.approvedTooltip`,
    dialogContentKey: `${STAGES_LABELS}.approvedDialog`,
    icon: <Approved />,
  },
  {
    name: 'Discovery',
    value: stageValues.DISCOVERY,
    tooltipContentKey: `${STAGES_LABELS}.discoveryTooltip`,
    dialogContentKey: `${STAGES_LABELS}.discoveryDialog`,
    icon: <Discovery />,
  },
  {
    name: 'Qualified',
    value: stageValues.QUALIFIED,
    tooltipContentKey: `${STAGES_LABELS}.qualifiedTooltip`,
    dialogContentKey: `${STAGES_LABELS}.qualifiedDialog`,
    icon: <Qualified />,
  },
  {
    name: 'Needs Assessment',
    value: stageValues.NEEDS_ASSESSMENT,
    tooltipContentKey: `${STAGES_LABELS}.need_assessmentTooltip`,
    dialogContentKey: `${STAGES_LABELS}.need_assessmentDialog`,
    icon: <NeedAssessment />,
  },
  {
    name: 'Negotiation',
    value: stageValues.NEGOTIATION,
    tooltipContentKey: '',
    dialogContentKey: '',
    icon: <Negotiation />,
  },
  {
    name: 'Current Customer',
    value: stageValues.CURRENT_CUSTOMER,
    tooltipContentKey: '',
    dialogContentKey: '',
    icon: <CurrentCustomer />,
  },
  {
    name: 'Lost Proposal',
    value: stageValues.LOST_PROPOSAL,
    tooltipContentKey: '',
    dialogContentKey: '',
    icon: <LostProposal />,
  },
  {
    name: 'Lost Customer',
    value: stageValues.LOST_CUSTOMER,
    tooltipContentKey: '',
    dialogContentKey: '',
    icon: <LostCustomer />,
  },
  {
    name: 'Nurture',
    value: stageValues.NURTURE,
    tooltipContentKey: '',
    dialogContentKey: '',
    icon: <Nurture />,
  },
  // Add more button data here
];
