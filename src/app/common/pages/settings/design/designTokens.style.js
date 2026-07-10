import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  page: {
    padding: '24px 32px 48px',
    maxWidth: '1200px',
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
  },
  toolbar: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    alignItems: 'center',
  },
  searchField: {
    minWidth: '240px',
    '& .MuiOutlinedInput-root': {
      backgroundColor: theme.palette.surfaceWhite,
    },
  },
  stats: {
    color: theme.palette.textSecondary2,
    fontSize: '13px',
    marginBottom: '16px',
  },
  mainTabs: {
    marginBottom: '20px',
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    minHeight: '40px',
    '& .MuiTabs-indicator': {
      backgroundColor: theme.palette.surfaceBrand,
    },
  },
  mainTab: {
    textTransform: 'none',
    fontSize: '14px',
    fontWeight: 600,
    minHeight: '40px',
  },
  tabToolbar: {
    display: 'flex',
    gap: '8px',
    marginBottom: '16px',
  },
  hexMono: {
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    fontSize: '13px',
    fontWeight: 600,
  },
  tokenBadge: {
    fontSize: '12px',
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    color: theme.palette.textBrand,
  },
  locationsCell: {
    padding: '0 !important',
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
  },
  locationsPanel: {
    padding: '12px 16px 16px 64px',
    backgroundColor: theme.palette.surfaceGreySubtle,
  },
  locationsList: {
    margin: 0,
    padding: 0,
    listStyle: 'none',
  },
  locationItem: {
    marginBottom: '8px',
    '&:last-child': {
      marginBottom: 0,
    },
  },
  locationPath: {
    display: 'block',
    fontSize: '12px',
    fontWeight: 600,
    color: theme.palette.textPrimary,
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    wordBreak: 'break-all',
  },
  locationLines: {
    display: 'block',
    fontSize: '12px',
    color: theme.palette.textSecondary3,
    marginTop: '2px',
  },
  collectionBlock: {
    marginBottom: '24px',
    border: `1px solid ${theme.palette.borderSubtle1}`,
    borderRadius: '8px',
    overflow: 'hidden',
    backgroundColor: theme.palette.surfaceWhite,
  },
  collectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 12px',
    backgroundColor: theme.palette.surfaceGreySubtle,
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    cursor: 'pointer',
    userSelect: 'none',
  },
  collectionHeaderStatic: {
    cursor: 'default',
  },
  chevron: {
    width: '20px',
    color: theme.palette.textSecondary3,
    fontSize: '12px',
    flexShrink: 0,
  },
  collectionTitle: {
    color: theme.palette.textPrimary,
    fontSize: '13px',
    fontWeight: 600,
    flex: 1,
    minWidth: 0,
  },
  collectionMeta: {
    color: theme.palette.textSecondary3,
    fontSize: '12px',
    marginRight: '8px',
  },
  collectionActions: {
    display: 'flex',
    gap: '4px',
    alignItems: 'center',
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
  colSwatch: { width: '48px' },
  colName: { width: '38%' },
  colValue: { width: '32%' },
  colActions: { width: '140px' },
  valueCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  colorPicker: {
    width: '36px',
    height: '36px',
    padding: 0,
    border: `1px solid ${theme.palette.borderSubtle2}`,
    borderRadius: '6px',
    cursor: 'pointer',
    backgroundColor: 'transparent',
    flexShrink: 0,
  },
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
      padding: '6px 12px',
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
  swatch: {
    width: '24px',
    height: '24px',
    borderRadius: '4px',
    border: `1px solid ${theme.palette.borderSubtle2}`,
    margin: '0 auto',
  },
  nameField: {
    '& .MuiOutlinedInput-input': {
      fontSize: '13px',
      padding: '6px 8px',
    },
  },
  hexField: {
    '& .MuiOutlinedInput-input': {
      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
      fontSize: '13px',
      padding: '6px 8px',
    },
  },
  hexFieldInvalid: {
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.palette.borderAlert,
    },
  },
  rowActions: {
    display: 'flex',
    gap: '2px',
    justifyContent: 'flex-end',
  },
  actionBtn: {
    minWidth: 'auto',
    padding: '2px 6px',
    fontSize: '12px',
    textTransform: 'none',
    color: theme.palette.textSecondary2,
  },
  applyBtn: {
    minWidth: 'auto',
    padding: '4px 10px',
    fontSize: '12px',
    textTransform: 'none',
    boxShadow: 'none',
  },
  impactRow: {
    '& td': {
      padding: '0 12px 10px',
      borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
      backgroundColor: theme.palette.surfaceBrandSubtle,
    },
  },
  impactBox: {
    padding: '10px 12px',
    borderRadius: '6px',
    border: `1px solid ${theme.palette.borderBrandDisabled}`,
    backgroundColor: theme.palette.surfaceWhite,
  },
  impactTitle: {
    fontSize: '13px',
    fontWeight: 600,
    color: theme.palette.textPrimary,
    marginBottom: '4px',
  },
  impactDetail: {
    fontSize: '12px',
    color: theme.palette.textSecondary2,
    lineHeight: '18px',
  },
  addRow: {
    padding: '8px 12px',
    borderTop: `1px dashed ${theme.palette.borderSubtle2}`,
  },
  addRowBtn: {
    textTransform: 'none',
    fontSize: '13px',
    color: theme.palette.textBrand,
    padding: '4px 8px',
  },
  emptyState: {
    color: theme.palette.textSecondary3,
    padding: '48px 0',
    textAlign: 'center',
  },
  newGroupBar: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
    marginTop: '8px',
    padding: '12px',
    border: `1px dashed ${theme.palette.borderSubtle2}`,
    borderRadius: '8px',
    backgroundColor: theme.palette.surfaceGreySubtle,
  },
  newGroupField: {
    flex: 1,
    '& .MuiOutlinedInput-root': {
      backgroundColor: theme.palette.surfaceWhite,
    },
  },
}));
