export const throwAPIError = (error) => {
  const rawError = error?.response?.data ? error.response.data : error;
  const message =
    rawError?.message ||
    rawError?.error ||
    error?.message ||
    'Something went wrong. Please try again.';

  const normalizedError = new Error(String(message));
  normalizedError.statusCode = rawError?.statusCode || error?.response?.status || null;
  normalizedError.errorObj = rawError?.errorObj || rawError || null;
  normalizedError.rawError = rawError;

  throw normalizedError;
};
