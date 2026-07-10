import { Box, Button, Skeleton, Tooltip, Typography } from '@mui/material';
import { ReactComponent as NoDataIcon } from 'assets/images/Nodata.svg';
// import { ReactComponent as WarningIcon } from 'assets/svg/alert-red.svg';
import { ReactComponent as ArrowRight } from 'assets/svg/arrow-right.svg';
import { ReactComponent as ClockIcon } from 'assets/svg/clock-runsheet.svg';
import { ReactComponent as HitsICon } from 'assets/svg/hits-runsheet.svg';
// import { ReactComponent as SettingsIcon } from 'assets/svg/settings-preferences.svg';
import { ReactComponent as SIteICon } from 'assets/svg/site-runsheet.svg';
import { ReactComponent as WarningIconModal } from 'assets/svg/warning.svg';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import CustomDropDown from 'src/app/components/common/customDropDown';
import DirectionsMap from 'src/app/components/common/directionsMap';
// import LoaderComponent from 'src/app/components/common/loader';
import SearchComponent from 'src/app/components/common/search';
import SweetAlertModal from 'src/app/components/common/sweetAlertModal';
import { OBX_ASSIGN_HITS, OBX_RUNSHEET, OBX_RUNSHEET_CREATE } from 'src/app/router/constant/ROUTE';
import history from 'src/app/router/utils/history';
// import { _DownloadCloud, AddIcon } from 'src/assets/svg';
import { ReactComponent as CalenderIcon } from 'src/assets/svg/calendar.svg';
import { ReactComponent as FranchiseIcon } from 'src/assets/svg/FranchiseIcon.svg';
// import { ReactComponent as HitsIcons } from 'src/assets/svg/HitsIcons.svg';
import { ReactComponent as SiteIcon } from 'src/assets/svg/runsheet-r.svg';
import { ReactComponent as SeeListIcon } from 'src/assets/svg/SeeListIcon.svg';
// import { ReactComponent as StartingPointIcon } from 'src/assets/svg/StartingPointIcon.svg';
import { timeFormat12h } from 'src/helper/utilityFunctions';
// import { convertMinutesToHMFormat } from 'src/helper/utilityFunctions';
import { getRunSheetsByDaysListing, getUnassignedCount } from 'src/services/runsheet.services';
import { getAllSites } from 'src/services/sites.services';
import transformArrayForOptions from 'src/utils/array/transformArrayForOptions';
import { toastSettings } from 'src/utils/constants';

import { dayjsWithStandardOffset, getHoursDiff24HourFormat } from '../../schedules/helper';
import MapBottomButton from '../components/mapBottomButton';
import RunsheetInfoModal from '../components/runsheetInfoModal';
import RunsheetsAccordion from '../components/runsheetsAccordion';
import { useStyles } from './runsheets.styles';

const defaultCenter = { lat: 41.216362, lng: -96.13607 };

const AccordionListItem = (props) => {
  const classes = useStyles();
  const { name, hits, startsAt, endsAt, sites, runsheetTemplateId } = props;

  const goToRunsheetDetails = () => {
    history.push(`${OBX_RUNSHEET}/details/${runsheetTemplateId}`);
  };
  const finalName = name?.length < 25 ? name : `${name.substring(0, 25)} ...`;
  return (
    // accordian body?
    <Box
      className={classNames(classes.accordionListItem, classes.accordionListItemUnassigned)}
      onClick={goToRunsheetDetails}
    >
      <Box className={classes.accordionListTitle}>
        <Typography variant="h5" className={classes.accordionListTitleText}>
          {finalName}
        </Typography>
      </Box>
      <Box className={classes.dayShteetWrapper}>
        <Box className={classes.accordionListTime}>
          <SIteICon />
          <Typography className={classes.accordionListTimeText} variant="subtitle3">
            <b>{sites}</b> Sites
          </Typography>
        </Box>
        <Box className={classes.accordionListTime}>
          <HitsICon />
          <Typography className={classes.accordionListTimeText} variant="subtitle3">
            <b>{hits}</b> Hits
          </Typography>
        </Box>
        <Box className={classes.accordionListTime}>
          <ClockIcon />
          <Typography className={classes.accordionListTimeText} variant="subtitle3">
            {startsAt &&
              endsAt &&
              `${timeFormat12h(startsAt, true)} - ${timeFormat12h(endsAt, true)} (${getHoursDiff24HourFormat(startsAt, endsAt).toFixed(1)}h)`}
          </Typography>
        </Box>
        <Box className={classes.accordionListTime}>
          <CalenderIcon />
          <Typography className={classes.accordionListTimeText} variant="subtitle3">
            {startsAt && endsAt && `${dayjsWithStandardOffset(startsAt).format('MM/DD/YYYY')}`}
          </Typography>
        </Box>
        <Box className={classes.accordionListRedirection} onClick={goToRunsheetDetails}>
          <ArrowRight />
        </Box>
      </Box>
    </Box>
  );
};

AccordionListItem.propTypes = {
  // props: PropTypes.shape({
  name: PropTypes.string,
  endsAt: PropTypes.string,
  startsAt: PropTypes.string,
  hits: PropTypes.number,
  sites: PropTypes.number,
  runsheetTemplateId: PropTypes.string,
  // }),
};
const RunSheets = () => {
  const { t } = useTranslation();
  const [accordionOpen, setAccordionOpen] = useState(null);
  const [loading, setLoading] = useState(true);
  const [runSheets, setRunsheets] = useState([]);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedSites, setSelectedSites] = useState([]);
  const [query, setQuery] = useState('');
  const [sites, setSites] = useState([]);
  const [unAssignedCount, setUnAssignedCount] = useState(0);
  const [sitesLoading, setSiteLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const classes = useStyles({ expanded });
  const [runsheetDaySelected, setRunsheetDaySelected] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const _handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);

  const memorizedSitesOptions = useMemo(() => {
    return [...transformArrayForOptions(sites, 'name', 'id')];
  }, [sites]);

  const handleConfirmModal = () => {
    setShowUpdateModal(false);
    setEditPreferencesDrawer(true);
  };

  const _handleShowGlobalPreferences = () => {
    setGlobalPreferencesDrawer(true);
  };

  const handleSearch = async (e) => {
    setQuery(e?.target?.value || '');
  };

  const fetchUnassignedCount = async () => {
    try {
      let response = await getUnassignedCount({});

      if (response && response?.statusCode === 200) {
        setUnAssignedCount(response?.data?.unassignedHits);
      }
    } catch (error) {
      toast.error(error?.message, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  const getSites = async () => {
    try {
      let response = await getAllSites({ type: 'patrol' });

      if (response && response?.statusCode === 200) {
        setSites(response?.data?.sites);
      }
    } catch (error) {
      toast.error(error?.message, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    } finally {
      setSiteLoading(false);
    }
  };

  const getListing = async () => {
    try {
      let finalData = [];
      const selectedSiteIds = selectedSites.map((site) => site.id);
      const data = (await getRunSheetsByDaysListing({ siteIds: selectedSiteIds }))?.data;
      Object.keys(data)?.map((item) => {
        finalData = [...finalData, { day: item, data: data?.[item] }];
      });
      finalData.unshift(finalData.pop());
      setRunsheets(finalData);
    } catch (e) {
      toast.error(e?.message, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getListing();
  }, [selectedSites]);

  useEffect(() => {
    getSites();
    fetchUnassignedCount();
  }, []);

  const RenderAccordionHeader = (payload) => {
    const { day } = payload;
    return (
      <Box className={classes.accordionHeader}>
        <Box className={classes.accordionHeaderLeft}>
          <Typography variant="subtitle2" className={classes.accordionHeaderDay}>
            {day}
          </Typography>
        </Box>
        {!accordionOpen ? (
          <></>
        ) : (
          // <RunsheetWarningChip />
          <Tooltip
            title={
              <>
                Override global <br /> preferences for this day
              </>
            }
            arrow
          >
            {/* <SettingsIcon
              onClick={() => setShowUpdateModal(true)}
              className={classes.settingsIcon}
            /> */}
          </Tooltip>
        )}
      </Box>
    );
  };
  const toggleRightSide = () => {
    setExpanded(!expanded);
  };

  const finalRunSheetData = query?.length
    ? runSheets.map((runSheet) => ({
        ...runSheet,
        data: runSheet.data.filter((item) =>
          item?.name?.toLowerCase().includes(query?.toLowerCase()),
        ),
      }))
    : runSheets;

  const waypointsData = accordionOpen
    ? runSheets[accordionOpen?.replace('header-', '')]?.data
    : null;
  const centerForWholeView = waypointsData?.length
    ? waypointsData?.[0]?.coordinates?.[0]
    : defaultCenter;

  return (
    <>
      {/* {loading && <LoaderComponent />} */}
      {unAssignedCount > 0 && (
        <Box className={classes.assignHitsWrapper}>
          <Typography variant="subtitle2">
            {unAssignedCount} {t('obx.runsheet.unAssignHits')}
          </Typography>
          <Button
            variant="destructiveSecondary"
            onClick={() => {
              history.push(OBX_ASSIGN_HITS);
            }}
          >
            {t('obx.runsheet.assignHits')}
          </Button>
        </Box>
      )}
      <Box className={classes.mainWrapper}>
        <Box className={classes.leftSide}>
          <Box className={classes.runsheetsListingHeader}>
            <Box className={classes.runsheetsListingHeaderActions}>
              <Box>
                <Typography variant="h2" className={classes.runsheetsListingHeaderTitle}>
                  Runsheets
                </Typography>
                <Typography variant="body2" className={classes.runsheetsListingHeaderSubTitle}>
                  {t('obx.runSheetSettings.headings.listing')}
                </Typography>
              </Box>

              <Box className={classes.runsheetsListingHeaderBtns}>
                {/* <Button
                  onClick={handleOpenModal}
                  variant="secondaryGrey"
                  startIcon={<DownloadCloud />}
                >
                  Export
                </Button> */}
                <Button
                  variant="primary"
                  // startIcon={<AddIcon />}
                  onClick={() => {
                    history.push(OBX_RUNSHEET_CREATE);
                  }}
                >
                  {t('obx.runsheet.createRunsheet')}
                </Button>
              </Box>
            </Box>
            <Box className={classes.runsheetsListingHeaderActionsSearch}>
              <Box className={classes.runsheetsListingHeaderDropdowns}>
                <SearchComponent
                  name="search"
                  placeholder="Search by runsheet name"
                  onSearch={handleSearch}
                />
                {!sitesLoading && (
                  <CustomDropDown
                    label={`${t('obx.sites.filters.sitesType.all')}`}
                    checkmark
                    options={memorizedSitesOptions || []}
                    selectedValues={selectedSites || []}
                    handleChange={(e) => setSelectedSites(e.target.value)}
                    multiSelect={true}
                    searchable={true}
                    withTiles={true}
                    clearAll
                  />
                )}
              </Box>
            </Box>
          </Box>
          {loading ? (
            <Box className={classes.loaderBox}>
              <Skeleton variant="rectangular" />
              <Skeleton variant="rectangular" />
              <Skeleton variant="rectangular" />
              <Skeleton variant="rectangular" />
              <Skeleton variant="rectangular" />
            </Box>
          ) : (
            <Box className={classes.runsheetsAccordion}>
              {finalRunSheetData?.length
                ? finalRunSheetData?.map((runSheet, index) => {
                    const finalIndex = `header-${index}`;
                    return (
                      <RunsheetsAccordion
                        key={index}
                        accordionNo={index}
                        className={`${
                          accordionOpen === `header-${index}`
                            ? classes.runsheetsAccordionCurrent
                            : ''
                        }`}
                        header={RenderAccordionHeader(runSheet, index)}
                        showAccordion={!!(accordionOpen && accordionOpen == finalIndex)}
                        setShowAccordion={() => {
                          setRunsheetDaySelected(runSheet.day);
                          setAccordionOpen(finalIndex);
                        }}
                      >
                        {finalRunSheetData[index]?.data?.map((content, index) => (
                          <AccordionListItem key={index} {...content} />
                        ))}
                      </RunsheetsAccordion>
                    );
                  })
                : null}
            </Box>
          )}
          {!loading && !finalRunSheetData?.length && <NoRunsheetFound />}
        </Box>
        {/* //popup */}
        <SweetAlertModal
          type="warning"
          customClass={{
            confirmButton: classes.sweetAlertConfirmBlueButton,
          }}
          title="Override Global Preferences"
          text="
              Are you sure you want to override the preferences, it will override the global
              preferences of all runsheets for 01/12/2024 starting on or after 12a."
          cancelButtonText="Cancel"
          confirmButtonText="Yes, Edit"
          show={showUpdateModal}
          handleConfirmButton={handleConfirmModal}
          handleCancelButton={() => setShowUpdateModal(false)}
          icon={<WarningIconModal />}
        />
        <Box className={classes.rightSide}>
          <Button
            disableRipple
            className={classes.toggleButton}
            startIcon={<SeeListIcon className={classes.iconRotate} />}
            variant="onlyText"
            onClick={toggleRightSide}
          >
            {expanded && t('obx.runsheet.seeMore')}
          </Button>

          <Box className={classes.mapArea}>
            <MapBottomButton label={runsheetDaySelected} />
            <RunsheetInfoModal openModal={openModal} handleCloseModal={handleCloseModal} />
            <DirectionsMap
              center={centerForWholeView}
              waypoints={waypointsData}
              onlyShowPolyline={true}
              enableToolTipOnPolyline={true}
              showAllRunSheets={true}
              hideMap={!accordionOpen}
            />
          </Box>
          <Box className={classes.bottomArea}>
            {/* <Button disableRipple startIcon={<HitsIcons />} variant="onlyText">
              {t('obx.runsheet.hit')}
            </Button> */}
            <Button disableRipple startIcon={<SiteIcon />} variant="onlyText">
              {t('obx.runsheet.runSheet')}
            </Button>
            {/* <Button disableRipple startIcon={<StartingPointIcon />} variant="onlyText">
              {t('obx.runsheet.startingEndingPoint')}
            </Button> */}
            <Button disableRipple startIcon={<FranchiseIcon />} variant="onlyText">
              {t('obx.runsheet.franchise')}
            </Button>
          </Box>
        </Box>
      </Box>
    </>
  );
};
export default RunSheets;
// const RunsheetWarningChip = () => {
//   return <Chip color="error" icon={<WarningIcon />} label="2 runsheets requires attention" />;
// };

export const NoRunsheetFound = () => {
  const classes = useStyles();
  const { t } = useTranslation();
  return (
    <Box className={classes.notesBox}>
      <NoDataIcon />
      <Box className={classes.maxWidth}>
        <Typography variant="h2" className={classes.notesError}>
          {t('obx.runsheet.noRunSheetYet')}
        </Typography>
        <Typography variant="body2" className={classes.notesMessage}>
          {t('obx.runsheet.noRunsheetDetails')}
        </Typography>
      </Box>
      <Button
        variant="primary"
        onClick={() => {
          history.push(OBX_RUNSHEET_CREATE);
        }}
      >
        {' '}
        {t('obx.runsheet.createRunsheet')}
      </Button>
    </Box>
  );
};
