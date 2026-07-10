import { Typography } from '@mui/material';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import classNames from 'classnames';
import CustomDropDown from 'commonComponents/customDropDown';
import PropTypes from 'prop-types';
import React, { Fragment, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import Activity from 'salesComponents/companies/activity';
import DateBar from 'salesComponents/companies/dateBar';
import Notes from 'salesComponents/companies/notes';
import MeetingsCalendar from 'salesComponents/locations/meetings/meetingsCalendar';
import { getDealQuestions } from 'services/deal.service';
import CustomTabPanel from 'src/app/components/common/customTabPanel';
import ActivityBarSkeleton from 'src/app/components/common/skeletonLoader/activityBarSkeleton';
import { isObjectEmpty } from 'src/helper/utilityFunctions';
import { deleteCompanyNote } from 'src/services/company.service';
import transformArrayForOptions from 'src/utils/array/transformArrayForOptions';
import userHasPermission from 'src/utils/auth/userHasPermission';
import { toastSettings } from 'src/utils/constants';

import NotesEmptyState from '../../components/notesEmpty';
import RelevantQuestions from '../../deals/relevantQuestions';
import EmailListing from '../../locations/email/emailListing';
import Tasks from '../../locations/taskTabs';
import NoCompanyFound from './nodata';
import { useStyles } from './tabs';

const tabNames = {
  questions: 'questions',
  activities: 'activities',
  notes: 'notes',
  tasks: 'tasks',
  emails: 'emails',
  meetings: 'meetings',
};

const a11yProps = (index) => {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
};

const BasicTabs = ({
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
  // dealId,
  // questions,
  // setQuestions,
  // questionsLoading,
  // fetchQuestions,
  showQuestions,
  setData,
  data,
  state,
  dispatch,
  showEmailTab = false,
  permissionSet = {},
}) => {
  const { t } = useTranslation();

  const classes = useStyles();

  const [value, setValue] = useState(0); // Initialize 'value' state variable

  const [questionsLoading, setQuestionsLoading] = useState(false);

  const [questions, setQuestions] = useState({});

  const [selectedValue, setSelectedValue] = useState({});

  const handleChange = (event, newValue) => {
    setValue(newValue); // Update 'value' when the tab changes

    // Map current index to actual tab name, so logic works even if order changes
    const activeTab = tabsConfig?.filter((a) => a.toShow == true)?.[newValue]?.name;
    // Example: tabs = [{ name: 'companyQuestions' }, { name: 'activities' }, { name: 'notes' }]

    // if ((showQuestions && newValue === 2) || (!showQuestions && newValue === 1)) {
    //   setIsSecondTabActive(true); // Set the flag to true when the second tab is selected
    //   return;
    // }
    // if (newValue === 1 || (!showQuestions && newValue === 0)) {
    //   fetchActivities(id);
    //   setIsSecondTabActive(false); // Set the flag to false for other tabs
    //   return;
    // }
    // if (showQuestions && newValue === 0) {
    //   fetchFirstCompanyQuestions();
    //   setIsSecondTabActive(false); // Set the flag to false for other tabs
    //   return;
    // }
    if (activeTab === tabNames.notes) {
      setIsSecondTabActive(true);
      return;
    }

    if (activeTab === tabNames.activities) {
      fetchActivities(id);
      setIsSecondTabActive(false);
      return;
    }

    if (activeTab === tabNames.questions) {
      fetchFirstCompanyQuestions();
      setIsSecondTabActive(false);
      return;
    }

    setIsSecondTabActive(false); // Set the flag to false for other tabs
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

  const handleCompanySelection = (event) => {
    const { _name, value } = event.target;
    if (value) {
      const data = {
        companyId: value?.id,
      };
      // setSelectedValue(() => ({
      //   [name]: value,
      // }));
      setSelectedValue(value);
      fetchQuestions(id, data);
    }
  };

  const fetchQuestions = async (id, data = {}) => {
    try {
      setQuestionsLoading(true);
      const response = await getDealQuestions(id, data);
      if (response.statusCode === 200) {
        setQuestions(response?.data);
      }
      setQuestionsLoading(false);
    } catch (error) {
      /**
       * show error in the corresponding field
       */
      toast.error(error?.message, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
      setQuestionsLoading(false);
    }
  };

  const fetchFirstCompanyQuestions = async () => {
    if (data?.companies?.length) {
      setSelectedValue(transformArrayForOptions(data?.companies, 'name', 'id')?.[0] || {});
      fetchQuestions(id, { companyId: data?.companies?.[0]?.id });
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

  /**
   * Use this useEffect to assign first company and get its questionnaires
   * */
  // useEffect(() => {
  //   fetchFirstCompanyQuestions();
  // }, [JSON.stringify(data?.companies)]);

  const tabsConfig = [
    ...(showQuestions
      ? [
          {
            label: t('sales.companies.classificationQuestions'),
            content: (
              <Box className={classes.companyWrapper}>
                <Box className={classes.companyDropDown}>
                  <Typography variant="body2" className={classes.title}>
                    {t('sales.locations.company')}
                  </Typography>
                  <CustomDropDown
                    label={t('sales.locations.company')}
                    name="companySelection"
                    options={transformArrayForOptions(data?.companies, 'name', 'id') || []}
                    selectedValues={selectedValue || {}}
                    handleChange={(event) => handleCompanySelection(event)}
                    bordered
                    placeHolder={t('sales.deals.selectCompany')}
                  />
                </Box>
                {!isObjectEmpty(selectedValue) ? (
                  questionsLoading ? (
                    <Box className={classes.activitySkeleton}>
                      <ActivityBarSkeleton noOfRows={5} />
                    </Box>
                  ) : (
                    <RelevantQuestions
                      questions={questions}
                      setQuestions={setQuestions}
                      leadId={id}
                      questionsLoading={questionsLoading}
                      setData={setData}
                      selectedCompany={selectedValue}
                    />
                  )
                ) : (
                  <NoCompanyFound />
                )}
              </Box>
            ),
            toShow: userHasPermission(permissionSet?.questionPermission),
            name: tabNames.questions,
          },
        ]
      : []),

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
              <Activity key={monthlyActivity?.id} activity={monthlyActivity} {...monthlyActivity} />
            ))}
          </Fragment>
        ))
      ),
      toShow: userHasPermission(permissionSet?.activityPermission),
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
        notes.map((note) => (
          <Fragment key={note.month} className={classes.tabsInnerWrap}>
            <DateBar date={note.month} />
            {note.monthlyNotes.map((monthlyNote) => (
              <Notes
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
                  noteUpdatePermission: permissionSet.noteUpdatePermission,
                  noteDeletePermission: permissionSet.noteDeletePermission,
                }}
              />
            ))}
          </Fragment>
        ))
      ) : (
        <NotesEmptyState />
      ),
      toShow: userHasPermission(permissionSet?.notesPermission),
      name: tabNames.notes,
    },

    {
      label: (
        <>
          {t('sales.companies.tasks')}
          {Number(state?.tasksCount || data?.tasksCount) > 0 && (
            <Box component="span" className={classes.pendingNumber}>
              {state?.tasksCount || data?.tasksCount}
            </Box>
          )}
        </>
      ),
      content: (
        <Tasks
          dispatch={dispatch}
          permissionSet={{
            createTaskPermission: permissionSet?.createTaskPermission,
            // viewTaskPermission: null,
            updateTaskPermission: permissionSet?.updateTaskPermission,
            deleteTaskPermission: permissionSet?.deleteTaskPermission,
          }}
        />
      ),
      toShow: userHasPermission(permissionSet?.tasksPermission),
      name: tabNames.tasks,
    },

    ...(showEmailTab
      ? [
          {
            label: t('sales.locations.emails'),
            content: (
              <EmailListing
                contacts={data?.contacts || []}
                permissionSet={{
                  emailConfigurationCreate: permissionSet?.connectEmailPermission,
                  createEmailPermission: permissionSet?.createEmailPermission,
                  updateEmailPermission: permissionSet?.updateEmailPermission,
                  deleteEmailPermission: permissionSet?.deleteEmailPermission,
                }}
              />
            ),
            toShow: userHasPermission(permissionSet?.emailPermission),
            name: tabNames.emails,
          },
          {
            label: t('sales.locations.meetings'),
            content: (
              <MeetingsCalendar
                contacts={data?.contacts || []}
                permissionSet={{
                  emailConfigurationCreate: permissionSet?.connectEmailPermission,
                  createMeetingPermission: permissionSet?.createMeetingPermission,
                  updateMeetingPermission: permissionSet?.updateMeetingPermission,
                  deleteMeetingPermission: permissionSet?.deleteMeetingPermission,
                }}
              />
            ),
            toShow: userHasPermission(permissionSet?.meetingPermission),
            name: tabNames.meetings,
          },
        ]
      : []),
  ];

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
      </Box>
    </>
  );
};

BasicTabs.propTypes = {
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
  // dealId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  questions: PropTypes.array,
  setQuestions: PropTypes.func,
  questionsLoading: PropTypes.bool,
  fetchQuestions: PropTypes.func,
  showQuestions: PropTypes.bool,
  setData: PropTypes.func,
  data: PropTypes.object,
  renderFrom: PropTypes.string,
  state: PropTypes.object,
  dispatch: PropTypes.func,
  showEmailTab: PropTypes.bool,
  permissionSet: PropTypes.object,
};

export default BasicTabs;
