export const UPDATE_COUNT_STATE = 'UPDATE_COUNT_STATE';
export const SET_ENTIRE_STATE = 'SET_ENTIRE_STATE';

export const taskNotesCountInitialState = {
  notesCount: null,
  tasksCount: null,
};

export const notesTasksCountReducer = (state = taskNotesCountInitialState, action) => {
  // /* eslint-disable no-case-declarations */
  switch (action.type) {
    case UPDATE_COUNT_STATE:
      // eslint-disable-next-line no-case-declarations
      const { key, value } = action.payload;
      // Dynamically update the state based on the payload
      return { ...state, [key]: value };
    case SET_ENTIRE_STATE:
      return action.payload;
    default:
      return state;
  }
};
