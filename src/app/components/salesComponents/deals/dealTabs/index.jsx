import { Skeleton } from '@mui/material';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { Fragment, useEffect } from 'react';
import { propTypes } from 'react-bootstrap/esm/Image';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import Activity from 'salesComponents/companies/activity';
import DateBar from 'salesComponents/companies/dateBar';
import Notes from 'salesComponents/companies/notes';
import DealContract from 'salesComponents/deals/dealContract';
import ContractEmptyState from 'salesComponents/deals/emptyContract';
import Tasks from 'salesComponents/locations/taskTabs';
import CustomTabPanel from 'src/app/components/common/customTabPanel';
import ActivityBarSkeleton from 'src/app/components/common/skeletonLoader/activityBarSkeleton';
import { SALES_LOCATION } from 'src/app/router/constant/ROUTE';
import {
  ACL_DEAL_ACTIVITIES_VIEW,
  ACL_DEAL_CONTRACTS_CREATE,
  ACL_DEAL_CONTRACTS_VIEW,
  ACL_DEAL_NOTES_DELETE,
  ACL_DEAL_NOTES_UPDATE,
  ACL_DEAL_NOTES_VIEW,
  ACL_DEAL_TASKS_CREATE,
  ACL_DEAL_TASKS_DELETE,
  ACL_DEAL_TASKS_UPDATE,
  ACL_DEAL_TASKS_VIEW,
} from 'src/app/router/constant/SALESMODULE';
// import { getTaskTabIndex } from 'src/helper/utilityFunctions';
import RenderIfHasPermission from 'src/hoc/renderIfHasPermission';
import userHasPermission from 'src/utils/auth/userHasPermission';

import NotesEmptyState from '../../components/notesEmpty';
import HubSpotContract from '../dealContract/hubSpotContract';
import { useStyles } from './tabs';

const tabNames = {
  contract: 'contract',
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
const DealTabs = ({
  dealId,
  dealName,
  updateNote,
  fetchActivities,
  fetchNotes,
  activities = [],
  activitiesLoading,
  notes = [],
  notesLoading,
  getOnDelete,
  setValue,
  value,
  data,
  setData,
  handleShowContractForm,
  // contractLoading,
  openModalCloseDeal,
  isDealClosed,
  contractData,
  setContractData,
  hasContract = false,
  isFetchingDealDetails,
  isFetchingContractDetails,
  state,
  dispatch,
  setIsNotesTabActive,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const history = useHistory();

  const _location = useLocation();

  const handleLocationRedirection = () => {
    const locationId = data?.location?.id;
    if (locationId) history.push(`${SALES_LOCATION}/${locationId}`);
  };

  const tenantPermissions = useSelector((state) => state.auth.tenantPermissions);
  const enableOccurences = tenantPermissions?.enableOccurences || false;
  const stripeEnabled = tenantPermissions?.stripeEnabled || false;

  const tabsConfig = [
    {
      label: `${t('sales.deals.contractTerms')}`,
      className: classes.tabBtn,
      content: (
        <>
          {isFetchingContractDetails || isFetchingDealDetails ? (
            <Box className={classes.languageModalSkeletonWrapper}>
              <Skeleton
                variant="rectangular"
                height={45}
                className={classes.languageModalSkeleton}
              />
              <Skeleton
                variant="rectangular"
                height={45}
                className={classes.languageModalSkeleton}
              />
              <Skeleton
                variant="rectangular"
                height={45}
                className={classes.languageModalSkeleton}
              />
            </Box>
          ) : (
            <>
              {hasContract && contractData?.details ? (
                <DealContract
                  dealId={dealId}
                  contractData={contractData}
                  setContractData={setContractData}
                  handleShowContractForm={handleShowContractForm}
                  openModalCloseDeal={openModalCloseDeal}
                  isDealClosed={isDealClosed}
                  franchiseId={data?.franchiseInfo?.franchiseId}
                  setData={setData}
                  data={data}
                  enableOccurences={enableOccurences}
                  stripeEnabled={stripeEnabled}
                />
              ) : data?.hasHubspotContract && data?.hsContractUrl ? (
                <>
                  <HubSpotContract contractUrl={data?.hsContractUrl} />
                </>
              ) : (
                <RenderIfHasPermission name={ACL_DEAL_CONTRACTS_CREATE}>
                  <Box>
                    <ContractEmptyState
                      dealId={dealId}
                      dealName={dealName}
                      handleShowContractForm={handleShowContractForm}
                      isFranchiseLinked={!!data?.franchiseInfo?.franchiseId}
                      handleLocationRedirection={handleLocationRedirection}
                      setContractData={setContractData}
                      enableOccurences={enableOccurences}
                      locationId={data?.location?.id}
                      onFranchiseAssociated={(franchise) => {
                        setData((prev) => ({
                          ...prev,
                          franchiseInfo: {
                            franchiseId: franchise.id,
                            franchiseName: franchise.name,
                          },
                        }));
                      }}
                    />
                  </Box>
                </RenderIfHasPermission>
              )}
            </>
          )}
        </>
      ),
      toShow: userHasPermission(ACL_DEAL_CONTRACTS_VIEW),
      name: tabNames.contract,
    },
    {
      label: `${t('sales.companies.activity')}`,
      className: classes.tabBtn,
      content: (
        <>
          {activitiesLoading ? (
            // Show a loader
            <Box className={classes.activitySkeleton}>
              <ActivityBarSkeleton noOfRows={5} />
            </Box>
          ) : (
            activities?.map((activity) => (
              <Fragment key={activity?.month}>
                <DateBar date={activity?.month} />
                {activity?.monthlyActivities.map((monthlyActivity) => (
                  <Activity
                    key={monthlyActivity?.id}
                    {...monthlyActivity}
                    activity={monthlyActivity}
                  />
                ))}
              </Fragment>
            ))
          )}
        </>
      ),
      toShow: userHasPermission(ACL_DEAL_ACTIVITIES_VIEW),
      name: tabNames.activities,
    },
    {
      label: (
        <>
          {`${t('sales.companies.notes')}`}
          {Number(state?.notesCount || data?.notesCount) > 0 && (
            <Box component={'span'} className={classes.pendingNumber}>
              {state?.notesCount || data?.notesCount}
            </Box>
          )}
        </>
      ),
      className: `${classes.tabBtn} ${classes.displayBlock}`,
      content: (
        <>
          {notesLoading ? (
            // Show a loader
            <Box className={classes.activitySkeleton}>
              <ActivityBarSkeleton noOfRows={5} />
            </Box>
          ) : notes && notes?.length > 0 ? (
            notes?.map((note) => (
              <Fragment key={note.month}>
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
                      noteUpdatePermission: ACL_DEAL_NOTES_UPDATE,
                      noteDeletePermission: ACL_DEAL_NOTES_DELETE,
                    }}
                  />
                ))}
              </Fragment>
            ))
          ) : (
            <NotesEmptyState />
          )}
        </>
      ),
      toShow: userHasPermission(ACL_DEAL_NOTES_VIEW),
      name: tabNames.notes,
    },
    {
      label: (
        <>
          {`${t('sales.companies.tasks')}`}
          {Number(state?.tasksCount || data?.tasksCount) > 0 && (
            <Box component={'span'} className={classes.pendingNumber}>
              {state?.tasksCount || data?.tasksCount}
            </Box>
          )}
        </>
      ),
      className: `${classes.tabBtn} ${classes.displayBlock}`,
      content: (
        <Tasks
          dispatch={dispatch}
          permissionSet={{
            createTaskPermission: ACL_DEAL_TASKS_CREATE,
            updateTaskPermission: ACL_DEAL_TASKS_UPDATE,
            deleteTaskPermission: ACL_DEAL_TASKS_DELETE,
          }}
        />
      ),
      toShow: userHasPermission(ACL_DEAL_TASKS_VIEW),
      name: tabNames.tasks,
    },
  ];

  const handleChange = (event, newValue) => {
    setValue(newValue); // Update 'value' when the tab changes

    // Map current index to actual tab name, so logic works even if order changes
    const activeTab = tabsConfig?.filter((a) => a.toShow == true)?.[newValue]?.name;
    // Example: tabs = [{ name: 'companyQuestions' }, { name: 'activities' }, { name: 'notes' }]

    if (activeTab === tabNames.activities) {
      fetchActivities(dealId);
      setIsNotesTabActive(false);
      return;
    }

    if (activeTab === tabNames.notes) {
      fetchNotes(true);
      setIsNotesTabActive(true);
      return;
    }

    setIsNotesTabActive(false);
  };

  // Check if the first tab is notes then show create note button
  useEffect(() => {
    const activeTab = tabsConfig?.filter((a) => a.toShow == true)?.[0]?.name;
    if (activeTab === tabNames.activities) {
      fetchActivities(dealId);
      setIsNotesTabActive(false);
      return;
    }
    if (activeTab === tabNames.notes) {
      fetchNotes(true);
      setIsNotesTabActive(true);
      return;
    }
  }, []);

  return (
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
                className={tab.className}
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
            className={classNames(classes.overviewTabs, classes.innerScrollBar)}
          >
            {tab.content}
          </CustomTabPanel>
        ))}
    </Box>
  );
};

DealTabs.propTypes = {
  dealId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  dealName: PropTypes.string,
  updateNote: PropTypes.func,
  fetchActivities: PropTypes.func,
  fetchNotes: PropTypes.func,
  activities: PropTypes.array,
  activitiesLoading: PropTypes.bool,
  contractLoading: PropTypes.bool,
  notes: PropTypes.array,
  notesLoading: PropTypes.bool,
  getOnDelete: PropTypes.func,
  setValue: PropTypes.func,
  value: PropTypes.number,
  // questions: PropTypes.array,
  // setQuestions: PropTypes.func,
  // questionsLoading: PropTypes.bool,
  data: PropTypes.object,
  setData: PropTypes.func,
  handleShowContractForm: PropTypes.func,
  openModalCloseDeal: PropTypes.func,
  isDealClosed: PropTypes.bool,
  contractData: PropTypes.object,
  setContractData: PropTypes.func,
  hasContract: PropTypes.bool,
  isFetchingDealDetails: propTypes.bool,
  isFetchingContractDetails: propTypes.bool,
  state: PropTypes.object,
  dispatch: PropTypes.func,
  setIsNotesTabActive: PropTypes.func,
};

export default DealTabs;
