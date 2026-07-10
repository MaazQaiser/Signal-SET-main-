export const trimFormValues = (data) => {
  if (typeof data === 'string') {
    return data.trim();
  }
  if (Array.isArray(data)) {
    return data.map((item) => trimFormValues(item));
  }
  if (data !== null && typeof data === 'object') {
    return Object.keys(data).reduce((acc, key) => {
      acc[key] = trimFormValues(data[key]);
      return acc;
    }, {});
  }
  return data;
};
