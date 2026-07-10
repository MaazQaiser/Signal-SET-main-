import { makeStyles } from '@mui/styles';
export const useStyles = makeStyles(() => ({
  borderSignature: {
    borderRadius: '8px',
    background: '#F5F5F6',
    marginTop: '4px',
    padding: '10px 14px',
    height: '134px',
  },
  sigCanvas: {
    width: '100%',
    height: '100%',
    display: 'block',
  },
  btn: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginBottom: '8px',
    position: 'absolute',
    top: '-32px',
    right: '0',
    cursor: 'pointer',
  },
  signaturePadWrapper: {
    position: 'relative',
  },
}));
