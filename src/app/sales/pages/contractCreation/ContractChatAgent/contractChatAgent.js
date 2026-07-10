import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => {
  const glassBlur = {
    WebkitBackdropFilter: 'blur(12px) saturate(180%)',
    backdropFilter: 'blur(12px) saturate(180%)',
  };

  const panelBg = '#F0F7FF';
  const panelGradient =
    'radial-gradient(ellipse 85% 65% at 100% 0%, rgba(180, 210, 255, 0.43) 0%, transparent 58%), linear-gradient(165deg, rgba(240, 247, 255, 0.60) 0%, rgba(240, 247, 255, 0.15) 100%)';

  const choiceGlassSurface = {
    borderRadius: '999px',
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
    ...glassBlur,
    border: '1px solid rgba(255, 255, 255, 0.72)',
    boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06)',
  };

  const assistantBackdrop = 'rgba(107, 156, 248, 0.15)';

  return {
    backdrop: {
      position: 'fixed',
      inset: 0,
      backgroundColor: assistantBackdrop,
      WebkitBackdropFilter: 'blur(4px)',
      backdropFilter: 'blur(4px)',
      zIndex: theme.zIndex.modal - 1,
    },
    floatingRoot: {
      position: 'fixed',
      bottom: '24px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: theme.zIndex.modal,
      width: '100%',
      maxWidth: '560px',
      padding: '0 16px',
      background: 'transparent',
      pointerEvents: 'none',
      '& > *': {
        pointerEvents: 'auto',
      },
    },
    '@keyframes triggerBarGradientStroke': {
      '0%': {
        backgroundPosition: '0% 50%',
      },
      '50%': {
        backgroundPosition: '100% 50%',
      },
      '100%': {
        backgroundPosition: '0% 50%',
      },
    },
    triggerBar: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      padding: '12px 12px 12px 20px',
      backgroundColor: 'rgba(255, 255, 255, 0.65)',
      backgroundImage: panelGradient,
      ...glassBlur,
      border: 'none',
      borderRadius: '24px',
      boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06), 0 0 0 0.5px rgba(107, 156, 248, 0.35)',
      cursor: 'pointer',
      isolation: 'isolate',
      transition: 'box-shadow 0.2s ease, background-color 0.2s ease',
      '&::before': {
        content: '""',
        position: 'absolute',
        inset: 0,
        borderRadius: '24px',
        padding: '0.5px',
        background: 'linear-gradient(120deg, #6B9CF8, #DDE7FA, #6B9CF8, #DDE7FA, #6B9CF8)',
        backgroundSize: '300% 300%',
        animation: '$triggerBarGradientStroke 10s ease infinite',
        WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
        WebkitMaskComposite: 'xor',
        maskComposite: 'exclude',
        pointerEvents: 'none',
        zIndex: 0,
      },
      '& > *': {
        position: 'relative',
        zIndex: 1,
      },
      '&:hover': {
        backgroundColor: 'rgba(255, 255, 255, 0.78)',
        boxShadow: '0 6px 28px rgba(107, 156, 248, 0.12), 0 0 0 0.5px rgba(107, 156, 248, 0.45)',
      },
    },
    triggerIcon: {
      width: '24px',
      height: '24px',
      flexShrink: 0,
      display: 'block',
    },
    fallbackAvatar: {
      width: '24px',
      height: '24px',
      borderRadius: '50%',
      backgroundColor: 'rgba(20, 109, 255, 0.22)',
      flexShrink: 0,
    },
    triggerText: {
      flex: 1,
      '&.MuiTypography-root': {
        color: theme.palette.textDisabled,
        fontSize: '14px',
      },
    },
    chatPanel: {
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      backgroundColor: panelBg,
      backgroundImage: panelGradient,
      ...glassBlur,
      border: 'none',
      borderRadius: '24px',
      boxShadow: '0 8px 40px rgba(0, 0, 0, 0.08)',
      overflow: 'hidden',
      maxHeight: 'min(70vh, 640px)',
      isolation: 'isolate',
    },
    header: {
      padding: '14px 16px 10px',
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      flexShrink: 0,
      backgroundColor: 'transparent',
    },
    closeButton: {
      color: theme.palette.textDisabled,
      flexShrink: 0,
      padding: '6px',
      marginLeft: 'auto',
    },
    headerTitle: {
      flex: 1,
      '&.MuiTypography-root': {
        color: theme.palette.textPrimary,
        fontWeight: 500,
        fontSize: '15px',
        lineHeight: 1.3,
      },
    },
    headerGlyph: {
      '&.MuiTypography-root': {
        fontSize: '20px',
        lineHeight: 1,
        color: theme.palette.textPrimary,
      },
    },
    messageList: {
      flex: 1,
      overflowY: 'auto',
      padding: '8px 20px 12px',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      minHeight: '200px',
      maxHeight: 'min(45vh, 420px)',
      backgroundColor: 'transparent',
    },
    agentRow: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '8px',
      maxWidth: '92%',
    },
    agentAvatar: {
      width: '18px',
      height: '18px',
      marginTop: '4px',
      flexShrink: 0,
      display: 'block',
    },
    fallbackAgentAvatar: {
      width: '18px',
      height: '18px',
      marginTop: '4px',
      borderRadius: '50%',
      backgroundColor: 'rgba(20, 109, 255, 0.22)',
      flexShrink: 0,
    },
    agentBubble: {
      backgroundColor: '#FFFFFF',
      borderRadius: '12px 12px 12px 2px',
      padding: '8px 12px',
    },
    userBubble: {
      backgroundColor: theme.palette.surfaceBrand,
      borderRadius: '12px 12px 2px 12px',
      padding: '8px 12px',
      maxWidth: '85%',
      alignSelf: 'flex-end',
      '& .MuiTypography-root': {
        color: theme.palette.textOnColor,
      },
    },
    agentText: {
      '&.MuiTypography-root': {
        color: theme.palette.textPrimary,
        fontSize: '14px',
        lineHeight: '20px',
      },
    },
    typingIndicator: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      minHeight: '20px',
    },
    typingDots: {
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      '& span': {
        width: '6px',
        height: '6px',
        borderRadius: '50%',
        backgroundColor: theme.palette.textBrand,
        opacity: 0.45,
        animation: '$typingBounce 1.2s infinite ease-in-out',
        '&:nth-child(2)': {
          animationDelay: '0.15s',
        },
        '&:nth-child(3)': {
          animationDelay: '0.3s',
        },
      },
    },
    typingStatus: {
      '&.MuiTypography-root': {
        color: theme.palette.textSecondary2,
        fontSize: '12px',
        lineHeight: '16px',
      },
    },
    '@keyframes typingBounce': {
      '0%, 60%, 100%': {
        transform: 'translateY(0)',
        opacity: 0.35,
      },
      '30%': {
        transform: 'translateY(-3px)',
        opacity: 1,
      },
    },
    inputRow: {
      padding: '12px 16px 16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      flexShrink: 0,
      backgroundColor: 'transparent',
    },
    inputPill: {
      display: 'flex',
      alignItems: 'flex-end',
      gap: '8px',
      padding: '10px 4px 10px 16px',
      minHeight: '48px',
      height: 'auto',
      backgroundColor: 'rgba(255, 255, 255, 0.65)',
      ...glassBlur,
      borderRadius: '24px',
      boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06)',
      border: 'none',
    },
    inputActions: {
      display: 'flex',
      alignItems: 'flex-end',
      gap: '8px',
    },
    textField: {
      flex: 1,
      margin: 0,
      minWidth: 0,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      '& .MuiInputBase-root': {
        width: '100%',
        backgroundColor: 'transparent',
        boxShadow: 'none',
        outline: 'none',
        margin: 0,
        padding: 0,
        minHeight: '20px',
        height: 'auto',
        alignItems: 'flex-start',
        fontWeight: 400,
        '&.Mui-focused': {
          backgroundColor: 'transparent',
          boxShadow: 'none',
        },
      },
      '& .MuiInputBase-input': {
        padding: '0 !important',
        margin: 0,
        fontSize: '14px',
        fontWeight: 400,
        lineHeight: '20px',
        color: theme.palette.textPrimary,
        '&::placeholder': {
          color: theme.palette.textDisabled,
          opacity: 1,
          fontWeight: 400,
        },
      },
      '& input.MuiInputBase-input': {
        height: '20px',
      },
      '& textarea.MuiInputBase-input': {
        height: 'auto !important',
        minHeight: '20px',
        overflow: 'auto !important',
        resize: 'none',
        boxSizing: 'border-box',
      },
      '& .MuiInput-root': {
        marginTop: '0 !important',
        paddingBottom: '0 !important',
        '&:before, &:after': {
          display: 'none',
        },
        '&:hover:not(.Mui-disabled):before': {
          borderBottom: 'none',
        },
      },
      '& .MuiOutlinedInput-root': {
        backgroundColor: 'transparent',
        borderRadius: 0,
        padding: 0,
        margin: 0,
        minHeight: 'unset',
        height: 'auto',
        alignItems: 'center',
        boxShadow: 'none',
        '& fieldset': {
          border: 'none',
        },
        '&:hover fieldset, &.Mui-focused fieldset': {
          border: 'none',
        },
      },
      '& .MuiOutlinedInput-input': {
        padding: '0 !important',
        margin: 0,
        fontSize: '14px',
        fontWeight: 400,
        lineHeight: '20px',
        color: theme.palette.textPrimary,
        '&::placeholder': {
          color: theme.palette.textDisabled,
          opacity: 1,
          fontWeight: 400,
        },
      },
    },
    sendButton: {
      width: '36px',
      height: '36px',
      flexShrink: 0,
      alignSelf: 'flex-end',
      borderRadius: '50%',
      padding: 0,
      backgroundColor: theme.palette.surfaceBrand,
      color: theme.palette.textOnColor,
      '&:hover': {
        backgroundColor: theme.palette.surfaceBrandHover,
      },
      '&.Mui-disabled': {
        backgroundColor: theme.palette.surfaceBrandDisabled,
        color: theme.palette.textOnColor,
      },
    },
    micButton: {
      width: '36px',
      height: '36px',
      flexShrink: 0,
      alignSelf: 'flex-end',
      borderRadius: '50%',
      padding: 0,
      backgroundColor: 'rgba(255, 255, 255, 0.75)',
      color: theme.palette.textBrand,
      border: `1px solid ${theme.palette.borderSubtle2}`,
      '&:hover': {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: theme.palette.borderBrand,
      },
      '&.Mui-disabled': {
        opacity: 0.6,
      },
    },
    micButtonActive: {
      backgroundColor: 'rgba(20, 109, 255, 0.14)',
      borderColor: theme.palette.borderBrand,
      animation: '$micPulse 1.25s ease-in-out infinite',
    },
    '@keyframes micPulse': {
      '0%, 100%': {
        boxShadow: '0 0 0 0 rgba(20, 109, 255, 0.25)',
      },
      '50%': {
        boxShadow: '0 0 0 6px rgba(20, 109, 255, 0)',
      },
    },
    micGlyph: {
      '&.MuiTypography-root': {
        fontSize: '16px',
        lineHeight: 1,
      },
    },
    sendGlyph: {
      '&.MuiTypography-root': {
        fontSize: '18px',
        lineHeight: 1,
        fontWeight: 600,
      },
    },
    optionButtons: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '8px',
    },
    optionButton: {
      textTransform: 'none',
    },
    choiceWrap: {
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
    },
    choiceOptions: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
    },
    choiceButton: {
      textTransform: 'none',
      justifyContent: 'flex-start',
      width: '100%',
      padding: '10px 16px',
      minHeight: '36px',
      ...choiceGlassSurface,
      borderRadius: '99999px',
      '&.MuiButton-root': {
        width: '100%',
        borderRadius: '99999px',
      },
      '&.MuiButton-outlined': {
        border: '1px solid rgba(255, 255, 255, 0.72)',
        borderRadius: '99999px',
      },
      '&.MuiButton-outlinedPrimary': {
        borderColor: 'rgba(255, 255, 255, 0.72) !important',
        color: theme.palette.textPrimary,
      },
      '&:hover': {
        backgroundColor: 'rgba(255, 255, 255, 0.78)',
        borderColor: 'rgba(20, 109, 255, 0.25) !important',
      },
    },
    choiceButtonContent: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      width: '100%',
      textAlign: 'left',
    },
    choiceKey: {
      '&.MuiTypography-root': {
        fontWeight: 700,
        fontSize: '13px',
        color: theme.palette.textBrand,
        minWidth: '18px',
      },
    },
    choiceLabel: {
      '&.MuiTypography-root': {
        fontSize: '14px',
        color: theme.palette.textPrimary,
        flex: 1,
      },
    },
    recommendedBadge: {
      '&.MuiTypography-root': {
        fontSize: '10px',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.4px',
        color: '#FFFFFF',
        backgroundColor: theme.palette.surfaceBrand,
        borderRadius: '999px',
        padding: '2px 8px',
      },
    },
    customChoiceButton: {
      cursor: 'text',
      '&.MuiButton-root': {
        cursor: 'text',
      },
    },
    choiceInlineField: {
      flex: 1,
      minWidth: 0,
      margin: 0,
      '& .MuiInput-root': {
        marginTop: 0,
        fontSize: '14px',
        lineHeight: '20px',
        color: theme.palette.textPrimary,
        '&::before, &::after': {
          display: 'none',
        },
        '&:hover:not(.Mui-disabled):before': {
          borderBottom: 'none',
        },
      },
      '& .MuiInputBase-input': {
        padding: 0,
        fontSize: '14px',
        lineHeight: '20px',
        fontWeight: 400,
        color: theme.palette.textPrimary,
        '&::placeholder': {
          color: theme.palette.textPrimary,
          opacity: 1,
          fontWeight: 400,
        },
      },
    },
    customChoiceHint: {
      '&.MuiTypography-root': {
        color: theme.palette.textDisabled,
        fontSize: '12px',
      },
    },
    planCard: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      minWidth: '280px',
    },
    planCardLabel: {
      '&.MuiTypography-root': {
        color: theme.palette.textDisabled,
        fontWeight: 500,
        fontSize: '12px',
        lineHeight: '16px',
        textTransform: 'none',
        letterSpacing: 'normal',
      },
    },
    planCardCounts: {
      display: 'grid',
      gridTemplateColumns: '1fr',
      gap: '8px',
    },
    planCardItem: {
      width: '100%',
      backgroundColor: 'rgba(255, 255, 255, 0.55)',
      ...glassBlur,
      border: '1px solid rgba(255, 255, 255, 0.72)',
      borderRadius: '14px',
      padding: '10px 12px',
      textAlign: 'left',
      boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06)',
    },
    planCardNumber: {
      '&.MuiTypography-root': {
        fontSize: '24px',
        fontWeight: 700,
        color: theme.palette.textBrand,
        lineHeight: 1.1,
      },
    },
    planCardType: {
      '&.MuiTypography-root': {
        fontSize: '12px',
        color: theme.palette.textSecondary,
        marginTop: '4px',
      },
    },
    planCardSummary: {
      '&.MuiTypography-root': {
        color: theme.palette.textPrimary,
        fontWeight: 500,
        marginBottom: '2px',
      },
    },
    planServiceType: {
      '&.MuiTypography-root': {
        display: 'inline-flex',
        alignItems: 'center',
        borderRadius: '999px',
        padding: '1px 8px',
        fontSize: '10px',
        lineHeight: '14px',
        fontWeight: 700,
        letterSpacing: '0.25px',
        textTransform: 'uppercase',
        color: theme.palette.textBrand,
        backgroundColor: 'rgba(20, 109, 255, 0.12)',
        marginBottom: '6px',
      },
    },
    planServiceTitle: {
      '&.MuiTypography-root': {
        color: theme.palette.textPrimary,
        fontSize: '13px',
        lineHeight: '18px',
        fontWeight: 600,
        marginBottom: '2px',
      },
    },
    planServiceInfo: {
      '&.MuiTypography-root': {
        color: theme.palette.textSecondary2,
        fontSize: '12px',
        lineHeight: '16px',
      },
    },
    daysWrap: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '4px',
    },
    skipButton: {
      alignSelf: 'flex-start',
    },
    completeInlineMessage: {
      alignSelf: 'flex-start',
      maxWidth: '92%',
      backgroundColor: 'rgba(255, 255, 255, 0.7)',
      ...glassBlur,
      borderRadius: '12px 12px 12px 2px',
      border: '1px solid rgba(255, 255, 255, 0.72)',
      padding: '10px 12px',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      '& .MuiTypography-root': {
        color: theme.palette.textSuccess,
        fontWeight: 500,
      },
    },
    completeInlineActions: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '8px',
      marginTop: '8px',
    },
    completeBanner: {
      padding: '12px 16px',
      backgroundColor: 'rgba(255, 255, 255, 0.5)',
      textAlign: 'center',
      flexShrink: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '10px',
      '& .MuiTypography-root': {
        color: theme.palette.textSuccess,
        fontWeight: 500,
      },
    },
    restartButton: {
      textTransform: 'none',
    },
    completeActions: {
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: '8px',
    },
    completeActionButton: {
      textTransform: 'none',
    },
  };
});
