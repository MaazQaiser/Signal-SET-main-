import { locationAffiliationValues } from 'salesComponents/locations/newLocationsDrawer/location.constant';

/**
 * Export entities
 */
export const exportDataEntities = {
  Company: 'company',
};

/**
 * Chip Colors for companies, locations and contact
 * with key and label
 * */
export const locationAffiliationChipColors = {
  [locationAffiliationValues.corporate]: {
    backgroundColor: '#EFF8EF',
    color: '#2E964B',
  },
  [locationAffiliationValues.owned_remote]: {
    backgroundColor: '#FFF4D8',
    color: '#F6A300',
  },
  [locationAffiliationValues.tenant]: {
    backgroundColor: '#FEF0C7',
    color: '#F4780B',
  },
  [locationAffiliationValues.occupied_primary]: {
    backgroundColor: '#F4EDFD',
    color: '#9747FF',
  },
  [locationAffiliationValues.managed]: {
    backgroundColor: '#E5F6FF',
    color: '#146DFF',
  },
  [locationAffiliationValues.shared]: {
    color: '#D9534F',
    backgroundColor: '#FBEEED',
  },
  [locationAffiliationValues.headquarters]: {
    backgroundColor: '#FFF4D8',
    color: '#F6A300',
  },
  [locationAffiliationValues.owned]: {
    backgroundColor: '#F4EDFD',
    color: '#9747FF',
  },
  [locationAffiliationValues.regional_office]: {
    backgroundColor: '#EFF8EF',
    color: '#2E964B',
  },
};

/**
 * Chip Colors for contacts
 * with key and label
 * */
export const contactAffiliationChipColors = {
  billing: {
    backgroundColor: '#EFF8EF',
    color: '#2E964B',
  },
  blocker: {
    backgroundColor: '#FEF0C7',
    color: '#F4780B',
  },
  decision_maker: {
    backgroundColor: '#F4EDFD',
    color: '#9747FF',
  },
  end_user: {
    backgroundColor: '#E5F6FF',
    color: '#146DFF',
  },
  influencer: { color: '#D9534F', backgroundColor: '#FBEEED' },
};
