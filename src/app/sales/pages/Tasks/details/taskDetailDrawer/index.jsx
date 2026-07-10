import {
  Box,
  Drawer,
  IconButton,
  InputLabel,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
} from '@mui/material';
import { ReactComponent as InfoIcon } from 'assets/svg/info.svg';
import SweetAlertModal from 'commonComponents/sweetAlertModal';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { CloseIcon } from 'src/assets/svg';
import { ReactComponent as DeleteIcon } from 'src/assets/svg/DeleteIconBin.svg';
import { ReactComponent as EditIcon } from 'src/assets/svg/edit.svg';
import { ReactComponent as MoreHorizIcon } from 'src/assets/svg/more-vertical.svg';
import { checkIfDateIsPassed } from 'src/helper/utilityFunctions';
import RenderIfHasPermission from 'src/hoc/renderIfHasPermission';
import { getDisplayConfiguration } from 'src/redux/store/slices/regionalCountryConfiguration';
import userHasPermission from 'src/utils/auth/userHasPermission';
import { formatTimeAndDatefromTimestamp } from 'src/utils/date';

import { Type } from '../../listing';
import NewTaskDrawer from '../newTaskDrawer';
import { useStyles } from './taskDetailDrawer.js';

const TaskDetailDrawer = ({
  anchor,
  width,
  selectedTask,
  locationCloseDrawer,
  taskableType,
  fetchTasks,
  onConfirmDelete,
  permissionSet,
}) => {
  const { title, description, type, priority, dueDate, status } = selectedTask ?? {};
  const classes = useStyles();
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [showEditDrawer, setShowEditDrawer] = React.useState(false);
  const [confirmationModal, setConfirmationModal] = useState(false);
  const { dateFormat, timePrecision } = useSelector(getDisplayConfiguration);

  const showMoreBtn =
    userHasPermission(permissionSet?.updateTaskPermission) ||
    userHasPermission(permissionSet?.deleteTaskPermission);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleCloseDrawer = () => {
    if (locationCloseDrawer) {
      locationCloseDrawer(anchor);
    }
  };

  const handleEdit = () => {
    handleMenuClose();
    setShowEditDrawer(true);
  };

  const handleDelete = () => {
    setConfirmationModal(true);
    handleMenuClose();
  };

  return (
    <>
      {/*{formSubmitLoading && <LoaderComponent label={t('sales.loading')} />}*/}
      <Box
        className={classes.siderbarbox}
        sx={{ width: anchor === 'top' || anchor === 'bottom' ? 'auto' : width }}
        role="presentation"
      >
        <Box className={classes.sideheader}>
          <Box className={classes.boxHeader}>
            <Box className={classes.titleHead}>
              <Typography variant="h3" className={classes.sideTitle}>
                {title}
              </Typography>
              {showMoreBtn && (
                <Box className={classes.actions}>
                  {selectedTask?.generatedBy !== 'system' && (
                    <IconButton className={classes.iconButton} onClick={handleMenuOpen}>
                      <MoreHorizIcon />
                    </IconButton>
                  )}
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                    anchorOrigin={{
                      vertical: 'bottom',
                      horizontal: 'right',
                    }}
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                  >
                    <RenderIfHasPermission name={permissionSet?.updateTaskPermission}>
                      <MenuItem className={classes.menuItem} onClick={handleEdit}>
                        <EditIcon className={classes.menuIcon} />
                        {t('sales.locations.edit')}
                      </MenuItem>
                    </RenderIfHasPermission>
                    <RenderIfHasPermission name={permissionSet?.deleteTaskPermission}>
                      <MenuItem
                        onClick={handleDelete}
                        className={`${classes.menuItem} ${classes.deleteMenuItem}`}
                      >
                        <DeleteIcon className={classes.menuIcon} />
                        {t('sales.locations.delete')}
                      </MenuItem>
                    </RenderIfHasPermission>
                  </Menu>
                  <IconButton className={classes.iconButton} onClick={handleCloseDrawer}>
                    <CloseIcon />
                  </IconButton>
                </Box>
              )}
            </Box>
          </Box>
        </Box>
        <Box className={classes.boxinner}>
          <Box className={classes.taskistWrapper}>
            <Box className={classes.taskist}>
              <InputLabel className={classes.taskistlabel}>{t('sales.tasks.dateTime')}</InputLabel>
              <Typography variant="subtitle2" className={classes.taskistText}>
                {formatTimeAndDatefromTimestamp(dueDate, dateFormat, timePrecision)}
              </Typography>
              {checkIfDateIsPassed(dueDate) && status !== 'completed' && (
                <>
                  <Tooltip
                    arrow
                    slotProps={{
                      popper: {
                        modifiers: [
                          {
                            name: 'offset',
                            options: {
                              offset: [0, -14],
                            },
                          },
                        ],
                        sx: { cursor: 'pointer' },
                      },
                    }}
                    title={t('sales.tasks.dueDatePassed')}
                    placement="bottom"
                  >
                    <InfoIcon className={classes.alertIcon} />
                  </Tooltip>
                </>
              )}
            </Box>
            <Box className={classes.taskist}>
              <InputLabel className={classes.taskistlabel}>{t('sales.tasks.type')}</InputLabel>
              <Type type={type} t={t} />
            </Box>

            <Box className={classes.taskist}>
              <InputLabel className={classes.taskistlabel}>
                {t('sales.companies.priority')}
              </InputLabel>
              <Typography variant="subtitle2" className={classes.priorityText}>
                <Box
                  component="span"
                  className={`${classes.priorityDot} ${priority?.toLowerCase()}`}
                />
                {t(`sales.tasks.${priority}`)}
              </Typography>
            </Box>
          </Box>
          <InputLabel className={classes.taskistlabel}>
            {t('sales.companies.taskDescription')}
          </InputLabel>
          <Box dangerouslySetInnerHTML={{ __html: description }} />
        </Box>
      </Box>
      {showEditDrawer && (
        <Drawer anchor={'right'} open={showEditDrawer} onClose={() => setShowEditDrawer(false)}>
          <NewTaskDrawer
            anchor={'right'}
            locationCloseDrawer={() => {
              setShowEditDrawer(false);
              handleCloseDrawer();
            }}
            width={500}
            taskableType={taskableType}
            selectedTask={selectedTask}
            fetchTasks={fetchTasks}
          />
        </Drawer>
      )}
      {confirmationModal && (
        <SweetAlertModal
          type="warning" // 'success', 'error', 'warning', 'info', etc.
          title={t('sales.tasks.deleteTask')}
          text={t('sales.tasks.deleteMessage')}
          cancelButtonText={t('links.cancel')}
          confirmButtonText={t('links.delete')}
          show={confirmationModal}
          handleConfirmButton={onConfirmDelete}
          handleCancelButton={() => setConfirmationModal(false)}
          icon={<DeleteIcon />}
        />
      )}
    </>
  );
};

TaskDetailDrawer.propTypes = {
  anchor: PropTypes.string,
  locationCloseDrawer: PropTypes.func,
  width: PropTypes.number,
  taskableType: PropTypes.string,
  selectedTask: PropTypes.object,
  fetchTasks: PropTypes.func,
  onConfirmDelete: PropTypes.func,
  permissionSet: PropTypes.object,
};

export default TaskDetailDrawer;
