// import { assignToOptionsHash } from 'src/app/components/salesComponents/locations/newLocationsDrawer/location.constant';

/**
 * use to format assign to object for create Location API
 * @param {*} assignTo
 * @returns
 */
export const updateAssignToPayload = (addSupervisor, formData) => {
  // let updatedAssignTo = {};

  return {
    userId: formData?.assignee?.id,
    ...(addSupervisor ? { supervisorId: formData?.associatedSupervisor?.id } : {}),
  };

  // switch (assignTo) {
  //   case assignToOptionsHash?.home_officer?.value:
  //     updatedAssignTo.userId = 0;
  //     updatedAssignTo.supervisorId = 0;
  //     break;
  //   case assignToOptionsHash?.franchise_owner?.value:
  //     updatedAssignTo.userId = 0;
  //     updatedAssignTo.supervisorId = 0;
  //     break;
  //   case assignToOptionsHash?.director?.value:
  //     updatedAssignTo.userId = 0;
  //     updatedAssignTo.supervisorId = 0;
  //     break;
  //   case assignToOptionsHash?.sales_manager?.value:
  //     updatedAssignTo.userId = formData?.salesManager?.id;
  //     updatedAssignTo.supervisorId = 0;
  //     break;
  //   case assignToOptionsHash?.sales_person?.value:
  //     updatedAssignTo.userId = formData?.salesPerson?.id;
  //     updatedAssignTo.supervisorId = formData?.salesManager?.id;
  //     break;
  //   case assignToOptionsHash?.supervisor?.value:
  //     updatedAssignTo.userId = 0;
  //     updatedAssignTo.supervisorId = 0;
  //     break;
  //   case assignToOptionsHash?.coordinator?.value:
  //     updatedAssignTo.userId = 0;
  //     updatedAssignTo.supervisorId = 0;
  //     break;
  //   default:
  //     // Handle the default case if necessary
  //     break;
  // }

  // return updatedAssignTo;
};
