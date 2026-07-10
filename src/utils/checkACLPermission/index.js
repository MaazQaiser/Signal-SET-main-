export const checkACLPermission = (aclPermissions, routePermission) => {
  try {
    let hasPermission = null;
    const paths = routePermission.split('.');

    let currentLevel = aclPermissions;
    for (const path of paths) {
      currentLevel = currentLevel?.[path];

      if (currentLevel === undefined || currentLevel === false) {
        hasPermission = false;
      }
    }

    if (currentLevel) {
      hasPermission = true;
    }

    if (typeof currentLevel === 'object') {
      hasPermission = true;
    }
    return hasPermission;
  } catch (e) {
    console.error({ e: e.message, aclPermissions, routePermission });
  }
};
