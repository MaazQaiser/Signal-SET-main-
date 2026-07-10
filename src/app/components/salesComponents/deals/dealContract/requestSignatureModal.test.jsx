import { createTheme, ThemeProvider } from '@mui/material/styles';
import { StylesProvider } from '@mui/styles';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
// import SignatureCanvas from 'react-signature-canvas';
import { createMockStore, TestWrapper } from 'src/setupTests';

import DealContract, { approvalRequestStatusEnum, ContractActions, publishStatuses } from './index';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: { language: 'en' },
  }),
}));

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: () => ({ symbol: '$', currencyCode: 'USD', dateFormat: 'MM/DD/YYYY' }),
}));

jest.mock('src/services/deal.service.js', () => ({
  createDealAddendumContract: jest.fn(() =>
    Promise.resolve({ statusCode: 200, data: { dealId: 1 } }),
  ),
  createDealCloneContract: jest.fn(() => Promise.resolve({ statusCode: 200, data: { dealId: 2 } })),
  getContractPDF: jest.fn(() => Promise.resolve({ statusCode: 200, data: { attachment: 'url' } })),
  getSignedContractPDF: jest.fn(() =>
    Promise.resolve({ statusCode: 200, data: { attachment: 'url' } }),
  ),
  publishContract: jest.fn(() => Promise.resolve({ statusCode: 200, data: { contract: {} } })),
  requestSignatures: jest.fn(() => Promise.resolve({ statusCode: 200, message: 'Success' })),
  signContract: jest.fn(() => Promise.resolve({ statusCode: 200 })),
  terminateContract: jest.fn(() => Promise.resolve({ statusCode: 200, data: { contract: {} } })),
}));

jest.mock('react-toastify', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
    info: jest.fn(),
  },
}));

jest.mock('src/helper/utilityFunctions', () => ({
  checkIfDateIsPassed: jest.fn(() => false),
  isSameDate: jest.fn(() => false),
}));

jest.mock('../../contractCreation/addServices/helper.js', () => ({
  getCurrentDate: jest.fn(() => ({ startOf: () => ({ isBefore: () => false }) })),
}));

jest.mock('src/app/router/utils/history.jsx', () => ({
  push: jest.fn(),
}));

jest.mock('src/utils/files/index.js', () => ({
  openFile: jest.fn(),
}));

jest.mock('src/hoc/renderIfHasPermission.jsx', () => ({
  __esModule: true,
  default: ({ children }) => <>{children}</>,
}));

jest.mock('./addSignModal', () => ({
  __esModule: true,
  default: ({ open, handleClose, contractData, onAddSignClick }) =>
    open ? (
      <div data-testid="add-sign-modal">
        <span data-testid="add-sign-modal-open">Add Sign Modal</span>
        <button type="button" onClick={handleClose} data-testid="add-sign-modal-close">
          Close
        </button>
        {contractData?.signees?.map((s) => (
          <button
            key={s.id}
            type="button"
            data-testid={`add-sign-${s.id}`}
            onClick={() => onAddSignClick?.(s)}
          >
            Add Sign {s.name}
          </button>
        ))}
      </div>
    ) : null,
}));

jest.mock('./requestSignatureModal', () => ({
  __esModule: true,
  default: ({ open }) =>
    open ? <div data-testid="request-signature-modal">Request Signature</div> : null,
}));

jest.mock('./updateRequestModal', () => ({
  __esModule: true,
  default: ({ open }) =>
    open ? <div data-testid="update-request-modal">Update Request</div> : null,
}));

jest.mock('src/app/public/pages/signContract/signContractModal', () => ({
  __esModule: true,
  default: ({ open, handleCancelButton }) =>
    open ? (
      <div data-testid="sign-contract-modal">
        <span>Sign Contract Modal</span>
        <button type="button" onClick={handleCancelButton} data-testid="sign-contract-cancel">
          Cancel
        </button>
      </div>
    ) : null,
}));

jest.mock('../publishContractModal/index.jsx', () => ({
  __esModule: true,
  default: () => <div data-testid="publish-contract-modal">Publish Contract</div>,
}));

jest.mock('./addendumModal/index.jsx', () => ({
  __esModule: true,
  default: () => <div data-testid="addendum-modal">Addendum</div>,
}));

jest.mock('./terminateModal/index.jsx', () => ({
  __esModule: true,
  default: () => <div data-testid="terminate-modal">Terminate</div>,
}));

jest.mock('src/app/components/common/loader/index.jsx', () => ({
  __esModule: true,
  default: () => <div data-testid="loader">Loading</div>,
}));

const defaultContractData = {
  details: {
    name: 'Test Contract',
    amount: 10000,
    createdAt: '2024-01-15T10:00:00Z',
    createdBy: 'Test User',
    isPublishable: false,
    isEditable: false,
    isUploaded: false,
    isPublished: true,
    isTerminated: false,
    status: 'published_and_signed',
    plan: 2,
    hasAddendum: false,
    acknowledgedAt: false,
    type: 'standard',
    stripeEnabled: false,
    approvalRequestStatus: 'not_assigned',
    approvalRequired: false,
    hasPendingSignatures: true,
    startDate: '01/15/2025',
    endDate: '12/31/2025',
  },
  paymentTerms: {},
  signees: [
    {
      id: 1,
      name: 'John Doe',
      email: 'john@test.com',
      signatureStatus: 'Pending Sign',
      resourceId: 'r1',
    },
    {
      id: 2,
      name: 'Jane Doe',
      email: 'jane@test.com',
      signatureStatus: 'Signed',
      resourceId: 'r2',
    },
  ],
};

const defaultData = {
  dealStage: { key: 'won' },
  franchiseInfo: { franchiseId: 'f1' },
};

const defaultProps = {
  dealId: 100,
  contractData: defaultContractData,
  setContractData: jest.fn(),
  handleShowContractForm: jest.fn(),
  openModalCloseDeal: jest.fn(),
  isDealClosed: true,
  franchiseId: 'f1',
  setData: jest.fn(),
  data: defaultData,
};

const renderComponent = (props = {}) => {
  const theme = createTheme();
  return render(
    <StylesProvider injectFirst>
      <ThemeProvider theme={theme}>
        <TestWrapper store={createMockStore()}>
          <DealContract {...defaultProps} {...props} />
        </TestWrapper>
      </ThemeProvider>
    </StylesProvider>,
  );
};

describe('DealContract', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('exports', () => {
    it('exports ContractActions constants', () => {
      expect(ContractActions.TERMINATE_CONTRACT).toBe('terminateContract');
      expect(ContractActions.DELETE_CONTRACT).toBe('deleteContract');
      expect(ContractActions.PUBLISH_WITHOUT_SIGN).toBe('publishWithoutSign');
    });

    it('exports publishStatuses constants', () => {
      expect(publishStatuses.UNPUBLISHED).toBe('unpublished_and_unsigned');
      expect(publishStatuses.PUBLISHED_WITH_SIGN).toBe('published_and_signed');
      expect(publishStatuses.TERMINATED).toBe('terminated');
    });

    it('exports approvalRequestStatusEnum constants', () => {
      expect(approvalRequestStatusEnum.NOT_SUBMITTED).toBe('not_assigned');
      expect(approvalRequestStatusEnum.PENDING).toBe('pending');
      expect(approvalRequestStatusEnum.APPROVED).toBe('approved');
    });
  });

  describe('render', () => {
    it('renders contract name and amount', () => {
      renderComponent();
      expect(screen.getByText('Test Contract')).toBeInTheDocument();
      expect(screen.getByText(/\$10,000/)).toBeInTheDocument();
    });

    it('renders created date and created by', () => {
      renderComponent();
      expect(screen.getByText(/sales.contract.created/)).toBeInTheDocument();
      expect(screen.getByText(/Test User/)).toBeInTheDocument();
    });

    it('renders published status chip when contract is published', () => {
      renderComponent();
      expect(screen.getByText('Published and signed')).toBeInTheDocument();
    });

    it('renders Signature dropdown button when hasPendingSignatures is true', () => {
      renderComponent();
      expect(screen.getByRole('button', { name: /sales.contract.signature/i })).toBeInTheDocument();
    });

    it('does not render Signature button when hasPendingSignatures is false', () => {
      renderComponent({
        contractData: {
          ...defaultContractData,
          details: { ...defaultContractData.details, hasPendingSignatures: false },
        },
      });
      expect(
        screen.queryByRole('button', { name: /sales.contract.signature/i }),
      ).not.toBeInTheDocument();
    });

    it('renders Publish Contract button when isPublishable and not terminated', () => {
      renderComponent({
        contractData: {
          ...defaultContractData,
          details: {
            ...defaultContractData.details,
            isPublished: false,
            isPublishable: true,
          },
        },
      });
      expect(
        screen.getByRole('button', { name: /sales.contract.publishContract/i }),
      ).toBeInTheDocument();
    });
  });

  describe('Signature dropdown', () => {
    it('opens menu when Signature button is clicked', () => {
      renderComponent();
      const signatureBtn = screen.getByRole('button', { name: /sales.contract.signature/i });
      fireEvent.click(signatureBtn);
      expect(screen.getByRole('menuitem', { name: /sales.contract.addSign/i })).toBeInTheDocument();
      expect(
        screen.getByRole('menuitem', { name: /sales.contract.requestSign/i }),
      ).toBeInTheDocument();
    });

    it('opens Add Sign modal when Add Sign menu item is clicked', () => {
      renderComponent();
      fireEvent.click(screen.getByRole('button', { name: /sales.contract.signature/i }));
      fireEvent.click(screen.getByRole('menuitem', { name: /sales.contract.addSign/i }));
      expect(screen.getByTestId('add-sign-modal')).toBeInTheDocument();
      expect(screen.getByTestId('add-sign-modal-open')).toHaveTextContent('Add Sign Modal');
    });

    it('opens Sign Contract modal when Add Sign is clicked for a signee in Add Sign modal', () => {
      renderComponent();
      fireEvent.click(screen.getByRole('button', { name: /sales.contract.signature/i }));
      fireEvent.click(screen.getByRole('menuitem', { name: /sales.contract.addSign/i }));
      expect(screen.getByTestId('add-sign-modal')).toBeInTheDocument();
      fireEvent.click(screen.getByTestId('add-sign-1'));
      expect(screen.queryByTestId('add-sign-modal')).not.toBeInTheDocument();
      expect(screen.getByTestId('sign-contract-modal')).toBeInTheDocument();
    });

    it('closes Sign Contract modal when cancel is clicked', () => {
      renderComponent();
      fireEvent.click(screen.getByRole('button', { name: /sales.contract.signature/i }));
      fireEvent.click(screen.getByRole('menuitem', { name: /sales.contract.addSign/i }));
      fireEvent.click(screen.getByTestId('add-sign-1'));
      expect(screen.getByTestId('sign-contract-modal')).toBeInTheDocument();
      fireEvent.click(screen.getByTestId('sign-contract-cancel'));
      expect(screen.queryByTestId('sign-contract-modal')).not.toBeInTheDocument();
    });
  });

  describe('Add Sign modal', () => {
    it('closes Add Sign modal when Close is clicked', () => {
      renderComponent();
      fireEvent.click(screen.getByRole('button', { name: /sales.contract.signature/i }));
      fireEvent.click(screen.getByRole('menuitem', { name: /sales.contract.addSign/i }));
      fireEvent.click(screen.getByTestId('add-sign-modal-close'));
      expect(screen.queryByTestId('add-sign-modal')).not.toBeInTheDocument();
    });
  });

  describe('callbacks', () => {
    it('calls handleShowContractForm when Edit icon is clicked for editable contract', () => {
      const handleShowContractForm = jest.fn();
      renderComponent({
        contractData: {
          ...defaultContractData,
          details: { ...defaultContractData.details, isEditable: true },
        },
        handleShowContractForm,
      });
      const editIcon = screen.getByLabelText('Edit');
      fireEvent.click(editIcon);
      expect(handleShowContractForm).toHaveBeenCalled();
    });

    it('calls openModalCloseDeal when Publish is clicked and deal is not closed', () => {
      const openModalCloseDeal = jest.fn();
      renderComponent({
        isDealClosed: false,
        contractData: {
          ...defaultContractData,
          details: {
            ...defaultContractData.details,
            isPublished: false,
            isPublishable: true,
          },
        },
        openModalCloseDeal,
      });
      const publishBtn = screen.getByRole('button', { name: /sales.contract.publishContract/i });
      publishBtn.click();
      expect(openModalCloseDeal).toHaveBeenCalled();
    });
  });

  describe('terminated contract', () => {
    it('renders reason when contract is terminated', () => {
      renderComponent({
        contractData: {
          ...defaultContractData,
          details: {
            ...defaultContractData.details,
            isTerminated: true,
            reason: 'Test termination reason',
          },
        },
      });
      expect(screen.getByText(/sales.deals.reason/)).toBeInTheDocument();
      expect(screen.getByText(/Test termination reason/)).toBeInTheDocument();
    });

    it('renders Terminated chip when contract is terminated', () => {
      renderComponent({
        contractData: {
          ...defaultContractData,
          details: {
            ...defaultContractData.details,
            isTerminated: true,
            status: 'terminated',
          },
        },
      });
      expect(screen.getByText('Terminated')).toBeInTheDocument();
    });
  });
});
