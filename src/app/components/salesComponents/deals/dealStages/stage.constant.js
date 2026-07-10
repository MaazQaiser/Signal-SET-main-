import { ReactComponent as ClosedIcon } from 'assets/svg/Closed.svg';
import { ReactComponent as NegotiationIcon } from 'assets/svg/Negotiation.svg';
// import { ReactComponent as ProposalIcon } from 'assets/svg/Proposal.svg';
// import { ReactComponent as QuestionsIcon } from 'assets/svg/questions.svg';
import { ReactComponent as ProposalCreation } from 'assets/svg/proposalCreation.svg';
// import { ReactComponent as ProposalDelivered } from 'assets/svg/proposalDelivered.svg';

/**
 * stages values for backend
 */
export const stageValues = {
  QUESTIONS: 'questions',
  PROPOSAL: 'proposal',
  NEGOTIATION: 'negotiation',
  CLOSED_LOST: 'closed_lost',
  CLOSED_WON: 'closed_won',
  PROPOSAL_CREATION: 'proposal_creation',
  TERMINATED: 'terminated',
};

/**
 * stages
 */
export const stageName = {
  CLOSED_LOST: 'sales.deals.closedLost',
  CLOSED_WON: 'sales.deals.closedWon',
  CLOSED: 'sales.deals.closed',
};

/** Dialog/tooltip content keys for closed stages (not in stepperDefaultStage) */
export const stageDialogContentKey = {
  CLOSED_LOST: 'sales.deals.closedLostDialogContent',
  CLOSED_WON: 'sales.deals.closedWonDialogContent',
};

export const stepperDefaultStage = [
  {
    stageValue: stageValues.PROPOSAL_CREATION,
    titleKey: 'sales.deals.proposalCreationTitle',
    contentKey: 'sales.deals.proposalCreationContent',
    dialogContentKey: 'sales.deals.proposalCreationDialogContent',
    icon: <ProposalCreation />,
  },
  // {
  //   title: 'Proposal Delivered',
  //   content: "Determine the customer's implmentation plan and adhere to due discount processes.",
  //   dialogContent:
  //     "Determine the customer's implmentation plan and adhere to due discount processes.",
  //   icon: <ProposalDelivered />,
  // },
  {
    stageValue: stageValues.NEGOTIATION,
    titleKey: 'sales.deals.negotiationTitle',
    contentKey: 'sales.deals.negotiationContent',
    dialogContentKey: 'sales.deals.negotiationDialogContent',
    icon: <NegotiationIcon />,
  },
  // {
  //   title: 'Decision',
  //   content: `Determine the customer's implementation plan and adhere to due discount processes`,
  //   dialogContent: `Determine the customer's implementation plan and adhere to due discount processes`,
  //   icon: <NegotiationIcon />,
  // },
  {
    stageValue: stageValues.CLOSED_WON,
    titleKey: 'sales.deals.closedWonTitle',
    contentKey: 'sales.deals.closedWonContent',
    dialogContentKey: 'sales.deals.closedWonDialogContent',
    icon: <ClosedIcon />,
  },
  // Add more button data here
  {
    stageValue: stageValues.TERMINATED,
    titleKey: 'sales.deals.terminatedTitle',
    contentKey: 'sales.deals.terminatedContent',
    dialogContentKey: 'sales.deals.terminatedDialogContent',
    icon: <ClosedIcon />,
  },
];
