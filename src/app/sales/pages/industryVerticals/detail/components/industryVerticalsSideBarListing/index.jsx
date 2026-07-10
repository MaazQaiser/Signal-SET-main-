import { Typography } from '@mui/material';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import InfiniteScrollCustom from 'commonComponents/infiniteScrollCustom';
import SearchComponent from 'commonComponents/searchWithQuery';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import NoDataFound from 'src/app/components/common/SideBarNoDataFound/index.jsx';
import SideBarListingSkeleton from 'src/app/components/common/skeletonLoader/sidebarListingCardSkeleton.jsx';
import { SALES_INDUSTRY_VERTICALS_DETAIL } from 'src/app/router/constant/ROUTE';
import history from 'src/app/router/utils/history';
import { setSideBarData } from 'src/helper/utilityFunctions';
import { getIndustryVericals } from 'src/services/industryVerticals.service.js';
import { paginationOptions } from 'src/utils/constants';

import { useStyles } from './industryVerticalsSideBarListing.js';

const params = {
  page: 1,
  perPage: paginationOptions.perPageRows,
  search: '',
};

const IndustryVerticalsSidebarListings = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [queryParams, setQueryParams] = useState(params);
  const [totalRecords, setTotalRecords] = useState(1);
  const [query, setQuery] = useState('');
  const [lastElement, setLastElement] = useState(null);

  const { id } = useParams();
  const [currentId, setCurrentId] = useState('');
  const classes = useStyles();
  const { t } = useTranslation();

  const fetchIndustryVertical = async ({ page, perPage, search }) => {
    setLoading(true);
    try {
      const queryParams = {
        page,
        perPage,
        search,
      };
      const response = await getIndustryVericals(queryParams);
      if (response && response?.statusCode === 200) {
        setSideBarData(
          response,
          queryParams,
          setItems,
          setQueryParams,
          setTotalRecords,
          'industryVerticals',
        );
        setLoading(false);
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

  const getMoreData = () => {
    if (items.length < totalRecords && !loading) {
      setQueryParams((prev) => {
        const qParams = {
          ...prev,
          page: prev.page + 1,
        };
        fetchIndustryVertical(qParams);
        return qParams;
      });
    }
  };

  const handleSelectedSite = (id) => {
    history.push(`${SALES_INDUSTRY_VERTICALS_DETAIL.replace(':id', id)}`);
  };

  const applySelectedClass = (id) => {
    return `${classes.listItem} ${currentId == id && classes.activeListItem}`;
  };

  const scrollBody = () => {
    if (items.length < 1 && queryParams?.search.length > 0 && !loading) {
      return (
        <NoDataFound
          title={`${t('sales.industryVerticals.sidebarListingNoIndustryVerticalFound')}`}
          searchedQuery={queryParams?.search}
          searchedTermText={`${t('obx.sites.sidebarListing.searchedTermNotFound', {
            searchedTerm: queryParams?.search,
          })}`}
        />
      );
    }

    return (
      <>
        {items.length > 0 &&
          items.map((site, index) => {
            // it is being used to determine if it is the last element so it could get its reference and apply infinite scroll methods
            const isLastElement =
              index === items.length - 1 && !loading && items.length <= totalRecords;

            return (
              <ListItem
                key={site?.id}
                ref={isLastElement ? setLastElement : null}
                className={applySelectedClass(site?.id)}
              >
                <ListItemButton onClick={(_e) => handleSelectedSite(site?.id)}>
                  <Typography variant="subtitle1" className={classes.listItemTitle}>
                    {site?.name}
                  </Typography>
                  <Typography variant="body3" className={classes.listItemText}>
                    No. of Companies: {site?.totalCompanies}
                  </Typography>
                </ListItemButton>
              </ListItem>
            );
          })}
        {loading && <SideBarListingSkeleton />}
      </>
    );
  };
  // This function handles the search logic
  const handleSearch = (query) => {
    const { value } = query?.target ?? '';

    const queryParam = { ...queryParams, search: value, page: paginationOptions.defaultPerPage };

    setQueryParams(queryParam);

    fetchIndustryVertical(queryParam);
  };

  useEffect(() => {
    fetchIndustryVertical(queryParams);
  }, []);

  useEffect(() => {
    setCurrentId(id);
  }, [id]);

  return (
    <Box className={classes.sidebarWrapper}>
      <Box className={classes.industrySideBarSearch}>
        <SearchComponent query={query} setQuery={setQuery} onSearch={handleSearch} />
      </Box>
      <Box className={classes.industrySideBarScroll}>
        <List className={classes.industrySideBarScrollListing}>
          <InfiniteScrollCustom
            lastElement={lastElement}
            body={scrollBody}
            getMoreData={getMoreData}
          />
        </List>
      </Box>
    </Box>
  );
};

export default IndustryVerticalsSidebarListings;
