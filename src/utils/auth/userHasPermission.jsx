import store from '../../redux/store/index';
import { checkACLPermission } from '../checkACLPermission';
import isDevBypassAuth from '../isDevBypassAuth';

export default function userHasPermission(name) {
  if (isDevBypassAuth()) {
    return true;
  }

  let hasPermission = false;

  if (!name) {
    return hasPermission;
  }

  const state = store.getState();
  const reduxACLPermissions = state.auth.accessControlPermissions;

  hasPermission = checkACLPermission(reduxACLPermissions, name);

  return hasPermission;
}
