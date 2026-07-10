import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  page: {
    padding: '24px 32px 48px',
    maxWidth: '1280px',
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '16px',
    marginBottom: '20px',
  },
  title: {
    color: theme.palette.textPrimary,
    fontSize: '24px',
    fontWeight: 700,
    lineHeight: '32px',
  },
  subtitle: {
    color: theme.palette.textSecondary3,
    fontSize: '14px',
    fontWeight: 400,
    lineHeight: '20px',
    marginTop: '4px',
    '& a': {
      color: theme.palette.textBrand,
      textDecoration: 'none',
      '&:hover': {
        textDecoration: 'underline',
      },
    },
  },
  toolbar: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    alignItems: 'center',
  },
  searchField: {
    minWidth: '280px',
    '& .MuiOutlinedInput-root': {
      backgroundColor: theme.palette.surfaceWhite,
    },
  },
  stats: {
    color: theme.palette.textSecondary2,
    fontSize: '13px',
    marginBottom: '16px',
  },
  sectionBlock: {
    marginBottom: '24px',
    border: `1px solid ${theme.palette.borderSubtle1}`,
    borderRadius: '8px',
    overflow: 'hidden',
    backgroundColor: theme.palette.surfaceWhite,
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 12px',
    backgroundColor: theme.palette.surfaceGreySubtle,
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    cursor: 'pointer',
    userSelect: 'none',
  },
  chevron: {
    width: '20px',
    color: theme.palette.textSecondary3,
    fontSize: '12px',
    flexShrink: 0,
  },
  sectionTitle: {
    color: theme.palette.textPrimary,
    fontSize: '13px',
    fontWeight: 600,
    flex: 1,
    minWidth: 0,
  },
  sectionMeta: {
    color: theme.palette.textSecondary3,
    fontSize: '12px',
    marginRight: '8px',
  },
  tableWrap: {
    width: '100%',
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    tableLayout: 'fixed',
  },
  colName: { width: '22%' },
  colVariant: { width: '28%' },
  colPreview: { width: '50%' },
  thead: {
    '& th': {
      textAlign: 'left',
      padding: '8px 12px',
      fontSize: '11px',
      fontWeight: 600,
      letterSpacing: '0.02em',
      textTransform: 'uppercase',
      color: theme.palette.textSecondary3,
      borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
      backgroundColor: theme.palette.surfaceWhite,
    },
  },
  row: {
    '& td': {
      padding: '12px',
      borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
      verticalAlign: 'middle',
    },
    '&:last-child td': {
      borderBottom: 'none',
    },
    '&:hover': {
      backgroundColor: theme.palette.surfaceGreySubtle,
    },
  },
  cellName: {
    fontSize: '13px',
    fontWeight: 600,
    color: theme.palette.textPrimary,
  },
  cellVariant: {
    fontSize: '12px',
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    color: theme.palette.textSecondary2,
    wordBreak: 'break-word',
  },
  cellDescription: {
    display: 'block',
    marginTop: '4px',
    fontSize: '12px',
    color: theme.palette.textSecondary3,
    fontFamily: 'inherit',
  },
  previewRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    alignItems: 'center',
  },
  previewTypography: {
    margin: 0,
  },
  previewPaper: {
    padding: '12px 16px',
    minWidth: '100px',
  },
  previewCard: {
    maxWidth: '280px',
  },
  previewCardContent: {
    padding: '12px 16px !important',
    '&:last-child': {
      paddingBottom: '12px !important',
    },
  },
  previewTable: {
    maxWidth: '360px',
    border: `1px solid ${theme.palette.borderSubtle1}`,
    borderRadius: '8px',
    overflow: 'hidden',
  },
  previewMeta: {
    color: theme.palette.textSecondary3,
    fontStyle: 'italic',
  },
  emptyState: {
    color: theme.palette.textSecondary3,
    padding: '48px 0',
    textAlign: 'center',
  },
  usageCode: {
    display: 'inline-block',
    marginTop: '6px',
    padding: '4px 8px',
    borderRadius: '4px',
    backgroundColor: theme.palette.surfaceGreySubtle,
    fontSize: '11px',
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    color: theme.palette.textSecondary2,
  },
}));
