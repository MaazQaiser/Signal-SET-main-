import './siteDetail.js';

import AddIcon from '@mui/icons-material/Add';
import { Button } from '@mui/material';
import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import SearchComponentWithQuery from 'src/app/components/common/searchWithQuery';
import { SALES_QUESTION_BANK_CREATE } from 'src/app/router/constant/ROUTE.jsx';
import { ACL_MARKET_VERTICALS_QUESTIONS_CREATE } from 'src/app/router/constant/SALESMODULE.jsx';
import history from 'src/app/router/utils/history.jsx';
import RenderIfHasPermission from 'src/hoc/renderIfHasPermission.jsx';
import { getIndustryTypes } from 'src/services/company.service.js';
import { paginationOptions, toastSettings } from 'src/utils/constants';

import IndustryVerticalsSidebarListings from './components/industryVerticalsSideBarListing/index.jsx';
import QuestionsListing from './components/questionsListing/index';
import TopDetail from './components/topDetail/topDetail.jsx';
import { useStyles } from './siteDetail.js';

const CustomTabPanel = (props) => {
  const { children, value, index, ...other } = props;
  return (
    <Box
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box className="tabPanelContent">{children}</Box>}
    </Box>
  );
};

CustomTabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

const params = {
  page: 1,
  perPage: paginationOptions.perPageRows,
  questionStatement: '',
  sortBy: '',
  orderBy: '',
};

export default function SiteDetails() {
  const { t } = useTranslation();
  const classes = useStyles();
  const { id } = useParams();

  const [currentId, setCurrentId] = useState('');
  const [loading, setLoading] = useState(true);
  const [queryParams, setQueryParams] = useState(params);
  const [verticalTypes, setVerticalTypes] = useState({});
  const [totalQuestion, setTotalQuestion] = useState(0);

  const fetchIndustryVerticalOptions = async () => {
    try {
      setLoading(true);
      const response = await getIndustryTypes();
      setVerticalTypes(response?.data?.industryVerticals);
    } catch (error) {
      //error handelr
      toast.error(error?.message, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    setCurrentId(id);
  }, [id]);
  useEffect(() => {
    fetchIndustryVerticalOptions();
  }, []);

  const updateFormHandler = (name, value) => {
    setQueryParams((prevState) => {
      return {
        ...prevState,
        page: paginationOptions.defaultPerPage,
        [name]: value,
      };
    });
  };

  const inputChangedHandler = (event) => {
    // Get name of changed input, and its corresponding value
    const { name, value } = event.target;
    // Update form state against the target input field
    updateFormHandler(name, value);
  };

  const handleCreate = () => {
    history.push(SALES_QUESTION_BANK_CREATE.replace(':industryVerticalId', id));
  };
  return (
    <Box className={classes.siteDetail}>
      <Box className={classes.siteDetaiLeftSide}>
        <IndustryVerticalsSidebarListings />
      </Box>
      <Box className={classes.siteDetailListing}>
        <TopDetail
          industryName={verticalTypes[currentId]}
          loading={loading}
          noOfQuestions={totalQuestion}
        />
        <Box className={classes.siteDetailListings}>
          <Box className={classes.siteDetailListingHeader}>
            <SearchComponentWithQuery
              name="questionStatement"
              value={queryParams?.questionStatement}
              onSearch={inputChangedHandler}
              className={classes.siteDetailSearch}
              placeHolder={t('sales.industryVerticals.searchByQuestion')}
            />
            <Box className={classes.siteDetailGroupBtn}>
              {/* <Button
                variant="secondaryGrey"
                startIcon={<DownloadCloud />}
                className={classes.siteDetailExportBtn}
              >
                Export
              </Button> */}
              <RenderIfHasPermission name={ACL_MARKET_VERTICALS_QUESTIONS_CREATE}>
                <Button
                  variant="primary"
                  className={classes.siteDetailAddBtn}
                  onClick={handleCreate}
                  startIcon={<AddIcon />}
                >
                  {t('sales.industryVerticals.addQuestion')}
                </Button>
              </RenderIfHasPermission>
            </Box>
          </Box>

          <QuestionsListing
            queryParams={queryParams}
            setQueryParams={setQueryParams}
            currentId={currentId}
            setTotalQuestion={setTotalQuestion}
          />
        </Box>
      </Box>
    </Box>
  );
}
