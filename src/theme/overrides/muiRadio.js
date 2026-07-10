const MuiRadio = ({ _palette }) => ({
  styleOverrides: {
    root: {
      color: '#6A6A70',
      '& .MuiSvgIcon-root': {
        width: '24px',
        height: '24px',
      },
      '& + .MuiTypography-root, & + .MuiFormControlLabel-label': {
        fontSize: '14px',
        fontWeight: '400',
        color: '#262527',
      },
      '&.Mui-checked': {
        color: '#146DFF', // Customize the color when the Checkbox is checked
        '&:hover': {
          // backgroundColor: 'lightgreen', // Customize the background color on hover when checked
        },
      },

      '&.Mui-disabled': {
        color: '#AEAEB2', // Customize the color when the Checkbox is checked
        '&:hover': {
          // backgroundColor: 'blue', // Customize the background color on hover when checked
        },
      },
    },
  },
});

export default MuiRadio;
