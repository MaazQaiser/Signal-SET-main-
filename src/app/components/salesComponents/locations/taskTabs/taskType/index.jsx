import { Chip } from '@mui/material';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { ReactComponent as CallIcon } from 'src/assets/svg/call.svg';
import { ReactComponent as EmailIcon } from 'src/assets/svg/emailType.svg';
import { ReactComponent as LinkedInIcon } from 'src/assets/svg/linkedin.svg';
import { ReactComponent as TodoIcon } from 'src/assets/svg/todo.svg';

import { useStyles } from './task.style';

const TaskType = ({ type = '' }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const typeClass = type?.toLowerCase();

  const getIcon = () => {
    switch (typeClass) {
      case 'todo':
        return <TodoIcon className={classes.typeIcon} />;
      case 'email':
        return <EmailIcon className={classes.typeIcon} />;
      case 'call':
        return <CallIcon className={classes.typeIcon} />;
      case 'linked_in':
        return <LinkedInIcon className={classes.typeIcon} />;
      default:
        return null;
    }
  };

  return (
    <Chip
      icon={getIcon()}
      label={
        type === 'linked_in'
          ? t('sales.tasks.linkedIn')
          : type === 'todo'
            ? t('sales.tasks.todo')
            : type
      }
      className={`${classes.typeChip} ${typeClass}`}
      size="small"
    />
  );
};

TaskType.propTypes = {
  type: PropTypes.string.isRequired,
};

export default TaskType;
