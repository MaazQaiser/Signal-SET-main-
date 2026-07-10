import { Popover, Stack } from '@mui/material';
import Button from '@mui/material/Button';
import history from 'app/router/utils/history';
import classNames from 'classnames';
import CustomDropDown from 'commonComponents/customDropDown';
import PropTypes from 'prop-types';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import SwipeableTemporaryDrawer from 'salesComponents/filters/companyListings/sidebarFilters';
import SearchComponentWithQuery from 'src/app/components/common/searchWithQuery';
import { SALES_COMPANIES_REVIEWS } from 'src/app/router/constant/ROUTE';
import { ACL_COMPANIES_CREATE, ACL_COMPANY_REVIEW_VIEW } from 'src/app/router/constant/SALESMODULE';
import { AddIcon, DownloadCloud } from 'src/assets/svg';
import { useApiControllers } from 'src/helper/axios';
import RenderIfHasPermission from 'src/hoc/renderIfHasPermission';
import useDebounceHook from 'src/hooks/useDebounceHook';
import { getIndustryTypes } from 'src/services/company.service';
import { getCompaniesOption } from 'src/services/location.service';
import transformArrayForOptions from 'src/utils/array/transformArrayForOptions';
import { toastSettings } from 'src/utils/constants';
import { companiesPaginationEmptyState } from 'src/utils/constants/emptyStates/companiesPagination';

import CompaniesExportButton from '../../companies/export';
import CreateNewCompanyModal from '../../locations/createNewCompany';
import { useStyles } from './companyListing';

const companyDropdownListingParams = {
  pageNo: 1,
  search: '',
};

export default function Filters({
  query,
  setQuery,
  applyFilters,
  emptyQuery,
  fetchCompanies,
  styledClass,
  showButtons,
}) {
  const { t } = useTranslation();
  const [industryTypes, setIndustryTypes] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [industryTypesLoaded, setIndustryTypesLoaded] = useState(false);
  const [_industryTypesLoading, setIndustryTypesLoading] = useState(true);
  const isMounted = useRef(false);
  const [forceClear, setForceClear] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const classes = useStyles();
  const [openConvert, setOpenConvert] = useState(false);

  const [loadingCompaniesDropDown, setLoadingCompaniesDropDown] = useState(false);

  const previousSearchText = useRef(null);

  const { getNewApiController } = useApiControllers();

  const [_companyDropDownParams, _setCompanyDropDownParams] = useState(
    companyDropdownListingParams,
  );

  const handleOpenConvert = () => setOpenConvert(true);
  const handleCloseConvert = () => setOpenConvert(false);

  const [companiesPagination, setCompaniesPagination] = useState(companiesPaginationEmptyState);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const gotoCompaniesReviews = () => {
    history.push(`${SALES_COMPANIES_REVIEWS}`);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  const fetchIndustryTypes = async () => {
    try {
      const response = await getIndustryTypes();
      if (response?.statusCode === 200) {
        const verticals = response?.data?.industryVerticals;
        setIndustryTypes(
          Object.keys(verticals)
            .map((key) => ({
              label: verticals[key],
              value: key,
            }))
            // Sort the industry verticals based on label to show industries in alphabetic order
            .sort((a, b) => (a.label > b.label ? 1 : b.label > a.label ? -1 : 0)),
        );
      }
      setIndustryTypesLoading(false);
      setIndustryTypesLoaded(true);
    } catch (e) {
      setIndustryTypesLoading(false);
      setIndustryTypesLoaded(false);
    }
  };

  /**
   * Fetch companies listing
   */
  const fetchCompaniesListing = async (refetch = false, search = '') => {
    const apiController = getNewApiController();
    try {
      setLoadingCompaniesDropDown(true);

      let currentPage = companiesPagination?.currentPage;
      if (!search && !previousSearchText.current && !refetch) {
        currentPage = 1;
      }
      if (!refetch && search && !previousSearchText.current) {
        currentPage = 1;
      }
      if (refetch && search && !previousSearchText.current) {
        currentPage = 1;
      }
      if (
        refetch &&
        search &&
        previousSearchText.current &&
        search !== previousSearchText.current
      ) {
        currentPage = 1;
      }
      if (
        !refetch &&
        search &&
        previousSearchText.current &&
        search !== previousSearchText.current
      ) {
        currentPage = 1;
      }
      if (
        refetch &&
        search &&
        previousSearchText.current &&
        search === previousSearchText.current
      ) {
        currentPage = companiesPagination?.currentPage + 1;
      }
      if (previousSearchText.current && !search) {
        currentPage = 1;
      }
      if (!search && !previousSearchText.current && refetch) {
        currentPage = companiesPagination?.currentPage + 1;
      }

      const response = await getCompaniesOption(currentPage, search, {
        signal: apiController.signal,
      });
      if (response.statusCode === 200) {
        if (refetch && response?.data?.companies?.length) {
          setCompanies((prevCompanies) => [
            ...prevCompanies,
            ...transformArrayForOptions(response?.data?.companies || [], 'name', 'id'),
          ]);
        } else {
          setCompanies(transformArrayForOptions(response?.data?.companies || [], 'name', 'id'));
        }
        // setCompanies(response?.data?.companies);
        setCompaniesPagination(response?.pagination);
        previousSearchText.current = search;
      }
      setLoadingCompaniesDropDown(false);
    } catch (error) {
      if (!apiController.signal.aborted) {
        toast.error(error?.message, {
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
      }
    }
  };

  const applyIndustryTypes = useDebounceHook(applyFilters, 300);

  useEffect(() => {
    fetchIndustryTypes();
    fetchCompaniesListing();
  }, []);

  useEffect(() => {
    //skip first render
    if (!isMounted.current || forceClear) {
      setForceClear(false);
      return;
    }
    applyIndustryTypes(query);
  }, [JSON.stringify(query.industryType)]);

  const handleSearchKeyPress = async (event) => {
    setQuery((prevState) => ({ ...prevState, search: event.target.value }));
  };

  const handleMultipleSelectedValues = async (event) => {
    setQuery((prevState) => ({
      ...prevState,
      industryType: event.target.value?.map((value) => value.value),
    }));
  };

  useEffect(() => {
    /**
     * Skip the first render (initial load)
     */
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    applyFilters(query);
  }, [query.search]);

  const handleFetchCompanies = () => {
    fetchCompanies({ page: 1, emptyQuery });
  };
  return (
    <>
      <Stack
        className={classNames(classes.filterWrapper, styledClass)}
        direction="row"
        justifyContent="space-between"
        alignItems="center"
      >
        <Stack
          className={classes.leftItems}
          direction="row"
          justifyContent="start"
          spacing={0}
          alignItems="center"
        >
          <SearchComponentWithQuery
            placeHolder={`${t('sales.companies.searchByCompany')}`}
            onSearch={handleSearchKeyPress}
          />
          <div className={classes.dropdownCommonSection}>
            <CustomDropDown
              name="value"
              label={t('sales.companies.industry')}
              options={industryTypes}
              selectedValues={industryTypes.filter((industryType) =>
                query.industryType.includes(industryType.value),
              )}
              handleChange={handleMultipleSelectedValues}
              multiSelect={true}
              checkmark={true}
              clearAll={true}
              searchable={true}
              withTiles={true}
              searchPlaceholder={t('sales.companies.searchIndustrys')}
            />
          </div>
          <SwipeableTemporaryDrawer
            query={query}
            setQuery={setQuery}
            applyFilters={applyFilters}
            industryTypes={industryTypes}
            emptyQuery={emptyQuery}
            industryTypesLoaded={industryTypesLoaded}
            setForceClear={setForceClear}
            companies={companies}
            companiesPagination={companiesPagination}
            fetchMoreOptions={fetchCompaniesListing}
            loadingCompaniesDropDown={loadingCompaniesDropDown}
          />
        </Stack>
        <Stack
          className={classes.rightItems}
          xs={2}
          direction="row"
          justifyContent="start"
          alignItems="center"
        >
          {showButtons?.review && (
            <RenderIfHasPermission name={ACL_COMPANY_REVIEW_VIEW}>
              <Button onClick={gotoCompaniesReviews} variant="destructive">
                {t('sales.companies.reviewCompanies')}
              </Button>
            </RenderIfHasPermission>
          )}

          {showButtons?.export && (
            <Button
              startIcon={<DownloadCloud />}
              variant="secondaryGrey"
              aria-describedby={id}
              onClick={handleClick}
              disabled
              className={classes.exportBtn}
            >
              {t('commonText.export')}
            </Button>
          )}

          {showButtons?.create && (
            <>
              <RenderIfHasPermission name={ACL_COMPANIES_CREATE}>
                <Button onClick={handleOpenConvert} variant="primary" startIcon={<AddIcon />}>
                  {t('sales.locations.createCompany')}
                </Button>
              </RenderIfHasPermission>
              <Popover
                id={id}
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
              >
                <CompaniesExportButton handleClose={handleClose} />
              </Popover>
            </>
          )}
        </Stack>
      </Stack>
      {openConvert ? (
        <CreateNewCompanyModal
          openHandle={openConvert}
          closeHandle={handleCloseConvert}
          fetchCompanies={handleFetchCompanies}
        />
      ) : null}
    </>
  );
}

Filters.defaultProps = {
  showButtons: {
    review: true,
    export: true,
    create: true,
  },
};

Filters.propTypes = {
  query: PropTypes.object,
  setQuery: PropTypes.func,
  applyFilters: PropTypes.func,
  emptyQuery: PropTypes.object,
  fetchCompanies: PropTypes.func,
  styledClass: PropTypes.string,
  showButtons: PropTypes.object,
};
