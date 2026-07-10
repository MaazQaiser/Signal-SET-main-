import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import PropTypes from 'prop-types';
import * as React from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { ColorCalendar } from 'src/assets/svg';
import { ReactComponent as CallIcon } from 'src/assets/svg/activityCall.svg';
import { ReactComponent as NotesIcon } from 'src/assets/svg/activityNotes.svg';
import { ReactComponent as TodoIcon } from 'src/assets/svg/activityTasks.svg';
import { ReactComponent as FollowIcon } from 'src/assets/svg/folowup.svg';
import { containsHTMLTags, removeHTML } from 'src/helper/utilityFunctions';
import { getDisplayConfiguration } from 'src/redux/store/slices/regionalCountryConfiguration';
import { TRUNCATE_LENGTH } from 'src/utils/constants';
import { formatTimeAndDatefromTimestamp } from 'src/utils/date';
import { truncateString } from 'src/utils/string/truncate';

import LogTasks from '../../companies/activity/logTasks';
import { useStyles } from './activity';

const ICON_BY_TYPE = {
  note: <ColorCalendar />,
  notes: <NotesIcon />,
  task: <TodoIcon />,
  call: <CallIcon />,
  location: <ColorCalendar />,
  followup: <FollowIcon />,
  default: <FollowIcon />,
};

const notifiableTypes = {
  location: 'location',
  task: 'task',
  meeting: 'meeting',
  call: 'call',
  note: 'note',
};

const ActivityContact = ({ activity }) => {
  const classes = useStyles();

  const [expanded, setExpanded] = useState(false);
  const { t } = useTranslation();
  const { dateFormat, timePrecision } = useSelector(getDisplayConfiguration);

  const {
    title,
    createdAt,
    description = null,
    notifiableType,
    snippet = null,
    createdBy,
  } = activity;

  const getTaskStatusLabel = (taskStatus) => {
    if (!taskStatus) return '';
    const statusMap = {
      not_started: t('sales.tasks.toDo'),
      completed: t('sales.tasks.completed'),
    };
    return statusMap[taskStatus] || '';
  };

  const showExpand =
    description?.length > TRUNCATE_LENGTH || notifiableType === notifiableTypes.task;

  const isTask = notifiableType === notifiableTypes.task;

  const handleExpandToggle = () => {
    setExpanded((prev) => !prev);
  };

  const renderSnippetOrDescription = (snippet = null, description = null, expanded = false) => {
    if (!expanded) {
      let plainText;
      if (snippet) {
        plainText = snippet;
      } else {
        plainText = containsHTMLTags(description) ? removeHTML(description) : description;
      }
      const truncated = truncateString(plainText, TRUNCATE_LENGTH);
      return (
        <Typography variant="body2" className={classes.descriptionText}>
          {truncated}
        </Typography>
      );
    }

    return (
      <>
        {containsHTMLTags(description) ? (
          <Typography variant="body2" className={classes.descriptionText}>
            <Box dangerouslySetInnerHTML={{ __html: description }} />
          </Typography>
        ) : (
          <Typography variant="body2" className={classes.descriptionText}>
            {description}
          </Typography>
        )}
      </>
    );
  };

  const renderExpandableContent = () => {
    if (isTask) {
      // For meeting or task, show their respective component when expanded
      if (!expanded) {
        return <>{renderSnippetOrDescription(snippet, description, expanded)}</>;
      }
      return (
        <Box className={classes.expandableSection}>
          {notifiableType === notifiableTypes.task && (
            <LogTasks
              typeLabel={activity?.taskType}
              priorityLabel={activity?.taskPriority}
              dateTimeLabel={activity?.taskDateAndTime}
              description={description}
              statusLabel={getTaskStatusLabel(activity?.taskStatus)}
            />
          )}
        </Box>
      );
    }
    return (
      <Typography variant="body2" className={classes.descriptionText}>
        {renderSnippetOrDescription(snippet, description, expanded)}
      </Typography>
    );
  };

  return (
    <Box className={classes.activityCards}>
      <Box className={classes.activityDetailsWrapper}>
        <Box className={classes.iconBox}>
          {ICON_BY_TYPE[notifiableType] || ICON_BY_TYPE.default}
        </Box>
        <Box className={classes.activityDetails}>
          <Box className={classes.activityDetailsInner}>
            <Typography variant="body2" className={classes.activityStatus}>
              {title} <span className={classes.activityStatusByText}>by {createdBy}</span>
            </Typography>
            <Typography variant="body3" className={classes.notesTime}>
              {formatTimeAndDatefromTimestamp(createdAt, dateFormat, timePrecision)}
            </Typography>
          </Box>

          {/* Description or expandable content */}
          {(snippet || description) && renderExpandableContent()}

          {showExpand && (
            <Box className={classes.expandButtonWrapper}>
              <Typography
                variant="body2"
                className={classes.expandButtonText}
                onClick={handleExpandToggle}
              >
                {expanded ? t('sales.commonText.seeMore') : t('sales.commonText.seeLess')}
              </Typography>
              <ExpandMoreIcon
                className={classes.expandButtonIcon}
                sx={{
                  transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 200ms ease',
                }}
                onClick={handleExpandToggle}
              />
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

ActivityContact.propTypes = {
  activity: PropTypes.object,
  title: PropTypes.string,
  createdAt: PropTypes.instanceOf(Date), // Assuming createdAt is a Date object
  description: PropTypes.string,
  notifiableType: PropTypes.string,
};

export default ActivityContact;
