/** Local dev only — bypass Auth0 and use demo login */
export default function isDevBypassAuth() {
  if (process.env.REACT_APP_BYPASS_AUTH === 'true') {
    return true;
  }

  if (process.env.NODE_ENV !== 'development' || typeof window === 'undefined') {
    return false;
  }

  const host = window.location.hostname;
  return host === 'localhost' || host === '127.0.0.1';
}
