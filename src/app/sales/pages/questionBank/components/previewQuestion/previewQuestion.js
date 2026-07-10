import { makeStyles } from '@mui/styles';
export const useStyles = makeStyles((theme) => ({
  previewQuestionSection: {
    '&:last-child': {
      borderBottom: 'none',
    },
  },
  previewQuestionSectionTitle: {
    fontSize: '20px',
    fontWeight: '700',
    lineHeight: '24px',
  },
  previewQuestionSectionRequired: {
    color: theme.palette.textAlert,
    paddingRight: '4px',
  },
  previewQuestionOptions: {
    border: `1px solid ${theme.palette.borderSubtle1}`,
    background: theme.palette.surfaceGreySubtle,
    borderRadius: '8px',
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 20px',
  },
  previewQuestionOptionText: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
      maxWidth: '346px',
    },
  },
  previewQuestionOptionScore: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary2,
    },
  },
  previewQuestionWrapper: {
    alignItems: 'center',
    padding: '24px',
    display: 'flex',
    justifyContent: 'space-between',
  },
  editWrapper: {
    display: 'flex',
    gap: '12px',
  },
  questionListWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  industryOptions: {
    padding: '12px 24px 15px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  chipCOntainer: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  associatedIndustries: {
    fontSize: '14px',
    fontStyle: 'normal',
    fontWeight: '500',
    lineHeight: '20px',
    textAlign: 'center',
    color: theme.palette.textSecondary1,
    padding: '2px 10px',
  },
  previewQuestionBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    padding: '24px',
  },
  previewQuestionBodyTitle: {
    fontSize: '18px',
    fontStyle: 'normal',
    fontWeight: '700',
    lineHeight: '20px',
  },
  crossBtn: {
    '&.MuiButton-root': {
      padding: 0,
      minWidth: '0px',
    },
  },
  previewQuestionSectionText: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary3,
      lineHeight: 'normal',
      paddingTop: '8px',
    },
  },
  secondPreviewTemplate: {
    marginTop: '24px',
  },
  checkBoxPoint: {
    display: 'flex',
    alignItems: 'center',
  },
}));
