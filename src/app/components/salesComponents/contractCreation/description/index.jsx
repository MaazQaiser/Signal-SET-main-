import { Box, Paper, Tooltip, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import Upload from 'assets/images/upload-icon.svg';
import { ReactComponent as DeleteSweetAlertIcon } from 'assets/svg/delete-modal.svg';
import { ReactComponent as ExpendIcon } from 'assets/svg/expand.svg';
import { ReactComponent as TrashIcon } from 'assets/svg/trash.svg';
import LoaderComponent from 'commonComponents/loader';
import { EditorState } from 'draft-js';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { deleteDealBannerAttachment, uploadDealBannerAttachment } from 'services/deal.service';
import RichTextEditor, { convertToDraft } from 'src/app/components/common/richText';
import SweetAlertModal from 'src/app/components/common/sweetAlertModal';
import { isObjectEmpty } from 'src/helper/utilityFunctions';
import { allowedImageExtensions, toastSettings } from 'src/utils/constants';
import { openFile } from 'src/utils/files';

import DescriptionModal from './descriptionModal';
const useStyles = makeStyles((theme) => ({
  stepperHeadding: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
    '& span': {
      lineHeight: '1',
    },
  },
  descriptionTextArea: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1',
    overflow: 'auto',
  },
  singleDescription: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1',
    overflow: 'hidden',
    marginBottom: '24px',
    position: 'relative',
  },

  descriptionText: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1',
    overflow: 'auto',
  },

  descriptionDropdown: {
    maxWidth: '370px',
    marginBottom: '16px',
  },
  descriptionWrapper: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1',
    overflow: 'auto',
    gap: '16px',
    paddingTop: '24px',
  },
  editorCustomHeight: {
    maxHeight: '400px',
    overflow: 'hidden',
    transition: 'overflow 0.3s ease',
    '&:hover': {
      overflow: 'auto',
    },
    '&::-webkit-scrollbar': {
      width: '0px',
    },
  },
  bannerImageDetailTitle: {
    color: `${theme.palette.textPrimary} `,
  },
  dragText: {
    '&.MuiTypography-root': {
      color: `${theme.palette.textPlaceholder} `,
    },
  },
  dragTextBelow: {
    '&.MuiTypography-body3': {
      display: 'block',
      color: `${theme.palette.textPlaceholder} `,
      marginTop: '4px',
      fontSize: '12px ',
    },
  },
  boldText: {
    '&.MuiTypography-subtitle2': {
      color: `${theme.palette.textPrimary} `,
      fontWeight: '500 ',
    },
  },
  formBoxImage: {
    display: 'flex',
    flexDirection: 'row',
    gap: '20px',
  },
  paperWrapper: {
    flex: '1',
    width: '100%',
    padding: '16px 24px',
    textAlign: 'center',
    cursor: 'pointer',
    border: `1px solid ${theme.palette.borderSubtle1} `,
    boxShadow: 'none !important',
    borderRadius: '8px ',
  },
  inputFileWrapper: {
    position: 'relative',
    padding: '0 ',
    height: 'unset ',
  },
  uploadBtn: {
    display: 'flex',
    gap: '6px',
    justifyContent: 'center',
    marginTop: '12px',
  },
  customFileInput: {
    position: 'absolute',
    top: '0',
    left: '0',
    height: '100%',
    width: '100%',
    opacity: '0',
    padding: '0 !important',
    cursor: 'pointer',
  },
  trashIconBox: {
    cursor: 'pointer',
    lineHeight: 1,
  },
  bannerImageDetail: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  toolTipBox: {
    cursor: 'pointer',
    width: 'fit-content',
  },
  stepperHeaddingWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    marginBottom: '12px',
    '& span': {
      lineHeight: '1',
      cursor: 'pointer',
      position: 'absolute',
      right: '10px',
      top: ' 53px',
    },
  },
}));

const maxAttachmentSize = 10;

export const FormKeys = {
  SERVICES: 'services',
};
const emptyState = {
  [FormKeys.SERVICES]: EditorState.createEmpty(),
};
const DescriptionTab = ({ formData, setFormData, editData, isPublished, enableOccurences }) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const { id: dealId } = useParams();
  const [loading, setLoading] = useState(false);
  const [fileInfo, setFileInfo] = useState({});
  const [showDeleteModal, setShowDeleteModal] = useState({
    active: false,
  });
  const [openModal, setOpenModal] = useState(false);
  const handleOpenModal = () => {
    setOpenModal(true);
  };
  const handleCloseModal = () => {
    setOpenModal(false);
  };
  const handleFileUpload = async (event) => {
    if (!event?.target?.files?.length) return;
    const selectedFile = event.target.files[0];
    const { size } = selectedFile;
    const sizeInMB = (size / (1024 * 1024)).toFixed(2);
    /**
     * show error if file size exce
     */
    if (sizeInMB > maxAttachmentSize) {
      toast.error(t('sales.commonText.fileSizeLimit10'), {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
      event.target.value = '';
      return;
    }
    if (selectedFile) {
      // setFileInfo({ name, type, size: sizeInMB });
      setLoading(true);
      // setIsError(false);
      const imageFormData = new FormData();
      imageFormData.append('file', selectedFile);
      try {
        const upload = await uploadDealBannerAttachment(dealId, imageFormData);
        if (upload?.statusCode === 200) {
          setFileInfo(upload?.data?.contract?.descriptions?.attachment);
          setFormData((prevState) => ({
            ...prevState,
            attachment: upload?.data?.contract?.descriptions?.attachment,
          }));
          setLoading(false);
          toast.success(upload.message, {
            position: 'top-right',
            autoClose: toastSettings.AUTO_CLOSE,
          });
        }
      } catch (error) {
        setLoading(false);
        setFileInfo({});
        toast.error(error?.message, {
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
      }
    } else {
      setFileInfo({});
      setLoading(false);
      // setIsError(true);
    }
    setShowDeleteModal({ active: false });
    event.target.value = '';
  };
  const deleteBannerImage = async () => {
    setLoading(true);
    try {
      const response = await deleteDealBannerAttachment(dealId);
      if (response?.statusCode === 200) {
        setFormData((prevState) => ({
          ...prevState,
          attachment: {},
        }));
        setLoading(false);
        setFileInfo({});
        toast.success(upload.message, {
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
    }
    setShowDeleteModal({ active: false });
  };
  useEffect(() => {
    setFormData(
      editData
        ? { ...editData, [FormKeys.SERVICES]: convertToDraft(editData?.[FormKeys.SERVICES]) }
        : emptyState,
    );
  }, [editData]);
  /**
   * common function to update data to formDat object
   */
  const updateFormHandler = useCallback(
    (name, value) => {
      setFormData((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    },
    [setFormData],
  );
  const handleChangeEditor = (event) => {
    const {
      target: { value, name },
    } = event;
    updateFormHandler(name, value);
  };
  useEffect(() => {
    if (formData) setFileInfo(formData?.attachment);
  }, [formData?.attachment]);

  return (
    <>
      <Box className={classes.descriptionWrapper}>
        {loading && <LoaderComponent size={50} color={'primary'} label={'Loading'} />}
        {!enableOccurences && (
          <Box className={classes.descriptionContractsBanner}>
            <Typography variant="h3" className={classes.stepperHeadding}>
              {t('sales.contract.uploadBannerImage')}{' '}
              <Typography variant="body2">
                {t('sales.contract.uploadBannerImageOptional')}
              </Typography>
            </Typography>
            <Box className={classes.formBoxImage}>
              <Paper className={classes.paperWrapper}>
                <Box className={classes.inputFileWrapper}>
                  <img src={Upload} />
                  <Box className={classes.uploadBtn}>
                    <Typography variant="subtitle2" className={classes.boldText}>
                      {t('sales.companies.attachmentClickToUpload')}
                    </Typography>
                    <Typography variant="body2" className={classes.dragText}>
                      <input
                        type="file"
                        accept={allowedImageExtensions.join(', ')}
                        onChange={handleFileUpload}
                        id="file-input"
                        className={classes.customFileInput}
                      />
                      {t('sales.companies.attachmentDND')}
                    </Typography>
                  </Box>
                  <Typography variant="body3" className={classes.dragTextBelow}>
                    {t('sales.contract.uploadedImageSizeDesc')}
                  </Typography>
                </Box>
              </Paper>
            </Box>
          </Box>
        )}
        {!isObjectEmpty(fileInfo) && (
          <Tooltip
            className={classes.toolTipBox}
            title={`Preview ${fileInfo?.fileName}`}
            key={fileInfo?.id}
            placement="bottom"
            arrow
          >
            <Box className={classes.bannerImageDetail}>
              <Box
                onClick={() => openFile(fileInfo?.fileName, fileInfo?.fileUrl)}
                className={classes.attachSuccessFile}
              >
                <Typography variant="subtitle1" className={classes.bannerImageDetailTitle}>
                  {fileInfo?.fileName} ({fileInfo?.fileSize})
                </Typography>
              </Box>
              <Box
                className={classes.trashIconBox}
                onClick={() => setShowDeleteModal({ active: true })}
              >
                <TrashIcon />
              </Box>
            </Box>
          </Tooltip>
        )}
        <Box className={classes.singleDescription}>
          <Box className={classes.stepperHeaddingWrapper}>
            <Typography variant="h3" className={classes.stepperHeadding}>
              {t('sales.contract.descriptionHeading')}
            </Typography>
            <Box component="span" onClick={handleOpenModal}>
              <ExpendIcon />
            </Box>
          </Box>
          {/* //desc modal? */}
          {openModal && (
            <DescriptionModal
              open={openModal}
              handleClose={handleCloseModal}
              // handleChange={handleChangeEditor}
              formData={formData}
              isPublished={isPublished}
              updateFormHandler={updateFormHandler}
            />
          )}
          <Box clasName={classes.descriptionText}>
            <RichTextEditor
              handleChange={handleChangeEditor}
              name={FormKeys.SERVICES}
              placeholder={t('sales.contract.typeHere')}
              value={formData?.[FormKeys.SERVICES] || EditorState.createEmpty()}
              className={classes.descriptionTextArea}
              readOnly={isPublished}
              textLimit={5000}
              customClassEditor={classes.editorCustomHeight}
            />
          </Box>
        </Box>
      </Box>
      {showDeleteModal?.active && (
        <SweetAlertModal
          type="warning"
          title={t('sales.companies.areYouSureToDelete')}
          text={t('sales.companies.areYouSureToDeleteDesc')}
          cancelButtonText={t('sales.companies.cancelBtn')}
          confirmButtonText={t('sales.companies.deleteBtn')}
          show={showDeleteModal?.active}
          handleConfirmButton={deleteBannerImage}
          handleCancelButton={() => setShowDeleteModal({ active: false })}
          icon={<DeleteSweetAlertIcon />}
        />
      )}
    </>
  );
};
DescriptionTab.propTypes = {
  formData: PropTypes.object, // Adjust the type accordingly based on the expected data structure
  setFormData: PropTypes.func,
  editData: PropTypes.any, // Adjust the type accordingly based on the expected data structure
  isPublished: PropTypes.bool,
  enableOccurences: PropTypes.bool,
};
export default DescriptionTab;
