import { Button, Dialog } from '@mui/material';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

export const OfficerConfirmationModal = ({ isOpen, handleReassignOfficer }) => {
  const { t } = useTranslation();

  return (
    <Dialog open={isOpen}>
      <h3>{t('obx.schedules.officers.alreadyAssignedMsg')}</h3>

      <div>
        <Button onClick={() => handleReassignOfficer(true)}>
          {t('obx.schedules.officers.yes')}
        </Button>
        <Button onClick={() => handleReassignOfficer(false)}>
          {t('obx.schedules.officers.no')}
        </Button>
      </div>
    </Dialog>
  );
};

OfficerConfirmationModal.propTypes = {
  isOpen: PropTypes.bool,
  handleReassignOfficer: PropTypes.func,
};
