export const buildDemoAccessToken = () => {
  const payload = {
    sub: 'demo-user',
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 365,
  };
  const encodedPayload = btoa(JSON.stringify(payload)).replace(/\+/g, '-').replace(/\//g, '_');
  return `demo.${encodedPayload}.local`;
};
