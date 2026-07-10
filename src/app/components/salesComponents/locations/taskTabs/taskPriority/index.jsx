import { Box } from '@mui/material';
import PropTypes from 'prop-types';
import capitalize from 'src/utils/string/capitalize';

import { useStyles } from './taskPriority.style';

const TaskPriority = ({ priority = '' }) => {
  const classes = useStyles();
  const priorityClass = priority?.toLowerCase();

  return (
    <Box className={classes.priorityWrapper}>
      <Box className={`${classes.priorityDot} ${priorityClass}`} />
      {capitalize(priority)}
    </Box>
  );
};
TaskPriority.propTypes = {
  priority: PropTypes.string.isRequired,
};

export default TaskPriority;
