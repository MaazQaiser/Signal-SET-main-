import { Box, Chip, Typography } from '@mui/material';
import { ReactComponent as CalendarIcon } from 'assets/svg/calendar.svg';
import { ReactComponent as ClockIcon } from 'assets/svg/clock.svg';
import { ReactComponent as EditIcon } from 'assets/svg/edit-icon.svg';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import PopoverButton from 'src/app/components/common/popoverButton';
import { dayjsWithStandardOffset } from 'src/app/obx/pages/schedules/helper';
import { ContractStatusChip } from 'src/app/obx/pages/sites/detail/components/contracts';
import { MoreVert, TrashIcon } from 'src/assets/svg';
import { formatDate, getDaysStringFromNumbers, timeFormat12h } from 'src/helper/utilityFunctions';
import { contractStatusEnum } from 'src/utils/constants';
import { SCHEDULE_DUTIES } from 'src/utils/constants/schedules';

import { sortDays } from '.';
import { useStyles } from './jobs.styles';

const AccordionHeader = ({
  job,
  setConfirmationModal,
  setSelectedJob,
  setShowEditJobTimeModal,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const NA = t('commonText.nA');
  const jobName = {
    [SCHEDULE_DUTIES.DEDICATED]: t('obx.sites.jobs.accordionHeader.name.dedicated'),
    [SCHEDULE_DUTIES.EXTRA]: t('obx.sites.jobs.accordionHeader.name.extra'),
    [SCHEDULE_DUTIES.PATROL]: t('obx.sites.jobs.accordionHeader.name.patrol'),
  };

  return (
    <Box className={classes.accordianWrapper}>
      <Box className={classes.titleWrapper}>
        <Box className={classes.titleWrapperLeft}>
          <Typography className={classes.accordionTitle} variant="subtitle2">
            {jobName[job?.dutyType]}
          </Typography>
          <Box className={classes.accordianTimeDate}>
            <Typography className={classes.accordianBodyText} variant="body3">
              <CalendarIcon />
              {`${formatDate(dayjsWithStandardOffset(job?.startsAt))} - ${formatDate(
                dayjsWithStandardOffset(job?.lastShiftStartTime),
              )}`}
            </Typography>
            {job?.dutyType !== SCHEDULE_DUTIES.PATROL && (
              <>
                {'•'}
                <Typography className={classes.accordianBodyText} variant="body3">
                  <ClockIcon />
                  {`${timeFormat12h(job?.startsAt, true)} - ${timeFormat12h(job?.endsAt, true)}`}
                </Typography>
              </>
            )}
          </Box>
          {job?.dutyType === SCHEDULE_DUTIES.EXTRA && (
            <Chip
              label={t('obx.sites.jobs.accordionHeader.name.extra')}
              size="small"
              color="warning"
            />
          )}
        </Box>
        <Box className={classes.rightArea}>
          {job?.dutyType === SCHEDULE_DUTIES.EXTRA &&
            job?.contractStatus === contractStatusEnum.ACTIVE && (
              <>
                <PopoverButton
                  className={classes.questionBankActions}
                  variant="icon"
                  Icon={MoreVert}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                  }}
                >
                  <Box className={classes.questionBankActionsMenu}>
                    {job?.contractStatus === contractStatusEnum.ACTIVE && (
                      <>
                        <Box
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedJob();
                            setShowEditJobTimeModal(true);
                          }}
                          className={classes.templateActionsRegular}
                        >
                          <EditIcon className={classes.templateActionsIconRegular} />
                          <Typography
                            className={classes.templateActionsTextRegular}
                            variant="subtitle2"
                          >
                            {t('obx.sites.jobs.editJobBtn')}
                          </Typography>
                        </Box>
                      </>
                    )}
                    {job?.contractStatus !== contractStatusEnum.EXPIRED && (
                      <>
                        <Box
                          onClick={() => {
                            setConfirmationModal(job?.id);
                          }}
                          className={classes.questionBankActionsDelete}
                        >
                          <TrashIcon className={classes.questionBankActionsIconDelete} />
                          <Typography
                            className={classes.questionBankActionsTextDelete}
                            variant="subtitle2"
                          >
                            {t('commonText.delete')}
                          </Typography>
                        </Box>
                      </>
                    )}
                  </Box>
                </PopoverButton>
              </>
            )}
          {job?.dutyType === SCHEDULE_DUTIES.DEDICATED &&
            job?.contractStatus !== contractStatusEnum.EXPIRED && (
              <>
                <PopoverButton
                  className={classes.questionBankActions}
                  variant="icon"
                  Icon={MoreVert}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                  }}
                >
                  <Box className={classes.questionBankActionsMenu}>
                    <Box
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedJob();
                        setShowEditJobTimeModal(true);
                      }}
                      className={classes.templateActionsRegular}
                    >
                      <EditIcon className={classes.templateActionsIconRegular} />
                      <Typography
                        className={classes.templateActionsTextRegular}
                        variant="subtitle2"
                      >
                        {t('obx.sites.jobs.editJobBtn')}
                      </Typography>
                    </Box>
                  </Box>
                </PopoverButton>
              </>
            )}
        </Box>
      </Box>

      {/* add bbtn */}
      <Box className={classes.accordianBody}>
        <Box className={classes.accordianBodyWrapper}>
          <Box className={classes.accordianBodyContent}>
            <Typography className={classes.accordianBodyTitle} variant="subtitle2">
              {t('obx.sites.jobs.accordionHeader.serviceName')}:
            </Typography>
            <Typography className={classes.accordianBodyText} variant="body2">
              {job?.dutyType === 'extra'
                ? jobName[job?.dutyType]
                : job?.serviceName
                  ? job?.serviceName
                  : NA}
            </Typography>
          </Box>
          <Box className={classes.accordianBodyContent}>
            <Typography className={classes.accordianBodyTitle} variant="subtitle2">
              {t('obx.sites.jobs.accordionHeader.shiftDays')}:
            </Typography>
            <Typography className={classes.accordianBodyText} variant="body2">
              {getDaysStringFromNumbers(sortDays(job?.standardJobDays))}
            </Typography>
          </Box>
          {(job?.visitManagement || job?.loadManagement) && (
            <Box className={classes.accordianBodyContent}>
              <Typography className={classes.accordianBodyTitle} variant="subtitle2">
                {t('obx.sites.jobs.accordionHeader.additionalServices')}:
              </Typography>
              <Box className={classes.chipWrapper}>
                {job?.visitManagement && (
                  <Chip
                    label={t('obx.sites.jobs.accordionHeader.visitor')}
                    size="small"
                    color="primary"
                  />
                )}
                {job?.loadManagement && (
                  <Chip
                    label={t('obx.sites.jobs.accordionHeader.load')}
                    size="small"
                    color="primary"
                  />
                )}
              </Box>
            </Box>
          )}
        </Box>
        <Box className={classes.accordianBodyBottom}>
          <Typography className={classes.accordianBodyTitle} variant="subtitle2">
            {t('obx.sites.jobs.accordionHeader.contract')}:
          </Typography>
          <Typography className={classes.accordianBodyText} variant="body2">
            {job?.contractName}
          </Typography>
          <ContractStatusChip contractStatus={job?.contractStatus} />
        </Box>
      </Box>
    </Box>
  );
};

export default AccordionHeader;

AccordionHeader.propTypes = {
  job: PropTypes.object,
  index: PropTypes.number,
  setConfirmationModal: PropTypes.func,
  setSelectedJob: PropTypes.func,
  setShowEditJobTimeModal: PropTypes.func,
};

// const ContractStatusChip = ({ contractStatus }) => {
//   const classes = useStyles();
//
//   return (
//     <>
//       {contractStatus === contractStatusEnum.ACTIVE && (
//         <Chip color="success" label="Active" icon={<ActiveIcon />} />
//       )}
//       {contractStatus === contractStatusEnum.TERMINATED && (
//         <Chip
//           color="error"
//           label="Terminated"
//           icon={<BanIcon />}
//           className={classes.terminatedChip}
//         />
//       )}
//       {contractStatus === contractStatusEnum.EXPIRED && (
//         <Chip color="error" label="Expired" icon={<DangerIcon />} />
//       )}
//     </>
//   );
// };
//
// ContractStatusChip.propTypes = {
//   contractStatus: PropTypes.object,
// };
