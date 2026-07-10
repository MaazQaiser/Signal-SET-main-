import AddIcon from '@mui/icons-material/Add';
import { Typography } from '@mui/material';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Box from '@mui/system/Box';
import styled from '@mui/system/styled';
import classNames from 'classnames';
import { useEffect, useReducer, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import CompanyInfo from 'salesComponents/companies/companyInfo';
import NotesModal from 'salesComponents/components/notesModal';
import ActivityBarSkeleton from 'src/app/components/common/skeletonLoader/activityBarSkeleton.jsx';
import BasicAccordion from 'src/app/components/salesComponents/companies/accordians';
import BasicTabs from 'src/app/components/salesComponents/companies/tabs';
import { SALES_COMPANIES } from 'src/app/router/constant/ROUTE.jsx';
import {
  ACL_COMPANY_ACTIVITY_VIEW,
  ACL_COMPANY_EMAILS_VIEW,
  ACL_COMPANY_MEETINGS_VIEW,
  ACL_COMPANY_NOTES_CREATE,
  ACL_COMPANY_NOTES_DELETE,
  ACL_COMPANY_NOTES_UPDATE,
  ACL_COMPANY_NOTES_VIEW,
  ACL_COMPANY_TASKS_CREATE,
  ACL_COMPANY_TASKS_DELETE,
  ACL_COMPANY_TASKS_UPDATE,
  ACL_COMPANY_TASKS_VIEW,
} from 'src/app/router/constant/SALESMODULE.jsx';
import history from 'src/app/router/utils/history.jsx';
import RenderIfHasPermission from 'src/hoc/renderIfHasPermission.jsx';
import {
  notesTasksCountReducer,
  taskNotesCountInitialState,
  UPDATE_COUNT_STATE,
} from 'src/redux/reducers/taskCount.reducer';
import {
  createCompanyNote,
  getCompany,
  getCompanyActivities,
  getCompanyNotes,
  updateCompanyNote,
} from 'src/services/company.service';
import userHasPermission from 'src/utils/auth/userHasPermission.jsx';
import { taskableTypes, toastSettings } from 'src/utils/constants';

import { useStyles } from './companyDetail.js';

const Item = styled('div')(({ _theme }) => ({}));

const CompanyDetails = () => {
  const [notesLoading, setNotesLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const classes = useStyles();
  const [data, setData] = useState({});
  const [activities, setActivities] = useState([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [isSecondTabActive, setIsSecondTabActive] = useState(false); // Flag for second tab
  const [notes, setNotes] = useState([]);
  const [open, setOpen] = useState(false);

  const [state, dispatch] = useReducer(notesTasksCountReducer, taskNotesCountInitialState);

  const handleChange = () => setOpen(!open);
  const { id } = useParams();
  const { t } = useTranslation();

  const fetchCompany = async (id) => {
    try {
      setLoading(true);
      const response = await getCompany(id);
      if (response?.statusCode === 200) {
        setData(response?.data);
      }
      setLoading(false);
    } catch (error) {
      //If location not found then redirect back to listing page
      if (error?.statusCode === 404) history.push(`${SALES_COMPANIES}`);
      /**
       * show error in the corresponding field
       */
      toast.error(error?.message, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
      setLoading(false);
    }
  };

  const fetchActivities = async (companyId) => {
    try {
      setActivitiesLoading(true);
      const response = await getCompanyActivities(companyId);
      if (response?.statusCode === 200) {
        setActivities(response?.data?.activities);
        setActivitiesLoading(false);
      }
    } catch (error) {
      /**
       * show error in the corresponding field
       * parse errors in array format and set them in errorMessages
       * setErrorMessages(error)
       */
      setActivitiesLoading(false);
    }
  };

  const createNote = async (note) => {
    try {
      setLoading(true);
      const response = await createCompanyNote(id, note);
      if (response.statusCode === 200) {
        addNoteToMonthlyData(response?.data);
        dispatch({
          type: UPDATE_COUNT_STATE,
          payload: {
            key: 'notesCount',
            value: state?.notesCount + 1,
          },
        });
      }
    } catch (error) {
      toast.error(error?.message, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    } finally {
      setLoading(false);
    }
  };

  const updateNote = async (noteId, note) => {
    try {
      setNotesLoading(true);
      const response = await updateCompanyNote(noteId, note);
      if (response?.statusCode === 200) {
        fetchNotesListing();
      }
    } catch (error) {
      setNotesLoading(false);
      toast.error(error?.message, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  const fetchNotesListing = async () => {
    try {
      setNotesLoading(true);
      const response = await getCompanyNotes(id);
      if (response?.statusCode === 200) {
        setNotes(response?.data?.notes);
        // Initialize a counter to sum all the notes
        let totalNotes = 0;

        // Iterate through the notes and sum up the number of notes
        response.data.notes.forEach((monthData) => {
          const monthlyNotes = monthData.monthlyNotes;
          totalNotes += monthlyNotes.length; // Add the number of notes in this month
        });
        dispatch({
          type: UPDATE_COUNT_STATE,
          payload: {
            key: 'notesCount',
            value: totalNotes,
          },
        });
      }
      setNotesLoading(false);
    } catch (error) {
      setNotesLoading(false);
      /**
       * show error in the corresponding field
       * parse errors in array format and set them in errorMessages
       * setErrorMessages(error)
       */
    }
  };

  useEffect(() => {
    if (!id) {
      return;
    }
    fetchCompany(id);
    if (userHasPermission(ACL_COMPANY_ACTIVITY_VIEW)) fetchActivities(id);
  }, [id]);

  const addNoteToMonthlyData = (newNote, monthlyData = notes) => {
    const currentDate = new Date();
    const currentMonth = currentDate.toLocaleString('default', {
      month: 'long',
    });
    const currentYear = currentDate.getFullYear();
    const currentMonthYear = `${currentMonth}, ${currentYear}`;

    const updatedMonthlyData = [...monthlyData];

    const matchingEntry = updatedMonthlyData.find((entry) => entry.month === currentMonthYear);

    if (matchingEntry) {
      matchingEntry.monthlyNotes.unshift(newNote);
    } else {
      updatedMonthlyData.unshift({
        month: currentMonthYear,
        monthlyNotes: [newNote],
      });
    }

    setNotes(updatedMonthlyData);
  };

  return (
    <>
      {/* {loading && <LoaderComponent size={50} color={'primary'} label={'Loading'} />} */}
      <Box className={classes.companiesArea}>
        {/* {loading && <LoaderComponent size={50} color={'primary'} label={'Loading'} />} */}
        <Box className={classes.companiesGrid}>
          <Box className={classNames(classes.leftSideBar, 'innerScrollBar')}>
            <CompanyInfo
              info={data?.company}
              loading={loading}
              fetchCompany={() => fetchCompany(id)}
            />
            {loading ? (
              <Box className={classes.skeletonWrapper}>
                <ActivityBarSkeleton onlyBar={true} noOfRows={4} />
              </Box>
            ) : (
              <BasicAccordion deals={data?.deals} data={data} setData={setData} id={id} />
            )}
          </Box>
          <Box className={classes.rightArea}>
            <Stack className={classes.overHeadr}>
              <Item className={classes.overViewHeading}>
                <Typography variant="h1">{t('sales.companies.overview')}</Typography>
              </Item>
              {isSecondTabActive && (
                <Item className={classes.noteBtn}>
                  <RenderIfHasPermission name={ACL_COMPANY_NOTES_CREATE}>
                    <Button
                      disableRipple
                      onClick={handleChange}
                      variant="primary"
                      startIcon={<AddIcon />}
                    >
                      {t('sales.companies.createNewNote')}
                    </Button>
                  </RenderIfHasPermission>
                  {open && (
                    <NotesModal open={open} handleClose={handleChange} onSaveCreate={createNote} />
                  )}
                </Item>
              )}
            </Stack>
            <BasicTabs
              activities={activities}
              notes={notes}
              id={id}
              notesLoading={notesLoading || loading}
              setNotesLoading={setNotesLoading}
              fetchNotesListing={fetchNotesListing}
              updateNote={updateNote}
              isSecondTabActive={isSecondTabActive}
              setIsSecondTabActive={setIsSecondTabActive}
              fetchActivities={fetchActivities}
              loadingActvities={activitiesLoading}
              renderFrom={taskableTypes.company}
              data={data}
              state={state}
              dispatch={dispatch}
              showEmailTab={false}
              permissionSet={{
                activityPermission: ACL_COMPANY_ACTIVITY_VIEW,
                notesPermission: ACL_COMPANY_NOTES_VIEW,
                noteUpdatePermission: ACL_COMPANY_NOTES_UPDATE,
                noteDeletePermission: ACL_COMPANY_NOTES_DELETE,
                tasksPermission: ACL_COMPANY_TASKS_VIEW,
                emailPermission: ACL_COMPANY_EMAILS_VIEW,
                meetingPermission: ACL_COMPANY_MEETINGS_VIEW,
                createTaskPermission: ACL_COMPANY_TASKS_CREATE,
                updateTaskPermission: ACL_COMPANY_TASKS_UPDATE,
                deleteTaskPermission: ACL_COMPANY_TASKS_DELETE,
              }}
            />
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default CompanyDetails;
