import MicIcon from '@mui/icons-material/Mic';
import MicNoneIcon from '@mui/icons-material/MicNone';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import PropTypes from 'prop-types';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import DaysSelection from 'src/app/components/common/daysSelection';
import FieldError from 'src/app/components/common/fieldError';
import { getHolidayGroupsFromFranchiseService } from 'src/services/deal.service.js';
import { toastSettings } from 'src/utils/constants';

import { ActiveStepsKeys } from '../helper.js';
import { buildDeviceListFromPreferences, submitStep } from './agentActions.js';
import { formatChoiceDisplay } from './choiceHelpers.js';
import ContractAssistantIcon from './ContractAssistantIcon.jsx';
import { useStyles } from './contractChatAgent.js';
import {
  applyAnswerToCollected,
  getCompletedStepFromNodeId,
  getInitialCollected,
  getInitialContext,
  getInitialNodeId,
  getNextStepKey,
  getNode,
  getStepConfirmationMessage,
  getStepStartNode,
  isStepCompleteNode,
  parseAnswer,
  resolveChoiceOptions,
  resolveMessage,
  STOP_AFTER_STEP,
  validateAnswer,
} from './conversationFlow.js';
import { getPlanSummaryPayload } from './planHelpers.js';

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getAgentReplyDelay = (text = '') => {
  const normalized = String(text || '');
  if (!normalized) return 550;
  return Math.min(2000, Math.max(450, 350 + normalized.length * 6));
};

const getUserReadDelay = (text = '') =>
  Math.min(1200, Math.max(350, 250 + String(text || '').length * 3));

const ContractChatAgent = ({
  data,
  setData,
  dealId,
  franchiseId,
  stripeEnabled,
  taxExemptionEnabled,
  enableOccurences,
  baseRates,
  lineItems,
  franchisePreferences,
  isPublished,
  onServicesBackfillStart,
  onServicesBackfillComplete,
  onPaymentTermsSaved,
  onChatFlowComplete,
  onReviewProposal,
  onSignContract,
  syncServicesToRedux,
}) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const messageListRef = useRef(null);
  const customChoiceInputRef = useRef(null);
  const speechRecognitionRef = useRef(null);

  const contractServicesState = useSelector((state) => state.contractServices);
  const currentUser = useSelector((state) => state.user.info);

  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState([]);
  const [currentNodeId, setCurrentNodeId] = useState(getInitialNodeId());
  const [collected, setCollected] = useState(getInitialCollected());
  const collectedRef = useRef(collected);
  const contextRef = useRef(getInitialContext());

  useEffect(() => {
    collectedRef.current = collected;
  }, [collected]);
  const [inputValue, setInputValue] = useState('');
  const [customChoiceValue, setCustomChoiceValue] = useState('');
  const [selectedDays, setSelectedDays] = useState([]);
  const [fieldError, setFieldError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAgentTyping, setIsAgentTyping] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [holidayGroups, setHolidayGroups] = useState([]);

  const currentNode = getNode(currentNodeId);
  const SafeFieldError = FieldError || (() => null);
  const SafeDaysSelection = DaysSelection || (() => null);
  const AssistantAvatar = ContractAssistantIcon;

  const scrollToBottom = useCallback(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isAgentTyping, isSubmitting, scrollToBottom]);

  useEffect(() => {
    if (franchisePreferences?.devices) {
      const deviceList = buildDeviceListFromPreferences(franchisePreferences);
      contextRef.current = { ...contextRef.current, deviceList };
    }
  }, [franchisePreferences]);

  useEffect(() => {
    contextRef.current = {
      ...contextRef.current,
      lineItems: lineItems || [],
      holidayGroups: holidayGroups || [],
      billingContact: data?.billingContact || null,
      contractStartDate: data?.details?.startDate || null,
      currentUser: currentUser || null,
    };
  }, [lineItems, holidayGroups, data?.billingContact, data?.details?.startDate, currentUser]);

  useEffect(() => {
    const fetchHolidayGroups = async () => {
      if (!franchiseId) return;
      try {
        const response = await getHolidayGroupsFromFranchiseService({
          headers: { franchise_id: franchiseId },
        });
        if (response?.statusCode === 200) {
          const groups = Array.isArray(response?.data?.holidayGroups)
            ? response.data.holidayGroups
            : [];
          setHolidayGroups(groups);
        }
      } catch {
        setHolidayGroups([]);
      }
    };

    fetchHolidayGroups();
  }, [franchiseId]);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return undefined;
    }

    setSpeechSupported(true);
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      let transcript = '';
      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        transcript += event.results[index][0]?.transcript || '';
      }

      const normalized = transcript.trim();
      if (!normalized) return;
      setInputValue((prev) => (prev ? `${prev} ${normalized}`.trim() : normalized));
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    speechRecognitionRef.current = recognition;

    return () => {
      try {
        recognition.stop();
      } catch {
        // no-op
      }
      speechRecognitionRef.current = null;
    };
  }, []);

  const syncContext = useCallback((ctx) => {
    contextRef.current = ctx;
  }, []);

  const pushAgentMessage = useCallback((textOrPayload) => {
    if (typeof textOrPayload === 'string') {
      setMessages((prev) => [...prev, { from: 'agent', text: textOrPayload }]);
      return;
    }

    setMessages((prev) => [...prev, { from: 'agent', ...textOrPayload }]);
  }, []);

  const pushUserMessage = useCallback((text) => {
    setMessages((prev) => [...prev, { from: 'user', text }]);
  }, []);

  const pushStepConfirmationMessage = useCallback(
    (stepKey) => {
      const text = getStepConfirmationMessage(stepKey);
      if (stepKey === ActiveStepsKeys.SIGNEES) {
        pushAgentMessage({ type: 'complete_actions', text });
        return;
      }
      pushAgentMessage(text);
    },
    [pushAgentMessage],
  );

  const advanceToNodeRef = useRef(null);
  const handleStepCompleteRef = useRef(null);

  const handleStepComplete = useCallback(
    async (stepKey) => {
      const isServicesStepComplete = stepKey === ActiveStepsKeys.SERVICES;
      const isStopStep = stepKey === STOP_AFTER_STEP;

      if (isPublished) {
        setIsAgentTyping(true);
        await wait(getAgentReplyDelay(getStepConfirmationMessage(stepKey)));
        pushStepConfirmationMessage(stepKey);
        setIsAgentTyping(false);
        if (isStopStep) {
          setIsComplete(true);
          setCurrentNodeId(
            stepKey === ActiveStepsKeys.SIGNEES ? 'contract_complete' : 'payment_done',
          );
          return;
        }
        const nextStep = getNextStepKey(stepKey);
        if (nextStep) {
          const startNode = getStepStartNode(nextStep);
          setIsAgentTyping(true);
          await wait(500);
          await advanceToNodeRef.current?.(startNode);
        } else {
          await advanceToNodeRef.current?.(null);
        }
        return;
      }

      setIsSubmitting(true);
      setIsAgentTyping(false);
      if (isServicesStepComplete) {
        onServicesBackfillStart?.({
          count: collectedRef.current.services?.length || 0,
        });
      }
      try {
        await submitStep(stepKey, collectedRef.current, {
          dealId,
          setData,
          apiData: data,
          contractServicesState,
          baseRates,
          lineItems,
          holidayGroups,
          franchisePreferences,
          stripeEnabled,
          taxExemptionEnabled,
          enableOccurences,
          contractName: data?.details?.name,
          t,
          currentUser,
          syncServicesToRedux,
        });

        setIsSubmitting(false);
        setIsAgentTyping(true);
        await wait(getAgentReplyDelay(getStepConfirmationMessage(stepKey)));
        pushStepConfirmationMessage(stepKey);
        setIsAgentTyping(false);

        if (isServicesStepComplete) {
          onServicesBackfillComplete?.();
        }

        if (stepKey === ActiveStepsKeys.PAYMENT_TERMS) {
          onPaymentTermsSaved?.();
        }

        if (isStopStep) {
          if (stepKey === ActiveStepsKeys.PAYMENT_TERMS) {
            onPaymentTermsSaved?.();
          }
          if (stepKey === ActiveStepsKeys.SIGNEES) {
            onChatFlowComplete?.();
          }
          setIsComplete(true);
          setCurrentNodeId(
            isServicesStepComplete
              ? 'services_done'
              : stepKey === ActiveStepsKeys.PAYMENT_TERMS
                ? 'payment_done'
                : 'contract_complete',
          );
          return;
        }

        const nextStep = getNextStepKey(stepKey);
        if (nextStep) {
          const startNode = getStepStartNode(nextStep);
          setIsAgentTyping(true);
          await wait(500);
          await advanceToNodeRef.current?.(startNode);
        } else {
          await advanceToNodeRef.current?.(null);
        }
      } catch (error) {
        if (isServicesStepComplete) {
          onServicesBackfillComplete?.();
        }
        toast.error(error?.message || 'Failed to save step.', {
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
        pushAgentMessage(
          `I couldn't save that step: ${error?.message || 'Please try again or use the stepper on the right.'}`,
        );
      } finally {
        setIsSubmitting(false);
        setIsAgentTyping(false);
      }
    },
    [
      baseRates,
      collected,
      contractServicesState,
      data,
      dealId,
      enableOccurences,
      franchisePreferences,
      isPublished,
      lineItems,
      pushAgentMessage,
      pushStepConfirmationMessage,
      setData,
      onServicesBackfillStart,
      onServicesBackfillComplete,
      onPaymentTermsSaved,
      onChatFlowComplete,
      onReviewProposal,
      onSignContract,
      syncServicesToRedux,
      currentUser,
      stripeEnabled,
      taxExemptionEnabled,
      t,
    ],
  );

  const advanceToNode = useCallback(
    async (nodeId, collectedOverride) => {
      const activeCollected = collectedOverride ?? collectedRef.current;

      if (!nodeId) {
        setIsAgentTyping(true);
        await wait(
          getAgentReplyDelay(
            'All steps are complete! Your contract data has been saved. Review the stepper on the right.',
          ),
        );
        setIsComplete(true);
        pushAgentMessage(
          'All steps are complete! Your contract data has been saved. Review the stepper on the right.',
        );
        setCurrentNodeId('all_done');
        setIsAgentTyping(false);
        return;
      }

      if (isStepCompleteNode(nodeId)) {
        setIsAgentTyping(false);
        await handleStepCompleteRef.current?.(getCompletedStepFromNodeId(nodeId));
        return;
      }

      const node = getNode(nodeId);
      if (!node) {
        setIsAgentTyping(false);
        return;
      }

      setCurrentNodeId(nodeId);
      setInputValue('');
      setCustomChoiceValue('');
      setSelectedDays([]);
      setFieldError('');

      const message = resolveMessage(node, activeCollected, contextRef.current);
      if (message) {
        await wait(getAgentReplyDelay(message));
        pushAgentMessage(message);
      }

      if (node.inputType === 'plan_summary' || node.id === 'confirm_plan') {
        await wait(400);
        pushAgentMessage({
          type: 'plan',
          plan: getPlanSummaryPayload(contextRef.current.plan),
        });
      }

      if (node.inputType === 'none' || node.inputType === 'plan_summary') {
        const ctx = { ...contextRef.current };
        const workingCollected = {
          ...activeCollected,
          services: [...(activeCollected.services || [])],
        };
        const nextId =
          typeof node.next === 'function' ? node.next(null, workingCollected, ctx) : node.next;
        syncContext(ctx);
        collectedRef.current = workingCollected;
        setCollected(workingCollected);
        await wait(450);
        await advanceToNodeRef.current?.(nextId, workingCollected);
        return;
      }

      setIsAgentTyping(false);
    },
    [pushAgentMessage, syncContext],
  );

  useEffect(() => {
    advanceToNodeRef.current = advanceToNode;
    handleStepCompleteRef.current = handleStepComplete;
  }, [advanceToNode, handleStepComplete]);

  const processAnswer = useCallback(
    async (rawAnswer, displayTextOverride) => {
      if (!currentNode || isSubmitting || isAgentTyping || isComplete) return;

      const answer = parseAnswer(currentNode, rawAnswer);
      const validationError = validateAnswer(currentNode, answer, contextRef.current);

      if (validationError) {
        setFieldError(validationError);
        return;
      }

      setFieldError('');
      const displayText =
        displayTextOverride ??
        (currentNode.inputType === 'choice'
          ? formatChoiceDisplay(
              resolveChoiceOptions(currentNode, collected, contextRef.current),
              answer,
            )
          : String(rawAnswer));
      pushUserMessage(displayText);
      setIsAgentTyping(true);
      await wait(getUserReadDelay(displayText));

      let updatedCollected = collected;
      const ctx = { ...contextRef.current };

      if (currentNode.field || currentNode.scope) {
        updatedCollected = applyAnswerToCollected(currentNode, answer, collected, ctx);
        setCollected(updatedCollected);
      }

      const nextId =
        typeof currentNode.next === 'function'
          ? currentNode.next(answer, updatedCollected, ctx)
          : currentNode.next;

      syncContext(ctx);
      const nextCollected = {
        ...updatedCollected,
        services: [...(updatedCollected.services || [])],
      };
      collectedRef.current = nextCollected;
      setCollected(nextCollected);

      if (isStepCompleteNode(nextId)) {
        setIsAgentTyping(false);
        await handleStepCompleteRef.current?.(getCompletedStepFromNodeId(nextId));
        return;
      }

      await advanceToNodeRef.current?.(nextId, nextCollected);
    },
    [collected, currentNode, isAgentTyping, isComplete, isSubmitting, pushUserMessage, syncContext],
  );

  useEffect(() => {
    if (!initialized && isExpanded) {
      setInitialized(true);
      const welcomeNode = getNode(getInitialNodeId());
      const welcomeText = resolveMessage(welcomeNode, collected, contextRef.current);

      const showWelcome = async () => {
        setIsAgentTyping(true);
        await wait(getAgentReplyDelay(welcomeText));
        pushAgentMessage(welcomeText);
        setIsAgentTyping(false);
      };

      showWelcome();
      setCurrentNodeId(getInitialNodeId());
    }
  }, [collected, initialized, isExpanded, pushAgentMessage]);

  const handleOpen = () => {
    setIsExpanded(true);
  };

  const handleClose = () => {
    try {
      speechRecognitionRef.current?.stop();
    } catch {
      // no-op
    }
    setIsListening(false);
    setIsExpanded(false);
  };

  const handleRestart = useCallback(() => {
    try {
      speechRecognitionRef.current?.stop();
    } catch {
      // no-op
    }
    const initialContext = getInitialContext();
    if (franchisePreferences?.devices) {
      initialContext.deviceList = buildDeviceListFromPreferences(franchisePreferences);
    }
    initialContext.lineItems = lineItems || [];
    initialContext.holidayGroups = holidayGroups || [];
    initialContext.billingContact = data?.billingContact || null;
    initialContext.contractStartDate = data?.details?.startDate || null;
    initialContext.currentUser = currentUser || null;

    contextRef.current = initialContext;
    const initialCollected = getInitialCollected();
    collectedRef.current = initialCollected;
    setCollected(initialCollected);
    setMessages([]);
    setCurrentNodeId(getInitialNodeId());
    setInputValue('');
    setCustomChoiceValue('');
    setSelectedDays([]);
    setFieldError('');
    setIsSubmitting(false);
    setIsAgentTyping(false);
    setIsListening(false);
    setIsComplete(false);
    setInitialized(false);
  }, [
    franchisePreferences,
    lineItems,
    holidayGroups,
    currentUser,
    data?.billingContact,
    data?.details?.startDate,
  ]);

  const handleCompleteStageChat = async (text) => {
    const trimmed = String(text || '').trim();
    if (!trimmed || isSubmitting || isAgentTyping) return;
    pushUserMessage(trimmed);
    setInputValue('');
    setIsAgentTyping(true);
    await wait(getUserReadDelay(trimmed));
    pushAgentMessage(
      "Got it. I noted that message. You can continue chatting here, or use the actions below any time.",
    );
    setIsAgentTyping(false);
  };

  const handleSend = () => {
    if (!currentNode && isComplete) {
      handleCompleteStageChat(inputValue);
      return;
    }

    if (currentNode?.inputType === 'multiselect') {
      const dayLabels = selectedDays
        .map((d) => {
          const match = currentNode.options?.find((o) => o.value === d);
          return match?.label || d;
        })
        .join(', ');
      processAnswer(selectedDays, dayLabels || 'None');
      return;
    }

    processAnswer(inputValue, inputValue);
  };

  const handleVoiceToggle = () => {
    if (isInteractionLocked) return;

    const recognition = speechRecognitionRef.current;
    if (!recognition) {
      toast.info('Voice input is not supported in this browser.');
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
      return;
    }

    setFieldError('');
    try {
      recognition.start();
      setIsListening(true);
    } catch {
      setIsListening(false);
      toast.info('Unable to start voice input. Please try again.');
    }
  };

  const handleOptionSelect = (option) => {
    processAnswer({ value: option.value }, `${option.key}. ${option.label}`);
  };

  const handleCustomChoiceSubmit = () => {
    if (!currentNode || currentNode.inputType !== 'choice') return;

    const choiceOptions = resolveChoiceOptions(currentNode, collected, contextRef.current);
    const customChoiceKey = choiceOptions?.custom?.key || 'D';
    processAnswer(
      { isCustom: true, value: customChoiceValue },
      `${customChoiceKey}: ${customChoiceValue}`,
    );
    setCustomChoiceValue('');
  };

  const renderPlanSummary = (plan) => {
    const detailCards = (plan.details || []).map((line, index) => {
      const [rawTitle, ...rawDetail] = String(line).split(':');
      const title = (rawTitle || '').trim() || `Service ${index + 1}`;
      const detail = rawDetail.join(':').trim() || line;
      const isPatrol = title.toLowerCase().includes('patrol');

      return {
        key: `${title}-${index}`,
        type: isPatrol ? 'Patrol' : 'Dedicated',
        title,
        detail,
      };
    });

    const fallbackCards = [
      ...(plan.dedicated > 0
        ? [
            {
              key: 'dedicated-total',
              type: 'Dedicated',
              title: `${plan.dedicated} Dedicated service${plan.dedicated > 1 ? 's' : ''}`,
              detail: 'Service details will appear once parsed.',
            },
          ]
        : []),
      ...(plan.patrol > 0
        ? [
            {
              key: 'patrol-total',
              type: 'Patrol',
              title: `${plan.patrol} Patrol service${plan.patrol > 1 ? 's' : ''}`,
              detail: 'Service details will appear once parsed.',
            },
          ]
        : []),
    ];

    const cards = detailCards.length > 0 ? detailCards : fallbackCards;

    return (
      <Box className={classes.planCard}>
        <Typography variant="caption" className={classes.planCardLabel}>
          Your proposal plan
        </Typography>
        <Typography variant="body2" className={classes.planCardSummary}>
          {plan.label}
        </Typography>
        <Box className={classes.planCardCounts}>
          {cards.map((card) => (
            <Box key={card.key} className={classes.planCardItem}>
              <Typography className={classes.planServiceType}>{card.type}</Typography>
              <Typography className={classes.planServiceTitle}>{card.title}</Typography>
              <Typography className={classes.planServiceInfo}>{card.detail}</Typography>
            </Box>
          ))}
        </Box>
      </Box>
    );
  };

  const renderChoiceInput = () => {
    const choiceOptions = resolveChoiceOptions(currentNode, collected, contextRef.current);
    if (!choiceOptions) return null;

    return (
      <Box className={classes.choiceWrap}>
        <Box className={classes.choiceOptions}>
          {choiceOptions.presets.map((option) => (
            <Button
              key={option.key}
              variant="outlined"
              size="small"
              className={classes.choiceButton}
              onClick={() => handleOptionSelect(option)}
              disabled={isInteractionLocked}
            >
              <Box className={classes.choiceButtonContent}>
                <Typography className={classes.choiceKey}>{option.key}.</Typography>
                <Typography className={classes.choiceLabel}>{option.label}</Typography>
                {option.recommended && (
                  <Typography className={classes.recommendedBadge}>Recommended</Typography>
                )}
              </Box>
            </Button>
          ))}

          <Button
            variant="outlined"
            size="small"
            component="div"
            disableRipple
            className={`${classes.choiceButton} ${classes.customChoiceButton}`}
            onClick={() => customChoiceInputRef.current?.focus()}
          >
            <Box className={classes.choiceButtonContent}>
              <Typography className={classes.choiceKey}>{choiceOptions.custom.key}.</Typography>
              <TextField
                fullWidth
                size="small"
                variant="standard"
                inputRef={customChoiceInputRef}
                className={classes.choiceInlineField}
                value={customChoiceValue}
                onChange={(event) => setCustomChoiceValue(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    handleCustomChoiceSubmit();
                  }
                }}
                onClick={(event) => event.stopPropagation()}
                placeholder={choiceOptions.custom.placeholder}
                disabled={isInteractionLocked}
              />
            </Box>
          </Button>
        </Box>
        <Box className={classes.inputPill}>
          <TextField
            fullWidth
            size="small"
            margin="none"
            variant="standard"
            className={classes.textField}
            InputProps={{ disableUnderline: true }}
            multiline
            minRows={1}
            maxRows={4}
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isListening ? 'Listening...' : 'Ask anything to Sigi'}
            type="text"
            disabled={isInteractionLocked}
          />
          <IconButton
            className={`${classes.micButton} ${isListening ? classes.micButtonActive : ''}`}
            onClick={handleVoiceToggle}
            disabled={isInteractionLocked || !speechSupported}
            aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
            title={speechSupported ? 'Voice to text' : 'Voice input unavailable'}
          >
            {isListening ? <MicIcon fontSize="small" /> : <MicNoneIcon fontSize="small" />}
          </IconButton>
          <IconButton
            className={classes.sendButton}
            onClick={handleSend}
            disabled={isInteractionLocked}
            aria-label="Send message"
          >
            <Typography component="span" className={classes.sendGlyph}>
              →
            </Typography>
          </IconButton>
        </Box>
      </Box>
    );
  };

  const handleSkipStep = async () => {
    if (!currentNode?.skippable || isSubmitting || isAgentTyping) return;
    pushUserMessage('Skip');
    setIsAgentTyping(true);
    await wait(450);
    setIsAgentTyping(false);
    await handleStepCompleteRef.current?.(currentNode.step);
  };

  const renderTypingIndicator = () => (
    <Box className={classes.agentRow}>
      {AssistantAvatar ? (
        <AssistantAvatar className={classes.agentAvatar} />
      ) : (
        <Box className={classes.fallbackAgentAvatar} />
      )}
      <Box className={classes.agentBubble}>
        <Box className={classes.typingIndicator}>
          <Box className={classes.typingDots}>
            <span />
            <span />
            <span />
          </Box>
          {isSubmitting && (
            <Typography variant="caption" className={classes.typingStatus}>
              Saving...
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );

  const isInteractionLocked = isSubmitting || isAgentTyping;

  const renderCompleteActions = () => (
    <Box className={classes.completeInlineActions}>
      <Button
        variant="outlined"
        size="small"
        className={classes.completeActionButton}
        onClick={onReviewProposal}
      >
        Review Proposal
      </Button>
      <Button
        variant="contained"
        size="small"
        color="primary"
        className={classes.completeActionButton}
        onClick={onSignContract}
      >
        Sign Contract
      </Button>
    </Box>
  );

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey && currentNode?.inputType !== 'multiselect') {
      event.preventDefault();
      handleSend();
    }
  };

  const renderInput = () => {
    if (!currentNode && isComplete) {
      return (
        <Box className={classes.inputPill}>
          <TextField
            fullWidth
            size="small"
            margin="none"
            variant="standard"
            className={classes.textField}
            InputProps={{ disableUnderline: true }}
            multiline
            minRows={1}
            maxRows={4}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isListening ? 'Listening...' : 'Keep chatting...'}
            type="text"
            disabled={isInteractionLocked}
          />
          <IconButton
            className={`${classes.micButton} ${isListening ? classes.micButtonActive : ''}`}
            onClick={handleVoiceToggle}
            disabled={isInteractionLocked || !speechSupported}
            aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
            title={speechSupported ? 'Voice to text' : 'Voice input unavailable'}
          >
            {isListening ? <MicIcon fontSize="small" /> : <MicNoneIcon fontSize="small" />}
          </IconButton>
          <IconButton
            className={classes.sendButton}
            onClick={() => handleCompleteStageChat(inputValue)}
            disabled={isInteractionLocked}
            aria-label="Send message"
          >
            <Typography component="span" className={classes.sendGlyph}>
              →
            </Typography>
          </IconButton>
        </Box>
      );
    }

    if (!currentNode || currentNode.inputType === 'none' || currentNode.inputType === 'plan_summary') {
      return null;
    }

    if (currentNode.inputType === 'choice') {
      return renderChoiceInput();
    }

    if (
      currentNode.inputType === 'intent' ||
      currentNode.inputType === 'text' ||
      currentNode.inputType === 'time' ||
      currentNode.inputType === 'number'
    ) {
      const isMultilineInput = currentNode.inputType !== 'number';

      return (
        <Box className={classes.inputPill}>
          <TextField
            fullWidth
            size="small"
            margin="none"
            variant="standard"
            className={classes.textField}
            InputProps={{ disableUnderline: true }}
            multiline={isMultilineInput}
            minRows={currentNode.multiline ? 2 : 1}
            maxRows={4}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              currentNode.inputType === 'intent'
                ? 'Ask anything'
                : currentNode.inputType === 'number'
                  ? 'Enter a number'
                  : currentNode.inputType === 'time'
                    ? 'e.g. 9:00 AM'
                    : isListening
                      ? 'Listening...'
                      : 'Ask anything'
            }
            type={currentNode.inputType === 'number' ? 'number' : 'text'}
            disabled={isInteractionLocked}
          />
          <IconButton
            className={`${classes.micButton} ${isListening ? classes.micButtonActive : ''}`}
            onClick={handleVoiceToggle}
            disabled={isInteractionLocked || !speechSupported}
            aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
            title={speechSupported ? 'Voice to text' : 'Voice input unavailable'}
          >
            {isListening ? <MicIcon fontSize="small" /> : <MicNoneIcon fontSize="small" />}
          </IconButton>
          <IconButton
            className={classes.sendButton}
            onClick={handleSend}
            disabled={isInteractionLocked}
            aria-label="Send message"
          >
            <Typography component="span" className={classes.sendGlyph}>
              →
            </Typography>
          </IconButton>
        </Box>
      );
    }

    if (currentNode.inputType === 'select') {
      return (
        <Box className={classes.optionButtons}>
          {currentNode.options?.map((option) => (
            <Button
              key={option.value}
              variant="outlined"
              size="small"
              className={classes.optionButton}
              onClick={() => handleOptionSelect(option)}
              disabled={isInteractionLocked}
            >
              {option.label}
            </Button>
          ))}
        </Box>
      );
    }

    if (currentNode.inputType === 'multiselect') {
      return (
        <>
          <Box className={classes.daysWrap}>
            <SafeDaysSelection
              data={currentNode.options}
              selectedDays={selectedDays}
              handleChange={(event) => setSelectedDays(event.target.value)}
              name="dutyDays"
              truncateTo={3}
            />
          </Box>
          <Box className={classes.inputActions}>
            <Button variant="contained" onClick={handleSend} disabled={isInteractionLocked}>
              Confirm days
            </Button>
          </Box>
        </>
      );
    }

    const isMultilineInput = currentNode.inputType !== 'number';

    return (
      <Box className={classes.inputPill}>
        <TextField
          fullWidth
          size="small"
          margin="none"
          variant="standard"
          className={classes.textField}
          InputProps={{ disableUnderline: true }}
          multiline={isMultilineInput}
          minRows={currentNode.multiline ? 2 : 1}
          maxRows={4}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            currentNode.inputType === 'number'
              ? 'Enter a number'
              : currentNode.inputType === 'time'
                ? 'e.g. 9:00 AM'
                : isListening
                  ? 'Listening...'
                  : 'Ask anything'
          }
          type={currentNode.inputType === 'number' ? 'number' : 'text'}
          disabled={isInteractionLocked}
        />
        <IconButton
          className={`${classes.micButton} ${isListening ? classes.micButtonActive : ''}`}
          onClick={handleVoiceToggle}
          disabled={isInteractionLocked || !speechSupported}
          aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
          title={speechSupported ? 'Voice to text' : 'Voice input unavailable'}
        >
          {isListening ? <MicIcon fontSize="small" /> : <MicNoneIcon fontSize="small" />}
        </IconButton>
        <IconButton
          className={classes.sendButton}
          onClick={handleSend}
          disabled={isInteractionLocked}
          aria-label="Send message"
        >
          <Typography component="span" className={classes.sendGlyph}>
            →
          </Typography>
        </IconButton>
      </Box>
    );
  };

  if (!isExpanded) {
    return (
      <Box className={classes.floatingRoot}>
        <Box
          className={classes.triggerBar}
          onClick={handleOpen}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              handleOpen();
            }
          }}
          aria-label="Open contract assistant"
        >
          {AssistantAvatar ? (
            <AssistantAvatar className={classes.triggerIcon} />
          ) : (
            <Box className={classes.fallbackAvatar} />
          )}
          <Typography variant="body2" className={classes.triggerText}>
            Ask anything
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <>
      <Box
        className={classes.backdrop}
        onClick={handleClose}
        aria-hidden="true"
      />
      <Box className={classes.floatingRoot}>
        <Box className={classes.chatPanel} role="dialog" aria-labelledby="contract-assistant-title">
        <Box className={classes.header}>
          <Typography
            variant="subtitle1"
            className={classes.headerTitle}
            id="contract-assistant-title"
          >
            Contract Assistant
          </Typography>
          <IconButton
            className={classes.closeButton}
            onClick={handleClose}
            size="small"
            aria-label="Close contract assistant"
          >
            <Typography component="span" className={classes.headerGlyph}>
              ×
            </Typography>
          </IconButton>
        </Box>

        <Box className={classes.messageList} ref={messageListRef}>
          {messages.map((msg, index) =>
            msg.from === 'agent' ? (
              <Box key={index} className={classes.agentRow}>
                {AssistantAvatar ? (
                  <AssistantAvatar className={classes.agentAvatar} />
                ) : (
                  <Box className={classes.fallbackAgentAvatar} />
                )}
                <Box className={classes.agentBubble}>
                  {msg.type === 'plan' ? (
                    renderPlanSummary(msg.plan)
                  ) : msg.type === 'complete_actions' ? (
                    <>
                      <Typography variant="body2" className={classes.agentText}>
                        {msg.text}
                      </Typography>
                      {renderCompleteActions()}
                    </>
                  ) : (
                    <Typography variant="body2" className={classes.agentText}>
                      {msg.text}
                    </Typography>
                  )}
                </Box>
              </Box>
            ) : (
              <Box key={index} className={classes.userBubble}>
                <Typography variant="body2">{msg.text}</Typography>
              </Box>
            ),
          )}
          {(isAgentTyping || isSubmitting) && renderTypingIndicator()}
        </Box>

        <Box className={classes.inputRow}>
          {fieldError && <SafeFieldError error={fieldError} />}
          {currentNode?.skippable && (
            <Button
              variant="text"
              size="small"
              className={classes.skipButton}
              onClick={handleSkipStep}
              disabled={isInteractionLocked}
            >
              Skip this step
            </Button>
          )}
          {renderInput()}
        </Box>
      </Box>
    </Box>
    </>
  );
};

ContractChatAgent.propTypes = {
  data: PropTypes.object,
  setData: PropTypes.func,
  dealId: PropTypes.number,
  franchiseId: PropTypes.number,
  stripeEnabled: PropTypes.bool,
  taxExemptionEnabled: PropTypes.bool,
  enableOccurences: PropTypes.bool,
  baseRates: PropTypes.object,
  lineItems: PropTypes.array,
  franchisePreferences: PropTypes.object,
  isPublished: PropTypes.bool,
  onServicesBackfillStart: PropTypes.func,
  onServicesBackfillComplete: PropTypes.func,
  onPaymentTermsSaved: PropTypes.func,
  onChatFlowComplete: PropTypes.func,
  onReviewProposal: PropTypes.func,
  onSignContract: PropTypes.func,
  syncServicesToRedux: PropTypes.func,
};

export default ContractChatAgent;
