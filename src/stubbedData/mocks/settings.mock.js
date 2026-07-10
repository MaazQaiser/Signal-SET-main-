export const config = {
  success: {
    statusCode: 200,
    message: 'Config fetched successfully!',
    data: {
      countries: [
        {
          id: 1,
          name: 'Pakistan',
          countryCode: 'PK',
          states: [],
        },
        {
          id: 2,
          name: 'United States of America',
          countryCode: 'US',
          states: [],
        },
      ],
      timezones: [
        { id: 1, name: 'UTC-05:00 Eastern Time - New York' },
        { id: 2, name: 'UTC-06:00 Central Time - Chicago' },
        { id: 3, name: 'UTC-06:00 Central Time - Austin' },
        { id: 4, name: 'UTC-07:00 Mountain Time - Denver' },
        { id: 5, name: 'UTC-08:00 Pacific Time - Los Angeles' },
      ],
    },
  },
  failure: {
    statusCode: 500,
    message: 'Unable to fetch configurations.',
  },
};
