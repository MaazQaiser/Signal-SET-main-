import { Box, Button, Typography } from '@mui/material';
import { PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import PropTypes from 'prop-types';
import React, { useEffect, useMemo, useState } from 'react';
import LoaderComponent from 'src/app/components/common/loader';
import { sendPaymentMethodId } from 'src/services/deal.service';

import { useStyles } from '../paymentTerms';

const PaymentForm = ({ dealId, userName, userEmail, onSuccess, savedPaymentMethod, onError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const classes = useStyles();
  const [processing, setProcessing] = useState(false);

  const paymentElementOptions = useMemo(
    () => ({
      layout: 'tabs',
      paymentMethodOrder: ['us_bank_account', 'card'], // ACH first!
      disableLink: true,
      fields: {
        disableLink: true,
        billingDetails: {
          name: 'never',
          email: 'never',
          address: 'auto',
        },
        wallets: {
          applePay: 'never',
          googlePay: 'never',
          link: 'never',
        },
        terms: {
          card: 'never',
          us_bank_account: 'never',
        },
      },
    }),
    [],
  );

  // // DIAGNOSTIC: Retrieve SetupIntent status when component mounts
  // useEffect(() => {
  //   if (!stripe || !clientSecret) return;

  //   // Retrieve the SetupIntent to check its current status
  //   stripe.retrieveSetupIntent(clientSecret).catch((err) => {
  //     // Silent catch for diagnostic check
  //   });
  // }, [stripe, clientSecret]);

  // Handle redirect return from ACH bank authentication
  useEffect(() => {
    if (!stripe) return;

    // Check if we're returning from a redirect
    const clientSecret = new URLSearchParams(window.location.search).get(
      'setup_intent_client_secret',
    );

    if (clientSecret) {
      setProcessing(true);

      // Retrieve the SetupIntent to check its status
      stripe.retrieveSetupIntent(clientSecret).then(async ({ setupIntent, error }) => {
        if (error) {
          onError(error.message);
          setProcessing(false);
          // Clean up URL
          window.history.replaceState({}, document.title, window.location.pathname);
          return;
        }

        if (setupIntent && setupIntent.status === 'succeeded') {
          try {
            // Save to backend
            const response = await sendPaymentMethodId(dealId, setupIntent.payment_method);

            if (response?.statusCode === 200) {
              onSuccess(setupIntent.payment_method, response);
              savedPaymentMethod({
                id: setupIntent.payment_method,
                ...response?.data?.paymentMethod,
              });
            } else {
              throw new Error(response?.message || 'Failed to save payment method');
            }
          } catch (err) {
            onError(err.message || 'An unexpected error occurred');
          }

          // Clean up URL
          window.history.replaceState({}, document.title, window.location.pathname);
        }

        setProcessing(false);
      });
    }
  }, [stripe, dealId, onSuccess, savedPaymentMethod, onError]);

  // Don't render form until Stripe is ready
  if (!stripe || !elements) {
    return (
      <Box className="loading-state" style={{ padding: '24px', textAlign: 'center' }}>
        <Box className="spinner"></Box>
        <p>Loading payment form...</p>
      </Box>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setProcessing(true);
    onError(null);

    try {
      // Construct a clean return URL without query parameters
      // This prevents conflicts with Stripe's redirect parameters
      const returnUrl = `${window.location.origin}${window.location.pathname}`;

      // Single confirm method handles BOTH card and ACH!
      const { error, setupIntent } = await stripe.confirmSetup({
        elements,
        confirmParams: {
          return_url: returnUrl, // Use clean URL for redirect
          payment_method_data: {
            billing_details: {
              name: userName,
              email: userEmail,
            },
          },
        },
        redirect: 'if_required', // Don't redirect unless necessary
      });

      if (error) {
        // Handle specific Stripe error types
        let errorMessage = error.message;

        switch (error.type) {
          case 'card_error':
            errorMessage = error.message; // Card declined, insufficient funds, etc.
            break;
          case 'validation_error':
            errorMessage = 'Please check your payment details and try again.';
            break;
          case 'authentication_error':
            errorMessage = 'Authentication failed. Please try again.';
            break;
          case 'api_connection_error':
            errorMessage = 'Network error. Please check your connection and try again.';
            break;
          case 'rate_limit_error':
            errorMessage = 'Too many requests. Please wait a moment and try again.';
            break;
          default:
            errorMessage = error.message || 'An unexpected error occurred. Please try again.';
        }

        onError(errorMessage);
        setProcessing(false);
        return;
      }

      // Verify setupIntent was successful
      if (!setupIntent || setupIntent.status !== 'succeeded') {
        onError('Payment setup was not completed. Please try again.');
        setProcessing(false);
        return;
      }

      // Save to your backend
      const response = await sendPaymentMethodId(dealId, setupIntent.payment_method);

      if (response?.statusCode === 200) {
        onSuccess(setupIntent.payment_method, response);
        savedPaymentMethod({ id: setupIntent.payment_method, ...response?.data?.paymentMethod });
      } else {
        throw new Error(response?.message || 'Failed to save payment method');
      }
    } catch (err) {
      const errorMessage = err.message || 'An unexpected error occurred. Please try again.';
      onError(errorMessage);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="payment-form">
      <Box className={classes.formSection}>
        <Box className="stripe-payment-element-wrapper">
          <PaymentElement options={paymentElementOptions} />
        </Box>
        <Box className={classes.infoBanner}>
          <Box className={classes.infoIcon}>🔒</Box>
          <Typography variant="body2" className={classes.infoText}>
            Your information is encrypted and secure. We never store your payment details.
          </Typography>
        </Box>
      </Box>
      <Box className={classes.processingButton}>
        <Button variant="primary" type="submit" disabled={!stripe || processing}>
          {processing ? (
            <LoaderComponent size={20} label={'processing...'} color={'primary'} />
          ) : (
            'Save Payment Method'
          )}
        </Button>
      </Box>
    </form>
  );
};

PaymentForm.propTypes = {
  dealId: PropTypes.string,
  contractId: PropTypes.string,
  userName: PropTypes.string,
  userEmail: PropTypes.string,
  userCountry: PropTypes.string,
  clientSecret: PropTypes.string,
  onSuccess: PropTypes.func,
  savedPaymentMethod: PropTypes.func,
  onError: PropTypes.func,
};

PaymentForm.defaultProps = {
  dealId: '',
  contractId: '',
  clientSecret: '',
  onSuccess: () => {},
  onError: () => {},
};

export default PaymentForm;
