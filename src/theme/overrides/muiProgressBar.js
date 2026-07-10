const MuiLinearProgress = ({ _palette }) => ({
  styleOverrides: {
    root: {
      height: 8,
      borderRadius: 10,
      backgroundColor: '#F5F5F6',
      '& .MuiLinearProgress-bar': {
        borderRadius: 10,
        '&.MuiLinearProgress-barColorPrimary': {
          backgroundColor: '#146DFF',
        },
        '&.MuiLinearProgress-barColorSecondary': {
          backgroundColor: '#A9DEFF',
        },
        '&.MuiLinearProgress-barColorWarning': {
          backgroundColor: '#F4780B',
        },
      },
    },
  },
});

export default MuiLinearProgress;
