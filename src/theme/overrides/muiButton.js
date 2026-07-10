const MuiButton = ({ _palette }) => ({
  variants: [
    // Primary
    {
      props: { variant: 'primary' },
      style: {
        padding: '8px 14px',
        height: 36,
        borderRadius: 8,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: 14,
        fontWeight: 500,
        lineHeight: '20px',
        fontFamily: 'Inter',
        textTransform: 'none',
        cursor: 'pointer',
        letterSpacing: 'normal',
        boxShadow: 'none',

        color: '#ffffff',
        backgroundColor: '#146DFF',
        border: `1px solid #146DFF`,

        '&:hover': {
          backgroundColor: '#0059FF',
          border: `1px solid #0059FF`,
        },

        '&:active': {
          backgroundColor: '#146DFF',
          border: `1px solid #146DFF`,
          boxShadow: `0px 0px 0px 4px #E5F6FF, 0px 1px 2px 0px rgba(16, 24, 40, 0.05)`,
        },

        '&:disabled': {
          color: '#ffffff',
          backgroundColor: '#A9DEFF',
          border: `1px solid #A9DEFF`,
        },
        '@media (hover:none)': {
          backgroundColor: '#146DFF',
          border: `1px solid #146DFF`,
        },
      },
    },

    // Secondary-Gray
    {
      props: { variant: 'secondaryGrey' },
      style: {
        padding: '8px 14px',
        height: 36,
        borderRadius: 8,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: 14,
        fontWeight: 500,
        lineHeight: '20px',
        fontFamily: 'Inter',
        textTransform: 'none',
        cursor: 'pointer',
        letterSpacing: 'normal',
        boxShadow: 'none',

        color: '#444446',
        backgroundColor: 'white',
        border: `1px solid #AEAEB2`,

        '&:hover': {
          color: '#262527',
          backgroundColor: '#F5F5F6',
          border: `1px solid #AEAEB2`,
        },

        '&:active': {
          color: '#444446',
          backgroundColor: 'white',
          border: `1px solid #AEAEB2`,
          boxShadow: `0px 0px 0px 4px #F2F4F7, 0px 1px 2px 0px rgba(16, 24, 40, 0.05)`,
        },

        '&:disabled': {
          color: '#AEAEB2',
          backgroundColor: 'white',
          border: `1px solid #D0CFD2`,
          '& span': {
            '& svg': {
              '& g': {
                '& path': {
                  stroke: '#AEAEB2',
                },
              },
            },
          },
        },
        '@media (hover:none)': {
          backgroundColor: 'white',
          border: `1px solid #AEAEB2`,
        },
      },
    },

    // Tertiary-Grey
    {
      props: { variant: 'tertiaryGrey' },
      style: {
        padding: '8px 14px',
        height: 36,
        borderRadius: 8,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: 14,
        fontWeight: 500,
        lineHeight: '20px',
        fontFamily: 'Inter',
        textTransform: 'none',
        cursor: 'pointer',
        letterSpacing: 'normal',
        boxShadow: 'none',

        color: '#5B5B5F',
        backgroundColor: 'transparent',

        '&:hover': {
          color: '#5B5B5F',
          backgroundColor: '#F5F5F6',
        },

        '&:active': {
          color: '#5B5B5F',
          backgroundColor: 'transparent',
          boxShadow: `none`,
        },

        '&:disabled': {
          color: '#AEAEB2',
          backgroundColor: 'transparent',
        },
        '@media (hover:none)': {
          backgroundColor: 'transparent',
        },
      },
    },

    // onlyText
    {
      props: { variant: 'onlyText' },
      style: {
        padding: '8px 14px',
        height: 36,
        borderRadius: 8,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: 14,
        fontWeight: 500,
        lineHeight: '20px',
        fontFamily: 'Inter',
        textTransform: 'none',
        cursor: 'pointer',
        letterSpacing: 'normal',

        color: '#146DFF',
        backgroundColor: 'transparent',

        '&:hover': {
          color: '#0059FF',
          backgroundColor: 'transparent',
        },

        '&:active': {
          color: '#146DFF',
          backgroundColor: 'transparent',
          boxShadow: `none`,
        },

        '&:disabled': {
          color: '#A9DEFF',
          backgroundColor: 'transparent',
        },
        '@media (hover:none)': {
          backgroundColor: 'transparent',
        },
      },
    },

    // Destructive
    {
      props: { variant: 'destructive' },
      style: {
        padding: '8px 14px',
        height: 36,
        borderRadius: 8,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: 14,
        fontWeight: 500,
        lineHeight: '20px',
        fontFamily: 'Inter',
        textTransform: 'none',
        cursor: 'pointer',
        letterSpacing: 'normal',
        boxShadow: `0px 1px 2px 0px rgba(16, 24, 40, 0.05)`,

        color: '#ffffff',
        backgroundColor: '#E43F32',
        border: `1px solid #E43F32`,

        '&:hover': {
          backgroundColor: '#B32318',
          border: `1px solid #B32318`,
        },

        '&:active': {
          backgroundColor: '#E43F32',
          border: `1px solid #E43F32`,
          boxShadow: ` 0px 0px 0px 4px #FEE4E2, 0px 1px 2px 0px rgba(16, 24, 40, 0.05)`,
        },

        '&:disabled': {
          color: '#ffffff',
          backgroundColor: '#FECDCA',
          border: `1px solid #FECDCA`,
          boxShadow: `0px 1px 2px 0px rgba(16, 24, 40, 0.05)`,
        },
        '@media (hover:none)': {
          backgroundColor: '#E43F32',
          border: `1px solid #D92D20`,
        },
      },
    },

    // Destructive-Secondary
    {
      props: { variant: 'destructiveSecondary' },
      style: {
        padding: '8px 14px',
        height: 36,
        borderRadius: 8,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: 14,
        fontWeight: 500,
        lineHeight: '20px',
        fontFamily: 'Inter',
        textTransform: 'none',
        cursor: 'pointer',
        letterSpacing: 'normal',
        boxShadow: `0px 1px 2px 0px rgba(16, 24, 40, 0.05)`,

        color: '#B32318',
        backgroundColor: '#ffffff',
        border: `1px solid #DF372B`,

        '&:hover': {
          backgroundColor: '#FBEEED',
          border: `1px solid #DF372B`,
        },

        '&:active': {
          backgroundColor: '#ffffff',
          border: `1px solid #DF372B`,
          boxShadow: ` 0px 0px 0px 4px #FEE4E2, 0px 1px 2px 0px rgba(16, 24, 40, 0.05)`,
        },

        '&:disabled': {
          color: '#FECDCA',
          backgroundColor: '#ffffff',
          border: `1px solid #FECDCA`,
        },
        '@media (hover:none)': {
          backgroundColor: '#ffffff',
          border: `1px solid #DF372B`,
        },
      },
    },

    // Secondary-Blue
    {
      props: { variant: 'secondaryBlue' },
      style: {
        padding: '8px 14px',
        height: 36,
        borderRadius: 8,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: 14,
        fontWeight: 500,
        lineHeight: '20px',
        fontFamily: 'Inter',
        textTransform: 'none',
        cursor: 'pointer',
        letterSpacing: 'normal',
        boxShadow: 'none',

        color: '#146DFF',
        backgroundColor: 'transparent',
        border: `1px solid #146DFF`,

        '&:hover': {
          color: '#146DFF',
          backgroundColor: '#E5F6FF',
          border: `1px solid #146DFF`,
        },

        '&:active': {
          color: '#146DFF',
          backgroundColor: 'transparent',
          border: `1px solid #146DFF`,
          boxShadow: `0px 0px 0px 4px #E5F6FF`,
        },

        '&:disabled': {
          color: '#A9DEFF',
          backgroundColor: 'transparent',
          border: `1px solid #A9DEFF`,
        },
        '@media (hover:none)': {
          backgroundColor: 'transparent',
          border: `1px solid #146DFF`,
        },
      },
    },
  ],
});

export default MuiButton;
