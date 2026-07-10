import { Box, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import CustomDropDown from 'src/app/components/common/customDropDown';

const useStyles = makeStyles((theme) => ({
  mainBoxSideDrawerWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  dropHigh: {
    height: '44px !important',
  },
  salesText: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary2,
    },
  },
}));

const AssigneeComponent = ({ formData, assignees, inputChangedHandler }) => {
  const { t } = useTranslation();
  const classes = useStyles();

  return (
    <Box className={classes.mainBoxSideDrawerWrapper}>
      <Typography variant="subtitle2" className={classes.salesText}>
        {t('sales.locations.assignTo')}
      </Typography>
      <CustomDropDown
        name="assignee"
        id="assignee"
        label={t('sales.locations.selectAssignTo')}
        options={assignees || []}
        selectedValues={formData?.assignee || {}}
        handleChange={inputChangedHandler}
        placeHolder={t('sales.locations.selectAssignTo')}
        searchable
        bordered
        className={classes.dropHigh}
        // showEmailInLine={true}
      />
    </Box>
  );
};

AssigneeComponent.propTypes = {
  formData: PropTypes.object, // Adjust the type accordingly based on the expected data structure
  assignees: PropTypes.array, // Adjust the type accordingly based on the expected data structure
  inputChangedHandler: PropTypes.func,
};

export default React.memo(AssigneeComponent);
