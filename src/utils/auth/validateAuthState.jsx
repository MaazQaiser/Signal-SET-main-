import store from '../../redux/store/index';
import isDevBypassAuth from '../isDevBypassAuth';
import parseJwt from '../string/parseJwt';
import LogoutRedux from './logout';

export default function validateAuthState() {
  if (isDevBypassAuth() && store.getState().auth?.accessToken) {
    return true;
  }

  let isAuthenticated = false;

  const state = store.getState();
  const token = state.auth?.accessToken;
  const parsedToken = parseJwt(token);

  if (!parsedToken) {
    return isAuthenticated;
  }

  isAuthenticated = parsedToken.exp * 1000 > Date.now();

  if (!isAuthenticated) {
    return LogoutRedux();
  }

  return isAuthenticated;
}
