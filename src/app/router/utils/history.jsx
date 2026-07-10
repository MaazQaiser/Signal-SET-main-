/**
 * @description
 * Create and export our own `history` object to use with `react-router` so that we can use this browser history in non-React files as well
 */
const { createBrowserHistory } = require('history');

const history = createBrowserHistory();
export default history;
