import { Typography } from '@mui/material';
import Stack from '@mui/material/Stack';
import Box from '@mui/system/Box';
import styled from '@mui/system/styled';
import classNames from 'classnames';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getSalesUserDetail, getUsersById } from 'services/user.services';
// import ActivityBarSkeleton from 'src/app/components/common/skeletonLoader/activityBarSkeleton.jsx';
import UserInfo from 'src/app/components/salesComponents/users/companyUserInfo/index.jsx';
// import BasicAccordion from 'src/app/components/salesComponents/users/userAccordians/index.jsx';
import UserTabs from 'src/app/components/salesComponents/users/userTabs';
import { toastSettings } from 'src/utils/constants';

import { useStyles } from './userDetail.js';

const Item = styled('div')(({ _theme }) => ({}));

const UserDetails = () => {
  const [loading, setLoading] = useState(true);
  const classes = useStyles();
  const { id: userId } = useParams();
  const [data, setData] = useState({});
  const [userDetail, setUserDetail] = useState({});
  const [open, setOpen] = useState(false);
  const _handleChange = () => setOpen(!open);
  const { id } = useParams();
  const { t } = useTranslation();

  const fetchUserDetails = async (id) => {
    try {
      const response = await getSalesUserDetail(id);
      if (response.statusCode === 200) {
        setData(response?.data);
      }
    } catch (e) {
      // show toast if needed
    }
  };

  const fetchUser = async (id) => {
    try {
      // setLoading(true);
      const response = await getUsersById(id);
      if (response?.statusCode === 200) {
        const _accessControlList = {
          dashboard: { view: true },
          companies: {
            create: true,
            view: true,
            update: true,
            reviews: { view: true },
            activities: { view: true },
            notes: { create: true, view: true, update: true, delete: true },
            tasks: { create: true, view: true, update: true, delete: true },
          },
          properties: {
            create: true,
            view: true,
            update: true,
            reviews: { view: true },
            activities: { view: true },
            notes: { create: true, view: true, update: true, delete: true },
            tasks: { create: true, view: true, update: true, delete: true },
            classificationQuestions: { view: true, update: true },
            emails: { create: true, view: true, update: true, delete: true },
            meetings: { create: true, view: true, update: true, delete: true },
          },
          deals: {
            create: true,
            view: true,
            update: true,
            contracts: { create: true, view: true, update: true, delete: true },
            activities: { view: true },
            notes: { create: true, view: true, update: true, delete: true },
            tasks: { create: true, view: true, update: true, delete: true },
          },
          contacts: {
            create: true,
            view: true,
            update: true,
            delete: true,
            activities: { view: true },
            notes: { create: true, view: true, update: true, delete: true },
            tasks: { create: true, view: true, update: true, delete: true },
            reviews: { view: true },
          },
          signalMap: { view: true },
          users: {
            view: true,
            properties: { view: true },
            deals: { view: true },
            history: { view: true },
            rolesAndPermissions: {
              create: true,
              view: true,
              update: true,
              delete: true,
            },
          },
          marketVerticals: {
            create: true,
            view: true,
            update: true,
            delete: true,
          },
          routes: { view: true },
          settings: {
            create: true,
            view: true,
            update: true,
            delete: true,
            preferences: {
              create: true,
              view: true,
              update: true,
              delete: true,
              systemDefault: {
                create: true,
                view: true,
                update: true,
                delete: true,
              },
              holidayGroups: {
                create: true,
                view: true,
                update: true,
                delete: true,
              },
            },
            emailConfigurations: {
              create: true,
              view: true,
              update: true,
              delete: true,
            },
            rolesAndPermissions: {
              create: true,
              view: true,
              update: true,
              delete: true,
            },
          },
        };
        setUserDetail(response?.data?.user);
      }
      // setLoading(false);
    } catch (error) {
      // setLoading(false);

      toast.error(error?.message, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  useEffect(() => {
    if (id) {
      Promise.all([fetchUserDetails(id), fetchUser(id)])
        .then(() => {
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    }
  }, [id]);

  return (
    <>
      {/* {loading && <LoaderComponent size={50} color={'primary'} label={'Loading'} />} */}
      <Box className={classes.companiesArea}>
        {/* {loading && <LoaderComponent size={50} color={'primary'} label={'Loading'} />} */}
        <Box className={classes.companiesGrid}>
          <Box className={classNames(classes.leftSideBar, 'innerScrollBar')}>
            <UserInfo info={{ ...data, userInfo: userDetail }} loading={loading} />
            {/* {loading ? (
              <ActivityBarSkeleton onlyBar={true} noOfRows={3} />
            ) : (
              <BasicAccordion deals={data?.deals} data={data} />
            )} */}
          </Box>
          <Box className={classes.rightArea}>
            <Stack className={classes.overHeadr}>
              <Item className={classes.overViewHeading}>
                <Typography variant="h1">{t('sales.companies.overview')}</Typography>
              </Item>
            </Stack>
            <UserTabs
              id={userId}
              userDetail={userDetail}
              setUserDetail={setUserDetail}
              refetch={fetchUser}
            />
          </Box>
        </Box>
      </Box>
    </>
  );
};
export default UserDetails;
