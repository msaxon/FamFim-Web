let accessToken: string | null = null;

export const setAccessToken = (token: string) => {
  accessToken = token;
  localStorage.setItem('google_access_token', token);
};

export const getAccessToken = () => {
  if (!accessToken) {
    accessToken = localStorage.getItem('google_access_token');
  }
  return accessToken;
};

export const clearAccessToken = () => {
  accessToken = null;
  localStorage.removeItem('google_access_token');
};
