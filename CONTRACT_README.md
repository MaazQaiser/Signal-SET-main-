
# This README is about Contracts

A contract is divided into these parts
1. Contract Proposal
2. Services
3. Devices
4. On Demand Services
5. Payment Terms
6. Description
7. Sign Contract
8. Publish with and without Sign Document

## Create Contract

A contract starts from the Deal detail page at the path:
`src/app/sales/pages/deals/detail/index.jsx`.

If the contract exists, it is fetched by the function `fetchContractDetails` and set into the state `contractData`. This data is then forwarded to the `DealTab` component at the path:
`src/app/components/salesComponents/deals/dealTabs/index.jsx`.

In `DealTab`, if `contractData?.detail` is `null` or `{}`, we render the `ContractEmptyState` component at the path:
`src/app/components/salesComponents/deals/emptyContract/index.jsx`.

### 1. Contract Proposal Creation

To create or update a contract proposal, we use the `ContractDrawer` component, located at:
`src/app/components/salesComponents/deals/contractDrawer/index.jsx`.

This component is used both for creating new proposals and updating existing ones. The following fields are needed for creating a contract:

- A contract can either be **one-time** or **ongoing**.
- The user decides between `endDate` and `renewalDate` based on the type of contract.

### Initial Form State

```javascript
const initialFormState = {
  [FormKeys.NAME]: '',
  [FormKeys.TIMEZONE]: null,
  [FormKeys.START_DATE]: '',
  [FormKeys.END_DATE]: '',
  [FormKeys.RENEWAL_DATE]: '',
  [FormKeys.SELECTED_DATE_TYPE]: FormKeys.RENEWAL_DATE,
  [FormKeys.RENEWAL_REMINDER_DAYS]: defaultRenewalDays,
  [FormKeys.AUTO_RENEWAL]: false,
};
```
## Backend Payload Examples for Different Contract Types

### 1. Dates to Be Decided Later
If the user chooses the option where the dates are to be decided later, the `startDate` and `endDate` will be left as empty strings. In this case, the backend will require the following payload:

```javascript
const bePayload = {
  [FormKeys.NAME]: '',
  [FormKeys.TIMEZONE]: null,
  areDatesToBeDecided: true,
};
```

### 2. Backend Payload for One-Time Contract
If the contract is a one-time contract, the following data is sent to the backend:

```javascript
const bePayload = {
  [FormKeys.NAME]: '',
  [FormKeys.TIMEZONE]: null,
  [FormKeys.START_DATE]: '',
  [FormKeys.END_DATE]: '',
  [FormKeys.SELECTED_DATE_TYPE]: SelectedDateTypeContract.oneTime,
};
```

### 3. Backend Payload for Ongoing Contract
If the contract is ongoing, the frontend allows the user to select the renewalDate, but we send the endDate value to the backend. The payload for an ongoing contract is:
```javascript
const bePayload = {
[FormKeys.NAME]: '',
[FormKeys.TIMEZONE]: null,
[FormKeys.START_DATE]: '',
[FormKeys.END_DATE]: '',
[FormKeys.SELECTED_DATE_TYPE]: SelectedDateTpeContract.oneTime,
[FormKeys.RENEWAL_REMINDER_DAYS]: defaultRenewalDays,
[FormKeys.AUTO_RENEWAL]: false,
};
```

**Now after the contract is created from empty state we save the contract came from BE in state "setContractData" and the function "handleShowContractForm" redirect it to contract detail page.**

Now when the contract exists and contractData?.detail has data. "DealTab" component render the component "DealContract".
Deal contract component is a contract card with actions "view, edit, delete, publish with sign, publish without sign"

### 2. Add Services
NOTE: It is the most dangerous component of the contract, any changes in this component must be verified 100 times otherwise you won't be sure that it is properly working.

It starts from the component ContractCreation file path "src/app/sales/pages/contractCreation/index.jsx" to whom the contract is passed in the state "contractData" through ContractDetail component, file path: "src/app/sales/pages/deals/detail/contract/details/index.jsx".

Component ContractCreation has 6 useEffects and there purposes is listed below
1. This useEffect has these as dependencies [data, baseRates, activeStep, lineItems], purpose of this useEffect are
a. if there is data but no active step, it will set the active step of stepper.
b. if it is not a oneTimePayment and it is not a deviceStep then set it to oneTimePayment
c. if we have baseRates and data then call the dispatch function "setApiServicesData" (this will save the contract in redux)
2. This useEffect depends on [location, data] and checks if location?.state?.cycltRefError && !hasRedirectRefError && data then set HasRedirectRefError to true and set active step to 3
3. This useEffect has [activeStep] as his dependency and setOnDemandTotal by calculating them from this function "getOnDemandTotal"
4. This useEffect depends on [data,
   servicesTotal,
   onDemandTotal,
   formData?.[paymentTermsFormKeys.FUEL_SURCHARGE],
   formData?.[paymentTermsFormKeys.TAX_RATE],
   formData?.[paymentTermsFormKeys.FLAT_RATE]
] and if data is present, it setContractTotal by calculating it from "getContractCalculations".
5. This useEffect has [planId, contractCalculations] as dependencies and if data is present it sets totalPrice by calling function "getTotalPrice"
6. And the last useEffect will get the franchisePreferences if it has the franchiseId and contract is not published. it's dependency array is [franchiseId].

Now if the contract steps are not completed the function "getActiveFormComponent" will render the active step.
