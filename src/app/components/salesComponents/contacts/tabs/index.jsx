import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import classNames from 'classnames';
import ActivityBarSkeleton from 'commonComponents/skeletonLoader/activityBarSkeleton';
import PropTypes from 'prop-types';
import React, { Fragment, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import DateBar from 'salesComponents/companies/dateBar';
import NotesEmptyState from 'salesComponents/components/notesEmpty';
import Tasks from 'salesComponents/locations/taskTabs';
import CustomTabPanel from 'src/app/components/common/customTabPanel';
import {
  ACL_CONTACT_ACTIVITIES_VIEW,
  ACL_CONTACT_NOTES_DELETE,
  ACL_CONTACT_NOTES_UPDATE,
  ACL_CONTACT_NOTES_VIEW,
  ACL_CONTACT_TASKS_CREATE,
  ACL_CONTACT_TASKS_DELETE,
  ACL_CONTACT_TASKS_UPDATE,
  ACL_CONTACT_TASKS_VIEW,
} from 'src/app/router/constant/SALESMODULE';
import { getTaskTabIndex } from 'src/helper/utilityFunctions';
import { deleteCompanyNote } from 'src/services/company.service';
import userHasPermission from 'src/utils/auth/userHasPermission';
import { toastSettings } from 'src/utils/constants';

import ActivityContact from '../activityTab';
import NotesContact from '../notesTab';
import { useStyles } from './tabs';

const tabNames = {
  activities: 'activities',
  notes: 'notes',
  tasks: 'tasks',
};

const a11yProps = (index) => {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
};
const BasicTabsContacts = ({
  activities = [],
  notes = [],
  id,
  notesLoading,
  setNotesLoading,
  updateNote,
  fetchNotesListing,
  isSecondTabActive,
  setIsSecondTabActive,
  fetchActivities,
  loadingActvities,
  data,
  state,
  dispatch,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();

  const [value, setValue] = useState(0); // Initialize 'value' state variable

  const tabsConfig = [
    {
      label: t('sales.companies.activity'),
      content: loadingActvities ? (
        <Box className={classes.activitySkeleton}>
          <ActivityBarSkeleton noOfRows={5} />
        </Box>
      ) : (
        activities?.map((activity) => (
          <Fragment key={activity?.month} className={classes.tabsInnerWrap}>
            <DateBar date={activity?.month} />
            {activity?.monthlyActivities.map((monthlyActivity) => (
              <ActivityContact
                key={monthlyActivity?.id}
                {...monthlyActivity}
                activity={monthlyActivity}
              />
            ))}
          </Fragment>
        ))
      ),
      toShow: userHasPermission(ACL_CONTACT_ACTIVITIES_VIEW),
      tabProps: {
        className: classes.tabBtn,
        disableRipple: true,
        ...a11yProps(0),
      },
      name: tabNames.activities,
    },
    {
      label: (
        <>
          {t('sales.companies.notes')}
          {Number(state?.notesCount || data?.notesCount) > 0 && (
            <Box component="span" className={classes.pendingNumber}>
              {state?.notesCount || data?.notesCount}
            </Box>
          )}
        </>
      ),
      content: notesLoading ? (
        <Box className={classes.activitySkeleton}>
          <ActivityBarSkeleton noOfRows={5} />
        </Box>
      ) : notes.length > 0 ? (
        notes?.map((note) => (
          <Fragment key={note.month} className={classes.tabsInnerWrap}>
            <DateBar date={note.month} />
            {note.monthlyNotes.map((monthlyNote) => (
              <NotesContact
                key={monthlyNote.id}
                id={monthlyNote.id}
                title={monthlyNote.title}
                description={monthlyNote.description}
                month={note.month}
                deleteNote={() => getOnDelete(monthlyNote.id, note.month)}
                updateNote={updateNote}
                createdByName={monthlyNote?.createdBy}
                createdAt={monthlyNote?.createdAt}
                permissionSet={{
                  noteUpdatePermission: ACL_CONTACT_NOTES_UPDATE,
                  noteDeletePermission: ACL_CONTACT_NOTES_DELETE,
                }}
              />
            ))}
          </Fragment>
        ))
      ) : (
        <NotesEmptyState />
      ),
      toShow: userHasPermission(ACL_CONTACT_NOTES_VIEW),
      tabProps: {
        className: `${classes.tabBtn} ${classes.displayBlock}`,
        disableRipple: true,
        ...a11yProps(1),
      },
      name: tabNames.notes,
    },
    {
      label: (
        <Box>
          {t('sales.companies.tasks')}
          {Number(state?.tasksCount || data?.tasksCount) > 0 && (
            <Box component="span" className={classes.pendingNumber}>
              {state?.tasksCount || data?.tasksCount}
            </Box>
          )}
        </Box>
      ),
      content: (
        <Tasks
          dispatch={dispatch}
          permissionSet={{
            createTaskPermission: ACL_CONTACT_TASKS_CREATE,
            // viewTaskPermission: null,
            updateTaskPermission: ACL_CONTACT_TASKS_UPDATE,
            deleteTaskPermission: ACL_CONTACT_TASKS_DELETE,
          }}
        />
      ),
      toShow: userHasPermission(ACL_CONTACT_TASKS_VIEW),
      tabProps: {
        className: `${classes.tabBtn} ${classes.displayBlock}`,
        disableRipple: true,
        ...a11yProps(3),
      },
      dynamicIndex: getTaskTabIndex(location?.pathname), // You can handle this when rendering
      name: tabNames.tasks,
    },
  ];

  const handleChange = (event, newValue) => {
    setValue(newValue); // Update 'value' when the tab changes

    // Map current index to actual tab name, so logic works even if order changes
    const activeTab = tabsConfig?.filter((a) => a.toShow == true)?.[newValue]?.name;
    // Example: tabs = [{ name: 'activities' }, { name: 'notes' }]

    if (activeTab === tabNames.notes) {
      setIsSecondTabActive(true);
      return;
    }

    if (activeTab === tabNames.activities) {
      fetchActivities(id);
      setIsSecondTabActive(false);
      return;
    }
    // if (newValue === 1) {
    //   setIsSecondTabActive(true); // Set the flag to true when the second tab is selected
    // } else {
    //   fetchActivities(id);
    //   setIsSecondTabActive(false); // Set the flag to false for other tabs
    // }

    setIsSecondTabActive(false);
  };

  const getOnDelete = async (id) => {
    try {
      setNotesLoading(true);
      const apiResponse = await deleteCompanyNote(id);
      if (apiResponse.statusCode === 200) {
        fetchNotesListing();
        toast.success(apiResponse.message, {
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
      }
    } catch (error) {
      setNotesLoading(false);
      toast.error(error?.message, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  useEffect(() => {
    if (isSecondTabActive && id) {
      fetchNotesListing(); // Send the API call when the second tab is active
    }
  }, [isSecondTabActive]);

  // Check if the first tab is notes then show create note button
  useEffect(() => {
    const activeTab = tabsConfig?.filter((a) => a.toShow == true)?.[0]?.name;
    if (activeTab === tabNames.notes) {
      setIsSecondTabActive(true);
    }
  }, []);

  return (
    <>
      <Box sx={{ width: '100%' }} className={classes.tabArea}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            className={classes.tabsBtnWrapper}
            value={value}
            onChange={handleChange}
            aria-label="basic tabs example"
          >
            {tabsConfig
              .filter((a) => a.toShow == true)
              .map((tab, idx) => (
                <Tab
                  key={idx}
                  className={`${classes.tabBtn} ${classes.displayBlock}`}
                  disableRipple
                  label={tab.label}
                  {...a11yProps(idx)}
                />
              ))}

            {/* <Tab
              className={classes.tabBtn}
              disableRipple
              label={`${t('sales.companies.activity')}`}
              {...a11yProps(0)}
            />
            <Tab
              className={`${classes.tabBtn} ${classes.displayBlock}`}
              disableRipple
              // label={`${t('sales.companies.notes')}`}
              label={
                <>
                  {`${t('sales.companies.notes')}`}
                  {Number(state?.notesCount || data?.notesCount) > 0 && (
                    <Box component={'span'} className={classes.pendingNumber}>
                      {state?.notesCount || data?.notesCount}
                    </Box>
                  )}
                </>
              }
              {...a11yProps(1)}
            />
            <Tab
              className={`${classes.tabBtn} ${classes.displayBlock}`}
              disableRipple
              // label={`${t('sales.companies.tasks')}`}
              label={
                <>
                  {`${t('sales.companies.tasks')}`}
                  {Number(state?.tasksCount || data?.tasksCount) > 0 && (
                    <Box component={'span'} className={classes.pendingNumber}>
                      {state?.tasksCount || data?.tasksCount}
                    </Box>
                  )}
                </>
              }
              {...a11yProps(3)}
            /> */}
          </Tabs>
        </Box>

        {tabsConfig
          .filter((a) => a.toShow == true)
          .map((tab, idx) => (
            <CustomTabPanel
              key={idx}
              value={value}
              index={idx}
              className={classNames(classes.overviewTabs, 'innerScrollBar')}
            >
              {tab.content}
            </CustomTabPanel>
          ))}

        {/* <CustomTabPanel
          value={value}
          index={0}
          className={classNames(classes.overviewTabs, 'innerScrollBar')}
        >
          {loadingActvities ? (
            <Box className={classes.activitySkeleton}>
              <ActivityBarSkeleton noOfRows={5} />
            </Box>
          ) : (
            <>
              {activities?.map((activity) => (
                <Fragment key={activity?.month} className={classes.tabsInnerWrap}>
                  <DateBar date={activity?.month} />
                  {activity?.monthlyActivities.map((monthlyActivity) => (
                    <ActivityContact
                      key={monthlyActivity?.id}
                      activity={monthlyActivity}
                      {...monthlyActivity}
                    />
                  ))}
                </Fragment>
              ))}
            </>
          )}
        </CustomTabPanel>
        <CustomTabPanel
          value={value}
          index={1}
          className={classNames(classes.overviewTabs, 'innerScrollBar')}
        >
          {notesLoading ? (
            // Show a loader
            <Box className={classes.activitySkeleton}>
              <ActivityBarSkeleton noOfRows={5} />
            </Box>
          ) : notes.length > 0 ? (
            notes?.map((note) => (
              <Fragment key={note.month} className={classes.tabsInnerWrap}>
                <DateBar date={note.month} />
                {note.monthlyNotes.map((monthlyNote) => (
                  <NotesContact
                    key={monthlyNote.id}
                    id={monthlyNote.id}
                    title={monthlyNote.title}
                    description={monthlyNote.description}
                    month={note.month}
                    deleteNote={() => getOnDelete(monthlyNote.id, note.month)}
                    updateNote={updateNote}
                    createdByName={monthlyNote?.createdBy}
                    createdAt={monthlyNote?.createdAt}
                  />
                  // <NotesContact key={monthlyNote} deleteNote={getOnDelete} />
                ))}
              </Fragment>
            ))
          ) : (
            <NotesEmptyState />
          )}
        </CustomTabPanel>
        <CustomTabPanel
          value={value}
          index={getTaskTabIndex(location?.pathname)}
          className={classNames(classes.overviewTabs, 'innerScrollBar')}
        >
          <Tasks dispatch={dispatch} />
        </CustomTabPanel> */}
      </Box>
    </>
  );
};

BasicTabsContacts.propTypes = {
  activities: PropTypes.array,
  notes: PropTypes.array,
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  notesLoading: PropTypes.bool,
  setNotesLoading: PropTypes.func,
  updateNote: PropTypes.func,
  fetchNotesListing: PropTypes.func,
  isSecondTabActive: PropTypes.bool,
  setIsSecondTabActive: PropTypes.func,
  fetchActivities: PropTypes.func,
  loadingActvities: PropTypes.bool,
  data: PropTypes.object,
  state: PropTypes.object,
  dispatch: PropTypes.func,
};

export default BasicTabsContacts;
