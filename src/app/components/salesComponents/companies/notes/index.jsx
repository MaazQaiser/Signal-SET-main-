import { Button } from '@mui/material';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { ReactComponent as DeleteIcon } from 'assets/svg/delete-modal.svg';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import SweetAlertModal from 'src/app/components/common/sweetAlertModal';
import { ColorCalendar, Delete, Edit } from 'src/assets/svg';
import RenderIfHasPermission from 'src/hoc/renderIfHasPermission';
import { getDisplayConfiguration } from 'src/redux/store/slices/regionalCountryConfiguration';
import { formatTimeAndDatefromTimestamp } from 'src/utils/date';

import NotesModal from '../../components/notesModal';
import { ButtonText } from '../constant/companies.constant';
import { useStyles } from './notes';

const _Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));

const Notes = ({
  id,
  title,
  description,
  month,
  deleteNote = () => {},
  updateNote,
  createdByName,
  createdAt,
  permissionSet = { noteUpdatePermission: null, noteDeletePermission: null },
}) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const { dateFormat, timePrecision } = useSelector(getDisplayConfiguration);

  const [open, setOpen] = useState(false);
  const [confirmationModal, setConfirmationModal] = useState(false);
  const maxLength = 225;
  const [isExpanded, setIsExpanded] = useState(false);
  const handleChangeCofirmationModal = () => setConfirmationModal(!confirmationModal);
  const handleChange = () => setOpen(!open);
  const onConfirm = () => {
    deleteNote();
    handleChangeCofirmationModal();
  };
  const containsHTMLTags = (text) => {
    if (!text) return '';
    const htmlPattern = /<([A-Z][A-Z0-9]*)\b[^>]*>(.*?)<\/\1>/i;
    return htmlPattern.test(text);
  };
  const cleanString = (inputString) => {
    if (!inputString) return '';
    return inputString.replace(/"/g, '');
  };
  const cleanedDescription = cleanString(description);

  const shouldShowSeeMoreButton =
    containsHTMLTags(description) && cleanedDescription.length > maxLength;

  const truncatedDescription = isExpanded
    ? cleanedDescription
    : `${cleanedDescription.slice(0, maxLength)}`;

  const toggleDescription = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <>
      <Box className={classes.activityCards}>
        <Box className={classes.notesTextCol}>
          <Box className={classes.cals}>
            <ColorCalendar />
          </Box>
          <Box className={classes.notesDetails}>
            <Typography variant="body2" className={classes.descriptionText}>
              {t('sales.companies.note')}: {`${title}`} {t('sales.companies.by')} {createdByName}
            </Typography>
            <Typography variant="body3" className={classes.notesTime}>
              {formatTimeAndDatefromTimestamp(createdAt, dateFormat, timePrecision)}
            </Typography>
            {containsHTMLTags(description) ? (
              <Box>
                <Box dangerouslySetInnerHTML={{ __html: truncatedDescription }} />
                {shouldShowSeeMoreButton && (
                  <span className={classes.seeMore} onClick={toggleDescription}>
                    {isExpanded ? ButtonText.SEE_LESS : ButtonText.SEE_MORE}
                  </span>
                )}
              </Box>
            ) : (
              <Box className={classes.mainMoreBox}>
                {shouldShowSeeMoreButton ? (
                  <Box className={classes.notesTextSize}>
                    <Typography>
                      {isExpanded ? description : description.slice(0, maxLength)}
                      <span className={classes.seeMore} onClick={toggleDescription}>
                        {isExpanded ? ButtonText.SEE_LESS : ButtonText.SEE_MORE}
                      </span>
                    </Typography>
                  </Box>
                ) : (
                  <Typography>{description}</Typography>
                )}
              </Box>
            )}
          </Box>
        </Box>

        <Box className={classes.notesBtns}>
          <RenderIfHasPermission name={permissionSet?.noteUpdatePermission}>
            <Button
              onClick={() => handleChange()}
              aria-label="Edit"
              variant="onlyText"
              className={classes.editBtn}
            >
              <Edit /> {t('links.edit')}
            </Button>
          </RenderIfHasPermission>
          <RenderIfHasPermission name={permissionSet?.noteDeletePermission}>
            <Button
              variant="onlyText"
              aria-label="delete"
              onClick={handleChangeCofirmationModal}
              className={classes.deleteBtn}
            >
              <Delete />
              {t('commonText.delete')}
            </Button>
          </RenderIfHasPermission>
        </Box>
      </Box>
      {open && (
        <NotesModal
          open={open}
          handleClose={handleChange}
          id={id}
          title={title}
          month={month}
          description={description}
          onSaveEdit={updateNote}
          createMode={false}
        />
      )}
      <SweetAlertModal
        type="warning" // 'success', 'error', 'warning', 'info', etc.
        title={t('commonText.modal.notes.deleteNote')}
        text={t('commonText.modal.notes.deleteMessage')}
        cancelButtonText={t('links.cancel')}
        confirmButtonText={t('buttons.deleteNote')}
        show={confirmationModal}
        handleConfirmButton={onConfirm}
        handleCancelButton={handleChangeCofirmationModal}
        icon={<DeleteIcon />}
      />
    </>
  );
};

Notes.propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  title: PropTypes.string,
  description: PropTypes.string,
  month: PropTypes.string,
  deleteNote: PropTypes.func,
  updateNote: PropTypes.func,
  createdByName: PropTypes.string,
  createdAt: PropTypes.instanceOf(Date),
  permissionSet: PropTypes.object,
};

export default Notes;
