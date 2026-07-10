import {
  deleteHttpRequest,
  getHttpRequest,
  patchHttpRequest,
  postHttpRequest,
  putHttpRequest,
} from 'helper/axios';
import queryString from 'query-string';
import { buildProposalPageHeader } from 'src/services/proposalPreviewAssets';
import {
  dealDetailActivitiesMock,
  dealDetailNotesMock,
  dealsData,
  dealStageOptionsMock,
  getDealDetailMock,
} from 'src/stubbedData/mocks/deals.mock';
import {
  buildDemoProfitability,
  buildNewContractMock,
  getDemoContract,
  hasDemoContract,
  normalizeContractForClient,
  removeDemoContract,
  saveDemoContract,
} from 'src/utils/auth/demoContracts';
import { stageStatus } from 'src/utils/constants';
import isDevBypassAuth from 'src/utils/isDevBypassAuth';
import { throwAPIError } from 'src/utils/throwAPIError';

export const REACT_APP_LOCATIONS_URL = process.env.REACT_APP_SALES;
export const REACT_APP_FRANCHISE_BASE_URL = process.env.REACT_APP_FRANCHISE;

export const REACT_APP_USERS_BASE_URL = process.env.REACT_APP_USER;

export const REACT_APP_SALES_BASE_URL = process.env.REACT_APP_SALES;

const getDemoTimezoneObject = (timezone) => {
  if (!timezone) return null;
  if (typeof timezone === 'object') return timezone;
  return { id: timezone, name: String(timezone) };
};

const DEMO_STEP_KEYS = [
  'services',
  'devices',
  'onDemandServices',
  'paymentTerms',
  'descriptions',
  'signees',
];

const advanceDemoStepStatus = (contract, savedStepKey) => {
  if (!savedStepKey || !Array.isArray(contract.steps)) return;

  const stepIndex = contract.steps.findIndex((step) => step.value === savedStepKey);
  if (stepIndex === -1) return;

  contract.steps = contract.steps.map((step, index) => {
    if (index < stepIndex) {
      return { ...step, status: stageStatus.COMPLETE };
    }
    if (index === stepIndex) {
      return { ...step, status: stageStatus.COMPLETE };
    }
    if (index === stepIndex + 1) {
      return { ...step, status: stageStatus.CURRENT };
    }
    return { ...step, status: stageStatus.PENDING };
  });
};

const inferSavedStepKey = (payload = {}) => {
  if (payload._demoSavedStep) return payload._demoSavedStep;
  if (Array.isArray(payload.services) || payload._demoFormServices) return 'services';
  if (Array.isArray(payload.devices) || payload._demoFormDevices) return 'devices';
  if (Array.isArray(payload.onDemandServices)) return 'onDemandServices';
  if (payload.paymentTerms || payload._demoPaymentTermsForm) return 'paymentTerms';
  if (payload.descriptions || payload._demoDescriptionsForm) return 'descriptions';
  if (Array.isArray(payload.configuration) || payload._demoSigneesForm) return 'signees';
  return null;
};

const buildDemoPaymentTermsMeta = (existingPaymentTerms) => {
  const existing = existingPaymentTerms ?? {};
  return {
    servicesPlans: existing.servicesPlans || {},
    dispatchPlans: existing.dispatchPlans || {},
    visitorManagementPlans: existing.visitorManagementPlans || {},
    loadManagementPlans: existing.loadManagementPlans || {},
    lineItems: existing.lineItems || [],
    availablePlans: existing.availablePlans || [0, 1, 2, 4],
  };
};

const resolvePlanIdFromContract = (contract = {}) => {
  const detailsPlan = contract?.details?.plan;
  if (detailsPlan != null && String(detailsPlan).trim() !== '') return String(detailsPlan);

  const paymentTerms = contract?.paymentTerms || contract?._demoPaymentTermsForm || {};
  const paymentPlan =
    paymentTerms?.plan?.value ??
    paymentTerms?.plan?.id ??
    paymentTerms?.planId ??
    paymentTerms?.plan;
  if (paymentPlan != null && String(paymentPlan).trim() !== '') return String(paymentPlan);

  return '2';
};

const getServiceTotal = (service = {}, planId = '2') => {
  const valueByPlan = Number(service?.calculations?.[String(planId)]?.total);
  if (!Number.isNaN(valueByPlan) && Number.isFinite(valueByPlan) && valueByPlan > 0) {
    return valueByPlan;
  }

  const value = Number(service?.calculations?.total);
  if (!Number.isNaN(value) && Number.isFinite(value) && value > 0) return value;

  const fallback = Number(service?.total);
  if (!Number.isNaN(fallback) && Number.isFinite(fallback) && fallback > 0) return fallback;

  return 0;
};

const buildDemoContractAmount = (services = [], planId = '2') => {
  if (!Array.isArray(services) || services.length === 0) return 0;
  return services.reduce((sum, service) => sum + getServiceTotal(service, planId), 0);
};

const escapeHtml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const PLAN_PERIOD_LABELS = {
  0: 'Monthly',
  1: 'Bi-Weekly',
  2: 'Weekly',
  4: 'Flat',
};

const formatMoney = (value) => {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return '$0.00';
  return `$${amount.toFixed(2)}`;
};

const formatProposalDate = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toISOString().slice(0, 10);
};

const formatServiceDateRange = (details = {}) => {
  if (details?.areDatesToBeDecided) return 'TBD - TBD';
  const start = formatProposalDate(details?.startDate);
  const end = formatProposalDate(details?.endDate);
  if (start && end) return `${start} - ${end}`;
  if (start) return `${start} - TBD`;
  return 'TBD - TBD';
};

const getPlanPeriodLabel = (planId = '2') =>
  PLAN_PERIOD_LABELS[String(planId)] || PLAN_PERIOD_LABELS['2'];

const getServiceCalc = (service = {}, planId = '2') =>
  service?.calculations?.[String(planId)] || service?.calculations || {};

const getServiceWeekTotal = (service = {}, planId = '2') => {
  const calc = getServiceCalc(service, planId);
  const type = String(service?.type || service?.serviceType || '').toLowerCase();

  if (type === 'dedicated') {
    const hours = Number(calc.hours);
    if (Number.isFinite(hours) && hours > 0) return hours;
    const visit = service?.visits?.[0] || {};
    const officers = Number(visit?.reqOfficers ?? service?.reqOfficers ?? 0);
    const hrsWeek = Number(visit?.officerServiceHrsWeek ?? service?.officerServiceHrsWeek ?? 0);
    if (officers > 0 && hrsWeek > 0) return officers * hrsWeek;
    return '-';
  }

  const visits = Number(calc.totalVisits);
  if (Number.isFinite(visits) && visits > 0) return visits;
  const visit = service?.visits?.[0] || {};
  const visitsPerWeek = Number(visit?.visitsPerWeek ?? service?.visitsPerWeek ?? 0);
  if (visitsPerWeek > 0) return visitsPerWeek;
  return '-';
};

const getServiceLabel = (service = {}) => {
  const type = String(service?.type || '').toLowerCase();
  if (type === 'patrol') return 'Patrol Service';
  if (type === 'dedicated') return 'Dedicated Service';
  return service?.name || 'Standard Service';
};

const getFuelSurchargeAmount = (paymentTerms = {}, planId = '2') => {
  const direct = Number(paymentTerms?.fuelSurcharge);
  if (Number.isFinite(direct) && direct > 0) return direct;
  const planFuel = paymentTerms?.servicesPlans?.[String(planId)]?.fuelSurchargeAmount;
  const planFuelNum = Number(planFuel);
  return Number.isFinite(planFuelNum) && planFuelNum > 0 ? planFuelNum : 0;
};

const normalizeOnDemandList = (onDemandServices) => {
  if (Array.isArray(onDemandServices)) return onDemandServices;
  if (Array.isArray(onDemandServices?.customServices)) return onDemandServices.customServices;
  return [];
};

const buildProposalStandardServiceRows = (services = [], planId = '2', paymentTerms = {}) => {
  if (!Array.isArray(services) || services.length === 0) {
    return '<tr><td colspan="3" class="empty">No services configured yet.</td></tr>';
  }

  const fuelAmount = getFuelSurchargeAmount(paymentTerms, planId);
  const rows = [];
  let rowNumber = 0;

  services.forEach((service) => {
    rowNumber += 1;
    const label = escapeHtml(getServiceLabel(service));
    const weekTotal = getServiceWeekTotal(service, planId);
    const weekLabel = weekTotal === '-' ? '-' : escapeHtml(String(weekTotal));
    const total = formatMoney(getServiceTotal(service, planId));

    rows.push(`<tr>
        <td>${rowNumber}. ${label}</td>
        <td class="num">${weekLabel}</td>
        <td class="num">${total}</td>
      </tr>`);

    if (service?.addFuelSurcharge && fuelAmount > 0) {
      rowNumber += 1;
      rows.push(`<tr>
          <td>${rowNumber}. Fuel Surcharge</td>
          <td class="num">-</td>
          <td class="num">${formatMoney(fuelAmount)}</td>
        </tr>`);
    }
  });

  return rows.join('');
};

const buildProposalLineItemRows = (onDemandServices = []) => {
  const items = normalizeOnDemandList(onDemandServices).filter(
    (item) => Number(item?.quantity ?? 0) > 0 || Number(item?.price ?? 0) > 0,
  );

  if (!items.length) {
    return '<tr><td colspan="4" class="empty">No line items configured.</td></tr>';
  }

  return items
    .map((item, index) => {
      const quantity = Number(item?.quantity ?? 1);
      const unitPrice = Number(item?.price ?? item?.rate ?? 0);
      const lineTotal = quantity * unitPrice;
      return `<tr>
        <td>${index + 1}. ${escapeHtml(item?.title || item?.name || `Line Item ${index + 1}`)}</td>
        <td class="num">${Number.isFinite(quantity) ? quantity : 1}</td>
        <td class="num">${formatMoney(unitPrice)}</td>
        <td class="num">${formatMoney(lineTotal)}</td>
      </tr>`;
    })
    .join('');
};

const computeLineItemsTotal = (onDemandServices = []) =>
  normalizeOnDemandList(onDemandServices).reduce((sum, item) => {
    const quantity = Number(item?.quantity ?? 1);
    const unitPrice = Number(item?.price ?? item?.rate ?? 0);
    if (!Number.isFinite(quantity) || !Number.isFinite(unitPrice)) return sum;
    return sum + quantity * unitPrice;
  }, 0);

const computeDevicesFirstInvoice = (devices = []) =>
  (Array.isArray(devices) ? devices : []).reduce((sum, device) => {
    const quantity = Number(device?.quantity ?? 0);
    const price = Number(device?.price ?? 0);
    if (!Number.isFinite(quantity) || !Number.isFinite(price) || quantity <= 0) return sum;
    return sum + quantity * price;
  }, 0);

const getDescriptionHtml = (descriptions = {}) => {
  const raw = descriptions?.services ?? descriptions?.text ?? '';
  if (typeof raw === 'string' && raw.trim()) return raw;
  return '<p>Security services as outlined in this proposal.</p>';
};

const isSignalSignee = (signee = {}) => {
  const title = String(signee?.title || '').toLowerCase();
  const email = String(signee?.email || '').toLowerCase();
  return (
    title.includes('sales rep') ||
    title.includes('franchise owner') ||
    title.includes('sales person') ||
    email.includes('@signal.com')
  );
};

const buildSignerFieldsHtml = (signee = {}, index = 0) => {
  const name = escapeHtml(signee?.name || '');
  const title = escapeHtml(signee?.title || '');
  const email = escapeHtml(signee?.email || '');
  const signedAt = formatProposalDate(signee?.signedAt || signee?.date);
  const signature = signee?.signature || signee?.signatureUrl || '';
  const signatureContent = signature
    ? `<img src="${escapeHtml(signature)}" alt="Signature" class="signature-img" />`
    : name
      ? `<span class="signature-script">${name}</span>`
      : '';

  return `<div class="signer-card">
    <div class="signer-heading">Signee ${index + 1}</div>
    <div class="signer-grid">
      <div><span class="label">Name</span><span class="value">${name || '&nbsp;'}</span></div>
      <div><span class="label">Title</span><span class="value">${title || '&nbsp;'}</span></div>
      <div><span class="label">Email</span><span class="value">${email || '&nbsp;'}</span></div>
      <div class="signature-field">
        <span class="label">Signature</span>
        <div class="signature-box">${signatureContent}</div>
      </div>
      <div><span class="label">Date</span><span class="value date-line">${signedAt || '&nbsp;'}</span></div>
    </div>
  </div>`;
};

const buildSignerBlockHtml = (title, signees = []) => {
  const list = Array.isArray(signees) ? signees : [];
  const cards =
    list.length > 0
      ? list.map((signee, index) => buildSignerFieldsHtml(signee, index)).join('')
      : '<div class="empty">No signees configured.</div>';

  return `<section class="signer-block">
    <h3>${escapeHtml(title)}</h3>
    ${cards}
  </section>`;
};

const buildAddressLine = (parts = []) =>
  parts.filter((part) => part != null && String(part).trim() !== '').join(', ');

const getDisplayValue = (value) => {
  if (value == null || value === '') return '-';
  if (Array.isArray(value)) {
    if (!value.length) return '-';
    return value.map((item) => getDisplayValue(item)).join(', ');
  }
  if (typeof value === 'object') {
    if (value.label) return String(value.label);
    if (value.name) return String(value.name);
    if (value.value != null) return String(value.value);
    if (value.id != null) return String(value.id);
    return JSON.stringify(value);
  }
  return String(value);
};

const buildMockContractPreviewAttachment = (contract = {}) => {
  const details = contract?.details || {};
  const services = contract?._demoFormServices || contract?.services || [];
  const devices = contract?._demoFormDevices || contract?.devices || [];
  const paymentTerms = contract?._demoPaymentTermsForm || contract?.paymentTerms || {};
  const descriptions = contract?._demoDescriptionsForm || contract?.descriptions || {};
  const signees = contract?._demoSigneesForm || contract?.signees || contract?.configuration || [];
  const onDemandServices = contract?.onDemandServices || contract?._demoOnDemandServices || [];
  const planId = resolvePlanIdFromContract(contract);
  const planPeriodLabel = getPlanPeriodLabel(planId);
  const servicesSubtotal = buildDemoContractAmount(services, planId);
  const lineItemsSubtotal = computeLineItemsTotal(onDemandServices);
  const taxRate = Number(paymentTerms?.taxRate ?? 0);
  const devicesFirstInvoice = computeDevicesFirstInvoice(devices);
  const fuelAmount = getFuelSurchargeAmount(paymentTerms, planId);
  const servicesWithFuel = services.reduce((sum, service) => {
    let total = sum + getServiceTotal(service, planId);
    if (service?.addFuelSurcharge && fuelAmount > 0) total += fuelAmount;
    return total;
  }, 0);
  const adjustedServicesSubtotal =
    servicesWithFuel > servicesSubtotal ? servicesWithFuel : servicesSubtotal;
  const adjustedTaxAmount = ((adjustedServicesSubtotal + lineItemsSubtotal) * taxRate) / 100;
  const adjustedPeriodTotal = adjustedServicesSubtotal + lineItemsSubtotal + adjustedTaxAmount;

  const contractName = escapeHtml(details?.name || 'Contract Preview');
  const serviceDates = escapeHtml(formatServiceDateRange(details));
  const paymentDateLabel = escapeHtml(
    getDisplayValue(paymentTerms?.paymentDate) !== '-'
      ? getDisplayValue(paymentTerms?.paymentDate)
      : 'Net 15',
  );
  const holidayMultiplier = escapeHtml(
    paymentTerms?.holidayMultiplier
      ? `${paymentTerms.holidayMultiplier}x Regular Rate`
      : '1.5x Regular Rate',
  );

  const billingOwnerName = escapeHtml(
    `${paymentTerms?.billingOwnerFirstName || ''} ${paymentTerms?.billingOwnerLastName || ''}`.trim() ||
      '-',
  );
  const locationName = escapeHtml(paymentTerms?.addressLabel || details?.name || contractName);
  const locationAddress = escapeHtml(
    buildAddressLine([
      paymentTerms?.address,
      paymentTerms?.city,
      paymentTerms?.state,
      paymentTerms?.postalCode,
    ]) || '-',
  );
  const managementCompany = escapeHtml(
    paymentTerms?.managementCompany || paymentTerms?.companyName || '-',
  );
  const serviceProviderName = escapeHtml(
    paymentTerms?.serviceProviderName || paymentTerms?.franchiseName || 'Service Provider',
  );
  const serviceProviderContact = escapeHtml(
    `${paymentTerms?.billingOwnerFirstName || ''} ${paymentTerms?.billingOwnerLastName || ''}`.trim() ||
      details?.createdBy ||
      '-',
  );
  const serviceProviderLocation = escapeHtml(
    buildAddressLine([paymentTerms?.city, paymentTerms?.state]) || '-',
  );

  const standardServiceRows = buildProposalStandardServiceRows(services, planId, paymentTerms);
  const lineItemRows = buildProposalLineItemRows(onDemandServices);
  const descriptionHtml = getDescriptionHtml(descriptions);
  const clientSignees = signees.filter((signee) => !isSignalSignee(signee));
  const signalSignees = signees.filter((signee) => isSignalSignee(signee));
  const clientSignerBlock = buildSignerBlockHtml('Client signer block', clientSignees);
  const signalSignerBlock = buildSignerBlockHtml('Signal signer block', signalSignees);

  const html = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${contractName}</title>
    <style>
      * { box-sizing: border-box; }
      body { margin: 0; font-family: "Times New Roman", Times, serif; color: #111; background: #e5e7eb; }
      .page {
        width: 8.5in;
        min-height: 11in;
        margin: 0 auto 16px;
        background: #fff;
        padding: 0.55in 0.6in 0.7in;
        position: relative;
        page-break-after: always;
      }
      .page:last-child { page-break-after: auto; margin-bottom: 0; }
      .page-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 20px;
      }
      .proposal-logo { flex: 0 0 auto; }
      .proposal-logo .signal-logo { height: 40px; width: auto; display: block; }
      .page-num { font-size: 11px; color: #444; padding-top: 6px; white-space: nowrap; }
      .proposal-subtitle { text-align: center; font-size: 12px; color: #444; margin: -8px 0 18px; }
      .party-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 18px; font-size: 12px; line-height: 1.45; }
      .party-grid h2 { margin: 0 0 6px; font-size: 13px; text-transform: uppercase; }
      .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px 24px; margin-bottom: 18px; font-size: 12px; }
      .meta-grid .label { font-weight: 700; display: block; margin-bottom: 2px; }
      table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 8px; }
      th, td { border: 1px solid #222; padding: 6px 8px; vertical-align: top; }
      th { background: #f3f4f6; text-align: left; font-weight: 700; }
      td.num, th.num { text-align: right; white-space: nowrap; }
      td.empty, .empty { color: #666; font-style: italic; padding: 10px 8px; }
      .summary-wrap { display: flex; justify-content: flex-end; margin-top: 14px; }
      .summary { width: 280px; font-size: 12px; }
      .summary-row { display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px solid #ddd; }
      .summary-row.total { font-weight: 700; border-bottom: 2px solid #111; margin-top: 4px; }
      .note { font-size: 11px; color: #444; margin-top: 14px; line-height: 1.5; }
      .holidays { margin-top: 16px; font-size: 12px; }
      .holidays h3 { margin: 0 0 6px; font-size: 13px; }
      .page-title { text-align: center; font-size: 16px; font-weight: 700; margin: 0 0 16px; text-transform: uppercase; }
      .description { font-size: 12px; line-height: 1.55; }
      .description p { margin: 0 0 10px; }
      .terms h3 { margin: 18px 0 8px; font-size: 13px; text-transform: uppercase; }
      .terms p, .terms li { font-size: 12px; line-height: 1.5; }
      .terms ol { padding-left: 18px; }
      .sign-intro { font-size: 12px; line-height: 1.5; margin-bottom: 18px; }
      .signer-block { margin-bottom: 22px; }
      .signer-block h3 { margin: 0 0 10px; font-size: 13px; text-transform: uppercase; }
      .signer-card { border: 1px solid #bbb; padding: 12px; margin-bottom: 12px; }
      .signer-heading { font-weight: 700; margin-bottom: 8px; font-size: 12px; }
      .signer-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px 16px; font-size: 12px; }
      .signer-grid .label { display: block; font-size: 11px; color: #555; margin-bottom: 2px; }
      .signer-grid .value { display: block; min-height: 16px; border-bottom: 1px solid #ccc; }
      .signature-field { grid-column: 1 / -1; }
      .signature-box {
        min-height: 56px;
        border: 1px solid #ccc;
        background: #f8f8f8;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 8px;
      }
      .signature-script { font-family: "Brush Script MT", "Segoe Script", cursive; font-size: 28px; color: #666; }
      .signature-img { max-height: 48px; max-width: 100%; }
      @media print {
        body { background: #fff; }
        .page { margin: 0; box-shadow: none; }
      }
    </style>
  </head>
  <body>
    <section class="page">
      ${buildProposalPageHeader('1/3')}
      <div class="proposal-subtitle">Security Services Proposal</div>

      <div class="party-grid">
        <div>
          <h2>Contractor</h2>
          <div>Signal 88, LLC</div>
          <div>11811 I Street</div>
          <div>Omaha, NE 68137</div>
        </div>
        <div>
          <h2>Service Provider</h2>
          <div>${serviceProviderName}</div>
          <div>${serviceProviderContact}</div>
          <div>${serviceProviderLocation}</div>
        </div>
      </div>

      <div class="meta-grid">
        <div><span class="label">Service Dates</span>${serviceDates}</div>
        <div><span class="label">Payment Terms</span>${paymentDateLabel}</div>
        <div>
          <span class="label">Security Location</span>
          ${locationName}<br />
          ${locationAddress}<br />
          ${billingOwnerName}
        </div>
        <div>
          <span class="label">Bill To</span>
          ${locationName}<br />
          ${locationAddress}<br />
          ${billingOwnerName}
        </div>
        <div><span class="label">Management Company</span>${managementCompany}</div>
        <div><span class="label">Proposal</span>${contractName}</div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Standard Services</th>
            <th class="num">Week Total</th>
            <th class="num">Total</th>
          </tr>
        </thead>
        <tbody>${standardServiceRows}</tbody>
      </table>

      <table>
        <thead>
          <tr>
            <th>Standard Services</th>
            <th class="num">Quantity</th>
            <th class="num">Unit Price</th>
            <th class="num">Total</th>
          </tr>
        </thead>
        <tbody>${lineItemRows}</tbody>
      </table>

      <div class="summary-wrap">
        <div class="summary">
          <div class="summary-row"><span>Services</span><span>${formatMoney(adjustedServicesSubtotal)}</span></div>
          <div class="summary-row"><span>Line Items</span><span>${formatMoney(lineItemsSubtotal)}</span></div>
          <div class="summary-row"><span>Taxes (${Number.isFinite(taxRate) ? taxRate : 0}%)</span><span>${formatMoney(adjustedTaxAmount)}</span></div>
          <div class="summary-row total"><span>${planPeriodLabel} Total</span><span>${formatMoney(adjustedPeriodTotal)}</span></div>
          <div class="summary-row"><span>Devices (1st invoice)</span><span>${formatMoney(devicesFirstInvoice)}</span></div>
        </div>
      </div>

      <p class="note">* Taxes are subject to change based on local tax rates.</p>
      <p class="note">Please remit payment to Signal 88, LLC, 11811 I Street, Omaha, NE 68137.</p>

      <div class="holidays">
        <h3>Holidays</h3>
        <div>${holidayMultiplier}</div>
        <div>New Year's Day, Memorial Day, Independence Day, Labor Day, Thanksgiving Day, Christmas Day</div>
      </div>
    </section>

    <section class="page">
      ${buildProposalPageHeader('2/3')}
      <h2 class="page-title">Description of Services</h2>
      <div class="description">${descriptionHtml}</div>

      <div class="terms">
        <h2 class="page-title" style="margin-top:24px;">Security-Services Agreement Terms and Conditions</h2>
        <h3>1. Services to Be Performed</h3>
        <p><strong>A. Community-Based Roving Patrol Tours</strong> — Roving vehicle patrols conducted by unarmed officers to evaluate locations for criminal activity, lighting conditions, and related security concerns.</p>
        <p><strong>B. Community-Based Dedicated Roving Patrol Tours</strong> — The same services as above, dedicated exclusively to the location(s) specified in this proposal.</p>
        <p><strong>C. Armed Dedicated Roving Patrol Tours</strong> — The same services as above, performed by armed law enforcement personnel or licensed and trained armed civilian security officers.</p>
        <h3>2. Delegation of Services</h3>
        <p>Customer authorizes Contractor to delegate performance of services to qualified service providers while Contractor remains responsible for oversight.</p>
        <h3>3. Security Standards</h3>
        <p>Services will be performed in accordance with applicable laws, licensing requirements, and Contractor standards.</p>
        <h3>4. Duties of Customer</h3>
        <p>Customer will provide safe access, accurate site information, and timely communication regarding changes affecting service delivery.</p>
      </div>
    </section>

    <section class="page">
      ${buildProposalPageHeader('3/3')}
      <p class="sign-intro">
        By signing this contract, you are agreeing to the description of services herein and as listed in the
        "Security-Services Agreement Terms and Conditions" and promise to remit payment based on the above listed terms.
      </p>
      ${clientSignerBlock}
      ${signalSignerBlock}
    </section>
  </body>
</html>`;

  return `data:text/html;charset=utf-8,${encodeURIComponent(html)}`;
};

const mergeDemoContractWithPayload = (existingContract, payload = {}) => {
  const contract = existingContract ? { ...existingContract } : buildNewContractMock();
  const details = { ...(contract.details || {}) };

  if (payload.name != null) details.name = payload.name;
  if (payload.startDate != null) details.startDate = payload.startDate;
  if (payload.endDate != null) details.endDate = payload.endDate;
  if (payload.timezone != null) details.timezone = getDemoTimezoneObject(payload.timezone);
  if (payload.selectedDateType != null) details.selectedDateType = payload.selectedDateType;
  if (payload.renewalReminderDays != null)
    details.renewalReminderDays = payload.renewalReminderDays;
  if (payload.autoRenewal != null) details.autoRenewal = payload.autoRenewal;
  if (payload.proposalType != null) details.proposalType = payload.proposalType;
  if (payload.areDatesToBeDecided != null)
    details.areDatesToBeDecided = payload.areDatesToBeDecided;

  contract.details = details;

  if (Array.isArray(payload._demoFormServices)) {
    contract._demoFormServices = payload._demoFormServices;
  }
  if (Array.isArray(payload.services)) contract.services = payload.services;
  if (Array.isArray(payload._demoFormDevices)) {
    contract._demoFormDevices = payload._demoFormDevices;
    contract.devices = payload._demoFormDevices;
  } else if (Array.isArray(payload.devices)) {
    contract.devices = payload.devices;
  }
  if (payload.paymentTerms) {
    contract.paymentTerms = {
      ...buildDemoPaymentTermsMeta(contract.paymentTerms),
      ...payload.paymentTerms,
    };
    const planFromPayload = payload.paymentTerms?.planId ?? payload.paymentTerms?.plan;
    if (planFromPayload != null && String(planFromPayload).trim() !== '') {
      details.plan = String(planFromPayload);
    }
  }
  if (payload._demoPaymentTermsForm) {
    contract._demoPaymentTermsForm = payload._demoPaymentTermsForm;
    contract.paymentTerms = {
      ...buildDemoPaymentTermsMeta(contract.paymentTerms),
      ...(contract.paymentTerms ?? {}),
    };
    const planFromForm =
      payload._demoPaymentTermsForm?.plan?.value ??
      payload._demoPaymentTermsForm?.plan?.id ??
      payload._demoPaymentTermsForm?.plan;
    if (planFromForm != null && String(planFromForm).trim() !== '') {
      details.plan = String(planFromForm);
    }
  }
  if (Array.isArray(payload.onDemandServices)) contract.onDemandServices = payload.onDemandServices;
  if (payload.descriptions) contract.descriptions = payload.descriptions;
  if (payload._demoDescriptionsForm) {
    contract._demoDescriptionsForm = payload._demoDescriptionsForm;
    contract.descriptions = payload._demoDescriptionsForm;
  }
  if (Array.isArray(payload._demoSigneesForm)) {
    contract._demoSigneesForm = payload._demoSigneesForm;
    contract.signees = payload._demoSigneesForm;
  } else if (Array.isArray(payload.configuration)) {
    contract.signees = payload.configuration;
  }

  const savedStepKey = inferSavedStepKey(payload);
  if (savedStepKey && DEMO_STEP_KEYS.includes(savedStepKey)) {
    advanceDemoStepStatus(contract, savedStepKey);
  }

  const servicesForProfitability =
    contract._demoFormServices ||
    contract.services ||
    payload._demoFormServices ||
    payload.services;
  contract.profitability = buildDemoProfitability(servicesForProfitability);
  const planId = resolvePlanIdFromContract(contract);
  const demoAmount = buildDemoContractAmount(servicesForProfitability, planId);
  if (Number.isFinite(demoAmount) && demoAmount >= 0) {
    contract.details = {
      ...contract.details,
      amount: demoAmount,
    };
  }

  return contract;
};

export const createDeal = async (data) => {
  try {
    return await postHttpRequest(`${REACT_APP_LOCATIONS_URL}/web/deals`, data);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const updateDeal = async (id, data) => {
  try {
    return await putHttpRequest(`${REACT_APP_LOCATIONS_URL}/web/deals/${id}`, data);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getDealDetails = async (id) => {
  try {
    return await getHttpRequest(`${REACT_APP_LOCATIONS_URL}/web/deals/${id}`);
  } catch (e) {
    const response = getDealDetailMock(id);
    if (response?.statusCode === 200 && hasDemoContract(id)) {
      response.data.deal.hasContract = true;
    }
    return response;
  }
};

export const getDealOwnerOptions = async () => {
  try {
    return await getHttpRequest(`${REACT_APP_LOCATIONS_URL}/shared/config/owners`);
  } catch (e) {
    return {
      statusCode: 200,
      message: 'success',
      data: { owners: dealsData.salesPersons.data.salesPersons },
    };
  }
};

export const getCompanyLeadOptions = async (companyId) => {
  try {
    return await getHttpRequest(
      `${REACT_APP_LOCATIONS_URL}/web/companies/${companyId}/location_options`,
    );
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getPipelineOptions = async () => {
  try {
    return await getHttpRequest(`${REACT_APP_LOCATIONS_URL}/shared/config/pipelines`);
  } catch (e) {
    return {
      statusCode: 200,
      message: 'success',
      data: { pipelines: [{ id: 1, name: 'Sales Pipeline' }] },
    };
  }
};

export const convertDealIntoStage = async (locationId, data) => {
  try {
    return await postHttpRequest(
      `${REACT_APP_LOCATIONS_URL}/shared/locations/${locationId}/convert`,
      data,
    );
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getDealStageOptions = async (stageName, pipelineId, config = {}) => {
  try {
    if (!stageName || !pipelineId) {
      throw new Error();
    }

    return await getHttpRequest(
      `${REACT_APP_LOCATIONS_URL}/shared/config/deal_stage_options?stageName=${stageName}&pipelineId=${pipelineId}`,
      config,
    );
  } catch (e) {
    return dealStageOptionsMock;
  }
};

export const getDeals = async (page, rowsPerPage, params, config = {}) => {
  try {
    let query = queryString.stringify(params, {
      arrayFormat: 'bracket',
      skipEmptyString: true,
      skipNull: true,
    });
    query = query ? `&${query}` : '';

    return await getHttpRequest(
      `${REACT_APP_LOCATIONS_URL}/web/deals?rowsPerPage=${rowsPerPage}&pageNo=${page}${query}`,
      config,
    );
  } catch (e) {
    return dealsData.listing;
  }
};

export const bulkDealAssignMent = async (data) => {
  try {
    return await postHttpRequest(`${REACT_APP_LOCATIONS_URL}/web/deals/bulk_assignment`, data);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getDealsCumulativeStats = async (pipelineId) => {
  try {
    return await getHttpRequest(
      `${REACT_APP_LOCATIONS_URL}/web/deals/cumulative_stats?pipelineId=${pipelineId}`,
    );
  } catch (e) {
    return dealsData.cumulativeStats;
  }
};
export const getUsersGraph = async () => {
  try {
    // return dealsData.cumulativeStats;
    return await getHttpRequest(`${REACT_APP_SALES_BASE_URL}/web/users/trends`);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getTeamsDataGraph = async () => {
  try {
    // return dealsData.cumulativeStats;
    return await getHttpRequest(
      `${REACT_APP_SALES_BASE_URL}/web/users/over_last_tweleve_months_graph`,
    );
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getDealsYearlyStats = async (pipelineId) => {
  try {
    return await getHttpRequest(
      `${REACT_APP_LOCATIONS_URL}/web/deals/yearly_stats?pipelineId=${pipelineId}`,
    );
  } catch (e) {
    return dealsData.yearlyStats;
  }
};

export const getDealActivities = async (id) => {
  try {
    if (!id) {
      throw new Error();
    }
    // return companiesData.activities;
    return await getHttpRequest(`${REACT_APP_LOCATIONS_URL}/shared/deals/${id}/engagements`);
  } catch (e) {
    return dealDetailActivitiesMock;
  }
};

export const getDealNotes = async (id) => {
  try {
    if (!id) {
      throw new Error();
    }
    // return companiesData.companyNotes;
    return await getHttpRequest(`${REACT_APP_LOCATIONS_URL}/web/notes/Deal/${id}`);
  } catch (e) {
    return dealDetailNotesMock;
  }
};

export const createDealNote = async (dealId, data) => {
  try {
    if (!dealId) {
      throw new Error();
    }
    // return companiesData.createCompanyNote;
    return await postHttpRequest(`${REACT_APP_LOCATIONS_URL}/web/notes/Deal/${dealId}`, data);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const updateDealNote = async (dealId, data) => {
  try {
    if (!dealId) {
      throw new Error();
    }
    // return companiesData.createCompanyNote;
    return await putHttpRequest(`${REACT_APP_LOCATIONS_URL}/web/notes/${dealId}`, data);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getDealQuestions = async (id, params) => {
  try {
    let query = queryString.stringify(params, {
      arrayFormat: 'bracket',
      skipEmptyString: true,
      skipNull: true,
    });
    return await getHttpRequest(
      `${REACT_APP_LOCATIONS_URL}/shared/locations/${id}/questions?${query}`,
    );
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getContractDetails = async (dealId) => {
  try {
    const response = await getHttpRequest(
      `${REACT_APP_LOCATIONS_URL}/web/deals/${dealId}/contracts`,
    );
    if (isDevBypassAuth() && response?.data?.contract) {
      response.data.contract = normalizeContractForClient(response.data.contract);
    }
    return response;
  } catch (e) {
    const contract = getDemoContract(dealId);
    if (contract) {
      return {
        statusCode: 200,
        message: 'Fetched successfully.',
        data: { contract },
      };
    }
    return {
      statusCode: 404,
      message: 'No contract found.',
    };
  }
};

export const getContractPDF = async (dealId, config = {}) => {
  try {
    return await getHttpRequest(
      `${REACT_APP_LOCATIONS_URL}/web/deals/${dealId}/contracts/preview`,
      config,
    );
  } catch (e) {
    const contract = getDemoContract(dealId);
    if (contract) {
      return {
        statusCode: 200,
        message: 'Preview generated successfully.',
        data: { attachment: buildMockContractPreviewAttachment(contract) },
      };
    }
    return throwAPIError(e);
  }
};

export const getSignedContractPDF = async (dealId, config = {}) => {
  try {
    return await getHttpRequest(
      `${REACT_APP_LOCATIONS_URL}/web/deals/${dealId}/contracts/signed_contract`,
      config,
    );
  } catch (e) {
    return throwAPIError(e);
  }
};

export const publishContract = async (dealId, data) => {
  try {
    return await postHttpRequest(
      `${REACT_APP_LOCATIONS_URL}/web/deals/${dealId}/contracts/publish`,
      data,
    );
  } catch (e) {
    return throwAPIError(e);
  }
};

export const terminateContract = async (dealId, data) => {
  try {
    return await postHttpRequest(
      `${REACT_APP_LOCATIONS_URL}/web/deals/${dealId}/contracts/terminate`,
      data,
    );
  } catch (e) {
    if (!isDevBypassAuth() && !hasDemoContract(dealId)) {
      return throwAPIError(e);
    }

    const isDelete = !data;
    if (isDelete) {
      removeDemoContract(dealId);
      return {
        statusCode: 200,
        message: 'Contract deleted successfully.',
        data: { contract: null },
      };
    }

    const existingContract = getDemoContract(dealId) || buildNewContractMock();
    const terminatedContract = {
      ...existingContract,
      details: {
        ...existingContract.details,
        isTerminated: true,
        status: 'terminated',
        terminatedAt: data?.terminationDate || new Date().toISOString(),
        terminationReason: data?.reason || '',
        isEditable: false,
        isPublishable: false,
      },
    };
    saveDemoContract(dealId, terminatedContract);
    return {
      statusCode: 200,
      message: 'Contract terminated successfully.',
      data: { contract: normalizeContractForClient(terminatedContract) },
    };
  }
};

export const createContract = async (dealId, data) => {
  try {
    return await postHttpRequest(`${REACT_APP_LOCATIONS_URL}/web/deals/${dealId}/contracts`, data);
  } catch (e) {
    const contract = buildNewContractMock(data);
    saveDemoContract(dealId, contract);
    return {
      statusCode: 200,
      message: 'Contract created successfully.',
      data: { contract: normalizeContractForClient(contract, { persistDemoData: true }) },
    };
  }
};

export const getHolidayGroupsFromFranchiseService = async (config = {}) => {
  try {
    return await getHttpRequest(
      `${REACT_APP_FRANCHISE_BASE_URL}/holiday_groups/holiday_groups_dropdown?`,
      config,
    );
  } catch (e) {
    return {
      statusCode: 200,
      message: 'success',
      data: {
        holidayGroups: [
          { id: 1, name: 'US Federal Holidays', holidays: [] },
          { id: 2, name: 'Company Standard Holidays', holidays: [] },
        ],
      },
    };
  }
};

export const updateContract = async (dealId, data) => {
  try {
    // console.log({ payloadOfContract: data });
    // if (data) return;
    return await patchHttpRequest(`${REACT_APP_LOCATIONS_URL}/web/deals/${dealId}/contracts`, data);
  } catch (e) {
    const existingContract = getDemoContract(dealId);
    const mergedContract = mergeDemoContractWithPayload(existingContract, data);
    saveDemoContract(dealId, mergedContract);
    return {
      statusCode: 200,
      message: 'Contract updated successfully.',
      data: { contract: normalizeContractForClient(mergedContract, { persistDemoData: true }) },
    };
  }
};

export const deleteContract = async (dealId) => {
  try {
    return await postHttpRequest(`${REACT_APP_LOCATIONS_URL}/web/deals/${dealId}/contracts`, data);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getFranchisePreferences = async (franchiseId) => {
  try {
    return await getHttpRequest(
      `${REACT_APP_FRANCHISE_BASE_URL}/preferences?franchise-id=${franchiseId}`,
    );
  } catch (e) {
    return {
      statusCode: 200,
      message: 'success',
      data: {
        preferences: {
          generalServices: [
            { slug: 'armed_officer', rateValue: 25 },
            { slug: 'patrol_officer', rateValue: 20 },
            { slug: 'dedicated_officer', rateValue: 22 },
          ],
          extraServices: [
            { slug: 'visitor_management', rateValue: 5 },
            { slug: 'load_management', rateValue: 5 },
          ],
          lineItems: [],
        },
      },
    };
  }
};

export const updateDealQuestions = async (dealId, data) => {
  try {
    return await postHttpRequest(
      `${REACT_APP_LOCATIONS_URL}/shared/locations/${dealId}/questions`,
      data,
    );
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getUserDeals = async (userId, queryParams) => {
  try {
    const query = queryString.stringify(queryParams, {
      arrayFormat: 'bracket',
      skipEmptyString: true,
      skipNull: true,
    });
    return await getHttpRequest(`${REACT_APP_LOCATIONS_URL}/web/users/${userId}/deals?${query}`);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const uploadDealBannerAttachment = async (dealId, payload) => {
  try {
    return await postHttpRequest(
      `${REACT_APP_LOCATIONS_URL}/web/deals/${dealId}/contracts/upload_banner`,
      payload,
    );
  } catch (e) {
    return throwAPIError(e);
  }
};

export const deleteDealBannerAttachment = async (dealId) => {
  try {
    return await deleteHttpRequest(
      `${REACT_APP_LOCATIONS_URL}/web/deals/${dealId}/contracts/delete_banner`,
    );
  } catch (e) {
    return throwAPIError(e);
  }
};

export const createDealAddendumContract = async (dealId) => {
  try {
    return await postHttpRequest(
      `${REACT_APP_LOCATIONS_URL}/web/deals/${dealId}/contracts/addendum`,
      {},
    );
  } catch (e) {
    return throwAPIError(e);
  }
};

export const createDealCloneContract = async (dealId) => {
  try {
    return await postHttpRequest(
      `${REACT_APP_LOCATIONS_URL}/web/deals/${dealId}/contracts/clone`,
      {},
    );
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getContractChangeHistory = async (dealId, config) => {
  try {
    return await getHttpRequest(
      `${REACT_APP_LOCATIONS_URL}/web/deals/${dealId}/contracts/change_history`,
      config,
    );
  } catch (e) {
    return throwAPIError(e);
  }
};

export const requestSignatures = async (dealId, data, config) => {
  try {
    return await postHttpRequest(
      `${REACT_APP_LOCATIONS_URL}/web/deals/${dealId}/contracts/request_signatures`,
      data,
      config,
    );
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getContractToSign = async (contractId, config) => {
  try {
    return await getHttpRequest(
      `${REACT_APP_LOCATIONS_URL}/web/contracts/${contractId}/signatures`,
      config,
    );
  } catch (e) {
    return throwAPIError(e);
  }
};

export const signContract = async (contractId, data, config) => {
  try {
    return await putHttpRequest(
      `${REACT_APP_LOCATIONS_URL}/web/contracts/${contractId}/signatures`,
      data,
      config,
    );
  } catch (e) {
    return throwAPIError(e);
  }
};

export const clientSecretFromBE = async (dealId) => {
  try {
    return await postHttpRequest(
      `${REACT_APP_LOCATIONS_URL}/web/deals/${dealId}/payments/create_setup_intent`,
    );
  } catch (e) {
    return throwAPIError(e);
  }
};

export const checkFeasibleService = async (dealId, service, config = {}) => {
  try {
    return await postHttpRequest(
      `${REACT_APP_LOCATIONS_URL}/web/deals/${dealId}/contracts/pricing/calculate`,
      service,
      config,
    );
  } catch (e) {
    return throwAPIError(e);
  }
};

export const sendPaymentMethodId = async (dealId, paymentMethodId) => {
  try {
    return await postHttpRequest(
      `${REACT_APP_LOCATIONS_URL}/web/deals/${dealId}/payments/save_payment_method`,
      {
        payment_method_id: paymentMethodId,
      },
    );
  } catch (e) {
    return throwAPIError(e);
  }
};

export const checkMinimumServiceRate = async (dealId, service, config = {}) => {
  try {
    return await postHttpRequest(
      `${REACT_APP_LOCATIONS_URL}/web/deals/${dealId}/contracts/pricing/suggested_rate`,
      service,
      config,
    );
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getProductsFromBE = async () => {
  try {
    return await getHttpRequest(`${REACT_APP_LOCATIONS_URL}/web/products`);
  } catch (e) {
    return {
      statusCode: 200,
      message: 'success',
      data: {
        products: [
          { id: 1, name: 'Body Camera' },
          { id: 2, name: 'Patrol Vehicle' },
          { id: 3, name: 'Access Badge Reader' },
        ],
      },
    };
  }
};
