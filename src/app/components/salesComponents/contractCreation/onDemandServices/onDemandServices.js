import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  onDemandHead: {
    paddingBottom: '16px',
    paddingTop: '24px',
  },
  demandSubText: {
    '&.MuiTypography-root': {
      marginTop: '8px',
      color: `${theme.palette.textPlaceholder}`,
    },
  },
  labelHeading: {
    '&.MuiTypography-root': {
      color: `${theme.palette.textPrimary}`,
      fontWeight: '700',
      textTransform: 'capitalize',
    },
  },
  labelCount: {
    color: `${theme.palette.textPrimary}`,
    fontWeight: '700',
  },
  labelSubText: {
    '&.MuiTypography-root': {
      color: `${theme.palette.textPlaceholder}`,
    },
  },
  boxTextHeading: {
    '&.MuiTypography-root': {
      color: `${theme.palette.textSecondary1}`,
      display: 'block',
      fontWeight: '700',
      lineHeight: '16px',
    },
  },
  labelHeadingThree: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },
  boxSubText: {
    '&.MuiTypography-root': {
      display: 'block',
      color: `${theme.palette.textSecondary2}`,
      lineHeight: '18px',
    },
  },
  dropHeader: {
    height: '44px',
  },
  inputField: {
    '& .MuiInputBase-root': {
      height: '44px',
    },
  },
  inputFieldTotal: {
    '& .MuiInputBase-root': {
      background: `${theme.palette.surfaceGreySubtle}`,
    },
  },
  onDemandFields: {
    display: 'flex',
    width: '100%',
    gap: '12px',
  },
  inputFieldTitle: {
    flex: '1 1 33%',
    '& .MuiInputBase-root': {
      width: '100%',
      minWidth: '100%',
    },
  },
  servicesInput: {
    '& .MuiInputBase-root': {
      width: '100%',
      minWidth: '100%',
    },
  },
  DemandInline: {
    flex: '1 1 16%',
    '& .MuiInputBase-root': {
      width: '100%',
      minWidth: '100%',
    },
  },
  customDropDown: {
    '& >.MuiBox-root': {
      width: '220px !important',
    },
  },
  DemandInlineButton: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: '16px',
    gap: '12px',
  },
  saveButton: {
    '&.MuiButtonBase-root': {
      minHeight: '40px',
    },
  },
  demandPricesRow: {
    height: '102px',
    padding: '32px 0px',
    display: 'flex',
    // justifyContent: 'space-between',
    gap: '60px',
    alignItems: 'center',
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,

    '&:first-child': {
      borderTop: `1px solid ${theme.palette.borderSubtle1}`,
    },
  },
  priceLeftSideInner: {
    display: 'flex',

    alignItems: 'flex-start',
    gap: '6px',
  },
  priceRightSideInner: {
    display: 'flex',
    gap: '60px',
  },
  priceLeftSide: {
    flexBasis: '505px',
  },
  priceRightSide: {
    flexBasis: '365px',
  },
  iconBox: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    gap: '19px',
  },
  iconBoxText: {
    width: '100px',
    display: 'flex',
    flexDirection: 'column',
  },
  addButton: {
    padding: '24px 4px',
  },
  addPriceRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  crudButtons: {
    gap: '0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  binIcon: {
    '&.MuiButtonBase-root': {
      padding: '0',
      minWidth: '34px',
      borderColor: '#aeaeb200',
      minHeight: '34px',
      '& svg': {
        padding: '3px',
        '& path': {
          stroke: theme.palette.surfaceAlertStrong,
        },
      },
    },
  },
  editIcon: {
    '&.MuiButtonBase-root': {
      padding: '0',
      minWidth: '34px',
      borderColor: '#aeaeb200',
      minHeight: '34px',
    },
  },
  onDemandFieldsWrapper: {
    padding: '24px 0',
  },
  onDemandStep: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'auto',
    flex: 1,
  },
  onDemandContent: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'auto',
    flex: 1,
    paddingRight: '8px',
    paddingLeft: '8px',
  },
  demandInlineWrrap: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    alignItems: 'flex-start',
    gap: '12px',
    '& .MuiInputBase-root': {
      height: '36px !important',
      width: '220px !important',
    },
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
  onDemandHeadInner: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
}));
