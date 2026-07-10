import store from '../../redux/store/index';
import { checkACLPermission } from '../checkACLPermission';
import isDevBypassAuth from '../isDevBypassAuth';

export default function userHasPermissionSideBar(name, activeModule, aclPermission = '') {
  if (isDevBypassAuth()) {
    return true;
  }

  let hasPermission = false;

  const state = store.getState();
  const dashboardActive = state.auth.dashboardActive;
  const reduxACLPermissions = state.auth.accessControlPermissions;

  const moduleOk = Boolean(dashboardActive && activeModule.includes(dashboardActive));
  const aclLoaded = reduxACLPermissions && Object.keys(reduxACLPermissions).length > 0;

  hasPermission =
    moduleOk && (!aclLoaded || checkACLPermission(reduxACLPermissions, aclPermission));

  return hasPermission;
}
