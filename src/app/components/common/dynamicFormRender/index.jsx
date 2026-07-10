import { Box, Typography } from '@mui/material';
import classNames from 'classnames';
import DynamicCustomRadioButtons from 'commonComponents/dynamicFormRender/dynamicCustomRadioButtons';
import DynamicDateOrTimePicker from 'commonComponents/dynamicFormRender/dynamicDateOrTimePicker';
import DynamicDateTimePicker from 'commonComponents/dynamicFormRender/dynamicDateTimePicker';
import DynamicImageUploader from 'commonComponents/dynamicFormRender/dynamicImageUploader';
import DynamicInput from 'commonComponents/dynamicFormRender/dynamicInput';
import DynamicMultiOptionsSelector from 'commonComponents/dynamicFormRender/dynamicMultiOptionsSelector';
import DynamicWebCamImage from 'commonComponents/dynamicFormRender/dynamicWebCamImage';
import PropTypes from 'prop-types';
import React, { useMemo } from 'react';
import RequiredAsterik from 'src/app/components/common/requiredAsterik';
import { enumResponseType, supportedImageFormats, videoFileFormats } from 'src/utils/constants';

import { useStyles } from './dynamicTemplate.style';

const PreviewTemplateSection = ({ title, text, children, required }) => {
  const classes = useStyles();
  return (
    <Box className={classes.previewTemplateQuestion}>
      <Typography variant="h4" className={classes.previewTemplateQuestionTitle}>
        {title}
        {required && <RequiredAsterik />}
      </Typography>
      {text && (
        <Typography variant="subtitle2" className={classes.previewTemplateQuestionText}>
          {text}
        </Typography>
      )}
      {children}
    </Box>
  );
};

PreviewTemplateSection.propTypes = {
  title: PropTypes.string,
  text: PropTypes.string,
  children: PropTypes.node,
  required: PropTypes.bool,
};

const getChildComponet = (
  { responseType, optionsAttributes = [], id, ...props },
  classes,
  handleChange,
  answers,
  errorMessages,
  fieldName,
  removeError,
  setErrorMessages,
) => {
  const nameField = `${fieldName},${id}`;

  switch (responseType) {
    case enumResponseType.text:
      return (
        <DynamicInput
          {...props}
          classes={classes}
          handleChange={handleChange}
          answers={answers}
          type={'text'}
          id={id}
          key={id}
          errorMessage={errorMessages[nameField]}
          removeError={removeError}
          nameField={nameField}
        />
      );
    case enumResponseType.number:
      return (
        <DynamicInput
          {...props}
          classes={classes}
          handleChange={handleChange}
          answers={answers}
          type={'number'}
          id={id}
          key={id}
          errorMessage={errorMessages[nameField]}
          removeError={removeError}
          nameField={nameField}
        />
      );
    case enumResponseType.multiselect:
      return (
        <DynamicMultiOptionsSelector
          options={optionsAttributes}
          classes={classes}
          handleChange={handleChange}
          answers={answers}
          id={id}
          key={id}
          errorMessage={errorMessages[nameField]}
          removeError={removeError}
          nameField={nameField}
        />
      );
    case enumResponseType.datetime:
      return (
        <DynamicDateTimePicker
          {...props}
          classes={classes}
          handleChange={handleChange}
          answers={answers}
          type={'number'}
          id={id}
          key={id}
          errorMessage={errorMessages[nameField]}
          removeError={removeError}
          nameField={nameField}
        />
      );
    case enumResponseType.radio:
      return (
        <Box
          className={classNames(
            classes.previewTemplateOptions,
            props?.fieldDisable && classes.disabledEvent,
          )}
        >
          <DynamicCustomRadioButtons
            {...props}
            classes={classes}
            handleChange={handleChange}
            answers={answers}
            type={'number'}
            id={id}
            key={id}
            options={optionsAttributes}
            errorMessage={errorMessages[nameField]}
            removeError={removeError}
            nameField={nameField}
          />
        </Box>
      );
    case enumResponseType.date:
      return (
        <Box
          className={classNames(
            classes.previewTemplatePicker,
            props?.fieldDisable && classes.disabledEvent,
          )}
        >
          <DynamicDateOrTimePicker
            {...props}
            classes={classes}
            handleChange={handleChange}
            answers={answers}
            type={'date'}
            id={id}
            key={id}
            errorMessage={errorMessages[nameField]}
            removeError={removeError}
            nameField={nameField}
          />
        </Box>
      );
    case enumResponseType.time:
      return (
        <Box
          className={classNames(
            classes.previewTemplatePicker,
            props?.fieldDisable && classes.disabledEvent,
          )}
        >
          <DynamicDateOrTimePicker
            {...props}
            classes={classes}
            handleChange={handleChange}
            answers={answers}
            id={id}
            key={id}
            errorMessage={errorMessages[nameField]}
            removeError={removeError}
            nameField={nameField}
          />
        </Box>
      );

    case enumResponseType.imageVideo:
      return (
        <DynamicImageUploader
          {...props}
          classes={classes}
          handleChange={handleChange}
          answers={answers}
          id={id}
          key={id}
          errorMessages={errorMessages}
          removeError={removeError}
          nameField={nameField}
          setErrorMessages={setErrorMessages}
          supportedTypes={[...supportedImageFormats, ...videoFileFormats]}
          allowedExtensions={['.png', '.jpg', '.jpeg', '.mp4', '.avi', '.mov']}
          supportedTypesText="(max. 15mbs)"
        />
      );

    case enumResponseType.attachments:
      return (
        <DynamicImageUploader
          {...props}
          classes={classes}
          handleChange={handleChange}
          answers={answers}
          id={id}
          key={id}
          errorMessages={errorMessages}
          removeError={removeError}
          nameField={nameField}
          setErrorMessages={setErrorMessages}
          supportedTypes={['application/pdf']}
          allowedExtensions={['.pdf']}
          supportedTypesText="(max. 15mbs)"
        />
      );

    case enumResponseType.webCam:
      return (
        <DynamicWebCamImage
          {...props}
          classes={classes}
          handleChange={handleChange}
          answers={answers}
          id={id}
          key={id}
          errorMessage={errorMessages[nameField]}
          removeError={removeError}
          nameField={nameField}
          multi={false}
        />
      );

    case enumResponseType.phone:
      return (
        <DynamicInput
          {...props}
          classes={classes}
          handleChange={handleChange}
          answers={answers}
          type={'number'}
          id={id}
          key={id}
          errorMessage={errorMessages[nameField]}
          removeError={removeError}
          nameField={nameField}
        />
      );

    case enumResponseType.description:
      return (
        <DynamicInput
          {...props}
          classes={classes}
          handleChange={handleChange}
          answers={answers}
          id={id}
          key={id}
          errorMessage={errorMessages[nameField]}
          removeError={removeError}
          nameField={nameField}
          multiline={true}
          rows={3}
        />
      );

    default:
      return (
        <DynamicInput
          {...props}
          classes={classes}
          handleChange={handleChange}
          answers={answers}
          type={'text'}
          id={id}
          key={id}
          errorMessage={errorMessages[nameField]}
          removeError={removeError}
          nameField={nameField}
        />
      );
  }
};

const RenderFieldAttributes = ({
  fieldsAttribute = {},
  classes,
  handleChange,
  errorMessages,
  fieldName,
  removeError,
  setErrorMessages,
}) => {
  return (
    <PreviewTemplateSection
      title={fieldsAttribute?.questionStatement}
      text={fieldsAttribute?.instruction}
      key={fieldsAttribute?.id}
      required={fieldsAttribute?.required}
    >
      {getChildComponet(
        fieldsAttribute,
        classes,
        handleChange,
        fieldsAttribute?.answers,
        errorMessages,
        fieldName,
        removeError,
        setErrorMessages,
      )}
    </PreviewTemplateSection>
  );
};

RenderFieldAttributes.propTypes = {
  handleChange: PropTypes.func.isRequired,
  fieldsAttribute: PropTypes.object,
  removeError: PropTypes.func,
  errorMessages: PropTypes.object,
  classes: PropTypes.object,
  fieldName: PropTypes.string,
  nameField: PropTypes.string,
  setErrorMessages: PropTypes.func,
};

const RenderSectionPreview = ({
  section = {},
  classes,
  handleChange,
  errorMessages,
  fieldName,
  removeError,
  setErrorMessages,
}) => {
  const { title, description, questionsAttributes = [], id } = section;

  return (
    <React.Fragment key={id}>
      <Box className={classes.previewTemplateSection}>
        <Typography variant="h3" className={classes.previewTemplateSectionTitle}>
          {title}
        </Typography>
        {description && (
          <Typography variant="subtitle2" className={classes.previewTemplateSectionText}>
            {description}
          </Typography>
        )}
      </Box>
      {questionsAttributes.map((fieldsAttribute, i) => (
        <RenderFieldAttributes
          key={i}
          fieldsAttribute={fieldsAttribute}
          classes={classes}
          handleChange={handleChange}
          errorMessages={errorMessages}
          fieldName={fieldName}
          removeError={removeError}
          setErrorMessages={setErrorMessages}
        />
      ))}
    </React.Fragment>
  );
};

const DynamicTemplateRender = ({
  template = {},
  handleChange,
  errorMessages,
  fieldName,
  removeError,
  setErrorMessages,
  styleClass,
}) => {
  const { sectionsAttributes = [] } = template;

  const classes = useStyles();

  const sectionAttributes = useMemo(() => {
    return sectionsAttributes?.map((section, i) => (
      <RenderSectionPreview
        key={i}
        section={section}
        classes={classes}
        handleChange={handleChange}
        errorMessages={errorMessages}
        fieldName={fieldName}
        removeError={removeError}
        setErrorMessages={setErrorMessages}
      />
    ));
  }, [sectionsAttributes, errorMessages]);

  RenderSectionPreview.propTypes = {
    handleChange: PropTypes.func.isRequired,
    removeError: PropTypes.func,
    errorMessage: PropTypes.object,
    classes: PropTypes.object,
    fieldName: PropTypes.string,
    id: PropTypes.number,
    section: PropTypes.object,
    errorMessages: PropTypes.object,
    setErrorMessages: PropTypes.func,
  };

  return (
    <Box className={`${classes.previewTemplate} ${styleClass}`}>
      <Box className={classes.previewTemplateContent}>{sectionAttributes}</Box>
    </Box>
  );
};

DynamicTemplateRender.propTypes = {
  template: PropTypes.object,
  handleChange: PropTypes.func,
  errorMessages: PropTypes.object,
  removeError: PropTypes.func,
  fieldName: PropTypes.string,
  setErrorMessages: PropTypes.func,
  styleClass: PropTypes.string,
};
export default DynamicTemplateRender;
