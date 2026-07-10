import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { ReactComponent as DetailEmailIcon } from 'assets/svg/DetailEmailIcon.svg';
import { ReactComponent as RedirectIcon } from 'assets/svg/redirect-icon.svg';
import PropTypes from 'prop-types';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import * as routes from 'src/app/router/constant/ROUTE';
import { ACL_CONTACTS_VIEW } from 'src/app/router/constant/SALESMODULE';
import history from 'src/app/router/utils/history';
import RenderIfHasPermission from 'src/hoc/renderIfHasPermission';
import { defaultImage } from 'src/utils/constants';
import { capitalizeFirstLetter } from 'src/utils/string/common';

import { useStyles } from './contactAccordionData';

const BasicStack = ({ id, name, email, jobTitle, phoneNumber, image }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const NA = t('commonText.nA');

  if (!name && !email && (!jobTitle || jobTitle.trim() === '') && !phoneNumber) {
    return <Typography className={classes.noData}>N/A</Typography>;
  }

  const handleRedirect = (path) => {
    history.push(path);
  };

  return (
    <Box className={classes.accordianCards}>
      <Box className={classes.contactContent}>
        <img src={image || defaultImage} className={classes.userImage} />

        <Box className={classes.contactDetailsWrapper}>
          <Typography className={classes.dataColmLabelContact}>
            {capitalizeFirstLetter(name) || `${t('sales.contract.name')}: ${NA}`}
            {jobTitle ? ` • ${jobTitle}` : null}
          </Typography>

          <Link className={classes.dataLink} href={`mailto:${email}`}>
            {email ? (
              <Typography className={classes.emailIcon}>
                {email} <DetailEmailIcon />
              </Typography>
            ) : (
              <Typography>{`${t('sales.contacts.email')}: ${NA}`}</Typography>
            )}
          </Link>
          <Link className={classes.dataLink} href={`tel:${phoneNumber}`}>
            <Typography>{phoneNumber || `${t('sales.contacts.phoneNumber')}: ${NA}`}</Typography>
          </Link>
        </Box>
        <RenderIfHasPermission name={ACL_CONTACTS_VIEW}>
          <RedirectIcon
            className={classes.redirectIcon}
            onClick={() => handleRedirect(routes.SALES_CONTACT_DETAIL_ROUTE.replace(':id', id))}
            style={{ cursor: 'pointer' }}
          />
        </RenderIfHasPermission>
      </Box>
    </Box>
  );
};

BasicStack.propTypes = {
  id: PropTypes.number,
  name: PropTypes.string,
  email: PropTypes.string,
  jobTitle: PropTypes.string,
  phoneNumber: PropTypes.string,
  image: PropTypes.string,
};

export default BasicStack;
