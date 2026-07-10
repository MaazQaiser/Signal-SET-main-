import { Box, Button } from '@mui/material';
import { InputLabel } from '@mui/material';
import { PlusIcon } from 'assets/svg';
// import classNames from 'classnames';
import CustomDropDown from 'commonComponents/customDropDown';
import CheckBoxLabel from 'commonComponents/templates/checkBoxLabel';
import CustomInput from 'commonComponents/templates/customInput';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom/cjs/react-router-dom.min';
import { toast } from 'react-toastify';
import LoaderComponent from 'src/app/components/common/loader';
import CustomInputIconDropDown from 'src/app/components/common/templates/customInputIconDropdown';
import ButtonGroup from 'src/app/homeOffice/pages/settings/templates/components/buttonGroup';
import history from 'src/app/router/utils/history';
import { getIndustryTypes } from 'src/services/company.service';
import { createQuestion, getQuestion, updateQuestion } from 'src/services/question.services';
import { MAX_3_DIGIT_VALUE, toastSettings } from 'src/utils/constants';
import joiTemplateValidate from 'src/utils/formValidator/formValidator.requiredCheck';

import RequiredAsterik from '../../../../components/common/requiredAsterik';
import { useStyles } from './createQuestionBank';

const initalQuestionObject = {
  questionStatement: '',
  instruction: '',
  optionsAttributes: [],
  responseType: 2,
  isMendatory: false,
  questionsIndustryVerticalAttributes: [],
};
const initalQuestionOptionObject = {
  optionText: '',
  points: 0,
};

// const industryVerticals = {
//   1: 'Industry 1',
//   101: 'Industry 2',
//   102: 'Industry 3',
//   103: 'Industry 4',
//   104: 'Industry 5',
//   105: 'Industry 6',
// };

/**
 * CreateQuestionBank is a reusable React component for displaying button bars.
 *
 */

const enumResponseType = {
  multiselect: 2,
  radio: 4,
  dropdown: 8,
};

const CreateQuestionBank = () => {
  const { t } = useTranslation();
  const classes = useStyles();
  const [question, setQuestion] = useState(initalQuestionObject);
  const [disabled, setDisabled] = useState(false);
  const [errorMessages, setErrorMessages] = useState({});
  const [industryVerticalsDropdown, setIndustryVerticalsDropDown] = useState([]);
  const [existingIndustryVeritcals, setExistingIndustryVeritcals] = useState([]);
  const { id, industryVerticalId } = useParams();
  const isEdit = !!id;
  const required = true;
  const dropDownOptions = [
    {
      value: 2,
      label: t('ho.templates.create.section.field.responseType.multiselect'),
    },
    {
      value: 4,
      label: t('ho.templates.create.section.field.responseType.radio'),
    },
    {
      value: 8,
      label: t('ho.templates.create.section.field.responseType.dropdown'),
    },
  ];

  const dropDownScores = [
    { label: '0', value: '0' },
    { label: '5', value: 5 },
    { label: '10', value: 10 },
    { label: '15', value: 15 },
    { label: '20', value: 20 },
    { label: '25', value: 25 },
    { label: '30', value: 30 },
  ];

  const testEnum = {
    0: t('ho.templates.create.section.field.responseType.text'),
    1: t('ho.templates.create.section.field.responseType.number'),
    2: t('ho.templates.create.section.field.responseType.multiselect'),
    3: t('ho.templates.create.section.field.responseType.dateTime'),
    4: t('ho.templates.create.section.field.responseType.radio'),
    5: t('ho.templates.create.section.field.responseType.date'),
    6: t('ho.templates.create.section.field.responseType.imageVideo'),
    7: t('ho.templates.create.section.field.responseType.time'),
    8: t('ho.templates.create.section.field.responseType.dropdown'),
  };

  const POINT = 'points';

  const addOptionInQuestion = () => {
    setQuestion((prevState) => ({
      ...prevState,
      optionsAttributes: [...(question?.optionsAttributes ?? []), initalQuestionOptionObject],
    }));
  };

  const removeOptionInQuestion = (option, optionIndex) => {
    if (isEdit && option?.id) {
      const tempOptions = question?.optionsAttributes?.map((item, index) => {
        if (index == optionIndex) {
          return { ...item, _destroy: true };
        }
        return item;
      });
      setQuestion((prevState) => ({ ...prevState, optionsAttributes: tempOptions }));
      return;
    }
    setQuestion((prevState) => ({
      ...prevState,
      optionsAttributes: question?.optionsAttributes?.filter((item, index) => optionIndex != index),
    }));
  };

  const handleQuestionOption = (event) => {
    const splitNameIndex = event.target.name.split('-');

    // if user enter any value less than 0 OR greater than 999 for score it will discard the value
    if (
      splitNameIndex[0] === POINT &&
      (parseInt(event.target.value) < 0 || parseInt(event.target.value) > MAX_3_DIGIT_VALUE)
    )
      return;

    const tempOptions = question?.optionsAttributes
      ? question.optionsAttributes.map((item, index) => {
          if (index == splitNameIndex[1]) {
            return {
              ...item,
              [splitNameIndex[0]]:
                splitNameIndex[0] === POINT ? parseInt(event.target.value) : event.target.value,
            };
          }
          return item;
        })
      : [];

    setQuestion((prevState) => ({
      ...prevState,
      optionsAttributes: tempOptions,
    }));
  };

  const emptyOptionExist = () => {
    let emptyOption = false;
    question?.optionsAttributes?.forEach((element) => {
      if (element == '') emptyOption = true;
    });
    return emptyOption;
  };

  const handleDropDown = (event, option) => {
    if (!event?.target?.value?.value) return;
    const tempObj = {
      target: {
        name: event.target.name,
        value: event.target.value.value,
      },
    };
    if (option) {
      handleQuestionOption(tempObj);
      return;
    }
    handleQuestionFieldChange(tempObj, true);
  };

  const handleQuestionFieldChange = (event, updateOptions) => {
    setQuestion((prevState) => ({
      ...prevState,
      [event.target.name]: event.target.value,
      optionsAttributes: updateOptions ? [] : prevState?.optionsAttributes,
    }));
  };
  const handleSubmit = async () => {
    try {
      setDisabled(true);
      setErrorMessages({});

      let tempQuestionsIndustryVerticalAttributes =
        question.questionsIndustryVerticalAttributes.map((item) => ({
          industryVerticalId: item.value,
          industryVerticalTitle: item.label,
          id: existingIndustryVeritcals.find((optn) => optn?.industryVerticalId == item.value)?.id,
        }));
      const deleteIndustryVerticals = existingIndustryVeritcals
        .map((item) => {
          if (
            !tempQuestionsIndustryVerticalAttributes.find(
              (optn) => optn?.industryVerticalId == item.industryVerticalId,
            )?.id
          )
            return { ...item, _destroy: true };
          return null;
        })
        .filter((item) => item?.id);
      const tempQuestions = {
        ...question,
        questionsIndustryVerticalAttributes: [
          ...tempQuestionsIndustryVerticalAttributes,
          ...deleteIndustryVerticals,
        ],
      };
      const errors = await joiTemplateValidate({ questionSchema: tempQuestions }, t);

      if (errors && Object.keys(errors).length > 0) {
        setErrorMessages(errors);
        setDisabled(false);
        return;
      }

      const res = isEdit
        ? await updateQuestion({ question: tempQuestions, questionId: id })
        : await createQuestion({ question: tempQuestions });
      if (res?.statusCode === 200) {
        toast.success(res?.message, {
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
        history.goBack();
      }
    } catch (error) {
      toast.error(error?.message || t('common.errors.somethingWentWrong'), {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
    setDisabled(false);
  };

  const handleBack = () => {
    history.goBack();
  };

  const displayAddOptionButton =
    question?.responseType == enumResponseType.radio ||
    question?.responseType == enumResponseType.multiselect ||
    question?.responseType == enumResponseType.dropdown;

  const getErrorKey = (key) => {
    return `questionSchema,${key}`;
  };

  const showError = (key) => {
    return errorMessages?.[getErrorKey(key)];
  };

  const getErrorKeyOptionAttributes = (index) => {
    return `questionSchema,optionsAttributes,${index},optionText`;
  };

  const getErrorMessageOptionAttributes = (index) => {
    return errorMessages?.[getErrorKeyOptionAttributes(index)];
  };

  const fetchIndustryVertical = async () => {
    try {
      const response = await getIndustryTypes();
      const tempData = response?.data?.industryVerticals || {};
      const tempIndustryVerticals = Object.keys(tempData).map((item) => ({
        value: item,
        label: tempData[item],
      }));
      /**
       * it will only run for add new question usecase
       */
      if (industryVerticalId && !isEdit) {
        setQuestion((prevState) => ({
          ...prevState,
          questionsIndustryVerticalAttributes: [
            {
              value: industryVerticalId,
              label: tempData[industryVerticalId],
            },
          ],
        }));

        /**
         * Prev flow
         */
        // questionsIndustryVerticalAttributes: prevState.questionsIndustryVerticalAttributes
        //     ? [
        //         ...prevState.questionsIndustryVerticalAttributes,
        //         {
        //           value: industryVerticalId,
        //           label: tempData[industryVerticalId],
        //         },
        //       ]
        //     : [
        //         {
        //           value: industryVerticalId,
        //           label: tempData[industryVerticalId],
        //         },
        //       ],
      }

      setIndustryVerticalsDropDown(tempIndustryVerticals);
    } catch (error) {
      //throw error here
    }
  };

  const fetchQuestion = async () => {
    setDisabled(true);
    try {
      const response = await getQuestion(id);
      if (response?.statusCode) {
        const tempQuestion = response?.data?.question || initalQuestionObject;
        setExistingIndustryVeritcals(tempQuestion?.questionsIndustryVerticalAttributes);
        const tempIndustryVerticals = tempQuestion?.questionsIndustryVerticalAttributes?.map(
          (item) => ({
            value: item?.industryVerticalId?.toString(),
            label: item?.industryVerticalTitle,
          }),
        );
        setQuestion({
          ...tempQuestion,
          questionsIndustryVerticalAttributes: tempIndustryVerticals,
        });
      } else {
        history.goBack();
      }
      setDisabled(false);
    } catch (error) {
      //throw error here
      setDisabled(false);
      history.goBack();
    }
  };

  useEffect(() => {
    fetchIndustryVertical();
  }, []);

  useEffect(() => {
    if (id) {
      fetchQuestion();
    }
  }, [id]);

  return (
    <>
      {disabled && <LoaderComponent size={50} color={'primary'} label={'Loading'} />}
      <Box className={classes.createTemplate}>
        <Box className={classes.createTemplateInfo}>
          <ButtonGroup
            showBack={true}
            handleBack={handleBack}
            handleCancel={handleBack}
            handleSave={handleSubmit}
            disabled={disabled}
          />
          <Box className={classes.createTemplateContent}>
            <Box className={classes.createTemplateQuestionSection}>
              {/* <Box className={classNames(classes.createTemplateQuestionItem, 'innerScrollBar')}> */}
              <Box className={classes.createTemplateQuestionItem}>
                <Box className={classes.createTemplateQuestionInputFirst}>
                  <CustomInput
                    value={question?.questionStatement}
                    onChange={handleQuestionFieldChange}
                    name={`questionStatement`}
                    label={t('ho.templates.create.section.field.title')}
                    errorMessage={showError('questionStatement')}
                    id={`questionStatement`}
                    placeholder={`${t('ho.templates.create.section.field.title')}`}
                    required={true}
                  />
                </Box>
                <Box className={classes.createTemplateQuestionInputMain}>
                  <CustomInput
                    value={question?.instruction}
                    onChange={handleQuestionFieldChange}
                    name={`instruction`}
                    multiline
                    className={classes.textAreaQuestionnaire}
                    placeholder={t('ho.templates.create.section.field.descriptionPlaceholder')}
                    id={`instruction`}
                  />
                </Box>

                <Box className={classes.createTemplateQuestionInput}>
                  <Box className={classes.indusrtialDropDown}>
                    <InputLabel>
                      {t('ho.templates.create.section.field.answerType')}
                      {required && <RequiredAsterik />}
                    </InputLabel>
                    <CustomDropDown
                      label={t('ho.templates.create.section.field.answerType')}
                      name={`responseType`}
                      options={dropDownOptions}
                      selectedValues={{
                        value: question.responseType?.toString(),
                        label: testEnum[question.responseType],
                      }}
                      menuClasses={classes.questionnaireMenuOptions}
                      bordered
                      handleChange={(e) => handleDropDown(e, false)}
                      multiple={false}
                      className={classes.customDropdownField}
                      headerClasses={classes.questionnaireHeaderOptionsTop}
                    />
                  </Box>
                  <Box className={classes.indusrtialDropDown}>
                    <InputLabel>{t('sales.companies.industryVerticals')}</InputLabel>
                    <CustomDropDown
                      label={t('sales.companies.industryVerticals')}
                      name={`questionsIndustryVerticalAttributes`}
                      options={industryVerticalsDropdown}
                      selectedValues={question?.questionsIndustryVerticalAttributes}
                      handleChange={handleQuestionFieldChange}
                      multiSelect={true}
                      checkmark={true}
                      searchable={true}
                      withTiles={true}
                      bordered
                      menuClasses={classes.questionnaireMenuOptions}
                      headerClasses={classes.questionnaireHeaderOptionsTop}
                      isError={!!showError('questionsIndustryVerticalAttributes')}
                      helperText={
                        !!showError('questionsIndustryVerticalAttributes')
                          ? showError('questionsIndustryVerticalAttributes')
                          : null
                      }
                      className={classes.customDropdownField}
                    />
                  </Box>
                </Box>
                {question?.optionsAttributes?.map(
                  (option, index) =>
                    !option?._destroy && (
                      <Box key={index} className={classes.createTemplateQuestionInput1}>
                        <CustomInputIconDropDown
                          value={option?.optionText}
                          handleChange={handleQuestionOption}
                          name={`optionText-${index}`}
                          handleRemove={() => removeOptionInQuestion(option, index)}
                          errorMessage={getErrorMessageOptionAttributes(index)}
                          placeholder={t('ho.templates.create.section.field.option.placeholder')}
                          id={`${index}-optionText`}
                          selectedValues={{
                            value: option?.points,
                            label: option?.points?.toString() || '',
                          }}
                          isError={showError('optionsAttributes') ? true : false}
                          helperText={
                            !!showError('optionsAttributes') ? showError('optionsAttributes') : null
                          }
                          scorePlaceHolder={t('sales.locations.score')}
                          scoreValue={option?.points}
                          dropDownOptions={dropDownScores}
                          dropDownName={`points-${index}`}
                          handleDropDown={(e) => handleDropDown(e, true)}
                          className={classes.numberField}
                        />
                      </Box>
                    ),
                )}
                {displayAddOptionButton && (
                  <Box className={classes.createTemplateQuestionInput}>
                    <Button
                      variant="secondaryBlue"
                      onClick={addOptionInQuestion}
                      disabled={emptyOptionExist()}
                      startIcon={<PlusIcon color="#146DFF" />}
                    >
                      {t('ho.templates.create.btn.newOption')}
                    </Button>
                  </Box>
                )}
                {!!showError('optionsAttributes') && (
                  <Box className={classes.invalidFeedback}>{showError('optionsAttributes')}</Box>
                )}

                <Box className={classes.createTemplateActions}>
                  <CheckBoxLabel
                    value={question?.required}
                    handleChange={handleQuestionFieldChange}
                    name={`required`}
                    label={t('ho.templates.create.checkbox.required')}
                  />
                </Box>
              </Box>
            </Box>
          </Box>
          <ButtonGroup
            showBack={false}
            handleCancel={handleBack}
            handleSave={handleSubmit}
            disabled={disabled}
          />
        </Box>
      </Box>
    </>
  );
};

export default CreateQuestionBank;
