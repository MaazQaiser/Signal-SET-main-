import { Box, Drawer, Skeleton, Typography } from '@mui/material';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
// import { ReactComponent as MapIcon } from 'assets/icons/closemap.svg';
import roomImage from 'assets/images/roomImage.png';
import classNames from 'classnames';
import SearchComponent from 'commonComponents/search';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import InfiniteScrollCustom from 'src/app/components/common/infiniteScrollCustom';
import SearchComponentWithQuery from 'src/app/components/common/searchWithQuery';
import NoDataFound from 'src/app/components/common/SideBarNoDataFound';
import SideBarListingSkeleton from 'src/app/components/common/skeletonLoader/sidebarListingCardSkeleton';
import { findParentAndSiblingsPolygon, setSideBarData } from 'src/helper/utilityFunctions';
import { getAllSites } from 'src/services/sites.services';
import { actionItemTypeKeys, paginationOptions, rolesEnum } from 'src/utils/constants';

import { useStyles } from './franchiseMap';
const params = {
  page: paginationOptions.defaultPerPage,
  // perPage: paginationOptions.perPageRows,
  perPage: 10,
  search: '',
};

import { useSelector } from 'react-redux';
import CustomDropDown from 'src/app/components/common/customDropDown';
import CommonSignalMap from 'src/app/components/common/signalMap';
import { locationDrawerTypes } from 'src/app/sales/pages/deals/deals.constant';
import { useApiControllers } from 'src/helper/axios';
import { getFranchiseMapFO } from 'src/services/franchise.services';
import {
  getLiveTrackingVisitors,
  getOfficerShiftDetailsAPI,
  getPatrolOfficerLiveTrackingData,
} from 'src/services/scout.service';
import transformArrayForOptions from 'src/utils/array/transformArrayForOptions';
import { TourShiftStatusEnum } from 'src/utils/constants/schedules';

import { findTourShiftStatus } from '../schedules/shiftDetail';
export default function FranchiseMap() {
  const { t } = useTranslation();
  const userRole = useSelector((state) => state.auth.userRole);
  const [items, setItems] = useState([]);
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [queryParams, setQueryParams] = useState(params);
  const [totalRecords, setTotalRecords] = useState(1);
  const [query, setQuery] = useState('');
  const [lastElement, setLastElement] = useState(null);
  const { id } = useParams();
  const [currentId, setCurrentId] = useState('');
  const [officerDetails, setOfficerDetails] = useState(null);
  const [officerLoading, setOfficerLoading] = useState(false);
  const veriticalOptions = transformArrayForOptions(
    [
      {
        id: 6,
        value: 'all',
        label: t('sideNavBar.linkText.allVerticals'),
        name: 'all',
        key: t('sideNavBar.linkText.allVerticals'),
      },
      { id: 1, key: t('sideNavBar.linkText.commercial'), value: 'commercial' },
      { id: 2, key: t('sideNavBar.linkText.housing'), value: 'housing' },
      { id: 3, key: t('sideNavBar.linkText.industry'), value: 'industry' },
      { id: 4, key: t('sideNavBar.linkText.transit'), value: 'transit' },
      { id: 5, key: t('sideNavBar.linkText.retail'), value: 'retail' },
    ],
    'key',
    'value',
  );
  const [franchiseMapData, setFranchiseMapData] = useState([]);
  const classes = useStyles();
  const [showSearch, setShowSearch] = useState(false);
  const [onlyHideSearch, setOnlyHideSearch] = useState(false);
  const [formData, setFormData] = useState({ industryVerticals: [] });
  const [focusPoint, setFocusPoint] = useState({});
  const [siteLoading, setSiteLoading] = useState(false);
  const franchiseId = useSelector((state) => state?.auth?.franchiseId);
  const userInfo = useSelector((state) => state.user.info);

  const { getNewApiController } = useApiControllers();

  const closeSearch = () => {
    setShowSearch(false);
    // setQuery('');
    setQueryParams(params);
    // setItems([]);
    setFormData({ industryVerticals: [] });
  };

  const fetchSites = async (queryParams) => {
    setSiteLoading(true);
    const apiController = getNewApiController();
    try {
      let response = await getAllSites(queryParams, { signal: apiController.signal });

      if (response && response?.statusCode === 200) {
        setSideBarData(response, queryParams, setItems, setQueryParams, setTotalRecords, 'sites');
        setSiteLoading(false);
      }
      setSiteLoading(false);
    } catch (error) {
      if (!apiController.signal.aborted) {
        /**
         * show error in the corresponding field
         * parse errors in array format and set them in errorMessages
         * setErrorMessages(error)
         */
        setSiteLoading(false);
      }
    }
  };
  const getMoreData = () => {
    if (items.length < totalRecords && !loading) {
      setQueryParams((prev) => {
        const qParams = {
          ...prev,
          page: prev.page + 1,
        };

        fetchSites(qParams);
        return qParams;
      });
    }
  };
  const handleSelectedSite = (site) => {
    setFocusPoint(site);
  };

  const applySelectedClass = (id) => {
    return `${classes.listItem} ${currentId == id && classes.activeListItem}`;
  };
  const updateFormHandler = useCallback(
    (name, value) => {
      setFormData((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    },
    [setFormData],
  );

  const handleInputChange = useCallback(
    (event) => {
      const { name, value } = event.target;

      updateFormHandler(name, value);
    },
    [updateFormHandler],
  );

  const scrollBody = () => {
    if (items?.length < 1 && queryParams?.search?.length > 0 && !siteLoading) {
      return (
        <NoDataFound
          title={`${t('obx.sites.sidebarListing.noFranchiseFound')}`}
          searchedQuery={queryParams?.search}
          searchedTermText={`${t('obx.sites.sidebarListing.searchedTermNotFound', {
            searchedTerm: queryParams?.search,
          })}`}
        />
      );
    }
    if (items?.length < 1 && !siteLoading && queryParams?.verticals?.length !== 0) {
      return (
        <NoDataFound
          showFilteredResult={true}
          title={`${t('obx.sites.sidebarListing.noSiteFound')}`}
          searchedQuery={[]}
          searchedTermText={`${t('obx.sites.sidebarListing.filteredDataFound')}`}
        />
      );
    }
    return (
      <>
        {items?.length > 0 &&
          items?.map((site, index) => {
            // it is being used to determine if it is the last element so it could get its reference and apply infinite scroll methods
            const isLastElement =
              index === items.length - 1 && !siteLoading && items.length <= totalRecords;
            return (
              <ListItem
                key={site?.id}
                alignItems="flex-start"
                sx={{
                  borderBottom: '1px solid #e6e6e7',
                  borderTop: '1px solid #e6e6e7',
                  padding: 0,
                }}
                ref={isLastElement ? setLastElement : null}
                className={classNames(classes.detailSideList, applySelectedClass(site?.id))}
              >
                <ListItemButton
                  onClick={() => handleSelectedSite(site)}
                  className={classes.ListItemButton}
                >
                  <ListItemText
                    className={classes.listText}
                    primary={
                      <Box className={classes.hotelContent}>
                        <Typography variant="h4">{site?.name || t('commonText.nA')}</Typography>
                        <Typography variant="body3" className={classes.ownerName}>
                          {t('obx.sites.table.listing.columns.zone')}:{' '}
                          {site?.zone ? site?.zone : t('commonText.nA')}
                        </Typography>
                        <Typography className={classes.ownerName} variant="body3">
                          {site?.address || t('commonText.nA')}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Box className={classes.hotelDetailSections}>
                        <img
                          alt={site?.name}
                          src={site?.images[0]?.url || roomImage}
                          className={classes.roomImage}
                        />
                      </Box>
                    }
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        {siteLoading && <SideBarListingSkeleton />}
      </>
    );
  };

  const handleSearchClick = () => {
    setFocusPoint({});
  };

  const handleContentClick = async () => {
    let payload = JSON.parse(JSON.stringify(queryParams));
    if (formData?.industryVerticals?.length > 0) {
      let selectedIndustryVerticals = formData?.industryVerticals?.map(
        (vertical) => vertical?.value,
      );
      payload = { ...payload, verticals: selectedIndustryVerticals };
    } else {
      let { verticals: _deletedVerticals, ...rest } = payload;
      payload = rest;
    }
    setQueryParams(payload);
    setItems([]);
    setTotalRecords(0);
    fetchSites(payload);
    setShowSearch((prevShowSearch) => !prevShowSearch);
  };

  const getVisitorsForTracking = async () => {
    try {
      let data = await getLiveTrackingVisitors(null, franchiseId, null, null, userInfo?.id);
      setVisitors(data?.data);
    } catch (e) {
      toast.error(e.message, {
        position: 'top-right',
        autoClose: 2000,
      });
    }
  };
  const fetchGeoLocationData = async () => {
    try {
      setLoading(true);
      const data = await getFranchiseMapFO();
      const { franchiseArea } = findParentAndSiblingsPolygon(null, data, actionItemTypeKeys.site);
      // let visitors = stubbedData.franchiseMapWithTracking.success.data.visitors;
      franchiseArea.visitors = visitors;
      setFranchiseMapData(franchiseArea);
      setFocusPoint(franchiseArea?.sites?.[0]);
      setLoading(false);
    } catch (e) {
      toast.error(e.message, {
        position: 'top-right',
        autoClose: 2000,
      });
      setLoading(false);
    }
  };

  const getOfficerShiftDetails = async (shiftId, visitor) => {
    try {
      setOfficerLoading(true);

      const data =
        visitor?.job_type === 'patrol'
          ? await getPatrolOfficerLiveTrackingData(shiftId)
          : await getOfficerShiftDetailsAPI(shiftId);
      const shiftType = visitor?.job_type === 'patrol' ? 'patrol' : 'dedicated';
      const status = data?.data?.shift
        ? findTourShiftStatus({
            tours: data?.data?.shift?.tours,
            shiftStatus: data?.data?.shift?.shiftStatus,
            endsAt: data?.data?.shift?.endsAt,
            totalTours: data?.data?.shift?.totalTours,
          })
        : TourShiftStatusEnum.IN_PROGRESS;
      setOfficerDetails({
        ...(data?.data?.shift || data?.data),
        customShiftStatusKey: status,
        customShiftType: shiftType,
      });
      setOfficerLoading(false);
    } catch (e) {
      toast.error(e.message, {
        position: 'top-right',
        autoClose: 2000,
      });
      setOfficerLoading(false);
    }
  };

  const handleSearch = (query) => {
    const { value } = query?.target ?? '';
    let rest;
    if (value) {
      rest = { ...queryParams, search: value };
      setTotalRecords(0);
    } else {
      let { search: _deletedSearch, ...plucked } = queryParams;
      rest = plucked;
    }

    setItems([]);
    setQueryParams(rest);
    fetchSites(rest);
  };

  useEffect(() => {
    setCurrentId(id);
  }, [id]);

  /** get visitors data on regular intervals */
  useEffect(() => {
    if (userRole.slug === rolesEnum.supervisor) {
      const interval = setInterval(getVisitorsForTracking, 15000); // Fetch data every 7 seconds

      // Cleanup function to clear the interval when the component unmounts
      return () => {
        clearInterval(interval);
      };
    }
  }, []);

  useEffect(() => {
    if (!franchiseMapData?.franchises?.length) {
      fetchGeoLocationData();

      /** show visitors only to supervisors */
      if (userRole.slug === rolesEnum.supervisor) {
        getVisitorsForTracking();
      }
    }
    setItems([]);
    let payload = JSON.parse(JSON.stringify(queryParams));
    if (formData?.industryVerticals?.length > 0) {
      let selectedIndustryVerticals = formData?.industryVerticals?.map(
        (vertical) => vertical?.value,
      );
      payload = { ...payload, verticals: selectedIndustryVerticals };
    } else {
      let { verticals: _deletedVerticals, ...rest } = payload;
      payload = rest;
    }
    payload = { ...payload, page: params.page };

    setQueryParams(payload);
    fetchSites(payload);
  }, [formData?.industryVerticals]);

  const siteCountLabel =
    loading || totalRecords === 0
      ? `0 ${t('sideNavBar.linkText.sites')}`
      : totalRecords === 1
        ? `${totalRecords} ${t('sideNavBar.linkText.sites').slice(0, -1)}`
        : `${totalRecords} ${t('sideNavBar.linkText.sites')}`;
  return (
    <>
      <Box className={classes.mainMapSectionWrapper}>
        <Box className={classes.mainMapSection}>
          {!showSearch && !onlyHideSearch && (
            <Box className={classes.leftMapSection} onClick={handleContentClick}>
              <SearchComponent
                className={classes.customSearchColor}
                placeholder={t('form.input.textField.search.placeHolder')}
                fullWidth
                onClick={handleSearchClick}
              />
            </Box>
          )}
          <Drawer
            anchor={locationDrawerTypes.LEFT}
            open={showSearch}
            onClose={() => closeSearch()}
            className={classes.lefrDrawer}
            transitionDuration={400}
          >
            <Box className={classes.leftMapSectionInternal}>
              {/* <div onClick={closeSearch}>
                <MapIcon className={classes.mapIconClose} />
              </div> */}
              <Box className={classes.borderedSection}>
                <Box className={classes.flexSection}>
                  <SearchComponentWithQuery
                    disabled={false}
                    className={classes.customSearchColor}
                    query={query}
                    setQuery={setQuery}
                    onSearch={handleSearch}
                  />
                  <Box className={classes.dropDownSection}>
                    <CustomDropDown
                      enableForceClose={true}
                      label={`${t('sideNavBar.linkText.industryVerticals')}`}
                      options={veriticalOptions}
                      selectedValues={formData?.industryVerticals}
                      handleChange={(e) => {
                        handleInputChange(e);
                      }}
                      name="industryVerticals"
                      multiSelect
                      checkmark
                      bordered
                    />
                  </Box>
                  <Typography variant="subtitle2" className={classes.numberOfRooms}>
                    {siteCountLabel}
                  </Typography>
                </Box>
              </Box>
              <Box className={classes.hotelMainSection}>
                <div
                  style={{ height: 'calc(100vh - 203px)', overflowY: 'auto' }}
                  className="customscroll"
                >
                  <List className={classes.listMapSection}>
                    <InfiniteScrollCustom
                      totalNoOfRecords={totalRecords}
                      noOfRecordsBeingDisplayed={items.length}
                      lastElement={lastElement}
                      body={scrollBody}
                      getMoreData={getMoreData}
                    />
                  </List>
                </div>
              </Box>
            </Box>
          </Drawer>
        </Box>

        {!loading && franchiseMapData?.franchises && (
          <CommonSignalMap
            mapCenter={franchiseMapData?.franchises?.[0]?.franchiseLocation}
            franchiseData={franchiseMapData}
            createOrUpdate={false}
            setShowSearch={setOnlyHideSearch}
            setOfficerDetails={setOfficerDetails}
            externalCenter={focusPoint}
            visitors={visitors}
            officerDetails={officerDetails}
            getOfficerShiftDetails={getOfficerShiftDetails}
            officerLoading={officerLoading}
          />
        )}
        {loading && <Skeleton variant="rect" width={'100vw'} height={'100vh'} />}
      </Box>
    </>
  );
}
