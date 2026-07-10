import { Avatar, Box, Button, CardMedia, Typography } from '@mui/material';
import { EditTermIcon, MoreVert } from 'assets/svg';
import { ReactComponent as DeleteIcon } from 'assets/svg/delete-modal.svg';
import { ReactComponent as NoRecord } from 'assets/svg/norecord.svg';
import { ReactComponent as VisitorPDFIcon } from 'assets/svg/VisitorPDFIcon.svg';
import { ReactComponent as AddIcon } from 'assets/svg/Whiteplus.svg';
import LoaderComponent from 'commonComponents/loader';
import SweetAlertModal from 'commonComponents/sweetAlertModal';
import ThumbnailSlider from 'commonComponents/thumbnailSlider';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { deleteException, getSitesInstructions } from 'services/sites.services';
import PopoverButton from 'src/app/components/common/popoverButton';
import AddException from 'src/app/obx/pages/sites/detail/components/instructions/addException';
import EditInstructions from 'src/app/obx/pages/sites/detail/components/instructions/editInstructions';
import { isObjectEmpty } from 'src/helper/utilityFunctions';
import { daysOfWeekWithVal, toastSettings } from 'src/utils/constants';
import { toaster } from 'src/utils/toast';

import { useStyles } from './instructionsStyles';

const Instructions = ({ id: siteId }) => {
  const { t } = useTranslation();

  const [instructions, setInstructions] = useState({});
  const [exceptions, setExceptions] = useState([]);
  const [previewFiles, setPreviewFiles] = useState(false);
  const [open, setOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [openAddException, setOpenAddException] = useState(false);
  const [id, setId] = useState(null);
  const [selectedImagesPreview, setSelectedImagesPreview] = useState([]);
  const [instructionType, setInstructionType] = useState('general');

  const classes = useStyles();
  const toggleUpdateInstruction = () => setOpen((a) => !a);
  const toggleAddException = () => setOpenAddException((a) => !a);

  const fetchSitesInstruction = async () => {
    try {
      setLoading(true);
      const response = await getSitesInstructions(siteId, { instructionType });

      if (response?.statusCode === 200) {
        if (!isObjectEmpty(response?.data?.instruction)) {
          setInstructions(response?.data?.instruction);

          const updateExceptionsData = response?.data?.instruction?.exceptions?.map((data) => {
            const convertValuesToLabels = data?.weekDays?.map(
              (a) => daysOfWeekWithVal?.find((b) => a == b?.value)?.label,
            );
            return {
              ...data,
              weekDays: convertValuesToLabels,
            };
          });

          setExceptions(updateExceptionsData);
        }
      }

      setLoading(false);
    } catch (e) {
      setLoading(false);
      setInstructions({});
      setExceptions([]);
    }
  };

  const deleteInstructionException = async () => {
    try {
      setExceptions((a) => {
        return a.filter((b) => b.id != id);
      });

      const response = await deleteException(id);

      if (response?.statusCode === 200) {
        toaster.success({
          text: response?.message,
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
      }
    } catch (e) {
      setLoading(false);
      await fetchSitesInstruction();
    }
  };

  const toggleInstructionsModal = (id) => {
    setId(id);
    toggleUpdateInstruction();
  };

  const toggleExceptionsModal = (id) => {
    setId(id);
    toggleAddException();
  };

  const toggleDeleteModal = (id) => {
    setId(id);
    setShowModal((a) => !a);
  };

  useEffect(() => {
    fetchSitesInstruction();
  }, [siteId, instructionType]);

  const showImagesOfCheckInCheckOut = (files) => {
    return (
      files?.length > 0 &&
      files?.map((file, i) => {
        if (file?.type?.startsWith('video/')) {
          return (
            <CardMedia
              key={i}
              className={classes.profileImageUploaded}
              src={file?.url}
              alt="Images"
              onClick={() => {
                setPreviewFiles(true);
                setSelectedImagesPreview(files);
              }}
              component="video"
              sx={{ width: '100px', objectFit: 'fill', height: '100px', borderRadius: '4px' }}
            />
          );
        }

        if (file?.type?.startsWith('image/')) {
          return (
            <Avatar
              key={i}
              className={classes.profileImageUploaded}
              src={file?.url}
              alt="Images"
              onClick={() => {
                setPreviewFiles(true);
                setSelectedImagesPreview(files);
              }}
            />
          );
        }

        if (file?.type?.startsWith('application/')) {
          return (
            <Box
              onClick={() => {
                window.open(file?.url, '_blank');
              }}
              key={i}
              className={classes.bgColor}
            >
              <VisitorPDFIcon />
            </Box>
          );
        }
      })
    );
  };

  const callBackTransform = (f) => {
    const data = { src: f?.url, type: f?.type };

    if (f?.type?.startsWith('video/')) {
      data.sources = [{ src: f?.url, type: 'video/mp4' }];
      data.type = 'video';
    }

    if (f?.type?.startsWith('image/')) {
      data.type = 'image';
    }

    return data;
  };

  const transformDataForPreview = (files) => {
    const previewFiles = [];
    files?.forEach((file) => {
      if (file?.type?.startsWith('video/') || file?.type?.startsWith('image/')) {
        previewFiles.push({
          ...callBackTransform({
            ...file,
            url: file?.url,
          }),
        });
      }
    });

    return previewFiles;
  };

  const renderSiteInstruction = () => {
    return (
      <Box className={classes.instuctionsBox}>
        <Box className={classes.innerGrid}>
          <Box style={{ flex: '1' }}>
            <Typography variant="h4" className={classes.zoneCustomText}>
              {t('obx.sites.siteInformation.generalInstructions')}
            </Typography>
            <Typography variant="body2" className={classes.zoneDetailInstructionsText}>
              {t('obx.sites.siteInformation.generalInstructionsDescription')}
            </Typography>
          </Box>
          <PopoverButton className={classes.questionBankActions} variant="icon" Icon={MoreVert}>
            <Box className={classes.questionBankActionsMenu}>
              <Box
                className={classes.questionBankActionsRegular}
                onClick={() => {
                  toggleInstructionsModal(instructions?.id);
                }}
              >
                <EditTermIcon className={classes.questionBankActionsIconRegular} />
                <Typography className={classes.questionBankActionsTextRegular} variant="subtitle2">
                  {t('sales.contract.edit')}
                </Typography>
              </Box>
            </Box>
          </PopoverButton>

          {isObjectEmpty(instructions) && (
            <Button
              onClick={() => {
                toggleInstructionsModal(instructions?.id);
              }}
            >
              {t('buttons.createInstruction')}
            </Button>
          )}
        </Box>
        {!isObjectEmpty(instructions) && (
          <>
            <Box className={classes.editor}>
              <Box
                flex={'0.7'}
                dangerouslySetInnerHTML={{
                  __html: instructions?.content,
                }}
              />
            </Box>
            <Box className={classes.attachmentsWrap}>
              {showImagesOfCheckInCheckOut(instructions?.files)}
            </Box>
          </>
        )}
        {exceptions?.map((a) => {
          return (
            <>
              <Box className={`${classes.innerGrid} ${classes.addExceptionDetails}  `}>
                <Box>
                  <Typography variant="h4" className={classes.zoneCustomText}>
                    {t('obx.sites.siteInformation.postOrders')}
                  </Typography>
                  <Typography variant="body2" className={classes.zoneDetailInstructionsText}>
                    {t('obx.sites.siteInformation.addExceptionDetails')}
                  </Typography>
                </Box>
                <Box className={classes.btnWrapper}>
                  <Button
                    onClick={() => {
                      toggleDeleteModal(a?.id);
                    }}
                    variant="destructiveSecondary"
                  >
                    {t('links.delete')}
                  </Button>
                  <Button
                    onClick={() => {
                      toggleExceptionsModal(a?.id);
                    }}
                    variant="secondaryGrey"
                  >
                    {t('links.edit')}
                  </Button>
                </Box>
              </Box>
              <Box>
                <Box display={'flex'} width={'100%'} className={classes.dateFormate}>
                  {a?.weekDays.length > 0 && (
                    <Typography
                      variant="subtitle2"
                      component="span"
                      textTransform="capitalize"
                      className={classes.day}
                    >
                      {a?.weekDays?.join(', ')}
                    </Typography>
                  )}
                  <Box className={classes.dates}>
                    <Typography component="span" className={classes.date} variant="subtitle2">
                      {dayjs.utc(a?.startDate).format('MM/DD/YYYY')}
                    </Typography>
                    -
                    <Typography component="span" className={classes.date} variant="subtitle2">
                      {dayjs.utc(a?.endDate).format('MM/DD/YYYY')}
                    </Typography>
                  </Box>
                </Box>
                <Typography
                  variant="subtitle2"
                  textTransform="capitalize"
                  className={classes.newTitle}
                >
                  {a?.title}
                </Typography>
                <Box className={classes.editor}>
                  <Box
                    flex={'1'}
                    dangerouslySetInnerHTML={{
                      __html: a?.content,
                    }}
                  />
                </Box>
              </Box>
              <Box className={classes.attachmentsWrap}>{showImagesOfCheckInCheckOut(a?.files)}</Box>
            </>
          );
        })}
        {openAddException && (
          <AddException
            open={openAddException}
            handleClose={toggleAddException}
            id={id}
            siteId={siteId}
            instructionsId={instructions?.id}
            refreshData={fetchSitesInstruction}
          />
        )}
        <SweetAlertModal
          type="warning" // 'success', 'error', 'warning', 'info', etc.
          title={t('commonText.modal.deleteException.title')}
          text={t('commonText.modal.areYouSure.descExc')}
          confirmButtonText={t('commonText.modal.deleteException.button')}
          cancelButtonText={t('links.cancel')}
          show={showModal}
          icon={<DeleteIcon />}
          handleConfirmButton={deleteInstructionException}
          handleCancelButton={toggleDeleteModal}
          reverseButtons={true}
        />
      </Box>
    );
  };

  const renderDispatchPostOrder = () => {
    return (
      <Box className={classes.instuctionsBox}>
        <Box className={classes.innerGrid}>
          <Box style={{ flex: '1' }}>
            <Typography variant="h4" className={classes.zoneCustomText}>
              {t('obx.sites.siteInformation.dispatchInstructions')}
            </Typography>
            <Typography variant="body2" className={classes.zoneDetailInstructionsText}>
              {t('obx.sites.siteInformation.dispatchInstructionsDescription')}
            </Typography>
          </Box>
          <PopoverButton className={classes.questionBankActions} variant="icon" Icon={MoreVert}>
            <Box className={classes.questionBankActionsMenu}>
              <Box
                className={classes.questionBankActionsRegular}
                onClick={() => {
                  toggleInstructionsModal(instructions?.id);
                }}
              >
                <EditTermIcon className={classes.questionBankActionsIconRegular} />
                <Typography className={classes.questionBankActionsTextRegular} variant="subtitle2">
                  {t('sales.contract.edit')}
                </Typography>
              </Box>
            </Box>
          </PopoverButton>
        </Box>
        {!isObjectEmpty(instructions) && (
          <>
            <Box className={classes.editor}>
              <Box
                flex={'0.7'}
                dangerouslySetInnerHTML={{
                  __html: instructions?.content,
                }}
              />
            </Box>
          </>
        )}
      </Box>
    );
  };

  return (
    <Box className={classes.instructionsWrapper}>
      {!isObjectEmpty(instructions) && instructions?.files?.length > 0 && (
        <ThumbnailSlider
          files={transformDataForPreview(selectedImagesPreview)}
          usedFrom={'bar'}
          open={previewFiles}
          setOpen={setPreviewFiles}
        />
      )}

      {loading && <LoaderComponent size={50} color={'primary'} label={'Loading'} />}
      <Box>
        <Box className={classes.headerGrid}>
          <Box>
            <Typography variant="h1" className={classes.zoneCustomText}>
              {t('obx.sites.siteInformation.instructions')}
            </Typography>
            <Box className={classes.tabFlex}>
              <Box className={classes.tabInButton}>
                <Button
                  onClick={() => setInstructionType('general')}
                  className={`${classes.defaultButton} ${instructionType === 'general' ? classes.activeButton : ''}`}
                >
                  {t('obx.sites.siteInformation.instructions')}
                </Button>

                <Button
                  onClick={() => setInstructionType('dispatch')}
                  className={`${classes.defaultButton} ${instructionType === 'dispatch' ? classes.activeButton : ''}`}
                >
                  {t('obx.sites.siteInformation.dispatchInstructions')}
                </Button>
              </Box>
              {!isObjectEmpty(instructions) && instructionType === 'general' && (
                <Box>
                  <Button
                    onClick={() => {
                      toggleExceptionsModal(null);
                    }}
                    startIcon={<AddIcon />}
                    variant={'primary'}
                  >
                    {t('buttons.addException')}
                  </Button>
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      </Box>

      {!isObjectEmpty(instructions) &&
        !loading &&
        (instructionType === 'general' ? renderSiteInstruction() : renderDispatchPostOrder())}

      {isObjectEmpty(instructions) && !loading && (
        <Box className={classes.createInstructionWrapper}>
          <NoRecord />
          <Typography variant="h2"> {t('obx.sites.siteInformation.noInstructionAdded')}</Typography>
          <Button
            onClick={() => {
              toggleInstructionsModal(instructions?.id);
            }}
            variant={'primary'}
            startIcon={<AddIcon />}
          >
            {t('buttons.createInstruction')}
          </Button>
          <Typography variant="body2" className={classes.greytextColor}>
            {t('obx.sites.siteInformation.noInstructionDesc')}
          </Typography>
        </Box>
      )}

      {open && (
        <EditInstructions
          open={open}
          handleClose={toggleUpdateInstruction}
          id={id}
          siteId={siteId}
          instructions={instructions}
          instructionType={instructionType}
          refreshData={fetchSitesInstruction}
        />
      )}
    </Box>
  );
};

Instructions.propTypes = {
  id: PropTypes.number,
};
export default Instructions;
