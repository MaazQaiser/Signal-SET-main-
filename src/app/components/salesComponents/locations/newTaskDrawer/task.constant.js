export const i18TaskTypes = (t) => [
  { label: `${t('sales.tasks.allTypes')}`, value: 'all' },
  { label: `${t('sales.tasks.todo')}`, value: 'todo' },
  { label: `${t('sales.tasks.email')}`, value: 'email' },
  { label: `${t('sales.tasks.call')}`, value: 'call' },
  { label: `${t('sales.tasks.linkedIn')}`, value: 'linked_in' },
];

export const i18PriorityTypes = (t) => [
  { label: `${t('sales.tasks.allPriority')}`, value: 'all' },
  { label: `${t('sales.tasks.high')}`, value: 'high' },
  { label: `${t('sales.tasks.medium')}`, value: 'medium' },
  { label: `${t('sales.tasks.low')}`, value: 'low' },
];

export const i18StatusTypes = (t) => [
  { label: `${t('sales.tasks.allStatus')}`, value: 'all' },
  { label: `${t('sales.tasks.todo')}`, value: 'not_started' },
  { label: `${t('sales.tasks.completed')}`, value: 'completed' },
];

export const i18RecordTypes = (t) => [
  { label: `${t('sales.tasks.allRecords')}`, value: 'all' },
  { label: `${t('sales.tasks.company')}`, value: 'Company' },
  { label: `${t('sales.tasks.property')}`, value: 'Location' },
  { label: `${t('sales.tasks.deal')}`, value: 'Deal' },
  { label: `${t('sales.tasks.contact')}`, value: 'Contact' },
];
