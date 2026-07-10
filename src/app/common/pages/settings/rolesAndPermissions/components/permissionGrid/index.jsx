import { Box, Checkbox, Typography } from '@mui/material';
import {
  CompanyIcon,
  ContactIcon,
  DashboardIcon,
  DealsIcon,
  IndustryVerticalsIcon,
  LocationIconSideBar,
  MapIcon,
  ScoutingIcon,
  TasksIcon,
} from 'assets/svg/index';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import NoRecordFound from 'src/app/components/common/table/noRecordFound';
import { ReactComponent as ACLFull } from 'src/assets/svg/ACLFull.svg';
import { ReactComponent as ACLMobile } from 'src/assets/svg/ACLMobile.svg';
import { ReactComponent as ACLSetting } from 'src/assets/svg/ACLSetting.svg';
import { ReactComponent as ACLUser } from 'src/assets/svg/ACLUser.svg';
import { ReactComponent as Regular } from 'src/assets/svg/checkbox.svg';
import { ReactComponent as Iregular } from 'src/assets/svg/checkbox-checked.svg';
import { deepClone, isObjectEmpty, sortObjectByKey } from 'src/helper/utilityFunctions';
import { accessControlList } from 'src/utils/constants';

import { useStyles } from './permissionStyle';

const standardKeys = ['view', 'create', 'update', 'delete', 'type'];

const removeRootStandardKeys = (obj) => {
  return Object.fromEntries(Object.entries(obj).filter(([key]) => !standardKeys.includes(key)));
};

const updateAllPermissions = (obj, permissionType, value) => {
  const newObj = deepClone(obj);
  const recursiveUpdate = (currentObj) => {
    if (currentObj[permissionType] !== undefined) {
      currentObj[permissionType] = value;
    }
    Object.keys(currentObj).forEach((key) => {
      if (
        typeof currentObj[key] === 'object' &&
        !Array.isArray(currentObj[key]) &&
        !standardKeys.includes(key)
      ) {
        recursiveUpdate(currentObj[key]);
      }
    });
  };

  recursiveUpdate(newObj);
  return newObj;
};

const PermissionCheckbox = React.memo(function PermissionCheckbox({
  checked,
  onChange,
  disabled = false,
}) {
  const classes = useStyles();

  return (
    <Box className={`${classes.cell} checkboxCell`}>
      <Checkbox
        icon={<Regular />}
        checkedIcon={<Iregular />}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="custom-checkbox"
      />
    </Box>
  );
});

PermissionCheckbox.propTypes = {
  disabled: PropTypes.bool,
  checked: PropTypes.bool,
  onChange: PropTypes.func,
};

const MasterControlRow = React.memo(function MasterControlRow({
  localPermissionData = {},
  onPermissionChange = () => {},
  disabled = false,
  // label = 'masterControl',
}) {
  const classes = useStyles();
  const { t } = useTranslation();
  const permissionTypes = ['view', 'create', 'update', 'delete'];
  const getMasterState = useCallback(
    (permissionType) => {
      let hasTrue = false;
      let hasFalse = false;

      const checkState = (obj) => {
        Object.entries(obj).forEach(([key, value]) => {
          if (typeof value === 'object' && !Array.isArray(value) && !standardKeys.includes(key)) {
            checkState(value);
          } else if (key === permissionType) {
            value ? (hasTrue = true) : (hasFalse = true);
          }
        });
      };

      checkState(localPermissionData);
      return hasTrue && hasFalse ? null : hasTrue;
    },
    [localPermissionData],
  );

  return (
    <Box className={`${classes.gridContainer} ${classes.subHeaderGrid}`}>
      <Box className={classes.cell}>
        <ACLFull />
        <Typography variant="subtitle2" className={classes.moduleName}>
          {t('sales.rolesPermissions.masterControl')}
        </Typography>
      </Box>

      {permissionTypes.map((type) => (
        <PermissionCheckbox
          key={type}
          disabled={disabled}
          checked={getMasterState(type) ?? false}
          onChange={(e) => {
            const newPermissions = updateAllPermissions(
              localPermissionData,
              type,
              e.target.checked,
            );
            onPermissionChange('', newPermissions);
          }}
        />
      ))}
    </Box>
  );
});

MasterControlRow.propTypes = {
  onPermissionChange: PropTypes.func,
  localPermissionData: PropTypes.object,
  disabled: PropTypes.bool,
  label: PropTypes.string,
};

const PermissionRow = React.memo(function PermissionRow({
  moduleName = '',
  moduleData = {},
  currentLevel = 1,
  parentPath = '',
  onPermissionChange = () => {},
  localPermissionData = undefined,
  setLocationPermissionData = () => {},
  disabled = false,
}) {
  if (currentLevel > 2) {
    return null;
  }

  const classes = useStyles();
  const { t } = useTranslation();
  const permissionTypes = ['view', 'create', 'update', 'delete'];

  const mainClass =
    currentLevel > 1
      ? `${classes.gridContainer} ${classes.subPermissions}`
      : `${classes.gridContainer} ${classes.subHeaderGrid}`;

  const subClass = currentLevel > 1 ? `${classes.subPermissionsCell}` : `${classes.cell}`;
  const fullPath = parentPath ? `${parentPath}.${moduleName}` : moduleName;

  const getNestedProperty = useCallback(
    (keys) => {
      return keys.reduce((current, key) => {
        return current && current[key] !== undefined ? current[key] : undefined;
      }, localPermissionData);
    },
    [localPermissionData],
  );
  const icons = {
    dashboard: <DashboardIcon />,
    companies: <CompanyIcon />,
    properties: <LocationIconSideBar />,
    deals: <DealsIcon />,
    contacts: <ContactIcon />,
    tasks: <TasksIcon />,
    signalMap: <MapIcon />,
    users: <ACLUser />,
    marketVerticals: <IndustryVerticalsIcon />,
    routes: <ScoutingIcon />,
    settings: <ACLSetting />,
    mobileExperience: <ACLMobile />,
  };
  const nonStandardData = removeRootStandardKeys(moduleData);
  const hasSubModules = Object.keys(nonStandardData).length > 0;
  return (
    <Box className={classes.subModuleWrapper}>
      <Box className={mainClass}>
        <Box className={`${subClass} subModuleCell ${classes.parentCol}`}>
          {currentLevel < 2 && icons?.[moduleName]}
          <Typography variant="subtitle2" className={classes.moduleName}>
            {t(
              `sales.rolesPermissions.${moduleName.charAt(0).toLowerCase()}${moduleName.slice(1)}`,
            )}
          </Typography>
        </Box>

        {permissionTypes.map((type) => {
          const pathWithAction = `${fullPath}.${type}`;
          const value = getNestedProperty(pathWithAction.split('.'));
          if (value === undefined) {
            return (
              <Box key={type} className={`${classes.cell} checkboxCell`}>
                -
              </Box>
            );
          }
          return (
            <PermissionCheckbox
              disabled={disabled}
              key={type}
              checked={!!value}
              onChange={(e) => onPermissionChange(pathWithAction, e.target.checked)}
            />
          );
        })}
      </Box>

      {hasSubModules &&
        Object.entries(nonStandardData).map(([subModuleName, subModuleData]) => (
          <PermissionRow
            key={subModuleName}
            moduleName={subModuleName}
            moduleData={subModuleData}
            onPermissionChange={onPermissionChange}
            parentPath={fullPath}
            localPermissionData={localPermissionData}
            setLocationPermissionData={setLocationPermissionData}
            disabled={disabled}
            currentLevel={currentLevel + 1}
          />
        ))}
    </Box>
  );
});

PermissionRow.propTypes = {
  disabled: PropTypes.bool,
  currentLevel: PropTypes.number,
  moduleName: PropTypes.string,
  moduleData: PropTypes.object,
  onPermissionChange: PropTypes.func,
  parentPath: PropTypes.string,
  localPermissionData: PropTypes.object,
  setLocationPermissionData: PropTypes.func,
};

const TypeSection = ({
  // type,
  permissions,
  onPermissionChange,
  localPermissionData,
  setLocationPermissionData,
  disabled,
}) => {
  // const { t } = useTranslation();
  const classes = useStyles();

  if (Object.keys(permissions).length === 0) {
    return null;
  }

  const nonStandardPermissions = Object.entries(permissions).reduce((acc, [key, value]) => {
    acc[key] = value;
    return acc;
  }, {});

  return (
    <Box className={classes.sectionWrapper}>
      {/*<Typography variant="h4" className={classes.sectionTitle}>*/}
      {/*  {t(`sales.rolesPermissions.section.${type}`)}*/}
      {/*</Typography>*/}

      <MasterControlRow
        localPermissionData={nonStandardPermissions}
        onPermissionChange={(_, value) => {
          const updatedPermissions = { ...localPermissionData };

          Object.keys(value).forEach((path) => {
            updatedPermissions[path] = value[path];
          });
          onPermissionChange('', updatedPermissions);
        }}
        disabled={disabled}
        // label={`${type.toLowerCase()}MasterControl`} // Not getting used in component
      />

      {Object.entries(nonStandardPermissions).map(([path, moduleData]) => (
        <PermissionRow
          key={path}
          moduleName={path.split('.').pop()}
          moduleData={moduleData}
          parentPath={path.split('.').slice(0, -1).join('.')}
          onPermissionChange={onPermissionChange}
          localPermissionData={localPermissionData}
          setLocationPermissionData={setLocationPermissionData}
          disabled={disabled}
          currentLevel={path.split('.').length}
        />
      ))}
    </Box>
  );
};

TypeSection.propTypes = {
  type: PropTypes.string.isRequired,
  permissions: PropTypes.object.isRequired,
  onPermissionChange: PropTypes.func.isRequired,
  localPermissionData: PropTypes.object.isRequired,
  setLocationPermissionData: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

const PermissionsGrid = ({
  selectedRole = {},
  isPending = false,
  setFormValues = () => {},
  disabled = false,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const permissionState = useMemo(() => accessControlList, [JSON.stringify(selectedRole)]);
  const [localPermissionData, setLocationPermissionData] = useState(
    sortObjectByKey(selectedRole?.setPrivileges || {}),
  );

  // Update localPermissionData when selectedRole changes (e.g., after reset)
  // This ensures the grid reflects updated data even if component doesn't remount
  useEffect(() => {
    const result = selectedRole?.setPrivileges || {};
    setLocationPermissionData(sortObjectByKey(result));
  }, [selectedRole]);

  const groupedPermissions = useMemo(() => {
    const result = {};

    const processObject = (structureObj, valuesObj = {}, currentResult) => {
      for (const [key, value] of Object.entries(valuesObj)) {
        if (value && typeof value === 'object' && !standardKeys.includes(key)) {
          // Assign type if available from structure (optional)
          const structureType = structureObj[key]?.type;
          if (!value?.type && structureType) {
            value.type = structureType;
          }

          // Ensure the current level key exists in result
          if (!currentResult[key]) {
            currentResult[key] = {};
          }

          // Shallow copy value into currentResult (preserving actions like view/update/etc.)
          Object.assign(currentResult[key], value);

          // Recursively go deeper
          processObject(structureObj[key] || {}, value, currentResult[key]);
        }
      }
    };

    processObject(permissionState, localPermissionData, result);
    return result;
  }, [permissionState, localPermissionData]);

  const onPermissionChange = (keys, value) => {
    if (!keys) {
      setLocationPermissionData(value);
      setFormValues(value);
      return;
    }

    const keysToMap = keys.split('.');
    let tempLocationPermissionData = { ...localPermissionData };
    let obj = tempLocationPermissionData;
    keysToMap.forEach((data, i) => {
      if (i === keysToMap?.length - 1) {
        obj[data] = value;
      } else {
        obj = obj[data];
      }
    });
    setLocationPermissionData(tempLocationPermissionData);
    setFormValues(tempLocationPermissionData);
  };

  if (!isObjectEmpty(selectedRole) && isObjectEmpty(selectedRole?.setPrivileges)) {
    return <NoRecordFound data={[]} noOfColumns={5} t={t} />;
  }

  if (isPending) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box className={classes.moduleWrapper}>
      <Box className={`${classes.gridContainer} ${classes.headerGrid}`}>
        <Typography variant="subtitle2" className={classes.moduleCell}>
          {t('sales.rolesPermissions.modules')}
        </Typography>
        {['view', 'create', 'update', 'delete'].map((type) => (
          <Typography key={type} variant="subtitle2" className={classes.headerCell}>
            {t(`sales.rolesPermissions.${type}`)}
          </Typography>
        ))}
      </Box>

      {/* {Object.values(PERMISSION_TYPES).map((type) => ( */}
      <TypeSection
        // key={type}
        // type={type}
        permissions={groupedPermissions}
        onPermissionChange={onPermissionChange}
        localPermissionData={localPermissionData}
        setLocationPermissionData={setLocationPermissionData}
        disabled={disabled}
      />
      {/* ))} */}
    </Box>
  );
};

PermissionsGrid.propTypes = {
  selectedRole: PropTypes.array,
  setFormValues: PropTypes.func,
  isPending: PropTypes.bool,
  disabled: PropTypes.bool,
};

export default PermissionsGrid;
