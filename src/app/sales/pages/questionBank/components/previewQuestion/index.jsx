import { Clear } from '@mui/icons-material';
import { Box, Button, Chip, Divider, Typography } from '@mui/material';
import CheckBoxLabel from 'commonComponents/templates/checkBoxLabel';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import LoaderComponent from 'src/app/components/common/loader';
import { ACL_MARKET_VERTICALS_QUESTIONS_UPDATE } from 'src/app/router/constant/SALESMODULE';
import RenderIfHasPermission from 'src/hoc/renderIfHasPermission';
import { getQuestion } from 'src/services/question.services';

import { useStyles } from './previewQuestion';
const PreviewTemplateSection = ({ title, text, children, showStaric, answerType }) => {
  const classes = useStyles();

  return (
    <Box className={classes.previewQuestionSection}>
      <Typography
        variant="h3"
        className={
          answerType
            ? classes.previewQuestionSectionAnswerType
            : classes.previewQuestionSectionTitle
        }
      >
        {title}
        {showStaric && (
          <Box component="span" className={classes.previewQuestionSectionRequired}>
            *
          </Box>
        )}
      </Typography>
      <Typography className={classes.previewQuestionSectionText} variant="subtitle2">
        {text}
      </Typography>
      {children}
    </Box>
  );
};

PreviewTemplateSection.propTypes = {
  title: PropTypes.string,
  text: PropTypes.string,
  children: PropTypes.node,
  showStaric: PropTypes.bool,
  answerType: PropTypes.bool,
};

export default function QuestionDetails({ question, onClose, goToEditPage }) {
  const { t } = useTranslation();
  const classes = useStyles();

  const [loading, setLoading] = useState(true);
  const [questionDetail, setQuestionDetail] = useState({});

  const fetchQuestion = async () => {
    try {
      setLoading(true);
      const response = await getQuestion(question?.id);
      if (response?.statusCode == 200 && response?.data?.question) {
        setQuestionDetail(response?.data?.question);
      }
      setLoading(false);
    } catch (error) {
      //error handling
      setLoading(false);
    }
  };

  useEffect(() => {
    if (question?.id) {
      fetchQuestion();
    }
  }, [question]);

  const responseTypeEnum = {
    0: t('ho.templates.create.section.field.responseType.text'),
    1: t('ho.templates.create.section.field.responseType.number'),
    2: t('ho.templates.create.section.field.responseType.multiselect'),
    3: t('ho.templates.create.section.field.responseType.dateTime'),
    4: t('ho.templates.create.section.field.responseType.radio'),
    5: t('ho.templates.create.section.field.responseType.date'),
    6: t('ho.templates.create.section.field.responseType.imageVideo'),
    7: t('ho.templates.create.section.field.responseType.time'),
  };
  return (
    <>
      {loading && <LoaderComponent size={50} color={'primary'} label={'Loading'} />}
      <Box className={classes.previewQuestion}>
        <Box className={classes.previewQuestionWrapper}>
          <Box>
            <Typography variant="h2">{t('sales.questions.previewQuestion')}</Typography>
          </Box>
          <Box className={classes.editWrapper}>
            <RenderIfHasPermission name={ACL_MARKET_VERTICALS_QUESTIONS_UPDATE}>
              <Button onClick={goToEditPage} variant="primary">
                {t('links.edit')}
              </Button>
            </RenderIfHasPermission>
            <Button onClick={onClose} color={'inherit'} className={classes.crossBtn}>
              <Clear />
            </Button>
          </Box>
        </Box>
        <Divider />
        <Box className={classes.industryOptions}>
          <Typography variant="h3">{t('sales.questions.previewAssociatedIndustries')}</Typography>
          <Box className={classes.chipCOntainer}>
            {questionDetail?.questionsIndustryVerticalAttributes?.map((industryVerticals) => (
              <Chip
                key={industryVerticals?.industryVerticalId}
                className={classes.associatedIndustries}
                label={industryVerticals?.industryVerticalTitle}
              />
            ))}
          </Box>
        </Box>
        <Divider />
        <Box className={classes.previewQuestionBody}>
          <PreviewTemplateSection
            title={questionDetail?.questionStatement}
            text={questionDetail?.instruction}
            showStaric={questionDetail?.required}
          >
            <Box className={classes.secondPreviewTemplate}>
              <PreviewTemplateSection
                title={t('sales.questions.previewAnswerType')}
                text={responseTypeEnum[questionDetail?.responseType]}
                answerType={true}
              />
            </Box>
          </PreviewTemplateSection>
          <Box className={classes.questionListWrapper}>
            {questionDetail?.optionsAttributes?.map((option, index) => (
              <Box key={index} className={classes?.previewQuestionOptions}>
                <Box className={classes.checkBoxPoint}>
                  <CheckBoxLabel value={false} handleChange={() => {}} />
                  <Typography variant="body2" className={classes?.previewQuestionOptionText}>
                    {option?.optionText}
                  </Typography>
                </Box>
                <Typography variant="body2" className={classes?.previewQuestionOptionScore}>
                  {option?.points} {t('sales.questions.previewPoints')}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </>
  );
}

QuestionDetails.propTypes = {
  question: PropTypes.object,
  onClose: PropTypes.func,
  goToEditPage: PropTypes.func,
};
