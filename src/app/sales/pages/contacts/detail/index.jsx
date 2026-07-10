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
import NotesModal from 'salesComponents/components/notesModal';
import {
  createContactNote,
  getContactActivities,
  getContactDetail,
  getContactNotes,
  updateContactNote,
} from 'services/contact.service';
import ActivityBarSkeleton from 'src/app/components/common/skeletonLoader/activityBarSkeleton.jsx';
import BasicAccordionContacts from 'src/app/components/salesComponents/contacts/accordians/index.jsx';
import ContactInfo from 'src/app/components/salesComponents/contacts/contactInfo/index.jsx';
import BasicTabsContacts from 'src/app/components/salesComponents/contacts/tabs/index.jsx';
import {
  ACL_CONTACT_ACTIVITIES_VIEW,
  ACL_CONTACT_NOTES_CREATE,
} from 'src/app/router/constant/SALESMODULE.jsx';
import RenderIfHasPermission from 'src/hoc/renderIfHasPermission.jsx';
import {
  notesTasksCountReducer,
  taskNotesCountInitialState,
  UPDATE_COUNT_STATE,
} from 'src/redux/reducers/taskCount.reducer';
import userHasPermission from 'src/utils/auth/userHasPermission.jsx';
import { toastSettings } from 'src/utils/constants';

import { useStyles } from './contactDetails.js';

const Item = styled('div')(({ _theme }) => ({}));

const ContactDetails = () => {
  const [notesLoading, setNotesLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const classes = useStyles();
  const [data, setData] = useState({});
  const [activities, setActivities] = useState([]);
  const [activitiesLoading, setActivitiesLoading] = useState(false);
  const [isSecondTabActive, setIsSecondTabActive] = useState(false); // Flag for second tab
  const [notes, setNotes] = useState([]);
  const [open, setOpen] = useState(false);

  const [state, dispatch] = useReducer(notesTasksCountReducer, taskNotesCountInitialState);

  const handleChange = () => setOpen(!open);
  const { id } = useParams();
  const { t } = useTranslation();
  const fetchContactDetail = async (id) => {
    try {
      setLoading(true);
      const response = await getContactDetail(id);
      if (response?.statusCode === 200) {
        setData(response?.data);
      }
      setLoading(false);
    } catch (error) {
      /**
       * show error in the corresponding field
       * parse errors in array format and set them in errorMessages
       * setErrorMessages(error)
       */
      setLoading(false);
    }
  };

  const fetchActivities = async (id) => {
    try {
      setActivitiesLoading(true);
      const response = await getContactActivities(id);
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
      const response = await createContactNote(id, note);
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
      const response = await updateContactNote(noteId, note);
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
      const response = await getContactNotes(id);
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

  const refreshData = () => {
    fetchContactDetail(id);
    if (userHasPermission(ACL_CONTACT_ACTIVITIES_VIEW)) fetchActivities(id);
  };

  useEffect(() => {
    if (!id) {
      return;
    }
    fetchContactDetail(id);
    if (userHasPermission(ACL_CONTACT_ACTIVITIES_VIEW)) fetchActivities(id);
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
            <ContactInfo info={data} loading={loading} refresh={refreshData} />
            {loading ? (
              <ActivityBarSkeleton onlyBar={true} noOfRows={4} />
            ) : (
              <BasicAccordionContacts
                deals={data?.deals}
                contacts={data?.contacts}
                data={data}
                setData={setData}
                id={id}
              />
            )}
          </Box>
          <Box className={classes.rightArea}>
            <Stack className={classes.overHeadr}>
              <Item className={classes.overViewHeading}>
                <Typography variant="h1">{t('sales.companies.overview')}</Typography>
              </Item>
              {isSecondTabActive && (
                <Item className={classes.noteBtn}>
                  <RenderIfHasPermission name={ACL_CONTACT_NOTES_CREATE}>
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
            <BasicTabsContacts
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
              data={data}
              state={state}
              dispatch={dispatch}
            />
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default ContactDetails;
