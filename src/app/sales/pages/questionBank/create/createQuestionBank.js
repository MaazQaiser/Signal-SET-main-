import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  createTemplate: {
    display: 'flex',
    overflow: 'auto',
    flexDirection: 'column',
    flex: 1,
    padding: '16px 32px',
    paddingBottom: '0',

    [theme.breakpoints.down('lg')]: {
      paddingLeft: '24px',
      paddingRight: '24px',
    },
  },

  createTemplateInfo: {
    maxWidth: '960px',
    width: '100%',
    margin: '0 auto',
    // display: 'flex',
    // overflow: 'auto',
    // flexDirection: 'column',
    // flex: 1,
  },

  createTemplateContent: {
    paddingBottom: '24px',
    paddingTop: '24px',
    // display: 'flex',
    // overflow: 'auto',
    // flexDirection: 'column',
    // flex: 1,
  },

  createTemplateQuestionSection: {
    // display: 'flex',
    // overflow: 'auto',
    // flexDirection: 'column',
    // flex: 1,
    // padding: '16px',
    // borderRadius: '8px',
    // border: `1px solid ${theme.palette.borderSubtle1}`,
    // background: 'rgba(245, 245, 246, 0.3)',
  },

  createTemplateQuestionOptions: {
    maxWidth: '409px',
    width: '100%',
    marginTop: '12px',
  },

  createTemplateQuestionItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    // overflow: 'auto',
    padding: '16px',
    borderRadius: '8px',
    border: `1px solid ${theme.palette.borderSubtle1}`,
    background: 'rgba(245, 245, 246, 0.3)',
  },

  createTemplateQuestionInput: {
    gap: '12px',
    display: 'flex',
    justifyContent: 'space-between',
  },

  createTemplateQuestionInputLabel: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '500',
    lineHeight: '20px',
    color: theme.palette.textSecondary3,
    textTransform: 'capitalize',
    marginBottom: '8px',
  },

  createTemplateQuestionInputRequired: {
    color: theme.palette.textAlert,
    paddingRight: '4px',
  },

  questionnaireMenuOptions: {
    width: '100%',
  },

  customDropdownField: {
    height: '44px',
    '& .customDropdownSelectHeader': {
      padding: '20px 30px !important',
    },
  },
  numberField: {
    '& div:nth-child(2)': {
      maxHeight: '195px',
    },
  },
  createTemplateQuestionMoreBtn: {
    padding: '0 5px',
    textTransform: 'inherit',
    fontSize: '14px',
    fontWeight: '500',
    color: theme.palette.textBrand,
  },

  createTemplateActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    columnGap: '20px',
    marginTop: '12px',
  },

  indusrtialDropDown: {
    flex: '1',
  },

  textAreaQuestionnaire: {
    '& .MuiInputBase-inputMultiline': {
      height: '66px !important',
      padding: '10px 14px',
    },
  },

  questionnaireHeaderOptionsTop: {
    padding: '10px 14px !important',
  },

  invalidFeedback: {
    fontSize: 14,
    lineHeight: '20px',
    fontWeight: 400,
    margin: 0,
    marginTop: '6px',
    color: '#B32318',
    textShadow: '0px 0px 0px #F4EBFF, 0px 1px 2px rgba(16, 24, 40, 0.05)',
    '&::first-letter ': {
      textTransform: 'capitalize',
    },
  },
}));
