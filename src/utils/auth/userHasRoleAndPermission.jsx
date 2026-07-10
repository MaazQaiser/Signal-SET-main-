import store from '../../store';

export default function userHasRoleAndPermission(role, permission) {
  let hasRoleAndPermission = false;

  if (!role || !permission) {
    return hasRoleAndPermission;
  }

  const state = store.getState();
  const permissions = state.auth.permissions;
  const userRoleId = state.auth.userRoleId;

  if (permissions && permissions.length > 0) {
    hasRoleAndPermission = role === userRoleId;
    hasRoleAndPermission = hasRoleAndPermission && permissions.includes(permission);
  }

  return hasRoleAndPermission;
}
